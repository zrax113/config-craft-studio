import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseConfig, dumpConfig, type ConfigFormat } from "@/lib/config-parser";
import { detectPlugin, type DetectionResult, PLUGIN_LIST } from "@/lib/plugin-detect";
import { SAMPLE_LIST } from "@/lib/sample-configs";
import { loadSample } from "@/lib/sample-loader";
import { onLoadPlugin } from "@/lib/plugin-bus";
import { toast } from "sonner";
import { FieldEditor } from "./FieldEditor";
import { CodeEditor } from "./CodeEditor";
import { ScrollToTop } from "./ScrollToTop";
import { useHistory } from "@/hooks/useHistory";
import { validateAgainstSchema, type SchemaIssue } from "@/lib/schema";
import { PLUGIN_PACKS, packForPlugin } from "@/lib/plugin-packs";
import {
  Check,
  Copy,
  Download,
  FileWarning,
  Sparkles,
  Upload,
  Wand2,
  CheckCircle2,
  RotateCcw,
  Undo2,
  Redo2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useBrandConfig } from "@/lib/brand-config";

function setDeep(obj: any, path: string[], value: any): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const isArrayIdx = /^\d+$/.test(head);
  const clone: any = Array.isArray(obj) ? [...obj] : { ...(obj ?? {}) };
  const key: any = isArrayIdx ? Number(head) : head;
  clone[key] = setDeep(obj?.[key], rest, value);
  return clone;
}

