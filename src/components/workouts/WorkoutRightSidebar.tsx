'use client';

import { useState } from 'react';
import { 
  Plus,
  Copy,
  Move,
  Share2,
  Trash2,
  Printer,
  Download,
  Upload,
  RefreshCw,
  Edit,
  Clock,
  MapPin,
  Activity,
  Archive,
  Save,
  CheckCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { SportType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface WorkoutRightSidebarProps {
  selectedDay: string | null;
  selectedWorkout: string | null;
  selectedMoveframe: string | null;
  mainSports: SportType[];
  onAddWorkout: () => void;
  onAddMoveframe: () => void;
  onRefresh: () => void;
  onOpenArchive: () => void;
  onSaveAsTemplate: (type: 'workout' | 'day') => void;
  onSportDragStart?: (sport: SportType) => void;
  onSportDragEnd?: () => void;
  onCopy?: (type: 'day' | 'workout' | 'moveframe') => void;
  onCut?: (type: 'day' | 'workout' | 'moveframe') => void;
  onPaste?: () => void;
  clipboard?: { type: 'day' | 'workout' | 'moveframe' | null; data: any; isCut: boolean };
  onMarkAsDone?: () => void;
  statistics?: any;
  onPrint?: () => void;
}

export default function WorkoutRightSidebar({
  selectedDay,
  selectedWorkout,
  selectedMoveframe,
  mainSports,
  onAddWorkout,
  onAddMoveframe,
  onRefresh,
  onOpenArchive,
  onSaveAsTemplate,
  onSportDragStart,
  onSportDragEnd,
  onCopy,
  onCut,
  onPaste,
  clipboard,
  onMarkAsDone,
  statistics,
  onPrint
}: WorkoutRightSidebarProps) {
  const { t } = useLanguage();

  // Get sport icon/emoji
  const getSportIcon = (sport: SportType): string => {
    switch (sport) {
      case 'SWIM': return '🏊';
      case 'BIKE': return '🚴';
      case 'RUN': return '🏃';
      case 'BODY_BUILDING': return '💪';
      case 'ROWING': return '🚣';
      case 'SKATE': return '⛸️';
      case 'GYMNASTIC': return '🤸';
      case 'STRETCHING': return '🧘';
      case 'PILATES': return '🧘';
      case 'SKI': return '⛷️';
      case 'TECHNICAL_MOVES': return '🎯';
      case 'FREE_MOVES': return '🎪';
      default: return '🏃';
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-l flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <h3 className="text-lg font-bold text-gray-800">Workout Tools</h3>
      </div>

      {/* Main Actions */}
      <div className="p-4 space-y-3">
        <button
          onClick={onAddWorkout}
          disabled={!selectedDay}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
            selectedDay
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-5 h-5" />
          <span>Add Workout</span>
        </button>

        <button
          onClick={onAddMoveframe}
          disabled={!selectedWorkout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
            selectedWorkout
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-5 h-5" />
          <span>Add Moveframe</span>
        </button>
      </div>

      {/* Archive Actions */}
      <div className="px-4 pb-4 space-y-2 border-b">
        <button
          onClick={onOpenArchive}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Archive className="w-4 h-4" />
          <span>Load from Archive</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSaveAsTemplate('day')}
            disabled={!selectedDay}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              selectedDay
                ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Day</span>
          </button>

          <button
            onClick={() => onSaveAsTemplate('workout')}
            disabled={!selectedWorkout}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              selectedWorkout
                ? 'bg-teal-100 hover:bg-teal-200 text-teal-700 border border-teal-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Workout</span>
          </button>
        </div>
      </div>

      {/* Sport Icons - Draggable */}
      <div className="p-4 bg-white border-y">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Drag Sport to Workout
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {mainSports.slice(0, 12).map((sport) => (
            <div
              key={sport}
              draggable
              onDragStart={() => {
                if (onSportDragStart) onSportDragStart(sport);
              }}
              onDragEnd={() => {
                if (onSportDragEnd) onSportDragEnd();
              }}
              className="flex flex-col items-center justify-center p-3 bg-gray-100 hover:bg-blue-100 rounded-lg cursor-move transition-all hover:shadow-md active:opacity-50"
              title={t(`sport_${sport.toLowerCase()}`)}
            >
              <span className="text-2xl mb-1">{getSportIcon(sport)}</span>
              <span className="text-xs text-gray-600 text-center">
                {t(`sport_${sport.toLowerCase()}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contextual Options */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Options
        </h4>
        
        <div className="space-y-2">
          {/* Day Options */}
          {selectedDay && !selectedWorkout && !selectedMoveframe && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Day Options
              </p>
              <button 
                onClick={() => onCopy && onCopy('day')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Day</span>
              </button>
              {clipboard?.type === 'workout' && (
                <button 
                  onClick={onPaste}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-green-50 border border-green-300 text-green-700 rounded hover:bg-green-100 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Paste Workout {clipboard.isCut ? '(Move)' : '(Copy)'}</span>
                </button>
              )}
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
                <Edit className="w-4 h-4" />
                <span>Edit Day Info</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
                <Printer className="w-4 h-4" />
                <span>Print Day</span>
              </button>
            </div>
          )}

          {/* Workout Options */}
          {selectedWorkout && !selectedMoveframe && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Workout Options
              </p>
              <button 
                onClick={() => onCopy && onCopy('workout')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Workout</span>
              </button>
              <button 
                onClick={() => onCut && onCut('workout')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                <Move className="w-4 h-4" />
                <span>Move Workout</span>
              </button>
              {clipboard?.type === 'workout' && selectedDay && (
                <button 
                  onClick={onPaste}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-green-50 border border-green-300 text-green-700 rounded hover:bg-green-100 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Paste to Day {clipboard.isCut ? '(Move)' : '(Copy)'}</span>
                </button>
              )}
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
                <Edit className="w-4 h-4" />
                <span>Edit Workout Info</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
                <Share2 className="w-4 h-4" />
                <span>Share Workout</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 transition">
                <Trash2 className="w-4 h-4" />
                <span>Delete Workout</span>
              </button>
            </div>
          )}

          {/* Moveframe Options */}
          {selectedMoveframe && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Moveframe Options
              </p>
              <button 
                onClick={() => onCopy && onCopy('moveframe')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate Moveframe</span>
              </button>
              <button 
                onClick={() => onCut && onCut('moveframe')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                <Move className="w-4 h-4" />
                <span>Move Moveframe</span>
              </button>
              {clipboard?.type === 'moveframe' && selectedWorkout && (
                <button 
                  onClick={onPaste}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-green-50 border border-green-300 text-green-700 rounded hover:bg-green-100 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Paste to Workout {clipboard.isCut ? '(Move)' : '(Copy)'}</span>
                </button>
              )}
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 transition">
                <Trash2 className="w-4 h-4" />
                <span>Delete Moveframe</span>
              </button>
            </div>
          )}

          {/* General Actions - Always Visible */}
          <div className="pt-4 border-t space-y-2">
            <button 
              onClick={onRefresh}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button 
              onClick={onPrint}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-auto p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-t">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-semibold text-gray-900">Statistics</h4>
        </div>
        
        {statistics ? (
          <div className="space-y-3">
            {/* Completion Rate */}
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Completion Rate</span>
                <Award className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-blue-600">{statistics.completionRate}%</span>
                <span className="text-xs text-gray-500 pb-1">
                  {statistics.done}/{statistics.done + statistics.planned}
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded p-2 shadow-sm">
                <div className="text-gray-600 mb-1">Total</div>
                <div className="font-bold text-gray-900">{statistics.total}</div>
              </div>
              <div className="bg-green-50 rounded p-2 shadow-sm">
                <div className="text-green-700 mb-1">Done</div>
                <div className="font-bold text-green-900">{statistics.done}</div>
              </div>
              <div className="bg-orange-50 rounded p-2 shadow-sm">
                <div className="text-orange-700 mb-1">Planned</div>
                <div className="font-bold text-orange-900">{statistics.planned}</div>
              </div>
              <div className="bg-purple-50 rounded p-2 shadow-sm">
                <div className="text-purple-700 mb-1">Distance</div>
                <div className="font-bold text-purple-900">{Math.round(statistics.totalDistance / 1000)}km</div>
              </div>
            </div>

            {/* Additional Stats */}
            {statistics.avgHeartRate > 0 && (
              <div className="bg-white rounded-lg p-2 shadow-sm text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg HR</span>
                  <span className="font-semibold text-red-600">{statistics.avgHeartRate} bpm</span>
                </div>
              </div>
            )}
            
            {statistics.totalCalories > 0 && (
              <div className="bg-white rounded-lg p-2 shadow-sm text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Calories</span>
                  <span className="font-semibold text-orange-600">{statistics.totalCalories.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-600">Loading stats...</p>
          </div>
        )}
      </div>
    </div>
  );
}

