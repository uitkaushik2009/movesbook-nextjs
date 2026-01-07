/**
 * Tools Settings Constants
 * Extracted from ToolsSettings.tsx
 */

export type IconType = 'emoji' | 'bw_icons';
export type ToolsTab = 'periods' | 'sections' | 'sports' | 'equipment' | 'equipmentFactories' | 'muscles' | 'sportsEquipment' | 'exercises' | 'myLibrary' | 'devices';

export interface Period {
  id: string;
  title: string;
  description: string;
  color: string;
  order: number;
}

export interface WorkoutSection {
  id: string;
  title: string;
  description: string;
  color: string;
  order: number;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  order: number;
  isTop5: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  picture?: string;
  category: string;
  sports: string[]; // Multi-select sports tags
  company?: string;
  description: string;
  inStock: boolean;
  // Athlete-specific fields
  startDate?: string;
  durationAlarm?: {
    days?: number;
    km?: number;
    time?: string;
  };
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  equipment: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  muscleGroups: string[];
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  codekey: string; // Unique code identifier for protocol mapping (e.g., GARM-FR945)
  type: 'Watch' | 'Tracker' | 'Monitor' | 'Scale' | 'Sensor' | 'Other';
  compatibility: string[];
  isEnabled: boolean;
  syncProtocol: string;
  description: string;
}

/**
 * Supported languages for tools settings
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ja', name: '日本語' },
  { code: 'id', name: 'Indonesia' },
  { code: 'zh', name: '中文' },
  { code: 'ar', name: 'العربية' },
];

/**
 * Default workout periods
 */
export const DEFAULT_PERIODS: Period[] = [
  { id: '1', title: 'Preparation Phase', description: 'Building base fitness', color: '#3b82f6', order: 0 },
  { id: '2', title: 'Competition Phase', description: 'Peak performance period', color: '#ef4444', order: 1 },
  { id: '3', title: 'Recovery Phase', description: 'Active recovery and rest', color: '#10b981', order: 2 },
];

/**
 * Default workout sections
 */
export const DEFAULT_SECTIONS: WorkoutSection[] = [
  { id: '1', title: 'Warm-up', description: 'Preparation exercises', color: '#f59e0b', order: 0 },
  { id: '2', title: 'Main Set', description: 'Primary workout', color: '#3b82f6', order: 1 },
  { id: '3', title: 'Cool-down', description: 'Recovery exercises', color: '#10b981', order: 2 },
];

/**
 * Default sports list
 */
export const DEFAULT_SPORTS: Sport[] = [
  { id: '1', name: 'Swimming', icon: '🏊‍♂️', order: 0, isTop5: true },
  { id: '2', name: 'Running', icon: '🏃‍♂️', order: 1, isTop5: true },
  { id: '3', name: 'Cycling', icon: '🚴‍♂️', order: 2, isTop5: true },
  { id: '4', name: 'Weightlifting', icon: '🏋️‍♂️', order: 3, isTop5: true },
  { id: '5', name: 'Football/Soccer', icon: '⚽', order: 4, isTop5: true },
  { id: '6', name: 'Basketball', icon: '🏀', order: 5, isTop5: false },
  { id: '7', name: 'Tennis', icon: '🎾', order: 6, isTop5: false },
  { id: '8', name: 'Volleyball', icon: '🏐', order: 7, isTop5: false },
  { id: '9', name: 'Boxing', icon: '🥊', order: 8, isTop5: false },
  { id: '10', name: 'Martial Arts', icon: '🥋', order: 9, isTop5: false },
  { id: '11', name: 'Rowing', icon: '🚣‍♂️', order: 10, isTop5: false },
  { id: '12', name: 'Yoga', icon: '🧘‍♂️', order: 11, isTop5: false },
  { id: '13', name: 'Gymnastics', icon: '🤸‍♂️', order: 12, isTop5: false },
  { id: '14', name: 'Skiing', icon: '⛷️', order: 13, isTop5: false },
  { id: '15', name: 'Surfing', icon: '🏄‍♂️', order: 14, isTop5: false },
  { id: '16', name: 'Golf', icon: '⛳', order: 15, isTop5: false },
  { id: '17', name: 'Baseball', icon: '⚾', order: 16, isTop5: false },
  { id: '18', name: 'Ice Hockey', icon: '🏒', order: 17, isTop5: false },
  { id: '19', name: 'Rugby', icon: '🏉', order: 18, isTop5: false },
  { id: '20', name: 'Climbing', icon: '🧗‍♂️', order: 19, isTop5: false },
];

