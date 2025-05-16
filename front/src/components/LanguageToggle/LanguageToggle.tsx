"use client";

import React from "react";
import { FaGlobe } from "react-icons/fa";
import { useTranslation } from "@/components/Context/TranslationContext";

interface LanguageToggleProps {
  className?: string;
  position?: "fixed" | "absolute" | "relative";
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  className = "", 
  position = "fixed" 
}) => {
  const { currentLanguage, isTranslateReady, isTranslating, toggleLanguage } = useTranslation();

  const baseClasses = "bg-white text-black p-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-200 transition duration-300 z-50";
  
  // Position classes
  const positionClasses = position === "fixed" 
    ? "fixed top-4 right-4 mt-28" 
    : position === "absolute" 
      ? "absolute top-4 right-4" 
      : "";
  
  // State classes
  const stateClasses = isTranslating 
    ? "opacity-70 cursor-wait" 
    : "opacity-100 cursor-pointer";

  return (
    <button
      onClick={toggleLanguage}
      disabled={!isTranslateReady || isTranslating}
      className={`${baseClasses} ${positionClasses} ${stateClasses} ${className}`}
      aria-label={`Cambiar a ${currentLanguage === "es" ? "italiano" : "español"}`}
    >
      <FaGlobe size={20} />
      <span>
        {isTranslating 
          ? "Traduciendo..." 
          : currentLanguage === "es" 
            ? "Italiano" 
            : "Español"}
      </span>
    </button>
  );
};

export default LanguageToggle; 