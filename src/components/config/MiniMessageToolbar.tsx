import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Palette } from "lucide-react";

/** Minecraft legacy color codes (& format) and MiniMessage tags.
 *  Compact picker shown on demand above any string field. */

const LEGACY_COLORS: { code: string; name: string; hex: string }[] = [
  { code: "&0", name: "Black", hex: "#000000" },
  { code: "&1", name: "Dark Blue", hex: "#0000aa" },
  { code: "&2", name: "Dark Green", hex: "#00aa00" },
  { code: "&3", name: "Dark Aqua", hex: "#00aaaa" },
  { code: "&4", name: "Dark Red", hex: "#aa0000" },
  { code: "&5", name: "Dark Purple", hex: "#aa00aa" },
  { code: "&6", name: "Gold", hex: "#ffaa00" },
  { code: "&7", name: "Gray", hex: "#aaaaaa" },
  { code: "&8", name: "Dark Gray", hex: "#555555" },
  { code: "&9", name: "Blue", hex: "#5555ff" },
  { code: "&a", name: "Green", hex: "#55ff55" },
  { code: "&b", name: "Aqua", hex: "#55ffff" },
  { code: "&c", name: "Red", hex: "#ff5555" },
  { code: "&d", name: "Light Purple", hex: "#ff55ff" },
  { code: "&e", name: "Yellow", hex: "#ffff55" },
  { code: "&f", name: "White", hex: "#ffffff" },
];

const LEGACY_FORMATS: { code: string; name: string }[] = [
  { code: "&l", name: "Bold" },
  { code: "&o", name: "Italic" },
  { code: "&n", name: "Underline" },
  { code: "&m", name: "Strike" },
  { code: "&k", name: "Magic" },
  { code: "&r", name: "Reset" },
];

const MM_COLORS: { tag: string; hex: string }[] = [
  { tag: "red", hex: "#ff5555" },
  { tag: "gold", hex: "#ffaa00" },
  { tag: "yellow", hex: "#ffff55" },
  { tag: "green", hex: "#55ff55" },
  { tag: "aqua", hex: "#55ffff" },
  { tag: "blue", hex: "#5555ff" },
  { tag: "light_purple", hex: "#ff55ff" },
  { tag: "white", hex: "#ffffff" },
  { tag: "gray", hex: "#aaaaaa" },
  { tag: "dark_red", hex: "#aa0000" },
  { tag: "dark_green", hex: "#00aa00" },
  { tag: "dark_aqua", hex: "#00aaaa" },
];

const MM_FORMATS = ["bold", "italic", "underlined", "strikethrough", "obfuscated"];

interface Props {
  value: string;
  onChange: (next: string) => void;
}

/** Detect MiniMessage tags or & color codes already in the string. */
export function hasFormatting(value: string): boolean {
  return /&[0-9a-fk-or]/i.test(value) || /<\/?[a-z_]+(:[^>]*)?>/.test(value);
}

