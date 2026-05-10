import type { PluginId } from "./plugin-detect";

export interface PluginSchema {
  required?: string[];
  recommended?: string[];
  /** key → human description shown when missing/invalid */
  keyDocs?: Record<string, string>;
  /** key → expected primitive type */
  types?: Record<string, "string" | "number" | "boolean" | "array" | "object">;
}

/** Lightweight, additive schemas — keys are top-level only.  */
export const SCHEMAS: Partial<Record<PluginId, PluginSchema>> = {
  luckperms: {
    required: ["storage-method"],
    recommended: ["server", "messaging-service", "use-server-uuids"],
    types: {
      "storage-method": "string",
      "use-server-uuids": "boolean",
      "sync-minutes": "number",
    },
  },
  essentials: {
    required: ["currency-symbol", "starting-balance"],
    recommended: ["nickname-prefix", "teleport-cooldown", "chat", "kits"],
    types: {
      "currency-symbol": "string",
      "starting-balance": "number",
      "teleport-cooldown": "number",
      "spawn-on-join": "boolean",
    },
  },
  velocity: {
    required: ["bind", "motd"],
    recommended: ["servers", "forced-hosts", "advanced", "query"],
    types: { bind: "string", motd: "string", "show-max-players": "number" },
  },
  tab: {
    required: ["scoreboard-teams"],
    recommended: ["header-footer", "tablist-name-formatting", "yellow-number-in-tablist"],
  },
  discordsrv: {
    required: ["BotToken", "Channels"],
    recommended: ["DiscordChatChannelMinecraftToDiscord", "DiscordConsoleChannelId"],
    types: { BotToken: "string", Channels: "object" },
  },
  paper: {
    recommended: ["settings", "world-settings", "messages"],
  },
  bungeecord: {
    required: ["listeners"],
    recommended: ["permissions", "groups", "disabled_commands"],
  },
  geyser: {
    required: ["bedrock", "remote"],
    recommended: ["floodgate-key-file"],
  },
};

export interface SchemaIssue {
  level: "error" | "warn";
  key: string;
  message: string;
}

export function validateAgainstSchema(pluginId: PluginId, data: any): SchemaIssue[] {
  const schema = SCHEMAS[pluginId];
  if (!schema || !data || typeof data !== "object") return [];
  const issues: SchemaIssue[] = [];
  const has = (k: string) => Object.prototype.hasOwnProperty.call(data, k);

  for (const k of schema.required ?? []) {
    if (!has(k)) issues.push({ level: "error", key: k, message: `Missing required key "${k}"` });
  }
  for (const k of schema.recommended ?? []) {
    if (!has(k)) issues.push({ level: "warn", key: k, message: `Missing recommended key "${k}"` });
  }
  for (const [k, t] of Object.entries(schema.types ?? {})) {
    if (!has(k)) continue;
    const v = data[k];
    const actual = Array.isArray(v) ? "array" : v === null ? "object" : typeof v;
    if (actual !== t) {
      issues.push({
        level: "error",
        key: k,
        message: `"${k}" should be ${t}, got ${actual}`,
      });
    }
  }
  return issues;
}
