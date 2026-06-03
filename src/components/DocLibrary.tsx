"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Loader2, MessageCircle, Search } from "lucide-react";

type Material = {
  id: string;
  file_name: string;
  mime_type: string | null;
  byte_size: number | null;
  created_at: string;
};

type QaMessage = {
  role: "user" | "assistant";
  content: string;
};

export function DocLibrary({ classroomId }: { classroomId: string }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState<QaMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/materials`);
      const data = await res.json();
      if (res.ok) setMaterials(data.materials ?? []);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = materials.filter((m) =>
    m.file_name.toLowerCase().includes(query.toLowerCase())
  );

  async function askDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setError(null);
    const userMsg = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      const res = await fetch(`/api/classrooms/${classroomId}/doc-ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMsg,
          materialId: selectedId ?? undefined,
          history: messages.slice(-6),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not get answer");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get answer");
    } finally {
      setAsking(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-brand-400" />
        <h2 className="text-lg font-semibold text-white">Doc library</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search materials…"
          className="w-full rounded-lg border border-white/10 bg-surface-900 pl-10 pr-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {materials.length === 0
            ? "Upload materials in Assign tab first."
            : "No matches."}
        </p>
      ) : (
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          <li>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
                selectedId === null
                  ? "bg-brand-500/10 text-brand-300"
                  : "text-zinc-400 hover:bg-white/5"
              }`}
            >
              All materials
            </button>
          </li>
          {filtered.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setSelectedId(m.id)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm truncate ${
                  selectedId === m.id
                    ? "bg-brand-500/10 text-brand-300"
                    : "text-zinc-300 hover:bg-white/5"
                }`}
              >
                {m.file_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <MessageCircle className="h-4 w-4 text-brand-400" />
          Ask a Socratic question about the docs
        </div>

        {messages.length > 0 && (
          <ul className="space-y-2 max-h-48 overflow-y-auto text-sm">
            {messages.map((m, i) => (
              <li
                key={i}
                className={`rounded-lg px-3 py-2 ${
                  m.role === "user"
                    ? "bg-brand-500/10 text-brand-100 ml-4"
                    : "bg-surface-900 text-zinc-300 mr-4"
                }`}
              >
                {m.content}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={askDoc} className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What does the syllabus say about…?"
            className="flex-1 rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
          >
            {asking ? "…" : "Ask"}
          </button>
        </form>
        {error && (
          <p className="text-sm text-amber-300" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
