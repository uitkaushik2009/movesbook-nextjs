'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface Language {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

interface TranslationKey {
  key: string;
  category: string;
  descriptionEn: string;
  values: Record<string, string>;
}

export default function LanguageSettings() {
  const [activeTab, setActiveTab] = useState<'edit' | 'new'>('edit');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [allKeys, setAllKeys] = useState<TranslationKey[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentKey, setCurrentKey] = useState<TranslationKey | null>(null);
  const [variableName, setVariableName] = useState('');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch languages and translations
  useEffect(() => {
    fetchData();
  }, []);

  // Update current key when index changes
  useEffect(() => {
    if (allKeys.length > 0 && currentIndex >= 0 && currentIndex < allKeys.length) {
      const key = allKeys[currentIndex];
      setCurrentKey(key);
      setVariableName(key.key);
      setTranslations(key.values);
    }
  }, [currentIndex, allKeys]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch languages
      const langRes = await fetch('/api/admin/translations/languages');
      const langData = await langRes.json();
      if (langData.success) {
        setLanguages(langData.languages.filter((l: Language) => l.isActive));
      }

      // Fetch translations
      const transRes = await fetch('/api/admin/translations');
      const transData = await transRes.json();
      if (transData.success) {
        setAllKeys(transData.translations);
        if (transData.translations.length > 0) {
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentKey) return;

    try {
      // Save each language translation
      for (const [langCode, value] of Object.entries(translations)) {
        await fetch('/api/admin/translations/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: variableName,
            languageCode: langCode,
            value: value,
          }),
        });
      }
      
      alert('✅ Translations saved successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving translations:', error);
      alert('Failed to save translations');
    }
  };

  const handleReset = () => {
    if (currentKey) {
      setVariableName(currentKey.key);
      setTranslations(currentKey.values);
    }
  };

  const goToPage = (pageNumber: number) => {
    const index = pageNumber - 1;
    if (index >= 0 && index < allKeys.length) {
      setCurrentIndex(index);
    }
  };

  const nextPage = () => {
    if (currentIndex < allKeys.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const totalPages = allKeys.length;
  const currentPage = currentIndex + 1;
  
  // Calculate page numbers to show (max 9)
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
      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-8 py-3 font-semibold transition-all duration-300 ${
            activeTab === 'edit'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          System Administration & Homepage
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-8 py-3 font-semibold transition-all duration-300 ${
            activeTab === 'new'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          New Language
        </button>
      </div>

      {activeTab === 'edit' && currentKey && (
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
              disabled={currentIndex === allKeys.length - 1}
              className="px-4 py-2 bg-gray-600 text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-700 transition"
            >
              next
            </button>
          </div>

          {/* Variable Name Header */}
          <div className="bg-white border border-gray-300 p-6">
            <div className="flex items-center justify-between mb-4">
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

            {/* Language Editors */}
            <div className="space-y-6 mt-6">
              {languages.map((lang) => {
                const flagEmoji = lang.code === 'en' ? '🇬🇧' : 
                                  lang.code === 'es' ? '🇪🇸' :
                                  lang.code === 'fr' ? '🇫🇷' :
                                  lang.code === 'de' ? '🇩🇪' :
                                  lang.code === 'it' ? '🇮🇹' :
                                  lang.code === 'pt' ? '🇵🇹' :
                                  lang.code === 'ru' ? '🇷🇺' :
                                  lang.code === 'zh' ? '🇨🇳' :
                                  lang.code === 'ar' ? '🇸🇦' :
                                  lang.code === 'hi' ? '🇮🇳' : '🌐';

                return (
                  <div key={lang.code} className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{flagEmoji}</span>
                      <span className="font-semibold text-gray-700">
                        {lang.name.charAt(0).toUpperCase() + lang.name.slice(1).substring(0, 2)}
                      </span>
                    </div>
                    
                    {/* Rich Text Editor (simplified) */}
                    <div className="border border-gray-300 bg-white">
                      {/* Toolbar */}
                      <div className="border-b border-gray-300 bg-gray-50 p-2 flex items-center gap-2 flex-wrap text-sm">
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Bold"><strong>B</strong></button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Italic"><em>I</em></button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Underline"><u>U</u></button>
                        <span className="text-gray-400">|</span>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Align Left">≡</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Align Center">≣</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Align Right">≡</button>
                        <span className="text-gray-400">|</span>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="List">•</button>
                        <span className="text-gray-400 ml-auto text-xs">Font: <select className="border border-gray-300 px-2 py-1"><option>Arial</option></select></span>
                        <span className="text-gray-400 text-xs">Size: <select className="border border-gray-300 px-2 py-1"><option>12</option></select></span>
                      </div>
                      
                      {/* Editor Area */}
                      <textarea
                        value={translations[lang.code] || ''}
                        onChange={(e) => setTranslations({ ...translations, [lang.code]: e.target.value })}
                        rows={8}
                        className="w-full p-4 focus:outline-none resize-y min-h-[200px]"
                        placeholder={`Enter ${lang.name} translation here...`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-green-600 text-white font-semibold hover:bg-green-700 transition rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'new' && (
        <div className="bg-white border border-gray-300 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Language</h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Language Code (e.g., sv, da, no)
              </label>
              <input
                type="text"
                placeholder="sv"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Language Name (e.g., Svenska, Dansk)
              </label>
              <input
                type="text"
                placeholder="Svenska"
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button className="px-8 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition rounded">
              Create Language
            </button>
          </div>
        </div>
      )}
    </div>
  );
}