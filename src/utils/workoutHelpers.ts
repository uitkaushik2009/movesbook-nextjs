/**
 * Workout Helper Utilities
 * Extracted from various workout components for reusability
 */

import { getSportIcon } from './sportIcons';

export interface SportSummary {
  sport: string;
  icon: string;
  name: string; // Section name
  distance: number;
  duration: string;
  color: string;
}

/**
 * Calculate sport summaries for a day (up to 4 sports)
 * Extracted from DayRowTable.tsx
 * 
 * @param day - Day object with workouts and moveframes
 * @param iconType - Type of icon to use ('emoji' or 'icon')
 * @returns Array of sport summaries (max 4)
 */
export function calculateSportSummaries(
  day: any, 
  iconType: 'emoji' | 'icon' = 'emoji'
): SportSummary[] {
  if (!day.workouts || day.workouts.length === 0) {
    return [];
  }

  const sportMap = new Map<string, SportSummary>();

  day.workouts.forEach((workout: any) => {
    if (workout.moveframes) {
      workout.moveframes.forEach((moveframe: any) => {
        const sport = moveframe.sport;
        const sectionName = moveframe.section?.name || 'No Section';
        const sectionColor = moveframe.section?.color || '#E5E7EB';
        
        if (!sportMap.has(sport)) {
          sportMap.set(sport, {
            sport,
            icon: getSportIcon(sport, iconType),
            name: sectionName,
            distance: 0,
            duration: '0:00',
            color: sectionColor
          });
        }

        const summary = sportMap.get(sport)!;
        
        // Sum distances from movelaps
        if (moveframe.movelaps) {
          moveframe.movelaps.forEach((movelap: any) => {
            if (movelap.distance) {
              summary.distance += Number(movelap.distance);
            }
          });
        }
      });
    }
  });

  // Return up to 4 sports
  return Array.from(sportMap.values()).slice(0, 4);
}

/**
 * Calculate total distance for a day
 * 
 * @param day - Day object with workouts and moveframes
 * @returns Total distance in meters
 */
export function calculateDayTotalDistance(day: any): number {
  const summaries = calculateSportSummaries(day);
  return summaries.reduce((total, summary) => total + summary.distance, 0);
}

/**
 * Get unique sports from a day
 * 
 * @param day - Day object with workouts and moveframes
 * @returns Array of unique sport names
 */
export function getUniqueSportsFromDay(day: any): string[] {
  if (!day.workouts || day.workouts.length === 0) {
    return [];
  }

  const sports = new Set<string>();
  
  day.workouts.forEach((workout: any) => {
    if (workout.moveframes) {
      workout.moveframes.forEach((moveframe: any) => {
        if (moveframe.sport) {
          sports.add(moveframe.sport);
        }
      });
    }
  });

  return Array.from(sports);
}

