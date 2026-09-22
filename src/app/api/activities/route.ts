// src/app/api/activities/route.ts
// -------------------------------------------------------------
// Activities API (GET all + POST new)
//
// redo 5: fixed formatting — do on others later
//
// NOTE TO SELF:
// This is the unified create route for BOTH Wordle + WordSearch.
// Logic stayed messy for a while because phonemes changed formats
// multiple times during development. 'Cleaned' layout 
// Still exact same behaviour.
// -------------------------------------------------------------

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// -------------------------------------------------------------
// GET all activities
// -------------------------------------------------------------
export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        words: {
          include: { phonemes: true },
        },
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("GET /api/activities ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load activities" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// Helper: Normalize phoneme input (Wordle + WordSearch)
// -------------------------------------------------------------
function normalizePhoneme(p: any, index: number) {
  // WordSearch sends phonemes as strings
  if (typeof p === "string") {
    return { symbol: p, position: index };
  }

  // Wordle sends phonemes as objects
  return {
    symbol: p.symbol,
    position: p.position,
  };
}

// -------------------------------------------------------------
// POST create activity (Wordle or WordSearch)
// -------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Build activity metadata
    const activityData = {
      title: data.title,
      type: data.type,
      difficulty: data.difficulty,

      // WordSearch-only fields (stored as JSON strings)
      grid: JSON.stringify(data.grid ?? null),
      placements: JSON.stringify(data.placements ?? null),

      // Words + phonemes (supports both formats)
      words: {
        create: data.words.map((w: any) => ({
          english: w.english,
          hint: w.hint ?? null,

          phonemes: {
            create: w.phonemes.map((p: any, index: number) =>
              normalizePhoneme(p, index)
            ),
          },
        })),
      },
    };

    // Create activity
    const activity = await prisma.activity.create({
      data: activityData,
      include: {
        words: {
          include: { phonemes: true },
        },
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("POST /api/activities ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
