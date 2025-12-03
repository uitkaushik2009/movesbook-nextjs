/**
 * useModalState Hook
 * Custom hook for managing modal visibility and associated data
 */

'use client';

import { useState, useCallback } from 'react';
import type { ModalState, WorkoutModalMode } from '@/types/workout.types';

interface UseModalStateReturn<T = any> {
  // State
  isOpen: boolean;
  data: T | null;
  mode: WorkoutModalMode;
  
  // Actions
  open: (data?: T, mode?: WorkoutModalMode) => void;
  close: () => void;
  setMode: (mode: WorkoutModalMode) => void;
  setData: (data: T | null) => void;
}

/**
 * Generic modal state management hook
 * Handles open/close, data, and mode (add/edit)
 */
export function useModalState<T = any>(
  initialMode: WorkoutModalMode = 'add'
): UseModalStateReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [mode, setMode] = useState<WorkoutModalMode>(initialMode);

  const open = useCallback((modalData?: T, modalMode: WorkoutModalMode = 'add') => {
    setData(modalData || null);
    setMode(modalMode);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Keep data and mode for a short time to allow animations
    setTimeout(() => {
      setData(null);
      setMode('add');
    }, 300);
  }, []);

  return {
    isOpen,
    data,
    mode,
    open,
    close,
    setMode,
    setData
  };
}

/**
 * Hook for managing multiple related modal states
 * Useful for workout system with many modals
 */
export function useWorkoutModals() {
  const addWorkout = useModalState();
  const addMoveframe = useModalState();
  const addMovelap = useModalState();
  const addDay = useModalState();
  
  const editDay = useModalState('edit');
  const editWorkout = useModalState('edit');
  const editMoveframe = useModalState('edit');
  const editMovelap = useModalState('edit');
  
  const importWorkouts = useModalState();
  const athleteSelector = useModalState();
  const startDatePicker = useModalState();

  /**
   * Close all modals
   */
  const closeAll = useCallback(() => {
    addWorkout.close();
    addMoveframe.close();
    addMovelap.close();
    addDay.close();
    editDay.close();
    editWorkout.close();
    editMoveframe.close();
    editMovelap.close();
    importWorkouts.close();
    athleteSelector.close();
    startDatePicker.close();
  }, [
    addWorkout,
    addMoveframe,
    addMovelap,
    addDay,
    editDay,
    editWorkout,
    editMoveframe,
    editMovelap,
    importWorkouts,
    athleteSelector,
    startDatePicker
  ]);

  return {
    addWorkout,
    addMoveframe,
    addMovelap,
    addDay,
    editDay,
    editWorkout,
    editMoveframe,
    editMovelap,
    importWorkouts,
    athleteSelector,
    startDatePicker,
    closeAll
  };
}

