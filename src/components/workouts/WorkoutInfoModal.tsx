'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SPORT_OPTIONS, WORKOUT_SYMBOLS } from '@/constants/workout.constants';
import { isSeriesBasedSport, shouldShowDistance, getDistanceUnit } from '@/constants/moveframe.constants';

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
  const [workoutNotes, setWorkoutNotes] = useState(workout.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

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

  const handleNotesChange = async (newNotes: string) => {
    setWorkoutNotes(newNotes);
    setIsSavingNotes(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/workouts/sessions/${workout.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: newNotes || null })
      });

      if (!response.ok) {
        throw new Error('Failed to update workout notes');
      }
    } catch (error) {
      console.error('Error updating workout notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };
  
  // Calculate sports from moveframes (not from workout.sports)
  // Exclude STRETCHING if includeStretching is false
  const calculateSportsFromMoveframes = () => {
    const sportMap = new Map<string, {
      distance: number;
      durationMinutes: number;
      series: number;
      repetitions: number; // Total reps for series-based sports
      moveframeCount: number;
      movelapCount: number;
    }>();

    // Aggregate from moveframes
    (workout.moveframes || []).forEach((mf: any) => {
      const sport = mf.sport || 'UNKNOWN';
      const isSeries = isSeriesBasedSport(sport);
      
      const currentTotals = sportMap.get(sport) || {
        distance: 0,
        durationMinutes: 0,
        series: 0,
        repetitions: 0,
        moveframeCount: 0,
        movelapCount: 0
      };

      currentTotals.moveframeCount += 1;
      currentTotals.movelapCount += (mf.movelaps || []).length;
      
      if (isSeries) {
        // For series-based sports
        // For manual mode: use repetitions field, for standard mode: count movelaps
        const seriesCount = mf.manualMode ? (mf.repetitions || 0) : (mf.movelaps?.length || 0);
        console.log(`  [WorkoutInfoModal] Series-based sport ${sport}:`, {
          moveframeId: mf.id,
          letter: mf.letter,
          movelapCount: seriesCount,
          movelaps: mf.movelaps,
          repetitions: mf.repetitions
        });
        currentTotals.series += seriesCount;
        
        // Sum actual reps from all movelaps
        (mf.movelaps || []).forEach((lap: any) => {
          const reps = parseInt(lap.reps) || 0;
          currentTotals.repetitions += reps;
          console.log(`    Lap: ${reps} reps`);
        });
      } else {
        // For distance-based sports: sum distances and duration from movelaps
        (mf.movelaps || []).forEach((lap: any) => {
          // Add distance
          currentTotals.distance += parseInt(lap.distance) || 0;
          
          // Add duration (parse time in various formats: "1h23'45"6", "00:05:30", or minutes)
          const timeStr = lap.time?.toString() || '';
          if (timeStr) {
            let totalMins = 0;
            
            // Check for our custom format: 1h23'45"6
            if (timeStr.includes('h') || timeStr.includes("'")) {
              const match = timeStr.match(/(\d+)h(\d+)'(\d+)"(\d)?/);
              if (match) {
                const hours = parseInt(match[1]) || 0;
                const minutes = parseInt(match[2]) || 0;
                const seconds = parseInt(match[3]) || 0;
                const deciseconds = parseInt(match[4]) || 0;
                totalMins = (hours * 60) + minutes + (seconds / 60) + (deciseconds / 600);
              }
            }
            // Check for HH:MM:SS format
            else if (timeStr.includes(':')) {
              const parts = timeStr.split(':');
              const hours = parseInt(parts[0]) || 0;
              const minutes = parseInt(parts[1]) || 0;
              const seconds = parseInt(parts[2]) || 0;
              totalMins = (hours * 60) + minutes + (seconds / 60);
            }
            // Plain number (minutes)
            else {
              totalMins = parseFloat(timeStr) || 0;
            }
            
            if (totalMins > 0) {
              currentTotals.durationMinutes += totalMins;
            }
          }
        });
      }

      sportMap.set(sport, currentTotals);
    });

    // Convert to array with sport details
    let sportsArray = Array.from(sportMap.entries()).map(([sportValue, totals]) => {
      const sportOption = SPORT_OPTIONS.find(s => s.value === sportValue);
      const isSeries = isSeriesBasedSport(sportValue);
      
      console.log(`[WorkoutInfoModal] Final totals for ${sportValue}:`, {
        series: totals.series,
        repetitions: totals.repetitions,
        distance: totals.distance,
        moveframeCount: totals.moveframeCount,
        movelapCount: totals.movelapCount
      });
      
      return {
        sport: sportValue,
        details: sportOption,
        isSeriesBased: isSeries,
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] animate-fadeIn p-4"
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
              <span>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
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

          {/* Workout Annotations */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>📝</span>
              <span>Workout Annotations</span>
            </h3>
            <div className="relative">
              <textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                onBlur={() => handleNotesChange(workoutNotes)}
                disabled={isSavingNotes}
                placeholder="Add notes or annotations specific to this workout..."
                rows={4}
                className="w-full px-3 py-2.5 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all bg-white resize-none"
              />
              {isSavingNotes && (
                <span className="absolute right-3 bottom-3 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                  Saving...
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              These notes are specific to this workout only (not the entire day).
            </p>
          </div>

          {/* Main Sport (Editable) */}
          <div className={`p-4 rounded-lg border ${
            mainSport 
              ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200' 
              : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300'
          }`}>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>{mainSport ? '🏆' : '⚠️'}</span>
              <span>Main Sport (Note)</span>
              {!mainSport && (
                <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                  Not Set
                </span>
              )}
            </h3>
            <div className="relative">
              <select
                value={mainSport}
                onChange={(e) => handleMainSportChange(e.target.value)}
                disabled={isSavingMainSport}
                className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 text-sm transition-all ${
                  mainSport 
                    ? 'border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white'
                    : 'border-orange-400 focus:ring-orange-500 focus:border-orange-500 bg-orange-50 font-medium'
                }`}
              >
                <option value="">⚠️ Select main sport...</option>
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
              {mainSport 
                ? 'This is a note field that can be freely edited and does not affect workout structure.'
                : '💡 Tip: Setting the main sport helps organize and identify your workout type.'}
            </p>
          </div>

          {/* Sports from Moveframes (Read-only) */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>🏅</span>
              <span>Sports from Moveframes ({sports.length}/4)</span>
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              These sports are automatically loaded from moveframes (read-only). To change sports, add/edit moveframes.
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
                          
                          {sport.isSeriesBased ? (
                            // Series-based sports (Gymnastic, Stretching, etc.)
                            <>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Series:</span>
                                <span className="font-semibold text-purple-600">{sport.series}</span>
                              </div>
                              <div className="flex items-center gap-1 col-span-2">
                                <span className="text-gray-500">Total Reps:</span>
                                <span className="font-semibold text-blue-600">
                                  {sport.repetitions > 0 ? sport.repetitions : '—'}
                                </span>
                              </div>
                            </>
                          ) : (
                            // Distance-based sports (Swim, Bike, Run, etc.)
                            <>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Movelaps:</span>
                                <span className="font-semibold text-purple-600">{sport.movelapCount}</span>
                              </div>
                              {shouldShowDistance(sport.sport) && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Distance:</span>
                                  <span className="font-semibold text-blue-600">
                                    {sport.distance > 0 ? `${sport.distance}${getDistanceUnit(sport.sport)}` : '—'}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Duration:</span>
                                <span className="font-semibold text-green-600">
                                  {sport.durationMinutes > 0 ? formatDuration(sport.durationMinutes * 60) : '—'}
                                </span>
                              </div>
                            </>
                          )}
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
                    {sports.reduce((sum, s) => sum + (s.isSeriesBased ? 0 : s.distance), 0)}m
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="text-xs text-gray-500 mb-1">Total Duration</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatDuration(sports.reduce((sum, s) => sum + (s.isSeriesBased ? 0 : s.durationMinutes * 60), 0))}
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

