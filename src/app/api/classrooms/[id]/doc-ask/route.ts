import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { demoTutorReply } from "@/lib/demo-tutor";
import { buildSystemPrompt } from "@/lib/tutor-prompt";
import { isTeacherEmail } from "@/lib/teacher";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const askSchema = z.object({
  question: z.string().min(1).max(2000),
  materialId: z.string().uuid().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .optional(),
});

async function getMaterialContext(
  classroomId: string,
  materialId?: string
): Promise<string> {
  const admin = createAdminClient();
  if (!admin) return "";

  if (materialId) {
    const { data } = await admin
      .from("classroom_materials")
      .select("file_name, extracted_text")
      .eq("id", materialId)
      .eq("classroom_id", classroomId)
      .single();
    if (!data?.extracted_text?.trim()) return "";
    return `Document: ${data.file_name}\n${data.extracted_text.slice(0, 6000)}`;
  }

  const { data } = await admin
    .from("classroom_materials")
    .select("file_name, extracted_text")
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!data?.length) return "";
  return data
    .filter((m) => m.extracted_text?.trim())
    .map(
      (m) =>
        `--- ${m.file_name} ---\n${(m.extracted_text ?? "").slice(0, 1500)}`
    )
    .join("\n\n")
    .slice(0, 6000);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classroomId } = await params;
  const ip = clientIp(req);
  const limited = rateLimit(`doc-ask:${ip}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isTeacher =
    classroom.teacher_id === user.id || isTeacherEmail(user.email);

  if (!isTeacher) {
    const { data: member } = await supabase
      .from("classroom_members")
      .select("user_id")
      .eq("classroom_id", classroomId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const parsed = askSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  }

  const { question, materialId, history } = parsed.data;
  const docContext = await getMaterialContext(classroomId, materialId);

  if (!docContext.trim()) {
    return NextResponse.json(
      { error: "No document text available. Upload materials first." },
      { status: 400 }
    );
  }

  const systemExtra = `\nAnswer ONLY using the course materials below. Stay Socratic — guide with questions, don't dump answers. If the materials don't cover the topic, say so.\n\n${docContext}`;

  const messages = [
    ...(history ?? []),
    { role: "user" as const, content: question },
  ];

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    const answer = demoTutorReply(question, "other", systemExtra);
    return NextResponse.json({ answer, mode: "demo" as const });
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(
              "other",
              undefined,
              "course materials",
              undefined,
              systemExtra
            ),
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Doc tutor unavailable" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const answer =
      data.choices?.[0]?.message?.content?.trim() ??
      "I couldn't find that in the materials. Try rephrasing?";

    return NextResponse.json({ answer, mode: "live" as const });
  } catch {
    return NextResponse.json({ error: "Doc tutor unavailable" }, { status: 502 });
  }
}
