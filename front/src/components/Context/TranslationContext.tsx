"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import {
  loadGoogleTranslateScript,
  initGoogleTranslate,
  changeLanguage,
  addTranslateStyles,
  getCurrentLanguage,
  getLanguageName,
} from "@/services/TranslationService";

interface TranslationContextType {
  currentLanguage: string;
  isTranslateReady: boolean;
  isTranslating: boolean;
  setLanguage: (language: string) => Promise<void>;
  getLanguageName: (code: string) => string;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLanguage: "es",
  isTranslateReady: false,
  isTranslating: false,
  setLanguage: async () => {},
  getLanguageName: () => "",
});

export const useTranslation = () => useContext(TranslationContext);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState("es");
  const [isTranslateReady, setIsTranslateReady] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // Initialize translation service
    const setupTranslation = async () => {
      try {
        // Add styles to hide Google Translate elements
        addTranslateStyles();

        // Load Google Translate script
        await loadGoogleTranslateScript();

        // Initialize Google Translate
        await initGoogleTranslate();

        // Check if we have a stored language preference
        const storedLanguage = localStorage.getItem("preferredLanguage");

        // Check if we already have a language set by Google Translate
        const detectedLanguage = getCurrentLanguage();

        // Use stored preference, detected language, or default to Spanish
        const initialLanguage = storedLanguage || detectedLanguage || "es";
        setCurrentLanguage(initialLanguage);

        // If the current language is not Spanish, make sure it's applied
        if (initialLanguage !== "es") {
          await changeLanguage(initialLanguage);
        }

        setIsTranslateReady(true);

        // Apply styles again after everything is initialized
        setTimeout(() => {
          addTranslateStyles();
        }, 500);
      } catch (error) {
        console.error("Error setting up translation:", error);
      }
    };

    setupTranslation();

    // Re-apply styles whenever window is resized (can trigger Google Translate to reappear)
    const handleResize = () => {
      addTranslateStyles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Periodically check and re-apply styles to ensure Google widget stays hidden
  useEffect(() => {
    const interval = setInterval(() => {
      addTranslateStyles();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const setLanguage = async (language: string) => {
    if (!isTranslateReady || isTranslating) {
      return;
    }

    setIsTranslating(true);

    try {
      const success = await changeLanguage(language);

      if (success) {
        setCurrentLanguage(language);
        // Store the language preference
        localStorage.setItem("preferredLanguage", language);

        // Re-apply styles to hide Google elements that might reappear
        setTimeout(() => {
          addTranslateStyles();
        }, 300);
      } else {
        console.error("Failed to change language");
      }
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <TranslationContext.Provider
      value={{
        currentLanguage,
        isTranslateReady,
        isTranslating,
        setLanguage,
        getLanguageName,
      }}
    >
      <div
        id="google_translate_element"
        className="hidden"
        style={{
          display: "none",
          visibility: "hidden",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
      ></div>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;
