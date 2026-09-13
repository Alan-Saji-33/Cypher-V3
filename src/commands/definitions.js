// ============================================================
// src/commands/definitions.js — All Slash Command Definitions
// ============================================================
const { SlashCommandBuilder, ChannelType } = require('discord.js');

const commands = [
  // ── General ───────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('hi')
    .setDescription('Greet the user with a custom message.'),

  new SlashCommandBuilder()
    .setName('online_members')
    .setDescription('Display a list of online members.'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands.'),

  // ── Owner — embed / messaging ─────────────────────────────
  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send a custom embed message (Owner only)')
    .addStringOption(o => o.setName('title').setDescription('Embed title').setRequired(true))
    .addStringOption(o => o.setName('description').setDescription('Embed description (\\\\n = newline)').setRequired(true))
    .addStringOption(o => o.setName('image').setDescription('Image URL').setRequired(false))
    .addStringOption(o => o.setName('thumbnail').setDescription('Thumbnail URL').setRequired(false))
    .addStringOption(o => o.setName('footer').setDescription('Footer text').setRequired(false))
    .addStringOption(o => o.setName('button1').setDescription('First button text').setRequired(false))
    .addStringOption(o => o.setName('button1url').setDescription('First button URL').setRequired(false))
    .addStringOption(o => o.setName('button1emoji').setDescription('First button emoji (name:id)').setRequired(false))
    .addStringOption(o => o.setName('button2').setDescription('Second button text').setRequired(false))
    .addStringOption(o => o.setName('button2url').setDescription('Second button URL').setRequired(false))
    .addStringOption(o => o.setName('button2emoji').setDescription('Second button emoji (name:id)').setRequired(false))
    .addBooleanOption(o => o.setName('timestamp').setDescription('Add timestamp?').setRequired(false))
    .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(false))
    .addRoleOption(o => o.setName('mention').setDescription('Role to mention').setRequired(false)),

  new SlashCommandBuilder()
    .setName('send_dm')
    .setDescription('Send a DM to a user (Owner only)')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Message to send').setRequired(true)),

  new SlashCommandBuilder()
    .setName('send_message')
    .setDescription('Send a message to the current channel (Owner only)')
    .addStringOption(o => o.setName('message').setDescription('Message (\\\\n = newline)').setRequired(true))
    .addAttachmentOption(o => o.setName('file').setDescription('PNG/JPEG attachment').setRequired(false))
    .addRoleOption(o => o.setName('mention').setDescription('Role to mention').setRequired(false)),

  // ── Owner — presence ──────────────────────────────────────
  new SlashCommandBuilder()
    .setName('activity')
    .setDescription("Control the bot's activity")
    .addSubcommand(sub => sub.setName('set').setDescription('Set a new activity')
      .addStringOption(o => o.setName('type').setDescription('Activity type').setRequired(true)
        .addChoices(
          { name: 'Playing',   value: 'PLAYING'   },
          { name: 'Watching',  value: 'WATCHING'  },
          { name: 'Listening', value: 'LISTENING' },
          { name: 'Streaming', value: 'STREAMING' }
        ))
      .addStringOption(o => o.setName('text').setDescription('Activity text ({online}/{total} supported)').setRequired(true))
      .addStringOption(o => o.setName('url').setDescription('Stream URL (STREAMING only)').setRequired(false)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Remove current activity'))
    .addSubcommand(sub => sub.setName('view').setDescription('View current activity settings')),

  new SlashCommandBuilder()
    .setName('set_status')
    .setDescription('Set custom bot status (Owner only)')
    .addStringOption(o => o.setName('status').setDescription('Status type').setRequired(true)
      .addChoices(
        { name: 'Online',         value: 'online'    },
        { name: 'Idle',           value: 'idle'      },
        { name: 'Do Not Disturb', value: 'dnd'       },
        { name: 'Invisible',      value: 'invisible' }
      ))
    .addStringOption(o => o.setName('text').setDescription('Custom status text').setRequired(true)),

  new SlashCommandBuilder()
    .setName('clear_status')
    .setDescription("Clear the bot's custom status (Owner only)"),

  // ── Owner — setup ─────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('setup_activity')
    .setDescription('Setup the activity tracking system (Owner only)'),

  new SlashCommandBuilder()
    .setName('setup_nickname')
    .setDescription('Setup the nickname change system (Owner only)'),

  // ── Owner — autoreplies ───────────────────────────────────
  new SlashCommandBuilder()
    .setName('autoreply')
    .setDescription('Add an autoreply (Owner only)')
    .addStringOption(o => o.setName('trigger').setDescription('Message trigger').setRequired(true))
    .addStringOption(o => o.setName('reply').setDescription('Bot reply').setRequired(true))
    .addBooleanOption(o => o.setName('case_sensitive').setDescription('Case-sensitive?').setRequired(false)),

  new SlashCommandBuilder()
    .setName('autoreplylist')
    .setDescription('List all autoreplies (Owner only)'),

  new SlashCommandBuilder()
    .setName('autoreplyedit')
    .setDescription('Edit an autoreply (Owner only)')
    .addIntegerOption(o => o.setName('id').setDescription('Autoreply ID').setRequired(true))
    .addStringOption(o => o.setName('trigger').setDescription('New trigger').setRequired(false))
    .addStringOption(o => o.setName('reply').setDescription('New reply').setRequired(false))
    .addBooleanOption(o => o.setName('case_sensitive').setDescription('New case-sensitive setting').setRequired(false)),

  new SlashCommandBuilder()
    .setName('autoreplydelete')
    .setDescription('Delete an autoreply (Owner only)')
    .addIntegerOption(o => o.setName('id').setDescription('Autoreply ID').setRequired(true)),

  // ── Gaming / leaderboard ──────────────────────────────────
  new SlashCommandBuilder()
    .setName('activity_leaderboard')
    .setDescription('Show top players by playtime'),

  // ── Voice ─────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('joinvc')
    .setDescription('Make the bot join a voice channel')
    .addChannelOption(o => o.setName('channel').setDescription('Voice channel').setRequired(true)
      .addChannelTypes(ChannelType.GuildVoice)),

  new SlashCommandBuilder()
    .setName('leavevc')
    .setDescription('Make the bot leave the voice channel'),

  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a voice channel (Owner only)')
    .addChannelOption(o => o.setName('channel').setDescription('Voice channel (default: yours)').setRequired(false)
      .addChannelTypes(ChannelType.GuildVoice)),

  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a voice channel (Owner only)')
    .addChannelOption(o => o.setName('channel').setDescription('Voice channel (default: yours)').setRequired(false)
      .addChannelTypes(ChannelType.GuildVoice)),

  new SlashCommandBuilder()
    .setName('sbmute')
    .setDescription('Mute soundboard for a user (Owner only)')
    .addUserOption(o => o.setName('user').setDescription('User to mute').setRequired(true)),

  new SlashCommandBuilder()
    .setName('sbunmute')
    .setDescription('Unmute soundboard for a user (Owner only)')
    .addUserOption(o => o.setName('user').setDescription('User to unmute').setRequired(true)),

  new SlashCommandBuilder()
    .setName('moveall')
    .setDescription('Move all members to another VC (Owner only)')
    .addChannelOption(o => o.setName('target').setDescription('Target voice channel').setRequired(true)
      .addChannelTypes(ChannelType.GuildVoice)),

  // ── Moderation ────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user (Moderators only)')
    .addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user (Moderators only)')
    .addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)),

  new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a user (Moderators only)')
    .addUserOption(o => o.setName('user').setDescription('User to timeout').setRequired(true))
    .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user (Moderators only)')
    .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)),

  new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Remove a warn (Owner only)')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(o => o.setName('warn_id').setDescription('Warn ID to remove').setRequired(true)),

  new SlashCommandBuilder()
    .setName('warns')
    .setDescription('View warns for a user (Moderators only)')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),

  new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode (Moderators only)')
    .addIntegerOption(o => o.setName('seconds').setDescription('Seconds (0 = disable)').setRequired(true).setMinValue(0).setMaxValue(21600))
    .addChannelOption(o => o.setName('channel').setDescription('Channel (default: current)').setRequired(false)),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages (Moderators only)')
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages (1-100)').setRequired(false).setMinValue(1).setMaxValue(100))
    .addUserOption(o => o.setName('user').setDescription('Delete messages from specific user').setRequired(false)),

].map(cmd => cmd.toJSON());

module.exports = { commands };
