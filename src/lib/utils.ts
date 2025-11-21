import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function generateMoveframeLetter(existingLetters: string[]): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Find single letters first
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    if (!existingLetters.includes(letter)) {
      return letter;
    }
  }
  
  // Then double letters
  for (let i = 0; i < letters.length; i++) {
    for (let j = 0; j < letters.length; j++) {
      const letter = letters[i] + letters[j];
      if (!existingLetters.includes(letter)) {
        return letter;
      }
    }
  }
  
  return 'A'; // Fallback
}

export function calculateMoveframeTotals(movelaps: any[]) {
  const enabledMovelaps = movelaps.filter(lap => !lap.isDisabled);
  
  return {
    totalDistance: enabledMovelaps.reduce((sum, lap) => sum + (lap.distance || 0), 0),
    totalReps: enabledMovelaps.length,
    totalTime: '0:00:00' // This would need actual time calculation
  };
}

export function validateWorkoutConstraints(workouts: any[]): boolean {
  const sportsInDay = new Set();
  
  for (const workout of workouts) {
    for (const sport of workout.sports) {
      sportsInDay.add(sport);
    }
  }
  
  return workouts.length <= 3 && sportsInDay.size <= 4;
}