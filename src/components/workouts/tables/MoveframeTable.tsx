'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { useTableColumns } from '@/hooks/useTableColumns';
import TableColumnConfig from '../TableColumnConfig';

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
  const {
    visibleColumns,
    visibleColumnCount,
    toggleColumn,
    resetToDefault,
    isConfigModalOpen,
    setIsConfigModalOpen,
    columns
  } = useTableColumns('moveframe');

  // Helper function to get cell value
  const getCellValue = (column: any) => {
    switch (column.id) {
      case 'mf':
        return moveframe.letter || moveframe.code || 'A';
      case 'color':
        return (
          <span style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: moveframe.section?.color || moveframe.color || '#10b981',
            border: '1px solid #666'
          }}></span>
        );
      case 'type':
        return moveframe.section?.name || moveframe.type || 'Warm up';
      case 'sport':
        return moveframe.sport || 'Swim';
      case 'description':
        return moveframe.description || '100s * 10 A2 R20*';
      case 'repetitions':
        return moveframe.movelaps?.length || '0';
      case 'total_distance':
        return (moveframe.movelaps || []).reduce((sum: number, lap: any) => sum + (parseInt(lap.distance) || 0), 0);
      case 'macro':
        return moveframe.macro || '—';
      case 'alarm':
        return moveframe.alarm || '—';
      case 'notes':
        return moveframe.notes || '';
      default:
        return '—';
    }
  };

  return (
    <>
      <div className="mb-4 ml-8">
        <table className="w-full border-collapse bg-purple-50 shadow-sm">
          {/* Title Row */}
          <thead className="bg-purple-200">
            <tr>
              <th colSpan={visibleColumnCount + 1} className="border border-gray-400 px-3 py-2 text-left text-sm">
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
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-300 hover:bg-purple-400 rounded"
                    title="Configure columns"
                  >
                    <Settings size={14} />
                    Columns
                  </button>
                </div>
              </th>
            </tr>
            {/* Column Headers */}
            <tr className="bg-purple-300">
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
                className="border border-gray-400 px-2 py-1 text-center text-xs font-bold sticky right-0 bg-purple-300 z-20"
                style={{minWidth: '120px'}}
              >
                Option
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              className="hover:bg-purple-100 cursor-pointer"
              onClick={onToggleExpand}
              title={isExpanded ? "Click to collapse movelaps" : "Click to expand movelaps"}
            >
              {visibleColumns.map((column) => (
                <td
                  key={column.id}
                  className={`border border-gray-300 px-2 py-2 text-sm ${
                    column.id === 'mf' ? 'font-bold' : ''
                  } ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {getCellValue(column)}
                </td>
              ))}
              
              {/* Sticky Options Column */}
              <td 
                className="border border-gray-300 px-1 py-2 sticky right-0 bg-purple-50 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-1 justify-center items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    title="Edit moveframe"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      /* Show options dropdown */
                    }}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    title="Options"
                  >
                    Option
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
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

      {/* Column Configuration Modal */}
      <TableColumnConfig
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        columns={columns}
        onToggleColumn={toggleColumn}
        onResetToDefault={resetToDefault}
        tableTitle="Moveframe"
      />
    </>
  );
}

