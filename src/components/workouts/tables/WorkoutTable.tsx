'use client';

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { GripVertical, MoreVertical } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { getSportIcon, isImageIcon } from '@/utils/sportIcons';
import { useSportIconType } from '@/hooks/useSportIconType';
import { isSeriesBasedSport } from '@/constants/moveframe.constants';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import MoveframesSection from './MoveframesSection';

interface WorkoutTableProps {
  day: any;
  workout: any;
  workoutIndex: number;
  weekNumber?: number;
  periodName?: string;
  isExpanded?: boolean;
  expandedMoveframeId?: string | null;
  onToggleExpand?: () => void;
  onExpandOnlyThis?: (workout: any, day: any) => void;
  onEdit: () => void;
  onDelete: () => void;
  onSaveFavorite?: () => void;
  onShareWorkout?: (workout: any, day: any) => void;
  onExportPdfWorkout?: (workout: any, day: any) => void;
  onPrintWorkout?: (workout: any, day: any) => void;
  onAddMoveframe: () => void;
  onAddMoveframeAfter?: (moveframe: any, index: number, workout: any, day: any) => void;
  onEditMoveframe?: (moveframe: any) => void;
  onDeleteMoveframe?: (moveframe: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any) => void;
  onAddMovelap?: (moveframe: any) => void;
  onAddMovelapAfter?: (movelap: any, index: number, moveframe: any, workout: any, day: any) => void;
  onCopyWorkout?: (workout: any, day: any) => void;
  onMoveWorkout?: (workout: any, day: any) => void;
  onCopyMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onMoveMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onShowMoveframeInfoPanel?: (moveframe: any) => void;
  onOpenColumnSettings?: (tableType: 'day' | 'workout' | 'moveframe' | 'movelap') => void;
  onBulkAddMovelap?: (moveframe: any) => void;
  onRefreshWorkouts?: () => Promise<void>;
  columnSettings?: any;
}

