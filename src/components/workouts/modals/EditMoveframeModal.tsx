/**
 * EditMoveframeModal Component
 * Modal for editing moveframe details
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SPORTS } from '@/config/workout.constants';
import { moveframeApi } from '@/utils/api.utils';
import type { Moveframe, Workout, WorkoutDay } from '@/types/workout.types';

interface EditMoveframeModalProps {
  moveframe: Moveframe;
  workout: Workout;
  day: WorkoutDay;
  onClose: () => void;
  onSave: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export default function EditMoveframeModal({
  moveframe,
  workout,
  day,
  onClose,
  onSave,
  onError,
  onSuccess
}: EditMoveframeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await moveframeApi.update(moveframe.id, {
        sport: formData.get('sport'),
        description: formData.get('description'),
        sectionName: formData.get('sectionName'),
        macroRest: formData.get('macroRest')
      });

      if (response.success) {
        onSuccess(`Moveframe ${moveframe.code} updated successfully!`);
        onSave();
        onClose();
      } else {
        onError(response.error || 'Failed to update moveframe');
      }
    } catch (error) {
      console.error('Error updating moveframe:', error);
      onError('Error updating moveframe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Edit Moveframe {moveframe.code}
            </h2>
            <p className="text-sm text-gray-500">
              Workout #{workout.sessionNumber} • {moveframe.sport}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sport *
            </label>
            <select
              name="sport"
              defaultValue={moveframe.sport}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              {Object.values(SPORTS).map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={moveframe.description || ''}
              placeholder="e.g., 100 FR x 10 A2 R20"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              disabled={isSubmitting}
            />
          </div>

          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Name
            </label>
            <input
              type="text"
              name="sectionName"
              defaultValue={moveframe.sectionName || ''}
              placeholder="e.g., Warm-up, Main Set, Cool-down"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Macro Rest */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Macro Rest
            </label>
            <input
              type="text"
              name="macroRest"
              defaultValue={moveframe.macroRest || ''}
              placeholder="e.g., 5:00 rest"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Read-only Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Moveframe Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Code:</span>
                <span className="ml-2 font-medium">{moveframe.code}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Distance:</span>
                <span className="ml-2 font-medium">{moveframe.totalDistance || 0}m</span>
              </div>
              <div>
                <span className="text-gray-500">Total Reps:</span>
                <span className="ml-2 font-medium">{moveframe.totalReps || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">Movelaps:</span>
                <span className="ml-2 font-medium">{moveframe.movelaps?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

