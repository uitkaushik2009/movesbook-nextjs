'use client';

import React from 'react';
import { GripVertical } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { getSportIcon, isImageIcon } from '@/utils/sportIcons';
import { useSportIconType } from '@/hooks/useSportIconType';
import MoveframesSection from './MoveframesSection';

interface WorkoutTableProps {
  day: any;
  workout: any;
  workoutIndex: number;
  weekNumber?: number;
  periodName?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddMoveframe: () => void;
  onEditMoveframe?: (moveframe: any) => void;
  onDeleteMoveframe?: (moveframe: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any) => void;
  onAddMovelap?: (moveframe: any) => void;
  onCopyWorkout?: (workout: any, day: any) => void;
  onMoveWorkout?: (workout: any, day: any) => void;
  onCopyMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onMoveMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onShowMoveframeInfoPanel?: (moveframe: any) => void;
  onOpenColumnSettings?: (tableType: 'day' | 'workout' | 'moveframe' | 'movelap') => void;
  onBulkAddMovelap?: (moveframe: any) => void;
  columnSettings?: any;
}

export default function WorkoutTable({
  day,
  workout,
  workoutIndex,
  weekNumber,
  periodName,
  isExpanded = true,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddMoveframe,
  onEditMoveframe,
  onDeleteMoveframe,
  onEditMovelap,
  onDeleteMovelap,
  onAddMovelap,
  onCopyWorkout,
  onMoveWorkout,
  onCopyMoveframe,
  onMoveMoveframe,
  onOpenColumnSettings,
  columnSettings
}: WorkoutTableProps) {
  // Get sport icon type from user settings
  const iconType = useSportIconType();
  
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
    const sportMap = new Map<string, { distance: number; durationMinutes: number; k: string }>();
    
    // Get sports from workout session
    if (workout.sports && workout.sports.length > 0) {
      workout.sports.forEach((ws: any) => {
        const sportName = ws.sport?.name || ws.sport || 'Unknown';
        if (!sportMap.has(sportName)) {
          sportMap.set(sportName, { distance: 0, durationMinutes: 0, k: '' });
        }
      });
    }
    
    // Calculate from moveframes
    (workout.moveframes || []).forEach((mf: any) => {
      const sport = mf.sport || 'Unknown';
      if (!sportMap.has(sport)) {
        sportMap.set(sport, { distance: 0, durationMinutes: 0, k: '' });
      }
      
      const totals = sportMap.get(sport)!;
      
      // Sum distances and duration from movelaps
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
    
    // Return exactly 4 sports (pad with empty if needed)
    const sportsArray = Array.from(sportMap.entries()).map(([name, totals]) => ({
      name,
      icon: getSportIcon(name, iconType),
      distance: totals.distance,
      duration: formatDuration(totals.durationMinutes),
      k: totals.k
    }));
    
    // Ensure we have exactly 4 sport slots
    while (sportsArray.length < 4) {
      sportsArray.push({ name: '', icon: '', distance: 0, duration: '', k: '' });
    }
    
    return sportsArray.slice(0, 4);
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
        className={`mb-4 max-w-[1400px] ${isDropOver ? 'ring-4 ring-yellow-400 ring-opacity-75 rounded' : ''}`}
      >
        {/* WORKOUT HEADER BAR - Contains title, day info, and action buttons */}
        <div className="bg-cyan-400 text-white px-4 py-2 flex items-center justify-between rounded-t-lg border border-cyan-500">
          {/* Left: Workout Title and Controls */}
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              className="w-4 h-4 cursor-pointer"
              title="Select workout"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Drag Handle */}
            <span
              ref={setDragNodeRef}
              {...attributes}
              {...listeners}
              className="cursor-move text-white hover:text-cyan-200 transition-colors inline-block"
              title="Drag to move workout"
            >
              <GripVertical size={18} />
            </span>
            
            {/* Toggle and Workout Number */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleExpand) onToggleExpand();
                }}
                className="text-white hover:bg-cyan-500 rounded px-2 py-1 transition-colors font-bold text-base"
                title={`Click to ${isExpanded ? 'collapse' : 'expand'} workout`}
              >
                {isExpanded ? '▼' : '►'}
              </button>
              <span className="font-bold text-lg">Workout #{workoutIndex + 1}</span>
            </div>
            
            {/* Day Info */}
            <div className="flex items-center gap-2 text-sm text-cyan-50 ml-2">
              <span>|</span>
              <span className="font-medium">{day.period?.name || 'No Period'}</span>
              <span>•</span>
              <span>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              {day.weather && (
                <>
                  <span>•</span>
                  <span>{day.weather}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
              className="px-3 py-1 text-xs bg-white text-cyan-600 rounded hover:bg-cyan-50 transition-colors font-medium"
              title="Edit Workout Info"
            >
              Edit Info
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onAddMoveframe) onAddMoveframe();
              }}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium"
              title="Add Moveframe"
            >
              + Moveframe
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onCopyWorkout) onCopyWorkout(workout, day);
              }}
              className="px-2 py-1 text-xs bg-white/20 text-white rounded hover:bg-white/30 transition-colors"
              title="Copy Workout"
            >
              Copy
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onMoveWorkout) onMoveWorkout(workout, day);
              }}
              className="px-2 py-1 text-xs bg-white/20 text-white rounded hover:bg-white/30 transition-colors"
              title="Move Workout"
            >
              Move
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete();
              }}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="Delete Workout"
            >
              Delete
            </button>
          </div>
        </div>
        
        {/* WORKOUT TABLE - Main data table with sport columns */}
        <table className="border-collapse bg-white shadow-sm text-sm w-full">
          {/* COLUMN HEADERS */}
          <thead className="bg-cyan-400 text-white">
            <tr>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-12">No</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-24">Match</th>
              
              {/* Sport 1 */}
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center">Sport</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-12">Icon</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-20">Distance</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-20">Duration</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-12">K</th>
              
              {/* Sport 2 */}
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center">Sport</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-12">Icon</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-20">Distance</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-20">Duration</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-12">K</th>
              
              {/* Sport 3 */}
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center">Sport</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-12">Icon</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-20">Distance</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-20">Duration</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-12">K</th>
              
              {/* Sport 4 */}
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center">Sport</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-12">Icon</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-20">Distance</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-20">Duration</th>
              <th className="border border-gray-200 px-2 py-1 text-xs font-bold text-center w-12">K</th>
            </tr>
          </thead>
          
          <tbody>
            {/* WORKOUT DATA ROW - Shows sport totals */}
            <tr className="bg-blue-50 hover:bg-blue-100">
              {/* Workout number column */}
              <td 
                className="border border-gray-200 px-2 py-2 text-xs text-center font-bold"
                style={{ backgroundColor: isExpanded ? '#DBEAFE' : '#FEE2E2' }}
              >
                <span className="text-gray-600">{workoutIndex + 1}</span>
              </td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center font-semibold text-red-600">{matchPercentage}</td>
              
              {/* Sport 1 */}
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[0].name}</td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">
                {sports[0].icon && (useImageIcons ? 
                  <img src={sports[0].icon} alt={sports[0].name} className="w-6 h-6 object-cover rounded mx-auto" /> : 
                  sports[0].icon
                )}
              </td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center text-red-600 font-semibold">
                {sports[0].distance > 0 ? sports[0].distance : ''}
              </td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[0].duration}</td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[0].k}</td>
              
              {/* Sport 2 */}
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[1].name}</td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">
                {sports[1].icon && (useImageIcons ? 
                  <img src={sports[1].icon} alt={sports[1].name} className="w-6 h-6 object-cover rounded mx-auto" /> : 
                  sports[1].icon
                )}
              </td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center text-red-600 font-semibold">
                {sports[1].distance > 0 ? sports[1].distance : ''}
              </td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[1].duration}</td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[1].k}</td>
              
              {/* Sport 3 */}
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[2].name}</td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">
                {sports[2].icon && (useImageIcons ? 
                  <img src={sports[2].icon} alt={sports[2].name} className="w-6 h-6 object-cover rounded mx-auto" /> : 
                  sports[2].icon
                )}
              </td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center text-red-600 font-semibold">
                {sports[2].distance > 0 ? sports[2].distance : ''}
              </td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[2].duration}</td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[2].k}</td>
              
              {/* Sport 4 */}
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[3].name}</td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">
                {sports[3].icon && (useImageIcons ? 
                  <img src={sports[3].icon} alt={sports[3].name} className="w-6 h-6 object-cover rounded mx-auto" /> : 
                  sports[3].icon
                )}
              </td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center text-red-600 font-semibold">
                {sports[3].distance > 0 ? sports[3].distance : ''}
              </td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[3].duration}</td>
              <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[3].k}</td>
            </tr>
          </tbody>
        </table>
        
      {/* MOVEFRAMES SECTION - Display below workout table when expanded */}
      {isExpanded && (workout.moveframes || []).length > 0 && (
        <MoveframesSection
          moveframes={workout.moveframes}
          workout={workout}
          workoutIndex={workoutIndex}
          day={day}
          onAddMoveframe={onAddMoveframe}
          onEditMoveframe={onEditMoveframe}
          onDeleteMoveframe={onDeleteMoveframe}
          onEditMovelap={onEditMovelap}
          onDeleteMovelap={onDeleteMovelap}
          onAddMovelap={onAddMovelap}
          onCopyMoveframe={onCopyMoveframe}
          onMoveMoveframe={onMoveMoveframe}
          onOpenColumnSettings={onOpenColumnSettings}
        />
      )}
    </div>
  );
}
