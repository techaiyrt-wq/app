"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Plug,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
  Trash2,
  Plus,
  RotateCw,
  ShieldCheck,
  ExternalLink,
  Unplug,
  Copy,
  Check,
} from "lucide-react";
import { PROVIDER_META, providerMeta, type ProviderId } from "@/lib/providers";
import type { ConnectionView, IntegrationView } from "./types";
import { CopyButton, Field, inputCls, SectionCard, Toggle, timeAgo } from "./ui";

export function ConnectPanel({
  conns,
  integration,
  onAddConnection,
  onRemoveConnection,
  onSaveIntegration,
  onTest,
  onSnapshot,
  onRefresh,
}: {
  conns: ConnectionView[];
  integration: IntegrationView;
  onAddConnection: (input: {
    provider: string;
    apiKey: string;
    model: string;
    label: string;
  }) => Promise<boolean>;
  onRemoveConnection: (id: number) => Promise<void>;
  onSaveIntegration: (patch: Record<string, unknown>) => Promise<void>;
  onTest: () => Promise<{
    ok: boolean;
    httpStatus?: number;
    latencyMs?: number;
    contentType?: string;
    error?: string | null;
  }>;
  onSnapshot: () => Promise<{ ok: boolean; count?: number; latencyMs?: number; error?: string }>;
  onRefresh: () => Promise<void>;
}) {
  const [dashboardUrl, setDashboardUrl] = useState(integration.dashboardUrl);
  const [webhookUrl, setWebhookUrl] = useState(integration.webhookUrl);
  const [token, setToken] = useState("");
  const [autoSync, setAutoSync] = useState(integration.autoSync);
  const [busy, setBusy] = useState<string | null>(null);
  const [test, setTest] = useState<{
    ok: boolean;
    latencyMs?: number;
    httpStatus?: number;
    error?: string | null;
  } | null>(null);
  const [snapshot, setSnapshot] = useState<{
    ok: boolean;
    count?: number;
    latencyMs?: number;
    error?: string;
  } | null>(null);
  const [origin, setOrigin] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [pProvider, setPProvider] = useState<ProviderId>("google");
  const [pKey, setPKey] = useState("");
  const [pModel, setPModel] = useState("");
  const [pLabel, setPLabel] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  async function save(patch: Record<string, unknown>) {
    setBusy("save");
    try {
      await onSaveIntegration(patch);
    } finally {
      setBusy(null);
    }
  }

  async function runTest() {
    setBusy("test");
    setTest(null);
    try {
      if (dashboardUrl !== integration.dashboardUrl || webhookUrl !== integration.webhookUrl) {
        await onSaveIntegration({ dashboardUrl, webhookUrl });
      }
      const r = await onTest();
      setTest(r);
    } finally {
      setBusy(null);
    }
  }

  async function runSnapshot() {
    setBusy("snap");
    setSnapshot(null);
    try {
      if (webhookUrl !== integration.webhookUrl) {
        await onSaveIntegration({ webhookUrl });
      }
      const r = await onSnapshot();
      setSnapshot(r);
    } finally {
      setBusy(null);
    }
  }

  const linked = integration.status === "linked";
  const key = integration.publicKey;

  const curlTasks = `curl -H "Authorization: Bearer ${key}" \\
  ${origin}/api/v1/tasks`;

  const curlCreate = `curl -X POST ${origin}/api/v1/tasks \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Nova tarefa a partir do dashboard"}'`;

  const webhookSnippet = `// No TEU dashboard (ex.: Next.js/Express)
app.post("/api/nexo/webhook", (req, res) => {
  if (req.headers["x-nexo-key"] !== process.env.NEXO_KEY)
    return res.status(401).end();
  const { kind, tasks } = req.body;   // tasks.snapshot traz tudo
  // guarda/atualiza as tarefas na tua base de dados
  res.json({ ok: true });
});`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Ligações</h1>
        <p className="mt-0.5 text-[12.5px] text-ink-soft">
          Traz as tuas IAs para dentro da app e liga o dashboard que já tens.
        </p>
      </div>

      {/* ── DASHBOARD ── */}
      <SectionCard
        title="O teu dashboard"
        icon={<Cloud className="h-4 w-4 text-teal" />}
        action={
          <span
            className={`chip ${
              linked
                ? "bg-teal-soft text-teal-deep"
                : integration.status === "error"
                  ? "bg-amber-soft text-amber"
                  : "bg-paper text-ink-faint"
            }`}
          >
            {linked ? "ligado" : integration.status === "error" ? "erro" : "por ligar"}
          </span>
        }
      >
        <div className="space-y-3">
          <Field label="URL do dashboard" hint="para o teste de ligação">
            <input
              value={dashboardUrl}
              onChange={(e) => setDashboardUrl(e.target.value)}
              onBlur={() => dashboardUrl !== integration.dashboardUrl && save({ dashboardUrl })}
              placeholder="https://dashboard.exemplo.com"
              className={`${inputCls} font-mono text-[11.5px]`}
              inputMode="url"
            />
          </Field>
          <Field label="URL de receção (webhook)" hint="onde enviamos os eventos">
            <input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              onBlur={() => webhookUrl !== integration.webhookUrl && save({ webhookUrl })}
              placeholder="https://dashboard.exemplo.com/api/nexo/webhook"
              className={`${inputCls} font-mono text-[11.5px]`}
              inputMode="url"
            />
          </Field>
          <Field label="Token do teu dashboard" hint="enviado como Bearer (opcional)">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onBlur={() => {
                if (token) {
                  save({ bearerToken: token });
                  setToken("");
                }
              }}
              placeholder={integration.hasToken ? "•••••• (já guardado)" : "Bearer token"}
              className={`${inputCls} font-mono text-[11.5px]`}
            />
          </Field>

          <div className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2.5">
            <div>
              <p className="text-[12px] font-bold">Sincronização automática</p>
              <p className="text-[10.5px] text-ink-faint">
                Envia cada alteração para o teu webhook
              </p>
            </div>
            <Toggle
              checked={autoSync}
              label="Sincronização automática"
              onChange={(v) => {
                setAutoSync(v);
                save({ autoSync: v });
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={runTest}
              disabled={busy === "test"}
              className="press flex items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2.5 text-[12px] font-bold text-ink hover:border-teal/50 disabled:opacity-50"
            >
              {busy === "test" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plug className="h-3.5 w-3.5 text-teal" />
              )}
              Testar ligação
            </button>
            <button
              onClick={runSnapshot}
              disabled={busy === "snap" || !integration.webhookUrl}
              className="press flex items-center justify-center gap-1.5 rounded-xl bg-teal px-3 py-2.5 text-[12px] font-bold text-white hover:bg-teal-deep disabled:opacity-40"
            >
              {busy === "snap" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Enviar tarefas
            </button>
          </div>

          {test && (
            <div
              className={`fade-in flex items-start gap-2 rounded-xl px-3 py-2.5 text-[11px] leading-relaxed ${
                test.ok ? "bg-teal-soft text-teal-deep" : "bg-amber-soft text-amber"
              }`}
            >
              {test.ok ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <span>
                {test.ok
                  ? `Dashboard alcançável · HTTP ${test.httpStatus} · ${test.latencyMs} ms. O teste é feito pelo servidor, por isso não precisas de configurar CORS.`
                  : test.error ?? "Não foi possível alcançar o dashboard."}
              </span>
            </div>
          )}
          {snapshot && (
            <div
              className={`fade-in flex items-start gap-2 rounded-xl px-3 py-2.5 text-[11px] leading-relaxed ${
                snapshot.ok ? "bg-teal-soft text-teal-deep" : "bg-amber-soft text-amber"
              }`}
            >
              {snapshot.ok ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <span>
                {snapshot.ok
                  ? `${snapshot.count} tarefas enviadas para o teu dashboard em ${snapshot.latencyMs} ms.`
                  : snapshot.error ?? "Envio falhou."}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-[10.5px] text-ink-faint">
            <span>
              Testado {timeAgo(integration.lastTestedAt)} · sync {timeAgo(integration.lastSyncAt)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => save({ rotateKey: true })}
                className="press flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 font-semibold text-ink-soft hover:border-teal/40"
              >
                <RotateCw className="h-3 w-3" /> Nova chave
              </button>
              {linked && (
                <button
                  onClick={() => save({ unlink: true })}
                  className="press flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 font-semibold text-ink-soft hover:border-amber/40 hover:text-amber"
                >
                  <Unplug className="h-3 w-3" /> Desligar
                </button>
              )}
            </div>
          </div>

          {integration.lastError && (
            <p className="rounded-lg bg-amber-soft px-2.5 py-2 text-[10.5px] text-amber">
              Último erro: {integration.lastError}
            </p>
          )}
        </div>
      </SectionCard>

      {/* ── API DO NEXO ── */}
      <SectionCard
        title="API para o teu dashboard"
        icon={<ExternalLink className="h-4 w-4 text-teal" />}
        action={<CopyButton value={key} label="Copiar chave" />}
      >
        <div className="rounded-xl border border-teal/25 bg-teal-soft/40 p-3">
          <p className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-teal-deep">
            <KeyRound className="h-3 w-3" /> chave do Nexo
          </p>
          <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-ink">{key}</p>
        </div>
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink-soft">
          Dois sentidos possíveis — podes usar um ou ambos:
        </p>
        <ol className="mt-2 space-y-2 text-[11.5px] leading-relaxed text-ink-soft">
          <li>
            <strong className="text-ink">1. O teu dashboard chama o Nexo</strong> (leitura e
            criação de tarefas):
          </li>
        </ol>
        <div className="code-block mt-1.5">
          {`GET  ${origin}/api/v1/tasks
POST ${origin}/api/v1/tasks`}
          {"\n\n"}
          {`Authorization: Bearer ${key.slice(0, 22)}…`}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-[10px] text-ink-faint">exemplo · listar</span>
          <CopyButton value={curlTasks} label="Copiar curl" />
        </div>
        <div className="code-block mt-1.5">{curlTasks}</div>

        <ol className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-ink-soft">
          <li>
            <strong className="text-ink">2. O Nexo envia para o teu dashboard</strong> (webhook,
            quando ativas a sincronização):
          </li>
        </ol>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-mono text-[10px] text-ink-faint">payload recebido</span>
          <CopyButton value={webhookSnippet} label="Copiar exemplo" />
        </div>
        <div className="code-block mt-1.5">{`{
  "source": "nexo",
  "kind": "tasks.snapshot" | "task.created" | "task.updated" | "ai.reply",
  "detail": "texto legível",
  "data": { "title": "…", "status": "todo" },
  "tasks": [ … ],            // só no snapshot
  "sentAt": "2026-02-10T…"
}`}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-[10px] text-ink-faint">endpoint de exemplo</span>
          <CopyButton value={webhookSnippet} />
        </div>

        <p className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-paper px-2.5 py-2 text-[10.5px] leading-relaxed text-ink-faint">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
          Todas as chamadas para fora são feitas pelo servidor do Nexo; o teu dashboard não
          precisa de expor CORS. A chave pode ser regenerada a qualquer momento.
        </p>
      </SectionCard>

      {/* ── CHAVES DE IA ── */}
      <SectionCard
        title="Chaves das IAs (BYOK)"
        icon={<Plug className="h-4 w-4 text-teal" />}
        action={
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="press flex items-center gap-1 rounded-lg bg-teal-soft px-2.5 py-1.5 text-[11px] font-bold text-teal-deep hover:bg-teal hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" /> {showAdd ? "Fechar" : "Ligar IA"}
          </button>
        }
      >
        {showAdd && (
          <div className="slide-in mb-3 space-y-2.5 rounded-xl border border-teal/30 bg-teal-soft/30 p-3">
            <select
              value={pProvider}
              onChange={(e) => setPProvider(e.target.value as ProviderId)}
              className={`${inputCls} bg-white`}
            >
              <option value="google">Google · Gemini (tem tier gratuito)</option>
              <option value="openai">OpenAI · ChatGPT</option>
              <option value="anthropic">Anthropic · Claude</option>
            </select>
            <input
              value={pLabel}
              onChange={(e) => setPLabel(e.target.value)}
              placeholder={`Nome (${PROVIDER_META[pProvider].short})`}
              className={`${inputCls} bg-white text-[12px]`}
            />
            <input
              type="password"
              value={pKey}
              onChange={(e) => setPKey(e.target.value)}
              placeholder={`Chave · ${PROVIDER_META[pProvider].keyHint}`}
              className={`${inputCls} bg-white font-mono text-[12px]`}
              autoComplete="off"
            />
            <input
              value={pModel}
              onChange={(e) => setPModel(e.target.value)}
              placeholder={`Modelo (${PROVIDER_META[pProvider].defaultModel})`}
              className={`${inputCls} bg-white font-mono text-[11px]`}
            />
            <button
              onClick={async () => {
                if (!pKey.trim()) return;
                const ok = await onAddConnection({
                  provider: pProvider,
                  apiKey: pKey.trim(),
                  model: pModel.trim(),
                  label: pLabel.trim(),
                });
                if (ok) {
                  setPKey("");
                  setPModel("");
                  setPLabel("");
                  setShowAdd(false);
                  await onRefresh();
                }
              }}
              disabled={!pKey.trim()}
              className="press flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal py-2 text-[12px] font-bold text-white hover:bg-teal-deep disabled:opacity-40"
            >
              <KeyRound className="h-3.5 w-3.5" /> Guardar no servidor
            </button>
            <p className="text-[10px] leading-relaxed text-ink-faint">
              A chave nunca é devolvida à interface — só a máscara. O Gemini tem nível gratuito,
              por isso é a melhor opção para começar sem custos.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-teal/30 bg-teal-soft/40 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-paper text-ink-faint">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[12px] font-bold">Resposta local</p>
                <p className="font-mono text-[9.5px] text-ink-faint">não usa IA · sem chave</p>
              </div>
            </div>
            <span className="chip">off</span>
          </div>
          {conns.map((c) => {
            const m = providerMeta(c.provider);
            return (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-bold text-white"
                    style={{ background: m.color }}
                  >
                    {m.short.slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold">{c.label}</p>
                    <p className="truncate font-mono text-[9.5px] text-ink-faint">
                      {c.model} · {c.keyMask}
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await onRemoveConnection(c.id);
                    await onRefresh();
                  }}
                  className="press grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-faint hover:bg-amber-soft hover:text-amber"
                  aria-label="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          {conns.length === 0 && (
            <p className="border border-dashed border-line px-3 py-2.5 text-[11px] leading-relaxed text-ink-faint">
              Nenhuma IA ligada — as respostas são rascunhos locais, não IA. O tier gratuito do
              Gemini permite ligar uma IA real a custo zero.
            </p>
          )}
        </div>
      </SectionCard>

      <div className="flex items-start gap-2 rounded-xl border border-line bg-white/60 p-3 text-[10.5px] leading-relaxed text-ink-faint">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
        <p>
          Segurança: chaves de IA e chaves de integração ficam na base de dados do servidor e
          nunca no telemóvel em texto simples. Para produção, ativa encriptação em repouso e
          rotação periódica (ver secção 06 da especificação).
        </p>
      </div>
    </div>
  );
}