import { useState, useEffect } from 'react';

export interface WorkoutFormData {
  name: string;
  code: string;
  sports: (string | null)[];
  includeStretching: boolean;
}

export interface WorkoutFormValidation {
  name: { valid: boolean; message: string };
  code: { valid: boolean; message: string };
  sports: { valid: boolean; message: string };
}

interface UseWorkoutFormProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  existingWorkout?: any;
  existingWorkouts: any[];
  day: any;
  workoutNumber: number;
  workoutSymbol: any;
  onSave: (workoutData: any) => Promise<void>;
  onClose: () => void;
}

/**
 * Custom hook for managing workout form state and validation
 * Extracted from AddWorkoutModal.tsx
 */
export function useWorkoutForm({
  isOpen,
  mode,
  existingWorkout,
  existingWorkouts,
  day,
  workoutNumber,
  workoutSymbol,
  onSave,
  onClose
}: UseWorkoutFormProps) {
  // ==================== STATE ====================
  const [formData, setFormData] = useState<WorkoutFormData>({
    name: '',
    code: '',
    sports: [null, null, null, null],
    includeStretching: false
  });

  const [validation, setValidation] = useState<WorkoutFormValidation>({
    name: { valid: true, message: '' },
    code: { valid: true, message: '' },
    sports: { valid: true, message: '' }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Get sports from moveframes in the day
   */
  const getSportsFromMoveframes = () => {
    if (!day || !day.workouts) return [];
    
    const allSports = new Set<string>();
    day.workouts.forEach((workout: any) => {
      if (workout.moveframes && Array.isArray(workout.moveframes)) {
        workout.moveframes.forEach((mf: any) => {
          if (mf.sport) {
            allSports.add(mf.sport);
          }
        });
      }
    });
    
    return Array.from(allSports);
  };

  /**
   * Get moveframe sports (memoized)
   */
  const moveframeSports = getSportsFromMoveframes();

  /**
   * Count selected sports (excluding stretching if not included)
   */
  const countSelectedSports = () => {
    return formData.sports.filter(s => {
      if (!s) return false;
      // If includeStretching is false, don't count STRETCHING towards the limit
      if (!formData.includeStretching && s === 'STRETCHING') return false;
      return true;
    }).length;
  };

  const selectedSportsCount = countSelectedSports();

  /**
   * Check if a sport index is from moveframes (read-only)
   */
  const isSportFromMoveframe = (index: number) => {
    if (mode === 'edit') return false; // In edit mode, all sports are editable
    const sport = formData.sports[index];
    return sport !== null && moveframeSports.includes(sport);
  };

  /**
   * Check if we can manually select a sport at this index
   */
  const canManuallySelectSport = (index: number) => {
    if (mode === 'edit') return true; // In edit mode, all are editable
    
    // If this slot already has a moveframe sport, it's read-only
    if (isSportFromMoveframe(index)) return false;
    
    // Can select if we have less than 4 sports total
    return selectedSportsCount < 4;
  };

  // ==================== VALIDATION FUNCTIONS ====================

  /**
   * Validate workout name
   */
  const validateName = (value: string) => {
    if (!value.trim()) {
      return { valid: false, message: 'Workout name is required' };
    }
    
    // Check uniqueness (case-insensitive), excluding current workout in edit mode
    const isDuplicate = existingWorkouts.some(
      w => w.id !== existingWorkout?.id && w.name?.toLowerCase() === value.toLowerCase()
    );
    
    if (isDuplicate) {
      return { valid: false, message: 'This name already exists for today' };
    }
    
    return { valid: true, message: '' };
  };

  /**
   * Validate workout code
   */
  const validateCode = (value: string) => {
    if (!value.trim()) {
      return { valid: false, message: 'Workout code is required' };
    }
    
    // Check uniqueness (case-insensitive), excluding current workout in edit mode
    const isDuplicate = existingWorkouts.some(
      w => w.id !== existingWorkout?.id && w.code?.toLowerCase() === value.toLowerCase()
    );
    
    if (isDuplicate) {
      return { valid: false, message: 'This code already exists for today' };
    }
    
    return { valid: true, message: '' };
  };

  /**
   * Validate sports selection
   */
  const validateSports = (sports: (string | null)[]) => {
    const selectedCount = sports.filter(s => s !== null).length;
    if (selectedCount === 0) {
      return { valid: false, message: 'Please select at least one sport' };
    }
    return { valid: true, message: '' };
  };

  /**
   * Check if entire form is valid
   */
  const isFormValid = () => {
    const nameVal = validateName(formData.name);
    const codeVal = validateCode(formData.code);
    const sportsVal = validateSports(formData.sports);
    
    setValidation({
      name: nameVal,
      code: codeVal,
      sports: sportsVal
    });
    
    return nameVal.valid && codeVal.valid && sportsVal.valid;
  };

  // ==================== HANDLERS ====================

  /**
   * Handle name change with validation
   */
  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    const nameValidation = validateName(value);
    setValidation({ ...validation, name: nameValidation });
  };

  /**
   * Handle code change with validation
   */
  const handleCodeChange = (value: string) => {
    setFormData({ ...formData, code: value });
    const codeValidation = validateCode(value);
    setValidation({ ...validation, code: codeValidation });
  };

  /**
   * Handle sport selection
   */
  const handleSportChange = (index: number, value: string | null) => {
    const newSports = [...formData.sports];
    newSports[index] = value;
    setFormData({ ...formData, sports: newSports });
    
    const sportsValidation = validateSports(newSports);
    setValidation({ ...validation, sports: sportsValidation });
  };

  /**
   * Handle stretching checkbox change
   */
  const handleStretchingChange = (checked: boolean) => {
    setFormData({ ...formData, includeStretching: checked });
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const workoutData = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        sessionNumber: workoutNumber,
        symbol: workoutSymbol.symbol,
        sports: formData.sports.filter(s => s !== null),
        includeStretching: formData.includeStretching,
        dayId: day.id,
        weekNumber: day.weekNumber,
        date: day.date,
        periodId: day.periodId
      };
      
      await onSave(workoutData);
      onClose();
    } catch (error) {
      console.error('Error creating workout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  // ==================== EFFECTS ====================

  /**
   * Initialize form when modal opens or mode changes
   */
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && existingWorkout) {
        // Load existing workout data
        setFormData({
          name: existingWorkout.name || '',
          code: existingWorkout.code || '',
          sports: existingWorkout.sports || [null, null, null, null],
          includeStretching: existingWorkout.includeStretching || false
        });
      } else {
        // Auto-load sports from moveframes in add mode
        const moveframeSportsData = getSportsFromMoveframes();
        
        // Initialize sports array with moveframe sports (up to 4)
        const initialSports: (string | null)[] = [null, null, null, null];
        moveframeSportsData.slice(0, 4).forEach((sport, index) => {
          initialSports[index] = sport;
        });
        
        setFormData({
          name: '',
          code: '',
          sports: initialSports,
          includeStretching: false
        });
      }
      setValidation({
        name: { valid: true, message: '' },
        code: { valid: true, message: '' },
        sports: { valid: true, message: '' }
      });
      setIsSubmitting(false);
    }
  }, [isOpen, mode, existingWorkout, day]);

  // ==================== RETURN VALUES ====================
  return {
    // State
    formData,
    validation,
    isSubmitting,
    
    // Computed values
    moveframeSports,
    selectedSportsCount,
    
    // Helper functions
    isSportFromMoveframe,
    canManuallySelectSport,
    isFormValid,
    
    // Handlers
    handleNameChange,
    handleCodeChange,
    handleSportChange,
    handleStretchingChange,
    handleSubmit,
    handleKeyDown,
    
    // Direct setters (if needed)
    setFormData,
    setValidation
  };
}

