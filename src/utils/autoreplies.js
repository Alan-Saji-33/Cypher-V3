// ============================================================
// src/utils/autoreplies.js — Autoreplies Persistence
// ============================================================
const fs = require('fs');

const DATA_FILE = './autoreplies.json';

/** @type {Array<{id:number, trigger:string, reply:string, caseSensitive:boolean}>} */
let autoreplies = [];

function loadAutorepliesData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log('ℹ️ autoreplies.json not found — creating empty file.');
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
      autoreplies = [];
      return;
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    if (!raw || raw.trim() === '') {
      console.warn('⚠️ autoreplies.json is empty — initializing.');
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
      autoreplies = [];
      return;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      autoreplies = parsed;
      console.log('✅ Loaded autoreplies data');
    } else {
      console.warn('⚠️ Invalid autoreplies format — resetting.');
      autoreplies = [];
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
  } catch (err) {
    console.error('❌ Error loading autoreplies:', err);
    autoreplies = [];
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
}

function saveAutorepliesData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(autoreplies));
}

function setupAutorepliesSaver() {
  setInterval(() => {
    saveAutorepliesData();
    console.log('💾 Saved autoreplies data');
  }, 300_000);
}

function getAutoreplies() {
  return autoreplies;
}

module.exports = { getAutoreplies, loadAutorepliesData, saveAutorepliesData, setupAutorepliesSaver };
