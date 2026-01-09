import { useState, useEffect } from 'react';
import { getSportConfig, sportNeedsExerciseName, DISTANCE_BASED_SPORTS } from '@/constants/moveframe.constants';

export interface IndividualRepetitionPlan {
  index: number;
  speed?: string; // For distance-based sports
  time?: string; // For distance-based sports
  pause: string;
  reps?: string; // For BODY_BUILDING and other sports with tools
  weight?: string; // For BODY_BUILDING
  tools?: string; // For Gymnastic, Stretching, Pilates, Yoga, etc.
  macroFinal?: string; // Macro final value per repetition
  // New fields for enhanced planning
  strokes?: string; // Strokes for work section
  watts?: string; // Watts for work section
  restType?: string; // Rest type for pause section
  pauseMin?: string; // Pause minimum for pause section
  pauseMode?: string; // Mode for pause section
  pausePace?: string; // Pace for pause section
}

export interface MoveframeFormData {
  // Basic fields
  sport: string;
  type: 'STANDARD' | 'BATTERY' | 'ANNOTATION';
  manualMode: boolean;
  manualPriority: boolean;
  
  // Planning mode
  planningMode: 'all' | 'individual'; // 'all' = Plan for all, 'individual' = Plan one by one
  individualPlans: IndividualRepetitionPlan[]; // Individual settings per repetition
  
  // Standard fields
  distance: string;
  customDistance: string;
  repetitions: string;
  speed: string;
  style: string;
  pace: string;
  time: string;
  rowPerMin: string; // Row/min for ROWING sport (range 10-99)
  note: string;
  pause: string;
  restType: string; // 'Set time', 'Restart time', or 'Restart pulse'
  repsType: string; // 'Reps' or 'Time' (for non-distance sports)
  macroFinal: string;
  alarm: string;
  sound: string;
  reps: string;
  r1: string;
  r2: string;
  
  // Break mode fields (for distance-based sports)
  breakMode: string;
  breakTime: string;
  breakFromStandstill: string;
  breakVel100: string;
  
  // New fields for enhanced work and pause planning
  strokes: string;
  watts: string;
  pauseMin: string;
  pauseMode: string;
  pausePace: string;
  
  // Body building specific fields
  muscularSector: string;
  exercise: string;
  
  // Annotation fields
  annotationText: string;
  annotationBgColor: string;
  annotationTextColor: string;
  annotationBold: boolean; // Text style for annotation
  
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
  // Default sport: use first sport from workout.sports if available, otherwise 'SWIM'
  const getDefaultSport = () => {
    if (workout?.sports && workout.sports.length > 0) {
      return workout.sports[0].sport || 'SWIM';
    }
    return 'SWIM';
  };
  
  const [sport, setSport] = useState<string>(getDefaultSport());
  const [type, setType] = useState<'STANDARD' | 'BATTERY' | 'ANNOTATION'>('STANDARD');
  const [manualMode, setManualMode] = useState(false);
  const [manualPriority, setManualPriority] = useState(false);
  const [sectionId, setSectionId] = useState<string>(''); // Workout section for ALL sports

  // Planning mode
  const [planningMode, setPlanningMode] = useState<'all' | 'individual'>('all');
  const [individualPlans, setIndividualPlans] = useState<IndividualRepetitionPlan[]>([]);

  // Standard fields
  const [distance, setDistance] = useState('100');
  const [customDistance, setCustomDistance] = useState('');
  const [repetitions, setRepetitions] = useState('1');
  const [speed, setSpeed] = useState('A2');
  const [style, setStyle] = useState('');
  const [pace, setPace] = useState('');
  const [time, setTime] = useState('');
  const [rowPerMin, setRowPerMin] = useState(''); // Row/min for ROWING sport (range 10-99)
  const [note, setNote] = useState('');
  const [pause, setPause] = useState('20"');
  const [restType, setRestType] = useState('Set time'); // Rest type: 'Set time', 'Restart time', 'Restart pulse'
  const [repsType, setRepsType] = useState('Reps'); // Reps type: 'Reps' or 'Time' (for non-distance sports)
  const [macroFinal, setMacroFinal] = useState("0'");
  const [alarm, setAlarm] = useState('-1');
  const [sound, setSound] = useState('Beep');
  const [reps, setReps] = useState('');
  const [r1, setR1] = useState('');
  const [r2, setR2] = useState('');
  