/**
 * Default equipment list
 */
export const DEFAULT_EQUIPMENT: Equipment[] = [
  { id: '1', name: 'Treadmill', category: 'Cardio', sports: ['RUN'], description: 'Running machine', inStock: true },
  { id: '2', name: 'Dumbbells', category: 'Strength', sports: ['BODY_BUILDING'], description: 'Free weights', inStock: true },
  { id: '3', name: 'Yoga Mat', category: 'Flexibility', sports: ['YOGA', 'PILATES', 'STRETCHING'], description: 'Exercise mat', inStock: true },
  { id: '4', name: 'Resistance Bands', category: 'Strength', sports: ['BODY_BUILDING', 'STRETCHING'], description: 'Elastic bands', inStock: true },
  { id: '5', name: 'Pull-up Bar', category: 'Strength', sports: ['BODY_BUILDING', 'GYMNASTIC'], description: 'Upper body equipment', inStock: true },
];

/**
 * Default exercises list
 */
export const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Push-ups',
    category: 'Strength',
    description: 'Upper body exercise',
    equipment: [],
    difficulty: 'Beginner',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
  },
  {
    id: '2',
    name: 'Squats',
    category: 'Strength',
    description: 'Lower body exercise',
    equipment: [],
    difficulty: 'Beginner',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
  },
  {
    id: '3',
    name: 'Plank',
    category: 'Core',
    description: 'Core stability exercise',
    equipment: [],
    difficulty: 'Beginner',
    muscleGroups: ['Abs', 'Core'],
  },
];

/**
 * Default devices list
 */
export const DEFAULT_DEVICES: Device[] = [
  {
    id: '1',
    name: 'Garmin Forerunner',
    brand: 'Garmin',
    model: 'Forerunner 945',
    codekey: 'GARM-FR945',
    type: 'Watch',
    compatibility: ['iOS', 'Android'],
    isEnabled: true,
    syncProtocol: 'Bluetooth',
    description: 'GPS running watch',
  },
  {
    id: '2',
    name: 'Apple Watch',
    brand: 'Apple',
    model: 'Series 8',
    codekey: 'APPL-WS8',
    type: 'Watch',
    compatibility: ['iOS'],
    isEnabled: true,
    syncProtocol: 'Bluetooth',
    description: 'Smart watch with fitness tracking',
  },
  {
    id: '3',
    name: 'Fitbit Charge',
    brand: 'Fitbit',
    model: 'Charge 5',
    codekey: 'FITB-CH5',
    type: 'Tracker',
    compatibility: ['iOS', 'Android'],
    isEnabled: true,
    syncProtocol: 'Bluetooth',
    description: 'Fitness tracker',
  },
];

/**
 * LocalStorage keys for tools settings
 */
export const STORAGE_KEYS = {
  PERIODS: 'workoutPeriods',
  SECTIONS: 'workoutSections',
  SPORTS: 'mainSports',
  EQUIPMENT: 'equipment',
  EXERCISES: 'exercises',
  DEVICES: 'compatibleDevices',
} as const;

/**
 * Helper: Filter items by search query
 */
export function filterBySearch<T extends { name?: string; title?: string }>(
  items: T[],
  searchQuery: string
): T[] {
  if (!searchQuery.trim()) return items;
  
  const searchLower = searchQuery.toLowerCase();
  return items.filter(item => {
    const name = item.name || item.title || '';
    return name.toLowerCase().includes(searchLower);
  });
}

/**
 * Helper: Filter by category
 */
export function filterByCategory<T extends { category?: string }>(
  items: T[],
  categoryFilter: string
): T[] {
  if (categoryFilter === 'all') return items;
  
  return items.filter(item => item.category === categoryFilter);
}

/**
 * Helper: Sort items by order property
 */
export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/**
 * Helper: Reorder items after drag and drop
 */
export function reorderItems<T extends { id: string; order: number }>(
  items: T[],
  draggedId: string,
  targetId: string
): T[] {
  const draggedIndex = items.findIndex(item => item.id === draggedId);
  const targetIndex = items.findIndex(item => item.id === targetId);
  
  if (draggedIndex === -1 || targetIndex === -1) return items;
  
  const reordered = [...items];
  const [draggedItem] = reordered.splice(draggedIndex, 1);
  reordered.splice(targetIndex, 0, draggedItem);
  
  // Update order numbers
  return reordered.map((item, index) => ({
    ...item,
    order: index
  }));
}

