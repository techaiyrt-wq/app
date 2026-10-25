import { db } from "@/db";
import { tasks, events } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { pushToDashboard } from "@/lib/integration";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeed();
  const rows = await db.select().from(tasks).orderBy(desc(tasks.updatedAt));
  return Response.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const title = String(body.title ?? "").trim();
  if (!title) {
    return Response.json({ error: "title obrigatório" }, { status: 400 });
  }
  const origin = body.origin === "iphone" ? "iphone" : "web";
  const [task] = await db
    .insert(tasks)
    .values({
      title,
      notes: String(body.notes ?? ""),
      provider: String(body.provider ?? "demo"),
      origin,
    })
    .returning();
  await db.insert(events).values({
    kind: "task_created",
    detail: `Tarefa «${title}» criada no ${origin === "iphone" ? "iPhone" : "dashboard"}`,
    source: origin,
  });
  await pushToDashboard("task.created", `Nova tarefa: ${title}`, origin, {
    title,
    status: "todo",
    provider: task.provider,
  });
  return Response.json(task, { status: 201 });
}