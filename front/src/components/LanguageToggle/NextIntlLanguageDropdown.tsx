"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaGlobe, FaChevronDown } from "react-icons/fa";
import { useNextIntlTranslations } from '@/hooks/useNextIntlTranslations';

type Locale = 'es' | 'en' | 'it';

const NextIntlLanguageDropdown: React.FC = () => {
  const { t, locale, changeLocale, isNextIntlEnabled } = useNextIntlTranslations('language');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // List of available languages
  const languages = [
    { code: "es" as Locale, name: t('spanish') },
    { code: "en" as Locale, name: t('english') },
    { code: "it" as Locale, name: t('italian') }
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
  
  const handleLanguageChange = (languageCode: Locale) => {
    if (languageCode === locale) {
      setIsOpen(false);
      return;
    }
    
    changeLocale(languageCode);
    setIsOpen(false);
  };
  
  const getCurrentLanguageName = () => {
    return languages.find(lang => lang.code === locale)?.name || t('spanish');
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-verde-oscuro rounded-md hover:bg-gray-100 transition duration-300"
        aria-label={t('selectLanguage')}
      >
        <FaGlobe size={18} />
        <span className="hidden sm:inline text-sm font-medium">{getCurrentLanguageName()}</span>
        <FaChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute text-black right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${language.code === locale ? 'bg-gray-100 font-medium' : ''}`}
            >
              {language.name}
              {language.code === locale && (
                <span className="ml-2 text-verde-oscuro">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NextIntlLanguageDropdown;
