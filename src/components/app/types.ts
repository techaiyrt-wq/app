export type Tab = "home" | "tasks" | "ai" | "connect" | "settings";

export interface SettingsView {
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
}

export type DateLike = string | Date;

export interface TaskView {
  id: number;
  title: string;
  notes: string;
  status: string;
  provider: string;
  origin: string;
  createdAt: DateLike;
  updatedAt: DateLike;
}

export interface ConnectionView {
  id: number;
  provider: string;
  label: string;
  model: string;
  keyMask: string;
}

export interface EventView {
  id: number;
  kind: string;
  detail: string;
  source: string;
  createdAt: DateLike;
}

export interface MessageView {
  id: number;
  taskId: number | null;
  role: string;
  content: string;
  provider: string;
  createdAt: DateLike;
}

export interface IntegrationView {
  dashboardUrl: string;
  webhookUrl: string;
  hasToken: boolean;
  autoSync: boolean;
  publicKey: string;
  status: string;
  lastError: string;
  lastTestedAt: DateLike | null;
  lastSyncAt: DateLike | null;
}