'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2 } from 'lucide-react';

interface WorkoutGridProps {
  workoutPlan: any;
  activeSection: 'A' | 'B' | 'C' | 'D';
  periods: any[];
  onDaySelect?: (day: any) => void;
  onWorkoutSelect?: (workoutId: string) => void;
  onAddWorkoutToDay?: (day: any) => void;
  onEditWorkout?: (workout: any, day: any) => void;
  onCreatePlan?: () => void;
  expandedWeeks?: Set<string>;
  setExpandedWeeks?: (weeks: Set<string>) => void;
  expandedDays?: Set<string>;
  setExpandedDays?: (days: Set<string>) => void;
  expandedWorkouts?: Set<string>;
  setExpandedWorkouts?: (workouts: Set<string>) => void;
}

export default function WorkoutGrid({ 
  workoutPlan, 
  activeSection,
  periods,
  onDaySelect,
  onWorkoutSelect,
  onAddWorkoutToDay,
  onEditWorkout,
  onCreatePlan,
  expandedWeeks: externalExpandedWeeks,
  setExpandedWeeks: externalSetExpandedWeeks,
  expandedDays: externalExpandedDays,
  setExpandedDays: externalSetExpandedDays,
  expandedWorkouts: externalExpandedWorkouts,
  setExpandedWorkouts: externalSetExpandedWorkouts
}: WorkoutGridProps) {
  // Use external state if provided, otherwise use internal state
  const [internalExpandedWeeks, setInternalExpandedWeeks] = useState<Set<string>>(new Set());
  const [internalExpandedDays, setInternalExpandedDays] = useState<Set<string>>(new Set());
  const [internalExpandedWorkouts, setInternalExpandedWorkouts] = useState<Set<string>>(new Set());
  
  const expandedWeeks = externalExpandedWeeks || internalExpandedWeeks;
  const setExpandedWeeks = externalSetExpandedWeeks || setInternalExpandedWeeks;
  const expandedDays = externalExpandedDays || internalExpandedDays;
  const setExpandedDays = externalSetExpandedDays || setInternalExpandedDays;
  const expandedWorkouts = externalExpandedWorkouts || internalExpandedWorkouts;
  const setExpandedWorkouts = externalSetExpandedWorkouts || setInternalExpandedWorkouts;

  const toggleWeek = (weekId: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekId)) {
      newExpanded.delete(weekId);
    } else {
      newExpanded.add(weekId);
    }
    setExpandedWeeks(newExpanded);
  };

  const toggleDay = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  const toggleWorkout = (workoutId: string) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedWorkouts(newExpanded);
  };

  if (!workoutPlan || !workoutPlan.weeks) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">No workout plan yet</p>
        <button 
          onClick={onCreatePlan}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create Workout Plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Weeks */}
      {workoutPlan.weeks?.map((week: any) => {
        const isWeekExpanded = expandedWeeks.has(week.id);
        const totalDays = week.days?.length || 0;
        const totalWorkouts = week.days?.reduce((sum: number, day: any) => sum + (day.workouts?.length || 0), 0) || 0;
        
        return (
          <div key={week.id} className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white shadow-sm">
            {/* WEEK HEADER */}
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all"
              onClick={() => toggleWeek(week.id)}
            >
              <div className="flex items-center gap-3">
                {isWeekExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">WEEK {week.weekNumber}</h3>
                  <p className="text-xs text-blue-100 mt-1">
                    {totalDays} days • {totalWorkouts} workouts planned
                  </p>
                </div>
                <div className="text-right text-sm">
                  <div className="text-blue-100">
                    {week.days?.[0]?.date && new Date(week.days[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' - '}
                    {week.days?.[6]?.date && new Date(week.days[6].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* DAYS inside this WEEK */}
            {isWeekExpanded && (
              <div className="p-3 space-y-2 bg-gray-50">
                {week.days?.map((day: any) => {
                  const isDayExpanded = expandedDays.has(day.id);
                  
                  return (
                    <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      {/* Day Row */}
                      <div 
                        className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-3"
                        onClick={() => {
                          toggleDay(day.id);
                          onDaySelect?.(day);
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-[120px]">
                          {isDayExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          <span className="font-bold text-gray-700">{getDayName(day.dayOfWeek)}</span>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        
                        <div>
                          {day.period ? (
                            <span 
                              className="px-3 py-1 text-white rounded-full text-xs font-medium"
                              style={{ backgroundColor: day.period.color || '#3b82f6' }}
                            >
                              {day.period.name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No period</span>
                          )}
                        </div>
                        
                        <div className="ml-auto flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {day.workouts?.length || 0} workout{day.workouts?.length === 1 ? '' : 's'}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="p-1.5 hover:bg-gray-200 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Workouts */}
                      {isDayExpanded && (
                        <div className="bg-white p-4 space-y-2 border-t border-gray-200">
                          {day.workouts?.map((workout: any, index: number) => {
                            const isWorkoutExpanded = expandedWorkouts.has(workout.id);
                            
                            return (
                              <div key={workout.id} className="border border-green-200 rounded-lg overflow-hidden">
                                {/* Workout Row */}
                                <div 
                                  className="p-3 bg-green-50 hover:bg-green-100 cursor-pointer transition-colors flex items-center gap-3"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWorkout(workout.id);
                                    onWorkoutSelect?.(workout.id);
                                  }}
                                >
                                  {isWorkoutExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  <span className="font-semibold text-green-700">Workout #{workout.sessionNumber || index + 1}</span>
                                  <span className="text-sm text-gray-700">{workout.name || 'Unnamed'}</span>
                                  <div className="ml-auto flex gap-2">
                                    <button className="p-1 hover:bg-green-200 rounded">
                                      <Plus className="w-4 h-4" title="Add Moveframe" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditWorkout?.(workout, day);
                                      }}
                                      className="p-1 hover:bg-green-200 rounded"
                                      title="Edit Workout"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 hover:bg-red-100 rounded text-red-600">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Expanded Moveframes */}
                                {isWorkoutExpanded && workout.moveframes && (
                                  <div className="p-3 bg-yellow-50 space-y-1">
                                    {workout.moveframes.map((moveframe: any) => (
                                      <div key={moveframe.id} className="p-2 bg-white border border-yellow-200 rounded flex items-center gap-2">
                                        <span className="font-bold text-yellow-700 w-8">{moveframe.letter}</span>
                                        <span className="text-sm flex-1">{moveframe.description || 'Moveframe'}</span>
                                        <span className="text-xs text-gray-500">{moveframe.sport}</span>
                                        <button className="p-1 hover:bg-yellow-100 rounded">
                                          <Edit className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    {(!workout.moveframes || workout.moveframes.length === 0) && (
                                      <p className="text-center text-gray-500 text-sm py-4">
                                        No moveframes yet - click + Add Moveframe
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          
                          {(!day.workouts || day.workouts.length === 0) && (
                            <p className="text-center text-gray-500 py-6 text-sm italic">
                              No workouts planned for this day
                            </p>
                          )}
                          
                          {day.workouts && day.workouts.length < 3 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddWorkoutToDay?.(day);
                              }}
                              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-gray-500 hover:text-green-700 font-medium"
                            >
                              + Add Workout to {getDayName(day.dayOfWeek)} ({day.workouts.length}/3)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {(!week.days || week.days.length === 0) && (
                  <div className="text-center py-8 text-gray-500 italic">
                    No days in this week yet
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {(!workoutPlan.weeks || workoutPlan.weeks.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-4">No weeks scheduled yet</p>
          <button 
            onClick={onCreatePlan}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Planning
          </button>
        </div>
      )}
    </div>
  );
}

function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Day';
}

