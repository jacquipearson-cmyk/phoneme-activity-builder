// src/components/BodyWrapper.tsx
"use client";

import { useEffect } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function BodyWrapper({ children }: { children: React.ReactNode }) {
  const { font, colourScheme, darkMode } = useAccessibility();

  useEffect(() => {
    // Build the classes we want present
    const fontCls = `font-${String(font).replace(/\s+/g, "-").toLowerCase()}`;
    const colourCls = `colour-${colourScheme}`;
    const darkCls = "dark-mode";

    // Add classes
    document.body.classList.add(fontCls, colourCls);
    if (darkMode) document.body.classList.add(darkCls);
    else document.body.classList.remove(darkCls);

    // Cleanup: remove the classes we added when unmounting
    return () => {
      document.body.classList.remove(fontCls, colourCls, darkCls);
    };
  }, [font, colourScheme, darkMode]);

  return <>{children}</>;
}
