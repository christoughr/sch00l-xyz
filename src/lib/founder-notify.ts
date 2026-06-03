type NotifyPayload = {
  kind: "waitlist" | "tutor_request" | "tutor_apply";
  summary: string;
  fields: Record<string, string | number | boolean | null | undefined>;
};

const KIND_COLORS: Record<NotifyPayload["kind"], number> = {
  waitlist: 0x6366f1,
  tutor_request: 0xf59e0b,
  tutor_apply: 0x22c55e,
};

const KIND_TITLES: Record<NotifyPayload["kind"], string> = {
  waitlist: "📬 New waitlist signup",
  tutor_request: "🧑‍🏫 Human tutor request",
  tutor_apply: "✋ Tutor application",
};

function isDiscordWebhook(url: string): boolean {
  return url.includes("discord.com/api/webhooks");
}

function discordEmbed(payload: NotifyPayload) {
  const fieldRows = Object.entries(payload.fields)
    .filter(([, v]) => v != null && v !== "")
    .map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value: String(value),
      inline: true,
    }));

  return {
    embeds: [
      {
        title: KIND_TITLES[payload.kind],
        description: payload.summary,
        color: KIND_COLORS[payload.kind],
        fields: fieldRows.length ? fieldRows : undefined,
        footer: { text: "sch00l.ai alerts" },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

function plainText(payload: NotifyPayload): string {
  const lines = [`**sch00l ${payload.kind}**`, payload.summary];
  for (const [k, v] of Object.entries(payload.fields)) {
    if (v != null && v !== "") lines.push(`${k}: ${v}`);
  }
  return lines.join("\n").slice(0, 1900);
}

/** Discord/Slack webhook — set FOUNDER_WEBHOOK_URL on Vercel */
export async function notifyFounder(payload: NotifyPayload): Promise<void> {
  const url = process.env.FOUNDER_WEBHOOK_URL;
  if (!url) return;

  const body = isDiscordWebhook(url)
    ? JSON.stringify(discordEmbed(payload))
    : JSON.stringify({ content: plainText(payload) });

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (e) {
    console.error("Founder webhook:", e);
  }
}

export function founderWebhookConfigured(): boolean {
  return !!process.env.FOUNDER_WEBHOOK_URL;
}
