// ============================================================
// index.js — Cypher v3 Entry Point
// Bootstraps the web server, loads all events, and logs in.
// ============================================================
const fs     = require('fs');
const path   = require('path');
const client = require('./src/client');
const { BOT_TOKEN } = require('./config');
const { startWebServer } = require('./src/web/server');

// ── Start Express keep-alive server ─────────────────────────
startWebServer();

// ── Auto-load all event files from src/events/ ───────────────
const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`📌 Loaded event: ${event.name}`);
}

// ── Global error handler ─────────────────────────────────────
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error?.message || error);
});

// ── Login ────────────────────────────────────────────────────
client.login(BOT_TOKEN).catch(error => {
  console.error('Failed to login:', error.message);
  process.exit(1);
});
