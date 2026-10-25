import { db } from "@/db";
import { integrations, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getIntegration } from "@/lib/integration";

export const dynamic = "force-dynamic";

/** Testa a ligação ao dashboard do utilizador — sempre a partir do servidor (sem problemas de CORS). */
export async function POST() {
  const integ = await getIntegration();
  const target = integ.dashboardUrl || integ.webhookUrl;
  if (!target) {
    return Response.json(
      { ok: false, error: "Define o URL do teu dashboard primeiro." },
      { status: 400 }
    );
  }

  const started = Date.now();
  try {
    const res = await fetch(target, {
      method: "GET",
      headers: {
        "User-Agent": "Nexo-Dashboard-Check/1.0",
        Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
        "X-Nexo-Key": integ.publicKey,
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
      redirect: "follow",
    });
    const latencyMs = Date.now() - started;
    const ok = res.status < 500;
    await db
      .update(integrations)
      .set({
        lastTestedAt: new Date(),
        status: ok ? "linked" : "error",
        lastError: ok ? "" : `O dashboard respondeu HTTP ${res.status}`,
      })
      .where(eq(integrations.id, integ.id));
    await db.insert(events).values({
      kind: ok ? "integration_ok" : "integration_error",
      detail: ok
        ? `Dashboard alcançável (HTTP ${res.status} · ${latencyMs} ms)`
        : `Dashboard respondeu HTTP ${res.status}`,
      source: "api",
    });
    return Response.json({
      ok,
      httpStatus: res.status,
      latencyMs,
      contentType: res.headers.get("content-type") ?? "desconhecido",
      error: ok ? null : `HTTP ${res.status}`,
    });
  } catch (e) {
    const latencyMs = Date.now() - started;
    const raw = e instanceof Error ? e.message : "erro desconhecido";
    const error = raw.includes("timeout")
      ? "O teu dashboard não respondeu em 8 segundos."
      : `Não foi possível alcançar o URL (${raw.slice(0, 140)}).`;
    await db
      .update(integrations)
      .set({ lastTestedAt: new Date(), status: "error", lastError: error })
      .where(eq(integrations.id, integ.id));
    return Response.json({ ok: false, latencyMs, error }, { status: 502 });
  }
}