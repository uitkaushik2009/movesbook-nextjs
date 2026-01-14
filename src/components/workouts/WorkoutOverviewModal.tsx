'use client';

import { X } from 'lucide-react';
import { shouldShowDistance, getDistanceUnit } from '@/constants/moveframe.constants';

interface WorkoutOverviewModalProps {
  workout: any;
  onClose: () => void;
}

export default function WorkoutOverviewModal({ workout, onClose }: WorkoutOverviewModalProps) {
  // Parse the workoutData JSON
  const workoutData = workout.workoutData ? JSON.parse(workout.workoutData) : null;
  const workoutInfo = workoutData?.workout || {};
  const moveframes = workoutData?.moveframes || [];
  const sports = workoutData?.sports || [];

  // Group moveframes by sport for display
  const sportStats = sports.map((sportItem: any) => {
    const sportMoveframes = moveframes.filter((mf: any) => mf.sport === sportItem.sport);
    const totalReps = sportMoveframes.reduce((sum: number, mf: any) => {
      return sum + (mf.movelaps?.length || 0);
    }, 0);
    const totalDistance = sportMoveframes.reduce((sum: number, mf: any) => {
      return sum + mf.movelaps?.reduce((mfSum: number, ml: any) => {
        return mfSum + (parseInt(ml.distance) || 0);
      }, 0);
    }, 0);

    return {
      sport: sportItem.sport,
      moveframesCount: sportMoveframes.length,
      totalReps,
      totalDistance
    };
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {workout.name || workoutInfo.name || 'Workout Overview'}
            </h2>
            {workoutInfo.code && (
              <p className="text-sm text-gray-600 mt-1">Code: {workoutInfo.code}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              📋 Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 font-medium">Workout Name</label>
                <div className="text-sm text-gray-900 mt-1 bg-cyan-50 border border-cyan-200 rounded px-3 py-2">
                  {workout.name || workoutInfo.name || 'Unnamed Workout'}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Workout Code <span className="text-red-500">*</span></label>
                <div className="text-sm text-gray-900 mt-1 bg-cyan-50 border border-cyan-200 rounded px-3 py-2">
                  {workoutInfo.code || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Workout Annotations */}
          {workoutInfo.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                📝 Workout Annotations
              </h3>
              <div className="bg-cyan-50 border border-cyan-200 rounded p-3 min-h-[80px]">
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{workoutInfo.notes}</div>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                These notes are specific to this workout only (not the entire day).
              </p>
            </div>
          )}

          {/* Workout Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-bold text-blue-900 mb-3">📊 Workout Summary (only as note of reference)</h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <div className="text-xs text-gray-600 mb-1">Week Number</div>
                <div className="text-sm font-semibold text-gray-900 bg-white border border-blue-200 rounded px-2 py-1">
                  Week 1
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Day of Week</div>
                <div className="text-sm font-semibold text-gray-900 bg-white border border-blue-200 rounded px-2 py-1">
                  Monday
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Period</div>
                <div className="text-sm font-semibold text-gray-900 bg-white border border-blue-200 rounded px-2 py-1">
                  Conditioning...
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Section</div>
                <div className="flex items-center gap-2 bg-white border border-blue-200 rounded px-2 py-1">
                  <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Sport (Note) */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⭐</span>
              <h3 className="text-sm font-bold text-orange-900">Main Sport (Note)</h3>
            </div>
            <div className="bg-white border border-orange-200 rounded px-3 py-2">
              <div className="text-sm text-gray-700">🏊 Swim</div>
            </div>
            <p className="text-xs text-orange-600 mt-2">
              This is a note field that can be freely edited and does not affect workout structure.
            </p>
          </div>

          {/* Sports from Moveframes */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🏃</span>
              <h3 className="text-sm font-bold text-pink-900">Sports from Moveframes ({sportStats.length}/4)</h3>
            </div>
            <div className="space-y-2">
              {sportStats.map((stat: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-pink-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{stat.sport}</div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Moveframes:</span> {stat.moveframesCount}
                      </div>
                      <div>
                        <span className="font-medium">Series:</span> {stat.totalReps}
                      </div>
                      {shouldShowDistance(stat.sport) && stat.totalDistance > 0 && (
                        <div>
                          <span className="font-medium">Distance:</span> {stat.totalDistance}{getDistanceUnit(stat.sport)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-pink-600 mt-2">
              These sports are automatically loaded from moveframes (read-only). To change sports, edit/add moveframes.
            </p>
          </div>

          {/* Workout Statistics */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-bold text-purple-900 mb-3">📈 Workout Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-3xl font-bold text-purple-900">{moveframes.length}</div>
                <div className="text-xs text-gray-600 mt-1">Moveframes</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-3xl font-bold text-purple-900">
                  {moveframes.reduce((sum: number, mf: any) => sum + (mf.movelaps?.length || 0), 0)}
                </div>
                <div className="text-xs text-gray-600 mt-1">Total Movelaps</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-3xl font-bold text-purple-900">
                  {Math.round((workout.totalDistance || 0) / 1000)}km
                </div>
                <div className="text-xs text-gray-600 mt-1">Total Distance</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-3xl font-bold text-purple-900">
                  {Math.floor((workout.totalDuration || 0) / 60)}:{String((workout.totalDuration || 0) % 60).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 mt-1">Total Duration</div>
              </div>
            </div>
          </div>

          {/* Intensity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
            <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2">
              <div className="text-sm font-semibold text-gray-900">Medium</div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
            <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 min-h-[40px]">
              <div className="text-sm text-gray-600 italic">e.g., Upper Body, Push, Strength</div>
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
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

