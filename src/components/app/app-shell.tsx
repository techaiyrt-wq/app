"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  ListChecks,
  Sparkles,
  Plug,
  Settings,
  Smartphone,
  Hexagon,
  RefreshCw,
  WifiOff,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Cloud,
} from "lucide-react";
import type {
  ConnectionView,
  EventView,
  IntegrationView,
  SettingsView,
  Tab,
  TaskView,
} from "./types";
import { HomePanel } from "./home-panel";
import { TasksPanel, TaskSheet } from "./tasks-panel";
import { AiPanel } from "./ai-panel";
import { ConnectPanel } from "./connect-panel";
import { SettingsPanel } from "./settings-panel";
import { InstallModal } from "./install-modal";
import { useInstallState } from "./use-installed";
import { timeAgo } from "./ui";

const NAV: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Início", icon: Home },
  { id: "tasks", label: "Tarefas", icon: ListChecks },
  { id: "ai", label: "IA", icon: Sparkles },
  { id: "connect", label: "Ligações", icon: Plug },
  { id: "settings", label: "Ajustes", icon: Settings },
];

/** Deteção real do dispositivo — as tarefas criadas no iPhone marcam-se como tal. */
function currentOrigin(): "web" | "iphone" {
  if (typeof navigator === "undefined") return "web";
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "iphone" : "web";
}

type ChatResult = { reply?: string; warning?: string | null; error?: string | null };

