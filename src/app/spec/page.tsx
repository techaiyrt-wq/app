import Link from "next/link";
import {
  ArrowRight,
  Target,
  UserRound,
  CheckCircle2,
  Clock3,
  KeyRound,
  ShieldAlert,
  Ban,
  Smartphone,
  Server,
  RefreshCw,
  Database,
  Wallet,
  Scale,
  Lock,
  TrendingUp,
  Puzzle,
  BadgeCheck,
  Sparkles,
  Info,
  Layers,
  GitBranch,
} from "lucide-react";
import { getSettings, settingsView } from "@/lib/settings";
import { SiteNav } from "@/components/site-nav";
import { SpecInstallCta } from "@/components/spec-install-cta";
import { Reveal } from "@/components/reveal";
import { PhoneMock } from "@/components/phone-mock";
import { ArchDiagram } from "@/components/arch-diagram";

const SECTIONS = [
  { id: "problema", n: "01", label: "Problema & utilizador" },
  { id: "mvp", n: "02", label: "MVP vs. depois" },
  { id: "ligacoes", n: "03", label: "Ligação às IAs" },
  { id: "arquitetura", n: "04", label: "Arquitetura" },
  { id: "decisoes", n: "05", label: "Decisões-chave" },
  { id: "riscos", n: "06", label: "Riscos & mitigação" },
  { id: "gratis", n: "07", label: "Plano 100% gratuito" },
];

function SectionHeader({
  n,
  title,
  lead,
  id,
}: {
  n: string;
  title: string;
  lead: string;
  id: string;
}) {
  return (
    <Reveal>
      <div id={id} className="scroll-mt-24">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-teal">
          secção {n}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          {lead}
        </p>
      </div>
    </Reveal>
  );
}

const MVP_NOW = [
  ["Inbox unificada de tarefas", "Criar, editar e concluir tarefas num único sítio, com estado (a fazer / em curso com IA / concluída)."],
  ["Enviar tarefa à IA escolhida", "Um toque para pedir ao ChatGPT, Claude ou Gemini um rascunho, resumo ou plano — via API oficial."],
  ["Resultado guardado na tarefa", "Cada conversa e resultado ficam anexados à tarefa, com histórico completo e pesquisável."],
  ["Dashboard web sincronizado", "As mesmas tarefas, conversas e resultados no teu website — a demo neste site já faz isto."],
  ["Cofre de chaves (BYOK)", "Colas a tua chave de API uma vez; fica encriptada no servidor e nunca no telemóvel em texto simples."],
  ["Início de sessão simples", "Sign in with Apple no iPhone; a mesma conta no dashboard. Uma conta, dois ecrãs."],
];

const MVP_LATER = [
  ["Importar conversas das apps oficiais", "As apps ChatGPT/Claude/Gemini não expõem histórico por API — fica fora do MVP (ver secção 03)."],
  ["Sincronização em tempo real e offline-first", "WebSockets, notificações push (APNs) e resolução de conflitos automática."],
  ["Share Extension, Siri e widgets iOS", "Capturar tarefas a partir de qualquer app e ver o dia no ecrã bloqueado."],
  ["Automatizações e agentes", "Tarefas recorrentes que a IA executa sozinha com aprovação tua."],
  ["Multi-utilizador e equipas", "Partilha de tarefas, permissões e faturação."],
  ["Android e Apple Watch", "Só depois de o iOS estar validado."],
];

const PROVIDERS = [
  {
    name: "OpenAI · ChatGPT",
    color: "#10a37f",
    endpoint: "api.openai.com",
    free: "Sem nível gratuito (crédito inicial ocasional)",
    cost: "gpt-4o-mini ≈ 0,15 $ / 0,60 $ por 1M tokens (entrada/saída)",
    limit: "A subscrição ChatGPT Plus NÃO dá acesso à API — são produtos e faturas separados.",
  },
  {
    name: "Anthropic · Claude",
    color: "#d97757",
    endpoint: "api.anthropic.com",
    free: "Sem nível gratuito (crédito de teste no registo)",
    cost: "Claude Haiku ≈ 0,80 $ / 4 $ por 1M tokens — modelos pequenos chegam para tarefas",
    limit: "Claude Pro/Max também não inclui API. Sem histórico das conversas da app.",
  },
  {
    name: "Google · Gemini",
    color: "#4285f4",
    endpoint: "generativelanguage.googleapis.com",
    free: "✓ Nível gratuito real (AI Studio) com limites diários",
    cost: "0 € dentro dos limites; pago só se os ultrapassares",
    limit: "No nível gratuito os dados podem ser usados para melhorar os produtos — evita dados sensíveis.",
  },
];

