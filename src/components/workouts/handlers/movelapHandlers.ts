/**
 * Movelap Handlers - CRUD operations for movelaps
 * Extracted from WorkoutSection.tsx for better maintainability
 */

import { movelapApi } from '@/utils/api.utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/config/workout.constants';

export interface MovelapHandlerDeps {
  token: string | null;
  showMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  loadWorkoutData: (section?: any) => Promise<void>;
  activeSection: string;
}

/**
 * Create a new movelap
 */
export async function createMovelap(
  moveframeId: string,
  formData: any,
  deps: MovelapHandlerDeps
) {
  const { showMessage } = deps;
  
  const response = await movelapApi.create(moveframeId, {
    mode: 'APPEND',
    ...formData
  });
  
  if (response.success) {
    showMessage('success', 'Movelap added successfully');
    return response;
  } else {
    throw new Error(response.error || ERROR_MESSAGES.GENERIC_ERROR);
  }
}

/**
 * Update an existing movelap
 */
export async function updateMovelap(
  movelapId: string,
  formData: any,
  deps: MovelapHandlerDeps
) {
  const { token, showMessage } = deps;
  
  const response = await fetch(`/api/workouts/movelaps/${movelapId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });

  const data = await response.json();

  if (response.ok && data.success) {
    showMessage('success', 'Movelap updated successfully');
    return data;
  } else {
    throw new Error(data.error || 'Failed to update movelap');
  }
}

/**
 * Delete a movelap
 */
export async function deleteMovelap(
  movelapId: string,
  deps: MovelapHandlerDeps
) {
  const { token, showMessage, loadWorkoutData, activeSection } = deps;
  
  const response = await fetch(`/api/workouts/movelaps/${movelapId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    showMessage('success', 'Movelap deleted successfully');
    await loadWorkoutData(activeSection);
  } else {
    showMessage('error', 'Failed to delete movelap');
  }
}

/**
 * Add movelaps in bulk
 */
export async function bulkAddMovelaps(
  moveframeId: string,
  movelaps: any[],
  deps: MovelapHandlerDeps
) {
  const { token, showMessage, loadWorkoutData, activeSection } = deps;
  
  const response = await fetch('/api/workouts/movelaps/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      moveframeId, 
      movelaps 
    })
  });

  const data = await response.json();

  if (response.ok && data.success) {
    showMessage('success', `${movelaps.length} movelaps added successfully`);
    await loadWorkoutData(activeSection);
    return data;
  } else {
    throw new Error(data.error || 'Failed to add movelaps');
  }
}

