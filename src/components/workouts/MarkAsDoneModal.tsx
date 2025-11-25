'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Heart, Flame, Smile } from 'lucide-react';

interface MarkAsDoneModalProps {
  workoutSession: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function MarkAsDoneModal({
  workoutSession,
  onClose,
  onSave
}: MarkAsDoneModalProps) {
  const [completionPercentage, setCompletionPercentage] = useState(100);
  const [asDifferent, setAsDifferent] = useState(false);
  const [actualHeartRateMax, setActualHeartRateMax] = useState(workoutSession.heartRateMax || '');
  const [actualHeartRateAvg, setActualHeartRateAvg] = useState(workoutSession.heartRateAvg || '');
  const [actualCalories, setActualCalories] = useState(workoutSession.calories || '');
  const [actualFeelingStatus, setActualFeelingStatus] = useState(workoutSession.feelingStatus || 3);
  const [actualNotes, setActualNotes] = useState(workoutSession.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const data = {
      completionPercentage: asDifferent ? 100 : completionPercentage,
      asDifferent,
      actualHeartRateMax: actualHeartRateMax ? parseInt(actualHeartRateMax) : null,
      actualHeartRateAvg: actualHeartRateAvg ? parseInt(actualHeartRateAvg) : null,
      actualCalories: actualCalories ? parseInt(actualCalories) : null,
      actualFeelingStatus,
      actualNotes,
      completedAt: new Date().toISOString()
    };

    await onSave(data);
    setIsSaving(false);
  };

  const getStatusColor = () => {
    if (asDifferent) return 'blue';
    if (completionPercentage < 75) return 'yellow';
    return 'green';
  };

  const getStatusText = () => {
    if (asDifferent) return 'Done Differently';
    if (completionPercentage < 75) return 'Done <75%';
    return 'Done >75%';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 border-b bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Mark Workout as Done</h2>
              <p className="text-green-100 text-sm">{workoutSession.name || `Session ${workoutSession.sessionNumber}`}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Completion Type */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              How did you complete this workout?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAsDifferent(false)}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  !asDifferent
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CheckCircle className={`w-6 h-6 mb-2 ${!asDifferent ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="font-semibold text-gray-900">As Planned</div>
                <div className="text-xs text-gray-600">Followed the workout plan</div>
              </button>

              <button
                type="button"
                onClick={() => setAsDifferent(true)}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  asDifferent
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className={`w-6 h-6 mb-2 ${asDifferent ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="font-semibold text-gray-900">Differently</div>
                <div className="text-xs text-gray-600">Modified from plan</div>
              </button>
            </div>
          </div>

          {/* Completion Percentage (only if not "as different") */}
          {!asDifferent && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Completion Percentage: <span className="text-lg font-bold text-green-600">{completionPercentage}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={completionPercentage}
                onChange={(e) => setCompletionPercentage(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Status Preview */}
          <div className={`p-4 rounded-lg border-2 ${
            getStatusColor() === 'blue' ? 'border-blue-500 bg-blue-50' :
            getStatusColor() === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
            'border-green-500 bg-green-50'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                getStatusColor() === 'blue' ? 'bg-blue-500' :
                getStatusColor() === 'yellow' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}></div>
              <span className="font-semibold text-gray-900">Status: {getStatusText()}</span>
            </div>
          </div>

          {/* Actual Performance Data */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Actual Performance Data
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Max Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={actualHeartRateMax}
                  onChange={(e) => setActualHeartRateMax(e.target.value)}
                  placeholder="e.g., 180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Avg Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={actualHeartRateAvg}
                  onChange={(e) => setActualHeartRateAvg(e.target.value)}
                  placeholder="e.g., 145"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Calories Burned
                </label>
                <input
                  type="number"
                  value={actualCalories}
                  onChange={(e) => setActualCalories(e.target.value)}
                  placeholder="e.g., 650"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Smile className="w-3 h-3" />
                  Feeling (1-5)
                </label>
                <select
                  value={actualFeelingStatus}
                  onChange={(e) => setActualFeelingStatus(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value={1}>1 - Very Bad</option>
                  <option value={2}>2 - Bad</option>
                  <option value={3}>3 - Okay</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={actualNotes}
              onChange={(e) => setActualNotes(e.target.value)}
              placeholder="How did the workout feel? Any observations?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold transition ${
                isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
            >
              {isSaving ? 'Saving...' : 'Mark as Done'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

