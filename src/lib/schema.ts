import type { PluginId } from "./plugin-detect";

export interface PluginSchema {
  required?: string[];
  recommended?: string[];
  /** key → human description shown when missing/invalid */
  keyDocs?: Record<string, string>;
  /** key → expected primitive type */
  types?: Record<string, "string" | "number" | "boolean" | "array" | "object">;
  /**
   * Optional regex patterns for string values. Skipped when the value isn't a string.
   * Pattern is checked with new RegExp(pattern). Add a flag suffix like `/i` if needed.
   */
  patterns?: Record<string, { regex: string; message: string }>;
  /** A short label shown in the validator UI. */
  label?: string;
  /** Free-form remediation hints keyed by the key name. */
  hints?: Record<string, string>;
}

/**
 * Schemas keyed by *sample id* (file-specific) when available, falling back
 * to the parent plugin id. This prevents bogus warnings like "missing kits"
 * when the user is editing essentialsx/config.yml — kits live in kits.yml.
 *
 * Sourced from each plugin's documented defaults:
 *   - LuckPerms       https://luckperms.net/wiki/Configuration
 *   - EssentialsX     https://essinfo.xeya.me/
 *   - DiscordSRV      https://docs.discordsrv.com/installation/getting-started/
 *   - PaperMC         https://docs.papermc.io/paper/reference/global-configuration/
 *   - Velocity        https://docs.papermc.io/velocity/configuration/
 *   - Geyser          https://wiki.geysermc.org/geyser/setup/
 *   - TAB             https://github.com/NEZNAMY/TAB/wiki
 *   - BungeeCord      https://www.spigotmc.org/wiki/bungeecord-configuration-guide/
 */
export const SCHEMAS: Record<string, PluginSchema> = {
  // ── LuckPerms ────────────────────────────────────────────────────────────
  luckperms: {
    label: "LuckPerms · config.yml",
    required: ["storage-method"],
    recommended: ["server", "messaging-service", "use-server-uuids", "data"],
    types: {
      "storage-method": "string",
      "use-server-uuids": "boolean",
      "sync-minutes": "number",
      server: "string",
    },
    patterns: {
      "storage-method": {
        regex: "^(h2|sqlite|mariadb|mysql|postgresql|mongodb|yaml|json|hocon|yaml-combined|json-combined|hocon-combined)$",
        message: "storage-method must be one of: h2, sqlite, mysql, mariadb, postgresql, mongodb, yaml, json, hocon",
      },
    },
  },
  luckperms_messages: {
    label: "LuckPerms · lang/en.yml",
    recommended: ["luckperms"],
  },

  // ── EssentialsX ──────────────────────────────────────────────────────────
  essentials: {
    label: "EssentialsX · config.yml",
    required: ["currency-symbol", "starting-balance"],
    // Real keys from upstream config.yml — `kits` lives in kits.yml so it
    // is intentionally NOT recommended here.
    recommended: [
      "nickname-prefix",
      "teleport-cooldown",
      "teleport-delay",
      "chat",
      "ops-name-color",
      "spawn-on-join",
    ],
    types: {
      "currency-symbol": "string",
      "starting-balance": "number",
      "teleport-cooldown": "number",
      "teleport-delay": "number",
      "spawn-on-join": "boolean",
      "ops-name-color": "string",
    },
  },
  essentials_kits: {
    label: "EssentialsX · kits.yml",
    recommended: ["kits"],
    types: { kits: "object" },
  },
  essentials_messages: {
    label: "EssentialsX · messages.yml",
    // messages files are pure key-value strings; no required keys.
  },
  essentials_worth: {
    label: "EssentialsX · worth.yml",
    recommended: ["worth"],
    types: { worth: "object" },
  },

  // ── Velocity ─────────────────────────────────────────────────────────────
  velocity: {
    label: "Velocity · velocity.toml",
    required: ["bind", "motd"],
    recommended: ["servers", "forced-hosts", "advanced", "query"],
    types: { bind: "string", motd: "string", "show-max-players": "number" },
    patterns: {
      bind: {
        regex: "^[\\d.:a-fA-F\\[\\]]+$",
        message: "bind should be host:port (e.g. 0.0.0.0:25577)",
      },
    },
  },

  // ── TAB ──────────────────────────────────────────────────────────────────
  tab: {
    label: "TAB · config.yml",
    required: ["scoreboard-teams"],
    recommended: ["header-footer", "tablist-name-formatting", "yellow-number-in-tablist"],
  },
  tab_messages: { label: "TAB · messages.yml" },

  // ── DiscordSRV ───────────────────────────────────────────────────────────
  discordsrv: {
    label: "DiscordSRV · config.yml",
    required: ["BotToken", "Channels"],
    recommended: ["DiscordChatChannelMinecraftToDiscord", "DiscordConsoleChannelId"],
    types: { BotToken: "string", Channels: "object" },
  },
  discordsrv_messages: { label: "DiscordSRV · messages.yml" },

  // ── Paper / Bungee / Geyser ──────────────────────────────────────────────
  paper: {
    label: "Paper · paper-global.yml",
    recommended: ["settings", "world-settings", "messages", "proxies"],
  },
  bungeecord: {
    label: "BungeeCord · config.yml",
    required: ["listeners"],
    recommended: ["permissions", "groups", "disabled_commands", "stats"],
  },
  geyser: {
    label: "Geyser · config.yml",
    required: ["bedrock", "remote"],
    recommended: ["floodgate-key-file", "passthrough-motd"],
  },
};

