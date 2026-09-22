//add commets later
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";

type FontOption = "Calibri" | "Arial" | "Comic Sans MS";
type ColourScheme = "default" | "saturated" | "colourblind";

type AccessibilitySettings = {
  font: FontOption;
  colourScheme: ColourScheme;
  darkMode: boolean;
  difficulty: 3 | 4 | 5;          
};

type AccessibilityContextType = AccessibilitySettings & {
  hydrated: boolean;
  setFont: (font: FontOption) => void;
  setColourScheme: (scheme: ColourScheme) => void;
  setDarkMode: (enabled: boolean) => void;
  setDifficulty: (d: 3 | 4 | 5) => void;   
  getSettingsForHTML: () => {
    font: FontOption;
    colourScheme: ColourScheme;
    darkMode: boolean;
    difficulty: 3 | 4 | 5;                 
  };
};

const defaultSettings: AccessibilitySettings = {
  font: "Calibri",
  colourScheme: "default",
  darkMode: false,
  difficulty: 3,                            
};

const AccessibilityContext =
  createContext<AccessibilityContextType | undefined>(undefined);

// Type guards
function isFontOption(v: unknown): v is FontOption {
  return v === "Calibri" || v === "Arial" || v === "Comic Sans MS";
}
function isColourScheme(v: unknown): v is ColourScheme {
  return v === "default" || v === "saturated" || v === "colourblind";
}
function isDifficulty(v: unknown): v is 3 | 4 | 5 {   
  return v === 3 || v === 4 || v === 5;
}

export function AccessibilityProvider({
  children,
  initialFont,
  initialColourScheme,
  initialDarkMode,
}: {
  children: ReactNode;
  initialFont?: string;
  initialColourScheme?: string;
  initialDarkMode?: boolean;
}) {
  // Coerce initial values
  const coercedInitialFont: FontOption = isFontOption(initialFont)
    ? initialFont
    : defaultSettings.font;

  const coercedInitialColourScheme: ColourScheme = isColourScheme(initialColourScheme)
    ? initialColourScheme
    : defaultSettings.colourScheme;

  const coercedInitialDarkMode: boolean =
    typeof initialDarkMode === "boolean" ? initialDarkMode : defaultSettings.darkMode;

  // State
  const [font, setFontState] = useState<FontOption>(coercedInitialFont);
  const [colourScheme, setColourSchemeState] =
    useState<ColourScheme>(coercedInitialColourScheme);
  const [darkMode, setDarkModeState] =
    useState<boolean>(coercedInitialDarkMode);

  const [difficulty, setDifficultyState] = useState<3 | 4 | 5>(3);   // ⭐ ADDED

  const [hydrated, setHydrated] = useState(false);

  // Hydrate from cookies
  useEffect(() => {
    try {
      const cookies = document.cookie ? document.cookie.split("; ") : [];

      const getCookie = (name: string) => {
        const cookie = cookies.find((item) => item.startsWith(name + "="));
        return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
      };

      const savedFont = getCookie("phoneme-font");
      const savedColours = getCookie("phoneme-colours");
      const savedDarkMode = getCookie("phoneme-dark-mode");
      const savedDifficulty = Number(getCookie("phoneme-difficulty"));   // ⭐ ADDED

      if (isFontOption(savedFont)) setFontState(savedFont);
      if (isColourScheme(savedColours)) setColourSchemeState(savedColours);
      if (savedDarkMode === "true") setDarkModeState(true);
      if (isDifficulty(savedDifficulty)) setDifficultyState(savedDifficulty); // ⭐ ADDED
    } catch {
      // ignore cookie errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // Setters
  function setFont(newFont: FontOption) {
    setFontState(newFont);
    document.cookie = `phoneme-font=${encodeURIComponent(newFont)}; path=/; max-age=31536000`;
  }

  function setColourScheme(newScheme: ColourScheme) {
    setColourSchemeState(newScheme);
    document.cookie = `phoneme-colours=${newScheme}; path=/; max-age=31536000`;
  }

  function setDarkMode(enabled: boolean) {
    setDarkModeState(enabled);
    document.cookie = `phoneme-dark-mode=${enabled}; path=/; max-age=31536000`;
  }

  function setDifficulty(d: 3 | 4 | 5) {     
    setDifficultyState(d);
    document.cookie = `phoneme-difficulty=${d}; path=/; max-age=31536000`;
  }

  const value = useMemo(
    () => ({
      font,
      colourScheme,
      darkMode,
      difficulty,              
      hydrated,
      setFont,
      setColourScheme,
      setDarkMode,
      setDifficulty,           
      getSettingsForHTML: () => ({
        font,
        colourScheme,
        darkMode,
        difficulty,            
      }),
    }),
    [font, colourScheme, darkMode, difficulty, hydrated]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used inside AccessibilityProvider");
  }
  return context;
}
