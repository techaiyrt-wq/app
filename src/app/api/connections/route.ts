import { db } from "@/db";
import { connections, events } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PROVIDER_META, type ProviderId } from "@/lib/ai";

export const dynamic = "force-dynamic";

/** Nunca devolve a chave completa — apenas uma máscara. */
function mask(key: string) {
  return key.length > 8 ? `${key.slice(0, 6)}…${key.slice(-4)}` : "••••";
}

export async function GET() {
  const rows = await db
    .select()
    .from(connections)
    .orderBy(desc(connections.createdAt));
  return Response.json(
    rows.map((c) => ({
      id: c.id,
      provider: c.provider,
      label: c.label,
      model: c.model,
      keyMask: mask(c.apiKey),
      createdAt: c.createdAt,
    }))
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const provider = String(body.provider ?? "") as ProviderId;
  if (!["openai", "anthropic", "google"].includes(provider)) {
    return Response.json({ error: "fornecedor inválido" }, { status: 400 });
  }
  const apiKey = String(body.apiKey ?? "").trim();
  if (!apiKey) {
    return Response.json({ error: "apiKey obrigatória" }, { status: 400 });
  }
  const model =
    String(body.model ?? "").trim() || PROVIDER_META[provider].defaultModel;
  const label = String(body.label ?? "").trim() || PROVIDER_META[provider].name;

  const [conn] = await db
    .insert(connections)
    .values({ provider, label, apiKey, model })
    .returning();
  await db.insert(events).values({
    kind: "connection_added",
    detail: `Ligação «${label}» adicionada (chave guardada no servidor)`,
    source: "web",
  });
  return Response.json(
    {
      id: conn.id,
      provider: conn.provider,
      label: conn.label,
      model: conn.model,
      keyMask: mask(conn.apiKey),
      createdAt: conn.createdAt,
    },
    { status: 201 }
  );
}