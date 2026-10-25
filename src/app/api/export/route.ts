import { db } from "@/db";
import { tasks, messages, events, connections, integrations } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSettings, settingsView } from "@/lib/settings";
import { getIntegration } from "@/lib/integration";

export const dynamic = "force-dynamic";

/** GET — exporta tudo (tarefas, conversas, eventos, definições) como JSON. */
export async function GET() {
  const [allTasks, allMessages, allEvents, allConns, integration] = await Promise.all([
    db.select().from(tasks).orderBy(desc(tasks.createdAt)),
    db.select().from(messages).orderBy(desc(messages.createdAt)),
    db.select().from(events).orderBy(desc(events.createdAt)),
    db.select().from(connections).orderBy(desc(connections.createdAt)),
    getIntegration(),
  ]);
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "nexo",
    version: 1,
    settings: settingsView(await getSettings()),
    integrations: {
      dashboardUrl: integration.dashboardUrl,
      webhookUrl: integration.webhookUrl,
      autoSync: integration.autoSync,
      status: integration.status,
      publicKey: integration.publicKey,
    },
    connections: allConns.map((c) => ({
      id: c.id,
      provider: c.provider,
      label: c.label,
      model: c.model,
      // a chave secreta NUNCA sai no export
      hasKey: true,
    })),
    tasks: allTasks,
    messages: allMessages,
    events: allEvents,
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="nexo-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

/** POST { confirm: true } — apaga tarefas, conversas e eventos (definições e chaves ficam). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.confirm !== true) {
    return Response.json(
      { error: 'Confirmação necessária: envia { "confirm": true }.' },
      { status: 400 }
    );
  }
  await db.delete(messages);
  await db.delete(events);
  await db.delete(tasks);
  return Response.json({ ok: true, deleted: true });
}