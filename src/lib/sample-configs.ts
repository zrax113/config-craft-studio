import type { PluginId } from "./plugin-detect";

export const SAMPLES: Partial<Record<PluginId, { label: string; content: string; format: "yaml" | "toml" }>> = {
  luckperms: {
    label: "LuckPerms",
    format: "yaml",
    content: `storage-method: H2
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
  },
  essentials: {
    label: "EssentialsX",
    format: "yaml",
    content: `nickname-prefix: '~'
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
  },
  tab: {
    label: "TAB",
    format: "yaml",
    content: `scoreboard-teams:
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
  },
  deluxemenus: {
    label: "DeluxeMenus",
    format: "yaml",
    content: `menu_title: '&aServer Menu'
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
  },
  velocity: {
    label: "Velocity",
    format: "toml",
    content: `config-version = "2.7"
bind = "0.0.0.0:25577"
motd = "<#09add3>A Velocity Server"
show-max-players = 500
online-mode = true
prevent-client-proxy-connections = false
player-info-forwarding-mode = "MODERN"

[servers]
lobby = "127.0.0.1:30066"
factions = "127.0.0.1:30067"
minigames = "127.0.0.1:30068"
try = ["lobby"]

[forced-hosts]
"lobby.example.com" = ["lobby"]
"factions.example.com" = ["factions"]

[advanced]
compression-threshold = 256
compression-level = -1
login-ratelimit = 3000
connection-timeout = 5000
`,
  },
  paper: {
    label: "Paper",
    format: "yaml",
    content: `_version: 28
settings:
  load-permissions-yml-before-plugins: true
  velocity-support:
    enabled: false
    online-mode: false
  bungee-online-mode: true
messages:
  no-permission: '<red>I''m sorry, but you do not have permission'
world-settings:
  default:
    anti-xray:
      enabled: true
      engine-mode: 1
    chunks:
      auto-save-interval: -1
`,
  },
  worldguard: {
    label: "WorldGuard",
    format: "yaml",
    content: `regions:
  enable: true
  high-frequency-flags: false
  use-paper-entity-origin: false
summary-on-start: true
host-keys: {}
build-permission-nodes:
  enable: false
  deny-message: '&cYou do not have permission to build here.'
`,
  },
  discordsrv: {
    label: "DiscordSRV",
    format: "yaml",
    content: `BotToken: 'YOUR_TOKEN_HERE'
Channels:
  global: '0000000000'
DiscordChatChannelMinecraftToDiscord: true
DiscordChatChannelDiscordToMinecraft: true
DiscordConsoleChannelId: '0'
`,
  },
};

export const SAMPLE_LIST = Object.entries(SAMPLES) as [PluginId, NonNullable<(typeof SAMPLES)[PluginId]>][];
