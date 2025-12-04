'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import WorkoutHierarchyView from './WorkoutHierarchyView';

// Day Row Component with Drop Zone
function DayRow({
  day,
  currentWeek,
  expandedDaysSet,
  expandedWorkoutsSet,
  onToggleDay,
  onToggleWorkout,
  onEditDay,
  onAddWorkout,
  onEditWorkout,
  onEditMoveframe,
  onEditMovelap,
  onAddMoveframe,
  onAddMovelap,
  onDeleteDay,
  onDeleteWorkout,
  onDeleteMoveframe,
  onDeleteMovelap
}: any) {
  const hasWorkouts = day.workouts && day.workouts.length > 0;
  const dayWithWeek = { ...day, weekNumber: currentWeek.weekNumber };

  // Make day header a drop zone for workouts
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.id}`,
    data: {
      type: 'day',
      day: dayWithWeek
    }
  });

  return (
    <div key={day.id} className="mb-8">
      {/* Day Header - Drop Zone */}
      <div 
        ref={setNodeRef}
        className={`px-4 py-3 rounded-t-lg shadow-md mb-2 cursor-pointer hover:opacity-90 transition-all ${
          hasWorkouts 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' 
            : 'bg-gradient-to-r from-gray-400 to-gray-300 text-white'
        } ${
          isOver ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''
        }`}
        onClick={() => onToggleDay?.(day.id)}
        title="Click to expand/collapse day | Drop workout here"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold">
              {expandedDaysSet.has(day.id) ? '▼' : '▶'}
            </span>
            <h3 className="text-lg font-bold">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })} - {new Date(day.date).toLocaleDateString()}
            </h3>
            <span className="text-sm opacity-90">
              Week {currentWeek.weekNumber}
            </span>
            {day.period && (
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: day.period.color || '#3b82f6' }}
              >
                {day.period.name}
              </span>
            )}
            {!hasWorkouts && (
              <span className="text-xs italic opacity-75">
                (No workouts)
              </span>
            )}
            {isOver && (
              <span className="text-xs font-bold bg-yellow-400 text-black px-2 py-1 rounded animate-pulse">
                📥 Drop Here
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

      {/* Day Options Header - Only show when expanded */}
      {expandedDaysSet.has(day.id) && (
        <>
          <div className="bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
            <div className="flex items-center justify-between">
              <div>
                Workouts of <span className="text-blue-600">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span> 
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Day options:</span> 
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddWorkout?.(dayWithWeek);
                    }}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Add Workout
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDay?.(dayWithWeek);
                    }}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit Day Info
                  </button>
                  <button className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                    Copy
                  </button>
                  <button className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                    Move
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDay?.(dayWithWeek);
                    }}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Workout Hierarchy (separate tables with gaps) */}
          <div className="bg-white rounded-b-lg shadow-md p-4">
            {hasWorkouts ? (
              <WorkoutHierarchyView
                day={dayWithWeek}
                expandedWorkouts={expandedWorkoutsSet}
                onToggleWorkout={onToggleWorkout}
                onAddWorkout={onAddWorkout}
                onEditWorkout={onEditWorkout}
                onEditMoveframe={onEditMoveframe}
                onEditMovelap={onEditMovelap}
                onAddMoveframe={onAddMoveframe}
                onAddMovelap={onAddMovelap}
                onDeleteWorkout={onDeleteWorkout}
                onDeleteMoveframe={onDeleteMoveframe}
                onDeleteMovelap={onDeleteMovelap}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No workouts scheduled for this day</p>
                <p className="text-xs mt-1">Click "Add Workout" to create one</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface DayWorkoutHierarchyProps {
  workoutPlan: any;
  expandedDays?: Set<string>;
  expandedWorkouts?: Set<string>;
  onToggleDay?: (dayId: string) => void;
  onToggleWorkout?: (workoutId: string) => void;
  onEditDay?: (day: any) => void;
  onAddWorkout?: (day: any) => void;
  onEditWorkout?: (workout: any, day: any) => void;
  onEditMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onAddMoveframe?: (workout: any, day: any) => void;
  onAddMovelap?: (moveframe: any, workout: any, day: any) => void;
  onDeleteDay?: (day: any) => void;
  onDeleteWorkout?: (workout: any, day: any) => void;
  onDeleteMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
}

export default function DayWorkoutHierarchy({
  workoutPlan,
  expandedDays,
  expandedWorkouts,
  onToggleDay,
  onToggleWorkout,
  onEditDay,
  onAddWorkout,
  onEditWorkout,
  onEditMoveframe,
  onEditMovelap,
  onAddMoveframe,
  onAddMovelap,
  onDeleteDay,
  onDeleteWorkout,
  onDeleteMoveframe,
  onDeleteMovelap
}: DayWorkoutHierarchyProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  
  // Use empty Set if not provided
  const expandedDaysSet = expandedDays || new Set<string>();
  const expandedWorkoutsSet = expandedWorkouts || new Set<string>();

  if (!workoutPlan || !workoutPlan.weeks) {
    return (
      <div className="p-8 text-center text-gray-500">
        No workout plan available. Click "Create Plan" to start.
      </div>
    );
  }

  // Get all weeks sorted
  const sortedWeeks = [...workoutPlan.weeks].sort((a: any, b: any) => a.weekNumber - b.weekNumber);
  const totalWeeks = sortedWeeks.length;

  // Get current week's days
  const currentWeek = sortedWeeks[currentWeekIndex];
  const weekDays = currentWeek?.days || [];
  
  // Sort days by date
  const sortedDays = [...weekDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Week navigation handlers
  const goToPreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeekIndex < totalWeeks - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  return (
    <div className="p-4 bg-gray-100">
      {/* Week Navigation */}
      {totalWeeks > 1 && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousWeek}
              disabled={currentWeekIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentWeekIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <ChevronLeft size={20} />
              Previous Week
            </button>

            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                Week {currentWeek?.weekNumber || currentWeekIndex + 1}
              </div>
              <div className="text-sm text-gray-500">
                {currentWeekIndex + 1} of {totalWeeks}
              </div>
            </div>

            <button
              onClick={goToNextWeek}
              disabled={currentWeekIndex >= totalWeeks - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentWeekIndex >= totalWeeks - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next Week
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Days for Current Week */}
      {sortedDays.map((day) => (
        <DayRow
          key={day.id}
          day={day}
          currentWeek={currentWeek}
          expandedDaysSet={expandedDaysSet}
          expandedWorkoutsSet={expandedWorkoutsSet}
          onToggleDay={onToggleDay}
          onToggleWorkout={onToggleWorkout}
          onEditDay={onEditDay}
          onAddWorkout={onAddWorkout}
          onEditWorkout={onEditWorkout}
          onEditMoveframe={onEditMoveframe}
          onEditMovelap={onEditMovelap}
          onAddMoveframe={onAddMoveframe}
          onAddMovelap={onAddMovelap}
          onDeleteDay={onDeleteDay}
          onDeleteWorkout={onDeleteWorkout}
          onDeleteMoveframe={onDeleteMoveframe}
          onDeleteMovelap={onDeleteMovelap}
        />
      ))}
    </div>
  );
}

