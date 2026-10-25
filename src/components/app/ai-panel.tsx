"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Bot, UserRound, AlertTriangle, Plus, ArrowUpRight, Zap } from "lucide-react";
import { providerMeta } from "@/lib/providers";
import type { ConnectionView, MessageView } from "./types";
import { inputCls } from "./ui";

const IDEAS = [
  { key: "A", label: "Plano de ação", prompt: "Faz-me um plano de ação em 4 passos para " },
  { key: "E", label: "Escrever e-mail", prompt: "Escreve um e-mail profissional e curto sobre " },
  { key: "D", label: "Decidir", prompt: "Ajuda-me a decidir entre duas opções: " },
  { key: "R", label: "Resumir", prompt: "Resume em 5 pontos e destaca o próximo passo: " },
];

export function AiPanel({
  conns,
  aiChat,
  onNavigate,
}: {
  conns: ConnectionView[];
  aiChat: (input: { prompt: string; taskId: number | null; connectionId: number | null }) => Promise<{
    reply?: string;
    warning?: string | null;
    error?: string | null;
  }>;
  onNavigate: (tab: "connect" | "tasks") => void;
}) {
  const [choice, setChoice] = useState<string>("demo");
  const [msgs, setMsgs] = useState<MessageView[]>([]);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const models = [{ id: "demo", ...providerMeta("demo"), sub: "não usa IA" }].concat(
    conns.map((c) => ({
      id: String(c.id),
      ...providerMeta(c.provider),
      sub: c.model,
    }))
  );
  const active = models.find((m) => m.id === choice) ?? models[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, sending]);

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
        taskId: null,
        role: "user",
        content: p,
        provider: "demo",
        createdAt: new Date(),
      },
    ]);
    const res = await aiChat({
      prompt: p,
      taskId: null,
      connectionId: choice === "demo" ? null : Number(choice),
    });
    if (res.warning) setWarning(res.warning);
    if (res.error) setWarning(res.error);
    setMsgs((m) => [
      ...m,
      {
        id: -Date.now() - 1,
        taskId: null,
        role: "assistant",
        content:
          (res as { reply?: string }).reply ??
          "Resposta recebida. Consulta o feed de sincronização no início.",
        provider: choice,
        createdAt: new Date(),
      },
    ]);
    setSending(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Perguntar à IA</h1>
        <p className="mt-0.5 text-[12.5px] text-ink-soft">
          Conversa livre com o modelo que escolheres. Para guardar o resultado, associa-o a uma
          tarefa.
        </p>
      </div>

      {/* modelos */}
      <div className="scroll-slim -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => setChoice(m.id)}
            className={`press flex min-w-[150px] shrink-0 items-center gap-2 rounded-2xl border p-3 text-left transition-all ${
              choice === m.id
                ? "border-teal bg-white shadow-[var(--nexo-shadow)]"
                : "border-line bg-white/70 hover:border-teal/40"
            }`}
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10.5px] font-bold text-white"
              style={{ background: m.color }}
            >
              {m.short.slice(0, 2)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-bold">{m.short}</span>
              <span className="block truncate font-mono text-[9.5px] text-ink-faint">{m.sub}</span>
            </span>
          </button>
        ))}
        <button
          onClick={() => onNavigate("connect")}
          className="press flex min-w-[92px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line bg-white/50 p-3 text-ink-faint hover:border-teal/50 hover:text-teal-deep"
        >
          <Plus className="h-4 w-4" />
          <span className="text-[10.5px] font-semibold">Ligar</span>
        </button>
      </div>

      {/* chat */}
      <div className="surface flex min-h-[52dvh] flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <p className="flex items-center gap-1.5 text-[12px] font-bold">
            <span className="h-2 w-2 rounded-full" style={{ background: active.color }} />
            {active.name}
          </p>
          <span className={`chip ${active.free ? "bg-teal-soft text-teal-deep" : "bg-amber-soft text-amber"}`}>
            {active.free ? "grátis / tier free" : "custo por uso"}
          </span>
        </div>

        <div className="scroll-slim flex-1 space-y-3 overflow-y-auto p-4">
          {msgs.length === 0 && !sending && (
            <div className="grid h-full place-items-center py-6">
              <div className="w-full max-w-sm text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-soft text-teal-deep">
                  <Sparkles className="h-6 w-6" />
                </span>
                <p className="mt-3 font-display text-[15px] font-bold">Em que estás a trabalhar?</p>
                <p className="mt-1 text-[12px] text-ink-faint">
                  Escreve um pedido ou começa por uma destas ideias.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {IDEAS.map((i) => (
                    <button
                      key={i.label}
                      onClick={() => setPrompt(i.prompt)}
                      className="press rounded-xl border border-line bg-white p-2.5 text-left transition-colors hover:border-teal/40"
                    >
                      <span className="micro">{i.key}</span>
                      <span className="mt-1 block text-[11.5px] font-semibold text-ink">
                        {i.label}
                      </span>
                      <span className="mt-0.5 line-clamp-1 text-[10px] text-ink-faint">
                        {i.prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {msgs.map((m) => (
            <div
              key={m.id}
              className={`slide-in flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
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
                className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
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
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-soft text-teal-deep">
                <Bot className="h-3.5 w-3.5" />
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-line bg-paper px-3.5 py-3">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {warning && (
          <div className="mx-4 mb-2 flex items-start gap-1.5 rounded-lg bg-amber-soft px-2.5 py-2 text-[10.5px] leading-relaxed text-amber">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {warning}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-line p-3"
        >
          <div className="flex gap-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Escreve o teu pedido — ${active.short}…`}
              className={inputCls}
            />
            <button
              type="submit"
              disabled={sending || !prompt.trim()}
              className="press grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal text-white hover:bg-teal-deep disabled:opacity-40"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-ink-faint">
            <Zap className="h-3 w-3" /> As chaves ficam no servidor. Sem IA ligada, as respostas são rascunhos locais.
          </p>
        </form>
      </div>

      <button
        onClick={() => onNavigate("tasks")}
        className="press flex w-full items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-left"
      >
        <span className="text-[12px] font-semibold text-ink">
          Queres guardar resultados numa tarefa?
        </span>
        <span className="flex items-center gap-1 text-[11.5px] font-semibold text-teal-deep">
          Abrir inbox <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </button>
    </div>
  );
}