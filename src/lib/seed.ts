import { ensureSettings } from "@/lib/settings";

let ready = false;

/**
 * A app arranca POR OMISÃO VAZIA — sem tarefas, eventos ou conversas inventadas.
 * Só garante que as definições existem. Os dados exibidos são sempre reais:
 * criados por ti, pela tua API ou pelo teu dashboard.
 */
export async function ensureSeed() {
  if (ready) return;
  await ensureSettings();
  ready = true;
}