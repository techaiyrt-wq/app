"use client";

import { useState } from "react";
import {
  User,
  Palette,
  Sun,
  Sparkles,
  RefreshCw,
  Database,
  Check,
  Download,
  Trash2,
  Loader2,
  AlertTriangle,
  DownloadCloud,
} from "lucide-react";
import { PROVIDER_META } from "@/lib/providers";
import type { SettingsView, Tab } from "./types";
import { Field, inputCls, SectionCard, Toggle } from "./ui";
import { GuidePanel } from "./guide-panel";

const ACCENTS = [
  { id: "verde", label: "Verde-musgo", color: "#14615a" },
  { id: "azul", label: "Azul-tinta", color: "#1f4fa8" },
  { id: "ameixa", label: "Ameixa", color: "#7a3054" },
  { id: "oliva", label: "Azeitona", color: "#4a6b1f" },
  { id: "terracota", label: "Terracota", color: "#a3491f" },
  { id: "grafite", label: "Grafite", color: "#3d4a55" },
];

const BACKGROUNDS = [
  { id: "paper", label: "Papel", bg: "#f7f6f2", surface: "#ffffff", vivid: "#eee5d3", vividSurface: "#fffaf0" },
  { id: "snow", label: "Neve", bg: "#f2f4f7", surface: "#ffffff", vivid: "#e0e8f4", vividSurface: "#f7faff" },
  { id: "linen", label: "Linho", bg: "#f4ede2", surface: "#fffdf8", vivid: "#f0d9b5", vividSurface: "#fff6e7" },
  { id: "sage", label: "Sálvia", bg: "#edf1e8", surface: "#fbfdf8", vivid: "#dce9c9", vividSurface: "#f5fae9" },
  { id: "mist", label: "Névoa", bg: "#e9f0f2", surface: "#fbfdfd", vivid: "#d5e8ed", vividSurface: "#f0fafb" },
  { id: "clay", label: "Argila", bg: "#f6ece6", surface: "#fffaf6", vivid: "#efd4c3", vividSurface: "#fff2e8" },
  { id: "ink", label: "Pedra", bg: "#e8e7e2", surface: "#fbfbf9", vivid: "#d7d3c5", vividSurface: "#f7f5ee" },
  { id: "blush", label: "Rosé", bg: "#f7eef0", surface: "#fffafd", vivid: "#edc5d1", vividSurface: "#fff2f6" },
  { id: "lavender", label: "Lavanda", bg: "#f1eef7", surface: "#fdfbff", vivid: "#ded3f1", vividSurface: "#f6f1ff" },
  { id: "sky", label: "Céu", bg: "#eaf2f9", surface: "#fbfdff", vivid: "#cfe5f7", vividSurface: "#eef7ff" },
  { id: "mint", label: "Menta", bg: "#e9f3ee", surface: "#fbfefc", vivid: "#ccebd9", vividSurface: "#effcf4" },
  { id: "butter", label: "Manteiga", bg: "#f7f2df", surface: "#fffef8", vivid: "#f2e5aa", vividSurface: "#fff9dc" },
  { id: "coral", label: "Coral", bg: "#f6eae6", surface: "#fffaf8", vivid: "#efc0b1", vividSurface: "#fff0eb" },
  { id: "ocean", label: "Oceano", bg: "#e8f0f3", surface: "#f9fcfd", vivid: "#c6dfe8", vividSurface: "#e9f5f8" },
  { id: "lilac", label: "Lilás", bg: "#f2edf7", surface: "#fffaff", vivid: "#e5caed", vividSurface: "#fcf2ff" },
  { id: "sand", label: "Areia", bg: "#f4efdf", surface: "#fffdf6", vivid: "#e8d2a5", vividSurface: "#fff5dc" },
  { id: "rose", label: "Rosa", bg: "#f7eef0", surface: "#fffafd", vivid: "#edc5d1", vividSurface: "#fff2f6" },
  { id: "ice", label: "Gelo", bg: "#eff4f2", surface: "#fcfefd", vivid: "#cbe6e0", vividSurface: "#effaf7" },
  { id: "peach", label: "Pêssego", bg: "#f8eee8", surface: "#fffaf6", vivid: "#f2d0b8", vividSurface: "#fff3e9" },
];

const INTERVALS = [
  { v: 0, label: "Manual" },
  { v: 5, label: "5 s" },
  { v: 8, label: "8 s" },
  { v: 30, label: "30 s" },
  { v: 60, label: "1 min" },
];

