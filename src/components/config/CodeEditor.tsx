import { useEffect, useRef } from "react";
import type { ConfigFormat } from "@/lib/config-parser";

interface Props {
  value: string;
  onChange: (v: string) => void;
  format: ConfigFormat | null;
  errorLine?: number;
  placeholder?: string;
}

export function CodeEditor({ value, onChange, format, errorLine, placeholder }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const lines = value.split("\n");
  const total = Math.max(lines.length, 12);

  // Sync scroll
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    const handler = () => {
      if (lineRef.current) lineRef.current.scrollTop = ta.scrollTop;
      if (highlightRef.current) highlightRef.current.scrollTop = ta.scrollTop;
    };
    ta.addEventListener("scroll", handler);
    return () => ta.removeEventListener("scroll", handler);
  }, []);

  // Tab insertion
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.slice(0, start) + "  " + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }

  return (
    <div className="relative flex-1 rounded-xl border border-border/60 bg-background/70 overflow-hidden font-mono text-[12.5px] leading-[1.55]">
      <div className="absolute inset-0 flex">
        {/* Gutter */}
        <div
          ref={lineRef}
          className="w-10 shrink-0 py-3 text-right pr-2 text-muted-foreground/50 select-none overflow-hidden border-r border-border/40 bg-muted/20"
        >
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1;
            const isError = errorLine === n;
            return (
              <div
                key={n}
                className={
                  isError
                    ? "text-destructive font-semibold"
                    : ""
                }
              >
                {n}
              </div>
            );
          })}
        </div>

        {/* Error line highlight */}
        {errorLine && (
          <div
            ref={highlightRef}
            className="absolute left-10 right-0 top-0 bottom-0 pointer-events-none overflow-hidden"
          >
            <div
              className="absolute left-0 right-0 bg-destructive/15 border-l-2 border-destructive"
              style={{
                top: `calc(${(errorLine - 1) * 1.55}em + 0.75rem)`,
                height: "1.55em",
              }}
            />
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          placeholder={placeholder}
          className="flex-1 py-3 pl-3 pr-3 bg-transparent resize-none outline-none text-foreground/95 placeholder:text-muted-foreground/50 caret-primary"
        />
      </div>
      {/* Format badge */}
      {format && (
        <div className="absolute top-2 right-2 text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/50 backdrop-blur">
          {format}
        </div>
      )}
    </div>
  );
}
