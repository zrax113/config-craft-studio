import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { detectPlugin, dumpYaml, type DetectionResult, type PluginId } from "@/lib/plugin-detect";
import { SAMPLES } from "@/lib/sample-configs";
import { FieldEditor } from "./FieldEditor";
import { Check, Copy, Download, FileWarning, Sparkles, Wand2 } from "lucide-react";

function setDeep(obj: any, path: string[], value: any): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const isArrayIdx = /^\d+$/.test(head);
  const clone = Array.isArray(obj) ? [...obj] : { ...(obj ?? {}) };
  const key: any = isArrayIdx ? Number(head) : head;
  (clone as any)[key] = setDeep((obj as any)?.[key], rest, value);
  return clone;
}

const PLUGINS: { id: Exclude<PluginId, "unknown">; label: string; blurb: string }[] = [
  { id: "luckperms", label: "LuckPerms", blurb: "Permissions & ranks" },
  { id: "essentials", label: "EssentialsX", blurb: "Economy & chat" },
  { id: "tab", label: "TAB", blurb: "Tablist & scoreboard" },
  { id: "deluxemenus", label: "DeluxeMenus", blurb: "Custom GUIs" },
];

export function ConfigStudio() {
  const [raw, setRaw] = useState("");
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [edited, setEdited] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const yamlOut = useMemo(() => (edited ? dumpYaml(edited) : ""), [edited]);

  const yamlError = useMemo(() => {
    if (!raw.trim()) return null;
    try {
      // re-validate
      const r = detectPlugin(raw);
      if (!r.data) return "Invalid YAML syntax";
      return null;
    } catch (e: any) {
      return e?.message ?? "Parse error";
    }
  }, [raw]);

  function analyze(text: string) {
    setRaw(text);
    if (!text.trim()) {
      setDetection(null);
      setEdited(null);
      return;
    }
    const r = detectPlugin(text);
    setDetection(r);
    setEdited(r.data);
  }

  function loadSample(id: Exclude<PluginId, "unknown">) {
    analyze(SAMPLES[id]);
  }

  function update(path: string[], value: any) {
    setEdited((prev: any) => setDeep(prev, path, value));
  }

  async function copyOut() {
    await navigator.clipboard.writeText(yamlOut);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadOut() {
    const name = detection?.plugin && detection.plugin !== "unknown" ? detection.plugin : "config";
    const blob = new Blob([yamlOut], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.yml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr_1fr]">
      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold">1. Paste your config</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Or load a starter below</p>
          </div>
          <Wand2 className="size-5 text-primary" />
        </div>
        <Textarea
          value={raw}
          onChange={(e) => analyze(e.target.value)}
          placeholder="# Paste any plugin YAML here…"
          className="flex-1 min-h-[300px] font-mono text-xs bg-background/50 border-border/60 resize-none"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {PLUGINS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadSample(p.id)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50"
            >
              {p.label}
            </button>
          ))}
        </div>
        {yamlError && (
          <div className="mt-3 flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            <FileWarning className="size-3.5" />
            {yamlError}
          </div>
        )}
      </motion.div>

      {/* Visual editor */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-5 flex flex-col min-h-[480px]"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold">2. Edit visually</h3>
            <p className="text-xs text-muted-foreground mt-0.5">No YAML knowledge required</p>
          </div>
          <AnimatePresence>
            {detection && detection.plugin !== "unknown" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
                  <Sparkles className="size-3 mr-1" />
                  {detection.name} detected
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          {!edited ? (
            <EmptyState />
          ) : (
            <div className="space-y-1">
              {Object.entries(edited).map(([k, v]) => (
                <FieldEditor key={k} path={[k]} value={v} onChange={update} />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold">3. Live YAML</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Drop into your plugin folder</p>
          </div>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={copyOut}
              disabled={!yamlOut}
              className="h-8"
            >
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={downloadOut}
              disabled={!yamlOut}
              className="h-8"
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto rounded-xl bg-background/70 border border-border/60 p-4 text-xs font-mono leading-relaxed text-foreground/90 min-h-[300px]">
          {yamlOut || <span className="text-muted-foreground">// your generated config will appear here</span>}
        </pre>
      </motion.div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 glow-primary">
        <Wand2 className="size-6 text-primary" />
      </div>
      <h4 className="font-display font-semibold text-base mb-1">Awaiting your config</h4>
      <p className="text-sm text-muted-foreground max-w-xs">
        Paste any YAML on the left — we'll auto-detect the plugin and turn it into clean toggles & inputs.
      </p>
    </div>
  );
}
