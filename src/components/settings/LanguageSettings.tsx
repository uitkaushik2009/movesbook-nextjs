'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Globe, Settings as SettingsIcon, FileText } from 'lucide-react';
import { i18n } from '@/lib/i18n';
import RichTextEditor from './RichTextEditor';

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
}

interface TranslationKey {
  key: string;
  category: string;
  descriptionEn: string;
  values: Record<string, string>;
}

type LanguageTab = 'official' | 'settings' | 'texts';

export default function LanguageSettings() {
  const [activeTab, setActiveTab] = useState<LanguageTab>('official');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [allKeys, setAllKeys] = useState<TranslationKey[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<TranslationKey[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentKey, setCurrentKey] = useState<TranslationKey | null>(null);
  const [variableName, setVariableName] = useState('');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchField, setSearchField] = useState('variable_name');
  const [searchQuery, setSearchQuery] = useState('');

  // Language settings state
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [fallbackLanguage, setFallbackLanguage] = useState('en');
  const [autoDetect, setAutoDetect] = useState(true);
  
  // Category filter for Language Long Texts
  const [selectedCategory, setSelectedCategory] = useState<'system' | 'social' | 'management'>('system');
  
  // New language/translation key state
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyCategory, setNewKeyCategory] = useState('system');
  const [newKeyTranslations, setNewKeyTranslations] = useState<Record<string, string>>({});
  
  // Auto-translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [englishText, setEnglishText] = useState('');
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadLanguagesData();
    loadStaticTranslations();
  }, []);

  // Handle search and category filtering
  useEffect(() => {
    let filtered = allKeys;
    
    // Filter by category for both Tab 2 and Tab 3
    if (activeTab === 'settings' || activeTab === 'texts') {
      filtered = filtered.filter(key => key.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((key) => {
        if (searchField === 'variable_name') {
          return key.key.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      });
    }
    
    setFilteredKeys(filtered);
    setCurrentIndex(0);
  }, [searchQuery, searchField, allKeys, selectedCategory, activeTab]);

  // Update current key when index changes
  useEffect(() => {
    if (filteredKeys.length > 0 && currentIndex >= 0 && currentIndex < filteredKeys.length) {
      const key = filteredKeys[currentIndex];
      setCurrentKey(key);
      setVariableName(key.key);
      setTranslations(key.values);
      setEnglishText(key.values.en || '');
      setShowAllLanguages(false);
    }
  }, [currentIndex, filteredKeys]);

  const loadLanguagesData = () => {
    // Default active languages
    const defaultActiveLanguages = ['en', 'fr', 'de', 'it', 'es', 'hi'];
    
    // Load saved active languages from localStorage
    let activeLanguageCodes = defaultActiveLanguages;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeLanguages');
      if (saved) {
        try {
          activeLanguageCodes = JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing active languages:', e);
        }
      }
    }
    
    const availableLanguages: Language[] = [
      { id: '1', code: 'en', name: 'English', nativeName: 'English', flag: 'ðŸ‡¬ðŸ‡§', isActive: activeLanguageCodes.includes('en') },
      { id: '2', code: 'fr', name: 'French', nativeName: 'FranÃ§ais', flag: 'ðŸ‡«ðŸ‡·', isActive: activeLanguageCodes.includes('fr') },
      { id: '3', code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'ðŸ‡©ðŸ‡ª', isActive: activeLanguageCodes.includes('de') },
      { id: '4', code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'ðŸ‡®ðŸ‡¹', isActive: activeLanguageCodes.includes('it') },
      { id: '5', code: 'es', name: 'Spanish', nativeName: 'EspaÃ±ol', flag: 'ðŸ‡ªðŸ‡¸', isActive: activeLanguageCodes.includes('es') },
      { id: '6', code: 'pt', name: 'Portuguese', nativeName: 'PortuguÃªs', flag: 'ðŸ‡µðŸ‡¹', isActive: activeLanguageCodes.includes('pt') },
      { id: '7', code: 'ru', name: 'Russian', nativeName: 'Ð ÑƒÑÑÐºÐ¸Ð¹', flag: 'ðŸ‡·ðŸ‡º', isActive: activeLanguageCodes.includes('ru') },
      { id: '8', code: 'hi', name: 'Hindi', nativeName: 'à¤¹à¤¿à¤¨à¥à¤¦à¥€', flag: 'ðŸ‡®ðŸ‡³', isActive: activeLanguageCodes.includes('hi') },
      { id: '9', code: 'zh', name: 'Chinese', nativeName: 'ä¸­æ–‡', flag: 'ðŸ‡¨ðŸ‡³', isActive: activeLanguageCodes.includes('zh') },
      { id: '10', code: 'ar', name: 'Arabic', nativeName: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©', flag: 'ðŸ‡¸ðŸ‡¦', isActive: activeLanguageCodes.includes('ar') },
    ];
    
    setLanguages(availableLanguages);
  };
  
  const getFlagComponent = (code: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    // Map language codes to flag image filenames
    const flagFiles: Record<string, string> = {
      'en': 'en.png',
      'fr': 'fr.png', 
      'de': 'de.png',
      'it': 'it.png',
      'es': 'es.png',
      'pt': 'por.png',
      'ru': 'rus.png',
      'hi': 'ind.png',
      'zh': 'chin.png',
      'ar': 'arab.png'
    };
    
    const flagFile = flagFiles[code] || 'en.png';
    
    const sizeClasses = {
      small: 'w-6 h-6',
      medium: 'w-8 h-8',
      large: 'w-12 h-12'
    };
    
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} rounded overflow-hidden`}>
        <img 
          src={`/flags/${flagFile}`} 
          alt={`${code} flag`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  const loadStaticTranslations = () => {
    setIsLoading(true);
    try {
      const availableLanguages = i18n.getLanguages();
      const englishLang = availableLanguages.find(l => l.code === 'en');
      
      if (!englishLang) {
        console.error('English language not found');
        setIsLoading(false);
        return;
      }

      const keys = Object.keys(englishLang.strings);
      const translationData: TranslationKey[] = keys.map((key) => {
        const values: Record<string, string> = {};
        
        availableLanguages.forEach((lang) => {
          values[lang.code] = lang.strings[key] || '';
        });

        return {
          key: key,
          category: getCategoryFromKey(key),
          descriptionEn: `Translation for ${key}`,
          values: values,
        };
      });

      setAllKeys(translationData);
      setFilteredKeys(translationData);
      if (translationData.length > 0) {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryFromKey = (key: string): string => {
    // System Administration & Homepage
    if (key.startsWith('nav_')) return 'system';
    if (key.startsWith('auth_')) return 'system';
    if (key.startsWith('dashboard_')) return 'system';
    if (key.startsWith('settings_')) return 'system';
    if (key.startsWith('footer_')) return 'system';
    if (key.startsWith('admin_')) return 'system';
    
    // Social & Sport
    if (key.startsWith('sport_')) return 'social';
    if (key.startsWith('club_')) return 'social';
    if (key.startsWith('athlete_')) return 'social';
    if (key.startsWith('coach_')) return 'social';
    if (key.startsWith('team_')) return 'social';
    if (key.startsWith('group_')) return 'social';
    
    // Management
    if (key.startsWith('member_')) return 'management';
    if (key.startsWith('user_type_')) return 'management';
    if (key.startsWith('sidebar_')) return 'management';
    if (key.startsWith('workout_')) return 'management';
    
    return 'system';
  };

  const handleSave = async () => {
    if (!currentKey) {
      console.error('No current key selected');
      return;
    }

    console.log('Saving translations for key:', variableName);
    console.log('Translation data:', translations);

    try {
      const response = await fetch('/api/admin/translations/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: variableName,
          translations: translations,
        }),
      });

      console.log('Save response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Save successful:', result);
        
        // Update local state
        const updatedKeys = allKeys.map(k => 
          k.key === currentKey.key ? { ...k, key: variableName, values: translations } : k
        );
        setAllKeys(updatedKeys);
        setFilteredKeys(updatedKeys.filter(k => 
          searchQuery.trim() === '' || k.key.toLowerCase().includes(searchQuery.toLowerCase())
        ));
        
        console.log('âœ… Translations saved successfully!');
      } else {
        const errorData = await response.json();
        console.error('Save failed with error:', errorData);
        throw new Error(errorData.error || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving translations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`âŒ Failed to save translations!\n\nError: ${errorMessage}\n\nCheck browser console (F12) for details.`);
    }
  };

  const handleReset = () => {
    if (currentKey) {
      setVariableName(currentKey.key);
      setTranslations(currentKey.values);
    }
  };

  const toggleLanguage = (langCode: string) => {
    setLanguages(prev => {
      const updated = prev.map(lang => 
        lang.code === langCode ? { ...lang, isActive: !lang.isActive } : lang
      );
      
      // Save active languages to localStorage
      const activeLanguageCodes = updated.filter(l => l.isActive).map(l => l.code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeLanguages', JSON.stringify(activeLanguageCodes));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('activeLanguagesChanged'));
      }
      
      return updated;
    });
  };

  const goToPage = (pageNumber: number) => {
    const index = pageNumber - 1;
    if (index >= 0 && index < filteredKeys.length) {
      setCurrentIndex(index);
    }
  };

  const nextPage = () => {
    if (currentIndex < filteredKeys.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSearch = () => {
    // Trigger search (already handled by useEffect)
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setSearchField('variable_name');
  };

  const handleNewKey = () => {
    setShowNewKeyModal(true);
    setNewKeyName('');
    setNewKeyCategory('system');
    const initialTranslations: Record<string, string> = {};
    languages.filter(l => l.isActive).forEach(lang => {
      initialTranslations[lang.code] = '';
    });
    setNewKeyTranslations(initialTranslations);
  };

  const handleSaveNewKey = () => {
    if (!newKeyName.trim()) {
      alert('Please enter a variable name');
      return;
    }

    // Check if key already exists
    if (allKeys.find(k => k.key === newKeyName)) {
      alert('This variable name already exists. Please use a different name.');
      return;
    }

    // Create new translation key
    const newKey: TranslationKey = {
      key: newKeyName,
      category: newKeyCategory,
      descriptionEn: `Translation for ${newKeyName}`,
      values: newKeyTranslations
    };

    // Add to the list
    const updatedKeys = [...allKeys, newKey];
    setAllKeys(updatedKeys);
    setFilteredKeys(updatedKeys);
    
    // Close modal
    setShowNewKeyModal(false);
    
    // Navigate to the new key
    setCurrentIndex(updatedKeys.length - 1);
    
    alert('âœ… New translation key created successfully!');
  };

  const handleCancelNewKey = () => {
    setShowNewKeyModal(false);
    setNewKeyName('');
    setNewKeyTranslations({});
  };

  const handleAutoTranslate = async () => {
    console.log('Translation button clicked!');
    console.log('English text:', englishText);
    
    if (!englishText.trim()) {
      alert('âš ï¸ Please enter English text first');
      return;
    }

    setIsTranslating(true);
    
    try {
      // Get all active language codes except English
      const targetLanguages = languages
        .filter(l => l.isActive && l.code !== 'en')
        .map(l => l.code);

      console.log('Target languages:', targetLanguages);

      if (targetLanguages.length === 0) {
        alert('âš ï¸ No target languages selected. Please activate at least one language in Tab 1.');
        setIsTranslating(false);
        return;
      }

      // Call translation API
      console.log('Calling translation API...');
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: englishText,
          targetLanguages: targetLanguages,
        }),
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`Translation API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Translation data received:', data);

      if (data.translations) {
        // Update translations state with new translations
        const updatedTranslations = {
          ...translations,
          en: englishText,  // Keep English
          ...data.translations  // Add all translated languages
        };
        
        console.log('Updated translations:', updatedTranslations);
        console.log(`âœ… Translation completed for ${Object.keys(data.translations).length} languages`);
        setTranslations(updatedTranslations);
        setShowAllLanguages(true);
        
        // No alert - just show the translations
      } else {
        throw new Error('Invalid translation response - no translations field');
      }
    } catch (error) {
      console.error('Translation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`âŒ Translation failed!\n\nError: ${errorMessage}\n\n` +
            'Please try again or enter translations manually.\n' +
            'Check the browser console (F12) for more details.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleManualEdit = () => {
    setShowAllLanguages(true);
  };

  const handleSaveLanguageSelection = () => {
    const activeCount = languages.filter(l => l.isActive).length;
    alert(`âœ… Language selection saved!\n\n${activeCount} languages are now active in the navbar language selector.`);
  };

  const totalPages = filteredKeys.length;
  const currentPage = currentIndex + 1;
  
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 9;
    let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let end = Math.min(totalPages, start + maxPages - 1);
    
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Language Management</h2>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('official')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 border-b-4 ${
            activeTab === 'official'
              ? 'border-blue-600 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Globe className="w-5 h-5" />
          Set Official Languages
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 border-b-4 ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          Language Settings
        </button>
        <button
          onClick={() => setActiveTab('texts')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 border-b-4 ${
            activeTab === 'texts'
              ? 'border-blue-600 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-5 h-5" />
          Language Long Texts
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Tab 1: Set Official Languages */}
        {activeTab === 'official' && (
          <div className="bg-white border border-gray-300 rounded-lg p-6 shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              Set languages to be used in Movesbook
            </h3>
            
            {/* Center the table with max-width */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Flag</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Language</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {languages.map((lang) => (
                      <tr key={lang.code} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 w-20">
                          {getFlagComponent(lang.code, 'small')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">{lang.name}</span>
                            <span className="text-xs text-gray-500">{lang.nativeName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center w-32">
                          <button
                            onClick={() => toggleLanguage(lang.code)}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm ${
                              lang.isActive ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                                lang.isActive ? 'translate-x-8' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  <strong>{languages.filter(l => l.isActive).length}</strong> of <strong>{languages.length}</strong> languages active
                </p>
                <button 
                  onClick={handleSaveLanguageSelection}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                >
                  Save Language Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Language Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-white border border-gray-300 p-4 rounded">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">Languages</h3>
                <button 
                  onClick={handleNewKey}
                  className="px-6 py-2 bg-gray-700 text-white font-semibold hover:bg-gray-800 transition"
                >
                  New Language
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Language Page</span>
                <button className="px-4 py-2 bg-gray-700 text-white font-semibold">1</button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition">2</button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition">3</button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCategory('system')}
                className={`px-6 py-3 font-semibold transition ${
                  selectedCategory === 'system'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                System Administration & Homepage
              </button>
              <button
                onClick={() => setSelectedCategory('social')}
                className={`px-6 py-3 font-semibold transition ${
                  selectedCategory === 'social'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Social & Sport
              </button>
              <button
                onClick={() => setSelectedCategory('management')}
                className={`px-6 py-3 font-semibold transition ${
                  selectedCategory === 'management'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Management
              </button>
            </div>

            {/* Table View */}
            <div className="bg-white border border-gray-300 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Sr.No</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Variable_name</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">En</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">It</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Fr</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">De</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Es</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.slice(0, 10).map((key, index) => (
                    <tr key={key.key} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-red-700 font-semibold">{key.key}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{key.values.en || ''}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{key.values.it || ''}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{key.values.fr || ''}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{key.values.de || ''}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{key.values.es || ''}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              setCurrentIndex(filteredKeys.indexOf(key));
                              setCurrentKey(key);
                              setVariableName(key.key);
                              setTranslations(key.values);
                              setEnglishText(key.values.en || '');
                            }}
                            className="px-4 py-1 bg-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition"
                          >
                            View
                          </button>
                          <button className="px-4 py-1 bg-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 3: Language Long Texts */}
        {activeTab === 'texts' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white border border-gray-300 p-4">
              <div className="flex items-center gap-4">
                <label className="font-semibold text-gray-700 whitespace-nowrap">Search in</label>
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  className="px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:border-gray-500 min-w-[200px]"
                >
                  <option value="variable_name">variable_name</option>
                </select>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="variable_name"
                  className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-8 py-2 bg-red-500 text-white font-semibold hover:bg-red-600 transition whitespace-nowrap"
                >
                  Proceed
                </button>
                <button
                  onClick={handleResetSearch}
                  className="px-8 py-2 bg-gray-800 text-white font-semibold hover:bg-gray-900 transition whitespace-nowrap"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Category Tabs - PROMINENTLY STYLED */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-2 rounded-xl shadow-inner flex items-center gap-3 border-2 border-gray-300">
              <span className="text-sm font-bold text-gray-600 ml-2">CATEGORIES:</span>
              <button
                onClick={() => setSelectedCategory('system')}
                className={`px-8 py-4 font-bold text-sm transition-all duration-300 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 ${
                  selectedCategory === 'system'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-4 ring-blue-300 scale-105 shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                ðŸ  System Administration & Homepage
              </button>
              <button
                onClick={() => setSelectedCategory('social')}
                className={`px-8 py-4 font-bold text-sm transition-all duration-300 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 ${
                  selectedCategory === 'social'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-4 ring-blue-300 scale-105 shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                âš½ Social & Sport
              </button>
              <button
                onClick={() => setSelectedCategory('management')}
                className={`px-8 py-4 font-bold text-sm transition-all duration-300 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 ${
                  selectedCategory === 'management'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-4 ring-blue-300 scale-105 shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                ðŸ“Š Management
              </button>
            </div>

            {/* Category indicator */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-900">
                <strong>Currently viewing:</strong> {
                  selectedCategory === 'system' ? 'System Administration & Homepage' :
                  selectedCategory === 'social' ? 'Social & Sport' :
                  'Management'
                } translations
                <span className="ml-2 text-gray-600">({filteredKeys.length} items)</span>
              </p>
            </div>

            {currentKey && (
              <div className="space-y-6">
                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 bg-gray-100 p-3 rounded">
                  <button
                    onClick={prevPage}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 bg-gray-600 text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-700 transition"
                  >
                    prev
                  </button>
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-4 py-2 font-semibold transition ${
                        page === currentPage
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={nextPage}
                    disabled={currentIndex === filteredKeys.length - 1}
                    className="px-4 py-2 bg-gray-600 text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-700 transition"
                  >
                    next
                  </button>
                </div>

                {/* Detailed Editor */}
                <div className="bg-white border border-gray-300 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 flex-1">
                      <label className="font-semibold text-gray-700">
                        Sr.No {currentPage} <span className="ml-2">variable_name</span>
                      </label>
                      <input
                        type="text"
                        value={variableName}
                        onChange={(e) => setVariableName(e.target.value)}
                        className="flex-1 max-w-md px-4 py-2 border-2 border-red-500 focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-6 py-2 bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Auto-Translation Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <img 
                          src="/flags/en.png" 
                          alt="English flag"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">English (Source)</h4>
                        <p className="text-sm text-gray-600">Enter your text in English - we'll translate it for you</p>
                      </div>
                    </div>
                    
                    <RichTextEditor
                      value={englishText}
                      onChange={(newValue) => {
                        setEnglishText(newValue);
                        setTranslations({ ...translations, en: newValue });
                      }}
                      placeholder="Type your English text here..."
                      minHeight="200px"
                      language="English"
                    />

                    <div className="flex gap-3 mt-4 items-center">
                      <button
                        onClick={handleAutoTranslate}
                        disabled={isTranslating || !englishText.trim()}
                        className={`flex items-center justify-center gap-2 px-8 py-3 font-bold rounded transition-all duration-300 ${
                          isTranslating || !englishText.trim()
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                            : 'bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {isTranslating ? 'Translating...' : 'Translation'}
                      </button>
                      
                      <button
                        onClick={handleSave}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-gray-800 font-bold rounded border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        Save
                      </button>
                      
                      <button
                        onClick={handleManualEdit}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-white border-2 border-gray-300 text-gray-800 font-bold rounded hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        Manual Edit
                      </button>
                    </div>
                  </div>

                  {/* Translated Languages (Show after translation or manual edit) */}
                  {showAllLanguages && (
                    <div className="space-y-6">
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <p className="text-sm text-green-900 font-semibold">
                          âœ… Translations ready! Review and edit if needed.
                        </p>
                      </div>
                      
                      {languages.filter(l => l.isActive && l.code !== 'en').map((lang) => (
                        <div key={lang.code} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 flex items-center gap-3 border-b">
                            <div className="w-6 h-6 rounded overflow-hidden">
                              <img 
                                src={`/flags/${lang.code === 'pt' ? 'por' : lang.code === 'ru' ? 'rus' : lang.code === 'hi' ? 'ind' : lang.code === 'zh' ? 'chin' : lang.code === 'ar' ? 'arab' : lang.code}.png`}
                                alt={`${lang.name} flag`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 text-lg">{lang.name}</span>
                              <span className="text-sm text-gray-600 ml-2">({lang.nativeName})</span>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-white">
                            <RichTextEditor
                              value={translations[lang.code] || ''}
                              onChange={(newValue) => setTranslations({ ...translations, [lang.code]: newValue })}
                              placeholder={`${lang.name} translation...`}
                              minHeight="150px"
                              language={lang.name}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

