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
  luckperms_messages: {
    label: "LuckPerms · messages",
    format: "yaml",
    content: `prefix: '&7[&bLP&7] '
command-not-recognised: '&cCommand not recognised.'
no-permission: '&cYou do not have permission to use this command.'
user-not-found: '&cA user for &b{0}&c could not be found.'
group-not-found: '&cA group named &b{0}&c could not be found.'
user-info:
  general: |-
    &b&l> &bUser Info: &f{0}
    &7- &fUUID: &b{1}
    &7- &fStatus: {2}
group-info:
  general: |-
    &b&l> &bGroup Info: &f{0}
    &7- &fWeight: &b{1}
`,
  },
  essentials: {
    label: "EssentialsX · config",
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
  essentials_messages: {
    label: "EssentialsX · messages",
    format: "yaml",
    content: `# EssentialsX messages_en.yml
noPerm: '\\u00a74You do not have permission to access that command.'
noAccessCommand: '\\u00a74You do not have access to that command.'
alertFormat: '\\u00a73[\\u00a7c{0}\\u00a73][\\u00a7a{1}\\u00a73] \\u00a7f{2}'
balance: '\\u00a7aBalance:\\u00a7c {0}'
balanceTop: '\\u00a76Top balances ({0})'
teleport: '\\u00a76Teleporting...'
teleportAtoB: '\\u00a76{0}\\u00a76 teleported you to {1}\\u00a76.'
kitGiven: '\\u00a76Giving kit \\u00a7c{0}\\u00a76.'
homeSet: '\\u00a76Home set to current location.'
warpSet: '\\u00a76Warp \\u00a7c{0}\\u00a76 has been set.'
moneyTaken: '\\u00a7c{0}\\u00a76 has been taken from your account.'
moneyRecievedFrom: '\\u00a7a{0} has been received from {1}'
day: day
days: days
hour: hour
hours: hours
minute: minute
minutes: minutes
second: second
seconds: seconds
`,
  },
  essentials_kits: {
    label: "EssentialsX · kits",
    format: "yaml",
    content: `kits:
  starter:
    delay: 10
    items:
      - stone_sword
      - bread 16
      - leather_helmet
      - leather_chestplate
      - leather_leggings
      - leather_boots
  pvp:
    delay: 600
    items:
      - diamond_sword unbreaking:3
      - golden_apple 8
      - cooked_beef 32
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
  tab_messages: {
    label: "TAB · messages",
    format: "yaml",
    content: `reload-success: '&2Successfully reloaded'
reload-fail: '&cFailed to reload, see console for more info.'
data-removed: '&3All data has been successfully removed from %target%'
unknown-command: '&cUnknown command. Try &6/tab help'
no-permission: '&cYou do not have permission to perform this command.'
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
motd = "<#a78bfa>A Velocity Server"
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
  discordsrv_messages: {
    label: "DiscordSRV · messages",
    format: "yaml",
    content: `MinecraftChatToDiscordMessage:
  Content: '%username% » %message%'
DiscordToMinecraftChatMessage:
  Content: '&b[Discord] &f<%username%> &7%message%'
DiscordChatChannelTopicFormat: 'Online: %playercount%/%playermax% — %motd%'
DiscordPlayerListCommandMessage:
  Content: '**Online players (%playercount%/%playermax%)**: %playerlist%'
ServerStartupMessage: ':white_check_mark: **Server has started.**'
ServerShutdownMessage: ':octagonal_sign: **Server is shutting down.**'
PlayerJoinMessage:
  Content: ':arrow_right: **%username% joined the game**'
PlayerLeaveMessage:
  Content: ':arrow_left: **%username% left the game**'
`,
  },
  shopgui: {
    label: "ShopGUI+",
    format: "yaml",
    content: `shops:
  food:
    name: '&aFood'
    item:
      type: COOKED_BEEF
      quantity: 1
    rows: 3
    items:
      1:
        type: ITEM
        item:
          type: BREAD
          quantity: 1
        slot: 10
        buyPrice: 5
        sellPrice: 1
`,
  },
  huskhomes: {
    label: "HuskHomes",
    format: "yaml",
    content: `max_homes: 5
max_public_homes: 2
set_warp_command: true
cross_server:
  enabled: false
  cluster_id: ''
rtp:
  cooldown_length: 30
  radius: 5000
`,
  },
};

export const SAMPLE_LIST = Object.entries(SAMPLES) as [PluginId, NonNullable<(typeof SAMPLES)[PluginId]>][];
