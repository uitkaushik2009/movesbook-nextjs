'use client';

import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import MoveframeInfoPanel from '../MoveframeInfoPanel';

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

// Sport icon mapping
const getSportIcon = (sport: string): string => {
  const icons: Record<string, string> = {
    'SWIM': '🏊',
    'BIKE': '🚴',
    'RUN': '🏃',
    'BODY_BUILDING': '💪',
    'ROWING': '🚣',
    'SKATE': '⛸️',
    'GYMNASTIC': '🤸',
    'STRETCHING': '🧘',
    'PILATES': '🧘‍♀️',
    'YOGA': '🧘‍♂️',
    'SKI': '⛷️',
    'SNOWBOARD': '🏂',
    'TECHNICAL_MOVES': '⚙️',
    'FREE_MOVES': '🤾',
    'SOCCER': '⚽',
    'BASKETBALL': '🏀',
    'TENNIS': '🎾',
    'VOLLEYBALL': '🏐',
    'GOLF': '⛳',
    'BOXING': '🥊',
    'MARTIAL_ARTS': '🥋',
    'CLIMBING': '🧗',
    'HIKING': '🥾',
    'WALKING': '🚶',
    'DANCING': '💃',
    'CROSSFIT': '🏋️',
    'TRIATHLON': '🏊‍♂️',
    'TRACK_FIELD': '🏃‍♀️'
  };
  return icons[sport] || '🏋️';
};

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
      icon: getSportIcon(name),
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
  
  // Calculate match percentage (85% + 20%)
  const matchPercentage = workout.completionRate 
    ? `${workout.completionRate}% + ${workout.intensityBonus || 0}%`
    : '85% + 20%';

  return (
      <div 
        ref={setDropNodeRef}
      className={`mb-4 max-w-[1400px] ${isDropOver ? 'ring-4 ring-yellow-400 ring-opacity-75 rounded' : ''}`}
      >
      <table className="border-collapse bg-white shadow-sm text-sm w-full">
        {/* HEADER ROW */}
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
          {/* ROW 1: WORKOUT SUMMARY */}
          <tr className="bg-blue-50 hover:bg-blue-100">
            <td 
              className="border border-gray-200 px-2 py-2 text-xs text-center font-bold cursor-pointer hover:bg-blue-200"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`Toggle workout ${workout.id}: ${isExpanded ? 'Collapsing' : 'Expanding'}`);
                if (onToggleExpand) onToggleExpand();
              }}
              title={`Click to ${isExpanded ? 'collapse' : 'expand'} workout`}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-blue-600 font-bold text-base">{isExpanded ? '▼' : '►'}</span>
                <span>{workoutIndex + 1}</span>
              </div>
            </td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center font-semibold text-red-600">{matchPercentage}</td>
            
            {/* Sport 1 */}
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[0].name}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[0].icon}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center text-red-600 font-semibold">
              {sports[0].distance > 0 ? sports[0].distance : ''}
            </td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[0].duration}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[0].k}</td>
            
            {/* Sport 2 */}
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[1].name}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[1].icon}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center text-red-600 font-semibold">
              {sports[1].distance > 0 ? sports[1].distance : ''}
            </td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[1].duration}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[1].k}</td>
            
            {/* Sport 3 */}
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[2].name}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[2].icon}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center text-red-600 font-semibold">
              {sports[2].distance > 0 ? sports[2].distance : ''}
            </td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[2].duration}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[2].k}</td>
            
            {/* Sport 4 */}
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[3].name}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[3].icon}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center text-red-600 font-semibold">
              {sports[3].distance > 0 ? sports[3].distance : ''}
            </td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[3].duration}</td>
            <td className="border border-gray-200 px-2 py-2 text-xs text-center">{sports[3].k}</td>
          </tr>
          
          {/* ROW 2: MOVEFRAMES SECTION */}
          <tr className="bg-white">
            <td colSpan={22} className="border border-gray-200 px-3 py-3">
              <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <span
                  ref={setDragNodeRef}
                      {...attributes}
                      {...listeners}
                  className="cursor-move text-gray-400 hover:text-gray-600 transition-colors"
                      title="Drag to move workout"
                    >
                      <GripVertical size={18} />
                    </span>
                
                {/* Workout Info - Display only (toggle via No column) */}
                <span 
                  className="text-xs text-gray-700 flex items-center gap-2"
                >
                  <strong>Moveframes of the workout #{workoutIndex + 1}</strong> - {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit();
                        }}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    title="Edit Workout Info"
                      >
                        Edit Info
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddMoveframe();
                        }}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    title="Add Moveframe"
                      >
                        Add MF
                      </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyWorkout?.(workout, day);
                    }}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    title="Copy Workout"
                  >
                    Copy
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveWorkout?.(workout, day);
                    }}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    title="Move Workout"
                  >
                        Move
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                        }}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    title="Delete Workout"
                      >
                        Del
                      </button>
                </div>
                  </div>
                </td>
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

