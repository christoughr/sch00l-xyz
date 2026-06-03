type NotifyPayload = {
  kind: "waitlist" | "tutor_request" | "tutor_apply";
  summary: string;
  fields: Record<string, string | number | boolean | null | undefined>;
};

function formatMessage({ kind, summary, fields }: NotifyPayload): string {
  const lines = [`**sch00l ${kind}**`, summary];
  for (const [k, v] of Object.entries(fields)) {
    if (v != null && v !== "") lines.push(`${k}: ${v}`);
  }
  return lines.join("\n");
}

/** Discord/Slack webhook — set FOUNDER_WEBHOOK_URL on Vercel (no Supabase needed) */
export async function notifyFounder(payload: NotifyPayload): Promise<void> {
  const url = process.env.FOUNDER_WEBHOOK_URL;
  if (!url) return;

  const body = JSON.stringify({
    content: formatMessage(payload).slice(0, 1900),
  });

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
