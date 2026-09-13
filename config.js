// ============================================================
// config.js — Cypher v3 Central Configuration
// All constants and environment variables live here.
// Sensitive values are loaded from .env — never hard-coded.
// ============================================================
require('dotenv').config();

// ── Discord credentials (from .env) ─────────────────────────
const BOT_TOKEN  = process.env.BOT_TOKEN;
const CLIENT_ID  = process.env.CLIENT_ID;
const GUILD_ID   = process.env.GUILD_ID;
const OWNER_ID   = process.env.OWNER_ID;

// ── Channel IDs (from .env) ──────────────────────────────────
const STATS_CHANNEL_ID    = process.env.STATS_CHANNEL_ID;
const ACTIVITY_CHANNEL_ID = process.env.ACTIVITY_CHANNEL_ID;
const WELCOME_CHANNEL_ID  = process.env.WELCOME_CHANNEL_ID;
const AFK_CHANNEL_ID      = process.env.AFK_CHANNEL_ID;

// ── Media / server config (from .env with fallback defaults) ─
const WELCOME_IMAGE_URL  = process.env.WELCOME_IMAGE_URL  || 'https://i.ibb.co/JFtcX23r/standard-3.gif';
const SERVER_BANNER_URL  = process.env.SERVER_BANNER_URL  || 'https://i.ibb.co/whj6yh7Q/IMG-20250726-122907.png';

// ── Web server port ──────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 3000;

// ── Bot branding ─────────────────────────────────────────────
const BOT_NAME   = 'Cypher v3';
const BOT_COLOR  = 0xf7ca02;
const BOT_FOOTER = 'Cypher v3';

// ── Validate required environment variables at startup ───────
const REQUIRED_ENV_VARS = ['BOT_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'OWNER_ID'];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('   Copy .env.example → .env and fill in your values.');
  process.exit(1);
}

module.exports = {
  BOT_TOKEN,
  CLIENT_ID,
  GUILD_ID,
  OWNER_ID,
  STATS_CHANNEL_ID,
  ACTIVITY_CHANNEL_ID,
  WELCOME_CHANNEL_ID,
  AFK_CHANNEL_ID,
  WELCOME_IMAGE_URL,
  SERVER_BANNER_URL,
  PORT,
  BOT_NAME,
  BOT_COLOR,
  BOT_FOOTER,
};
