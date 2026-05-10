import yaml from "js-yaml";
import * as toml from "smol-toml";

export type ConfigFormat = "yaml" | "toml" | "json";

export interface ParseResult {
  ok: boolean;
  data: any;
  format: ConfigFormat | null;
  error?: { message: string; line?: number; column?: number };
}

export function parseConfig(raw: string, hint?: ConfigFormat): ParseResult {
  if (!raw.trim()) return { ok: false, data: null, format: null };

  const tryYaml = (): ParseResult => {
    try {
      const data = yaml.load(raw);
      return { ok: true, data, format: "yaml" };
    } catch (e: any) {
      return {
        ok: false,
        data: null,
        format: "yaml",
        error: {
          message: e?.reason || e?.message || "YAML parse error",
          line: e?.mark?.line != null ? e.mark.line + 1 : undefined,
          column: e?.mark?.column != null ? e.mark.column + 1 : undefined,
        },
      };
    }
  };

  const tryToml = (): ParseResult => {
    try {
      const data = toml.parse(raw);
      return { ok: true, data, format: "toml" };
    } catch (e: any) {
      return {
        ok: false,
        data: null,
        format: "toml",
        error: {
          message: e?.message || "TOML parse error",
          line: e?.line,
          column: e?.column,
        },
      };
    }
  };

  const tryJson = (): ParseResult => {
    try {
      return { ok: true, data: JSON.parse(raw), format: "json" };
    } catch (e: any) {
      return { ok: false, data: null, format: "json", error: { message: e?.message ?? "JSON error" } };
    }
  };

  if (hint === "yaml") return tryYaml();
  if (hint === "toml") return tryToml();
  if (hint === "json") return tryJson();

  // Auto-detect by content
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const j = tryJson();
    if (j.ok) return j;
  }
  // TOML hallmarks: bare table headers like [section] at line start, or key = value with no indent
  const tomlLikely = /^\[[a-zA-Z0-9_.\-"' ]+\]\s*$/m.test(raw) && /^[a-zA-Z0-9_-]+\s*=\s*/m.test(raw);
  if (tomlLikely) {
    const t = tryToml();
    if (t.ok) return t;
  }
  const y = tryYaml();
  if (y.ok) return y;
  // fallback: return whichever error is most descriptive
  return y;
}

export function dumpConfig(data: any, format: ConfigFormat): string {
  if (format === "yaml") return yaml.dump(data, { indent: 2, lineWidth: 120, noRefs: true });
  if (format === "toml") return toml.stringify(data);
  return JSON.stringify(data, null, 2);
}
