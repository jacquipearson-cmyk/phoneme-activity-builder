"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { darkMode } = useAccessibility();

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className={`navbar ${darkMode ? "dark-mode" : ""}`}>
      <div className="navbar-inner">

        {/* Website title */}
        <Link href="/" className="navbar-title" onClick={closeMenu}>
          Phoneme Activity Builder
        </Link>

        {/* Hamburger button */}
        <button
          className={`hamburger-button ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="navbar-menu">

            <Link href="/" onClick={closeMenu}>
              Home
            </Link>

            <Link href="/about" onClick={closeMenu}>
              About
            </Link>

            {/* Wordle creator */}
            <Link href="/wordle/create" onClick={closeMenu}>
              Create Wordle
            </Link>

            {/* Word Search creator */}
            <Link href="/wordsearch/create" onClick={closeMenu}>
              Create Word Search
            </Link>

            {/* Activities list */}
            <Link href="/activities" onClick={closeMenu}>
              Activities
            </Link>

            {/* Settings */}
            <Link href="/settings" onClick={closeMenu}>
              Settings
            </Link>

          </div>
        )}

      </div>
    </nav>
  );
}