  // Break mode fields (for distance-based sports)
  const [breakMode, setBreakMode] = useState('');
  const [breakTime, setBreakTime] = useState('');
  const [breakFromStandstill, setBreakFromStandstill] = useState('');
  const [breakVel100, setBreakVel100] = useState('');
  
  // New fields for enhanced work and pause planning
  const [strokes, setStrokes] = useState('');
  const [watts, setWatts] = useState('');
  const [pauseMin, setPauseMin] = useState('');
  const [pauseMode, setPauseMode] = useState('');
  const [pausePace, setPausePace] = useState('');
  
  // Body building specific fields
  const [muscularSector, setMuscularSector] = useState('');
  const [exercise, setExercise] = useState('');

  // Annotation fields
  const [annotationText, setAnnotationText] = useState('');
  const [annotationBgColor, setAnnotationBgColor] = useState('#5168c2');
  const [annotationTextColor, setAnnotationTextColor] = useState('#000000');
  const [annotationBold, setAnnotationBold] = useState(false);

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
    setSport(getDefaultSport()); // Use workout's first sport as default
    setType('STANDARD');
    setManualMode(false);
    setManualPriority(false);
    setSectionId(''); // Reset workout section
    setPlanningMode('all'); // Reset planning mode
    setIndividualPlans([]); // Clear individual plans
    setDistance('100');
    setCustomDistance('');
    setRepetitions('1');
    setSpeed('A2');
    setStyle('');
    setPace('');
    setTime('');
    setRowPerMin(''); // Reset Row/min
    setNote('');
    setPause('20"');
    setRestType('Set time'); // Default rest type
    setRepsType('Reps'); // Default reps type
    setMacroFinal("0'");
    setAlarm('-1');
    setSound('Beep');
    setReps('');
    setR1('');
    setR2('');
    setBreakMode('');
    setBreakTime('');
    setBreakFromStandstill('');
    setBreakVel100('');
    setStrokes('');
    setWatts('');
    setPauseMin('');
    setPauseMode('');
    setPausePace('');
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
   * Check if sport supports individual planning (all sports now support it)
   */
  const supportsIndividualPlanning = () => {
    // All sports now support individual planning
    return true;
  };

  /**
   * Check if can show individual planning (sport supports it AND reps <= 12)
   */
  const canShowIndividualPlanning = () => {
    const repsCount = parseInt(repetitions) || 0;
    return supportsIndividualPlanning() && repsCount > 0 && repsCount <= 12;
  };

  /**
   * Initialize individual plans array based on repetitions count
   */
  const initializeIndividualPlans = (repsCount: number) => {
    const plans: IndividualRepetitionPlan[] = [];
    const distanceBasedSports = ['SWIM', 'BIKE', 'RUN', 'ROWING', 'SKATE', 'SKI', 'SNOWBOARD'];
    const isBodyBuilding = sport === 'BODY_BUILDING';
    const isToolsBased = !distanceBasedSports.includes(sport) && !isBodyBuilding;
    
    for (let i = 0; i < repsCount; i++) {
      const plan: IndividualRepetitionPlan = {
        index: i + 1,
        pause: pause || '20"',
        macroFinal: macroFinal || "0'",
        // Initialize new fields
        strokes: strokes || '',
        watts: watts || '',
        restType: restType || 'Set time',
        pauseMin: pauseMin || '',
        pauseMode: pauseMode || '',
        pausePace: pausePace || ''
      };
      
      if (isBodyBuilding) {
        // BODY_BUILDING: reps, weight
        plan.reps = reps || '12';
        plan.weight = ''; // Start blank, user can enter 0-9999
      } else if (isToolsBased) {
        // TOOLS-BASED: reps, tools
        plan.reps = repetitions || '1'; // Use repetitions from moveframe
        plan.tools = '';
      } else {
        // DISTANCE-BASED: speed, time (time should be loaded from pace field, not time field)
        plan.speed = speed || 'A2';
        plan.time = pace || time || '0h05\'30"'; // Load from pace first, then time, then default
      }
      
      plans.push(plan);
    }
    setIndividualPlans(plans);
  };

