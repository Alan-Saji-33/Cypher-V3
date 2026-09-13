// ============================================================
// src/events/voiceStateUpdate.js — Voice State Update Event
// Notifies owner when members join voice channels.
// Cleans up mute/AFK timers when members leave.
// ============================================================
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = require('../client');
const { OWNER_ID } = require('../../config');

// AFK and mute timer cleanup maps (shared state)
const muteTimers = new Map();
const afkTimers  = new Map();

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    try {
      // Notify owner when a non-owner, non-bot member joins a VC
      if (newState.channelId && (!oldState.channelId || oldState.channelId !== newState.channelId)) {
        const user = newState.member.user;
        if (user.bot || user.id === OWNER_ID) return;

        const channel = newState.guild.channels.cache.get(newState.channelId);
        const owner   = await client.users.fetch(OWNER_ID);

        const embed = new EmbedBuilder()
          .setColor('#f7ca02')
          .setTitle('🎙️ Voice Channel Activity')
          .setDescription(`> **${user.tag}** has just joined a voice channel!\n\n`)
          .addFields(
            { name: '👤 User',    value: `<@${user.id}>`,       inline: true },
            { name: '📢 Channel', value: `\`${channel.name}\``, inline: true }
          )
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: '🎧' })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('🔗 Join Voice Channel')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${newState.guild.id}/${newState.channelId}`)
        );

        await owner.send({ embeds: [embed], components: [row] }).catch(err =>
          console.warn(`Could not DM owner about voice activity for ${user.tag}:`, err.message)
        );
      }

      // Clean up timers when member leaves any voice channel
      const userId = newState.id;
      if (!newState.channelId) {
        if (muteTimers.has(userId)) {
          clearTimeout(muteTimers.get(userId));
          muteTimers.delete(userId);
        }
        if (afkTimers.has(userId)) {
          clearTimeout(afkTimers.get(userId));
          afkTimers.delete(userId);
        }
      }
    } catch (error) {
      console.error('Error in voiceStateUpdate:', error.message);
    }
  },
};
