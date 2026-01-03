import React from 'react';
import ReactDOM from 'react-dom';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import MovelapDetailTable from './MovelapDetailTable';
import { getSportIcon, isImageIcon } from '@/utils/sportIcons';
import { useSportIconType } from '@/hooks/useSportIconType';
import { getSportDisplayName } from '@/constants/moveframe.constants';

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
  onRefresh?: () => void;
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
  onRefresh,
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
  
  // Debug: Log movelaps count to verify updates
  React.useEffect(() => {
    console.log(`🔢 Moveframe ${moveframe.letter} - Rip count: ${movelapsCount}, Movelaps:`, moveframe.movelaps);
  }, [moveframe.movelaps, movelapsCount, moveframe.letter]);
  const sectionColor = moveframe.section?.color || '#5b8def';
  const sectionName = moveframe.section?.name || 'Default';
  const sportIcon = getSportIcon(moveframe.sport || 'SWIM', iconType);
  const sportName = getSportDisplayName(moveframe.sport || 'SWIM');
  
  // Get annotation colors (if set)
  const hasAnnotation = moveframe.annotationBgColor || moveframe.annotationTextColor;
  const annotationBgColor = moveframe.annotationBgColor || null;
  const annotationTextColor = moveframe.annotationTextColor || null;

  // Hover popup state for moveframe letter
  const [hoveredMoveframe, setHoveredMoveframe] = React.useState<any>(null);
  const [popupPosition, setPopupPosition] = React.useState<{ x: number; y: number } | null>(null);
  
  // Manual content popup state
  const [showManualPopup, setShowManualPopup] = React.useState(false);
  const [manualPopupContent, setManualPopupContent] = React.useState('');
  
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
  const visibleColumns = orderedVisibleColumns || ['checkbox', 'drag', 'expand', 'index', 'mf', 'section', 'icon', 'sport', 'description', 'duration', 'rip', 'macro', 'alarm', 'annotation', 'options'];

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
            {getSportDisplayName(moveframe.sport || 'SWIM')}
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
        // Colored circle around letter based on work type
        const getWorkTypeStyle = () => {
          if (moveframe.workType === 'MAIN') {
            return 'border-2 border-red-500 bg-red-50 text-red-700';
          } else if (moveframe.workType === 'SECONDARY') {
            return 'border-2 border-blue-500 bg-blue-50 text-blue-700';
          }
          return 'border border-gray-300';
        };
        
        const isMfManualMode = moveframe.manualMode === true;
        const mfHasHtmlContent = moveframe.description && moveframe.description.includes('<');
        
        return (
          <td 
            key="mf" 
            className="border border-gray-200 px-1 py-1 text-center cursor-pointer hover:bg-blue-100 transition-colors"
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Set work type on double click (for all moveframes)
              if (onSetWorkType) {
                onSetWorkType(moveframe);
              }
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredMoveframe(moveframe);
              setPopupPosition({ x: rect.left + rect.width / 2, y: rect.top });
            }}
            onMouseLeave={() => {
              setHoveredMoveframe(null);
              setPopupPosition(null);
            }}
            title="Double-click to set work type (Main/Secondary) | Hover to see full details"
          >
            <div 
              className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${getWorkTypeStyle()}`}
          >
            {moveframe.letter || String.fromCharCode(65 + mfIndex)}
            </div>
          </td>
        );
      
      case 'section':
        // Show day's period information (period name and color)
        const periodName = day?.period?.name || day?.periodName || 'No period';
        const periodColor = day?.period?.color || day?.periodColor || '#999999';
        return (
          <td key="section" className="border border-gray-200 px-1 py-1 text-center text-[10px]">
            <div className="flex items-center justify-center gap-1">
              <div
                className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"
                style={{ backgroundColor: periodColor }}
                title={`Period: ${periodName}`}
              />
              <span className="text-[10px]">{periodName}</span>
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
        // Check if this is a manual mode moveframe
        const isManualMode = moveframe.manualMode === true;
        const hasHtmlContent = moveframe.description && moveframe.description.includes('<');
        
        // Function to truncate HTML content to first 2 lines
        const getTruncatedPreview = (html: string) => {
          // Strip HTML tags for line counting
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          const text = tempDiv.textContent || tempDiv.innerText || '';
          const lines = text.split('\n').filter(line => line.trim());
          const preview = lines.slice(0, 2).join('\n');
          return preview || text.slice(0, 100) + (text.length > 100 ? '...' : '');
        };
        
        return (
          <td 
            key="description" 
            className={`border border-gray-200 px-1 py-1 text-center text-[10px] ${
              moveframe.type === 'ANNOTATION' && moveframe.annotationBold ? 'font-bold' : ''
            } ${isManualMode && hasHtmlContent ? 'cursor-pointer hover:bg-blue-50' : ''}`}
            style={
              moveframe.type === 'ANNOTATION' 
                ? {
                    backgroundColor: moveframe.annotationBgColor || 'transparent',
                    color: moveframe.annotationTextColor || 'inherit'
                  }
                : {}
            }
            onClick={(e) => {
              if (isManualMode && hasHtmlContent) {
                e.stopPropagation();
                setManualPopupContent(moveframe.description);
                setShowManualPopup(true);
              }
            }}
            title={isManualMode && hasHtmlContent ? "Click to view full content" : ""}
          >
            {isManualMode && hasHtmlContent ? (
              <div className="text-left line-clamp-2 text-xs">
                {getTruncatedPreview(moveframe.description)}
              </div>
            ) : hasHtmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: moveframe.description }} />
            ) : (
              moveframe.description || moveframe.annotationText || 'No description'
            )}
          </td>
        );
      
      case 'duration':
        // Calculate duration based on sport type
        const isSeriesBased = ['BODY_BUILDING', 'GYMNASTIC', 'CALISTHENICS', 'CROSSFIT', 'FUNCTIONAL'].includes(moveframe.sport || '');
        const isTimeBased = ['TREADMILL', 'ROLLER', 'CYCLETTE', 'ELLIPTICAL'].includes(moveframe.sport || '');
        
        let durationDisplay = '—';
        
        if (moveframe.type === 'ANNOTATION') {
          durationDisplay = '—';
        } else if (isSeriesBased) {
          // Show total series
          const totalSeries = moveframe.movelaps?.length || 0;
          durationDisplay = totalSeries > 0 ? `${totalSeries} ${totalSeries === 1 ? 'series' : 'series'}` : '—';
        } else if (isTimeBased) {
          // Show total time
          const totalTime = (moveframe.movelaps || []).reduce((sum: number, lap: any) => {
            if (lap.time) {
              // Parse time string like "7:00" to minutes
              const parts = lap.time.split(':');
              const minutes = parseInt(parts[0] || '0');
              const seconds = parseInt(parts[1] || '0');
              return sum + minutes + (seconds / 60);
            }
            return sum;
          }, 0);
          
          if (totalTime > 0) {
            const mins = Math.floor(totalTime);
            const secs = Math.round((totalTime - mins) * 60);
            durationDisplay = `${mins}'${secs.toString().padStart(2, '0')}"`;
          }
        } else {
          // Show total distance in meters
          durationDisplay = totalDistance > 0 ? `${totalDistance}m` : '—';
        }
        
        return (
          <td 
            key="duration" 
            className="border border-gray-200 px-1 py-1 text-center font-semibold text-xs"
            style={{
              backgroundColor: '#f9fafb',
              color: '#1f2937'
            }}
          >
            {durationDisplay}
          </td>
        );
      
      case 'rip':
        return (
          <td 
            key="rip" 
            className="rip-column border border-gray-200 px-1 py-1 text-center font-semibold text-xs"
            style={{
              backgroundColor: '#ffffff',
              color: moveframe.type === 'ANNOTATION' ? '#6b7280' : '#dc2626' // red-600 or gray-500
            }}
          >
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
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      alert('Please log in to save favorites');
                      return;
                    }

                    console.log(`📌 Toggling favorite for moveframe ${moveframe.id}:`, {
                      currentStatus: moveframe.favourite,
                      newStatus: !moveframe.favourite
                    });

                    const response = await fetch(`/api/workouts/moveframes/${moveframe.id}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        favourite: !moveframe.favourite
                      })
                    });

                    console.log(`📌 Save favorite response status: ${response.status}`);

                    if (response.ok) {
                      const data = await response.json();
                      console.log('✅ Moveframe favorite updated:', data);
                      alert(moveframe.favourite ? 'Removed from favorites!' : 'Saved to favorites!');
                      if (onRefresh) {
                        onRefresh();
                      }
                    } else {
                      const data = await response.json().catch(() => ({ error: 'Unknown error' }));
                      console.error('❌ Error response:', data);
                      alert(`Error: ${data.error || data.details || 'Failed to update favorite status'}`);
                    }
                  } catch (error: any) {
                    console.error('❌ Error saving to favorites:', error);
                    alert(`Failed to save to favorites: ${error.message}`);
                  }
                }}
                className={`px-2 py-1 text-[10px] text-white rounded transition-all ${
                  moveframe.favourite 
                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
                title={moveframe.favourite ? 'Remove from favorites' : 'Save to favorites'}
              >
                {moveframe.favourite ? '★ In Favs' : 'Save in Favs'}
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
                onRefresh={onRefresh}
              />
            </div>
          </td>
        </tr>
      )}

      {/* Hover Popup for Moveframe Letter */}
      {hoveredMoveframe && popupPosition && ReactDOM.createPortal(
        <div 
          className="fixed z-[9999] bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-4 max-w-md animate-fadeIn"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y - 10}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none'
          }}
        >
          <div className="text-xs space-y-2">
            {/* Moveframe Letter */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: hoveredMoveframe.section?.color || '#6366f1' }}
              >
                {hoveredMoveframe.letter || 'A'}
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">{hoveredMoveframe.sport || 'Unknown'}</div>
                <div className="text-xs text-gray-500">{hoveredMoveframe.section?.name || 'Section'}</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="font-semibold text-gray-700 mb-1">Description:</div>
              <div className="text-gray-900 bg-gray-50 p-2 rounded max-h-[150px] overflow-y-auto">
                {hoveredMoveframe.description ? (
                  <div dangerouslySetInnerHTML={{ __html: hoveredMoveframe.description }} />
                ) : (
                  'No description'
                )}
              </div>
            </div>

            {/* All Moveframe Details */}
            <div className="grid grid-cols-2 gap-2">
              {/* Repetitions */}
              {hoveredMoveframe.repetitions && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">Repetitions</span>
                  <span className="font-semibold text-blue-600">{hoveredMoveframe.repetitions}</span>
                </div>
              )}

              {/* Movelaps Count */}
              <div className="flex flex-col">
                <span className="text-gray-500 text-[10px]">Movelaps</span>
                <span className="font-semibold text-purple-600">
                  {hoveredMoveframe.movelaps?.length || 0}
                </span>
              </div>

              {/* Pause */}
              {hoveredMoveframe.pause && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">Pause</span>
                  <span className="font-semibold text-orange-600">{hoveredMoveframe.pause}</span>
                </div>
              )}

              {/* Macro Rest */}
              {hoveredMoveframe.macroRest && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">Macro Rest</span>
                  <span className="font-semibold text-orange-600">{hoveredMoveframe.macroRest}</span>
                </div>
              )}

              {/* Macro Final */}
              {hoveredMoveframe.macroFinal && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">Macro Final</span>
                  <span className="font-semibold text-green-600">{hoveredMoveframe.macroFinal}</span>
                </div>
              )}

              {/* Alarm */}
              {hoveredMoveframe.alarm && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">Alarm</span>
                  <span className="font-semibold text-red-600">{hoveredMoveframe.alarm}</span>
                </div>
              )}

              {/* Code */}
              {hoveredMoveframe.code && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">Code</span>
                  <span className="font-semibold text-gray-700 font-mono text-[10px]">{hoveredMoveframe.code}</span>
                </div>
              )}

              {/* Total Distance */}
              {hoveredMoveframe.totalDistance > 0 && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">Total Distance</span>
                  <span className="font-semibold text-blue-600">{hoveredMoveframe.totalDistance}m</span>
                </div>
              )}

              {/* Total Reps */}
              {hoveredMoveframe.totalReps > 0 && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px]">Total Reps</span>
                  <span className="font-semibold text-purple-600">{hoveredMoveframe.totalReps}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {hoveredMoveframe.notes && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="font-semibold text-gray-700 mb-1 text-[10px]">Notes:</div>
                <div className="text-gray-900 bg-yellow-50 p-2 rounded text-[10px]">
                  {hoveredMoveframe.notes}
                </div>
              </div>
            )}

            {/* Movelaps Details */}
            {hoveredMoveframe.movelaps && hoveredMoveframe.movelaps.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="font-semibold text-gray-700 mb-1 text-[10px]">Movelaps ({hoveredMoveframe.movelaps.length}):</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {hoveredMoveframe.movelaps.map((lap: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-1.5 rounded text-[10px]">
                      <div className="font-semibold text-gray-700">#{idx + 1}</div>
                      <div className="grid grid-cols-2 gap-1 text-[9px]">
                        {lap.distance && <div>Distance: <span className="font-semibold">{lap.distance}m</span></div>}
                        {lap.reps && <div>Reps: <span className="font-semibold">{lap.reps}</span></div>}
                        {lap.time && <div>Time: <span className="font-semibold">{lap.time}</span></div>}
                        {lap.pace && <div>Pace: <span className="font-semibold">{lap.pace}</span></div>}
                        {lap.speed && <div>Speed: <span className="font-semibold">{lap.speed}</span></div>}
                        {lap.pause && <div>Pause: <span className="font-semibold">{lap.pause}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Manual Content Popup Modal */}
      {showManualPopup && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowManualPopup(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: sectionColor }}
                >
                  {moveframe.letter || 'A'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {sportName} - Manual Moveframe
                  </h3>
                  <p className="text-sm text-gray-500">{sectionName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowManualPopup(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-3 py-1 rounded hover:bg-gray-100"
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Full Content */}
            <div className="prose max-w-none">
              <div 
                className="text-gray-900 bg-gray-50 p-4 rounded border border-gray-200"
                style={{
                  lineHeight: '1.8',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '14px'
                }}
                dangerouslySetInnerHTML={{ __html: manualPopupContent }}
              />
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-300 flex justify-end">
              <button
                onClick={() => setShowManualPopup(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </React.Fragment>
  );
}

