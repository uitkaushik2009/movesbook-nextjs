/**
 * Moveframe Constants
 * Extracted from AddEditMoveframeModal.tsx for better maintainability
 */

// Macro final options (0' to 9')
export const MACRO_FINAL_OPTIONS = [
  "0'", "1'", "2'", "3'", "4'", "5'", "6'", "7'", "8'", "9'"
];

// Muscular sectors for BODY_BUILDING (WEIGHTS)
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

// Rest type options
export const REST_TYPES = {
  SET_TIME: 'Set time',
  RESTART_TIME: 'Restart time',
  RESTART_PULSE: 'Restart pulse'
} as const;

// Reps type options (for non-distance sports)
export const REPS_TYPES = {
  REPS: 'Reps',
  TIME: 'Time'
} as const;

// Sport-specific field configurations
export const SPORT_CONFIGS = {
  SWIM: {
    meters: ['25', '33', '50', '66', '75', '100', '125', '150', '200', '250', '300', '400', '500', '800', '1000', '1200', '1500', 'input'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Freestyle', 'Dolphin', 'Backstroke', 'Breaststroke', 'Sliding', 'Apnea'],
    // Pace\100 applies for all meter values in swim
    pace100Meters: ['25', '33', '50', '66', '75', '100', '125', '150', '200', '250', '300', '400', '500', '800', '1000', '1200', '1500'],
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0', '0"', '5"', '10"', '15"', '20"', '25"', '30"', '35"', '40"', '45"', '50"', "1'", "1'10\"", "1'15\"", "1'30\"", "2'", "2'30\"", "3'"],
      [REST_TYPES.RESTART_TIME]: 'input', // 00'00" format, > Time input
      [REST_TYPES.RESTART_PULSE]: 'input' // 60-200 range
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  RUN: {
    meters: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000', 'input'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Road', 'Cross', 'Beach', 'Hill', 'Downhill'],
    // Pace\100 only for these specific meter values
    pace100Meters: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500'],
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  BIKE: {
    meters: ['200', '400', '500', '1000', '1500', '2000', '3000', '4000', '5000', '7000', '8000', '10000', 'input'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Road', 'Track', 'Mountain', 'Indoor'],
    // Pace\100 only for 200 and 400 meters
    pace100Meters: ['200', '400'],
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0', '15"', '30"', '45"', "1'", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  SPINNING: {
    meters: ['200', '400', '500', '1000', '1500', '2000', '3000', '4000', '5000', '7000', '8000', '10000', 'input'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Endurance', 'HIIT', 'Intervals', 'Climb'],
    // Pace\100 only for 200 and 400 meters
    pace100Meters: ['200', '400'],
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0', '15"', '30"', '45"', "1'", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  BODY_BUILDING: {
    // Sector+Exercise+Picture (from procedure)
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive', 'Negative'],
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0', '0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  ROWING: {
    meters: ['100', '200', '250', '300', '400', '500', '750', '1000', '1250', '1500', '1750', '2000', '2500', '3000', '4000', '5000', '7000', '8000', '10000', '12000', '15000', 'input'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    rowPerMin: 'input', // Range 10-99
    // Pace\100 only for these specific meter values
    pace100Meters: ['100', '200', '250', '300', '400'],
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['15"', '30"', '45"', "1'", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  SKATE: {
    meters: ['50', '100', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Road', 'Downhill'],
    // Pace\100 for these specific meter values
    pace100Meters: ['50', '100', '200', '300', '400', '500', '600'],
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  SKI: {
    meters: ['50', '100', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000', 'input'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Downhill'],
    // Pace\100 for these specific meter values
    pace100Meters: ['50', '100', '200', '300', '400', '500'],
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  SNOWBOARD: {
    meters: ['50', '100', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000', 'input'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Park', 'Downhill', 'Freestyle'],
    pace100Meters: ['50', '100', '200', '300', '400', '500'],
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  GYMNASTIC: {
    // Sector+Exercise+Picture (from procedure)
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Very fast', 'Explosive', 'Negative'],
    styles: 'dropdown', // To be defined by user
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  STRETCHING: {
    // Sector+Exercise+Picture (from procedure)
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Very fast'],
    styles: 'dropdown', // To be defined by user
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  PILATES: {
    // Sector+Exercise+Picture (from procedure)
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Very fast'],
    styles: 'dropdown', // To be defined by user
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  YOGA: {
    // Similar to Pilates/Stretching
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Very fast'],
    styles: 'dropdown',
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  TECHNICAL_MOVES: {
    // Sector+Exercise+Picture (from procedure)
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Very fast'],
    styles: 'dropdown', // To be defined by user
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  FREE_MOVES: {
    // Exercise from user-typed list (tracked history)
    exerciseSource: 'user-history',
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Very fast'],
    styles: 'input', // Free text input
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  SOCCER: {
    // Team sport - series/reps based, not distance based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast'],
    styles: 'input', // Free text input (e.g., "Shooting drills", "Passing practice")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '10"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "2'30\"", "3'", "5'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  BASKETBALL: {
    // Team sport - series/reps based, not distance based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast'],
    styles: 'input', // Free text input (e.g., "Free throws", "Layup drills")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '10"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "2'30\"", "3'", "5'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  TENNIS: {
    // Racket sport - series/reps based, not distance based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast'],
    styles: 'input', // Free text input (e.g., "Forehand", "Serve practice")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '10"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "3'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  VOLLEYBALL: {
    // Team sport - series/reps based, not distance based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast'],
    styles: 'input', // Free text input (e.g., "Spiking", "Serving drills")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '10"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "3'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  GOLF: {
    // Individual sport - series/reps based, not distance based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast'],
    styles: 'input', // Free text input (e.g., "Putting", "Drive practice")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "3'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  BOXING: {
    // Combat sport - series/reps based, not distance based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive'],
    styles: 'input', // Free text input (e.g., "Heavy bag", "Speed bag", "Sparring")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '10"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "3'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  MARTIAL_ARTS: {
    // Combat sport - series/reps based, similar to boxing
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive'],
    styles: 'input', // Free text input (e.g., "Kicks", "Kata", "Sparring")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '10"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "3'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  CLIMBING: {
    // Individual sport - series/reps based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast'],
    styles: 'input', // Free text input (e.g., "Bouldering", "Lead climbing")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '30"', '45"', "1'", "1'30\"", "2'", "3'", "5'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  WALKING: {
    // Distance-based sport - managed like RUN
    meters: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000', 'input'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Road', 'Cross', 'Beach', 'Hill', 'Downhill'],
    // Pace\100 for the same meter values as RUN
    pace100Meters: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500'],
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  HIKING: {
    // Distance-based sport - managed like RUN
    meters: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000', 'input'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Road', 'Cross', 'Beach', 'Hill', 'Downhill'],
    // Pace\100 for the same meter values as RUN
    pace100Meters: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500'],
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  DANCING: {
    // Series/reps based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast'],
    styles: 'input', // Free text input (e.g., "Ballet", "Hip hop", "Ballroom")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "3'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  CALISTENIC: {
    // Bodyweight training - series/reps based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive', 'Negative'],
    styles: 'input', // Free text input (e.g., "Pull-ups", "Push-ups", "Dips")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '10"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "3'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  CROSSFIT: {
    // Mixed training - series/reps based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive'],
    styles: 'input', // Free text input (e.g., "WOD", "AMRAP", "EMOM")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '10"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "3'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  SPARTAN: {
    // Obstacle race training - series/reps based
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive'],
    styles: 'input', // Free text input (e.g., "Rope climb", "Wall jump", "Burpees")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '10"', '15"', '20"', '30"', '45"', "1'", "1'30\"", "2'", "3'"],
      [REST_TYPES.RESTART_TIME]: 'input',
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  TRIATHLON: {
    // Multi-sport - can use distance for swim/bike/run portions, but reps for transitions
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast'],
    styles: 'input', // Free text input (e.g., "Swim-Bike-Run", "Transition practice")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '15"', '30"', '45"', "1'", "1'30\"", "2'", "3'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  
  TRACK_FIELD: {
    // Various events - series/reps based for field events, distance for track
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive'],
    styles: 'input', // Free text input (e.g., "Long jump", "Shot put", "Hurdles")
    repsTypes: [REPS_TYPES.REPS, REPS_TYPES.TIME],
    repsRange: { min: 1, max: 99 },
    timeRange: { min: '00\'01"', max: '09\'59"' },
    restTypes: [REST_TYPES.SET_TIME, REST_TYPES.RESTART_PULSE],
    pauses: {
      [REST_TYPES.SET_TIME]: ['0"', '15"', '30"', '45"', "1'", "1'30\"", "2'", "3'", "5'"],
      [REST_TYPES.RESTART_PULSE]: 'input'
    },
    macroFinals: MACRO_FINAL_OPTIONS,
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  }
} as const;

// List of all available sports
export const SPORTS_LIST = [
  'SWIM',
  'BIKE',
  'SPINNING',
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
  'CALISTENIC',
  'CROSSFIT',
  'SPARTAN',
  'TRIATHLON',
  'TRACK_FIELD'
] as const;

// Sports that use distance/duration tracking (all others use series/repetitions)
export const DISTANCE_BASED_SPORTS = [
  'SWIM',
  'BIKE',
  'SPINNING',
  'RUN',
  'ROWING',
  'SKATE',
  'SKI',
  'SNOWBOARD',
  'WALKING',
  'HIKING'
] as const;

// Sports that use Reps type selection (Reps vs Time)
export const REPS_TYPE_SPORTS = [
  'BODY_BUILDING',
  'GYMNASTIC',
  'STRETCHING',
  'PILATES',
  'YOGA',
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
  'DANCING',
  'CALISTENIC',
  'CROSSFIT',
  'SPARTAN',
  'TRIATHLON',
  'TRACK_FIELD'
] as const;

// Helper function to check if a sport uses series-based tracking
export const isSeriesBasedSport = (sport: string): boolean => {
  return !DISTANCE_BASED_SPORTS.includes(sport as any);
};

// Helper function to check if a sport uses reps type selection
export const hasRepsTypeSelection = (sport: string): boolean => {
  return REPS_TYPE_SPORTS.includes(sport as any);
};

// Helper function to get pace label based on sport and meters
export const getPaceLabel = (sport: string, meters: string): string => {
  // Special handling for specific sports
  if (sport === 'BIKE') {
    return 'Speed\\h'; // Speed km/h (decimal format: 00.0 to 99.9)
  }
  
  if (sport === 'ROWING') {
    return 'Speed\\500m'; // Speed per 500m (time format: 0'00")
  }
  
  if (sport === 'SKI') {
    return 'Pace\\Refdist'; // Pace per reference distance (time format: 0'00")
  }
  
  const config = getSportConfig(sport);
  
  // Check if this sport has pace100Meters definition
  if ('pace100Meters' in config && config.pace100Meters) {
    // If the current meter value is in the pace100Meters array, show "Pace\100"
    if ((config.pace100Meters as readonly string[]).includes(meters)) {
      return 'Pace\\100';
    }
  }
  
  // Otherwise, show Pace\km (or Pace\mile for English)
  // TODO: Add language detection for Pace\mile
  return 'Pace\\km';
};

// Helper function to check if pace field should be shown
export const shouldShowPaceField = (sport: string): boolean => {
  const noPaceSports = ['BODY_BUILDING', 'GYMNASTIC', 'STRETCHING', 'PILATES', 'YOGA', 'TECHNICAL_MOVES', 'FREE_MOVES', 'CALISTENIC', 'CROSSFIT', 'SPARTAN'];
  return !noPaceSports.includes(sport);
};

// Helper function to get display name for sports
export const getSportDisplayName = (sport: string): string => {
  const displayNames: Record<string, string> = {
    'BODY_BUILDING': 'BODY BUILDING',
    'TECHNICAL_MOVES': 'TECHNICAL MOVES',
    'FREE_MOVES': 'FREE MOVES'
  };
  
  return displayNames[sport] || sport.replace(/_/g, ' ');
};

// Type definitions
export type Sport = typeof SPORTS_LIST[number];
export type MoveframeType = 'STANDARD' | 'BATTERY' | 'ANNOTATION';
export type SportConfig = typeof SPORT_CONFIGS[keyof typeof SPORT_CONFIGS];
export type RestType = typeof REST_TYPES[keyof typeof REST_TYPES];
export type RepsType = typeof REPS_TYPES[keyof typeof REPS_TYPES];

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

// Helper function to check if sport has row/min field (ROWING specific)
export function sportHasRowPerMin(sport: string): boolean {
  return sport === 'ROWING';
}

// Sports that require an exercise/drill name input
export const SPORTS_WITH_EXERCISE_NAME = [
  'BODY_BUILDING',
  'GYMNASTIC',
  'STRETCHING',
  'PILATES',
  'YOGA',
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
  'DANCING',
  'CALISTENIC',
  'CROSSFIT',
  'SPARTAN',
  'TRIATHLON'
] as const;

// Helper function to check if sport requires exercise/drill name
export function sportNeedsExerciseName(sport: string): boolean {
  return SPORTS_WITH_EXERCISE_NAME.includes(sport as any);
}

// Helper function to get pause options based on rest type
export function getPauseOptions(sport: string, restType: string): readonly string[] | 'input' {
  const config = getSportConfig(sport);
  if ('pauses' in config) {
    if (typeof config.pauses === 'object' && !Array.isArray(config.pauses)) {
      return config.pauses[restType as keyof typeof config.pauses] || [];
    }
    return config.pauses;
  }
  return [];
}
