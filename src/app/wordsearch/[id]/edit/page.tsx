// src/app/wordsearch/[id]/edit/page.tsx
// -------------------------------------------------------------
// Word Search Edit Page
//
// redo 5: fixed formatting — do on others later
//
// I completely forgot I needed to make this page
// 
// -------------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { phonemes } from "@/data/phonemes";
import { generateWordSearch } from "@/context/wordsearchGenerator";

type WordInput = {
  english: string;
  hint: string;
  phonemes: string[];
};

export default function WordSearchEditPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = Number(params.id);

  // -------------------------------------------------------------
  // Local state
  // -------------------------------------------------------------
  const [activity, setActivity] = useState<{
    title: string;
    difficulty: 3 | 4 | 5;
    words: WordInput[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Load activity
  // -------------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/activities/${activityId}`);
        const data = await res.json();

        setActivity({
          title: data.title,
          difficulty: Number(data.difficulty) as 3 | 4 | 5,
          words: data.words.map((w: any) => ({
            english: w.english,
            hint: w.hint,
            phonemes: w.phonemes
              .slice()
              .sort((a: any, b: any) => a.position - b.position)
              .map((p: any) => p.symbol),
          })),
        });
      } catch (err: any) {
        setError(err.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [activityId]);

  // -------------------------------------------------------------
  // Word editing helpers
  // -------------------------------------------------------------
  function updateWordField(index: number, field: keyof WordInput, value: string) {
    if (!activity) return;
    const updated = [...activity.words];
    updated[index] = { ...updated[index], [field]: value };
    setActivity({ ...activity, words: updated });
  }

  function addWord() {
    if (!activity) return;
    setActivity({
      ...activity,
      words: [...activity.words, { english: "", hint: "", phonemes: [] }],
    });
  }

  function addPhonemeToWord(index: number, symbol: string) {
    if (!activity) return;
    const updated = [...activity.words];
    updated[index] = {
      ...updated[index],
      phonemes: [...updated[index].phonemes, symbol],
    };
    setActivity({ ...activity, words: updated });
  }

  function deleteWord(index: number) {
    if (!activity) return;
    const updated = [...activity.words];
    updated.splice(index, 1);
    setActivity({ ...activity, words: updated });
  }

  // -------------------------------------------------------------
  // Delete entire activity (WordSearch version)
  // Same route as Wordle: DELETE /api/activities/:id
  // -------------------------------------------------------------
  async function deleteActivity() {
    if (!confirm("Delete this activity and all its words? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/activities/${activityId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());

      router.push("/activities");
    } catch (err: any) {
      console.error("Delete activity failed", err);
      setError(err.message || "Delete failed");
    }
  }

  // -------------------------------------------------------------
  // Save activity
  // -------------------------------------------------------------
  async function save() {
    if (!activity) return;

    setSaving(true);
    setError(null);

    try {
      const { grid, placements } = generateWordSearch(activity.words);

      const res = await fetch(`/api/activities/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activity.title,
          difficulty: activity.difficulty,
          grid,
          placements,
          words: activity.words,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      router.push(`/wordsearch/${activityId}`);
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------------------------------------
  // Early returns
  // -------------------------------------------------------------
  if (loading) return <p>Loading…</p>;
  if (!activity) return <p>Not found</p>;

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <main className="settings-page">
      <div className="settings-container">
        <h1>Edit Word Search</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Activity metadata */}
        <div className="settings-card">
          <label className="settings-label">
            Title
            <input
              className="settings-select"
              value={activity.title}
              onChange={(e) =>
                setActivity({ ...activity, title: e.target.value })
              }
            />
          </label>

          <label className="settings-label">
            Difficulty
            <select
              className="settings-select"
              value={activity.difficulty}
              onChange={(e) =>
                setActivity({
                  ...activity,
                  difficulty: Number(e.target.value) as 3 | 4 | 5,
                })
              }
            >
              <option value={3}>Easy (3 phonemes)</option>
              <option value={4}>Medium (4 phonemes)</option>
              <option value={5}>Hard (5 phonemes)</option>
            </select>
          </label>
        </div>

        {/* Words list */}
        <div className="settings-card">
          <h2>Words</h2>

          {activity.words.map((w, i) => (
            <div key={i} className="ws-word-item">
              <label>English</label>
              <input
                className="settings-select"
                value={w.english}
                onChange={(e) => updateWordField(i, "english", e.target.value)}
              />

              <label>Hint</label>
              <input
                className="settings-select"
                value={w.hint}
                onChange={(e) => updateWordField(i, "hint", e.target.value)}
              />

              <label>Phonemes</label>
              <div className="phoneme-display">{w.phonemes.join(" ")}</div>

              <div className="phoneme-keyboard">
                {phonemes.map((p) => (
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

              {/* Delete word */}
              <button
                className="ws-hint-btn"
                onClick={() => deleteWord(i)}
                style={{ marginTop: "10px" }}
              >
                Delete Word
              </button>
            </div>
          ))}

          <button className="ws-hint-btn" onClick={addWord}>
            Add Word
          </button>
        </div>

        {/* Delete entire activity */}
        <button
          className="ws-hint-btn"
          onClick={deleteActivity}
          style={{ background: "#ef0808", marginTop: "20px" }}
        >
          Delete Activity
        </button>

        {/* Save */}
        <button className="ws-hint-btn" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </main>
  );
}
