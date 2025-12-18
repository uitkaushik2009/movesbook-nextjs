/**
 * Moveframe Constants
 * Extracted from AddEditMoveframeModal.tsx for better maintainability
 */

// Macro final options (0' to 9')
export const MACRO_FINAL_OPTIONS = [
  "0'", "1'", "2'", "3'", "4'", "5'", "6'", "7'", "8'", "9'"
];

// Muscular sectors for BODY_BUILDING
export const MUSCULAR_SECTORS = [
  'Shoulders',
  'Anterior arms',
  'Rear arms',
  'Forearms',
  'Chest',
  'Abdominals',
  'Intercostals',
  'Trapezius',
  'Lats',
  'Lumbosacral',
  'Front thighs',
  'Hind thighs',
  'Calves',
  'Tibials'
];

// Sport-specific field configurations
export const SPORT_CONFIGS = {
  SWIM: {
    meters: ['20', '50', '75', '100', '150', '200', '400', '500', '800', '1000', '1200', '1500'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Freestyle', 'Dolphin', 'Backstroke', 'Breaststroke', 'Sliding', 'Apnea'],
    pauses: ['0', '0"', '5"', '10"', '15"', '20"', '25"', '30"', '35"', '40"', '45"', '50"', "1'", "1'10\"", "1'15\"", "1'30\"", "2'", "2'30\"", "3'"],
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  RUN: {
    meters: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Road', 'Cross', 'Beach', 'Hill', 'Downhill'],
    pauses: ['0', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  BIKE: {
    meters: ['200', '400', '500', '1000', '1500', '2000', '3000', '4000', '5000', '7000', '8000', '10000', 'custom'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    pauses: ['0', '15"', '30"', '45"', "1'", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'"],
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  BODY_BUILDING: {
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive', 'Negative'],
    pauses: ['0', '0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  }
} as const;

// List of all available sports
export const SPORTS_LIST = [
  'SWIM',
  'BIKE',
  'RUN',
  'BODY_BUILDING',
  'ROWING',
  'SKATE',
  'GYMNASTIC',
  'STRETCHING',
  'PILATES',
  'YOGA',
  'SKI',
  'SNOWBOARD',
  'TECHNICAL_MOVES',
  'FREE_MOVES',
  'SOCCER',
  'BASKETBALL',
  'TENNIS',
  'VOLLEYBALL',
  'GOLF',
  'BOXING',
  'MARTIAL_ARTS',
  'CLIMBING',
  'HIKING',
  'WALKING',
  'DANCING',
  'CROSSFIT',
  'TRIATHLON',
  'TRACK_FIELD'
] as const;

// Sports that use distance/duration tracking (all others use series/repetitions)
export const DISTANCE_BASED_SPORTS = [
  'SWIM',
  'BIKE',
  'RUN',
  'ROWING',
  'SKATE',
  'SKI',
  'SNOWBOARD',
  'WALKING',
  'HIKING'
] as const;

// Helper function to check if a sport uses series-based tracking
export const isSeriesBasedSport = (sport: string): boolean => {
  return !DISTANCE_BASED_SPORTS.includes(sport as any);
};

// Type definitions
export type Sport = typeof SPORTS_LIST[number];
export type MoveframeType = 'STANDARD' | 'BATTERY' | 'ANNOTATION';
export type SportConfig = typeof SPORT_CONFIGS[keyof typeof SPORT_CONFIGS];

// Helper function to get sport configuration
export function getSportConfig(sport: string): SportConfig {
  return SPORT_CONFIGS[sport as keyof typeof SPORT_CONFIGS] || SPORT_CONFIGS.SWIM;
}

// Helper function to check if sport has meters field
export function sportHasMeters(sport: string): boolean {
  const config = getSportConfig(sport);
  return 'meters' in config;
}

// Helper function to check if sport has styles field
export function sportHasStyles(sport: string): boolean {
  const config = getSportConfig(sport);
  return 'styles' in config;
}

