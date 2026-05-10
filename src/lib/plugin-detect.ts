import type { ConfigFormat } from "./config-parser";

export type PluginId =
  | "luckperms"
  | "essentials"
  | "tab"
  | "deluxemenus"
  | "vault"
  | "placeholderapi"
  | "worldguard"
  | "worldedit"
  | "citizens"
  | "mythicmobs"
  | "plotsquared"
  | "griefprevention"
  | "discordsrv"
  | "skript"
  | "viaversion"
  | "authme"
  | "multiverse"
  | "chestshop"
  | "coreprotect"
  | "geyser"
  | "floodgate"
  | "velocity"
  | "bungeecord"
  | "paper"
  | "spigot"
  | "purpur"
  | "essentials_messages"
  | "essentials_kits"
  | "essentials_worth"
  | "essentials_spawns"
  | "luckperms_messages"
  | "tab_messages"
  | "discordsrv_messages"
  | "vane"
  | "advancedban"
  | "litebans"
  | "shopgui"
  | "playerwarps"
  | "huskhomes"
  | "husksync"
  | "chatcontrol"
  | "betterrtp"
  | "headdatabase"
  | "premiumvanish"
  | "advanced_enchantments"
  | "itemsadder"
  | "oraxen"
  | "modelengine"
  | "redisbungee"
  | "litebackup"
  | "magicspells"
  | "quests"
  | "betonquest"
  | "decentholograms"
  | "holographicdisplays"
  | "supervanish"
  | "wildstacker"
  | "stackmob"
  | "clearlag"
  | "fastasyncworldedit"
  | "betterrtp2"
  | "graves"
  | "treeassist"
  | "mcmmo"
  | "jobs"
  | "townyadvanced"
  | "factions"
  | "lwc"
  | "essentialsxchat"
  | "ezprestige"
  | "dynmap"
  | "bluemap"
  | "squaremap"
  | "viaproxy"
  | "geyserstandalone"
  | "votifier"
  | "nuvotifier"
  | "playerpoints"
  | "coinsengine"
  | "betterreload"
  | "skinsrestorer"
  | "openinv"
  | "worldborder"
  | "essentialsxgeoip"
  | "armorstandeditor"
  | "auctionhouse"
  | "deluxetags"
  | "deluxechat"
  | "ezauctions"
  | "papimacros"
  | "unknown";

export interface PluginSignature {
  id: PluginId;
  name: string;
  category: "permissions" | "core" | "ui" | "world" | "economy" | "social" | "proxy" | "server" | "scripting" | "messages" | "other";
  format: ConfigFormat;
  /** unique top-level keys (high weight) */
  unique?: string[];
  /** any-of keys (lower weight) */
  any?: string[];
  /** filename hints */
  filenames?: string[];
}