export function SettingsPanel({
  settings,
  onSave,
  onNavigate,
}: {
  settings: SettingsView;
  onSave: (patch: Partial<SettingsView>) => Promise<void>;
  onNavigate: (tab: Tab) => void;
}) {
  const [name, setName] = useState(settings.displayName);
  const [workspace, setWorkspace] = useState(settings.workspaceName);
  const [instructions, setInstructions] = useState(settings.instructions);
  const [busy, setBusy] = useState<string | null>(null);
  const [savingProdUrl, setSavingProdUrl] = useState(false);
  const [dataMsg, setDataMsg] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);

  async function saveProductionUrl(url: string) {
    setSavingProdUrl(true);
    try {
      await onSave({ productionUrl: url });
    } finally {
      setSavingProdUrl(false);
    }
  }

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  }

  async function exportData() {
    setDataMsg(null);
    setBusy("export");
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexo-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDataMsg({ kind: "ok", text: "Ficheiro exportado — tarefas, conversas, eventos e definições." });
    } catch {
      setDataMsg({ kind: "warn", text: "Falha ao exportar." });
    } finally {
      setBusy(null);
    }
  }

  async function resetData() {
    setDataMsg(null);
    setBusy("reset");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (!res.ok) throw new Error();
      setDataMsg({ kind: "ok", text: "Tarefas, conversas e eventos apagados." });
      window.location.reload();
    } catch {
      setDataMsg({ kind: "warn", text: "Falha ao apagar os dados." });
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Ajustes</h1>
        <p className="mt-0.5 text-[12.5px] text-ink-soft">
          Tudo o que personalizas aqui fica guardado na tua conta e segue para todos os ecrãs.
        </p>
      </div>

      {/* perfil */}
      <SectionCard title="Perfil" icon={<User className="h-4 w-4 text-teal" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="O teu nome" hint="aparece no ecrã e nos avisos">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name !== settings.displayName && run("name", () => onSave({ displayName: name }))}
              placeholder="ex.: Marta"
              className={inputCls}
            />
          </Field>
          <Field label="Nome do espaço" hint="o título do teu Nexo">
            <input
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              onBlur={() =>
                workspace !== settings.workspaceName && run("ws", () => onSave({ workspaceName: workspace }))
              }
              placeholder="ex.: Nexo"
              className={inputCls}
            />
          </Field>
        </div>
      </SectionCard>

      {/* aparência */}
      <SectionCard title="Aparência" icon={<Palette className="h-4 w-4 text-teal" />}>
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="text-[11.5px] font-semibold">Cor de fundo</p>
            <span className="micro">
              {BACKGROUNDS.find((b) => b.id === settings.background)?.label ?? "Papel"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-5 lg:grid-cols-7">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                data-on={settings.background === b.id}
                onClick={() => run(`bg-${b.id}`, () => onSave({ background: b.id }))}
                className="swatch press"
                style={{ background: settings.backgroundVivid ? b.vivid : b.bg }}
                aria-label={`Fundo ${b.label}`}
                title={b.label}
              >
                <span className="absolute inset-x-1 top-1 truncate text-center text-[8px] font-semibold uppercase tracking-wide text-ink-soft">
                  {b.label}
                </span>
                <i style={{ background: settings.backgroundVivid ? b.vividSurface : b.surface }} />
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[10.5px] text-ink-faint">
            19 fundos, do neutro ao colorido. A amostra mostra o fundo e a cor dos cartões.
          </p>

          <div className="mt-3 flex items-center justify-between gap-3 border border-line bg-card px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-paper text-ink-soft">
                <Sun className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[12px] font-semibold text-ink">Fundo mais vivo</span>
                <span className="block text-[10.5px] text-ink-faint">
                  {settings.backgroundVivid ? "Tons mais fortes" : "Tons suaves"} · só altera o fundo e os cartões
                </span>
              </span>
            </div>
            <Toggle
              checked={settings.backgroundVivid}
              label="Tornar as cores do fundo mais vivas"
              onChange={(v) => run("background-vivid", () => onSave({ backgroundVivid: v }))}
            />
          </div>
        </div>

        <div className="divider mt-4 pt-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="text-[11.5px] font-semibold">Cor de destaque</p>
            <span className="micro">
              {ACCENTS.find((a) => a.id === settings.accent)?.label ?? "Verde-musgo"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                data-on={settings.accent === a.id}
                onClick={() => run(`accent-${a.id}`, () => onSave({ accent: a.id }))}
                className="swatch press"
                style={{ background: a.color }}
                aria-label={a.label}
                title={a.label}
              >
                <i style={{ background: "rgba(255,255,255,0.9)" }} />
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[10.5px] text-ink-faint">
            Aplica-se a botões, links, etiquetas de estado, indicadores e ao painel principal.
          </p>
        </div>

        {/* pré-visualização ao vivo */}
        <div className="mt-4 rounded-xl border border-line p-3" style={{ background: "var(--bg)" }}>
          <p className="micro mb-2">pré-visualização</p>
          <div className="surface p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12.5px] font-bold">Tarefa de exemplo</p>
              <span className="chip" style={{ color: "var(--accent-deep)", borderColor: "var(--accent)" }}>
                em curso
              </span>
            </div>
            <p className="mt-1 text-[11px] text-ink-faint">
              Cartão sobre o fundo escolhido, com o destaque ativo.
            </p>
            <div className="mt-2.5 flex gap-2">
              <span
                className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-white"
                style={{ background: "var(--accent)" }}
              >
                Botão
              </span>
              <span
                className="rounded-lg border px-3 py-1.5 text-[11px] font-bold"
                style={{ borderColor: "var(--accent)", color: "var(--accent-deep)" }}
              >
                Secundário
              </span>
            </div>
          </div>
        </div>

        <div className="divider mt-4 pt-4">
          <p className="mb-1.5 text-[11.5px] font-semibold">Densidade</p>
          <div className="flex gap-2">
            {[
              { id: "normal", label: "Confortável" },
              { id: "compact", label: "Compacta" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => run(`density-${d.id}`, () => onSave({ density: d.id }))}
                className={`press rounded-lg border px-3.5 py-2 text-[12px] font-semibold ${
                  settings.density === d.id
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-card text-ink-soft"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* IA */}
      <SectionCard title="Comportamento da IA" icon={<Sparkles className="h-4 w-4 text-teal" />}>
        <Field label="Modelo por omissão em novas tarefas">
          <select
            value={settings.defaultProvider}
            onChange={(e) => run("prov", () => onSave({ defaultProvider: e.target.value }))}
            className={inputCls}
          >
            <option value="demo">Local — não usa IA</option>
            {Object.entries(PROVIDER_META)
              .filter(([k]) => k !== "demo")
              .map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
          </select>
        </Field>

        <div className="mt-3">
          <Field
            label="Instruções personalizadas"
            hint={`${instructions.length}/2000`}
          >
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              onBlur={() =>
                instructions !== settings.instructions &&
                run("instr", () => onSave({ instructions }))
              }
              rows={5}
              placeholder={"ex.: Responde sempre em português europeu.\nUsa listas curtas.\nAssina como «M.».\nNunca inventes dados."}
              className={`${inputCls} resize-none text-[12.5px] leading-relaxed`}
            />
          </Field>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
            Enviadas como instruções do sistema em <strong>todas</strong> as chamadas às IAs
            ligadas. Guardadas automaticamente ao sair do campo.
          </p>
        </div>
      </SectionCard>

      {/* sincronização */}
      <SectionCard title="Sincronização" icon={<RefreshCw className="h-4 w-4 text-teal" />}>
        <div className="flex flex-wrap gap-2">
          {INTERVALS.map((i) => (
            <button
              key={i.v}
              onClick={() => run(`poll-${i.v}`, () => onSave({ pollInterval: i.v }))}
              className={`press rounded-lg border px-3 py-2 text-[12px] font-semibold ${
                settings.pollInterval === i.v
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink-soft"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-ink-faint">
          Frequência com que a app pede «o que mudou» ao servidor. Com 0 (manual), sincronizas ao
          puxar ou ao carregar.{" "}
          <button
            onClick={() => onNavigate("connect")}
            className="font-semibold text-teal-deep underline"
          >
            Ligar o teu dashboard
          </button>
        </p>
      </SectionCard>

      {/* dados */}
      <SectionCard title="Os teus dados" icon={<Database className="h-4 w-4 text-teal" />}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportData}
            disabled={busy === "export"}
            className="press flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2.5 text-[12px] font-semibold hover:border-teal disabled:opacity-50"
          >
            {busy === "export" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Exportar JSON
          </button>
          <button
            onClick={() => dataMsg?.kind === "ok" && resetData()}
            disabled={busy === "reset"}
            className="press flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2.5 text-[12px] font-semibold text-ink-soft hover:border-amber hover:text-amber disabled:opacity-50"
          >
            {busy === "reset" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Apagar tarefas e conversas
          </button>
        </div>
        {dataMsg && (
          <p
            className={`fade-in mt-2.5 flex items-start gap-1.5 rounded-lg px-2.5 py-2 text-[11px] ${
              dataMsg.kind === "ok" ? "bg-teal-soft text-teal-deep" : "bg-amber-soft text-amber"
            }`}
          >
            {dataMsg.kind === "ok" ? (
              <Check className="mt-0.5 h-3 w-3 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            )}
            {dataMsg.text}
          </p>
        )}
        <p className="mt-2.5 text-[11px] leading-relaxed text-ink-faint">
          Apagar pede confirmação (toca duas vezes) e não remove as definições nem as chaves de
          IA. Nada é partilhado com terceiros além do fornecedor de IA que escolheres — ver{" "}
          <strong>secção 06</strong> da especificação.
        </p>
      </SectionCard>

      <div className="divider" />
      <GuidePanel
        productionUrl={settings.productionUrl ?? ""}
        onSaveProductionUrl={saveProductionUrl}
        savingProductionUrl={savingProdUrl}
      />
    </div>
  );
}
