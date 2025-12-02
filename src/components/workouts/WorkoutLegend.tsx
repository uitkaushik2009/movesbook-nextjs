'use client';

import React from 'react';

interface WorkoutLegendProps {
  showWideMode?: boolean;
  className?: string;
}

export default function WorkoutLegend({ showWideMode = false, className = '' }: WorkoutLegendProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-200 ${className}`}>
      <div className="flex flex-wrap gap-6 text-sm">
        {/* Workout Symbols */}
        <div className="space-y-1">
          <div className="font-semibold text-gray-700 mb-2">Workout Symbols:</div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-lg">○</span>
            <span>Workout #1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-lg">□</span>
            <span>Workout #2</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-lg">△</span>
            <span>Workout #3</span>
          </div>
        </div>
        
        {/* Workout Status Colors */}
        <div className="space-y-1">
          <div className="font-semibold text-gray-700 mb-2">Workout Status Colors:</div>
          <div className="flex items-center gap-2">
            <span className="text-gray-300 font-bold text-lg">○</span>
            <span className="text-xs">White = Not planned</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold text-lg">○</span>
            <span className="text-xs">Yellow = Planned in future</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-bold text-lg">○</span>
            <span className="text-xs">Orange = Next week</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-bold text-lg">○</span>
            <span className="text-xs">Red = This week</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500 font-bold text-lg">○</span>
            <span className="text-xs">Blue = Done differently</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-300 font-bold text-lg">○</span>
            <span className="text-xs">Light Green = Done &lt;75%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold text-lg">○</span>
            <span className="text-xs">Green = Done &gt;75%</span>
          </div>
        </div>
        
        {/* Day Status */}
        <div className="space-y-1">
          <div className="font-semibold text-gray-700 mb-2">Day Status:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Has Workouts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
            <span>No Workouts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 ring-2 ring-green-500 rounded"></div>
            <span>Today</span>
          </div>
        </div>
        
        {/* Wide Mode Info */}
        {showWideMode && (
          <div className="space-y-1">
            <div className="font-semibold text-gray-700 mb-2">Wide Mode Details:</div>
            <div className="text-xs text-gray-600">
              • Sports shown beside symbols<br />
              • Distance in kilometers (k)<br />
              • K = Coefficient (future)<br />
              • Max 2 sports shown per workout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

