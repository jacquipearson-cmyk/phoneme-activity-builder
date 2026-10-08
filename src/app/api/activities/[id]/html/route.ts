// src/app/api/activities/[id]/html/route.ts
// -------------------------------------------------------------
// WORDLE HTML EXPORT ROUTE!!!
//
//
// This is the route that spits out the downloadable HTML file.
// Only works for WORDLE (not WordSearch). WordSearch is done 
// diffrently cuase I had no energy!!
//
// This basically grabs the activity > grabs the first word >
// sorts phonemes > builds keyboard > passes everything into
// generateWordleHTML() > returns a full HTML file.
//
// Also: this route is separate from the main activity
// routes. I did this first then decided to do it diffrently 
// but had no time to change it/ didn't want to
// -------------------------------------------------------------
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWordleHTML } from "@/lib/generateWordleHTML";
import { phonemes as serverPhonemes } from "@/data/phonemes";

interface RouteParams { params: any; }

export async function GET(req: Request, context: RouteParams) {
  try {
    const params = await context.params;
    const id = Number(params?.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid activity id" }, { status: 400 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { words: { include: { phonemes: true } } },
    });

    if (!activity)
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });

    const word = activity.words[0];
    if (!word)
      return NextResponse.json({ error: "No word found for this activity" }, { status: 404 });

    // -------------------------------------------------------------
    // Read settings from cookies
    // -------------------------------------------------------------
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").filter(Boolean).map((c) => {
        const [name, ...rest] = c.split("=");
        return [name, decodeURIComponent(rest.join("="))];
      })
    );

    const font =
      cookies["phoneme-font"] === "Calibri" ||
      cookies["phoneme-font"] === "Arial" ||
      cookies["phoneme-font"] === "Comic Sans MS"
        ? cookies["phoneme-font"]
        : "Calibri";

    const colourScheme =
      cookies["phoneme-colours"] === "default" ||
      cookies["phoneme-colours"] === "saturated" ||
      cookies["phoneme-colours"] === "colourblind"
        ? (cookies["phoneme-colours"] as "default" | "saturated" | "colourblind")
        : "default";

    const darkMode = cookies["phoneme-dark-mode"] === "true";

    const settings = { font, colourScheme, darkMode };

    // -------------------------------------------------------------
    // Build keyboard
    // -------------------------------------------------------------
    let keyboard: string[] = [];
    try {
      if (Array.isArray(serverPhonemes) && serverPhonemes.length > 0) {
        keyboard = serverPhonemes.map((p: any) => p.symbol);
      }
    } catch {}

    if (keyboard.length === 0) {
      keyboard = Array.from(new Set(word.phonemes.map((p) => p.symbol)));
    }

    // -------------------------------------------------------------
    // Generate HTML
    // -------------------------------------------------------------
    const html = generateWordleHTML({
      english: word.english,
      phonemes: word.phonemes
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((p) => p.symbol),
      hint: word.hint ?? "",
      difficulty: Number(activity.difficulty ?? 0),
      settings,
      keyboard,
    });

    // -------------------------------------------------------------
    // Instermentation Fix — ensure stats row exists
    // -------------------------------------------------------------
    try {
      await prisma.appMetrics.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1 },
      });

      await prisma.appMetrics.update({
        where: { id: 1 },
        data: {
          totalGeneratedOutputs: { increment: 1 },
        },
      });

      // Fix: ensure activityStats row exists
      await prisma.activityStats.upsert({
        where: { activityId: activity.id },
        update: {},
        create: { activityId: activity.id },
      });

      await prisma.activityStats.update({
        where: { activityId: activity.id },
        data: {
          successfulGenerations: { increment: 1 },
        },
      });
    } catch (err) {
      console.error("Instrumentation error (HTML generation):", err);
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="wordle-${encodeURIComponent(
          word.english
        )}.html"`,
      },
    });
  } catch (err: any) {
    console.error("[api/activities/[id]/html] ERROR:", err);

    try {
      await prisma.activityStats.upsert({
        where: { activityId: Number(context.params?.id) },
        update: {},
        create: { activityId: Number(context.params?.id) },
      });

      await prisma.activityStats.update({
        where: { activityId: Number(context.params?.id) },
        data: {
          failedGenerations: { increment: 1 },
        },
      });
    } catch (err2) {
      console.error("Instrumentation error (failed generation):", err2);
    }

    return NextResponse.json(
      { error: "Failed to generate HTML", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
