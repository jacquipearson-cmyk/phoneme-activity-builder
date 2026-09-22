// src/app/api/activities/[id]/route.ts
// -------------------------------------------------------------
// ACTIVITY GET / PATCH / DELETE ROUTE
//
// NOTE TO SELF:
// This file has been rewritten like 4 times because the DB logic
// kept changing between Wordle & WordSearch    
//  "both need to work at the same time and I forget what I did/ didn't do"
//
// Originally Wordle only needed one word + phonemes.
// Then WordSearch needed multiple words + grid + placements.
// Then phonemes were strings > Then phonemes were objects, ect, ect
//
// This route is now working and actually handles both systems!! yay :)
// -------------------------------------------------------------

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function devErrorResponse(err: any) {
  // NOTE: This is just a debug helper I made when everything kept breaking.
  // Remove the stack trace Later!!!!!
  return NextResponse.json(
    {
      error: "Failed to load activity",
      details: String(err?.message ?? err),
      stack: String(err?.stack ?? ""),
    },
    { status: 500 }
  );
}

// -------------------------------------------------------------
// GET single activity
// NOTE: This is basically duplicated in the HTML export route.
// Also duplicated in the Wordle edit modal.
// ALSO: Unify this into a helper
// -------------------------------------------------------------
export async function GET(_req: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const id = Number(params?.id);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // NOTE: This used to only include phonemes for Wordle.
    // Then I decided WordSearch needed them too, so now everything includes everything.
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { words: { include: { phonemes: true } } },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // WordSearch-only fields (Wordle ignores these)
    // NOTE: remeber you updated this!!!
    // JSON strings because Prisma hates JSON in SQLite.
    const parsedGrid = activity.grid ? JSON.parse(activity.grid) : null;
    const parsedPlacements = activity.placements
      ? JSON.parse(activity.placements)
      : null;

    // This is duplicated in like 5 places and I will do somthing about it later.
    activity.words = activity.words.map((w) => ({
      ...w,
      phonemes: (w.phonemes || [])
        .slice()
        .sort((a, b) => a.position - b.position),
    }));

    return NextResponse.json(
      {
        ...activity,
        grid: parsedGrid,
        placements: parsedPlacements,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[api/activities/[id]] ERROR:", err);
    return devErrorResponse(err);
  }
}

// -------------------------------------------------------------
// PATCH update activity
//
// NOTE TO SELF:
// This is the part that you keep chaning
//
//WordSearch needs:
// - grid
// - placements
// - multiple words
// - phonemes as strings
//
// Wordle needs:
// - phonemes as objects
//
// Final version:
// - Delete all words + phonemes
// - Recreate them from scratch
// - Works for both Wordle + WordSearch
//
// Brute force cuase I dont have time
// -------------------------------------------------------------
export async function PATCH(req: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const id = Number(params?.id);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();

    // Update metadata
    await prisma.activity.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.difficulty !== undefined
          ? { difficulty: Number(body.difficulty) }
          : {}),
        ...(body.type !== undefined ? { type: body.type } : {}),

        // WordSearch-only fields
        // NOTE: NO LONGER OBJECTS!!
        grid: JSON.stringify(body.grid ?? null),
        placements: JSON.stringify(body.placements ?? null),
      },
    });

    // STEP 2: Delete old words + phonemes
    // Nuke and Rebuild cuase at least it works
    await prisma.wordPhoneme.deleteMany({
      where: { word: { activityId: id } },
    });

    await prisma.activityWord.deleteMany({
      where: { activityId: id },
    });

    // STEP 3: Recreate words + phonemes
    // NOTE: WordSearch sends phonemes as strings.
    // Wordle sends phonemes as objects.
    // But this route ONLY handles WordSearch-style editing,
    // so phonemes are always strings here
    if (Array.isArray(body.words)) {
      for (const w of body.words) {
        const newWord = await prisma.activityWord.create({
          data: {
            english: w.english,
            hint: w.hint ?? null,
            activityId: id,
          },
        });

        // NOTE: WordSearch phonemes = ["p", "a", "t"]
        // Wordle phonemes = [{ symbol, position }]
        // Wordle does NOT use this route for editing
        await prisma.wordPhoneme.createMany({
          data: w.phonemes.map((symbol: string, index: number) => ({
            symbol,
            position: index,
            wordId: newWord.id,
          })),
        });
      }
    }

    // STEP 4: Reload activity (again)
    // NOTE: Duplicated logic from GET. 
    const finalActivity = await prisma.activity.findUnique({
      where: { id },
      include: {
        words: {
          include: {
            phonemes: true,
          },
        },
      },
    });

    // Sort phonemes
    finalActivity!.words = finalActivity!.words.map((w) => ({
      ...w,
      phonemes: w.phonemes.slice().sort((a, b) => a.position - b.position),
    }));

    return NextResponse.json(finalActivity);
  } catch (err: any) {
    console.error("[api/activities/[id]] PATCH ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update activity", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// DELETE activity
//
// NOTE TO SELF:
// keep same cuase working!!
// Delete phonemes > delete words > delete activity.
// -------------------------------------------------------------
export async function DELETE(req: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const id = Number(params?.id);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await prisma.wordPhoneme.deleteMany({
      where: { word: { activityId: id } },
    });

    await prisma.activityWord.deleteMany({ where: { activityId: id } });

    await prisma.activity.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/activities/[id]] DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete activity", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
