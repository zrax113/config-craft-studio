import type { PluginId } from "./plugin-detect";

export const SAMPLES: Record<Exclude<PluginId, "unknown">, string> = {
  luckperms: `# LuckPerms config
storage-method: H2
data:
  address: localhost
  database: minecraft
  username: root
  password: ''
sync-minutes: 0
meta-formatting:
  prefix:
    format: highest
    duplicates: first-only
  suffix:
    format: highest
group-name-rewrite:
  default: Member
primary-group-calculation: stored
log-notify: true
auto-install-translations: true
`,
  essentials: `# EssentialsX config
nickname-prefix: '~'
currency-symbol: '$'
starting-balance: 100.0
ops-name-color: 'c'
spawn-on-join: false
teleport-cooldown: 0
teleport-delay: 0
chat:
  format: '<{DISPLAYNAME}> {MESSAGE}'
  radius: 0
death-messages: true
`,
  tab: `# TAB plugin config
scoreboard-teams:
  enabled: true
  enable-collision: true
  invisible-nametags: false
header-footer:
  enabled: true
  header:
    - '&aWelcome to the server'
  footer:
    - '&7play.example.net'
tablist-name-formatting:
  enabled: true
  anti-override: true
belowname-objective:
  enabled: false
yellow-number-in-tablist:
  enabled: true
  value: '%ping%'
`,
  deluxemenus: `# DeluxeMenus menu
menu_title: '&aServer Menu'
open_command: menu
inventory_type: CHEST
size: 27
items:
  spawn:
    material: COMPASS
    slot: 11
    display_name: '&bSpawn'
    lore:
      - '&7Click to teleport to spawn'
    commands:
      - '[player] spawn'
  shop:
    material: EMERALD
    slot: 15
    display_name: '&aShop'
    lore:
      - '&7Open the shop'
    commands:
      - '[player] shop'
`,
};
