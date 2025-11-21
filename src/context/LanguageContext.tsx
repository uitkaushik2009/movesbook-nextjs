'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface LanguageShortText {
  key: string;
  value: string;
}

interface LanguageLongText {
  key: string;
  value: string;
  description: string;
}

interface Language {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  shortTexts: LanguageShortText[];
  longTexts: LanguageLongText[];
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string, defaultValue?: string) => string;
  tLong: (key: string, defaultValue?: string) => string;
  languages: Language[];
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Default English translations (fallback)
const DEFAULT_TRANSLATIONS: Record<string, string> = {
  // Common UI
  'add_workout': 'Add Workout',
  'edit_moveframe': 'Edit Moveframe',
  'delete_microlap': 'Delete Microlap',
  'save_changes': 'Save Changes',
  'cancel': 'Cancel',
  'confirm': 'Confirm',
  'loading': 'Loading...',
  
  // Workout specific
  'workout_planned': 'Workout Planned',
  'workout_completed': 'Workout Completed',
  'add_moveframe': 'Add Moveframe',
  'moveframe_details': 'Moveframe Details',
  
  // Settings
  'settings_backgrounds': 'Backgrounds & Colors',
  'settings_tools': 'Tools Settings',
  'settings_favourites': 'Favourites',
  'settings_my_best': 'My Best',
  'settings_languages': 'Languages',
  
  // More translations will be added as we develop...
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [shortTexts, setShortTexts] = useState<Record<string, string>>(DEFAULT_TRANSLATIONS);
  const [longTexts, setLongTexts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [currentLanguage]);

  const loadLanguages = async () => {
    try {
      const response = await fetch('/api/languages');
      if (response.ok) {
        const data = await response.json();
        setLanguages(data);
      }
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const loadTranslations = async () => {
    setIsLoading(true);
    try {
      const [shortResponse, longResponse] = await Promise.all([
        fetch(`/api/languages/${currentLanguage}/short-texts`),
        fetch(`/api/languages/${currentLanguage}/long-texts`)
      ]);

      if (shortResponse.ok) {
        const shortData = await shortResponse.json();
        setShortTexts({ ...DEFAULT_TRANSLATIONS, ...shortData });
      }

      if (longResponse.ok) {
        const longData = await longResponse.json();
        setLongTexts(longData);
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key: string, defaultValue?: string): string => {
    return shortTexts[key] || defaultValue || key;
  };

  const tLong = (key: string, defaultValue?: string): string => {
    return longTexts[key] || defaultValue || key;
  };

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    // Save to user preferences
    localStorage.setItem('preferredLanguage', lang);
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      t,
      tLong,
      languages,
      isLoading
    }}>
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