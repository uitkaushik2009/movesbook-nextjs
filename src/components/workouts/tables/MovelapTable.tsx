'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { useTableColumns } from '@/hooks/useTableColumns';
import TableColumnConfig from '../TableColumnConfig';

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
  const {
    visibleColumns,
    visibleColumnCount,
    toggleColumn,
    resetToDefault,
    isConfigModalOpen,
    setIsConfigModalOpen,
    columns
  } = useTableColumns('movelap');

  // Helper function to get cell value
  const getCellValue = (column: any, movelap: any) => {
    switch (column.id) {
      case 'mf':
        return moveframeCode;
      case 'color':
        return (
          <span style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: moveframe.section?.color || moveframe.color || '#10b981',
            border: '1px solid #666'
          }}></span>
        );
      case 'workout_type':
        return moveframe.section?.name || moveframe.type || 'Warm up';
      case 'sport':
        return moveframe.sport || 'Swim';
      case 'distance':
        return movelap.distance || '0';
      case 'style':
        return movelap.style || '—';
      case 'speed':
        return movelap.speed || '—';
      case 'time':
        return movelap.time || '—';
      case 'pace':
        return movelap.pace || '—';
      case 'rec':
        return movelap.pause || '—';
      case 'rest_to':
        return movelap.restType || '—';
      case 'aim_sound':
        return movelap.alarm ? `Alarm ${movelap.alarm}` : movelap.sound || '—';
      case 'annotation':
        return movelap.notes || '';
      case 'heartrate':
        return movelap.heartRate || '—';
      case 'calories':
        return movelap.calories || '—';
      default:
        return '—';
    }
  };

  return (
    <>
      <div className="mb-4 ml-16">
        <table className="w-full border-collapse bg-white shadow-sm">
          {/* Title Row */}
          <thead className="bg-yellow-200">
            <tr>
              <th colSpan={visibleColumnCount + 1} className="border border-gray-400 px-3 py-2 text-left text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      Movelaps of the moveframe {moveframeCode} of workout #{workoutIndex + 1}
                    </span>
                    <span className="text-yellow-700">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Movelaps options:</span>
                    <div className="flex gap-1">
                      <button className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                        Copy All
                      </button>
                      <button className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-300 hover:bg-yellow-400 rounded"
                    title="Configure columns"
                  >
                    <Settings size={14} />
                    Columns
                  </button>
                </div>
              </th>
            </tr>
            {/* Column Headers */}
            <tr className="bg-yellow-300">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`border border-gray-400 px-2 py-1 text-xs font-bold ${
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
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className={`border border-gray-300 px-2 py-1.5 text-xs ${
                      column.id === 'mf' ? 'font-bold' : ''
                    } ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {getCellValue(column, movelap)}
                  </td>
                ))}
                
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
              <td colSpan={visibleColumnCount + 1} className="border-t-2 border-gray-400 px-2 py-2">
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

      {/* Column Configuration Modal */}
      <TableColumnConfig
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        columns={columns}
        onToggleColumn={toggleColumn}
        onResetToDefault={resetToDefault}
        tableTitle="Movelap"
      />
    </>
  );
}

