'use client';

import React from 'react';

interface MoveframeTableProps {
  day: any;
  workout: any;
  moveframe: any;
  workoutIndex: number;
  onEdit: () => void;
  onDelete: () => void;
  onAddMovelap: () => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
}

export default function MoveframeTable({
  day,
  workout,
  moveframe,
  workoutIndex,
  onEdit,
  onDelete,
  onAddMovelap,
  onToggleExpand,
  isExpanded
}: MoveframeTableProps) {
  return (
    <div className="mb-4 ml-8">
      <table className="w-full border-collapse bg-purple-50 shadow-sm">
        {/* Title Row */}
        <thead className="bg-purple-200">
          <tr>
            <th colSpan={8} className="border border-gray-400 px-3 py-2 text-left text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onToggleExpand}
                    className="text-purple-700 hover:bg-purple-300 rounded p-1"
                  >
                    {isExpanded ? '▼' : '►'}
                  </button>
                  <span className="font-bold">
                    Moveframes of the workout
                  </span>
                  <span className="text-purple-700">
                    &lt; put here the number and day of the workout selected &gt;
                  </span>
                  <span className="font-bold ml-4">Moveframe options:</span>
                  <span className="text-purple-700">
                    &lt; put here the text buttons of the moveframe options, I will send later &gt;
                  </span>
                </div>
              </div>
            </th>
          </tr>
          {/* Column Headers */}
          <tr className="bg-purple-300">
            <th className="border border-gray-400 px-2 py-1 text-left text-xs font-bold" style={{width: '40px'}}>MF</th>
            <th className="border border-gray-400 px-2 py-1 text-left text-xs font-bold" style={{width: '60px'}}>Color</th>
            <th className="border border-gray-400 px-2 py-1 text-left text-xs font-bold" style={{width: '120px'}}>Workout type</th>
            <th className="border border-gray-400 px-2 py-1 text-left text-xs font-bold" style={{width: '80px'}}>Sport</th>
            <th className="border border-gray-400 px-2 py-1 text-left text-xs font-bold" style={{minWidth: '300px'}}>Moveframe description</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '60px'}}>Rip</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '60px'}}>Metri</th>
            <th 
              className="border border-gray-400 px-2 py-1 text-center text-xs font-bold sticky right-0 bg-purple-300 z-20"
              style={{minWidth: '120px'}}
            >
              Option
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-purple-100">
            <td className="border border-gray-300 px-2 py-2 text-sm font-bold text-center">{moveframe.letter || moveframe.code || 'A'}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-center">
              <span style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: moveframe.section?.color || moveframe.color || '#10b981',
                border: '1px solid #666'
              }}></span>
            </td>
            <td className="border border-gray-300 px-2 py-2 text-sm">{moveframe.section?.name || moveframe.type || 'Warm up'}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm">{moveframe.sport || 'Swim'}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm">{moveframe.description || '100s * 10 A2 R20*'}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-center">{moveframe.movelaps?.length || '0'}</td>
            <td className="border border-gray-300 px-2 py-2 text-sm text-right">
              {(moveframe.movelaps || []).reduce((sum: number, lap: any) => sum + (parseInt(lap.distance) || 0), 0)}
            </td>
            
            {/* Sticky Options Column */}
            <td className="border border-gray-300 px-1 py-2 sticky right-0 bg-purple-50 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
              <div className="flex gap-1 justify-center items-center">
                <button
                  onClick={onEdit}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="Edit moveframe"
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
                  title="Delete moveframe"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

