export type ProviderId = "openai" | "anthropic" | "google" | "demo";

export const PROVIDER_META: Record<
  ProviderId,
  { name: string; short: string; defaultModel: string; keyHint: string; color: string; free: boolean }
> = {
  demo: {
    name: "Resposta local (sem IA)",
    short: "Local",
    defaultModel: "local",
    keyHint: "sem chave",
    color: "#6b7280",
    free: true,
  },
  openai: {
    name: "OpenAI · ChatGPT",
    short: "ChatGPT",
    defaultModel: "gpt-4o-mini",
    keyHint: "sk-…",
    color: "#10a37f",
    free: false,
  },
  anthropic: {
    name: "Anthropic · Claude",
    short: "Claude",
    defaultModel: "claude-3-5-haiku-latest",
    keyHint: "sk-ant-…",
    color: "#d97757",
    free: false,
  },
  google: {
    name: "Google · Gemini",
    short: "Gemini",
    defaultModel: "gemini-2.0-flash",
    keyHint: "AIza…",
    color: "#4285f4",
    free: true,
  },
};

export function providerMeta(id: string) {
  return PROVIDER_META[(id as ProviderId) in PROVIDER_META ? (id as ProviderId) : "demo"];
}
