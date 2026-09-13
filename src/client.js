// ============================================================
// src/client.js — Discord Client Factory
// Creates and exports the singleton Discord client instance.
// ============================================================
const {
  Client,
  GatewayIntentBits,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// ── Persistent state attached to client ─────────────────────
client.currentStatus = {
  status: 'online',
  customText: null,
};

client.currentActivity = {
  type: 'WATCHING',
  text: '[{online}/{total}] players online',
  url: null,
  containsStats: true,
};

module.exports = client;
