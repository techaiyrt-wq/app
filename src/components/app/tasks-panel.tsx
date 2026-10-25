"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
    Trash2,
  Send,
  X,
  Bot,
  UserRound,
  Sparkles,
  Check,
  AlertTriangle,
  ChevronRight,
  Circle,
  CircleDot,
  CheckCircle2,
  MessageSquareText,
} from "lucide-react";
import { PROVIDER_META, providerMeta, type ProviderId } from "@/lib/providers";
import type { ConnectionView, MessageView, TaskView } from "./types";
import {
  inputCls,
  StatusPill,
  timeAgo,
  EmptyState,
  CopyButton,
} from "./ui";

const FILTERS = [
  { id: "all", label: "Todas" },
  { id: "todo", label: "A fazer" },
  { id: "doing", label: "Com IA" },
  { id: "done", label: "Feitas" },
] as const;

export function TasksPanel({
  tasks,
  defaultProvider = "demo",
  onCreate,
  onOpenTask,
  onCycle,
  onDelete,
}: {
  tasks: TaskView[];
  defaultProvider?: string;
  onCreate: (title: string, provider: string) => Promise<void>;
  onOpenTask: (t: TaskView) => void;
  onCycle: (t: TaskView) => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState(defaultProvider);
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  const filtered = tasks.filter(
    (t) =>
      (filter === "all" || t.status === filter) &&
      (t.title.toLowerCase().includes(q.toLowerCase()) ||
        t.notes.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Inbox de tarefas</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-soft">
            {tasks.filter((t) => t.status !== "done").length} abertas ·{" "}
            {tasks.filter((t) => t.status === "done").length} concluídas
          </p>
        </div>
        <p className="micro hidden shrink-0 sm:block">
          {tasks.length} registo{tasks.length === 1 ? "" : "s"} · dados reais
        </p>
      </div>

      {/* compositor */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const t = title.trim();
          if (!t) return;
          setTitle("");
          await onCreate(t, provider);
        }}
        className="surface flex flex-col gap-2 p-3 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-soft text-teal-deep">
            <Plus className="h-4 w-4" />
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="O que precisas de fazer?"
            className={`${inputCls} border-transparent bg-paper`}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-2.5 py-2.5 text-[12px] font-medium outline-none focus:border-teal sm:w-auto"
            aria-label="Modelo preferido"
          >
            <option value="local">Local (sem IA)</option>
            {Object.entries(PROVIDER_META)
              .filter(([k]) => k !== "demo")
              .map(([k, v]) => (
                <option key={k} value={k}>
                  {v.short}
                </option>
              ))}
          </select>
          <button
            type="submit"
            disabled={!title.trim()}
            className="press shrink-0 rounded-xl bg-teal px-4 py-2.5 text-[12.5px] font-bold text-white hover:bg-teal-deep disabled:opacity-40"
          >
            Adicionar
          </button>
        </div>
      </form>

      {/* filtros */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="scroll-slim flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`press shrink-0 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${
                filter === f.id
                  ? "bg-ink text-white"
                  : "text-ink-soft hover:bg-paper"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 font-mono text-[10px] ${filter === f.id ? "text-teal-soft" : "text-ink-faint"}`}>
                {f.id === "all" ? tasks.length : tasks.filter((t) => t.status === f.id).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar tarefas…"
            className={`${inputCls} bg-white py-2 pl-9 text-[12.5px]`}
          />
        </div>
      </div>

      {/* lista */}
      <div className="space-y-2">
        {filtered.map((t) => {
          const st = providerMeta(t.provider);
          return (
            <div
              key={t.id}
              className="slide-in surface surface-hover flex items-start gap-2.5 p-3.5"
            >
              <button
                onClick={() => onCycle(t)}
                aria-label="Mudar estado"
                className="press mt-0.5 shrink-0 text-ink-faint hover:text-teal"
              >
                {t.status === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-teal" />
                ) : t.status === "doing" ? (
                  <CircleDot className="h-5 w-5 text-amber" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <button onClick={() => onOpenTask(t)} className="min-w-0 flex-1 text-left">
                <p
                  className={`text-[13.5px] font-semibold leading-snug ${
                    t.status === "done" ? "text-ink-faint line-through" : "text-ink"
                  }`}
                >
                  {t.title}
                </p>
                {t.notes && (
                  <p className="mt-0.5 line-clamp-1 text-[11.5px] text-ink-faint">{t.notes}</p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className="chip"
                    style={{ background: `${st.color}14`, color: st.color }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} />
                    {st.short}
                  </span>
                  <StatusPill status={t.status} />
                  <span className="text-[10px] text-ink-faint">
                    {t.origin === "iphone" ? "iPhone" : "web"} · {timeAgo(t.updatedAt)}
                  </span>
                </div>
              </button>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  onClick={() => onOpenTask(t)}
                  className="press grid h-8 w-8 place-items-center rounded-lg text-teal-deep hover:bg-teal-soft"
                  aria-label="Conversar com a IA"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="press grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-amber-soft hover:text-amber"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <EmptyState
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Nada por aqui"
            body="Ajusta o filtro, pesquisa outra coisa ou cria uma nova tarefa acima."
          />
        )}
      </div>
    </div>
  );
}

/* ───────────────── detalhe da tarefa + chat ───────────────── */
export function TaskSheet({
  task,
  conns,
  onClose,
  onPatch,
  onDelete,
  aiChat,
}: {
  task: TaskView;
  conns: ConnectionView[];
  onClose: () => void;
  onPatch: (id: number, patch: Partial<TaskView>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  aiChat: (input: { prompt: string; taskId: number | null; connectionId: number | null }) => Promise<{
    warning?: string | null;
    error?: string | null;
  }>;
}) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [status, setStatus] = useState(task.status);
  const [provider, setProvider] = useState(task.provider);
  const [saved, setSaved] = useState(false);
  const [msgs, setMsgs] = useState<MessageView[]>([]);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [connChoice, setConnChoice] = useState("demo");
  const [warning, setWarning] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes);
    setStatus(task.status);
    setProvider(task.provider);
  }, [task]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(`/api/chat?taskId=${task.id}`)
      .then((r) => r.json())
      .then((rows) => alive && setMsgs(rows))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [task.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, sending]);

  async function save() {
    await onPatch(task.id, { title: title.trim() || task.title, notes, status, provider });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  async function send() {
    const p = prompt.trim();
    if (!p || sending) return;
    setSending(true);
    setWarning(null);
    setPrompt("");
    setMsgs((m) => [
      ...m,
      {
        id: -Date.now(),
        taskId: task.id,
        role: "user",
        content: p,
        provider: "demo",
        createdAt: new Date(),
      },
    ]);
    const res = await aiChat({
      prompt: p,
      taskId: task.id,
      connectionId: connChoice === "demo" ? null : Number(connChoice),
    });
    if (res.warning) setWarning(res.warning);
    if (res.error) setWarning(res.error);
    const rows = await fetch(`/api/chat?taskId=${task.id}`).then((r) => r.json());
    setMsgs(rows);
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="sheet-backdrop absolute inset-0"
      />
      <div className="sheet-panel relative flex max-h-[92dvh] w-full flex-col overflow-hidden safe-bottom rounded-t-[1.6rem] bg-paper shadow-2xl sm:max-w-2xl sm:rounded-[1.6rem]">
        {/* header */}
        <div className="flex items-start gap-2 border-b border-line bg-white px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">
              tarefa #{task.id} · {task.origin === "iphone" ? "iPhone" : "dashboard"}
            </p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-0.5 w-full bg-transparent font-display text-[15px] font-bold outline-none"
            />
          </div>
          <button
            onClick={onClose}
            className="press grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-paper text-ink-soft hover:bg-line"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scroll-slim flex-1 overflow-y-auto">
          {/* controlos */}
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-1.5">
              {(["todo", "doing", "done"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`press rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${
                    status === s
                      ? "bg-ink text-white"
                      : "border border-line bg-white text-ink-soft hover:border-teal/40"
                  }`}
                >
                  {s === "todo" ? "A fazer" : s === "doing" ? "Em curso com IA" : "Concluída"}
                </button>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Notas, contexto ou critérios de conclusão…"
                className={`${inputCls} resize-none bg-white text-[12.5px]`}
              />
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className={`${inputCls} bg-white text-[12px] font-medium sm:w-[150px]`}
                aria-label="Modelo"
              >
                <option value="demo">Local (sem IA)</option>
                {conns.map((c) => (
                  <option key={c.id} value={c.provider}>
                    {providerMeta(c.provider).short}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => onDelete(task.id).then(onClose)}
                className="press flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold text-ink-faint hover:bg-amber-soft hover:text-amber"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
              <button
                onClick={save}
                className="press flex items-center gap-1.5 rounded-xl bg-teal px-4 py-2 text-[12px] font-bold text-white hover:bg-teal-deep"
              >
                {saved ? <Check className="h-3.5 w-3.5" /> : null}
                {saved ? "Guardado" : "Guardar alterações"}
              </button>
            </div>
          </div>

          {/* chat */}
          <div className="border-t border-line bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[12px] font-bold">
                <MessageSquareText className="h-4 w-4 text-teal" /> Conversa com a IA
              </p>
              <select
                value={connChoice}
                onChange={(e) => setConnChoice(e.target.value)}
                className="max-w-[165px] rounded-lg border border-line bg-paper px-2 py-1 text-[11px] font-medium outline-none focus:border-teal"
                aria-label="Modelo para a conversa"
              >
                <option value="demo">Local · sem IA</option>
                {conns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 max-h-[34dvh] space-y-2.5 overflow-y-auto">
              {msgs.length === 0 && !sending && (
                <div className="rounded-xl border border-dashed border-line p-4 text-center">
                  <MessageSquareText className="mx-auto h-5 w-5 text-ink-faint" />
                  <p className="mt-2 text-[11.5px] text-ink-faint">
                    Sem conversas ainda. O histórico desta tarefa é o contexto enviado ao modelo.
                  </p>
                  <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                    {["Plano de ação", "Escreve o e-mail", "Resume em 5 pontos"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setPrompt(s)}
                        className="press rounded-full border border-line px-2.5 py-1 text-[10.5px] font-medium text-ink-soft hover:border-teal hover:text-teal-deep"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={`slide-in flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${
                      m.role === "user" ? "bg-ink text-white" : "bg-teal-soft text-teal-deep"
                    }`}
                  >
                    {m.role === "user" ? (
                      <UserRound className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-tr-sm bg-ink text-white/95"
                        : "rounded-tl-sm border border-line bg-paper text-ink"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2.5">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal" />
                  <span className="ml-1 text-[11px] text-ink-faint">a pensar…</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {warning && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-soft px-2.5 py-2 text-[10.5px] text-amber">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {warning}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="mt-2.5 flex gap-2"
            >
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Pede um rascunho, resumo ou próximo passo…"
                className={`${inputCls} text-[12.5px]`}
              />
              <button
                type="submit"
                disabled={sending || !prompt.trim()}
                className="press grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal text-white hover:bg-teal-deep disabled:opacity-40"
                aria-label="Enviar"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}