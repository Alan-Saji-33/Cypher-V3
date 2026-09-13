// ============================================================
// src/commands/general.js — General Commands
// /hi, /online_members, /help
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
const { safelyFetchMembers } = require('../utils/helpers');
const { SERVER_BANNER_URL, BOT_COLOR } = require('../../config');

// ── /hi ─────────────────────────────────────────────────────
async function handleHiCommand(interaction, user) {
  try {
    const embed = new EmbedBuilder()
      .setTitle(`👋 Hello ${user.username}!`)
      .setDescription(
        `This is the official Discord bot of **Cypher v3**, developed by **@hyper.hawk**!\n\nFeel free to explore and interact!`
      )
      .setColor(BOT_COLOR)
      .setImage(SERVER_BANNER_URL)
      .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() })
      .setTimestamp();
    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  } catch (error) {
    console.error('Error in /hi:', error);
    await interaction.reply({ content: '❌ Failed to execute hi command!', flags: [MessageFlags.Ephemeral] });
  }
}

// ── /online_members ──────────────────────────────────────────
async function handleOnlineMembersCommand(interaction, guild) {
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    if (!guild) return interaction.editReply({ content: '❌ This command can only be used inside a server.' });

    const nonBotMembers = await safelyFetchMembers(guild);
    const onlineMembers = nonBotMembers.filter(
      m => m.presence?.status && ['online', 'idle', 'dnd'].includes(m.presence.status)
    );

    if (onlineMembers.size === 0) return interaction.editReply({ content: 'ℹ️ No online members found.' });

    const groups = { online: [], idle: [], dnd: [] };
    onlineMembers.forEach(member => {
      const status = member.presence.status;
      const emoji = { online: '🟢', idle: '🟡', dnd: '🔴' }[status];
      groups[status].push(`${emoji} **${member.nickname || member.user.username}**`);
    });

    let description = '';
    if (groups.online.length) description += `### Online (${groups.online.length})\n${groups.online.join('\n')}\n\n`;
    if (groups.idle.length)   description += `### Idle (${groups.idle.length})\n${groups.idle.join('\n')}\n\n`;
    if (groups.dnd.length)    description += `### Do Not Disturb (${groups.dnd.length})\n${groups.dnd.join('\n')}\n\n`;

    const total = nonBotMembers.size;
    const active = groups.online.length + groups.idle.length + groups.dnd.length;
    description += `### Server Activity\n🟢 **${groups.online.length}** Online | 🟡 **${groups.idle.length}** Idle | 🔴 **${groups.dnd.length}** DND\n👥 **${active}/${total}** members active (${Math.round((active / total) * 100)}%)`;

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${guild.name} Member Status`)
      .setDescription(description)
      .setColor(BOT_COLOR)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in /online_members:', error);
    await interaction.editReply({ content: '❌ Failed to execute online members command!' });
  }
}

// ── /help ────────────────────────────────────────────────────
function buildHelpMenuRow() {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('module_select')
    .setPlaceholder('Choose a category...')
    .addOptions(
      { label: 'General Commands',  description: 'Basic commands like greet and help',      value: 'general',  emoji: 'ℹ️' },
      { label: 'Voice Moderation',  description: 'Voice channel management',                 value: 'voice',    emoji: '🔊' },
      { label: 'Text Moderation',   description: 'Message and channel moderation tools',     value: 'textmod',  emoji: '💬' },
      { label: 'User Moderation',   description: 'User management tools',                    value: 'usermod',  emoji: '👤' },
      { label: 'Owner Commands',    description: 'Admin-only commands',                      value: 'owner',    emoji: '👑' },
      { label: 'Gaming Tracking',   description: 'Playtime and activity tracking',           value: 'gaming',   emoji: '🎮' }
    );
  return new ActionRowBuilder().addComponents(selectMenu);
}

async function handleHelpCommand(interaction) {
  try {
    const embed = new EmbedBuilder()
      .setTitle('🤖 Command Modules')
      .setDescription('Select a module below to view its commands.')
      .setColor(BOT_COLOR)
      .setFooter({ text: `${client.user.username} • Select a module` });
    await interaction.reply({ embeds: [embed], components: [buildHelpMenuRow()], flags: [MessageFlags.Ephemeral] });
  } catch (error) {
    console.error('Error in /help:', error);
    await interaction.reply({ content: '❌ Failed to execute help command!', flags: [MessageFlags.Ephemeral] });
  }
}

module.exports = { handleHiCommand, handleOnlineMembersCommand, handleHelpCommand, buildHelpMenuRow };
