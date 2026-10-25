"use client";

import { useEffect, useRef, useState } from "react";
import {
  Share2,
  Plus,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  Wallet,
  ExternalLink,
  QrCode,
  Globe,
  AlertTriangle,
  Rocket,
  Loader2,
  Trash2,
} from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { QrCodeView } from "./qr-code";
import { useInstallState } from "./use-installed";
import { SectionCard, CopyButton } from "./ui";

const STEPS = [
  {
    n: "1",
    title: "Abre o link no Safari",
    body: "No teu iPhone, o link tem de abrir no Safari (navegador padrão da Apple). Se o abrires dentro do WhatsApp, Instagram ou LinkedIn, toca nos três pontinhos «•••» e escolhe «Abrir no Safari».",
    icon: <Smartphone className="h-4 w-4 text-teal" />,
  },
  {
    n: "2",
    title: "Toca em Partilhar no Safari",
    body: "Na barra de baixo do Safari, toca no ícone de Partilhar (o quadrado azul com a seta a apontar para cima).",
    icon: <Share2 className="h-4 w-4 text-teal" />,
  },
  {
    n: "3",
    title: "Escolhe «Adicionar ao Ecrã Principal»",
    body: "Desliza a lista de ações até encontrares «Adicionar ao Ecrã Principal» e toca em «Adicionar». O ícone do Nexo surge no ecrã do teu telemóvel e abre como um app em ecrã inteiro.",
    icon: <Plus className="h-4 w-4 text-teal" />,
  },
];

function normalizePublicUrl(raw: string): string {
  const t = raw.trim().replace(/\/+$/, "");
  if (!t) return "";
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

function isEphemeralHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h.includes("e2b.app") ||
    h.includes("arena") ||
    h === "localhost" ||
    h.startsWith("127.") ||
    h.startsWith("192.168.") ||
    h.startsWith("10.") ||
    h.endsWith(".local") ||
    h.includes("preview") ||
    /^3000-/.test(h)
  );
}

