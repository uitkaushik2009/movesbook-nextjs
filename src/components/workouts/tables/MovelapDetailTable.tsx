import React, { useState } from 'react';
import { GripVertical, Volume2, VolumeX, Bell, BellOff } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MovelapDetailTableProps {
  moveframe: any;
  onEditMovelap?: (movelap: any) => void;
  onDeleteMovelap?: (movelap: any) => void;
  onAddMovelap?: () => void;
  onAddMovelapAfter?: (movelap: any, index: number) => void;
}

// Sortable Row Component
function SortableMovelapRow({ 
  movelap, 
  index, 
  sequenceNumber,
  moveframeLetter, 
  sectionColor, 
  sectionName, 
  moveframe, 
  onEditMovelap, 
  onDeleteMovelap,
  onCopyMovelap,
  onPasteMovelap,
  onAddMovelapAfter
}: {
  movelap: any;
  index: number;
  sequenceNumber: number;
  moveframeLetter: string;
  sectionColor: string;
  sectionName: string;
  moveframe: any;
  onEditMovelap?: (movelap: any) => void;
  onDeleteMovelap?: (movelap: any) => void;
  onCopyMovelap: (movelap: any) => void;
  onPasteMovelap: (index: number) => void;
  onAddMovelapAfter?: (movelap: any, index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: movelap.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : 1,
    position: 'relative' as const,
    cursor: isDragging ? 'grabbing' : 'auto',
  };

  // Get sound icon
  const getSoundIcon = (movelap: any) => {
    if (movelap.sound) {
      const soundLower = movelap.sound.toLowerCase();
      if (soundLower.includes('beep') || soundLower.includes('alarm')) {
        return <Bell size={14} className="text-yellow-600" />;
      } else if (soundLower.includes('none') || soundLower === '—') {
        return <BellOff size={14} className="text-gray-400" />;
      } else {
        return <Volume2 size={14} className="text-blue-600" />;
      }
    }
    if (movelap.alarm) {
      return <Bell size={14} className="text-yellow-600" />;
    }
    return <VolumeX size={14} className="text-gray-400" />;
  };

  // Sport-specific rendering logic
  const sport = moveframe.sport || 'SWIM';
  const isSwim = sport === 'SWIM';
  const isBike = sport === 'BIKE';
  const isRun = sport === 'RUN';
  const isBodyBuilding = sport === 'BODY_BUILDING';
  
  // Distance-based sports (no tools)
  const distanceBasedSports = ['SWIM', 'BIKE', 'RUN', 'ROWING', 'SKATE', 'SKI', 'SNOWBOARD'];
  const isDistanceBased = distanceBasedSports.includes(sport);
  
  // Other sports have tools (Gymnastic, Stretching, Pilates, Yoga, Technical moves, Free moves, etc.)
  const hasTools = !isBodyBuilding && !isDistanceBased;
  
  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className="hover:bg-gray-100 transition-colors duration-150 isolate relative z-0"
    >
      {/* Move (Drag Handle) Column */}
      <td className="border border-gray-300 px-1 py-1 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-700 hover:bg-gray-100 inline-flex items-center justify-center w-8 h-8 rounded select-none transition-colors"
          style={{ touchAction: 'none' }}
          title="Drag to reorder movelap"
          type="button"
        >
          <GripVertical size={18} />
        </button>
      </td>
      
      {/* MF (Moveframe Letter) Column */}
      <td className="border border-gray-300 px-1 py-1 text-center font-bold text-xs">
        {moveframeLetter}
      </td>
      
      {/* # (Repetition Number) Column - Persistent sequence number */}
      <td className={`border border-gray-300 px-1 py-1 text-center font-bold text-xs ${
        movelap.isNewlyAdded ? 'text-red-600' : ''
      }`}>
        {sequenceNumber}
      </td>
      
      {/* Workout Section Column - Combined color and name */}
      <td className="border border-gray-300 px-1 py-1 text-center">
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-5 h-5 rounded flex-shrink-0"
            style={{ backgroundColor: sectionColor }}
            title={sectionName}
          />
          <span className="text-[10px]">{sectionName}</span>
        </div>
      </td>
      
      {/* Action Column - Shows sport name */}
      <td className="border border-gray-300 px-1 py-1 text-center text-[10px]">
        {sport.replace(/_/g, ' ')}
      </td>
      
      {/* SPORT-SPECIFIC COLUMNS */}
      
      {/* BODY BUILDING - Different fields */}
      {isBodyBuilding && (
        <>
          {/* Muscular Sector */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs">
            {movelap.muscularSector || '—'}
          </td>
          {/* Exercise */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs">
            {movelap.exercise || '—'}
          </td>
          {/* Reps */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs">
            {movelap.reps || '—'}
          </td>
          {/* Weight */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs font-semibold text-blue-700">
            {movelap.weight || '—'}
          </td>
          {/* Tempo/Speed */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs">
            {movelap.speed || '—'}
          </td>
          {/* Rest Type */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs">
            {movelap.restType?.replace(/_/g, ' ') || '—'}
          </td>
        </>
      )}
      
      {/* OTHER SPORTS WITH TOOLS (Gymnastic, Stretching, Pilates, Yoga, etc.) */}
      {hasTools && (
        <>
          {/* Reps */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs">
            {movelap.reps || '—'}
          </td>
          {/* Tools */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs font-semibold text-green-700">
            {movelap.tools || '—'}
          </td>
        </>
      )}
      
      {/* SWIM, BIKE, RUN, ROWING, SKATE, SKI, SNOWBOARD - Distance-based sports */}
      {isDistanceBased && (
        <>
          {/* Distance (m) */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs">
            {movelap.distance || '—'}
          </td>
          
          {/* Style - Only for SWIM and RUN */}
          {(isSwim || isRun) && (
            <td className="border border-gray-300 px-1 py-1 text-center text-xs">
              {movelap.style || '—'}
            </td>
          )}
          
          {/* R1, R2 - Only for BIKE */}
          {isBike && (
            <>
              <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                {movelap.r1 || '—'}
              </td>
              <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                {movelap.r2 || '—'}
              </td>
            </>
          )}
          
          {/* Speed - For SWIM, BIKE, RUN */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs">
            {movelap.speed || '—'}
          </td>
          
          {/* Row/min - Only for ROWING */}
          {sport === 'ROWING' && (
            <td className="border border-gray-300 px-1 py-1 text-center text-xs font-semibold text-purple-700">
              {movelap.rowPerMin || '—'}
            </td>
          )}
          
          {/* Time */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs">
            {movelap.time || '—'}
          </td>
          
          {/* Pace */}
          <td className="border border-gray-300 px-1 py-1 text-center text-xs">
            {movelap.pace || '—'}
          </td>
        </>
      )}
      
      {/* COMMON COLUMNS for all sports */}
      
      {/* Pause/Recovery */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.pause || '—'}
      </td>
      
      {/* Macro Final */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.macroFinal || '—'}
      </td>
      
      {/* Alarm & Sound */}
      <td className="border border-gray-300 px-1 py-1 text-center">
        <div className="flex items-center justify-center gap-1">
          {getSoundIcon(movelap)}
          {movelap.alarm && movelap.alarm !== -1 && <span className="text-[8px]">{Math.abs(movelap.alarm)}</span>}
        </div>
      </td>
      
      {/* Notes */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.notes || '—'}
      </td>
      
      {/* Options Column */}
      <td className="border border-gray-300 px-1 py-1 text-center">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEditMovelap) onEditMovelap(movelap);
            }}
            className="px-1 py-0.5 text-[9px] bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Edit movelap"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyMovelap(movelap);
            }}
            className="px-1 py-0.5 text-[9px] bg-green-500 text-white rounded hover:bg-green-600"
            title="Copy movelap"
          >
            Copy
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPasteMovelap(index);
            }}
            className="px-1 py-0.5 text-[9px] bg-orange-500 text-white rounded hover:bg-orange-600"
            title="Paste copied movelap after this position"
          >
            Paste
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDeleteMovelap) {
                if (confirm(`Delete ${moveframeLetter}${index + 1}?`)) {
                  onDeleteMovelap(movelap);
                }
              }
            }}
            className="px-1 py-0.5 text-[9px] bg-red-500 text-white rounded hover:bg-red-600"
            title="Delete movelap"
          >
            Delete
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAddMovelapAfter) {
                onAddMovelapAfter(movelap, index);
              }
            }}
            className="px-1 py-0.5 text-[9px] bg-purple-500 text-white rounded hover:bg-purple-600"
            title="Add movelap after this position"
          >
            Add movelap
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function MovelapDetailTable({ 
  moveframe, 
  onEditMovelap, 
  onDeleteMovelap, 
  onAddMovelap,
  onAddMovelapAfter
}: MovelapDetailTableProps) {
  const [movelaps, setMovelaps] = useState(moveframe.movelaps || []);
  const moveframeLetter = moveframe.letter || 'A'; // Parent moveframe letter
  const sectionColor = moveframe.section?.color || '#5b8def';
  const sectionName = moveframe.section?.name || 'Default';
  const [copiedMovelap, setCopiedMovelap] = useState<any>(null);
  
  // Store original sequence numbers for each movelap (persists through drag operations)
  const [movelapSequences, setMovelapSequences] = useState<Map<string, number>>(new Map());

  // Initialize or update sequence numbers when movelaps change
  React.useEffect(() => {
    const newMovelaps = moveframe.movelaps || [];
    setMovelaps(newMovelaps);
    
    // Regenerate all sequence numbers when movelaps change (e.g., when adding new movelaps)
    setMovelapSequences((prevSequences) => {
      const newSequences = new Map<string, number>();
      newMovelaps.forEach((movelap: any, idx: number) => {
        // Keep existing sequence if available, otherwise assign new one
        if (prevSequences.has(movelap.id)) {
          newSequences.set(movelap.id, prevSequences.get(movelap.id)!);
        } else {
          // New movelap - assign next available sequence number
          newSequences.set(movelap.id, idx + 1);
        }
      });
      
      // If count changed (new movelap added), regenerate all sequences sequentially
      if (newMovelaps.length !== prevSequences.size) {
        newMovelaps.forEach((movelap: any, idx: number) => {
          newSequences.set(movelap.id, idx + 1);
        });
      }
      
      return newSequences;
    });
  }, [moveframe.movelaps]);

  // Setup drag sensors with reliable activation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Small distance to start drag
      },
    })
  );
  // Handle drag end - reorder movelaps
  const handleDragEnd = async (event: DragEndEvent) => {
    console.log('🎯 Movelap drag ended:', event);
    const { active, over } = event;
    
    console.log('🎯 Active ID:', active?.id, 'Over ID:', over?.id);
    
    if (!over || active.id === over.id) {
      console.log('🎯 Movelap drag cancelled or same position');
      return;
    }
    
    const oldIndex = movelaps.findIndex((ml: any) => ml.id === active.id);
    const newIndex = movelaps.findIndex((ml: any) => ml.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    // Reorder array
    const newOrder = [...movelaps];
    const [movedItem] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, movedItem);
    
    // Update local state immediately for smooth UX
    setMovelaps(newOrder);
    
    // Persist the new order to database
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/workouts/movelaps/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movelaps: newOrder.map((ml: any, idx: number) => ({
            id: ml.id,
            repetitionNumber: idx + 1 // repetitionNumber starts from 1
          }))
        })
      });

      if (!response.ok) {
        console.error('Failed to persist movelap order');
        // Revert on error
        setMovelaps(moveframe.movelaps || []);
      }
    } catch (error) {
      console.error('Error calling reorder API:', error);
      // Revert on error
      setMovelaps(moveframe.movelaps || []);
    }
  };

  // Handle copy movelap
  const handleCopyMovelap = (movelap: any) => {
    setCopiedMovelap(movelap);
    alert(`Movelap #${movelaps.findIndex((ml: any) => ml.id === movelap.id) + 1} copied! Click "Paste" on any row to insert it after that position.`);
  };

  // Handle paste movelap
  const handlePasteMovelap = async (afterIndex: number) => {
    if (!copiedMovelap) {
      alert('No movelap copied. Click "Copy" on a movelap first.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Create new movelap after the specified position
      const newMovelap = {
        ...copiedMovelap,
        id: undefined, // Will be assigned by backend
        moveframeId: moveframe.id,
        repetitionNumber: afterIndex + 2 // Insert after current position
      };

      const response = await fetch('/api/workouts/movelaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMovelap)
      });

      if (response.ok) {
        alert('Movelap pasted successfully! Refreshing...');
        window.location.reload(); // Refresh to show new movelap
      } else {
        alert('Failed to paste movelap');
      }
    } catch (error) {
      console.error('Error pasting movelap:', error);
      alert('Error pasting movelap');
    }
  };
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => console.log('🚀 Movelap drag started:', event.active.id)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={movelaps.map((ml: any) => ml.id)} strategy={verticalListSortingStrategy}>
        <div className="bg-gray-50 p-2 pr-0">
          <table className="w-full border-collapse text-xs table-fixed">
            {/* Render sport-specific column headers */}
            {(() => {
              const sport = moveframe.sport || 'SWIM';
              const isSwim = sport === 'SWIM';
              const isBike = sport === 'BIKE';
              const isRun = sport === 'RUN';
              const isBodyBuilding = sport === 'BODY_BUILDING';
              
              // Distance-based sports (no tools)
              const distanceBasedSports = ['SWIM', 'BIKE', 'RUN', 'ROWING', 'SKATE', 'SKI', 'SNOWBOARD'];
              const isDistanceBased = distanceBasedSports.includes(sport);
              
              // Other sports have tools (Gymnastic, Stretching, Pilates, Yoga, Technical moves, Free moves, etc.)
              const hasTools = !isBodyBuilding && !isDistanceBased;
              
              return (
                <>
                  <colgroup>
                    <col style={{ width: '30px' }} />
                    <col style={{ width: '30px' }} />
                    <col style={{ width: '30px' }} />
                    <col style={{ width: '120px' }} />
                    <col style={{ width: '80px' }} />
                    {isBodyBuilding && <><col style={{ width: '100px' }} /><col style={{ width: '120px' }} /><col style={{ width: '50px' }} /><col style={{ width: '60px' }} /><col style={{ width: '80px' }} /><col style={{ width: '80px' }} /></>}
                    {hasTools && <><col style={{ width: '50px' }} /><col style={{ width: '120px' }} /></>}
                    {isDistanceBased && <><col style={{ width: '60px' }} />{(isSwim || isRun) && <col style={{ width: '100px' }} />}{isBike && <><col style={{ width: '50px' }} /><col style={{ width: '50px' }} /></>}<col style={{ width: '60px' }} /><col style={{ width: '60px' }} /><col style={{ width: '60px' }} /></>}
                    <col style={{ width: '60px' }} />
                    <col style={{ width: '50px' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '280px' }} />
                  </colgroup>
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]" title="Drag to reorder">Move</th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">MF</th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">#</th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Workout section</th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Sport</th>
                      
                      {isBodyBuilding && (
                        <>
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Musc.Sector</th>
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Exercise</th>
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Reps</th>
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Weight</th>
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Tempo</th>
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Rest Type</th>
                        </>
                      )}
                      
                      {hasTools && (
                        <>
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Reps</th>
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Tools</th>
                        </>
                      )}
                      
                      {isDistanceBased && (
                        <>
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Dist (m)</th>
                          {(isSwim || isRun) && (
                            <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Style</th>
                          )}
                          {isBike && (
                            <>
                              <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">R1</th>
                              <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">R2</th>
                            </>
                          )}
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Speed</th>
                          {sport === 'ROWING' && (
                            <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Row/min</th>
                          )}
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Time</th>
                          <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Pace</th>
                        </>
                      )}
                      
                      {/* Common headers */}
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Pause</th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Macro</th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Alarm&Snd</th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Notes</th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Options</th>
                    </tr>
                  </thead>
                </>
              );
            })()}
            
            <tbody>
              {movelaps.map((movelap: any, index: number) => (
                <SortableMovelapRow
                  key={movelap.id}
                  movelap={movelap}
                  index={index}
                  sequenceNumber={movelapSequences.get(movelap.id) || index + 1}
                  moveframeLetter={moveframeLetter}
                  sectionColor={sectionColor}
                  sectionName={sectionName}
                  moveframe={moveframe}
                  onEditMovelap={onEditMovelap}
                  onDeleteMovelap={onDeleteMovelap}
                  onCopyMovelap={handleCopyMovelap}
                  onPasteMovelap={handlePasteMovelap}
                  onAddMovelapAfter={onAddMovelapAfter}
                />
              ))}
            </tbody>
          </table>
          
          {/* Note Box and Add Movelap Button - Same Line */}
          <div className="mt-2 flex items-center gap-4">
            {/* Add Movelap Button */}
            {onAddMovelap && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMovelap();
                }}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 whitespace-nowrap"
              >
                + Add Movelap
              </button>
            )}
            
            {/* Note Box */}
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-semibold text-black whitespace-nowrap">
                Note
              </label>
              <input
                type="text"
                className="flex-1 px-2 py-1 text-xs text-red-600 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Add a note for this moveframe..."
                defaultValue={moveframe.note || ''}
                onBlur={(e) => {
                  // TODO: Save note to backend
                  console.log('Note updated:', e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}

