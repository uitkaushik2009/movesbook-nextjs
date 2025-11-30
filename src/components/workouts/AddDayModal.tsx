'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddDayModalProps {
  workoutPlanId: string;
  onClose: () => void;
  onSave: () => void;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AddDayModal({ workoutPlanId, onClose, onSave }: AddDayModalProps) {
  const [dayData, setDayData] = useState({
    weekNumber: 1,
    dayOfWeek: 1, // Monday
    date: new Date().toISOString().split('T')[0],
    periodId: '',
    weather: '',
    feeling: 5,
    notes: ''
  });

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if week already has 7 days
      const checkResponse = await fetch(`/api/workouts/plan?type=YEARLY_PLAN`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        const week = data.plan?.weeks?.find((w: any) => w.weekNumber === dayData.weekNumber);
        
        if (week && week.days && week.days.length >= 7) {
          alert(`Week ${dayData.weekNumber} already has 7 days. A week cannot have more than 7 days.`);
          return;
        }
      }
      
      const response = await fetch('/api/workouts/days', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workoutPlanId,
          weekNumber: dayData.weekNumber,
          date: dayData.date,
          periodId: dayData.periodId || undefined,
          weather: dayData.weather,
          feelingStatus: dayData.feeling.toString(),
          notes: dayData.notes
        })
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.json();
        alert(`Failed to add day: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding day:', error);
      alert('Error adding day');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Add New Day
            </h2>
            <p className="text-sm text-gray-600 mt-1">Configure this training day</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Week Number
              </label>
              <input
                type="number"
                min="1"
                value={dayData.weekNumber}
                onChange={(e) => setDayData({ ...dayData, weekNumber: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                value={dayData.dayOfWeek}
                onChange={(e) => setDayData({ ...dayData, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {DAY_NAMES.map((name, index) => (
                  <option key={index} value={index + 1}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={dayData.date}
              onChange={(e) => setDayData({ ...dayData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Weather
            </label>
            <input
              type="text"
              value={dayData.weather}
              onChange={(e) => setDayData({ ...dayData, weather: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Sunny, Rainy, Indoor..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Feeling (1-10)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={dayData.feeling}
                onChange={(e) => setDayData({ ...dayData, feeling: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-lg font-bold text-blue-600 w-12 text-center">
                {dayData.feeling}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={dayData.notes}
              onChange={(e) => setDayData({ ...dayData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any notes for this day..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Add Day
          </button>
        </div>
      </div>
    </div>
  );
}

