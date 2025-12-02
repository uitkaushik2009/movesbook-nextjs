'use client';

import React from 'react';
import { X } from 'lucide-react';

interface WorkoutActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'copy' | 'move' | 'switch') => void;
  sourceWorkout: any;
  targetDay: any;
  existingWorkout?: any;
}

export function WorkoutActionModal({
  isOpen,
  onClose,
  onAction,
  sourceWorkout,
  targetDay,
  existingWorkout
}: WorkoutActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Workout Action</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-2">
            You are moving <span className="font-semibold">{sourceWorkout.name || 'Unnamed Workout'}</span>
          </p>
          <p className="text-sm text-gray-700">
            to <span className="font-semibold">{new Date(targetDay.date).toLocaleDateString()}</span>
          </p>
          
          {existingWorkout && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Warning: This day already has a workout "{existingWorkout.name || 'Unnamed'}"
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                If you Copy or Move, you must confirm to remove the existing workout.
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => onAction('copy')}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left"
          >
            <div className="font-semibold">📋 Copy</div>
            <div className="text-sm opacity-90">Create a duplicate in the target day</div>
          </button>
          
          <button
            onClick={() => onAction('move')}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left"
          >
            <div className="font-semibold">➡️ Move</div>
            <div className="text-sm opacity-90">Move to target day (remove from source)</div>
          </button>
          
          {existingWorkout && (
            <button
              onClick={() => onAction('switch')}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-left"
            >
              <div className="font-semibold">🔄 Switch</div>
              <div className="text-sm opacity-90">Swap positions with existing workout</div>
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface MoveframePositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'copy' | 'move', position?: 'before' | 'after' | 'append') => void;
  sourceMoveframe: any;
  sourceWorkout?: any;
  sourceDay?: any;
  targetMoveframe?: any;  // Optional - if dropping on a moveframe
  targetWorkout?: any;
  targetDay?: any;
  dropPosition: 'onMoveframe' | 'append';
}

export function MoveframePositionModal({
  isOpen,
  onClose,
  onAction,
  sourceMoveframe,
  sourceWorkout,
  sourceDay,
  targetMoveframe,
  targetWorkout,
  targetDay,
  dropPosition
}: MoveframePositionModalProps) {
  const [selectedAction, setSelectedAction] = React.useState<'copy' | 'move' | null>(null);
  
  if (!isOpen) return null;

  // If user hasn't selected copy/move yet, show the first step
  if (!selectedAction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Moveframe Action</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-2">
              Moveframe: <span className="font-semibold">{sourceMoveframe?.letter || sourceMoveframe?.code} - {sourceMoveframe?.sport}</span>
            </p>
            {sourceWorkout && (
              <p className="text-xs text-gray-500">
                From: Workout #{sourceWorkout.sessionNumber || 1} on {sourceDay?.date ? new Date(sourceDay.date).toLocaleDateString() : 'Unknown'}
              </p>
            )}
            <hr className="my-2" />
            <p className="text-sm text-gray-700">
              Target: {dropPosition === 'append' 
                ? `Append to ${targetWorkout?.name || 'Workout'}`
                : `Near moveframe ${targetMoveframe?.letter || targetMoveframe?.code}`
              }
            </p>
            {targetDay && (
              <p className="text-xs text-gray-500">
                On: {new Date(targetDay.date).toLocaleDateString()}
              </p>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                ℹ️ The moveframe will NOT replace any existing moveframes.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setSelectedAction('copy')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left"
            >
              <div className="font-semibold">📋 Copy</div>
              <div className="text-sm opacity-90">Duplicate the moveframe to the target location</div>
            </button>
            
            <button
              onClick={() => setSelectedAction('move')}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left"
            >
              <div className="font-semibold">➡️ Move</div>
              <div className="text-sm opacity-90">Move the moveframe (remove from source)</div>
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If dropping on day header (append), no need to ask before/after
  if (dropPosition === 'append') {
    // Execute immediately
    onAction(selectedAction, 'append');
    setSelectedAction(null);
    return null;
  }
  
  // User selected copy/move, now ask before/after
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Insert Position</h2>
          <button onClick={() => { setSelectedAction(null); onClose(); }} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-2">
            {selectedAction === 'copy' ? 'Copying' : 'Moving'} <span className="font-semibold">{sourceMoveframe?.letter || sourceMoveframe?.code} - {sourceMoveframe?.sport}</span>
          </p>
          <p className="text-sm text-gray-700">
            relative to <span className="font-semibold">{targetMoveframe?.letter || targetMoveframe?.code} - {targetMoveframe?.sport}</span>
          </p>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              ℹ️ The target moveframe will NOT be replaced. It will remain in position.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => { onAction(selectedAction, 'before'); setSelectedAction(null); }}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left"
          >
            <div className="font-semibold">⬆️ Insert Before</div>
            <div className="text-sm opacity-90">Place above moveframe {targetMoveframe?.letter || targetMoveframe?.code}</div>
          </button>
          
          <button
            onClick={() => { onAction(selectedAction, 'after'); setSelectedAction(null); }}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left"
          >
            <div className="font-semibold">⬇️ Insert After</div>
            <div className="text-sm opacity-90">Place below moveframe {targetMoveframe?.letter || targetMoveframe?.code}</div>
          </button>
          
          <button
            onClick={() => setSelectedAction(null)}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConfirmRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: 'workout' | 'moveframe';
  itemName: string;
}

export function ConfirmRemovalModal({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName
}: ConfirmRemovalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-red-600">⚠️ Confirm Removal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            The target location already has a {itemType}:
          </p>
          <p className="font-semibold text-gray-900 text-lg">"{itemName}"</p>
          
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800 font-medium">
              This {itemType} will be permanently removed and replaced.
            </p>
            <p className="text-xs text-red-700 mt-1">
              This action cannot be undone.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Yes, Remove and Replace
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

