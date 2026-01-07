/**
 * AddMovelapModal Component
 * Extracted modal for adding movelaps to a moveframe
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { REST_TYPES } from '@/config/workout.constants';
import { movelapApi } from '@/utils/api.utils';
import type { Moveframe, Workout, WorkoutDay } from '@/types/workout.types';

interface AddMovelapModalProps {
  moveframe: Moveframe;
  workout: Workout;
  day: WorkoutDay;
  onClose: () => void;
  onSave: (moveframeId: string, newMovelap?: any) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export default function AddMovelapModal({
  moveframe,
  workout,
  day,
  onClose,
  onSave,
  onError,
  onSuccess
}: AddMovelapModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const movelapData = {
      mode: 'APPEND',
      distance: parseInt(formData.get('distance') as string) || 0,
      speedCode: formData.get('speedCode') as string || '',
      style: formData.get('style') as string || '',
      pace: formData.get('pace') as string || '',
      time: formData.get('time') as string || '',
      pause: formData.get('pause') as string || '',
      restType: formData.get('restType') as string || 'SET_TIME',
      alarm: parseInt(formData.get('alarm') as string) || 0,
      notes: formData.get('notes') as string || ''
    };

    try {
      const response = await movelapApi.create(moveframe.id, movelapData);

      if (response.success && response.data) {
        onSuccess(`Movelap added to ${moveframe.letter || moveframe.code}`);
        // Pass the new movelap data to parent for local state update
        onSave(moveframe.id, response.data.movelap);
        onClose();
      } else {
        onError(response.error || 'Failed to add movelap');
      }
    } catch (error) {
      console.error('Error creating movelap:', error);
      onError('Error creating movelap');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999]">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add Movelap to Moveframe {moveframe.letter || moveframe.code}
            </h2>
            <p className="text-sm text-gray-500">
              Sport: {moveframe.sport} • Workout #{workout.sessionNumber}
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
          <div className="grid grid-cols-2 gap-4">
            {/* Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance (meters) *
              </label>
              <input
                type="number"
                name="distance"
                placeholder="100"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Speed Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speed Code
              </label>
              <input
                type="text"
                name="speedCode"
                placeholder="A1, A2, B1, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Style
              </label>
              <input
                type="text"
                name="style"
                placeholder="FR, BK, BR, FL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Pace */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pace
              </label>
              <input
                type="text"
                name="pace"
                placeholder="0:45:0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="text"
                name="time"
                placeholder="HH:MM:SS"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Pause */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pause/Rest
              </label>
              <input
                type="text"
                name="pause"
                placeholder="00:20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Rest Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rest Type
              </label>
              <select
                name="restType"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value={REST_TYPES.SET_TIME}>Set Time</option>
                <option value={REST_TYPES.RESTART_TIME}>Restart Time</option>
                <option value={REST_TYPES.RESTART_PULSE}>Restart Pulse</option>
              </select>
            </div>

            {/* Alarm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alarm
              </label>
              <input
                type="number"
                name="alarm"
                placeholder="-1 to -10"
                min="-10"
                max="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              placeholder="Optional notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              disabled={isSubmitting}
            />
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
              {isSubmitting ? 'Adding...' : 'Add Movelap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

