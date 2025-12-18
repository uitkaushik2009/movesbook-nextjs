'use client';

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

  const workoutSymbol = WORKOUT_SYMBOLS[workout.sessionNumber as 1 | 2 | 3] || { symbol: '○', label: 'Circle' };
  
  // Get sport details
  const sports = (workout.sports || []).map((ws: any) => {
    const sportOption = SPORT_OPTIONS.find(s => s.value === ws.sport);
    return {
      ...ws,
      details: sportOption
    };
  });

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

          {/* Sports */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>🏅</span>
              <span>Sports ({sports.length})</span>
            </h3>
            {sports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sports.map((sport: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className={`w-10 h-10 rounded-full ${sport.details?.color || 'bg-gray-200'} flex items-center justify-center text-lg font-bold text-white shadow-md`}>
                      {sport.details?.icon || '?'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {sport.details?.label || sport.sport}
                      </div>
                      <div className="text-xs text-gray-500">
                        Sport {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No sports selected</p>
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

          {/* Moveframes Count */}
          {workout.moveframes && workout.moveframes.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>📊</span>
                <span>Moveframes</span>
              </h3>
              <p className="text-sm text-gray-700">
                This workout has <span className="font-bold text-indigo-600">{workout.moveframes.length}</span> moveframe{workout.moveframes.length !== 1 ? 's' : ''}
              </p>
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

