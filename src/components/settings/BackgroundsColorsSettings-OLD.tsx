'use client';

import { useState } from 'react';
import { Palette, Eye, RefreshCw, Download, Upload, Save, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ColorSettings {
  pageBackground: string;
  pageBackgroundOpacity: number;
  dayHeader: string;
  dayHeaderText: string;
  moveframeHeader: string;
  moveframeHeaderText: string;
  movelapHeader: string;
  movelapHeaderText: string;
  microlapBackground: string;
  microlapText: string;
  selectedRow: string;
  selectedRowText: string;
  alternateRow: string;
  alternateRowText: string;
  buttonAdd: string;
  buttonAddHover: string;
  buttonAddText: string;
  buttonEdit: string;
  buttonEditHover: string;
  buttonEditText: string;
  buttonDelete: string;
  buttonDeleteHover: string;
  buttonDeleteText: string;
  buttonPrint: string;
  buttonPrintHover: string;
  buttonPrintText: string;
}

const defaultColors: ColorSettings = {
  pageBackground: '#ffffff',
  pageBackgroundOpacity: 100,
  dayHeader: '#f8fafc',
  dayHeaderText: '#1e293b',
  moveframeHeader: '#e0f2fe',
  moveframeHeaderText: '#0c4a6e',
  movelapHeader: '#dbeafe',
  movelapHeaderText: '#1e3a8a',
  microlapBackground: '#f8fafc',
  microlapText: '#334155',
  selectedRow: '#3b82f6',
  selectedRowText: '#ffffff',
  alternateRow: '#f1f5f9',
  alternateRowText: '#1e293b',
  buttonAdd: '#10b981',
  buttonAddHover: '#059669',
  buttonAddText: '#ffffff',
  buttonEdit: '#f59e0b',
  buttonEditHover: '#d97706',
  buttonEditText: '#ffffff',
  buttonDelete: '#ef4444',
  buttonDeleteHover: '#dc2626',
  buttonDeleteText: '#ffffff',
  buttonPrint: '#6b7280',
  buttonPrintHover: '#4b5563',
  buttonPrintText: '#ffffff',
};

interface ColorScheme {
  name: string;
  colors: ColorSettings;
}

export default function BackgroundsColorsSettings() {
  const { t } = useLanguage();
  const [colors, setColors] = useState<ColorSettings>(defaultColors);
  const [previewMode, setPreviewMode] = useState(false);
  const [savedSchemes, setSavedSchemes] = useState<ColorScheme[]>([]);
  const [schemeName, setSchemeName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const textColorOptions = [
    { value: '#ffffff', label: t('color_white') },
    { value: '#000000', label: t('color_black') },
    { value: '#1e293b', label: 'Dark Slate' },
    { value: '#6b7280', label: t('color_grey') },
    { value: '#ef4444', label: t('color_red') },
    { value: '#3b82f6', label: t('color_blue') },
    { value: '#10b981', label: t('color_green') },
    { value: '#eab308', label: t('color_yellow') }
  ];

  const handleColorChange = (key: keyof ColorSettings, value: string | number) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setColors(defaultColors);
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
    const dataStr = JSON.stringify(colors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `movesbook-colors-${Date.now()}.json`;
    link.click();
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
            className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition"
            style={{ backgroundColor: value }}
            onClick={() => {
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
        className="w-full h-2 bg-gradient-to-r from-transparent to-blue-500 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, transparent 0%, ${colors.pageBackground} ${value}%)`
        }}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Backgrounds & Colors</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              previewMode
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-5 h-5" />
            <span>Preview</span>
          </button>
          <button
            onClick={resetToDefaults}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Settings */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-6 border border-cyan-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="w-6 h-6 mr-3 text-cyan-600" />
              {t('color_configuration')}
            </h3>
            
            <div className="space-y-4">
              <ColorPicker
                label={t('color_page_background')}
                value={colors.pageBackground}
                onChange={(value) => handleColorChange('pageBackground', value)}
              />
              <ColorPicker
                label={t('color_day_header')}
                value={colors.dayHeader}
                onChange={(value) => handleColorChange('dayHeader', value)}
              />
              <ColorPicker
                label={t('color_moveframe_header')}
                value={colors.moveframeHeader}
                onChange={(value) => handleColorChange('moveframeHeader', value)}
              />
              <ColorPicker
                label={t('color_movelap_header')}
                value={colors.movelapHeader}
                onChange={(value) => handleColorChange('movelapHeader', value)}
              />
              <ColorPicker
                label={t('color_microlap_background')}
                value={colors.microlapBackground}
                onChange={(value) => handleColorChange('microlapBackground', value)}
              />
              <ColorPicker
                label={t('color_selected_row')}
                value={colors.selectedRow}
                onChange={(value) => handleColorChange('selectedRow', value)}
              />
              <ColorPicker
                label={t('color_alternate_row')}
                value={colors.alternateRow}
                onChange={(value) => handleColorChange('alternateRow', value)}
              />
            </div>
          </div>

          {/* Button Colors */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('color_button_colors')}</h3>
            <div className="space-y-4">
              <ColorPicker
                label={t('color_button_add')}
                value={colors.buttonAdd}
                onChange={(value) => handleColorChange('buttonAdd', value)}
              />
              <ColorPicker
                label={t('color_button_edit')}
                value={colors.buttonEdit}
                onChange={(value) => handleColorChange('buttonEdit', value)}
              />
              <ColorPicker
                label={t('color_button_delete')}
                value={colors.buttonDelete}
                onChange={(value) => handleColorChange('buttonDelete', value)}
              />
              <ColorPicker
                label={t('color_button_print')}
                value={colors.buttonPrint}
                onChange={(value) => handleColorChange('buttonPrint', value)}
              />
            </div>
          </div>

          {/* Text Colors */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Text Colors</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="font-semibold text-gray-700">{t('color_header_text')}</span>
                <select
                  value={colors.headerTextColor}
                  onChange={(e) => handleColorChange('headerTextColor', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {textColorOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Preview</h3>
            
            <div 
              className="rounded-2xl border-2 border-dashed border-gray-300 p-6 space-y-4"
              style={{ backgroundColor: colors.pageBackground }}
            >
              {/* Day Header Preview */}
              <div 
                className="p-4 rounded-xl font-semibold"
                style={{ 
                  backgroundColor: colors.dayHeader,
                  color: colors.headerTextColor
                }}
              >
                Monday - Week 1
              </div>

              {/* Moveframe Header Preview */}
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: colors.moveframeHeader }}
              >
                <div className="flex justify-between items-center">
                  <span style={{ color: colors.headerTextColor }}>Moveframe A - Swimming</span>
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 rounded text-white text-sm font-semibold"
                      style={{ backgroundColor: colors.buttonAdd }}
                    >
                      Add
                    </button>
                    <button 
                      className="px-3 py-1 rounded text-white text-sm font-semibold"
                      style={{ backgroundColor: colors.buttonEdit }}
                    >
                      Edit
                    </button>
                    <button 
                      className="px-3 py-1 rounded text-white text-sm font-semibold"
                      style={{ backgroundColor: colors.buttonDelete }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Movelap Rows Preview */}
              <div className="space-y-2">
                {[1, 2, 3].map((row, index) => (
                  <div
                    key={row}
                    className={`p-3 rounded-lg ${
                      index === 1 ? 'border-2 border-blue-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : colors.alternateRow
                    }}
                  >
                    <div className="flex justify-between">
                      <span>Movelap {row}</span>
                      <span>100m • A2 • 1:30</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Row Preview */}
              <div 
                className="p-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: colors.selectedRow }}
              >
                Selected Row - Active Moveframe
              </div>

              {/* Microlap Preview */}
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.microlapBackground }}
              >
                <h4 className="font-semibold mb-2">Microlap Details</h4>
                <div className="text-sm space-y-1">
                  <div>Distance: 400m</div>
                  <div>Speed: A2</div>
                  <div>Pause: 1:30</div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette Suggestions */}
          <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl border border-cyan-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Color Themes</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Ocean', colors: ['#06b6d4', '#3b82f6', '#6366f1'] },
                { name: 'Forest', colors: ['#10b981', '#059669', '#047857'] },
                { name: 'Sunset', colors: ['#f59e0b', '#ea580c', '#dc2626'] },
                { name: 'Berry', colors: ['#ec4899', '#a855f7', '#8b5cf6'] },
                { name: 'Slate', colors: ['#64748b', '#475569', '#334155'] },
                { name: 'Custom', colors: ['#000000', '#000000', '#000000'] }
              ].map((theme, index) => (
                <button
                  key={theme.name}
                  className="p-4 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-300"
                  onClick={() => {
                    // Apply theme colors
                    handleColorChange('buttonAdd', theme.colors[0]);
                    handleColorChange('buttonEdit', theme.colors[1]);
                    handleColorChange('selectedRow', theme.colors[2]);
                  }}
                >
                  <div className="flex space-x-1 mb-2">
                    {theme.colors.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}