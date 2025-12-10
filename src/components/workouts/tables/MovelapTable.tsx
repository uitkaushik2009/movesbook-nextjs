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
      case 'section_name':
        return moveframe.section?.name || 'No Section';
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
      <div className="mb-2 ml-8">
        <table className="border-collapse bg-white shadow-sm text-sm" style={{ tableLayout: 'fixed', width: '1000px' }}>
          {/* Title Row */}
          <thead className="bg-yellow-200">
            <tr>
              <th colSpan={visibleColumnCount + 1} className="border border-gray-200 px-2 py-1 text-left text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      Movelaps of the moveframe {moveframeCode} of workout #{workoutIndex + 1}
                    </span>
                    <span className="text-yellow-700 text-sm">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs">Options:</span>
                    <div className="flex gap-1">
                      <button className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                        Copy
                      </button>
                      <button className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                        Clear
                      </button>
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-300 hover:bg-yellow-400 rounded"
                    title="Configure columns"
                  >
                    <Settings size={14} />
                    Columns
                  </button>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
            {/* Column Headers */}
            <tr className="bg-yellow-300">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className="border border-gray-200 px-1 py-1 text-xs font-bold text-center"
                  style={{ 
                    width: column.id === 'annotation' ? '150px' : column.id === 'mf' ? '40px' : '65px'
                  }}
                >
                  {column.label}
                </th>
              ))}
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
                    className={`border border-gray-200 px-1 py-1 text-xs text-center overflow-hidden ${
                      column.id === 'mf' ? 'font-bold' : ''
                    }`}
                    style={{ 
                      width: column.id === 'annotation' ? '150px' : column.id === 'mf' ? '40px' : '65px'
                    }}
                  >
                    <div className={column.id === 'annotation' ? 'truncate' : ''} title={String(getCellValue(column, movelap))}>
                      {getCellValue(column, movelap)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={visibleColumnCount + 1} className="border-t border-gray-300 px-2 py-1">
                <button
                  onClick={onAddMovelap}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  + Add row
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

