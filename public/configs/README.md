# `public/configs/` — Drop-in plugin defaults

Every entry in this folder is fetched at runtime by the studio. When a user
clicks a plugin in the sidebar, the loader will:

1. Look up the plugin id in `manifest.json`. If a `path` is set there,
   `fetch('/configs/<path>')` is used as the source of truth.
2. Otherwise it falls back to the in-bundle sample shipped with the app
   (`src/lib/sample-configs.ts`).

This means you can update a plugin's reference config without rebuilding
the app — just drop a new YAML/TOML file here and add it to `manifest.json`.

## Folder layout

```
public/configs/
  manifest.json
  essentialsx/
    config.yml
    messages_en.yml
    kits.yml
    worth.yml
    spawn.yml
  luckperms/
    config.yml
    en.yml
  tab/
    config.yml
    messages.yml
```

Folder names are arbitrary — the manifest is the single source of truth.

## Adding a brand-new plugin

1. Add a sample file here, e.g. `mynewplugin/config.yml`.
2. Register it in `manifest.json`:
   ```json
   "mynewplugin": {
     "label": "MyNewPlugin · config.yml",
     "format": "yaml",
     "path": "mynewplugin/config.yml"
   }
   ```
3. Add a detection entry in `src/lib/plugin-detect.ts` (signature → `unique`
   + `any` keys + filename hints) using a new `PluginId` literal.
4. Optionally add a schema in `src/lib/schema.ts` for inline validation
   warnings, and a "pack" in `src/lib/plugin-packs.ts` if the plugin ships
   multiple files (config + messages + kits etc).

That's it — no build step, no rebundle. The sidebar populates from the
`PLUGIN_LIST` automatically.

## Updating an existing plugin's defaults

If a plugin (e.g. EssentialsX) ships a new default config, just overwrite the
relevant file in this folder. Changes take effect on the next page load.

## File formats

- `.yml` / `.yaml` — `format: "yaml"`
- `.toml` — `format: "toml"`
- `.json` — `format: "json"` (rare for MC plugins, but supported)
