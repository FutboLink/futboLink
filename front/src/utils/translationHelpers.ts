// Helper para obtener el idioma actual de Next-Intl
export const getCurrentNextIntlLocale = (): 'es' | 'en' | 'it' => {
  if (typeof window === 'undefined') return 'es';
  
  const savedLocale = localStorage.getItem('nextintl-locale') as 'es' | 'en' | 'it';
  return savedLocale && ['es', 'en', 'it'].includes(savedLocale) ? savedLocale : 'es';
};

// Helper para cambiar el idioma de Next-Intl
export const setNextIntlLocale = (locale: 'es' | 'en' | 'it') => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('nextintl-locale', locale);
  // Disparar evento personalizado para notificar el cambio
  window.dispatchEvent(new CustomEvent('nextintl-locale-change', { detail: locale }));
};
