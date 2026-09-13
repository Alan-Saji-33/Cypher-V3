// ============================================================
// src/events/interactionCreate.js — Interaction Router
// Routes slash commands, select menus, buttons, and modals.
// ============================================================
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MessageFlags,
} = require('discord.js');
const client = require('../client');
const { BOT_COLOR } = require('../../config');
const { userPlaytimes } = require('../utils/playtime');

// Command handlers
const { handleHiCommand, handleOnlineMembersCommand, handleHelpCommand, buildHelpMenuRow } = require('../commands/general');
const {
  handleEmbedCommand, handleSendDMCommand, handleSendMessageCommand,
  handleActivityCommand, handleSetStatusCommand, handleClearStatusCommand,
  handleSetupActivityCommand, handleSetupNicknameCommand,
  handleNicknameButton, handleNicknameModal,
  handleAutoreplyCommand, handleAutoreplyListCommand,
  handleAutoreplyEditCommand, handleAutoreplyDeleteCommand,
  handleActivityLeaderboard,
} = require('../commands/owner');
const {
  handleKickCommand, handleBanCommand, handleTimeoutCommand,
  handleWarnCommand, handleUnwarnCommand, handleWarnsCommand,
  handleSlowmodeCommand, handleClearCommand,
} = require('../commands/moderation');
const {
  handleJoinVcCommand, handleLeaveVcCommand, handleLockCommand, handleUnlockCommand,
  handleSBMuteCommand, handleSBUnmuteCommand, handleMoveAllCommand,
} = require('../commands/voice');

// ── Command dispatcher ───────────────────────────────────────
const COMMAND_MAP = {
  hi:                   (i) => handleHiCommand(i, i.user),
  online_members:       (i) => handleOnlineMembersCommand(i, i.guild),
  help:                 (i) => handleHelpCommand(i),
  embed:                (i) => handleEmbedCommand(i),
  send_dm:              (i) => handleSendDMCommand(i),
  send_message:         (i) => handleSendMessageCommand(i),
  activity:             (i) => handleActivityCommand(i),
  set_status:           (i) => handleSetStatusCommand(i),
  clear_status:         (i) => handleClearStatusCommand(i),
  setup_activity:       (i) => handleSetupActivityCommand(i),
  setup_nickname:       (i) => handleSetupNicknameCommand(i),
  activity_leaderboard: (i) => handleActivityLeaderboard(i),
  autoreply:            (i) => handleAutoreplyCommand(i),
  autoreplylist:        (i) => handleAutoreplyListCommand(i),
  autoreplyedit:        (i) => handleAutoreplyEditCommand(i),
  autoreplydelete:      (i) => handleAutoreplyDeleteCommand(i),
  joinvc:               (i) => handleJoinVcCommand(i),
  leavevc:              (i) => handleLeaveVcCommand(i),
  lock:                 (i) => handleLockCommand(i),
  unlock:               (i) => handleUnlockCommand(i),
  sbmute:               (i) => handleSBMuteCommand(i),
  sbunmute:             (i) => handleSBUnmuteCommand(i),
  moveall:              (i) => handleMoveAllCommand(i),
  kick:                 (i) => handleKickCommand(i),
  ban:                  (i) => handleBanCommand(i),
  timeout:              (i) => handleTimeoutCommand(i),
  warn:                 (i) => handleWarnCommand(i),
  unwarn:               (i) => handleUnwarnCommand(i),
  warns:                (i) => handleWarnsCommand(i),
  slowmode:             (i) => handleSlowmodeCommand(i),
  clear:                (i) => handleClearCommand(i),
};

