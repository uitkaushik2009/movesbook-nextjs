/**
 * Table Column Configuration
 * Defines editable column structures for Workout, Moveframe, and Movelap tables
 */

export interface ColumnConfig {
  id: string;
  label: string;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  visible: boolean;
  required?: boolean; // Cannot be hidden
  dataKey: string;
  format?: (value: any, row?: any) => string | React.ReactNode;
}

// ==================== WORKOUT TABLE COLUMNS ====================
export const DEFAULT_WORKOUT_COLUMNS: ColumnConfig[] = [
  {
    id: 'no',
    label: 'No',
    width: '50px',
    align: 'left',
    visible: true,
    required: true,
    dataKey: 'sessionNumber'
  },
  {
    id: 'match',
    label: 'Match',
    width: '80px',
    align: 'left',
    visible: true,
    dataKey: 'completionRate'
  },
  {
    id: 'sport1_name',
    label: 'Sport 1',
    width: '80px',
    align: 'left',
    visible: true,
    dataKey: 'sport1.name'
  },
  {
    id: 'sport1_icon',
    label: 'Icon',
    width: '50px',
    align: 'center',
    visible: true,
    dataKey: 'sport1.icon'
  },
  {
    id: 'sport1_distance',
    label: 'Distance',
    width: '80px',
    align: 'right',
    visible: true,
    dataKey: 'sport1.distance'
  },
  {
    id: 'sport1_duration',
    label: 'Duration',
    width: '80px',
    align: 'right',
    visible: true,
    dataKey: 'sport1.duration'
  },
  {
    id: 'sport1_k',
    label: 'K',
    width: '50px',
    align: 'center',
    visible: true,
    dataKey: 'sport1.k'
  },
  {
    id: 'sport2_name',
    label: 'Sport 2',
    width: '80px',
    align: 'left',
    visible: true,
    dataKey: 'sport2.name'
  },
  {
    id: 'sport2_icon',
    label: 'Icon',
    width: '50px',
    align: 'center',
    visible: true,
    dataKey: 'sport2.icon'
  },
  {
    id: 'sport2_distance',
    label: 'Distance',
    width: '80px',
    align: 'right',
    visible: true,
    dataKey: 'sport2.distance'
  },
  {
    id: 'sport2_duration',
    label: 'Duration',
    width: '80px',
    align: 'right',
    visible: true,
    dataKey: 'sport2.duration'
  },
  {
    id: 'sport2_k',
    label: 'K',
    width: '50px',
    align: 'center',
    visible: true,
    dataKey: 'sport2.k'
  },
  {
    id: 'sport3_name',
    label: 'Sport 3',
    width: '80px',
    align: 'left',
    visible: false, // Hidden by default
    dataKey: 'sport3.name'
  },
  {
    id: 'sport3_icon',
    label: 'Icon',
    width: '50px',
    align: 'center',
    visible: false,
    dataKey: 'sport3.icon'
  },
  {
    id: 'sport3_distance',
    label: 'Distance',
    width: '80px',
    align: 'right',
    visible: false,
    dataKey: 'sport3.distance'
  },
  {
    id: 'sport3_duration',
    label: 'Duration',
    width: '80px',
    align: 'right',
    visible: false,
    dataKey: 'sport3.duration'
  },
  {
    id: 'sport3_k',
    label: 'K',
    width: '50px',
    align: 'center',
    visible: false,
    dataKey: 'sport3.k'
  },
  {
    id: 'sport4_name',
    label: 'Sport 4',
    width: '80px',
    align: 'left',
    visible: false, // Hidden by default
    dataKey: 'sport4.name'
  },
  {
    id: 'sport4_icon',
    label: 'Icon',
    width: '50px',
    align: 'center',
    visible: false,
    dataKey: 'sport4.icon'
  },
  {
    id: 'sport4_distance',
    label: 'Distance',
    width: '80px',
    align: 'right',
    visible: false,
    dataKey: 'sport4.distance'
  },
  {
    id: 'sport4_duration',
    label: 'Duration',
    width: '80px',
    align: 'right',
    visible: false,
    dataKey: 'sport4.duration'
  },
  {
    id: 'sport4_k',
    label: 'K',
    width: '50px',
    align: 'center',
    visible: false,
    dataKey: 'sport4.k'
  }
];

