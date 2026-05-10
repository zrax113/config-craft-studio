import type { PluginId } from "./plugin-detect";
import { SAMPLES } from "./sample-configs";

export interface LoadedSample {
  label: string;
  content: string;
  format: "yaml" | "toml" | "json";
}

interface ManifestEntry {
  label: string;
  format: "yaml" | "toml" | "json";
  path: string;
}

let manifestCache: Record<string, ManifestEntry> | null = null;

async function loadManifest(): Promise<Record<string, ManifestEntry>> {
  if (manifestCache) return manifestCache;
  try {
    const res = await fetch("/configs/manifest.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`manifest ${res.status}`);
    const json = await res.json();
    manifestCache = (json && json.samples) || {};
    return manifestCache!;
  } catch {
    manifestCache = {};
    return manifestCache;
  }
}

/** Load a sample. Tries public/configs first, then falls back to bundled. */
export async function loadSample(id: PluginId): Promise<LoadedSample | null> {
  const manifest = await loadManifest();
  const entry = manifest[id];
  if (entry) {
    try {
      const res = await fetch(`/configs/${entry.path}`, { cache: "no-cache" });
      if (res.ok) {
        const text = await res.text();
        return { label: entry.label, format: entry.format, content: text };
      }
    } catch {
      /* fallback below */
    }
  }
  const bundled = SAMPLES[id];
  if (bundled) {
    return { label: bundled.label, format: bundled.format, content: bundled.content };
  }
  return null;
}
