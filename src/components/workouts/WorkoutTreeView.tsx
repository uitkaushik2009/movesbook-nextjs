'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Dumbbell } from 'lucide-react';
import { useColorSettings } from '@/hooks/useColorSettings';
import { useSportIconType } from '@/hooks/useSportIconType';
import { getSportIcon, isImageIcon } from '@/utils/sportIcons';

interface WorkoutTreeViewProps {
  workoutPlan: any;
  activeSection?: 'A' | 'B' | 'C' | 'D';
  onWeekClick?: (weekNumber: number) => void;
  onDayClick?: (day: any) => void;
}

export default function WorkoutTreeView({
  workoutPlan,
  activeSection = 'A',
  onWeekClick,
  onDayClick
}: WorkoutTreeViewProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [expandedMoveframes, setExpandedMoveframes] = useState<Set<string>>(new Set());
  const { colors, getBorderStyle } = useColorSettings();
  const iconType = useSportIconType();
  const useImageIcons = isImageIcon(iconType);

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  const toggleDay = (dayId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onDayClick
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayId)) {
        newSet.delete(dayId);
      } else {
        newSet.add(dayId);
      }
      return newSet;
    });
  };

  const toggleWorkout = (workoutId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  };

  const toggleMoveframe = (moveframeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Get weeks from the workout plan (already filtered by WorkoutSection)
  const weeks = workoutPlan?.weeks || [];

  // Get date range for a week
  const getWeekDateRange = (week: any) => {
    if (!week.days || week.days.length === 0) return '';
    
    const firstDay = new Date(week.days[0].date);
    const lastDay = new Date(week.days[week.days.length - 1].date);
    
    return `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Count total workouts in a week
  const countWeekWorkouts = (week: any) => {
    if (!week.days) return 0;
    return week.days.reduce((total: number, day: any) => {
      return total + (day.workouts?.length || 0);
    }, 0);
  };

  return (
    <div className="space-y-2 p-4">
      {weeks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No weeks planned for Section {activeSection}</p>
          <p className="text-sm mt-2">Click "Add New Day" to start planning</p>
        </div>
      ) : (
        weeks.map((week: any) => {
          const isExpanded = expandedWeeks.has(week.weekNumber);
          const totalWorkouts = countWeekWorkouts(week);
          const dateRange = getWeekDateRange(week);
          
          const borderStyle = getBorderStyle('day');
          
          return (
            <div 
              key={week.id} 
              className="rounded-lg overflow-hidden shadow-lg"
              style={{ 
                border: borderStyle || '2px solid #d1d5db',
                backgroundColor: colors.pageBackground || '#ffffff'
              }}
            >
              {/* Week Header - Level 1 (Thickest) */}
              <button
                onClick={() => toggleWeek(week.weekNumber)}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-opacity-95 transition-all"
                style={{
                  backgroundColor: colors.weekHeader,
                  color: colors.weekHeaderText,
                  borderBottom: '3px solid rgba(0,0,0,0.15)',
                  fontWeight: '700'
                }}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-6 h-6 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-6 h-6 flex-shrink-0" />
                  )}
                  <div className="text-left">
                    <div className="font-bold text-xl">WEEK {week.weekNumber}</div>
                    <div className="text-xs opacity-80 mt-1">
                      {week.days?.length || 0} days • {totalWorkouts} workout{totalWorkouts !== 1 ? 's' : ''} planned
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold opacity-90">
                  {dateRange}
                </div>
              </button>

              {/* Expanded Days */}
              {isExpanded && week.days && (
                <div>
                  {week.days.map((day: any, index: number) => {
                    const dayDate = new Date(day.date);
                    const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
                    const dayDateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const workoutCount = day.workouts?.length || 0;
                    const isEvenDay = index % 2 === 0;
                    const isDayExpanded = expandedDays.has(day.id);

                    return (
                      <div key={day.id}>
                        {/* Day Header - Level 2 */}
                        <div
                          className="border-t px-6 py-3 hover:bg-opacity-95 cursor-pointer transition-all"
                          style={{
                            backgroundColor: isEvenDay ? colors.dayAlternateRow : colors.dayHeader,
                            color: isEvenDay ? colors.dayAlternateRowText : colors.dayHeaderText,
                            borderTop: getBorderStyle('day') || '2px solid rgba(0,0,0,0.12)',
                            fontWeight: '600'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Expand/Collapse icon */}
                              <button
                                onClick={(e) => toggleDay(day.id, e)}
                                className="hover:opacity-70"
                              >
                                {isDayExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <div className={`w-2 h-2 rounded-full ${
                                workoutCount > 0 ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              <div>
                                <div className="font-semibold">{dayName}</div>
                                <div className="text-xs opacity-70">{dayDateStr}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-sm font-medium">
                                {workoutCount} workout{workoutCount !== 1 ? 's' : ''}
                              </div>
                              <button
                                onClick={() => onDayClick?.(day)}
                                className="text-xs px-3 py-1 rounded font-medium transition-colors"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.2)',
                                  color: 'inherit'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                }}
                              >
                                Open →
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Workouts */}
                        {isDayExpanded && workoutCount > 0 && (
                          <div style={{ backgroundColor: colors.pageBackground || '#f9fafb' }}>
                            {day.workouts.map((workout: any, workoutIndex: number) => {
                              // Get unique sports from moveframes and calculate total distance per sport
                              const sportDistances = new Map<string, number>();
                              let totalMoveframes = 0;
                              
                              if (workout.moveframes) {
                                workout.moveframes.forEach((mf: any) => {
                                  if (mf.sport) {
                                    // Sum up distances from all movelaps for this sport
                                    let sportDistance = sportDistances.get(mf.sport) || 0;
                                    if (mf.movelaps) {
                                      mf.movelaps.forEach((lap: any) => {
                                        sportDistance += lap.distance || 0;
                                      });
                                    }
                                    sportDistances.set(mf.sport, sportDistance);
                                  }
                                });
                                totalMoveframes = workout.moveframes.length;
                              }
                              
                              const isWorkoutExpanded = expandedWorkouts.has(workout.id);

                              return (
                                <div key={workout.id}>
                                  {/* Workout Row - Third Level (Indented from Day) */}
                                  <button
                                    onClick={(e) => toggleWorkout(workout.id, e)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 border-t hover:bg-opacity-90 transition-all"
                                    style={{
                                      paddingLeft: '3rem', // Indent from day
                                      backgroundColor: workoutIndex % 3 === 0 ? colors.workoutHeader : (workoutIndex % 3 === 1 ? colors.workout2Header : colors.workout3Header),
                                      color: workoutIndex % 3 === 0 ? colors.workoutHeaderText : (workoutIndex % 3 === 1 ? colors.workout2HeaderText : colors.workout3HeaderText),
                                      borderTop: getBorderStyle('workout') || '1.5px solid rgba(0,0,0,0.1)',
                                      fontWeight: '600'
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      {isWorkoutExpanded ? (
                                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                      )}
                                      <Dumbbell className="w-4 h-4" />
                                      <span className="font-semibold text-sm">Workout #{workoutIndex + 1}</span>
                                      <span className="text-xs opacity-70">
                                        ({totalMoveframes} moveframe{totalMoveframes !== 1 ? 's' : ''})
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {Array.from(sportDistances.entries()).slice(0, 3).map(([sport, distance]) => {
                                        const sportIcon = getSportIcon(sport, iconType);
                                        return (
                                          <div
                                            key={sport}
                                            className="flex items-center gap-2 px-3 py-1 rounded text-sm font-semibold"
                                            style={{ 
                                              backgroundColor: 'rgba(255,255,255,0.25)',
                                              border: '1px solid rgba(0,0,0,0.1)'
                                            }}
                                          >
                                            {useImageIcons ? (
                                              <img src={sportIcon} alt={sport} className="w-4 h-4 object-cover rounded" />
                                            ) : (
                                              <span className="text-base">{sportIcon}</span>
                                            )}
                                            <span className="text-xs">{sport}</span>
                                            {distance > 0 && (
                                              <span className="text-sm font-bold ml-1 text-blue-900">
                                                {distance.toFixed(0)}m
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                      {sportDistances.size > 3 && (
                                        <span className="text-xs opacity-60 font-medium">+{sportDistances.size - 3}</span>
                                      )}
                                    </div>
                                  </button>

                                  {/* Expanded Moveframes */}
                                  {isWorkoutExpanded && workout.moveframes && workout.moveframes.length > 0 && (
                                    <div>
                                      {workout.moveframes.map((moveframe: any, moveframeIndex: number) => {
                                        const isMoveframeExpanded = expandedMoveframes.has(moveframe.id);
                                        const sportIcon = getSportIcon(moveframe.sport, iconType);
                                        const movelapsCount = moveframe.movelaps?.length || 0;
                                        const isEvenMoveframe = moveframeIndex % 2 === 0;

                                        return (
                                          <div key={moveframe.id}>
                                            {/* Moveframe Row - Fourth Level (Double Indent from Day) */}
                                            <button
                                              onClick={(e) => toggleMoveframe(moveframe.id, e)}
                                              className="w-full flex items-center justify-between px-4 py-1.5 border-t hover:bg-opacity-90 transition-all"
                                              style={{
                                                paddingLeft: '5rem', // Double indent
                                                backgroundColor: isEvenMoveframe ? colors.moveframeHeader : colors.alternateRowMoveframe,
                                                color: isEvenMoveframe ? colors.moveframeHeaderText : colors.alternateRowTextMoveframe,
                                                borderTop: getBorderStyle('moveframe') || '1px solid rgba(0,0,0,0.08)',
                                                fontWeight: '500'
                                              }}
                                            >
                                              <div className="flex items-center gap-2">
                                                {isMoveframeExpanded ? (
                                                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                                                ) : (
                                                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                                )}
                                                {useImageIcons ? (
                                                  <img src={sportIcon} alt={moveframe.sport} className="w-4 h-4 object-cover rounded" />
                                                ) : (
                                                  <span className="text-sm">{sportIcon}</span>
                                                )}
                                                <span className="text-xs font-medium">{moveframe.letter}</span>
                                                <span className="text-xs opacity-70">{moveframe.sport}</span>
                                                <span className="text-xs opacity-60">
                                                  ({movelapsCount} lap{movelapsCount !== 1 ? 's' : ''})
                                                </span>
                                              </div>
                                              <div className="text-xs opacity-70 max-w-md truncate">
                                                {moveframe.description || 'No description'}
                                              </div>
                                            </button>

                                            {/* Expanded Movelaps */}
                                            {isMoveframeExpanded && moveframe.movelaps && moveframe.movelaps.length > 0 && (
                                              <div>
                                                {moveframe.movelaps.map((movelap: any, lapIndex: number) => {
                                                  const isEvenLap = lapIndex % 2 === 0;
                                                  return (
                                                    <div
                                                      key={movelap.id}
                                                      className="flex items-center gap-3 px-4 py-1.5 border-t text-xs hover:bg-opacity-80 transition-all cursor-default"
                                                      style={{
                                                        paddingLeft: '7rem', // Triple indent
                                                        backgroundColor: isEvenLap ? colors.movelapHeader : colors.alternateRowMovelap,
                                                        color: isEvenLap ? colors.movelapHeaderText : colors.alternateRowTextMovelap,
                                                        borderTop: getBorderStyle('movelap') || '0.5px solid rgba(0,0,0,0.05)'
                                                      }}
                                                    >
                                                      <span className="w-6 text-center font-medium text-gray-500">
                                                        #{lapIndex + 1}
                                                      </span>
                                                      <span className="text-gray-700">
                                                        {movelap.distance ? `${movelap.distance}m` : ''}
                                                        {movelap.repetitions ? `${movelap.repetitions} reps` : ''}
                                                      </span>
                                                      {movelap.time && (
                                                        <span className="text-gray-600">⏱️ {movelap.time}</span>
                                                      )}
                                                      {movelap.pause && (
                                                        <span className="text-gray-600">⏸️ {movelap.pause}</span>
                                                      )}
                                                      {movelap.speed && (
                                                        <span className="text-gray-600">🏃 {movelap.speed}</span>
                                                      )}
                                                      {movelap.weight && (
                                                        <span className="text-blue-600 font-semibold">💪 {movelap.weight}</span>
                                                      )}
                                                      {movelap.tools && (
                                                        <span className="text-green-600 font-semibold">🔧 {movelap.tools}</span>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

