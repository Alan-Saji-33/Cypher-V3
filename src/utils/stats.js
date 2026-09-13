// ============================================================
// src/utils/stats.js — Server Stats & Bot Activity Updater
// ============================================================
const { ActivityType, EmbedBuilder } = require('discord.js');
const client = require('../client');
const { safelyFetchMembers } = require('./helpers');
const { GUILD_ID, STATS_CHANNEL_ID, BOT_FOOTER, SERVER_BANNER_URL } = require('../../config');

let lastMessageId = null;

// ── updateStats ─────────────────────────────────────────────
async function updateStats() {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);

    // Total non-bot member count
    let totalNonBotMembers = guild.members.cache.filter(m => !m.user.bot).size;
    if (totalNonBotMembers < guild.memberCount) {
      await guild.members.fetch({ limit: 1000, withPresences: false }).catch(err => {
        console.warn('⚠️ Could not fetch all members for stats total:', err.message);
      });
      totalNonBotMembers = guild.members.cache.filter(m => !m.user.bot).size;
    }

    // Online count
    const membersWithPresence = await safelyFetchMembers(guild);
    const online = membersWithPresence.filter(
      m => m.presence?.status && ['online', 'idle', 'dnd'].includes(m.presence.status)
    ).size;

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
    });

    const payload = {
      embeds: [{
        title: '**SERVER STATUS**',
        color: 0xf7ca02,
        fields: [
          { name: '**> STATUS**',   value: '```🟢 Online\n```', inline: true },
          { name: '**> PLAYERS**',  value: `\`\`\`👥 ${online}/${totalNonBotMembers}\`\`\``, inline: true },
          { name: '**> INVITE**',   value: '```https://discord.gg/22mGfCGAqw```' },
        ],
        footer: {
          text: `${BOT_FOOTER} • Updated every minute • Today at ${formattedTime}`,
          icon_url: guild.iconURL({ dynamic: true, size: 64 }) || client.user.displayAvatarURL({ dynamic: true, size: 64 }),
        },
        image: { url: SERVER_BANNER_URL },
      }],
    };

    const channel = await client.channels.fetch(STATS_CHANNEL_ID);
    if (!lastMessageId) {
      const msg = await channel.send(payload);
      lastMessageId = msg.id;
    } else {
      await channel.messages.edit(lastMessageId, payload).catch(async editErr => {
        console.warn('Stats message not found, sending new one:', editErr.message);
        const msg = await channel.send(payload);
        lastMessageId = msg.id;
      });
    }
  } catch (error) {
    console.error('updateStats failed:', error.message);
  }
}

// ── updateBotActivity ────────────────────────────────────────
async function updateBotActivity() {
  const activityTypeMap = {
    PLAYING:   ActivityType.Playing,
    WATCHING:  ActivityType.Watching,
    LISTENING: ActivityType.Listening,
    STREAMING: ActivityType.Streaming,
  };

  try {
    let activities = [];
    let activityText = client.currentActivity?.text;

    if (client.currentActivity) {
      if (client.currentActivity.containsStats) {
        try {
          const guild = await client.guilds.fetch(GUILD_ID);

          let totalNonBotMembers = guild.members.cache.filter(m => !m.user.bot).size;
          if (totalNonBotMembers < guild.memberCount) {
            await guild.members.fetch({ limit: 1000, withPresences: false }).catch(() => {});
            totalNonBotMembers = guild.members.cache.filter(m => !m.user.bot).size;
          }

          const membersWithPresence = await safelyFetchMembers(guild);
          const online = membersWithPresence.filter(
            m => m.presence?.status && ['online', 'idle', 'dnd'].includes(m.presence.status)
          ).size;

          activityText = activityText
            .replace('{online}', online)
            .replace('{total}', totalNonBotMembers);
        } catch {
          activityText = activityText.replace('{online}', '?').replace('{total}', '?');
        }
      }

      const opts = {
        name: activityText,
        type: activityTypeMap[client.currentActivity.type] || ActivityType.Watching,
      };
      if (client.currentActivity.type === 'STREAMING' && client.currentActivity.url) {
        opts.url = client.currentActivity.url;
      }
      activities.push(opts);
    }

    if (client.currentStatus.customText) {
      activities.push({ name: client.currentStatus.customText, type: ActivityType.Custom });
    }

    if (activities.length === 0) {
      activities.push({ name: 'Bot Ready', type: ActivityType.Watching });
    }

    client.user.setPresence({ status: client.currentStatus.status, activities });
  } catch (error) {
    console.error('Error updating bot presence:', error.message);
    client.user.setActivity({ name: 'Bot Ready', type: ActivityType.Watching });
  }
}

// ── startHeartbeat ───────────────────────────────────────────
function startHeartbeat() {
  setInterval(() => {
    try {
      if (!client.ws.ping || client.ws.status !== 0) {
        console.warn('⚠️ Heartbeat detected potential disconnection');
      }
    } catch (err) {
      console.error('Heartbeat check failed:', err);
    }
  }, 30_000);
}

module.exports = { updateStats, updateBotActivity, startHeartbeat };
