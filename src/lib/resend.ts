export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function resendFromAddress(): string {
  return (
    process.env.RESEND_FROM?.trim() || "sch00l <hello@sch00l.ai>"
  );
}

export function magicLinkEmailHtml(email: string, actionLink: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>Sign in to sch00l.ai</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:system-ui,sans-serif;">
  <table width="100%" style="background:#0a0a0f;"><tr><td align="center" style="padding:40px 16px;">
    <table width="100%" style="max-width:480px;background:#14141c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;">
      <tr><td style="padding:32px 28px;">
        <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fff;">sch00l.ai</p>
        <p style="margin:0 0 24px;font-size:14px;color:#a1a1aa;">Sign-in link for <strong style="color:#e4e4e7;">${email}</strong>.</p>
        <a href="${actionLink}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:12px;">Continue to sch00l</a>
        <p style="margin:24px 0 0;font-size:12px;color:#71717a;">Opens a confirm page — tap the button to sign in (stops email scanners from burning your link).</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

async function sendOnce(
  apiKey: string,
  from: string,
  opts: { to: string; subject: string; html: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
    id?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      error: data.message ?? `Resend error (${res.status})`,
    };
  }

  return { ok: true };
}

export async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const primary = resendFromAddress();
  let result = await sendOnce(apiKey, primary, opts);

  if (
    !result.ok &&
    result.error.toLowerCase().includes("domain is not verified")
  ) {
    const fallback = "sch00l <onboarding@resend.dev>";
    result = await sendOnce(apiKey, fallback, opts);
    if (result.ok) return result;
    return {
      ok: false,
      error: `${result.error} — Verify sch00l.ai at https://resend.com/domains then use hello@sch00l.ai as sender.`,
    };
  }

  return result;
}
