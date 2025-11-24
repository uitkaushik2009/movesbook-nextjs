'use client';

import { useState, useEffect } from 'react';
import { Grid, Layout, Eye, Palette, Zap, Monitor, Smartphone, Tablet, Sun, Moon, Type, Image, Play, Pause } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DisplaySettings {
  // Layout Configuration
  gridSize: 'compact' | 'comfortable' | 'spacious';
  columnCount: number;
  rowHeight: 'small' | 'medium' | 'large';
  defaultView: 'list' | 'grid' | 'table';
  
  // Sidebar & Panel Preferences
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  leftSidebarWidth: number; // percentage
  rightSidebarWidth: number; // percentage
  sidebarPosition: 'fixed' | 'floating';
  
  // Display Options
  theme: 'light' | 'dark' | 'auto';
  fontSize: number; // base font size in px
  iconSize: 'small' | 'medium' | 'large';
  enableAnimations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Performance
  performanceMode: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  lazyLoading: boolean;
  
  // Dashboard Layout
  dashboardLayout: 'default' | 'compact' | 'expanded';
  widgetArrangement: string[]; // IDs of widgets in order
}

export default function GridDisplaySettings() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'layout' | 'view' | 'display' | 'performance'>('layout');
  const [showPreview, setShowPreview] = useState(true);
  
  // Settings State
  const [settings, setSettings] = useState<DisplaySettings>({
    gridSize: 'comfortable',
    columnCount: 3,
    rowHeight: 'medium',
    defaultView: 'grid',
    leftSidebarVisible: true,
    rightSidebarVisible: true,
    leftSidebarWidth: 20,
    rightSidebarWidth: 25,
    sidebarPosition: 'fixed',
    theme: 'light',
    fontSize: 16,
    iconSize: 'medium',
    enableAnimations: true,
    reducedMotion: false,
    highContrast: false,
    performanceMode: false,
    imageQuality: 'high',
    lazyLoading: true,
    dashboardLayout: 'default',
    widgetArrangement: ['stats', 'calendar', 'workouts', 'activity']
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('displaySettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load display settings');
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('displaySettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    if (confirm('Reset all display settings to defaults?')) {
      setSettings({
        gridSize: 'comfortable',
        columnCount: 3,
        rowHeight: 'medium',
        defaultView: 'grid',
        leftSidebarVisible: true,
        rightSidebarVisible: true,
        leftSidebarWidth: 20,
        rightSidebarWidth: 25,
        sidebarPosition: 'fixed',
        theme: 'light',
        fontSize: 16,
        iconSize: 'medium',
        enableAnimations: true,
        reducedMotion: false,
        highContrast: false,
        performanceMode: false,
        imageQuality: 'high',
        lazyLoading: true,
        dashboardLayout: 'default',
        widgetArrangement: ['stats', 'calendar', 'workouts', 'activity']
      });
    }
  };

  const getGridSizeClass = () => {
    switch (settings.gridSize) {
      case 'compact': return 'gap-2 p-3';
      case 'comfortable': return 'gap-4 p-4';
      case 'spacious': return 'gap-6 p-6';
    }
  };

  const getRowHeightClass = () => {
    switch (settings.rowHeight) {
      case 'small': return 'h-12';
      case 'medium': return 'h-16';
      case 'large': return 'h-20';
    }
  };

  const getIconSizeClass = () => {
    switch (settings.iconSize) {
      case 'small': return 'w-4 h-4';
      case 'medium': return 'w-5 h-5';
      case 'large': return 'w-6 h-6';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Grid & Display</h2>
          <p className="text-gray-600">Customize your workspace layout and visual preferences</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'layout'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layout className="w-4 h-4 inline mr-2" />
          Layout Configuration
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'view'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Grid className="w-4 h-4 inline mr-2" />
          View Preferences
        </button>
        <button
          onClick={() => setActiveTab('display')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'display'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Display Options
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'performance'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Performance
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Layout Configuration Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              {/* Grid Size */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Grid Density</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['compact', 'comfortable', 'spacious'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('gridSize', size)}
                      className={`p-4 rounded-lg border-2 transition ${
                        settings.gridSize === size
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 capitalize mb-2">{size}</div>
                        <div className={`grid grid-cols-3 ${size === 'compact' ? 'gap-0.5' : size === 'comfortable' ? 'gap-1' : 'gap-2'} mb-2`}>
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className="bg-gray-300 aspect-square rounded-sm"></div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {size === 'compact' ? 'More items' : size === 'comfortable' ? 'Balanced' : 'More space'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column Count */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Column Count</h3>
                <div className="flex items-center gap-4 mb-3">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={settings.columnCount}
                    onChange={(e) => updateSetting('columnCount', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="w-12 text-center font-bold text-gray-900">{settings.columnCount}</div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 column</span>
                  <span>6 columns</span>
                </div>
              </div>

              {/* Row Height */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Row Height</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['small', 'medium', 'large'] as const).map((height) => (
                    <button
                      key={height}
                      onClick={() => updateSetting('rowHeight', height)}
                      className={`p-4 rounded-lg border-2 transition ${
                        settings.rowHeight === height
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 capitalize mb-2">{height}</div>
                        <div className={`bg-gray-300 rounded ${height === 'small' ? 'h-8' : height === 'medium' ? 'h-12' : 'h-16'} mb-2`}></div>
                        <div className="text-xs text-gray-500">
                          {height === 'small' ? '48px' : height === 'medium' ? '64px' : '80px'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dashboard Layout */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Dashboard Layout</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['default', 'compact', 'expanded'] as const).map((layout) => (
                    <button
                      key={layout}
                      onClick={() => updateSetting('dashboardLayout', layout)}
                      className={`p-4 rounded-lg border-2 transition ${
                        settings.dashboardLayout === layout
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 capitalize">{layout}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* View Preferences Tab */}
          {activeTab === 'view' && (
            <div className="space-y-6">
              {/* Default View Mode */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Default View Mode</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['list', 'grid', 'table'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => updateSetting('defaultView', view)}
                      className={`p-4 rounded-lg border-2 transition ${
                        settings.defaultView === view
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 capitalize mb-2">{view}</div>
                        {view === 'list' && (
                          <div className="space-y-1">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="bg-gray-300 h-2 rounded"></div>
                            ))}
                          </div>
                        )}
                        {view === 'grid' && (
                          <div className="grid grid-cols-2 gap-1">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="bg-gray-300 aspect-square rounded"></div>
                            ))}
                          </div>
                        )}
                        {view === 'table' && (
                          <div className="space-y-1">
                            <div className="bg-gray-400 h-2 rounded"></div>
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="bg-gray-300 h-2 rounded"></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar Configuration */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sidebar Visibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">Left Sidebar</div>
                      <div className="text-sm text-gray-500">Navigation and main menu</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.leftSidebarVisible}
                        onChange={(e) => updateSetting('leftSidebarVisible', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {settings.leftSidebarVisible && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Left Sidebar Width: {settings.leftSidebarWidth}%
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="30"
                        value={settings.leftSidebarWidth}
                        onChange={(e) => updateSetting('leftSidebarWidth', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="font-semibold text-gray-900">Right Sidebar</div>
                      <div className="text-sm text-gray-500">Actions and quick access</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.rightSidebarVisible}
                        onChange={(e) => updateSetting('rightSidebarVisible', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {settings.rightSidebarVisible && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Right Sidebar Width: {settings.rightSidebarWidth}%
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="35"
                        value={settings.rightSidebarWidth}
                        onChange={(e) => updateSetting('rightSidebarWidth', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Position */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sidebar Position</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['fixed', 'floating'] as const).map((position) => (
                    <button
                      key={position}
                      onClick={() => updateSetting('sidebarPosition', position)}
                      className={`p-4 rounded-lg border-2 transition ${
                        settings.sidebarPosition === position
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 capitalize">{position}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {position === 'fixed' ? 'Stays in place' : 'Overlays content'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Display Options Tab */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* Theme */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'auto'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateSetting('theme', theme)}
                      className={`p-4 rounded-lg border-2 transition ${
                        settings.theme === theme
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        {theme === 'light' && <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />}
                        {theme === 'dark' && <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-500" />}
                        {theme === 'auto' && <Monitor className="w-8 h-8 mx-auto mb-2 text-blue-500" />}
                        <div className="font-semibold text-gray-900 capitalize">{theme}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {theme === 'auto' ? 'System preference' : `${theme} mode`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Font Size</h3>
                <div className="flex items-center gap-4 mb-3">
                  <Type className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="w-16 text-center font-bold text-gray-900">{settings.fontSize}px</div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Smaller</span>
                  <span>Larger</span>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p style={{ fontSize: `${settings.fontSize}px` }} className="text-gray-700">
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              </div>

              {/* Icon Size */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Icon Size</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('iconSize', size)}
                      className={`p-4 rounded-lg border-2 transition ${
                        settings.iconSize === size
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <Grid className={`mx-auto mb-2 ${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-6 h-6' : 'w-8 h-8'}`} />
                        <div className="font-semibold text-gray-900 capitalize">{size}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility Options */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Accessibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">Enable Animations</div>
                      <div className="text-sm text-gray-500">Smooth transitions and effects</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableAnimations}
                        onChange={(e) => updateSetting('enableAnimations', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="font-semibold text-gray-900">Reduced Motion</div>
                      <div className="text-sm text-gray-500">Minimize animations for accessibility</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.reducedMotion}
                        onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="font-semibold text-gray-900">High Contrast Mode</div>
                      <div className="text-sm text-gray-500">Enhanced visibility for text and elements</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.highContrast}
                        onChange={(e) => updateSetting('highContrast', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Mode */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Mode</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-gray-900">Enable Performance Mode</div>
                    <div className="text-sm text-gray-500">Reduce visual effects for better performance</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.performanceMode}
                      onChange={(e) => updateSetting('performanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {settings.performanceMode && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    ⚡ Performance mode is active. Some visual effects are disabled.
                  </div>
                )}
              </div>

              {/* Image Quality */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Image Quality</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => updateSetting('imageQuality', quality)}
                      className={`p-4 rounded-lg border-2 transition ${
                        settings.imageQuality === quality
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <Image className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <div className="font-semibold text-gray-900 capitalize">{quality}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {quality === 'low' ? 'Faster' : quality === 'medium' ? 'Balanced' : 'Best quality'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lazy Loading */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Loading Optimization</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">Lazy Loading</div>
                    <div className="text-sm text-gray-500">Load images and content as you scroll</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.lazyLoading}
                      onChange={(e) => updateSetting('lazyLoading', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Performance Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Performance Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Enable performance mode on slower devices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Lower image quality for faster loading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Use reduced motion if animations cause issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Keep lazy loading enabled for better performance</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </h3>
              
              <div className="space-y-4">
                {/* Mini Dashboard Preview */}
                <div className="border-2 border-gray-200 rounded-lg p-3" style={{ fontSize: `${settings.fontSize * 0.75}px` }}>
                  <div className="flex gap-2 mb-2">
                    {settings.leftSidebarVisible && (
                      <div 
                        className="bg-gray-800 rounded h-32"
                        style={{ width: `${settings.leftSidebarWidth * 2}%` }}
                      ></div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="bg-blue-100 h-6 rounded"></div>
                      <div className={`grid grid-cols-${Math.min(settings.columnCount, 3)} ${getGridSizeClass()}`}>
                        {[...Array(Math.min(settings.columnCount * 2, 6))].map((_, i) => (
                          <div key={i} className={`bg-gray-200 rounded ${getRowHeightClass()}`}></div>
                        ))}
                      </div>
                    </div>
                    {settings.rightSidebarVisible && (
                      <div 
                        className="bg-gray-100 rounded h-32"
                        style={{ width: `${settings.rightSidebarWidth * 1.5}%` }}
                      ></div>
                    )}
                  </div>
                </div>

                {/* Current Settings Summary */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grid Size:</span>
                    <span className="font-semibold text-gray-900 capitalize">{settings.gridSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Columns:</span>
                    <span className="font-semibold text-gray-900">{settings.columnCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Theme:</span>
                    <span className="font-semibold text-gray-900 capitalize">{settings.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Font Size:</span>
                    <span className="font-semibold text-gray-900">{settings.fontSize}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Icon Size:</span>
                    <span className="font-semibold text-gray-900 capitalize">{settings.iconSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Animations:</span>
                    <span className="font-semibold text-gray-900">{settings.enableAnimations ? 'On' : 'Off'}</span>
                  </div>
                </div>

                {/* Device Preview Selector */}
                <div className="pt-4 border-t">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Preview Device</div>
                  <div className="flex gap-2">
                    <button className="flex-1 p-2 border border-gray-300 rounded hover:bg-gray-50">
                      <Monitor className="w-4 h-4 mx-auto" />
                    </button>
                    <button className="flex-1 p-2 border border-gray-300 rounded hover:bg-gray-50">
                      <Tablet className="w-4 h-4 mx-auto" />
                    </button>
                    <button className="flex-1 p-2 border border-gray-300 rounded hover:bg-gray-50">
                      <Smartphone className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
