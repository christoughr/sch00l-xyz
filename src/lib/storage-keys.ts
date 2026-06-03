/** Central localStorage keys for export, clear, and GDPR-friendly tooling */
export const STORAGE_KEYS = {
  ageConsent: "sch00l_age_consent_v1",
  progress: "sch00l_progress_v1",
  flashcards: "sch00l_flashcards_v1",
  quizResults: "sch00l_quiz_results_v1",
  waitlist: "sch00l_waitlist_pending",
  tutorRequests: "sch00l_tutor_requests_v1",
  tutorApplications: "sch00l_tutor_applications_v1",
  dailySessions: "sch00l_daily_sessions",
  proBeta: "sch00l_pro_beta",
  pendingCheckout: "sch00l_pending_checkout",
  analyticsSession: "sch00l_analytics_session",
  studySessionId: "sch00l_study_session_id",
} as const;

export const ALL_LOCAL_STORAGE_KEYS = Object.values(STORAGE_KEYS);
