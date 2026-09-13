// ============================================================
// src/utils/helpers.js — Shared Utility Functions
// ============================================================
const { GUILD_ID } = require('../../config');

let memberFetchInProgress = false;

/**
 * Safely fetch guild members with presences for online-status queries.
 * Falls back to cache if fetch fails or is already in progress.
 * @param {import('discord.js').Guild} guild
 */
async function safelyFetchMembers(guild) {
  try {
    if (memberFetchInProgress) {
      return guild.members.cache.filter(m => !m.user.bot && m.presence?.status);
    }

    memberFetchInProgress = true;

    const fetchPromise = guild.members.fetch({
      withPresences: true,
      limit: 200,
      time: 10000,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Member fetch timeout')), 8000)
    );

    await Promise.race([fetchPromise, timeoutPromise]);
    return guild.members.cache.filter(m => !m.user.bot && m.presence?.status);
  } catch (error) {
    console.warn('⚠️ Could not fetch members with presences, using cache:', error.message);
    return guild.members.cache.filter(m => !m.user.bot && m.presence?.status);
  } finally {
    memberFetchInProgress = false;
  }
}

/**
 * Validate whether a string is a well-formed URL.
 * @param {string} string
 * @returns {boolean}
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = { safelyFetchMembers, isValidUrl };
