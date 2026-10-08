// src/app/api/activities/[id]/wordsearch/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWordSearch } from "@/context/wordsearchGenerator";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        words: { include: { phonemes: true } },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const wordInputs = activity.words.map((w) => ({
      english: w.english,
      hint: w.hint ?? "",
      phonemes: w.phonemes.map((p) => p.symbol),
    }));

    let generated;

    try {
      generated = generateWordSearch(wordInputs, 10);

      await prisma.activityStats.update({
        where: { activityId },
        data: {
          successfulGenerations: { increment: 1 },
        },
      });

      await prisma.appMetrics.update({
        where: { id: 1 },
        data: {
          totalGeneratedOutputs: { increment: 1 },
        },
      });
    } catch (err) {
      await prisma.activityStats.update({
        where: { activityId },
        data: {
          failedGenerations: { increment: 1 },
        },
      });

      return NextResponse.json(
        { error: "Failed to generate WordSearch" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        grid: generated.grid,
        placements: generated.placements,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(err) },
      { status: 500 }
    );
  }
}
