#!/usr/bin/env node
/**
 * Register slash commands with Discord (run once after creating the bot).
 * Usage: DISCORD_BOT_TOKEN=... DISCORD_APPLICATION_ID=... node scripts/register-discord-commands.mjs
 */

const token = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_APPLICATION_ID;

const commands = [
  {
    name: "study",
    description: "Start a free study session (pre-quiz → AI tutor → post-quiz)",
  },
  {
    name: "progress",
    description: "View your learning lift and streaks",
  },
  {
    name: "tutors",
    description: "Request a human tutor ($49/hr, AI summary included)",
  },
  {
    name: "help",
    description: "How sch00l works",
  },
];

if (!token || !appId) {
  console.error(
    "\n  Set DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID, then run again.\n  See DISCORD.md\n"
  );
  process.exit(1);
}

const guildId = process.env.DISCORD_GUILD_ID;
const url = guildId
  ? `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`
  : `https://discord.com/api/v10/applications/${appId}/commands`;

const res = await fetch(url, {
  method: "PUT",
  headers: {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(commands),
});

const data = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error("Failed:", res.status, data);
  process.exit(1);
}

console.log(
  `\n  Registered ${Array.isArray(data) ? data.length : commands.length} command(s)${guildId ? ` in guild ${guildId}` : " globally"}.\n`
);
