import type { PluginId } from "./plugin-detect";

/**
 * A "plugin pack" groups every related sample for a plugin family,
 * so the user can export every config (config.yml, messages.yml, kits.yml…)
 * in one click.
 */
export interface PluginPack {
  /** sample id in SAMPLES */
  sampleId: PluginId;
  /** suggested file name when exporting */
  filename: string;
}

export const PLUGIN_PACKS: Record<string, { name: string; files: PluginPack[] }> = {
  essentials: {
    name: "EssentialsX",
    files: [
      { sampleId: "essentials", filename: "config.yml" },
      { sampleId: "essentials_messages", filename: "messages_en.yml" },
      { sampleId: "essentials_kits", filename: "kits.yml" },
      { sampleId: "essentials_worth", filename: "worth.yml" },
      { sampleId: "essentials_spawns", filename: "spawn.yml" },
    ],
  },
  luckperms: {
    name: "LuckPerms",
    files: [
      { sampleId: "luckperms", filename: "config.yml" },
      { sampleId: "luckperms_messages", filename: "lang/en.yml" },
    ],
  },
  tab: {
    name: "TAB",
    files: [
      { sampleId: "tab", filename: "config.yml" },
      { sampleId: "tab_messages", filename: "messages.yml" },
    ],
  },
  discordsrv: {
    name: "DiscordSRV",
    files: [
      { sampleId: "discordsrv", filename: "config.yml" },
      { sampleId: "discordsrv_messages", filename: "messages.yml" },
    ],
  },
};

/** Map any plugin id to its pack key, when it belongs to one. */
export function packForPlugin(id: PluginId): string | null {
  for (const [key, pack] of Object.entries(PLUGIN_PACKS)) {
    if (pack.files.some((f) => f.sampleId === id)) return key;
  }
  return null;
}
