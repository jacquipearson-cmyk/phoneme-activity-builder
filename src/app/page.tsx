"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  // -------------------------------------------------------------
  // Random activity IDs (for "Random Wordle" + "Random Word Search")
  // -------------------------------------------------------------
  const [randomWordleId, setRandomWordleId] = useState<number | null>(null);
  const [randomWordSearchId, setRandomWordSearchId] = useState<number | null>(null);

  // -------------------------------------------------------------
  // Load random activities
  //
  // NOTE TO SELF:
  // - Wordle uses uppercase "WORDLE" (I dont rember why I did that)
  // - WordSearch uses uppercase now
  //   > aka backend inconsistenties is being updated
  // -------------------------------------------------------------
  useEffect(() => {
    async function loadRandom() {
      try {
        const res = await fetch("/api/activities");
        const activities = await res.json();

        const wordles = activities.filter((a: any) => a.type === "WORDLE");
        const searches = activities.filter((a: any) => a.type === "WORDSEARCH");

        if (wordles.length > 0) {
          const w = wordles[Math.floor(Math.random() * wordles.length)];
          setRandomWordleId(w.id);
        }

        if (searches.length > 0) {
          const s = searches[Math.floor(Math.random() * searches.length)];
          setRandomWordSearchId(s.id);
        }
      } catch (err) {
        console.error("Failed to load random activities:", err);
      }
    }

    loadRandom();
  }, []);

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <main className="settings-page">

      {/* Decorative colour bars (left + right) */}
      <div className="home-colour-bar home-colour-bar-left">
        <div className="home-colour home-colour-green"></div>
        <div className="home-colour home-colour-yellow"></div>
        <div className="home-colour home-colour-red"></div>
      </div>

      <div className="home-colour-bar home-colour-bar-right">
        <div className="home-colour home-colour-green"></div>
        <div className="home-colour home-colour-yellow"></div>
        <div className="home-colour home-colour-red"></div>
      </div>

      <div className="settings-container">

        <h1 className="text-4xl font-bold mb-4">Phoneme Activity Builder</h1>

        <p className="mb-8 max-w-3xl">
          Create phoneme-based classroom activities for Speech Pathology education.
          Generate Wordle and Word Search activities that support phoneme recognition
          and decoding. Also export activities as standalone HTML files for classroom use.
        </p>

        {/* Split layout: Wordle (left) + Word Search (right) */}
        <div className="flex flex-col md:flex-row gap-10 w-full">

          {/* Wordle Section */}
          <div className="flex-1 bg-surface border-2 border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-3">Wordle Activities</h2>
            <p className="mb-4">
              Build phoneme-based Wordle games. Students guess phoneme sequences,
              with difficulty based on phoneme count.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/wordle/create">
                <button className="ws-hint-btn w-full">Create Wordle</button>
              </Link>

              <button
                className="ws-hint-btn w-full"
                disabled={!randomWordleId}
                onClick={() => {
                  if (randomWordleId) window.location.href = `/wordle/${randomWordleId}`;
                }}
              >
                Random Wordle
              </button>
            </div>
          </div>

          {/* Word Search Section */}
          <div className="flex-1 bg-surface border-2 border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-3">Word Search Activities</h2>
            <p className="mb-4">
              Create phoneme-based Word Search puzzles. Words can appear in any direction,
              supporting decoding and phoneme recognition.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/wordsearch/create">
                <button className="ws-hint-btn w-full">Create Word Search</button>
              </Link>

              <button
                className="ws-hint-btn w-full"
                disabled={!randomWordSearchId}
                onClick={() => {
                  if (randomWordSearchId) window.location.href = `/wordsearch/${randomWordSearchId}`;
                }}
              >
                Random Word Search
              </button>
            </div>
          </div>

        </div>

        {/* Play Activities */}
        <div className="settings-card mt-10">
          <h2 className="text-2xl font-semibold">Play Activities</h2>
          <p className="mt-2">Browse and play your saved Wordle and Word Search activities.</p>

          <Link href="/activities">
            <button className="ws-hint-btn mt-4">View All Activities</button>
          </Link>
        </div>

        {/* Settings Box */}
        <div className="mt-10 bg-surface border-2 border-border rounded-lg p-6 max-w-xl">
          <h2 className="text-2xl font-semibold">Settings</h2>

          <p className="mt-3">
            Configure accessibility, colour themes and fonts through the Settings page.
            Only Wordle difficulty is controlled inside the Wordle builder.
          </p>
        </div>

      </div>
    </main>
  );
}
