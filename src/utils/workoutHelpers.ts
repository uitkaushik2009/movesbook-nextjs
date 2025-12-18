/**
 * Workout Helper Utilities
 * Extracted from various workout components for reusability
 */

import { getSportIcon } from './sportIcons';
import { isSeriesBasedSport } from '@/constants/moveframe.constants';

export interface SportSummary {
  sport: string;
  icon: string;
  name: string; // Section name
  distance: number;
  duration: string;
  color: string;
  isSeriesBased?: boolean;
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

  const sportMap = new Map<string, SportSummary & { series: number; repetitions: number }>();

  day.workouts.forEach((workout: any) => {
    if (workout.moveframes) {
      workout.moveframes.forEach((moveframe: any) => {
        const sport = moveframe.sport;
        const sectionName = moveframe.section?.name || 'No Section';
        const sectionColor = moveframe.section?.color || '#E5E7EB';
        const isSeries = isSeriesBasedSport(sport);
        
        if (!sportMap.has(sport)) {
          sportMap.set(sport, {
            sport,
            icon: getSportIcon(sport, iconType),
            name: sectionName,
            distance: 0,
            duration: '0:00',
            color: sectionColor,
            isSeriesBased: isSeries,
            series: 0,
            repetitions: 0
          });
        }

        const summary = sportMap.get(sport)!;
        
        if (isSeries) {
          // For series-based sports: count series and repetitions
          const seriesCount = moveframe.repetitions || moveframe.movelaps?.[0]?.series || 0;
          const repsPerSeries = moveframe.movelaps?.[0]?.reps || 0;
          
          summary.series += parseInt(seriesCount) || 0;
          summary.repetitions += (parseInt(seriesCount) || 0) * (parseInt(repsPerSeries) || 0);
        } else {
          // For distance-based sports: sum distances from movelaps
          if (moveframe.movelaps) {
            moveframe.movelaps.forEach((movelap: any) => {
              if (movelap.distance) {
                summary.distance += Number(movelap.distance);
              }
            });
          }
        }
      });
    }
  });

  // Convert to final format
  const summaries = Array.from(sportMap.values()).map(summary => ({
    sport: summary.sport,
    icon: summary.icon,
    name: summary.name,
    distance: summary.isSeriesBased ? summary.series : summary.distance,
    duration: summary.isSeriesBased ? summary.repetitions.toString() : summary.duration,
    color: summary.color,
    isSeriesBased: summary.isSeriesBased
  }));

  // Return up to 4 sports
  return summaries.slice(0, 4);
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

