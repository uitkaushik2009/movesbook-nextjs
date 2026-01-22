/**
 * Tools Settings Constants
 * Extracted from ToolsSettings.tsx
 */

export type IconType = 'emoji' | 'bw_icons';
export type ToolsTab = 'periods' | 'sections' | 'sports' | 'equipment' | 'equipmentFactories' | 'muscles' | 'sportsEquipment' | 'exercises' | 'myLibrary' | 'devices' | 'executionTechniques' | 'bodyBuildingTechniques';

export interface Period {
  id: string;
  title: string;
  description: string;
  color: string;
  order: number;
  userId?: string; // Track ownership
  isUserCreated?: boolean; // Distinguish user-created from admin defaults
}

export interface WorkoutSection {
  id: string;
  title: string;
  description: string;
  color: string;
  order: number;
  userId?: string; // Track ownership
  isUserCreated?: boolean; // Distinguish user-created from admin defaults
}

export interface ExecutionTechnique {
  id: string;
  title: string;
  description: string;
  color: string;
  sports: string[]; // Array of sport names that can use this technique
  order: number;
  userId?: string; // Track ownership
  isUserCreated?: boolean; // Distinguish user-created from admin defaults
}

// Backward compatibility alias
export type BodyBuildingTechnique = ExecutionTechnique;

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
  isUserCreated?: boolean; // Distinguish user-created from admin defaults
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
  isUserCreated?: boolean; // Distinguish user-created from admin defaults
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
  isUserCreated?: boolean; // Distinguish user-created from admin defaults
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
 * Default execution techniques (formerly body building techniques)
 */
export const DEFAULT_EXECUTION_TECHNIQUES: ExecutionTechnique[] = [
  { id: '1', title: 'Drop Set', description: 'Reduce weight and continue reps', color: '#f59e0b', sports: ['BODY_BUILDING'], order: 0 },
  { id: '2', title: 'Super Set', description: 'Two exercises back-to-back', color: '#ef4444', sports: ['BODY_BUILDING'], order: 1 },
  { id: '3', title: 'Rest-Pause', description: 'Short breaks within a set', color: '#8b5cf6', sports: ['BODY_BUILDING'], order: 2 },
  { id: '4', title: 'Pyramid', description: 'Progressive weight increase/decrease', color: '#06b6d4', sports: ['BODY_BUILDING'], order: 3 },
  { id: '5', title: 'Tempo', description: 'Controlled movement speed', color: '#10b981', sports: ['BODY_BUILDING'], order: 4 },
];

