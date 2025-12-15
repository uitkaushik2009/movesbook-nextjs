import { useState, useEffect } from 'react';
import { getSportConfig } from '@/constants/moveframe.constants';

export interface MoveframeFormData {
  // Basic fields
  sport: string;
  type: 'STANDARD' | 'BATTERY' | 'ANNOTATION';
  manualMode: boolean;
  manualPriority: boolean;
  
  // Standard fields
  distance: string;
  customDistance: string;
  repetitions: string;
  speed: string;
  style: string;
  pace: string;
  time: string;
  note: string;
  pause: string;
  macroFinal: string;
  alarm: string;
  sound: string;
  reps: string;
  r1: string;
  r2: string;
  
  // Body building specific fields
  muscularSector: string;
  exercise: string;
  
  // Annotation fields
  annotationText: string;
  annotationBgColor: string;
  annotationTextColor: string;
  
  // Battery fields
  batteryCount: number;
  batterySequence: any[];
  
  // Manual mode
  manualContent: string;
}

interface UseMoveframeFormProps {
  mode: 'add' | 'edit';
  existingMoveframe?: any;
  isOpen: boolean;
  workout: any;
  day: any;
}

/**
 * Custom hook for managing moveframe form state and validation
 * Extracted from AddEditMoveframeModal.tsx
 */
