'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Copy, Trash2, Calendar, Save } from 'lucide-react';

interface FavoriteWorkoutCardProps {
  workout: any;
  onDelete: (id: string) => void;
  onOverview: (workout: any) => void;
  onUseInPlanner: (workout: any) => void;
}

export default function FavoriteWorkoutCard({ 
  workout, 
  onDelete, 
  onOverview, 
  onUseInPlanner 
}: FavoriteWorkoutCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Parse the workoutData JSON
  const workoutData = workout.workoutData ? JSON.parse(workout.workoutData) : null;
  const workoutInfo = workoutData?.workout || {};
  
  // Get moveframes count
  const moveframesCount = workoutData?.moveframes?.length || 0;
  
  // Get sports list
  const sportsList = workoutData?.sports?.map((s: any) => s.sport).join(', ') || workout.sports || '';

  // Editable fields state
  const [workoutName, setWorkoutName] = useState(workout.name || workoutInfo.name || '');
  const [workoutCode, setWorkoutCode] = useState(workoutInfo.code || '');
  const [workoutNotes, setWorkoutNotes] = useState(workoutInfo.notes || '');
  const [intensity, setIntensity] = useState('Medium');
  const [tags, setTags] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in');
        return;
      }

      // Update the workoutData with edited values
      const updatedWorkoutData = {
        ...workoutData,
        workout: {
          ...workoutInfo,
          name: workoutName,
          code: workoutCode,
          notes: workoutNotes
        }
      };

      const response = await fetch(`/api/workouts/favorites/${workout.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: workoutName,
          workoutData: JSON.stringify(updatedWorkoutData),
          intensity,
          tags
        })
      });

      if (response.ok) {
        alert('✅ Changes saved successfully!');
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-400 transition-all duration-200 overflow-hidden">
      {/* Compact Header - Always Visible */}
      <div 
        className="p-5 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Workout Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-lg font-bold">💪</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-1">
                  {workoutName || 'Unnamed Workout'}
                </h3>
                {/* Workout Code */}
                {workoutCode && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Code:</span>
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{workoutCode}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Stats Badge */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{moveframesCount}</div>
                    <div className="text-xs text-gray-500">Moveframes</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{sportsList.split(',').length}</div>
                    <div className="text-xs text-gray-500">Sports</div>
                  </div>
                </div>
                {/* Expand/Collapse Icon */}
                <div className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Workout Annotations - Compact Preview */}
            {!isExpanded && workoutNotes && (
              <div className="mt-3 ml-13 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-base">📝</span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-amber-700 mb-1">Annotations</div>
                    <div className="text-sm text-gray-700 line-clamp-1">
                      {workoutNotes}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t-2 border-gray-200 p-6 bg-gradient-to-b from-gray-50 to-white">
          {/* Editable Basic Info */}
          <div className="bg-white border-2 border-blue-200 rounded-xl p-5 mb-5 shadow-sm">
            <h4 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">✏️</span>
              Edit Basic Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Workout Name</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter workout name..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Workout Code</label>
                <input
                  type="text"
                  value={workoutCode}
                  onChange={(e) => setWorkoutCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 0101-1 5 Jan"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Workout Annotations</label>
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about this workout..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOverview(workout);
              }}
              className="px-5 py-3 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUseInPlanner(workout);
              }}
              className="px-5 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Use in my planner
            </button>
          </div>

          {/* Main Sport (Note) */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xl">⭐</span>
              </div>
              <h4 className="text-base font-bold text-orange-900">Main Sport (Note)</h4>
            </div>
            <select className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
              <option value="">🏊 Swim</option>
            </select>
            <p className="text-xs text-orange-600 mt-2">
              This is a note field that can be freely edited and does not affect workout structure.
            </p>
          </div>

          {/* Sports from Moveframes */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xl">🏃</span>
              </div>
              <h4 className="text-base font-bold text-pink-900">Sports from Moveframes ({moveframesCount}/4)</h4>
            </div>
            <div className="space-y-2">
              {sportsList.split(',').map((sport: string, idx: number) => (
                <div key={idx} className="bg-white rounded p-2 text-sm text-gray-700 border border-pink-200">
                  {sport.trim()}
                </div>
              ))}
            </div>
            <p className="text-xs text-pink-600 mt-2">
              These sports are automatically loaded from moveframes (read-only). To change sports, edit/add moveframes.
            </p>
          </div>

          {/* Workout Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-blue-900">Workout Summary</h4>
                <p className="text-xs text-blue-700">(only as note of reference)</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <div className="text-xs text-gray-600 mb-1">Week Number</div>
                <input 
                  type="text" 
                  defaultValue={workoutInfo.weekNumber || 'Week 1'} 
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Day of Week</div>
                <input 
                  type="text" 
                  defaultValue={workoutInfo.dayOfWeek || 'Monday'} 
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Period</div>
                <input 
                  type="text" 
                  defaultValue={workoutInfo.period || 'Conditioning'} 
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Section</div>
                <div className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white">
                  <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></span>
                </div>
              </div>
            </div>
          </div>

          {/* Workout Statistics */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xl">📈</span>
              </div>
              <h4 className="text-base font-bold text-purple-900">Workout Statistics</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-purple-900 mb-1">{moveframesCount}</div>
                <div className="text-xs font-medium text-gray-600">Moveframes</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-purple-900 mb-1">
                  {workoutData?.moveframes?.reduce((sum: number, mf: any) => sum + (mf.movelaps?.length || 0), 0) || 0}
                </div>
                <div className="text-xs font-medium text-gray-600">Total Movelaps</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-purple-900 mb-1">
                  {Math.round((workout.totalDistance || 0) / 1000)}km
                </div>
                <div className="text-xs font-medium text-gray-600">Total Distance</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-purple-900 mb-1">
                  {Math.floor((workout.totalDuration || 0) / 60)}:{String((workout.totalDuration || 0) % 60).padStart(2, '0')}
                </div>
                <div className="text-xs font-medium text-gray-600">Total Duration</div>
              </div>
            </div>
          </div>

          {/* Intensity and Tags */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Intensity</label>
              <select 
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., Upper Body, Push, Strength"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Save and Delete Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={isSaving}
              className="col-span-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Remove this workout from favorites?')) {
                  onDelete(workout.id);
                }
              }}
              className="px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

