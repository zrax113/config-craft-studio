import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseConfig, dumpConfig, type ConfigFormat } from "@/lib/config-parser";
import { detectPlugin, type DetectionResult, type PluginId, PLUGIN_LIST } from "@/lib/plugin-detect";
import { SAMPLE_LIST } from "@/lib/sample-configs";
import { loadSample } from "@/lib/sample-loader";
import { onLoadPlugin, onLoadPack } from "@/lib/plugin-bus";
import { toast } from "sonner";
import { FieldEditor } from "./FieldEditor";
import { CodeEditor } from "./CodeEditor";
import { ScrollToTop } from "./ScrollToTop";
import { useHistory } from "@/hooks/useHistory";
import { validateAgainstSchema, analyzeConfig, type SchemaIssue } from "@/lib/schema";
import { PLUGIN_PACKS, packForPlugin } from "@/lib/plugin-packs";
import { useSettings, persist, recall, playSound } from "@/lib/settings";
import { autoFixYaml } from "@/lib/auto-fix";
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
  ClipboardPaste,
  Files,
  HelpCircle,
  Wrench,
  Maximize2,
  Minimize2,
  Server,
} from "lucide-react";
import { useBrandConfig } from "@/lib/brand-config";
import { SftpDialog, type SftpFile } from "./SftpDialog";

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
  const settings = useSettings();
  const [raw, setRaw] = useState("");
  const editedHistory = useHistory<any>(null);
  const edited = editedHistory.value;
  const [format, setFormat] = useState<ConfigFormat>("yaml");
  const [filename, setFilename] = useState<string | undefined>();
  const [currentSampleId, setCurrentSampleId] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [packIds, setPackIds] = useState<string[] | null>(null);
  const [mobileTab, setMobileTab] = useState<"input" | "editor" | "output">("input");
  const [mobileTabFullscreen, setMobileTabFullscreen] = useState(false);
  const [sftpOpen, setSftpOpen] = useState(false);
  const [sftpFiles, setSftpFiles] = useState<SftpFile[]>([]);
  const restoredRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const outputScrollRef = useRef<HTMLPreElement>(null);
  // Distinguishes "raw → edited" sync from "edited → raw" sync to avoid loops.
  const lastDumpedRef = useRef<string>("");

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

  // Two-way sync: when the user edits via the visual FieldEditor, regenerate
  // the raw text so the input panel stays in sync. Guard against loops by
  // comparing against the last text WE produced.
  useEffect(() => {
    if (!edited || !yamlOut) return;
    if (yamlOut === raw) return;
    if (yamlOut === lastDumpedRef.current) return;
    // Only push back if current raw parses to something equivalent to a previous
    // dump (i.e. user is editing the parsed object, not the raw text directly).
    // Safe heuristic: if parsed succeeded AND raw differs from yamlOut, sync.
    if (parsed.ok) {
      lastDumpedRef.current = yamlOut;
      setRaw(yamlOut);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yamlOut]);

  const schemaIssues: SchemaIssue[] = useMemo(() => {
    if (!edited) return [];
    return validateAgainstSchema(
      { sampleId: currentSampleId, pluginId: detection && detection.id !== "unknown" ? detection.id : undefined },
      edited,
    );
  }, [detection, edited, currentSampleId]);

  const stats = useMemo(() => (edited ? analyzeConfig(edited) : null), [edited]);

  function applySample(content: string, fmt: "yaml" | "toml" | "json", sampleId?: string) {
    setFormat(fmt);
    setFilename(undefined);
    setCurrentSampleId(sampleId);
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
        applySample(sample.content, sample.format, id);
        setPackIds(null);
        toast.success(`Loaded ${sample.label}`, {
          description: "Default config inserted — edit & export.",
        });
      } else {
        toast.error(`No default config for ${meta?.name ?? id}`, {
          description: "Sample not bundled yet — paste your own to start editing.",
        });
      }
    });
    const offPack = onLoadPack((ids) => {
      setPackIds(ids);
    });
    return () => {
      off();
      offPack();
    };
  }, []);

  // Restore last session (if autosave enabled)
  useEffect(() => {
    if (!settings.autosave) return;
    const saved = recall<{ raw: string; format: ConfigFormat; sampleId?: string; filename?: string } | null>(
      "autosave",
      null,
    );
    if (saved?.raw && !raw) {
      setFormat(saved.format ?? "yaml");
      setCurrentSampleId(saved.sampleId);
      setFilename(saved.filename);
      setRaw(saved.raw);
      restoredRef.current = true;
      toast.success("Restored last session", { description: "Your previous config was loaded from this browser." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-persist on every change (debounced)
  useEffect(() => {
    if (!settings.autosave) return;
    const t = setTimeout(() => {
      persist("autosave", { raw, format, sampleId: currentSampleId, filename });
    }, 400);
    return () => clearTimeout(t);
  }, [raw, format, currentSampleId, filename, settings.autosave]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inEditable =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();

      // Global (work even when editing): ⌘S export, ⌘⇧C copy output
      if (mod && k === "s") {
        e.preventDefault();
        if (yamlOut) {
          downloadOut();
          toast.success("Exported config");
        }
        return;
      }
      if (mod && e.shiftKey && k === "c") {
        e.preventDefault();
        if (yamlOut) {
          copyOut();
          toast.success("Copied to clipboard");
        }
        return;
      }
      if (inEditable) return;
      if (mod && k === "z") {
        e.preventDefault();
        if (e.shiftKey) editedHistory.redo();
        else editedHistory.undo();
        return;
      }
      if (k === "?" || (e.shiftKey && k === "/")) {
        e.preventDefault();
        window.dispatchEvent(new Event("forgeyaml:open-tutorial"));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yamlOut, editedHistory]);

  function update(path: string[], value: any) {
    editedHistory.set((prev: any) => setDeep(prev, path, value));
  }

  async function copyOut() {
    if (!yamlOut) return;
    await navigator.clipboard.writeText(yamlOut);
    setCopied(true);
    playSound("ok");
    setTimeout(() => setCopied(false), 1500);
  }

  function currentFilename() {
    const ext = format === "toml" ? "toml" : format === "json" ? "json" : "yml";
    const baseName =
      detection && detection.id !== "unknown" ? detection.id : filename?.replace(/\.[^.]+$/, "") || "config";
    return `${baseName}.${ext}`;
  }

  async function openSftpCurrent() {
    if (!yamlOut) return;
    setSftpFiles([{ path: currentFilename(), contents: yamlOut }]);
    setSftpOpen(true);
  }

  async function openSftpPack() {
    if (!detection) return openSftpCurrent();
    const packKey = packForPlugin(detection.id);
    if (!packKey) return openSftpCurrent();
    const pack = PLUGIN_PACKS[packKey];
    const out: SftpFile[] = [];
    for (const f of pack.files) {
      const sample = await loadSample(f.sampleId);
      if (sample) out.push({ path: f.filename, contents: sample.content });
    }
    if (out.length === 0) return openSftpCurrent();
    setSftpFiles(out);
    setSftpOpen(true);
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
    playSound("pop");
  }

  function onFile(file: File) {
    setFilename(file.name);
    file.text().then((t) => setRaw(t));
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("Clipboard is empty");
        return;
      }
      setFilename(undefined);
      setRaw(text);
      toast.success("Pasted from clipboard");
    } catch {
      toast.error("Clipboard access blocked", {
        description: "Use ⌘V / Ctrl+V inside the editor instead.",
      });
    }
  }

  function reset() {
    setRaw("");
    editedHistory.reset(null);
    setFilename(undefined);
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* Mobile tab switcher — splits Input / Editor / Output into tabs on small screens */}
      <div className="lg:hidden flex items-center justify-between gap-1 mb-3 p-1 rounded-lg bg-muted/30 border border-border/50 shrink-0">
        <div className="flex items-center gap-1 flex-1">
          {(["input", "editor", "output"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setMobileTab(t);
                playSound("click");
              }}
              className={`flex-1 text-[11px] uppercase tracking-wider font-semibold py-1.5 rounded-md transition-colors ${
                mobileTab === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={mobileTab === t}
            >
              {t === "input" ? "Input" : t === "editor" ? "Editor" : "Output"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMobileTabFullscreen(!mobileTabFullscreen)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title={mobileTabFullscreen ? "Exit fullscreen" : "Fullscreen tab"}
        >
          {mobileTabFullscreen ? (
            <Minimize2 className="size-3.5" />
          ) : (
            <Maximize2 className="size-3.5" />
          )}
        </button>
      </div>

      <div className={`grid gap-5 grid-cols-1 ${mobileTabFullscreen ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,1fr)]"} 2xl:gap-6 flex-1 min-h-0`} data-mobile-tab={mobileTab}>
        {/* Hide non-active panels on mobile via attribute selector below */}
      <Panel
        title="Input"
        subtitle={filename ?? "Paste, drop, or load a sample"}
        icon={<Wand2 className="size-4" />}
        delay={0}
        hideOnMobile={mobileTab !== "input"}
      >
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={pasteFromClipboard}
            title="Paste from clipboard"
          >
            <ClipboardPaste className="size-3.5 mr-1.5" /> Paste
          </Button>
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

        <PackFilePicker
          detectionId={detection?.id}
          currentSampleId={currentSampleId}
          extraSampleIds={packIds ?? undefined}
          onPick={async (sampleId) => {
            const sample = await loadSample(sampleId);
            if (sample) {
              applySample(sample.content, sample.format, sampleId);
              toast.success(`Loaded ${sample.label}`);
            }
          }}
        />

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
              <div className="flex-1 min-w-0">
                <div className="font-semibold">
                  {parsed.error.line ? `Line ${parsed.error.line} · ` : ""}Parse error
                </div>
                <div className="text-destructive/80 mt-0.5 font-mono break-words">{parsed.error.message}</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] gap-1 border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => {
                  const res = autoFixYaml(raw);
                  if (res.applied.length === 0) {
                    toast.info("Nothing obvious to fix");
                    return;
                  }
                  setRaw(res.fixed);
                  if (res.ok) {
                    toast.success("Auto-fixed", { description: res.applied.join(" · ") });
                    playSound("ok");
                  } else {
                    toast.warning("Applied fixes — still has errors", {
                      description: res.applied.join(" · "),
                    });
                  }
                }}
                title="Try to auto-fix common YAML issues (tabs, smart quotes, missing colon space…)"
              >
                <Wrench className="size-3" /> Auto-fix
              </Button>
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
            <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 whitespace-nowrap">
              {SAMPLE_LIST.map(([id, s]) => (
                <button
                  key={id}
                  onClick={() => applySample(s.content, s.format)}
                  className="text-[11px] px-2 py-1 rounded-md bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/50 hover:border-primary/30 shrink-0"
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
        hideOnMobile={mobileTab !== "editor"}
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
            {stats && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-border/50 text-muted-foreground hidden md:inline-flex"
                title={`${stats.keys} keys · depth ${stats.depth} · ${stats.leaves} leaves`}
              >
                {stats.keys}k · d{stats.depth}
              </Badge>
            )}
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
        <div ref={editorScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-1 min-h-0 min-w-0">
          {!edited ? (
            <EmptyState />
          ) : (
            <motion.div
              key={detection?.id ?? "k"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-1 min-w-0"
            >
              {detection && detection.id === "unknown" && (
                <div className="mb-3 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground/80 uppercase tracking-wider mb-1">
                    <HelpCircle className="size-3.5" /> Unrecognized config
                  </div>
                  <p className="leading-relaxed">
                    We couldn't match a known plugin — editing as a generic config. Closest guesses:{" "}
                    {detection.candidates.slice(0, 3).map((c, i) => (
                      <span key={c.id}>
                        {i > 0 && ", "}
                        <button
                          className="underline decoration-dotted hover:text-primary"
                          onClick={async () => {
                            const s = await loadSample(c.id);
                            if (s) applySample(s.content, s.format, c.id);
                          }}
                        >
                          {c.name}
                        </button>
                      </span>
                    ))}
                  </p>
                </div>
              )}
              {schemaIssues.length > 0 && (
                <div className="mb-3 rounded-lg border border-warning/30 bg-warning/5 p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-warning uppercase tracking-wider">
                    <AlertTriangle className="size-3.5" />
                    Schema check · {schemaIssues.length} issue{schemaIssues.length === 1 ? "" : "s"}
                  </div>
                  <ul className="text-[11px] space-y-0.5 text-muted-foreground">
                    {schemaIssues.slice(0, 6).map((iss, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span
                          className={
                            iss.level === "error" ? "text-destructive font-semibold" : "text-warning font-semibold"
                          }
                        >
                          {iss.level === "error" ? "ERR" : "WARN"}
                        </span>
                        <span className="break-words">{iss.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
        hideOnMobile={mobileTab !== "output"}
        accessory={
          <div className="flex gap-1 flex-wrap justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={copyOut}
              disabled={!yamlOut}
              className="h-8 px-2"
              title="Copy (⌘⇧C)"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="ok"
                    initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
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
            {detection && packForPlugin(detection.id) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={exportPack}
                className="h-8 px-2 text-xs"
                title="Export every related file (config, messages, kits…)"
              >
                <Package className="size-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Pack</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={detection && packForPlugin(detection.id) ? openSftpPack : openSftpCurrent}
              disabled={!yamlOut}
              className="h-8 px-2 text-xs"
              title="Upload directly to your server via SFTP"
            >
              <Server className="size-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">SFTP</span>
            </Button>
            <Button
              size="sm"
              onClick={downloadOut}
              disabled={!yamlOut}
              className="h-8 px-2 sm:px-3 bg-primary hover:bg-primary/90 text-primary-foreground"
              title="Export (⌘S)"
            >
              <Download className="size-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Export</span>
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
        {yamlOut && (
          <div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold px-1">
            <span>{yamlOut.split("\n").length} lines</span>
            <span className="opacity-40">·</span>
            <span>{yamlOut.length.toLocaleString()} chars</span>
            <span className="opacity-40">·</span>
            <span>{(new Blob([yamlOut]).size / 1024).toFixed(1)} kb</span>
          </div>
        )}
        <ScrollToTop targetRef={outputScrollRef} />
      </Panel>
      </div>
      <SftpDialog open={sftpOpen} onOpenChange={setSftpOpen} files={sftpFiles} />
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
  hideOnMobile = false,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accessory?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  hideOnMobile?: boolean;
}) {
  const [maximized, setMaximized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Esc to exit fullscreen
  useEffect(() => {
    if (!maximized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMaximized(false);
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [maximized]);

  const sectionBody = (
    <motion.section
      initial={maximized ? { opacity: 0, scale: 0.96 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: maximized ? 0 : delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={
        maximized
          ? "glass glass-shine rounded-2xl p-4 flex flex-col fixed inset-2 sm:inset-4 z-[60] min-w-0 shadow-[0_0_0_1px_oklch(0.76_0.16_290_/_0.4),0_40px_120px_-20px_oklch(0_0_0_/_0.8)]"
          : `glass glass-shine rounded-2xl p-4 flex flex-col min-h-[60vh] lg:h-full lg:min-h-0 relative min-w-0 transition-shadow hover:shadow-[0_0_0_1px_oklch(0.76_0.16_290_/_0.25),0_24px_60px_-30px_oklch(0_0_0_/_0.6)] ${
              hideOnMobile ? "hidden lg:flex" : ""
            }`
      }
    >
      <header className="flex items-center justify-between gap-2 flex-wrap pb-3 mb-3 border-b border-border/40">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm font-semibold leading-tight truncate">{title}</h3>
            <p className="text-[11px] text-muted-foreground truncate" title={subtitle}>{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {accessory}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => setMaximized((m) => !m)}
            aria-label={maximized ? "Exit fullscreen" : "Enter fullscreen"}
            title={maximized ? "Exit fullscreen (Esc)" : "Fullscreen this panel"}
          >
            {maximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </Button>
        </div>
      </header>
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </motion.section>
  );

  if (maximized && mounted) {
    return createPortal(
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-[55]"
          onClick={() => setMaximized(false)}
        />
        {sectionBody}
      </>,
      document.body,
    );
  }
  return sectionBody;
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

/** Pack file picker — when the loaded plugin belongs to a multi-file pack
 *  (e.g. EssentialsX with config.yml + messages.yml + kits.yml…), render a
 *  VS-Code-like row of file tabs so the user can hop between related files.
 *  `extraSampleIds` lets the sidebar's "Load all" override the static pack
 *  with the live manifest contents (covers freshly-added files). */
function PackFilePicker({
  detectionId,
  currentSampleId,
  extraSampleIds,
  onPick,
}: {
  detectionId?: PluginId;
  currentSampleId?: string;
  extraSampleIds?: string[];
  onPick: (sampleId: string) => void | Promise<void>;
}) {
  type Tab = { sampleId: string; filename: string };
  let tabs: Tab[] = [];
  let label = "Files";
  if (extraSampleIds?.length) {
    tabs = extraSampleIds.map((id) => ({ sampleId: id, filename: id }));
    label = "Loaded files";
  } else if (detectionId && detectionId !== "unknown") {
    const packKey = packForPlugin(detectionId);
    if (packKey) {
      const pack = PLUGIN_PACKS[packKey];
      tabs = pack.files.map((f) => ({ sampleId: f.sampleId, filename: f.filename }));
      label = `${pack.name} files`;
    }
  }
  if (tabs.length === 0) return null;
  const active = currentSampleId ?? detectionId;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-3 -mt-1 flex items-center gap-1.5 overflow-x-auto pb-1"
    >
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold shrink-0 flex items-center gap-1">
        <Files className="size-3" /> {label}
      </span>
      <div className="flex gap-1 shrink-0">
        {tabs.map((f) => (
          <button
            key={f.sampleId}
            onClick={() => onPick(f.sampleId)}
            className={`text-[11px] px-2 py-1 rounded-md border transition-all whitespace-nowrap ${
              f.sampleId === active
                ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_0_1px_oklch(0.76_0.16_290_/_0.3)]"
                : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            {f.filename}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
