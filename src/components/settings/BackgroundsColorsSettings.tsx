'use client';

import { useState } from 'react';
import { Palette, Eye, RefreshCw } from 'lucide-react';

interface ColorSettings {
  pageBackground: string;
  dayHeader: string;
  moveframeHeader: string;
  movelapHeader: string;
  microlapBackground: string;
  selectedRow: string;
  buttonAdd: string;
  buttonEdit: string;
  buttonDelete: string;
  buttonPrint: string;
  alternateRow: string;
  headerTextColor: string;
}

const defaultColors: ColorSettings = {
  pageBackground: '#ffffff',
  dayHeader: '#f8fafc',
  moveframeHeader: '#f1f5f9',
  movelapHeader: '#e2e8f0',
  microlapBackground: '#f8fafc',
  selectedRow: '#3b82f6',
  buttonAdd: '#10b981',
  buttonEdit: '#f59e0b',
  buttonDelete: '#ef4444',
  buttonPrint: '#6b7280',
  alternateRow: '#f1f5f9',
  headerTextColor: '#000000'
};

const textColorOptions = [
  { value: '#ffffff', label: 'White' },
  { value: '#000000', label: 'Black' },
  { value: '#6b7280', label: 'Grey' },
  { value: '#ef4444', label: 'Red' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#eab308', label: 'Yellow' }
];

export default function BackgroundsColorsSettings() {
  const [colors, setColors] = useState<ColorSettings>(defaultColors);
  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (key: keyof ColorSettings, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setColors(defaultColors);
  };

  const ColorPicker = ({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
      <span className="font-semibold text-gray-700">{label}</span>
      <div className="flex items-center space-x-3">
        <div 
          className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer"
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
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
        />
      </div>
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
              Color Configuration
            </h3>
            
            <div className="space-y-4">
              <ColorPicker
                label="Page Background"
                value={colors.pageBackground}
                onChange={(value) => handleColorChange('pageBackground', value)}
              />
              <ColorPicker
                label="Day Header"
                value={colors.dayHeader}
                onChange={(value) => handleColorChange('dayHeader', value)}
              />
              <ColorPicker
                label="Moveframe Header"
                value={colors.moveframeHeader}
                onChange={(value) => handleColorChange('moveframeHeader', value)}
              />
              <ColorPicker
                label="Movelap Header"
                value={colors.movelapHeader}
                onChange={(value) => handleColorChange('movelapHeader', value)}
              />
              <ColorPicker
                label="Microlap Background"
                value={colors.microlapBackground}
                onChange={(value) => handleColorChange('microlapBackground', value)}
              />
              <ColorPicker
                label="Selected Row"
                value={colors.selectedRow}
                onChange={(value) => handleColorChange('selectedRow', value)}
              />
              <ColorPicker
                label="Alternate Row"
                value={colors.alternateRow}
                onChange={(value) => handleColorChange('alternateRow', value)}
              />
            </div>
          </div>

          {/* Button Colors */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Button Colors</h3>
            <div className="space-y-4">
              <ColorPicker
                label="Add Button"
                value={colors.buttonAdd}
                onChange={(value) => handleColorChange('buttonAdd', value)}
              />
              <ColorPicker
                label="Edit Button"
                value={colors.buttonEdit}
                onChange={(value) => handleColorChange('buttonEdit', value)}
              />
              <ColorPicker
                label="Delete Button"
                value={colors.buttonDelete}
                onChange={(value) => handleColorChange('buttonDelete', value)}
              />
              <ColorPicker
                label="Print Button"
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
                <span className="font-semibold text-gray-700">Header Text Color</span>
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