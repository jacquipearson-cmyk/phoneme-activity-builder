//Add comments later
// src/lib/generateWordleHTML.ts
export interface WordleHTMLProps {
  english: string;
  phonemes: string[]; // answer phonemes in order
  hint: string;
  difficulty: number;
  settings: {
    font: string;
    colourScheme: "default" | "saturated" | "colourblind";
    darkMode: boolean;
  };
  keyboard: string[]; // full keyboard phoneme symbols
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function generateWordleHTML({
  english,
  phonemes,
  hint,
  difficulty,
  settings,
  keyboard,
}: WordleHTMLProps) {
  const answerJSON = JSON.stringify(phonemes);
  const keyboardJSON = JSON.stringify(keyboard || phonemes);

  const colours = {
    default: { correct: "#64b75d", present: "#e7cb4b", absent: "#d03838" },
    saturated: { correct: "#00ff00", present: "#ffcc00", absent: "#ff0000" },
    colourblind: { correct: "#1b9e77", present: "#d95f02", absent: "#7570b3" },
  };
  const scheme = colours[settings.colourScheme] ?? colours.default;
  const background = settings.darkMode ? "#111" : "#ffffff";
  const textColour = settings.darkMode ? "#ffffff" : "#000000";
  const borderColour = settings.darkMode ? "#888" : "#999";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Wordle export - ${escapeHtml(english)}</title>
<style>
  :root{
    --bg:${background};
    --text:${textColour};
    --border:${borderColour};
    --correct:${scheme.correct};
    --present:${scheme.present};
    --absent:${scheme.absent};
    --tile-size:64px;
    --gap:8px;
    font-family:${escapeHtml(settings.font)}, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  }
  html,body{height:100%;margin:0;background:var(--bg);color:var(--text)}
  .wrap{max-width:900px;margin:28px auto;padding:18px}
  .meta{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
  .label{font-weight:600;color:var(--text)}
  .board{display:flex;flex-direction:column;gap:12px;margin-top:8px}
  .row{display:flex;gap:var(--gap);justify-content:center}
  .tile{width:var(--tile-size);height:var(--tile-size);display:flex;align-items:center;justify-content:center;border:2px solid var(--border);border-radius:8px;font-weight:700;font-size:20px;background:transparent}
  .tile.correct{background:var(--correct);color:#fff;border-color:var(--correct)}
  .tile.present{background:var(--present);color:#fff;border-color:var(--present)}
  .tile.absent{background:var(--absent);color:#fff;border-color:var(--absent)}
  .controls{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px}
  .btn{padding:8px 12px;border-radius:6px;border:1px solid var(--border);background:#fff;cursor:pointer;font-weight:600}
  .keyboard{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:18px}
  .key{padding:8px 10px;border-radius:6px;border:1px solid var(--border);background:#f3f3f3;cursor:pointer;font-weight:600}
  .message{margin-top:12px;font-weight:700;text-align:center}
  .hint-box{margin-left:8px;font-weight:600;color:var(--text)}
  @media (max-width:520px){:root{--tile-size:48px}.tile{font-size:16px}}
</style>
</head>
<body>
  <div class="wrap">
    <div class="meta">
      <!-- Hint is hidden by default; Reveal hint button toggles it -->
      <div style="display:flex;align-items:center;gap:8px">
        <button class="btn" id="revealHintBtn">Reveal hint</button>
        <div id="hintBox" class="hint-box" aria-hidden="true" style="display:none"></div>
      </div>

      <div class="label">Difficulty: ${escapeHtml(String(difficulty ?? ""))}</div>

      <div style="margin-left:auto">
        <button class="btn" id="downloadBtn">Download HTML</button>
      </div>
    </div>

    <div id="board" class="board" aria-live="polite"></div>

    <div class="controls" id="controls">
      <button class="btn" id="submitBtn">Submit</button>
      <button class="btn" id="backBtn">Backspace</button>
      <button class="btn" id="clearBtn">Clear</button>
      <button class="btn" id="revealAnswerBtn">Reveal answer</button>
    </div>

    <div class="message" id="message" role="status" aria-live="polite"></div>

    <h3 style="text-align:center;margin-top:18px">Phoneme Keyboard</h3>
    <div id="keyboard" class="keyboard" aria-label="Phoneme keyboard"></div>
  </div>

<script>
(function(){
  const answer = ${answerJSON};
  const keyboard = ${keyboardJSON};
  const HINT = ${JSON.stringify(hint ?? "")};
  const MAX_ROWS = 6;
  let currentGuess = [];
  let guesses = [];
  let gameOver = false;

  const boardEl = document.getElementById('board');
  const messageEl = document.getElementById('message');
  const keyboardEl = document.getElementById('keyboard');
  const submitBtn = document.getElementById('submitBtn');
  const backBtn = document.getElementById('backBtn');
  const clearBtn = document.getElementById('clearBtn');
  const revealAnswerBtn = document.getElementById('revealAnswerBtn');
  const revealHintBtn = document.getElementById('revealHintBtn');
  const hintBox = document.getElementById('hintBox');
  const downloadBtn = document.getElementById('downloadBtn');

  function render() {
    boardEl.innerHTML = '';
    for (let r = 0; r < MAX_ROWS; r++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'row';
      const row = r < guesses.length ? guesses[r] : (r === guesses.length ? currentGuess : []);
      const isSubmitted = r < guesses.length;
      const evals = isSubmitted && row.length === answer.length ? evaluate(row) : [];
      for (let i = 0; i < answer.length; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        const sym = row[i] || '';
        tile.textContent = sym;
        if (evals[i]) tile.classList.add(evals[i]);
        rowEl.appendChild(tile);
      }
      boardEl.appendChild(rowEl);
    }
  }

  function evaluate(guess) {
    const res = Array(guess.length).fill(null);
    const copy = answer.slice();
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === answer[i]) { res[i] = 'correct'; copy[i] = null; }
    }
    for (let i = 0; i < guess.length; i++) {
      if (res[i]) continue;
      const idx = copy.indexOf(guess[i]);
      if (idx !== -1) { res[i] = 'present'; copy[idx] = null; }
      else res[i] = 'absent';
    }
    return res;
  }

  function addPhoneme(sym) {
    if (gameOver) return;
    if (currentGuess.length < answer.length) {
      currentGuess.push(sym);
      messageEl.textContent = '';
      render();
    }
  }

  function backspace() { if (gameOver) return; currentGuess.pop(); render(); }
  function clearGuess() { if (gameOver) return; currentGuess = []; render(); }

  function submitGuess() {
    if (gameOver) return;
    if (currentGuess.length !== answer.length) { messageEl.textContent = 'Please enter all phonemes.'; return; }
    guesses.push(currentGuess.slice());
    const correct = currentGuess.join('') === answer.join('');
    if (correct) { gameOver = true; messageEl.textContent = 'Correct! 🎉'; }
    else if (guesses.length >= MAX_ROWS) { gameOver = true; messageEl.textContent = 'No more guesses remaining. Answer: ' + answer.join(' '); }
    else { messageEl.textContent = 'Not quite. Try again.'; }
    currentGuess = []; render();
  }

  function revealAnswer() { gameOver = true; messageEl.textContent = 'Answer: ' + answer.join(' '); render(); }

  function revealHint() {
    if (!HINT) {
      hintBox.textContent = '(no hint provided)';
    } else {
      hintBox.textContent = HINT;
    }
    hintBox.style.display = 'block';
    hintBox.setAttribute('aria-hidden', 'false');
    revealHintBtn.disabled = true;
  }

  function initKeyboard() {
    keyboardEl.innerHTML = '';
    keyboard.forEach(sym => {
      const btn = document.createElement('button');
      btn.className = 'key';
      btn.textContent = sym;
      btn.onclick = () => addPhoneme(sym);
      keyboardEl.appendChild(btn);
    });
  }

  function initControls() {
    submitBtn.onclick = submitGuess;
    backBtn.onclick = backspace;
    clearBtn.onclick = clearGuess;
    revealAnswerBtn.onclick = revealAnswer;
    revealHintBtn.onclick = revealHint;
    downloadBtn.onclick = () => {
      const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wordle-${escapeHtml(english)}.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };
  }

  window.addEventListener('keydown', (e) => {
    if (gameOver) return;
    if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
    if (e.key === 'Enter') { e.preventDefault(); submitGuess(); return; }
    if (e.key.length === 1) {
      const k = keyboard.find(s => s === e.key);
      if (k) addPhoneme(k);
    }
  });

  initKeyboard();
  initControls();
  render();
})();
</script>
</body>
</html>`;
}
