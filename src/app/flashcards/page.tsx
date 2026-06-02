import { FlashcardReview } from "@/components/FlashcardReview";

export default function FlashcardsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Flashcards</h1>
        <p className="mt-2 text-zinc-400">
          Spaced repetition from your study sessions — SM-2 scheduling built in.
        </p>
      </div>
      <FlashcardReview />
    </div>
  );
}