  /**
   * Update an individual plan value
   * If updating the first row (index 0), automatically copy the value to all subsequent rows
   */
  const updateIndividualPlan = (index: number, field: 'speed' | 'time' | 'pause' | 'reps' | 'weight' | 'tools' | 'macroFinal' | 'strokes' | 'watts' | 'restType' | 'pauseMin' | 'pauseMode' | 'pausePace', value: string) => {
    // Force immediate update without batching
    setIndividualPlans(prev => {
      const updated = [...prev];
      
      // Update the specified row - create a new object reference to force re-render
      if (updated[index]) {
        updated[index] = { 
          ...updated[index], 
          [field]: value 
        };
      }
      
      // If updating the first row (index 0), copy the value to all subsequent rows (2nd to last)
      if (index === 0 && updated.length > 1) {
        for (let i = 1; i < updated.length; i++) {
          updated[i] = { ...updated[i], [field]: value };
        }
      }
      
      // Return a completely new array to ensure React detects the change
      return [...updated];
    });
  };

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Skip validation for ANNOTATION type - only annotation text is needed
    if (type === 'ANNOTATION') {
      setErrors(newErrors);
      return true;
    }

    // Skip sport and section validation in manual mode
    if (!manualMode) {
      if (!sport) {
        newErrors.sport = 'Sport is required';
      }

      // Workout Section is required only for STANDARD and BATTERY modes
      if ((type === 'STANDARD' || type === 'BATTERY') && !sectionId) {
        newErrors.sectionId = 'Workout section is required';
      }
    }

    if (type === 'STANDARD' && !manualMode) {
      if (sport === 'BODY_BUILDING') {
        if (!muscularSector) newErrors.muscularSector = 'Muscular sector is required';
        if (!exercise) newErrors.exercise = 'Exercise is required';
        // Reps is only required when execution type is "Reps", not when it's "Time/Minutes"
        if (repsType !== 'Time' && repsType !== 'Minutes' && !reps) {
          newErrors.reps = 'Reps is required';
        }
        // For Body Building, repetitions = number of series (1-99)
        if (!repetitions || parseInt(repetitions) < 1 || parseInt(repetitions) > 99) {
          newErrors.repetitions = 'Number of series must be between 1 and 99';
        }
      } else if (sport === 'FREE_MOVES') {
        // FREE_MOVES validation
        if (!exercise) newErrors.exercise = 'Exercise is required';
        if (!repetitions || parseInt(repetitions) < 1 || parseInt(repetitions) > 99) {
          newErrors.repetitions = 'Repetitions must be between 1 and 99';
        }
      } else {
        // Distance-based sports (SWIM, BIKE, RUN, etc.) and other sports
        const distanceBasedSports = ['SWIM', 'BIKE', 'RUN', 'ROWING', 'SKATE', 'SKI', 'SNOWBOARD'];
        const isDistanceBased = distanceBasedSports.includes(sport);
        
        if (isDistanceBased) {
          if (!distance && distance !== 'custom') newErrors.distance = 'Distance is required';
          if (distance === 'custom' && !customDistance) newErrors.customDistance = 'Custom distance is required';
        }
        
        if (!repetitions || parseInt(repetitions) < 1) {
          newErrors.repetitions = 'Repetitions must be at least 1';
        }
      }
    }

