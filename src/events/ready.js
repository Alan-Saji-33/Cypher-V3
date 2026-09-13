// ============================================================
// src/events/ready.js — Bot Ready Event
// ============================================================
const { REST, Routes } = require('discord.js');
const { BOT_TOKEN, CLIENT_ID, GUILD_ID } = require('../../config');
const { commands } = require('../commands/definitions');
const { loadPlaytimeData, setupPlaytimeSaver } = require('../utils/playtime');
const { loadWarnsData, setupWarnsSaver } = require('../utils/warns');
const { loadAutorepliesData, setupAutorepliesSaver } = require('../utils/autoreplies');
const { updateStats, updateBotActivity, startHeartbeat } = require('../utils/stats');

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Slash commands registered for guild!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    try {
      console.log(`✅ Logged in as ${client.user.tag}!`);

      await registerCommands();
      loadPlaytimeData();
      loadWarnsData();
      loadAutorepliesData();
      setupPlaytimeSaver();
      setupWarnsSaver();
      setupAutorepliesSaver();

      await updateBotActivity();
      console.log('✅ Initial bot activity set');

      setTimeout(() => {
        setInterval(updateStats, 180_000);
        updateStats().catch(err => console.error('Initial stats update failed:', err.message));
      }, 5000);

      startHeartbeat();
      console.log('✅ Cypher v3 initialization complete');
    } catch (error) {
      console.error('Error in ready event:', error.message);
    }
  },
};
