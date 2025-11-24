'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { i18n } from '@/lib/i18n';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
  availableLanguages: Array<{ code: string; name: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [, forceUpdate] = useState({});

  // Initialize language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') || 'en';
      setCurrentLanguage(savedLanguage);
      i18n.setLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = useCallback((code: string) => {
    setCurrentLanguage(code);
    i18n.setLanguage(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', code);
    }
    // Force re-render of all consumers
    forceUpdate({});
  }, []);

  // Memoize the translation function to depend on currentLanguage
  const t = useCallback((key: string) => {
    // This will re-compute when currentLanguage changes
    return i18n.t(key);
  }, [currentLanguage]);

  // Memoize available languages
  const availableLanguages = useMemo(() => {
    return i18n.getLanguages().map(lang => ({
      code: lang.code,
      name: lang.name
    }));
  }, []);

  const value = useMemo(() => ({
    currentLanguage,
    setLanguage,
    t,
    availableLanguages
  }), [currentLanguage, setLanguage, t, availableLanguages]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

