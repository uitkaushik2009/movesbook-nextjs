/**
 * Calculate the color for a weekly plan based on how many workouts have moveframes
 */

export function calculateWeeklyPlanColor(workoutPlan: any): string {
  if (!workoutPlan || !workoutPlan.weeks) {
    return '#EF4444'; // Red - no data
  }

  // Count unique workouts that have at least 1 moveframe
  const workoutsWithMoveframes = new Set<string>();
  
  workoutPlan.weeks.forEach((week: any) => {
    if (!week.days) return;
    
    week.days.forEach((day: any) => {
      if (!day.workouts) return;
      
      day.workouts.forEach((workout: any) => {
        // Check if workout has at least 1 moveframe
        if (workout.moveframes && workout.moveframes.length > 0) {
          workoutsWithMoveframes.add(workout.id);
        }
      });
    });
  });

  const count = workoutsWithMoveframes.size;

  // Return color based on count
  if (count === 0) return '#EF4444';        // Red
  if (count === 1) return '#D1D5DB';        // Light Grey
  if (count === 2) return '#FDE047';        // Light Yellow
  if (count === 3) return '#FACC15';        // Yellow
  if (count === 4) return '#86EFAC';        // Light Green
  if (count === 5) return '#22C55E';        // Green
  if (count === 6) return '#15803D';        // Dark Green
  if (count >= 7) return '#3B82F6';         // Blue

  return '#EF4444'; // Default to red
}

export function getWorkoutCountLabel(workoutPlan: any): string {
  if (!workoutPlan || !workoutPlan.weeks) {
    return '0 workouts with moveframes';
  }

  const workoutsWithMoveframes = new Set<string>();
  
  workoutPlan.weeks.forEach((week: any) => {
    if (!week.days) return;
    
    week.days.forEach((day: any) => {
      if (!day.workouts) return;
      
      day.workouts.forEach((workout: any) => {
        if (workout.moveframes && workout.moveframes.length > 0) {
          workoutsWithMoveframes.add(workout.id);
        }
      });
    });
  });

  const count = workoutsWithMoveframes.size;
  return `${count} workout${count !== 1 ? 's' : ''} with moveframes`;
}

