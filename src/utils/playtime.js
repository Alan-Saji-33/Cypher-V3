// ============================================================
// src/utils/playtime.js — Playtime Persistence
// Handles loading, saving, and in-memory access for playtime
// and active session data.
// ============================================================
const fs = require('fs');

const DATA_FILE = './playtimes.json';

/** @type {Map<string, {games: Object, total: number, lastUpdate: number}>} */
const userPlaytimes = new Map();

/** @type {Map<string, Object>} */
const activeSessions = new Map();

function loadPlaytimeData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log('ℹ️ playtimes.json not found — creating empty file.');
      fs.writeFileSync(DATA_FILE, JSON.stringify({}));
      return;
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    if (!raw || raw.trim() === '') {
      console.warn('⚠️ playtimes.json is empty — initializing.');
      fs.writeFileSync(DATA_FILE, JSON.stringify({}));
      return;
    }

    const parsed = JSON.parse(raw);
    for (const [userId, userData] of Object.entries(parsed)) {
      if (userData && typeof userData.games === 'object' && typeof userData.total === 'number') {
        userPlaytimes.set(userId, userData);
      } else {
        console.warn(`⚠️ Invalid playtime data for user ${userId} — skipping.`);
      }
    }
    console.log('✅ Loaded playtime data');
  } catch (err) {
    console.error('❌ Error loading playtime data:', err);
  }
}

function savePlaytimeData() {
  const data = {};
  userPlaytimes.forEach((value, key) => { data[key] = value; });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data));
}

function setupPlaytimeSaver() {
  setInterval(() => {
    savePlaytimeData();
    console.log('💾 Saved playtime data');
  }, 300_000); // every 5 minutes
}

module.exports = { userPlaytimes, activeSessions, loadPlaytimeData, savePlaytimeData, setupPlaytimeSaver };
