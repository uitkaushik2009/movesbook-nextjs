'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  Columns, 
  Type, 
  Bold, 
  Italic, 
  Eye,
  EyeOff,
  Grid3X3,
  Move,
  Grip,
  Palette
} from 'lucide-react';
import { i18n } from '@/lib/i18n';

interface ColumnSettings {
  id: string;
  name: string; // This will be the translation key
  visible: boolean;
  width: number;
  position: number;
  textColor: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  displayMode: 'always' | 'once';
}

interface GridSettings {
  columns: ColumnSettings[];
  alternateRowColor: string;
  selectedRowColor: string;
  saveCurrentLayout: boolean;
}

export default function GridDisplaySettings() {
  const [activeTab, setActiveTab] = useState<'columns' | 'appearance' | 'movelaps'>('columns');
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Initial grid settings with translation keys
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    columns: [
      { id: 'workout_number', name: 'column_workout_number', visible: true, width: 120, position: 0, textColor: '#000000', fontWeight: 'normal', fontStyle: 'normal', displayMode: 'always' },
      { id: 'sport_type', name: 'column_sport_type', visible: true, width: 150, position: 1, textColor: '#000000', fontWeight: 'normal', fontStyle: 'normal', displayMode: 'always' },
      { id: 'moveframe', name: 'column_moveframe', visible: true, width: 200, position: 2, textColor: '#000000', fontWeight: 'bold', fontStyle: 'normal', displayMode: 'always' },
      { id: 'distance', name: 'column_distance', visible: true, width: 100, position: 3, textColor: '#000000', fontWeight: 'normal', fontStyle: 'normal', displayMode: 'always' },
      { id: 'time', name: 'column_time', visible: true, width: 100, position: 4, textColor: '#000000', fontWeight: 'normal', fontStyle: 'normal', displayMode: 'always' },
      { id: 'pace', name: 'column_pace', visible: false, width: 120, position: 5, textColor: '#666666', fontWeight: 'normal', fontStyle: 'italic', displayMode: 'once' },
      { id: 'rest', name: 'column_rest', visible: true, width: 100, position: 6, textColor: '#000000', fontWeight: 'normal', fontStyle: 'normal', displayMode: 'always' },
      { id: 'notes', name: 'column_notes', visible: false, width: 200, position: 7, textColor: '#666666', fontWeight: 'normal', fontStyle: 'normal', displayMode: 'always' },
    ],
    alternateRowColor: '#f8fafc',
    selectedRowColor: '#3b82f6',
    saveCurrentLayout: true
  });

  // Text color options with translation keys
  const textColorOptions = [
    { value: '#000000', label: 'color_black', bg: 'bg-black' },
    { value: '#ffffff', label: 'color_white', bg: 'bg-white border border-gray-300' },
    { value: '#666666', label: 'color_gray', bg: 'bg-gray-500' },
    { value: '#ef4444', label: 'color_red', bg: 'bg-red-500' },
    { value: '#3b82f6', label: 'color_blue', bg: 'bg-blue-500' },
    { value: '#10b981', label: 'color_green', bg: 'bg-green-500' },
    { value: '#f59e0b', label: 'color_yellow', bg: 'bg-yellow-500' },
  ];

  // Font size options with translation keys
  const fontSizeOptions = [
    { value: 'small', label: 'font_small' },
    { value: 'medium', label: 'font_medium' },
    { value: 'large', label: 'font_large' },
  ];

  // Row height options with translation keys
  const rowHeightOptions = [
    { value: 'compact', label: 'height_compact' },
    { value: 'normal', label: 'height_normal' },
    { value: 'comfortable', label: 'height_comfortable' },
  ];

  // Tabs configuration with translation
  const tabs = [
    { id: 'columns' as const, label: 'grid_column_management', icon: Columns },
    { id: 'appearance' as const, label: 'grid_appearance', icon: Palette },
    { id: 'movelaps' as const, label: 'grid_movelap_display', icon: Grid3X3 }
  ];

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setIsDragging(gridSettings.columns[index].id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  // Handle drop
  const handleDrop = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newColumns = [...gridSettings.columns];
      const draggedItem = newColumns[dragItem.current];
      newColumns.splice(dragItem.current, 1);
      newColumns.splice(dragOverItem.current, 0, draggedItem);
      
      // Update positions
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        position: index
      }));

      setGridSettings(prev => ({
        ...prev,
        columns: updatedColumns
      }));
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(null);
  };

  // Update column setting
  const updateColumnSetting = (columnId: string, setting: string, value: any) => {
    setGridSettings(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId ? { ...col, [setting]: value } : col
      )
    }));
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    updateColumnSetting(columnId, 'visible', !gridSettings.columns.find(col => col.id === columnId)?.visible);
  };

  // Update column width
  const updateColumnWidth = (columnId: string, width: number) => {
    updateColumnSetting(columnId, 'width', Math.max(50, Math.min(500, width)));
  };

  // Reset to default columns
  const resetToDefaultColumns = () => {
    setGridSettings(prev => ({
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        visible: true,
        width: getDefaultWidth(col.id),
        position: getDefaultPosition(col.id)
      })).sort((a, b) => a.position - b.position)
    }));
  };

  // Reset to default sizes
  const resetToDefaultSizes = () => {
    setGridSettings(prev => ({
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        width: getDefaultWidth(col.id)
      }))
    }));
  };

  // Save current grid settings
  const saveGridSettings = () => {
    localStorage.setItem('workoutGridSettings', JSON.stringify(gridSettings));
    alert(i18n.t('success'));
  };

  // Get default width for a column
  const getDefaultWidth = (columnId: string): number => {
    const defaults: { [key: string]: number } = {
      'workout_number': 120,
      'sport_type': 150,
      'moveframe': 200,
      'distance': 100,
      'time': 100,
      'pace': 120,
      'rest': 100,
      'notes': 200
    };
    return defaults[columnId] || 120;
  };

  // Get default position for a column
  const getDefaultPosition = (columnId: string): number => {
    const defaults: { [key: string]: number } = {
      'workout_number': 0,
      'sport_type': 1,
      'moveframe': 2,
      'distance': 3,
      'time': 4,
      'pace': 5,
      'rest': 6,
      'notes': 7
    };
    return defaults[columnId] || 0;
  };

  // Get translated column name
  const getTranslatedColumnName = (column: ColumnSettings): string => {
    return i18n.t(column.name);
  };

  // Preview data for demonstration
  const previewData = [
    { workout_number: '1', sport_type: 'Swim', moveframe: 'A', distance: '400m', time: '6:30', pace: '1:37', rest: '30s', notes: 'Freestyle' },
    { workout_number: '2', sport_type: 'Run', moveframe: 'B', distance: '5km', time: '25:00', pace: '5:00', rest: '1:00', notes: 'Interval' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {i18n.t('grid_display_settings')}
          </h2>
          <p className="text-gray-600 mt-2">
            {i18n.t('grid_customize_display')}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={resetToDefaultColumns}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{i18n.t('grid_reset_positions')}</span>
          </button>
          <button
            onClick={resetToDefaultSizes}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300"
          >
            <Columns className="w-5 h-5" />
            <span>{i18n.t('grid_reset_sizes')}</span>
          </button>
          <button
            onClick={saveGridSettings}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Save className="w-5 h-5" />
            <span>{i18n.t('grid_save_settings')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{i18n.t(tab.label)}</span>
            </button>
          );
        })}
      </div>

      {/* Column Management Tab */}
      {activeTab === 'columns' && (
        <div className="space-y-6">
          {/* Column List */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {i18n.t('grid_column_configuration')}
              </h3>
              <p className="text-sm text-gray-600">
                {i18n.t('grid_drag_reorder')}
              </p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {gridSettings.columns
                .sort((a, b) => a.position - b.position)
                .map((column, index) => (
                <div
                  key={column.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  onDragEnd={handleDrop}
                  className={`flex items-center justify-between p-6 transition-all duration-200 ${
                    isDragging === column.id ? 'bg-cyan-50 opacity-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Grip className="w-5 h-5 text-gray-400 cursor-move" />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">
                          {getTranslatedColumnName(column)}
                        </h4>
                        <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                          {column.id}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>{i18n.t('grid_width')}: {column.width}px</span>
                        <span>{i18n.t('grid_position')}: {column.position + 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Width Control */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">
                        {i18n.t('grid_width')}:
                      </label>
                      <input
                        type="number"
                        value={column.width}
                        onChange={(e) => updateColumnWidth(column.id, parseInt(e.target.value) || 100)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        min="50"
                        max="500"
                      />
                    </div>

                    {/* Visibility Toggle */}
                    <button
                      onClick={() => toggleColumnVisibility(column.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        column.visible
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {column.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {i18n.t('grid_live_preview')}
              </h3>
              <p className="text-sm text-gray-600">
                {i18n.t('grid_see_changes')}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    {gridSettings.columns
                      .filter(col => col.visible)
                      .sort((a, b) => a.position - b.position)
                      .map(column => (
                      <th
                        key={column.id}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                        style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}
                      >
                        {getTranslatedColumnName(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.map((row, rowIndex) => (
                    <tr 
                      key={rowIndex}
                      className={rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                    >
                      {gridSettings.columns
                        .filter(col => col.visible)
                        .sort((a, b) => a.position - b.position)
                        .map(column => (
                        <td
                          key={column.id}
                          className="px-4 py-3 text-sm border-b border-gray-200"
                          style={{ 
                            width: `${column.width}px`,
                            minWidth: `${column.width}px`,
                            color: column.textColor,
                            fontWeight: column.fontWeight,
                            fontStyle: column.fontStyle
                          }}
                        >
                          {row[column.id as keyof typeof row]}
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

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="grid grid-cols-2 gap-8">
          {/* Row Colors */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {i18n.t('grid_row_colors')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.t('grid_alternate_row_color')}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={gridSettings.alternateRowColor}
                      onChange={(e) => setGridSettings(prev => ({
                        ...prev,
                        alternateRowColor: e.target.value
                      }))}
                      className="w-16 h-16 rounded-lg cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: gridSettings.alternateRowColor }}
                        />
                        <span className="text-sm text-gray-600 font-mono">
                          {gridSettings.alternateRowColor}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={gridSettings.alternateRowColor}
                        onChange={(e) => setGridSettings(prev => ({
                          ...prev,
                          alternateRowColor: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.t('grid_selected_row_color')}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={gridSettings.selectedRowColor}
                      onChange={(e) => setGridSettings(prev => ({
                        ...prev,
                        selectedRowColor: e.target.value
                      }))}
                      className="w-16 h-16 rounded-lg cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: gridSettings.selectedRowColor }}
                        />
                        <span className="text-sm text-gray-600 font-mono">
                          {gridSettings.selectedRowColor}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={gridSettings.selectedRowColor}
                        onChange={(e) => setGridSettings(prev => ({
                          ...prev,
                          selectedRowColor: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Options */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {i18n.t('grid_display_options')}
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={gridSettings.saveCurrentLayout}
                    onChange={(e) => setGridSettings(prev => ({
                      ...prev,
                      saveCurrentLayout: e.target.checked
                    }))}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {i18n.t('grid_save_layout')}
                  </span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.t('grid_default_font_size')}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    {fontSizeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {i18n.t(option.label)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.t('grid_row_height')}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    {rowHeightOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {i18n.t(option.label)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movelap Display Tab */}
      {activeTab === 'movelaps' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {i18n.t('grid_movelap_column_settings')}
              </h3>
              <p className="text-sm text-gray-600">
                {i18n.t('grid_customize_movelap')}
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridSettings.columns.map(column => (
                  <div key={column.id} className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <Type className="w-4 h-4" />
                      <span>{getTranslatedColumnName(column)}</span>
                    </h4>

                    {/* Text Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {i18n.t('grid_text_color')}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {textColorOptions.map(color => (
                          <button
                            key={color.value}
                            onClick={() => updateColumnSetting(column.id, 'textColor', color.value)}
                            className={`w-8 h-8 rounded-lg border-2 ${
                              column.textColor === color.value 
                                ? 'border-cyan-500 ring-2 ring-cyan-200' 
                                : 'border-gray-300'
                            } ${color.bg} transition-all duration-200`}
                            title={i18n.t(color.label)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Font Style */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateColumnSetting(column.id, 'fontWeight', 
                          column.fontWeight === 'bold' ? 'normal' : 'bold'
                        )}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-all duration-200 ${
                          column.fontWeight === 'bold'
                            ? 'bg-cyan-100 text-cyan-700 border-cyan-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Bold className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => updateColumnSetting(column.id, 'fontStyle', 
                          column.fontStyle === 'italic' ? 'normal' : 'italic'
                        )}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-all duration-200 ${
                          column.fontStyle === 'italic'
                            ? 'bg-cyan-100 text-cyan-700 border-cyan-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Italic className="w-4 h-4 mx-auto" />
                      </button>
                    </div>

                    {/* Display Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {i18n.t('grid_display_mode')}
                      </label>
                      <select
                        value={column.displayMode}
                        onChange={(e) => updateColumnSetting(column.id, 'displayMode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      >
                        <option value="always">{i18n.t('grid_display_always')}</option>
                        <option value="once">{i18n.t('grid_display_once')}</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {column.displayMode === 'always' 
                          ? i18n.t('grid_display_always_desc')
                          : i18n.t('grid_display_once_desc')
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Display Mode Explanation */}
          <div className="bg-cyan-50 rounded-2xl border border-cyan-200 p-6">
            <h4 className="font-semibold text-cyan-800 mb-3">
              {i18n.t('grid_display_mode_explanation')}
            </h4>
            <div className="space-y-3 text-sm text-cyan-700">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span><strong>{i18n.t('grid_display_always')}:</strong> {i18n.t('grid_display_always_desc')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span><strong>{i18n.t('grid_display_once')}:</strong> {i18n.t('grid_display_once_desc')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}