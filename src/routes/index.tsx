import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ConfigStudio } from "@/components/config/ConfigStudio";
import { useBrandConfig } from "@/lib/brand-config";
import { PLUGIN_LIST } from "@/lib/plugin-detect";
import { Bolt, Github, Keyboard, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ForgeYAML — Visual Config Studio for Minecraft Plugins" },
      {
        name: "description",
        content:
          "Premium no-code editor for LuckPerms, EssentialsX, TAB, DeluxeMenus, Velocity, Paper and more. Auto-detect, edit visually, export YAML/TOML/JSON.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: Studio,
});

const CATEGORY_LABEL: Record<string, string> = {
  permissions: "Permissions",
  core: "Core",
  ui: "UI / Display",
  world: "World",
  economy: "Economy",
  social: "Social",
  proxy: "Proxy",
  server: "Server",
  scripting: "Scripting",
  other: "Utilities",
};

function Studio() {
  const cfg = useBrandConfig();
  const [search, setSearch] = useState("");

  const grouped = PLUGIN_LIST.reduce<Record<string, typeof PLUGIN_LIST>>((acc, p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return acc;
    (acc[p.category] ??= [] as any).push(p);
    return acc;
  }, {});

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="relative z-20 h-14 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-xl flex items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
            <Bolt className="size-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-sm tracking-tight">{cfg.brand.name}</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">{cfg.brand.tagline}</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/40">
            <Keyboard className="size-3" />
            <kbd className="font-mono">Tab</kbd> indent · <kbd className="font-mono">⌘C</kbd> copy
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="size-8 rounded-md hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="size-4" />
          </a>
          <button className="text-xs font-semibold px-3 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-all">
            {cfg.pricing.ctaLabel} · {cfg.pricing.price}
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Background flourishes */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute -top-32 left-1/3 size-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        {/* Sidebar */}
        <aside className="relative z-10 w-64 shrink-0 border-r border-border/40 bg-background/40 backdrop-blur-xl flex flex-col">
          <div className="p-4 border-b border-border/40">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
              Supported plugins
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full text-xs bg-muted/30 border border-border/50 rounded-md px-2.5 py-1.5 outline-none focus:border-primary/50 focus:bg-muted/50 transition-colors"
            />
          </div>
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
            {Object.entries(grouped).map(([cat, plugins], i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold px-2 mb-1.5">
                  {CATEGORY_LABEL[cat] ?? cat}
                </div>
                <ul className="space-y-0.5">
                  {plugins.map((p) => (
                    <li
                      key={p.id}
                      className="px-2 py-1.5 rounded-md text-xs text-foreground/80 hover:bg-muted/50 hover:text-foreground transition-colors cursor-default flex items-center justify-between group"
                    >
                      <span>{p.name}</span>
                      <span className="text-[9px] uppercase font-semibold text-muted-foreground/60 group-hover:text-primary transition-colors">
                        {p.format}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
            {Object.keys(grouped).length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-8">No plugins match.</div>
            )}
          </div>
          <div className="p-3 border-t border-border/40">
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-primary mb-1">
                <Sparkles className="size-3" /> Pro
              </div>
              <div className="text-xs text-foreground/90 leading-snug">
                Lifetime license, all plugins, future updates.
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-xl font-bold">{cfg.pricing.price}</span>
                <span className="text-[11px] text-muted-foreground line-through">{cfg.pricing.compareAt}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Workspace */}
        <main className="relative z-10 flex-1 overflow-auto p-5">
          <ConfigStudio />
        </main>
      </div>
    </div>
  );
}
