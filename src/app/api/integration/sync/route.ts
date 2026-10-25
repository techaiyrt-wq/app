import { db } from "@/db";
import { events } from "@/db/schema";
import { sendSnapshot } from "@/lib/integration";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await sendSnapshot();
    await db.insert(events).values({
      kind: "snapshot_sent",
      detail: `Snapshot de ${result.count} tarefas enviado para o teu dashboard (${result.latencyMs} ms)`,
      source: "api",
    });
    return Response.json(result);
  } catch (e) {
    return Response.json(
      {
        ok: false,
        error: e instanceof Error ? e.message.slice(0, 300) : "Falha ao sincronizar",
      },
      { status: 502 }
    );
  }
}