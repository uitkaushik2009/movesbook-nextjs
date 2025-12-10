'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Sport options with icons and colors (matching database enum SportType)
const SPORT_OPTIONS = [
  { value: 'SWIM', label: 'Swim', icon: '🏊', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'BIKE', label: 'Bike', icon: '🚴', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'RUN', label: 'Run', icon: '🏃', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'BODY_BUILDING', label: 'Body Building', icon: '💪', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'ROWING', label: 'Rowing', icon: '🚣', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { value: 'SKATE', label: 'Skate', icon: '⛸️', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { value: 'GYMNASTIC', label: 'Gymnastic', icon: '🤸', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'STRETCHING', label: 'Stretching', icon: '🧘', color: 'bg-pink-100 text-pink-700 border-pink-300' },
  { value: 'PILATES', label: 'Pilates', icon: '🧘‍♀️', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { value: 'YOGA', label: 'Yoga', icon: '🧘‍♂️', color: 'bg-violet-100 text-violet-700 border-violet-300' },
  { value: 'SKI', label: 'Ski', icon: '⛷️', color: 'bg-sky-100 text-sky-700 border-sky-300' },
  { value: 'SNOWBOARD', label: 'Snowboard', icon: '🏂', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { value: 'TECHNICAL_MOVES', label: 'Technical Moves', icon: '⚙️', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'FREE_MOVES', label: 'Free Moves', icon: '🤾', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'SOCCER', label: 'Soccer', icon: '⚽', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'BASKETBALL', label: 'Basketball', icon: '🏀', color: 'bg-orange-100 text-orange-800 border-orange-400' },
  { value: 'TENNIS', label: 'Tennis', icon: '🎾', color: 'bg-lime-100 text-lime-700 border-lime-300' },
  { value: 'VOLLEYBALL', label: 'Volleyball', icon: '🏐', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'GOLF', label: 'Golf', icon: '⛳', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { value: 'BOXING', label: 'Boxing', icon: '🥊', color: 'bg-red-100 text-red-800 border-red-400' },
  { value: 'MARTIAL_ARTS', label: 'Martial Arts', icon: '🥋', color: 'bg-stone-100 text-stone-700 border-stone-300' },
  { value: 'CLIMBING', label: 'Climbing', icon: '🧗', color: 'bg-orange-100 text-orange-800 border-orange-400' },
  { value: 'HIKING', label: 'Hiking', icon: '🥾', color: 'bg-green-100 text-green-800 border-green-400' },
  { value: 'WALKING', label: 'Walking', icon: '🚶', color: 'bg-slate-100 text-slate-600 border-slate-300' },
  { value: 'DANCING', label: 'Dancing', icon: '💃', color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300' },
  { value: 'CROSSFIT', label: 'CrossFit', icon: '🏋️', color: 'bg-zinc-100 text-zinc-700 border-zinc-300' },
  { value: 'TRIATHLON', label: 'Triathlon', icon: '🏊‍♂️', color: 'bg-blue-100 text-blue-800 border-blue-400' },
  { value: 'TRACK_FIELD', label: 'Track & Field', icon: '🏃‍♀️', color: 'bg-green-100 text-green-700 border-green-300' }
];

// Workout symbols
const WORKOUT_SYMBOLS = {
  1: { symbol: '○', label: 'Circle' },
  2: { symbol: '□', label: 'Square' },
  3: { symbol: '△', label: 'Triangle' }
};

interface AddWorkoutModalProps {
  isOpen: boolean;
  day: any; // Day object with week, date, period info
  existingWorkouts: any[]; // Array of existing workouts in the day
  onClose: () => void;
  onSave: (workoutData: any) => Promise<void>;
}

export default function AddWorkoutModal({
  isOpen,
  day,
  existingWorkouts,
  onClose,
  onSave
}: AddWorkoutModalProps) {
  // Calculate next available workout number (1, 2, or 3)
  const getNextAvailableSessionNumber = () => {
    const usedNumbers = new Set(existingWorkouts.map((w: any) => w.sessionNumber));
    for (let i = 1; i <= 3; i++) {
      if (!usedNumbers.has(i)) {
        return i;
      }
    }
    return 1; // Fallback
  };
  
  const workoutNumber = getNextAvailableSessionNumber();
  const workoutSymbol = WORKOUT_SYMBOLS[workoutNumber as 1 | 2 | 3];

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    sports: [null, null, null, null] as (string | null)[],
    includeStretching: false
  });

  // Validation state
  const [validation, setValidation] = useState({
    name: { valid: true, message: '' },
    code: { valid: true, message: '' },
    sports: { valid: true, message: '' }
  });

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        code: '',
        sports: [null, null, null, null],
        includeStretching: false
      });
      setValidation({
        name: { valid: true, message: '' },
        code: { valid: true, message: '' },
        sports: { valid: true, message: '' }
      });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Real-time validation for name
  const validateName = (value: string) => {
    if (!value.trim()) {
      return { valid: false, message: 'Workout name is required' };
    }
    
    // Check uniqueness (case-insensitive)
    const isDuplicate = existingWorkouts.some(
      w => w.name?.toLowerCase() === value.toLowerCase()
    );
    
    if (isDuplicate) {
      return { valid: false, message: 'This name already exists for today' };
    }
    
    return { valid: true, message: '' };
  };

  // Real-time validation for code
  const validateCode = (value: string) => {
    if (!value.trim()) {
      return { valid: false, message: 'Workout code is required' };
    }
    
    // Check uniqueness (case-insensitive)
    const isDuplicate = existingWorkouts.some(
      w => w.code?.toLowerCase() === value.toLowerCase()
    );
    
    if (isDuplicate) {
      return { valid: false, message: 'This code already exists for today' };
    }
    
    return { valid: true, message: '' };
  };

  // Validate sports selection
  const validateSports = (sports: (string | null)[]) => {
    const selectedCount = sports.filter(s => s !== null).length;
    if (selectedCount === 0) {
      return { valid: false, message: 'Please select at least one sport' };
    }
    return { valid: true, message: '' };
  };

  // Handle name change
  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    const nameValidation = validateName(value);
    setValidation({ ...validation, name: nameValidation });
  };

  // Handle code change
  const handleCodeChange = (value: string) => {
    setFormData({ ...formData, code: value });
    const codeValidation = validateCode(value);
    setValidation({ ...validation, code: codeValidation });
  };

  // Handle sport selection
  const handleSportChange = (index: number, value: string | null) => {
    const newSports = [...formData.sports];
    newSports[index] = value;
    setFormData({ ...formData, sports: newSports });
    
    const sportsValidation = validateSports(newSports);
    setValidation({ ...validation, sports: sportsValidation });
  };

  // Count selected sports
  const selectedSportsCount = formData.sports.filter(s => s !== null).length;

  // Check if form is valid
  const isFormValid = () => {
    const nameVal = validateName(formData.name);
    const codeVal = validateCode(formData.code);
    const sportsVal = validateSports(formData.sports);
    
    setValidation({
      name: nameVal,
      code: codeVal,
      sports: sportsVal
    });
    
    return nameVal.valid && codeVal.valid && sportsVal.valid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const workoutData = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        sessionNumber: workoutNumber,
        symbol: workoutSymbol.symbol,
        sports: formData.sports.filter(s => s !== null),
        includeStretching: formData.includeStretching,
        dayId: day.id,
        weekNumber: day.weekNumber,
        date: day.date,
        periodId: day.periodId
      };
      
      await onSave(workoutData);
      onClose();
    } catch (error) {
      console.error('Error creating workout:', error);
      // Could add error display here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  // Check if maximum workouts reached
  if (existingWorkouts.length >= 3) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="bg-white rounded-lg shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b bg-red-500 text-white">
            <h2 className="text-xl font-bold">⚠️ Maximum Workouts Reached</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              You can only add up to <strong>3 workouts per day</strong>. This day already has 3 workouts.
            </p>
            <p className="text-sm text-gray-600">
              Please delete an existing workout if you want to add a new one.
            </p>
          </div>
          <div className="p-4 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto animate-slideUp mx-auto"
        onKeyDown={handleKeyDown}
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold flex items-center gap-3">
              <span>ADD WORKOUT #{workoutNumber}</span>
              <span className="text-4xl animate-pulse" aria-label={`Symbol: ${workoutSymbol.label}`}>{workoutSymbol.symbol}</span>
            </h2>
            <p id="modal-description" className="text-sm text-blue-50 mt-1.5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-white/60"></span>
              <span className="font-medium">{day.period?.name || 'No Period'}</span>
              <span className="text-blue-200">•</span>
              <span>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
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

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: Workout Identification */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg shadow-md">
                {workoutSymbol.symbol}
              </div>
              <span className="text-base">Workout #{workoutNumber}</span>
            </div>

            {/* Workout Name */}
            <div>
              <label htmlFor="workout-name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <span>Workout Name</span>
                <span className="text-red-500 text-base" aria-label="required">*</span>
              </label>
              <input
                id="workout-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => handleNameChange(formData.name)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  !validation.name.valid ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="e.g., Morning Run, Evening Swim"
                autoFocus
                aria-required="true"
                aria-invalid={!validation.name.valid}
                aria-describedby={!validation.name.valid ? "name-error" : undefined}
              />
              {!validation.name.valid && (
                <p id="name-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
                  <span>⚠️</span>
                  <span>{validation.name.message}</span>
                </p>
              )}
            </div>

            {/* Workout Code */}
            <div>
              <label htmlFor="workout-code" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <span>Workout Code</span>
                <span className="text-red-500 text-base" aria-label="required">*</span>
              </label>
              <input
                id="workout-code"
                type="text"
                value={formData.code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onBlur={() => handleCodeChange(formData.code)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono ${
                  !validation.code.valid ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="e.g., WRK001, TR-123"
                aria-required="true"
                aria-invalid={!validation.code.valid}
                aria-describedby={!validation.code.valid ? "code-error" : undefined}
              />
              {!validation.code.valid && (
                <p id="code-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
                  <span>⚠️</span>
                  <span>{validation.code.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Sports Selection */}
          <div className="space-y-3 bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <span>🏅</span>
                <span>Select Sports (max 4)</span>
                <span className="text-red-500 text-base" aria-label="required">*</span>
              </label>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                selectedSportsCount === 0 ? 'bg-gray-200 text-gray-600' :
                selectedSportsCount === 4 ? 'bg-green-200 text-green-700' :
                'bg-blue-200 text-blue-700'
              }`}>
                {selectedSportsCount}/4
              </span>
            </div>

            {/* Sports Grid (2x2 on desktop, 1 column on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((index) => {
                const selectedSport = SPORT_OPTIONS.find(s => s.value === formData.sports[index]);
                return (
                  <div key={index} className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                      <span className="text-blue-500">●</span>
                      <span>Sport {index + 1}</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.sports[index] || ''}
                        onChange={(e) => handleSportChange(index, e.target.value || null)}
                        disabled={selectedSportsCount >= 4 && !formData.sports[index]}
                        className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all ${
                          selectedSportsCount >= 4 && !formData.sports[index]
                            ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                            : selectedSport 
                              ? `${selectedSport.color} border-current font-medium`
                              : 'bg-white hover:border-gray-400'
                        } ${!validation.sports.valid && index === 0 ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select sport...</option>
                        {SPORT_OPTIONS.map((sport) => (
                          <option key={sport.value} value={sport.value}>
                            {sport.icon} {sport.label}
                          </option>
                        ))}
                      </select>
                      {formData.sports[index] && (
                        <button
                          onClick={() => handleSportChange(index, null)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-100 rounded-full transition-colors"
                          title="Clear selection"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!validation.sports.valid && (
              <p id="sports-error" className="text-xs text-red-600 flex items-center gap-1" role="alert">
                <span>⚠️</span>
                <span>{validation.sports.message}</span>
              </p>
            )}

            {/* Include Stretching Checkbox */}
            <div className="flex items-center gap-2 pt-2 bg-white p-3 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="stretching"
                checked={formData.includeStretching}
                onChange={(e) => setFormData({ ...formData, includeStretching: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="stretching" className="text-sm text-gray-700 flex items-center gap-1.5 cursor-pointer">
                <span>🧘</span>
                <span>Include Stretching (optional)</span>
              </label>
            </div>
          </div>

          {/* Section 3: Context Display */}
          <div className="border-t border-b border-gray-200 py-4 bg-gray-50 -mx-6 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Week:</span>
                <span className="ml-2 text-gray-900">{day.weekNumber || '—'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Day:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <span className="text-gray-600 font-medium">Period:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border border-gray-400"
                    style={{ backgroundColor: day.period?.color || '#9CA3AF' }}
                  />
                  <span className="text-gray-900">{day.period?.name || 'No Period'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t bg-gradient-to-r from-gray-50 to-blue-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition-all font-medium disabled:opacity-50 order-2 sm:order-1 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !validation.name.valid || !validation.code.valid || !validation.sports.valid}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Create Workout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
