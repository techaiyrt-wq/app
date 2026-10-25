"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, Circle, CircleDot, CheckCircle2 } from "lucide-react";
import { providerMeta } from "@/lib/providers";
import type { DateLike } from "./types";

export function timeAgo(d: DateLike | null) {
  if (!d) return "nunca";
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 15) return "agora mesmo";
  if (s < 60) return `há ${Math.floor(s)} s`;
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

export const STATUS_META: Record<
  string,
  { label: string; cls: string; dot: string; icon: typeof Circle }
> = {
  todo: { label: "A fazer", cls: "bg-paper text-ink-soft", dot: "bg-ink-faint", icon: Circle },
  doing: {
    label: "Em curso",
    cls: "bg-amber-soft text-amber",
    dot: "bg-amber",
    icon: CircleDot,
  },
  done: {
    label: "Concluída",
    cls: "bg-teal-soft text-teal-deep",
    dot: "bg-teal",
    icon: CheckCircle2,
  },
};

export function ProviderChip({ provider }: { provider: string }) {
  const meta = providerMeta(provider);
  return (
    <span
      className="chip"
      style={{ background: `${meta.color}14`, color: meta.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.short}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.todo;
  return (
    <span className={`chip ${meta.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function SectionCard({
  title,
  icon,
  action,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface p-5 ${className}`}>
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-bold tracking-tight text-ink">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-paper/60 px-6 py-10 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-card text-teal">
        {icon}
      </span>
      <p className="mt-3 font-display text-sm font-bold text-ink">{title}</p>
      <p className="mt-1 max-w-[280px] text-xs leading-relaxed text-ink-faint">{body}</p>
    </div>
  );
}

import { copyToClipboard } from "@/lib/clipboard";

export function CopyButton({
  value,
  label = "Copiar",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(value);
        if (ok) {
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        }
      }}
      className={`copy-btn press inline-flex items-center gap-1 ${className}`}
      title="Copiar para a área de transferência"
    >
      {done ? <Check className="h-3 w-3 text-teal" /> : <Copy className="h-3 w-3" />}
      <span>{done ? "Copiado!" : label}</span>
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-teal" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2 text-[11.5px] font-semibold text-ink">
        {label}
        {hint && <span className="font-normal text-ink-faint">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-teal focus:bg-white focus:ring-2 focus:ring-teal/15";