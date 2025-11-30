'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddWorkoutModalProps {
  dayId: string;
  sessionNumber: number;
  onClose: () => void;
  onSave: (workoutData: any) => void;
  existingWorkout?: any; // For editing existing workout
  mode?: 'add' | 'edit'; // Add or Edit mode
}

export default function AddWorkoutModal({
  dayId,
  sessionNumber,
  onClose,
  onSave,
  existingWorkout,
  mode = 'add'
}: AddWorkoutModalProps) {
  const [workoutData, setWorkoutData] = useState({
    name: existingWorkout?.name || `Workout ${sessionNumber}`,
    code: existingWorkout?.code || '',
    time: existingWorkout?.time || '',
    location: existingWorkout?.location || '',
    notes: existingWorkout?.notes || ''
  });

  const handleSave = () => {
    onSave({
      ...workoutData,
      sessionNumber,
      dayId,
      ...(existingWorkout && { id: existingWorkout.id }) // Include ID for edit mode
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit' : 'Add'} Workout #{sessionNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Workout Name
            </label>
            <input
              type="text"
              value={workoutData.name}
              onChange={(e) => setWorkoutData({ ...workoutData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Morning Training"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Code
            </label>
            <input
              type="text"
              value={workoutData.code}
              onChange={(e) => setWorkoutData({ ...workoutData, code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Workout code"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              value={workoutData.time}
              onChange={(e) => setWorkoutData({ ...workoutData, time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={workoutData.location}
              onChange={(e) => setWorkoutData({ ...workoutData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Pool, Track, Gym..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={workoutData.notes}
              onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
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
            {mode === 'edit' ? 'Save Changes' : 'Add Workout'}
          </button>
        </div>
      </div>
    </div>
  );
}