export interface SchemaIssue {
  level: "error" | "warn" | "info";
  key: string;
  message: string;
  hint?: string;
}

/**
 * Resolve the most specific schema available. Prefers an exact sample id
 * (e.g. `essentials_kits` for kits.yml) over the parent plugin id.
 */
export function resolveSchema(opts: { sampleId?: string; pluginId?: string }): PluginSchema | null {
  if (opts.sampleId && SCHEMAS[opts.sampleId]) return SCHEMAS[opts.sampleId];
  if (opts.pluginId && SCHEMAS[opts.pluginId]) return SCHEMAS[opts.pluginId];
  return null;
}

export function validateAgainstSchema(
  pluginIdOrOpts: PluginId | { sampleId?: string; pluginId?: string },
  data: any,
): SchemaIssue[] {
  const opts =
    typeof pluginIdOrOpts === "string"
      ? { pluginId: pluginIdOrOpts }
      : pluginIdOrOpts;
  const schema = resolveSchema(opts);
  if (!schema || !data || typeof data !== "object") return [];
  const issues: SchemaIssue[] = [];
  const has = (k: string) => Object.prototype.hasOwnProperty.call(data, k);

  for (const k of schema.required ?? []) {
    if (!has(k)) {
      issues.push({
        level: "error",
        key: k,
        message: `Missing required key "${k}"`,
        hint: schema.hints?.[k],
      });
    }
  }
  for (const k of schema.recommended ?? []) {
    if (!has(k)) {
      issues.push({
        level: "warn",
        key: k,
        message: `Missing recommended key "${k}"`,
        hint: schema.hints?.[k],
      });
    }
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
  for (const [k, p] of Object.entries(schema.patterns ?? {})) {
    if (!has(k)) continue;
    const v = data[k];
    if (typeof v !== "string") continue;
    let re: RegExp | null = null;
    try {
      re = new RegExp(p.regex);
    } catch {
      continue;
    }
    if (!re.test(v)) {
      issues.push({ level: "warn", key: k, message: p.message });
    }
  }
  return issues;
}

/** Lightweight stats used by the “Analyzer” popover. */
export function analyzeConfig(data: any) {
  let keys = 0;
  let depth = 0;
  let leaves = 0;
  const types = new Map<string, number>();
  const visit = (v: any, d: number) => {
    depth = Math.max(depth, d);
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const [, val] of Object.entries(v)) {
        keys++;
        visit(val, d + 1);
      }
    } else if (Array.isArray(v)) {
      types.set("array", (types.get("array") ?? 0) + 1);
      for (const it of v) visit(it, d + 1);
    } else {
      leaves++;
      const t = v === null ? "null" : typeof v;
      types.set(t, (types.get(t) ?? 0) + 1);
    }
  };
  visit(data, 0);
  return { keys, depth, leaves, types: Object.fromEntries(types) };
}
