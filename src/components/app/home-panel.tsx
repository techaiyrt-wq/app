"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Smartphone,
  Sparkles,
  Zap,
  Activity,
  Plus,
  Download,
  CheckCircle2,
  Circle,
  CircleDot,
  Cloud,
  CloudOff,
  MessageSquareText,
  CalendarDays,
} from "lucide-react";
import { providerMeta } from "@/lib/providers";
import type { ConnectionView, EventView, IntegrationView, TaskView, Tab } from "./types";
import { ProviderChip, SectionCard, StatusPill, timeAgo, inputCls } from "./ui";

const IPHONE_SEEDS = [
  "Preparar argumentos para a reunião de amanhã",
  "Resumir as notas de voz de hoje",
  "Traduzir a newsletter para inglês",
  "Ideias de nomes para o novo projeto",
];

export function HomePanel({
  tasks,
  conns,
  integration,
  events,
  today,
  onCreate,
  onOpenTask,
  onCycle,
  onNavigate,
  onOpenInstall,
  showInstall = true,
  installed = false,
}: {
  tasks: TaskView[];
  conns: ConnectionView[];
  integration: IntegrationView;
  events: EventView[];
  today: string;
  onCreate: (title: string) => Promise<void>;
  onOpenTask: (t: TaskView) => void;
  onCycle: (t: TaskView) => void;
  onNavigate: (tab: Tab) => void;
  onOpenInstall?: () => void;
  /** false quando a app já está instalada — esconde os apelos à instalação */
  showInstall?: boolean;
  installed?: boolean;
}) {
  const [quick, setQuick] = useState("");
  const open = tasks.filter((t) => t.status !== "done");
  const doing = tasks.filter((t) => t.status === "doing").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const focus = open.slice(0, 4);
  const models = [
    { id: "demo", name: "Resposta local", sub: "não usa IA", color: "#8a9096", connected: true },
    ...conns.map((c) => {
      const m = providerMeta(c.provider);
      return {
        id: `c${c.id}`,
        name: m.short,
        sub: c.model,
        color: m.color,
        connected: true,
      };
    }),
  ];
  const missing = (["google", "openai", "anthropic"] as const)
    .filter((p) => !conns.some((c) => c.provider === p))
    .map((p) => providerMeta(p));

  async function submit() {
    const t = quick.trim();
    if (!t) return;
    setQuick("");
    await onCreate(t);
  }

  return (
    <div className="space-y-4">
      {/* ── HERO ── */}
      <div className="hero-card rounded-[1.6rem] p-5 text-white sm:p-7">
        <span className="accent-bar absolute left-0 top-0 h-[3px] w-28" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-teal-soft/80">
                <CalendarDays className="h-3 w-3" /> {today}
              </p>
              <h1 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-tight sm:text-3xl">
                O teu dia, <span className="text-amber">com IA</span> ao lado.
              </h1>
              <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-white/70">
                {open.length > 0
                  ? `Tens ${open.length} ${open.length === 1 ? "tarefa aberta" : "tarefas abertas"}${doing ? ` · ${doing} já em curso com IA` : ""}.`
                  : "Inbox limpa. Cria a próxima tarefa ou pede um plano à IA."}
              </p>
            </div>
            {showInstall && (
              <button
                onClick={() => (onOpenInstall ? onOpenInstall() : onNavigate("settings"))}
                className="press hidden shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold backdrop-blur transition-colors hover:bg-white/20 sm:flex"
              >
                <Smartphone className="h-3.5 w-3.5 text-teal-soft" />
                <span>Instalar no iPhone</span>
              </button>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {[
              { n: open.length, l: "A fazer" },
              { n: doing, l: "Com IA" },
              { n: done, l: "Concluídas" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 backdrop-blur-sm"
              >
                <p className="font-display text-2xl font-bold leading-none">{s.n}</p>
                <p className="mt-1 text-[10.5px] font-medium uppercase tracking-wide text-white/55">
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[10.5px] font-medium text-white/60">
              <span>Progresso do dia</span>
              <span className="text-teal-soft">{progress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-teal-soft transition-all duration-700"
                style={{ width: `${Math.max(progress, 3)}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2.5">
            <button
              onClick={() => onNavigate("tasks")}
              className="press flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-teal-soft"
            >
              <Plus className="h-4 w-4" /> Nova tarefa
            </button>
            <button
              onClick={() => onNavigate("ai")}
              className="press flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-[13px] font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <Sparkles className="h-4 w-4 text-amber" /> Perguntar à IA
            </button>
          </div>
        </div>
      </div>

      {/* ── captura rápida ── */}
      <div className="surface p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-2"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-soft text-teal-deep">
            <Zap className="h-4 w-4" />
          </span>
          <input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder="Capturar tarefa em segundos…"
            className={`${inputCls} border-transparent bg-paper`}
          />
          <button
            type="submit"
            disabled={!quick.trim()}
            className="press grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-white transition-colors hover:bg-teal disabled:opacity-30"
            aria-label="Criar tarefa"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pl-11">
          <span className="shrink-0 text-[10.5px] text-ink-faint">sugestões:</span>
          {IPHONE_SEEDS.slice(0, 2).map((s) => (
            <button
              key={s}
              onClick={() => onCreate(s)}
              className="press shrink-0 rounded-full border border-line bg-white px-2.5 py-1 text-[10.5px] font-medium text-ink-soft hover:border-teal hover:text-teal-deep"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── foco de hoje ── */}
        <SectionCard
          title="Foco de hoje"
          icon={<CheckCircle2 className="h-4 w-4 text-teal" />}
          action={
            <button
              onClick={() => onNavigate("tasks")}
              className="flex items-center gap-0.5 text-[11.5px] font-semibold text-teal-deep hover:underline"
            >
              Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          }
          className="lg:row-span-2"
        >
          {focus.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center">
              <CheckCircle2 className="mx-auto h-7 w-7 text-teal/50" />
              <p className="mt-2 font-display text-sm font-bold">Tudo tratado.</p>
              <p className="mt-1 text-xs text-ink-faint">
                Cria uma nova tarefa ou pede à IA ideias para o próximo passo.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {focus.map((t) => (
                <div
                  key={t.id}
                  className="group flex items-start gap-2.5 rounded-xl border border-line/80 bg-white p-3 transition-all hover:border-teal/40 hover:shadow-sm"
                >
                  <button
                    onClick={() => onCycle(t)}
                    aria-label="Mudar estado"
                    className="press mt-0.5 shrink-0 text-ink-faint hover:text-teal"
                  >
                    {t.status === "doing" ? (
                      <CircleDot className="h-5 w-5 text-amber" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => onOpenTask(t)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-[13px] font-semibold leading-snug text-ink">
                      {t.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <ProviderChip provider={t.provider} />
                      <StatusPill status={t.status} />
                      <span className="text-[10.5px] text-ink-faint">
                        {t.origin === "iphone" ? "iPhone" : "web"} · {timeAgo(t.updatedAt)}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => onOpenTask(t)}
                    className="press mt-0.5 shrink-0 rounded-lg p-1 text-ink-faint transition-colors hover:bg-teal-soft hover:text-teal-deep"
                    aria-label="Abrir tarefa"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-paper px-3 py-2 text-[11px] text-ink-faint">
            <span className="flex items-center gap-1.5">
              <MessageSquareText className="h-3.5 w-3.5" /> Cada tarefa guarda a conversa
            </span>
            <span className="font-mono text-[10px]">
              {conns.length} {conns.length === 1 ? "IA ligada" : "IAs ligadas"}
            </span>
          </div>
        </SectionCard>

        {/* ── as tuas IAs ── */}
        <SectionCard
          title="As tuas IAs"
          icon={<Sparkles className="h-4 w-4 text-teal" />}
          action={
            <button
              onClick={() => onNavigate("connect")}
              className="flex items-center gap-0.5 text-[11.5px] font-semibold text-teal-deep hover:underline"
            >
              Gerir <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          }
        >
          <div className="space-y-2">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => onNavigate("ai")}
                className="press flex w-full items-center gap-2.5 rounded-xl border border-line/80 bg-white p-2.5 text-left transition-colors hover:border-teal/40"
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
                  style={{ background: m.color }}
                >
                  {m.name.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold">{m.name}</span>
                  <span className="block truncate font-mono text-[10px] text-ink-faint">
                    {m.sub}
                  </span>
                </span>
                <span className="chip">{m.id === "demo" ? "sem IA" : "ligado"}</span>
              </button>
            ))}
            {missing.length > 0 && (
              <button
                onClick={() => onNavigate("connect")}
                className="press flex w-full items-center gap-2.5 rounded-xl border border-dashed border-line p-2.5 text-left transition-colors hover:border-teal/50 hover:bg-teal-soft/30"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-paper text-ink-faint">
                  <Plus className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-semibold">Ligar mais IAs</span>
                  <span className="block truncate text-[10px] text-ink-faint">
                    {missing.map((m) => m.short).join(" · ")}
                  </span>
                </span>
              </button>
            )}
          </div>
        </SectionCard>

        {/* ── sincronização ── */}
        <SectionCard
          title="Sincronização"
          icon={<Activity className="h-4 w-4 text-teal" />}
          action={
            <span
              className={`chip ${
                integration.status === "linked"
                  ? "bg-teal-soft text-teal-deep"
                  : integration.status === "error"
                    ? "bg-amber-soft text-amber"
                    : "bg-paper text-ink-faint"
              }`}
            >
              {integration.status === "linked" ? "ligado" : integration.status === "error" ? "erro" : "por ligar"}
            </span>
          }
        >
          <button
            onClick={() => onNavigate("connect")}
            className={`press flex w-full items-center gap-2.5 rounded-xl border p-3 text-left transition-colors ${
              integration.status === "linked"
                ? "border-teal/30 bg-teal-soft/40"
                : "border-dashed border-line bg-paper/50 hover:border-teal/50"
            }`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                integration.status === "linked"
                  ? "bg-teal text-white"
                  : "bg-white text-ink-faint"
              }`}
            >
              {integration.status === "linked" ? (
                <Cloud className="h-4 w-4" />
              ) : (
                <CloudOff className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-bold">
                {integration.status === "linked"
                  ? "O teu dashboard está ligado"
                  : "Ligar o meu dashboard"}
              </span>
              <span className="block truncate text-[10.5px] text-ink-faint">
                {integration.status === "linked"
                  ? `Última sync ${timeAgo(integration.lastSyncAt)} · webhook ${integration.autoSync ? "ativo" : "pausado"}`
                  : "Indica o URL, testa e sincroniza as tarefas"}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" />
          </button>

          <div className="mt-3 space-y-1">
            {events.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-start gap-2 rounded-lg px-1 py-1.5">
                <span
                  className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    e.source === "iphone" ? "bg-ink" : e.source === "api" ? "bg-amber" : "bg-teal"
                  }`}
                />
                <p className="min-w-0 flex-1 text-[11.5px] leading-snug text-ink-soft">
                  {e.detail}
                </p>
                <span className="shrink-0 font-mono text-[9.5px] text-ink-faint">
                  {timeAgo(e.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── banner instalar (oculto quando a app já está instalada) ── */}
      {showInstall && (
      <button
        onClick={() => (onOpenInstall ? onOpenInstall() : onNavigate("settings"))}
        className="press flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-sm transition-all hover:border-teal/40 hover:shadow-md"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-teal-soft">
          <Smartphone className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[13.5px] font-bold">
            Instalar no iPhone — sem App Store, sem custos
          </span>
          <span className="block text-[11.5px] text-ink-faint">
            Copia o link, aponta a câmara ao QR code ou adiciona diretamente no Safari.
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-teal" />
      </button>
      )}

      {/* ── estado instalado: confirmação discreta, sem apelo à instalação ── */}
      {installed && (
        <div className="flex items-center gap-3 rounded-2xl border border-teal/30 bg-teal-soft/50 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal text-white">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[13.5px] font-bold text-teal-deep">
              App instalada no teu iPhone
            </span>
            <span className="block text-[11.5px] text-ink-soft">
              A abrir em ecrã inteiro. As tuas tarefas continuam sincronizadas.
            </span>
          </span>
        </div>
      )}
    </div>
  );
}