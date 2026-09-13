// ============================================================
// src/commands/voice.js — Voice Channel Commands
// /joinvc, /leavevc, /lock, /unlock, /sbmute, /sbunmute, /moveall
// ============================================================
const {
  ChannelType,
  MessageFlags,
} = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const { OWNER_ID } = require('../../config');

// Shared voice connection reference
let voiceConnection = null;

// ── /joinvc ──────────────────────────────────────────────────
async function handleJoinVcCommand(interaction) {
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const channel = interaction.options.getChannel('channel');

    if (channel.type !== ChannelType.GuildVoice) {
      return interaction.editReply({ content: '❌ Please select a valid voice channel!' });
    }
    if (getVoiceConnection(interaction.guildId)) {
      return interaction.editReply({ content: '❌ The bot is already in a voice channel!' });
    }

    voiceConnection = joinVoiceChannel({
      channelId:      channel.id,
      guildId:        interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    voiceConnection.on(VoiceConnectionStatus.Ready, () =>
      console.log(`✅ Bot joined voice channel: ${channel.name}`)
    );
    voiceConnection.on(VoiceConnectionStatus.Disconnected, () => {
      voiceConnection = null;
      console.log('ℹ️ Bot disconnected from voice channel');
    });

    await interaction.editReply({ content: `✅ Bot joined **${channel.name}**!` });
  } catch (error) {
    console.error('Error joining voice channel:', error);
    await interaction.editReply({ content: '❌ Failed to join the voice channel!' });
  }
}

// ── /leavevc ─────────────────────────────────────────────────
async function handleLeaveVcCommand(interaction) {
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const conn = getVoiceConnection(interaction.guildId);
    if (!conn) return interaction.editReply({ content: '❌ The bot is not in a voice channel!' });
    conn.destroy();
    voiceConnection = null;
    await interaction.editReply({ content: '✅ Bot left the voice channel!' });
  } catch (error) {
    console.error('Error leaving voice channel:', error);
    await interaction.editReply({ content: '❌ Failed to leave the voice channel!' });
  }
}

// ── /lock ────────────────────────────────────────────────────
async function handleLockCommand(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ Owner only.', flags: [MessageFlags.Ephemeral] });
  }
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    let channel = interaction.options.getChannel('channel') || interaction.member.voice.channel;
    if (!channel) return interaction.editReply({ content: '❌ You must be in a voice channel or specify one!' });
    if (channel.type !== ChannelType.GuildVoice) return interaction.editReply({ content: '❌ Please select a valid voice channel!' });
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: false });
    await interaction.editReply({ content: `<:emlock:1410545959129059338> Locked **${channel.name}**` });
  } catch (error) {
    console.error('Error locking channel:', error);
    await interaction.editReply({ content: '❌ Failed to lock channel!' });
  }
}

// ── /unlock ──────────────────────────────────────────────────
async function handleUnlockCommand(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ Owner only.', flags: [MessageFlags.Ephemeral] });
  }
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    let channel = interaction.options.getChannel('channel') || interaction.member.voice.channel;
    if (!channel) return interaction.editReply({ content: '❌ You must be in a voice channel or specify one!' });
    if (channel.type !== ChannelType.GuildVoice) return interaction.editReply({ content: '❌ Please select a valid voice channel!' });
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: null });
    await interaction.editReply({ content: `<:emunlock:1410545963247861760> Unlocked **${channel.name}**` });
  } catch (error) {
    console.error('Error unlocking channel:', error);
    await interaction.editReply({ content: '❌ Failed to unlock channel!' });
  }
}

// ── /sbmute ──────────────────────────────────────────────────
async function handleSBMuteCommand(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ Owner only.', flags: [MessageFlags.Ephemeral] });
  }
  const user = interaction.options.getUser('user');
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const vcs = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);
    let count = 0;
    for (const vc of vcs.values()) {
      try { await vc.permissionOverwrites.edit(user.id, { UseSoundboard: false }, 'SBMute'); count++; }
      catch (e) { console.warn(`SBMute failed in ${vc.name}:`, e.message); }
    }
    await interaction.editReply({ content: `🔇 SBMuted ${user.username} in ${count} channels <:reject:1410545947682799677>` });
  } catch (error) {
    console.error('Error sbmuting user:', error);
    await interaction.editReply({ content: '❌ Failed to SBMute user!' });
  }
}

// ── /sbunmute ────────────────────────────────────────────────
async function handleSBUnmuteCommand(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ Owner only.', flags: [MessageFlags.Ephemeral] });
  }
  const user = interaction.options.getUser('user');
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const vcs = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);
    let count = 0;
    for (const vc of vcs.values()) {
      try { await vc.permissionOverwrites.edit(user.id, { UseSoundboard: null }, 'SBUnmute'); count++; }
      catch (e) { console.warn(`SBUnmute failed in ${vc.name}:`, e.message); }
    }
    await interaction.editReply({ content: `🔊 SBUnmuted ${user.username} in ${count} channels <:emunlock:1410545963247861760>` });
  } catch (error) {
    console.error('Error sbunmuting user:', error);
    await interaction.editReply({ content: '❌ Failed to SBUnmute user!' });
  }
}

// ── /moveall ─────────────────────────────────────────────────
async function handleMoveAllCommand(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '⛔️ Owner only.', flags: [MessageFlags.Ephemeral] });
  }
  const target = interaction.options.getChannel('target');
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    if (target.type !== ChannelType.GuildVoice) return interaction.editReply({ content: '❌ Invalid target channel.' });
    const currentChannel = interaction.member.voice.channel;
    if (!currentChannel) return interaction.editReply({ content: '❌ You must be in a voice channel.' });
    const members = currentChannel.members.filter(m => !m.user.bot);
    let moved = 0;
    for (const member of members.values()) {
      try { await member.voice.setChannel(target.id); moved++; }
      catch (e) { console.warn(`Failed to move ${member.user.tag}:`, e.message); }
    }
    await interaction.editReply({ content: `📤 Moved ${moved} members to **${target.name}** <:member:1410545951361335387>` });
  } catch (error) {
    console.error('Error moving members:', error);
    await interaction.editReply({ content: '❌ Failed to move members!' });
  }
}

module.exports = {
  handleJoinVcCommand,
  handleLeaveVcCommand,
  handleLockCommand,
  handleUnlockCommand,
  handleSBMuteCommand,
  handleSBUnmuteCommand,
  handleMoveAllCommand,
};
