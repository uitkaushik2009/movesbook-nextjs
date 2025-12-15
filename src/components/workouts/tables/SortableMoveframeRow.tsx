import React from 'react';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MovelapDetailTable from './MovelapDetailTable';

interface SortableMoveframeRowProps {
  moveframe: any;
  mfIndex: number;
  isMovelapsExpanded: boolean;
  onToggleExpand: () => void;
  onEditMoveframe?: (moveframe: any) => void;
  onDeleteMoveframe?: (moveframe: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any) => void;
  onAddMovelap?: (moveframe: any) => void;
  onCopyMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onMoveMoveframe?: (moveframe: any, workout: any, day: any) => void;
  workout: any;
  day: any;
  setShowInfoPanel: (show: boolean) => void;
  setSelectedMoveframe: (moveframe: any) => void;
}

export default function SortableMoveframeRow({
  moveframe,
  mfIndex,
  isMovelapsExpanded,
  onToggleExpand,
  onEditMoveframe,
  onDeleteMoveframe,
  onEditMovelap,
  onDeleteMovelap,
  onAddMovelap,
  onCopyMoveframe,
  onMoveMoveframe,
  workout,
  day,
  setShowInfoPanel,
  setSelectedMoveframe
}: SortableMoveframeRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: moveframe.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const movelapsCount = moveframe.movelaps?.length || 0;
  const totalDistance = (moveframe.movelaps || []).reduce(
    (sum: number, lap: any) => sum + (parseInt(lap.distance) || 0),
    0
  );
  const sectionColor = moveframe.section?.color || '#5b8def';
  const sectionName = moveframe.section?.name || 'Default';
  
  return (
    <React.Fragment key={moveframe.id}>
      <tr 
        ref={setNodeRef}
        style={style}
        className="hover:bg-purple-50"
        title="Click expand button to show/hide movelaps, Double-click moveframe to edit"
      >
        {/* Checkbox Column */}
        <td className="border border-gray-200 px-1 py-1 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="w-3 h-3 cursor-pointer"
            title="Select moveframe"
            onClick={(e) => e.stopPropagation()}
          />
        </td>
        
        {/* Drag Handle Column */}
        <td className="border border-gray-200 px-1 py-1 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            {...attributes}
            {...listeners}
            className="cursor-move text-gray-400 hover:text-gray-600 inline-block"
            title="Drag to reorder moveframe"
          >
            <GripVertical size={12} />
          </span>
        </td>
        
        {/* Expand/Collapse Column */}
        <td className="border border-gray-200 px-1 py-1 text-center text-gray-600 text-[10px] cursor-pointer"
          onClick={onToggleExpand}
        >
          <span className="font-bold">{isMovelapsExpanded ? '▼' : '►'}</span>
        </td>
        
        {/* Letter Column - Always shows alphabetical letter */}
        <td className="border border-gray-200 px-1 py-1 text-center font-bold text-xs cursor-pointer"
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (onEditMoveframe) onEditMoveframe(moveframe);
          }}
        >
          {moveframe.letter || String.fromCharCode(65 + mfIndex)}
        </td>
        
        {/* Color Column */}
        <td className="border border-gray-200 px-1 py-1 text-center">
          <div
            className="w-6 h-6 mx-auto rounded"
            style={{ backgroundColor: sectionColor }}
            title={sectionName}
          />
        </td>
        
        {/* Type Column */}
        <td className="border border-gray-200 px-1 py-1 text-center text-[10px]">
          {sectionName}
        </td>
        
        {/* Sport Column */}
        <td className="border border-gray-200 px-1 py-1 text-center text-[10px]">
          {moveframe.sport?.replace(/_/g, ' ') || 'Unknown'}
        </td>
        
        {/* Description Column */}
        <td className="border border-gray-200 px-1 py-1 text-[10px]">
          {moveframe.description || 'No description'}
        </td>
        
        {/* Repetitions Column */}
        <td className="border border-gray-200 px-1 py-1 text-center text-red-600 font-semibold text-xs">
          {movelapsCount}
        </td>
        
        {/* Distance Column */}
        <td className="border border-gray-200 px-1 py-1 text-center font-semibold text-xs">
          {totalDistance}
        </td>
        
        {/* Actions Column */}
        <td className="border border-gray-200 px-1 py-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMoveframe(moveframe);
                setShowInfoPanel(true);
              }}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
              title="View moveframe info"
            >
              MF info
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onCopyMoveframe) onCopyMoveframe(moveframe, workout, day);
              }}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 font-medium"
              title="Copy this moveframe"
            >
              Copy
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onMoveMoveframe) onMoveMoveframe(moveframe, workout, day);
              }}
              className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 font-medium"
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
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 font-medium"
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
          <td colSpan={11} className="border border-gray-200 p-0">
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
}

