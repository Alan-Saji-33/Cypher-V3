// ============================================================
// src/events/messageCreate.js — Message Create Event
// Handles autoreply matching.
// ============================================================
const { GUILD_ID } = require('../../config');
const { getAutoreplies } = require('../utils/autoreplies');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild || message.guild.id !== GUILD_ID) return;

    for (const ar of getAutoreplies()) {
      const match = ar.caseSensitive
        ? message.content === ar.trigger
        : message.content.toLowerCase() === ar.trigger.toLowerCase();

      if (match) {
        await message.reply(ar.reply).catch(err =>
          console.error('Failed to send autoreply:', err.message)
        );
        break;
      }
    }
  },
};
