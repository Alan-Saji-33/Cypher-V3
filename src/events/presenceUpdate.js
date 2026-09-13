// ============================================================
// src/events/presenceUpdate.js — Presence Update Event
// Tracks playtime when users start/stop playing games.
// ============================================================
const { ActivityType } = require('discord.js');
const { userPlaytimes, activeSessions } = require('../utils/playtime');
const { updateStats, updateBotActivity } = require('../utils/stats');

module.exports = {
  name: 'presenceUpdate',
  execute(_oldPresence, newPresence) {
    try {
      if (!newPresence || !newPresence.member || newPresence.member.user.bot) return;

      const userId = newPresence.member.user.id;
      const now    = Date.now();

      if (!userPlaytimes.has(userId)) {
        userPlaytimes.set(userId, { lastUpdate: now, games: {}, total: 0 });
      }

      const userData    = userPlaytimes.get(userId);
      const currentGames = new Set(
        newPresence.activities
          .filter(a => a.type === ActivityType.Playing)
          .map(a => a.name)
      );

      const previousSession = activeSessions.get(userId) || {};

      for (const [game, startTime] of Object.entries(previousSession)) {
        const elapsed = (now - startTime) / 1000;
        if (elapsed > 0) {
          userData.games[game] = (userData.games[game] || 0) + elapsed;
          userData.total += elapsed;
        }
        if (currentGames.has(game)) {
          previousSession[game] = now; // reset timer for ongoing game
        } else {
          delete previousSession[game];
        }
      }

      const newSession = { ...previousSession };
      currentGames.forEach(game => {
        if (!previousSession[game]) newSession[game] = now;
      });

      if (Object.keys(newSession).length > 0) {
        activeSessions.set(userId, newSession);
      } else {
        activeSessions.delete(userId);
      }

      userData.lastUpdate = now;
      userPlaytimes.set(userId, userData);

      // Delay to avoid rate limiting
      setTimeout(() => {
        updateStats().catch(err => console.error('presenceUpdate stats error:', err.message));
        updateBotActivity().catch(err => console.error('presenceUpdate activity error:', err.message));
      }, 1000);

    } catch (error) {
      console.error('Error in presenceUpdate:', error.message);
    }
  },
};
