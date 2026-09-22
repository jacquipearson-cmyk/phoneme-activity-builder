// src/components/WordEditModal.tsx
// -------------------------------------------------------------
// Word Edit Modal (Wordle)
//
// redo 5: fixed formatting — do on others later
//
// 
// This modal loads a single word from the activity,
// lets me edit english/hint/phonemes, and then patches it.
// 
// -------------------------------------------------------------

"use client";

import React, { useEffect, useState } from "react";
import { phonemes as keyboardPhonemes } from "@/data/phonemes";

export default function WordEditModal({
  activityId,
  wordId,
  onClose,
  onSaved,
}: {
  activityId: number;
  wordId: number;
  onClose: () => void;
  onSaved?: () => void;
}) {
  // -------------------------------------------------------------
  // Local state
  // -------------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [english, setEnglish] = useState("");
  const [hint, setHint] = useState("");
  const [phonemes, setPhonemes] = useState<{ symbol: string; position: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);



  
  // -------------------------------------------------------------
  // Load word from activity
  //
  // NOTE:
  // - WordSearch edit uses a different route entirely. 
  // (did them at diffrent points in time and this is what worked)
  // - Wordle stores phonemes as objects { symbol, position }.
  // -------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/activities/${activityId}`);
        const data = await res.json();

        const w = data.words.find((x: any) => x.id === wordId);
        if (!w) throw new Error("Word not found");

        if (!mounted) return;

        setEnglish(w.english || "");
        setHint(w.hint || "");

        setPhonemes(
          (w.phonemes || [])
            .slice()
            .sort((a: any, b: any) => a.position - b.position)
            .map((p: any) => ({ symbol: p.symbol, position: p.position }))
        );
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activityId, wordId]);

  // -------------------------------------------------------------
  // Add phoneme (append at end)
  // -------------------------------------------------------------
  function addPhoneme(symbol: string) {
    setPhonemes((prev) => [...prev, { symbol, position: prev.length }]);
  }


  // -------------------------------------------------------------
  // Save word (PATCH)
  // -------------------------------------------------------------
  async function save() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/activities/${activityId}/words/${wordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ english, hint, phonemes }),
      });

      if (!res.ok) throw new Error(await res.text());

      onSaved && onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }



  // -------------------------------------------------------------
  // Early return
  // -------------------------------------------------------------
  if (loading) return <div className="modal">Loading…</div>;

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        zIndex: 9999,
      }}
    >
      <div className="word-edit-card">
        <h3>Edit word</h3>

        {error && <div style={{ color: "red" }}>{error}</div>}

        <div style={{ display: "grid", gap: 8 }}>
          {/* English */}
          <label style={{ fontWeight: 700 }}>English</label>
          <input
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          {/* Hint */}
          <label style={{ fontWeight: 700 }}>Hint</label>
          <input
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          {/* Phonemes */}
          <label style={{ fontWeight: 700 }}>Phonemes (order matters)</label>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {phonemes.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                {/* Symbol */}
                <input
                  value={p.symbol}
                  onChange={(e) => {
                    const copy = [...phonemes];
                    copy[i].symbol = e.target.value;
                    setPhonemes(copy);
                  }}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    width: 160,
                  }}
                />

                {/* Position */}
                <input
                  type="number"
                  value={p.position}
                  onChange={(e) => {
                    const copy = [...phonemes];
                    copy[i].position = Number(e.target.value);
                    setPhonemes(copy);
                  }}
                  style={{
                    width: 100,
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                  }}
                />

                {/* Remove */}
                <button
                  onClick={() =>
                    setPhonemes((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add phoneme keyboard */}
          <div style={{ marginTop: 12 }}>
            <h4 style={{ marginBottom: 6 }}>Add phoneme:</h4>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                maxWidth: 400,
              }}
            >
              {keyboardPhonemes.map((p) => (
                <button
                  key={p.symbol}
                  className="phoneme-key"
                  onClick={() => addPhoneme(p.symbol)}
                  title={`${p.label} (${p.example})`}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >
                  {p.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save / Cancel */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: "8px 12px" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button onClick={onClose} style={{ padding: "8px 12px" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
