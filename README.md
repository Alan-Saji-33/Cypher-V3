<div align="center">

<img src="[https://i.ibb.co/whj6yh7Q/IMG-20250726-122907.png](https://i.ibb.co/fGD6CNYh/Chat-GPT-Image-Sep-13-2026-11-34-31-AM.png)" alt="Cypher v3 Banner" width="100%"/>

<br/>

# ⚡ Cypher v3

**A professional, fully-modular Discord bot built with Discord.js v14**

[![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-f7ca02?style=for-the-badge)](LICENSE)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red?style=for-the-badge)](https://github.com)

*Moderation • Voice Management • Playtime Tracking • Auto-Replies • Server Stats*

</div>

---

## 📌 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Commands](#-commands)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Category | Description |
|---|---|
| 🛡️ **Moderation** | Kick, ban, timeout, warn/unwarn users with DM notifications |
| 🔊 **Voice Management** | Join/leave VC, lock/unlock channels, move all, soundboard mute |
| 🎮 **Playtime Tracking** | Auto-tracks game sessions via presence updates, leaderboard |
| 💬 **Auto-Replies** | Fully manageable trigger → reply rules with case-sensitivity |
| 📊 **Live Server Stats** | Auto-updating embed with online/total member counts |
| 🤖 **Rich Presence** | Customisable bot activity & status with live player counts |
| 👋 **Welcome System** | Beautiful welcome embeds for new members |
| 📝 **Embed Builder** | Build and send custom embeds with buttons from slash commands |
| 🌐 **Web Keep-Alive** | Built-in Express server for hosting platforms like Render |

---

## 🗂️ Project Structure

```
cypher-v3/
├── index.js                    # Entry point — auto-loads events & logs in
├── config.js                   # Central config — all values from .env
├── package.json
├── .env.example                # Safe template to copy as .env
├── .gitignore
└── src/
    ├── client.js               # Singleton Discord client
    ├── commands/
    │   ├── definitions.js      # All slash command builders (JSON)
    │   ├── general.js          # /hi  /online_members  /help
    │   ├── owner.js            # /embed  /send_dm  /activity  /autoreply*  …
    │   ├── moderation.js       # /kick  /ban  /timeout  /warn  /clear  …
    │   └── voice.js            # /joinvc  /lock  /moveall  /sbmute  …
    ├── events/
    │   ├── ready.js            # Startup, command registration, initialisation
    │   ├── interactionCreate.js# Central router — commands / buttons / modals
    │   ├── presenceUpdate.js   # Playtime tracking engine
    │   ├── voiceStateUpdate.js # Owner VC notifications + timer cleanup
    │   ├── guildMemberAdd.js   # Welcome embeds
    │   └── messageCreate.js    # Auto-reply matching
    ├── utils/
    │   ├── helpers.js          # safelyFetchMembers, isValidUrl
    │   ├── playtime.js         # Playtime persistence (Map ↔ JSON)
    │   ├── warns.js            # Warns persistence (Map ↔ JSON)
    │   ├── autoreplies.js      # Autoreplies persistence (Array ↔ JSON)
    │   └── stats.js            # updateStats, updateBotActivity, heartbeat
    └── web/
        └── server.js           # Express keep-alive server
```

---

## 🤖 Commands

### 🟢 General
| Command | Description |
|---|---|
| `/hi` | Greet the bot and get an intro embed |
| `/online_members` | View all online/idle/DND members |
| `/help` | Browse all command categories via dropdown |

### 👑 Owner Only
| Command | Description |
|---|---|
| `/embed` | Build and send a fully custom embed with buttons |
| `/send_dm` | Send a direct message to any user |
| `/send_message` | Post a message (with optional file/role ping) to the channel |
| `/activity set\|remove\|view` | Control the bot's rich presence activity |
| `/set_status` | Set bot status (Online / Idle / DND / Invisible) with custom text |
| `/clear_status` | Remove the custom status text |
| `/setup_activity` | Post the activity-tracker panel in the activity channel |
| `/setup_nickname` | Post the nickname-change button panel |
| `/autoreply` | Add a new trigger → reply rule |
| `/autoreplylist` | List all saved autoreplies |
| `/autoreplyedit` | Edit an existing autoreply by ID |
| `/autoreplydelete` | Delete an autoreply by ID |
| `/unwarn` | Remove a specific warn from a user |

### 🛡️ Moderation *(requires permissions)*
| Command | Permission | Description |
|---|---|---|
| `/kick` | Kick Members | Kick a user with an optional reason |
| `/ban` | Ban Members | Ban a user with an optional reason |
| `/timeout` | Moderate Members | Timeout a user for 1 min – 28 days |
| `/warn` | Moderate Members | Warn a user (DM notification sent) |
| `/warns` | Moderate Members | View all active warns for a user |
| `/slowmode` | Manage Messages | Set channel slowmode (0 = off) |
| `/clear` | Manage Messages | Bulk-delete messages, optionally by user |

### 🔊 Voice
| Command | Description |
|---|---|
| `/joinvc` | Make the bot join a specified voice channel |
| `/leavevc` | Make the bot leave the voice channel |
| `/lock` *(Owner)* | Hide a voice channel from @everyone |
| `/unlock` *(Owner)* | Restore a voice channel's visibility |
| `/sbmute` *(Owner)* | Disable soundboard for a user in all VCs |
| `/sbunmute` *(Owner)* | Re-enable soundboard for a user |
| `/moveall` *(Owner)* | Move all members from your VC to another |

### 🎮 Gaming
| Command | Description |
|---|---|
| `/activity_leaderboard` | Show the top 10 players by total playtime |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- A Discord Application & Bot token from the [Discord Developer Portal](https://discord.com/developers/applications)
- The following **Privileged Gateway Intents** enabled in your app settings:
  - `PRESENCE INTENT`
  - `SERVER MEMBERS INTENT`
  - `MESSAGE CONTENT INTENT`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/cypher-v3.git
cd cypher-v3

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env

# 4. Fill in your values (see section below)
nano .env   # or open in any editor

# 5. Start the bot
npm start
```

> **Development mode** (auto-restarts on file changes — Node.js 18+):
> ```bash
> npm run dev
> ```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in **all** values. **Never commit your `.env` file.**

```env
# ── Discord Bot Credentials ──────────────────────────────────
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id
GUILD_ID=your_server_id
OWNER_ID=your_discord_user_id

# ── Channel IDs ──────────────────────────────────────────────
STATS_CHANNEL_ID=channel_id_for_server_stats
ACTIVITY_CHANNEL_ID=channel_id_for_activity_tracker
WELCOME_CHANNEL_ID=channel_id_for_welcome_messages
AFK_CHANNEL_ID=channel_id_for_afk

# ── Media (optional — defaults are provided) ─────────────────
WELCOME_IMAGE_URL=https://your-image-url.gif
SERVER_BANNER_URL=https://your-banner-url.png

# ── Web Server ───────────────────────────────────────────────
PORT=3000
```

| Variable | Required | Description |
|---|---|---|
| `BOT_TOKEN` | ✅ | Your bot's secret token |
| `CLIENT_ID` | ✅ | Your application's client ID |
| `GUILD_ID` | ✅ | The Discord server ID to register commands in |
| `OWNER_ID` | ✅ | Your Discord user ID (grants owner-only commands) |
| `STATS_CHANNEL_ID` | ✅ | Channel where the live stats embed is posted |
| `ACTIVITY_CHANNEL_ID` | ✅ | Channel for the game activity tracker panel |
| `WELCOME_CHANNEL_ID` | ✅ | Channel where welcome messages are sent |
| `AFK_CHANNEL_ID` | ⬜ | AFK voice channel ID (reserved for future use) |
| `WELCOME_IMAGE_URL` | ⬜ | Custom GIF/image for welcome embeds |
| `SERVER_BANNER_URL` | ⬜ | Banner image used in various embeds |
| `PORT` | ⬜ | Express server port (default: `3000`) |

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| [discord.js v14](https://discord.js.org) | Discord API wrapper |
| [@discordjs/voice](https://github.com/discordjs/voice) | Voice channel support |
| [Express](https://expressjs.com) | Keep-alive web server |
| [dotenv](https://github.com/motdotla/dotenv) | Secure environment variable loading |
| [cors](https://github.com/expressjs/cors) | CORS middleware for the web server |
| Node.js `fs` | JSON-based data persistence |

---

## 📦 Data Persistence

Cypher v3 uses lightweight **JSON files** for persistence. These are auto-created on first run and saved every 5 minutes:

| File | Contents |
|---|---|
| `playtimes.json` | Per-user game session history and total playtime |
| `warns.json` | Per-user warn records with reason, moderator, and timestamp |
| `autoreplies.json` | All active trigger → reply rules |

> These files are excluded from Git via `.gitignore` to protect user data.

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** this repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feat/your-feature`
5. Open a **Pull Request**

Please keep one command/feature per PR and follow the existing module structure.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by **@hyper.hawk** — Powered by [Discord.js](https://discord.js.org)

</div>