const DECISIONS = [
  {
    icon: KeyRound,
    q: "Quem paga a IA: eu ou o utilizador?",
    opts: "A) BYOK — cada pessoa usa a própria chave · B) Tu revendes créditos com margem",
    rec: "A) BYOK no MVP. Custo zero para ti, sem faturação nem risco de contas gigantes. O Gemini gratuito cobre quem não quer pagar nada. Revenda fica para quando houver utilização real.",
  },
  {
    icon: Smartphone,
    q: "App nativa Swift ou multiplataforma?",
    opts: "A) SwiftUI nativo · B) React Native / Flutter",
    rec: "A) SwiftUI. Pediste iPhone, e o nativo dá Keychain, Sign in with Apple, widgets e Share Extension sem camadas intermédias. Menos código de cola, melhor sensação.",
  },
  {
    icon: Server,
    q: "Backend próprio ou serviço pronto (BaaS)?",
    opts: "A) API Next.js + Postgres (como esta demo) · B) Supabase/Firebase",
    rec: "A) Reutiliza o mesmo backend para o dashboard e para o iPhone. Uma API, uma base de dados, um sítio para as chaves. B) é alternativa válida se quiseres auth e sync «de pacote» sem escrever servidor.",
  },
  {
    icon: RefreshCw,
    q: "Sincronização: tempo real ou polling?",
    opts: "A) Polling + pull-to-refresh com cursor updatedAt · B) WebSockets + APNs já no MVP",
    rec: "A) Polling a cada 5–10 s. Para uso pessoal é imperceptível a diferença e é 10× mais simples. Esta demo usa exatamente essa estratégia. Tempo real na fase 2.",
  },
  {
    icon: Database,
    q: "Onde vive a «verdade» dos dados?",
    opts: "A) Servidor é a fonte de verdade; telemóvel guarda cache · B) Local-first com CRDTs",
    rec: "A) Servidor primeiro. Offline-total com CRDTs é um projeto em si. No MVP: cache local (SwiftData) para leitura e fila de reenvio quando volta a rede.",
  },
  {
    icon: Wallet,
    q: "Publicar já na App Store?",
    opts: "A) TestFlight / instalação direta durante a validação · B) App Store desde o dia 1",
    rec: "A) PWA instalável primeiro — já está feito: Safari → «Adicionar ao Ecrã Principal» e tens app com ícone, ecrã inteiro e atualizações automáticas, a 0 €. Só avanças para Swift/TestFlight quando precisares de Siri, widgets ou notificações avançadas (TestFlight exige 99 $/ano).",
  },
  {
    icon: Sparkles,
    q: "Como ligar o meu dashboard que já existe?",
    opts: "A) API + webhook do Nexo (bidirecional) · B) Reconstruir o dashboard de raiz",
    rec: "A) O Nexo expõe /api/v1/tasks e envia webhooks para o teu URL. O teste de ligação é feito pelo servidor, por isso não precisas de configurar CORS. Está operacional na secção «Ligações» da app.",
  },
];

