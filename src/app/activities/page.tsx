// src/app/activities/page.tsx
// -------------------------------------------------------------
// Activities List Page
//
// 
// This is basically the "home" for all activities.
// Shows Wordle + WordSearch separately because I made them
// inconsistent and now I'm stuck with it
//
// Also: Wordle edit lives under /activities/... but WordSearch edit
// lives under /wordsearch/... (Note to slef remeber where you put things it makes it easier)
//
// This page fetches everything from /api/activities and then splits
// them by type. This is just a glorified list
// -------------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import type { Activity } from "@/types/activity";

export default function ActivitiesPage() {
  // activities = everything from backend
  // loading = because I don't trust fetch to be fast 
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------------
  // Load all activities
  // NOTE: duplicated logic with other pages (WordSearch edit, Wordle edit)
  // -------------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/activities");
        const data = await res.json();
        setActivities(data);
      } finally {
        // NOTE: no error handling here because I'm lazy and tired
        setLoading(false);
      }
    }
    load();
  }, []);

  // Loading state (This is duplicated everywhere)
  if (loading) {
    return (
      <main className="settings-page">
        <div className="settings-container">
          <p>Loading activities…</p>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // Split activities by type
  // NOTE: lowercase because I accidentally saved "WORDLE"
  // or "Wordle" or "wordle" depending on how awake I was.
  // -------------------------------------------------------------
  const wordleActivities = activities.filter(
    (a) => a.type?.toLowerCase() === "wordle"
  );
  const wordSearchActivities = activities.filter(
    (a) => a.type?.toLowerCase() === "wordsearch"
  );

  return (
    <main className="settings-page">
      <div className="settings-container">

        <h1 className="text-4xl font-bold mb-6">Activities</h1>

        {/* ---------------------------------------------------------
            Colour Key
            NOTE: This is duplicated in WordleGame + WordSearchGame.
            Should probably centralise this somewhere
           --------------------------------------------------------- */}
        <div className="settings-card p-6 mb-10 max-w-xl">
          <h2 className="text-2xl font-semibold mb-3">Colour Key</h2>
          <p className="mb-2">
            These colours appear in Wordle and Word Search activities:
          </p>

          <ul className="mt-4 space-y-3">
            <li className="flex items-center">
              <span
                className="inline-block w-5 h-5 mr-3 rounded"
                style={{ backgroundColor: "var(--correct)" }}
              ></span>
              <strong>Correct</strong> — phoneme in correct position.
            </li>

            <li className="flex items-center">
              <span
                className="inline-block w-5 h-5 mr-3 rounded"
                style={{ backgroundColor: "var(--present)" }}
              ></span>
              <strong>Present</strong> — phoneme exists but wrong spot.
            </li>

            <li className="flex items-center">
              <span
                className="inline-block w-5 h-5 mr-3 rounded"
                style={{ backgroundColor: "var(--incorrect)" }}
              ></span>
              <strong>Incorrect</strong> — phoneme not in word.
            </li>
          </ul>
        </div>

        {/* ---------------------------------------------------------
            Wordle Section
            NOTE: Edit button goes to /activities/.../edit
           --------------------------------------------------------- */}
        <div className="settings-card p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Wordle Activities</h2>

          {wordleActivities.length === 0 && (
            <p className="text-gray-500">No Wordle activities yet.</p>
          )}

          <div className="space-y-4">
            {wordleActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 border-2 border-border rounded-lg bg-surface"
              >
                <h3 className="text-xl font-semibold">{activity.title}</h3>
                <p className="mt-1">Difficulty: {activity.difficulty}</p>

                <div className="mt-4 flex gap-3">
                  <button
                    className="ws-hint-btn"
                    onClick={() => (window.location.href = `/wordle/${activity.id}`)}
                  >
                    Play
                  </button>

                  {/* NOTE: Wordle edit lives here!!!! */}
                  <button
                    className="ws-hint-btn"
                    onClick={() =>
                      (window.location.href = `/activities/${activity.id}/edit`)
                    }
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* ---------------------------------------------------------
            Word Search Section
            NOTE: Edit button goes to /wordsearch/.../edit
            Why is this diffrent what was I doing yesterday
           --------------------------------------------------------- */}
        <div className="settings-card p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Word Search Activities</h2>

          {wordSearchActivities.length === 0 && (
            <p className="text-gray-500">No Word Search activities yet.</p>
          )}

          <div className="space-y-4">
            {wordSearchActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 border-2 border-border rounded-lg bg-surface"
              >
                <h3 className="text-xl font-semibold">{activity.title}</h3>
                <p className="mt-1">Difficulty: {activity.difficulty}</p>

                <div className="mt-4 flex gap-3">
                  <button
                    className="ws-hint-btn"
                    onClick={() => (window.location.href = `/wordsearch/${activity.id}`)}
                  >
                    Play
                  </button>

                  {/* NOTE: WordSearch edit lives here instead */}
                  <button
                    className="ws-hint-btn"
                    onClick={() =>
                      (window.location.href = `/wordsearch/${activity.id}/edit`)
                    }
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
