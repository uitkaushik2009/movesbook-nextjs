'use client';

import { useState } from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';

interface PrintWorkoutModalProps {
  onClose: () => void;
  selectedDay: string | null;
  selectedWorkout: string | null;
  workoutPlan: any;
}

export default function PrintWorkoutModal({
  onClose,
  selectedDay,
  selectedWorkout,
  workoutPlan
}: PrintWorkoutModalProps) {
  const [printScope, setPrintScope] = useState<'day' | 'week' | 'all'>('day');
  const [includeMovelaps, setIncludeMovelaps] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const token = localStorage.getItem('token');
      let url = `/api/workouts/export?format=${format}`;
      
      if (printScope === 'day' && selectedDay) {
        url += `&dayId=${selectedDay}`;
      } else if (printScope === 'week') {
        // Get week number from selected day
        let weekNumber = 1;
        workoutPlan?.weeks?.forEach((week: any) => {
          week.days?.forEach((day: any) => {
            if (day.id === selectedDay) {
              weekNumber = week.weekNumber;
            }
          });
        });
        url += `&weekNumber=${weekNumber}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `workouts.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        alert(`Workouts exported as ${format.toUpperCase()}!`);
      } else {
        alert('Failed to export workouts');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export workouts');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <Printer className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Print / Export</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Scope Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              What to Print/Export
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="printScope"
                  value="day"
                  checked={printScope === 'day'}
                  onChange={() => setPrintScope('day')}
                  disabled={!selectedDay}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Current Day</div>
                  <div className="text-xs text-gray-600">Print the selected day's workouts</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="printScope"
                  value="week"
                  checked={printScope === 'week'}
                  onChange={() => setPrintScope('week')}
                  disabled={!selectedDay}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Current Week</div>
                  <div className="text-xs text-gray-600">Print all days in this week</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="printScope"
                  value="all"
                  checked={printScope === 'all'}
                  onChange={() => setPrintScope('all')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Entire Plan</div>
                  <div className="text-xs text-gray-600">Print all weeks and workouts</div>
                </div>
              </label>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Options
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMovelaps}
                onChange={(e) => setIncludeMovelaps(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Include movelap details</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Include notes</span>
            </label>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              <Printer className="w-5 h-5" />
              <span>Print</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport('json')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
              >
                <FileText className="w-4 h-4" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

