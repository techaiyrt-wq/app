import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// Tarefas — a unidade central do produto (inbox unificada de trabalho com IA)
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("todo"), // todo | doing | done
  provider: text("provider").notNull().default("demo"), // demo | openai | anthropic | google
  origin: text("origin").notNull().default("web"), // web | iphone
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ligações de IA — chaves BYOK guardadas apenas no servidor
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(), // openai | anthropic | google
  label: text("label").notNull(),
  apiKey: text("api_key").notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Mensagens — histórico de conversa por tarefa
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id"),
  role: text("role").notNull(), // user | assistant
  provider: text("provider").notNull().default("demo"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Eventos — feed de sincronização (simula o log iPhone ⇄ servidor ⇄ dashboard)
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // task_created | task_updated | ai_reply | connection_added | ...
  detail: text("detail").notNull(),
  source: text("source").notNull().default("web"), // web | iphone | api
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Integração com o dashboard externo do utilizador + chave de API de entrada
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  dashboardUrl: text("dashboard_url").notNull().default(""),
  webhookUrl: text("webhook_url").notNull().default(""),
  bearerToken: text("bearer_token").notNull().default(""),
  autoSync: text("auto_sync").notNull().default("off"), // on | off
  publicKey: text("public_key").notNull().default(""),
  status: text("status").notNull().default("unlinked"), // unlinked | linked | error
  lastError: text("last_error").notNull().default(""),
  lastTestedAt: timestamp("last_tested_at"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Definições do utilizador — linha única, tudo customizável na app
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull().default(""),
  workspaceName: text("workspace_name").notNull().default("Nexo"),
  accent: text("accent").notNull().default("verde"), // verde | azul | ameixa | oliva | terracota | grafite
  background: text("background").notNull().default("paper"), // paleta de fundos
  backgroundVivid: boolean("background_vivid").notNull().default(false), // tons de fundo mais vivos
  density: text("density").notNull().default("normal"), // normal | compact
  defaultProvider: text("default_provider").notNull().default("demo"),
  instructions: text("instructions").notNull().default(""),
  pollInterval: integer("poll_interval").notNull().default(8), // segundos | 0 = off
  productionUrl: text("production_url").notNull().default(""), // URL público permanente (Vercel etc.)
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Connection = typeof connections.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type SyncEvent = typeof events.$inferSelect;
export type Integration = typeof integrations.$inferSelect;