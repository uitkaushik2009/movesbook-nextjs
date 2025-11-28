'use client';

import { useState, useEffect } from 'react';
import { Palette, Eye, RefreshCw, Download, Upload, Save, AlertCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useUserSettings } from '@/hooks/useUserSettings';

interface ColorSettings {
  pageBackground: string;
  pageBackgroundOpacity: number;
  dayHeader: string;
  dayHeaderText: string;
  workoutHeader: string;
  workoutHeaderText: string;
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
  alternateRowMovelap: string;
  alternateRowTextMovelap: string;  
  buttonAdd: string;
  buttonAddHover: string;
  buttonAddText: string;
  buttonAddHeaderText: string;
  buttonEdit: string;
  buttonEditHover: string;
  buttonEditText: string;
  buttonDelete: string;
  buttonDeleteHover: string;
  buttonDeleteText: string;
  buttonPrint: string;
  buttonPrintHover: string;
  buttonPrintText: string;
  buttonEditHeaderText: string;
  buttonDeleteHeaderText: string;
  buttonPrintHeaderText: string;
  selectedRowMovelap: string;
  selectedRowTextMovelap: string;
  selectedRowMoveframe: string;
  selectedRowTextMoveframe: string;
  alternateRowMoveframe: string;
  alternateRowTextMoveframe: string;
}

const defaultColors: ColorSettings = {
  pageBackground: '#eeefe6',
  pageBackgroundOpacity: 89,
  dayHeader: '#5168c2',
  dayHeaderText: '#e6e6ad',
  workoutHeader: '#c6f8e2',
  workoutHeaderText: '#0c4a6e',
  moveframeHeader: '#f7f2bb',
  moveframeHeaderText: '#f61909',
  movelapHeader: '#f7f2bb',
  movelapHeaderText: '#f61909',
  microlapBackground: '#f1f5f9',
  microlapText: '#334155',
  selectedRow: '#fef08a',
  selectedRowText: '#ef4444',
  alternateRow: '#f1f5f9',
  alternateRowText: '#1e293b',
  buttonAdd: '#10b981',
  buttonAddHover: '#059669',
  buttonAddText: '#ffffff',
  buttonAddHeaderText: '#ffffff',
  buttonEdit: '#f59e0b',
  buttonEditHover: '#d97706',
  buttonEditText: '#ffffff',
  buttonDelete: '#ef4444',
  buttonDeleteHover: '#dc2626',
  buttonDeleteText: '#ffffff',
  buttonPrint: '#6b7280',
  buttonPrintHover: '#4b5563',
  buttonPrintText: '#ffffff',
  buttonPrintHeaderText: '#ffffff',
  buttonEditHeaderText: '#ffffff',
  buttonDeleteHeaderText: '#ffffff',
  alternateRowMovelap: '#dbeafe',
  alternateRowTextMovelap: '#1e293b',
  selectedRowMovelap: '#fef08a',
  selectedRowTextMovelap: '#ef4444',
  alternateRowMoveframe: '#fef3c7',
  alternateRowTextMoveframe: '#ef4444',
  selectedRowMoveframe: '#fef08a',
  selectedRowTextMoveframe: '#ef4444',
};

interface ColorScheme {
  name: string;
  colors: ColorSettings;
}