export function GuidePanel({
  onClose,
  isModal = false,
  productionUrl = "",
  onSaveProductionUrl,
  savingProductionUrl = false,
}: {
  onClose?: () => void;
  isModal?: boolean;
  productionUrl?: string;
  onSaveProductionUrl?: (url: string) => Promise<void>;
  savingProductionUrl?: boolean;
}) {
  const [originUrl, setOriginUrl] = useState<string>("");
  const [hostname, setHostname] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(true);
  const [installed, setInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [prodInput, setProdInput] = useState<string>(productionUrl);
  const [prodError, setProdError] = useState<string>("");
  const [prodOk, setProdOk] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { installed: standalone, ready } = useInstallState();

  useEffect(() => {
    setProdInput(productionUrl);
  }, [productionUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOriginUrl(window.location.origin);
    setHostname(window.location.hostname);
    setIsIos(/iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const cleanProduction = normalizePublicUrl(productionUrl);
  const usingProduction = cleanProduction !== "";
  const ephemeral = hostname ? isEphemeralHost(hostname) : false;
  // O link que o QR e o copiar usam: permanente se definido, senão o atual
  const effectiveUrl = usingProduction ? cleanProduction : originUrl;
  const showTempWarning = !usingProduction && ephemeral;

  async function handleCopy() {
    const targetUrl = effectiveUrl || (typeof window !== "undefined" ? window.location.origin : "");
    if (!targetUrl) return;
    const ok = await copyToClipboard(targetUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    }
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }

  async function handleShare() {
    const targetUrl = effectiveUrl || (typeof window !== "undefined" ? window.location.origin : "");
    if (!targetUrl) return;
    await copyToClipboard(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3500);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Nexo — tarefas com IA",
          text: "Abre este link no Safari do iPhone para instalar o app:",
          url: targetUrl,
        });
      } catch {
        /* cancelado — o link já foi copiado */
      }
    }
  }

  async function handleSaveProduction() {
    setProdError("");
    setProdOk("");
    const clean = normalizePublicUrl(prodInput);
    if (prodInput.trim() !== "" && !clean) {
      setProdError("Esse endereço não parece válido. Exemplo: a-minha-app.vercel.app");
      return;
    }
    if (!onSaveProductionUrl) return;
    await onSaveProductionUrl(clean);
    setProdOk(
      clean
        ? "URL permanente guardado. O QR e o botão copiar usam agora este endereço."
        : "URL permanente removido. O QR volta a usar o endereço atual."
    );
    setTimeout(() => setProdOk(""), 4000);
  }

  return (
    <div className="space-y-4 text-ink">
      {!isModal && (
        <div>
          <h2 className="font-display text-lg font-extrabold tracking-tight">
            {standalone ? "Partilhar a app" : "Instalar no iPhone"}
          </h2>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            {standalone
              ? "Usa o link ou o QR para instalar noutro iPhone — aqui já está instalada."
              : "Ecrã inteiro, ícone próprio e sem App Store — 0 €."}
          </p>
        </div>
      )}

      {ready && standalone && (
        <div className="fade-in flex items-center gap-2 rounded-xl border border-teal/30 bg-teal-soft p-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-deep" />
          <p className="text-[12px] font-semibold text-teal-deep">
            Estás a usar a versão instalada no ecrã principal. Ecrã inteiro e sincronização ativos!
          </p>
        </div>
      )}

      {/* ── AVISO DE LINK TEMPORÁRIO ── */}
      {showTempWarning && (
        <div className="fade-in flex items-start gap-2.5 rounded-xl border border-amber/40 bg-amber-soft p-3.5">
          <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber" />
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-ink">
              Este link é temporário — só abre dentro do Arena
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
              Estás em <span className="font-mono text-[10.5px] font-semibold">{hostname || "ambiente de testes"}</span>,
              um endereço de teste que muda e morre fora daqui. É por isso que ao colar noutra aba
              aparece que a preview só funciona no Arena. Para um link que funcione em qualquer
              lado, publica a app (grátis, 15 min) e cola abaixo o endereço permanente.
            </p>
          </div>
        </div>
      )}

      {usingProduction && (
        <div className="fade-in flex items-start gap-2.5 rounded-xl border border-teal/40 bg-teal-soft/60 p-3.5">
          <Globe className="mt-0.5 h-4.5 w-4.5 shrink-0 text-teal-deep" />
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-teal-deep">
              Link permanente ativo
            </p>
            <p className="mt-1 break-all font-mono text-[11px] text-ink">{cleanProduction}</p>
            <p className="mt-1 text-[11px] text-ink-soft">
              O QR e o botão copiar usam este endereço — funciona fora do Arena, no iPhone de
              qualquer pessoa.
            </p>
          </div>
        </div>
      )}

      {/* Caixa de Ação Rápida: Copiar e Partilhar */}
      <div className="surface overflow-hidden border-2 border-teal/40">
        <div className="bg-night p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="micro text-teal-soft">link de instalação</span>
              <h3 className="mt-1 font-display text-lg font-bold">
                Como passar o app para o iPhone
              </h3>
              <p className="mt-1 text-xs text-white/70">
                {usingProduction
                  ? "A usar o teu endereço permanente. Copia ou aponta a câmara ao QR."
                  : "Copia o link abaixo e cola no WhatsApp/Notas para abrir no teu iPhone, ou aponta a câmara para o código QR."}
              </p>
            </div>
            <button
              onClick={() => setShowQr((v) => !v)}
              className="press flex shrink-0 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-teal-soft hover:bg-white/20"
              title="Alternar código QR"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>{showQr ? "Ocultar QR" : "Ver QR"}</span>
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                readOnly
                value={effectiveUrl || "A carregar link…"}
                onClick={(e) => {
                  e.currentTarget.select();
                  handleCopy();
                }}
                className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 font-mono text-[12px] text-white outline-none selection:bg-teal selection:text-white"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="press flex shrink-0 items-center gap-1.5 rounded-xl bg-teal px-4 py-2.5 text-[12.5px] font-bold text-white shadow-md hover:bg-teal-deep"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copiado!" : "Copiar Link"}</span>
              </button>
            </div>

            {copied && (
              <div className="slide-in flex items-center gap-2 rounded-lg bg-teal-soft/90 px-3 py-2 text-[11.5px] font-semibold text-teal-deep">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" />
                <span>Link copiado! Já podes colar onde quiseres (WhatsApp, Notas, Safari...).</span>
              </div>
            )}
            {!usingProduction && originUrl && (
              <p className="font-mono text-[10px] text-white/50">
                a usar endereço atual: {originUrl}
              </p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="press flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-white/20"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Partilhar link</span>
            </button>
            <a
              href={effectiveUrl || "/"}
              target="_blank"
              rel="noopener noreferrer"
              className="press flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white/90 hover:bg-white/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Abrir numa nova aba</span>
            </a>
          </div>
        </div>

        {showQr && (
          <div className="border-t border-line bg-paper/60 p-4">
            <div className="flex flex-wrap items-start justify-center gap-4 sm:flex-nowrap sm:justify-start">
              <QrCodeView url={effectiveUrl} />
              <div className="min-w-0 flex-1">
                <span className="micro text-teal">o método mais rápido</span>
                <p className="mt-1 font-display text-[13px] font-bold">
                  Aponta a câmara do teu iPhone
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                  Abre a app <strong>Câmara</strong> do iPhone e aponta para o código.
                  Toca no aviso do <strong>Safari</strong> para abrir logo no telemóvel,
                  sem colar nada.
                  {usingProduction
                    ? " Este QR aponta para o teu endereço permanente."
                    : " Atenção: este QR aponta para o endereço de teste — só abre dentro do Arena."}
                </p>
                {effectiveUrl && (
                  <p className="mt-2 break-all rounded-md border border-line bg-white px-2 py-1.5 font-mono text-[10px] text-ink-soft">
                    {effectiveUrl}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── URL PERMANENTE ── */}
      <div className="surface space-y-3 p-4">
        <div className="flex items-start gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-soft text-teal-deep">
            <Globe className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-[13.5px] font-bold">Endereço permanente da app</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft">
              Depois de publicares (secção abaixo), cola aqui o endereço final — ex.{" "}
              <span className="font-mono text-[10.5px]">a-minha-app.vercel.app</span>. O QR, o
              copiar e a partilha passam a usar esse endereço em todo o lado.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={prodInput}
            onChange={(e) => setProdInput(e.target.value)}
            placeholder="a-minha-app.vercel.app"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono text-[12px] outline-none placeholder:text-ink-faint focus:border-teal focus:bg-white"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveProduction}
              disabled={savingProductionUrl}
              className="press flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-[12px] font-bold text-white hover:bg-teal-deep disabled:opacity-50 sm:flex-none"
            >
              {savingProductionUrl ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>Guardar</span>
            </button>
            {cleanProduction && (
              <button
                type="button"
                onClick={() => {
                  setProdInput("");
                  onSaveProductionUrl?.("");
                }}
                disabled={savingProductionUrl}
                className="press grid h-[42px] w-[42px] place-items-center rounded-xl border border-line text-ink-faint hover:border-amber hover:text-amber disabled:opacity-50"
                title="Remover endereço permanente"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {prodError && (
          <p className="rounded-lg bg-amber-soft px-3 py-2 text-[11.5px] font-medium text-amber">
            {prodError}
          </p>
        )}
        {prodOk && (
          <p className="fade-in rounded-lg bg-teal-soft px-3 py-2 text-[11.5px] font-medium text-teal-deep">
            {prodOk}
          </p>
        )}
      </div>

      {/* ── PUBLICAR (LINK PERMANENTE) ── */}
      <SectionCard
        title="Tornar o link permanente (fora do Arena)"
        icon={<Rocket className="h-4 w-4 text-teal" />}
      >
        <ol className="space-y-3 text-[11.5px] leading-relaxed text-ink-soft">
          <li className="flex gap-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-ink font-display text-[11px] font-bold text-white">1</span>
            <div>
              <p className="font-bold text-ink">Põe o código no GitHub (grátis)</p>
              <p>No terminal, dentro da pasta do projeto:</p>
              <div className="code-block mt-1.5">{"git init && git add . && git commit -m \"nexo\"\ngit branch -M main\ngit remote add origin https://github.com/O-TEU-USER/nexo.git\ngit push -u origin main"}</div>
              <div className="mt-1.5"><CopyButton value={'git init && git add . && git commit -m "nexo"\ngit branch -M main\ngit remote add origin https://github.com/O-TEU-USER/nexo.git\ngit push -u origin main'} label="Copiar comandos" /></div>
            </div>
          </li>
          <li className="flex gap-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-ink font-display text-[11px] font-bold text-white">2</span>
            <div>
              <p className="font-bold text-ink">Cria a base de dados (Neon, grátis)</p>
              <p>
                Em <span className="font-mono text-[10.5px]">neon.tech</span> cria um projeto Postgres
                gratuito e copia a <span className="font-mono text-[10.5px]">DATABASE_URL</span>.
                A app cria as tabelas sozinha no primeiro arranque.
              </p>
            </div>
          </li>
          <li className="flex gap-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-ink font-display text-[11px] font-bold text-white">3</span>
            <div>
              <p className="font-bold text-ink">Publica na Vercel (grátis)</p>
              <p>
                Em <span className="font-mono text-[10.5px]">vercel.com → Add New → Project</span>,
                importa o repositório do passo 1. Em <em>Environment Variables</em> adiciona:
              </p>
              <div className="code-block mt-1.5">{"DATABASE_URL=postgresql://... (a do Neon)"}</div>
              <p className="mt-1">
                Faz <strong>Deploy</strong>. Recebes um endereço tipo{" "}
                <span className="font-mono text-[10.5px]">a-minha-app.vercel.app</span> — esse é o
                teu link permanente, que abre em qualquer aba, qualquer iPhone, sem Arena.
              </p>
            </div>
          </li>
          <li className="flex gap-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-ink font-display text-[11px] font-bold text-white">4</span>
            <div>
              <p className="font-bold text-ink">Liga o endereço permanente aqui</p>
              <p>
                Cola esse endereço no campo «Endereço permanente» acima e guarda. A partir daí o
                QR e o copiar usam sempre esse URL — podes partilhar à vontade.
              </p>
            </div>
          </li>
        </ol>
        <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-[10.5px] leading-relaxed text-ink-faint">
          Porquê isto? O endereço do Arena é uma máquina de testes temporária: muda a cada sessão
          e só responde dentro do Arena. Uma app instalável precisa de um endereço público fixo —
          a Vercel + Neon têm planos gratuitos que chegam para uso pessoal.
        </p>
      </SectionCard>

      {/* Passo a passo: desaparece quando a app já está instalada */}
      {(!ready || !standalone) && (
      <div className="surface overflow-hidden">
        <div className="border-b border-line bg-card p-4">
          <p className="font-display text-[13.5px] font-bold">
            Passo a passo no iPhone (Safari)
          </p>
          <p className="text-[11px] text-ink-faint">
            Leva apenas 20 segundos e só precisas de fazer uma vez.
          </p>
        </div>

        <div className="divide-y divide-line">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-3.5 p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-soft font-display text-sm font-extrabold text-teal-deep">
                {s.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-bold">
                  {s.icon}
                  <span>{s.title}</span>
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-line bg-paper/40 p-4">
          <label className="flex items-center gap-2.5 text-[12px] font-medium text-ink-soft">
            <input
              type="checkbox"
              checked={installed}
              onChange={(e) => setInstalled(e.target.checked)}
              className="h-4 w-4 rounded accent-[#14615a]"
            />
            <span>Já adicionei o Nexo ao ecrã principal do meu iPhone</span>
          </label>
          {installed && (
            <p className="fade-in mt-2.5 flex items-center gap-1.5 rounded-lg bg-teal-soft p-2.5 text-[11.5px] font-medium text-teal-deep">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" />
              <span>Excelente! Agora fecha esta janela e abre pelo ícone no teu iPhone. Vai abrir em ecrã inteiro como qualquer app nativo.</span>
            </p>
          )}
        </div>
      </div>
      )}

      {/* Informações de custos e funcionamento */}
      <SectionCard
        title="Porque funciona e é 100% gratuito"
        icon={<Wallet className="h-4 w-4 text-teal" />}
      >
        <div className="space-y-2 text-[11.5px] leading-relaxed text-ink-soft">
          <p>
            O iPhone suporta nativamente <strong>PWA (Progressive Web Apps)</strong> através do Safari. Quando adicionas ao ecrã principal:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-1 text-[11px]">
            <li>Abre em <strong>ecrã inteiro</strong>, sem barra de endereços do browser.</li>
            <li>Fica com o <strong>ícone próprio do Nexo</strong> no ecrã de início.</li>
            <li>Não precisa de aprovação na App Store nem de pagar a taxa de 99 $/ano da Apple.</li>
            <li>Atualiza-se automaticamente sempre que novas funcionalidades são publicadas.</li>
          </ul>
        </div>
      </SectionCard>

      {!isIos && (
        <p className="text-center text-[11px] leading-relaxed text-ink-faint">
          Dica: Se estás no computador, o mais simples é <strong>apontar a câmara do iPhone ao código QR</strong> acima. Abre logo o Safari no telemóvel!
        </p>
      )}
    </div>
  );
}
