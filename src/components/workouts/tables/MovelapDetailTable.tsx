import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';

interface MovelapDetailTableProps {
  moveframe: any;
  onEditMovelap?: (movelap: any) => void;
  onDeleteMovelap?: (movelap: any) => void;
  onAddMovelap?: () => void;
}

export default function MovelapDetailTable({ 
  moveframe, 
  onEditMovelap, 
  onDeleteMovelap, 
  onAddMovelap 
}: MovelapDetailTableProps) {
  const movelaps = moveframe.movelaps || [];
  const moveframeLetter = moveframe.letter || 'A'; // Parent moveframe letter
  const sectionColor = moveframe.section?.color || '#5b8def';
  const sectionName = moveframe.section?.name || 'Default';
  const [savingFavorite, setSavingFavorite] = useState<string | null>(null);
  
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
    <div className="bg-gray-50 p-2">
      <table className="w-full border-collapse text-xs">
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
            <tr key={movelap.id} className="hover:bg-gray-100">
              {/* Move (Drag Handle) Column */}
              <td className="border border-gray-300 px-1 py-1 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <span
                  className="cursor-move text-gray-400 hover:text-gray-600 inline-block"
                  title="Drag to reorder movelap"
                >
                  <GripVertical size={12} />
                </span>
              </td>
              
              {/* MF (Moveframe Letter) Column */}
              <td className="border border-gray-300 px-1 py-1 text-center font-bold text-xs">
                {moveframeLetter}
              </td>
              
              {/* # (Repetition Number) Column */}
              <td className="border border-gray-300 px-1 py-1 text-center font-bold text-xs">
                {movelap.repetitionNumber || index + 1}
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
              
              {/* Aim & Snd Column */}
              <td className="border border-gray-300 px-1 py-1 text-center text-xs">
                {movelap.aim || movelap.sound ? '🔔' : '—'}
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
                      alert('Copy functionality - to be implemented');
                    }}
                    className="px-1 py-0.5 text-[9px] bg-green-500 text-white rounded hover:bg-green-600"
                    title="Copy movelap"
                  >
                    Copy
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Move functionality - to be implemented');
                    }}
                    className="px-1 py-0.5 text-[9px] bg-orange-500 text-white rounded hover:bg-orange-600"
                    title="Move movelap"
                  >
                    Move
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeleteMovelap) {
                        if (confirm(`Delete ${moveframeLetter}${movelap.repetitionNumber}?`)) {
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
          ))}
        </tbody>
      </table>
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

