import React from 'react';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import MovelapDetailTable from './MovelapDetailTable';
import { getSportIcon, isImageIcon } from '@/utils/sportIcons';
import { useSportIconType } from '@/hooks/useSportIconType';

interface SortableMoveframeRowProps {
  moveframe: any;
  mfIndex: number;
  isMovelapsExpanded: boolean;
  isChecked: boolean;
  onToggleCheck: () => void;
  onToggleExpand: () => void;
  onEditMoveframe?: (moveframe: any) => void;
  onDeleteMoveframe?: (moveframe: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any) => void;
  onAddMovelap?: (moveframe: any) => void;
  onAddMovelapAfter?: (movelap: any, index: number, moveframe: any, workout: any, day: any) => void;
  onAddMoveframeAfter?: (moveframe: any, index: number, workout: any, day: any) => void;
  onCopyMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onMoveMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onSetWorkType?: (moveframe: any) => void;
  workout: any;
  day: any;
  setShowInfoPanel: (show: boolean) => void;
  setSelectedMoveframe: (moveframe: any) => void;
  orderedVisibleColumns?: string[];
}

export default function SortableMoveframeRow({
  moveframe,
  mfIndex,
  isMovelapsExpanded,
  isChecked,
  onToggleCheck,
  onToggleExpand,
  onEditMoveframe,
  onDeleteMoveframe,
  onEditMovelap,
  onDeleteMovelap,
  onAddMovelap,
  onAddMovelapAfter,
  onAddMoveframeAfter,
  onCopyMoveframe,
  onMoveMoveframe,
  onSetWorkType,
  workout,
  day,
  setShowInfoPanel,
  setSelectedMoveframe,
  orderedVisibleColumns
}: SortableMoveframeRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: moveframe.id,
    data: {
      type: 'moveframe',
      moveframe: moveframe,
      workout: workout,
      day: day
    }
  });
  
  // Droppable for receiving other moveframes
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
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : 1,
    position: 'relative' as const,
    cursor: isDragging ? 'grabbing' : 'auto',
  };
  
  // Get icon type preference
  const iconType = useSportIconType();
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
  
  // Get annotation colors (if set)
  const hasAnnotation = moveframe.annotationBgColor || moveframe.annotationTextColor;
  const annotationBgColor = moveframe.annotationBgColor || null;
  const annotationTextColor = moveframe.annotationTextColor || null;
  
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

  // Default column order if not provided
  const visibleColumns = orderedVisibleColumns || ['checkbox', 'drag', 'expand', 'index', 'mf', 'section', 'icon', 'sport', 'description', 'rip', 'macro', 'alarm', 'annotation', 'options'];

  // Render individual cells based on column ID
  const renderCell = (columnId: string) => {
    switch (columnId) {
      case 'checkbox':
        return (
          <td key="checkbox" className="border border-gray-200 px-1 py-1 text-center" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={onToggleCheck}
              className="w-4 h-4 cursor-pointer accent-purple-600"
              title="Select moveframe"
            />
          </td>
        );
      
      case 'drag':
        return (
          <td key="drag" className="border border-gray-200 px-1 py-1 text-center" onClick={(e) => e.stopPropagation()}>
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-700 hover:bg-gray-100 inline-flex items-center justify-center w-8 h-8 rounded select-none transition-colors"
              style={{ touchAction: 'none' }}
              title="Drag to reorder moveframe"
              type="button"
            >
              <GripVertical size={18} />
            </button>
          </td>
        );
      
      case 'expand':
        return (
          <td key="expand" className="border border-gray-200 px-1 py-1 text-center text-gray-600 text-[10px] cursor-pointer" onClick={onToggleExpand}>
            <span className="font-bold">{isMovelapsExpanded ? '▼' : '►'}</span>
          </td>
        );
      
      case 'index':
        return (
          <td key="index" className="border border-gray-200 px-1 py-1 text-center font-bold text-xs">
            {mfIndex + 1}
          </td>
        );
      
      case 'color':
        return (
          <td key="color" className="border border-gray-200 px-1 py-1 text-center">
            <div
              className="w-6 h-4 mx-auto rounded border border-gray-400"
              style={{ backgroundColor: sectionColor }}
              title={sectionName}
            />
          </td>
        );
      
      case 'code_section':
        return (
          <td key="code_section" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.section?.name || 'Default'}
          </td>
        );
      
      case 'action':
        return (
          <td key="action" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.sport || 'SWIM'}
          </td>
        );
      
      case 'dist':
        return (
          <td key="dist" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.type === 'ANNOTATION' ? '—' : (moveframe.movelaps?.[0]?.distance || moveframe.customDistance || '—')}
          </td>
        );
      
      case 'style':
        return (
          <td key="style" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.type === 'ANNOTATION' ? '—' : (moveframe.movelaps?.[0]?.style || moveframe.style || '—')}
          </td>
        );
      
      case 'speed':
        return (
          <td key="speed" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.type === 'ANNOTATION' ? '—' : (moveframe.movelaps?.[0]?.speed || moveframe.speed || '—')}
          </td>
        );
      
      case 'time':
        return (
          <td key="time" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.type === 'ANNOTATION' ? '—' : (moveframe.movelaps?.[0]?.time || moveframe.time || '—')}
          </td>
        );
      
      case 'pace':
        return (
          <td key="pace" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.type === 'ANNOTATION' ? '—' : (moveframe.movelaps?.[0]?.pace || moveframe.pace || '—')}
          </td>
        );
      
      case 'rec':
        return (
          <td key="rec" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.type === 'ANNOTATION' ? '—' : (moveframe.pause ? `${moveframe.pause}"` : '—')}
          </td>
        );
      
      case 'rest_to':
        return (
          <td key="rest_to" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.type === 'ANNOTATION' ? '—' : (moveframe.restTo || '—')}
          </td>
        );
      
      case 'aim_snd':
        return (
          <td key="aim_snd" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.type === 'ANNOTATION' ? '—' : (moveframe.alarm || moveframe.sound ? '🔔' : '—')}
          </td>
        );
      
      case 'annotations':
        return (
          <td 
            key="annotations" 
            className="border border-gray-200 px-1 py-1 text-center text-[10px]"
            style={{
              backgroundColor: moveframe.annotationBgColor || 'transparent',
              color: moveframe.annotationTextColor || 'inherit'
            }}
          >
            {moveframe.annotationText || '—'}
          </td>
        );
      
      case 'mf':
        const workTypeColor = moveframe.workType === 'MAIN' ? 'text-red-600' : moveframe.workType === 'SECONDARY' ? 'text-blue-600' : '';
        return (
          <td 
            key="mf" 
            className={`border border-gray-200 px-1 py-1 text-center font-bold text-xs cursor-pointer hover:bg-blue-100 transition-colors ${workTypeColor}`}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onSetWorkType) {
                onSetWorkType(moveframe);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            title="Double-click to set work type (Main/Secondary)"
          >
            {moveframe.letter || String.fromCharCode(65 + mfIndex)}
          </td>
        );
      
      case 'section':
        return (
          <td key="section" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            <div className="flex items-center justify-center gap-1">
              <div
                className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"
                style={{ backgroundColor: sectionColor }}
                title={`Section: ${sectionName}`}
              />
              <span className="text-[10px]">{sectionName}</span>
            </div>
          </td>
        );
      
      case 'sport':
        return (
          <td key="sport" className="border border-gray-200 px-1 py-1 text-left">
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
        );
      
      case 'description':
        return (
          <td 
            key="description" 
            className={`border border-gray-200 px-1 py-1 text-center text-[10px] ${
              moveframe.type === 'ANNOTATION' && moveframe.annotationBold ? 'font-bold' : ''
            }`}
            style={
              moveframe.type === 'ANNOTATION' 
                ? {
                    backgroundColor: moveframe.annotationBgColor || 'transparent',
                    color: moveframe.annotationTextColor || 'inherit'
                  }
                : {}
            }
          >
            {moveframe.description && moveframe.description.includes('<') ? (
              <div dangerouslySetInnerHTML={{ __html: moveframe.description }} />
            ) : (
              moveframe.description || moveframe.annotationText || 'No description'
            )}
          </td>
        );
      
      case 'rip':
        return (
          <td key="rip" className="border border-gray-200 px-1 py-1 text-center text-red-600 font-semibold text-xs">
            {moveframe.type === 'ANNOTATION' ? '—' : movelapsCount}
          </td>
        );
      
      case 'macro':
        return (
          <td key="macro" className="border border-gray-200 px-1 py-1 text-center font-semibold text-xs">
            {moveframe.type === 'ANNOTATION' ? '—' : (moveframe.macroFinal || formatMacroTime(macroTime))}
          </td>
        );
      
      case 'alarm':
        return (
          <td key="alarm" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            {moveframe.type === 'ANNOTATION' ? '—' : (moveframe.alarm ? (
              <span>{moveframe.alarm} 🔔</span>
            ) : (
              <span>-</span>
            ))}
          </td>
        );
      
      case 'annotation':
        return (
          <td 
            key="annotation" 
            className="border border-gray-200 px-1 py-1 text-center text-[10px]"
            style={{
              backgroundColor: moveframe.annotationBgColor || 'transparent',
              color: moveframe.annotationTextColor || 'inherit'
            }}
            title={moveframe.annotationText || 'No annotation'}
          >
            {moveframe.annotationText ? (
              <div className="truncate max-w-[120px]" title={moveframe.annotationText}>
                {moveframe.annotationText}
              </div>
            ) : '—'}
          </td>
        );
      
      case 'options':
        return (
          <td key="options" className="border border-gray-200 px-1 py-1 text-center">
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
        );
      
      default:
        return null;
    }
  };
  
  // Combine both refs
  const combineRefs = (el: HTMLTableRowElement | null) => {
    setNodeRef(el);
    setDropNodeRef(el);
  };

  return (
    <React.Fragment key={moveframe.id}>
      <tr 
        ref={combineRefs}
        style={{
          ...style,
          ...(annotationBgColor ? {
            backgroundColor: annotationBgColor
          } : {}),
          ...(annotationTextColor ? {
            color: annotationTextColor
          } : {})
        }}
        className={`
          ${hasAnnotation ? '' : 'hover:bg-purple-50'}
          ${isDropOver ? 'ring-4 ring-green-400 ring-opacity-75' : ''}
          transition-colors duration-150 isolate relative z-10
        `}
        title="Click expand button to show/hide movelaps, Double-click moveframe to edit, Drag to reorder or move"
      >
        {visibleColumns.map(columnId => renderCell(columnId))}
      </tr>
      
      {/* Movelaps Detail Table - Level 3: Indented from moveframe table */}
      {isMovelapsExpanded && (
        <tr className="isolate">
          <td colSpan={visibleColumns.length} className="border border-gray-200 p-0 bg-gray-50 isolate">
            <div className="pl-8 isolate">
              <MovelapDetailTable 
                moveframe={moveframe}
                onEditMovelap={(movelap) => onEditMovelap?.(movelap, moveframe)}
                onDeleteMovelap={(movelap) => onDeleteMovelap?.(movelap, moveframe)}
                onAddMovelap={() => onAddMovelap?.(moveframe)}
                onAddMovelapAfter={(movelap, index) => onAddMovelapAfter?.(movelap, index, moveframe, workout, day)}
              />
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

