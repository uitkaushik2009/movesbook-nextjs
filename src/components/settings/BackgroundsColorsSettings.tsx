'use client';

import { useState, useEffect } from 'react';
import { Palette, Eye, RefreshCw, Download, Upload, Save, AlertCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useUserSettings } from '@/hooks/useUserSettings';
import {
  ColorSettings,
  ColorScheme,
  MovelapRowSettings,
  DEFAULT_COLORS as defaultColors,
  DEFAULT_MOVELAP_ROWS,
  DEFAULT_EXPANDED_SECTIONS
} from '@/constants/colors.constants';

interface BackgroundsColorsSettingsProps {
  isAdmin?: boolean;
}

export default function BackgroundsColorsSettings({ isAdmin = false }: BackgroundsColorsSettingsProps) {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const { settings: dbSettings, updateSetting: updateDbSetting, loading } = useUserSettings(user?.id);

  const [colors, setColors] = useState<ColorSettings>(defaultColors);
  const [savedSchemes, setSavedSchemes] = useState<ColorScheme[]>([]);
  const [schemeName, setSchemeName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportName, setExportName] = useState('');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(DEFAULT_EXPANDED_SECTIONS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  // Load color settings from database
  useEffect(() => {
    if (dbSettings && !loading && dbSettings.colorSettings) {
      const loadedColors = typeof dbSettings.colorSettings === 'string'
        ? JSON.parse(dbSettings.colorSettings)
        : dbSettings.colorSettings;

      if (loadedColors && Object.keys(loadedColors).length > 0) {
        setColors({ ...defaultColors, ...loadedColors });
      }
    }
  }, [dbSettings, loading]);

  // Load saved schemes from localStorage (only for non-admin users)
  useEffect(() => {
    if (!isAdmin) {
      const saved = localStorage.getItem('colorSchemes');
      if (saved) {
        try {
          setSavedSchemes(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load color schemes');
        }
      }
    }
  }, [isAdmin]);

  const handleColorChange = async (key: keyof ColorSettings, value: string | number | boolean | MovelapRowSettings) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);

    // Save to database immediately so settings persist after page refresh
    try {
      setSaveStatus('saving');
      await updateDbSetting('colorSettings' as any, newColors);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save color settings:', error);
      setSaveStatus('idle');
    }
  };

  const resetToDefaults = async () => {
    if (confirm('Reset all colors to defaults?')) {
      setColors(defaultColors);

      // Save to database
      try {
        setSaveStatus('saving');
        await updateDbSetting('colorSettings', defaultColors);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Error resetting colors:', error);
        localStorage.setItem('colorSettings', JSON.stringify(defaultColors));
      }
    }
  };

  // Save current settings as default
  const saveAsDefault = async () => {
    if (!confirm('Save current color settings as your default?')) {
      return;
    }

    try {
      setSaveStatus('saving');
      
      // Save to database with a special "isDefault" flag in workoutPreferences
      await updateDbSetting('workoutPreferences' as any, {
        defaultColorSettings: colors
      });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      alert('✅ Current settings saved as your default!');
    } catch (error) {
      console.error('Error saving default settings:', error);
      alert('❌ Failed to save default settings');
      setSaveStatus('idle');
    }
  };

  // Enable default settings - Apply saved defaults to the grid
  const enableDefaultSettings = async () => {
    try {
      // Fetch from database
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ Please log in to enable your default settings');
        return;
      }

      const response = await fetch('/api/user/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const settings = await response.json();
        const workoutPrefs = settings.workoutPreferences || {};
        
        if (workoutPrefs.defaultColorSettings) {
          const defaultColors = workoutPrefs.defaultColorSettings;
          setColors(defaultColors);
          
          // Apply to grid by saving to colorSettings
          await updateDbSetting('colorSettings', defaultColors);
          
          alert('✅ Default color settings enabled and applied to the grid!');
        } else {
          alert('ℹ️ No default settings found. Please save your colors as default first.');
        }
      } else {
        alert('❌ Failed to enable default settings');
      }
    } catch (error) {
      console.error('Error enabling default settings:', error);
      alert('❌ Error enabling default settings');
    }
  };

  // Load Movesbook Defaults - Copy admin defaults to personal settings
  const loadMovesbookDefaults = async () => {
    if (!confirm('Load Movesbook default color settings? This will replace your current colors.')) {
      return;
    }

    try {
      setLoadingDefaults(true);
      
      // Fetch Movesbook defaults from database
      const response = await fetch(`/api/admin/settings/defaults?language=${currentLanguage}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Movesbook defaults');
      }

      const data = await response.json();
      
      if (data.success && data.defaults?.colors) {
        // Parse the defaults data
        const movesbookDefaults = typeof data.defaults.colors === 'string' 
          ? JSON.parse(data.defaults.colors) 
          : data.defaults.colors;
        
        // Create a DEEP COPY of the defaults (not reference) - ensures user changes won't affect originals
        const copiedDefaults = JSON.parse(JSON.stringify(movesbookDefaults));
        
        // Apply to current state
        setColors({ ...defaultColors, ...copiedDefaults });
        
        // Save COPY to user's personal settings in database
        await updateDbSetting('colorSettings', copiedDefaults);
        
        alert('✅ Movesbook defaults copied to your personal settings! Your changes will not affect the originals.');
      } else {
        alert('ℹ️ No Movesbook defaults found for your language. Using system defaults.');
        setColors(defaultColors);
        await updateDbSetting('colorSettings', defaultColors);
      }
    } catch (error) {
      console.error('Error loading Movesbook defaults:', error);
      alert('❌ Failed to load Movesbook defaults');
    } finally {
      setLoadingDefaults(false);
    }
  };

  const saveColorScheme = () => {
    if (!schemeName.trim()) {
      alert('Please enter a scheme name');
      return;
    }
    const newScheme: ColorScheme = {
      name: schemeName,
      colors: { ...colors }
    };
    const updated = [...savedSchemes, newScheme];
    setSavedSchemes(updated);
    localStorage.setItem('colorSchemes', JSON.stringify(updated));
    setSchemeName('');
    setShowSaveDialog(false);
    alert(`✅ Color scheme "${schemeName}" saved!`);
  };

  const loadColorScheme = (scheme: ColorScheme) => {
    setColors(scheme.colors);
    alert(`✅ Color scheme "${scheme.name}" loaded!`);
  };

  const deleteColorScheme = (index: number) => {
    if (!confirm('Delete this color scheme?')) return;
    const updated = savedSchemes.filter((_, i) => i !== index);
    setSavedSchemes(updated);
    localStorage.setItem('colorSchemes', JSON.stringify(updated));
  };

  const exportSettings = () => {
    // Show dialog to ask for export name
    setShowExportDialog(true);
  };

  const handleExport = () => {
    if (!exportName.trim()) {
      alert('Please enter a name for the export file');
      return;
    }
    const dataStr = JSON.stringify(colors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    // Use custom name instead of timestamp
    link.download = `${exportName}.json`;
    link.click();
    setExportName('');
    setShowExportDialog(false);
    alert(`✅ Color scheme exported as "${exportName}.json"!`);
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            setColors({ ...defaultColors, ...imported });
            alert('✅ Settings imported successfully!');
          } catch (error) {
            alert('❌ Invalid settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Calculate contrast ratio for accessibility
  const getContrastRatio = (fg: string, bg: string) => {
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    const l1 = getLuminance(fg);
    const l2 = getLuminance(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const ColorPicker = ({ label, value, onChange, showContrast, bgColor }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    showContrast?: boolean;
    bgColor?: string;
  }) => {
    const contrast = showContrast && bgColor ? getContrastRatio(value, bgColor) : 0;
    const isAccessible = contrast >= 4.5;

    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
        <div className="flex-1">
          <span className="font-semibold text-gray-700">{label}</span>
          {showContrast && bgColor && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium ${isAccessible ? 'text-green-600' : 'text-orange-600'}`}>
                {isAccessible ? '✓' : '⚠'} Contrast: {contrast.toFixed(2)}:1
              </span>
              {!isAccessible && (
                <AlertCircle className="w-3 h-3 text-orange-600" />
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor: value }}
            onClick={(e) => {
              e.stopPropagation();
              const input = document.createElement('input');
              input.type = 'color';
              input.value = value;
              input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
              input.click();
            }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  };

  const OpacitySlider = ({ label, value, onChange }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-mono text-gray-600">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );

  const CollapsibleSection = ({ title, expanded, onToggle, children }: {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl border border-cyan-200 overflow-hidden will-change-auto">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="w-full flex items-center justify-between p-6 hover:bg-white/50 transition-colors select-none"
        type="button"
      >
        <h3 className="text-xl font-semibold text-gray-900 flex items-center pointer-events-none">
          <Palette className="w-6 h-6 mr-3 text-cyan-600" />
          {title}
        </h3>
        <span className="pointer-events-none">
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>
      {expanded && (
        <div className="p-6 pt-0 space-y-4 will-change-auto">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Backgrounds & Colors</h2>
            <p className="text-gray-600 mt-1">Customize your workout interface colors and appearance</p>

            {/* Save Status Indicator */}
            {saveStatus !== 'idle' && (
              <div className="flex items-center gap-2 mt-2">
                {saveStatus === 'saving' && (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-blue-600 font-medium">Saving colors to database...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">✓ Colors saved to database!</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Workflow Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <h4 className="text-sm font-bold text-blue-900 mb-2">📋 How to Apply Colors to Grid:</h4>
          <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
            <li>Edit and create your color settings above</li>
            <li>Click <strong>"Save as Default"</strong> to save your settings</li>
            <li>Click <strong>"Enable Default Settings"</strong> to apply colors to the grid</li>
          </ol>
        </div>

        {/* Default Settings */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <Save className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Default Settings:</span>
          <button
            onClick={saveAsDefault}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            title="Step 2: Save current colors as your default settings"
          >
            <Save className="w-4 h-4" />
            Save as Default
          </button>
          <button
            onClick={enableDefaultSettings}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
            title="Step 3: Enable your saved default settings and apply to grid"
          >
            <Download className="w-4 h-4" />
            Enable Default Settings
          </button>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Save Color Scheme</h3>
            <input
              type="text"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              placeholder="Enter scheme name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={saveColorScheme}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Export Color Scheme</h3>
            <p className="text-gray-600 mb-4">Give your exported color scheme a name</p>
            <input
              type="text"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              placeholder="e.g., ocean-theme, dark-mode..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Export
              </button>
              <button
                onClick={() => setShowExportDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Saved Color Schemes Section - Only show for non-admin users */}
      {!isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Saved Color Schemes</h3>
            <div className="flex gap-3">
              {/* Load Movesbook Defaults Button */}
              <button
                onClick={loadMovesbookDefaults}
                disabled={loadingDefaults}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                title="Copy Movesbook default colors to your personal settings"
              >
                <Download className="w-4 h-4" />
                {loadingDefaults ? 'Loading...' : 'Load Movesbook Defaults'}
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Scheme
              </button>
              <button
                onClick={exportSettings}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={importSettings}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
          {savedSchemes.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-3">
              {savedSchemes.map((scheme, index) => (
                <div key={index} className="w-32 h-32 p-3 bg-white rounded-lg border border-gray-300 shadow-sm flex flex-col">
                  <div className="flex items-start justify-between mb-2 min-h-[20px]">
                    <span className="font-medium text-xs truncate flex-1 leading-tight">{scheme.name}</span>
                    <button
                      onClick={() => deleteColorScheme(index)}
                      className="text-gray-400 hover:text-red-600 text-base leading-none ml-1 flex-shrink-0 -mt-0.5"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex gap-1.5 mb-2 flex-1 items-center">
                    {[scheme.colors.buttonAdd, scheme.colors.buttonEdit, scheme.colors.buttonDelete].map((color, i) => (
                      <div key={i} className="flex-1 h-6 rounded" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <button
                    onClick={() => loadColorScheme(scheme)}
                    className="w-full px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No saved color schemes yet. Click "Save Scheme" to save your current colors.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Color Settings */}
        <div className="space-y-6">
          {/* Page Background */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">Page Background</h3>
            <div className="space-y-4">
              <ColorPicker
                label="Background Color"
                value={colors.pageBackground}
                onChange={(v) => handleColorChange('pageBackground', v)}
              />
              <OpacitySlider
                label="Background Opacity"
                value={colors.pageBackgroundOpacity}
                onChange={(v) => handleColorChange('pageBackgroundOpacity', v)}
              />
              
              {/* Border Settings for Each Section */}
              <div className="space-y-3">
                {/* DAY Border Settings */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">📅 Day Border</span>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={colors.dayBorderEnabled || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleColorChange('dayBorderEnabled', e.target.checked);
                        }}
                        className="w-4 h-4 text-blue-600 rounded flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 font-medium">Enable</span>
                    </label>
                  </div>
                  
                  {colors.dayBorderEnabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Color</span>
                        <div className="flex gap-1">
                          {[
                            { name: 'Black', value: '#000000' },
                            { name: 'Red', value: '#ef4444' },
                            { name: 'Blue', value: '#3b82f6' }
                          ].map((color) => (
                            <button
                              key={color.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorChange('dayBorderColor', color.value);
                              }}
                              className={`px-2 py-1 rounded border-2 transition-colors text-xs font-medium ${
                                colors.dayBorderColor === color.value
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                              style={{ borderLeftColor: color.value, borderLeftWidth: '3px' }}
                            >
                              {color.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Thickness</span>
                        <div className="flex gap-1">
                          {[
                            { name: 'VT', value: 'very-thin' },
                            { name: 'T', value: 'thin' },
                            { name: 'N', value: 'normal' },
                            { name: 'TH', value: 'thick' }
                          ].map((width) => (
                            <button
                              key={width.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorChange('dayBorderWidth', width.value);
                              }}
                              className={`px-2 py-1 rounded border-2 transition-colors text-xs font-medium ${
                                colors.dayBorderWidth === width.value
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              {width.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* WORKOUT Border Settings */}
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">🏋️ Workout Border</span>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={colors.workoutBorderEnabled || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleColorChange('workoutBorderEnabled', e.target.checked);
                        }}
                        className="w-4 h-4 text-green-600 rounded flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 font-medium">Enable</span>
                    </label>
                  </div>
                  
                  {colors.workoutBorderEnabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Color</span>
                        <div className="flex gap-1">
                          {[
                            { name: 'Black', value: '#000000' },
                            { name: 'Red', value: '#ef4444' },
                            { name: 'Blue', value: '#3b82f6' }
                          ].map((color) => (
                            <button
                              key={color.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorChange('workoutBorderColor', color.value);
                              }}
                              className={`px-2 py-1 rounded border-2 transition-colors text-xs font-medium ${
                                colors.workoutBorderColor === color.value
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                              style={{ borderLeftColor: color.value, borderLeftWidth: '3px' }}
                            >
                              {color.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Thickness</span>
                        <div className="flex gap-1">
                          {[
                            { name: 'VT', value: 'very-thin' },
                            { name: 'T', value: 'thin' },
                            { name: 'N', value: 'normal' },
                            { name: 'TH', value: 'thick' }
                          ].map((width) => (
                            <button
                              key={width.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorChange('workoutBorderWidth', width.value);
                              }}
                              className={`px-2 py-1 rounded border-2 transition-colors text-xs font-medium ${
                                colors.workoutBorderWidth === width.value
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              {width.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* MOVEFRAME Border Settings */}
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">📋 Moveframe Border</span>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={colors.moveframeBorderEnabled || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleColorChange('moveframeBorderEnabled', e.target.checked);
                        }}
                        className="w-4 h-4 text-yellow-600 rounded flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 font-medium">Enable</span>
                    </label>
                  </div>
                  
                  {colors.moveframeBorderEnabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Color</span>
                        <div className="flex gap-1">
                          {[
                            { name: 'Black', value: '#000000' },
                            { name: 'Red', value: '#ef4444' },
                            { name: 'Blue', value: '#3b82f6' }
                          ].map((color) => (
                            <button
                              key={color.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorChange('moveframeBorderColor', color.value);
                              }}
                              className={`px-2 py-1 rounded border-2 transition-colors text-xs font-medium ${
                                colors.moveframeBorderColor === color.value
                                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                              style={{ borderLeftColor: color.value, borderLeftWidth: '3px' }}
                            >
                              {color.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Thickness</span>
                        <div className="flex gap-1">
                          {[
                            { name: 'VT', value: 'very-thin' },
                            { name: 'T', value: 'thin' },
                            { name: 'N', value: 'normal' },
                            { name: 'TH', value: 'thick' }
                          ].map((width) => (
                            <button
                              key={width.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorChange('moveframeBorderWidth', width.value);
                              }}
                              className={`px-2 py-1 rounded border-2 transition-colors text-xs font-medium ${
                                colors.moveframeBorderWidth === width.value
                                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              {width.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* MOVELAP Border Settings */}
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">🔄 Movelap Border</span>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={colors.movelapBorderEnabled || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleColorChange('movelapBorderEnabled', e.target.checked);
                        }}
                        className="w-4 h-4 text-purple-600 rounded flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 font-medium">Enable</span>
                    </label>
                  </div>
                  
                  {colors.movelapBorderEnabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Color</span>
                        <div className="flex gap-1">
                          {[
                            { name: 'Black', value: '#000000' },
                            { name: 'Red', value: '#ef4444' },
                            { name: 'Blue', value: '#3b82f6' }
                          ].map((color) => (
                            <button
                              key={color.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorChange('movelapBorderColor', color.value);
                              }}
                              className={`px-2 py-1 rounded border-2 transition-colors text-xs font-medium ${
                                colors.movelapBorderColor === color.value
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                              style={{ borderLeftColor: color.value, borderLeftWidth: '3px' }}
                            >
                              {color.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Thickness</span>
                        <div className="flex gap-1">
                          {[
                            { name: 'VT', value: 'very-thin' },
                            { name: 'T', value: 'thin' },
                            { name: 'N', value: 'normal' },
                            { name: 'TH', value: 'thick' }
                          ].map((width) => (
                            <button
                              key={width.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorChange('movelapBorderWidth', width.value);
                              }}
                              className={`px-2 py-1 rounded border-2 transition-colors text-xs font-medium ${
                                colors.movelapBorderWidth === width.value
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              {width.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Headers Section */}
          <CollapsibleSection
            title="Headers Configuration"
            expanded={expandedSections.headers}
            onToggle={() => toggleSection('headers')}
          >
            <ColorPicker
              label="Week Header Background"
              value={colors.weekHeader}
              onChange={(v) => handleColorChange('weekHeader', v)}
            />
            <ColorPicker
              label="Week Header Text"
              value={colors.weekHeaderText}
              onChange={(v) => handleColorChange('weekHeaderText', v)}
              showContrast
              bgColor={colors.weekHeader}
            />
            <ColorPicker
              label="Day Header Background"
              value={colors.dayHeader}
              onChange={(v) => handleColorChange('dayHeader', v)}
            />
            <ColorPicker
              label="Day Header Text"
              value={colors.dayHeaderText}
              onChange={(v) => handleColorChange('dayHeaderText', v)}
              showContrast
              bgColor={colors.dayHeader}
            />
            <ColorPicker
              label="Day Alternate Row Background (Even Days)"
              value={colors.dayAlternateRow}
              onChange={(v) => handleColorChange('dayAlternateRow', v)}
            />
            <ColorPicker
              label="Day Alternate Row Text (Even Days)"
              value={colors.dayAlternateRowText}
              onChange={(v) => handleColorChange('dayAlternateRowText', v)}
              showContrast
              bgColor={colors.dayAlternateRow}
            />
            <ColorPicker
              label="Workout #1 Header Background"
              value={colors.workoutHeader}
              onChange={(v) => handleColorChange('workoutHeader', v)}
            />
            <ColorPicker
              label="Workout #1 Header Text"
              value={colors.workoutHeaderText}
              onChange={(v) => handleColorChange('workoutHeaderText', v)}
              showContrast
              bgColor={colors.workoutHeader}
            />
            <ColorPicker
              label="Workout #2 Header Background (Even Workout)"
              value={colors.workout2Header}
              onChange={(v) => handleColorChange('workout2Header', v)}
            />
            <ColorPicker
              label="Workout #2 Header Text"
              value={colors.workout2HeaderText}
              onChange={(v) => handleColorChange('workout2HeaderText', v)}
              showContrast
              bgColor={colors.workout2Header}
            />
            <ColorPicker
              label="Workout #3 Header Background"
              value={colors.workout3Header}
              onChange={(v) => handleColorChange('workout3Header', v)}
            />
            <ColorPicker
              label="Workout #3 Header Text"
              value={colors.workout3HeaderText}
              onChange={(v) => handleColorChange('workout3HeaderText', v)}
              showContrast
              bgColor={colors.workout3Header}
            />
            <ColorPicker
              label="Moveframe Header Background"
              value={colors.moveframeHeader}
              onChange={(v) => handleColorChange('moveframeHeader', v)}
            />
            <ColorPicker
              label="Moveframe Header Text"
              value={colors.moveframeHeaderText}
              onChange={(v) => handleColorChange('moveframeHeaderText', v)}
              showContrast
              bgColor={colors.moveframeHeader}
            />
            <ColorPicker
              label="Alternate Row Background of the Moveframes"
              value={colors.alternateRowMoveframe}
              onChange={(v) => handleColorChange('alternateRowMoveframe', v)}
            />
            <ColorPicker
              label="Alternate Row Text of the Moveframes"
              value={colors.alternateRowTextMoveframe}
              onChange={(v) => handleColorChange('alternateRowTextMoveframe', v)}
            />
            <ColorPicker
              label="Movelap Header Background (Odd Rows: 1, 3, 5...)"
              value={colors.movelapHeader}
              onChange={(v) => handleColorChange('movelapHeader', v)}
            />
            <ColorPicker
              label="Movelap Header Text (All Rows: Even & Odd)"
              value={colors.movelapHeaderText}
              onChange={(v) => handleColorChange('movelapHeaderText', v)}
              showContrast
              bgColor={colors.movelapHeader}
            />
            <ColorPicker
              label="Alternate Row Background of the Movelaps (Even Rows: 2, 4, 6...)"
              value={colors.alternateRowMovelap}
              onChange={(v) => handleColorChange('alternateRowMovelap', v)}
            />
          </CollapsibleSection>

          {/* Button Colors Section */}
          <CollapsibleSection
            title="Button Colors"
            expanded={expandedSections.buttons}
            onToggle={() => toggleSection('buttons')}
          >
            {/* Add Button */}
            <div className="space-y-2">
              <ColorPicker
                label="Add Button"
                value={colors.buttonAdd}
                onChange={(v) => handleColorChange('buttonAdd', v)}
              />
              <ColorPicker
                label="Add Button Hover"
                value={colors.buttonAddHover}
                onChange={(v) => handleColorChange('buttonAddHover', v)}
              />
              <ColorPicker
                label="Add Button Header Text"
                value={colors.buttonAddHeaderText}
                onChange={(v) => handleColorChange('buttonAddHeaderText', v)}
              />
            </div>

            {/* Edit Button */}
            <div className="space-y-2">
              <ColorPicker
                label="Edit Button"
                value={colors.buttonEdit}
                onChange={(v) => handleColorChange('buttonEdit', v)}
              />
              <ColorPicker
                label="Edit Button Hover"
                value={colors.buttonEditHover}
                onChange={(v) => handleColorChange('buttonEditHover', v)}
              />
              <ColorPicker
                label="Edit Button Header Text"
                value={colors.buttonEditHeaderText}
                onChange={(v) => handleColorChange('buttonEditHeaderText', v)}
              />
            </div>

            {/* Delete Button */}
            <div className="space-y-2">
              <ColorPicker
                label="Delete Button"
                value={colors.buttonDelete}
                onChange={(v) => handleColorChange('buttonDelete', v)}
              />
              <ColorPicker
                label="Delete Button Hover"
                value={colors.buttonDeleteHover}
                onChange={(v) => handleColorChange('buttonDeleteHover', v)}
              />
              <ColorPicker
                label="Delete Button Header Text"
                value={colors.buttonDeleteHeaderText}
                onChange={(v) => handleColorChange('buttonDeleteHeaderText', v)}
              />
            </div>

            {/* Print Button */}
            <div className="space-y-2">
              <ColorPicker
                label="Print Button"
                value={colors.buttonPrint}
                onChange={(v) => handleColorChange('buttonPrint', v)}
              />
              <ColorPicker
                label="Print Button Hover"
                value={colors.buttonPrintHover}
                onChange={(v) => handleColorChange('buttonPrintHover', v)}
              />
              <ColorPicker
                label="Print Button Header Text"
                value={colors.buttonPrintHeaderText}
                onChange={(v) => handleColorChange('buttonPrintHeaderText', v)}
              />
            </div>
          </CollapsibleSection>

          {/* Row Colors Section */}
          <CollapsibleSection
            title="Row Colors"
            expanded={expandedSections.rows}
            onToggle={() => toggleSection('rows')}
          >
            <ColorPicker
              label="Microlap Background"
              value={colors.microlapBackground}
              onChange={(v) => handleColorChange('microlapBackground', v)}
            />
            <ColorPicker
              label="Selected Row Background"
              value={colors.selectedRow}
              onChange={(v) => handleColorChange('selectedRow', v)}
            />
            <ColorPicker
              label="Selected Row Text"
              value={colors.selectedRowText}
              onChange={(v) => handleColorChange('selectedRowText', v)}
              showContrast
              bgColor={colors.selectedRow}
            />
          </CollapsibleSection>

          {/* Movelaps Table Section */}
          <CollapsibleSection
            title="Movelaps Table"
            expanded={expandedSections.movelapsTable}
            onToggle={() => toggleSection('movelapsTable')}
          >
            <ColorPicker
              label="Movelaps Table Background"
              value={colors.movelapHeader}
              onChange={(v) => handleColorChange('movelapHeader', v)}
            />
            <ColorPicker
              label="Movelaps Table Text Color"
              value={colors.movelapHeaderText}
              onChange={(v) => handleColorChange('movelapHeaderText', v)}
              showContrast
              bgColor={colors.movelapHeader}
            />
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Text Color Source for Movelaps
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="movelapTextColorSource"
                    value="table"
                    checked={colors.movelapTextColorSource === 'table'}
                    onChange={(e) => handleColorChange('movelapTextColorSource', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-sm">Use Movelaps Table text color (above)</span>
                </label>
                <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="movelapTextColorSource"
                    value="rows"
                    checked={colors.movelapTextColorSource === 'rows'}
                    onChange={(e) => handleColorChange('movelapTextColorSource', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-sm">Use individual Movelaps Rows settings (below)</span>
                </label>
              </div>
            </div>
          </CollapsibleSection>

          {/* Movelaps Rows Section */}
          <CollapsibleSection
            title="Movelaps Rows Settings"
            expanded={expandedSections.movelapsRows}
            onToggle={() => toggleSection('movelapsRows')}
          >
            <div className="space-y-6">
              {/* Code Section */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Code Section</h4>
                <div className="space-y-3">
                  <ColorPicker
                    label="Text Color"
                    value={colors.movelapRows?.codeSection.color || DEFAULT_MOVELAP_ROWS.codeSection.color}
                    onChange={(v) => {
                      const newRows: MovelapRowSettings = { 
                        ...DEFAULT_MOVELAP_ROWS,
                        ...colors.movelapRows,
                        codeSection: { 
                          ...DEFAULT_MOVELAP_ROWS.codeSection,
                          ...(colors.movelapRows?.codeSection || {}), 
                          color: v 
                        }
                      };
                      handleColorChange('movelapRows', newRows);
                    }}
                  />
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={colors.movelapRows?.codeSection.bold ?? true}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          codeSection: { 
                            ...DEFAULT_MOVELAP_ROWS.codeSection,
                            ...(colors.movelapRows?.codeSection || {}), 
                            bold: e.target.checked 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    Bold
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Mode</label>
                    <select
                      value={colors.movelapRows?.codeSection.displayMode || 'always'}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          codeSection: { 
                            ...DEFAULT_MOVELAP_ROWS.codeSection,
                            ...(colors.movelapRows?.codeSection || {}), 
                            displayMode: e.target.value as 'always' | 'once' 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="always">Display Always</option>
                      <option value="once">Display Once</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mova Action */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Mova Action</h4>
                <div className="space-y-3">
                  <ColorPicker
                    label="Text Color"
                    value={colors.movelapRows?.movaAction.color || DEFAULT_MOVELAP_ROWS.movaAction.color}
                    onChange={(v) => {
                      const newRows: MovelapRowSettings = { 
                        ...DEFAULT_MOVELAP_ROWS,
                        ...colors.movelapRows,
                        movaAction: { 
                          ...DEFAULT_MOVELAP_ROWS.movaAction,
                          ...(colors.movelapRows?.movaAction || {}), 
                          color: v 
                        }
                      };
                      handleColorChange('movelapRows', newRows);
                    }}
                  />
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={colors.movelapRows?.movaAction.bold ?? true}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          movaAction: { 
                            ...DEFAULT_MOVELAP_ROWS.movaAction,
                            ...(colors.movelapRows?.movaAction || {}), 
                            bold: e.target.checked 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    Bold
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Mode</label>
                    <select
                      value={colors.movelapRows?.movaAction.displayMode || 'always'}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          movaAction: { 
                            ...DEFAULT_MOVELAP_ROWS.movaAction,
                            ...(colors.movelapRows?.movaAction || {}), 
                            displayMode: e.target.value as 'always' | 'once' 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="always">Display Always</option>
                      <option value="once">Display Once</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Exercise */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Exercise</h4>
                <div className="space-y-3">
                  <ColorPicker
                    label="Text Color"
                    value={colors.movelapRows?.exercise.color || DEFAULT_MOVELAP_ROWS.exercise.color}
                    onChange={(v) => {
                      const newRows: MovelapRowSettings = { 
                        ...DEFAULT_MOVELAP_ROWS,
                        ...colors.movelapRows,
                        exercise: { 
                          ...DEFAULT_MOVELAP_ROWS.exercise,
                          ...(colors.movelapRows?.exercise || {}), 
                          color: v 
                        }
                      };
                      handleColorChange('movelapRows', newRows);
                    }}
                  />
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={colors.movelapRows?.exercise.bold ?? true}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          exercise: { 
                            ...DEFAULT_MOVELAP_ROWS.exercise,
                            ...(colors.movelapRows?.exercise || {}), 
                            bold: e.target.checked 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    Bold
                  </label>
                </div>
              </div>

              {/* Style */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Style</h4>
                <ColorPicker
                  label="Text Color"
                  value={colors.movelapRows?.style.color || DEFAULT_MOVELAP_ROWS.style.color}
                  onChange={(v) => {
                    const newRows: MovelapRowSettings = { 
                      ...DEFAULT_MOVELAP_ROWS,
                      ...colors.movelapRows,
                      style: { 
                        ...DEFAULT_MOVELAP_ROWS.style,
                        ...(colors.movelapRows?.style || {}), 
                        color: v 
                      }
                    };
                    handleColorChange('movelapRows', newRows);
                  }}
                />
              </div>

              {/* Speed */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Speed</h4>
                <div className="space-y-3">
                  <ColorPicker
                    label="Text Color"
                    value={colors.movelapRows?.speed.color || DEFAULT_MOVELAP_ROWS.speed.color}
                    onChange={(v) => {
                      const newRows: MovelapRowSettings = { 
                        ...DEFAULT_MOVELAP_ROWS,
                        ...colors.movelapRows,
                        speed: { 
                          ...DEFAULT_MOVELAP_ROWS.speed,
                          ...(colors.movelapRows?.speed || {}), 
                          color: v 
                        }
                      };
                      handleColorChange('movelapRows', newRows);
                    }}
                  />
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={colors.movelapRows?.speed.bold ?? true}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          speed: { 
                            ...DEFAULT_MOVELAP_ROWS.speed,
                            ...(colors.movelapRows?.speed || {}), 
                            bold: e.target.checked 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    Bold
                  </label>
                </div>
              </div>

              {/* Time */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Time</h4>
                <div className="space-y-3">
                  <ColorPicker
                    label="Text Color"
                    value={colors.movelapRows?.time.color || DEFAULT_MOVELAP_ROWS.time.color}
                    onChange={(v) => {
                      const newRows: MovelapRowSettings = { 
                        ...DEFAULT_MOVELAP_ROWS,
                        ...colors.movelapRows,
                        time: { 
                          ...DEFAULT_MOVELAP_ROWS.time,
                          ...(colors.movelapRows?.time || {}), 
                          color: v 
                        }
                      };
                      handleColorChange('movelapRows', newRows);
                    }}
                  />
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={colors.movelapRows?.time.bold ?? true}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          time: { 
                            ...DEFAULT_MOVELAP_ROWS.time,
                            ...(colors.movelapRows?.time || {}), 
                            bold: e.target.checked 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    Bold
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                    <select
                      value={colors.movelapRows?.time.fontStyle || 'normal'}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          time: { 
                            ...DEFAULT_MOVELAP_ROWS.time,
                            ...(colors.movelapRows?.time || {}), 
                            fontStyle: e.target.value as 'normal' | 'italic' 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pace */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Pace</h4>
                <div className="space-y-3">
                  <ColorPicker
                    label="Text Color"
                    value={colors.movelapRows?.pace.color || DEFAULT_MOVELAP_ROWS.pace.color}
                    onChange={(v) => {
                      const newRows: MovelapRowSettings = { 
                        ...DEFAULT_MOVELAP_ROWS,
                        ...colors.movelapRows,
                        pace: { 
                          ...DEFAULT_MOVELAP_ROWS.pace,
                          ...(colors.movelapRows?.pace || {}), 
                          color: v 
                        }
                      };
                      handleColorChange('movelapRows', newRows);
                    }}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                    <select
                      value={colors.movelapRows?.pace.fontStyle || 'normal'}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          pace: { 
                            ...DEFAULT_MOVELAP_ROWS.pace,
                            ...(colors.movelapRows?.pace || {}), 
                            fontStyle: e.target.value as 'normal' | 'italic' 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Recover/Rest */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Recover/Rest</h4>
                <div className="space-y-3">
                  <ColorPicker
                    label="Text Color"
                    value={colors.movelapRows?.recoverRest.color || DEFAULT_MOVELAP_ROWS.recoverRest.color}
                    onChange={(v) => {
                      const newRows: MovelapRowSettings = { 
                        ...DEFAULT_MOVELAP_ROWS,
                        ...colors.movelapRows,
                        recoverRest: { 
                          ...DEFAULT_MOVELAP_ROWS.recoverRest,
                          ...(colors.movelapRows?.recoverRest || {}), 
                          color: v 
                        }
                      };
                      handleColorChange('movelapRows', newRows);
                    }}
                  />
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={colors.movelapRows?.recoverRest.bold ?? true}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          recoverRest: { 
                            ...DEFAULT_MOVELAP_ROWS.recoverRest,
                            ...(colors.movelapRows?.recoverRest || {}), 
                            bold: e.target.checked 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    Bold
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                    <select
                      value={colors.movelapRows?.recoverRest.fontStyle || 'normal'}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          recoverRest: { 
                            ...DEFAULT_MOVELAP_ROWS.recoverRest,
                            ...(colors.movelapRows?.recoverRest || {}), 
                            fontStyle: e.target.value as 'normal' | 'italic' 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Restart To */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Restart To</h4>
                <div className="space-y-3">
                  <ColorPicker
                    label="Text Color"
                    value={colors.movelapRows?.restartTo.color || DEFAULT_MOVELAP_ROWS.restartTo.color}
                    onChange={(v) => {
                      const newRows: MovelapRowSettings = { 
                        ...DEFAULT_MOVELAP_ROWS,
                        ...colors.movelapRows,
                        restartTo: { 
                          ...DEFAULT_MOVELAP_ROWS.restartTo,
                          ...(colors.movelapRows?.restartTo || {}), 
                          color: v 
                        }
                      };
                      handleColorChange('movelapRows', newRows);
                    }}
                  />
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={colors.movelapRows?.restartTo.bold ?? true}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          restartTo: { 
                            ...DEFAULT_MOVELAP_ROWS.restartTo,
                            ...(colors.movelapRows?.restartTo || {}), 
                            bold: e.target.checked 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    Bold
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                    <select
                      value={colors.movelapRows?.restartTo.fontStyle || 'normal'}
                      onChange={(e) => {
                        const newRows: MovelapRowSettings = { 
                          ...DEFAULT_MOVELAP_ROWS,
                          ...colors.movelapRows,
                          restartTo: { 
                            ...DEFAULT_MOVELAP_ROWS.restartTo,
                            ...(colors.movelapRows?.restartTo || {}), 
                            fontStyle: e.target.value as 'normal' | 'italic' 
                          }
                        };
                        handleColorChange('movelapRows', newRows);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Annotations */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Annotations</h4>
                <ColorPicker
                  label="Text Color"
                  value={colors.movelapRows?.annotations.color || DEFAULT_MOVELAP_ROWS.annotations.color}
                  onChange={(v) => {
                    const newRows: MovelapRowSettings = { 
                      ...DEFAULT_MOVELAP_ROWS,
                      ...colors.movelapRows,
                      annotations: { 
                        ...DEFAULT_MOVELAP_ROWS.annotations,
                        ...(colors.movelapRows?.annotations || {}), 
                        color: v 
                      }
                    };
                    handleColorChange('movelapRows', newRows);
                  }}
                />
              </div>

              {/* Aim & Sound */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Aim & Sound</h4>
                <ColorPicker
                  label="Text Color"
                  value={colors.movelapRows?.aimSound.color || DEFAULT_MOVELAP_ROWS.aimSound.color}
                  onChange={(v) => {
                    const newRows: MovelapRowSettings = { 
                      ...DEFAULT_MOVELAP_ROWS,
                      ...colors.movelapRows,
                      aimSound: { 
                        ...DEFAULT_MOVELAP_ROWS.aimSound,
                        ...(colors.movelapRows?.aimSound || {}), 
                        color: v 
                      }
                    };
                    handleColorChange('movelapRows', newRows);
                  }}
                />
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Live Preview
            </h3>

            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                backgroundColor: colors.pageBackground,
                opacity: colors.pageBackgroundOpacity / 100,
                boxSizing: 'border-box'
              }}
            >
              {/* Row 1: Week Header */}
              <div
                className="p-3 rounded-lg font-bold"
                style={{
                  backgroundColor: colors.weekHeader,
                  color: colors.weekHeaderText,
                  boxSizing: 'border-box',
                  border: colors.dayBorderEnabled
                    ? `${
                        colors.dayBorderWidth === 'very-thin' ? '1px' :
                        colors.dayBorderWidth === 'thin' ? '2px' :
                        colors.dayBorderWidth === 'thick' ? '4px' : '3px'
                      } solid ${colors.dayBorderColor || '#000000'}`
                    : '3px solid transparent'
                }}
              >
                Week 1
              </div>

              {/* Row 2: Day 1 (Monday) - indented, uses dayHeader colors */}
              <div className="flex justify-end">
                <div
                  className="p-3 rounded-lg font-bold"
                  style={{
                    width: '92%',
                    backgroundColor: colors.dayHeader,
                    color: colors.dayHeaderText,
                    boxSizing: 'border-box',
                    border: colors.dayBorderEnabled
                      ? `${
                          colors.dayBorderWidth === 'very-thin' ? '1px' :
                          colors.dayBorderWidth === 'thin' ? '2px' :
                          colors.dayBorderWidth === 'thick' ? '4px' : '3px'
                        } solid ${colors.dayBorderColor || '#000000'}`
                      : '3px solid transparent'
                  }}
                >
                  Monday - week 1
                </div>
              </div>

              {/* Row 3: Day 2 (Tuesday) - indented, uses dayAlternateRow colors */}
              <div className="flex justify-end">
                <div
                  className="p-3 rounded-lg font-bold"
                  style={{
                    width: '92%',
                    backgroundColor: colors.dayAlternateRow,
                    color: colors.dayAlternateRowText,
                    boxSizing: 'border-box',
                    border: colors.dayBorderEnabled
                      ? `${
                          colors.dayBorderWidth === 'very-thin' ? '1px' :
                          colors.dayBorderWidth === 'thin' ? '2px' :
                          colors.dayBorderWidth === 'thick' ? '4px' : '3px'
                        } solid ${colors.dayBorderColor || '#000000'}`
                      : '3px solid transparent'
                  }}
                >
                  Tuesday - week 1
                </div>
              </div>

              {/* Row 4: Workout 1 - indented to Tuesday, 84% width (92% of 92%) */}
              <div className="flex justify-end">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    width: '84%',
                    backgroundColor: colors.workoutHeader,
                    color: colors.workoutHeaderText,
                    boxSizing: 'border-box',
                    border: colors.workoutBorderEnabled
                      ? `${
                          colors.workoutBorderWidth === 'very-thin' ? '1px' :
                          colors.workoutBorderWidth === 'thin' ? '2px' :
                          colors.workoutBorderWidth === 'thick' ? '4px' : '3px'
                        } solid ${colors.workoutBorderColor || '#000000'}`
                      : '3px solid transparent'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Workout 1 - Tuesday 23</span>
                    <div className="flex gap-1">
                      <button
                        className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                        style={{
                          backgroundColor: hoveredButton === 'add' ? colors.buttonAddHover : colors.buttonAdd,
                          color: colors.buttonAddHeaderText
                        }}
                        onMouseEnter={() => setHoveredButton('add')}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        Add
                      </button>
                      <button
                        className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                        style={{
                          backgroundColor: hoveredButton === 'edit' ? colors.buttonEditHover : colors.buttonEdit,
                          color: colors.buttonEditHeaderText
                        }}
                        onMouseEnter={() => setHoveredButton('edit')}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                        style={{
                          backgroundColor: hoveredButton === 'delete' ? colors.buttonDeleteHover : colors.buttonDelete,
                          color: colors.buttonDeleteHeaderText
                        }}
                        onMouseEnter={() => setHoveredButton('delete')}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        Delete
                      </button>
                      <button
                        className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                        style={{
                          backgroundColor: hoveredButton === 'print' ? colors.buttonPrintHover : colors.buttonPrint,
                          color: colors.buttonPrintHeaderText
                        }}
                        onMouseEnter={() => setHoveredButton('print')}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5: Workout 2 - indented to Tuesday, 84% width (92% of 92%) */}
              <div className="flex justify-end">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    width: '84%',
                    backgroundColor: colors.workout2Header,
                    color: colors.workout2HeaderText,
                    boxSizing: 'border-box',
                    border: colors.workoutBorderEnabled
                      ? `${
                          colors.workoutBorderWidth === 'very-thin' ? '1px' :
                          colors.workoutBorderWidth === 'thin' ? '2px' :
                          colors.workoutBorderWidth === 'thick' ? '4px' : '3px'
                        } solid ${colors.workoutBorderColor || '#000000'}`
                      : '3px solid transparent'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Workout 2 - Tuesday 23</span>
                    <div className="flex gap-1">
                      <button className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: colors.buttonAdd, color: colors.buttonAddHeaderText }}>Add</button>
                      <button className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: colors.buttonEdit, color: colors.buttonEditHeaderText }}>Edit</button>
                      <button className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: colors.buttonDelete, color: colors.buttonDeleteHeaderText }}>Delete</button>
                      <button className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: colors.buttonPrint, color: colors.buttonPrintHeaderText }}>Print</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 6: Moveframe A - indented to Workout, 77% width (92% of 84%) */}
              <div className="flex justify-end">
                <div
                  className="p-2.5 rounded font-semibold text-sm"
                  style={{
                    width: '77%',
                    backgroundColor: colors.moveframeHeader,
                    color: colors.moveframeHeaderText,
                    boxSizing: 'border-box',
                    border: colors.moveframeBorderEnabled
                      ? `${
                          colors.moveframeBorderWidth === 'very-thin' ? '1px' :
                          colors.moveframeBorderWidth === 'thin' ? '2px' :
                          colors.moveframeBorderWidth === 'thick' ? '4px' : '3px'
                        } solid ${colors.moveframeBorderColor || '#000000'}`
                      : '3px solid transparent'
                  }}
                >
                  Moveframe A Warmup
                </div>
              </div>

              {/* Row 7: Moveframe B (Alternate) - indented to Workout, 77% width (92% of 84%) */}
              <div className="flex justify-end">
                <div
                  className="p-2.5 rounded font-semibold text-sm"
                  style={{
                    width: '77%',
                    backgroundColor: colors.alternateRowMoveframe,
                    color: colors.alternateRowTextMoveframe,
                    boxSizing: 'border-box',
                    border: colors.moveframeBorderEnabled
                      ? `${
                          colors.moveframeBorderWidth === 'very-thin' ? '1px' :
                          colors.moveframeBorderWidth === 'thin' ? '2px' :
                          colors.moveframeBorderWidth === 'thick' ? '4px' : '3px'
                        } solid ${colors.moveframeBorderColor || '#000000'}`
                      : '3px solid transparent'
                  }}
                >
                  Moveframe B - 100 × 4 A2 Break 1'30"
                </div>
              </div>

              {/* Rows 7-10: Movelap Rows - 60% width, right-sided */}
              <div className="space-y-1 flex flex-col items-end">
                {[1, 2, 3, 4].map((row) => (
                  <div
                    key={row}
                    className="p-2 rounded text-xs flex justify-between items-center"
                    style={{
                      width: '60%',
                      backgroundColor: row % 2 === 0 ? colors.alternateRowMovelap : colors.movelapHeader,
                      color: colors.movelapHeaderText,
                      boxSizing: 'border-box',
                      border: colors.movelapBorderEnabled
                        ? `${
                            colors.movelapBorderWidth === 'very-thin' ? '1px' :
                            colors.movelapBorderWidth === 'thin' ? '2px' :
                            colors.movelapBorderWidth === 'thick' ? '4px' : '3px'
                          } solid ${colors.movelapBorderColor || '#000000'}`
                        : '3px solid transparent'
                    }}
                  >
                    <span className="font-medium">Lap #{row}</span>
                    <span>100m - A2 - B 1'30"</span>
                  </div>
                ))}
              </div>

              {/* Row 11: Microlap Details - 35% width, right-sided */}
              <div className="flex justify-end">
                <div
                  className="p-3 rounded"
                  style={{
                    width: '35%',
                    backgroundColor: colors.microlapBackground,
                    color: colors.microlapText,
                    boxSizing: 'border-box',
                    border: colors.movelapBorderEnabled
                      ? `${
                          colors.movelapBorderWidth === 'very-thin' ? '1px' :
                          colors.movelapBorderWidth === 'thin' ? '2px' :
                          colors.movelapBorderWidth === 'thick' ? '4px' : '3px'
                        } solid ${colors.movelapBorderColor || '#000000'}`
                      : '3px solid transparent'
                  }}
                >
                  <h4 className="font-semibold text-sm mb-2">Microlap Details</h4>
                  <div className="text-xs space-y-1">
                    <div>Distance: 400m</div>
                    <div>Speed: A2</div>
                    <div>Pause: 1:30</div>
                  </div>
                </div>
              </div>

              {/* Row 12: Selected Row - Active Moveframe */}
              <div
                className="p-3 rounded font-semibold text-sm"
                style={{
                  backgroundColor: colors.selectedRow,
                  color: colors.selectedRowText,
                  boxSizing: 'border-box',
                  border: '3px solid transparent'
                }}
              >
                Selected Row - Active Moveframe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

