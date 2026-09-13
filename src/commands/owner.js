// ============================================================
// src/commands/owner.js — Owner-Only Commands
// /embed, /send_dm, /send_message, /activity, /set_status,
// /clear_status, /setup_activity, /setup_nickname,
// /autoreply, /autoreplylist, /autoreplyedit, /autoreplydelete,
// /activity_leaderboard
// ============================================================
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} = require('discord.js');
const client  = require('../client');
const { isValidUrl } = require('../utils/helpers');
const { updateBotActivity } = require('../utils/stats');
const { userPlaytimes } = require('../utils/playtime');
const { getAutoreplies } = require('../utils/autoreplies');
const {
  OWNER_ID,
  ACTIVITY_CHANNEL_ID,
  BOT_COLOR,
  BOT_FOOTER,
  SERVER_BANNER_URL,
} = require('../../config');

// ── Permission guard ─────────────────────────────────────────
function ownerOnly(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    interaction.reply({ content: '⛔️ You do not have permission to use this command.', flags: [MessageFlags.Ephemeral] });
    return false;
  }
  return true;
}

// ── /embed ───────────────────────────────────────────────────
async function handleEmbedCommand(interaction) {
  if (!ownerOnly(interaction)) return;

  const title         = interaction.options.getString('title');
  let   description   = interaction.options.getString('description').replace(/\\n/g, '\n');
  const image         = interaction.options.getString('image');
  const thumbnail     = interaction.options.getString('thumbnail');
  const footer        = interaction.options.getString('footer');
  const button1       = interaction.options.getString('button1');
  const button1url    = interaction.options.getString('button1url');
  const button1emoji  = interaction.options.getString('button1emoji');
  const button2       = interaction.options.getString('button2');
  const button2url    = interaction.options.getString('button2url');
  const button2emoji  = interaction.options.getString('button2emoji');
  const timestamp     = interaction.options.getBoolean('timestamp') || false;
  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
  const mentionRole   = interaction.options.getRole('mention');

  const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(BOT_COLOR);
  if (image)     embed.setImage(image);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (footer)    embed.setFooter({ text: footer });
  if (timestamp) embed.setTimestamp();

  const row = new ActionRowBuilder();

  const addButton = (label, url, emojiStr) => {
    if (!label || !url || !isValidUrl(url)) return;
    const btn = new ButtonBuilder().setLabel(label).setStyle(ButtonStyle.Link).setURL(url);
    if (emojiStr) {
      const parts = emojiStr.split(':');
      if (parts.length === 2) btn.setEmoji({ name: parts[0], id: parts[1] });
    }
    row.addComponents(btn);
  };

  addButton(button1, button1url, button1emoji);
  addButton(button2, button2url, button2emoji);

  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    await targetChannel.send({
      content: mentionRole ? `${mentionRole}` : '',
      embeds: [embed],
      components: row.components.length > 0 ? [row] : [],
      allowedMentions: { roles: mentionRole ? [mentionRole.id] : [] },
    });
    await interaction.editReply({ content: `✅ Embed sent to ${targetChannel}!${mentionRole ? ` with ${mentionRole.name} mention` : ''}` });
  } catch (error) {
    console.error('Error sending embed:', error);
    await interaction.editReply({ content: '❌ There was an error sending the embed!' });
  }
}

// ── /send_dm ─────────────────────────────────────────────────
async function handleSendDMCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  const user    = interaction.options.getUser('user');
  const message = interaction.options.getString('message');
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    await user.send(message);
    await interaction.editReply({ content: `✅ DM sent to ${user.tag}!` });
  } catch (error) {
    console.error('Error sending DM:', error);
    await interaction.editReply({ content: '❌ Failed to send DM! The user may have DMs disabled.' });
  }
}

// ── /send_message ────────────────────────────────────────────
async function handleSendMessageCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  const message       = interaction.options.getString('message').replace(/\\n/g, '\n');
  const mentionRole   = interaction.options.getRole('mention');
  const fileAttachment = interaction.options.getAttachment('file');
  const channel       = interaction.channel;

  let files = [];
  if (fileAttachment) {
    const ext = fileAttachment.name.split('.').pop().toLowerCase();
    if (!['png', 'jpg', 'jpeg'].includes(ext)) {
      return interaction.reply({ content: '❌ Only PNG and JPEG files are allowed!', flags: [MessageFlags.Ephemeral] });
    }
    files = [{ attachment: fileAttachment.url, name: fileAttachment.name }];
  }

  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    await channel.send({
      content: mentionRole ? `${mentionRole}\n${message}` : message,
      files: files.length > 0 ? files : undefined,
      allowedMentions: { roles: mentionRole ? [mentionRole.id] : [] },
    });
    await interaction.editReply({
      content: `✅ Message sent!${mentionRole ? ` with ${mentionRole.name} mention` : ''}${fileAttachment ? ` with file ${fileAttachment.name}` : ''}`,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    await interaction.editReply({ content: '❌ Failed to send message!' });
  }
}

