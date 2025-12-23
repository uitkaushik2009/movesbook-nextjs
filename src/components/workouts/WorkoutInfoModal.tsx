'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SPORT_OPTIONS, WORKOUT_SYMBOLS } from '@/constants/workout.constants';

interface WorkoutInfoModalProps {
  isOpen: boolean;
  workout: any;
  day: any;
  onClose: () => void;
  onEdit: () => void;
}

export default function WorkoutInfoModal({
  isOpen,
  workout,
  day,
  onClose,
  onEdit
}: WorkoutInfoModalProps) {
  if (!isOpen || !workout) return null;

  const [mainSport, setMainSport] = useState(workout.mainSport || '');
  const [isSavingMainSport, setIsSavingMainSport] = useState(false);

  const workoutSymbol = WORKOUT_SYMBOLS[workout.sessionNumber as 1 | 2 | 3] || { symbol: '○', label: 'Circle' };
  
  const handleMainSportChange = async (newMainSport: string) => {
    setMainSport(newMainSport);
    setIsSavingMainSport(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/workouts/sessions/${workout.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mainSport: newMainSport || null })
      });

      if (!response.ok) {
        throw new Error('Failed to update main sport');
      }
    } catch (error) {
      console.error('Error updating main sport:', error);
    } finally {
      setIsSavingMainSport(false);
    }
  };
  
  // Calculate sports from moveframes (not from workout.sports)
  // Exclude STRETCHING if includeStretching is false
  const calculateSportsFromMoveframes = () => {
    const sportMap = new Map<string, {
      distance: number;
      durationSeconds: number;
      moveframeCount: number;
      movelapCount: number;
      seriesCount: number; // Total series/repetitions from all moveframes
    }>();

    // Aggregate from moveframes
    (workout.moveframes || []).forEach((mf: any) => {
      const sport = mf.sport || 'UNKNOWN';
      const currentTotals = sportMap.get(sport) || {
        distance: 0,
        durationSeconds: 0,
        moveframeCount: 0,
        movelapCount: 0,
        seriesCount: 0
      };

      currentTotals.moveframeCount += 1;
      currentTotals.movelapCount += (mf.movelaps || []).length;
      
      // For ALL sports: sum the repetitions/series from each moveframe
      // For distance-based sports: repetitions = number of laps planned
      // For series-based sports: repetitions = number of series planned
      const moveframeRepetitions = parseInt(mf.repetitions) || 0;
      currentTotals.seriesCount += moveframeRepetitions;
      
      // Calculate distance and duration from movelaps
      (mf.movelaps || []).forEach((lap: any) => {
        currentTotals.distance += parseInt(lap.distance) || 0;
        
        // Parse time in format like "1h23'45\"6" or "1'30\"5"
        const timeStr = lap.time || '';
        if (timeStr) {
          let totalSeconds = 0;
          const hoursMatch = timeStr.match(/(\d+)h/);
          const minutesMatch = timeStr.match(/(\d+)'/);
          const secondsMatch = timeStr.match(/(\d+)"/);
          const decimalsMatch = timeStr.match(/"(\d+)/);
          
          if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
          if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
          if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
          if (decimalsMatch) totalSeconds += parseFloat(`0.${decimalsMatch[1]}`);
          
          currentTotals.durationSeconds += totalSeconds;
        }
      });

      sportMap.set(sport, currentTotals);
    });

    // Convert to array with sport details
    let sportsArray = Array.from(sportMap.entries()).map(([sportValue, totals]) => {
      const sportOption = SPORT_OPTIONS.find(s => s.value === sportValue);
      return {
        sport: sportValue,
        details: sportOption,
        ...totals
      };
    });

    // Exclude STRETCHING if includeStretching is false
    if (workout.includeStretching === false) {
      sportsArray = sportsArray.filter(s => s.sport !== 'STRETCHING');
    }

    // Limit to 4 sports maximum (sorted alphabetically)
    return sportsArray.sort((a, b) => a.sport.localeCompare(b.sport)).slice(0, 4);
  };

  const sports = calculateSportsFromMoveframes();
  
  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto animate-slideUp mx-auto"
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg">
          <div>
            <h2 id="modal-title" className="text-xl font-bold flex items-center gap-2">
              <span>WORKOUT INFORMATION</span>
              <span className="text-2xl" aria-label={`Symbol: ${workoutSymbol.label}`}>
                {workoutSymbol.symbol}
              </span>
            </h2>
            <p className="text-sm text-blue-50 mt-1 flex items-center gap-2">
              <span className="font-medium">{day.period?.name || 'No Period'}</span>
              <span className="text-blue-200">•</span>
              <span>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>📋</span>
              <span>Basic Information</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 font-medium">Workout Name:</span>
                <span className="text-sm text-gray-900 font-semibold text-right">{workout.name || '—'}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 font-medium">Workout Code:</span>
                <span className="text-sm text-gray-900 font-mono font-semibold">{workout.code || '—'}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 font-medium">Session Number:</span>
                <span className="text-sm text-gray-900 font-semibold">#{workout.sessionNumber}</span>
              </div>
            </div>
          </div>

          {/* Main Sport (Editable) */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>🏆</span>
              <span>Main Sport (Note)</span>
            </h3>
            <div className="relative">
              <select
                value={mainSport}
                onChange={(e) => handleMainSportChange(e.target.value)}
                disabled={isSavingMainSport}
                className="w-full px-3 py-2.5 pr-10 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-white"
              >
                <option value="">Select main sport...</option>
                {SPORT_OPTIONS.map((sport) => (
                  <option key={sport.value} value={sport.value}>
                    {sport.icon} {sport.label}
                  </option>
                ))}
              </select>
              {isSavingMainSport && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  Saving...
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This is a note field that can be freely edited and does not affect workout structure.
            </p>
          </div>

          {/* Sports from Moveframes (Read-only) */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>🏅</span>
              <span>Sports from Moveframes ({sports.length}/4)</span>
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              These sports are automatically loaded from moveframes and cannot be edited directly.
              {workout.includeStretching === false && ' (Stretching excluded)'}
            </p>
            {sports.length > 0 ? (
              <div className="space-y-3">
                {sports.map((sport: any, index: number) => (
                  <div 
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* Sport Icon */}
                      <div className={`w-12 h-12 rounded-full ${sport.details?.color || 'bg-gray-200'} flex items-center justify-center text-xl font-bold text-white shadow-md flex-shrink-0`}>
                        {sport.details?.icon || '?'}
                      </div>
                      
                      {/* Sport Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold text-gray-800 mb-1">
                          {sport.details?.label || sport.sport.replace(/_/g, ' ')}
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Moveframes:</span>
                            <span className="font-semibold text-purple-600">{sport.moveframeCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Series/Reps:</span>
                            <span className="font-semibold text-purple-600">{sport.seriesCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Distance:</span>
                            <span className="font-semibold text-blue-600">
                              {sport.distance > 0 ? `${sport.distance}m` : '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Duration:</span>
                            <span className="font-semibold text-green-600">
                              {sport.durationSeconds > 0 ? formatDuration(sport.durationSeconds) : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 italic mb-2">No moveframes added yet</p>
                <p className="text-xs text-gray-400">Add moveframes to see sports and statistics</p>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>⚙️</span>
              <span>Options</span>
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                workout.includeStretching 
                  ? 'bg-green-500 border-green-500' 
                  : 'bg-white border-gray-300'
              }`}>
                {workout.includeStretching && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
              <span className="text-sm text-gray-700">
                <span className="font-medium">Include Stretching:</span>{' '}
                <span className={workout.includeStretching ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                  {workout.includeStretching ? 'Yes' : 'No'}
                </span>
              </span>
            </div>
          </div>

          {/* Context Information */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>📅</span>
              <span>Context</span>
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">Week:</span>
                <span className="text-sm text-gray-900 font-semibold">{day.weekNumber || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">Day:</span>
                <span className="text-sm text-gray-900 font-semibold">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">Period:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: day.period?.color || '#9CA3AF' }}
                  />
                  <span className="text-sm text-gray-900 font-semibold">{day.period?.name || 'No Period'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Workout Statistics */}
          {workout.moveframes && workout.moveframes.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span>📊</span>
                <span>Workout Statistics</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="text-xs text-gray-500 mb-1">Moveframes</div>
                  <div className="text-2xl font-bold text-indigo-600">{workout.moveframes.length}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="text-xs text-gray-500 mb-1">Total Movelaps</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {workout.moveframes.reduce((sum: number, mf: any) => sum + (mf.movelaps?.length || 0), 0)}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="text-xs text-gray-500 mb-1">Total Distance</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {sports.reduce((sum, s) => sum + s.distance, 0)}m
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="text-xs text-gray-500 mb-1">Total Duration</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatDuration(sports.reduce((sum, s) => sum + s.durationSeconds, 0))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gradient-to-r from-gray-50 to-blue-50">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition-all font-medium shadow-sm"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <span>✏️</span>
            <span>Edit Workout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