export default function WorkoutTable({
  day,
  workout,
  workoutIndex,
  weekNumber,
  periodName,
  isExpanded = true,
  expandedMoveframeId,
  onToggleExpand,
  onExpandOnlyThis,
  onEdit,
  onDelete,
  onSaveFavorite,
  onShareWorkout,
  onExportPdfWorkout,
  onPrintWorkout,
  onAddMoveframe,
  onAddMoveframeAfter,
  onEditMoveframe,
  onDeleteMoveframe,
  onEditMovelap,
  onDeleteMovelap,
  onAddMovelap,
  onAddMovelapAfter,
  onCopyWorkout,
  onMoveWorkout,
  onCopyMoveframe,
  onMoveMoveframe,
  onOpenColumnSettings,
  onRefreshWorkouts,
  columnSettings
}: WorkoutTableProps) {
  // Get sport icon type from user settings
  const iconType = useSportIconType();
  
  // Track if user clicked the workout number to expand all movelaps
  const [autoExpandAllMovelaps, setAutoExpandAllMovelaps] = React.useState(false);

  // Dropdown state management
  const {
    isOpen: isOptionsOpen,
    buttonRef: optionsButtonRef,
    dropdownContentRef,
    dropdownPosition,
    isMounted,
    openDropdown,
    closeDropdown
  } = useDropdownPosition();

  // Reset auto-expand when workout is collapsed
  React.useEffect(() => {
    if (!isExpanded) {
      setAutoExpandAllMovelaps(false);
    }
  }, [isExpanded]);
  
  // Draggable hook for workout
  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    isDragging
  } = useDraggable({
    id: `workout-${workout.id}`,
    data: {
      type: 'workout',
      workout: workout,
      day: day
    }
  });

  // Droppable hook for moveframe drops
  const {
    setNodeRef: setDropNodeRef,
    isOver: isDropOver
  } = useDroppable({
    id: `workout-drop-${workout.id}`,
    data: {
      type: 'workout',
      workout: workout,
      day: day
    }
  });

  // Calculate sport totals from moveframes and workout sessions
  const calculateSportTotals = () => {
    // Get the 4 sports defined on the workout (in order)
    const workoutSportNames = (workout.sports || []).map((ws: any) => ws.sport);
    
    // Build a map of totals from moveframes
    const sportMap = new Map<string, { distance: number; durationMinutes: number; series: number; repetitions: number; k: string }>();
    
    // Calculate from moveframes
    (workout.moveframes || []).forEach((mf: any) => {
      const sport = mf.sport || 'Unknown';
      if (!sportMap.has(sport)) {
        sportMap.set(sport, { distance: 0, durationMinutes: 0, series: 0, repetitions: 0, k: '' });
      }
      
      const totals = sportMap.get(sport)!;
      const isSeries = isSeriesBasedSport(sport);
      
      // For ALL sports: sum the repetitions/series from each moveframe
      // For distance-based sports: repetitions = number of laps planned
      // For series-based sports: repetitions = number of series planned
      const moveframeRepetitions = parseInt(mf.repetitions) || 0;
      totals.series += moveframeRepetitions;
      
      if (isSeries) {
        // For series-based sports: also calculate total reps (series × reps per series)
        const repsPerSeries = mf.movelaps?.[0]?.reps || 0;
        totals.repetitions += moveframeRepetitions * (parseInt(repsPerSeries) || 0);
      } else {
        // For distance-based sports: sum distances and duration from movelaps
        (mf.movelaps || []).forEach((lap: any) => {
          // Add distance
          if (lap.distance) {
            totals.distance += parseInt(lap.distance) || 0;
          }
          
          // Add duration (if available as time in format like "00:05:30" or minutes)
          if (lap.time) {
            const timeStr = lap.time.toString();
            if (timeStr.includes(':')) {
              const parts = timeStr.split(':');
              const hours = parseInt(parts[0]) || 0;
              const minutes = parseInt(parts[1]) || 0;
              const seconds = parseInt(parts[2]) || 0;
              totals.durationMinutes += (hours * 60) + minutes + (seconds / 60);
            } else {
              totals.durationMinutes += parseFloat(timeStr) || 0;
            }
          }
        });
      }
    });
    
    // Format duration as HH:MM
    const formatDuration = (minutes: number): string => {
      if (minutes === 0) return '';
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}`;
      }
      return `0:${mins.toString().padStart(2, '0')}`;
    };
    
    // Build array of exactly 4 sports, using workout.sports order
    const sportsArray = [];
    for (let i = 0; i < 4; i++) {
      const sportName = workoutSportNames[i];
      if (sportName) {
        // Sport is defined in workout - show it with totals (or empty if no moveframes yet)
        const totals = sportMap.get(sportName);
        const isSeries = isSeriesBasedSport(sportName);
        
        // Find all moveframes of this sport across ALL workouts in the day
        const allMoveframesOfSport: any[] = [];
        day.workouts?.forEach((w: any) => {
          if (w.moveframes) {
            w.moveframes.forEach((mf: any) => {
              if (mf.sport === sportName) {
                allMoveframesOfSport.push(mf);
              }
            });
          }
        });

        // Find explicitly set main/secondary work
        let mainWork = allMoveframesOfSport.find((mf: any) => mf.workType === 'MAIN');
        let secondaryWork = allMoveframesOfSport.find((mf: any) => mf.workType === 'SECONDARY');
        
        // Apply automatic fallback logic if no explicit main work is set
        if (!mainWork && allMoveframesOfSport.length > 0) {
          if (allMoveframesOfSport.length === 1) {
            // Only 1 moveframe → it becomes main work
            mainWork = allMoveframesOfSport[0];
          } else if (allMoveframesOfSport.length >= 2) {
            // 2+ moveframes → 2nd moveframe becomes main work
            mainWork = allMoveframesOfSport[1];
            
            // If 3+ moveframes → 3rd moveframe becomes secondary work
            if (allMoveframesOfSport.length >= 3 && !secondaryWork) {
              secondaryWork = allMoveframesOfSport[2];
            }
          }
        }
        
        sportsArray.push({
          name: sportName,
          icon: getSportIcon(sportName, iconType),
          isSeriesBased: isSeries,
          distance: totals ? (isSeries ? totals.series : totals.distance) : 0,
          duration: totals ? (isSeries ? totals.repetitions.toString() : formatDuration(totals.durationMinutes)) : '',
          k: totals ? totals.k : '',
          mainWork: mainWork?.description || '',
          secondaryWork: secondaryWork?.description || ''
        });
      } else {
        // Empty slot
        sportsArray.push({ name: '', icon: '', isSeriesBased: false, distance: 0, duration: '', k: '', mainWork: '', secondaryWork: '' });
      }
    }
    
    return sportsArray;
  };
  
  const sports = calculateSportTotals();
  const useImageIcons = isImageIcon(iconType);
  
  // Calculate match percentage (85% + 20%)
  const matchPercentage = workout.completionRate 
    ? `${Math.round(workout.completionRate)}% + ${Math.round(workout.bonusRate || 0)}%`
    : '85% + 20%';

  console.log(`🏋️ WorkoutTable rendering for workout ${workout.id}, isExpanded: ${isExpanded}`);

  return (
      <div 
        ref={setDropNodeRef}
        className={`mb-4 ${isDropOver ? 'ring-4 ring-yellow-400 ring-opacity-75 rounded' : ''}`}
      >
        {/* WORKOUT HEADER BAR - Contains title, day info, and action buttons */}
        <div className="bg-cyan-400 text-white px-4 py-2 rounded-t-lg border border-cyan-500">
          {/* All Controls on Left Side */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Checkbox */}
            <input
              type="checkbox"
              className="w-4 h-4 cursor-pointer flex-shrink-0"
              title="Select workout"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Drag Handle */}
            <span
              ref={setDragNodeRef}
              {...attributes}
              {...listeners}
              className="cursor-move text-white hover:text-cyan-200 transition-colors inline-block flex-shrink-0"
              title="Drag to move workout"
            >
              <GripVertical size={18} />
            </span>
            
            {/* Toggle and Workout Number */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleExpand) onToggleExpand();
                }}
                className="text-white hover:bg-cyan-500 rounded px-2 py-1 transition-colors font-bold text-base flex-shrink-0"
                title={`Click to ${isExpanded ? 'collapse' : 'expand'} workout`}
              >
                {isExpanded ? '▼' : '►'}
              </button>
              <span className="font-bold text-lg whitespace-nowrap">Workout #{workoutIndex + 1}</span>
            </div>
            
            {/* Day Info */}
            <div className="flex items-center gap-2 text-sm text-cyan-50 flex-shrink-0">
              <span>|</span>
              <span className="font-medium whitespace-nowrap">{day.period?.name || 'No Period'}</span>
              <span>•</span>
              <span className="whitespace-nowrap">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              {day.weather && (
                <>
                  <span>•</span>
                  <span className="whitespace-nowrap">{day.weather}</span>
                </>
              )}
            </div>
            
            {/* Separator */}
            <span className="text-white/40 flex-shrink-0">|</span>
            
            {/* Action Buttons - Now on Left Side */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
              className="px-3 py-1 text-xs bg-white text-cyan-600 rounded hover:bg-cyan-50 transition-colors font-medium whitespace-nowrap flex-shrink-0"
              title="View/Edit Workout Info"
            >
              Workout Info
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onAddMoveframe) onAddMoveframe();
              }}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium whitespace-nowrap flex-shrink-0"
              title="Add a Moveframe"
            >
              Add a Moveframe
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onCopyWorkout) onCopyWorkout(workout, day);
              }}
              className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors whitespace-nowrap flex-shrink-0"
              title="Copy Workout"
            >
              Copy
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onMoveWorkout) onMoveWorkout(workout, day);
              }}
              className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors whitespace-nowrap flex-shrink-0"
              title="Move Workout"
            >
              Move
            </button>
            
            {/* Options Dropdown - Between Move and Delete */}
            <div className="relative flex-shrink-0">
              <button 
                ref={optionsButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOptionsOpen) {
                    closeDropdown();
                  } else {
                    openDropdown();
                  }
                }}
                className="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors whitespace-nowrap flex items-center gap-1"
                title="More Options"
              >
                <MoreVertical size={14} />
                Options
              </button>
              
              {/* Dropdown Menu - Rendered via Portal */}
              {isOptionsOpen && isMounted && ReactDOM.createPortal(
                <div 
                  ref={dropdownContentRef}
                  className="fixed bg-white border border-gray-300 rounded-lg shadow-2xl z-[99999] min-w-[160px]" 
                  style={{
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`
                  }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeDropdown();
                      if (onShareWorkout) onShareWorkout(workout, day);
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <span className="text-blue-600">🔗</span>
                    <span>Share</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeDropdown();
                      if (onExportPdfWorkout) onExportPdfWorkout(workout, day);
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                  >
                    <span className="text-red-600">📕</span>
                    <span>Export PDF</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeDropdown();
                      if (onSaveFavorite) onSaveFavorite();
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] hover:bg-yellow-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                  >
                    <span className="text-yellow-600">⭐</span>
                    <span>Save in Fav</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeDropdown();
                      if (onPrintWorkout) onPrintWorkout(workout, day);
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                  >
                    <span className="text-gray-600">🖨️</span>
                    <span>Print</span>
                  </button>
                </div>,
                document.body
              )}
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete();
              }}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors whitespace-nowrap flex-shrink-0"
              title="Delete Workout"
            >
              Delete
            </button>
          </div>
        </div>
        
        {/* WORKOUT TABLE CONTAINER - Scrollable wrapper */}
        <div className="overflow-x-auto">
          <table className="border-collapse bg-white shadow-sm text-sm w-auto">
          {/* COLUMN HEADERS */}
          <thead className="bg-cyan-400 text-white">
            <tr>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center" style={{ width: '50px' }}>No</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center" style={{ width: '80px' }}>Match</th>
              
              {/* Dynamic headers for each sport */}
              {sports.map((sport, index) => (
                <React.Fragment key={index}>
                  <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center" style={{ width: '160px' }}>Sport</th>
                  <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center" style={{ width: '90px' }}>Dist & Time</th>
                  <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center" style={{ width: '50px' }}>K</th>
                  <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center" style={{ width: '200px' }}>Main work</th>
                  <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center" style={{ width: '200px' }}>Secondary work</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {/* WORKOUT DATA ROW - Shows sport totals */}
            <tr className="bg-blue-50 hover:bg-blue-100">
              {/* Workout number column */}
              <td 
                className="border border-gray-200 px-2 text-xs text-center font-bold align-middle"
                style={{ backgroundColor: isExpanded ? '#DBEAFE' : '#FEE2E2', height: '60px' }}
              >
                <span className="text-gray-600 select-none">{workoutIndex + 1}</span>
              </td>
              <td className="border border-gray-200 px-2 text-xs text-center font-semibold text-red-600 align-middle" style={{ height: '60px' }}>
                <div className="whitespace-nowrap text-[10px] leading-tight">{matchPercentage}</div>
              </td>
              
              {/* Sport 1 */}
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>
                <div className="flex items-center justify-center gap-2">
                  {sports[0].icon && (useImageIcons ? 
                    <img src={sports[0].icon} alt={sports[0].name} className="w-5 h-5 object-cover rounded flex-shrink-0" /> : 
                    <span className="text-base flex-shrink-0">{sports[0].icon}</span>
                  )}
                  <span className="font-medium whitespace-nowrap">{sports[0].name}</span>
                </div>
              </td>
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>
                <div className="text-[10px] leading-tight">
                  <div className="text-red-600 font-semibold">{sports[0].distance > 0 ? sports[0].distance : ''}</div>
                  <div className="mt-1">{sports[0].duration}</div>
                </div>
              </td>
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>{sports[0].k}</td>
              <td className="border border-gray-200 px-3 text-xs text-center text-gray-900 font-semibold align-middle" style={{ width: '200px', height: '60px' }}>
                <div className="line-clamp-2 leading-tight">{sports[0].mainWork}</div>
              </td>
              <td className="border border-gray-200 px-3 text-xs text-center text-gray-900 font-semibold align-middle" style={{ width: '200px', height: '60px' }}>
                <div className="line-clamp-2 leading-tight">{sports[0].secondaryWork}</div>
              </td>
              
              {/* Sport 2 */}
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>
                <div className="flex items-center justify-center gap-2">
                  {sports[1].icon && (useImageIcons ? 
                    <img src={sports[1].icon} alt={sports[1].name} className="w-5 h-5 object-cover rounded flex-shrink-0" /> : 
                    <span className="text-base flex-shrink-0">{sports[1].icon}</span>
                  )}
                  <span className="font-medium whitespace-nowrap">{sports[1].name}</span>
                </div>
              </td>
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>
                <div className="text-[10px] leading-tight">
                  <div className="text-red-600 font-semibold">{sports[1].distance > 0 ? sports[1].distance : ''}</div>
                  <div className="mt-1">{sports[1].duration}</div>
                </div>
              </td>
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>{sports[1].k}</td>
              <td className="border border-gray-200 px-3 text-xs text-center text-gray-900 font-semibold align-middle" style={{ width: '200px', height: '60px' }}>
                <div className="line-clamp-2 leading-tight">{sports[1].mainWork}</div>
              </td>
              <td className="border border-gray-200 px-3 text-xs text-center text-gray-900 font-semibold align-middle" style={{ width: '200px', height: '60px' }}>
                <div className="line-clamp-2 leading-tight">{sports[1].secondaryWork}</div>
              </td>
              
              {/* Sport 3 */}
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>
                <div className="flex items-center justify-center gap-2">
                  {sports[2].icon && (useImageIcons ? 
                    <img src={sports[2].icon} alt={sports[2].name} className="w-5 h-5 object-cover rounded flex-shrink-0" /> : 
                    <span className="text-base flex-shrink-0">{sports[2].icon}</span>
                  )}
                  <span className="font-medium whitespace-nowrap">{sports[2].name}</span>
                </div>
              </td>
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>
                <div className="text-[10px] leading-tight">
                  <div className="text-red-600 font-semibold">{sports[2].distance > 0 ? sports[2].distance : ''}</div>
                  <div className="mt-1">{sports[2].duration}</div>
                </div>
              </td>
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>{sports[2].k}</td>
              <td className="border border-gray-200 px-3 text-xs text-center text-gray-900 font-semibold align-middle" style={{ width: '200px', height: '60px' }}>
                <div className="line-clamp-2 leading-tight">{sports[2].mainWork}</div>
              </td>
              <td className="border border-gray-200 px-3 text-xs text-center text-gray-900 font-semibold align-middle" style={{ width: '200px', height: '60px' }}>
                <div className="line-clamp-2 leading-tight">{sports[2].secondaryWork}</div>
              </td>
              
              {/* Sport 4 */}
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>
                <div className="flex items-center justify-center gap-2">
                  {sports[3].icon && (useImageIcons ? 
                    <img src={sports[3].icon} alt={sports[3].name} className="w-5 h-5 object-cover rounded flex-shrink-0" /> : 
                    <span className="text-base flex-shrink-0">{sports[3].icon}</span>
                  )}
                  <span className="font-medium whitespace-nowrap">{sports[3].name}</span>
                </div>
              </td>
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>
                <div className="text-[10px] leading-tight">
                  <div className="text-red-600 font-semibold">{sports[3].distance > 0 ? sports[3].distance : ''}</div>
                  <div className="mt-1">{sports[3].duration}</div>
                </div>
              </td>
              <td className="border border-gray-200 px-2 text-xs text-center align-middle" style={{ height: '60px' }}>{sports[3].k}</td>
              <td className="border border-gray-200 px-3 text-xs text-center text-gray-900 font-semibold align-middle" style={{ width: '200px', height: '60px' }}>
                <div className="line-clamp-2 leading-tight">{sports[3].mainWork}</div>
              </td>
              <td className="border border-gray-200 px-3 text-xs text-center text-gray-900 font-semibold align-middle" style={{ width: '200px', height: '60px' }}>
                <div className="line-clamp-2 leading-tight">{sports[3].secondaryWork}</div>
              </td>
            </tr>
          </tbody>
          </table>
        </div>
        
      {/* MOVEFRAMES SECTION - Level 2: Indented from workout table */}
      {isExpanded && (workout.moveframes || []).length > 0 && (
        <div className="ml-8">
          <MoveframesSection
            moveframes={workout.moveframes}
            workout={workout}
            workoutIndex={workoutIndex}
            day={day}
            expandedMoveframeId={expandedMoveframeId}
            autoExpandAll={autoExpandAllMovelaps}
            onAddMoveframe={onAddMoveframe}
            onAddMoveframeAfter={onAddMoveframeAfter}
            onEditMoveframe={onEditMoveframe}
            onDeleteMoveframe={onDeleteMoveframe}
            onEditMovelap={onEditMovelap}
            onDeleteMovelap={onDeleteMovelap}
            onAddMovelap={onAddMovelap}
            onAddMovelapAfter={onAddMovelapAfter}
            onCopyMoveframe={onCopyMoveframe}
            onMoveMoveframe={onMoveMoveframe}
            onOpenColumnSettings={onOpenColumnSettings}
            onRefreshWorkouts={onRefreshWorkouts}
            columnSettings={columnSettings}
          />
        </div>
      )}
    </div>
  );
}
