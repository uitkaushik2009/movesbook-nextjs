'use client';

import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

interface UseInPlannerModalProps {
  workout: any;
  onClose: () => void;
  onConfirm: (weekId: string, dayId: string) => void;
}

export default function UseInPlannerModal({ workout, onClose, onConfirm }: UseInPlannerModalProps) {
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [days, setDays] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load periods on mount
  useEffect(() => {
    loadPeriods();
  }, []);

  // Load weeks when period is selected
  useEffect(() => {
    if (selectedPeriod) {
      loadWeeks(selectedPeriod);
    }
  }, [selectedPeriod]);

  // Load days when week is selected
  useEffect(() => {
    if (selectedWeek) {
      loadDays(selectedWeek);
    }
  }, [selectedWeek]);

  const loadPeriods = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in');
        return;
      }

      const response = await fetch('/api/workouts/periods', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPeriods(data);
        if (data.length > 0) {
          setSelectedPeriod(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeks = async (periodId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/workouts/weeks?periodId=${periodId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWeeks(data);
        if (data.length > 0) {
          setSelectedWeek(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading weeks:', error);
    }
  };

  const loadDays = async (weekId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/workouts/days?weekId=${weekId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDays(data);
        if (data.length > 0) {
          setSelectedDay(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading days:', error);
    }
  };

  const handleConfirm = () => {
    if (!selectedWeek || !selectedDay) {
      alert('Please select a week and day');
      return;
    }
    onConfirm(selectedWeek, selectedDay);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading planner...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Use in My Planner</h2>
              <p className="text-sm text-gray-600 mt-1">
                Select where to add: <span className="font-semibold">{workout.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Period Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              1. Select Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.title} - {period.description}
                </option>
              ))}
            </select>
          </div>

          {/* Week Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              2. Select Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={!selectedPeriod || weeks.length === 0}
            >
              {weeks.length === 0 ? (
                <option>No weeks available</option>
              ) : (
                weeks.map((week) => (
                  <option key={week.id} value={week.id}>
                    Week {week.weekNumber}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Day Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              3. Select Day
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={!selectedWeek || days.length === 0}
            >
              {days.length === 0 ? (
                <option>No days available</option>
              ) : (
                days.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.dayName || `Day ${day.dayNumber}`} - {new Date(day.date).toLocaleDateString()}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">What happens next?</h4>
                <p className="text-sm text-blue-800">
                  This workout will be added to the selected day in your yearly planner. 
                  All moveframes and settings will be copied to create a new workout instance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDay}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Add to Planner
          </button>
        </div>
      </div>
    </div>
  );
}

