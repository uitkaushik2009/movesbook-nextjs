'use client';

import { useState } from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';
import BackgroundsColorsSettings from '@/components/settings/BackgroundsColorsSettings';
import ToolsSettings from '@/components/settings/ToolsSettings';
import FavouritesSettings from '@/components/settings/FavouritesSettings';
import MyBestSettings from '@/components/settings/MyBestSettings';
import LanguageSettings from '@/components/settings/LanguageSettings';
import GridDisplaySettings from '@/components/settings/GridDisplaySettings';
import { 
  Palette,
  Settings as SettingsIcon,
  Star,
  Trophy,
  Globe,
  Grid,
  Save
} from 'lucide-react';
import { i18n } from '@/lib/i18n';

type SettingsSection = 'backgrounds' | 'tools' | 'favourites' | 'mybest' | 'languages' | 'grid';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('backgrounds');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const settingsSections = [
    { id: 'backgrounds' as SettingsSection, label: i18n.t('settings_backgrounds'), icon: Palette },
    { id: 'tools' as SettingsSection, label: i18n.t('settings_tools'), icon: SettingsIcon },
    { id: 'favourites' as SettingsSection, label: i18n.t('settings_favourites'), icon: Star },
    { id: 'mybest' as SettingsSection, label: i18n.t('settings_my_best'), icon: Trophy },
    { id: 'languages' as SettingsSection, label: i18n.t('settings_languages'), icon: Globe },
    { id: 'grid' as SettingsSection, label: 'Grid & Display', icon: Grid },
  ];

  const handleSaveAll = () => {
    // Save all settings logic
    setHasUnsavedChanges(false);
    // Show success message
    alert('All settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ModernNavbar />
      
<<<<<<< HEAD
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
=======
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {i18n.t('settings_title')}
            </h1>
            <p className="text-lg text-gray-600">
              Customize your workout management experience
            </p>
          </div>
          
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAll}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="w-5 h-5" />
              <span>Save All Changes</span>
            </button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Settings Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
              <nav className="space-y-2">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-4 py-4 rounded-2xl text-left transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-semibold">{section.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 p-4 bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl border border-cyan-200">
                <h3 className="text-sm font-semibold text-cyan-800 mb-3">Settings Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-700">Customized</span>
                    <span className="font-semibold text-cyan-600">12/24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-700">Languages</span>
                    <span className="font-semibold text-purple-600">2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
              {activeSection === 'backgrounds' && <BackgroundsColorsSettings />}
              {activeSection === 'tools' && <ToolsSettings />}
              {activeSection === 'favourites' && <FavouritesSettings />}
              {activeSection === 'mybest' && <MyBestSettings />}
              {activeSection === 'languages' && <LanguageSettings />}
              {activeSection === 'grid' && <GridDisplaySettings />}
            </div>
          </div>
        </div>
      </div>

      <ModernFooter />
    </div>
  );
}