/**
 * EditDayModal Component
 * Extracted modal for editing workout day metadata
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { FEELING_STATUS_OPTIONS } from '@/config/workout.constants';
import { dayApi } from '@/utils/api.utils';
import { dateHelpers } from '@/utils/workout.helpers';
import type { WorkoutDay, Period } from '@/types/workout.types';

interface EditDayModalProps {
  day: WorkoutDay;
  periods: Period[];
  onClose: () => void;
  onSave: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export default function EditDayModal({
  day,
  periods,
  onClose,
  onSave,
  onError,
  onSuccess
}: EditDayModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await dayApi.update(day.id, {
        notes: formData.get('notes'),
        weather: formData.get('weather'),
        feelingStatus: formData.get('feelingStatus'),
        periodId: day.periodId // Keep existing period
      });

      if (response.success) {
        onSuccess('Day updated successfully!');
        onSave();
        onClose();
      } else {
        onError(response.error || 'Failed to update day');
      }
    } catch (error) {
      console.error('Error updating day:', error);
      onError('Error updating day');
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
            <h2 className="text-xl font-bold text-gray-900">Edit Day</h2>
            <p className="text-sm text-gray-500">
              {dateHelpers.formatDate(day.date, 'long')}
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
          {/* Weather */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weather
            </label>
            <input
              type="text"
              name="weather"
              defaultValue={day.weather || ''}
              placeholder="Sunny, Rainy, Cloudy, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Feeling/Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feeling (1-10)
            </label>
            <select
              name="feelingStatus"
              defaultValue={day.feelingStatus || '5'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              {FEELING_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes / Annotations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Annotations
            </label>
            <textarea
              name="notes"
              defaultValue={day.notes || ''}
              placeholder="Add any notes, observations, or annotations for this day..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use this field to store day annotations, training observations, how you felt, etc.
            </p>
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

