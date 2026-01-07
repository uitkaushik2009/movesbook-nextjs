'use client';

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import PersonalSettingsModal from './PersonalSettingsModal';

interface WorkoutRightSidebarProps {
  activeLevel: 'day' | 'workout' | 'moveframe' | 'movelap' | null;
  selectedDay?: any;
  selectedWorkout?: any;
  selectedMoveframe?: any;
  selectedMovelap?: any;
  onAddWorkout?: () => void;
  onAddMoveframe?: () => void;
}

export default function WorkoutRightSidebar({
  activeLevel,
  selectedDay,
  selectedWorkout,
  selectedMoveframe,
  selectedMovelap,
  onAddWorkout,
  onAddMoveframe
}: WorkoutRightSidebarProps) {
  
  const [showPersonalSettings, setShowPersonalSettings] = useState(false);
  
  const handleAction = (action: string, level: string) => {
    console.log(`Action: ${action} on ${level}`);
    // Will be implemented with actual functionality later
  };

  return (
    <aside className="w-64 bg-gray-50 border-l border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-4 bg-white border-b">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h3>
        
        {/* Personal Settings Button - Always visible at the top */}
        <button
          onClick={() => setShowPersonalSettings(true)}
          className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
        >
          <Settings className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-left">Personal settings</span>
        </button>
      </div>
      
      {/* Quick Add Buttons */}
      <div className="p-4 space-y-3 border-b">
        <button 
          onClick={onAddWorkout}
          disabled={!selectedDay}
          className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${
            selectedDay
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          + Add Workout
        </button>
        
        <button 
          onClick={onAddMoveframe}
          disabled={!selectedWorkout}
          className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${
            selectedWorkout
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          + Add Moveframe
        </button>
      </div>
      
      {/* Contextual Options - 4 Groups */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Day Options */}
        <div className="border-b">
          <div 
            className={`p-3 font-semibold text-sm ${
              activeLevel === 'day' 
                ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-600' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            📅 Day Options
          </div>
          <div className="p-2 space-y-1">
            {['Copy', 'Move', 'Paste', 'Export', 'Share', 'Delete', 'Print'].map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action, 'day')}
                disabled={!selectedDay}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedDay
                    ? 'hover:bg-blue-50 text-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
        
        {/* Workout Options */}
        <div className="border-b">
          <div 
            className={`p-3 font-semibold text-sm ${
              activeLevel === 'workout' 
                ? 'bg-green-100 text-green-900 border-l-4 border-green-600' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            🏋️ Workout Options
          </div>
          <div className="p-2 space-y-1">
            {['Copy', 'Move', 'Paste', 'Export', 'Share', 'Delete', 'Print'].map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action, 'workout')}
                disabled={!selectedWorkout}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedWorkout
                    ? 'hover:bg-green-50 text-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
        
        {/* Moveframe Options */}
        <div className="border-b">
          <div 
            className={`p-3 font-semibold text-sm ${
              activeLevel === 'moveframe' 
                ? 'bg-purple-100 text-purple-900 border-l-4 border-purple-600' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            📋 Moveframe Options
          </div>
          <div className="p-2 space-y-1">
            {['Copy', 'Move', 'Paste', 'Export', 'Share', 'Delete', 'Print'].map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action, 'moveframe')}
                disabled={!selectedMoveframe}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedMoveframe
                    ? 'hover:bg-purple-50 text-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
        
        {/* Movelap Options */}
        <div className="border-b">
          <div 
            className={`p-3 font-semibold text-sm ${
              activeLevel === 'movelap' 
                ? 'bg-orange-100 text-orange-900 border-l-4 border-orange-600' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            🔄 Movelap Options
          </div>
          <div className="p-2 space-y-1">
            {[
              'Edit',
              'Duplicate',
              'Add microlap',
              'Add note',
              'Copy',
              'Paste after',
              'Paste before',
              'To skip in Player',
              'Disable',
              'Delete'
            ].map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action, 'movelap')}
                disabled={!selectedMovelap}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedMovelap
                    ? 'hover:bg-orange-50 text-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
        
      </div>
      
      {/* Grid Settings */}
      <div className="p-4 border-t bg-white">
        <button 
          onClick={() => console.log('Save grid settings')}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          💾 Save Grid Settings
        </button>
      </div>
      
      {/* Personal Settings Modal */}
      <PersonalSettingsModal
        isOpen={showPersonalSettings}
        onClose={() => setShowPersonalSettings(false)}
        userLanguage="en" // TODO: Get from user profile/context
      />
      
    </aside>
  );
}

