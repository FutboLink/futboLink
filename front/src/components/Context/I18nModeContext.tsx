"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type I18nMode = 'google-translate' | 'next-intl';

interface I18nModeContextType {
  mode: I18nMode;
  setMode: (mode: I18nMode) => void;
  isNextIntlEnabled: boolean;
  toggleMode: () => void;
}

const I18nModeContext = createContext<I18nModeContextType>({
  mode: 'google-translate',
  setMode: () => {},
  isNextIntlEnabled: false,
  toggleMode: () => {},
});

export const useI18nMode = () => useContext(I18nModeContext);

export const I18nModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<I18nMode>('google-translate');

  useEffect(() => {
    // Check localStorage for saved preference
    const savedMode = localStorage.getItem('i18n-mode') as I18nMode;
    if (savedMode && (savedMode === 'google-translate' || savedMode === 'next-intl')) {
      setModeState(savedMode);
    }
  }, []);

  const setMode = (newMode: I18nMode) => {
    setModeState(newMode);
    localStorage.setItem('i18n-mode', newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'google-translate' ? 'next-intl' : 'google-translate';
    setMode(newMode);
  };

  const isNextIntlEnabled = mode === 'next-intl';

  return (
    <I18nModeContext.Provider
      value={{
        mode,
        setMode,
        isNextIntlEnabled,
        toggleMode,
      }}
    >
      {children}
    </I18nModeContext.Provider>
  );
};

export default I18nModeContext;
