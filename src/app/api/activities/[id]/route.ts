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
// -------------------------------------------------------------
export async function GET(req: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const id = Number(params?.id);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Load activity
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { words: { include: { phonemes: true } } },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // -------------------------------------------------------------
    // INSTRUMENTATION: Count views
    // -------------------------------------------------------------
    try {
      // Ensure stats row exists
      await prisma.activityStats.upsert({
        where: { activityId: id },
        update: {},
        create: {
          activityId: id,
          successfulGenerations: 0,
          failedGenerations: 0,
          totalViews: 0,
          totalTimeOnPageMs: 0,
        },
      });

      // Increment view count
      await prisma.activityStats.update({
        where: { activityId: id },
        data: {
          totalViews: { increment: 1 },
        },
      });
    } catch (err) {
      console.error("Instrumentation error (view count):", err);
    }

    // -------------------------------------------------------------
    // OPTIONAL: Time-on-page support
    // Client can POST timeOnPageMs later
    // -------------------------------------------------------------
    const timeOnPageHeader = req.headers.get("x-time-on-page-ms");
    if (timeOnPageHeader) {
      const ms = Number(timeOnPageHeader);
      if (!Number.isNaN(ms)) {
        try {
          await prisma.activityStats.update({
            where: { activityId: id },
            data: {
              totalTimeOnPageMs: { increment: ms },
            },
          });
        } catch (err) {
          console.error("Instrumentation error (time on page):", err);
        }
      }
    }

    // -------------------------------------------------------------
    // WordSearch-only fields (JSON strings)
    // -------------------------------------------------------------
    const parsedGrid = activity.grid ? JSON.parse(activity.grid) : null;
    const parsedPlacements = activity.placements
      ? JSON.parse(activity.placements)
      : null;

    // Sort phonemes
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
        grid: JSON.stringify(body.grid ?? null),
        placements: JSON.stringify(body.placements ?? null),
      },
    });

    // Delete old words + phonemes
    await prisma.wordPhoneme.deleteMany({
      where: { word: { activityId: id } },
    });

    await prisma.activityWord.deleteMany({
      where: { activityId: id },
    });

    // Recreate words + phonemes
    if (Array.isArray(body.words)) {
      for (const w of body.words) {
        const newWord = await prisma.activityWord.create({
          data: {
            english: w.english,
            hint: w.hint ?? null,
            activityId: id,
          },
        });

        await prisma.wordPhoneme.createMany({
          data: w.phonemes.map((symbol: string, index: number) => ({
            symbol,
            position: index,
            wordId: newWord.id,
          })),
        });
      }
    }

    // Reload activity
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
