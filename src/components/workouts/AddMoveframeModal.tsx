'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddMoveframeModalProps {
  workoutId: string;
  onClose: () => void;
  onSave: (moveframeData: any) => void;
}

const SPORTS = [
  'SWIM', 'BIKE', 'RUN', 'BODY_BUILDING', 'ROWING', 
  'SKATE', 'GYMNASTIC', 'STRETCHING', 'PILATES', 
  'SKI', 'TECHNICAL_MOVES', 'FREE_MOVES'
];

export default function AddMoveframeModal({
  workoutId,
  onClose,
  onSave
}: AddMoveframeModalProps) {
  const [moveframeData, setMoveframeData] = useState({
    sport: 'SWIM',
    type: 'STANDARD',
    description: '',
    distance: '',
    repetitions: '1',
    speed: '',
    pause: ''
  });

  const handleSave = () => {
    onSave({
      ...moveframeData,
      workoutId
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Add Moveframe</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Sport Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sport *
            </label>
            <select
              value={moveframeData.sport}
              onChange={(e) => setMoveframeData({ ...moveframeData, sport: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SPORTS.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setMoveframeData({ ...moveframeData, type: 'STANDARD' })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  moveframeData.type === 'STANDARD'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setMoveframeData({ ...moveframeData, type: 'BATTERY' })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  moveframeData.type === 'BATTERY'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Battery
              </button>
              <button
                onClick={() => setMoveframeData({ ...moveframeData, type: 'ANNOTATION' })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  moveframeData.type === 'ANNOTATION'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Annotation
              </button>
            </div>
          </div>

          {/* Distance & Reps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Distance (m)
              </label>
              <input
                type="number"
                value={moveframeData.distance}
                onChange={(e) => setMoveframeData({ ...moveframeData, distance: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Repetitions
              </label>
              <input
                type="number"
                value={moveframeData.repetitions}
                onChange={(e) => setMoveframeData({ ...moveframeData, repetitions: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10"
              />
            </div>
          </div>

          {/* Speed & Pause */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Speed/Pace
              </label>
              <input
                type="text"
                value={moveframeData.speed}
                onChange={(e) => setMoveframeData({ ...moveframeData, speed: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="A2, Easy, 1:30/100m"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rest/Pause
              </label>
              <input
                type="text"
                value={moveframeData.pause}
                onChange={(e) => setMoveframeData({ ...moveframeData, pause: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="20s, 1:00"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={moveframeData.description}
              onChange={(e) => setMoveframeData({ ...moveframeData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Exercise details..."
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
            Add Moveframe
          </button>
        </div>
      </div>
    </div>
  );
}

