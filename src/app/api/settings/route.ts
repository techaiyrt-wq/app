import { ensureSettings, getSettings, settingsView, updateSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(settingsView(await getSettings()));
}

export async function POST(req: Request) {
  const body = await req.json();
  await ensureSettings();
  const updated = await updateSettings(body ?? {});
  return Response.json(settingsView(updated));
}