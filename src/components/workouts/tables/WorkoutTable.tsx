'use client';

import React from 'react';
import { Settings, GripVertical } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import RowActionButtons from '../RowActionButtons';
import { useTableColumns } from '@/hooks/useTableColumns';
import TableColumnConfig from '../TableColumnConfig';

interface WorkoutTableProps {
  day: any;
  workout: any;
  workoutIndex: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddMoveframe: () => void;
}

export default function WorkoutTable({
  day,
  workout,
  workoutIndex,
  isExpanded = true,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddMoveframe
}: WorkoutTableProps) {
  const {
    visibleColumns,
    visibleColumnCount,
    toggleColumn,
    resetToDefault,
    isConfigModalOpen,
    setIsConfigModalOpen,
    columns
  } = useTableColumns('workout');

  // Draggable hook for workout dragging
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform
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

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Calculate sport totals from moveframes
  const calculateSportTotals = () => {
    const sportMap = new Map<string, { distance: number; duration: number; k: number }>();
    
    (workout.moveframes || []).forEach((mf: any) => {
      const sport = mf.sport || 'Unknown';
      if (!sportMap.has(sport)) {
        sportMap.set(sport, { distance: 0, duration: 0, k: 0 });
      }
      
      const totals = sportMap.get(sport)!;
      
      // Sum distances from movelaps
      (mf.movelaps || []).forEach((lap: any) => {
        if (lap.distance) totals.distance += parseInt(lap.distance) || 0;
        // TODO: Add duration calculation from lap.time
      });
    });
    
    return Array.from(sportMap.entries()).map(([name, totals]) => ({
      name,
      icon: getSportIcon(name),
      ...totals
    }));
  };
  
  const getSportIcon = (sportName: string) => {
    const icons: { [key: string]: string } = {
      'SWIM': '🏊',
      'RUN': '🏃',
      'BIKE': '🚴',
      'GYM': '🏋️',
      'YOGA': '🧘',
      'OTHER': '⚡'
    };
    return icons[sportName?.toUpperCase()] || '—';
  };
  
  const sports = calculateSportTotals();
  const sportsData = {
    sport1: sports[0] || { name: '—', icon: '—', distance: 0, duration: 0, k: 0 },
    sport2: sports[1] || { name: '—', icon: '—', distance: 0, duration: 0, k: 0 },
    sport3: sports[2] || { name: '—', icon: '—', distance: 0, duration: 0, k: 0 },
    sport4: sports[3] || { name: '—', icon: '—', distance: 0, duration: 0, k: 0 }
  };
  
  // Calculate match percentage (85% + 20%)
  const matchPercentage = workout.completionRate 
    ? `${workout.completionRate}% + ${workout.intensityBonus || 0}%`
    : '—';

  // Helper function to get cell value
  const getCellValue = (column: any) => {
    const keys = column.dataKey.split('.');
    
    // Handle special cases
    if (column.id === 'no') return workoutIndex + 1;
    if (column.id === 'match') return matchPercentage;
    
    // Handle sport data
    if (keys[0] in sportsData) {
      const sportKey = keys[0] as keyof typeof sportsData;
      const sport = sportsData[sportKey];
      
      if (keys[1] === 'name') return sport.name;
      if (keys[1] === 'icon') return sport.icon;
      if (keys[1] === 'distance') return sport.distance || 0;
      if (keys[1] === 'duration') return '0:00';
      if (keys[1] === 'k') return '—';
    }
    
    return '—';
  };

  return (
    <>
      <div 
        ref={setDropNodeRef}
        className={`mb-4 ${isDropOver ? 'ring-4 ring-yellow-400 ring-opacity-75 rounded' : ''}`}
      >
        <table className="w-full border-collapse bg-white shadow-sm text-xs">
          <thead className="bg-cyan-400 text-white">
            {/* Title Row with Workout Options */}
            <tr 
              onClick={() => onToggleExpand?.()}
              className="cursor-pointer hover:bg-cyan-500 transition-colors"
              title="Click to expand/collapse workout"
            >
              <th colSpan={visibleColumnCount + 1} className={`border border-gray-300 px-2 py-1 text-left text-xs ${isDragging ? 'opacity-50 bg-cyan-200' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Drag Handle */}
                    <span
                      ref={setNodeRef}
                      {...attributes}
                      {...listeners}
                      className="cursor-move text-cyan-200 hover:text-white transition-colors"
                      title="Drag to move workout"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical size={18} />
                    </span>
                    <span className="text-sm font-bold">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="font-bold text-xs">
                      Workout #{workoutIndex + 1}
                    </span>
                    <span className="text-cyan-200 text-xs">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {workout.name && (
                      <span className="text-cyan-200 text-xs">
                        - {workout.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs">Options:</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit();
                        }}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit Workout Info
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddMoveframe();
                        }}
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Add Moveframe
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
                          onDelete();
                        }}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
            {/* Column Headers */}
            <tr className="border-b border-gray-300">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className="border border-gray-300 px-1 py-1 text-xs font-bold text-center"
                  style={{
                    width: column.width,
                    minWidth: column.minWidth
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              {visibleColumns.map((column) => (
                <td
                  key={column.id}
                  className="border border-gray-300 px-1 py-1 text-xs text-center"
                >
                  {getCellValue(column)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        
        {/* Add Moveframe Button */}
        <div className="mt-2">
          <button
            onClick={onAddMoveframe}
            className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            + Add Moveframe
          </button>
        </div>
      </div>

      {/* Column Configuration Modal */}
      <TableColumnConfig
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        columns={columns}
        onToggleColumn={toggleColumn}
        onResetToDefault={resetToDefault}
        tableTitle="Workout"
      />
    </>
  );
}

