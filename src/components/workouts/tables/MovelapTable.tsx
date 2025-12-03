'use client';

import React from 'react';

interface MovelapTableProps {
  day: any;
  workout: any;
  moveframe: any;
  movelaps: any[];
  workoutIndex: number;
  moveframeCode: string;
  onEditMovelap: (movelap: any) => void;
  onDeleteMovelap: (movelap: any) => void;
  onAddMovelap: () => void;
}

export default function MovelapTable({
  day,
  workout,
  moveframe,
  movelaps,
  workoutIndex,
  moveframeCode,
  onEditMovelap,
  onDeleteMovelap,
  onAddMovelap
}: MovelapTableProps) {
  return (
    <div className="mb-4 ml-16">
      <table className="w-full border-collapse bg-white shadow-sm">
        {/* Title Row */}
        <thead className="bg-yellow-200">
          <tr>
            <th colSpan={14} className="border border-gray-400 px-3 py-2 text-left text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  Movelaps of the moveframe {moveframeCode} of workout #{workoutIndex + 1}
                </span>
                <span className="text-yellow-700">
                  {workout.dayName || 'Monday'}
                </span>
                <span className="font-bold ml-4">Movelaps options:</span>
                <span className="text-yellow-700">
                  &lt; put here the text buttons of the movelaps options, I will send later &gt;
                </span>
              </div>
            </th>
          </tr>
          {/* Column Headers */}
          <tr className="bg-yellow-300">
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '40px'}}>MF</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '60px'}}>Color</th>
            <th className="border border-gray-400 px-2 py-1 text-left text-xs font-bold" style={{width: '100px'}}>Workout type</th>
            <th className="border border-gray-400 px-2 py-1 text-left text-xs font-bold" style={{width: '80px'}}>Sport</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '80px'}}>Distance</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '80px'}}>Style</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '60px'}}>Speed</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '60px'}}>Time</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '60px'}}>Pace</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '60px'}}>Rec</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '80px'}}>Rest To</th>
            <th className="border border-gray-400 px-2 py-1 text-center text-xs font-bold" style={{width: '100px'}}>Aim Sound</th>
            <th className="border border-gray-400 px-2 py-1 text-left text-xs font-bold" style={{minWidth: '150px'}}>Annotation</th>
            <th 
              className="border border-gray-400 px-2 py-1 text-center text-xs font-bold sticky right-0 bg-yellow-300 z-20"
              style={{minWidth: '120px'}}
            >
              Option
            </th>
          </tr>
        </thead>
        <tbody>
          {movelaps.map((movelap, index) => (
            <tr 
              key={movelap.id || index} 
              className={`hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <td className="border border-gray-300 px-2 py-1.5 text-sm font-bold text-center">{moveframeCode}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-sm text-center">
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: moveframe.section?.color || moveframe.color || '#10b981',
                  border: '1px solid #666'
                }}></span>
              </td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs">{moveframe.section?.name || moveframe.type || 'Warm up'}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs">{moveframe.sport || 'Swim'}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-right">{movelap.distance || '0'}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-center">{movelap.style || '—'}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-center">{movelap.speed || '—'}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-right">{movelap.time || '—'}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-right">{movelap.pace || '—'}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-center">{movelap.pause || '—'}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-center">{movelap.restType || '—'}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs text-center">{movelap.alarm ? `Alarm ${movelap.alarm}` : movelap.sound || '—'}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-xs">{movelap.notes || ''}</td>
              
              {/* Sticky Options Column */}
              <td className="border border-gray-300 px-1 py-1.5 sticky right-0 bg-white z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                <div className="flex gap-1 justify-center items-center">
                  <button
                    onClick={() => onEditMovelap(movelap)}
                    className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    title="Edit movelap"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {/* Show options dropdown */}}
                    className="px-2 py-0.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    title="Options"
                  >
                    Option
                  </button>
                  <button
                    onClick={() => onDeleteMovelap(movelap)}
                    className="px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    title="Delete movelap"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={14} className="border-t-2 border-gray-400 px-2 py-2">
              <button
                onClick={onAddMovelap}
                className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                + Add new row
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

