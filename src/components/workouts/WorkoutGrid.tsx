'use client';

import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Circle, 
  Square, 
  Triangle,
  Calendar,
  Plus,
  Grip
} from 'lucide-react';
import { SportType, WorkoutStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserSettings } from '@/hooks/useUserSettings';

interface WorkoutGridProps {
  workoutPlan: any;
  activeSection: 'A' | 'B' | 'C' | 'D';
  expandedDays: Set<string>;
  expandedWorkouts: Set<string>;
  expandedMoveframes: Set<string>;
  onToggleDay: (dayId: string) => void;
  onToggleWorkout: (workoutId: string) => void;
  onToggleMoveframe: (moveframeId: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onSelectDay: (dayId: string) => void;
  onSelectWorkout: (workoutId: string) => void;
  onSelectMoveframe: (moveframeId: string) => void;
  periods: any[];
  mainSports: SportType[];
  draggedSport?: SportType | null;
  onWorkoutDrop?: (workoutId: string) => void;
  onWorkoutReorder?: (dayId: string, workouts: any[]) => void;
  onMoveframeReorder?: (workoutId: string, moveframes: any[]) => void;
}

export default function WorkoutGrid({
  workoutPlan,
  activeSection,
  expandedDays,
  expandedWorkouts,
  expandedMoveframes,
  onToggleDay,
  onToggleWorkout,
  onToggleMoveframe,
  onExpandAll,
  onCollapseAll,
  onSelectDay,
  onSelectWorkout,
  onSelectMoveframe,
  periods,
  mainSports,
  draggedSport,
  onWorkoutDrop,
  onWorkoutReorder,
  onMoveframeReorder
}: WorkoutGridProps) {
  const { t } = useLanguage();
  const { settings } = useUserSettings();
  const [dragOverWorkout, setDragOverWorkout] = useState<string | null>(null);
  const [draggedWorkoutData, setDraggedWorkoutData] = useState<any>(null);
  const [draggedMoveframeData, setDraggedMoveframeData] = useState<any>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null);

