import type { PluginId } from "./plugin-detect";

type Listener = (id: string) => void;
type PackListener = (ids: string[]) => void;

const listeners = new Set<Listener>();
const packListeners = new Set<PackListener>();

export function emitLoadPlugin(id: PluginId | string) {
  listeners.forEach((l) => l(id as string));
}

export function onLoadPlugin(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function emitLoadPack(ids: string[]) {
  if (!ids.length) return;
  packListeners.forEach((l) => l(ids));
  // Also emit the first id so listeners that only know about single-load fall back gracefully.
  emitLoadPlugin(ids[0]);
}

export function onLoadPack(l: PackListener) {
  packListeners.add(l);
  return () => packListeners.delete(l);
}
