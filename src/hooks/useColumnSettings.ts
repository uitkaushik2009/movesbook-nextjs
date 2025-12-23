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
          const parsed = JSON.parse(stored);
          // Validate and migrate settings if schema changed
          const migrated = {
            day: parsed.day && parsed.day.visibleColumns?.length > 0 ? parsed.day : getDefaultColumnSettings('day'),
            workout: parsed.workout && parsed.workout.visibleColumns?.length > 0 ? parsed.workout : getDefaultColumnSettings('workout'),
            moveframe: parsed.moveframe && parsed.moveframe.visibleColumns?.length > 0 ? parsed.moveframe : getDefaultColumnSettings('moveframe'),
            movelap: parsed.movelap && parsed.movelap.visibleColumns?.length > 0 ? parsed.movelap : getDefaultColumnSettings('movelap'),
          };
          return migrated;
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
    const visibleColumns = settings[tableType]?.visibleColumns;
    // If no settings exist, default to showing the column
    if (!visibleColumns || visibleColumns.length === 0) {
      return true;
    }
    return visibleColumns.includes(columnId);
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

