import { useState, useEffect } from 'react';
import { ColumnSettings, getDefaultColumnSettings } from '@/types/columnSettings';

const STORAGE_KEY = 'workout_column_settings';

export function useColumnSettings() {
  const [settings, setSettings] = useState<ColumnSettings>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse column settings:', e);
        }
      }
    }
    
    // Return default settings
    return {
      day: getDefaultColumnSettings('day'),
      workout: getDefaultColumnSettings('workout'),
      moveframe: getDefaultColumnSettings('moveframe'),
      movelap: getDefaultColumnSettings('movelap'),
    };
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const updateTableSettings = (
    tableType: 'day' | 'workout' | 'moveframe' | 'movelap',
    visibleColumns: string[],
    columnOrder?: string[]
  ) => {
    setSettings(prev => ({
      ...prev,
      [tableType]: {
        visibleColumns,
        columnOrder: columnOrder || prev[tableType]?.columnOrder || [],
      },
    }));
  };

  const resetTableSettings = (tableType: 'day' | 'workout' | 'moveframe' | 'movelap') => {
    setSettings(prev => ({
      ...prev,
      [tableType]: getDefaultColumnSettings(tableType),
    }));
  };

  const resetAllSettings = () => {
    setSettings({
      day: getDefaultColumnSettings('day'),
      workout: getDefaultColumnSettings('workout'),
      moveframe: getDefaultColumnSettings('moveframe'),
      movelap: getDefaultColumnSettings('movelap'),
    });
  };

  const isColumnVisible = (tableType: 'day' | 'workout' | 'moveframe' | 'movelap', columnId: string): boolean => {
    return settings[tableType]?.visibleColumns?.includes(columnId) ?? true;
  };

  const getVisibleColumns = (tableType: 'day' | 'workout' | 'moveframe' | 'movelap'): string[] => {
    return settings[tableType]?.visibleColumns || [];
  };

  const getColumnOrder = (tableType: 'day' | 'workout' | 'moveframe' | 'movelap'): string[] => {
    return settings[tableType]?.columnOrder || [];
  };

  return {
    settings,
    updateTableSettings,
    resetTableSettings,
    resetAllSettings,
    isColumnVisible,
    getVisibleColumns,
    getColumnOrder,
  };
}

