'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserSettings, UserSettings } from '@/hooks/useUserSettings';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<any>;
  saveSettings: (settings: Partial<UserSettings>) => Promise<any>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { settings, loading, updateSetting, saveSettings } = useUserSettings(user?.id);
  const { setTheme } = useTheme();

  // Apply settings globally whenever they change
  useEffect(() => {
    if (!settings || loading) return;

    // Apply font size
    if (settings.fontSize) {
      document.documentElement.style.fontSize = `${settings.fontSize}px`;
    }

    // Apply theme
    if (settings.theme) {
      setTheme(settings.theme as any);
    }

    // Apply high contrast mode
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.style.setProperty('--transition-duration', '0ms');
    } else {
      document.documentElement.style.removeProperty('--transition-duration');
    }

    // Apply animations
    if (!settings.enableAnimations) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }

    // Store settings in CSS variables for easy access
    if (settings.gridSize) {
      document.documentElement.style.setProperty('--grid-size', settings.gridSize);
    }
    if (settings.columnCount) {
      document.documentElement.style.setProperty('--column-count', settings.columnCount.toString());
    }
    if (settings.leftSidebarWidth) {
      document.documentElement.style.setProperty('--sidebar-left-width', `${settings.leftSidebarWidth}%`);
    }
    if (settings.rightSidebarWidth) {
      document.documentElement.style.setProperty('--sidebar-right-width', `${settings.rightSidebarWidth}%`);
    }

    // Apply image quality as data attribute for conditional rendering
    document.documentElement.setAttribute('data-image-quality', settings.imageQuality);
    document.documentElement.setAttribute('data-performance-mode', settings.performanceMode ? 'true' : 'false');

    // Apply color settings including border settings
    if (settings.colorSettings) {
      try {
        const colorSettings = typeof settings.colorSettings === 'string' 
          ? JSON.parse(settings.colorSettings)
          : settings.colorSettings;
        
        // Apply page background
        if (colorSettings.pageBackground) {
          document.documentElement.style.setProperty('--page-background', colorSettings.pageBackground);
        }
        if (colorSettings.pageBackgroundOpacity) {
          document.documentElement.style.setProperty('--page-background-opacity', (colorSettings.pageBackgroundOpacity / 100).toString());
        }
        
        // Apply border settings
        if (colorSettings.borderEnabled) {
          const borderWidth = 
            colorSettings.borderWidth === 'very-thin' ? '1px' :
            colorSettings.borderWidth === 'thin' ? '2px' :
            colorSettings.borderWidth === 'thick' ? '4px' : '3px';
          
          const borderColor = colorSettings.borderColor || '#000000';
          
          document.documentElement.style.setProperty('--workout-border-width', borderWidth);
          document.documentElement.style.setProperty('--workout-border-color', borderColor);
          document.documentElement.style.setProperty('--workout-border-style', 'solid');
        } else {
          document.documentElement.style.setProperty('--workout-border-width', '0px');
          document.documentElement.style.setProperty('--workout-border-color', 'transparent');
          document.documentElement.style.setProperty('--workout-border-style', 'none');
        }
        
        // Apply all other color settings as CSS variables
        Object.keys(colorSettings).forEach(key => {
          if (!['borderEnabled', 'borderColor', 'borderWidth'].includes(key)) {
            const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            document.documentElement.style.setProperty(cssVarName, colorSettings[key]);
          }
        });
      } catch (error) {
        console.error('Error applying color settings:', error);
      }
    }

  }, [settings, loading, setTheme]);

  const value = {
    settings,
    loading,
    updateSetting,
    saveSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

