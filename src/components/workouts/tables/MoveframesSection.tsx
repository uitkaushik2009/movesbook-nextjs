import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableMoveframeRow from './SortableMoveframeRow';
import MoveframeInfoPanel from '../MoveframeInfoPanel';

interface MoveframesSectionProps {
  moveframes: any[];
  workout: any;
  workoutIndex: number;
  day: any;
  onAddMoveframe: () => void;
  onEditMoveframe?: (moveframe: any) => void;
  onDeleteMoveframe?: (moveframe: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any) => void;
  onAddMovelap?: (moveframe: any) => void;
  onCopyMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onMoveMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onOpenColumnSettings?: (tableType: 'day' | 'workout' | 'moveframe' | 'movelap') => void;
}

export default function MoveframesSection({ 
  moveframes, 
  workout, 
  workoutIndex, 
  day,
  onAddMoveframe,
  onEditMoveframe,
  onDeleteMoveframe,
  onEditMovelap,
  onDeleteMovelap,
  onAddMovelap,
  onCopyMoveframe,
  onMoveMoveframe,
  onOpenColumnSettings
}: MoveframesSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [expandedMoveframe, setExpandedMoveframe] = React.useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [selectedMoveframe, setSelectedMoveframe] = useState<any>(null);
  
  // Local state for moveframe order (sorted alphabetically)
  const [orderedMoveframes, setOrderedMoveframes] = useState(moveframes);
  
  // Update local order when moveframes prop changes
  React.useEffect(() => {
    setOrderedMoveframes(moveframes);
  }, [moveframes]);
  
  // Handle drag end - reorder and reassign letters alphabetically
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = orderedMoveframes.findIndex((mf: any) => mf.id === active.id);
    const newIndex = orderedMoveframes.findIndex((mf: any) => mf.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    // Reorder array
    const newOrder = [...orderedMoveframes];
    const [movedItem] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, movedItem);
    
    // Reassign letters alphabetically
    const updatedOrder = newOrder.map((mf, index) => ({
      ...mf,
      letter: String.fromCharCode(65 + index) // A, B, C, D...
    }));
    
    // Update local state immediately for smooth UX
    setOrderedMoveframes(updatedOrder);
    
    // Persist the new order to database
    try {
      const response = await fetch('/api/workouts/moveframes/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moveframes: updatedOrder.map((mf: any) => ({
            id: mf.id,
            letter: mf.letter
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Failed to persist moveframe order:', error);
        alert('Failed to save moveframe order. Please try again.');
        // Revert to original order on error
        setOrderedMoveframes(moveframes);
      } else {
        const result = await response.json();
        console.log('✅ Moveframe order persisted:', result);
        console.log('📝 New moveframe order:', updatedOrder.map((mf: any) => mf.letter).join(', '));
      }
    } catch (error) {
      console.error('❌ Error calling reorder API:', error);
      alert('Network error while saving moveframe order. Please check your connection.');
      // Revert to original order on error
      setOrderedMoveframes(moveframes);
    }
  };

  return (
    <>
      <div className="mt-4 bg-purple-100 rounded-lg max-w-[1400px]">
        {/* Header Bar - Simplified without redundant text */}
        <div className="bg-purple-200 px-4 py-2 flex flex-wrap items-center justify-between rounded-t-lg gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-700 hover:bg-purple-300 rounded px-2 py-1 transition-colors font-bold"
              title="Toggle moveframes visibility"
            >
              {isExpanded ? '▼' : '►'}
            </button>
            <span className="font-bold text-sm text-purple-900">Moveframes</span>
            <span className="text-xs text-purple-700 bg-purple-300 px-2 py-0.5 rounded">
              {moveframes.length} total
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onAddMoveframe) {
                  onAddMoveframe();
                }
              }}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              title="Add a Moveframe"
            >
              Add a Moveframe
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (moveframes.length > 0 && onCopyMoveframe) {
                  // Pass ALL moveframes when copying from the section level
                  onCopyMoveframe(moveframes, workout, day);
                } else {
                  alert('No moveframes to copy');
                }
              }}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              title="Copy all moveframes"
            >
              Copy
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (moveframes.length > 0 && onMoveMoveframe) {
                  // Pass ALL moveframes when moving from the section level
                  onMoveMoveframe(moveframes, workout, day);
                } else {
                  alert('No moveframes to move');
                }
              }}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              title="Move all moveframes"
            >
              Move
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete all moveframes in this workout?')) {
                  moveframes.forEach((mf: any) => onDeleteMoveframe?.(mf));
                }
              }}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              title="Delete all moveframes"
            >
              Del
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenColumnSettings) {
                  onOpenColumnSettings('moveframe');
                }
              }}
              className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
              title="Configure columns"
            >
              ⚙ Col
            </button>
          </div>
        </div>

        {/* Moveframes Table */}
        {isExpanded && (
          <div className="p-4">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full border-collapse text-xs bg-white">
                <thead className="bg-purple-300 text-purple-900">
                  <tr>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]" title="Drag to reorder">⋮⋮</th>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]" title="Expand/Collapse">::</th>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]" title="Index">#</th>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">MF</th>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Workout section</th>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Ico</th>
                    <th className="border border-gray-200 px-1 py-1 text-left text-[10px]">Sport of the moveframe</th>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Moveframe description</th>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Rip</th>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Macro</th>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Alarm & Sound</th>
                    <th className="border border-gray-200 px-1 py-1 text-center text-[10px]">Options</th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    items={orderedMoveframes.map((mf: any) => mf.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {orderedMoveframes.map((moveframe: any, mfIndex: number) => {
                      const isMovelapsExpanded = expandedMoveframe === moveframe.id;
                      
                      return (
                        <SortableMoveframeRow
                          key={moveframe.id}
                          moveframe={moveframe}
                          mfIndex={mfIndex}
                          isMovelapsExpanded={isMovelapsExpanded}
                          onToggleExpand={() => setExpandedMoveframe(isMovelapsExpanded ? null : moveframe.id)}
                          onEditMoveframe={onEditMoveframe}
                          onDeleteMoveframe={onDeleteMoveframe}
                          onEditMovelap={onEditMovelap}
                          onDeleteMovelap={onDeleteMovelap}
                          onAddMovelap={onAddMovelap}
                          onCopyMoveframe={onCopyMoveframe}
                          onMoveMoveframe={onMoveMoveframe}
                          workout={workout}
                          day={day}
                          setShowInfoPanel={setShowInfoPanel}
                          setSelectedMoveframe={setSelectedMoveframe}
                        />
                      );
                    })}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          </div>
        )}
      </div>

      {/* Moveframe Info Panel */}
      {showInfoPanel && selectedMoveframe && (
        <MoveframeInfoPanel
          isOpen={showInfoPanel}
          onClose={() => {
            setShowInfoPanel(false);
            setSelectedMoveframe(null);
          }}
          moveframe={selectedMoveframe}
          workout={workout}
          day={day}
          onEdit={() => {
            setShowInfoPanel(false);
            if (onEditMoveframe) onEditMoveframe(selectedMoveframe);
          }}
          onCopy={() => {
            setShowInfoPanel(false);
            if (onCopyMoveframe) onCopyMoveframe(selectedMoveframe, workout, day);
          }}
          onMove={() => {
            setShowInfoPanel(false);
            if (onMoveMoveframe) onMoveMoveframe(selectedMoveframe, workout, day);
          }}
          onDelete={() => {
            setShowInfoPanel(false);
            if (onDeleteMoveframe) onDeleteMoveframe(selectedMoveframe);
          }}
          onAddMovelap={() => {
            setShowInfoPanel(false);
            if (onAddMovelap) onAddMovelap(selectedMoveframe);
          }}
          onBulkAddMovelaps={() => {
            alert('Bulk Add Movelaps feature - integration in progress');
            setShowInfoPanel(false);
          }}
          onEditMovelap={(movelap) => {
            setShowInfoPanel(false);
            if (onEditMovelap) onEditMovelap(movelap, selectedMoveframe);
          }}
          onDeleteMovelap={(movelap) => {
            if (onDeleteMovelap) onDeleteMovelap(movelap, selectedMoveframe);
          }}
        />
      )}
    </>
  );
}

