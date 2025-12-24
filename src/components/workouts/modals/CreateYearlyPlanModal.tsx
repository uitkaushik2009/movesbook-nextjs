'use client';

import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface CreateYearlyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: Date) => void;
}

export default function CreateYearlyPlanModal({
  isOpen,
  onClose,
  onConfirm
}: CreateYearlyPlanModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedDate) {
      alert('Please select a start date');
      return;
    }

    setIsCreating(true);
    try {
      const startDate = new Date(selectedDate);
      await onConfirm(startDate);
      onClose();
    } catch (error) {
      console.error('Error creating yearly plan:', error);
      alert('Failed to create yearly plan');
    } finally {
      setIsCreating(false);
    }
  };

  // Get suggested start date (next Monday)
  const getNextMonday = () => {
    const date = new Date();
    const day = date.getDay();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    date.setDate(date.getDate() + daysUntilMonday);
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <h2 className="text-xl font-bold">Create Yearly Plan</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              disabled={isCreating}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 mb-2">
                <strong>📅 What will be created:</strong>
              </p>
              <ul className="text-sm text-blue-900 space-y-1 ml-4">
                <li>• <strong>Yearly Plan</strong>: 365 days (52 weeks) for planning workouts</li>
                <li>• <strong>Workouts Done</strong>: 365 days (52 weeks) to track completed workouts</li>
              </ul>
              <p className="text-xs text-blue-800 mt-3">
                💡 The system will automatically adjust to the nearest Monday.
              </p>
            </div>

            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="start-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isCreating}
              />
              <p className="mt-2 text-xs text-gray-500">
                Suggested: {getNextMonday()} (Next Monday)
              </p>
            </div>

            {/* Quick Select Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Quick Select:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedDate(getNextMonday())}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition-colors"
                  disabled={isCreating}
                >
                  Next Monday
                </button>
                <button
                  onClick={() => {
                    const date = new Date();
                    date.setMonth(0, 1); // January 1st of current year
                    // Find next year's January 1st if we're past current year's Jan 1st
                    if (date < new Date()) {
                      date.setFullYear(date.getFullYear() + 1);
                    }
                    setSelectedDate(date.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition-colors"
                  disabled={isCreating}
                >
                  Next Jan 1st
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || isCreating}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !selectedDate || isCreating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isCreating ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

