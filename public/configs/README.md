# `public/configs/` — Drop-in plugin defaults

Every plugin sample shipped with the studio lives here as a real file.
The studio fetches `manifest.json` at runtime, so you can edit a YAML or
TOML in this folder and the change appears on the next page load — no
rebuild required.

## Layout

```
public/configs/
  manifest.json          # sample-id → { label, format, path }
  README.md
  <plugin>/
    config.yml
    messages.yml
    kits.yml
    ...
```

## Adding a brand-new plugin

1. Drop the file(s) here, e.g. `mynewplugin/config.yml`.
2. Register them in `manifest.json`:

   ```json
   "mynewplugin": {
     "label": "MyNewPlugin · config.yml",
     "format": "yaml",
     "path": "mynewplugin/config.yml"
   }
   ```

3. Add a detection signature in `src/lib/plugin-detect.ts` so the sidebar
   lists the plugin and auto-detect picks it up from pasted text.
4. (Optional) Add a schema in `src/lib/schema.ts` and a multi-file pack in
   `src/lib/plugin-packs.ts` for the one-click “Export pack” button.

## Updating an existing plugin

When a plugin ships a new default config, just overwrite the relevant file.

## Re-generating from the bundled samples

If you'd like to refresh this folder from `src/lib/sample-configs.ts` run:

```bash
bun run scripts/extract-configs.ts
```

That script wipes `public/configs/` and rewrites every file + manifest.

---

Currently bundled: 31 sample files across 27 plugins.