const RISKS = [
  {
    icon: Scale,
    title: "Termos de uso das APIs",
    level: "Alto",
    levelColor: "bg-amber-soft text-amber",
    body: "Ler as apps de consumidor por «scraping» ou reutilizar sessões do ChatGPT/Claude viola os termos e pode banir contas.",
    fix: "Usar exclusivamente APIs oficiais com chaves próprias. Nunca prometer «liga a tua subscrição Plus» — isso não existe legalmente hoje.",
  },
  {
    icon: Lock,
    title: "Fuga de chaves de API",
    level: "Alto",
    levelColor: "bg-amber-soft text-amber",
    body: "Uma chave exposta no código do iPhone ou no browser pode ser roubada e gerar milhares de euros de consumo.",
    fix: "Chaves só no servidor, encriptadas em repouso (AES-256); no iPhone apenas no Keychain; mascarar sempre na UI (sk-…ab12); permitir revogar com um clique.",
  },
  {
    icon: TrendingUp,
    title: "Custos descontrolados",
    level: "Médio",
    levelColor: "bg-teal-soft text-teal-deep",
    body: "Um ciclo infinito de chamadas ou um documento enorme podem esgotar o orçamento de API num dia.",
    fix: "Limites diários por utilizador no backend, alerta a 80% do orçamento, modelos pequenos por defeito e limite de tokens por resposta (como nesta demo).",
  },
  {
    icon: ShieldAlert,
    title: "Privacidade e RGPD",
    level: "Médio",
    levelColor: "bg-teal-soft text-teal-deep",
    body: "Tarefas podem conter dados pessoais ou de clientes. No tier gratuito do Gemini os dados podem ser usados para treino.",
    fix: "Aviso claro por fornecedor, opção «não enviar dados sensíveis», apagamento total de conta/dados, e preferir tiers pagos (que por defeito não treinam com dados de API) para conteúdo sensível.",
  },
  {
    icon: Puzzle,
    title: "Dependência de fornecedores",
    level: "Médio",
    levelColor: "bg-teal-soft text-teal-deep",
    body: "Modelos são descontinuados, preços mudam, APIs ganham versões incompatíveis.",
    fix: "Camada de abstração única (como lib/ai.ts desta demo): trocar de modelo é mudar uma string. Modelo configurável por ligação, nunca fixo no código do cliente.",
  },
  {
    icon: BadgeCheck,
    title: "Revisão da App Store",
    level: "Baixo",
    levelColor: "bg-line/60 text-ink-soft",
    body: "Apps com IA e chaves de terceiros podem ser questionadas na revisão; resultados de IA exigem moderação.",
    fix: "BYOK é aceite; documentar o fluxo, declarar conteúdo gerado por IA, filtro básico de conteúdo e idade 17+ se necessário. TestFlight evita o problema durante a validação.",
  },
];

const FREE_STACK = [
  ["Dashboard + API", "Next.js no Vercel Hobby ou Cloudflare", "0 € — suficiente para uso pessoal"],
  ["Base de dados", "Postgres no Neon ou Supabase (free tier)", "0 € — centenas de MB, mais que chega"],
  ["IA", "Gemini API nível gratuito (AI Studio)", "0 € dentro dos limites diários"],
  ["App no iPhone (já disponível)", "PWA instalável: Safari → Adicionar ao Ecrã Principal", "0 € — ícone próprio, ecrã inteiro, atualização automática"],
  ["App nativa Swift (opcional)", "Xcode + conta Apple gratuita no teu aparelho", "0 € — perfil de 7 dias, reativar semanalmente"],
  ["Modo demo sem qualquer chave", "O que estás a ver neste site", "0 € — respostas simuladas, fluxo completo"],
  ["Publicar na App Store / TestFlight", "Apple Developer Program", "99 $/ano — único custo inevitável, e só quando quiseres publicar"],
];

