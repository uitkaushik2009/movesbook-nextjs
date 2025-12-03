'use client';

import React from 'react';
import WorkoutHierarchyView from './WorkoutHierarchyView';

interface DayWorkoutHierarchyProps {
  workoutPlan: any;
  onEditWorkout?: (workout: any, day: any) => void;
  onEditMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onAddMoveframe?: (workout: any, day: any) => void;
  onAddMovelap?: (moveframe: any, workout: any, day: any) => void;
  onDeleteWorkout?: (workout: any, day: any) => void;
  onDeleteMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
}

export default function DayWorkoutHierarchy({
  workoutPlan,
  onEditWorkout,
  onEditMoveframe,
  onEditMovelap,
  onAddMoveframe,
  onAddMovelap,
  onDeleteWorkout,
  onDeleteMoveframe,
  onDeleteMovelap
}: DayWorkoutHierarchyProps) {
  if (!workoutPlan || !workoutPlan.weeks) {
    return (
      <div className="p-8 text-center text-gray-500">
        No workout plan available. Click "Create Plan" to start.
      </div>
    );
  }

  // Flatten all days from all weeks
  const allDays: any[] = [];
  workoutPlan.weeks.forEach((week: any) => {
    week.days?.forEach((day: any) => {
      allDays.push({ ...day, weekNumber: week.weekNumber });
    });
  });

  // Sort by date
  allDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-4 bg-gray-100">
      {allDays.map((day, dayIndex) => {
        // Only show days that have workouts
        if (!day.workouts || day.workouts.length === 0) {
          return null;
        }

        return (
          <div key={day.id} className="mb-8">
            {/* Day Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 rounded-t-lg shadow-md mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })} - {new Date(day.date).toLocaleDateString()}
                  </h3>
                  <span className="text-sm opacity-90">
                    Week {day.weekNumber}
                  </span>
                  {day.period && (
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: day.period.color || '#3b82f6' }}
                    >
                      {day.period.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {day.weather && (
                    <span className="bg-white/20 px-2 py-1 rounded">
                      🌤 {day.weather}
                    </span>
                  )}
                  {day.feelingStatus && (
                    <span className="bg-white/20 px-2 py-1 rounded">
                      😊 {day.feelingStatus}
                    </span>
                  )}
                </div>
              </div>
              {day.note && (
                <div className="mt-2 text-sm opacity-90 italic">
                  📝 {day.note}
                </div>
              )}
            </div>

            {/* Day Options Header (matches screenshot) */}
            <div className="bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
              Workouts of the <span className="text-blue-600">&lt; put here the name of the day selected &gt;</span> 
              <span className="mx-2">•</span>
              <span className="font-bold">Day options:</span> 
              <span className="text-blue-600"> &lt; put here the text button of the day options, I will send later &gt;</span>
            </div>

            {/* Workout Hierarchy (separate tables with gaps) */}
            <div className="bg-white rounded-b-lg shadow-md p-4">
              <WorkoutHierarchyView
                day={day}
                onEditWorkout={onEditWorkout}
                onEditMoveframe={onEditMoveframe}
                onEditMovelap={onEditMovelap}
                onAddMoveframe={onAddMoveframe}
                onAddMovelap={onAddMovelap}
                onDeleteWorkout={onDeleteWorkout}
                onDeleteMoveframe={onDeleteMoveframe}
                onDeleteMovelap={onDeleteMovelap}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