export const SIGNATURES: PluginSignature[] = [
  {
    id: "luckperms",
    name: "LuckPerms",
    category: "permissions",
    format: "yaml",
    unique: ["meta-formatting", "primary-group-calculation", "group-name-rewrite"],
    any: ["storage-method", "data", "log-notify", "auto-install-translations"],
    filenames: ["config.yml"],
  },
  {
    id: "essentials",
    name: "EssentialsX",
    category: "core",
    format: "yaml",
    unique: ["nickname-prefix", "currency-symbol", "starting-balance", "ops-name-color"],
    any: ["spawn-on-join", "teleport-cooldown", "death-messages", "chat"],
  },
  {
    id: "tab",
    name: "TAB",
    category: "ui",
    format: "yaml",
    unique: ["scoreboard-teams", "header-footer", "tablist-name-formatting", "belowname-objective"],
    any: ["yellow-number-in-tablist", "global-playerlist", "bossbar"],
  },
  {
    id: "deluxemenus",
    name: "DeluxeMenus",
    category: "ui",
    format: "yaml",
    unique: ["menu_title", "open_command", "inventory_type"],
    any: ["items", "size", "register_command", "gui_menus"],
  },
  {
    id: "vault",
    name: "Vault",
    category: "economy",
    format: "yaml",
    unique: ["update-check"],
    any: ["economy"],
  },
  {
    id: "placeholderapi",
    name: "PlaceholderAPI",
    category: "core",
    format: "yaml",
    unique: ["check_updates", "expansions"],
    any: ["cloud_enabled", "boolean"],
  },
  {
    id: "worldguard",
    name: "WorldGuard",
    category: "world",
    format: "yaml",
    unique: ["regions", "summary-on-start"],
    any: ["host-keys", "build-permission-nodes", "use-paper-entity-origin"],
  },
  {
    id: "worldedit",
    name: "WorldEdit",
    category: "world",
    format: "yaml",
    unique: ["limits", "schematics"],
    any: ["wand-item", "snapshots", "navigation-wand"],
  },
  {
    id: "citizens",
    name: "Citizens",
    category: "other",
    format: "yaml",
    unique: ["npc", "selection"],
    any: ["save-task", "default-text"],
  },
  {
    id: "mythicmobs",
    name: "MythicMobs",
    category: "other",
    format: "yaml",
    unique: ["Mobs", "Skills"],
    any: ["DefaultLevelModifiers", "MobDamageMultiplier"],
  },
  {
    id: "plotsquared",
    name: "PlotSquared",
    category: "world",
    format: "yaml",
    unique: ["plot", "worlds"],
    any: ["uuid", "auto_purge"],
  },
  {
    id: "griefprevention",
    name: "GriefPrevention",
    category: "world",
    format: "yaml",
    unique: ["GriefPrevention"],
    any: ["Claims", "Siege"],
  },
  {
    id: "discordsrv",
    name: "DiscordSRV",
    category: "social",
    format: "yaml",
    unique: ["BotToken", "Channels"],
    any: ["DiscordChatChannelMinecraftToDiscord", "DiscordConsoleChannelId"],
  },
  {
    id: "skript",
    name: "Skript",
    category: "scripting",
    format: "yaml",
    unique: ["language", "verbosity"],
    any: ["check for new version", "updater"],
  },
  {
    id: "viaversion",
    name: "ViaVersion",
    category: "core",
    format: "yaml",
    unique: ["block-protocol-versions", "checkforupdates"],
    any: ["bungee-ping-interval", "fix-1_8-direction"],
  },
  {
    id: "authme",
    name: "AuthMe",
    category: "core",
    format: "yaml",
    unique: ["DataSource", "settings"],
    any: ["restrictions", "security"],
  },
  {
    id: "multiverse",
    name: "Multiverse-Core",
    category: "world",
    format: "yaml",
    unique: ["multiverse-configuration", "worlds"],
    any: ["enforceaccess", "globaldebug"],
  },
  {
    id: "coreprotect",
    name: "CoreProtect",
    category: "other",
    format: "yaml",
    unique: ["default-logging", "rollback-items"],
    any: ["disable-world", "block-place"],
  },
  {
    id: "geyser",
    name: "Geyser",
    category: "proxy",
    format: "yaml",
    unique: ["bedrock", "remote"],
    any: ["floodgate-key-file", "passthrough-motd"],
  },
  {
    id: "floodgate",
    name: "Floodgate",
    category: "proxy",
    format: "yaml",
    unique: ["key-file-name", "username-prefix"],
    any: ["replace-spaces", "disconnect"],
  },
  {
    id: "velocity",
    name: "Velocity",
    category: "proxy",
    format: "toml",
    unique: ["bind", "motd", "show-max-players"],
    any: ["servers", "forced-hosts", "advanced", "query"],
  },
  {
    id: "bungeecord",
    name: "BungeeCord",
    category: "proxy",
    format: "yaml",
    unique: ["listeners", "permissions"],
    any: ["server_connect_timeout", "groups", "disabled_commands"],
  },
  {
    id: "paper",
    name: "Paper",
    category: "server",
    format: "yaml",
    unique: ["_version", "settings", "world-settings"],
    any: ["unsupported-settings", "messages", "timings"],
  },
  {
    id: "spigot",
    name: "Spigot",
    category: "server",
    format: "yaml",
    unique: ["settings", "messages", "advancements", "stats"],
    any: ["players", "world-settings", "commands"],
  },
  {
    id: "purpur",
    name: "Purpur",
    category: "server",
    format: "yaml",
    unique: ["settings", "world-settings", "config-version"],
    any: ["afk", "ridables"],
  },
  // ─── Messages files ───
  {
    id: "essentials_messages",
    name: "EssentialsX Messages",
    category: "messages",
    format: "yaml",
    unique: ["noPerm", "noAccessCommand", "alertFormat", "balance", "balanceTop"],
    any: ["teleport", "teleportAtoB", "kitGiven", "homeSet", "warpSet", "moneyTaken"],
    filenames: ["messages_en.yml", "messages.yml"],
  },
  {
    id: "essentials_kits",
    name: "EssentialsX Kits",
    category: "messages",
    format: "yaml",
    unique: ["kits"],
    any: ["delay", "items"],
    filenames: ["kits.yml"],
  },
  {
    id: "essentials_worth",
    name: "EssentialsX Worth",
    category: "economy",
    format: "yaml",
    unique: ["worth"],
    any: [],
    filenames: ["worth.yml"],
  },
  {
    id: "essentials_spawns",
    name: "EssentialsX Spawns",
    category: "world",
    format: "yaml",
    unique: ["spawns"],
    any: [],
    filenames: ["spawn.yml"],
  },
  {
    id: "luckperms_messages",
    name: "LuckPerms Messages",
    category: "messages",
    format: "yaml",
    unique: ["prefix", "command-not-recognised", "user-not-found", "group-not-found"],
    any: ["no-permission", "user-info", "group-info"],
    filenames: ["lang/en.yml", "messages.yml"],
  },
  {
    id: "tab_messages",
    name: "TAB Messages",
    category: "messages",
    format: "yaml",
    unique: ["reload-success", "reload-fail", "data-removed"],
    any: ["unknown-command", "no-permission"],
    filenames: ["messages.yml"],
  },
  {
    id: "discordsrv_messages",
    name: "DiscordSRV Messages",
    category: "messages",
    format: "yaml",
    unique: ["MinecraftChatToDiscordMessage", "DiscordToMinecraftChatMessage"],
    any: ["DiscordChatChannelTopicFormat", "DiscordPlayerListCommandMessage"],
    filenames: ["messages.yml"],
  },
  {
    id: "vane",
    name: "Vane",
    category: "other",
    format: "yaml",
    unique: ["vane", "modules"],
    any: ["language", "persistent_storage"],
  },
  {
    id: "advancedban",
    name: "AdvancedBan",
    category: "other",
    format: "yaml",
    unique: ["MySQL", "PunishmentLayouts"],
    any: ["UpdateCheck", "ReasonsEnabled"],
  },
  {
    id: "litebans",
    name: "LiteBans",
    category: "other",
    format: "yaml",
    unique: ["sql", "messages", "broadcasts"],
    any: ["history", "litebans"],
  },
  {
    id: "shopgui",
    name: "ShopGUI+",
    category: "economy",
    format: "yaml",
    unique: ["shops", "categories"],
    any: ["sellAllSkippedItems", "openShopMessage"],
  },
  {
    id: "playerwarps",
    name: "PlayerWarps",
    category: "world",
    format: "yaml",
    unique: ["warpsPerPlayer", "warpCreationCost"],
    any: ["disabledWorlds", "warpItem"],
  },
  {
    id: "huskhomes",
    name: "HuskHomes",
    category: "world",
    format: "yaml",
    unique: ["max_homes", "max_public_homes", "set_warp_command"],
    any: ["cross_server", "rtp"],
  },
  {
    id: "husksync",
    name: "HuskSync",
    category: "core",
    format: "yaml",
    unique: ["cluster_id", "synchronization"],
    any: ["redis", "database"],
  },
  {
    id: "chatcontrol",
    name: "ChatControl",
    category: "social",
    format: "yaml",
    unique: ["Anti_Bot", "Anti_Spam", "Format"],
    any: ["Channels", "Filter"],
  },
  {
    id: "betterrtp",
    name: "BetterRTP",
    category: "world",
    format: "yaml",
    unique: ["Settings", "RTP"],
    any: ["MinX", "MaxX", "DefaultWorld"],
  },
  {
    id: "headdatabase",
    name: "HeadDatabase",
    category: "ui",
    format: "yaml",
    unique: ["heads", "categories"],
    any: ["update", "tags"],
  },
  {
    id: "premiumvanish",
    name: "PremiumVanish",
    category: "other",
    format: "yaml",
    unique: ["EnableInvisibility", "EnableSilentChestInteraction"],
    any: ["BypassPermissions", "PluginMessageChannel"],
  },
  {
    id: "advanced_enchantments",
    name: "AdvancedEnchantments",
    category: "other",
    format: "yaml",
    unique: ["Enchantments", "Groups"],
    any: ["MaxEnchantmentsAtOnce", "EnchantmentTable"],
  },
  {
    id: "itemsadder",
    name: "ItemsAdder",
    category: "other",
    format: "yaml",
    unique: ["info", "items", "namespace"],
    any: ["resource", "blocks"],
  },
  {
    id: "oraxen",
    name: "Oraxen",
    category: "other",
    format: "yaml",
    unique: ["Pack", "ItemUpdater"],
    any: ["Misc", "Plugin"],
  },
  {
    id: "modelengine",
    name: "ModelEngine",
    category: "other",
    format: "yaml",
    unique: ["model_engine", "ModelEngine"],
    any: ["renderer", "animation"],
  },
  {
    id: "redisbungee",
    name: "RedisBungee",
    category: "proxy",
    format: "yaml",
    unique: ["redis-server", "redis-port", "server-id"],
    any: ["redis-password", "max-redis-connections"],
  },
  {
    id: "litebackup",
    name: "LiteBackup",
    category: "other",
    format: "yaml",
    unique: ["backup-interval", "backup-folder"],
    any: ["compression", "max-backups"],
  },
];