// ── Select menu — help module categories ─────────────────────
const MODULE_FIELDS = {
  general: [
    { name: '👋 /hi',             value: "Get a friendly greeting",            inline: true },
    { name: '🟢 /online_members', value: "See who's active in the server",     inline: true },
    { name: 'ℹ️ /help',           value: 'Show command modules',               inline: true },
  ],
  voice: [
    { name: '🔊 /joinvc',                         value: 'Make bot join voice channel',           inline: true },
    { name: '🔇 /leavevc',                        value: 'Make bot leave voice channel',          inline: true },
    { name: '<:emlock:1410545959129059338> /lock', value: 'Lock a voice channel (Owner)',          inline: true },
    { name: '<:emunlock:1410545963247861760> /unlock', value: 'Unlock a voice channel (Owner)',    inline: true },
    { name: '📤 /moveall',                        value: 'Move all members to another VC (Owner)',inline: true },
    { name: '🔇 /sbmute',                         value: 'Mute soundboard for user (Owner)',      inline: true },
    { name: '🔊 /sbunmute',                       value: 'Unmute soundboard for user (Owner)',    inline: true },
  ],
  textmod: [
    { name: '🗑️ /clear',    value: 'Clear messages in channel (Moderators)', inline: true },
    { name: '⏳ /slowmode', value: 'Set slowmode for channel (Moderators)',   inline: true },
  ],
  usermod: [
    { name: '👢 /kick',    value: 'Kick a user (Moderators)',         inline: true },
    { name: '🚫 /ban',     value: 'Ban a user (Moderators)',          inline: true },
    { name: '⏳ /timeout', value: 'Timeout a user (Moderators)',      inline: true },
    { name: '⚠️ /warn',   value: 'Warn a user (Moderators)',         inline: true },
    { name: '📋 /warns',  value: 'View user warns (Moderators)',      inline: true },
  ],
  owner: [
    { name: '📝 /embed',            value: 'Create custom embeds',             inline: true },
    { name: '📩 /send_dm',          value: 'Send DMs to users',                inline: true },
    { name: '💬 /send_message',     value: 'Send simple messages',             inline: true },
    { name: '🎮 /activity',         value: "Set bot's activity",               inline: true },
    { name: '🎮 /set_status',       value: 'Set custom status',                inline: true },
    { name: '🎮 /clear_status',     value: 'Clear custom status',              inline: true },
    { name: '⚙️ /setup_activity',  value: 'Setup activity tracking',          inline: true },
    { name: '✏️ /setup_nickname',  value: 'Setup nickname change system',      inline: true },
    { name: '❌ /unwarn',          value: 'Remove a warn from user',           inline: true },
    { name: '🤖 /autoreply',        value: 'Add an autoreply',                 inline: true },
    { name: '📝 /autoreplyedit',    value: 'Edit an autoreply',               inline: true },
    { name: '📋 /autoreplylist',    value: 'List autoreplies',                inline: true },
    { name: '🗑️ /autoreplydelete', value: 'Delete an autoreply',             inline: true },
  ],
  gaming: [
    { name: '🏆 /activity_leaderboard', value: 'Show top players by playtime', inline: true },
  ],
};

