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
let manifestPromise: Promise<Record<string, ManifestEntry>> | null = null;

async function loadManifest(force = false): Promise<Record<string, ManifestEntry>> {
  if (!force && manifestCache) return manifestCache;
  if (!force && manifestPromise) return manifestPromise;
  manifestPromise = (async () => {
    try {
      const res = await fetch("/configs/manifest.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`manifest ${res.status}`);
      const json = await res.json();
      manifestCache = (json && json.samples) || {};
      return manifestCache!;
    } catch {
      manifestCache = {};
      return manifestCache;
    } finally {
      manifestPromise = null;
    }
  })();
  return manifestPromise;
}

export async function getManifest(force = false): Promise<Record<string, ManifestEntry>> {
  return loadManifest(force);
}

/**
 * Folder names used inside public/configs/. The manifest is the source of
 * truth, so we derive the folder from each sample's `path` field. This map
 * exists only as a fallback when the manifest hasn't loaded yet.
 */
const FOLDER_HINT: Partial<Record<PluginId, string>> = {
  essentials: "essentialsx",
};

export function folderForPlugin(id: PluginId): string {
  return FOLDER_HINT[id] ?? (id as string);
}

export interface PluginSampleRef {
  id: string;
  label: string;
  format: "yaml" | "toml" | "json";
  path: string;
  filename: string;
}

/** All sample files belonging to one plugin folder, sorted with config.* first. */
export async function getSamplesForPlugin(id: PluginId): Promise<PluginSampleRef[]> {
  const manifest = await loadManifest();
  // Resolve the folder by looking up the canonical sample for this id, if any,
  // and falling back to the static hint. Then collect every sample whose path
  // starts with that folder.
  const own = manifest[id];
  const folder = own ? own.path.split("/")[0] : folderForPlugin(id);
  const out: PluginSampleRef[] = [];
  for (const [sid, entry] of Object.entries(manifest)) {
    if (entry.path.split("/")[0] !== folder) continue;
    const filename = entry.path.split("/").slice(1).join("/");
    out.push({ id: sid, label: entry.label, format: entry.format, path: entry.path, filename });
  }
  out.sort((a, b) => {
    const aw = /^config\./i.test(a.filename) ? 0 : 1;
    const bw = /^config\./i.test(b.filename) ? 0 : 1;
    return aw - bw || a.filename.localeCompare(b.filename);
  });
  return out;
}

/** Load a sample. Tries public/configs first, then falls back to bundled. */
export async function loadSample(id: string): Promise<LoadedSample | null> {
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
  const bundled = (SAMPLES as Record<string, LoadedSample | undefined>)[id];
  if (bundled) {
    return { label: bundled.label, format: bundled.format, content: bundled.content };
  }
  return null;
}
