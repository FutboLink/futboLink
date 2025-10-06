"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaGlobe, FaChevronDown } from "react-icons/fa";
import { useI18nMode } from '@/components/Context/I18nModeContext';
import { getCurrentNextIntlLocale, setNextIntlLocale } from '@/utils/translationHelpers';

type Locale = 'es' | 'en' | 'it';

const NextIntlLanguageSelector: React.FC = () => {
  const { isNextIntlEnabled } = useI18nMode();
  const [locale, setLocale] = useState<Locale>('es');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar idioma guardado
  useEffect(() => {
    setLocale(getCurrentNextIntlLocale());

    // Escuchar cambios de idioma
    const handleLocaleChange = (event: CustomEvent) => {
      setLocale(event.detail);
    };

    window.addEventListener('nextintl-locale-change', handleLocaleChange as EventListener);
    
    return () => {
      window.removeEventListener('nextintl-locale-change', handleLocaleChange as EventListener);
    };
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setNextIntlLocale(newLocale);
  };

  // List of available languages
  const languages = [
    { code: "es" as Locale, name: "Español", flag: "🇪🇸" },
    { code: "en" as Locale, name: "English", flag: "🇺🇸" },
    { code: "it" as Locale, name: "Italiano", flag: "🇮🇹" }
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isNextIntlEnabled) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNextIntlEnabled]);
  
  // Solo mostrar si Next-Intl está habilitado
  if (!isNextIntlEnabled) {
    return null;
  }
  
  const handleLanguageChange = (languageCode: Locale) => {
    if (languageCode === locale) {
      setIsOpen(false);
      return;
    }
    
    changeLocale(languageCode);
    setIsOpen(false);
  };
  
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === locale) || languages[0];
  };
  
  const currentLang = getCurrentLanguage();
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-verde-oscuro rounded-md hover:bg-gray-100 transition duration-300 border border-gray-200"
        aria-label="Seleccionar idioma Next-Intl"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden sm:inline text-sm font-medium">{currentLang.code.toUpperCase()}</span>
        <FaChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute text-black right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
            Next-Intl Selector
          </div>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-3 ${language.code === locale ? 'bg-green-50 font-medium' : ''}`}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
              {language.code === locale && (
                <span className="ml-auto text-green-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NextIntlLanguageSelector;
