// src/app/settings/page.tsx
// -------------------------------------------------------------
// Accessibility Settings Page
//
// redo 5: fixed formatting — do on others later
//
// NOTE TO SELF:
// Page was only changed with UI overhual
// Cleanup is mostly formatting + consistency with the newer pages.aka the ui
// 
//
// No DB logic here — just UI + context state.
// -------------------------------------------------------------



"use client";

import { useAccessibility } from "@/context/AccessibilityContext";

export default function SettingsPage() {
  // Pull settings from the global accessibility context
  // NOTE: hydrated prevents the weird flash on first load
  const {
    font,
    colourScheme,
    darkMode,
    setFont,
    setColourScheme,
    setDarkMode,
    hydrated,
  } = useAccessibility();


  // Loading state while context hydrates
  if (!hydrated) {
    return (
      <main className="settings-page">
        <div className="settings-container">
          <p>Loading settings…</p>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // Render UI
  // -------------------------------------------------------------
  return (
    <main className="settings-page">
      <div className="settings-container">

        <h1 className="text-4xl font-bold mb-6">Accessibility Settings</h1>

        <p className="mb-8 max-w-2xl">
          Customise fonts, colour schemes and dark mode to improve readability
          across Wordle and Word Search activities.
        </p>

        
        <div className="settings-card p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Font</h2>

          <label className="settings-label">
            Choose a font
            <select
              className="settings-select"
              value={font}
              onChange={(e) => setFont(e.target.value as any)}
            >
              <option value="Calibri">Calibri</option>
              <option value="Arial">Arial</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
            </select>
          </label>
        </div>


        {/* ---------------------------------------------------------
            Colour Scheme
            NOTE: This preview is duplicated in Activities page.
            Pretty sure its just the 2 of them? will check later
           --------------------------------------------------------- */}
        <div className="settings-card p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Colour Scheme</h2>

          <label className="settings-label">
            Select colour mode
            <select
              className="settings-select"
              value={colourScheme}
              onChange={(e) => setColourScheme(e.target.value as any)}
            >
              <option value="default">Default</option>
              <option value="saturated">High Saturation</option>
              <option value="colourblind">Colour‑blind Friendly</option>
            </select>
          </label>

          {/* Colour preview */}
          <div className="mt-6">
            <p className="font-medium mb-2">Preview:</p>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-6 h-6 rounded"
                  style={{ backgroundColor: "var(--correct)" }}
                ></span>
                <span>Correct</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-6 h-6 rounded"
                  style={{ backgroundColor: "var(--present)" }}
                ></span>
                <span>Present</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-6 h-6 rounded"
                  style={{ backgroundColor: "var(--incorrect)" }}
                ></span>
                <span>Incorrect</span>
              </div>
            </div>
          </div>
        </div>


        <div className="settings-card p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Dark Mode</h2>

          <label className="settings-label flex items-center gap-3">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            Enable Dark Mode
          </label>
        </div>



        {/* ---------------------------------------------------------
            Info Box
            NOTE: Could expand this  later 
           --------------------------------------------------------- */}
        <div className="settings-card p-6 max-w-xl">
          <h2 className="text-2xl font-semibold mb-3">About Accessibility</h2>
          <p>
            These settings apply across all activities. Colour schemes update
            the Wordle and Word Search tiles, ensuring they remain readable in
            different environments and for different visual needs.
          </p>
        </div>

      </div>
    </main>
  );
}
