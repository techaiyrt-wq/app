import type { Message } from "@/db/schema";

import { PROVIDER_META, type ProviderId } from "@/lib/providers";
export { PROVIDER_META };
export type { ProviderId };

const BASE_PROMPT =
  "És o assistente do Nexo, um hub de tarefas com IA. Responde sempre em português europeu, " +
  "de forma prática e acionável, com listas curtas quando útil. O utilizador está a trabalhar numa tarefa.";

/** System prompt = base + instruções personalizadas do utilizador (definições). */
export function buildSystemPrompt(custom?: string): string {
  const extra = (custom ?? "").trim();
  return extra ? `${BASE_PROMPT}\n\nInstruções do utilizador:\n${extra}` : BASE_PROMPT;
}

export type ChatTurn = Pick<Message, "role" | "content">;

export type CallOptions = {
  provider: ProviderId;
  apiKey: string;
  model: string;
  history: ChatTurn[];
  systemExtra?: string;
};

/** Chama a API oficial do fornecedor escolhido. Corre apenas no servidor. */
export async function callProvider(opts: CallOptions): Promise<string> {
  const { provider, apiKey, model, history } = opts;
  const systemPrompt = buildSystemPrompt(opts.systemExtra);

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 800,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "(resposta vazia)";
  }

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 800,
        system: systemPrompt,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) throw new Error(`Anthropic: ${res.status} ${await res.text()}`);
    const data = await res.json();
    const block = Array.isArray(data.content)
      ? data.content.find((b: { type: string }) => b.type === "text")
      : null;
    return block?.text ?? "(resposta vazia)";
  }

  if (provider === "google") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: 800 },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("") ?? "(resposta vazia)"
    );
  }

  throw new Error("Fornecedor desconhecido");
}

/** Resposta simulada, determinística e gratuita — para demonstrar o fluxo completo sem chaves. */
export function demoReply(prompt: string, taskTitle?: string): string {
  const t = prompt.toLowerCase();
  const title = taskTitle ?? "a tua tarefa";

  if (t.includes("email") || t.includes("e-mail")) {
    return [
      `✉️ Rascunho de e-mail para «${title}»:`,
      "",
      "Assunto: Ponto de situação e próximos passos",
      "",
      "Olá,",
      "",
      `Espero que esteja tudo bem. Escrevo para dar seguimento a ${title.toLowerCase()}. Do meu lado, o essencial está encaminhado e proponho fecharmos os detalhes esta semana.`,
      "",
      "Podes confirmar a tua disponibilidade para uma chamada de 15 minutos?",
      "",
      "Obrigado e um abraço.",
      "",
      "— Rascunho local do Nexo. Liga uma chave de IA em Ligações para respostas reais do teu modelo.",
    ].join("\n");
  }

  if (t.includes("resum") || t.includes("sintetiza")) {
    return [
      `📋 Resumo estruturado de «${title}»:`,
      "",
      "• Contexto: o pedido foi registado na inbox unificada do Nexo.",
      "• Essencial: definir o resultado esperado e o prazo antes de delegar à IA.",
      "• Próximo passo: pedir à IA um primeiro rascunho e revê-lo no dashboard.",
      "",
      "— Rascunho local do Nexo. Liga uma chave de IA em Ligações para respostas reais do teu modelo.",
    ].join("\n");
  }

  return [
    `🧭 Plano de ação para «${title}»:`,
    "",
    "1. Clarificar o resultado — escreve numa frase o que é «feito».",
    "2. Dividir em 2–3 subtarefas que a IA possa executar isoladamente.",
    "3. Escolher o modelo certo: rascunhos rápidos → modelo pequeno; análise profunda → modelo grande.",
    "4. Rever o resultado no dashboard e marcar a tarefa como concluída.",
    "",
    `Sobre o teu pedido («${prompt.slice(0, 120)}»):`,
    "",
    "— Rascunho local do Nexo (sem IA). Liga uma chave de IA em Ligações.",
  ].join("\n");
}