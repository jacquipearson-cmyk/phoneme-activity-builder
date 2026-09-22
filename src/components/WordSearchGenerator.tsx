//add commets later
"use client";

import type { Cell, Placement } from "@/components/WordSearchGame";

type Word = {
  english: string;
  hint: string;
  phonemes: string[];
};

export default function WordSearchGenerator({
  grid,
  placements,
  words,
}: {
  grid: Cell[][];
  placements: Placement[];
  words: Word[];
}) {
  function generateHTML() {
    const gridJSON = JSON.stringify(grid);
    const placementsJSON = JSON.stringify(placements);
    const wordsJSON = JSON.stringify(words);

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
body {
  background-color: #121212;
  color: white;
}
.cell {
  border-color: #555;
  background-color: #2a2a2a;
  color: white;
}
`
      : "";

    const phonemeMeta: Record<string, { label: string; example: string }> = {
      p: { label: "P", example: "pat" },
      b: { label: "B", example: "bat" },
      m: { label: "M", example: "man" },
      s: { label: "S", example: "sit" },
      d: { label: "D", example: "dog" },
      k: { label: "K", example: "kite" },
      g: { label: "G", example: "go" },
      n: { label: "N", example: "no" },
      r: { label: "R", example: "red" },
      f: { label: "F", example: "fun" },
      v: { label: "V", example: "van" },
      h: { label: "H", example: "hat" },
      l: { label: "L", example: "leg" },
      "ʃ": { label: "SH", example: "ship" },
      "θ": { label: "TH", example: "thin" },
      "əʊ": { label: "OH", example: "go" },
      "ɛ": { label: "E", example: "bed" },
      "æ": { label: "A", example: "cat" },
      "ɒ": { label: "O", example: "dog" },
      "ʌ": { label: "U", example: "sun" },
      "uː": { label: "OO", example: "moon" },
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Phoneme Word Search</title>

<style>
body {
  font-family: ${savedFont}, sans-serif;
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

.ws-word-list {
  margin-top: 20px;
  text-align: left;
}

.ws-word-item {
  margin-bottom: 10px;
}

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

.popup-content h2 {
  margin-bottom: 15px;
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
const grid = ${gridJSON};
const placements = ${placementsJSON};
const words = ${wordsJSON};
const phonemeData = ${JSON.stringify(phonemeMeta)};

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

      const meta = phonemeData[cell.symbol];
      button.title = meta ? meta.label + " (as in " + meta.example + ")" : cell.symbol;

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
      '<button id="hint-btn-' + index + '" style="margin-top:5px;">Show Phonemes</button>' +
      '<p id="hint-' + index + '" style="margin-top:5px; font-style:italic; display:none;"></p>';

    wordsDiv.appendChild(container);

    let hintShown = false;

    document.getElementById("hint-btn-" + index).onclick = () => {
      const hintP = document.getElementById("hint-" + index);
      hintP.style.display = "block";
      hintP.textContent = "Phonemes: " + word.phonemes.join(" ");
      hintShown = true;
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
  if (!start) return;

  const rowDiff = cell.row - start.row;
  const colDiff = cell.column - start.column;

  if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) return;

  const rowDir = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
  const colDir = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;
  const distance = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

  const newSelection = [];

  for (let i = 0; i <= distance; i++) {
    const r = start.row + i * rowDir;
    const c = start.column + i * colDir;

    if (grid[r] && grid[r][c]) {
      newSelection.push(grid[r][c]);
    }
  }

  selectedCells = newSelection;
  updateHighlights();
}

function endSelection() {
  isDragging = false;
  checkSelection();
}

function checkSelection() {
  const selectedSymbols = selectedCells.map(c => c.symbol);
  const forward = selectedSymbols.join("|");
  const backward = [...selectedSymbols].reverse().join("|");

  const foundIndex = words.findIndex(word => {
    const target = word.phonemes.join("|");
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

    const isSelected = selectedCells.some(c => c.row === row && c.column === col);
    const isFound = placements.some((placement, idx) =>
      foundWords.includes(placement.wordIndex) &&
      placement.cells.some(c => c.row === row && c.column === col)
    );

    button.className = "cell" +
      (isFound ? " found" : isSelected ? " selected" : "");
  });
}

function showWinPopup() {
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("popup-close");
  popup.style.display = "flex";
  closeBtn.onclick = () => {
    popup.style.display = "none";
  };
}

renderGrid();
renderWords();
</script>

</body>
</html>`;

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

  return <button onClick={generateHTML}>Generate Word Search HTML</button>;
}
