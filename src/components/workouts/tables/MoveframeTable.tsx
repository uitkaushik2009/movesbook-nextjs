'use client';

import React from 'react';
import { Settings, GripVertical } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
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
  onAddMoveframe: () => void;
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
  onAddMoveframe,
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

  // Draggable hook for moveframe dragging
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDragNodeRef,
    isDragging,
    transform: dragTransform
  } = useDraggable({
    id: `moveframe-${moveframe.id}`,
    data: {
      type: 'moveframe',
      moveframe: moveframe,
      workout: workout,
      day: day
    }
  });

  // Droppable hook for dropping other moveframes before/after this one
  const {
    setNodeRef: setDropNodeRef,
    isOver: isDropOver
  } = useDroppable({
    id: `moveframe-drop-${moveframe.id}`,
    data: {
      type: 'moveframe',
      moveframe: moveframe,
      workout: workout,
      day: day
    }
  });

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
      <div className="mb-2 ml-4">
        <table className="w-full border-collapse bg-purple-50 shadow-sm text-xs">
          {/* Title Row */}
          <thead className="bg-purple-200">
            <tr>
              <th colSpan={visibleColumnCount + 1} className="border border-gray-300 px-2 py-1 text-left text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onToggleExpand}
                      className="text-purple-700 hover:bg-purple-300 rounded p-1"
                    >
                      {isExpanded ? '▼' : '►'}
                    </button>
                  <span className="font-bold text-xs">
                    Moveframes of workout #{workoutIndex + 1}
                  </span>
                  <span className="text-purple-700 ml-2 text-xs">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
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
                        Moveframe info
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
              {/* Drag Handle Header */}
              <th 
                className="border border-gray-300 px-1 py-1 text-center text-xs font-bold w-6"
                title="Drag handle"
              >
                ⋮⋮
              </th>
              
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
            <tr 
              ref={setDropNodeRef}
              className={`hover:bg-purple-100 cursor-pointer ${
                isDragging ? 'opacity-50 bg-purple-200' : ''
              } ${
                isDropOver ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''
              }`}
              onClick={onToggleExpand}
              title={isExpanded ? "Click to collapse movelaps" : "Click to expand movelaps | Drop moveframe here"}
            >
              {/* Drag Handle Cell */}
              <td className="border border-gray-300 px-1 py-1 text-center w-6">
                <span
                  ref={setDragNodeRef}
                  {...dragAttributes}
                  {...dragListeners}
                  className="cursor-move text-purple-600 hover:text-purple-800 transition-colors inline-block"
                  title="Drag to move moveframe"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical size={14} />
                </span>
              </td>
              
              {visibleColumns.map((column) => (
                <td
                  key={column.id}
                  className={`border border-gray-300 px-1 py-1 text-xs text-center ${
                    column.id === 'mf' ? 'font-bold' : ''
                  }`}
                >
                  {getCellValue(column)}
                </td>
              ))}
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

