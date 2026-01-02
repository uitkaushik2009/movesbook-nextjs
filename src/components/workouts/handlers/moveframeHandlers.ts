/**
 * Moveframe Handlers - CRUD operations for moveframes
 * Extracted from WorkoutSection.tsx for better maintainability
 */

import type { Moveframe } from '@/types/workout.types';

export interface MoveframeHandlerDeps {
  token: string | null;
  showMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  loadWorkoutData: (section?: any) => Promise<void>;
  activeSection: string;
}

/**
 * Create a new moveframe
 */
export async function createMoveframe(
  moveframeData: any,
  deps: MoveframeHandlerDeps
) {
  const { token, showMessage } = deps;
  
  console.log('📤 Creating moveframe with data:', moveframeData);
  
  const response = await fetch('/api/workouts/moveframes', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(moveframeData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('❌ API Error Response:', error);
    console.error('❌ Error details:', error.error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error name:', error.name);
    throw new Error(error.error || 'Failed to create moveframe');
  }
  
  const data = await response.json();
  showMessage('success', 'Moveframe added successfully');
  return data;
}

/**
 * Update an existing moveframe
 */
export async function updateMoveframe(
  moveframeId: string,
  moveframeData: any,
  deps: MoveframeHandlerDeps
) {
  const { token, showMessage } = deps;
  
  console.log('📤 Updating moveframe with data:', moveframeData);
  
  const response = await fetch(`/api/workouts/moveframes/${moveframeId}`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(moveframeData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('❌ API Error Response:', error);
    console.error('❌ Error details:', error.error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error name:', error.name);
    throw new Error(error.error || 'Failed to update moveframe');
  }
  
  const data = await response.json();
  showMessage('success', 'Moveframe updated successfully');
  return data;
}

/**
 * Delete a moveframe
 */
export async function deleteMoveframe(
  moveframeId: string,
  deps: MoveframeHandlerDeps
) {
  const { token, showMessage, loadWorkoutData, activeSection } = deps;
  
  const response = await fetch(`/api/workouts/moveframes/${moveframeId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  });
  
  if (response.ok) {
    showMessage('success', 'Moveframe deleted successfully');
    await loadWorkoutData(activeSection);
  } else {
    showMessage('error', 'Failed to delete moveframe');
  }
}

/**
 * Copy a moveframe to another workout
 */
export async function copyMoveframe(
  sourceMoveframeId: string,
  targetWorkoutId: string,
  deps: MoveframeHandlerDeps
) {
  const { token, showMessage } = deps;
  
  const response = await fetch('/api/workouts/moveframes/copy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      sourceMoveframeId, 
      targetWorkoutId 
    })
  });

  const data = await response.json();

  if (response.ok && data.success) {
    showMessage('success', data.message || 'Moveframe copied successfully!');
    return data;
  } else {
    throw new Error(data.error || 'Failed to copy moveframe');
  }
}

/**
 * Move a moveframe to another workout
 */
export async function moveMoveframe(
  moveframeId: string,
  targetWorkoutId: string,
  deps: MoveframeHandlerDeps
) {
  const { token, showMessage } = deps;
  
  const response = await fetch('/api/workouts/moveframes/move', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      moveframeId, 
      targetWorkoutId 
    })
  });

  const data = await response.json();

  if (response.ok && data.success) {
    showMessage('success', data.message || 'Moveframe moved successfully!');
    return data;
  } else {
    throw new Error(data.error || 'Failed to move moveframe');
  }
}

/**
 * Reorder moveframes within the same workout
 */
export async function reorderMoveframes(
  workoutId: string,
  moveframeIds: string[],
  deps: MoveframeHandlerDeps
) {
  const { token, showMessage, loadWorkoutData, activeSection } = deps;
  
  const response = await fetch('/api/workouts/moveframes/reorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      workoutId, 
      moveframeIds 
    })
  });

  const data = await response.json();

  if (response.ok && data.success) {
    showMessage('success', 'Moveframes reordered successfully');
    await loadWorkoutData(activeSection);
    return data;
  } else {
    throw new Error(data.error || 'Failed to reorder moveframes');
  }
}

