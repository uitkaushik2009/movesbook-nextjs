import React from 'react';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MovelapDetailTable from './MovelapDetailTable';
import { getSportIcon, isImageIcon } from '@/utils/sportIcons';
import { useSportIconType } from '@/hooks/useSportIconType';

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
  onAddMoveframeAfter?: (moveframe: any, index: number, workout: any, day: any) => void;
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
  onAddMoveframeAfter,
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
    zIndex: isDragging ? 9999 : 1,
    position: 'relative' as const,
    cursor: isDragging ? 'grabbing' : 'auto',
  };
  
  // Get icon type preference
  const { iconType } = useSportIconType();
  const useImageIcons = isImageIcon(iconType);
  
  const movelapsCount = moveframe.movelaps?.length || 0;
  const totalDistance = (moveframe.movelaps || []).reduce(
    (sum: number, lap: any) => sum + (parseInt(lap.distance) || 0),
    0
  );
  const sectionColor = moveframe.section?.color || '#5b8def';
  const sectionName = moveframe.section?.name || 'Default';
  const sportIcon = getSportIcon(moveframe.sport || 'SWIM', iconType);
  const sportName = moveframe.sport?.replace(/_/g, ' ') || 'Unknown';
  
  // Parse annotation colors from notes if type is ANNOTATION
  let annotationColors = null;
  if (moveframe.type === 'ANNOTATION' && moveframe.notes) {
    try {
      // Only parse if notes looks like JSON (starts with '{')
      if (typeof moveframe.notes === 'string' && moveframe.notes.trim().startsWith('{')) {
        annotationColors = JSON.parse(moveframe.notes);
      }
    } catch (e) {
      // Silently fail for malformed JSON - use default colors
      annotationColors = null;
    }
  }
  
  // Calculate macro time (total time for all movelaps)
  const macroTime = (moveframe.movelaps || []).reduce((sum: number, lap: any) => {
    const time = lap.estimatedTime || lap.time || 0;
    return sum + (typeof time === 'string' ? parseFloat(time) : time);
  }, 0);
  
  const formatMacroTime = (seconds: number) => {
    if (!seconds || seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}'${secs.toString().padStart(2, '0')}"`;
  };
  
  return (
    <React.Fragment key={moveframe.id}>
      <tr 
        ref={setNodeRef}
        style={{
          ...style,
          ...(annotationColors ? {
            backgroundColor: annotationColors.headerBgColor || '#5168c2',
            color: annotationColors.textBgColor || '#ffffff'
          } : {})
        }}
        className={annotationColors ? '' : 'hover:bg-purple-50'}
        title="Click expand button to show/hide movelaps, Double-click moveframe to edit"
      >
        {/* Drag Handle Column */}
        <td className="border border-gray-200 px-1 py-1 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            {...attributes}
            {...listeners}
            className="cursor-move text-gray-400 hover:text-gray-600 inline-flex items-center justify-center select-none"
            style={{ touchAction: 'none' }}
            title="Drag to reorder moveframe"
          >
            <GripVertical size={14} />
          </div>
        </td>
        
        {/* Expand/Collapse Column */}
        <td className="border border-gray-200 px-1 py-1 text-center text-gray-600 text-[10px] cursor-pointer"
          onClick={onToggleExpand}
        >
          <span className="font-bold">{isMovelapsExpanded ? '▼' : '►'}</span>
        </td>
        
        {/* Index Column */}
        <td className="border border-gray-200 px-1 py-1 text-center font-bold text-xs">
          {mfIndex + 1}
        </td>
        
        {/* MF Letter Column - Always shows alphabetical letter */}
        <td className="border border-gray-200 px-1 py-1 text-center font-bold text-xs cursor-pointer"
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (onEditMoveframe) onEditMoveframe(moveframe);
          }}
        >
          {moveframe.letter || String.fromCharCode(65 + mfIndex)}
        </td>
        
        {/* Workout Section Column - Shows color + section name */}
        <td className="border border-gray-200 px-1 py-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <div
              className="w-4 h-4 rounded border border-gray-400 flex-shrink-0"
              style={{ backgroundColor: sectionColor }}
              title={sectionName}
            />
            <span className="text-[10px] truncate">{sectionName}</span>
          </div>
        </td>
        
        {/* Ico Column */}
        <td className="border border-gray-200 px-1 py-1 text-center">
          {useImageIcons ? (
            <img 
              src={sportIcon} 
              alt={sportName} 
              className="w-5 h-5 object-cover rounded mx-auto" 
            />
          ) : (
            <span className="text-base">{sportIcon}</span>
          )}
        </td>
        
        {/* Sport of the moveframe Column - Shows icon + sport name, left-aligned */}
        <td className="border border-gray-200 px-1 py-1 text-left">
          <div className="flex items-center gap-1">
            {useImageIcons ? (
              <img 
                src={sportIcon} 
                alt={sportName} 
                className="w-4 h-4 object-cover rounded flex-shrink-0" 
              />
            ) : (
              <span className="text-sm">{sportIcon}</span>
            )}
            <span className="text-[10px]">{sportName}</span>
          </div>
        </td>
        
        {/* Moveframe Description Column */}
        <td className="border border-gray-200 px-1 py-1 text-center text-[10px]">
          {moveframe.description && moveframe.description.includes('<') ? (
            <div dangerouslySetInnerHTML={{ __html: moveframe.description }} />
          ) : (
            moveframe.description || 'No description'
          )}
        </td>
        
        {/* Rip (Repetitions) Column */}
        <td className="border border-gray-200 px-1 py-1 text-center text-red-600 font-semibold text-xs">
          {movelapsCount}
        </td>
        
        {/* Macro Column */}
        <td className="border border-gray-200 px-1 py-1 text-center font-semibold text-xs">
          {moveframe.macroFinal || formatMacroTime(macroTime)}
        </td>
        
        {/* Alarm & Sound Column */}
        <td className="border border-gray-200 px-1 py-1 text-center text-[10px]">
          {moveframe.alarm ? `${moveframe.alarm}🔔` : '-'}
        </td>
        
        {/* Options Column */}
        <td className="border border-gray-200 px-1 py-1 text-center">
          <div className="flex items-center justify-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onAddMoveframeAfter) {
                  onAddMoveframeAfter(moveframe, mfIndex, workout, day);
                }
              }}
              className="px-2 py-1 text-[10px] bg-emerald-500 text-white rounded hover:bg-emerald-600 cursor-pointer"
              title="Add a new moveframe after this one"
            >
              Add MF
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEditMoveframe) onEditMoveframe(moveframe);
              }}
              className="px-2 py-1 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600"
              title="Edit this moveframe"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMoveframe(moveframe);
                setShowInfoPanel(true);
              }}
              className="px-2 py-1 text-[10px] bg-indigo-500 text-white rounded hover:bg-indigo-600"
              title="View moveframe info"
            >
              MF Info
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onCopyMoveframe) onCopyMoveframe(moveframe, workout, day);
              }}
              className="px-2 py-1 text-[10px] bg-green-500 text-white rounded hover:bg-green-600"
              title="Copy this moveframe"
            >
              Copy
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onMoveMoveframe) onMoveMoveframe(moveframe, workout, day);
              }}
              className="px-2 py-1 text-[10px] bg-orange-500 text-white rounded hover:bg-orange-600"
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
              className="px-2 py-1 text-[10px] bg-red-500 text-white rounded hover:bg-red-600"
              title="Delete this moveframe"
            >
              Delete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Save functionality can be added here if needed
                alert('Save functionality - to be implemented');
              }}
              className="px-2 py-1 text-[10px] bg-purple-500 text-white rounded hover:bg-purple-600"
              title="Save changes"
            >
              Save
            </button>
          </div>
        </td>
      </tr>
      
      {/* Movelaps Detail Table - Level 3: Indented from moveframe table */}
      {isMovelapsExpanded && (
        <tr>
          <td colSpan={12} className="border border-gray-200 p-0 bg-gray-50">
            <div className="pl-8">
              <MovelapDetailTable 
                moveframe={moveframe}
                onEditMovelap={(movelap) => onEditMovelap?.(movelap, moveframe)}
                onDeleteMovelap={(movelap) => onDeleteMovelap?.(movelap, moveframe)}
                onAddMovelap={() => onAddMovelap?.(moveframe)}
              />
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

