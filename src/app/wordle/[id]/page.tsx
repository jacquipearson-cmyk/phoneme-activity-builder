// src/app/wordle/[id]/page.tsx
// -------------------------------------------------------------
// Wordle Game Page (phoneme-based)
//
// redo 5: fixed formatting — do on others later
//
// NOTE TO SELF:
// UI somewhat updated 
// Logic is fine 
// and added comments for future me.
// -------------------------------------------------------------
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { phonemes as keyboardPhonemes } from "@/data/phonemes"; // keep if you have this dataset

type Phoneme = { id?: number; symbol: string; position?: number };

export default function WordleGame() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  // -------------------------------------------------------------
  // Core state
  // -------------------------------------------------------------
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [message, setMessage] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);

  const MAX_ROWS = 6;

  // -------------------------------------------------------------
  // Derived values
  // --------------------------------------------------------------
  const word = activity?.words?.[0] ?? null;
  const answer = useMemo(() => {
    if (!word?.phonemes) return [];
    return [...word.phonemes]
      .sort((a: Phoneme, b: Phoneme) => (a.position ?? 0) - (b.position ?? 0))
      .map((p: Phoneme) => p.symbol);
  }, [word]);

  const englishAnswer = word?.english ?? "";
  const hint = word?.hint ?? "";

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  const handleKey = useCallback(
    (symbol: string) => {
      if (gameOver) return;
      if (currentGuess.length < answer.length) {
        setCurrentGuess((prev) => [...prev, symbol]);
        setMessage("");
      }
    },
    [currentGuess.length, answer.length, gameOver]
  );

  const handleBackspace = useCallback(() => {
    if (gameOver) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameOver]);

  const handleSubmit = useCallback(() => {
    if (gameOver) return;
    if (currentGuess.length !== answer.length) {
      setMessage("Not enough phonemes.");
      return;
    }

    const guessStr = currentGuess.join("|");
    const answerStr = answer.join("|");

    setGuesses((prev) => [...prev, currentGuess]);

    if (guessStr === answerStr) {
      setMessage("Correct! 🎉");
      setGameOver(true);
    } else {
      setMessage("Incorrect, try again.");
      setCurrentGuess([]);
      if (guesses.length + 1 >= MAX_ROWS) {
        setGameOver(true);
        setMessage(`No more guesses. Answer revealed.`);
      }
    }
  }, [currentGuess, answer, gameOver, guesses.length]);

  // -------------------------------------------------------------
  // Fetch activity
  // -------------------------------------------------------------
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let mounted = true;
    async function load() {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/activities/${id}`);
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Server ${res.status} ${text}`);
        }
        const data = await res.json();
        if (mounted) setActivity(data);
      } catch (err: any) {
        if (mounted) setFetchError(err.message || "Failed to load activity");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // -------------------------------------------------------------
  // Physical keyboard input (best-effort mapping)
  // -------------------------------------------------------------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (gameOver) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
        return;
      }
      if (e.key.length === 1) {
        const sym = e.key.toLowerCase();
        const match = keyboardPhonemes.find((p) => p.symbol === sym);
        if (match) handleKey(match.symbol);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleBackspace, handleSubmit, handleKey, gameOver]);

  // ---------------------------------------------------------------s
  // Evaluate guess (Wordle-style)
  // --------------------------------------------------------------
  function evaluateGuess(guess: string[]) {
    const result: ("correct" | "present" | "incorrect")[] = Array(guess.length).fill("incorrect");
    const answerCopy = [...answer];
    // First pass: correct positions
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === answer[i]) {
        result[i] = "correct";
        answerCopy[i] = null as any;
      }
    }
    // Second pass: present but wrong position
    for (let i = 0; i < guess.length; i++) {
      if (result[i] === "correct") continue;
      const idx = answerCopy.indexOf(guess[i]);
      if (idx !== -1) {
        result[i] = "present";
        answerCopy[idx] = null as any;
      }
    }
    return result;
  }

  function tileClass(status?: string) {
    if (status === "correct") return "tile correct";
    if (status === "present") return "tile present";
    if (status === "incorrect") return "tile incorrect";
    return "tile";
  }



  // -------------------------------------------------------------
  // Build rows (submitted guesses + current guess + empty rows)
  // -------------------------------------------------------------
  const rows: (string[] | null)[] = [];
  for (let i = 0; i < MAX_ROWS; i++) {
    if (i < guesses.length) rows.push(guesses[i]);
    else if (i === guesses.length) rows.push(currentGuess);
    else rows.push(null);
  }

  // -------------------------------------------------------------
  // Download HTML
  // -------------------------------------------------------------
  const handleDownloadHtml = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/activities/${id}/html`);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server ${res.status} ${text}`);
      }
      const blob = await res.blob();
      const filename = `wordle-${englishAnswer || "activity"}.html`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download failed:", err);
      setMessage("Download failed. See console for details.");
    }
  }, [id, englishAnswer]);




  // --- Early returns (after hooks) ---
  if (loading) return <div style={{ padding: 20 }}>Loading activity...</div>;
  if (fetchError) return <div style={{ padding: 20, color: "red" }}>Error: {fetchError}</div>;
  if (!id) return <div style={{ padding: 20 }}>No activity id provided.</div>;
  if (!activity || !word) return <div style={{ padding: 20 }}>Activity not found.</div>;

  // --- Render ---
  const TILE_PX = 64;
  const GAP_PX = 8;
  const rowWidth = answer.length * TILE_PX + Math.max(0, answer.length - 1) * GAP_PX;

  // keyboard source: prefer dataset, fallback to unique answer tokens
  const keyboardSource = Array.isArray(keyboardPhonemes) && keyboardPhonemes.length > 0
    ? keyboardPhonemes
    : Array.from(new Set(answer)).map((s) => ({ symbol: s }));

  return (
    <div className="wordle-container" style={{ padding: 20 }}>
      {/* Title removed intentionally}

      {/* Hint removed from visible UI during play,  only show if gameOver */}
      {gameOver && (
        <div className="hint" style={{ marginTop: 8 }}>
          Hint: {hint}
        </div>
      )}

      {/* English answer hidden until game over */}
      <div className="hint" style={{ marginTop: 6 }}>
        English: {gameOver ? englishAnswer : "—"}
      </div>

      <div className="board" role="grid" aria-label="Wordle board" style={{ maxWidth: Math.max(rowWidth, 360) }}>
        {rows.map((row, rIdx) => {
          // Only evaluate submitted guesses (rIdx < guesses.length)
          const evaluation =
            rIdx < guesses.length && row && row.length === answer.length ? evaluateGuess(row) : [];

          return (
            <div
              key={rIdx}
              className="row"
              role="row"
              style={{
                gridTemplateColumns: `repeat(${answer.length}, 1fr)`,
                maxWidth: `${rowWidth}px`,
                margin: "0 auto",
                justifyContent: "center",
                gap: `${GAP_PX}px`,
              }}
            >
              {Array.from({ length: answer.length }).map((_, cIdx) => {
                const symbol = row ? (row[cIdx] ?? "") : "";
                const status = evaluation[cIdx];
                return (
                  <div
                    key={cIdx}
                    className={tileClass(status)}
                    role="gridcell"
                    aria-label={symbol ? `phoneme ${symbol}` : "empty"}
                    title={symbol || ""}
                    style={{ minWidth: `${TILE_PX}px`, maxWidth: `${TILE_PX}px`, height: `${TILE_PX}px`, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {symbol}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {message && <div style={{ marginTop: 12, fontWeight: 700 }}>{message}</div>}

      {/* Controls row: smaller buttons, centered text */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <button
          onClick={handleBackspace}
          style={{
            padding: "6px 10px",
            minWidth: 80,
            borderRadius: 6,
            border: "1px solid #ccc",
            textAlign: "center",
            lineHeight: "1",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Backspace
        </button>

        <button
          onClick={handleSubmit}
          style={{
            padding: "6px 10px",
            minWidth: 80,
            borderRadius: 6,
            border: "1px solid #ccc",
            textAlign: "center",
            lineHeight: "1",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Submit
        </button>

        <button
          onClick={() => {
            setCurrentGuess([]);
            setGuesses([]);
            setMessage("");
            setGameOver(false);
          }}
          style={{
            padding: "6px 10px",
            minWidth: 80,
            borderRadius: 6,
            border: "1px solid #ccc",
            textAlign: "center",
            lineHeight: "1",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reset
        </button>

        <button
          onClick={() => router.push("/activities")}
          style={{
            padding: "6px 10px",
            minWidth: 80,
            borderRadius: 6,
            border: "1px solid #ccc",
            textAlign: "center",
            lineHeight: "1",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Activities
        </button>

        <button
          onClick={() => {
            setGameOver(true);
            setMessage(`Answer revealed: ${englishAnswer}`);
          }}
          style={{
            padding: "6px 10px",
            minWidth: 80,
            borderRadius: 6,
            border: "1px solid #ccc",
            textAlign: "center",
            lineHeight: "1",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reveal answer
        </button>

        {/* Download HTML button */}
        <button
          onClick={handleDownloadHtml}
          style={{
            padding: "6px 10px",
            minWidth: 120,
            borderRadius: 6,
            border: "1px solid #ccc",
            textAlign: "center",
            lineHeight: "1",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Download HTML
        </button>
      </div>

      {/* Phoneme keyboard (smaller keys) */}
      <div className="keyboard" aria-label="Phoneme keyboard" style={{ marginTop: 18 }}>
        <div className="keyboard-row" style={{ justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
          {keyboardSource.map((p: any) => (
            <button
              key={p.symbol}
              className="key"
              title={`${p.symbol} ${p.label ?? ""}`}
              onClick={() => handleKey(p.symbol)}
              aria-label={`phoneme ${p.symbol}`}
              style={{
                margin: 4,
                padding: "6px 10px",
                minWidth: 44,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
                lineHeight: "1",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {p.symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
