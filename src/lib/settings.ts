import { db } from "@/db";
import { settings, type Settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SettingsPatch = Partial<{
  displayName: string;
  workspaceName: string;
  accent: string;
  background: string;
  backgroundVivid: boolean;
  density: string;
  defaultProvider: string;
  instructions: string;
  pollInterval: number;
  productionUrl: string;
}>;

export const ACCENTS = ["verde", "azul", "ameixa", "oliva", "terracota", "grafite"] as const;
export const BACKGROUNDS = [
  "paper", "snow", "linen", "sage", "mist", "clay", "ink",
  "blush", "lavender", "sky", "mint", "butter", "coral", "ocean",
  "lilac", "sand", "rose", "ice", "peach",
] as const;

/** ids antigos → novos, para não perder preferências já guardadas */
const LEGACY: Record<string, string> = {
  teal: "verde",
  blue: "azul",
  plum: "ameixa",
  moss: "oliva",
};
const normalizeAccent = (v: string) => LEGACY[v] ?? v;
const DENSITIES = ["normal", "compact"];
const PROVIDERS = ["demo", "openai", "anthropic", "google"];

/** Garante que existe exatamente uma linha de definições (id=1). */
export async function ensureSettings(): Promise<Settings> {
  const rows = await db.select().from(settings);
  if (rows[0]) {
    const fixed = normalizeAccent(rows[0].accent);
    if (fixed !== rows[0].accent) {
      const [updated] = await db
        .update(settings)
        .set({ accent: fixed })
        .where(eq(settings.id, rows[0].id))
        .returning();
      return updated;
    }
    return rows[0];
  }
  const [created] = await db.insert(settings).values({}).returning();
  return created;
}

export async function getSettings(): Promise<Settings> {
  return ensureSettings();
}

export async function updateSettings(patch: SettingsPatch): Promise<Settings> {
  const current = await ensureSettings();
  const clean: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof patch.displayName === "string")
    clean.displayName = patch.displayName.slice(0, 60);
  if (typeof patch.workspaceName === "string" && patch.workspaceName.trim())
    clean.workspaceName = patch.workspaceName.trim().slice(0, 40);
  if (typeof patch.accent === "string") {
    const a = normalizeAccent(patch.accent);
    if ((ACCENTS as readonly string[]).includes(a)) clean.accent = a;
  }
  if (typeof patch.background === "string" && (BACKGROUNDS as readonly string[]).includes(patch.background))
    clean.background = patch.background;
  if (typeof patch.backgroundVivid === "boolean")
    clean.backgroundVivid = patch.backgroundVivid;
  if (typeof patch.density === "string" && DENSITIES.includes(patch.density))
    clean.density = patch.density;
  if (typeof patch.defaultProvider === "string" && PROVIDERS.includes(patch.defaultProvider))
    clean.defaultProvider = patch.defaultProvider;
  if (typeof patch.instructions === "string")
    clean.instructions = patch.instructions.slice(0, 2000);
  if (typeof patch.pollInterval === "number" && patch.pollInterval >= 0)
    clean.pollInterval = Math.min(300, Math.round(patch.pollInterval));
  if (typeof patch.productionUrl === "string") {
    const raw = patch.productionUrl.trim().replace(/\/+$/, "");
    if (raw === "") {
      clean.productionUrl = "";
    } else {
      const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      try {
        const u = new URL(withProto);
        if (u.protocol === "http:" || u.protocol === "https:") {
          clean.productionUrl = `${u.protocol}//${u.host}`.slice(0, 200);
        }
      } catch {
        /* URL inválido — ignora sem partir o resto */
      }
    }
  }

  const [updated] = await db
    .update(settings)
    .set(clean)
    .where(eq(settings.id, current.id))
    .returning();
  return updated;
}

export function settingsView(s: Settings) {
  return {
    displayName: s.displayName,
    workspaceName: s.workspaceName,
    accent: normalizeAccent(s.accent),
    background: s.background,
    backgroundVivid: s.backgroundVivid,
    density: s.density,
    defaultProvider: s.defaultProvider,
    instructions: s.instructions,
    pollInterval: s.pollInterval,
    productionUrl: s.productionUrl ?? "",
    updatedAt: s.updatedAt,
  };
}