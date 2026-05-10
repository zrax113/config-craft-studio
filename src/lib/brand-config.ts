import { useEffect, useState } from "react";

export interface BrandConfig {
  brand: { name: string; tagline: string; accentHue: number; accentChroma: number };
  studio: { showSamples: boolean; showPluginBadge: boolean; defaultFormat: "auto" | "yaml" | "toml" | "json" };
}

const DEFAULT: BrandConfig = {
  brand: { name: "ForgeYAML", tagline: "Visual config studio for Minecraft plugins", accentHue: 285, accentChroma: 0.13 },
  studio: { showSamples: true, showPluginBadge: true, defaultFormat: "auto" },
};

let cache: BrandConfig | null = null;

export function useBrandConfig(): BrandConfig {
  const [cfg, setCfg] = useState<BrandConfig>(cache ?? DEFAULT);
  useEffect(() => {
    if (cache) return;
    fetch("/config.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const merged = {
          ...DEFAULT,
          ...data,
          brand: { ...DEFAULT.brand, ...data.brand },
          studio: { ...DEFAULT.studio, ...data.studio },
        };
        cache = merged;
        setCfg(merged);
        const root = document.documentElement;
        root.style.setProperty("--primary", `oklch(0.74 ${merged.brand.accentChroma} ${merged.brand.accentHue})`);
        root.style.setProperty("--ring", `oklch(0.74 ${merged.brand.accentChroma} ${merged.brand.accentHue})`);
        root.style.setProperty("--glow", `oklch(0.74 ${merged.brand.accentChroma} ${merged.brand.accentHue} / 0.32)`);
      })
      .catch(() => {});
  }, []);
  return cfg;
}
