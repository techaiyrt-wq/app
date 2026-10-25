import { db } from "@/db";
import { tasks, connections, events } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { getIntegration } from "@/lib/integration";
import { getSettings, settingsView } from "@/lib/settings";
import { AppShell } from "@/components/app/app-shell";
import type { Tab } from "@/components/app/types";

export const dynamic = "force-dynamic";

const TABS: string[] = ["home", "tasks", "ai", "connect", "settings", "guide", "install"];

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const raw: string = TABS.includes(tab ?? "") ? (tab ?? "home") : "home";
  const initialOpenInstall = raw === "guide" || raw === "install";
  const initialTab: Tab = (raw === "guide" || raw === "install" ? "home" : raw) as Tab;

  await ensureSeed();
  const [initialTasks, initialConnections, initialEvents, integration, prefs] = await Promise.all([
    db.select().from(tasks).orderBy(desc(tasks.updatedAt)),
    db.select().from(connections).orderBy(desc(connections.createdAt)),
    db.select().from(events).orderBy(desc(events.createdAt)).limit(20),
    getIntegration(),
    getSettings(),
  ]);

  const today = new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <AppShell
      initialTab={initialTab}
      today={today}
      initialTasks={initialTasks}
      initialEvents={initialEvents}
      initialConnections={initialConnections.map((c) => ({
        id: c.id,
        provider: c.provider,
        label: c.label,
        model: c.model,
        keyMask:
          c.apiKey.length > 8
            ? `${c.apiKey.slice(0, 6)}…${c.apiKey.slice(-4)}`
            : "••••",
      }))}
      initialSettings={settingsView(prefs)}
      initialOpenInstall={initialOpenInstall}
      initialIntegration={{
        dashboardUrl: integration.dashboardUrl,
        webhookUrl: integration.webhookUrl,
        hasToken: Boolean(integration.bearerToken),
        autoSync: integration.autoSync === "on",
        publicKey: integration.publicKey,
        status: integration.status,
        lastError: integration.lastError,
        lastTestedAt: integration.lastTestedAt,
        lastSyncAt: integration.lastSyncAt,
      }}
    />
  );
}