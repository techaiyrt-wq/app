import { db } from "@/db";
import { connections, events } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [conn] = await db
    .delete(connections)
    .where(eq(connections.id, Number(id)))
    .returning();
  if (!conn) return Response.json({ error: "não encontrada" }, { status: 404 });
  await db.insert(events).values({
    kind: "connection_removed",
    detail: `Ligação «${conn.label}» removida`,
    source: "web",
  });
  return Response.json({ ok: true });
}