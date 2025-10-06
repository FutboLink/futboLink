// Helper para obtener el idioma actual de Next-Intl
export const getCurrentNextIntlLocale = (): 'es' | 'en' | 'it' => {
  if (typeof window === 'undefined') return 'es';
  
  const savedLocale = localStorage.getItem('nextintl-locale') as 'es' | 'en' | 'it';
  if (savedLocale && ['es', 'en', 'it'].includes(savedLocale)) {
    return savedLocale;
  }
  
  // Detectar idioma del navegador si no hay guardado
  const detectBrowserLanguage = (): 'es' | 'en' | 'it' => {
    const languages = navigator.languages || [navigator.language];
    
    for (const lang of languages) {
      const langCode = lang.substring(0, 2).toLowerCase();
      if (['es', 'en', 'it'].includes(langCode)) {
        return langCode as 'es' | 'en' | 'it';
      }
    }
    
    return 'es'; // Fallback
  };
  
  const detectedLang = detectBrowserLanguage();
  // Guardar la detección para futuras cargas
  localStorage.setItem('nextintl-locale', detectedLang);
  return detectedLang;
};

// Helper para cambiar el idioma de Next-Intl
export const setNextIntlLocale = (locale: 'es' | 'en' | 'it') => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('nextintl-locale', locale);
  // Disparar evento personalizado para notificar el cambio
  window.dispatchEvent(new CustomEvent('nextintl-locale-change', { detail: locale }));
};
