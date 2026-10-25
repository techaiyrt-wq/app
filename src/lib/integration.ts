import { db } from "@/db";
import { integrations, tasks, events } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export function newPublicKey() {
  return `nx_live_${randomBytes(18).toString("hex")}`;
}

/** Devolve a configuração de integração, criando-a na primeira utilização. */
export async function getIntegration() {
  const existing = await db.select().from(integrations).limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db
    .insert(integrations)
    .values({ publicKey: newPublicKey() })
    .returning();
  return created;
}

/** Valida a chave que um dashboard externo apresenta no header Bearer. */
export async function authorize(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const key = header.replace(/^Bearer\s+/i, "").trim();
  if (!key) return false;
  const integ = await getIntegration();
  return key === integ.publicKey;
}

type OutboundPayload = {
  title?: string;
  notes?: string;
  status?: string;
  provider?: string;
};

/** Webhook de saída: envia o evento para o dashboard do utilizador (best-effort). */
export async function pushToDashboard(
  kind: string,
  detail: string,
  source: "web" | "iphone" | "api",
  data?: OutboundPayload
) {
  try {
    const integ = await getIntegration();
    if (integ.autoSync !== "on" || !integ.webhookUrl) return;
    const body = JSON.stringify({
      source: "nexo",
      kind,
      detail,
      origin: source,
      data: data ?? null,
      sentAt: new Date().toISOString(),
    });
    const res = await fetch(integ.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Nexo-Key": integ.publicKey,
        ...(integ.bearerToken
          ? { Authorization: `Bearer ${integ.bearerToken}` }
          : {}),
      },
      body,
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) {
      await db
        .update(integrations)
        .set({ status: "error", lastError: `Webhook devolveu HTTP ${res.status}` })
        .where(eqId(integ.id));
    }
  } catch (e) {
    // nunca bloquear a ação principal por causa do webhook
    try {
      await db
        .update(integrations)
        .set({
          status: "error",
          lastError: e instanceof Error ? e.message.slice(0, 200) : "webhook falhou",
        })
        .where(eqId((await getIntegration()).id));
    } catch {
      /* ignore */
    }
  }
}

/** Envia o snapshot completo (tarefas + últimos eventos) para o dashboard. */
export async function sendSnapshot() {
  const integ = await getIntegration();
  if (!integ.webhookUrl) {
    throw new Error("Define primeiro o URL de receção (webhook) do teu dashboard.");
  }
  const [allTasks, recentEvents] = await Promise.all([
    db.select().from(tasks).orderBy(desc(tasks.updatedAt)),
    db.select().from(events).orderBy(desc(events.createdAt)).limit(25),
  ]);
  const started = Date.now();
  const res = await fetch(integ.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Nexo-Key": integ.publicKey,
      "X-Nexo-Event": "tasks.snapshot",
      ...(integ.bearerToken
        ? { Authorization: `Bearer ${integ.bearerToken}` }
        : {}),
    },
    body: JSON.stringify({
      source: "nexo",
      kind: "tasks.snapshot",
      sentAt: new Date().toISOString(),
      tasks: allTasks.map((t) => ({
        id: t.id,
        title: t.title,
        notes: t.notes,
        status: t.status,
        provider: t.provider,
        origin: t.origin,
        updatedAt: t.updatedAt,
      })),
      events: recentEvents,
    }),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  const latencyMs = Date.now() - started;
  if (!res.ok) {
    const msg = `O teu dashboard devolveu HTTP ${res.status}`;
    await db
      .update(integrations)
      .set({ lastError: msg, status: "error" })
      .where(eqId(integ.id));
    throw new Error(msg);
  }
  await db
    .update(integrations)
    .set({
      lastSyncAt: new Date(),
      lastError: "",
      status: "linked",
    })
    .where(eqId(integ.id));
  return { ok: true, latencyMs, count: allTasks.length };
}

function eqId(id: number) {
  return eq(integrations.id, id);
}