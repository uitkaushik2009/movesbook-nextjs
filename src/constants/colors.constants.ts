/**
 * Backgrounds & Colors Settings Constants
 * Extracted from BackgroundsColorsSettings.tsx
 */

export interface MovelapRowSettings {
  codeSection: { color: string; bold: boolean; displayMode: 'always' | 'once' };
  movaAction: { color: string; bold: boolean; displayMode: 'always' | 'once' };
  exercise: { color: string; bold: boolean };
  style: { color: string };
  speed: { color: string; bold: boolean };
  time: { color: string; bold: boolean; fontStyle: 'normal' | 'italic' };
  pace: { color: string; fontStyle: 'normal' | 'italic' };
  recoverRest: { color: string; bold: boolean; fontStyle: 'normal' | 'italic' };
  restartTo: { color: string; bold: boolean; fontStyle: 'normal' | 'italic' };
  annotations: { color: string };
  aimSound: { color: string };
}

export interface ColorSettings {
  pageBackground: string;
  pageBackgroundOpacity: number;
  weekHeader: string;
  weekHeaderText: string;
  dayHeader: string;
  dayHeaderText: string;
  dayAlternateRow: string;
  dayAlternateRowText: string;
  workoutHeader: string;
  workoutHeaderText: string;
  workout2Header: string;
  workout2HeaderText: string;
  workout3Header: string;
  workout3HeaderText: string;
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
  alternateRowmoveframe: string;
  alternateRowTextmoveframe: string;
  // Border settings - Separate for each section
  dayBorderEnabled?: boolean;
  dayBorderColor?: string;
  dayBorderWidth?: string;
  workoutBorderEnabled?: boolean;
  workoutBorderColor?: string;
  workoutBorderWidth?: string;
  moveframeBorderEnabled?: boolean;
  moveframeBorderColor?: string;
  moveframeBorderWidth?: string;
  movelapBorderEnabled?: boolean;
  movelapBorderColor?: string;
  movelapBorderWidth?: string;
  // Movelaps Table settings
  movelapTextColorSource?: 'table' | 'rows';
  // Movelaps Rows settings
  movelapRows?: MovelapRowSettings;
}

export interface ColorScheme {
  name: string;
  colors: ColorSettings;
}

/**
 * Default movelap row settings
 */
export const DEFAULT_MOVELAP_ROWS: MovelapRowSettings = {
  codeSection: { color: '#1e293b', bold: true, displayMode: 'always' },
  movaAction: { color: '#1e293b', bold: true, displayMode: 'always' },
  exercise: { color: '#1e293b', bold: true },
  style: { color: '#1e293b' },
  speed: { color: '#1e293b', bold: true },
  time: { color: '#1e293b', bold: true, fontStyle: 'normal' },
  pace: { color: '#1e293b', fontStyle: 'normal' },
  recoverRest: { color: '#1e293b', bold: true, fontStyle: 'normal' },
  restartTo: { color: '#1e293b', bold: true, fontStyle: 'normal' },
  annotations: { color: '#1e293b' },
  aimSound: { color: '#1e293b' },
};

/**
 * Default color settings for the application
 */
export const DEFAULT_COLORS: ColorSettings = {
  pageBackground: '#eeefe6',
  pageBackgroundOpacity: 89,
  weekHeader: '#6b7cde',
  weekHeaderText: '#ffffff',
  dayHeader: '#5168c2',
  dayHeaderText: '#e6e6ad',
  dayAlternateRow: '#e0f2fe',
  dayAlternateRowText: '#0c4a6e',
  workoutHeader: '#c6f8e2',
  workoutHeaderText: '#2386d1',
  workout2Header: '#fed7aa',
  workout2HeaderText: '#9a3412',
  workout3Header: '#c6f8e2',
  workout3HeaderText: '#2386d1',
  moveframeHeader: '#f7f2bb',
  moveframeHeaderText: '#f61909',
  movelapHeader: '#f7f7f7',
  movelapHeaderText: '#f50a2d',
  microlapBackground: '#f1f5f9',
  microlapText: '#334155',
  selectedRow: '#fef08a',
  selectedRowText: '#ef4444',
  alternateRow: '#f1f5f9',
  alternateRowText: '#1e293b',
  alternateRowMovelap: '#dbeafe',
  alternateRowTextMovelap: '#1e293b',
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
  selectedRowMovelap: '#fef08a',
  selectedRowTextMovelap: '#ef4444',
  alternateRowMoveframe: '#fef3c7',
  alternateRowTextMoveframe: '#ef4444',
  selectedRowMoveframe: '#fef08a',
  selectedRowTextMoveframe: '#ef4444',
  alternateRowmoveframe: '#dbeafe',
  alternateRowTextmoveframe: '#1e293b',
  movelapTextColorSource: 'table',
  movelapRows: DEFAULT_MOVELAP_ROWS,
  // Day border settings
  dayBorderEnabled: false,
  dayBorderColor: '#000000',
  dayBorderWidth: 'normal',
  // Workout border settings
  workoutBorderEnabled: false,
  workoutBorderColor: '#000000',
  workoutBorderWidth: 'normal',
  // Moveframe border settings
  moveframeBorderEnabled: false,
  moveframeBorderColor: '#000000',
  moveframeBorderWidth: 'normal',
  // Movelap border settings
  movelapBorderEnabled: false,
  movelapBorderColor: '#000000',
  movelapBorderWidth: 'normal'
};

/**
 * Default expanded sections state
 */
export const DEFAULT_EXPANDED_SECTIONS = {
  headers: true,
  buttons: true,
  rows: false,
  movelapsTable: false,
  movelapsRows: false,
};

