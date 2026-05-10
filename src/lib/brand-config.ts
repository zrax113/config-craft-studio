import { useEffect, useState } from "react";

export interface BrandConfig {
  brand: { name: string; tagline: string; accentHue: number; accentChroma: number };
  pricing: { price: string; compareAt: string; ctaLabel: string };
  studio: { showSamples: boolean; showPluginBadge: boolean; defaultFormat: "auto" | "yaml" | "toml" | "json" };
}

const DEFAULT: BrandConfig = {
  brand: { name: "ForgeYAML", tagline: "Visual config studio for Minecraft plugins", accentHue: 142, accentChroma: 0.19 },
  pricing: { price: "$5.97", compareAt: "$24", ctaLabel: "Get lifetime access" },
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
        const merged = { ...DEFAULT, ...data, brand: { ...DEFAULT.brand, ...data.brand }, pricing: { ...DEFAULT.pricing, ...data.pricing }, studio: { ...DEFAULT.studio, ...data.studio } };
        cache = merged;
        setCfg(merged);
        // Apply accent dynamically
        const root = document.documentElement;
        root.style.setProperty("--primary", `oklch(0.82 ${merged.brand.accentChroma} ${merged.brand.accentHue})`);
        root.style.setProperty("--ring", `oklch(0.82 ${merged.brand.accentChroma} ${merged.brand.accentHue})`);
        root.style.setProperty("--glow", `oklch(0.82 ${merged.brand.accentChroma} ${merged.brand.accentHue} / 0.4)`);
      })
      .catch(() => {});
  }, []);
  return cfg;
}
