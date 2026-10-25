import { db } from "@/db";
import { integrations, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getIntegration, newPublicKey } from "@/lib/integration";

export const dynamic = "force-dynamic";

const cleanUrl = (u: string) => {
  const v = u.trim();
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) return `https://${v}`;
  return v;
};

function toView(i: Awaited<ReturnType<typeof getIntegration>>) {
  return {
    dashboardUrl: i.dashboardUrl,
    webhookUrl: i.webhookUrl,
    hasToken: Boolean(i.bearerToken),
    autoSync: i.autoSync === "on",
    publicKey: i.publicKey,
    status: i.status,
    lastError: i.lastError,
    lastTestedAt: i.lastTestedAt,
    lastSyncAt: i.lastSyncAt,
  };
}

export async function GET() {
  return Response.json(toView(await getIntegration()));
}

export async function POST(req: Request) {
  const body = await req.json();
  const integ = await getIntegration();
  const patch: Record<string, unknown> = {};
  if (typeof body.dashboardUrl === "string")
    patch.dashboardUrl = cleanUrl(body.dashboardUrl);
  if (typeof body.webhookUrl === "string")
    patch.webhookUrl = cleanUrl(body.webhookUrl);
  if (typeof body.bearerToken === "string" && body.bearerToken !== "")
    patch.bearerToken = body.bearerToken.trim();
  if (typeof body.autoSync === "boolean")
    patch.autoSync = body.autoSync ? "on" : "off";
  if (body.rotateKey === true) patch.publicKey = newPublicKey();
  if (body.unlink === true) {
    patch.status = "unlinked";
    patch.lastError = "";
    patch.dashboardUrl = "";
    patch.webhookUrl = "";
    patch.bearerToken = "";
    patch.autoSync = "off";
  }
  if (typeof body.status === "string") patch.status = body.status;
  if (typeof body.lastError === "string") patch.lastError = body.lastError;

  const [updated] = await db
    .update(integrations)
    .set(patch)
    .where(eq(integrations.id, integ.id))
    .returning();

  await db.insert(events).values({
    kind: body.unlink ? "integration_unlinked" : "integration_saved",
    detail: body.unlink
      ? "Dashboard desligado do Nexo"
      : "Configuração do dashboard atualizada",
    source: "web",
  });

  return Response.json(toView(updated));
}