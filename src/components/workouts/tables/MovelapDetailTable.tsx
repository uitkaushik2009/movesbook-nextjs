import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { GripVertical, Volume2, VolumeX, Bell, BellOff, MoreVertical } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MovelapDetailTableProps {
  moveframe: any;
  onEditMovelap?: (movelap: any) => void;
  onDeleteMovelap?: (movelap: any) => void;
  onAddMovelap?: () => void;
  onAddMovelapAfter?: (movelap: any, index: number) => void;
  onRefresh?: () => void;
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
  // Options dropdown state
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: movelap.id });

  // Calculate button position when dropdown opens
  const handleOpenDropdown = () => {
    console.log('🔵 handleOpenDropdown called');
    if (optionsButtonRef.current) {
      const rect = optionsButtonRef.current.getBoundingClientRect();
      console.log('🔵 Button rect:', rect);
      console.log('🔵 Viewport width:', window.innerWidth);
      
      setButtonRect(rect);
      setShowOptionsDropdown(true);
      console.log('🔵 Dropdown state set to true');
    } else {
      console.log('❌ optionsButtonRef.current is null');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsDropdown && dropdownRef.current && optionsButtonRef.current) {
        const target = event.target as Node;
        if (!dropdownRef.current.contains(target) && !optionsButtonRef.current.contains(target)) {
          console.log('🔴 Closing dropdown (clicked outside)');
          setShowOptionsDropdown(false);
          setButtonRect(null);
        }
      }
    };

    if (showOptionsDropdown) {
      console.log('👂 Adding mousedown listener');
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (showOptionsDropdown) {
        console.log('🧹 Removing mousedown listener');
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsDropdown]);

  // Debug: Track dropdown state changes
  useEffect(() => {
    console.log('🔷 showOptionsDropdown changed to:', showOptionsDropdown);
    console.log('🔷 buttonRect:', buttonRect);
    if (showOptionsDropdown && buttonRect) {
      console.log('✅ DROPDOWN SHOULD BE VISIBLE NOW!');
    }
  }, [showOptionsDropdown, buttonRect]);

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
    <>
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
      
      {/* Notes - Display only first 20 characters, full text shown in Edit modal */}
      <td className="border border-gray-300 px-2 py-1 text-left text-xs" style={{ width: '200px', maxWidth: '200px', minWidth: '200px' }}>
        <div 
          className="overflow-hidden text-ellipsis whitespace-nowrap" 
          title={movelap.notes || '—'}
          style={{ maxWidth: '200px' }}
        >
          {movelap.notes 
            ? (movelap.notes.length > 20 
                ? movelap.notes.substring(0, 20) + '...' 
                : movelap.notes
              ) 
            : '—'
          }
        </div>
      </td>
      
      {/* Options Column - Simplified to Edit + Options dropdown */}
      <td className="border border-gray-300 px-1 py-1 text-center" style={{ width: '120px', minWidth: '120px' }}>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEditMovelap) onEditMovelap(movelap);
            }}
            className="px-3 py-1 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Edit movelap"
          >
            Edit
          </button>
          <button
            ref={optionsButtonRef}
            onClick={(e) => {
              console.log('🟢 Options button clicked');
              e.stopPropagation();
              if (showOptionsDropdown) {
                console.log('🟢 Closing dropdown');
                setShowOptionsDropdown(false);
                setButtonRect(null);
              } else {
                console.log('🟢 Opening dropdown');
                handleOpenDropdown();
              }
            }}
            className="px-2 py-1 text-[10px] bg-gray-600 text-white rounded hover:bg-gray-700"
            title="More options"
          >
            Options
          </button>
        </div>
      </td>
    </tr>
    {/* Options Dropdown Menu Portal */}
    {showOptionsDropdown && buttonRect && (() => {
      const dropdownWidth = 150;
      const left = (buttonRect.right - dropdownWidth > 0) 
        ? Math.min(buttonRect.left, window.innerWidth - dropdownWidth - 10)
        : 10;
      
      console.log('🟣 Rendering dropdown portal at:', { 
        top: buttonRect.bottom + 5, 
        left: left,
        buttonLeft: buttonRect.left,
        buttonRight: buttonRect.right,
        viewportWidth: window.innerWidth
      });
      
      return ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white rounded-lg shadow-xl py-2"
          style={{
            top: `${buttonRect.bottom + 5}px`,
            left: `${left}px`,
            minWidth: '150px',
            zIndex: 999999,
            border: '2px solid #2563eb',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
        >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopyMovelap(movelap);
            setShowOptionsDropdown(false);
          }}
          className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
        >
          Copy
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPasteMovelap(index);
            setShowOptionsDropdown(false);
          }}
          className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
        >
          Paste
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onAddMovelapAfter) {
              onAddMovelapAfter(movelap, index);
            }
            setShowOptionsDropdown(false);
          }}
          className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
        >
          Add movelap
        </button>
        <div className="border-t border-gray-200 my-1"></div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDeleteMovelap) {
              if (confirm(`Delete ${moveframeLetter}${index + 1}?`)) {
                onDeleteMovelap(movelap);
              }
            }
            setShowOptionsDropdown(false);
          }}
          className="block w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>,
      document.body
    );
    })()}
    </>
  );
}

