'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModernNavbar from '@/components/ModernNavbar';
import ModernFooter from '@/components/ModernFooter';
import BackgroundsColorsSettings from '@/components/settings/BackgroundsColorsSettings';
import ToolsSettings from '@/components/settings/ToolsSettings';
import FavouritesSettings from '@/components/settings/FavouritesSettings';
import MyBestSettings from '@/components/settings/MyBestSettings';
import LanguageSettings from '@/components/settings/LanguageSettings';
import GridDisplaySettings from '@/components/settings/GridDisplaySettings';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Palette,
  Settings as SettingsIcon,
  Star,
  Trophy,
  Globe,
  Grid,
  Save
} from 'lucide-react';

type SettingsSection = 'backgrounds' | 'tools' | 'favourites' | 'mybest' | 'languages' | 'grid';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>('backgrounds');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check for admin authentication
  useEffect(() => {
    const adminData = localStorage.getItem('adminUser');
    if (adminData) {
      setIsAdmin(true);
    }
  }, []);

  // Redirect to home if not authenticated (neither user nor admin)
  useEffect(() => {
    if (!loading && !user && !isAdmin) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  // Don't render if not authenticated
  if (loading || (!user && !isAdmin)) {
    return null;
  }

  const settingsSections = [
    { id: 'backgrounds' as SettingsSection, label: t('settings_backgrounds'), icon: Palette },
    { id: 'tools' as SettingsSection, label: t('settings_tools'), icon: SettingsIcon },
    { id: 'favourites' as SettingsSection, label: t('settings_favourites'), icon: Star },
    { id: 'mybest' as SettingsSection, label: t('settings_my_best'), icon: Trophy },
    { id: 'languages' as SettingsSection, label: t('settings_languages'), icon: Globe },
    { id: 'grid' as SettingsSection, label: t('settings_grid_display'), icon: Grid },
  ];

  const handleSaveAll = () => {
    // Save all settings logic
    setHasUnsavedChanges(false);
    // Show success message
    alert(t('settings_saved_success'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ModernNavbar />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              {t('settings_title')}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              {t('settings_customize')}
            </p>
          </div>
          
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAll}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{t('settings_save_all')}</span>
            </button>
          )}
        </div>

        {/* Mobile Horizontal Scroll Navigation */}
        <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Settings Sidebar - Desktop Only */}
          <div className="hidden lg:block w-64 xl:w-80 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sticky top-6">
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
                      <span className="font-semibold text-sm xl:text-base">{section.label}</span>
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
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 lg:p-8">
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