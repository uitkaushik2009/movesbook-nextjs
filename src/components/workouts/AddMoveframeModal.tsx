'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface AddMoveframeModalProps {
  workoutId: string;
  dayData?: any; // The entire day with all workouts
  currentWorkoutData?: any; // The current workout
  onClose: () => void;
  onSave: (moveframeData: any) => void;
}

const SPORTS = [
  'SWIM', 'BIKE', 'RUN', 'BODY_BUILDING', 'ROWING', 
  'SKATE', 'GYMNASTIC', 'STRETCHING', 'PILATES', 
  'SKI', 'TECHNICAL_MOVES', 'FREE_MOVES'
];

export default function AddMoveframeModal({
  workoutId,
  dayData,
  currentWorkoutData,
  onClose,
  onSave
}: AddMoveframeModalProps) {
  const [moveframeData, setMoveframeData] = useState({
    sport: 'SWIM',
    type: 'STANDARD',
    description: '',
    distance: '',
    repetitions: '1',
    speed: '',
    pause: ''
  });
  
  const [validationError, setValidationError] = useState<string>('');

  // Get all unique sports used in the entire day (across all workouts)
  const getDaySports = (): string[] => {
    if (!dayData || !dayData.workouts) return [];
    
    const allSports = new Set<string>();
    dayData.workouts.forEach((workout: any) => {
      if (workout.moveframes) {
        workout.moveframes.forEach((mf: any) => {
          allSports.add(mf.sport);
        });
      }
    });
    
    const sportsArray = Array.from(allSports);
    
    // Auto-exclude stretching if there are 4 sports and stretching is one of them
    // This is for counting purposes only - stretching can still be selected
    if (sportsArray.length === 4 && sportsArray.some(s => s.toLowerCase() === 'stretching')) {
      return sportsArray.filter(s => s.toLowerCase() !== 'stretching');
    }
    
    return sportsArray;
  };

  // Get all unique sports used in the current workout only
  const getWorkoutSports = (): string[] => {
    if (!currentWorkoutData || !currentWorkoutData.moveframes) return [];
    
    const workoutSports = new Set<string>();
    currentWorkoutData.moveframes.forEach((mf: any) => {
      workoutSports.add(mf.sport);
    });
    
    return Array.from(workoutSports);
  };

  // Check if a sport can be selected
  const canSelectSport = (sport: string): boolean => {
    const daySports = getDaySports();
    const workoutSports = getWorkoutSports();
    
    // If sport is already in the day, it can always be used
    if (daySports.includes(sport)) {
      return true;
    }
    
    // If day already has 4 different sports, cannot add a new one
    if (daySports.length >= 4) {
      return false;
    }
    
    // If sport is not in workout yet, check if workout has less than 4 sports
    if (!workoutSports.includes(sport) && workoutSports.length >= 4) {
      return false;
    }
    
    return true;
  };

  // Get reason why sport cannot be selected
  const getSportDisabledReason = (sport: string): string => {
    const daySports = getDaySports();
    const workoutSports = getWorkoutSports();
    
    if (daySports.includes(sport)) {
      return '';
    }
    
    if (daySports.length >= 4) {
      return `Day already has 4 sports (${daySports.join(', ')})`;
    }
    
    if (!workoutSports.includes(sport) && workoutSports.length >= 4) {
      return `Workout already has 4 sports (${workoutSports.join(', ')})`;
    }
    
    return '';
  };

  // Validate when sport changes
  useEffect(() => {
    const error = getSportDisabledReason(moveframeData.sport);
    setValidationError(error);
  }, [moveframeData.sport]);

  const handleSave = () => {
    // Final validation before save
    if (!canSelectSport(moveframeData.sport)) {
      alert('Cannot add this sport: ' + getSportDisabledReason(moveframeData.sport));
      return;
    }
    
    onSave({
      ...moveframeData,
      workoutId
    });
  };
  
  const handleSportChange = (newSport: string) => {
    if (canSelectSport(newSport)) {
      setMoveframeData({ ...moveframeData, sport: newSport });
    } else {
      // Show error but still allow selection (will be blocked on save)
      setMoveframeData({ ...moveframeData, sport: newSport });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Add Moveframe</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Sport Limits Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Sport Selection Rules:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Max 4 different sports per day (across all workouts)</li>
                  <li>Max 4 different sports per workout</li>
                  <li>Day sports: {getDaySports().length}/4 ({getDaySports().join(', ') || 'None'})</li>
                  <li>Workout sports: {getWorkoutSports().length}/4 ({getWorkoutSports().join(', ') || 'None'})</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-900">
                  <p className="font-semibold">Cannot use this sport:</p>
                  <p className="text-red-800">{validationError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sport Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sport *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SPORTS.map(sport => {
                const isDisabled = !canSelectSport(sport);
                const isSelected = moveframeData.sport === sport;
                const reason = getSportDisabledReason(sport);
                
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => handleSportChange(sport)}
                    disabled={isDisabled && !isSelected}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    }`}
                    title={isDisabled ? reason : `Select ${sport}`}
                  >
                    {sport.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setMoveframeData({ ...moveframeData, type: 'STANDARD' })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  moveframeData.type === 'STANDARD'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setMoveframeData({ ...moveframeData, type: 'BATTERY' })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  moveframeData.type === 'BATTERY'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Battery
              </button>
              <button
                onClick={() => setMoveframeData({ ...moveframeData, type: 'ANNOTATION' })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  moveframeData.type === 'ANNOTATION'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Annotation
              </button>
            </div>
          </div>

          {/* Distance & Reps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Distance (m)
              </label>
              <input
                type="number"
                value={moveframeData.distance}
                onChange={(e) => setMoveframeData({ ...moveframeData, distance: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Repetitions
              </label>
              <input
                type="number"
                value={moveframeData.repetitions}
                onChange={(e) => setMoveframeData({ ...moveframeData, repetitions: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10"
              />
            </div>
          </div>

          {/* Speed & Pause */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Speed/Pace
              </label>
              <input
                type="text"
                value={moveframeData.speed}
                onChange={(e) => setMoveframeData({ ...moveframeData, speed: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="A2, Easy, 1:30/100m"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rest/Pause
              </label>
              <input
                type="text"
                value={moveframeData.pause}
                onChange={(e) => setMoveframeData({ ...moveframeData, pause: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="20s, 1:00"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={moveframeData.description}
              onChange={(e) => setMoveframeData({ ...moveframeData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Exercise details..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add Moveframe
          </button>
        </div>
      </div>
    </div>
  );
}

