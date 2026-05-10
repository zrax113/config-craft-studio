import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ConfigStudio } from "@/components/config/ConfigStudio";
import { useBrandConfig } from "@/lib/brand-config";
import { PLUGIN_LIST } from "@/lib/plugin-detect";
import { Bolt, Github, Keyboard, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { emitLoadPlugin } from "@/lib/plugin-bus";
import { Onboarding } from "@/components/config/Onboarding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ForgeYAML — Visual Config Studio for Minecraft Plugins" },
      {
        name: "description",
        content:
          "Minimal no-code editor for LuckPerms, EssentialsX (config + messages), TAB, DeluxeMenus, Velocity, Paper and more. Auto-detect, edit visually, export YAML/TOML/JSON.",
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
  messages: "Messages",
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
      <header className="relative z-20 h-14 shrink-0 border-b border-border/40 bg-background/70 backdrop-blur-xl flex items-center px-4 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/30 text-primary flex items-center justify-center pulse-glow">
            <Bolt className="size-4" strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-sm tracking-tight">{cfg.brand.name}</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">{cfg.brand.tagline}</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border/40">
            <Keyboard className="size-3" />
            <kbd className="font-mono">Tab</kbd> indent
            <span className="opacity-40">·</span>
            <kbd className="font-mono">⌘C</kbd> copy
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="size-8 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github className="size-4" />
          </a>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex min-h-0 relative">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        {/* Sidebar */}
        <aside className="relative z-10 w-64 shrink-0 border-r border-border/40 bg-background/30 backdrop-blur-xl flex flex-col">
          <div className="p-4 border-b border-border/40 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Supported plugins
            </div>
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="h-8 pl-8 text-xs bg-muted/30 border-border/50"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-3 px-2 space-y-4">
              {Object.entries(grouped).map(([cat, plugins], i) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                >
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold px-2 mb-1.5">
                    {CATEGORY_LABEL[cat] ?? cat}
                  </div>
                  <ul className="space-y-0.5">
                    {plugins.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => emitLoadPlugin(p.id)}
                          className="w-full text-left px-2 py-1.5 rounded-md text-xs text-foreground/80 hover:bg-primary/10 hover:text-foreground hover:ring-1 hover:ring-primary/30 active:scale-[0.98] transition-all flex items-center justify-between group"
                        >
                          <span className="truncate">{p.name}</span>
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase font-medium border-border/50 text-muted-foreground/70 group-hover:text-primary group-hover:border-primary/40 transition-colors h-4 px-1"
                          >
                            {p.format}
                          </Badge>
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
              {Object.keys(grouped).length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-8">No plugins match.</div>
              )}
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-3 text-[10px] text-muted-foreground/70 leading-relaxed">
            {PLUGIN_LIST.length} plugins · YAML · TOML · JSON
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