  // Get status color based on workout status
  const getStatusColor = (status: WorkoutStatus): string => {
    switch (status) {
      case 'NOT_PLANNED': return 'text-white';
      case 'PLANNED_FUTURE': return 'text-yellow-400';
      case 'PLANNED_NEXT_WEEK': return 'text-orange-400';
      case 'PLANNED_CURRENT_WEEK': return 'text-red-500';
      case 'DONE_DIFFERENTLY': return 'text-blue-500';
      case 'DONE_LESS_75': return 'text-green-300';
      case 'DONE_MORE_75': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  // Get status symbol based on session number
  const getStatusSymbol = (sessionNumber: number, status: WorkoutStatus) => {
    const colorClass = getStatusColor(status);
    
    switch (sessionNumber) {
      case 1:
        return <Circle className={`w-5 h-5 ${colorClass} fill-current`} />;
      case 2:
        return <Square className={`w-5 h-5 ${colorClass} fill-current`} />;
      case 3:
        return <Triangle className={`w-5 h-5 ${colorClass} fill-current`} />;
      default:
        return <Circle className={`w-5 h-5 ${colorClass} fill-current`} />;
    }
  };

  // Get sport totals for a day
  const getDaySportTotals = (day: any) => {
    const totals: Record<string, number> = {};
    
    day.workouts?.forEach((workout: any) => {
      workout.moveframes?.forEach((moveframe: any) => {
        const sport = moveframe.sport;
        const distance = moveframe.movelaps?.reduce((sum: number, lap: any) => 
          sum + (lap.distance || 0), 0
        ) || 0;
        
        totals[sport] = (totals[sport] || 0) + distance;
      });
    });
    
    return totals;
  };

  // Get sport totals for a workout
  const getWorkoutSportTotals = (workout: any) => {
    const totals: Record<string, number> = {};
    
    workout.moveframes?.forEach((moveframe: any) => {
      const sport = moveframe.sport;
      const distance = moveframe.movelaps?.reduce((sum: number, lap: any) => 
        sum + (lap.distance || 0), 0
      ) || 0;
      
      totals[sport] = (totals[sport] || 0) + distance;
    });
    
    return totals;
  };

  // Convert letter index to letter (0=A, 1=B, ... 26=AA, 27=AB...)
  const indexToLetter = (index: number): string => {
    let result = '';
    while (index >= 0) {
      result = String.fromCharCode(65 + (index % 26)) + result;
      index = Math.floor(index / 26) - 1;
    }
    return result;
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek - 1] || '';
  };

  if (!workoutPlan || !workoutPlan.weeks || workoutPlan.weeks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t('workout_no_plan_title')}
          </h3>
          <p className="text-gray-500">
            {t('workout_no_plan_description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">
            {activeSection === 'A' && t('workout_section_a_title')}
            {activeSection === 'B' && t('workout_section_b_title')}
            {activeSection === 'C' && t('workout_section_c_title')}
            {activeSection === 'D' && t('workout_section_d_title')}
          </h2>
          <span className="text-sm text-gray-500">
            ({workoutPlan.weeks.length} {t('workout_weeks')})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onExpandAll}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            {t('workout_expand_all')}
          </button>
          <button
            onClick={onCollapseAll}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            {t('workout_collapse_all')}
          </button>
        </div>
      </div>

      {/* Fixed Header */}
      <div className="bg-gray-800 text-white sticky top-0 z-10">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-semibold">
          <div className="col-span-1">{t('workout_week')}</div>
          <div className="col-span-2">{t('workout_day')}</div>
          <div className="col-span-1">{t('workout_period')}</div>
          {mainSports.slice(0, 4).map((sport, idx) => (
            <div key={idx} className="col-span-1 text-center">
              {t(`sport_${sport.toLowerCase()}`)}
            </div>
          ))}
          <div className="col-span-4 text-right">{t('workout_options')}</div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {workoutPlan.weeks.map((week: any) => (
          <div key={week.id} className="border-b">
            {week.days?.map((day: any, dayIndex: number) => {
              const isExpanded = expandedDays.has(day.id);
              const sportTotals = getDaySportTotals(day);
              const period = periods.find(p => p.id === day.periodId);

              return (
                <div key={day.id} className="border-b hover:bg-gray-50">
                  {/* Day Row */}
                  <div 
                    className="grid grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer"
                    onClick={() => {
                      onToggleDay(day.id);
                      onSelectDay(day.id);
                    }}
                  >
                    <div className="col-span-1 flex items-center gap-2">
                      {dayIndex === 0 && (
                        <span className="font-semibold text-gray-700">
                          {week.weekNumber}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    
                    <div className="col-span-2 font-medium text-gray-800">
                      {day.dayOfWeek} {getDayName(day.dayOfWeek)}
                    </div>
                    
                    <div className="col-span-1">
                      {period && (
                        <div 
                          className="px-2 py-1 rounded text-xs text-white text-center"
                          style={{ backgroundColor: period.color }}
                        >
                          {period.name}
                        </div>
                      )}
                    </div>
                    
                    {/* Sport Totals */}
                    {mainSports.slice(0, 4).map((sport, idx) => (
                      <div key={idx} className="col-span-1 text-center text-sm text-gray-600">
                        {sportTotals[sport] ? `${sportTotals[sport]}m` : '-'}
                      </div>
                    ))}
                    
                    <div className="col-span-4 flex items-center justify-end gap-2">
                      {day.workouts?.map((workout: any) => (
                        <div key={workout.id} className="flex items-center">
                          {getStatusSymbol(workout.sessionNumber, workout.status)}
                        </div>
                      ))}
                      <Grip className="w-4 h-4 text-gray-400 cursor-move" />
                    </div>
                  </div>

                  {/* Expanded Day - Show Workouts */}
                  {isExpanded && day.workouts && (
                    <div className="bg-gray-50 pl-8">
                      {day.workouts.map((workout: any) => {
                        const isWorkoutExpanded = expandedWorkouts.has(workout.id);
                        const workoutSportTotals = getWorkoutSportTotals(workout);

                        return (
                          <div key={workout.id} className="border-t border-gray-200">
                            {/* Workout Row */}
                            <div 
                              draggable={!draggedSport}
                              className={`grid grid-cols-12 gap-2 px-4 py-2 items-center cursor-move hover:bg-gray-100 transition ${
                                draggedSport && dragOverWorkout === workout.id 
                                  ? 'bg-blue-100 border-2 border-dashed border-blue-400' 
                                  : ''
                              } ${
                                draggedWorkoutData?.id === workout.id 
                                  ? 'opacity-50' 
                                  : ''
                              } ${
                                dragOverPosition === `workout-${workout.id}` 
                                  ? 'border-t-4 border-t-green-500' 
                                  : ''
                              }`}
                              onClick={(e) => {
                                if (!draggedWorkoutData) {
                                  e.stopPropagation();
                                  onToggleWorkout(workout.id);
                                  onSelectWorkout(workout.id);
                                }
                              }}
                              onDragStart={(e) => {
                                if (!draggedSport) {
                                  setDraggedWorkoutData({ ...workout, dayId: day.id });
                                }
                              }}
                              onDragEnd={() => {
                                setDraggedWorkoutData(null);
                                setDragOverPosition(null);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (draggedSport) {
                                  setDragOverWorkout(workout.id);
                                } else if (draggedWorkoutData && draggedWorkoutData.dayId === day.id) {
                                  setDragOverPosition(`workout-${workout.id}`);
                                }
                              }}
                              onDragLeave={() => {
                                if (draggedSport) {
                                  setDragOverWorkout(null);
                                }
                                setDragOverPosition(null);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedSport && onWorkoutDrop) {
                                  onWorkoutDrop(workout.id);
                                  setDragOverWorkout(null);
                                } else if (draggedWorkoutData && draggedWorkoutData.dayId === day.id && onWorkoutReorder) {
                                  // Reorder workouts
                                  const currentWorkouts = [...day.workouts];
                                  const draggedIndex = currentWorkouts.findIndex(w => w.id === draggedWorkoutData.id);
                                  const targetIndex = currentWorkouts.findIndex(w => w.id === workout.id);
                                  
                                  if (draggedIndex !== targetIndex && draggedIndex >= 0) {
                                    const [removed] = currentWorkouts.splice(draggedIndex, 1);
                                    currentWorkouts.splice(targetIndex, 0, removed);
                                    onWorkoutReorder(day.id, currentWorkouts);
                                  }
                                  setDraggedWorkoutData(null);
                                  setDragOverPosition(null);
                                }
                              }}
                            >
                              <div className="col-span-2 flex items-center gap-2">
                                {isWorkoutExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                )}
                                <div className="flex items-center gap-2">
                                  {getStatusSymbol(workout.sessionNumber, workout.status)}
                                  <span className="font-semibold text-gray-700">
                                    {t('workout_session')} {workout.sessionNumber}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="col-span-2 text-sm text-gray-600">
                                {workout.name || '-'}
                              </div>
                              
                              {/* Workout Sport Totals Bar */}
                              <div className="col-span-5 flex items-center gap-1">
                                {mainSports.slice(0, 4).map((sport, idx) => (
                                  <div 
                                    key={idx}
                                    className="flex-1 h-6 bg-gray-200 rounded flex items-center justify-center text-xs"
                                  >
                                    {workoutSportTotals[sport] ? `${workoutSportTotals[sport]}m` : '-'}
                                  </div>
                                ))}
                              </div>
                              
                              <div className="col-span-3 flex items-center justify-end gap-2">
                                <span className="text-xs text-gray-500">
                                  {workout.time || '-'}
                                </span>
                                <Grip className="w-4 h-4 text-gray-400 cursor-move" />
                              </div>
                            </div>

                            {/* Expanded Workout - Show Moveframes */}
                            {isWorkoutExpanded && workout.moveframes && (
                              <div className="bg-white pl-8">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-100 border-y">
                                    <tr>
                                      <th className="px-4 py-2 text-left">{t('workout_moveframe')}</th>
                                      <th className="px-4 py-2 text-left">{t('workout_sport')}</th>
                                      <th className="px-4 py-2 text-left">{t('workout_section')}</th>
                                      <th className="px-4 py-2 text-left">{t('workout_description')}</th>
                                      <th className="px-4 py-2 text-center">{t('workout_total')}</th>
                                      <th className="px-4 py-2 text-right">{t('workout_actions')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {workout.moveframes.map((moveframe: any, mfIndex: number) => {
                                      const isMoveframeExpanded = expandedMoveframes.has(moveframe.id);
                                      const totalDistance = moveframe.movelaps?.reduce(
                                        (sum: number, lap: any) => sum + (lap.distance || 0), 0
                                      ) || 0;

                                      return (
                                        <>
                                          {/* Moveframe Row */}
                                          <tr 
                                            key={moveframe.id}
                                            draggable
                                            className={`border-b hover:opacity-90 cursor-move ${
                                              draggedMoveframeData?.id === moveframe.id 
                                                ? 'opacity-50' 
                                                : ''
                                            } ${
                                              dragOverPosition === `moveframe-${moveframe.id}` 
                                                ? 'border-t-4 border-t-purple-500' 
                                                : ''
                                            }`}
                                            style={{
                                              backgroundColor: mfIndex % 2 === 1 
                                                ? settings?.colorSettings?.alternateRowMoveframe || '#fef3c7'
                                                : 'white',
                                              color: mfIndex % 2 === 1
                                                ? settings?.colorSettings?.alternateRowTextMoveframe || '#ef4444'
                                                : 'inherit'
                                            }}
                                            onClick={(e) => {
                                              if (!draggedMoveframeData) {
                                                e.stopPropagation();
                                                onToggleMoveframe(moveframe.id);
                                                onSelectMoveframe(moveframe.id);
                                              }
                                            }}
                                            onDragStart={(e) => {
                                              e.stopPropagation();
                                              setDraggedMoveframeData({ ...moveframe, workoutId: workout.id });
                                            }}
                                            onDragEnd={() => {
                                              setDraggedMoveframeData(null);
                                              setDragOverPosition(null);
                                            }}
                                            onDragOver={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (draggedMoveframeData && draggedMoveframeData.workoutId === workout.id) {
                                                setDragOverPosition(`moveframe-${moveframe.id}`);
                                              }
                                            }}
                                            onDragLeave={(e) => {
                                              e.stopPropagation();
                                              setDragOverPosition(null);
                                            }}
                                            onDrop={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (draggedMoveframeData && draggedMoveframeData.workoutId === workout.id && onMoveframeReorder) {
                                                // Reorder moveframes
                                                const currentMoveframes = [...workout.moveframes];
                                                const draggedIndex = currentMoveframes.findIndex(mf => mf.id === draggedMoveframeData.id);
                                                const targetIndex = currentMoveframes.findIndex(mf => mf.id === moveframe.id);
                                                
                                                if (draggedIndex !== targetIndex && draggedIndex >= 0) {
                                                  const [removed] = currentMoveframes.splice(draggedIndex, 1);
                                                  currentMoveframes.splice(targetIndex, 0, removed);
                                                  onMoveframeReorder(workout.id, currentMoveframes);
                                                }
                                                setDraggedMoveframeData(null);
                                                setDragOverPosition(null);
                                              }
                                            }}
                                          >
                                            <td className="px-4 py-2">
                                              <div className="flex items-center gap-2">
                                                {isMoveframeExpanded ? (
                                                  <ChevronDown className="w-3 h-3" />
                                                ) : (
                                                  <ChevronRight className="w-3 h-3" />
                                                )}
                                                <span className="font-bold text-blue-600">
                                                  {indexToLetter(mfIndex)}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-2">
                                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                {t(`sport_${moveframe.sport.toLowerCase()}`)}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2">
                                              <span 
                                                className="px-2 py-1 rounded text-xs text-white"
                                                style={{ backgroundColor: moveframe.section?.color || '#gray' }}
                                              >
                                                {moveframe.section?.name || '-'}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 text-gray-700">
                                              {moveframe.description || '-'}
                                            </td>
                                            <td className="px-4 py-2 text-center font-semibold">
                                              {totalDistance}m
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                              <Grip className="w-4 h-4 text-gray-400 cursor-move inline-block" />
                                            </td>
                                          </tr>

                                          {/* Expanded Moveframe - Show Movelaps */}
                                          {isMoveframeExpanded && moveframe.movelaps && (
                                            <tr>
                                              <td colSpan={6} className="px-0 py-0">
                                                <div className="bg-gray-50 p-4">
                                                  <table className="w-full text-xs">
                                                    <thead className="bg-gray-200">
                                                      <tr>
                                                        <th className="px-2 py-1">#</th>
                                                        <th className="px-2 py-1">Distance</th>
                                                        <th className="px-2 py-1">Speed</th>
                                                        <th className="px-2 py-1">Style</th>
                                                        <th className="px-2 py-1">Pace</th>
                                                        <th className="px-2 py-1">Rest</th>
                                                        <th className="px-2 py-1">Pause</th>
                                                        <th className="px-2 py-1">Notes</th>
                                                        <th className="px-2 py-1">Actions</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {moveframe.movelaps.map((lap: any, lapIndex: number) => (
                                                        <tr 
                                                          key={lap.id}
                                                          className={`border-b ${lap.isDisabled ? 'opacity-50 line-through' : ''}`}
                                                          style={{
                                                            backgroundColor: lapIndex % 2 === 1
                                                              ? settings?.colorSettings?.alternateRowMovelap || '#dbeafe'
                                                              : 'white',
                                                            color: lapIndex % 2 === 1
                                                              ? settings?.colorSettings?.alternateRowTextMovelap || '#1e293b'
                                                              : 'inherit'
                                                          }}
                                                        >
                                                          <td className="px-2 py-1">{lap.repetitionNumber}</td>
                                                          <td className="px-2 py-1">{lap.distance}m</td>
                                                          <td className="px-2 py-1">{lap.speed || '-'}</td>
                                                          <td className="px-2 py-1">{lap.style || '-'}</td>
                                                          <td className="px-2 py-1">{lap.pace || '-'}</td>
                                                          <td className="px-2 py-1">{lap.restType || '-'}</td>
                                                          <td className="px-2 py-1">{lap.pause || '-'}</td>
                                                          <td className="px-2 py-1">{lap.notes || '-'}</td>
                                                          <td className="px-2 py-1">
                                                            <button className="text-blue-600 hover:underline text-xs">
                                                              Edit
                                                            </button>
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </td>
                                            </tr>
                                          )}
                                        </>
                                      );
                                    })}
                                  </tbody>
                                </table>
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
        ))}
      </div>
    </div>
  );
}

