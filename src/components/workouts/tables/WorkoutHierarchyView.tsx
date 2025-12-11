'use client';

import React, { useState } from 'react';
import WorkoutTable from './WorkoutTable';
import MoveframeTable from './MoveframeTable';
import MovelapTable from './MovelapTable';

interface WorkoutHierarchyViewProps {
  day: any;
  expandedWorkouts?: Set<string>;
  onToggleWorkout?: (workoutId: string) => void;
  onAddWorkout?: (day: any) => void;
  onEditWorkout?: (workout: any, day: any) => void;
  onEditMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onAddMoveframe?: (workout: any, day: any) => void;
  onAddMovelap?: (moveframe: any, workout: any, day: any) => void;
  onDeleteWorkout?: (workout: any, day: any) => void;
  onDeleteMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onCopyWorkout?: (workout: any, day: any) => void;
  onMoveWorkout?: (workout: any, day: any) => void;
  onCopyMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onMoveMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onOpenColumnSettings?: (tableType: 'day' | 'workout' | 'moveframe' | 'movelap') => void;
  columnSettings?: any;
}

export default function WorkoutHierarchyView({
  day,
  expandedWorkouts,
  onToggleWorkout,
  onAddWorkout,
  onEditWorkout,
  onEditMoveframe,
  onEditMovelap,
  onAddMoveframe,
  onAddMovelap,
  onDeleteWorkout,
  onDeleteMoveframe,
  onDeleteMovelap,
  onCopyWorkout,
  onMoveWorkout,
  onCopyMoveframe,
  onMoveMoveframe,
  onOpenColumnSettings,
  columnSettings
}: WorkoutHierarchyViewProps) {
  const [expandedMoveframes, setExpandedMoveframes] = useState<Set<string>>(new Set());
  
  // Use empty Set if not provided
  const expandedWorkoutsSet = expandedWorkouts || new Set<string>();

  const toggleMoveframeExpansion = (moveframeId: string) => {
    setExpandedMoveframes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moveframeId)) {
        newSet.delete(moveframeId);
      } else {
        newSet.add(moveframeId);
      }
      return newSet;
    });
  };

  const workouts = day.workouts || [];
  
  console.log(`📋 WorkoutHierarchyView rendering for day with ${workouts.length} workouts`);

  return (
    <div className="space-y-6 overflow-x-auto">
      {workouts.map((workout: any, workoutIndex: number) => {
        const isWorkoutExpanded = expandedWorkoutsSet.has(workout.id);
        
        return (
          <div key={workout.id} className="space-y-4">
            {/* WORKOUT TABLE - includes moveframes inside */}
            <WorkoutTable
              day={day}
              workout={workout}
              workoutIndex={workoutIndex}
              weekNumber={day.weekNumber}
              periodName={day.period?.name}
              isExpanded={isWorkoutExpanded}
              onToggleExpand={() => onToggleWorkout?.(workout.id)}
              onEdit={() => onEditWorkout?.(workout, day)}
              onDelete={() => onDeleteWorkout?.(workout, day)}
              onAddMoveframe={() => onAddMoveframe?.(workout, day)}
              onEditMoveframe={(moveframe) => onEditMoveframe?.(moveframe, workout, day)}
              onDeleteMoveframe={(moveframe) => onDeleteMoveframe?.(moveframe, workout, day)}
              onEditMovelap={(movelap, moveframe) => onEditMovelap?.(movelap, moveframe, workout, day)}
              onDeleteMovelap={(movelap, moveframe) => onDeleteMovelap?.(movelap, moveframe, workout, day)}
              onAddMovelap={(moveframe) => onAddMovelap?.(moveframe, workout, day)}
              onCopyWorkout={() => onCopyWorkout?.(workout, day)}
              onMoveWorkout={() => onMoveWorkout?.(workout, day)}
              onCopyMoveframe={(moveframe) => onCopyMoveframe?.(moveframe, workout, day)}
              onMoveMoveframe={(moveframe) => onMoveMoveframe?.(moveframe, workout, day)}
              onOpenColumnSettings={onOpenColumnSettings}
              columnSettings={columnSettings}
            />
          </div>
        );
      })}
    </div>
  );
}

