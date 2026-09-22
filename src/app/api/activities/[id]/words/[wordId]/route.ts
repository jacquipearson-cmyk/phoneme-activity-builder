// src/app/api/activities/[id]/words/[wordId]/route.ts
// -------------------------------------------------------------
// WORD-LEVEL PATCH + DELETE ROUTE
//
// NOTE TO SELF:
// This route is ONLY used by Wordle editing (the modal).
// WordSearch does NOT use this route — it uses the big PATCH
// in /api/activities/[id] instead
//
// I cna keep this it works dont change!!!


// Wordle editing is stable so use this tommorow to fix things.
// -------------------------------------------------------------

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams { params: any; }

export async function PATCH(req: Request, context: RouteParams) {
  try {
    const params = await context.params;

    // NOTE: activityId is technically unused here but I kept it
    // because early versions needed it and I dodn’t want to delete it till i finalised everything
    const activityId = Number(params?.id);
    const wordId = Number(params?.wordId);

    if (Number.isNaN(activityId) || Number.isNaN(wordId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { english, hint, phonemes } = body;

    // -------------------------------------------------------------
    // Transaction because I broke the DB like 3 times before this
    // and I don’t trust anything anymore
    //
    // ensures:
    // - update word
    // - delete old phonemes
    // - recreate phonemes
    // happen together or not at all.
    //
    // WordSearch does NOT use this route, so phonemes here are
    // ALWAYS objects: { symbol, position }
    // -------------------------------------------------------------
    const updated = await prisma.$transaction(async (tx) => {
      // Update word metadata
      const word = await tx.activityWord.update({
        where: { id: wordId },
        data: {
          ...(english !== undefined ? { english } : {}),
          ...(hint !== undefined ? { hint } : {}),
        },
      });

      // If phonemes were provided, rebuild them
      if (Array.isArray(phonemes)) {
        // Delete old phonemes (this used to be updateMany but that broke)
        await tx.wordPhoneme.deleteMany({ where: { wordId } });

        // Try createMany first (faster)
        // NOTE: createMany used to crash randomly in SQLite so I added
        // a fallback loop. Leaving it here for now willl go through all of it later to clean.
        try {
          await tx.wordPhoneme.createMany({
            data: phonemes.map((p: any, idx: number) => ({
              symbol: p.symbol,
              position: p.position ?? idx, // fallback if missing
              wordId,
            })),
          });
        } catch {
          // Fallback loop because createMany sometimes dies
          for (let idx = 0; idx < phonemes.length; idx++) {
            const p = phonemes[idx];
            await tx.wordPhoneme.create({
              data: {
                symbol: p.symbol,
                position: p.position ?? idx,
                wordId,
              },
            });
          }
        }
      }

      // Return updated word with phonemes
      // NOTE: This is duplicated logic from GET.
      return tx.activityWord.findUnique({
        where: { id: wordId },
        include: { phonemes: true },
      });
    });

    // Sort phonemes
    if (updated && updated.phonemes) {
      updated.phonemes = updated.phonemes
        .slice()
        .sort((a: any, b: any) => a.position - b.position);
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[api/activities/[id]/words/[wordId]] PATCH ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update word", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteParams) {
  try {
    const params = await context.params;
    const wordId = Number(params?.wordId);

    if (Number.isNaN(wordId)) {
      return NextResponse.json({ error: "Invalid word id" }, { status: 400 });
    }

    // NOTE: Delete phonemes first because foreign keys will scream otherwise.
    await prisma.wordPhoneme.deleteMany({ where: { wordId } });

    // Delete word
    await prisma.activityWord.delete({ where: { id: wordId } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/activities/[id]/words/[wordId]] DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete word", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