export interface DetectionResult {
  id: PluginId;
  name: string;
  category: PluginSignature["category"] | "unknown";
  confidence: number;
  format: ConfigFormat | null;
  candidates: { id: PluginId; name: string; score: number }[];
}

function flatKeys(obj: any, depth = 0, max = 3, out = new Set<string>()): Set<string> {
  if (!obj || typeof obj !== "object" || depth > max) return out;
  for (const k of Object.keys(obj)) {
    out.add(k);
    if (depth < max) flatKeys((obj as any)[k], depth + 1, max, out);
  }
  return out;
}

export function detectPlugin(
  data: any,
  format: ConfigFormat | null,
  filename?: string
): DetectionResult {
  if (!data || typeof data !== "object") {
    return { id: "unknown", name: "Unknown", category: "unknown", confidence: 0, format, candidates: [] };
  }
  const keys = flatKeys(data);
  const scores = SIGNATURES.map((sig) => {
    let score = 0;
    let max = 0;
    for (const k of sig.unique ?? []) {
      max += 3;
      if (keys.has(k)) score += 3;
    }
    for (const k of sig.any ?? []) {
      max += 1;
      if (keys.has(k)) score += 1;
    }
    if (filename && sig.filenames?.some((f) => filename.toLowerCase().includes(f))) score += 2;
    if (format && sig.format === format) score += 0.5;
    return { id: sig.id, name: sig.name, category: sig.category, score: max ? score / max : 0, raw: score };
  }).sort((a, b) => b.score - a.score);

  const top = scores[0];
  if (!top || top.raw < 2) {
    return {
      id: "unknown",
      name: "Unknown",
      category: "unknown",
      confidence: 0,
      format,
      candidates: scores.slice(0, 3).map((s) => ({ id: s.id, name: s.name, score: s.score })),
    };
  }
  return {
    id: top.id,
    name: top.name,
    category: top.category,
    confidence: top.score,
    format,
    candidates: scores.slice(0, 5).map((s) => ({ id: s.id, name: s.name, score: s.score })),
  };
}

export const PLUGIN_LIST = SIGNATURES;
