import yaml from "js-yaml";

export type PluginId = "luckperms" | "essentials" | "tab" | "deluxemenus" | "unknown";

export interface DetectionResult {
  plugin: PluginId;
  name: string;
  confidence: number;
  data: any;
  raw: string;
}

const SIGNATURES: Record<Exclude<PluginId, "unknown">, { name: string; keys: string[][] }> = {
  luckperms: {
    name: "LuckPerms",
    keys: [
      ["storage-method"],
      ["data", "address"],
      ["meta-formatting"],
      ["group-name-rewrite"],
      ["primary-group-calculation"],
    ],
  },
  essentials: {
    name: "EssentialsX",
    keys: [
      ["nickname-prefix"],
      ["currency-symbol"],
      ["starting-balance"],
      ["ops-name-color"],
      ["chat", "format"],
      ["spawn-on-join"],
    ],
  },
  tab: {
    name: "TAB",
    keys: [
      ["scoreboard-teams"],
      ["header-footer"],
      ["tablist-name-formatting"],
      ["belowname-objective"],
      ["yellow-number-in-tablist"],
    ],
  },
  deluxemenus: {
    name: "DeluxeMenus",
    keys: [
      ["gui_menus"],
      ["menu_title"],
      ["open_command"],
      ["items"],
      ["inventory_type"],
    ],
  },
};

function getDeep(obj: any, path: string[]): boolean {
  if (!obj || typeof obj !== "object") return false;
  if (path.length === 0) return true;
  const [head, ...rest] = path;
  if (head in obj) return rest.length === 0 ? true : getDeep(obj[head], rest);
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object" && getDeep(v, path)) return true;
  }
  return false;
}

export function detectPlugin(raw: string): DetectionResult {
  let data: any = null;
  try {
    data = yaml.load(raw);
  } catch {
    return { plugin: "unknown", name: "Unknown", confidence: 0, data: null, raw };
  }
  if (!data || typeof data !== "object") {
    return { plugin: "unknown", name: "Unknown", confidence: 0, data, raw };
  }

  let best: { id: PluginId; name: string; score: number } = {
    id: "unknown",
    name: "Unknown",
    score: 0,
  };

  for (const [id, sig] of Object.entries(SIGNATURES) as [
    Exclude<PluginId, "unknown">,
    (typeof SIGNATURES)[Exclude<PluginId, "unknown">],
  ][]) {
    let hits = 0;
    for (const k of sig.keys) if (getDeep(data, k)) hits++;
    const score = hits / sig.keys.length;
    if (score > best.score) best = { id, name: sig.name, score };
  }

  if (best.score < 0.2) {
    return { plugin: "unknown", name: "Unknown", confidence: best.score, data, raw };
  }
  return { plugin: best.id, name: best.name, confidence: best.score, data, raw };
}

export function dumpYaml(data: any): string {
  return yaml.dump(data, { indent: 2, lineWidth: 120, noRefs: true });
}
