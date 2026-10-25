import { db } from "@/db";
import { tasks, messages, connections, events } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { callProvider, demoReply, type ProviderId } from "@/lib/ai";
import { getSettings } from "@/lib/settings";
import { pushToDashboard } from "@/lib/integration";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const taskId = Number(new URL(req.url).searchParams.get("taskId") ?? 0);
  if (!taskId) return Response.json([]);
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.taskId, taskId))
    .orderBy(asc(messages.createdAt));
  return Response.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = String(body.prompt ?? "").trim();
  const taskId = body.taskId ? Number(body.taskId) : null;
  const connectionId = body.connectionId ? Number(body.connectionId) : null;
  if (!prompt) {
    return Response.json({ error: "prompt obrigatório" }, { status: 400 });
  }

  const task = taskId
    ? (await db.select().from(tasks).where(eq(tasks.id, taskId)))[0]
    : undefined;
  const prefs = await getSettings();

  // Histórico da tarefa como contexto (últimas 10 mensagens)
  const history = taskId
    ? (
        await db
          .select()
          .from(messages)
          .where(eq(messages.taskId, taskId))
          .orderBy(desc(messages.createdAt))
          .limit(10)
      ).reverse()
    : [];

  const userContent = task
    ? `[Tarefa: ${task.title}${task.notes ? ` — ${task.notes}` : ""}]\n${prompt}`
    : prompt;

  await db.insert(messages).values({
    taskId,
    role: "user",
    provider: connectionId ? "api" : "demo",
    content: prompt,
  });

  let reply: string;
  let provider: ProviderId = "demo";
  let usedModel = "local";
  let warning: string | null = null;

  const conn = connectionId
    ? (
        await db
          .select()
          .from(connections)
          .where(eq(connections.id, connectionId))
      )[0]
    : undefined;

  if (conn) {
    provider = conn.provider as ProviderId;
    usedModel = conn.model;
    warning = null;
    try {
      reply = await callProvider({
        provider,
        apiKey: conn.apiKey,
        model: conn.model,
        systemExtra: prefs.instructions,
        history: [...history, { role: "user", content: userContent }].map(
          (m) => ({ role: m.role, content: m.content })
        ),
      });
    } catch (e) {
      warning = `A chamada à API falhou (${e instanceof Error ? e.message.slice(0, 200) : "erro"}). Fica o rascunho local.`;
      provider = "demo";
      reply = demoReply(prompt, task?.title);
    }
  } else {
    reply = demoReply(prompt, task?.title);
  }

  const [assistantMsg] = await db
    .insert(messages)
    .values({ taskId, role: "assistant", provider, content: reply })
    .returning();

  if (task && task.status === "todo") {
    await db
      .update(tasks)
      .set({ status: "doing", provider, updatedAt: new Date() })
      .where(eq(tasks.id, task.id));
  }

  await db.insert(events).values({
    kind: "ai_reply",
    detail:
      provider === "demo"
        ? `Rascunho local (sem IA) gerado${task ? ` na tarefa «${task.title}»` : " no chat"}`
        : `${usedModel} respondeu${task ? ` à tarefa «${task.title}»` : " no chat livre"}`,
    source: "api",
  });

  await pushToDashboard(
    "ai.reply",
    `Resposta de IA${task ? ` na tarefa «${task.title}»` : " no chat livre"}`,
    "api",
    task ? { title: task.title, status: "doing", provider } : undefined
  );

  return Response.json({ message: assistantMsg, provider, model: usedModel, warning });
}