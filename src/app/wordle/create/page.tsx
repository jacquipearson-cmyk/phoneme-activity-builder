// src/app/wordle/create/page.tsx
// -------------------------------------------------------------
// Wordle Create Page (phoneme‑based)
//
//  fixed formatting — do on others later
//
// 
// page is from the “pre‑overhaul” still works fine.
// 


// Logic is stable, just cleaned formatting + added comments.
// -------------------------------------------------------------

"use client";

import { useState } from "react";
import { phonemes } from "@/data/phonemes";

export default function WordleCreatePage() {
  // -------------------------------------------------------------
  // Local state
  // -------------------------------------------------------------
  const [english, setEnglish] = useState("");
  const [hint, setHint] = useState("");
  const [phonemeList, setPhonemeList] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // Difficulty = number of phonemes (Wordle uses this)
  const difficulty = phonemeList.length;

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  function addPhoneme(symbol: string) {
    // Append phoneme in order
    setPhonemeList((prev) => [...prev, symbol]);
    setMessage("");
  }

  function clearPhonemes() {
    setPhonemeList([]);
    setMessage("");
  }

  // -------------------------------------------------------------
  // Save activity > POST to /api/activities
  //
  // 
  // Wordle uses phonemes as objects { symbol, position }
  // WordSearch uses strings — but this page is Wordle‑only.
  //
  // phonemeSymbols is included for HTML export (older code path).
  // -------------------------------------------------------------
  async function saveActivity() {
    if (!english.trim()) {
      setMessage("Please enter the English word.");
      return;
    }

    if (!hint.trim()) {
      setMessage("Please enter a hint/description.");
      return;
    }

    if (phonemeList.length === 0) {
      setMessage("Please add at least one phoneme.");
      return;
    }

    const payload = {
      title: `Wordle: ${english.toUpperCase()}`,
      type: "WORDLE",
      difficulty,
      words: [
        {
          english: english.toUpperCase(),
          hint,
          phonemes: phonemeList.map((symbol, index) => ({
            symbol,
            position: index, // WordleGame expects this
          })),
          phonemeSymbols: phonemeList, // HTML generator fallback
        },
      ],
    };

    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Failed to save activity.");
      return;
    }

    // Redirect to activities list
    window.location.href = "/activities";
  }

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <main className="settings-page">
      <div className="settings-container">

        <h1 className="text-4xl font-bold mb-6">Create Wordle Activity</h1>

        <p className="mb-8 max-w-2xl">
          Build a phoneme-based Wordle activity. Select phonemes in order to form
          the target word. Difficulty is based on the number of phonemes selected.
        </p>

        <div className="settings-card p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Word Details</h2>

          {/* English word */}
          <label className="block font-medium mb-2">English Word</label>
          <input
            className="input-field mb-4"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
          />

          {/* Hint */}
          <label className="block font-medium mb-2">Description / Hint</label>
          <textarea
            className="input-field mb-4"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
          />

          {/* Phoneme keyboard */}
          <h2 className="text-xl font-semibold mt-6 mb-2">Phonemes</h2>
          <p className="mb-4">Click phonemes to add them in order.</p>

          <div className="keyboard">
            {Array.from({ length: Math.ceil(phonemes.length / 11) }).map(
              (_, rowIndex) => (
                <div className="keyboard-row" key={rowIndex}>
                  {phonemes
                    .slice(rowIndex * 11, rowIndex * 11 + 11)
                    .map((p) => (
                      <button
                        key={p.symbol}
                        className="key"
                        title={`${p.label} (${p.example})`}
                        onClick={() => addPhoneme(p.symbol)}
                      >
                        {p.symbol}
                      </button>
                    ))}
                </div>
              )
            )}
          </div>

          {/* Selected phonemes */}
          <div className="mt-6">
            <p className="font-medium">Current phonemes:</p>
            <p className="mb-2">{phonemeList.join(" ") || "None selected"}</p>

            <p className="font-medium">Difficulty: {difficulty} phonemes</p>

            <button className="ws-hint-btn mt-4" onClick={clearPhonemes}>
              Clear Phonemes
            </button>
          </div>

          {/* Error message */}
          {message && <p className="mt-4 text-red-500">{message}</p>}

          {/* Save */}
          <button className="ws-hint-btn mt-6 text-lg" onClick={saveActivity}>
            Save Wordle Activity
          </button>
        </div>

      </div>
    </main>
  );
}
