'use client';

import React, { useState } from 'react';
import WorkoutTable from './WorkoutTable';
import MoveframeTable from './MoveframeTable';
import MovelapTable from './MovelapTable';

interface WorkoutHierarchyViewProps {
  day: any;
  onAddWorkout?: (day: any) => void;
  onEditWorkout?: (workout: any, day: any) => void;
  onEditMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onAddMoveframe?: (workout: any, day: any) => void;
  onAddMovelap?: (moveframe: any, workout: any, day: any) => void;
  onDeleteWorkout?: (workout: any, day: any) => void;
  onDeleteMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
}

export default function WorkoutHierarchyView({
  day,
  onAddWorkout,
  onEditWorkout,
  onEditMoveframe,
  onEditMovelap,
  onAddMoveframe,
  onAddMovelap,
  onDeleteWorkout,
  onDeleteMoveframe,
  onDeleteMovelap
}: WorkoutHierarchyViewProps) {
  const [expandedMoveframes, setExpandedMoveframes] = useState<Set<string>>(new Set());

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

  return (
    <div className="space-y-6 overflow-x-auto">
      {workouts.map((workout: any, workoutIndex: number) => (
        <div key={workout.id} className="space-y-4">
          {/* WORKOUT TABLE */}
          <WorkoutTable
            day={day}
            workout={workout}
            workoutIndex={workoutIndex}
            onEdit={() => onEditWorkout?.(workout, day)}
            onDelete={() => onDeleteWorkout?.(workout, day)}
            onAddMoveframe={() => onAddMoveframe?.(workout, day)}
            onAddWorkout={() => onAddWorkout?.(day)}
          />

          {/* MOVEFRAMES AND MOVELAPS */}
          {(workout.moveframes || []).map((moveframe: any) => (
            <div key={moveframe.id} className="space-y-3">
              {/* MOVEFRAME TABLE */}
              <MoveframeTable
                day={day}
                workout={workout}
                moveframe={moveframe}
                workoutIndex={workoutIndex}
                onEdit={() => onEditMoveframe?.(moveframe, workout, day)}
                onDelete={() => onDeleteMoveframe?.(moveframe, workout, day)}
                onAddMovelap={() => onAddMovelap?.(moveframe, workout, day)}
                onToggleExpand={() => toggleMoveframeExpansion(moveframe.id)}
                isExpanded={expandedMoveframes.has(moveframe.id)}
              />

              {/* MOVELAP TABLE (only if expanded) */}
              {expandedMoveframes.has(moveframe.id) && (
                <MovelapTable
                  day={day}
                  workout={workout}
                  moveframe={moveframe}
                  movelaps={moveframe.movelaps || []}
                  workoutIndex={workoutIndex}
                  moveframeCode={moveframe.code || 'A'}
                  onEditMovelap={(movelap) => onEditMovelap?.(movelap, moveframe, workout, day)}
                  onDeleteMovelap={(movelap) => onDeleteMovelap?.(movelap, moveframe, workout, day)}
                  onAddMovelap={() => onAddMovelap?.(moveframe, workout, day)}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

