import type { PluginId } from "./plugin-detect";

/**
 * Full, realistic sample configs — close to defaults shipped with each plugin.
 * Trimmed only to remove license headers and very long enum tables; structure preserved.
 */
export const SAMPLES: Partial<Record<PluginId, { label: string; content: string; format: "yaml" | "toml" }>> = {
  luckperms: {
    label: "LuckPerms · config.yml",
    format: "yaml",
    content: `server: global
sync-minutes: 0
watch-files: true

storage-method: H2
data:
  address: localhost
  database: minecraft
  username: root
  password: ''
  pool-settings:
    maximum-pool-size: 10
    minimum-idle: 10
    maximum-lifetime: 1800000
    keepalive-time: 0
    connection-timeout: 5000
    properties:
      useUnicode: true
      characterEncoding: utf8
  table-prefix: 'luckperms_'

split-storage:
  enabled: false
  methods:
    user: h2
    group: h2
    track: h2
    uuid: h2
    log: h2

messaging-service: auto
auto-install-translations: true

use-server-uuids: true
use-bukkit-connection-throttle: false
use-vault-server: global
vault-unsafe-lookups: false
vault-group-use-displaynames: true
vault-primary-groups-overrides:
  enabled: false
  list:
    - default
vault-numeric-priority: true
vault-debug: false

primary-group-calculation: stored
group-name-rewrite: {}
group-weight: {}

meta-formatting:
  prefix:
    format: highest
    duplicates: first-only
    separator: ''
    start-spacer: ''
    end-spacer: ''
  suffix:
    format: highest
    duplicates: first-only
    separator: ''
    start-spacer: ''
    end-spacer: ''

log-synchronously-in-commands: false
commands-allow-op: true
disabled-contexts: []
require-sender-group-membership-to-modify: false

inheritance-traversal-algorithm: depth-first-pre-order
post-traversal-inheritance-sort: none

prevent-primary-group-removal: false
argument-based-command-permissions: false
require-sender-group-membership-to-modify-self: false

resolve-command-selectors: false
register-shorthand-commands: true

log-notify: true
auto-op: false
enable-ops: true
commands-rate-limit: false
`,
  },
  luckperms_messages: {
    label: "LuckPerms · lang/en.yml",
    format: "yaml",
    content: `prefix: '&7[&bLP&7] '

command-not-recognised: '&cCommand not recognised.'
command-no-permission: '&cYou do not have permission to use this command.'
no-permission-for-subcommands: '&cYou do not have permission to use any sub commands.'

first-time-setup: |
  &b&l>  &bRun &h/&blp createGroup admin&7 to create your first group.
  &7Then add yourself with &h/lp user <name> parent set admin&7.

user-not-found: '&cA user for &b{0}&c could not be found.'
user-not-online: '&cUser &b{0}&c is not online.'
user-invalid-entry: '&b{0}&c is not a valid username/uuid.'

group-not-found: '&cA group named &b{0}&c could not be found.'
track-not-found: '&cA track named &b{0}&c could not be found.'

user-info:
  general: |-
    &b&l> &bUser Info: &f{0}
    &7- &fUUID:    &b{1}
    &7    &7(type: &8{2}&7)
    &7- &fStatus:  {3}
    &7- &fPrimary Group: &b{4}
  contextual-data:
    header: '&f- &aContextual Data:'
    prefix: '&f-    &3Prefix: {0}'
    suffix: '&f-    &3Suffix: {0}'
    meta: '&f-    &3Meta: {0}'

group-info:
  general: |-
    &b&l> &bGroup Info: &f{0}
    &7- &fDisplay Name:  &b{1}
    &7- &fWeight:        &b{2}
    &7- &fContextual Data: &b{3}
  contextual-data:
    prefix: '&f-     &3Prefix: {0}'
    suffix: '&f-     &3Suffix: {0}'

setperm-success: '&aSet &b{0}&a to &b{1}&a for &b{2}&a in context {3}&a.'
unsetperm-success: '&aUnset &b{0}&a for &b{1}&a in context {2}&a.'
setparent-success: '&b{0}&a had their primary group set to &b{1}&a in context {2}&a.'
unsetparent-success: '&b{0}&a no longer inherits &b{1}&a in context {2}&a.'
`,
  },
  essentials: {
    label: "EssentialsX · config.yml",
    format: "yaml",
    content: `# EssentialsX config
nickname-prefix: '~'
op-prefix: '&4[Op]&f'
hide-displayname-in-vanish: true

teleport-cooldown: 0
teleport-delay: 0
teleport-invulnerability: 4
teleport-when-free-from-jail: true
cancel-afk-on-move: true
cancel-afk-on-interact: true
auto-afk: 300
auto-afk-kick: -1
freeze-afk-players: false

heal-cooldown: 60
command-cooldowns:
  pay: 5
  sethome: 60
  tpa: 5

currency-symbol: '$'
max-money: 10000000000000
min-money: -10000
starting-balance: 1000
worth-money: 1
currency-format: '#,##0.00'
locale: en

ops-name-color: c
debug: false
locale-language: en
spawn-on-join: false
respawn-at-home: false
update-bed-at-daytime: true

home-homes-per-player: 3
homes-per-player: 3

socialspy-by-default: false
muted-players-can-still-use-socialspy: false

chat:
  format: '<{DISPLAYNAME}> {MESSAGE}'
  group-formats:
    Owner: '&8[&4{GROUP}&8]&f {DISPLAYNAME}: &7{MESSAGE}'
    Admin: '&8[&c{GROUP}&8]&f {DISPLAYNAME}: &7{MESSAGE}'
    Default: '&7{DISPLAYNAME}&8»&7 {MESSAGE}'
  radius: 0
  shout-format: '&6[Shout]&f {DISPLAYNAME}: &7{MESSAGE}'
  question-format: '&6[?]&f {DISPLAYNAME}: &7{MESSAGE}'

newbies:
  announce-format: 'Welcome {DISPLAYNAME} to the server!'
  spawnpoint: newbies
  kit: ''

kits:
  tools:
    delay: 600
    items:
      - 272 1
      - 273 1
      - 274 1
      - 275 1

backup:
  interval: 30
  command: ''

economy:
  log-enabled: false

protect:
  prevent:
    lava-flow: false
    water-flow: false
    water-bucket-flow: false
    fire-spread: true
    lava-fire-spread: true
    flint-fire: false
    lightning-fire-spread: true
    portal-creation: false
    tnt-explosion: false
    tnt-playerdamage: false
    tnt-blockdamage: false
    creeper-explosion: false
    creeper-playerdamage: false
    creeper-blockdamage: false
    enderdragon-blockdamage: true
    enderman-pickup: false
    villager-death: false

  guard-block:
    place: false
    use: false

  signs:
    - colorize
    - command
    - balance
    - buy
    - sell
    - free
    - disposal
    - heal
    - mail
    - protection
    - time
    - warp
    - kit
    - enchant

death-messages: true
muted-players-can-have-fun: false
remove-god-on-disconnect: false
remove-effects-on-death: true
spawn-if-no-home: false
hide-permissionless-help: true
disabled-commands: []
overridden-commands: []
player-commands:
  - afk
  - balance
  - balancetop
  - bigtree
  - book
  - chat
  - clearinventory
  - delhome
  - depth
  - eco.loan
  - getpos
  - hat
  - help
  - helpop
  - home
  - ignore
  - info
  - itemdb
  - itemname
  - kit
  - kits
  - list
  - mail
  - me
  - motd
  - msg
  - near
  - nick
  - pay
  - ping
  - powertool
  - powertooltoggle
  - protect
  - rules
  - seen
  - sell
  - sethome
  - setxmpp
  - signs
  - spawn
  - suicide
  - tpa
  - tpaccept
  - tpahere
  - tpdeny
  - warp
  - whois
  - workbench
`,
  },
  essentials_messages: {
    label: "EssentialsX · messages_en.yml",
    format: "yaml",
    content: `# EssentialsX messages
noPerm: '\\u00a74You do not have permission to access that command.'
noAccessCommand: '\\u00a74You do not have access to that command.'
noAccessPermission: '\\u00a74You do not have permission to access \\u00a7c{0}\\u00a74.'
noKitGroup: '\\u00a74You do not have permission to use that kit.'
noKitPermission: '\\u00a74You need the \\u00a7c{0}\\u00a74 permission to use this kit.'

alertFormat: '\\u00a73[\\u00a7c{0}\\u00a73][\\u00a7a{1}\\u00a73] \\u00a7f{2}'
alertBroke: 'broke:'
alertPlaced: 'placed:'
alertUsed: 'used:'

balance: '\\u00a7aBalance:\\u00a7c {0}'
balanceOther: '\\u00a7aBalance of {0}:\\u00a7c {1}'
balanceTop: '\\u00a76Top balances ({0})'

teleport: '\\u00a76Teleporting...'
teleportAtoB: '\\u00a76{0}\\u00a76 teleported you to {1}\\u00a76.'
teleportToPlayer: '\\u00a76Teleporting to \\u00a7c{0}\\u00a76.'
teleportationDisabled: '\\u00a76Teleportation disabled.'
teleportationEnabled: '\\u00a76Teleportation enabled.'

requestSent: '\\u00a76Request sent to \\u00a7c{0}\\u00a76.'
requestAccepted: '\\u00a76Teleport request accepted.'
requestDenied: '\\u00a76Teleport request denied.'
requestTimedOut: '\\u00a76Teleport request has timed out.'

kitGiven: '\\u00a76Giving kit \\u00a7c{0}\\u00a76.'
kitTimed: '\\u00a74You can''t use that kit again for another \\u00a7c{0}\\u00a74.'
kitNotFound: '\\u00a74That kit does not exist.'

homes: '\\u00a76Homes: {0}'
homeSet: '\\u00a76Home set to current location.'
homeSetToBed: '\\u00a76Your home is now set to this bed.'
deleteHome: '\\u00a76Home \\u00a7c{0}\\u00a76 has been removed.'

warps: '\\u00a76Warps: {0}'
warpSet: '\\u00a76Warp \\u00a7c{0}\\u00a76 has been set.'
warpingTo: '\\u00a76Warping to \\u00a7c{0}\\u00a76.'

moneyTaken: '\\u00a7c{0}\\u00a76 has been taken from your account.'
moneyAdded: '\\u00a7a{0}\\u00a76 has been given to {1}.'
moneyRecievedFrom: '\\u00a7a{0} has been received from {1}'
moneySentTo: '\\u00a7a{0} has been sent to {1}'
insufficientFunds: '\\u00a74Insufficient funds.'

playerMuted: '\\u00a76You have been muted'
playerUnmuted: '\\u00a76You are no longer muted'
playerBanned: '\\u00a74Player {0} banned {1} for {2}'
playerKicked: '\\u00a74Player {0} kicked {1} for {2}'

day: day
days: days
hour: hour
hours: hours
minute: minute
minutes: minutes
second: second
seconds: seconds
year: year
years: years

unknownCommand: '\\u00a74Unknown command. Type "/help" for help.'
errorWithMessage: '\\u00a74Error: {0}'
`,
  },
  essentials_kits: {
    label: "EssentialsX · kits.yml",
    format: "yaml",
    content: `kits:
  starter:
    delay: 10
    items:
      - stone_sword unbreaking:1
      - bread 16
      - leather_helmet
      - leather_chestplate
      - leather_leggings
      - leather_boots
  miner:
    delay: 600
    items:
      - iron_pickaxe efficiency:2 unbreaking:2
      - iron_shovel efficiency:2
      - torch 64
      - bread 32
  pvp:
    delay: 1800
    items:
      - diamond_sword sharpness:3 unbreaking:3
      - golden_apple 8
      - cooked_beef 32
      - diamond_helmet protection:2
      - diamond_chestplate protection:2
      - diamond_leggings protection:2
      - diamond_boots feather_falling:3
  builder:
    delay: 3600
    items:
      - cobblestone 256
      - oak_planks 128
      - glass 64
      - oak_door 8
`,
  },
  tab: {
    label: "TAB · config.yml",
    format: "yaml",
    content: `scoreboard-teams:
  enabled: true
  enable-collision: true
  invisible-nametags: false
  anti-override: true
  sorting:
    enabled: true
    case-sensitive-sorting: true
    sorting-types:
      - 'GROUPS:owner,admin,mod,vip,default'
      - 'PLACEHOLDER_A_TO_Z:%player%'
  unlimited-nametag-mode:
    enabled: false
    use-marker-tag-for-1-8-x-clients: false
    disable-on-boats: true
    space-between-lines: 0.22
    disable-condition: '%world%=disabledworld'
    dynamic-lines:
      - abovename
      - nametag
      - belowname
    static-lines: {}

header-footer:
  enabled: true
  header:
    - '&3&l»  &bExampleNetwork  &3&l«'
    - '&7Welcome &f%player%'
  footer:
    - '&7play.example.net'
    - '&8Players online: &b%online%&7/&b%maxplayers%'
  per-world: {}
  per-server: {}

tablist-name-formatting:
  enabled: true
  anti-override: true
  align-tabsuffix-on-the-right: true
  character-width-overrides: {}

yellow-number-in-tablist:
  enabled: true
  value: '%ping%'

belowname-objective:
  enabled: false
  value: '%health%'
  title: 'Health'

bossbar:
  enabled: false
  toggle-command: '/bossbar'
  remember-toggle-choice: false
  hidden-by-default: false
  bars:
    ServerInfo:
      style: PROGRESS
      color: GREEN
      progress: '100'
      text: '&aWelcome to the server!'

scoreboard:
  enabled: false
  toggle-command: '/sb'
  remember-toggle-choice: false
  hidden-by-default: false
  use-numbers: false
  scoreboards:
    scoreboard-default:
      title: '&3&lExample'
      lines:
        - ''
        - '&fPlayer: &b%player%'
        - '&fPing: &b%ping%ms'
        - '&fOnline: &b%online%'
        - ''

global-playerlist:
  enabled: false

per-world-playerlist:
  enabled: false

placeholders:
  date-format: 'dd.MM.yyyy'
  time-format: '[HH:mm:ss / h:mm a]'
  time-offset: 0
  register-tab-expansion: true

placeholder-output-replacements: {}

mysql:
  enabled: false
  host: 127.0.0.1
  port: 3306
  database: tab
  username: user
  password: pass
`,
  },
  velocity: {
    label: "Velocity · velocity.toml",
    format: "toml",
    content: `# Velocity configuration
config-version = "2.7"
bind = "0.0.0.0:25577"
motd = "<#a78bfa><b>A Velocity Server</b>"
show-max-players = 500
online-mode = true
force-key-authentication = true
prevent-client-proxy-connections = false
player-info-forwarding-mode = "MODERN"
forwarding-secret-file = "forwarding.secret"
announce-forge = false
kick-existing-players = false
ping-passthrough = "DISABLED"
sample-players-in-ping = false
enable-player-address-logging = true

[servers]
lobby = "127.0.0.1:30066"
factions = "127.0.0.1:30067"
minigames = "127.0.0.1:30068"
try = ["lobby"]

[forced-hosts]
"lobby.example.com" = ["lobby"]
"factions.example.com" = ["factions"]
"minigames.example.com" = ["minigames"]

[advanced]
compression-threshold = 256
compression-level = -1
login-ratelimit = 3000
connection-timeout = 5000
read-timeout = 30000
haproxy-protocol = false
tcp-fast-open = false
bungee-plugin-message-channel = true
show-ping-requests = false
failover-on-unexpected-server-disconnect = true
announce-proxy-commands = true
log-command-executions = false
log-player-connections = true
accepts-transfers = false

[query]
enabled = false
port = 25577
map = "Velocity"
show-plugins = false
`,
  },
  paper: {
    label: "Paper · paper-global.yml",
    format: "yaml",
    content: `_version: 30
async-chunks:
  threads: -1
block-updates:
  disable-chorus-plant-updates: false
  disable-mushroom-block-updates: false
  disable-noteblock-updates: false
  disable-tripwire-updates: false
chunk-loading-advanced:
  auto-config-send-distance: true
  player-max-concurrent-chunk-generates: 0
  player-max-concurrent-chunk-loads: 0
chunk-loading-basic:
  player-max-chunk-generate-rate: -1.0
  player-max-chunk-load-rate: 100.0
  player-max-chunk-send-rate: 75.0
chunk-system:
  gen-parallelism: default
  io-threads: -1
  worker-threads: -1
collisions:
  enable-player-collisions: true
  send-full-pos-for-hard-colliding-entities: true
commands:
  fix-target-selector-tag-completion: true
  ride-command-allow-player-as-vehicle: false
  suggest-player-names-when-null-tab-completions: true
  time-command-affects-all-worlds: false
console:
  enable-brigadier-completions: true
  enable-brigadier-highlighting: true
  has-jline: true
item-validation:
  display-name: 8192
  loc-name: 8192
  lore: 8192
  resolve-selectors-in-books: false
  book:
    title: 8192
    author: 8192
    page: 16384
  book-size:
    page-max: 2560
    total-multiplier: 0.98
logging:
  deobfuscate-stacktraces: true
  log-player-ip-addresses: true
  use-rgb-for-named-text-colors: true
messages:
  kick:
    authentication-servers-down: <lang:multiplayer.disconnect.authservers_down>
    connection-throttle: Connection throttled! Please wait before reconnecting.
    flying-player: <lang:multiplayer.disconnect.flying>
    flying-vehicle: <lang:multiplayer.disconnect.flying>
  no-permission: <red>I'm sorry, but you do not have permission to perform this command.
misc:
  chat-threads:
    chat-executor-core-size: -1
    chat-executor-max-size: -1
  compression-level: default
  fix-entity-position-desync: true
  load-permissions-yml-before-plugins: true
  max-joins-per-tick: 5
  region-file-cache-size: 256
  use-alternative-luck-formula: false
  use-dimension-type-for-custom-spawners: false
packet-limiter:
  all-packets:
    action: KICK
    interval: 7.0
    max-packet-rate: 500.0
  kick-message: <red><lang:disconnect.exceeded_packet_rate>
proxies:
  proxy-protocol: false
  bungee-cord:
    online-mode: true
  velocity:
    enabled: false
    online-mode: false
    secret: ''
scoreboards:
  save-empty-scoreboard-teams: false
  track-plugin-scoreboards: false
spam-limiter:
  incoming-packet-threshold: 300
  recipe-spam-increment: 1
  recipe-spam-limit: 20
  tab-spam-increment: 1
  tab-spam-limit: 500
timings:
  enabled: false
  hidden-config-entries:
    - database
    - settings.bungeecord-addresses
    - proxies.velocity.secret
  history-interval: 300
  history-length: 3600
  server-name: Unknown Server
  server-name-privacy: false
  url: https://timings.aikar.co/
  verbose: true
unsupported-settings:
  allow-grindstone-overstacking: false
  allow-headless-pistons: false
  allow-permanent-block-break-exploits: false
  allow-piston-duplication: false
  allow-unsafe-end-portal-teleportation: false
  perform-username-validation: true
watchdog:
  early-warning-delay: 10000
  early-warning-every: 5000
`,
  },
  deluxemenus: {
    label: "DeluxeMenus · config.yml",
    format: "yaml",
    content: `debug: LOWEST
check_updates: true

gui_menus:
  example:
    menu_title: '&aServer Menu'
    open_command:
      - menu
      - servermenu
    register_command: true
    inventory_type: CHEST
    size: 27
    update_interval: 10
    open_commands:
      - '[sound] BLOCK_NOTE_BLOCK_PLING'
    items:
      filler:
        material: BLACK_STAINED_GLASS_PANE
        slots: [0,1,2,3,4,5,6,7,8,9,17,18,19,20,21,22,23,24,25,26]
        display_name: ' '
        priority: 10
      spawn:
        material: COMPASS
        slot: 11
        display_name: '&b&lSpawn'
        lore:
          - '&7Click to teleport to spawn.'
          - ''
          - '&8» &7Click'
        commands:
          - '[sound] ENTITY_ENDERMAN_TELEPORT'
          - '[player] spawn'
          - '[message] &aWelcome back to spawn!'
      shop:
        material: EMERALD
        slot: 13
        display_name: '&a&lShop'
        lore:
          - '&7Browse server items.'
          - ''
          - '&8» &7Click'
        commands:
          - '[player] shop'
      profile:
        material: PLAYER_HEAD
        slot: 15
        display_name: '&e&l%player_name%'
        lore:
          - '&7Group: &f%vault_group%'
          - '&7Balance: &f$%vault_eco_balance_formatted%'
          - '&7Online: &f%server_online%'
        nbt_string:
          - 'SkullOwner:%player_name%'
`,
  },
  worldguard: {
    label: "WorldGuard · config.yml",
    format: "yaml",
    content: `regions:
  enable: true
  invincibility-removes-mobs: false
  cancel-chat-without-recipients: true
  default-flags:
    initialize-with-default-region: false
  high-frequency-flags: false
  protect-against-liquid-flow: false
  wand: minecraft:leather
  max-region-count-per-player:
    default: 7
  sql:
    use: false
    dsn: jdbc:mysql://localhost/worldguard
    username: worldguard
    password: worldguard
    table-prefix: ''
  uuid-migration:
    perform-on-next-start: true
    keep-names-that-lack-a-uuid: true
  use-paper-entity-origin: false

summary-on-start: true
op-permissions: true
host-keys: {}
host-keys-allow-forge-clients: false
build-permission-nodes:
  enable: false
  deny-message: '&cYou do not have permission to build here.'

security:
  deop-everyone-on-join: false
  block-in-game-op-command: false

event-handling:
  block-entity-spawns-with-untraceable-cause: false
  interaction-whitelist: []
  emit-block-use-at-feet: []

protection:
  item-durability: true
  remove-infinite-stacks: false
  disable-xp-orb-drops: false
  disable-obsidian-generators: false

gameplay:
  block-potions: []
  block-potions-overly-reliably: false
  disable-conduit-effects: false
  disable-explosion-damage: false

default:
  pumpkin-scuba: false
  disable-health-regain: false
`,
  },
  discordsrv: {
    label: "DiscordSRV · config.yml",
    format: "yaml",
    content: `BotToken: 'YOUR_BOT_TOKEN_HERE'

Channels:
  global: '0000000000000000'
  staff: '0000000000000000'

DiscordChatChannelMinecraftToDiscord: true
DiscordChatChannelDiscordToMinecraft: true
DiscordConsoleChannelId: '0'

DiscordChatChannelPrefixRequiredToProcessMessage: ''
DiscordChatChannelBlockedRolesAsBlacklist: false
DiscordChatChannelBlockedRolesIds: []

MinecraftChatToDiscordMessageFormat: '%username% » %message%'
MinecraftChatToDiscordMessageFormatNoPrimaryGroup: '%username% » %message%'

DiscordToMinecraftChatMessageFormat: '&b[Discord] &f<%username%> &7%message%'
DiscordToMinecraftChatMessageFormatNoRole: '&b[Discord] &7<%username%> %message%'

DiscordChatChannelTopicFormat: 'Online: %playercount%/%playermax% — %motd%'
DiscordChatChannelTopicAtServerStartFormat: '%servername% started up'
DiscordChatChannelTopicAtServerShutdownFormat: '%servername% shut down'

DiscordChatChannelMinecraftToDiscordRolesAllowedToUseColorCodesAndFormatting: true
DiscordChatChannelTranslateMentions: true
DiscordChatChannelEmojiBehavior: name
DiscordChatChannelEscapeMarkdown: false
DiscordChatChannelTruncateLength: 256

ServerStartupMessage: ':white_check_mark: **Server has started.**'
ServerShutdownMessage: ':octagonal_sign: **Server is shutting down.**'

DiscordPlayerListCommandEnabled: true
DiscordPlayerListCommandMessage: '**Online players (%playercount%/%playermax%)**: %playerlist%'

MinecraftDiscordAccountLinkedConsoleCommands:
  - 'lp user %player% parent add discord-linked'
MinecraftDiscordAccountUnlinkedConsoleCommands:
  - 'lp user %player% parent remove discord-linked'

Experiment_WebhookChatMessageDelivery: true
Experiment_MCDiscordReserializer_ToDiscord: true
Experiment_MCDiscordReserializer_ToMinecraft: true

Debug: []
`,
  },
  bungeecord: {
    label: "BungeeCord · config.yml",
    format: "yaml",
    content: `player_limit: -1
ip_forward: true
permissions:
  default:
    - bungeecord.command.server
    - bungeecord.command.list
  admin:
    - bungeecord.command.alert
    - bungeecord.command.end
    - bungeecord.command.ip
    - bungeecord.command.reload
groups:
  md_5:
    - admin
timeout: 30000
log_commands: false
log_pings: true
network_compression_threshold: 256
online_mode: true
forge_support: false
disabled_commands:
  - disabledcommandhere
servers:
  lobby:
    motd: '&1Just another BungeeCord - Forced Host'
    address: localhost:25565
    restricted: false
listeners:
  - host: 0.0.0.0:25577
    motd: '&aA Minecraft Server'
    max_players: 1000
    priorities:
      - lobby
    bind_local_address: true
    ping_passthrough: false
    forced_hosts:
      pvp.md-5.net: pvp
    tab_list: GLOBAL_PING
    tab_size: 60
    query_port: 25577
    query_enabled: false
    proxy_protocol: false
    force_default_server: false
connection_throttle: 4000
connection_throttle_limit: 3
stats: replace-with-uuid
prevent_proxy_connections: false
remote_ping_cache: -1
forge_support: false
inject_commands: false
`,
  },
  placeholderapi: {
    label: "PlaceholderAPI · config.yml",
    format: "yaml",
    content: `check_updates: true
debug: false
date_format: 'MM/dd/yy HH:mm:ss'
boolean:
  'true': 'yes'
  'false': 'no'
cloud_enabled: true
cloud_allow_unverified_expansions: false
expansions:
  player:
    use_full_name: false
  server:
    proxy_online_mode: true
`,
  },
  geyser: {
    label: "Geyser · config.yml",
    format: "yaml",
    content: `bedrock:
  port: 19132
  clone-remote-port: false
  motd1: 'GeyserMC'
  motd2: 'Another Geyser server.'
  server-name: 'Geyser'
  compression-level: 6
  enable-proxy-protocol: false
remote:
  address: auto
  port: 25565
  auth-type: floodgate
  use-proxy-protocol: false
  forward-hostname: false
floodgate-key-file: key.pem
saved-user-logins: []
pending-authentication-timeout: 120
command-suggestions: true
passthrough-motd: false
passthrough-player-counts: false
legacy-ping-passthrough: false
ping-passthrough-interval: 3
forward-player-ping: false
max-players: 100
debug-mode: false
allow-third-party-capes: true
allow-third-party-ears: false
show-cooldown: title
show-coordinates: true
disable-bedrock-scaffolding: false
emote-offhand-workaround: 'disabled'
default-locale: en_us
cache-images: 0
allow-custom-skulls: true
add-non-bedrock-items: true
above-bedrock-nether-building: false
force-resource-packs: true
xbox-achievements-enabled: false
log-player-ip-addresses: true
notify-on-server-form-image-error: true
metrics:
  enabled: true
  uuid: generateduuid
config-version: 4
`,
  },
  floodgate: {
    label: "Floodgate · config.yml",
    format: "yaml",
    content: `key-file-name: key.pem
username-prefix: '.'
replace-spaces: true
disconnect:
  invalid-key: 'Please connect through the official Geyser.'
  invalid-arguments-length: 'Expected 2 arguments, got {0}. Is Geyser configured correctly?'
player-link:
  enabled: true
  require-link: false
  allow-linking: true
  type: sqlite
  enable-own-linking: true
metrics:
  enabled: true
  uuid: generateduuid
debug: false
config-version: 3
`,
  },
  viaversion: {
    label: "ViaVersion · config.yml",
    format: "yaml",
    content: `checkforupdates: true
prevent-collision: true
use-new-deathmessages: false
suppress-conversion-warnings: false
nms-player-ticking: true
shield-blocking: true
no-delay-shield-blocking: false
show-shield-when-sword-in-hand: false
fix-1_8-direction: true
chunk-border-fix: false
minimize-cooldown: true
team-colour-fix: true
suppress-1_13-conversion-errors: false
unknown-entities-suppress-errors: false
serverside-piston-animation-patch: true
auto-team: true
quick-move-action-fix: false
hologram-y: -0.96
chat-ny-yes: false
truncate-1_14-books: false
left-handed-handling: true
fix-1_14-arrows: false
debug: false
bungee-ping-interval: 60
bungee-ping-save: true
bungee-servers: {}
block-protocols: []
block-versions: []
`,
  },
  multiverse: {
    label: "Multiverse-Core · config.yml",
    format: "yaml",
    content: `multiverse-configuration:
  enforceaccess: false
  enforcegamemode: true
  prefixchat: true
  prefixchatformat: '[%world%]%chat%'
  teleportintercept: true
  firstspawnoverride: true
  displaypermerrors: true
  globaldebug: 0
  silentstart: false
  defaultportalsearch: true
  portalsearchradius: 128
  autopurge: true
  idonotwanttodonate: false
  firstspawnworld: ''
  defaulttoflatworld: false

worlds:
  world:
    autoLoad: true
    bedRespawn: true
    difficulty: NORMAL
    gameMode: SURVIVAL
    hidden: false
    keepSpawnInMemory: true
    pvp: true
    type: NORMAL
    seed: 12345
    spawnLocation:
      ==: MVSpawnLocation
      x: 0.0
      y: 64.0
      z: 0.0
      pitch: 0.0
      yaw: 0.0
`,
  },
  shopgui: {
    label: "ShopGUI+ · shops.yml",
    format: "yaml",
    content: `shops:
  food:
    name: '&aFood &7(Click to browse)'
    item:
      type: COOKED_BEEF
      quantity: 1
    rows: 3
    items:
      1:
        type: ITEM
        item: { type: BREAD, quantity: 1 }
        slot: 10
        buyPrice: 5
        sellPrice: 1
      2:
        type: ITEM
        item: { type: COOKED_BEEF, quantity: 1 }
        slot: 11
        buyPrice: 12
        sellPrice: 4
      3:
        type: ITEM
        item: { type: GOLDEN_APPLE, quantity: 1 }
        slot: 12
        buyPrice: 80
        sellPrice: 25
  blocks:
    name: '&7Blocks'
    item: { type: STONE, quantity: 1 }
    rows: 3
    items:
      1:
        type: ITEM
        item: { type: STONE, quantity: 1 }
        slot: 10
        buyPrice: 1
        sellPrice: 0.25
      2:
        type: ITEM
        item: { type: OAK_LOG, quantity: 1 }
        slot: 11
        buyPrice: 3
        sellPrice: 0.5
`,
  },
  huskhomes: {
    label: "HuskHomes · config.yml",
    format: "yaml",
    content: `language: en-gb
check_for_updates: true
debug_logging: false
database:
  type: SQLITE
  mysql_credentials:
    host: localhost
    port: 3306
    database: HuskHomes
    username: root
    password: pa55w0rd
  table_names:
    homes_data: huskhomes_homes
    warps_data: huskhomes_warps
    user_data: huskhomes_users
general:
  max_homes: 5
  max_public_homes: 2
  set_warp_command: true
  list_items_per_page: 12
  asynchronous_teleports: true
  teleport_warmup_time: 5
  teleport_warmup_cancel_on_move: true
  teleport_request_expiry: 60
cross_server:
  enabled: false
  cluster_id: ''
  redis:
    host: localhost
    port: 6379
    password: ''
    use_ssl: false
rtp:
  cooldown_length: 30
  radius: 5000
  spawn_radius: 500
  enabled_worlds:
    - world
spawn:
  command: true
  unique_per_world: false
sounds:
  teleportation: ENTITY_ENDERMAN_TELEPORT
  teleport_warmup: BLOCK_NOTE_BLOCK_BANJO
  teleport_complete: ENTITY_ENDERMAN_TELEPORT
`,
  },
  mcmmo: {
    label: "mcMMO · config.yml",
    format: "yaml",
    content: `Skills:
  General:
    StatsTrackingEnabled: true
    Power_Level_Cap: 0
    Truncate_Skills: false
    Show_Profile_Loading_Notification: true
    Stats_Display_Order: ASCENDING
  Mining:
    Enabled: true
    Level_Cap: 1000
    XP_Multiplier: 1.0
    Double_Drops_Enabled: true
    Blast_Mining: true
  Woodcutting:
    Enabled: true
    Level_Cap: 1000
    Tree_Feller_Threshold: 500
    Double_Drops_Enabled: true
  Excavation:
    Enabled: true
    Level_Cap: 1000
    Double_Drops_Enabled: true
  Herbalism:
    Enabled: true
    Level_Cap: 1000
    Double_Drops_Enabled: true
    Green_Thumb: true
  Fishing:
    Enabled: true
    Level_Cap: 1000
    Treasure_Drop_Rate: 5
  Unarmed:
    Enabled: true
    Level_Cap: 1000
    Disarm_Enabled: true
  Archery:
    Enabled: true
    Level_Cap: 1000
  Swords:
    Enabled: true
    Level_Cap: 1000
    Bleed:
      Enabled: true
      Max_Ticks: 3
  Axes:
    Enabled: true
    Level_Cap: 1000
  Acrobatics:
    Enabled: true
    Level_Cap: 1000
    Dodge:
      Enabled: true
  Taming:
    Enabled: true
    Level_Cap: 1000
  Repair:
    Enabled: true
    Level_Cap: 1000
    Anvil_Messages: true
  Salvage:
    Enabled: true
    Level_Cap: 1000
  Alchemy:
    Enabled: true
    Level_Cap: 1000
Items:
  Chimaera_Wing:
    Enabled: true
    Item_Material: FEATHER
    Cooldown: 240
    Use_Cost: 1
    Recipe_Cost: 5
Mob_Healthbar:
  Display_Type: HEARTS
Particles:
  LevelUp_Enabled: true
Commands:
  Inspect:
    Show_Offline: true
`,
  },
  jobs: {
    label: "Jobs Reborn · generalConfig.yml",
    format: "yaml",
    content: `locale-language: en-US
storage:
  method: sqlite
  database:
    name: jobs
    username: jobs
    password: jobs
    host: localhost
    port: 3306
    multiple-servers: false
broadcast-on-skill-up:
  use: true
broadcast-on-level-up:
  use: true
economy:
  currency-symbol: '$'
  use-server-economy: true
add-xp-player: true
auto-job-join: false
fire-cancelled-events: false
modify-chat: true
max-jobs: 3
hide-jobs-in-info: []
hide-jobsinfo-without-permission: true
enable-pay-near-spawner: true
enable-pay-creative: false
disable-payment-if-riding: false
enable-pay-for-exploring: true
disable-payment-if-mob-spawner: true
mob-tp-payment-percentage: 75
enable-pay-creative: false
modify-chat-prefix: ' '
modify-chat-suffix: ' '
ShowToplistInScoreboard: true
add-xp-player: true
modify-displayname: false
General:
  EnablePayCreative: false
  EnablePayNearSpawner: true
  AutoSavePeriod: 30
  ShowTotalWorkers: false
  ShowPenaltyBonus: true
  AddXpPlayer: false
ScoreboardInterval: 10
`,
  },
  worldborder: {
    label: "WorldBorder · config.yml",
    format: "yaml",
    content: `worlds:
  world:
    radiusX: 5000
    radiusZ: 5000
    x: 0.0
    z: 0.0
    shape: round
  world_nether:
    radiusX: 1000
    radiusZ: 1000
    x: 0.0
    z: 0.0
    shape: round
round-border: true
fill-autosave-frequency: 30
knockback: 3.0
timer-ticks: 5
remount-ticks: 0
remount-deny-message: '&cYou cannot ride that here.'
message: '&cThe border of the world has been reached.'
portal-redirection: true
disable-build: true
whoosh-effect: true
preventblockplace: true
preventmobspawn: true
denypearl: true
killplayer: false
fillmemtolerance: 500
fillautosaveseconds: 30
dynmap: true
dynmapmessage: 'The border of the world.'
`,
  },
  authme: {
    label: "AuthMe · config.yml",
    format: "yaml",
    content: `DataSource:
  backend: SQLITE
  caching: true
  mySQLHost: 127.0.0.1
  mySQLPort: '3306'
  mySQLUsername: authme
  mySQLPassword: '12345'
  mySQLDatabase: authme
  mySQLTablename: authme
settings:
  sessions:
    enabled: false
    timeout: 10
    sessionExpireOnIpChange: true
  restrictions:
    AllowedNicknameCharacters: '[a-zA-Z0-9_]*'
    minNicknameLength: 3
    maxNicknameLength: 16
    timeout: 30
    maxRegPerIp: 1
    forceSingleSession: true
    maxLoginPerIp: 0
    maxJoinPerIp: 0
    teleportUnAuthedToSpawn: false
    allowMovement: false
    allowedMovementRadius: 100
    removeSpeed: true
  registration:
    enabled: true
    type: PASSWORD
    secondArg: CONFIRMATION
    forceKickAfterRegister: false
    enableEmailRegistrationSystem: false
  security:
    minPasswordLength: 5
    passwordMaxLength: 30
    unsafePasswords:
      - '123456'
      - password
      - qwerty
    captcha:
      enabled: false
      maxLoginTry: 5
      captchaLength: 5
  forceCommands: []
Email:
  mailSMTP: smtp.gmail.com
  mailPort: 465
  mailSenderName: ''
  mailAccount: ''
  mailPassword: ''
  recoveryPasswordLength: 8
  emailMessage: '<html><body><h2>Hello {player},</h2></body></html>'
  emailSubject: 'Your AuthMe password'
`,
  },
  coreprotect: {
    label: "CoreProtect · config.yml",
    format: "yaml",
    content: `default-logging: true
disable-world: false
disable-worlds:
  - world_disabled
mysql: false
mysql-host: 127.0.0.1
mysql-port: 3306
mysql-database: database
mysql-username: root
mysql-password: ''
table-prefix: 'co_'
use-mysql-feature-set: 0
language: en
api-enabled: true
check-updates: true
verbose: true
rollback-items: true
rollback-entities: true
skip-generic-data: true
network-debug: false
block-place: true
block-break: true
natural-break: true
block-movement: true
pickup: false
tnt-explosions: true
fire: true
lava: false
water-flow: false
liquid-tracking: true
sign-text: true
buckets: true
leaves-decay: true
tree-growth: true
mob-griefing: true
player-interactions: true
player-messages: true
player-commands: true
player-logins: true
player-deaths: true
inventory-changes: true
item-transactions: true
item-drops: true
item-pickups: true
zombie-villager-conversion: true
mushroom-block-bonemeal: true
auto-purge: 30
`,
  },
  griefprevention: {
    label: "GriefPrevention · config.yml",
    format: "yaml",
    content: `GriefPrevention:
  Database:
    URL: ''
    UserName: ''
    Password: ''
  Claims:
    PreventTheft: true
    ProtectCreatures: true
    PreventButtonsSwitches: true
    LockWoodenDoors: true
    LockTrapDoors: true
    LockFenceGates: true
    EnderPearlsRequireAccessTrust: true
    PreventNonPlayerCreatedPortals: true
    LecternReadingRequiresAccessTrust: true
    ProtectFires: false
    ProtectHorses: true
    ProtectDonkeysAndMules: true
    ProtectLlamas: true
    InitialBlocks: 100
    BlocksAccruedPerHour:
      Default: 100
    MaxAccruedBlocks:
      Default: 80000
    AccruedIdleThreshold: 0
    AccruedIdlePercent: 0
    AbandonReturnRatio: 1.0
    AutomaticNewPlayerClaimsRadius: 4
    AutomaticNewPlayerClaimsRadiusMinimum: 0
    ExtendIntoGroundDistance: 5
    MinimumWidth: 5
    MinimumArea: 100
    MaximumDepth: 0
    InvestigationTool: STICK
    ModificationTool: GOLDEN_SHOVEL
    Expiration:
      ChestClaimDays: 7
      UnusedClaimDays: 14
      AllClaims:
        DaysInactive: 60
        IgnoreIfAbove: 0
        SkipBuilderClaims: true
    Siege:
      Worlds: []
      BreakableBlocks:
        - DIRT
        - GRASS_BLOCK
        - COBBLESTONE
      WinningTeleportsLoser: true
      LoserKeepsInventory: true
  Spam:
    Enabled: true
    LoginCooldownSeconds: 60
    LoginLogoutNotificationsPerMinute: 5
    WarningMessage: 'Please slow down.'
    BanOffenders: false
    BanMessage: 'Banned for spam.'
    AllowedIpAddresses: ''
    DeathMessageCooldownSeconds: 60
  PvP:
    RulesEnabledInWorld:
      world: true
    ProtectFreshSpawns: true
    PunishLogout: true
    CombatTimeoutSeconds: 15
    AllowCombatItemDrop: false
    BlockedSlashCommands: 'me,tell,msg,r,whisper,t'
    ProtectPlayersInLandClaims:
      PlayerOwnedClaims: true
      AdministrativeClaims: true
      AdministrativeSubdivisions: true
  Economy:
    ClaimBlocksPurchaseCost: 0.0
    ClaimBlocksSellValue: 0.0
  ProtectItemsDroppedOnDeath:
    Worlds: {}
  BlockLandClaimsInWorlds: []
  BlockSurfaceCreeperExplosions: true
  BlockSurfaceOtherExplosions: true
  BlockSkyTrees: true
  LimitTreeGrowth: false
  PistonExplosionSound: true
  PistonMovement: BREAK
`,
  },
  betonquest: {
    label: "BetonQuest · config.yml",
    format: "yaml",
    content: `language: en
default_journal_slot: -1
default_conversation_color: aqua
default_conversation_io: menu
journal_lock_default: false
remove_items_after_respawn: true
notify:
  citizens_npc_disabled: true
hook:
  worldedit: true
  worldguard: true
  vault: true
  citizens: true
  placeholderapi: true
  protocollib: true
  mythicmobs: true
  brewery: true
mysql:
  enabled: false
  host: localhost
  port: 3306
  base: minecraft
  user: root
  pass: pass
  prefix: 'betonquest_'
debug: false
update:
  enabled: true
  strategy: MINOR
  ingame_notification: true
log_trim: true
backup:
  enabled: true
  delay: 10
date_format: dd.MM.yyyy HH:mm
quest_items_unbreakable: true
journal:
  one_entry_per_page: false
  reversed_order: false
  hide_date: false
  full_main_page: false
  give_on_respawn: true
mob_compass_distance: 250
`,
  },
  citizens: {
    label: "Citizens · config.yml",
    format: "yaml",
    content: `general:
  date-format: MM/dd/yyyy
  debug: false
  default-text: Hello, I''m <npc>
  selection:
    item: stick
    message: '<gray>You selected <green><npc>.'
    quick-select: false
  use-scoreboard-teams: true
  player-skins:
    follow-when-cleared: true
    refresh-on-skin-update: true
npc:
  default-look-close: false
  default-random-look: false
  default-protected: true
  pathfinding:
    new-finder: true
    new-finder-distance-margin: 1.0
    update-path-rate: 1
  packets:
    update-delay: 30
storage:
  files:
    saves: saves.yml
  type: yaml
tasks:
  save-task:
    delay: 0
    period: 6000
languages: en
metrics: true
`,
  },
  betterrtp: {
    label: "BetterRTP · config.yml",
    format: "yaml",
    content: `Settings:
  Cooldown: 5
  Delay: 0
  WaitTimeBeforeTeleport: 0
  CrossWorldTPSupport: false
  CommandsOnTeleport:
    - 'msg [player] &aYou have been teleported!'
RTP:
  DefaultWorld: world
  MaxAttempts: 50
  PriceToUse: 0
  Permissions:
    Cooldown: 5
  CenterX: 0
  CenterZ: 0
  MinX: -3000
  MaxX: 3000
  MinZ: -3000
  MaxZ: 3000
  Shape: SQUARE
  AvoidBiomes:
    - OCEAN
    - DEEP_OCEAN
    - RIVER
  AvoidBlocks:
    - WATER
    - LAVA
    - CACTUS
  UseWorldBorder: true
`,
  },
  litebans: {
    label: "LiteBans · config.yml",
    format: "yaml",
    content: `sql:
  driver: sqlite
  address: localhost:3306
  database: litebans
  username: root
  password: ''
  table_prefix: 'litebans_'
  table_engine: InnoDB
  use_ssl: false
  pool:
    maximum-pool-size: 10
    minimum-idle: 10
    maximum-lifetime: 1800000
    connection-timeout: 5000
messages:
  prefix: '&8[&cLiteBans&8]'
  ban: '&cYou have been banned. Reason: {reason}'
  mute: '&cYou are muted. Reason: {reason}'
broadcasts:
  ban: '&c{actor} &7banned &c{player} &7for &c{reason}'
  unban: '&a{actor} &7unbanned &a{player}'
history:
  enabled: true
  page_size: 7
litebans:
  ban-on-player-ip: false
  hooks:
    discord: false
`,
  },
  factions: {
    label: "Factions · config.yml",
    format: "yaml",
    content: `factions:
  defaultRole: NORMAL
  maxNameLength: 16
  minNameLength: 3
  homesEnabled: true
  homesTeleportAllowedFromDifferentWorld: true
  maxFactionRelations: 0
  defaultRelation: NEUTRAL
  defaultPeacefulRelation: NEUTRAL
powerPerPlayer: 10.0
powerPerDeath: 4.0
powerOfflineLossPerDay: 0.0
powerOfflineLossLimit: 0.0
defaultPlayerPowerMin: -10.0
defaultPlayerPowerMax: 10.0
defaultPlayerPower: 0.0
landAlphaUpkeepEnabled: false
warmupTime:
  home: 0
  warp: 0
econ:
  Enabled: true
  universeAccount: ''
  costClaim: 30.0
  costUnclaim: -20.0
  costCreate: 100.0
  costJoin: 0.0
  costLeave: 0.0
worldsNoClaiming:
  - skyworld
worldsNoPowerLoss:
  - peaceful
worldsPVPRules:
  - world
`,
  },
  papimacros: {
    label: "Custom · placeholders.yml",
    format: "yaml",
    content: `# Generic placeholder definitions
placeholders:
  greeting: '&aHello, &f%player_name%&a!'
  rank_prefix: '%vault_prefix%'
  ping_color: '%player_ping_color%%player_ping%ms'
`,
  },
};

export const SAMPLE_LIST = Object.entries(SAMPLES) as [PluginId, NonNullable<(typeof SAMPLES)[PluginId]>][];
