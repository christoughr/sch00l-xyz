const SESSION_KEY = "sch00l_analytics_session";

export type AnalyticsEventName =
  | "page_view"
  | "session_setup"
  | "pre_quiz_complete"
  | "post_quiz_complete"
  | "session_complete"
  | "share_copy"
  | "track_selected"
  | "tutor_request"
  | "pre_quiz_skipped"
  | "upgrade_view"
  | "checkout_start"
  | "pro_activated";

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export function trackEvent(
  event: AnalyticsEventName,
  props?: Record<string, string | number | boolean | null>
): void {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    sessionId: getAnalyticsSessionId(),
    props: props ?? {},
    path: window.location.pathname,
  };
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}