// Moveframes Section Component
interface MoveframesSectionProps {
  moveframes: any[];
  workout: any;
  workoutIndex: number;
  day: any;
  onAddMoveframe: () => void;
  onEditMoveframe?: (moveframe: any) => void;
  onDeleteMoveframe?: (moveframe: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any) => void;
  onAddMovelap?: (moveframe: any) => void;
  onCopyMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onMoveMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onOpenColumnSettings?: (tableType: 'day' | 'workout' | 'moveframe' | 'movelap') => void;
}

function MoveframesSection({ 
  moveframes, 
  workout, 
  workoutIndex, 
  day,
  onAddMoveframe,
  onEditMoveframe,
  onDeleteMoveframe,
  onEditMovelap,
  onDeleteMovelap,
  onAddMovelap,
  onCopyMoveframe,
  onMoveMoveframe,
  onOpenColumnSettings
}: MoveframesSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [expandedMoveframe, setExpandedMoveframe] = React.useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [selectedMoveframe, setSelectedMoveframe] = useState<any>(null);

  return (
    <>
      <div className="mt-4 bg-purple-100 rounded-lg max-w-[1400px]">
        {/* Header Bar */}
        <div className="bg-purple-200 px-4 py-2 flex flex-wrap items-center justify-between rounded-t-lg gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-700 hover:bg-purple-300 rounded px-2 py-1 transition-colors font-bold"
          >
            {isExpanded ? '▼' : '►'}
          </button>
          <span className="font-bold text-sm text-purple-900">
            Moveframes of workout #{workoutIndex + 1}
          </span>
          <span className="text-xs text-purple-700">
            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Options Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs font-semibold text-purple-900">Options:</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (moveframes.length > 0) {
                setSelectedMoveframe(moveframes[0]);
                setShowInfoPanel(true);
              } else {
                alert('No moveframes to display');
              }
            }}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Show moveframe info"
          >
            MF Info
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (moveframes.length > 0 && onCopyMoveframe) {
                // For now, copy the first moveframe as example
                // In a full implementation, you'd select which one
                onCopyMoveframe(moveframes[0], workout, day);
              } else {
                alert('No moveframes to copy');
              }
            }}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            title="Copy moveframe"
          >
            Copy
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (moveframes.length > 0 && onMoveMoveframe) {
                // For now, move the first moveframe as example
                // In a full implementation, you'd select which one
                onMoveMoveframe(moveframes[0], workout, day);
              } else {
                alert('No moveframes to move');
              }
            }}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            title="Move moveframe"
          >
            Move
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete all moveframes in this workout?')) {
                moveframes.forEach((mf: any) => onDeleteMoveframe?.(mf));
              }
            }}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            title="Delete all moveframes"
          >
            Del
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenColumnSettings) {
                onOpenColumnSettings('moveframe');
              }
            }}
            className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
            title="Configure columns"
          >
            ⚙ Col
          </button>
        </div>
      </div>

      {/* Moveframes Table */}
      {isExpanded && (
        <div className="p-4">
          <table className="w-full border-collapse text-xs bg-white">
            <thead className="bg-purple-300 text-purple-900">
              <tr>
                <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">::</th>
                <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">MF</th>
                <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Color</th>
                <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Type</th>
                <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Sport</th>
                <th className="border border-gray-200 px-1 py-1 text-left text-[10px]">Description</th>
                <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Rip</th>
                <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Dist</th>
                <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {moveframes.map((moveframe: any, mfIndex: number) => {
                const movelapsCount = moveframe.movelaps?.length || 0;
                const totalDistance = (moveframe.movelaps || []).reduce(
                  (sum: number, lap: any) => sum + (parseInt(lap.distance) || 0),
                  0
                );
                const sectionColor = moveframe.section?.color || '#5b8def';
                const sectionName = moveframe.section?.name || 'Default';

                const isMovelapsExpanded = expandedMoveframe === moveframe.id;
                
                return (
                  <React.Fragment key={moveframe.id}>
                    <tr 
                      className="hover:bg-purple-50 cursor-pointer"
                      onClick={() => setExpandedMoveframe(isMovelapsExpanded ? null : moveframe.id)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (onEditMoveframe) onEditMoveframe(moveframe);
                      }}
                      title="Click to expand/collapse movelaps, Double-click to edit moveframe"
                    >
                      <td className="border border-gray-200 px-1 py-1 text-center text-gray-600 text-[10px]">
                        <span className="cursor-pointer font-bold">{isMovelapsExpanded ? '▼' : '►'}</span>
                      </td>
                      <td className="border border-gray-200 px-1 py-1 text-center font-bold text-xs">
                        {moveframe.letter || String.fromCharCode(65 + mfIndex)}
                      </td>
                      <td className="border border-gray-200 px-1 py-1 text-center">
                        <div
                          className="w-6 h-6 mx-auto rounded"
                          style={{ backgroundColor: sectionColor }}
                          title={sectionName}
                        />
                      </td>
                      <td className="border border-gray-200 px-1 py-1 text-center text-[10px]">
                        {sectionName}
                      </td>
                      <td className="border border-gray-200 px-1 py-1 text-center text-[10px]">
                        {moveframe.sport?.replace(/_/g, ' ') || 'Unknown'}
                      </td>
                      <td className="border border-gray-200 px-1 py-1 text-[10px]">
                        {moveframe.description || 'No description'}
                      </td>
                      <td className="border border-gray-200 px-1 py-1 text-center text-red-600 font-semibold text-xs">
                        {movelapsCount}
                      </td>
                      <td className="border border-gray-200 px-1 py-1 text-center font-semibold text-xs">
                        {totalDistance}
                      </td>
                      <td className="border border-gray-200 px-1 py-1 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMoveframe(moveframe);
                              setShowInfoPanel(true);
                            }}
                            className="px-1 py-0.5 text-[9px] bg-blue-500 text-white rounded hover:bg-blue-600"
                            title="View moveframe info"
                          >
                            Info
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onCopyMoveframe) onCopyMoveframe(moveframe, workout, day);
                            }}
                            className="px-1 py-0.5 text-[9px] bg-green-500 text-white rounded hover:bg-green-600"
                            title="Copy this moveframe"
                          >
                            Copy
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onMoveMoveframe) onMoveMoveframe(moveframe, workout, day);
                            }}
                            className="px-1 py-0.5 text-[9px] bg-orange-500 text-white rounded hover:bg-orange-600"
                            title="Move this moveframe"
                          >
                            Move
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onDeleteMoveframe) {
                                if (confirm(`Delete moveframe ${moveframe.letter}?`)) {
                                  onDeleteMoveframe(moveframe);
                                }
                              }
                            }}
                            className="px-1 py-0.5 text-[9px] bg-red-500 text-white rounded hover:bg-red-600"
                            title="Delete this moveframe"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Movelaps Detail Table */}
                    {isMovelapsExpanded && (
                      <tr>
                        <td colSpan={9} className="border border-gray-200 p-0">
                          <MovelapDetailTable 
                            moveframe={moveframe}
                            onEditMovelap={(movelap) => onEditMovelap?.(movelap, moveframe)}
                            onDeleteMovelap={(movelap) => onDeleteMovelap?.(movelap, moveframe)}
                            onAddMovelap={() => onAddMovelap?.(moveframe)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Moveframe Info Panel */}
      {showInfoPanel && selectedMoveframe && (
        <MoveframeInfoPanel
          isOpen={showInfoPanel}
          onClose={() => {
            setShowInfoPanel(false);
            setSelectedMoveframe(null);
          }}
          moveframe={selectedMoveframe}
          workout={workout}
          day={day}
          onEdit={() => {
            setShowInfoPanel(false);
            if (onEditMoveframe) onEditMoveframe(selectedMoveframe);
          }}
          onCopy={() => {
            setShowInfoPanel(false);
            if (onCopyMoveframe) onCopyMoveframe(selectedMoveframe, workout, day);
          }}
          onMove={() => {
            setShowInfoPanel(false);
            if (onMoveMoveframe) onMoveMoveframe(selectedMoveframe, workout, day);
          }}
          onDelete={() => {
            setShowInfoPanel(false);
            if (onDeleteMoveframe) onDeleteMoveframe(selectedMoveframe);
          }}
          onAddMovelap={() => {
            setShowInfoPanel(false);
            if (onAddMovelap) onAddMovelap(selectedMoveframe);
          }}
          onBulkAddMovelaps={() => {
            // Note: This will be handled by WorkoutSection through a callback
            // For now, alert user that bulk add is available
            alert('Bulk Add Movelaps feature - integration in progress');
            setShowInfoPanel(false);
          }}
          onEditMovelap={(movelap) => {
            setShowInfoPanel(false);
            if (onEditMovelap) onEditMovelap(movelap, selectedMoveframe);
          }}
          onDeleteMovelap={(movelap) => {
            if (onDeleteMovelap) onDeleteMovelap(movelap, selectedMoveframe);
          }}
        />
      )}
    </>
  );
}