export function useMoveframeForm({
  mode,
  existingMoveframe,
  isOpen,
  workout,
  day
}: UseMoveframeFormProps) {
  // ==================== FORM STATE ====================
  const [sport, setSport] = useState<string>('SWIM');
  const [type, setType] = useState<'STANDARD' | 'BATTERY' | 'ANNOTATION'>('STANDARD');
  const [manualMode, setManualMode] = useState(false);
  const [manualPriority, setManualPriority] = useState(false);

  // Standard fields
  const [distance, setDistance] = useState('100');
  const [customDistance, setCustomDistance] = useState('');
  const [repetitions, setRepetitions] = useState('1');
  const [speed, setSpeed] = useState('A2');
  const [style, setStyle] = useState('');
  const [pace, setPace] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [pause, setPause] = useState('20"');
  const [macroFinal, setMacroFinal] = useState("0'");
  const [alarm, setAlarm] = useState('-1');
  const [sound, setSound] = useState('Beep');
  const [reps, setReps] = useState('');
  const [r1, setR1] = useState('');
  const [r2, setR2] = useState('');
  
  // Body building specific fields
  const [muscularSector, setMuscularSector] = useState('');
  const [exercise, setExercise] = useState('');

  // Annotation fields
  const [annotationText, setAnnotationText] = useState('');
  const [annotationBgColor, setAnnotationBgColor] = useState('#5168c2');
  const [annotationTextColor, setAnnotationTextColor] = useState('#000000');

  // Battery fields
  const [batteryCount, setBatteryCount] = useState(3);
  const [batterySequence, setBatterySequence] = useState<any[]>([]);

  // Manual mode fields
  const [manualContent, setManualContent] = useState('');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // ==================== COMPUTED VALUES ====================
  const sportConfig = getSportConfig(sport);

  // ==================== HELPER FUNCTIONS ====================
  
  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setSport('SWIM');
    setType('STANDARD');
    setManualMode(false);
    setManualPriority(false);
    setDistance('100');
    setCustomDistance('');
    setRepetitions('1');
    setSpeed('A2');
    setStyle('');
    setPace('');
    setTime('');
    setNote('');
    setPause('20"');
    setMacroFinal("0'");
    setAlarm('-1');
    setSound('Beep');
    setReps('');
    setR1('');
    setR2('');
    setMuscularSector('');
    setExercise('');
    setAnnotationText('');
    setAnnotationBgColor('#5168c2');
    setAnnotationTextColor('#000000');
    setBatteryCount(3);
    setBatterySequence([]);
    setManualContent('');
    setErrors({});
  };

  /**
   * Calculate total distance (distance * repetitions)
   */
  const calculateTotalDistance = () => {
    const dist = distance === 'custom' ? parseInt(customDistance) || 0 : parseInt(distance) || 0;
    const repsCount = parseInt(repetitions) || 1;
    return dist * repsCount;
  };

  /**
   * Calculate estimated time based on pace and distance
   */
  const calculateEstimatedTime = () => {
    if (!pace || !distance) return '';
    const totalDist = calculateTotalDistance();
    const [min, sec] = pace.split(':').map(p => parseInt(p) || 0);
    const paceSeconds = min * 60 + sec;
    const totalSeconds = (paceSeconds / 100) * totalDist;
    const estMin = Math.floor(totalSeconds / 60);
    const estSec = Math.floor(totalSeconds % 60);
    return `${estMin}:${estSec.toString().padStart(2, '0')}`;
  };

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!sport) {
      newErrors.sport = 'Sport is required';
    }

    if (type === 'STANDARD' && !manualMode) {
      if (sport === 'BODY_BUILDING') {
        if (!muscularSector) newErrors.muscularSector = 'Muscular sector is required';
        if (!exercise) newErrors.exercise = 'Exercise is required';
        if (!reps) newErrors.reps = 'Reps is required';
      } else {
        if (!distance && distance !== 'custom') newErrors.distance = 'Distance is required';
        if (distance === 'custom' && !customDistance) newErrors.customDistance = 'Custom distance is required';
      }
      if (!repetitions || parseInt(repetitions) < 1) {
        newErrors.repetitions = 'Repetitions must be at least 1';
      }
    }

    if (type === 'ANNOTATION' && !annotationText) {
      newErrors.annotationText = 'Annotation text is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Generate moveframe description based on current fields
   */
  const generateDescription = () => {
    if (manualMode && manualPriority) {
      return manualContent;
    }

    if (type === 'ANNOTATION') {
      return annotationText;
    }

    if (sport === 'BODY_BUILDING') {
      const macroFinalText = macroFinal ? ` M${macroFinal}` : '';
      const sectorText = muscularSector ? `${muscularSector} - ` : '';
      const exerciseText = exercise || 'Exercise';
      return `${sectorText}${exerciseText}: ${reps} reps ${speed} ${pause ? `P${pause}` : ''}${macroFinalText}`;
    }

    const dist = distance === 'custom' ? customDistance : distance;
    const repsCount = parseInt(repetitions) || 1;
    const repsText = ` x ${repsCount}`; // Always show repetitions
    const styleText = style ? ` ${style}` : '';
    const speedText = speed ? ` ${speed}` : '';
    const pauseText = pause ? ` P${pause}` : '';
    const macroFinalText = macroFinal ? ` M${macroFinal}` : ''; // Always show macro final if present
    
    return `${dist}m${repsText}${styleText}${speedText}${pauseText}${macroFinalText}`;
  };

  /**
   * Build moveframe data object for API submission
   */
  const buildMoveframeData = () => {
    return {
      sport,
      type,
      description: generateDescription(),
      
      // Standard fields
      distance: distance === 'custom' ? parseInt(customDistance) : parseInt(distance),
      repetitions: parseInt(repetitions),
      speed,
      style,
      pace,
      time: time || calculateEstimatedTime(),
      notes: note,
      pause,
      macroFinal,
      alarm: parseInt(alarm),
      sound,
      reps: sport === 'BODY_BUILDING' ? parseInt(reps) : null,
      r1: sport === 'BIKE' ? r1 : null,
      r2: sport === 'BIKE' ? r2 : null,
      muscularSector: sport === 'BODY_BUILDING' ? muscularSector : null,
      exercise: sport === 'BODY_BUILDING' ? exercise : null,
      
      // Annotation fields
      annotationText: type === 'ANNOTATION' ? annotationText : null,
      annotationBgColor: type === 'ANNOTATION' ? annotationBgColor : null,
      annotationTextColor: type === 'ANNOTATION' ? annotationTextColor : null,
      
      // Manual mode
      manualMode,
      manualPriority,
      manualContent: manualMode ? manualContent : null,
      
      // Metadata
      workoutSessionId: workout.id,
      dayId: day.id
    };
  };

  // ==================== EFFECTS ====================
  
  /**
   * Initialize form with existing data in edit mode
   */
  useEffect(() => {
    if (mode === 'edit' && existingMoveframe) {
      console.log('📝 Loading moveframe for editing:', existingMoveframe);
      
      // Set sport and type
      setSport(existingMoveframe.sport || 'SWIM');
      setType(existingMoveframe.type || 'STANDARD');
      
      // Handle ANNOTATION type
      if (existingMoveframe.type === 'ANNOTATION') {
        setAnnotationText(existingMoveframe.description || '');
        // Try to extract colors from the description or use defaults
        setAnnotationBgColor('#5168c2');
        setAnnotationTextColor('#000000');
        console.log('📝 Loaded ANNOTATION type');
      }
      // Handle BATTERY type
      else if (existingMoveframe.type === 'BATTERY') {
        setBatteryCount(existingMoveframe.movelaps?.length || 3);
        console.log('📝 Loaded BATTERY type');
      }
      // Handle STANDARD type
      else {
        // Extract data from first movelap if available
        const firstMovelap = existingMoveframe.movelaps?.[0];
        
        if (firstMovelap) {
          console.log('📋 Loading data from first movelap:', firstMovelap);
          
          // Distance and repetitions
          setDistance(firstMovelap.distance?.toString() || '100');
          setRepetitions(existingMoveframe.movelaps?.length?.toString() || '1');
          
          // Speed, style, and notes
          setSpeed(firstMovelap.speed || 'A2');
          setStyle(firstMovelap.style || '');
          setPace(firstMovelap.pace || '');
          setTime(firstMovelap.time || '');
          setNote(firstMovelap.notes || '');
          
          // Rest and alerts
          setPause(firstMovelap.pause || '20"');
          setMacroFinal(firstMovelap.macroFinal || "0'");
          setAlarm(firstMovelap.alarm?.toString() || '-1');
          setSound(firstMovelap.sound || 'Beep');
          
        // Special fields
        setReps(firstMovelap.reps?.toString() || '');
        setR1(firstMovelap.r1 || '');
        setR2(firstMovelap.r2 || '');
        setMuscularSector(firstMovelap.muscularSector || '');
        setExercise(firstMovelap.exercise || '');
        } else {
          console.log('⚠️ No movelaps found, loading defaults');
          setDistance('100');
          setRepetitions('1');
          setSpeed('A2');
        }
        
        // Manual content
        setManualContent(existingMoveframe.description || '');
        
        // Check if manual mode was used
        setManualMode(false);
        setManualPriority(false);
      }
    } else {
      resetForm();
    }
  }, [mode, existingMoveframe, isOpen]);

  // ==================== RETURN VALUES ====================
  return {
    // State values
    formData: {
      sport,
      type,
      manualMode,
      manualPriority,
      distance,
      customDistance,
      repetitions,
      speed,
      style,
      pace,
      time,
      note,
      pause,
      macroFinal,
      alarm,
      sound,
      reps,
      r1,
      r2,
      muscularSector,
      exercise,
      annotationText,
      annotationBgColor,
      annotationTextColor,
      batteryCount,
      batterySequence,
      manualContent
    },
    
    // State setters
    setters: {
      setSport,
      setType,
      setManualMode,
      setManualPriority,
      setDistance,
      setCustomDistance,
      setRepetitions,
      setSpeed,
      setStyle,
      setPace,
      setTime,
      setNote,
      setPause,
      setMacroFinal,
      setAlarm,
      setSound,
      setReps,
      setR1,
      setR2,
      setMuscularSector,
      setExercise,
      setAnnotationText,
      setAnnotationBgColor,
      setAnnotationTextColor,
      setBatteryCount,
      setBatterySequence,
      setManualContent
    },
    
    // Computed values
    sportConfig,
    totalDistance: calculateTotalDistance(),
    estimatedTime: calculateEstimatedTime(),
    description: generateDescription(),
    
    // Validation
    errors,
    isSaving,
    setIsSaving,
    
    // Functions
    resetForm,
    validateForm,
    buildMoveframeData,
    calculateTotalDistance,
    calculateEstimatedTime,
    generateDescription
  };
}

