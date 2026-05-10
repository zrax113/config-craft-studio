// Extract every entry in src/lib/sample-configs.ts SAMPLES into
// public/configs/<plugin>/<file> and build manifest.json.
import { SAMPLES } from "./src/lib/sample-configs.ts";
import { PLUGIN_LIST } from "./src/lib/plugin-detect.ts";
import fs from "node:fs";
import path from "node:path";

const ROOT = "public/configs";

// Folder overrides where the id doesn't map cleanly to a vendor name
const FOLDER_OVERRIDES: Record<string, string> = {
  essentials: "essentialsx",
  essentials_messages: "essentialsx",
  essentials_kits: "essentialsx",
  essentials_worth: "essentialsx",
  essentials_spawns: "essentialsx",
  essentialsxchat: "essentialsx-chat",
  essentialsxgeoip: "essentialsx-geoip",
  luckperms_messages: "luckperms",
  tab_messages: "tab",
  discordsrv_messages: "discordsrv",
  townyadvanced: "towny",
  bungeecord: "bungeecord",
  papimacros: "placeholderapi",
};

function folderFor(id: string) {
  if (FOLDER_OVERRIDES[id]) return FOLDER_OVERRIDES[id];
  return id.replace(/_(messages|kits|worth|spawns)$/, "");
}

function filenameFor(id: string, label: string, format: string) {
  // Try to read filename from "Plugin · filename.yml"
  const parts = label.split("\u00b7").map((s) => s.trim());
  if (parts.length >= 2 && /\.[a-z0-9]+$/i.test(parts[1])) return parts[1];
  const ext = format === "toml" ? "toml" : format === "json" ? "json" : "yml";
  return `${id}.${ext}`;
}

fs.rmSync(ROOT, { recursive: true, force: true });
fs.mkdirSync(ROOT, { recursive: true });

const manifest: Record<string, { label: string; format: string; path: string }> = {};
let written = 0;

for (const [id, sample] of Object.entries(SAMPLES) as [string, any][]) {
  if (!sample) continue;
  const folder = folderFor(id);
  const filename = filenameFor(id, sample.label, sample.format);
  const rel = path.posix.join(folder, filename);
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, sample.content);
  manifest[id] = { label: sample.label, format: sample.format, path: rel };
  written++;
}

// Manifest header + samples
const manifestPath = path.join(ROOT, "manifest.json");
fs.writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      $comment:
        "Drop-in plugin defaults. Each sample id maps to a YAML/TOML file in this folder. See README.md for how to add new plugins.",
      generated: new Date().toISOString(),
      samples: manifest,
    },
    null,
    2,
  ) + "\n",
);

// README — keep the docs alongside the data
const readme = `# \`public/configs/\` — Drop-in plugin defaults

Every plugin sample shipped with the studio lives here as a real file.
The studio fetches \`manifest.json\` at runtime, so you can edit a YAML or
TOML in this folder and the change appears on the next page load — no
rebuild required.

## Layout

\`\`\`
public/configs/
  manifest.json          # sample-id → { label, format, path }
  README.md
  <plugin>/
    config.yml
    messages.yml
    kits.yml
    ...
\`\`\`

## Adding a brand-new plugin

1. Drop the file(s) here, e.g. \`mynewplugin/config.yml\`.
2. Register them in \`manifest.json\`:

   \`\`\`json
   "mynewplugin": {
     "label": "MyNewPlugin \u00b7 config.yml",
     "format": "yaml",
     "path": "mynewplugin/config.yml"
   }
   \`\`\`

3. Add a detection signature in \`src/lib/plugin-detect.ts\` so the sidebar
   lists the plugin and auto-detect picks it up from pasted text.
4. (Optional) Add a schema in \`src/lib/schema.ts\` and a multi-file pack in
   \`src/lib/plugin-packs.ts\` for the one-click “Export pack” button.

## Updating an existing plugin

When a plugin ships a new default config, just overwrite the relevant file.

## Re-generating from the bundled samples

If you'd like to refresh this folder from \`src/lib/sample-configs.ts\` run:

\`\`\`bash
bun run scripts/extract-configs.ts
\`\`\`

That script wipes \`public/configs/\` and rewrites every file + manifest.

---

Currently bundled: ${written} sample files across ${
  new Set(Object.values(manifest).map((m) => m.path.split("/")[0])).size
} plugins.
`;

fs.writeFileSync(path.join(ROOT, "README.md"), readme);

const plugins = new Set(Object.values(manifest).map((m) => m.path.split("/")[0]));
console.log(`Wrote ${written} files across ${plugins.size} plugins.`);
console.log(`Total plugins in PLUGIN_LIST: ${PLUGIN_LIST.length}`);
const missing = PLUGIN_LIST.filter((p) => !manifest[p.id]).map((p) => p.id);
console.log(`No bundled sample for ${missing.length} plugin ids:`, missing.join(", "));
