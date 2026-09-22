// src/app/wordsearch/[id]/page.tsx
// -------------------------------------------------------------
// Word Search Activity Page
//
// redo 5: fixed formatting — do on others later
//
// NOTE TO SELF:
// This page is super minimal — it just loads the WordSearchGame
// component with the activityId. I wrote this quickly and forgot
// about it until the next day. Logic is fine, just cleaned up.
// -------------------------------------------------------------
"use client";

import { useParams } from "next/navigation";
import WordSearchGame from "@/components/WordSearchGame";

export default function WordSearchActivityPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <main className="settings-page">
        <div className="settings-container">No activity id.</div>
      </main>
    );
  }

  return (
    <main className="settings-page">
      <div className="settings-container">
        <WordSearchGame activityId={Number(id)} />
      </div>
    </main>
  );

  
}
