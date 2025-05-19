"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaGlobe, FaChevronDown } from "react-icons/fa";
import { useTranslation } from "@/components/Context/TranslationContext";

const LanguageDropdown: React.FC = () => {
  const { currentLanguage, isTranslateReady, isTranslating, setLanguage, getLanguageName } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // List of available languages
  const languages = [
    { code: "es", name: "Español" },
    { code: "en", name: "English" },
    { code: "it", name: "Italiano" }
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage || !isTranslateReady || isTranslating) {
      setIsOpen(false);
      return;
    }
    
    await setLanguage(languageCode);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!isTranslateReady || isTranslating}
        className={`flex items-center gap-1 px-3 py-2 text-verde-oscuro rounded-md hover:bg-gray-100 transition duration-300 ${isTranslating ? 'opacity-70 cursor-wait' : 'opacity-100 cursor-pointer'}`}
        aria-label="Seleccionar idioma"
      >
        <FaGlobe size={18} />
        <span className="hidden sm:inline text-sm font-medium">{getLanguageName(currentLanguage)}</span>
        <FaChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute text-black right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${language.code === currentLanguage ? 'bg-gray-100 font-medium' : ''}`}
              disabled={isTranslating}
            >
              {language.name}
              {language.code === currentLanguage && (
                <span className="ml-2 text-verde-oscuro">✓</span>
              )}
            </button>
          ))}
          
          {isTranslating && (
            <div className="px-4 py-2 text-sm text-gray-500 italic">
              Traduciendo...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown; 