// ============================================================
// src/commands/moderation.js — Moderation Commands
// /kick, /ban, /timeout, /warn, /unwarn, /warns,
// /slowmode, /clear
// ============================================================
const { EmbedBuilder, MessageFlags } = require('discord.js');
const { userWarns } = require('../utils/warns');
const { BOT_COLOR } = require('../../config');

// ── /kick ────────────────────────────────────────────────────
async function handleKickCommand(interaction) {
  if (!interaction.member.permissions.has('KickMembers')) {
    return interaction.reply({ content: '⛔️ You do not have permission to kick members.', flags: [MessageFlags.Ephemeral] });
  }
  const user   = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) return interaction.reply({ content: '❌ User not found in the server.', flags: [MessageFlags.Ephemeral] });
  if (!member.kickable) return interaction.reply({ content: '❌ I cannot kick this user.', flags: [MessageFlags.Ephemeral] });

  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const embed = new EmbedBuilder()
      .setTitle('You Have Been Kicked')
      .setDescription(`You were kicked from **${interaction.guild.name}**.`)
      .addFields(
        { name: 'Reason',    value: reason,                  inline: true },
        { name: 'Moderator', value: interaction.user.tag,    inline: true }
      )
      .setColor(BOT_COLOR)
      .setTimestamp();
    await user.send({ embeds: [embed] }).catch(err => console.warn(`Could not DM ${user.tag}:`, err.message));
    await member.kick(reason);
    await interaction.editReply({ content: `✅ Kicked ${user.tag} — Reason: ${reason}` });
  } catch (error) {
    console.error('Error kicking user:', error);
    await interaction.editReply({ content: '❌ Failed to kick the user!' });
  }
}

// ── /ban ─────────────────────────────────────────────────────
async function handleBanCommand(interaction) {
  if (!interaction.member.permissions.has('BanMembers')) {
    return interaction.reply({ content: '⛔️ You do not have permission to ban members.', flags: [MessageFlags.Ephemeral] });
  }
  const user   = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) return interaction.reply({ content: '❌ User not found in the server.', flags: [MessageFlags.Ephemeral] });
  if (!member.bannable) return interaction.reply({ content: '❌ I cannot ban this user.', flags: [MessageFlags.Ephemeral] });

  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🚫 You Have Been Banned')
      .setDescription(
        `> You have been **banned** from **${interaction.guild.name}**.\n\n` +
        `Please review the details below.`
      )
      .addFields(
        { name: '📄 Reason',     value: `\`\`\`${reason}\`\`\``,          inline: false },
        { name: '🛡️ Moderator', value: interaction.user.tag,              inline: true  }
      )
      .setImage('https://i.ibb.co/XZLQM1Xj/banned.gif')
      .setFooter({ text: 'Rule violations result in permanent bans 🚨' })
      .setTimestamp();
    await user.send({ embeds: [embed] }).catch(err => console.warn(`Could not DM ${user.tag}:`, err.message));
    await interaction.guild.members.ban(user, { reason });
    await interaction.editReply({ content: `✅ Banned ${user.tag} — Reason: ${reason}` });
  } catch (error) {
    console.error('Error banning user:', error);
    await interaction.editReply({ content: '❌ Failed to ban the user!' });
  }
}

// ── /timeout ─────────────────────────────────────────────────
async function handleTimeoutCommand(interaction) {
  if (!interaction.member.permissions.has('ModerateMembers')) {
    return interaction.reply({ content: '⛔️ You do not have permission to timeout members.', flags: [MessageFlags.Ephemeral] });
  }
  const user     = interaction.options.getUser('user');
  const duration = interaction.options.getInteger('duration');
  const reason   = interaction.options.getString('reason') || 'No reason provided';
  const member   = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member)              return interaction.reply({ content: '❌ User not found.',     flags: [MessageFlags.Ephemeral] });
  if (!member.moderatable)  return interaction.reply({ content: '❌ I cannot timeout this user.', flags: [MessageFlags.Ephemeral] });

  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const until = new Date(Date.now() + duration * 60 * 1000);
    const embed = new EmbedBuilder()
      .setTitle('You Have Been Timed Out')
      .setDescription(`You were timed out in **${interaction.guild.name}**.`)
      .addFields(
        { name: 'Reason',         value: reason,                                              inline: true },
        { name: 'Moderator',      value: interaction.user.tag,                                inline: true },
        { name: 'Duration',       value: `${duration} minutes`,                               inline: true },
        { name: 'Timeout Ends',   value: `<t:${Math.floor(until / 1000)}:R>`,                 inline: true }
      )
      .setColor(BOT_COLOR)
      .setImage('https://i.ibb.co/Y4Jr7SBK/TIMEOUT.gif')
      .setTimestamp();
    await user.send({ embeds: [embed] }).catch(err => console.warn(`Could not DM ${user.tag}:`, err.message));
    await member.timeout(duration * 60 * 1000, reason);
    await interaction.editReply({ content: `✅ Timed out ${user.tag} for ${duration} min — Reason: ${reason}` });
  } catch (error) {
    console.error('Error timing out user:', error);
    await interaction.editReply({ content: '❌ Failed to timeout the user!' });
  }
}

