import { CheckCircle2, Circle, Sparkles, Wifi } from "lucide-react";

const items = [
  {
    title: "Proposta cliente Atlas",
    tag: "Claude",
    tagColor: "#d97757",
    state: "doing",
  },
  {
    title: "Resumir relatório Q3",
    tag: "Gemini",
    tagColor: "#4285f4",
    state: "todo",
  },
  {
    title: "E-mail de follow-up",
    tag: "ChatGPT",
    tagColor: "#10a37f",
    state: "todo",
  },
  {
    title: "Checklist de lançamento",
    tag: "ChatGPT",
    tagColor: "#10a37f",
    state: "done",
  },
];

export function PhoneMock() {
  return (
    <div className="float-y relative mx-auto w-[270px]">
      <div className="rounded-[2.6rem] border border-white/15 bg-night-2 p-2.5 shadow-[0_30px_80px_-20px_rgba(4,20,30,0.8)]">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-paper">
          {/* dynamic island */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-night" />
          <div className="px-4 pb-5 pt-11">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
                  hoje · terça
                </p>
                <p className="font-display text-lg font-bold text-ink">
                  As minhas tarefas
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-teal-soft px-2 py-1 text-[9px] font-semibold text-teal-deep">
                <Wifi className="h-3 w-3" /> sync
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {items.map((it) => (
                <div
                  key={it.title}
                  className="rounded-xl border border-line bg-card p-2.5 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    {it.state === "done" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                    ) : (
                      <Circle
                        className={`mt-0.5 h-4 w-4 shrink-0 ${it.state === "doing" ? "text-amber" : "text-line"}`}
                      />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`truncate text-[11px] font-semibold ${it.state === "done" ? "text-ink-faint line-through" : "text-ink"}`}
                      >
                        {it.title}
                      </p>
                      <span
                        className="mt-1 inline-block rounded-full px-1.5 py-px text-[8px] font-semibold text-white"
                        style={{ background: it.tagColor }}
                      >
                        {it.tag}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-ink px-3 py-2.5">
              <Sparkles className="h-3.5 w-3.5 text-amber" />
              <p className="text-[10px] font-medium text-white/85">
                Perguntar à IA sobre esta tarefa…
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* etiqueta flutuante de sync */}
      <div className="absolute -right-10 top-24 hidden rounded-lg border border-white/15 bg-night px-3 py-2 sm:block">
        <p className="font-mono text-[9px] uppercase tracking-widest text-teal-soft">
          sincronizado
        </p>
        <p className="text-[10px] text-white/70">iPhone ⇄ dashboard · 2 s</p>
      </div>
    </div>
  );
}