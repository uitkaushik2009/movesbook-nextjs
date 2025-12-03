'use client';

import React from 'react';
import RowActionButtons from '../RowActionButtons';

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
  const sport1 = sports[0] || { name: '—', icon: '—', distance: 0, duration: 0, k: 0 };
  const sport2 = sports[1] || { name: '—', icon: '—', distance: 0, duration: 0, k: 0 };
  const sport3 = sports[2] || { name: '—', icon: '—', distance: 0, duration: 0, k: 0 };
  const sport4 = sports[3] || { name: '—', icon: '—', distance: 0, duration: 0, k: 0 };
  
  // Calculate match percentage (85% + 20%)
  const matchPercentage = workout.completionRate 
    ? `${workout.completionRate}% + ${workout.intensityBonus || 0}%`
    : '—';

  return (
    <div className="mb-4">
      <table className="w-full border-collapse bg-white shadow-sm">
        <thead className="bg-cyan-400 text-white">
          <tr className="border-b border-gray-400">
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">No</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Match</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Sport</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Icon</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Distance</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Duration</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">K</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Sport</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Icon</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Distance</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Duration</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">K</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Sport</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Icon</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Distance</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Duration</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">K</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Sport</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Icon</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Distance</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">Duration</th>
            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-bold">K</th>
            <th 
              className="border border-gray-400 px-2 py-2 text-center text-sm font-bold sticky right-0 bg-cyan-400 z-20"
              style={{ minWidth: '120px' }}
            >
              Option
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50">
            <td className="border border-gray-300 px-2 py-2 text-sm">{workoutIndex + 1}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm">{matchPercentage}</td>
            
            {/* Sport 1 */}
            <td className="border border-gray-300 px-2 py-2 text-sm">{sport1.name}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-center">{sport1.icon}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-right">{sport1.distance || 0}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-right">0:00</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-center">—</td>
            
            {/* Sport 2 */}
            <td className="border border-gray-300 px-2 py-2 text-sm">{sport2.name}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-center">{sport2.icon}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-right">{sport2.distance || 0}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-right">0:00</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-center">—</td>
            
            {/* Sport 3 */}
            <td className="border border-gray-300 px-2 py-2 text-sm">{sport3.name}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-center">{sport3.icon}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-right">{sport3.distance || 0}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-right">0:00</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-center">—</td>
            
            {/* Sport 4 */}
            <td className="border border-gray-300 px-2 py-2 text-sm">{sport4.name}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-center">{sport4.icon}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-right">{sport4.distance || 0}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-right">0:00</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-center">—</td>
            
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
  );
}

