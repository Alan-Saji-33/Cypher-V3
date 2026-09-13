// ============================================================
// src/web/server.js — Express Web Server
// Keeps the bot alive on hosting platforms (e.g. Render).
// ============================================================
const express = require('express');
const cors    = require('cors');
const { PORT } = require('../../config');

function startWebServer() {
  const app = express();
  app.use(cors());

  app.get('/', (_req, res) => res.send('✅ Cypher v3 is running!'));

  app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));
}

module.exports = { startWebServer };
