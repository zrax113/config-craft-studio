// Heuristic YAML auto-fix for common copy-paste / human errors.
// Returns { fixed, applied } — list of human-readable fix descriptions.
import yaml from "js-yaml";

export interface AutoFixResult {
  fixed: string;
  applied: string[];
  ok: boolean;
}

export function autoFixYaml(input: string): AutoFixResult {
  let s = input;
  const applied: string[] = [];

  // 1. Strip BOM
  if (s.charCodeAt(0) === 0xfeff) {
    s = s.slice(1);
    applied.push("Removed UTF-8 BOM");
  }

  // 2. Normalize line endings
  if (/\r\n|\r/.test(s)) {
    s = s.replace(/\r\n?/g, "\n");
    applied.push("Normalized CRLF → LF line endings");
  }

  // 3. Replace smart quotes with straight
  if (/[\u2018\u2019\u201C\u201D]/.test(s)) {
    s = s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
    applied.push("Replaced smart quotes");
  }

  // 4. Replace tabs with two spaces (YAML disallows tab indent)
  if (/\t/.test(s)) {
    s = s
      .split("\n")
      .map((line) => {
        const m = line.match(/^(\t+)/);
        if (!m) return line.replace(/\t/g, "  ");
        return "  ".repeat(m[1].length) + line.slice(m[1].length).replace(/\t/g, "  ");
      })
      .join("\n");
    applied.push("Converted tabs to spaces");
  }

  // 5. Add space after `:` when missing (e.g. "key:value" → "key: value")
  // Skip lines that look like URLs (http:// etc) or time strings (12:30)
  const beforeColon = s;
  s = s
    .split("\n")
    .map((line) => {
      // ignore comments
      const idx = line.indexOf("#");
      const code = idx >= 0 ? line.slice(0, idx) : line;
      const tail = idx >= 0 ? line.slice(idx) : "";
      // match `  key:value` not `  key: value`, not `://`, not all-digits time
      const fixed = code.replace(
        /^(\s*[^\s#"'][^:#]*?):(?!\s|$|\/|\d{2}\b)([^\s])/,
        "$1: $2",
      );
      return fixed + tail;
    })
    .join("\n");
  if (s !== beforeColon) applied.push("Added missing space after `:`");

  // 6. Trailing whitespace
  const beforeTrim = s;
  s = s
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .join("\n");
  if (s !== beforeTrim) applied.push("Trimmed trailing whitespace");

  // 7. Ensure trailing newline
  if (!s.endsWith("\n")) {
    s += "\n";
    applied.push("Added trailing newline");
  }

  // 8. Try to balance an unmatched [ or { at line end (very conservative)
  // skipped — too risky for nested cases.

  // Validate
  let ok = false;
  try {
    yaml.load(s);
    ok = true;
  } catch {
    ok = false;
  }

  return { fixed: s, applied, ok };
}

/**
 * Generate a portable bash script that uploads files via sftp(1) — works on
 * any static host (no backend needed). User downloads, makes executable, runs.
 */
export function buildSftpScript(opts: {
  host: string;
  port: number;
  username: string;
  remoteDir: string;
  files: { path: string; contents: string }[];
}): string {
  const { host, port, username, remoteDir, files } = opts;
  const escapeHeredoc = (s: string) => s.replace(/EOF_FORGE/g, "EOF_FORGE_");
  const fileWrites = files
    .map(
      (f) =>
        `mkdir -p "$(dirname "./_forge_upload/${f.path}")"\ncat > "./_forge_upload/${f.path}" <<'EOF_FORGE'\n${escapeHeredoc(f.contents)}\nEOF_FORGE`,
    )
    .join("\n\n");
  const sftpCommands = files
    .map((f) => `-mkdir "${remoteDir}"\nput -P "_forge_upload/${f.path}" "${remoteDir}/${f.path}"`)
    .join("\n");

  return `#!/usr/bin/env bash
# ForgeYAML SFTP uploader — generated ${new Date().toISOString()}
# Usage:
#   chmod +x upload.sh && ./upload.sh
# Requires: sftp (OpenSSH). Will prompt for password unless you use a key.
set -euo pipefail

HOST="${host}"
PORT="${port}"
USER="${username}"
REMOTE="${remoteDir}"

mkdir -p _forge_upload
${fileWrites}

echo "Uploading $(find _forge_upload -type f | wc -l) file(s) to $USER@$HOST:$REMOTE …"

sftp -P "$PORT" -o StrictHostKeyChecking=accept-new "$USER@$HOST" <<SFTP_BATCH
${sftpCommands}
bye
SFTP_BATCH

echo "Done."
rm -rf _forge_upload
`;
}