// ==================== MOVEFRAME TABLE COLUMNS ====================
export const DEFAULT_MOVEFRAME_COLUMNS: ColumnConfig[] = [
  {
    id: 'mf',
    label: 'MF',
    width: '40px',
    align: 'center',
    visible: true,
    required: true,
    dataKey: 'letter'
  },
  {
    id: 'color',
    label: 'Color',
    width: '60px',
    align: 'center',
    visible: true,
    dataKey: 'section.color'
  },
  {
    id: 'type',
    label: 'Workout type',
    width: '120px',
    align: 'left',
    visible: true,
    dataKey: 'section.name'
  },
  {
    id: 'sport',
    label: 'Sport',
    width: '80px',
    align: 'left',
    visible: true,
    dataKey: 'sport'
  },
  {
    id: 'description',
    label: 'Moveframe description',
    minWidth: '300px',
    align: 'left',
    visible: true,
    dataKey: 'description'
  },
  {
    id: 'repetitions',
    label: 'Rip',
    width: '60px',
    align: 'center',
    visible: true,
    dataKey: 'movelaps.length'
  },
  {
    id: 'total_distance',
    label: 'Metri',
    width: '60px',
    align: 'right',
    visible: true,
    dataKey: 'totalDistance'
  },
  {
    id: 'macro',
    label: 'Macro',
    width: '80px',
    align: 'center',
    visible: false, // Hidden by default
    dataKey: 'macro'
  },
  {
    id: 'alarm',
    label: 'Alarm',
    width: '80px',
    align: 'center',
    visible: false,
    dataKey: 'alarm'
  },
  {
    id: 'notes',
    label: 'Notes',
    minWidth: '150px',
    align: 'left',
    visible: false,
    dataKey: 'notes'
  }
];

// ==================== MOVELAP TABLE COLUMNS ====================
export const DEFAULT_MOVELAP_COLUMNS: ColumnConfig[] = [
  {
    id: 'mf',
    label: 'MF',
    width: '40px',
    align: 'center',
    visible: true,
    required: true,
    dataKey: 'moveframeCode'
  },
  {
    id: 'color',
    label: 'Color',
    width: '60px',
    align: 'center',
    visible: true,
    dataKey: 'color'
  },
  {
    id: 'workout_type',
    label: 'Workout type',
    width: '100px',
    align: 'left',
    visible: true,
    dataKey: 'workoutType'
  },
  {
    id: 'sport',
    label: 'Sport',
    width: '80px',
    align: 'left',
    visible: true,
    dataKey: 'sport'
  },
  {
    id: 'distance',
    label: 'Distance',
    width: '80px',
    align: 'right',
    visible: true,
    dataKey: 'distance'
  },
  {
    id: 'style',
    label: 'Style',
    width: '80px',
    align: 'center',
    visible: true,
    dataKey: 'style'
  },
  {
    id: 'speed',
    label: 'Speed',
    width: '60px',
    align: 'center',
    visible: true,
    dataKey: 'speed'
  },
  {
    id: 'time',
    label: 'Time',
    width: '60px',
    align: 'center',
    visible: true,
    dataKey: 'time'
  },
  {
    id: 'pace',
    label: 'Pace',
    width: '60px',
    align: 'center',
    visible: true,
    dataKey: 'pace'
  },
  {
    id: 'rec',
    label: 'Rec',
    width: '60px',
    align: 'center',
    visible: true,
    dataKey: 'pause'
  },
  {
    id: 'rest_to',
    label: 'Rest To',
    width: '80px',
    align: 'center',
    visible: true,
    dataKey: 'restType'
  },
  {
    id: 'aim_sound',
    label: 'Aim Sound',
    width: '100px',
    align: 'center',
    visible: true,
    dataKey: 'alarm'
  },
  {
    id: 'annotation',
    label: 'Annotation',
    minWidth: '150px',
    align: 'left',
    visible: true,
    dataKey: 'notes'
  },
  {
    id: 'heartrate',
    label: 'HR',
    width: '60px',
    align: 'center',
    visible: false, // Hidden by default
    dataKey: 'heartRate'
  },
  {
    id: 'calories',
    label: 'Cal',
    width: '60px',
    align: 'center',
    visible: false,
    dataKey: 'calories'
  }
];

// ==================== STORAGE KEYS ====================
export const COLUMN_CONFIG_STORAGE_KEYS = {
  WORKOUT: 'workout_table_columns',
  MOVEFRAME: 'moveframe_table_columns',
  MOVELAP: 'movelap_table_columns'
} as const;

