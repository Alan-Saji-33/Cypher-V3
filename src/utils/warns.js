// ============================================================
// src/utils/warns.js — Warns Persistence
// ============================================================
const fs = require('fs');

const DATA_FILE = './warns.json';

/** @type {Map<string, Array<{id:number, reason:string, moderator:string, timestamp:number}>>} */
const userWarns = new Map();

function loadWarnsData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log('ℹ️ warns.json not found — creating empty file.');
      fs.writeFileSync(DATA_FILE, JSON.stringify({}));
      return;
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    if (!raw || raw.trim() === '') {
      console.warn('⚠️ warns.json is empty — initializing.');
      fs.writeFileSync(DATA_FILE, JSON.stringify({}));
      return;
    }

    const parsed = JSON.parse(raw);
    for (const [userId, warns] of Object.entries(parsed)) {
      userWarns.set(userId, warns);
    }
    console.log('✅ Loaded warns data');
  } catch (err) {
    console.error('❌ Error loading warns data:', err);
  }
}

function saveWarnsData() {
  const data = {};
  userWarns.forEach((value, key) => { data[key] = value; });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data));
}

function setupWarnsSaver() {
  setInterval(() => {
    saveWarnsData();
    console.log('💾 Saved warns data');
  }, 300_000);
}

module.exports = { userWarns, loadWarnsData, saveWarnsData, setupWarnsSaver };