export function ConfigStudio() {
  const cfg = useBrandConfig();
  const [raw, setRaw] = useState("");
  const editedHistory = useHistory<any>(null);
  const edited = editedHistory.value;
  const [format, setFormat] = useState<ConfigFormat>("yaml");
  const [filename, setFilename] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const outputScrollRef = useRef<HTMLPreElement>(null);

  const parsed = useMemo(() => parseConfig(raw), [raw]);
  const detection: DetectionResult | null = useMemo(() => {
    if (!parsed.ok) return null;
    return detectPlugin(parsed.data, parsed.format, filename);
  }, [parsed, filename]);

  // Sync edited <- parsed when input changes (resets history — input is the source of truth)
  useEffect(() => {
    if (parsed.ok) {
      editedHistory.reset(parsed.data);
      if (parsed.format) setFormat(parsed.format);
    } else if (!raw.trim()) {
      editedHistory.reset(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const yamlOut = useMemo(() => {
    if (!edited) return "";
    try {
      return dumpConfig(edited, format);
    } catch {
      return "";
    }
  }, [edited, format]);

  const schemaIssues: SchemaIssue[] = useMemo(() => {
    if (!detection || detection.id === "unknown" || !edited) return [];
    return validateAgainstSchema(detection.id, edited);
  }, [detection, edited]);

  function applySample(content: string, fmt: "yaml" | "toml" | "json") {
    setFormat(fmt);
    setFilename(undefined);
    setRaw(content);
  }

  async function exportPack() {
    if (!detection) return;
    const packKey = packForPlugin(detection.id);
    if (!packKey) {
      toast.error("No pack available", {
        description: "This plugin doesn't ship a multi-file pack.",
      });
      return;
    }
    const pack = PLUGIN_PACKS[packKey];
    let count = 0;
    for (const f of pack.files) {
      const sample = await loadSample(f.sampleId);
      if (!sample) continue;
      const blob = new Blob([sample.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.filename.replace(/\//g, "_");
      a.click();
      URL.revokeObjectURL(url);
      count++;
      // Tiny delay so browsers don't drop concurrent downloads
      await new Promise((r) => setTimeout(r, 150));
    }
    toast.success(`Exported ${count} files`, {
      description: `${pack.name} pack ready in your Downloads folder.`,
    });
  }

  // Listen for sidebar plugin clicks — uses the public/configs override system
  useEffect(() => {
    const off = onLoadPlugin(async (id) => {
      const meta = PLUGIN_LIST.find((p) => p.id === id);
      const sample = await loadSample(id);
      if (sample) {
        applySample(sample.content, sample.format);
        toast.success(`Loaded ${sample.label}`, {
          description: "Default config inserted — edit & export.",
        });
      } else {
        toast.error(`No default config for ${meta?.name ?? id}`, {
          description: "Sample not bundled yet — paste your own to start editing.",
        });
      }
    });
    return () => {
      off();
    };
  }, []);

  // Keyboard shortcuts: Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z redo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inEditable =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (inEditable) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) editedHistory.redo();
      else editedHistory.undo();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editedHistory]);

  function update(path: string[], value: any) {
    editedHistory.set((prev: any) => setDeep(prev, path, value));
  }

  async function copyOut() {
    if (!yamlOut) return;
    await navigator.clipboard.writeText(yamlOut);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadOut() {
    if (!yamlOut) return;
    const ext = format === "toml" ? "toml" : format === "json" ? "json" : "yml";
    const baseName =
      detection && detection.id !== "unknown" ? detection.id : filename?.replace(/\.[^.]+$/, "") || "config";
    const blob = new Blob([yamlOut], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onFile(file: File) {
    setFilename(file.name);
    file.text().then((t) => setRaw(t));
  }

  function reset() {
    setRaw("");
    editedHistory.reset(null);
    setFilename(undefined);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,1fr)] h-full">
      {/* Input panel */}
      <Panel
        title="Input"
        subtitle={filename ?? "Paste, drop, or load a sample"}
        icon={<Wand2 className="size-4" />}
        delay={0}
      >
        <div className="flex items-center gap-1.5 mb-3">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-3.5 mr-1.5" /> Upload
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".yml,.yaml,.toml,.json,.txt,.config"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
          {raw && (
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={reset}>
              <RotateCcw className="size-3.5 mr-1.5" /> Clear
            </Button>
          )}
          <div className="ml-auto flex items-center gap-1 rounded-md bg-muted/40 p-0.5 border border-border/50">
            {(["yaml", "toml", "json"] as ConfigFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded transition-colors ${
                  format === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <CodeEditor
          value={raw}
          onChange={setRaw}
          format={parsed.format}
          errorLine={parsed.error?.line}
          placeholder="# paste any plugin config here…"
        />

        <AnimatePresence>
          {parsed.error && raw.trim() && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-start gap-2 text-xs bg-destructive/10 border border-destructive/30 px-3 py-2 rounded-md text-destructive"
            >
              <FileWarning className="size-3.5 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">
                  {parsed.error.line ? `Line ${parsed.error.line} · ` : ""}Parse error
                </div>
                <div className="text-destructive/80 mt-0.5 font-mono">{parsed.error.message}</div>
              </div>
            </motion.div>
          )}
          {parsed.ok && raw.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-1.5 text-xs text-success"
            >
              <CheckCircle2 className="size-3.5" /> Valid {parsed.format?.toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>

        {cfg.studio.showSamples && (
          <div className="mt-3 pt-3 border-t border-border/40">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">
              Try a sample
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_LIST.map(([id, s]) => (
                <button
                  key={id}
                  onClick={() => applySample(s.content, s.format)}
                  className="text-[11px] px-2 py-1 rounded-md bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/50 hover:border-primary/30"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* Editor panel */}
      <Panel
        title="Visual editor"
        subtitle={
          detection && detection.id !== "unknown"
            ? `${detection.name} · ${Math.round(detection.confidence * 100)}% match`
            : edited
            ? "Generic config"
            : "Awaiting input"
        }
        icon={<Sparkles className="size-4" />}
        delay={0.05}
        accessory={
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={editedHistory.undo}
              disabled={!editedHistory.canUndo}
              title="Undo (⌘Z)"
            >
              <Undo2 className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={editedHistory.redo}
              disabled={!editedHistory.canRedo}
              title="Redo (⌘⇧Z)"
            >
              <Redo2 className="size-3.5" />
            </Button>
            {cfg.studio.showPluginBadge && detection && detection.id !== "unknown" && (
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={detection.id}>
                <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20 capitalize">
                  {detection.category}
                </Badge>
              </motion.div>
            )}
          </div>
        }
      >
        <div ref={editorScrollRef} className="flex-1 overflow-y-auto pr-1 -mr-1 min-h-0">
          {!edited ? (
            <EmptyState />
          ) : (
            <motion.div
              key={detection?.id ?? "k"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-1"
            >
              {Object.entries(edited).map(([k, v]) => (
                <FieldEditor key={k} path={[k]} value={v} onChange={update} />
              ))}
            </motion.div>
          )}
        </div>
        <ScrollToTop targetRef={editorScrollRef} />
      </Panel>

      {/* Output panel */}
      <Panel
        title="Output"
        subtitle={`${format.toUpperCase()} · ready to ship`}
        icon={<Download className="size-4" />}
        delay={0.1}
        accessory={
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={copyOut}
              disabled={!yamlOut}
              className="h-8 px-2"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="ok"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                  >
                    <Check className="size-4 text-success" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                  >
                    <Copy className="size-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            <Button
              size="sm"
              onClick={downloadOut}
              disabled={!yamlOut}
              className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="size-3.5 mr-1.5" /> Export
            </Button>
          </div>
        }
      >
        <pre ref={outputScrollRef} className="flex-1 overflow-auto rounded-xl bg-background/70 border border-border/60 p-4 text-xs font-mono leading-relaxed text-foreground/90 min-h-0">
          {yamlOut ? (
            <SyntaxLines text={yamlOut} format={format} />
          ) : (
            <span className="text-muted-foreground/60">// your config will appear here</span>
          )}
        </pre>
        <ScrollToTop targetRef={outputScrollRef} />
      </Panel>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  icon,
  accessory,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accessory?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-shine rounded-2xl p-4 flex flex-col min-h-[60vh] relative"
    >
      <header className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-border/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold leading-tight">{title}</h3>
            <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
          </div>
        </div>
        {accessory}
      </header>
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </motion.section>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-12 px-6">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 glow-primary"
      >
        <Wand2 className="size-6 text-primary" />
      </motion.div>
      <h4 className="font-display font-semibold text-base mb-1">No config yet</h4>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        Paste YAML / TOML / JSON, drop a file, or load a sample. We auto-detect the plugin and build the editor for you.
      </p>
    </div>
  );
}

/** Lightweight syntax coloring for YAML/TOML/JSON — keys, strings, numbers, booleans, comments */
function SyntaxLines({ text, format }: { text: string; format: ConfigFormat }) {
  const lines = text.split("\n");
  return (
    <code>
      {lines.map((ln, i) => (
        <div key={i}>
          {colorize(ln, format)}
          {"\n"}
        </div>
      ))}
    </code>
  );
}

function colorize(line: string, format: ConfigFormat) {
  // Comment
  const commentChar = format === "toml" ? "#" : format === "json" ? "" : "#";
  if (commentChar && line.trimStart().startsWith(commentChar)) {
    return <span className="text-muted-foreground/60">{line}</span>;
  }
  // YAML/TOML key: value
  const m = line.match(/^(\s*-?\s*)([A-Za-z0-9_.-]+|"[^"]+"|'[^']+')(\s*[:=]\s*)(.*)$/);
  if (m) {
    const [, indent, key, sep, val] = m;
    return (
      <>
        <span>{indent}</span>
        <span className="text-primary">{key}</span>
        <span className="text-muted-foreground/70">{sep}</span>
        <span>{styleValue(val)}</span>
      </>
    );
  }
  // TOML table header
  if (/^\s*\[.*\]\s*$/.test(line)) {
    return <span className="text-accent font-semibold">{line}</span>;
  }
  return <span>{styleValue(line)}</span>;
}

function styleValue(v: string): React.ReactNode {
  const t = v.trim();
  if (!t) return v;
  if (/^(true|false|null|~)$/i.test(t)) return <span className="text-warning">{v}</span>;
  if (/^-?\d+(\.\d+)?$/.test(t)) return <span className="text-warning">{v}</span>;
  if (/^["'].*["']$/.test(t)) return <span className="text-success">{v}</span>;
  return <span>{v}</span>;
}
