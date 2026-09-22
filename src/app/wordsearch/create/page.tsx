// src/app/wordsearch/create/page.tsx
// -------------------------------------------------------------
// Word Search Create Page
//
// redo 5: fixed formatting
//
// This page was written after the main WordSearch system was stable,
// Mostly UI wiring + payload building.
// Just adding comments + formatting for future clarity.
// -------------------------------------------------------------

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { phonemes } from "@/data/phonemes";
import { generateWordSearch } from "@/context/wordsearchGenerator";

type WordInput = {
  english: string;
  hint: string;
  phonemes: string[];
};

export default function WordSearchCreatePage() {
  const router = useRouter();

  // -------------------------------------------------------------
  // Local state
  // -------------------------------------------------------------
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );

  const [words, setWords] = useState<WordInput[]>([
    { english: "", hint: "", phonemes: [] },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Word editing helpers
  // -------------------------------------------------------------
  function addWord() {
    setWords([...words, { english: "", hint: "", phonemes: [] }]);
  }

  function updateWordField(
    index: number,
    field: keyof WordInput,
    value: string
  ) {
    const updated = [...words];
    updated[index] = { ...updated[index], [field]: value };
    setWords(updated);
  }

  function addPhonemeToWord(index: number, symbol: string) {
    const updated = [...words];
    updated[index].phonemes = [...updated[index].phonemes, symbol];
    setWords(updated);
  }

  function clearPhonemes(index: number) {
    const updated = [...words];
    updated[index].phonemes = [];
    setWords(updated);
  }

  // -------------------------------------------------------------
  // Save activity
  //
  // NOTE:
  // Difficulty is a UI label >backend expects numeric (3/4/5).
  // WordSearch requires generating grid + placements before saving.
  // -------------------------------------------------------------
  async function save() {
    setSaving(true);
    setError(null);

    try {
      const { grid, placements } = generateWordSearch(words);

      const difficultyMap = {
        easy: 3,
        medium: 4,
        hard: 5,
      };

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WORDSEARCH",
          title,
          difficulty: difficultyMap[difficulty],
          grid,
          placements,
          words,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const created = await res.json();
      router.push(`/wordsearch/${created.id}`);
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <main className="settings-page">
      <div className="settings-container">

        <h1 className="text-4xl font-bold mb-6">Create Word Search Activity</h1>

        <p className="mb-8 max-w-2xl">
          Build a phoneme-based Word Search puzzle. Words can contain any number
          of phonemes. Difficulty is simply a label for teachers to organise
          their activities.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* ---------------------------------------------------------
            Activity metadata
           --------------------------------------------------------- */}
        <div className="settings-card p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Activity Details</h2>

          <label className="settings-label">
            Title
            <input
              className="settings-select"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="settings-label mt-4">
            Difficulty (label only)
            <select
              className="settings-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>

        {/* ---------------------------------------------------------
            Words list
           --------------------------------------------------------- */}
        <div className="settings-card p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Words</h2>

          {words.map((w, i) => (
            <div key={i} className="ws-word-item mb-8">

              {/* English word */}
              <label className="settings-label">
                English Word
                <input
                  className="settings-select"
                  value={w.english}
                  onChange={(e) =>
                    updateWordField(i, "english", e.target.value)
                  }
                />
              </label>

              {/* Hint */}
              <label className="settings-label mt-4">
                Hint
                <input
                  className="settings-select"
                  value={w.hint}
                  onChange={(e) => updateWordField(i, "hint", e.target.value)}
                />
              </label>

              {/* Phonemes */}
              <label className="settings-label mt-4">
                Phonemes ({w.phonemes.length})
              </label>

              <div className="phoneme-display mb-2">
                {w.phonemes.join(" ") || "None selected"}
              </div>

              <button
                className="ws-hint-btn mb-4"
                onClick={() => clearPhonemes(i)}
              >
                Clear Phonemes
              </button>

              {/* Keyboard */}
              <div className="phoneme-keyboard">
                {Array.from({
                  length: Math.ceil(phonemes.length / 11),
                }).map((_, rowIndex) => (
                  <div className="keyboard-row" key={rowIndex}>
                    {phonemes
                      .slice(rowIndex * 11, rowIndex * 11 + 11)
                      .map((p) => (
                        <button
                          key={p.symbol}
                          className="phoneme-key"
                          onClick={() => addPhonemeToWord(i, p.symbol)}
                          title={`${p.label} (${p.example})`}
                        >
                          {p.symbol}
                        </button>
                      ))}
                  </div>
                ))}
              </div>

              {/* Validation */}
              {w.phonemes.length < 1 && (
                <p className="text-red-500 mt-2">
                  Each word must contain at least one phoneme.
                </p>
              )}
            </div>
          ))}

          <button className="ws-hint-btn mt-4" onClick={addWord}>
            Add Another Word
          </button>
        </div>

        {/* Save */}
        <button
          className="ws-hint-btn text-lg"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Create Activity"}
        </button>

      </div>
    </main>
  );
}