export default function BackgroundsColorsSettings() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { settings: dbSettings, updateSetting: updateDbSetting, loading } = useUserSettings(user?.id);
  
  const [colors, setColors] = useState<ColorSettings>(defaultColors);
  const [savedSchemes, setSavedSchemes] = useState<ColorScheme[]>([]);
  const [schemeName, setSchemeName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportName, setExportName] = useState('');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    headers: true,
    buttons: true,
    rows: false,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

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

  // Load saved schemes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('colorSchemes');
    if (saved) {
      try {
        setSavedSchemes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load color schemes');
      }
    }
  }, []);

  const handleColorChange = async (key: keyof ColorSettings, value: string | number) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    
    // Save to database
    try {
      setSaveStatus('saving');
      await updateDbSetting('colorSettings', newColors);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving color settings:', error);
      // Fallback to localStorage
      localStorage.setItem('colorSettings', JSON.stringify(newColors));
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
    <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl border border-cyan-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-white/50 transition"
      >
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Palette className="w-6 h-6 mr-3 text-cyan-600" />
          {title}
        </h3>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {expanded && (
        <div className="p-6 pt-0 space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
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
        <div className="flex gap-3">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Save className="w-4 h-4" />
            Save Scheme
          </button>
          <button
            onClick={exportSettings}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={importSettings}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
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

      {/* Saved Schemes */}
      {savedSchemes.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Saved Color Schemes</h3>
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
            </div>
          </div>

          {/* Headers Section */}
          <CollapsibleSection
            title="Headers Configuration"
            expanded={expandedSections.headers}
            onToggle={() => toggleSection('headers')}
          >
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
              label="Workout Header Background"
              value={colors.workoutHeader}
              onChange={(v) => handleColorChange('workoutHeader', v)}
            />
            <ColorPicker
              label="Workout Header Text"
              value={colors.workoutHeaderText}
              onChange={(v) => handleColorChange('workoutHeaderText', v)}
              showContrast
              bgColor={colors.moveframeHeader}
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
              label="Movelap Header Background"
              value={colors.movelapHeader}
              onChange={(v) => handleColorChange('movelapHeader', v)}
            />
            <ColorPicker
              label="Movelap Header Text"
              value={colors.movelapHeaderText}
              onChange={(v) => handleColorChange('movelapHeaderText', v)}
              showContrast
              bgColor={colors.movelapHeader}
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
              label="Alternate Row Background of the Moveframes"
              value={colors.alternateRow}
              onChange={(v) => handleColorChange('alternateRow', v)}
            />
            <ColorPicker
              label="Alternate Row Text of the Moveframes"
              value={colors.alternateRowText}
              onChange={(v) => handleColorChange('alternateRowText', v)}
            />
            <ColorPicker
              label="Alternate Row Background of the Movelaps"
              value={colors.alternateRowMovelap}
              onChange={(v) => handleColorChange('alternateRowMovelap', v)}
            />
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
        </div>

        {/* Right Panel - Live Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Live Preview
            </h3>
            
            <div 
              className="rounded-xl border-2 border-dashed border-gray-300 p-6 space-y-4"
              style={{ 
                backgroundColor: colors.pageBackground,
                opacity: colors.pageBackgroundOpacity / 100
              }}
            >
              {/* Day Header */}
              <div 
                className="p-4 rounded-lg font-bold text-lg"
                style={{ 
                  backgroundColor: colors.dayHeader,
                  color: colors.dayHeaderText
                }}
              >
                Monday - Week 1
              </div>

              {/* Moveframe Header with Buttons */}
              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: colors.workoutHeader,
                  color: colors.workoutHeaderText
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Moveframe A - Swimming</span>
                  <div className="flex gap-2">
                    <button 
                      className="px-4 py-2 rounded-lg text-white font-semibold text-sm transition"
                      style={{ 
                        backgroundColor: hoveredButton === 'add' ? colors.buttonAddHover : colors.buttonAdd
                      }}
                      onMouseEnter={() => setHoveredButton('add')}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      Add
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg text-white font-semibold text-sm transition"
                      style={{ 
                        backgroundColor: hoveredButton === 'edit' ? colors.buttonEditHover : colors.buttonEdit
                      }}
                      onMouseEnter={() => setHoveredButton('edit')}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      Edit
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg text-white font-semibold text-sm transition"
                      style={{ 
                        backgroundColor: hoveredButton === 'delete' ? colors.buttonDeleteHover : colors.buttonDelete
                      }}
                      onMouseEnter={() => setHoveredButton('delete')}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      Delete
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg text-white font-semibold text-sm transition"
                      style={{ 
                        backgroundColor: hoveredButton === 'print' ? colors.buttonPrintHover : colors.buttonPrint
                      }}
                      onMouseEnter={() => setHoveredButton('print')}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      Print
                    </button>
                  </div>
                </div>

                {/* Movelap Header */}
                <div 
                  className="p-3 rounded-lg font-semibold"
                  style={{ 
                    backgroundColor: colors.moveframeHeader,
                    color: colors.moveframeHeaderText
                  }}
                >
                  Movelap 1 - Warm Up
                </div>
              </div>

              {/* Row Examples with Zebra Striping */}
              <div className="space-y-2">
                {[1, 2, 3, 4].map((row) => (
                  <div
                    key={row}
                    className="p-3 rounded-lg"
                    style={{ 
                      backgroundColor: row % 2 === 0 ? colors.alternateRow : 'white',
                      color: row % 2 === 0 ? colors.movelapHeaderText : colors.movelapHeaderText
                    }}
                  >
                    <div className="flex justify-between">
                      <span>Lap # {row}</span>
                      <span>100m • A2 • 1:30</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Row */}
              <div 
                className="p-4 rounded-lg font-semibold"
                style={{ 
                  backgroundColor: colors.selectedRow,
                  color: colors.selectedRowText
                }}
              >
                Selected Row - Active Moveframe
              </div>

              {/* Microlap Preview */}
              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: colors.microlapBackground,
                  color: colors.microlapText
                }}
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
        </div>
      </div>
    </div>
  );
}