    // Annotation text is optional for all types

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Generate moveframe description based on current fields
   */
  const generateDescription = () => {
    // For ANNOTATION type, return the annotation text
    if (type === 'ANNOTATION') {
      return annotationText || '';
    }

    // For manual mode, return the HTML content as description
    if (manualMode) {
      return manualContent;
    }

    // Use individual plan values if in individual planning mode
    const effectivePause = (planningMode === 'individual' && individualPlans.length > 0) 
      ? individualPlans[0].pause 
      : pause;
    
    const effectiveMacroFinal = (planningMode === 'individual' && individualPlans.length > 0) 
      ? individualPlans[0].macroFinal 
      : macroFinal;

    if (sport === 'BODY_BUILDING') {
      const macroFinalText = effectiveMacroFinal ? ` M${effectiveMacroFinal}` : '';
      const sectorText = muscularSector ? `${muscularSector} - ` : '';
      const exerciseText = exercise || 'Exercise';
      const setsCount = parseInt(repetitions) || 1;
      const repsPerSet = repsType === 'Time' ? (time || '0\'') : (parseInt(reps) || 0);
      const repsLabel = repsType === 'Time' ? 'Minutes' : 'reps';
      const tempoText = speed ? ` ${speed}` : ''; // Speed of execution
      // Format pause text based on rest type
      let pauseText = '';
      if (effectivePause) {
        if (restType === 'Set time') {
          pauseText = ` Pause ${effectivePause}`;
        } else if (restType === 'Restart time') {
          pauseText = ` Restart to ${effectivePause}`;
        } else if (restType === 'Restart pulse') {
          pauseText = ` Restart to ${effectivePause} BPM`;
        } else {
          pauseText = ` Pause ${effectivePause}`;
        }
      }
      // Format: "Shoulders - Bench Press: 3 sets x 10 reps Very slow Pause 30" M0'"
      return `${sectorText}${exerciseText}: ${setsCount} sets x ${repsPerSet} ${repsLabel}${tempoText}${pauseText}${macroFinalText}`;
    }

    // Check if this is a distance-based sport
    const isDistanceSport = DISTANCE_BASED_SPORTS.includes(sport as any);
    
    if (isDistanceSport) {
      // Distance-based sports (SWIM, RUN, BIKE, etc.)
      const dist = (distance === 'custom' || distance === 'input') ? customDistance : distance;
      const repsCount = parseInt(repetitions) || 1;
      const repsText = ` x ${repsCount}`; // Always show repetitions
      const styleText = style ? ` ${style}` : '';
      const speedText = speed ? ` ${speed}` : '';
      // Format pause text based on rest type
      let pauseText = '';
      if (effectivePause) {
        if (restType === 'Set time') {
          pauseText = ` Pause ${effectivePause}`;
        } else if (restType === 'Restart time') {
          pauseText = ` Restart to ${effectivePause}`;
        } else if (restType === 'Restart pulse') {
          pauseText = ` Restart to ${effectivePause} BPM`;
        } else {
          pauseText = ` Pause ${effectivePause}`;
        }
      }
      const macroFinalText = effectiveMacroFinal ? ` M${effectiveMacroFinal}` : '';
      
      return `${dist}m${repsText}${styleText}${speedText}${pauseText}${macroFinalText}`;
    } else {
      // Non-distance sports (series-based) with exercise/drill names
      const exerciseText = exercise || 'Exercise';
      const setsCount = parseInt(repetitions) || 1;
      const repsPerSet = repsType === 'Time' ? (time || '0\'') : (parseInt(reps) || 1);
      const repsTypeText = repsType === 'Time' ? 'Minutes' : 'reps';
      const styleText = style ? ` ${style}` : '';
      const speedText = speed ? ` ${speed}` : '';
      // Format pause text based on rest type
      let pauseText = '';
      if (effectivePause) {
        if (restType === 'Set time') {
          pauseText = ` Pause ${effectivePause}`;
        } else if (restType === 'Restart time') {
          pauseText = ` Restart to ${effectivePause}`;
        } else if (restType === 'Restart pulse') {
          pauseText = ` Restart to ${effectivePause} BPM`;
        } else {
          pauseText = ` Pause ${effectivePause}`;
        }
      }
      const macroFinalText = effectiveMacroFinal ? ` M${effectiveMacroFinal}` : '';
      
      // Format: "Exercise name: 3 sets x 10 reps Pause 30" M0'"
      return `${exerciseText}: ${setsCount} sets x ${repsPerSet} ${repsTypeText}${styleText}${speedText}${pauseText}${macroFinalText}`;
    }
  };

