"use client";

import { useState, useEffect } from 'react';
import { useI18nMode } from '@/components/Context/I18nModeContext';

// Importar los mensajes desde los archivos JSON
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';
import itMessages from '@/messages/it.json';

// Mensajes desde archivos JSON
const messages = {
  es: esMessages,
  en: enMessages,
  it: itMessages
};

type Locale = 'es' | 'en' | 'it';
type MessageKey = keyof typeof esMessages;

export const useNextIntlTranslations = (namespace: MessageKey) => {
  const { isNextIntlEnabled } = useI18nMode();
  const [locale, setLocale] = useState<Locale>('es');

  useEffect(() => {
    // Obtener idioma guardado o detectar del navegador
    const savedLocale = localStorage.getItem('nextintl-locale') as Locale;
    if (savedLocale && ['es', 'en', 'it'].includes(savedLocale)) {
      setLocale(savedLocale);
    } else {
      // Detectar idioma del navegador con fallbacks
      const detectBrowserLanguage = (): Locale => {
        // Obtener idiomas preferidos del navegador
        const languages = navigator.languages || [navigator.language];
        
        for (const lang of languages) {
          const langCode = lang.substring(0, 2).toLowerCase();
          if (['es', 'en', 'it'].includes(langCode)) {
            return langCode as Locale;
          }
        }
        
        // Fallback a español
        return 'es';
      };
      
      const detectedLang = detectBrowserLanguage();
      setLocale(detectedLang);
      
      // Guardar la detección automática
      localStorage.setItem('nextintl-locale', detectedLang);
    }

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
    setLocale(newLocale);
    localStorage.setItem('nextintl-locale', newLocale);
    // Disparar evento para notificar el cambio
    window.dispatchEvent(new CustomEvent('nextintl-locale-change', { detail: newLocale }));
  };

  const t = (key: string) => {
    if (!isNextIntlEnabled) {
      return key; // Fallback si next-intl no está habilitado
    }

    try {
      const namespaceMessages = messages[locale][namespace] as any;
      return namespaceMessages[key] || key;
    } catch {
      return key;
    }
  };

  return {
    t,
    locale,
    changeLocale,
    isNextIntlEnabled
  };
};
