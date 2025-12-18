'use client';

import { X } from 'lucide-react';
import { 
  SPORT_OPTIONS, 
  WORKOUT_SYMBOLS, 
  getNextAvailableSessionNumber 
} from '@/constants/workout.constants';
import { useWorkoutForm } from '@/hooks/useWorkoutForm';

interface AddWorkoutModalProps {
  isOpen: boolean;
  day: any; // Day object with week, date, period info
  existingWorkouts: any[]; // Array of existing workouts in the day
  mode?: 'add' | 'edit' | 'view';
  existingWorkout?: any; // Workout to edit (when mode is 'edit' or 'view')
  onClose: () => void;
  onSave: (workoutData: any) => Promise<void>;
  onEdit?: () => void; // Callback when switching from view to edit mode
}

export default function AddWorkoutModal({
  isOpen,
  day,
  existingWorkouts,
  mode = 'add',
  existingWorkout,
  onClose,
  onSave,
  onEdit
}: AddWorkoutModalProps) {
  const isViewMode = mode === 'view';
  // Calculate next available workout number (1, 2, or 3)
  const workoutNumber = getNextAvailableSessionNumber(existingWorkouts);
  const workoutSymbol = WORKOUT_SYMBOLS[workoutNumber as 1 | 2 | 3];

  // Use custom hook for form management
  const {
    formData,
    validation,
    isSubmitting,
    moveframeSports,
    selectedSportsCount,
    isSportFromMoveframe,
    canManuallySelectSport,
    handleNameChange,
    handleCodeChange,
    handleSportChange,
    handleStretchingChange,
    handleSubmit,
    handleKeyDown
  } = useWorkoutForm({
    isOpen,
    mode,
    existingWorkout,
    existingWorkouts,
    day,
    workoutNumber,
    workoutSymbol,
    onSave,
    onClose
  });

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto animate-slideUp mx-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none'  /* IE and Edge */
        }}
        onKeyDown={handleKeyDown}
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg">
          <div>
            <h2 id="modal-title" className="text-lg font-bold flex items-center gap-2">
              <span>{mode === 'view' ? 'WORKOUT INFO' : mode === 'edit' ? 'EDIT WORKOUT' : `ADD WORKOUT #${workoutNumber}`}</span>
              {(mode === 'edit' || mode === 'view') && existingWorkout && (
                <span className="text-2xl" aria-label={`Symbol: ${WORKOUT_SYMBOLS[existingWorkout.sessionNumber as 1 | 2 | 3]?.label || 'Circle'}`}>
                  {WORKOUT_SYMBOLS[existingWorkout.sessionNumber as 1 | 2 | 3]?.symbol || '○'}
                </span>
              )}
              {mode === 'add' && (
                <span className="text-2xl animate-pulse" aria-label={`Symbol: ${workoutSymbol.label}`}>{workoutSymbol.symbol}</span>
              )}
            </h2>
            <p id="modal-description" className="text-xs text-blue-50 mt-0.5 flex items-center gap-2">
              <span className="font-medium">{day.period?.name || 'No Period'}</span>
              <span className="text-blue-200">•</span>
              <span>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-3">
          {/* Section 1: Workout Identification */}
          <div className="space-y-2">
            {/* Workout Name */}
            <div>
              <label htmlFor="workout-name" className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <span>Workout Name</span>
                <span className="text-red-500 text-sm" aria-label="required">*</span>
              </label>
              <input
                id="workout-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => handleNameChange(formData.name)}
                disabled={isViewMode}
                className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm ${
                  !validation.name.valid ? 'border-red-500 bg-red-50' : isViewMode ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="e.g., Morning Run, Evening Swim"
                autoFocus={!isViewMode}
                aria-required="true"
                aria-invalid={!validation.name.valid}
                aria-describedby={!validation.name.valid ? "name-error" : undefined}
              />
              {!validation.name.valid && (
                <p id="name-error" className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
                  <span>⚠️</span>
                  <span>{validation.name.message}</span>
                </p>
              )}
            </div>

            {/* Workout Code */}
            <div>
              <label htmlFor="workout-code" className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <span>Workout Code</span>
                <span className="text-red-500 text-sm" aria-label="required">*</span>
              </label>
              <input
                id="workout-code"
                type="text"
                value={formData.code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onBlur={() => handleCodeChange(formData.code)}
                disabled={isViewMode}
                className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm ${
                  !validation.code.valid ? 'border-red-500 bg-red-50' : isViewMode ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="e.g., WRK001, TR-123"
                aria-required="true"
                aria-invalid={!validation.code.valid}
                aria-describedby={!validation.code.valid ? "code-error" : undefined}
              />
              {!validation.code.valid && (
                <p id="code-error" className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
                  <span>⚠️</span>
                  <span>{validation.code.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Sports Selection */}
          <div className="space-y-2 bg-gradient-to-br from-gray-50 to-blue-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <span>🏅</span>
                <span>Select Sports (max 4)</span>
                <span className="text-red-500 text-sm" aria-label="required">*</span>
              </label>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                selectedSportsCount === 0 ? 'bg-gray-200 text-gray-600' :
                selectedSportsCount === 4 ? 'bg-green-200 text-green-700' :
                'bg-blue-200 text-blue-700'
              }`}>
                {selectedSportsCount}/4
              </span>
            </div>

            {/* Sports Grid (2x2 on desktop, 1 column on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((index) => {
                const selectedSport = SPORT_OPTIONS.find(s => s.value === formData.sports[index]);
                const isFromMoveframe = isSportFromMoveframe(index);
                const canSelect = canManuallySelectSport(index);
                const isDisabled = !canSelect && !formData.sports[index];
                
                return (
                  <div key={index} className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                      <span className="text-blue-500">●</span>
                      <span>Sport {index + 1}</span>
                      {isFromMoveframe && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded" title="Auto-loaded from moveframes">
                          📋 Auto
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.sports[index] || ''}
                        onChange={(e) => handleSportChange(index, e.target.value || null)}
                        disabled={isFromMoveframe || isDisabled || isViewMode}
                        className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all ${
                          isFromMoveframe
                            ? 'bg-blue-50 cursor-not-allowed border-blue-300 text-blue-800 font-medium'
                            : isDisabled || isViewMode
                            ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                            : selectedSport 
                              ? `${selectedSport.color} border-current font-medium`
                              : 'bg-white hover:border-gray-400'
                        } ${!validation.sports.valid && index === 0 ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">{isFromMoveframe ? 'From moveframes' : 'Select sport...'}</option>
                        {SPORT_OPTIONS.map((sport) => (
                          <option key={sport.value} value={sport.value}>
                            {sport.icon} {sport.label}
                          </option>
                        ))}
                      </select>
                      {formData.sports[index] && !isFromMoveframe && !isViewMode && (
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
            
            {/* Info message for auto-loaded sports */}
            {mode === 'add' && moveframeSports.length > 0 && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-start gap-2">
                <span className="text-sm">ℹ️</span>
                <div>
                  <div className="font-medium">Sports auto-loaded from moveframes</div>
                  <div className="text-blue-500 mt-0.5">
                    {moveframeSports.length < 4 && (
                      <span>You can manually select {4 - moveframeSports.length} more sport{4 - moveframeSports.length > 1 ? 's' : ''}.</span>
                    )}
                    {moveframeSports.length >= 4 && (
                      <span>Maximum 4 sports reached. Sports are from your moveframes.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Include Stretching Checkbox */}
            <div className="flex items-center gap-2 pt-2 bg-white p-3 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="stretching"
                checked={formData.includeStretching}
                onChange={(e) => handleStretchingChange(e.target.checked)}
                disabled={isViewMode}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          {isViewMode ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition-all font-medium order-2 sm:order-1 shadow-sm"
              >
                Close
              </button>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center justify-center gap-2 order-1 sm:order-2 shadow-lg hover:shadow-xl"
                >
                  <span>✏️</span>
                  <span>Edit Workout</span>
                </button>
              )}
            </>
          ) : (
            <>
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
                    <span>{mode === 'edit' ? 'Saving...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>{mode === 'edit' ? 'Save Changes' : 'Create Workout'}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
