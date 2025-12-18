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
}

// Sortable Row Component
function SortableMovelapRow({ 
  movelap, 
  index, 
  moveframeLetter, 
  sectionColor, 
  sectionName, 
  moveframe, 
  onEditMovelap, 
  onDeleteMovelap,
  onCopyMovelap,
  onPasteMovelap,
  savingFavorite,
  handleSaveAsFavorite
}: any) {
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

  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className="hover:bg-gray-100"
    >
      {/* Move (Drag Handle) Column */}
      <td className="border border-gray-300 px-1 py-1 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-gray-400 hover:text-gray-600 inline-flex items-center justify-center select-none"
          style={{ touchAction: 'none' }}
          title="Drag to reorder movelap"
        >
          <GripVertical size={14} />
        </div>
      </td>
      
      {/* MF (Moveframe Letter) Column */}
      <td className="border border-gray-300 px-1 py-1 text-center font-bold text-xs">
        {moveframeLetter}
      </td>
      
      {/* # (Repetition Number) Column - Always sequential */}
      <td className="border border-gray-300 px-1 py-1 text-center font-bold text-xs">
        {index + 1}
      </td>
      
      {/* Color Column */}
      <td className="border border-gray-300 px-1 py-1 text-center">
        <div
          className="w-6 h-6 mx-auto rounded"
          style={{ backgroundColor: sectionColor }}
          title={sectionName}
        />
      </td>
      
      {/* Code Section Column - Shows section name like "Warm up" */}
      <td className="border border-gray-300 px-1 py-1 text-center text-[10px]">
        {sectionName}
      </td>
      
      {/* Action Column - Shows sport name */}
      <td className="border border-gray-300 px-1 py-1 text-center text-[10px]">
        {moveframe.sport?.replace(/_/g, ' ') || 'Unknown'}
      </td>
      
      {/* Dist Column */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.distance || '—'}
      </td>
      
      {/* Style Column */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.style || '—'}
      </td>
      
      {/* Speed Column */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.speed || '—'}
      </td>
      
      {/* Time Column */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.time || movelap.estimatedTime || '00.0'}
      </td>
      
      {/* Pace Column */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.pace || '00.0'}
      </td>
      
      {/* Rec (Recovery/Pause) Column */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.pause || movelap.recovery || '—'}
      </td>
      
      {/* Rest to Column */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.restTo || '—'}
      </td>
      
      {/* Aim & Snd Column - With sound icon */}
      <td className="border border-gray-300 px-1 py-1 text-center">
        <div className="flex items-center justify-center gap-1">
          {getSoundIcon(movelap)}
          {movelap.alarm && <span className="text-[8px]">{movelap.alarm}</span>}
        </div>
      </td>
      
      {/* Annotations Column */}
      <td className="border border-gray-300 px-1 py-1 text-center text-xs">
        {movelap.annotations || movelap.notes || '—'}
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
              handleSaveAsFavorite(movelap);
            }}
            disabled={savingFavorite === movelap.id}
            className={`px-1 py-0.5 text-[9px] text-white rounded ${
              savingFavorite === movelap.id 
                ? 'bg-purple-300 cursor-wait' 
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
            title="Save as favorite"
          >
            {savingFavorite === movelap.id ? 'Saving...' : 'Save as Fav'}
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
  onAddMovelap 
}: MovelapDetailTableProps) {
  const [movelaps, setMovelaps] = useState(moveframe.movelaps || []);
  const moveframeLetter = moveframe.letter || 'A'; // Parent moveframe letter
  const sectionColor = moveframe.section?.color || '#5b8def';
  const sectionName = moveframe.section?.name || 'Default';
  const [savingFavorite, setSavingFavorite] = useState<string | null>(null);
  const [copiedMovelap, setCopiedMovelap] = useState<any>(null);

  // Update movelaps when moveframe prop changes
  React.useEffect(() => {
    setMovelaps(moveframe.movelaps || []);
  }, [moveframe.movelaps]);

  // Setup drag sensors with reliable activation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Small distance to start drag
      },
    })
  );
  // Handle drag end - reorder movelaps
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
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
  
  // Function to save movelap as favorite
  const handleSaveAsFavorite = async (movelap: any) => {
    try {
      setSavingFavorite(movelap.id);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please log in.');
        return;
      }
      
      // Get current user settings
      const getResponse = await fetch('/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      let currentSettings: any = {};
      
      if (getResponse.ok) {
        currentSettings = await getResponse.json();
      } else if (getResponse.status !== 404) {
        const errorText = await getResponse.text();
        console.error('Error loading settings:', errorText);
        throw new Error('Failed to load current settings');
      }
      
      // Parse existing favorites or create new structure
      let favouritesSettings = currentSettings.favouritesSettings 
        ? (typeof currentSettings.favouritesSettings === 'string' 
          ? JSON.parse(currentSettings.favouritesSettings)
          : currentSettings.favouritesSettings)
        : { movelaps: [] };
      
      // Ensure movelaps array exists
      if (!favouritesSettings.movelaps) {
        favouritesSettings.movelaps = [];
      }
      
      // Create favorite movelap object
      const favoriteMovelap = {
        id: `fav_${Date.now()}`,
        name: `${moveframeLetter}${movelap.repetitionNumber} - ${movelap.distance}m`,
        distance: movelap.distance,
        speed: movelap.speed,
        style: movelap.style,
        pace: movelap.pace,
        time: movelap.time,
        pause: movelap.pause,
        recovery: movelap.recovery,
        restTo: movelap.restTo,
        aim: movelap.aim,
        sound: movelap.sound,
        notes: movelap.notes || movelap.annotations,
        sport: moveframe.sport,
        sectionColor: sectionColor,
        sectionName: sectionName,
        createdAt: new Date().toISOString(),
        sourceMovelap: {
          moveframeId: moveframe.id,
          movelapId: movelap.id,
          moveframeLetter: moveframeLetter,
          repetitionNumber: movelap.repetitionNumber
        }
      };
      
      // Check if already favorited
      const existingIndex = favouritesSettings.movelaps.findIndex(
        (fav: any) => fav.sourceMovelap?.movelapId === movelap.id
      );
      
      if (existingIndex >= 0) {
        // Update existing favorite
        favouritesSettings.movelaps[existingIndex] = favoriteMovelap;
      } else {
        // Add new favorite
        favouritesSettings.movelaps.push(favoriteMovelap);
      }
      
      // Prepare settings data with all required fields
      const settingsToSave: any = {
        favouritesSettings: favouritesSettings
      };
      
      // If this is a new settings record, include all required fields with defaults
      if (!currentSettings.id) {
        settingsToSave.colorSettings = currentSettings.colorSettings || {};
        settingsToSave.toolsSettings = currentSettings.toolsSettings || {};
        settingsToSave.myBestSettings = currentSettings.myBestSettings || {};
        settingsToSave.adminSettings = currentSettings.adminSettings || {};
        settingsToSave.workoutPreferences = currentSettings.workoutPreferences || {};
        settingsToSave.socialSettings = currentSettings.socialSettings || {};
        settingsToSave.notificationSettings = currentSettings.notificationSettings || {};
      }
      
      // Save updated settings
      const saveResponse = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsToSave)
      });
      
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        console.error('Save error:', errorData);
        throw new Error(errorData.error || 'Failed to save favorite');
      }
      
      alert(`Movelap saved as favorite!\n\nName: ${favoriteMovelap.name}\n\nYou can access your favorite movelaps in the Favourites tab.`);
      
    } catch (error) {
      console.error('Error saving favorite:', error);
      alert(`Failed to save as favorite:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingFavorite(null);
    }
  };
  
  return (
    <div className="bg-gray-50 p-2 pr-0">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={movelaps.map((ml: any) => ml.id)} strategy={verticalListSortingStrategy}>
          <table className="w-full border-collapse text-xs table-fixed">
            <colgroup>
              <col style={{ width: '30px' }} /> {/* Move */}
              <col style={{ width: '30px' }} /> {/* MF */}
              <col style={{ width: '30px' }} /> {/* # */}
              <col style={{ width: '40px' }} /> {/* Color */}
              <col style={{ width: '80px' }} /> {/* Code section */}
              <col style={{ width: '80px' }} /> {/* Action */}
              <col style={{ width: '60px' }} /> {/* Dist */}
              <col style={{ width: '60px' }} /> {/* Style */}
              <col style={{ width: '60px' }} /> {/* Speed */}
              <col style={{ width: '60px' }} /> {/* Time */}
              <col style={{ width: '60px' }} /> {/* Pace */}
              <col style={{ width: '60px' }} /> {/* Rec */}
              <col style={{ width: '60px' }} /> {/* Rest to */}
              <col style={{ width: '80px' }} /> {/* Aim & Snd */}
              <col style={{ width: 'auto' }} /> {/* Annotations - flex */}
              <col style={{ width: '280px' }} /> {/* Options - fixed width to match moveframe */}
            </colgroup>
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]" title="Drag to reorder">Move</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">MF</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">#</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Color</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Code section</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Action</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Dist</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Style</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Speed</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Time</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Pace</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Rec</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Rest to</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Aim & Snd</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Annotations</th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px]">Options</th>
              </tr>
            </thead>
            <tbody>
              {movelaps.map((movelap: any, index: number) => (
                <SortableMovelapRow
                  key={movelap.id}
                  movelap={movelap}
                  index={index}
                  moveframeLetter={moveframeLetter}
                  sectionColor={sectionColor}
                  sectionName={sectionName}
                  moveframe={moveframe}
                  onEditMovelap={onEditMovelap}
                  onDeleteMovelap={onDeleteMovelap}
                  onCopyMovelap={handleCopyMovelap}
                  onPasteMovelap={handlePasteMovelap}
                  savingFavorite={savingFavorite}
                  handleSaveAsFavorite={handleSaveAsFavorite}
                />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
      {onAddMovelap && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddMovelap();
          }}
          className="mt-2 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Add Movelap
        </button>
      )}
    </div>
  );
}