export function MiniMessageToolbar({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"mm" | "legacy">(hasFormatting(value) && /</.test(value) ? "mm" : "legacy");

  function append(s: string) {
    onChange((value || "") + s);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border transition-colors ${
          open
            ? "bg-primary/15 border-primary/40 text-primary"
            : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
        }`}
        title="Insert colors / formatting"
      >
        <Palette className="size-3" /> Format
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 z-30 w-[260px] rounded-lg border border-border/70 bg-popover/95 backdrop-blur-xl shadow-2xl p-2 space-y-2"
            onMouseLeave={() => setOpen(false)}
          >
            <div className="flex gap-1 text-[10px]">
              <button
                onClick={() => setTab("legacy")}
                className={`px-2 py-0.5 rounded font-semibold uppercase tracking-wider transition ${
                  tab === "legacy" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                &amp; Codes
              </button>
              <button
                onClick={() => setTab("mm")}
                className={`px-2 py-0.5 rounded font-semibold uppercase tracking-wider transition ${
                  tab === "mm" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                MiniMessage
              </button>
              <button
                onClick={() => onChange("")}
                className="ml-auto px-2 py-0.5 text-[10px] text-muted-foreground hover:text-destructive"
                title="Clear value"
              >
                clear
              </button>
            </div>

            {tab === "legacy" ? (
              <>
                <div className="grid grid-cols-8 gap-0.5">
                  {LEGACY_COLORS.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => append(c.code)}
                      title={`${c.name} (${c.code})`}
                      className="size-6 rounded border border-border/40 hover:scale-110 transition-transform"
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                  {LEGACY_FORMATS.map((f) => (
                    <button
                      key={f.code}
                      onClick={() => append(f.code)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/40 font-mono"
                      title={f.name}
                    >
                      {f.code}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-6 gap-0.5">
                  {MM_COLORS.map((c) => (
                    <button
                      key={c.tag}
                      onClick={() => append(`<${c.tag}>`)}
                      title={`<${c.tag}>`}
                      className="size-6 rounded border border-border/40 hover:scale-110 transition-transform"
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                  {MM_FORMATS.map((f) => (
                    <button
                      key={f}
                      onClick={() => append(`<${f}></${f}>`)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/40"
                      title={`<${f}>`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                  <button
                    onClick={() => append("<gradient:#5555ff:#ff55ff>text</gradient>")}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 hover:bg-muted border border-border/40"
                  >
                    gradient
                  </button>
                  <button
                    onClick={() => append("<rainbow>text</rainbow>")}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 hover:bg-muted border border-border/40"
                  >
                    rainbow
                  </button>
                  <button
                    onClick={() => append("<hover:show_text:'tooltip'>text</hover>")}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 hover:bg-muted border border-border/40"
                  >
                    hover
                  </button>
                </div>
              </>
            )}

            <Preview value={value} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Tiny live preview of how the string would render in chat. */
function Preview({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="rounded border border-border/40 bg-background/60 px-2 py-1 font-mono text-[11px] leading-snug min-h-[24px]">
      {renderPreview(value)}
    </div>
  );
}

function renderPreview(input: string): React.ReactNode[] {
  // Very rough renderer — handles & codes and MiniMessage <tag>...</tag>
  const out: React.ReactNode[] = [];
  let buf = "";
  let style: React.CSSProperties = {};
  const stack: React.CSSProperties[] = [];
  let i = 0;
  const flush = () => {
    if (buf) {
      out.push(
        <span key={out.length} style={style}>
          {buf}
        </span>,
      );
      buf = "";
    }
  };
  while (i < input.length) {
    const ch = input[i];
    if (ch === "&" && i + 1 < input.length) {
      const c = input[i + 1].toLowerCase();
      const lc = LEGACY_COLORS.find((x) => x.code[1] === c);
      if (lc) {
        flush();
        style = { ...style, color: lc.hex };
        i += 2;
        continue;
      }
      const fmt: Record<string, React.CSSProperties> = {
        l: { fontWeight: 700 },
        o: { fontStyle: "italic" },
        n: { textDecoration: "underline" },
        m: { textDecoration: "line-through" },
        r: {},
      };
      if (fmt[c]) {
        flush();
        style = c === "r" ? {} : { ...style, ...fmt[c] };
        i += 2;
        continue;
      }
    }
    if (ch === "<") {
      const close = input.indexOf(">", i);
      if (close > -1) {
        const tag = input.slice(i + 1, close);
        if (tag.startsWith("/")) {
          flush();
          style = stack.pop() ?? {};
          i = close + 1;
          continue;
        }
        const [name, arg] = tag.split(":");
        const named = MM_COLORS.find((c) => c.tag === name);
        if (named) {
          flush();
          stack.push(style);
          style = { ...style, color: named.hex };
          i = close + 1;
          continue;
        }
        if (name === "bold") {
          flush();
          stack.push(style);
          style = { ...style, fontWeight: 700 };
          i = close + 1;
          continue;
        }
        if (name === "italic") {
          flush();
          stack.push(style);
          style = { ...style, fontStyle: "italic" };
          i = close + 1;
          continue;
        }
        if (name === "underlined") {
          flush();
          stack.push(style);
          style = { ...style, textDecoration: "underline" };
          i = close + 1;
          continue;
        }
        if (name === "color" && arg) {
          flush();
          stack.push(style);
          style = { ...style, color: arg };
          i = close + 1;
          continue;
        }
      }
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}
