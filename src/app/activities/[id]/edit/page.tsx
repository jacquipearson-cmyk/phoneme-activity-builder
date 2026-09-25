"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WordEditModal from "@/components/WordEditModal";

export default function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  // Next.js 14+ params fix
  const { id } = use(params);
  const activityId = Number(id);

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingWordId, setEditingWordId] = useState<number | null>(null);

  // Load activity
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/activities/${activityId}`);
        const data = await res.json();
        setActivity(data);
      } catch (err) {
        console.error("Failed to load activity:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [activityId]);

  // Refresh after saving
  async function refresh() {
    const res = await fetch(`/api/activities/${activityId}`);
    const data = await res.json();
    setActivity(data);
  }

  // Delete word
  async function deleteWord(wordId: number) {
    try {
      await fetch(`/api/activities/${activityId}/words/${wordId}`, {
        method: "DELETE",
      });

      setActivity((prev: any) => ({
        ...prev,
        words: prev.words.filter((w: any) => w.id !== wordId),
      }));
    } catch (err) {
      console.error("Failed to delete word:", err);
    }
  }

  if (loading) return <div className="wordle-create-page">Loading…</div>;
  if (!activity) return <div className="wordle-create-page">Activity not found.</div>;

  return (
    <div className="wordle-create-page">
      <h1>Edit Wordle: {activity.title}</h1>

      <div style={{ marginTop: 20 }}>
        {activity.words.map((word: any) => (
          <div
            key={word.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>
              <strong>{word.english}</strong> — {word.hint}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditingWordId(word.id)}>
                Edit
              </button>
              <button onClick={() => deleteWord(word.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Word Edit Modal with keyboard + styling */}
      {editingWordId !== null && (
        <WordEditModal
          activityId={activityId}
          wordId={editingWordId}
          onClose={() => setEditingWordId(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