// Backward compatibility alias
export const DEFAULT_BODYBUILDING_TECHNIQUES = DEFAULT_EXECUTION_TECHNIQUES;

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
  { id: '1', name: 'Swimming', icon: '/icons/swimming.jpg', order: 0, isTop5: true },
  { id: '2', name: 'Running', icon: '/icons/running.jpg', order: 1, isTop5: true },
  { id: '3', name: 'Cycling', icon: '/icons/cycling.jpg', order: 2, isTop5: true },
  { id: '4', name: 'Weights', icon: '/icons/weights.jpg', order: 3, isTop5: true },
  { id: '5', name: 'Soccer', icon: '/icons/soccer.jpg', order: 4, isTop5: true },
  { id: '6', name: 'Basketball', icon: '/icons/basketball.jpg', order: 5, isTop5: false },
  { id: '7', name: 'Tennis', icon: '/icons/tennis.jpg', order: 6, isTop5: false },
  { id: '8', name: 'Volleyball', icon: '/icons/volley.jpg', order: 7, isTop5: false },
  { id: '9', name: 'Boxing', icon: '/icons/boxe.jpg', order: 8, isTop5: false },
  { id: '10', name: 'Martial Arts', icon: '/icons/martial arts.jpg', order: 9, isTop5: false },
  { id: '11', name: 'Rowing', icon: '/icons/rowing.jpg', order: 10, isTop5: false },
  { id: '12', name: 'Yoga', icon: '/icons/yoga.jpg', order: 11, isTop5: false },
  { id: '13', name: 'Gymnastics', icon: '/icons/gymnastic.jpg', order: 12, isTop5: false },
  { id: '14', name: 'Skiing', icon: '/icons/ski.jpg', order: 13, isTop5: false },
  { id: '15', name: 'Surfing', icon: '/icons/surf.jpg', order: 14, isTop5: false },
  { id: '16', name: 'Golf', icon: '/icons/golf.jpg', order: 15, isTop5: false },
  { id: '17', name: 'Baseball', icon: '/icons/baseball.jpg', order: 16, isTop5: false },
  { id: '18', name: 'Ice Hockey', icon: '/icons/hockey.jpg', order: 17, isTop5: false },
  { id: '19', name: 'Rugby', icon: '/icons/rugby.jpg', order: 18, isTop5: false },
  { id: '20', name: 'Mountain Climbing', icon: '/icons/mountain climbing.jpg', order: 19, isTop5: false },
  { id: '21', name: 'American Football', icon: '/icons/american football.jpg', order: 20, isTop5: false },
  { id: '22', name: 'Archery', icon: '/icons/arch.jpg', order: 21, isTop5: false },
  { id: '23', name: 'Artistic Gymnastics', icon: '/icons/artistic gymnastics.jpg', order: 22, isTop5: false },
  { id: '24', name: 'Athletics', icon: '/icons/athletic.jpg', order: 23, isTop5: false },
  { id: '25', name: 'Badminton', icon: '/icons/badminton.jpg', order: 24, isTop5: false },
  { id: '26', name: 'Billiards', icon: '/icons/billiards.jpg', order: 25, isTop5: false },
  { id: '27', name: 'Boating', icon: '/icons/boating.jpg', order: 26, isTop5: false },
  { id: '28', name: 'Bowling', icon: '/icons/bowling.jpg', order: 27, isTop5: false },
  { id: '29', name: 'Calisthenics', icon: '/icons/calistenic.jpg', order: 28, isTop5: false },
  { id: '30', name: 'Canoe', icon: '/icons/canoe.jpg', order: 29, isTop5: false },
  { id: '31', name: 'Cycling Tourism', icon: '/icons/cicloturism.jpg', order: 30, isTop5: false },
  { id: '32', name: 'Classic Dance', icon: '/icons/classic dance.jpg', order: 31, isTop5: false },
  { id: '33', name: 'Cricket', icon: '/icons/cricket.jpg', order: 32, isTop5: false },
  { id: '34', name: 'Cross-Country Skiing', icon: '/icons/cross-country skiing.jpg', order: 33, isTop5: false },
  { id: '35', name: 'CrossFit', icon: '/icons/crossfit.jpg', order: 34, isTop5: false },
  { id: '36', name: 'Cyclocross', icon: '/icons/cyclocross.jpg', order: 35, isTop5: false },
  { id: '37', name: 'Dance', icon: '/icons/dance.jpg', order: 36, isTop5: false },
  { id: '38', name: 'Dips', icon: '/icons/dips.jpg', order: 37, isTop5: false },
  { id: '39', name: 'Diving', icon: '/icons/diving.jpg', order: 38, isTop5: false },
  { id: '40', name: 'Downhill Skiing', icon: '/icons/downhill skiing.jpg', order: 39, isTop5: false },
  { id: '41', name: 'Fencing', icon: '/icons/fancing.jpg', order: 40, isTop5: false },
  { id: '42', name: 'Field Hockey', icon: '/icons/field hockey.jpg', order: 41, isTop5: false },
  { id: '43', name: 'Fishing', icon: '/icons/fishing.jpg', order: 42, isTop5: false },
  { id: '44', name: 'Freestyle Wrestling', icon: '/icons/freestyle wrestling.jpg', order: 43, isTop5: false },
  { id: '45', name: 'Handball', icon: '/icons/handball.jpg', order: 44, isTop5: false },
  { id: '46', name: 'Hang Gliding', icon: '/icons/hang gliding.jpg', order: 45, isTop5: false },
  { id: '47', name: 'Hiking', icon: '/icons/hiking.jpg', order: 46, isTop5: false },
  { id: '48', name: 'Horse Racing', icon: '/icons/horse racing.jpg', order: 47, isTop5: false },
  { id: '49', name: 'Ice Skating', icon: '/icons/ice skating.jpg', order: 48, isTop5: false },
  { id: '50', name: 'Jumps', icon: '/icons/jumps.jpg', order: 49, isTop5: false },
  { id: '51', name: 'Kayak', icon: '/icons/kayak.jpg', order: 50, isTop5: false },
  { id: '52', name: 'Kickboxing', icon: '/icons/kick boxing.jpg', order: 51, isTop5: false },
  { id: '53', name: 'Lifting', icon: '/icons/lifting.jpg', order: 52, isTop5: false },
  { id: '54', name: 'Modern Dance', icon: '/icons/modern_dance.jpg', order: 53, isTop5: false },
  { id: '55', name: 'Motoring', icon: '/icons/Motoring.jpg', order: 54, isTop5: false },
  { id: '56', name: 'Mountain Bike', icon: '/icons/mountain bike.jpg', order: 55, isTop5: false },
  { id: '57', name: 'MTB', icon: '/icons/MTB.jpg', order: 56, isTop5: false },
  { id: '58', name: 'Pilates', icon: '/icons/pilaters.jpg', order: 57, isTop5: false },
  { id: '59', name: 'Ping Pong', icon: '/icons/ping pong.jpg', order: 58, isTop5: false },
  { id: '60', name: 'Polo', icon: '/icons/polo.jpg', order: 59, isTop5: false },
  { id: '61', name: 'Powerlifting', icon: '/icons/power_lifting.jpg', order: 60, isTop5: false },
  { id: '62', name: 'Racquetball', icon: '/icons/raquetball.jpg', order: 61, isTop5: false },
  { id: '63', name: 'Rhythmic Gymnastics', icon: '/icons/rhythmic gymnastics.jpg', order: 62, isTop5: false },
  { id: '64', name: 'Sailing', icon: '/icons/sailing.jpg', order: 63, isTop5: false },
  { id: '65', name: 'Shot Put', icon: '/icons/shot.jpg', order: 64, isTop5: false },
  { id: '66', name: 'Skateboard', icon: '/icons/skateboard.jpg', order: 65, isTop5: false },
  { id: '67', name: 'Skating', icon: '/icons/skating.jpg', order: 66, isTop5: false },
  { id: '68', name: 'Ski Jump', icon: '/icons/ski jump.jpg', order: 67, isTop5: false },
  { id: '69', name: 'Ski Slalom', icon: '/icons/ski slalom.jpg', order: 68, isTop5: false },
  { id: '70', name: 'Snorkeling', icon: '/icons/snorkeling.jpg', order: 69, isTop5: false },
  { id: '71', name: 'Snowboard', icon: '/icons/snowboard.jpg', order: 70, isTop5: false },
  { id: '72', name: 'Spartan Race', icon: '/icons/spartan.jpg', order: 71, isTop5: false },
  { id: '73', name: 'Spinning', icon: '/icons/spining.jpg', order: 72, isTop5: false },
  { id: '74', name: 'Stretching', icon: '/icons/stretching.jpg', order: 73, isTop5: false },
  { id: '75', name: 'Tango', icon: '/icons/tango.jpg', order: 74, isTop5: false },
  { id: '76', name: 'Technical Training', icon: '/icons/technical.jpg', order: 75, isTop5: false },
  { id: '77', name: 'Throws', icon: '/icons/throwes.jpg', order: 76, isTop5: false },
  { id: '78', name: 'Trekking', icon: '/icons/trekking.jpg', order: 77, isTop5: false },
  { id: '79', name: 'Triathlon', icon: '/icons/triathlon.jpg', order: 78, isTop5: false },
  { id: '80', name: 'Walking', icon: '/icons/walking.jpg', order: 79, isTop5: false },
  { id: '81', name: 'Water Polo', icon: '/icons/water polo.jpg', order: 80, isTop5: false },
  { id: '82', name: 'Water Ski', icon: '/icons/waterl ski.jpg', order: 81, isTop5: false },
  { id: '83', name: 'Windsurf', icon: '/icons/windsurf.jpg', order: 82, isTop5: false },
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
  EXECUTION_TECHNIQUES: 'executionTechniques',
  BODYBUILDING_TECHNIQUES: 'executionTechniques', // Backward compatibility alias
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

