/** Illustrative beta stats for /outcomes when cloud DB is off */
export const OUTCOMES_DEMO = {
  mode: "demo" as const,
  periodDays: 30,
  sessionsCompleted: 127,
  sessionsTracked: 48,
  averageLiftPercent: 18,
  totalStudyMinutes: 340,
  liftSampleSize: 32,
  disclaimer:
    "Early beta snapshot — illustrative aggregates. Your personal lift is on Progress.",
};

export const OUTCOMES_DEMO_SESSIONS = [
  { topic: "AP Calculus AB — derivatives", pre: 33, post: 67, lift: 34 },
  { topic: "SAT Math — quadratics", pre: 50, post: 83, lift: 33 },
  { topic: "AP Biology — cell division", pre: 67, post: 67, lift: 0 },
  { topic: "Custom — quadratic equations", pre: 40, post: 60, lift: 20 },
] as const;
