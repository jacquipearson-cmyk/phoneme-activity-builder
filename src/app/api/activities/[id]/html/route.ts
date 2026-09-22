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

// Optional server-side phoneme dataset
// NOTE: If this file doesn't exist, everything still works.
// I added this from the old broken one cuase I didn't want to waste it
// but then forgot to actually use it anywhere beside the 2 wordle files, so I might change it later?
import { phonemes as serverPhonemes } from "@/data/phonemes"; // optional; safe if file exists

interface RouteParams { params: any; }

export async function GET(req: Request, context: RouteParams) {
  try {
    // -------------------------------------------------------------
    // Grab ID from route params
    // NOTE: App Router does this weird "context.params" thing.
    // -------------------------------------------------------------
    const params = await context.params;
    const id = Number(params?.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid activity id" }, { status: 400 });
    }

    // -------------------------------------------------------------
    // Load activity + words + phonemes
    // NOTE: This is duplicated logic from the main GET route.
    // -------------------------------------------------------------
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { words: { include: { phonemes: true } } },
    });

    if (!activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 });

    const word = activity.words[0];
    if (!word) return NextResponse.json({ error: "No word found for this activity" }, { status: 404 });

    // -------------------------------------------------------------
    // Read settings from cookies
    // NOTE: This is the same logic used in the Wordle game page.
    // Future to do: move this into a helper
    // -------------------------------------------------------------
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").filter(Boolean).map((c) => {
        const [name, ...rest] = c.split("=");
        return [name, decodeURIComponent(rest.join("="))];
      })
    );

    // NOTE: Only allowing fonts I trust because HTML export wsa being picky
    const font =
      cookies["phoneme-font"] === "Calibri" ||
      cookies["phoneme-font"] === "Arial" ||
      cookies["phoneme-font"] === "Comic Sans MS"
        ? cookies["phoneme-font"]
        : "Calibri";

    // NOTE: Colour scheme is also duplicated logic from the game.
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
    // NOTE: If serverPhonemes exists, use that. Otherwise fallback
    // to phonemes from the actual word. future me: update to not be messy.
    // -------------------------------------------------------------
    let keyboard: string[] = [];
    try {
      if (Array.isArray(serverPhonemes) && serverPhonemes.length > 0) {
        keyboard = serverPhonemes.map((p: any) => p.symbol);
      }
    } catch {
      // NOTE: If import fails, just ignore it. This is fine.
    }

    // fallback if serverPhonemes is empty or missing
    if (keyboard.length === 0) {
      keyboard = Array.from(new Set(word.phonemes.map((p) => p.symbol)));
    }

    // -------------------------------------------------------------
    // Generate HTML
    // NOTE: Sorting phonemes again cuase I changed the logic
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
    // Return HTML file
    // NOTE: This forces a download with a filename based on the word.
    // -------------------------------------------------------------
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="wordle-${encodeURIComponent(word.english)}.html"`,
      },
    });
  } catch (err: any) {
    console.error("[api/activities/[id]/html] ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate HTML", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
