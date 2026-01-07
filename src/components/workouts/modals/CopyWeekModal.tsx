import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CopyWeekModalProps {
  isOpen: boolean;
  sourceWeek: any;
  allWeeks: any[];
  onClose: () => void;
  onCopy: (targetWeekId: string) => Promise<void>;
}

export default function CopyWeekModal({ 
  isOpen, 
  sourceWeek, 
  allWeeks, 
  onClose, 
  onCopy 
}: CopyWeekModalProps) {
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !sourceWeek) return null;

  const handleCopy = async () => {
    if (!selectedWeekId) {
      console.error('❌ Please select a target week');
      return;
    }

    if (selectedWeekId === sourceWeek.id) {
      console.error('❌ Cannot copy to the same week');
      return;
    }

    try {
      setIsLoading(true);
      await onCopy(selectedWeekId);
      onClose();
      setSelectedWeekId('');
    } catch (error) {
      console.error('Error copying week:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100000] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Copy Week</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Source:</span> Week {sourceWeek.weekNumber}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            This will copy all data from Week {sourceWeek.weekNumber} to the selected target week (excluding day-specific info).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Target Week (Yearly Plan)
          </label>
          <select
            value={selectedWeekId}
            onChange={(e) => setSelectedWeekId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">-- Select a week in Yearly Plan --</option>
            {allWeeks.map((week) => {
              const isSourceWeek = week.id === sourceWeek.id;
              return (
                <option 
                  key={week.id} 
                  value={week.id}
                  disabled={isSourceWeek}
                  style={{ 
                    color: isSourceWeek ? '#9ca3af' : 'inherit',
                    backgroundColor: isSourceWeek ? '#f3f4f6' : 'inherit'
                  }}
                >
                  Week {week.weekNumber} {isSourceWeek ? '(Source - Cannot Copy)' : `- ${week.days?.[0] ? new Date(week.days[0].date).toLocaleDateString() : 'N/A'}`}
                </option>
              );
            })}
          </select>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Note:</strong> This will copy all workouts, moveframes, and movelaps from the source week to the target week. Day-specific info (date, notes) will remain unchanged in the target week.
          </p>
        </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !selectedWeekId}
          >
            {isLoading ? 'Copying...' : 'Copy Week'}
          </button>
        </div>
      </div>
    </div>
  );
}

