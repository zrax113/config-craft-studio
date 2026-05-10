import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ConfigStudio } from "@/components/config/ConfigStudio";
import { useBrandConfig } from "@/lib/brand-config";
import { PLUGIN_LIST, type PluginId } from "@/lib/plugin-detect";
import {
  Bolt,
  Github,
  Keyboard,
  Search,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  ChevronRight,
  FileText,
  Layers,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { emitLoadPlugin, emitLoadPack } from "@/lib/plugin-bus";
import { getSamplesForPlugin, getManifest, type PluginSampleRef } from "@/lib/sample-loader";
import { Onboarding } from "@/components/config/Onboarding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ForgeYAML — Visual Config Studio for Minecraft Plugins" },
      {
        name: "description",
        content:
          "Minimal no-code editor for LuckPerms, EssentialsX (config + messages), TAB, DeluxeMenus, Velocity, Paper and 50+ more. Auto-detect, edit visually, export YAML/TOML/JSON.",
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

function PluginList({
  search,
  setSearch,
  onPick,
}: {
  search: string;
  setSearch: (v: string) => void;
  onPick?: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [samplesById, setSamplesById] = useState<Record<string, PluginSampleRef[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync the manifest periodically so newly added files in public/configs
  // appear without a hard reload.
  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const m = await getManifest(true);
      if (!alive) return;
      // Invalidate cached sample lists so expanded folders pick up new files.
      setSamplesById((prev) => {
        const next: Record<string, PluginSampleRef[]> = {};
        for (const id of Object.keys(prev)) {
          // recompute lazily on next expand
          void m;
        }
        return next;
      });
    };
    const t = setInterval(refresh, 15000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const ensureSamples = async (id: PluginId) => {
    if (samplesById[id]) return samplesById[id];
    const refs = await getSamplesForPlugin(id);
    setSamplesById((prev) => ({ ...prev, [id]: refs }));
    return refs;
  };

  const handleSingleClick = async (id: PluginId) => {
    setExpanded((cur) => (cur === id ? null : id));
    await ensureSamples(id);
  };

  const handleDoubleClick = async (id: PluginId) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    setLoadingId(id);
    const refs = await ensureSamples(id);
    if (refs.length > 1) emitLoadPack(refs.map((r) => r.id));
    else emitLoadPlugin(id);
    setLoadingId(null);
    onPick?.();
  };

  const onPluginClick = (id: PluginId) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      handleDoubleClick(id);
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      handleSingleClick(id);
    }, 220);
  };

  // Hide sub-file entries (e.g. essentials_messages, tab_messages) — they are
  // already shown when expanding the parent plugin. Listing them at top level
  // creates duplicate folders that share the exact same files.
  const isChildSample = (id: string) =>
    /_(messages|kits|worth|spawns|alerts|linking|animations|groups|placeholders|templates)$/i.test(id);

  const grouped = PLUGIN_LIST.reduce<Record<string, typeof PLUGIN_LIST>>((acc, p) => {
    if (isChildSample(p.id)) return acc;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return acc;
    (acc[p.category] ??= [] as any).push(p);
    return acc;
  }, {});

  return (
    <>
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
            aria-label="Search plugins"
          />
        </div>
        <div className="text-[10px] text-muted-foreground/70 leading-snug">
          Click to browse files · Double-click to load all
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav aria-label="Plugin library" className="py-3 px-2 space-y-4">
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
                {plugins.map((p) => {
                  const isExpanded = expanded === p.id;
                  const refs = samplesById[p.id] ?? [];
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => onPluginClick(p.id as PluginId)}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          handleDoubleClick(p.id as PluginId);
                        }}
                        aria-expanded={isExpanded}
                        title={`Click to view files · Double-click to load all of ${p.name}`}
                        className="w-full text-left px-2 py-1.5 rounded-md text-xs text-foreground/80 hover:bg-primary/10 hover:text-foreground hover:ring-1 hover:ring-primary/30 active:scale-[0.98] transition-all flex items-center gap-2 group"
                      >
                        <ChevronRight
                          className={`size-3 shrink-0 text-muted-foreground/60 transition-transform ${
                            isExpanded ? "rotate-90 text-primary" : ""
                          }`}
                        />
                        <span className="truncate min-w-0 flex-1">{p.name}</span>
                        {loadingId === p.id ? (
                          <span className="text-[9px] text-primary animate-pulse">…</span>
                        ) : null}
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase font-medium border-border/50 text-muted-foreground/70 group-hover:text-primary group-hover:border-primary/40 transition-colors h-4 px-1 shrink-0"
                        >
                          {p.format}
                        </Badge>
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden ml-4 mt-0.5 border-l border-border/40 pl-2 space-y-0.5"
                          >
                            {refs.length === 0 ? (
                              <li className="text-[10px] text-muted-foreground/60 italic px-2 py-1">
                                No bundled config files.
                              </li>
                            ) : (
                              <>
                                {refs.length > 1 && (
                                  <li>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        emitLoadPack(refs.map((r) => r.id));
                                        onPick?.();
                                      }}
                                      className="w-full text-left px-2 py-1 rounded-md text-[10.5px] text-primary/90 hover:bg-primary/10 hover:text-primary flex items-center gap-1.5 transition-colors"
                                    >
                                      <Layers className="size-3" />
                                      Load all {refs.length} files
                                    </button>
                                  </li>
                                )}
                                {refs.map((r) => (
                                  <li key={r.id}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        emitLoadPlugin(r.id);
                                        onPick?.();
                                      }}
                                      className="w-full text-left px-2 py-1 rounded-md text-[10.5px] text-foreground/70 hover:bg-muted/40 hover:text-foreground flex items-center gap-1.5 transition-colors"
                                      title={r.path}
                                    >
                                      <FileText className="size-3 shrink-0 text-muted-foreground/70" />
                                      <span className="truncate">{r.filename}</span>
                                      <span className="ml-auto text-[9px] uppercase text-muted-foreground/60 shrink-0">
                                        {r.format}
                                      </span>
                                    </button>
                                  </li>
                                ))}
                              </>
                            )}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-8">No plugins match.</div>
          )}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-3 text-[10px] text-muted-foreground/70 leading-relaxed">
        {PLUGIN_LIST.length} plugins · YAML · TOML · JSON
      </div>
    </>
  );
}