  /**
   * Build moveframe data object for API submission
   */
  const buildMoveframeData = () => {
    // Determine notes value based on mode
    let notesValue = note;
    let descriptionValue = generateDescription();
    
    if (manualMode && manualContent) {
      // For manual mode, clean the content
      // Strip source code tags (pre, code, script, style)
      let cleanedContent = manualContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, '')
        .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, '');
      
      // Use cleaned content as notes (full content)
      notesValue = cleanedContent;
      
      // For description, extract text content and limit to 90 characters
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanedContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      descriptionValue = textContent.trim().substring(0, 90);
      if (textContent.length > 90) {
        descriptionValue += '...';
      }
    }

    // For manual mode, provide defaults for required fields
    const effectiveSport = sport || (manualMode ? 'FREE_MOVES' : 'SWIM');
    const effectiveSectionId = sectionId || null;

    // Calculate distance value - convert to string for storage
    const distanceValue = (distance === 'custom' || distance === 'input') ? customDistance : distance;
    const distanceNum = parseInt(distanceValue) || 0;

    return {
      sport: effectiveSport,
      type,
      description: descriptionValue,
      
      // Annotation fields (ONLY for ANNOTATION type)
      annotationText: type === 'ANNOTATION' ? (annotationText || null) : null,
      annotationBgColor: type === 'ANNOTATION' ? (annotationBgColor || null) : null,
      annotationTextColor: type === 'ANNOTATION' ? (annotationTextColor || null) : null,
      annotationBold: type === 'ANNOTATION' ? (annotationBold || false) : false,
      
      // Planning mode
      planningMode,
      individualPlans: planningMode === 'individual' ? individualPlans : [],
      
      // Standard fields
      distance: distanceNum,
      repetitions: parseInt(repetitions),
      speed,
      style,
      pace,
      time: time || calculateEstimatedTime(),
      rowPerMin: sport === 'ROWING' && rowPerMin ? parseInt(rowPerMin) : null,
      notes: notesValue,
      pause,
      restType: restType || null, // Used for movelap generation, not stored on moveframe
      repsType: repsType || null, // Used for movelap generation, not stored on moveframe
      macroFinal,
      alarm: parseInt(alarm),
      sound,
      reps: effectiveSport === 'BODY_BUILDING' ? parseInt(reps) : null,
      r1: effectiveSport === 'BIKE' ? r1 : null,
      r2: effectiveSport === 'BIKE' ? r2 : null,
      strokes: strokes || null,
      watts: watts || null,
      pauseMin: pauseMin || null,
      pauseMode: pauseMode || null,
      pausePace: pausePace || null,
      muscularSector: effectiveSport === 'BODY_BUILDING' ? muscularSector : null,
      exercise: sportNeedsExerciseName(effectiveSport) ? exercise : null,
      sectionId: effectiveSectionId, // Workout section (for ALL sports)
      
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
      
      // Set sport, type, and section
      setSport(existingMoveframe.sport || 'SWIM');
      setType(existingMoveframe.type || 'STANDARD');
      setSectionId(existingMoveframe.sectionId || ''); // Load workout section
      
      // Load annotation fields (available for all types)
      setAnnotationText(existingMoveframe.annotationText || '');
      setAnnotationBgColor(existingMoveframe.annotationBgColor || '#5168c2');
      setAnnotationTextColor(existingMoveframe.annotationTextColor || '#ffffff');
      setAnnotationBold(existingMoveframe.annotationBold || false);
      
      // Handle BATTERY type
      if (existingMoveframe.type === 'BATTERY') {
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
          setRestType(firstMovelap.restType || ''); // Load rest type
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
        
        // Manual content - check both description and notes fields
        // For manual mode, content might be in notes field
        const manualModeContent = existingMoveframe.manualMode 
          ? (existingMoveframe.notes || existingMoveframe.description || '')
          : (existingMoveframe.description || '');
        setManualContent(manualModeContent);
        
        // Check if manual mode was used
        setManualMode(existingMoveframe.manualMode || false);
        setManualPriority(false);
      }
    } else {
      resetForm();
    }
  }, [mode, existingMoveframe, isOpen, workout?.id]); // Reset when workout changes!

  /**
   * Initialize individual plans when planning mode changes to 'individual'
   * or when repetitions change while in individual planning mode
   */
  useEffect(() => {
    if (planningMode === 'individual' && canShowIndividualPlanning()) {
      const repsCount = parseInt(repetitions) || 0;
      
      // Only initialize if plans array is empty or different size
      if (individualPlans.length !== repsCount) {
        initializeIndividualPlans(repsCount);
      }
    }
  }, [planningMode, repetitions, sport]);

  // ==================== RETURN VALUES ====================
  return {
    // State values
    formData: {
      sport,
      type,
      manualMode,
      manualPriority,
      sectionId, // Workout section for ALL sports
      planningMode, // Planning mode: 'all' or 'individual'
      individualPlans, // Individual repetition plans
      distance,
      customDistance,
      repetitions,
      speed,
      style,
      pace,
      time,
      rowPerMin, // Row/min for ROWING
      note,
      pause,
      restType, // Rest type selection
      repsType, // Reps type selection (Reps or Time)
      macroFinal,
      alarm,
      sound,
      reps,
      r1,
      r2,
      breakMode,
      breakTime,
      breakFromStandstill,
      breakVel100,
      strokes,
      watts,
      pauseMin,
      pauseMode,
      pausePace,
      muscularSector,
      exercise,
      annotationText,
      annotationBgColor,
      annotationTextColor,
      annotationBold,
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
      setSectionId, // Workout section setter for ALL sports
      setPlanningMode, // Planning mode setter
      setIndividualPlans, // Individual plans setter
      setDistance,
      setCustomDistance,
      setRepetitions,
      setSpeed,
      setStyle,
      setPace,
      setTime,
      setRowPerMin, // Row/min setter
      setNote,
      setPause,
      setRestType, // Rest type setter
      setRepsType, // Reps type setter
      setMacroFinal,
      setAlarm,
      setSound,
      setReps,
      setR1,
      setR2,
      setBreakMode,
      setBreakTime,
      setBreakFromStandstill,
      setBreakVel100,
      setStrokes,
      setWatts,
      setPauseMin,
      setPauseMode,
      setPausePace,
      setMuscularSector,
      setExercise,
      setAnnotationText,
      setAnnotationBgColor,
      setAnnotationTextColor,
      setAnnotationBold,
      setBatteryCount,
      setBatterySequence,
      setManualContent
    },
    
    // Computed values
    sportConfig,
    totalDistance: calculateTotalDistance(),
    estimatedTime: calculateEstimatedTime(),
    description: generateDescription(),
    supportsIndividualPlanning: supportsIndividualPlanning(),
    canShowIndividualPlanning: canShowIndividualPlanning(),
    
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
    generateDescription,
    initializeIndividualPlans,
    updateIndividualPlan
  };
}

