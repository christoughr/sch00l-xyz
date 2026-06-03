"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Store } from "lucide-react";
import { STUDY_TRACKS } from "@/lib/study-tracks";

type Template = {
  id: string;
  title: string;
  description: string | null;
  studyTrackId: string | null;
  priceCents: number;
  published: boolean;
  isOwn: boolean;
  createdAt: string;
};

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [trackId, setTrackId] = useState(STUDY_TRACKS[0]?.id ?? "");
  const [priceCents, setPriceCents] = useState(0);
  const [published, setPublished] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/marketplace/templates?mine=1")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/marketplace/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          studyTrackId: trackId || undefined,
          priceCents,
          published,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create");
      setTitle("");
      setDescription("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Store className="h-8 w-8 text-brand-400" />
            Marketplace
          </h1>
          <p className="mt-2 text-zinc-400">
            Share assignment templates with other teachers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400"
        >
          {showForm ? "Cancel" : "Create template"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createTemplate}
          className="rounded-xl border border-white/10 bg-white/5 p-5 mb-8 space-y-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Template title"
            className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none resize-y"
          />
          <select
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
          >
            {STUDY_TRACKS.slice(0, 50).map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm text-zinc-400">
              Price (¢)
              <input
                type="number"
                min={0}
                value={priceCents}
                onChange={(e) => setPriceCents(Number(e.target.value))}
                className="ml-2 w-24 rounded border border-white/10 bg-surface-900 px-2 py-1 text-white"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Publish immediately
            </label>
          </div>
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-400 disabled:opacity-50"
          >
            {creating ? "Saving…" : "Save template"}
          </button>
          {error && <p className="text-sm text-amber-300">{error}</p>}
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      ) : templates.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No templates yet. Teachers can create and publish assignment packs here.
        </p>
      ) : (
        <ul className="space-y-3">
          {templates.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <h2 className="font-medium text-white">{t.title}</h2>
                <span className="text-xs text-zinc-500">
                  {t.published ? "Published" : "Draft"}
                  {t.priceCents > 0 && ` · $${(t.priceCents / 100).toFixed(2)}`}
                </span>
              </div>
              {t.description && (
                <p className="mt-1 text-sm text-zinc-400">{t.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-sm text-zinc-500">
        <Link href="/teacher" className="text-brand-400 hover:underline">
          Teacher portal →
        </Link>
      </p>
    </div>
  );
}