function Studio() {
  const cfg = useBrandConfig();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="relative z-20 h-14 shrink-0 border-b border-border/40 bg-background/70 backdrop-blur-xl flex items-center px-3 sm:px-4 gap-3">
        {/* Mobile sidebar trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden size-8 shrink-0">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 flex flex-col">
            <PluginList search={search} setSearch={setSearch} onPick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex size-8 shrink-0"
          onClick={() => setDesktopCollapsed((c) => !c)}
          title={desktopCollapsed ? "Show plugin list" : "Hide plugin list"}
          aria-label={desktopCollapsed ? "Show plugin list" : "Hide plugin list"}
        >
          {desktopCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/30 text-primary flex items-center justify-center pulse-glow shrink-0">
            <Bolt className="size-4" strokeWidth={2.4} />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-display font-semibold text-sm tracking-tight truncate">{cfg.brand.name}</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5 truncate">{cfg.brand.tagline}</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border/40">
            <Keyboard className="size-3" />
            <kbd className="font-mono">⌘S</kbd> export
            <span className="opacity-40">·</span>
            <kbd className="font-mono">⌘⇧C</kbd> copy
            <span className="opacity-40">·</span>
            <kbd className="font-mono">?</kbd> help
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => window.dispatchEvent(new Event("forgeyaml:open-tutorial"))}
            title="Open the in-depth tutorial"
          >
            <GraduationCap className="size-3.5" />
            <span className="hidden sm:inline">Tutorial</span>
          </Button>
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

        {/* Sidebar (desktop) — animated collapse */}
        <aside
          className={`hidden md:flex relative z-10 shrink-0 border-r border-border/40 bg-background/30 backdrop-blur-xl flex-col overflow-hidden transition-[width] duration-300 ease-out ${
            desktopCollapsed ? "w-0 border-r-0" : "w-60 xl:w-64 2xl:w-72"
          }`}
          aria-hidden={desktopCollapsed}
        >
          <div className="w-60 xl:w-64 2xl:w-72 h-full flex flex-col">
            <PluginList search={search} setSearch={setSearch} />
          </div>
        </aside>

        {/* Workspace */}
        <main className="relative z-10 flex-1 overflow-auto p-3 sm:p-4 lg:p-5 2xl:p-6 min-w-0">
          <div className="mx-auto max-w-[1800px] 3xl:max-w-[2400px] h-full">
            <ConfigStudio />
          </div>
          <Onboarding />
        </main>
      </div>
    </div>
  );
}

