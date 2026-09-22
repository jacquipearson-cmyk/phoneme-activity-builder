// src/app/layout.tsx
// -------------------------------------------------------------
// Root Layout (App Router)
//
// formatting + dark-mode class fix
//s
// 
// layout is now stable. handles:
// - reading cookies server-side (so hydration matches)
// - passing initial accessibility settings to the provider
// - applying dark-mode class directly to <body>
// - wrapping everything in Navbar + Footer
//
// 
// -------------------------------------------------------------

import type { ReactNode } from "react";
import { headers } from "next/headers";
import type { Metadata } from "next";

import "./globals.css";

import { AccessibilityProvider } from "@/context/AccessibilityContext";
import AccessibilityStyles from "@/components/AccessibilityStyles";
import BodyWrapper from "@/components/BodyWrapper";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Phoneme Activity Builder",
  description: "Phoneme-based classroom activity builder",
};

// -------------------------------------------------------------
// Cookie parsing (server-side)
// NOTE: This is intentionally simple. No need for fancy libs.
// -------------------------------------------------------------
function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const idx = c.indexOf("=");
        if (idx === -1) return [c, ""];
        const name = c.slice(0, idx);
        const val = decodeURIComponent(c.slice(idx + 1));
        return [name, val];
      })
  );
}

// -------------------------------------------------------------
// Root Layout
// -------------------------------------------------------------
export default async function RootLayout({ children }: { children: ReactNode }) {
  // Server-side cookie read (App Router requirement)
  const hdrs = await headers();
  const cookieHeader = hdrs.get("cookie") ?? "";
  const cookies = parseCookies(cookieHeader);

  // Initial values passed to AccessibilityProvider
  // NOTE: Keep these as strings; provider handles conversion.
  const initialFont = (cookies["phoneme-font"] as string) ?? "Calibri";
  const initialColourScheme = (cookies["phoneme-colours"] as string) ?? "default";
  const initialDarkMode = String(cookies["phoneme-dark-mode"] ?? "false") === "true";

  return (
    <html lang="en">
      {/* NOTE: dark-mode class is applied directly here so globals.css can respond */}
      <body className={initialDarkMode ? "dark-mode" : ""}>
        <AccessibilityProvider
          initialFont={initialFont}
          initialColourScheme={initialColourScheme}
          initialDarkMode={initialDarkMode}
        >
          {/* Injects CSS variables based on provider state */}
          <AccessibilityStyles />

          {/* Wraps page content + ensures consistent spacing */}
          <BodyWrapper>
            <Navbar />

            {/* Main content area */}
            <main style={{ minHeight: "calc(100vh - 160px)" }}>
              {children}
            </main>

            <Footer />
          </BodyWrapper>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