// ── /activity ────────────────────────────────────────────────
async function handleActivityCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  const sub = interaction.options.getSubcommand();
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    if (sub === 'set') {
      const type = interaction.options.getString('type');
      const text = interaction.options.getString('text');
      const url  = interaction.options.getString('url');
      if (type === 'STREAMING' && !url) return interaction.editReply({ content: '❌ Streaming requires a URL!' });
      client.currentActivity = { type, text, url, containsStats: text.includes('{online}') || text.includes('{total}') };
      await updateBotActivity();
      await interaction.editReply({ content: `✅ Activity set: ${type} ${text}${url ? ` (${url})` : ''}` });
    } else if (sub === 'remove') {
      client.currentActivity = null;
      await updateBotActivity();
      await interaction.editReply({ content: '✅ Activity removed!' });
    } else if (sub === 'view') {
      if (!client.currentActivity) {
        await interaction.editReply({ content: 'ℹ️ No activity is currently set.' });
      } else {
        await interaction.editReply({
          content: `**Type:** ${client.currentActivity.type}\n**Text:** ${client.currentActivity.text}${client.currentActivity.url ? `\n**URL:** ${client.currentActivity.url}` : ''}`,
        });
      }
    }
  } catch (error) {
    console.error('Error in /activity:', error);
    await interaction.editReply({ content: '❌ Failed to process activity command!' });
  }
}

// ── /set_status ──────────────────────────────────────────────
async function handleSetStatusCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const status     = interaction.options.getString('status');
    const customText = interaction.options.getString('text');
    client.currentStatus = { status, customText };
    await updateBotActivity();
    await interaction.editReply({ content: `✅ Status set to **${status}** with text: ${customText}` });
  } catch (error) {
    console.error('Error in /set_status:', error);
    await interaction.editReply({ content: '❌ Failed to set status!' });
  }
}

// ── /clear_status ────────────────────────────────────────────
async function handleClearStatusCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    client.currentStatus = { status: 'online', customText: null };
    await updateBotActivity();
    await interaction.editReply({ content: '✅ Custom status cleared!' });
  } catch (error) {
    console.error('Error in /clear_status:', error);
    await interaction.editReply({ content: '❌ Failed to clear status!' });
  }
}

// ── /setup_activity ──────────────────────────────────────────
async function handleSetupActivityCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('view_activity').setLabel('View Your Activity').setStyle(ButtonStyle.Primary).setEmoji('🎮'),
    new ButtonBuilder().setCustomId('view_leaderboard').setLabel('View Leaderboard').setStyle(ButtonStyle.Secondary).setEmoji('🏆')
  );
  const embed = new EmbedBuilder()
    .setTitle('🎮 Game Activity Tracker')
    .setDescription('Track your playtime automatically while playing games!\n\n🏆 **View Leaderboard** \n\n📊 View your stats or check out the server leaderboard.\n\n')
    .setColor(BOT_COLOR)
    .setImage(SERVER_BANNER_URL)
    .setThumbnail(client.user.displayAvatarURL())
    .setFooter({ text: `Tracking playtime • ${BOT_FOOTER}` });
  try {
    const channel = await client.channels.fetch(ACTIVITY_CHANNEL_ID);
    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Activity tracker setup complete!', flags: [MessageFlags.Ephemeral] });
  } catch (error) {
    console.error('Error in /setup_activity:', error);
    await interaction.reply({ content: '❌ Failed to setup activity tracker!', flags: [MessageFlags.Ephemeral] });
  }
}

// ── /setup_nickname ──────────────────────────────────────────
async function handleSetupNicknameCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('change_nickname').setLabel('Change Now').setStyle(ButtonStyle.Primary)
  );
  try {
    await interaction.channel.send({ components: [row] });
    await interaction.reply({ content: '✅ Name change system setup complete!', flags: [MessageFlags.Ephemeral] });
  } catch (error) {
    console.error('Error in /setup_nickname:', error);
    await interaction.reply({ content: '❌ Failed to setup name change system!', flags: [MessageFlags.Ephemeral] });
  }
}

// ── Nickname modal (button → modal → submit) ─────────────────
async function handleNicknameButton(interaction) {
  try {
    const modal = new ModalBuilder().setCustomId('nickname_modal').setTitle('Change Name');
    const input = new TextInputBuilder()
      .setCustomId('new_nickname')
      .setLabel('Enter your new name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Type your desired name')
      .setRequired(true)
      .setMaxLength(32);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  } catch (error) {
    console.error('Error showing nickname modal:', error);
    await interaction.reply({ content: '❌ Failed to show nickname modal!', flags: [MessageFlags.Ephemeral] });
  }
}

async function handleNicknameModal(interaction) {
  try {
    const newNickname = interaction.fields.getTextInputValue('new_nickname');
    await interaction.reply({ content: '✅ Your request has been submitted for review.', flags: [MessageFlags.Ephemeral] });
    const owner = await client.users.fetch(OWNER_ID);
    await owner.send(`Nickname change request from ${interaction.user.tag} (${interaction.user.id}):\nNew nickname: ${newNickname}`);
    setTimeout(async () => {
      try {
        await interaction.member.setNickname(newNickname);
        await interaction.user.send(`✅ Your name has been changed to **${newNickname}**!`);
      } catch (err) {
        console.error('Error changing nickname:', err);
        await interaction.user.send('❌ Failed to change your name. Please contact an admin.');
      }
    }, 5000);
  } catch (error) {
    console.error('Error handling nickname modal:', error);
    await interaction.reply({ content: '❌ An error occurred while processing your request.', flags: [MessageFlags.Ephemeral] });
  }
}

