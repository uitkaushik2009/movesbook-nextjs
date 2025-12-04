'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import RowActionButtons from '../RowActionButtons';
import { useTableColumns } from '@/hooks/useTableColumns';
import TableColumnConfig from '../TableColumnConfig';

interface WorkoutTableProps {
  day: any;
  workout: any;
  workoutIndex: number;
  onEdit: () => void;
  onDelete: () => void;
  onAddMoveframe: () => void;
}

export default function WorkoutTable({
  day,
  workout,
  workoutIndex,
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
      <div className="mb-4">
        <table className="w-full border-collapse bg-white shadow-sm">
          <thead className="bg-cyan-400 text-white">
            {/* Title Row with Workout Options */}
            <tr>
              <th colSpan={visibleColumnCount + 1} className="border border-gray-400 px-3 py-2 text-left text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      Workout #{workoutIndex + 1}
                    </span>
                    <span className="text-cyan-200">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {workout.name && (
                      <span className="text-cyan-200">
                        - {workout.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Workout options:</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={onEdit}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit Workout
                      </button>
                      <button className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                        Add Workout
                      </button>
                      <button className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                        Copy
                      </button>
                      <button className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                        Move
                      </button>
                      <button 
                        onClick={onDelete}
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
            <tr className="border-b border-gray-400">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`border border-gray-400 px-2 py-2 text-sm font-bold ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth
                  }}
                >
                  {column.label}
                </th>
              ))}
              <th 
                className="border border-gray-400 px-2 py-2 text-center text-sm font-bold sticky right-0 bg-cyan-400 z-20"
                style={{ minWidth: '150px' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Option</span>
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-500 hover:bg-cyan-600 rounded"
                    title="Configure columns"
                  >
                    <Settings size={12} />
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              {visibleColumns.map((column) => (
                <td
                  key={column.id}
                  className={`border border-gray-300 px-2 py-2 text-sm ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {getCellValue(column)}
                </td>
              ))}
              
              {/* Sticky Options Column */}
              <td className="border border-gray-300 px-1 py-2 sticky right-0 bg-white z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                <div className="flex gap-1 justify-center items-center">
                  <button
                    onClick={onEdit}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    title="Edit workout"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {/* Show options dropdown */}}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    title="Options"
                  >
                    Option
                  </button>
                  <button
                    onClick={onDelete}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    title="Delete workout"
                  >
                    Delete
                  </button>
                </div>
              </td>
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

