// src/components/WordleGenerator.tsx
// -------------------------------------------------------------
// Wordle HTML Export Generator
//
// redo 5: fixed formatting — do on others later
//
//
// This generates standalone HTML file 
// It MUST use inline CSS + JS because exported HTML cannot rely
// on globals.css or React. 
// -------------------------------------------------------------

import { phonemes as keyboardPhonemes } from "@/data/phonemes";

interface WordleHTMLProps {
  english: string;
  phonemes: string[];
  hint: string;
  difficulty: number;
  settings: {
    font: string;
    colourScheme: "default" | "saturated" | "colourblind";
    darkMode: boolean;
  };
}

export function generateWordleHTML({
  english,
  phonemes,
  hint,
  difficulty,
  settings,
}: WordleHTMLProps) {
  // JSON for the answer array
  const answerJSON = JSON.stringify(phonemes);

  // -------------------------------------------------------------
  // Colour Scheme U
  // Updated to match modern Wordle tile names: correct/present/incorrect
  // -------------------------------------------------------------
  const colours = {
    default: {
      correct: "#64b75d",
      present: "#e7cb4b",
      incorrect: "#d03838",
    },
    saturated: {
      correct: "#00ff00",
      present: "#ffcc00",
      incorrect: "#ff0000",
    },
    colourblind: {
      correct: "#1b9e77",
      present: "#d95f02",
      incorrect: "#7570b3",
    },
  };

  const scheme = colours[settings.colourScheme];

  // -------------------------------------------------------------
  // Dark Mode U
  // -------------------------------------------------------------
  const background = settings.darkMode ? "#111" : "#ffffff";
  const textColour = settings.darkMode ? "#ffffff" : "#000000";
  const borderColour = settings.darkMode ? "#888" : "#999";

  // -------------------------------------------------------------
  // HTML Output U
  // -------------------------------------------------------------
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Phoneme Wordle - ${english}</title>

<style>
  body {
    font-family: ${settings.font}, sans-serif;
    background: ${background};
    color: ${textColour};
    padding: 20px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(${phonemes.length}, 60px);
    gap: 10px;
    margin-bottom: 20px;
  }

  .cell {
    width: 60px;
    height: 60px;
    border: 2px solid ${borderColour};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
  }

  /* Updated to match modern Wordle */
  .correct   { background-color: ${scheme.correct};   color: white; }
  .present   { background-color: ${scheme.present};   color: white; }
  .incorrect { background-color: ${scheme.incorrect}; color: white; }

  .keyboard {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  .key {
    padding: 10px 15px;
    font-size: 18px;
    cursor: pointer;
    background: ${settings.darkMode ? "#333" : "#eee"};
    color: ${textColour};
    border: 1px solid ${borderColour};
  }
</style>
</head>

<body>
  <h1>Phoneme Wordle</h1>
  <h2>Hint: ${hint}</h2>
  <p>Difficulty: ${difficulty} phonemes</p>

  <div id="grid"></div>

  <button onclick="checkGuess()">Check Guess</button>
  <button onclick="clearGuess()">Clear</button>

  <p id="message" style="font-weight: bold;"></p>

  <h3>Phoneme Keyboard</h3>
  <div id="keyboard" class="keyboard"></div>

<script>
  const answer = ${answerJSON};
  let currentGuess = [];
  let guesses = [];
  let gameOver = false;

  // Full phoneme keyboard (still used)
  const phonemes = ${JSON.stringify(
    keyboardPhonemes.map((p) => p.symbol)
  )};

  // -------------------------------------------------------------
  // Render grid
  // -------------------------------------------------------------
  function renderGrid() {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    // Past guesses
    guesses.forEach(row => {
      row.forEach((symbol, i) => {
        const div = document.createElement("div");
        div.className = "cell";

        if (symbol === answer[i]) div.classList.add("correct");
        else if (answer.includes(symbol)) div.classList.add("present");
        else div.classList.add("incorrect"); // updated

        div.textContent = symbol;
        grid.appendChild(div);
      });
    });

    // Current guess row
    const row = document.createElement("div");
    row.className = "grid";

    for (let i = 0; i < answer.length; i++) {
      const div = document.createElement("div");
      div.className = "cell";
      div.textContent = currentGuess[i] || "";
      row.appendChild(div);
    }

    grid.appendChild(row);
  }

  // -------------------------------------------------------------
  // Add phoneme
  // -------------------------------------------------------------
  function addPhoneme(symbol) {
    if (gameOver) return;
    if (currentGuess.length < answer.length) {
      currentGuess.push(symbol);
      renderGrid();
    }
  }

  // -------------------------------------------------------------
  // Clear guess
  // -------------------------------------------------------------
  function clearGuess() {
    currentGuess = [];
    renderGrid();
  }

  // -------------------------------------------------------------
  // Check guess
  // -------------------------------------------------------------
  function checkGuess() {
    if (gameOver) return;

    if (currentGuess.length !== answer.length) {
      document.getElementById("message").textContent =
        "Please enter all phonemes.";
      return;
    }

    guesses.push([...currentGuess]);

    const correct = currentGuess.join("") === answer.join("");

    if (correct) {
      gameOver = true;
      document.getElementById("message").textContent = "Correct!";
    } else if (guesses.length >= 6) {
      gameOver = true;
      document.getElementById("message").textContent =
        "No more guesses remaining.";
    } else {
      document.getElementById("message").textContent =
        "Not quite. Try again.";
    }

    currentGuess = [];
    renderGrid();
  }

  // -------------------------------------------------------------
  // Render keyboard
  // -------------------------------------------------------------
  function renderKeyboard() {
    const kb = document.getElementById("keyboard");
    phonemes.forEach(symbol => {
      const btn = document.createElement("button");
      btn.className = "key";
      btn.textContent = symbol;
      btn.onclick = () => addPhoneme(symbol);
      kb.appendChild(btn);
    });
  }

  renderGrid();
  renderKeyboard();
</script>

</body>
</html>
`;
}
