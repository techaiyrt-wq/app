import { db } from "@/db";
import { tasks, events } from "@/db/schema";
import { desc } from "drizzle-orm";
import { authorize, pushToDashboard } from "@/lib/integration";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/**
 * API pública do Nexo — o teu dashboard chama estes endpoints.
 * GET  /api/v1/tasks   → lista de tarefas
 * POST /api/v1/tasks   → cria tarefa { title, notes?, provider? }
 * Auth: Authorization: Bearer <chave pública do Nexo>
 */
export async function GET(request: Request) {
  if (!(await authorize(request))) {
    return Response.json(
      { error: "Chave inválida. Usa Authorization: Bearer <chave do Nexo>." },
      { status: 401 }
    );
  }
  const rows = await db.select().from(tasks).orderBy(desc(tasks.updatedAt));
  return Response.json(
    { app: "nexo", version: 1, count: rows.length, tasks: rows },
    { headers: CORS }
  );
}

export async function POST(request: Request) {
  if (!(await authorize(request))) {
    return Response.json({ error: "Chave inválida." }, { status: 401 });
  }
  let body: { title?: unknown; notes?: unknown; provider?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }
  const title = String(body.title ?? "").trim();
  if (!title) {
    return Response.json({ error: "O campo title é obrigatório." }, { status: 400 });
  }
  const [task] = await db
    .insert(tasks)
    .values({
      title,
      notes: String(body.notes ?? ""),
      provider: String(body.provider ?? "demo"),
      origin: "web",
    })
    .returning();
  await db.insert(events).values({
    kind: "task_created",
    detail: `Tarefa «${title}» criada via API pelo dashboard externo`,
    source: "api",
  });
  await pushToDashboard("task.created", `Nova tarefa via API: ${title}`, "api", {
    title,
    status: "todo",
  });
  return Response.json({ ok: true, task }, { status: 201, headers: CORS });
}