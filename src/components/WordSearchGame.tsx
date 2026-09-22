//add commets later
"use client";

import { useEffect, useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { phonemes } from "@/data/phonemes";

export type Cell = {
  symbol: string;
  row: number;
  column: number;
};

export type Placement = {
  wordIndex: number;
  cells: Cell[];
};

type Word = {
  english: string;
  hint: string;
  phonemes: string[];
};

export default function WordSearchGame({ activityId }: { activityId: number }) {
  const { darkMode } = useAccessibility();

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const [visibleHints, setVisibleHints] = useState<boolean[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [foundWords, setFoundWords] = useState<number[]>([]);
  const [gameWon, setGameWon] = useState(false);

  const [tooltip, setTooltip] = useState("");
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/activities/${activityId}`);
      const data = await res.json();

      // ⭐ Parse grid JSON (string → array)
      const parsedGrid: string[][] = Array.isArray(data.grid)
        ? data.grid
        : JSON.parse(data.grid || "[]");

      // ⭐ Convert grid symbols → Cell objects
      const cellsGrid: Cell[][] = parsedGrid.map((row, r) =>
        row.map((symbol, c) => ({
          symbol,
          row: r,
          column: c,
        }))
      );

      setGrid(cellsGrid);

      // ⭐ Parse placements JSON (string → array)
      const parsedPlacements = Array.isArray(data.placements)
        ? data.placements
        : JSON.parse(data.placements || "[]");

      // ⭐ Convert placements into Cell[] references
      const placementCells: Placement[] = parsedPlacements.map((p: any) => ({
        wordIndex: p.wordIndex,
        cells: p.cells.map((cell: any) => ({
          symbol: cell.symbol,
          row: cell.row,
          column: cell.column,
        })),
      }));

      setPlacements(placementCells);

      // ⭐ Convert words + phonemes
      setWords(
        data.words.map((w: any) => ({
          english: w.english,
          hint: w.hint,
          phonemes: w.phonemes
            .slice()
            .sort((a: any, b: any) => a.position - b.position)
            .map((p: any) => p.symbol),
        }))
      );

      setVisibleHints(data.words.map(() => false));
      setLoading(false);
    }

    load();
  }, [activityId]);

  if (loading) return <p>Loading…</p>;

  const phonemeMap: Record<string, string> = {};
  phonemes.forEach((p) => {
    phonemeMap[p.symbol] = `${p.label} (${p.example})`;
  });

    function generateHTML() {
    const cookies = document.cookie.split("; ");
    const getCookie = (name: string) =>
      cookies.find((c) => c.startsWith(name + "="))?.split("=")[1];

    const savedFont = getCookie("phoneme-font") || "Calibri";
    const savedColours = getCookie("phoneme-colours") || "default";
    const savedDarkMode = getCookie("phoneme-dark-mode") === "true";

    const colourCSS =
      savedColours === "saturated"
        ? `
.selected { background-color: #FFFF00 !important; color: black !important; }
.found { background-color: #00B300 !important; color: white !important; }
`
        : savedColours === "colourblind"
        ? `
.selected { background-color: #D55E00 !important; color: white !important; }
.found { background-color: #56B4E9 !important; color: white !important; }
`
        : `
.selected { background-color: #FFD700 !important; color: black !important; }
.found { background-color: #2D9B2B !important; color: white !important; }
`;

    const darkModeCSS = savedDarkMode
      ? `
body { background:#121212; color:white; }
.cell { background:#2a2a2a; color:white; border-color:#555; }
`
      : "";

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Phoneme Word Search</title>
<style>
body {
  font-family: ${savedFont};
  max-width: 700px;
  margin: 0 auto;
  padding: 30px;
  text-align: center;
}
.grid { display: inline-block; user-select: none; margin: 20px 0; }
.row { display: flex; }
.cell {
  width: 55px;
  height: 55px;
  border: 1px solid #999;
  background: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
${colourCSS}
${darkModeCSS}
.ws-word-list { margin-top: 20px; text-align: left; }
.ws-word-item { margin-bottom: 10px; }
.popup {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.popup-content {
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  max-width: 300px;
}
</style>
</head>

<body>

<h1>Phoneme Word Search</h1>
<p>Find the phoneme-based words in the grid.</p>

<div id="grid" class="grid"></div>

<h2>Words to Find</h2>
<div id="words" class="ws-word-list"></div>

<div id="popup" class="popup" style="display:none;">
  <div class="popup-content">
    <h2>You win!</h2>
    <button id="popup-close">Close</button>
  </div>
</div>

<script>
const grid = ${JSON.stringify(grid)};
const placements = ${JSON.stringify(placements)};
const words = ${JSON.stringify(words)};

let isDragging = false;
let selectedCells = [];
let foundWords = [];

function renderGrid() {
  const gridContainer = document.getElementById("grid");
  gridContainer.innerHTML = "";

  grid.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    row.forEach((cell) => {
      const button = document.createElement("button");
      button.className = "cell";
      button.textContent = cell.symbol;

      button.onmousedown = () => startSelection(cell);
      button.onmouseenter = () => continueSelection(cell);
      button.onmouseup = endSelection;

      rowDiv.appendChild(button);
    });

    gridContainer.appendChild(rowDiv);
  });
}

function renderWords() {
  const wordsDiv = document.getElementById("words");
  wordsDiv.innerHTML = "";

  words.forEach((word, index) => {
    const container = document.createElement("div");
    container.className = "ws-word-item";

    container.innerHTML =
      "<strong>" + word.english + "</strong>" +
      "<p>" + (word.hint || "") + "</p>" +
      '<button id="hint-btn-' + index + '">Show Phonemes</button>' +
      '<p id="hint-' + index + '" style="display:none; font-style:italic;"></p>';

    wordsDiv.appendChild(container);

    document.getElementById("hint-btn-" + index).onclick = () => {
      const hintP = document.getElementById("hint-" + index);
      hintP.style.display = "block";
      hintP.textContent = "Phonemes: " + word.phonemes.join(" ");
    };
  });
}

function startSelection(cell) {
  isDragging = true;
  selectedCells = [cell];
  updateHighlights();
}

function continueSelection(cell) {
  if (!isDragging) return;

  const start = selectedCells[0];
  const rowDiff = cell.row - start.row;
  const colDiff = cell.column - start.column;

  if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff))
    return;

  const rowDir = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
  const colDir = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;
  const dist = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

  const newSel = [];
  for (let i = 0; i <= dist; i++) {
    const r = start.row + i * rowDir;
    const c = start.column + i * colDir;
    newSel.push(grid[r][c]);
  }

  selectedCells = newSel;
  updateHighlights();
}

function endSelection() {
  isDragging = false;
  checkSelection();
}

function checkSelection() {
  const selectedSymbols = selectedCells.map((c) => c.symbol);
  const forward = selectedSymbols.join("|");
  const backward = [...selectedSymbols].reverse().join("|");

  const foundIndex = words.findIndex((w) => {
    const target = w.phonemes.join("|");
    return target === forward || target === backward;
  });

  if (foundIndex !== -1 && !foundWords.includes(foundIndex)) {
    foundWords.push(foundIndex);
    selectedCells = [];
    updateHighlights();

    if (foundWords.length === words.length) {
      showWinPopup();
    }
  } else {
    selectedCells = [];
    updateHighlights();
  }
}

function updateHighlights() {
  const buttons = document.querySelectorAll(".cell");

  buttons.forEach((button, index) => {
    const row = Math.floor(index / grid[0].length);
    const col = index % grid[0].length;

    const cell = grid[row][col];

    const isSelected = selectedCells.some(
      (c) => c.row === row && c.column === col
    );

    const isFound = placements.some(
      (p) =>
        foundWords.includes(p.wordIndex) &&
        p.cells.some((c) => c.row === row && c.column === col)
    );

    button.className = "cell" + (isFound ? " found" : isSelected ? " selected" : "");
  });
}

function showWinPopup() {
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("popup-close");
  popup.style.display = "flex";
  closeBtn.onclick = () => (popup.style.display = "none");
}

renderGrid();
renderWords();
</script>

</body>
</html>
`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "phoneme-word-search.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }


  // Gameplay logic
  function showHint(index: number) {
    const updated = [...visibleHints];
    updated[index] = true;
    setVisibleHints(updated);
  }

  function startSelection(cell: Cell) {
    setIsDragging(true);
    setSelectedCells([cell]);
  }

  function continueSelection(cell: Cell) {
    if (!isDragging) return;

    const start = selectedCells[0];
    if (!start) return;

    const rowDiff = cell.row - start.row;
    const colDiff = cell.column - start.column;

    if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff))
      return;

    const rowDir = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
    const colDir = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;
    const dist = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

    const newSel: Cell[] = [];

    for (let i = 0; i <= dist; i++) {
      const r = start.row + i * rowDir;
      const c = start.column + i * colDir;
      newSel.push(grid[r][c]);
    }

    setSelectedCells(newSel);
  }

  function endSelection() {
    setIsDragging(false);
    checkSelection();
  }

  function checkSelection() {
    const selectedSymbols = selectedCells.map((c) => c.symbol);
    const forward = selectedSymbols.join("|");
    const backward = [...selectedSymbols].reverse().join("|");

    const foundIndex = words.findIndex((w) => {
      const target = w.phonemes.join("|");
      return target === forward || target === backward;
    });

    if (foundIndex !== -1 && !foundWords.includes(foundIndex)) {
      const updated = [...foundWords, foundIndex];
      setFoundWords(updated);

      if (updated.length === words.length) {
        setGameWon(true);
      }
    }

    setSelectedCells([]);
  }

  function getCellClass(cell: Cell) {
    const isSelected = selectedCells.some(
      (s) => s.row === cell.row && s.column === cell.column
    );

    const isFound = foundWords.some((index) =>
      placements[index]?.cells.some(
        (f) => f.row === cell.row && f.column === cell.column
      )
    );

    if (isFound) return "found";
    if (isSelected) return "selected";
    return "";
  }

  return (
    <main className={darkMode ? "dark-mode" : ""}>
      <div className="ws-container">
        <div className="generate-button-container">
          <button className="ws-hint-btn" onClick={generateHTML}>
            Download HTML
          </button>
        </div>

        <h1>Phoneme Word Search</h1>

        <div
          className="word-search-grid"
          onMouseLeave={() => {
            setIsDragging(false);
            setTooltip("");
            setTooltipPos(null);
          }}
        >
          {grid.map((row, r) => (
            <div className="word-search-row" key={r}>
              {row.map((cell) => (
                <button
                  key={`${cell.row}-${cell.column}`}
                  className={getCellClass(cell)}
                  onMouseDown={() => startSelection(cell)}
                  onMouseEnter={(e) => {
                    const text = phonemeMap[cell.symbol] || "";
                    setTooltip(text);
                    setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 });
                    continueSelection(cell);
                  }}
                  onMouseMove={(e) => {
                    if (tooltip) {
                      setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 });
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltip("");
                    setTooltipPos(null);
                  }}
                  onMouseUp={endSelection}
                >
                  {cell.symbol}
                </button>
              ))}
            </div>
          ))}
        </div>

        {tooltip && tooltipPos && (
          <div
            className="tooltip"
            style={{
              position: "fixed",
              top: tooltipPos.y,
              left: tooltipPos.x,
            }}
          >
            {tooltip}
          </div>
        )}

        <h2>Words to Find</h2>

        <div className="ws-word-list">
          {words.map((word, index) => (
            <div key={index} className="ws-word-item">
              <strong>{word.english}</strong>
              <p>{word.hint}</p>
              {visibleHints[index] && (
                <p>Phonemes: {word.phonemes.join(" ")}</p>
              )}
              <button className="ws-hint-btn" onClick={() => showHint(index)}>
                Show Phonemes
              </button>
            </div>
          ))}
        </div>

        {gameWon && (
          <div className="popup">
            <div className="popup-content">
              <h2>You found all the words!</h2>
              <button
                className="ws-hint-btn"
                onClick={() => (window.location.href = "/")}
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