export default async function SpecPage() {
  const theme = settingsView(await getSettings());
  return (
    <div
      className="min-h-screen bg-paper"
      data-accent={theme.accent}
      data-bg={theme.background}
      data-bg-vivid={theme.backgroundVivid ? "true" : "false"}
    >
      <SiteNav active="spec" />

      {/* ───────────────── HERO ───────────────── */}
      <section className="blueprint-dark relative overflow-hidden bg-night text-white">
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-teal/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber/10 blur-[100px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.25em] text-teal-soft">
              <Sparkles className="h-3.5 w-3.5 text-amber" />
              especificação de produto + demo funcional
            </p>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Todo o teu trabalho com IA.
              <br />
              <span className="text-teal-soft">Um iPhone.</span>{" "}
              <span className="text-amber">Um dashboard.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/75">
              O <strong className="text-white">Nexo</strong> é a especificação —
              e a prova — de um hub que junta ChatGPT, Claude e Gemini numa
              inbox de tarefas no iPhone, sincronizada com o teu website.
              Esta página é o documento de decisão; o dashboard ao lado é o
              produto a funcionar, com base de dados real.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-3 font-display text-sm font-semibold text-white transition-all hover:bg-teal-deep hover:shadow-[0_10px_30px_-8px_rgba(15,118,110,0.7)]"
              >
                Abrir a app
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {/* some quando a app já está instalada */}
              <SpecInstallCta />
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-widest text-white/50">
              <span>1 inbox unificada</span>
              <span>3 APIs oficiais</span>
              <span>2 ecrãs sincronizados</span>
              <span className="text-teal-soft">0 € para começar</span>
            </div>
          </div>
          <Reveal delay={150}>
            <PhoneMock />
          </Reveal>
        </div>

        {/* índice de secções */}
        <div className="relative border-t border-white/10">
          <div className="scroll-slim mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span className="font-mono text-[10px] text-teal-soft">{s.n}</span>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ───────────────── 01 PROBLEMA ───────────────── */}
        <section className="py-16 lg:py-20">
          <SectionHeader
            id="problema"
            n="01"
            title="O problema e quem o tem"
            lead="Em poucas frases, o que este produto resolve e para quem — o filtro para todas as decisões seguintes."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-line bg-card p-7 shadow-sm transition-shadow hover:shadow-md">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-soft text-teal-deep">
                  <Target className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold">O problema</h3>
                <p className="mt-3 leading-relaxed text-ink-soft">
                  Quem usa várias IAs vive com o trabalho{" "}
                  <strong className="text-ink">espalhado por três apps e vinte separadores</strong>:
                  o rascunho está no Claude, a análise no ChatGPT, o resumo no
                  Gemini — e nada disso está ligado à lista do que é preciso
                  fazer. Falta uma inbox única onde cada tarefa sabe{" "}
                  <em>qual IA a está a ajudar</em> e guarda o resultado,
                  acessível do telemóvel e do computador.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="h-full rounded-2xl border border-line bg-card p-7 shadow-sm transition-shadow hover:shadow-md">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-soft text-amber">
                  <UserRound className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold">
                  O utilizador principal
                </h3>
                <p className="mt-3 leading-relaxed text-ink-soft">
                  <strong className="text-ink">Tu próprio</strong> — um
                  profissional «power user» de IA, com iPhone, que já paga (ou
                  usa) pelo menos duas IAs e gere o seu trabalho entre
                  reuniões, telemóvel e secretária. Não é um produto de equipa
                  no início: é uma{" "}
                  <strong className="text-ink">ferramenta pessoal com dois ecrãs</strong>.
                  Isso simplifica tudo: uma conta, sem permissões, sem colaboração.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <div className="mt-5 flex gap-3 rounded-xl border border-teal/25 bg-teal-soft/50 p-5">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-teal-deep" />
              <div className="text-sm leading-relaxed text-ink-soft">
                <strong className="text-ink">Suposições declaradas</strong> (não
                definidas no pedido, escolhidas as opções mais razoáveis):
                produto pessoal e não comercial na v1; apenas iPhone (sem
                Android); inglês/português na interface; e «totalmente
                gratuito» interpretado como{" "}
                <strong className="text-ink">custo zero de construção e operação</strong>{" "}
                — a única exceção possível é a taxa da Apple para publicar,
                detalhada na secção 07.
              </div>
            </div>
          </Reveal>
        </section>

        {/* ───────────────── 02 MVP ───────────────── */}
        <section className="border-t border-line py-16 lg:py-20">
          <SectionHeader
            id="mvp"
            n="02"
            title="O que construir primeiro — e o que esperar"
            lead="A primeira versão cabe em 6 funcionalidades. Tudo o resto é deliberadamente adiado: cada item «para depois» tem um motivo."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border-2 border-teal/40 bg-card p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-teal-deep">
                    V1 · o núcleo
                  </h3>
                  <span className="rounded-full bg-teal px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white">
                    construir primeiro
                  </span>
                </div>
                <ul className="mt-5 space-y-4">
                  {MVP_NOW.map(([t, d]) => (
                    <li key={t} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
                      <div>
                        <p className="font-semibold text-ink">{t}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="h-full rounded-2xl border border-line bg-card p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-ink-faint">
                    V2+ · adiado de propósito
                  </h3>
                  <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                    depois
                  </span>
                </div>
                <ul className="mt-5 space-y-4">
                  {MVP_LATER.map(([t, d]) => (
                    <li key={t} className="flex gap-3">
                      <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-ink-faint" />
                      <div>
                        <p className="font-semibold text-ink">{t}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* fases */}
          <Reveal delay={120}>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Layers,
                  phase: "Fase 0 · semanas 1–2",
                  title: "Dashboard + API primeiro",
                  body: "Validar o fluxo completo na web (esta demo é a Fase 0 concluída): tarefas, chat com IA e sync. Sem iPhone, sem Xcode, custo 0 €.",
                },
                {
                  icon: Smartphone,
                  phase: "Fase 1 · semanas 3–8",
                  title: "iPhone MVP",
                  body: "App SwiftUI que fala com a mesma API: login Apple, inbox, enviar à IA, ver resultados. Instalar no teu aparelho com conta gratuita.",
                },
                {
                  icon: GitBranch,
                  phase: "Fase 2 · quando doer",
                  title: "Refinar a sync",
                  body: "Push (APNs), tempo real, offline-first e widgets — só depois de usares o produto diariamente e sentires a falta.",
                },
              ].map((p, i) => (
                <div
                  key={p.phase}
                  className="group relative rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="absolute right-5 top-5 font-display text-4xl font-extrabold text-line/80 transition-colors group-hover:text-teal-soft">
                    {i}
                  </span>
                  <p.icon className="h-6 w-6 text-teal" />
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                    {p.phase}
                  </p>
                  <h4 className="mt-1 font-display text-base font-bold">{p.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ───────────────── 03 LIGAÇÕES ───────────────── */}
        <section className="border-t border-line py-16 lg:py-20">
          <SectionHeader
            id="ligacoes"
            n="03"
            title="Como ligar às IAs — as opções reais"
            lead="A distinção mais importante de todo o documento: subscrição de consumidor (apps ChatGPT/Claude/Gemini) e API são produtos separados. Só a API é legalmente integrável."
          />

          <Reveal>
            <div className="mt-8 flex gap-3 rounded-xl border border-amber/40 bg-amber-soft p-5">
              <Ban className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
              <p className="text-sm leading-relaxed text-ink-soft">
                <strong className="text-ink">O que NÃO é possível:</strong> usar
                a tua subscrição ChatGPT Plus / Claude Pro dentro de outra app,
                ou importar automaticamente o histórico dessas apps. Não existe
                API para isso e contorná-lo (scraping, sessões partilhadas)
                viola os termos de serviço. O Nexo liga-se às{" "}
                <strong className="text-ink">APIs oficiais</strong> — o mesmo
                motor, faturado à parte (ou grátis, no caso do Gemini).
              </p>
            </div>
          </Reveal>

          {/* tabela de fornecedores */}
          <Reveal delay={80}>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card shadow-sm">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper/70 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    <th className="px-5 py-3.5">Fornecedor</th>
                    <th className="px-5 py-3.5">Nível gratuito</th>
                    <th className="px-5 py-3.5">Custo indicativo (API)</th>
                    <th className="px-5 py-3.5">Limitação principal</th>
                  </tr>
                </thead>
                <tbody>
                  {PROVIDERS.map((p) => (
                    <tr key={p.name} className="border-b border-line/60 align-top transition-colors last:border-0 hover:bg-paper/50">
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 font-semibold text-ink">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                          {p.name}
                        </span>
                        <span className="mt-1 block font-mono text-[11px] text-ink-faint">{p.endpoint}</span>
                      </td>
                      <td className="px-5 py-4 text-ink-soft">{p.free}</td>
                      <td className="px-5 py-4 text-ink-soft">{p.cost}</td>
                      <td className="px-5 py-4 text-ink-soft">{p.limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <p className="mt-2 font-mono text-[11px] text-ink-faint">
            * preços públicos aproximados, mudam com frequência — confirmar na página de preços de cada fornecedor antes de decidir.
          </p>

          {/* três caminhos */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: KeyRound,
                tag: "recomendado",
                tagCls: "bg-teal text-white",
                title: "BYOK — a tua chave de API",
                body: "Crias uma chave no painel do fornecedor, colas no Nexo uma vez. Pagas só o que consomes (ou nada, no Gemini grátis). Privacidade: nos tiers pagos, OpenAI e Anthropic não treinam com dados de API por defeito; retenção curta para abuso (~30 dias).",
              },
              {
                icon: Wallet,
                tag: "fase 2",
                tagCls: "border border-line text-ink-faint",
                title: "Créditos geridos pelo Nexo",
                body: "Tu compras API a granel e revendes com margem; o utilizador não vê chaves. Melhor experiência, mas exige faturação, contabilidade de tokens e assume o risco de custo. Só faz sentido com utilização validada.",
              },
              {
                icon: Ban,
                tag: "nunca",
                tagCls: "bg-amber text-white",
                title: "Sessões das apps de consumidor",
                body: "Reutilizar logins do ChatGPT/Claude ou fazer scraping das apps viola os termos, quebra sem aviso e pode banir as tuas contas. Nenhuma versão do produto deve seguir este caminho.",
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 90}>
                <div className="h-full rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <c.icon className="h-5 w-5 text-teal" />
                    <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${c.tagCls}`}>
                      {c.tag}
                    </span>
                  </div>
                  <h4 className="mt-3 font-display text-base font-bold">{c.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────────────── 04 ARQUITETURA ───────────────── */}
        <section className="border-t border-line py-16 lg:py-20">
          <SectionHeader
            id="arquitetura"
            n="04"
            title="Arquitetura: um cérebro, dois ecrãs"
            lead="O iPhone e o dashboard nunca falam diretamente com as IAs nem entre si. Tudo passa pelo backend — é isso que torna a sincronização e a segurança simples."
          />
          <Reveal>
            <div className="blueprint mt-8 rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-8">
              <ArchDiagram />
            </div>
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                icon: Lock,
                title: "Autenticação",
                body: "Sign in with Apple no iPhone (rápido, privado, sem passwords). O backend troca o token Apple por uma sessão JWT própria; o dashboard usa o mesmo mecanismo via magic link por e-mail. Uma identidade, dois dispositivos.",
              },
              {
                icon: RefreshCw,
                title: "Sincronização",
                body: "O servidor é a fonte de verdade. Cada cliente pede «o que mudou desde o meu último cursor (updatedAt)» a cada 5–10 s e no pull-to-refresh. Escritas offline entram numa fila e reenviam-se quando há rede. Esta demo faz polling real a cada 5 s.",
              },
              {
                icon: KeyRound,
                title: "Cofre de chaves",
                body: "As chaves de API vivem encriptadas na base de dados do servidor. O iPhone e o browser nunca as recebem de volta — só uma máscara (sk-…x9f2). Todas as chamadas às IAs partem do backend, que aplica limites de custo.",
              },
              {
                icon: Database,
                title: "Modelo de dados",
                body: "Quatro tabelas chegam para o MVP: tarefas, ligações (chaves), mensagens (histórico por tarefa) e eventos (feed de sincronização). É exatamente o schema que está a correr nesta demo, em PostgreSQL.",
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <div className="flex h-full gap-4 rounded-2xl border border-line bg-card p-6 transition-shadow hover:shadow-md">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-soft text-teal-deep">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-display text-base font-bold">{c.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────────────── 05 DECISÕES ───────────────── */}
        <section className="border-t border-line py-16 lg:py-20">
          <SectionHeader
            id="decisoes"
            n="05"
            title="As 6 decisões que tens de tomar"
            lead="Cada cartão apresenta a pergunta, as opções realistas e a recomendação — com o porquê em linguagem direta."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {DECISIONS.map((d, i) => (
              <Reveal key={d.q} delay={(i % 2) * 80}>
                <div className="group h-full rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-teal-soft transition-colors group-hover:bg-teal group-hover:text-white">
                      <d.icon className="h-5 w-5" />
                    </span>
                    <h4 className="font-display text-[15px] font-bold leading-snug">{d.q}</h4>
                  </div>
                  <p className="mt-4 rounded-lg bg-paper px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-soft">
                    {d.opts}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    <span className="mr-1.5 rounded bg-teal-soft px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-teal-deep">
                      recomendação
                    </span>
                    {d.rec}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────────────── 06 RISCOS ───────────────── */}
        <section className="border-t border-line py-16 lg:py-20">
          <SectionHeader
            id="riscos"
            n="06"
            title="Riscos e como os desarmar"
            lead="Ordenados por gravidade. Nenhum é impeditivo — todos têm uma mitigação concreta e barata."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {RISKS.map((r, i) => (
              <Reveal key={r.title} delay={(i % 3) * 80}>
                <div className="h-full rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <r.icon className="h-5 w-5 text-ink-soft" />
                    <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${r.levelColor}`}>
                      {r.level}
                    </span>
                  </div>
                  <h4 className="mt-3 font-display text-base font-bold">{r.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.body}</p>
                  <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-ink">
                    <span className="font-semibold text-teal-deep">Mitigação: </span>
                    {r.fix}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────────────── 07 GRÁTIS ───────────────── */}
        <section className="border-t border-line py-16 lg:py-20">
          <SectionHeader
            id="gratis"
            n="07"
            title="O plano totalmente gratuito"
            lead="Pediste custo zero. É alcançável para construir, usar e validar — com uma única exceção honesta no fim da tabela."
          />
          <Reveal>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-card shadow-sm">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper/70 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    <th className="px-5 py-3.5">Componente</th>
                    <th className="px-5 py-3.5">Opção gratuita</th>
                    <th className="px-5 py-3.5">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {FREE_STACK.map(([a, b, c]) => (
                    <tr key={a} className="border-b border-line/60 transition-colors last:border-0 hover:bg-paper/50">
                      <td className="px-5 py-4 font-semibold text-ink">{a}</td>
                      <td className="px-5 py-4 text-ink-soft">{b}</td>
                      <td className={`px-5 py-4 ${c.startsWith("0 €") ? "font-medium text-teal-deep" : "text-amber"}`}>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="blueprint-dark relative mt-10 overflow-hidden rounded-2xl bg-night p-8 text-white sm:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal/25 blur-[90px]" />
              <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-teal-soft">
                    a especificação a funcionar
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                    A Fase 0 já está construída — experimenta.
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/75">
                    O dashboard desta demo tem tarefas em PostgreSQL, chat local (ou as tuas chaves reais de OpenAI,
                    Claude e Gemini, guardadas só no servidor), simulação de
                    criação no iPhone e um feed de sincronização ao vivo.
                  </p>
                </div>
                <Link
                  href="/"
                  className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber px-6 py-3.5 font-display text-sm font-bold text-white transition-all hover:brightness-110 hover:shadow-[0_10px_30px_-8px_rgba(217,119,6,0.7)]"
                >
                  Abrir a app
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-8 text-sm text-ink-faint sm:flex-row sm:items-center sm:px-6">
          <p>
            <span className="font-display font-bold text-ink">Nexo</span> ·
            especificação de produto v1.0 · documento vivo — atualizar após cada fase
          </p>
          <p className="font-mono text-[11px] uppercase tracking-widest">
            iPhone ⇄ API ⇄ Dashboard · PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}