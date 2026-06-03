import type { SubjectId } from "./types";

/** Offline/demo responses when no LLM API key is configured */
export function demoTutorReply(
  userMessage: string,
  subject: SubjectId,
  studentContextBlock?: string
): string {
  const personalNote =
    studentContextBlock?.includes("Needs more practice")
      ? "\n\n(I see topics you've been building — we'll connect to what you already studied.)"
      : studentContextBlock?.includes("learning lift")
        ? "\n\n(Nice — your recent sessions show measurable lift. Let's keep that momentum.)"
        : "";
  const msg = userMessage.toLowerCase();

  if (
    /do my (homework|assignment|essay)|write (this|my) (essay|paper)|give me the answer/i.test(
      userMessage
    )
  ) {
    return `I can't complete assignments for you—that's not how real learning (or sch00l) works.

What I *can* do: break the problem into steps, check your reasoning, and quiz you until it clicks.

Paste the **prompt** or describe **where you're stuck** (not "solve #7"), and we'll work through it together. What's the first part that's confusing?`;
  }

  if (/stuck|don't understand|confused|help/i.test(msg)) {
    return `Let's narrow it down. For ${subject}:

1. What topic is this? (e.g. "quadratic equations", "mitosis")
2. What have you tried so far—even a wrong attempt helps.
3. Is there a specific line or step that lost you?

Reply with those three and we'll tackle one piece at a time.${personalNote}`;
  }

  if (/test|exam|midterm|final/i.test(msg)) {
    return `Exam mode: we'll prioritize **active recall**, not rereading.

Try this now—without notes: write everything you remember about the topic in 2 minutes. Then tell me what felt fuzzy.

What's the exam on, and when is it?`;
  }

  if (/explain|what is|how does/i.test(msg)) {
    return `Good question. Before I explain—what's **your** current guess, even if it's wrong?

The gap between your guess and the real idea is where learning happens. Take 30 seconds and try.`;
  }

  return `I'm running in **demo mode** (add \`OPENAI_API_KEY\` in \`.env.local\` for full AI).

For now: tell me your ${subject} topic and **one specific question** you're working on. I'll guide you Socratic-style—hints first, answers only when you've shown your work.

What are you studying right now?${personalNote}`;
}
