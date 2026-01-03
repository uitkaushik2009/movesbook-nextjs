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
  descriptions?: string[]; // All moveframe descriptions
  mainWork?: string; // Main work moveframe description
  secondaryWork?: string; // Secondary work moveframe description
  mainWorkMoveframe?: any | null; // Full main work moveframe object
  secondaryWorkMoveframe?: any | null; // Full secondary work moveframe object
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

  const sportMap = new Map<string, SportSummary & { series: number; repetitions: number; descriptions: string[]; mainWork: string; secondaryWork: string; moveframes: any[]; mainWorkMoveframe: any | null; secondaryWorkMoveframe: any | null }>();

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
            repetitions: 0,
            descriptions: [],
            mainWork: '',
            secondaryWork: '',
            moveframes: [],
            mainWorkMoveframe: null,
            secondaryWorkMoveframe: null
          });
        }

        const summary = sportMap.get(sport)!;
        
        // Store moveframe for later processing
        summary.moveframes.push(moveframe);
        
        // Add moveframe description if available
        if (moveframe.description) {
          summary.descriptions.push(moveframe.description);
        }
        
        // Debug: Log moveframe workType
        console.log(`   📋 [workoutHelpers] Moveframe ${moveframe.letter || '?'} - ID: ${moveframe.id}, Sport: ${moveframe.sport}, workType: "${moveframe.workType}" (type: ${typeof moveframe.workType}), hasWorkType: ${moveframe.hasOwnProperty('workType')}`);
        
        // Set main work description and moveframe object if this moveframe is marked as MAIN
        if (moveframe.workType === 'MAIN' && moveframe.description) {
          summary.mainWork = moveframe.description;
          summary.mainWorkMoveframe = moveframe;
          console.log(`   ✅ [workoutHelpers] Set as MAIN work for ${moveframe.sport}: "${moveframe.description.substring(0, 40)}"`);
        }
        
        // Set secondary work description and moveframe object if this moveframe is marked as SECONDARY
        if (moveframe.workType === 'SECONDARY' && moveframe.description) {
          summary.secondaryWork = moveframe.description;
          summary.secondaryWorkMoveframe = moveframe;
          console.log(`   ✅ [workoutHelpers] Set as SECONDARY work for ${moveframe.sport}: "${moveframe.description.substring(0, 40)}"`);
        }
        
        // For ALL sports: sum the repetitions/series from each moveframe
        // For distance-based sports: repetitions = number of laps planned
        // For series-based sports: repetitions = number of series planned
        const moveframeRepetitions = parseInt(moveframe.repetitions) || 0;
        summary.series += moveframeRepetitions;
        
        if (isSeries) {
          // For series-based sports: also calculate total reps (series × reps per series)
          const repsPerSeries = moveframe.movelaps?.[0]?.reps || 0;
          summary.repetitions += moveframeRepetitions * (parseInt(repsPerSeries) || 0);
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

  // Apply automatic fallback logic for main work and secondary work if not explicitly set
  sportMap.forEach(summary => {
    const moveframes = summary.moveframes;
    
    // If no explicit main work is set, apply automatic logic
    if (!summary.mainWork && moveframes.length > 0) {
      if (moveframes.length === 1) {
        // Only 1 moveframe → it becomes main work
        summary.mainWork = moveframes[0].description || '';
        summary.mainWorkMoveframe = moveframes[0];
      } else if (moveframes.length >= 2) {
        // 2+ moveframes → 2nd moveframe becomes main work
        summary.mainWork = moveframes[1].description || '';
        summary.mainWorkMoveframe = moveframes[1];
      }
    }
    
    // If no explicit secondary work is set and there are 3+ moveframes
    if (!summary.secondaryWork && moveframes.length >= 3) {
      // 3+ moveframes → 3rd moveframe becomes secondary work
      summary.secondaryWork = moveframes[2].description || '';
      summary.secondaryWorkMoveframe = moveframes[2];
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
    isSeriesBased: summary.isSeriesBased,
    descriptions: summary.descriptions,
    mainWork: summary.mainWork,
    secondaryWork: summary.secondaryWork
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

