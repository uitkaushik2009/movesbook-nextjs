/**
 * Language Settings Constants
 * Extracted from LanguageSettings.tsx
 */

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
}

export interface TranslationKey {
  key: string;
  category: string;
  descriptionEn: string;
  values: Record<string, string>;
  isDeleted?: boolean;
}

export type LanguageTab = 'official' | 'settings' | 'texts';

/**
 * Default active languages on first load
 */
export const DEFAULT_ACTIVE_LANGUAGES = ['en', 'fr', 'de', 'it', 'es', 'hi'];

/**
 * All available languages with metadata
 */
export const ALL_LANGUAGES: Omit<Language, 'isActive'>[] = [
  { id: '1', code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { id: '2', code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { id: '3', code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { id: '4', code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { id: '5', code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { id: '6', code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { id: '7', code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { id: '8', code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { id: '9', code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { id: '10', code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { id: '11', code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { id: '12', code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
];

/**
 * Map language codes to flag image filenames
 */
export const FLAG_FILES: Record<string, string> = {
  'en': 'en.png',
  'fr': 'fr.png',
  'de': 'de.png',
  'it': 'it.png',
  'es': 'es.png',
  'pt': 'por.png',
  'ru': 'rus.png',
  'hi': 'ind.png',
  'zh': 'chin.png',
  'ar': 'arab.png',
  'ja': 'jap.png',
  'id': 'id.png'
};

/**
 * Default column widths for Tab 2 (Settings) table
 */
export const DEFAULT_COLUMN_WIDTHS = {
  srNo: 60,
  varName: 200,
  en: 150,
  it: 150,
  fr: 150,
  de: 150,
  es: 150,
  pt: 150,
  ru: 150,
  hi: 150,
  ja: 150,
  id: 150,
  zh: 150,
  ar: 150,
  actions: 120
};

/**
 * Pagination constants
 */
export const ITEMS_PER_PAGE = 10;

/**
 * Long text threshold (characters)
 */
export const LONG_TEXT_THRESHOLD = 100;

/**
 * Translation categories
 */
export const TRANSLATION_CATEGORIES = ['system', 'social', 'management'] as const;
export type TranslationCategory = typeof TRANSLATION_CATEGORIES[number];

/**
 * Search field options for Tab 1
 */
export const SEARCH_FIELD_OPTIONS = [
  { value: 'variable_name', label: 'Variable Name' },
  { value: 'all', label: 'All Fields' }
] as const;

/**
 * Helper: Get flag image component props
 */
export function getFlagImageSrc(code: string): string {
  const flagFile = FLAG_FILES[code] || 'en.png';
  return `/flags/${flagFile}`;
}

/**
 * Helper: Get flag size classes
 */
export function getFlagSizeClass(size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  return sizeClasses[size];
}

/**
 * Helper: Create language list with active status
 */
export function createLanguageList(activeLanguageCodes: string[]): Language[] {
  return ALL_LANGUAGES.map(lang => ({
    ...lang,
    isActive: activeLanguageCodes.includes(lang.code)
  }));
}

/**
 * Helper: Sort languages by saved order
 */
export function sortLanguagesByOrder(
  languages: Language[], 
  languageOrder: string[]
): Language[] {
  if (languageOrder.length === 0) return languages;
  
  return [...languages].sort((a, b) => {
    const indexA = languageOrder.indexOf(a.code);
    const indexB = languageOrder.indexOf(b.code);
    
    // If both are in the saved order, use that order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only A is in saved order, it comes first
    if (indexA !== -1) return -1;
    // If only B is in saved order, it comes first
    if (indexB !== -1) return 1;
    // If neither is in saved order, maintain original order
    return 0;
  });
}

/**
 * Helper: Filter translation keys for long texts
 */
export function filterLongTexts(keys: TranslationKey[]): TranslationKey[] {
  return keys.filter((key) => {
    const hasLongText = Object.values(key.values).some(val => 
      val && val.length > LONG_TEXT_THRESHOLD
    );
    return hasLongText;
  });
}

/**
 * Helper: Filter keys by category
 */
export function filterByCategory(
  keys: TranslationKey[], 
  category: TranslationCategory
): TranslationKey[] {
  // For 'system' category, include both 'system' and 'general' categories
  if (category === 'system') {
    return keys.filter(key => 
      key.category === 'system' || key.category === 'general'
    );
  }
  return keys.filter(key => key.category === category);
}

/**
 * Helper: Filter keys by search query
 */
export function filterBySearch(
  keys: TranslationKey[], 
  searchQuery: string
): TranslationKey[] {
  if (!searchQuery.trim()) return keys;
  
  const searchLower = searchQuery.toLowerCase();
  return keys.filter((key) => {
    return key.key.toLowerCase().includes(searchLower) ||
           Object.values(key.values).some(val => 
             val && val.toLowerCase().includes(searchLower)
           );
  });
}

