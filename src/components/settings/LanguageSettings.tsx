'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { i18n } from '@/lib/i18n';

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
  const [filteredKeys, setFilteredKeys] = useState<TranslationKey[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentKey, setCurrentKey] = useState<TranslationKey | null>(null);
  const [variableName, setVariableName] = useState('');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchField, setSearchField] = useState('variable_name');
  const [searchQuery, setSearchQuery] = useState('');

  // Load translations from static files
  useEffect(() => {
    loadStaticTranslations();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredKeys(allKeys);
    } else {
      const filtered = allKeys.filter((key) => {
        if (searchField === 'variable_name') {
          return key.key.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      });
      setFilteredKeys(filtered);
    }
    setCurrentIndex(0); // Reset to first page when search changes
  }, [searchQuery, searchField, allKeys]);

  // Update current key when index changes
  useEffect(() => {
    if (filteredKeys.length > 0 && currentIndex >= 0 && currentIndex < filteredKeys.length) {
      const key = filteredKeys[currentIndex];
      setCurrentKey(key);
      setVariableName(key.key);
      setTranslations(key.values);
    }
  }, [currentIndex, filteredKeys]);

  const loadStaticTranslations = () => {
    setIsLoading(true);
    try {
      // Get available languages from i18n
      const availableLanguages = i18n.getLanguages();
      const langs: Language[] = availableLanguages.map((lang, index) => ({
        id: String(index + 1),
        code: lang.code,
        name: lang.name,
        isActive: true,
      }));
      setLanguages(langs);

      // Get all translation keys from English (base language)
      const englishLang = availableLanguages.find(l => l.code === 'en');
      if (!englishLang) {
        console.error('English language not found');
        setIsLoading(false);
        return;
      }

      const keys = Object.keys(englishLang.strings);

      // Build translation data for all languages
      const translationData: TranslationKey[] = keys.map((key) => {
        const values: Record<string, string> = {};
        
        // Get translation for each language
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
    if (key.startsWith('nav_')) return 'navigation';
    if (key.startsWith('auth_')) return 'authentication';
    if (key.startsWith('dashboard_')) return 'dashboard';
    if (key.startsWith('settings_')) return 'settings';
    if (key.startsWith('sidebar_')) return 'sidebar';
    if (key.startsWith('footer_')) return 'footer';
    if (key.startsWith('user_type_')) return 'user_type';
    if (key.startsWith('member_')) return 'member';
    return 'general';
  };

  const handleSave = async () => {
    if (!currentKey) return;

    try {
      // Save to API endpoint (which will update the database)
      const response = await fetch('/api/admin/translations/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: variableName,
          translations: translations,
        }),
      });

      if (response.ok) {
        alert('✅ Translations saved successfully!\n\nNote: To apply these changes to the live site, you need to export translations and rebuild the application.');
        
        // Update the local state
        const updatedKeys = allKeys.map(k => 
          k.key === currentKey.key ? { ...k, key: variableName, values: translations } : k
        );
        setAllKeys(updatedKeys);
        setFilteredKeys(updatedKeys.filter(k => 
          searchQuery.trim() === '' || k.key.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Error saving translations:', error);
      alert('❌ Failed to save translations. Please check the console for details.');
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

  const totalPages = filteredKeys.length;
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
              disabled={currentIndex === filteredKeys.length - 1}
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
                    
                    {/* Rich Text Editor */}
                    <div className="border border-gray-300 bg-white">
                      {/* Toolbar Row 1 - File Operations */}
                      <div className="border-b border-gray-200 bg-gray-50 p-1 flex items-center gap-1 text-xs">
                        <button className="p-1 hover:bg-gray-200" title="Source">📄</button>
                        <button className="p-1 hover:bg-gray-200" title="Save">💾</button>
                        <button className="p-1 hover:bg-gray-200" title="New">📃</button>
                        <button className="p-1 hover:bg-gray-200" title="Preview">👁</button>
                        <button className="p-1 hover:bg-gray-200" title="Print">🖨</button>
                        <button className="p-1 hover:bg-gray-200" title="Templates">📋</button>
                        <span className="text-gray-300">|</span>
                        <button className="p-1 hover:bg-gray-200" title="Cut">✂</button>
                        <button className="p-1 hover:bg-gray-200" title="Copy">📄</button>
                        <button className="p-1 hover:bg-gray-200" title="Paste">📋</button>
                        <span className="text-gray-300">|</span>
                        <button className="p-1 hover:bg-gray-200" title="Undo">↶</button>
                        <button className="p-1 hover:bg-gray-200" title="Redo">↷</button>
                        <span className="text-gray-300">|</span>
                        <button className="p-1 hover:bg-gray-200" title="Find">🔍</button>
                        <button className="p-1 hover:bg-gray-200" title="Replace">🔄</button>
                        <span className="text-gray-300">|</span>
                        <button className="p-1 hover:bg-gray-200" title="Select All">☑</button>
                        <span className="text-gray-300">|</span>
                        <button className="p-1 hover:bg-gray-200" title="More">⋮</button>
                      </div>

                      {/* Toolbar Row 2 - Text Formatting */}
                      <div className="border-b border-gray-200 bg-gray-50 p-1 flex items-center gap-1 flex-wrap text-sm">
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300 font-bold" title="Bold">B</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300 italic" title="Italic">I</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300 underline" title="Underline">U</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300 line-through" title="Strike">S</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Subscript">X₂</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Superscript">X²</button>
                        <span className="text-gray-300">|</span>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Remove Format">Tx</button>
                        <span className="text-gray-300">|</span>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Numbered List">1.</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Bullet List">•</button>
                        <span className="text-gray-300">|</span>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Decrease Indent">⇤</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Increase Indent">⇥</button>
                        <span className="text-gray-300">|</span>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Blockquote">""</button>
                        <span className="text-gray-300">|</span>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Align Left">≡</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Align Center">≣</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Align Right">≡</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Justify">≡</button>
                        <span className="text-gray-300">|</span>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Link">🔗</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Unlink">🔓</button>
                        <span className="text-gray-300">|</span>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Image">🖼</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Table">⊞</button>
                        <span className="text-gray-300">|</span>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Horizontal Rule">—</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Smiley">😊</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Special Char">Ω</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="Iframe">⊡</button>
                        <button className="px-2 py-1 hover:bg-gray-200 border border-gray-300" title="More">⋯</button>
                      </div>

                      {/* Toolbar Row 3 - Styles */}
                      <div className="border-b border-gray-200 bg-gray-50 p-1 flex items-center gap-2 text-xs">
                        <select className="border border-gray-300 px-2 py-1 text-xs bg-white" title="Styles">
                          <option>Styles</option>
                          <option>Heading 1</option>
                          <option>Heading 2</option>
                          <option>Paragraph</option>
                        </select>
                        <select className="border border-gray-300 px-2 py-1 text-xs bg-white" title="Format">
                          <option>Format</option>
                          <option>Normal</option>
                          <option>Formatted</option>
                        </select>
                        <select className="border border-gray-300 px-2 py-1 text-xs bg-white" title="Font">
                          <option>Font</option>
                          <option>Arial</option>
                          <option>Times New Roman</option>
                          <option>Courier New</option>
                        </select>
                        <select className="border border-gray-300 px-2 py-1 text-xs bg-white" title="Size">
                          <option>Size</option>
                          <option>8</option>
                          <option>10</option>
                          <option>12</option>
                          <option>14</option>
                          <option>16</option>
                          <option>18</option>
                        </select>
                        <button className="p-1 hover:bg-gray-200 border border-gray-300" title="Text Color">A</button>
                        <button className="p-1 hover:bg-gray-200 border border-gray-300" title="Background Color">🎨</button>
                        <span className="text-gray-300">|</span>
                        <button className="p-1 hover:bg-gray-200 border border-gray-300" title="Maximize">⤢</button>
                        <button className="p-1 hover:bg-gray-200 border border-gray-300" title="Show Blocks">☐</button>
                        <span className="text-gray-300">|</span>
                        <select className="border border-gray-300 px-2 py-1 text-xs bg-white" title="Zoom">
                          <option>Zoom</option>
                          <option>50%</option>
                          <option>75%</option>
                          <option>100%</option>
                          <option>125%</option>
                          <option>150%</option>
                        </select>
                      </div>
                      
                      {/* Editor Area */}
                      <textarea
                        value={translations[lang.code] || ''}
                        onChange={(e) => setTranslations({ ...translations, [lang.code]: e.target.value })}
                        rows={10}
                        className="w-full p-4 focus:outline-none resize-y min-h-[250px] font-sans"
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