export default function MovelapDetailTable({ 
  moveframe, 
  onEditMovelap, 
  onDeleteMovelap, 
  onAddMovelap,
  onAddMovelapAfter,
  onRefresh
}: MovelapDetailTableProps) {
  const [movelaps, setMovelaps] = useState(moveframe.movelaps || []);
  const moveframeLetter = moveframe.letter || 'A'; // Parent moveframe letter
  const sectionColor = moveframe.section?.color || '#5b8def';
  const sectionName = moveframe.section?.name || 'Default';
  const [copiedMovelap, setCopiedMovelap] = useState<any>(null);
  const [noteValue, setNoteValue] = useState(moveframe.notes || '');
  const [isSavingNote, setIsSavingNote] = useState(false);
  
  // Check if this moveframe is manual mode
  const isManualMode = moveframe.manualMode === true;
  
  // Debug logging
  console.log('🔍 MovelapDetailTable - Moveframe data:', {
    id: moveframe.id,
    letter: moveframe.letter,
    manualMode: moveframe.manualMode,
    isManualMode,
    hasNotes: !!moveframe.notes,
    notesLength: moveframe.notes?.length || 0,
    movelapCount: moveframe.movelaps?.length || 0
  });
  
  // Store original sequence numbers for each movelap (persists through drag operations)
  const [movelapSequences, setMovelapSequences] = useState<Map<string, number>>(new Map());

  // Initialize or update sequence numbers when movelaps change
  React.useEffect(() => {
    // Sort movelaps by repetitionNumber to maintain order after reload
    const unsortedMovelaps = moveframe.movelaps || [];
    console.log('🔄 MovelapDetailTable: Loading movelaps', {
      count: unsortedMovelaps.length,
      unsorted: unsortedMovelaps.map((ml: any) => ({ id: ml.id.slice(-4), repNum: ml.repetitionNumber }))
    });
    
    const newMovelaps = [...unsortedMovelaps].sort((a: any, b: any) => 
      (a.repetitionNumber || 0) - (b.repetitionNumber || 0)
    );
    
    console.log('✅ MovelapDetailTable: Sorted movelaps', {
      sorted: newMovelaps.map((ml: any) => ({ id: ml.id.slice(-4), repNum: ml.repetitionNumber }))
    });
    
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
      if (!token) {
        console.error('❌ No auth token for reorder');
        return;
      }

      const reorderPayload = newOrder.map((ml: any, idx: number) => ({
        id: ml.id,
        repetitionNumber: idx + 1 // repetitionNumber starts from 1
      }));
      
      console.log('📤 Calling movelap reorder API with:', reorderPayload.map((ml: any) => ({ id: ml.id.slice(-4), repNum: ml.repetitionNumber })));

      const response = await fetch('/api/workouts/movelaps/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movelaps: reorderPayload
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to persist movelap order:', errorData);
        // Revert on error
        setMovelaps(moveframe.movelaps || []);
      } else {
        const result = await response.json();
        console.log('✅ Movelap order persisted successfully:', result);
        // Notify parent to refresh data (expansion state is preserved in MoveframesSection)
        if (onRefresh) {
          console.log('🔄 Calling onRefresh to update Rip count...');
          await onRefresh();
          console.log('✅ onRefresh completed - Rip count updated, expansion preserved');
        } else {
          console.warn('⚠️ No onRefresh callback provided');
        }
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
      console.log('No movelap copied. Click "Copy" on a movelap first.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication required');
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
        console.log('Movelap pasted successfully');
        // Refresh data without page reload
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('Failed to paste movelap');
      }
    } catch (error) {
      console.error('Error pasting movelap:', error);
    }
  };

  // Handle save note
  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/workouts/moveframes/${moveframe.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: noteValue })
      });

      if (response.ok) {
        console.log('Note saved successfully');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSavingNote(false);
    }
  };
  
  // Manual Mode Layout - Simplified
  if (isManualMode) {
    // Parse manual content from notes - it might be JSON or HTML
    let manualContent = '';
    try {
      const parsed = JSON.parse(moveframe.notes || '{}');
      manualContent = parsed.htmlContent || parsed.content || moveframe.notes || '';
    } catch {
      // Not JSON, use as-is
      manualContent = moveframe.notes || 'No content';
    }

    return (
      <div className="bg-gray-50 p-2 pr-0">
        {/* Note Box, Save Button, and Add Movelap Button for Manual Mode - Above Table */}
        <div className="mb-3 flex items-center gap-4">
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
          
          {/* Note Box with Save Button */}
          <div className="flex items-center gap-2" style={{ maxWidth: '600px' }}>
            <label className="text-xs font-semibold text-black whitespace-nowrap">
              Note
            </label>
            <input
              type="text"
              className="px-2 py-1 text-xs text-red-600 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
              style={{ width: '500px' }}
              placeholder="Add a note for this moveframe..."
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
            />
            <button
              onClick={handleSaveNote}
              disabled={isSavingNote}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 whitespace-nowrap"
            >
              {isSavingNote ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Simplified Manual Mode Table - Single Row with 4 Columns */}
        <table className="w-full border-collapse text-xs table-fixed">
          <thead className="bg-gradient-to-r from-purple-200 to-pink-200">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-center text-[11px] font-bold" style={{ width: '100px' }}>Sport</th>
              <th className="border border-gray-300 px-3 py-2 text-center text-[11px] font-bold" style={{ width: '250px' }}>Summary</th>
              <th className="border border-gray-300 px-3 py-2 text-center text-[11px] font-bold" style={{ width: '330px', maxWidth: '330px' }}>Detail of workout</th>
              <th className="border border-gray-300 px-3 py-2 text-center text-[11px] font-bold" style={{ width: '120px', minWidth: '120px' }}>Options</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-blue-50">
              {/* Sport */}
              <td className="border border-gray-300 px-1 py-1 text-center text-xs font-semibold">
                <div className="flex items-center justify-center">
                  <span className="px-3 py-2 bg-purple-100 border-2 border-purple-300 rounded-lg font-bold text-purple-800">
                    {moveframe.sport?.replace(/_/g, ' ') || '—'}
                  </span>
                </div>
              </td>
              {/* Summary - shows moveframe description */}
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <div 
                  className="text-gray-800"
                  style={{
                    lineHeight: '1.6',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '12px'
                  }}
                  dangerouslySetInnerHTML={{ __html: moveframe.description || '' }}
                />
              </td>
              {/* Detail of workout (Manual Content) */}
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <div 
                  className="p-2 bg-gradient-to-br from-white to-gray-50 rounded border border-gray-300 max-h-96 overflow-y-auto text-left"
                  style={{
                    lineHeight: '1.8',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '13px'
                  }}
                  dangerouslySetInnerHTML={{ __html: manualContent }}
                />
              </td>
              {/* Options - Simplified for manual mode */}
              <td className="border border-gray-300 px-1 py-1 text-center" style={{ width: '120px', minWidth: '120px' }}>
                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // In manual mode, we need to create a temporary movelap object for editing
                      // Use the first movelap if it exists, otherwise create a default one
                      const movelapToEdit = moveframe.movelaps && moveframe.movelaps.length > 0 
                        ? moveframe.movelaps[0]
                        : {
                            id: 'temp-manual-movelap',
                            moveframeId: moveframe.id,
                            sequenceNumber: 1,
                            repetitionNumber: 1,
                            // Add other default movelap fields as needed
                          };
                      
                      if (onEditMovelap) {
                        onEditMovelap(movelapToEdit);
                      }
                    }}
                    className="px-3 py-1 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600"
                    title="Edit movelap"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddMovelap) {
                        onAddMovelap();
                      }
                    }}
                    className="px-2 py-1 text-[10px] bg-purple-500 text-white rounded hover:bg-purple-600"
                    title="Add movelap"
                  >
                    Add movelap
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Standard Mode Layout - Full movelaps table
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => console.log('🚀 Movelap drag started:', event.active.id)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={movelaps.map((ml: any) => ml.id)} strategy={verticalListSortingStrategy}>
        <div className="bg-gray-50 p-2 pr-0">
          {/* Top Controls - Note and Add Movelap Button */}
          <div className="mb-3 flex items-center gap-4">
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
            
            {/* Note Box with Save Button */}
            <div className="flex items-center gap-2" style={{ maxWidth: '600px' }}>
              <label className="text-xs font-semibold text-black whitespace-nowrap">
                Note
              </label>
              <input
                type="text"
                className="px-2 py-1 text-xs text-red-600 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                style={{ width: '500px' }}
                placeholder="Add a note for this moveframe..."
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
              />
              <button
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 whitespace-nowrap"
              >
                {isSavingNote ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

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
                    <col style={{ width: '200px' }} />
                    <col style={{ width: '120px' }} />
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
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]" style={{ width: '200px', maxWidth: '200px', minWidth: '200px' }}>Notes</th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-[10px]" style={{ width: '120px', maxWidth: '120px', minWidth: '120px' }}>Options</th>
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
        </div>
      </SortableContext>
    </DndContext>
  );
}

