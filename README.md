# ForgeYAML — Visual Config Studio for Minecraft Plugins

A premium, minimal no-code editor for Minecraft server plugin configurations.
Paste any YAML / TOML / JSON, the studio auto-detects the plugin, builds a
visual editor, and exports a clean file you can ship.

## Features

- **Auto-detect 50+ plugins** — LuckPerms, EssentialsX (config + messages +
  kits + worth + spawn), TAB, DeluxeMenus, DiscordSRV, Velocity, Paper,
  Spigot, Purpur, BungeeCord, Geyser, Floodgate, mcMMO, Jobs Reborn, Towny,
  Factions, Citizens, MythicMobs, WorldGuard, WorldEdit, Multiverse,
  CoreProtect, ItemsAdder, Oraxen, ModelEngine, BetonQuest, Quests,
  Dynmap/BlueMap/squaremap and more.
- **Format-agnostic** — parse and emit YAML, TOML and JSON with round-trip
  fidelity, including line-precise error reporting.
- **Visual editor** — typed inputs (toggles for booleans, numeric steppers,
  multi-line array inputs), nested collapsible sections, long-key handling
  so giant DiscordSRV keys never push the toggle off-screen.
- **Schema validation** — per-plugin required / recommended key checks with
  inline warnings. Add your own in `src/lib/schema.ts`.
- **Plugin packs** — one-click export of every related file for a plugin
  (e.g. EssentialsX exports `config.yml`, `messages_en.yml`, `kits.yml`,
  `worth.yml`, `spawn.yml` together).
- **Drop-in default configs** — `public/configs/` is the runtime override
  folder. Drop a fresh YAML in there and the studio uses it without a
  rebuild. See [`public/configs/README.md`](./public/configs/README.md).
- **Premium UX** — dark violet theme, framer-motion animations, undo / redo
  (`⌘Z` / `⌘⇧Z`), copy & download, drag-and-drop file upload, sticky
  scroll-to-top button on long configs, animated 4-step onboarding tour.
- **Responsive** — adapts from 360 px phones (drawer sidebar) up to 4K /
  ultra-wide (49″) displays (max-width clamped, panels share space evenly).
- **Vercel-ready** — static SPA, `vercel.json` rewrites included.

## Stack

- TanStack Start v1 (React 19, file-based routing)
- Vite 7 + Tailwind v4
- shadcn/ui + framer-motion + sonner
- `js-yaml` + `smol-toml` for parsers

## Adding a new plugin

1. **Sample config** — drop `public/configs/<plugin>/config.yml` and register
   it in `public/configs/manifest.json`. (See
   [public/configs/README.md](./public/configs/README.md).)
2. **Detection** — add a `PluginSignature` to `src/lib/plugin-detect.ts`
   with `unique` keys (high weight) and `any` keys (low weight) plus
   `filenames` hints.
3. **Schema (optional)** — add an entry in `src/lib/schema.ts` for inline
   validation warnings.
4. **Pack (optional)** — register a multi-file pack in
   `src/lib/plugin-packs.ts` if the plugin ships several files.

No build step needed for #1; the manifest is fetched at runtime.

## Branding

Edit `public/config.json` to change the studio's display name, tagline, and
which features are visible. Loaded by `src/lib/brand-config.ts` at boot.

## Scripts

```bash
bun install
bun run dev     # local dev server
bun run build   # production build to dist/
```

## License

MIT.
