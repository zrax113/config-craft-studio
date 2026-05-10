import type { PluginId } from "./plugin-detect";

type Listener = (id: PluginId) => void;
const listeners = new Set<Listener>();

export function emitLoadPlugin(id: PluginId) {
  listeners.forEach((l) => l(id));
}

export function onLoadPlugin(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}
