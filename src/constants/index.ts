import { SportConfiguration, SportType, RestType } from '@/types';

export const SPORT_CONFIGS: Record<SportType, SportConfiguration> = {
  [SportType.SWIM]: {
    meters: [20, 50, 75, 100, 150, 200, 400, 500, 800, 1000, 1200, 1500],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Freestyle', 'Dolphin', 'Backstroke', 'Breaststroke', 'Sliding', 'Apnea'],
    restTypes: [RestType.SET_TIME, RestType.RESTART_TIME, RestType.RESTART_PULSE],
    pauseOptions: ['0"', '5"', '10"', '15"', '20"', '25"', '30"', '35"', '40"', '45"', '50"', '1\'', '1\'10"', '1\'15"', '1\'30"', '2\'', '2\'30"', '3\'']
  },
  [SportType.BIKE]: {
    meters: [200, 400, 500, 1000, 1500, 2000, 3000, 4000, 5000, 7000, 8000, 10000],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: [],
    restTypes: [RestType.SET_TIME, RestType.RESTART_TIME, RestType.RESTART_PULSE],
    pauseOptions: ['15"', '30"', '45"', '1\'', '1\'30"', '2\'', '2\'30"', '3\'', '4\'', '5\'']
  },
  [SportType.RUN]: {
    meters: [50, 60, 80, 100, 110, 150, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 3000, 5000, 10000],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Road', 'Cross', 'Beach', 'Hill', 'Downhill'],
    restTypes: [RestType.SET_TIME, RestType.RESTART_TIME, RestType.RESTART_PULSE],
    pauseOptions: ['20"', '30"', '45"', '1\'', '1\'15"', '1\'30"', '2\'', '2\'30"', '3\'', '4\'', '5\'', '6\'', '7\'']
  },
  [SportType.BODY_BUILDING]: {
    meters: [],
    speeds: ['Very slow', 'slow', 'normal', 'quick', 'fast', 'very fast', 'explosive', 'negative'],
    styles: [],
    restTypes: [RestType.SET_TIME, RestType.RESTART_PULSE],
    pauseOptions: ['0"', '5"', '10"', '15"', '20"', '30"', '45"', '1\'', '1\'15"', '1\'30"', '2\'', '2\'30"', '3\'', '4\'', '5\'', '6\'', '7\'']
  },
  // Add other sports configurations...
};

export const WORKOUT_STATUS_CONFIG = {
  [WorkoutStatus.NOT_PLANNED]: { color: 'gray', symbol: '○', textColor: 'white' },
  [WorkoutStatus.PLANNED_FUTURE]: { color: 'yellow', symbol: '○', textColor: 'black' },
  [WorkoutStatus.PLANNED_NEXT_WEEK]: { color: 'orange', symbol: '□', textColor: 'black' },
  [WorkoutStatus.PLANNED_CURRENT_WEEK]: { color: 'red', symbol: '△', textColor: 'white' },
  [WorkoutStatus.DONE_DIFFERENTLY]: { color: 'blue', symbol: '○', textColor: 'white' },
  [WorkoutStatus.DONE_LESS_75]: { color: 'lightgreen', symbol: '○', textColor: 'black' },
  [WorkoutStatus.DONE_MORE_75]: { color: 'green', symbol: '○', textColor: 'white' }
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const DEFAULT_COLORS: ColorSettings = {
  pageBackground: '#ffffff',
  dayHeader: '#f3f4f6',
  moveframeHeader: '#e5e7eb',
  movelapHeader: '#d1d5db',
  microlapBackground: '#f9fafb',
  selectedRow: '#3b82f6',
  buttonAdd: '#10b981',
  buttonEdit: '#f59e0b',
  buttonDelete: '#ef4444',
  buttonPrint: '#6b7280',
  alternateRow: '#f8fafc'
};