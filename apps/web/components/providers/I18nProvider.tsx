"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../lib/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read user's language preference from localStorage if available
    try {
      const saved = localStorage.getItem("riikon_lang");
      if (saved && (saved === "vi" || saved === "en")) {
        i18n.changeLanguage(saved);
      } else {
        // Migration from old serene_productivity_settings
        const oldSettings = localStorage.getItem("serene_productivity_settings");
        if (oldSettings) {
          const parsed = JSON.parse(oldSettings);
          if (parsed.language) {
            i18n.changeLanguage(parsed.language);
            localStorage.setItem("riikon_lang", parsed.language);
          }
        }
      }
    } catch (e) {}

    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by rendering children without translations first or rendering a loading state
    // For i18next, returning children is usually fine as long as we use the default language for SSR
    return <>{children}</>;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