// Movelap Detail Table Component
interface MovelapDetailTableProps {
  moveframe: any;
  onEditMovelap?: (movelap: any) => void;
  onDeleteMovelap?: (movelap: any) => void;
  onAddMovelap?: () => void;
}

function MovelapDetailTable({ moveframe, onEditMovelap, onDeleteMovelap, onAddMovelap }: MovelapDetailTableProps) {
  const movelaps = moveframe.movelaps || [];
  const sectionColor = moveframe.section?.color || '#5b8def';
  const sectionName = moveframe.section?.name || 'Default';

  return (
    <div className="bg-white p-2">
      <table className="w-full border-collapse text-xs">
        <thead className="bg-yellow-400 text-gray-900">
          <tr>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">MF</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Color</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Workout type</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Sport</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Distance</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Style</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Speed</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Time</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Pace</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Rec</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Rest To</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Alm Sound</th>
            <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Annotation</th>
          </tr>
        </thead>
        <tbody>
          {movelaps.map((lap: any, lapIndex: number) => (
            <tr 
              key={lapIndex} 
              className={`${lapIndex % 2 === 0 ? 'bg-green-50' : 'bg-white'} hover:bg-yellow-50 cursor-pointer`}
              onClick={() => onEditMovelap?.(lap)}
              title="Click to edit movelap"
            >
              <td className="border border-gray-200 px-1 py-1 text-center font-bold text-xs">
                {moveframe.letter || 'A'}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center">
                <div
                  className="w-4 h-4 mx-auto rounded"
                  style={{ backgroundColor: sectionColor }}
                  title={sectionName}
                />
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-[10px] text-red-600">
                {sectionName}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-[10px]">
                {moveframe.sport?.replace(/_/g, ' ') || ''}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-xs font-semibold">
                {lap.distance || 0}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-xs">
                {lap.style || ''}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-xs font-semibold">
                {lap.speed || ''}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-xs">
                {lap.time || ''}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-xs">
                {lap.pace || ''}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-xs">
                {lap.pause || ''}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-xs">
                {lap.restType || ''}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-xs">
                {lap.alarm ? `${lap.alarm}` : ''}
                {lap.sound ? ` / ${lap.sound}` : ''}
              </td>
              <td className="border border-gray-200 px-1 py-1 text-center text-xs">
                {lap.notes || ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Movelap Button */}
      <div className="mt-2 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddMovelap?.();
          }}
          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Add Movelap
        </button>
      </div>
    </div>
  );
}
