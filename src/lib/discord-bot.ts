import { SITE_URL } from "./site";

export const DISCORD_COMMANDS = [
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
    description: "Request a human tutor (market rates, AI summary included)",
  },
  {
    name: "help",
    description: "How sch00l works",
  },
] as const;

export type DiscordCommandName = (typeof DISCORD_COMMANDS)[number]["name"];

export function discordBotConfigured(): boolean {
  return !!(
    process.env.DISCORD_PUBLIC_KEY &&
    process.env.DISCORD_APPLICATION_ID
  );
}

export function getCommandResponse(name: string): {
  content: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string }>;
  }>;
} {
  const base = SITE_URL.replace(/\/$/, "");

  switch (name as DiscordCommandName) {
    case "study":
      return {
        content: "Start a session — measure your **learning lift** % in one flow.",
        embeds: [
          {
            title: "sch00l Study",
            description: `Pre-quiz → Socratic AI tutor → post-quiz → flashcards.\n\n**${base}/study**`,
            color: 0x6366f1,
          },
        ],
      };
    case "progress":
      return {
        content: `Track streaks and latest learning lift:\n**${base}/progress**`,
      };
    case "tutors":
      return {
        content: `AI got you started — book a human tutor with your session summary:\n**${base}/tutors**`,
      };
    case "help":
      return {
        embeds: [
          {
            title: "sch00l commands",
            color: 0x6366f1,
            fields: [
              { name: "/study", value: "Start studying" },
              { name: "/progress", value: "Your lift & streaks" },
              { name: "/tutors", value: "Human tutor handoff" },
              { name: "Web", value: base },
            ],
          },
        ],
        content: "",
      };
    default:
      return { content: `Unknown command. Try \`/help\` or visit ${base}` };
  }
}
