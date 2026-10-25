import { db } from "@/db";
import { tasks, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { pushToDashboard } from "@/lib/integration";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  todo: "A fazer",
  doing: "Em curso com IA",
  done: "Concluída",
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (["todo", "doing", "done"].includes(body.status)) patch.status = body.status;
  if (typeof body.provider === "string") patch.provider = body.provider;

  const [task] = await db
    .update(tasks)
    .set(patch)
    .where(eq(tasks.id, Number(id)))
    .returning();
  if (!task) return Response.json({ error: "não encontrada" }, { status: 404 });

  if (patch.status) {
    await db.insert(events).values({
      kind: "task_updated",
      detail: `«${task.title}» → ${STATUS_LABEL[task.status] ?? task.status}`,
      source: body.source === "iphone" ? "iphone" : "web",
    });
  }
  await pushToDashboard("task.updated", `Tarefa atualizada: ${task.title}`, "web", {
    title: task.title,
    status: task.status,
    provider: task.provider,
  });
  return Response.json(task);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [task] = await db
    .delete(tasks)
    .where(eq(tasks.id, Number(id)))
    .returning();
  if (!task) return Response.json({ error: "não encontrada" }, { status: 404 });
  await db.insert(events).values({
    kind: "task_deleted",
    detail: `Tarefa «${task.title}» eliminada`,
    source: "web",
  });
  await pushToDashboard("task.deleted", `Tarefa eliminada: ${task.title}`, "web");
  return Response.json({ ok: true });
}