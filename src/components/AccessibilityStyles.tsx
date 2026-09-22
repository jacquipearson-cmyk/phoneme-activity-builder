"use client";

import { useEffect } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function AccessibilityStyles() {

    const {
        font,
        colourScheme,
        darkMode,
        hydrated,
    } = useAccessibility();





    // --------------------
    // Apply accessibility styles
    // --------------------

    // DO NOT APPLY STYLES UNTIL COOKIES ARE LOADED!!!!
    // hydrated check stops the page from applying the default
    // settings before the saved accessibility settings have loaded
    useEffect(() => {

        if (!hydrated) return;

        // Uses the root html element so the css variables can be used
        // throughout the whole app
        const root = document.documentElement;


        // --------------------
        // Font
        // --------------------
        if (font === "Calibri") {
            root.style.setProperty("--app-font", "Calibri, Arial, sans-serif");
        }

        if (font === "Arial") {
            root.style.setProperty("--app-font", "Arial, sans-serif");
        }

        if (font === "Comic Sans MS") {
            root.style.setProperty("--app-font", '"Comic Sans MS", cursive');
        }





        // --------------------
        // Light mode
        // --------------------

        if (!darkMode) {
            root.style.setProperty("--background", "#ffffff");
            root.style.setProperty("--foreground", "#222222");
            root.style.setProperty("--surface", "#f5f5f5");
            root.style.setProperty("--border", "#cccccc");
        }



        // --------------------
        // Dark mode
        // --------------------
        if (darkMode) {
            root.style.setProperty("--background", "#3a3a3a");
            root.style.setProperty("--foreground", "#ffffff");
            root.style.setProperty("--surface", "#4a4a4a");
            root.style.setProperty("--border", "#777777");
        }






        // --------------------
        // Default colours
        // --------------------

        // normal game colours
        // "correct" = correct answer, "present" = found but not in the
        // right place, and "incorrect" = not found.           
        //  ***Note for later need to update other page so duplacates are ignored!!

        if (colourScheme === "default") {
            root.style.setProperty("--correct", "#2D9B2B");
            root.style.setProperty("--present", "#FFD700");
            root.style.setProperty("--incorrect", "#E12C2C");
            root.style.setProperty("--word-search-found", "#2D9B2B");
            root.style.setProperty("--word-search-selected", "#FFD700");
        }


        // --------------------
        // High saturation
        // --------------------

        // Uses stronger versions of colours 
        if (colourScheme === "saturated") {
            root.style.setProperty("--correct", "#00B300");
            root.style.setProperty("--present", "#FFFF00");
            root.style.setProperty("--incorrect", "#FF0000");
            root.style.setProperty("--word-search-found", "#00B300");
            root.style.setProperty("--word-search-selected", "#FFFF00");
        }


        // --------------------
        // Colour-blind friendly (Okabe–Ito palette)
        // --------------------

        
        // colours that are best for most colour blindness (might chnage saturations later)
        if (colourScheme === "colourblind") {
            root.style.setProperty("--correct", "#009E73");
            root.style.setProperty("--present", "#56B4E9");
            root.style.setProperty("--incorrect", "#D55E00");
            root.style.setProperty("--word-search-found", "#56B4E9");
            root.style.setProperty("--word-search-selected", "#D55E00");
        }

    // Re-runs the styles when setting change
    // Note* Hydrated fixes the colour probkem for loading them!
    }, [font, colourScheme, darkMode, hydrated]);



    return null;
}