// ── /warn ────────────────────────────────────────────────────
async function handleWarnCommand(interaction) {
  if (!interaction.member.permissions.has('ModerateMembers')) {
    return interaction.reply({ content: '⛔️ You do not have permission to warn users.', flags: [MessageFlags.Ephemeral] });
  }
  const user   = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) return interaction.reply({ content: '❌ User not found.', flags: [MessageFlags.Ephemeral] });

  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    if (!userWarns.has(user.id)) userWarns.set(user.id, []);
    const warns  = userWarns.get(user.id);
    const warnId = warns.length + 1;
    warns.push({ id: warnId, reason, moderator: interaction.user.tag, timestamp: Date.now() });
    userWarns.set(user.id, warns);

    const embed = new EmbedBuilder()
      .setTitle('⚠️ You Have Been Warned')
      .setDescription(
        `> You were warned in **${interaction.guild.name}**.\n\n` +
        `Please follow server rules to avoid further action.`
      )
      .addFields(
        { name: '📄 Reason',    value: `\`\`\`${reason}\`\`\``, inline: false },
        { name: '🛡️ Moderator',value: interaction.user.tag,     inline: true  },
        { name: '🆔 Warn ID',   value: `\`${warnId}\``,          inline: true  }
      )
      .setColor('#fc0808')
      .setImage('https://i.ibb.co/cXD8VRYx/WARNING.gif')
      .setFooter({ text: 'Please be mindful of server rules ⚠️' })
      .setTimestamp();
    await user.send({ embeds: [embed] }).catch(err => console.warn(`Could not DM ${user.tag}:`, err.message));
    await interaction.editReply({ content: `✅ Warned ${user.tag} — Reason: ${reason} (ID: ${warnId})` });
  } catch (error) {
    console.error('Error warning user:', error);
    await interaction.editReply({ content: '❌ Failed to warn the user!' });
  }
}

// ── /unwarn ──────────────────────────────────────────────────
async function handleUnwarnCommand(interaction) {
  const { OWNER_ID } = require('../../config');
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ Owner only.', flags: [MessageFlags.Ephemeral] });
  }
  const user   = interaction.options.getUser('user');
  const warnId = interaction.options.getInteger('warn_id');
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    if (!userWarns.has(user.id) || !userWarns.get(user.id).some(w => w.id === warnId)) {
      return interaction.editReply({ content: '❌ Warn not found.' });
    }
    userWarns.set(user.id, userWarns.get(user.id).filter(w => w.id !== warnId));
    await interaction.editReply({ content: `✅ Removed warn #${warnId} from ${user.tag}` });
  } catch (error) {
    console.error('Error removing warn:', error);
    await interaction.editReply({ content: '❌ Failed to remove warn!' });
  }
}

// ── /warns ───────────────────────────────────────────────────
async function handleWarnsCommand(interaction) {
  if (!interaction.member.permissions.has('ModerateMembers')) {
    return interaction.reply({ content: '⛔️ You do not have permission to view warns.', flags: [MessageFlags.Ephemeral] });
  }
  const user = interaction.options.getUser('user');
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const warns = userWarns.get(user.id) || [];
    if (warns.length === 0) return interaction.editReply({ content: `${user.tag} has no warns.` });
    let description = '';
    warns.forEach(w => {
      description += `**ID:** ${w.id} | **Reason:** ${w.reason} | **By:** ${w.moderator} | **Date:** <t:${Math.floor(w.timestamp / 1000)}:F>\n`;
    });
    const embed = new EmbedBuilder()
      .setTitle(`Warns for ${user.tag}`)
      .setDescription(description)
      .setColor(BOT_COLOR)
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error viewing warns:', error);
    await interaction.editReply({ content: '❌ Failed to view warns!' });
  }
}

// ── /slowmode ────────────────────────────────────────────────
async function handleSlowmodeCommand(interaction) {
  if (!interaction.member.permissions.has('ManageMessages')) {
    return interaction.reply({ content: '⛔️ You do not have permission to manage slowmode.', flags: [MessageFlags.Ephemeral] });
  }
  const seconds = interaction.options.getInteger('seconds');
  const channel = interaction.options.getChannel('channel') || interaction.channel;
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    await channel.setRateLimitPerUser(seconds);
    await interaction.editReply({ content: `✅ Slowmode set to ${seconds}s in ${channel.name}` });
  } catch (error) {
    console.error('Error setting slowmode:', error);
    await interaction.editReply({ content: '❌ Failed to set slowmode!' });
  }
}

// ── /clear ───────────────────────────────────────────────────
async function handleClearCommand(interaction) {
  if (!interaction.member.permissions.has('ManageMessages')) {
    return interaction.reply({ content: '⛔️ You do not have permission to manage messages.', flags: [MessageFlags.Ephemeral] });
  }
  const amount  = interaction.options.getInteger('amount');
  const user    = interaction.options.getUser('user');
  const channel = interaction.channel;
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    let messages;
    if (user) {
      messages = await channel.messages.fetch({ limit: 100 });
      messages = messages.filter(msg => msg.author.id === user.id);
      if (amount) messages = messages.first(amount);
    } else {
      messages = await channel.messages.fetch({ limit: amount || 100 });
    }
    if (!messages.size) return interaction.editReply({ content: '❌ No messages found to delete.' });
    await channel.bulkDelete(messages, true);
    await interaction.editReply({ content: `✅ Deleted ${messages.size} messages${user ? ` from ${user.tag}` : ''}.` });
  } catch (error) {
    console.error('Error clearing messages:', error);
    await interaction.editReply({ content: '❌ Failed to clear messages!' });
  }
}

module.exports = {
  handleKickCommand,
  handleBanCommand,
  handleTimeoutCommand,
  handleWarnCommand,
  handleUnwarnCommand,
  handleWarnsCommand,
  handleSlowmodeCommand,
  handleClearCommand,
};
