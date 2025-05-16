"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { 
  loadGoogleTranslateScript, 
  initGoogleTranslate, 
  changeLanguage, 
  addTranslateStyles, 
  getCurrentLanguage 
} from "@/services/TranslationService";

interface TranslationContextType {
  currentLanguage: string;
  isTranslateReady: boolean;
  isTranslating: boolean;
  toggleLanguage: () => Promise<void>;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLanguage: "es",
  isTranslateReady: false,
  isTranslating: false,
  toggleLanguage: async () => {},
});

export const useTranslation = () => useContext(TranslationContext);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        const storedLanguage = localStorage.getItem('preferredLanguage');
        
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
      } catch (error) {
        console.error("Error setting up translation:", error);
      }
    };

    setupTranslation();
  }, []);

  const toggleLanguage = async () => {
    if (!isTranslateReady || isTranslating) {
      return;
    }

    setIsTranslating(true);
    
    try {
      const newLanguage = currentLanguage === "es" ? "it" : "es";
      const success = await changeLanguage(newLanguage);
      
      if (success) {
        setCurrentLanguage(newLanguage);
        // Store the language preference
        localStorage.setItem('preferredLanguage', newLanguage);
      } else {
        console.error("Failed to change language");
      }
    } catch (error) {
      console.error("Error toggling language:", error);
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
        toggleLanguage,
      }}
    >
      <div id="google_translate_element" className="hidden"></div>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext; 