export function AppShell({
  initialTab,
  initialTasks,
  initialConnections,
  initialEvents,
  initialIntegration,
  initialSettings,
  today,
  initialOpenInstall = false,
}: {
  initialTab: Tab;
  initialTasks: TaskView[];
  initialConnections: ConnectionView[];
  initialEvents: EventView[];
  initialIntegration: IntegrationView;
  initialSettings: SettingsView;
  today: string;
  initialOpenInstall?: boolean;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [tasks, setTasks] = useState(initialTasks);
  const [conns, setConns] = useState(initialConnections);
  const [events, setEvents] = useState(initialEvents);
  const [integration, setIntegration] = useState(initialIntegration);
  const [settings, setSettings] = useState<SettingsView>(initialSettings);
  const [sheetTask, setSheetTask] = useState<TaskView | null>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(initialOpenInstall);
  // deteção real: se a app já está instalada, os apelos à instalação desaparecem
  const { installed, ready } = useInstallState();
  const showInstallCta = ready && !installed;
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | Date>(new Date());
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "warn" } | null>(null);
  const [online, setOnline] = useState(true);

  // preferências visuais aplicadas ao documento (reais, persistidas)
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-accent", settings.accent);
    root.setAttribute("data-bg", settings.background || "paper");
    root.setAttribute("data-bg-vivid", settings.backgroundVivid ? "true" : "false");
    root.setAttribute("data-density", settings.density);
  }, [settings.accent, settings.background, settings.backgroundVivid, settings.density]);

  const notify = useCallback((msg: string, kind: "ok" | "warn" = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const refresh = useCallback(async (silent = true) => {
    if (!silent) setSyncing(true);
    try {
      const [t, e, c, i] = await Promise.all([
        fetch("/api/tasks", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/events", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/connections", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/integration", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setTasks(t);
      setEvents(e);
      setConns(c);
      setIntegration(i);
      setLastSync(new Date());
    } catch {
      /* offline */
    } finally {
      setSyncing(false);
    }
  }, []);

  // sincronização por polling (estratégia recomendada na spec)
  useEffect(() => {
    if (!settings.pollInterval) return; // 0 = manual
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && !sheetTask) refresh(true);
    }, settings.pollInterval * 1000);
    return () => clearInterval(id);
  }, [refresh, sheetTask, settings.pollInterval]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // mantém a folha aberta sincronizada com a lista
  useEffect(() => {
    if (!sheetTask) return;
    const updated = tasks.find((t) => t.id === sheetTask.id);
    if (updated) setSheetTask(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  /* ─────────── ações ─────────── */
  const addTask = async (
    title: string,
    origin?: "web" | "iphone",
    provider = settings.defaultProvider
  ) => {
    origin = origin ?? currentOrigin();
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, origin, provider }),
    });
    await refresh();
    notify(origin === "iphone" ? "Tarefa criada no iPhone" : "Tarefa criada");
  };

  const cycleStatus = async (t: TaskView) => {
    const order = ["todo", "doing", "done"];
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    await fetch(`/api/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    await refresh();
  };

  const deleteTask = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await refresh();
    notify("Tarefa eliminada");
  };

  const patchTask = async (id: number, patch: Partial<TaskView>) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await refresh();
    notify("Alterações guardadas");
  };

  const aiChat = async ({
    prompt,
    taskId,
    connectionId,
  }: {
    prompt: string;
    taskId: number | null;
    connectionId: number | null;
  }): Promise<ChatResult> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, taskId, connectionId }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error ?? "A chamada à IA falhou." };
      await refresh();
      return { reply: data.message?.content, warning: data.warning ?? null };
    } catch {
      return { error: "Sem ligação ao servidor. Tenta novamente." };
    }
  };

  const addConnection = async (input: {
    provider: string;
    apiKey: string;
    model: string;
    label: string;
  }) => {
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      notify("IA ligada · chave guardada no servidor");
      await refresh();
      return true;
    }
    notify("Não foi possível guardar a chave", "warn");
    return false;
  };

  const removeConnection = async (id: number) => {
    await fetch(`/api/connections/${id}`, { method: "DELETE" });
    notify("Ligação removida");
    await refresh();
  };

  const saveIntegration = async (patch: Record<string, unknown>) => {
    const res = await fetch("/api/integration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setIntegration(await res.json());
      notify(patch.rotateKey ? "Nova chave gerada" : "Configuração guardada");
      await refresh();
    } else {
      notify("Falha ao guardar a configuração", "warn");
    }
  };

  const saveSettings = async (patch: Partial<SettingsView>) => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setSettings(await res.json());
      notify("Preferência guardada");
    } else {
      notify("Falha ao guardar", "warn");
    }
  };

  const [savingProdUrl, setSavingProdUrl] = useState(false);
  const saveProductionUrl = async (url: string) => {
    setSavingProdUrl(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productionUrl: url }),
      });
      if (res.ok) {
        setSettings(await res.json());
        notify(url ? "Endereço permanente guardado" : "Endereço permanente removido");
      } else {
        notify("Falha ao guardar o endereço", "warn");
      }
    } finally {
      setSavingProdUrl(false);
    }
  };

  const testIntegration = async () => {
    const res = await fetch("/api/integration/test", { method: "POST" });
    const data = await res.json();
    await refresh();
    return data;
  };

  const snapshot = async () => {
    const res = await fetch("/api/integration/sync", { method: "POST" });
    const data = await res.json();
    await refresh();
    return data;
  };

  const openTask = (t: TaskView) => setSheetTask(t);

  return (
    <div className="app-canvas">
      {/* header */}
      <header className="safe-top sticky top-0 z-40 border-b border-line/70 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[58px] max-w-6xl items-center justify-between gap-3 px-4">
          <button
            onClick={() => setTab("home")}
            className="flex items-center gap-2.5"
            aria-label="Início"
          >
            <span className="relative grid h-8 w-8 place-items-center rounded-[8px] bg-ink text-white">
              <Hexagon className="h-4 w-4" strokeWidth={2.3} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber ring-2 ring-paper" />
            </span>
            <span className="font-display text-[17px] font-extrabold tracking-tight">
              {settings.workspaceName || "Nexo"}
            </span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* some quando a app já está instalada no ecrã principal */}
            {showInstallCta && (
              <button
                onClick={() => setShowInstallModal(true)}
                className="press flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal-soft px-3 py-1.5 text-[11px] font-bold text-teal-deep hover:bg-teal hover:text-white"
                title="Instalar no iPhone"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Instalar no iPhone</span>
                <span className="sm:hidden">Instalar</span>
              </button>
            )}

            <button
              onClick={() => refresh(false)}
              className="press flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-ink-soft"
              title="Sincronizar agora"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${online ? "bg-teal pulse-dot" : "bg-amber"}`}
              />
              {online ? (integration.status === "linked" ? "sync" : "local") : "offline"}
              <RefreshCw className={`h-3 w-3 text-teal ${syncing ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/spec"
              className="press hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-white sm:flex"
            >
              <FileText className="h-3.5 w-3.5" /> Especificação
            </Link>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-[11px] font-bold text-teal-soft">
              EU
            </span>
          </div>
        </div>
      </header>

      {!online && (
        <div className="flex items-center justify-center gap-1.5 bg-amber-soft px-4 py-1.5 text-[11px] font-semibold text-amber">
          <WifiOff className="h-3.5 w-3.5" /> Sem ligação — as alterações podem não sincronizar.
        </div>
      )}

      <div className="mx-auto flex max-w-6xl gap-6 px-4 pb-28 pt-4 lg:pb-10">
        {/* sidebar desktop */}
        <aside className="sticky top-[74px] hidden h-fit w-[208px] shrink-0 lg:block">
          <nav className="surface space-y-1 p-2">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`press flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold transition-colors ${
                  tab === n.id
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink-soft hover:bg-paper"
                }`}
              >
                <n.icon className={`h-4 w-4 ${tab === n.id ? "text-teal-soft" : "text-ink-faint"}`} />
                {n.label}
                {n.id === "tasks" && tasks.filter((t) => t.status !== "done").length > 0 && (
                  <span
                    className={`ml-auto rounded-full px-1.5 py-0.5 font-mono text-[9.5px] ${
                      tab === n.id ? "bg-white/15 text-white" : "bg-teal-soft text-teal-deep"
                    }`}
                  >
                    {tasks.filter((t) => t.status !== "done").length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="surface mt-3 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold">
              <Cloud className="h-3.5 w-3.5 text-teal" />
              {integration.status === "linked" ? "Dashboard ligado" : "Dashboard por ligar"}
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-ink-faint">
              {integration.status === "linked"
                ? `Sincronizado ${timeAgo(integration.lastSyncAt)}.`
                : "Liga o teu dashboard em 2 minutos na secção Ligações."}
            </p>
            <button
              onClick={() => setTab("connect")}
              className="press mt-2 w-full rounded-lg bg-teal-soft py-1.5 text-[10.5px] font-bold text-teal-deep hover:bg-teal hover:text-white"
            >
              {integration.status === "linked" ? "Gerir ligação" : "Ligar agora"}
            </button>
          </div>

          <p className="mt-3 px-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
            atualizado {timeAgo(lastSync)}
          </p>
        </aside>

        {/* conteúdo */}
        <main className="min-w-0 flex-1">
          {tab === "home" && (
            <HomePanel
              tasks={tasks}
              conns={conns}
              integration={integration}
              events={events}
              today={today}
              onCreate={(title) => addTask(title, "web")}
              onOpenTask={openTask}
              onCycle={cycleStatus}
              onNavigate={setTab}
              onOpenInstall={() => setShowInstallModal(true)}
              showInstall={showInstallCta}
              installed={installed}
            />
          )}
          {tab === "tasks" && (
            <TasksPanel
              tasks={tasks}
              defaultProvider={settings.defaultProvider}
              onCreate={(title, provider) => addTask(title, "web", provider)}
                            onOpenTask={openTask}
              onCycle={cycleStatus}
              onDelete={deleteTask}
            />
          )}
          {tab === "ai" && (
            <AiPanel conns={conns} aiChat={aiChat} onNavigate={(t) => setTab(t)} />
          )}
          {tab === "connect" && (
            <ConnectPanel
              conns={conns}
              integration={integration}
              onAddConnection={addConnection}
              onRemoveConnection={removeConnection}
              onSaveIntegration={saveIntegration}
              onTest={testIntegration}
              onSnapshot={snapshot}
              onRefresh={() => refresh(false)}
            />
          )}
          {tab === "settings" && (
            <SettingsPanel
              settings={settings}
              onSave={saveSettings}
              onNavigate={setTab}
            />
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-ink-faint lg:hidden">
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            sincronizado {timeAgo(lastSync)} · {settings.workspaceName || "Nexo"}
          </div>
        </main>
      </div>

      {/* tab bar mobile */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-white/90 px-2 pt-1.5 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {NAV.map((n) => (
            <button
              key={n.id}
              data-active={tab === n.id}
              onClick={() => setTab(n.id)}
              className="tabbar-btn flex-1"
              aria-label={n.label}
            >
              <n.icon className="h-[19px] w-[19px]" strokeWidth={tab === n.id ? 2.4 : 1.9} />
              <span className="text-[9.5px] font-semibold">{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* toast */}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4 lg:bottom-8">
          <div
            className={`slide-in flex items-center gap-2 rounded-full px-4 py-2.5 text-[11.5px] font-semibold shadow-lg ${
              toast.kind === "ok" ? "bg-ink text-white" : "bg-amber text-white"
            }`}
          >
            {toast.kind === "ok" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-soft" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" />
            )}
            {toast.msg}
          </div>
        </div>
      )}

      {sheetTask && (
        <TaskSheet
          task={sheetTask}
          conns={conns}
          onClose={() => {
            setSheetTask(null);
            refresh(true);
          }}
          onPatch={patchTask}
          onDelete={deleteTask}
          aiChat={aiChat}
        />
      )}

      {showInstallModal && (
        <InstallModal
          onClose={() => setShowInstallModal(false)}
          productionUrl={settings.productionUrl ?? ""}
          onSaveProductionUrl={saveProductionUrl}
          savingProductionUrl={savingProdUrl}
        />
      )}
    </div>
  );
}