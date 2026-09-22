//add commets later
import { phonemes } from "@/data/phonemes";

export type WordInput = {
  english: string;
  hint: string;
  phonemes: string[];
};

export function generateWordSearch(words: WordInput[], size = 10) {
  // Create empty grid
  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => "")
  );

  // Placement output
  const placements: {
    wordIndex: number;
    cells: { symbol: string; row: number; column: number }[];
  }[] = [];

  // ⭐ FULL 8‑DIRECTION SUPPORT
  const directions = [
    // Horizontal
    { dr: 0, dc: 1 },   // →
    { dr: 0, dc: -1 },  // ←

    // Vertical
    { dr: 1, dc: 0 },   // ↓
    { dr: -1, dc: 0 },  // ↑

    // Diagonals
    { dr: 1, dc: 1 },   // ↘
    { dr: 1, dc: -1 },  // ↙
    { dr: -1, dc: 1 },  // ↗
    { dr: -1, dc: -1 }, // ↖
  ];

  // Check if a word can be placed at a position
  function canPlace(
    r: number,
    c: number,
    dr: number,
    dc: number,
    symbols: string[]
  ) {
    for (let i = 0; i < symbols.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;

      // Out of bounds
      if (rr < 0 || rr >= size || cc < 0 || cc >= size) return false;

      // Collision with different symbol
      if (grid[rr][cc] && grid[rr][cc] !== symbols[i]) return false;
    }
    return true;
  }

  // Place a word in the grid
  function placeWord(wordIndex: number, symbols: string[]) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const { dr, dc } =
        directions[Math.floor(Math.random() * directions.length)];

      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);

      if (!canPlace(r, c, dr, dc, symbols)) continue;

      const cells: { symbol: string; row: number; column: number }[] = [];

      for (let i = 0; i < symbols.length; i++) {
        const rr = r + dr * i;
        const cc = c + dc * i;

        grid[rr][cc] = symbols[i];
        cells.push({ symbol: symbols[i], row: rr, column: cc });
      }

      placements.push({ wordIndex, cells });
      return;
    }
  }

  // Place each word
  words.forEach((w, index) => {
    if (!w.phonemes.length) return;

    // Random forward/backward placement
    const forward = Math.random() < 0.5;
    const symbols = forward ? w.phonemes : [...w.phonemes].reverse();

    placeWord(index, symbols);
  });

  // Fill remaining cells with random phonemes
  const filler = phonemes.map((p) => p.symbol);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = filler[Math.floor(Math.random() * filler.length)];
      }
    }
  }

  return { grid, placements };
}