// ── /autoreply ───────────────────────────────────────────────
async function handleAutoreplyCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  const trigger       = interaction.options.getString('trigger');
  const reply         = interaction.options.getString('reply');
  const caseSensitive = interaction.options.getBoolean('case_sensitive') || false;
  const autoreplies   = getAutoreplies();
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const newId = autoreplies.length > 0 ? Math.max(...autoreplies.map(ar => ar.id)) + 1 : 1;
    autoreplies.push({ id: newId, trigger, reply, caseSensitive });
    await interaction.editReply({ content: `✅ Added autoreply #${newId}: \`${trigger}\` → \`${reply}\` (Case sensitive: ${caseSensitive})` });
  } catch (error) {
    console.error('Error adding autoreply:', error);
    await interaction.editReply({ content: '❌ Failed to add autoreply!' });
  }
}

async function handleAutoreplyListCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  const autoreplies = getAutoreplies();
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    if (autoreplies.length === 0) return interaction.editReply({ content: 'ℹ️ No autoreplies set.' });
    let description = '';
    autoreplies.forEach(ar => {
      description += `**ID ${ar.id}:** Trigger: \`${ar.trigger}\` → Reply: ${ar.reply}\nCase sensitive: ${ar.caseSensitive ? 'Yes' : 'No'}\n\n`;
    });
    const embed = new EmbedBuilder().setTitle('📝 Autoreplies List').setDescription(description).setColor(BOT_COLOR).setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error listing autoreplies:', error);
    await interaction.editReply({ content: '❌ Failed to list autoreplies!' });
  }
}

async function handleAutoreplyEditCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  const id              = interaction.options.getInteger('id');
  const newTrigger      = interaction.options.getString('trigger');
  const newReply        = interaction.options.getString('reply');
  const newCaseSensitive = interaction.options.getBoolean('case_sensitive');
  const autoreplies     = getAutoreplies();
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const index = autoreplies.findIndex(ar => ar.id === id);
    if (index === -1) return interaction.editReply({ content: '❌ Autoreply not found.' });
    if (newTrigger)       autoreplies[index].trigger = newTrigger;
    if (newReply != null) autoreplies[index].reply = newReply;
    if (newCaseSensitive != null) autoreplies[index].caseSensitive = newCaseSensitive;
    await interaction.editReply({ content: `✅ Edited autoreply #${id}.` });
  } catch (error) {
    console.error('Error editing autoreply:', error);
    await interaction.editReply({ content: '❌ Failed to edit autoreply!' });
  }
}

async function handleAutoreplyDeleteCommand(interaction) {
  if (!ownerOnly(interaction)) return;
  const id = interaction.options.getInteger('id');
  const autoreplies = getAutoreplies();
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const index = autoreplies.findIndex(ar => ar.id === id);
    if (index === -1) return interaction.editReply({ content: '❌ Autoreply not found.' });
    autoreplies.splice(index, 1);
    await interaction.editReply({ content: `✅ Deleted autoreply #${id}.` });
  } catch (error) {
    console.error('Error deleting autoreply:', error);
    await interaction.editReply({ content: '❌ Failed to delete autoreply!' });
  }
}

// ── /activity_leaderboard ────────────────────────────────────
async function handleActivityLeaderboard(interaction) {
  try {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const players = Array.from(userPlaytimes.entries())
      .map(([userId, data]) => ({ userId, time: data.total, games: data.games }))
      .filter(p => p.time > 0)
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

    if (players.length === 0) return interaction.editReply({ content: 'No activity data yet!' });

    let description = '';
    players.forEach((player, i) => {
      const h = Math.floor(player.time / 3600);
      const m = Math.floor((player.time % 3600) / 60);
      const topGame = Object.entries(player.games).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
      description += `**${i + 1}.** <@${player.userId}> — ${h}h ${m}m (Most played: ${topGame})\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle('🏆 Overall Playtime Leaderboard')
      .setDescription(description)
      .setColor(BOT_COLOR)
      .setFooter({ text: 'Updated every 5 minutes' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in /activity_leaderboard:', error);
    await interaction.editReply({ content: '❌ Failed to show leaderboard!' });
  }
}

module.exports = {
  handleEmbedCommand,
  handleSendDMCommand,
  handleSendMessageCommand,
  handleActivityCommand,
  handleSetStatusCommand,
  handleClearStatusCommand,
  handleSetupActivityCommand,
  handleSetupNicknameCommand,
  handleNicknameButton,
  handleNicknameModal,
  handleAutoreplyCommand,
  handleAutoreplyListCommand,
  handleAutoreplyEditCommand,
  handleAutoreplyDeleteCommand,
  handleActivityLeaderboard,
};
