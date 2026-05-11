/**
 * Lightweight user settings store. Persists to localStorage and notifies
 * subscribers. We avoid pulling in a heavyweight state lib for ~6 toggles.
 */
import { useEffect, useSyncExternalStore } from "react";

export interface AppSettings {
  animations: boolean;
  sounds: boolean;
  autosave: boolean;
  lineWrap: boolean;
  compactToolbar: boolean;
  liveValidation: boolean;
}

const KEY = "forgeyaml:settings:v1";

const DEFAULTS: AppSettings = {
  animations: true,
  sounds: false,
  autosave: true,
  lineWrap: false,
  compactToolbar: true,
  liveValidation: true,
};

let state: AppSettings = (() => {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULTS;
  }
})();

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
  applyAnimationClass();
}

function applyAnimationClass() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("no-anim", !state.animations);
}

if (typeof document !== "undefined") applyAnimationClass();

export function getSettings(): AppSettings {
  return state;
}

export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
  state = { ...state, [key]: value };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
  emit();
}

export function useSettings(): AppSettings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => DEFAULTS,
  );
}

// ─────────────────────────── Sound effects ──────────────────────────────
let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function playSound(kind: "click" | "ok" | "err" | "pop") {
  if (!state.sounds) return;
  const a = ac();
  if (!a) return;
  const now = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();
  o.connect(g);
  g.connect(a.destination);
  const freq = kind === "ok" ? 880 : kind === "err" ? 220 : kind === "pop" ? 1320 : 660;
  o.frequency.value = freq;
  o.type = "sine";
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  o.start(now);
  o.stop(now + 0.13);
}

/** Persist arbitrary key state (e.g. raw config) keyed under our namespace. */
export function persist<T>(key: string, value: T) {
  try {
    localStorage.setItem(`forgeyaml:${key}`, JSON.stringify(value));
  } catch {
    /* quota */
  }
}
export function recall<T>(key: string, fallback: T): T {
  try {
    const r = localStorage.getItem(`forgeyaml:${key}`);
    if (!r) return fallback;
    return JSON.parse(r) as T;
  } catch {
    return fallback;
  }
}

/** Hook to wire a generic event listener once, lazily. */
export function useOnce(fn: () => void) {
  useEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