// ── Button interaction handler ───────────────────────────────
async function handleButtonInteraction(interaction) {
  switch (interaction.customId) {
    case 'hi_command':
      return handleHiCommand(interaction, interaction.user);
    case 'online_command':
      return handleOnlineMembersCommand(interaction, interaction.guild);
    case 'serverinfo_command': {
      if (!interaction.guild) {
        return interaction.reply({ content: '❌ This command only works in servers!', flags: [MessageFlags.Ephemeral] });
      }
      const guild = interaction.guild;
      const serverEmbed = new EmbedBuilder()
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
        .addFields(
          { name: '👑 Owner',    value: `<@${guild.ownerId}>`,                               inline: true },
          { name: '📅 Created',  value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
          { name: '👥 Members',  value: `${guild.memberCount}`,                              inline: true },
          { name: '💬 Channels', value: `${guild.channels.cache.size}`,                     inline: true },
          { name: '🎭 Roles',    value: `${guild.roles.cache.size}`,                         inline: true },
          { name: '✨ Boosts',   value: `${guild.premiumSubscriptionCount || 0}`,            inline: true }
        )
        .setColor(BOT_COLOR)
        .setFooter({ text: `Server ID: ${guild.id}` });
      return interaction.reply({ embeds: [serverEmbed], flags: [MessageFlags.Ephemeral] });
    }
    case 'view_activity': {
      const userId   = interaction.user.id;
      const userData = userPlaytimes.get(userId) || { games: {}, total: 0 };
      let description = '**Your Game Activity:**\n\n';
      if (Object.keys(userData.games).length === 0) {
        description += 'No tracked game activity found.\nPlay some games to see your stats here!';
      } else {
        for (const [game, seconds] of Object.entries(userData.games)) {
          const h = Math.floor(seconds / 3600);
          const m = Math.floor((seconds % 3600) / 60);
          description += `**${game}**: ${h}h ${m}m\n`;
        }
        const totalH = Math.floor(userData.total / 3600);
        const totalM = Math.floor((userData.total % 3600) / 60);
        description += `\n**Total Playtime**: ${totalH}h ${totalM}m`;
      }
      const embed = new EmbedBuilder()
        .setTitle(`🎮 ${interaction.user.username}'s Activity`)
        .setDescription(description)
        .setColor(BOT_COLOR)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();
      return interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
    }
    case 'view_leaderboard': {
      const topPlayers = Array.from(userPlaytimes.entries())
        .map(([userId, data]) => ({ userId, time: data.total }))
        .filter(p => p.time > 0)
        .sort((a, b) => b.time - a.time)
        .slice(0, 10);
      if (topPlayers.length === 0) {
        return interaction.reply({ content: 'No activity data available yet!', flags: [MessageFlags.Ephemeral] });
      }
      let leaderboard = '';
      topPlayers.forEach((player, i) => {
        const h = Math.floor(player.time / 3600);
        const m = Math.floor((player.time % 3600) / 60);
        leaderboard += `**${i + 1}.** <@${player.userId}> — ${h}h ${m}m\n`;
      });
      const embed = new EmbedBuilder()
        .setTitle('🏆 Top Players by Playtime')
        .setDescription(leaderboard)
        .setColor(BOT_COLOR)
        .setFooter({ text: 'Updated every 5 minutes' })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
    }
    case 'change_nickname':
      return handleNicknameButton(interaction);
    default:
      return interaction.reply({ content: '❌ Unknown button interaction', flags: [MessageFlags.Ephemeral] });
  }
}

// ── Main event export ────────────────────────────────────────
module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      // ── Slash commands ─────────────────────────────────────
      if (interaction.isCommand()) {
        const handler = COMMAND_MAP[interaction.commandName];
        if (handler) {
          await handler(interaction);
        } else {
          await interaction.reply({ content: '❌ Unknown command!', flags: [MessageFlags.Ephemeral] });
        }
        return;
      }

      // ── Select menus ───────────────────────────────────────
      if (interaction.isStringSelectMenu() && interaction.customId === 'module_select') {
        await interaction.deferUpdate();
        const value  = interaction.values[0];
        const fields = MODULE_FIELDS[value] || [];

        const moduleEmbed = new EmbedBuilder()
          .setTitle(`📋 ${value.replace('mod', ' Moderation').replace('_', ' ').toUpperCase()}`)
          .setDescription('Commands in this module:')
          .addFields(fields)
          .setColor(BOT_COLOR)
          .setFooter({ text: 'Use the back button to return' });

        const backRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('back_to_modules')
            .setLabel('Back to Modules')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⬅️')
        );

        return interaction.editReply({ embeds: [moduleEmbed], components: [backRow] });
      }

      // ── Buttons ────────────────────────────────────────────
      if (interaction.isButton()) {
        if (interaction.customId === 'back_to_modules') {
          await interaction.deferUpdate();
          const embed = new EmbedBuilder()
            .setTitle('🤖 Command Modules')
            .setDescription('Select a module below to view its commands.')
            .setColor(BOT_COLOR)
            .setFooter({ text: `${client.user.username} • Select a module` });
          return interaction.editReply({ embeds: [embed], components: [buildHelpMenuRow()] });
        }
        return handleButtonInteraction(interaction);
      }

      // ── Modals ─────────────────────────────────────────────
      if (interaction.isModalSubmit() && interaction.customId === 'nickname_modal') {
        return handleNicknameModal(interaction);
      }

    } catch (error) {
      console.error('Error handling interaction:', error.message);
      const errMsg = { content: '❌ An error occurred while processing your interaction!', flags: [MessageFlags.Ephemeral] };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errMsg).catch(() => {});
      } else {
        await interaction.reply(errMsg).catch(() => {});
      }
    }
  },
};
