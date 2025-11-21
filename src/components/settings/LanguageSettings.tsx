'use client';

import { useState } from 'react';
import { i18n, type Language, type LongText } from '@/lib/i18n';
import { Plus, Edit3, Check, X, Search, Globe } from 'lucide-react';

export default function LanguageSettings() {
  const [activeTab, setActiveTab] = useState<'short' | 'long'>('short');
  const [languages, setLanguages] = useState(i18n.getLanguages());
  const [longTexts, setLongTexts] = useState(i18n.getLongTexts());
  const [newLanguage, setNewLanguage] = useState({ code: '', name: '' });
  const [editingText, setEditingText] = useState<LongText | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const addNewLanguage = () => {
    if (newLanguage.code && newLanguage.name) {
      const language: Language = {
        code: newLanguage.code,
        name: newLanguage.name,
        strings: {}
      };
      i18n.addLanguage(language);
      setLanguages([...languages, language]);
      setNewLanguage({ code: '', name: '' });
    }
  };

  const updateShortText = (languageCode: string, key: string, value: string) => {
    const langIndex = languages.findIndex(lang => lang.code === languageCode);
    if (langIndex !== -1) {
      const updatedLanguages = [...languages];
      updatedLanguages[langIndex].strings[key] = value;
      setLanguages(updatedLanguages);
    }
  };

  const addLongText = () => {
    const newText: LongText = {
      variable: `long_text_${Date.now()}`,
      description: 'New long text description',
      content: { en: 'New long text content' }
    };
    i18n.addLongText(newText);
    setLongTexts([...longTexts, newText]);
    setEditingText(newText);
  };

  const filteredLongTexts = longTexts.filter(text =>
    text.variable.toLowerCase().includes(searchTerm.toLowerCase()) ||
    text.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Language Settings</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('short')}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === 'short'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Short Texts
          </button>
          <button
            onClick={() => setActiveTab('long')}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === 'long'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Long Texts
          </button>
        </div>
      </div>

      {activeTab === 'short' && (
        <div className="space-y-6">
          {/* Add New Language */}
          <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-6 border border-cyan-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Language</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Language Code (e.g., sv)"
                value={newLanguage.code}
                onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="Language Name (e.g., Swedish)"
                value={newLanguage.name}
                onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={addNewLanguage}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Short Texts Grid */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">
                      Variable
                    </th>
                    {languages.map((lang) => (
                      <th key={lang.code} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span>{lang.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(i18n.getDefaultEnglishStrings()).map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {key}
                      </td>
                      {languages.map((lang) => (
                        <td key={lang.code} className="px-6 py-4">
                          <input
                            type="text"
                            value={lang.strings[key] || value}
                            onChange={(e) => updateShortText(lang.code, key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'long' && (
        <div className="space-y-6">
          {/* Search and Add */}
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search long texts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <button
              onClick={addLongText}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>Create New</span>
            </button>
          </div>

          {/* Long Texts Grid */}
          <div className="space-y-4">
            {filteredLongTexts.map((text) => (
              <div key={text.variable} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 font-mono">
                      {text.variable}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">{text.description}</p>
                  </div>
                  <button
                    onClick={() => setEditingText(text)}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-xl hover:bg-cyan-200 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Translation Status */}
                <div className="flex space-x-2">
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      className={`w-3 h-3 rounded-full ${
                        text.content[lang.code] ? 'bg-green-500' : 'bg-red-400'
                      }`}
                      title={`${lang.name}: ${text.content[lang.code] ? 'Translated' : 'Not translated'}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Long Text Editor Modal */}
      {editingText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Long Text</h3>
              <button
                onClick={() => setEditingText(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Variable Name
                </label>
                <input
                  type="text"
                  value={editingText.variable}
                  onChange={(e) => setEditingText({ ...editingText, variable: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingText.description}
                  onChange={(e) => setEditingText({ ...editingText, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Language Inputs */}
              {languages.map((lang) => (
                <div key={lang.code}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {lang.name} Content
                  </label>
                  <textarea
                    value={editingText.content[lang.code] || ''}
                    onChange={(e) => setEditingText({
                      ...editingText,
                      content: { ...editingText.content, [lang.code]: e.target.value }
                    })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setEditingText(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const updatedTexts = longTexts.map(t => 
                    t.variable === editingText.variable ? editingText : t
                  );
                  setLongTexts(updatedTexts);
                  setEditingText(null);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
              >
                <Check className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}