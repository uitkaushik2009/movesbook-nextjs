'use client';

import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { SPORTS_LIST, MACRO_FINAL_OPTIONS, MUSCULAR_SECTORS, getPaceLabel, shouldShowPaceField, getSportConfig, getPauseOptions, REST_TYPES, REPS_TYPES, hasRepsTypeSelection, getSportDisplayName, DISTANCE_BASED_SPORTS } from '@/constants/moveframe.constants';
import { useMoveframeForm } from '@/hooks/useMoveframeForm';
import { getSportIcon } from '@/utils/sportIcons';
import { useFavoriteSports } from '@/hooks/useFavoriteSports';
import { useFreeMoveExercises } from '@/hooks/useFreeMoveExercises';
import Image from 'next/image';

interface AddEditMoveframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moveframeData: any) => void;
  mode: 'add' | 'edit';
  workout: any;
  day: any;
  existingMoveframe?: any;
}

export default function AddEditMoveframeModal({
  isOpen,
  onClose,
  onSave,
  mode,
  workout,
  day,
  existingMoveframe
}: AddEditMoveframeModalProps) {
  // Debug: Log mode on every render
  console.log(`🔒 AddEditMoveframeModal - mode="${mode}", isEditMode=${mode === 'edit'}`);
  
  // Get sport icon type from localStorage
  const [iconType, setIconType] = React.useState<'emoji' | 'icon'>('emoji');
  
  React.useEffect(() => {
    // Load icon type from localStorage on mount
    const saved = localStorage.getItem('sportIconType');
    if (saved === 'icon' || saved === 'emoji') {
      setIconType(saved);
    }
  }, []);

  // Get favorite sports
  const { favoriteSports, loading: loadingFavorites, reload: reloadFavorites } = useFavoriteSports();
  
  // Get FREE_MOVES exercise history
  const { 
    exercises: freeMoveExercises, 
    loading: loadingExercises, 
    addExercise: addFreeMoveExercise,
    deleteExercise: deleteFreeMoveExercise,
    reload: reloadExercises 
  } = useFreeMoveExercises();
  
  // Reload favorites when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Modal opened, reloading favorite sports...');
      reloadFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only depend on isOpen, not reloadFavorites to avoid infinite loop
  
  // Debug logging (only when changed)
  useEffect(() => {
    console.log('🎯 Favorite Sports:', favoriteSports.length, 'sports, Loading:', loadingFavorites);
  }, [favoriteSports.length, loadingFavorites]);

  // Use custom hook for form management
  const {
    formData,
    setters,
    sportConfig,
    totalDistance,
    estimatedTime,
    description,
    supportsIndividualPlanning,
    canShowIndividualPlanning,
    errors,
    isSaving,
    setIsSaving,
    resetForm,
    validateForm,
    buildMoveframeData,
    generateDescription,
    initializeIndividualPlans,
    updateIndividualPlan
  } = useMoveframeForm({
    mode,
    existingMoveframe,
    isOpen,
    workout,
    day
  });

  // Destructure for easier access
  const {
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
    muscularSector,
    exercise,
    annotationText,
    annotationBgColor,
    annotationTextColor,
    annotationBold,
    batteryCount,
    batterySequence,
    manualContent
  } = formData;

  const {
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
    setMuscularSector,
    setExercise,
    setAnnotationText,
    setAnnotationBgColor,
    setAnnotationTextColor,
    setAnnotationBold,
    setBatteryCount,
    setBatterySequence,
    setManualContent
  } = setters;

  // Format validation helpers (NOW sport is available)
  // Fast input parser for Pace - handles quick numeric input
  const parsePaceInput = (value: string, isKmPace: boolean = false): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    // Quick format as user types (auto-format immediately)
    const needsDecimal = sport !== 'BIKE';
    let formatted = '';
    
    if (digits.length === 1) {
      // Just minutes: "1" → "1'"
      formatted = `${digits}'`;
    } else if (digits.length === 2) {
      // Minutes + first second digit: "13" → "1'3"
      formatted = `${digits[0]}'${digits[1]}`;
    } else if (digits.length === 3) {
      // Full time without decimal: "130" → "1'30""
      formatted = `${digits[0]}'${digits.slice(1, 3)}"`;
      if (needsDecimal) formatted += '0';
    } else {
      // With decimal: "1305" → "1'30"5"
      const min = digits[0];
      const sec = digits.slice(1, 3);
      const dec = needsDecimal ? digits.slice(3, 4) : '';
      formatted = needsDecimal ? `${min}'${sec}"${dec}` : `${min}'${sec}"`;
    }
    
    return formatted;
  };

  const formatPace = (value: string, isKmPace: boolean = false): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    // Determine if we need decimal (all sports except BIKE)
    const needsDecimal = sport !== 'BIKE';
    
    // Pad with zeros if needed
    const padded = needsDecimal ? digits.padStart(4, '0') : digits.padStart(3, '0');
    const minutes = padded.slice(0, 1);
    const seconds = padded.slice(1, 3);
    const decimals = needsDecimal ? padded.slice(3, 4) : '';
    
    const min = parseInt(minutes);
    const sec = parseInt(seconds);
    
    if (sport === 'RUN') {
      if (isKmPace) {
        // Pace/km range: 2'00"0 to 9'59"0
        if (min < 2) return "2'00\"0";
        if (min > 9) return value;
        if (sec > 59) return `${minutes}'59\"${decimals}`;
      } else {
        // Pace/100m range: 0'00"0 to 1'59"0
        if (min > 1) return "1'59\"0";
        if (sec > 59) return `${minutes}'59\"${decimals}`;
      }
      return `${minutes}'${seconds}\"${decimals}`;
    }
    
    // BIKE: 0'00" to 9'59" (no decimal)
    if (sport === 'BIKE') {
      if (min > 9) return value;
      if (sec > 59) return `${minutes}'59\"`;
      return `${minutes}'${seconds}\"`;
    }
    
    // Other sports: 0'00"0 to 9'59"0
    if (min > 9) return value;
    if (sec > 59) return `${minutes}'59\"${decimals}`;
    return `${minutes}'${seconds}\"${decimals}`;
  };
  
  // Fast input parser for Pause - handles quick numeric input for pause times
  const parsePauseInput = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    // Quick format as user types (auto-format immediately)
    // Format: MM'SS" (e.g., 1'30", 2'45")
    let formatted = '';
    
    if (digits.length === 1) {
      // Just seconds first digit: "3" → "0'3"
      formatted = `0'${digits}`;
    } else if (digits.length === 2) {
      // Full seconds: "30" → "0'30""
      formatted = `0'${digits}"`;
    } else if (digits.length === 3) {
      // Minutes + first second digit: "130" → "1'30""
      const m = digits[0];
      const s = digits.slice(1, 3);
      formatted = `${m}'${s}"`;
    } else if (digits.length >= 4) {
      // More than 3 digits: "1305" → "13'05""
      const m = digits.slice(0, -2);
      const s = digits.slice(-2);
      formatted = `${m}'${s}"`;
    }
    
    return formatted;
  };

  const formatPause = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    // Parse minutes and seconds
    const padded = digits.padStart(3, '0');
    const minutes = padded.slice(0, -2);
    const seconds = padded.slice(-2);
    
    const min = parseInt(minutes);
    const sec = parseInt(seconds);
    
    // Validate seconds (max 59)
    if (sec > 59) {
      return `${minutes}'59"`;
    }
    
    return `${minutes}'${seconds}"`;
  };

  // Fast input parser for Reps Time - handles quick numeric input for time-based reps (Gymnastic, etc.)
  const parseRepsTimeInput = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    // Quick format as user types (auto-format immediately)
    // Format: MM'SS" (e.g., 0'30", 9'59")
    // Range: 00'01" to 09'59"
    let formatted = '';
    
    if (digits.length === 1) {
      // Just seconds first digit: "3" → "0'3"
      formatted = `0'${digits}`;
    } else if (digits.length === 2) {
      // Full seconds: "30" → "0'30""
      formatted = `0'${digits}"`;
    } else if (digits.length === 3) {
      // Minutes + seconds: "130" → "1'30""
      const m = digits[0];
      const s = digits.slice(1, 3);
      formatted = `${m}'${s}"`;
    } else if (digits.length >= 4) {
      // More than 3 digits: "930" → "9'30""
      const m = digits.slice(0, -2);
      const s = digits.slice(-2);
      formatted = `${m}'${s}"`;
    }
    
    return formatted;
  };

  const formatRepsTime = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    // Parse minutes and seconds
    const padded = digits.padStart(3, '0');
    const minutes = padded.slice(0, -2);
    const seconds = padded.slice(-2);
    
    const min = parseInt(minutes);
    const sec = parseInt(seconds);
    
    // Validate range: 00'01" to 09'59"
    if (min > 9) {
      alert('⚠️ Time value too high!\n\nMaximum allowed: 9\'59"\nPlease enter a value within the valid range.');
      return "9'59\"";
    }
    
    if (min === 0 && sec === 0) {
      alert('⚠️ Time value too low!\n\nMinimum allowed: 0\'01"\nPlease enter a value within the valid range.');
      return "0'01\"";
    }
    
    // Validate seconds (max 59)
    if (sec > 59) {
      return `${minutes}'59"`;
    }
    
    return `${minutes}'${seconds}"`;
  };
  
  // Fast input parser for Time - handles quick numeric input
  const parseTimeInput = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    // Quick format as user types (auto-format immediately)
    let formatted = '';
    
    if (digits.length === 1) {
      // Just minutes first digit: "5" → "0h5"
      formatted = `0h${digits}`;
    } else if (digits.length === 2) {
      // Full minutes: "53" → "0h53'"
      formatted = `0h${digits}'`;
    } else if (digits.length === 3) {
      // Minutes + first second digit: "530" → "0h05'3"
      const m = digits.slice(0, 2);
      const s1 = digits[2];
      formatted = `0h${m}'${s1}`;
    } else if (digits.length === 4) {
      // Full time without decimal: "5300" → "0h53'00""
      const m = digits.slice(0, 2);
      const s = digits.slice(2, 4);
      formatted = `0h${m}'${s}"`;
    } else if (digits.length === 5) {
      // With decimal: "53005" → "0h53'00"5"
      const m = digits.slice(0, 2);
      const s = digits.slice(2, 4);
      const d = digits[4];
      formatted = `0h${m}'${s}"${d}`;
    } else {
      // With hours: "153005" → "1h53'00"5"
      const h = digits[0];
      const m = digits.slice(1, 3);
      const s = digits.slice(3, 5);
      const d = digits.slice(5, 6);
      formatted = `${h}h${m}'${s}"${d}`;
    }
    
    return formatted;
  };

  const formatTime = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    // Pad with zeros if needed
    const padded = digits.padStart(6, '0');
    const hours = padded.slice(0, 1);
    const minutes = padded.slice(1, 3);
    const seconds = padded.slice(3, 5);
    const decimals = padded.slice(5, 6);
    
    const h = parseInt(hours);
    const m = parseInt(minutes);
    const s = parseInt(seconds);
    
    // Validate range: 0h00'00"0 to 9h00'00"0 (max 9 hours exactly)
    if (h > 9) return value;
    if (h === 9) {
      // When hours = 9, minutes and seconds must be 00
      return "9h00'00\"0";
    }
    if (m > 59) return `${hours}h59'${seconds}\"${decimals}`;
    if (s > 59) return `${hours}h${minutes}'59\"${decimals}`;
    
    return `${hours}h${minutes}'${seconds}\"${decimals}`;
  };
  
  // R1 and R2 options for BIKE
  const R1_OPTIONS = ['', '34', '36', '38', '39', '40', '48', '50', '52', '53', '54', '55'];
  const R2_OPTIONS = ['', ...Array.from({ length: 43 }, (_, i) => (i + 10).toString())]; // 10-52

  // Workout Sections state (loaded from Personal Settings - Periods)
  const [workoutSections, setWorkoutSections] = useState<any[]>([]);

  // Load workout sections (periods) from Prisma database
  useEffect(() => {
    const loadWorkoutSections = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Fetch periods from database
        const response = await fetch('/api/workouts/periods', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Set periods directly from API (already in correct format from Prisma)
          const periods = data.periods || [];
          setWorkoutSections(periods);
          console.log('✅ Loaded periods from database:', periods);
          
          if (periods.length === 0) {
            console.warn('⚠️ No periods found. Default periods should be created automatically.');
          }
        } else {
          console.error('Failed to load periods:', response.statusText);
          setWorkoutSections([]);
        }
      } catch (error) {
        console.error('❌ Error loading periods from database:', error);
        setWorkoutSections([]);
      }
    };
    
    if (isOpen) {
      loadWorkoutSections();
    }
  }, [isOpen]);

  // Auto-initialize sport and section for standard mode
  useEffect(() => {
    if (isOpen && type === 'STANDARD' && !manualMode && mode === 'add') {
      // Set default sport if not set
      if (!sport) {
        setSport('SWIM');
      }
    }
    
    // Set default section for STANDARD and BATTERY modes if not set and sections are loaded
    if (isOpen && (type === 'STANDARD' || type === 'BATTERY') && mode === 'add') {
      if (!sectionId && workoutSections.length > 0) {
        setSectionId(workoutSections[0].id);
      }
    }
  }, [isOpen, type, manualMode, mode, sport, sectionId, workoutSections, setSport, setSectionId]);

  // Debug: Log state changes
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 Modal State:', {
        type,
        manualMode,
        sport,
        sectionId,
        workoutSectionsLoaded: workoutSections.length > 0,
        workoutSectionsCount: workoutSections.length,
        shouldShowFields: type === 'STANDARD' && !manualMode
      });
    }
  }, [isOpen, type, manualMode, sport, sectionId, workoutSections]);

  // Debug: Log whenever periods are loaded
  useEffect(() => {
    if (workoutSections.length > 0) {
      console.log('📋 Periods loaded:', workoutSections);
      console.log('📋 Period count:', workoutSections.length);
      workoutSections.forEach((period, idx) => {
        console.log(`  ${idx + 1}. ${period.name} (ID: ${period.id}, Color: ${period.color})`);
      });
    }
  }, [workoutSections]);

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const moveframeData = buildMoveframeData();
      console.log('📤 Sending moveframe data:', moveframeData);
      await onSave(moveframeData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving moveframe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle close
  const [activeTab, setActiveTab] = React.useState<'edit' | 'manual' | 'favorites'>('edit');
  const editorRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: 'edit' | 'manual' | 'favorites') => {
    setActiveTab(tab);
    // Immediately scroll to top when changing tabs
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
    setActiveTab('edit');
  };

  // Rich text editor commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setManualContent(editorRef.current.innerHTML);
    }
  };

  // Initialize editor content when switching to manual tab
  React.useEffect(() => {
    if (editorRef.current && activeTab === 'manual' && manualMode) {
      // Only update if we're switching to this tab or opening with content
      if (manualContent && editorRef.current.innerHTML !== manualContent) {
        // Use a timeout to avoid conflicts with React's rendering
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = manualContent || '';
          }
        }, 0);
      }
    }
  }, [activeTab, manualMode]);
  
  // Clear editor when modal closes
  React.useEffect(() => {
    if (!isOpen && editorRef.current) {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      }, 0);
    }
  }, [isOpen]);

  // Auto-enable manual mode when switching to manual tab
  React.useEffect(() => {
    if (type === 'STANDARD' && activeTab === 'manual' && !manualMode) {
      setManualMode(true);
    }
  }, [activeTab, type, manualMode, setManualMode]);

  // Reset scroll position when switching tabs
  React.useEffect(() => {
    if (bodyRef.current) {
      // Use requestAnimationFrame for better timing with DOM updates
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (bodyRef.current) {
            bodyRef.current.scrollTop = 0;
            // Force a layout recalculation
            bodyRef.current.scrollHeight;
          }
        });
      });
    }
  }, [activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold">
            {mode === 'add' ? 'Add Moveframe' : 'Edit Moveframe'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        {type === 'STANDARD' && (
          <div className="flex border-b border-gray-300 bg-gray-50 flex-shrink-0">
            <button
              onClick={() => handleTabChange('edit')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'edit'
                  ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Edit Moveframe
            </button>
            <button
              onClick={() => handleTabChange('manual')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'manual'
                  ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Moveframe Info (manual input)
            </button>
            <button
              onClick={() => handleTabChange('favorites')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'favorites'
                  ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Load from Favourites moveframes
            </button>
          </div>
        )}

        {/* Body */}
        <div ref={bodyRef} className="overflow-y-auto p-4 pb-64" style={{ height: type === 'STANDARD' ? 'calc(80vh - 140px)' : 'calc(80vh - 100px)' }}>
          {/* Edit Moveframe Tab */}
          {(type !== 'STANDARD' || activeTab === 'edit') && (
            <div key="edit-tab">
          {/* Error Message */}
          {errors.general && (
            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {errors.general}
            </div>
          )}

              {/* Icon Type Toggle */}
              {(favoriteSports.length > 0 || loadingFavorites) && (
                <div className="mb-3 flex items-center justify-end gap-2">
                  <span className="text-xs text-gray-600">Icon Type:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newType = iconType === 'emoji' ? 'icon' : 'emoji';
                      localStorage.setItem('sportIconType', newType);
                      setIconType(newType);
                    }}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      iconType === 'emoji'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                    title="Toggle between color emoji icons and black/white image icons"
                  >
                    {iconType === 'emoji' ? '😊 Color' : '⚫ Black'}
                  </button>
                </div>
              )}

              {/* Favorite Sports Quick Selection */}
              {loadingFavorites && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                  <div className="text-xs text-gray-600 flex items-center gap-2">
                    <div className="animate-spin">⏳</div>
                    Loading favorite sports...
                  </div>
                </div>
              )}
              
              {!loadingFavorites && favoriteSports.length === 0 && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700">
                    💡 <strong>No favorite sports set.</strong> Go to Personal Settings → Favorite Sports to select up to 5 favorite sports for quick access!
                  </div>
                </div>
              )}
              
              {!loadingFavorites && favoriteSports.length > 0 && (
                <div className={`mb-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 ${mode === 'edit' ? 'relative' : ''}`}>
                  {mode === 'edit' && (
                    <div 
                      className="absolute inset-0 z-[9999] cursor-not-allowed rounded-lg bg-gray-50 bg-opacity-60" 
                      title="Sport cannot be changed in edit mode"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-400" />
                      <span className="text-xs font-bold text-gray-700">Favorite Sports - Quick Select ({favoriteSports.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => reloadFavorites()}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      title="Reload favorite sports"
                    >
                      🔄 Reload
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {favoriteSports.slice(0, 5).map((favSport) => {
                      const icon = getSportIcon(favSport, iconType);
                      const isImage = icon.startsWith('/');
                      const isSelected = sport === favSport;
                      
                      return (
                        <button
                          key={favSport}
                          type="button"
                          onClick={() => {
                            // Only allow in add mode
                            if (mode === 'edit') return;
                            
                            // Same validation logic as the dropdown
                            if (mode === 'add') {
                              const existingSports = new Set<string>();
                              (workout.moveframes || []).forEach((mf: any) => {
                                if (mf.sport && mf.sport !== 'STRETCHING') {
                                  existingSports.add(mf.sport);
                                }
                              });
                              
                              if (workout.includeStretching === false) {
                                existingSports.delete('STRETCHING');
                              }
                              
                              if (!existingSports.has(favSport) && favSport !== 'STRETCHING' && existingSports.size >= 4) {
                                alert('⚠️ Maximum 4 sports allowed per workout!\n\nThis workout already has 4 sports. You cannot add a 5th sport.\n\nPlease select one of the existing sports or remove moveframes to change sports.');
                                return;
                              }
                            }
                            
                            setSport(favSport);
                          }}
                          disabled={mode === 'edit'}
                          className={`flex flex-col items-center justify-center w-20 p-2 rounded-lg border-2 transition-all ${
                            mode === 'add' ? 'hover:scale-105' : 'cursor-not-allowed opacity-50'
                          } ${
                            isSelected 
                              ? 'border-cyan-500 bg-cyan-50 shadow-md' 
                              : mode === 'add' 
                                ? 'border-gray-300 bg-white hover:border-yellow-400 hover:bg-yellow-50'
                                : 'border-gray-300 bg-gray-100'
                          }`}
                          title={mode === 'edit' ? 'Sport cannot be changed in edit mode' : `Select ${favSport.replace(/_/g, ' ')}`}
                        >
                          {isImage ? (
                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                              <Image 
                                src={icon} 
                                alt={favSport}
                                width={48}
                                height={48}
                                className="object-contain"
                                style={{ width: '48px', height: '48px' }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center text-3xl flex-shrink-0">
                              {icon}
                            </div>
                          )}
                          <span className="text-[9px] font-medium text-gray-700 mt-1 text-center leading-tight">
                            {favSport.replace(/_/g, ' ').substring(0, 12)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
            </div>
          )}

          {/* Sport Selection */}
          <div className={`mb-3 ${mode === 'edit' ? 'relative' : ''}`}>
            {mode === 'edit' && (
              <div 
                className="absolute inset-0 z-[9999] cursor-not-allowed bg-gray-50 bg-opacity-50" 
                title="Sport cannot be changed in edit mode"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            )}
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Sport <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={sport}
                onChange={(e) => {
                  // Prevent any changes in edit mode
                  if (mode === 'edit') {
                    e.preventDefault();
                    return;
                  }
                  
                  const newSport = e.target.value;
                  
                  // Check if adding a new sport would exceed 4 sports limit (in ADD mode only)
                  if (mode === 'add') {
                    const existingSports = new Set<string>();
                    (workout.moveframes || []).forEach((mf: any) => {
                      if (mf.sport && mf.sport !== 'STRETCHING') {
                        existingSports.add(mf.sport);
                      }
                    });
                    
                    // Exclude STRETCHING from count if includeStretching is false
                    if (workout.includeStretching === false) {
                      existingSports.delete('STRETCHING');
                    }
                    
                    // Check if new sport would be the 5th one
                    if (!existingSports.has(newSport) && newSport !== 'STRETCHING' && existingSports.size >= 4) {
                      alert('⚠️ Maximum 4 sports allowed per workout!\n\nThis workout already has 4 sports. You cannot add a 5th sport.\n\nPlease select one of the existing sports or remove moveframes to change sports.');
                      return;
                    }
                  }
                  
                  setSport(newSport);
                }}
                onMouseDown={(e) => mode === 'edit' && e.preventDefault()}
                onKeyDown={(e) => mode === 'edit' && e.preventDefault()}
                disabled={mode === 'edit'}
                className={`flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm ${
                  mode === 'edit' ? 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none' : ''
                }`}
                style={mode === 'edit' ? { pointerEvents: 'none' } : undefined}
                size={1}
              >
                {SPORTS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {getSportDisplayName(s)}
                  </option>
                ))}
              </select>
              {/* Sport Icon Display */}
              {sport && (() => {
                const icon = getSportIcon(sport, iconType);
                const isImage = icon.startsWith('/');
                return isImage ? (
                  <div className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-gray-50">
                    <Image 
                      src={icon} 
                      alt={sport}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center text-2xl border border-gray-300 rounded bg-gray-50">
                    {icon}
                  </div>
                );
              })()}
            </div>
            {errors.sport && <p className="mt-0.5 text-xs text-red-500">{errors.sport}</p>}
          </div>

          {/* Type Selection */}
          <div className={`mb-3 ${mode === 'edit' ? 'relative' : ''}`}>
            {mode === 'edit' && (
              <div 
                className="absolute inset-0 z-[9999] cursor-not-allowed bg-gray-50 bg-opacity-50" 
                title="Type cannot be changed in edit mode"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            )}
            <label className="block text-xs font-bold text-gray-700 mb-2">Type</label>
            <div className="flex gap-2" style={mode === 'edit' ? { pointerEvents: 'none' } : undefined}>
              <button
                type="button"
                onClick={(e) => {
                  if (mode === 'edit') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  setType('STANDARD');
                }}
                disabled={mode === 'edit'}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded border-2 transition-colors ${
                  type === 'STANDARD'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${mode === 'edit' ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={(e) => {
                  if (mode === 'edit') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  setType('BATTERY');
                }}
                disabled={mode === 'edit'}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded border-2 transition-colors ${
                  type === 'BATTERY'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${mode === 'edit' ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}
              >
                Battery
              </button>
              <button
                type="button"
                onClick={(e) => {
                  if (mode === 'edit') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  setType('ANNOTATION');
                }}
                disabled={mode === 'edit'}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded border-2 transition-colors ${
                  type === 'ANNOTATION'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${mode === 'edit' ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}
              >
                📝 Annotation
              </button>
            </div>
          </div>

          {/* Workout Section Selection - Only for STANDARD and BATTERY modes */}
          {(type === 'STANDARD' || type === 'BATTERY') && (
          <div className="mb-3">
              {mode === 'edit' && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    ℹ️ <strong>Edit Mode:</strong> You can only edit parameters starting from "Workout Section" below. Sport and Type are locked.
                  </p>
                </div>
              )}
            <label className="block text-xs font-bold text-gray-700 mb-1">
                Workout Section (Period) <span className="text-red-500">*</span>
            </label>
              <div className="flex items-center gap-2">
            <select
              value={sectionId}
                  onChange={(e) => {
                    console.log('🔄 Period selected:', e.target.value);
                    console.log('🔍 Available periods:', workoutSections);
                    setSectionId(e.target.value);
                  }}
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-gray-900 bg-white"
                  style={{ color: '#000000' }}
                >
                  <option value="" style={{ color: '#666666' }}>Select period...</option>
                  {workoutSections.length === 0 && (
                    <option disabled style={{ color: '#999999' }}>No periods available</option>
                  )}
                  {workoutSections.map((section, index) => (
                    <option 
                      key={section.id || `period-${index}`} 
                      value={section.id}
                      style={{ 
                        color: '#000000',
                        backgroundColor: '#ffffff'
                      }}
                    >
                  {section.name}
                </option>
              ))}
            </select>
                {/* Show selected period color */}
                {sectionId && (() => {
                  const selectedSection = workoutSections.find(s => s.id === sectionId);
                  return selectedSection?.color ? (
                    <div 
                      className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: selectedSection.color }}
                      title={selectedSection.name}
                    />
                  ) : null;
                })()}
              </div>
            {errors.sectionId && <p className="mt-0.5 text-xs text-red-500">{errors.sectionId}</p>}
              {workoutSections.length === 0 && (
                <p className="mt-1 text-xs text-orange-600">
                  ⚠️ No periods found. Please add periods in Personal Settings → Tools.
                </p>
              )}
          </div>
          )}
          
          {/* Annotation Section - Show when type is ANNOTATION, or optional for other types */}
          {type === 'ANNOTATION' && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h3 className="font-bold text-sm text-blue-900 mb-3">📝 Annotation</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annotation text
                </label>
                <input
                  type="text"
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Add a note or highlight for this moveframe..."
                />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Background color
              </label>
                    <div className="flex items-center gap-2">
                <input
                        type="color"
                        value={annotationBgColor}
                        onChange={(e) => setAnnotationBgColor(e.target.value)}
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={annotationBgColor}
                        onChange={(e) => setAnnotationBgColor(e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Text color
              </label>
                    <div className="flex items-center gap-2">
                <input
                        type="color"
                        value={annotationTextColor}
                        onChange={(e) => setAnnotationTextColor(e.target.value)}
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={annotationTextColor}
                        onChange={(e) => setAnnotationTextColor(e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Style Toggle */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Text Style
              </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAnnotationBold(false)}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded border-2 transition-colors ${
                        !annotationBold
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnotationBold(true)}
                      className={`flex-1 px-4 py-2 text-sm font-bold rounded border-2 transition-colors ${
                        annotationBold
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Bold
                    </button>
                  </div>
            </div>
          </div>

              {annotationText && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Preview:</p>
                  <div
                    style={{
                      backgroundColor: annotationBgColor,
                      color: annotationTextColor
                    }}
                    className={`p-2 rounded text-sm ${annotationBold ? 'font-bold' : 'font-normal'}`}
                  >
                    {annotationText}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Debug Info */}
          {type === 'STANDARD' && manualMode && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ Manual mode is enabled. Switch to "Edit Moveframe" tab to see form fields.
              </p>
            </div>
          )}

          {/* Standard Mode - Simplified to 5 fields only */}
          {type === 'STANDARD' && !manualMode && (
            <div className="space-y-3">
              
              {/* Simplified form with only 5 fields */}
              <div className="space-y-3">
                {/* 1. Distance (m) */}
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <h3 className="font-bold text-xs text-gray-700 mb-2">DISTANCE & REPETITIONS</h3>
                  
                  {sport === 'BODY_BUILDING' ? (
                    <>
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Muscular Sector: <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={muscularSector}
                          onChange={(e) => setMuscularSector(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="">Select muscular sector</option>
                          {MUSCULAR_SECTORS.map((sector) => (
                            <option key={sector} value={sector}>
                              {sector}
                            </option>
                          ))}
                        </select>
                        {errors.muscularSector && <p className="mt-1 text-xs text-red-500">{errors.muscularSector}</p>}
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Exercise + Picture: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={exercise}
                          onChange={(e) => setExercise(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          placeholder="e.g., Bench Press, Bicep Curls..."
                        />
                        <p className="mt-1 text-[10px] text-blue-600 font-semibold">
                          📋 Manual entry (Sector + Exercise + Picture selection from archive coming soon)
                        </p>
                        {errors.exercise && <p className="mt-1 text-xs text-red-500">{errors.exercise}</p>}
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Number of series: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={repetitions}
                          onChange={(e) => setRepetitions(e.target.value)}
                          min="1"
                          max="99"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          placeholder="1"
                        />
                        <p className="mt-1 text-[10px] text-gray-500">
                          Range: 1-99 (default: 1)
                        </p>
                        {errors.repetitions && <p className="mt-1 text-xs text-red-500">{errors.repetitions}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reps (per series):</label>
                        <input
                          type="number"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          placeholder="12"
                        />
                        {errors.reps && <p className="mt-1 text-xs text-red-500">{errors.reps}</p>}
                      </div>

                      {/* Planning Mode Selection for BODY_BUILDING */}
                      {parseInt(repetitions) > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-300">
                          <label className="block text-xs font-semibold text-gray-700 mb-2">Planning Mode:</label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="planningMode"
                                value="all"
                                checked={planningMode === 'all'}
                                onChange={() => setPlanningMode('all')}
                                className="w-4 h-4 text-cyan-600"
                              />
                              <span className="text-sm text-gray-700">Plan for all the repetitions</span>
                            </label>
                            {canShowIndividualPlanning && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="planningMode"
                                  value="individual"
                                  checked={planningMode === 'individual'}
                                  onChange={() => setPlanningMode('individual')}
                                  className="w-4 h-4 text-cyan-600"
                                />
                                <span className="text-sm text-gray-700">
                                  Plan one by one (until to 12 repetitions)
                                </span>
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Determine sport type */}
                      {(() => {
                        const isDistanceBased = DISTANCE_BASED_SPORTS.includes(sport as any);
                        const hasTools = !isDistanceBased;
                        
                        // TOOLS-BASED SPORTS (Gymnastic, Stretching, Pilates, Yoga, etc.)
                        if (hasTools) {
                          return (
                            <>
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Repetitions: <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={repetitions}
                                  onChange={(e) => setRepetitions(e.target.value)}
                                  min="1"
                                  max="99"
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                                  placeholder="1"
                                />
                                <p className="mt-1 text-[10px] text-gray-500">
                                  Range: 1-99 (default: 1)
                                </p>
                                {errors.repetitions && <p className="mt-1 text-xs text-red-500">{errors.repetitions}</p>}
                              </div>

                              {/* Reps Type Selector - for sports that support it */}
                              {hasRepsTypeSelection(sport) && (
                                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <label className="block text-xs font-semibold text-gray-700 mb-2">Reps Type:</label>
                                  <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="repsType"
                                        value={REPS_TYPES.REPS}
                                        checked={repsType === REPS_TYPES.REPS}
                                        onChange={() => setRepsType(REPS_TYPES.REPS)}
                                        className="w-4 h-4 text-blue-600"
                                      />
                                      <span className="text-sm text-gray-700">Reps</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="repsType"
                                        value={REPS_TYPES.TIME}
                                        checked={repsType === REPS_TYPES.TIME}
                                        onChange={() => setRepsType(REPS_TYPES.TIME)}
                                        className="w-4 h-4 text-blue-600"
                                      />
                                      <span className="text-sm text-gray-700">Time</span>
                                    </label>
                                  </div>
                                  
                                  {/* Conditional Input based on Reps Type */}
                                  <div className="mt-3">
                                    {repsType === REPS_TYPES.REPS ? (
                                      <>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Reps (per series): <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                          type="number"
                                          value={reps}
                                          onChange={(e) => setReps(e.target.value)}
                                          onBlur={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (e.target.value && value < 1) {
                                              alert('⚠️ Reps value too low!\n\nMinimum allowed: 1\nPlease enter a value within the valid range (01-99).');
                                              setReps('1');
                                            } else if (value > 99) {
                                              alert('⚠️ Reps value too high!\n\nMaximum allowed: 99\nPlease enter a value within the valid range (01-99).');
                                              setReps('99');
                                            }
                                          }}
                                          min="1"
                                          max="99"
                                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                          placeholder="12"
                                        />
                                        <p className="mt-0.5 text-[10px] text-gray-500">Range: 01-99</p>
                                      </>
                                    ) : (
                                      <>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Time (per series): <span className="text-red-500">*</span> <span className="text-green-600 font-semibold text-[10px]">⚡ Type numbers only</span>
                                        </label>
                                        <input
                                          type="text"
                                          value={time}
                                          onChange={(e) => {
                                            const input = e.target.value;
                                            // Auto-format as user types using fast input
                                            const parsed = parseRepsTimeInput(input);
                                            setTime(parsed);
                                          }}
                                          onBlur={(e) => setTime(formatRepsTime(e.target.value))}
                                          className="w-full px-3 py-2 border-2 border-green-300 rounded focus:ring-2 focus:ring-green-500 font-mono bg-green-50"
                                          placeholder="30 ⚡"
                                          title="⚡ Fast input: Type 30 for 0'30&quot;"
                                        />
                                        <p className="mt-0.5 text-[10px] text-green-600 font-semibold">
                                          ⚡ Fast input: Type <span className="font-mono bg-white px-1 rounded">30</span> → 0'30" | <span className="font-mono bg-white px-1 rounded">130</span> → 1'30" | Range: 00'01" to 09'59"
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Planning Mode Selection for tools-based sports */}
                              {parseInt(repetitions) > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-300">
                                  <label className="block text-xs font-semibold text-gray-700 mb-2">Planning Mode:</label>
                                  <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="planningMode"
                                        value="all"
                                        checked={planningMode === 'all'}
                                        onChange={() => setPlanningMode('all')}
                                        className="w-4 h-4 text-cyan-600"
                                      />
                                      <span className="text-sm text-gray-700">Plan for all the repetitions</span>
                                    </label>
                                    {canShowIndividualPlanning && (
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name="planningMode"
                                          value="individual"
                                          checked={planningMode === 'individual'}
                                          onChange={() => setPlanningMode('individual')}
                                          className="w-4 h-4 text-cyan-600"
                                        />
                                        <span className="text-sm text-gray-700">
                                          Plan one by one (until to 12 repetitions)
                                        </span>
                                      </label>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        }
                        
                        // DISTANCE-BASED SPORTS (Swim, Bike, Run, Rowing, Skate, Ski, Snowboard)
                        if (isDistanceBased && 'meters' in sportConfig) {
                          return (
                            <>
                      {/* Distance-based sports fields */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Meters: <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          >
                            {sportConfig.meters.map((m) => (
                              <option key={m} value={m}>
                              {m === 'input' ? 'Custom distance...' : `${m}m`}
                              </option>
                            ))}
                          </select>
                          {errors.distance && <p className="mt-1 text-xs text-red-500">{errors.distance}</p>}
                        </div>

                      {(distance === 'custom' || distance === 'input') && (
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Custom Distance:</label>
                          <input
                            type="number"
                            value={customDistance}
                            onChange={(e) => setCustomDistance(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                            placeholder="Enter custom distance"
                          />
                          {errors.customDistance && <p className="mt-1 text-xs text-red-500">{errors.customDistance}</p>}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Repetitions:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={repetitions}
                            onChange={(e) => setRepetitions(e.target.value)}
                            min="1"
                            max="99"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          />
                          <span className="text-gray-500">×</span>
                        </div>
                        {errors.repetitions && <p className="mt-1 text-xs text-red-500">{errors.repetitions}</p>}
                        {totalDistance > 0 && (
                          <p className="mt-1 text-xs text-green-600 font-medium">
                            Total: {totalDistance}m
                          </p>
                        )}
                      </div>

                      {/* Planning Mode Selection for distance-based sports */}
                      {parseInt(repetitions) > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-300">
                          <label className="block text-xs font-semibold text-gray-700 mb-2">Planning Mode:</label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="planningMode"
                                value="all"
                                checked={planningMode === 'all'}
                                onChange={() => setPlanningMode('all')}
                                className="w-4 h-4 text-cyan-600"
                              />
                              <span className="text-sm text-gray-700">Plan for all the repetitions</span>
                            </label>
                            {canShowIndividualPlanning && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="planningMode"
                                  value="individual"
                                  checked={planningMode === 'individual'}
                                  onChange={() => setPlanningMode('individual')}
                                  className="w-4 h-4 text-cyan-600"
                                />
                                <span className="text-sm text-gray-700">
                                  Plan one by one (until to 12 repetitions)
                                </span>
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                            </>
                          );
                        }
                        
                        return null;
                      })()}
                    </>
                  )}
                </div>

                {/* 2. Sport-Specific Fields */}
                {sport !== 'BODY_BUILDING' && (
                <div className="bg-gray-50 p-2.5 rounded-lg">
                    <h3 className="font-bold text-xs text-gray-700 mb-2">
                      {sport === 'BIKE' ? 'BIKE SETTINGS' : 'STYLE & TECHNIQUE'}
                    </h3>
                    
                    {/* Style - For sports with styles defined */}
                    {'styles' in sportConfig && sportConfig.styles && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Style:</label>
                        {Array.isArray(sportConfig.styles) ? (
                          <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value="">Select style...</option>
                            {sportConfig.styles.map((s: string) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                            placeholder="Enter style..."
                          />
                        )}
                        <p className="mt-0.5 text-[10px] text-gray-500">
                          {sport === 'SWIM' && 'Swimming style/stroke'}
                          {sport === 'RUN' && 'Running surface/terrain'}
                          {sport === 'BIKE' && 'Bike type/terrain'}
                          {sport === 'SKATE' && 'Skating surface'}
                          {sport === 'SKI' && 'Skiing style'}
                          {sport === 'SNOWBOARD' && 'Snowboarding style'}
                        </p>
                      </div>
                    )}
                    
                    {/* R1 and R2 - Only for BIKE */}
                    {sport === 'BIKE' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">R1 (Front Gear):</label>
                          <select
                            value={r1}
                            onChange={(e) => setR1(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          >
                            {R1_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt || 'Not set'}
                              </option>
                            ))}
                          </select>
                          <p className="mt-0.5 text-[10px] text-gray-500">Front chainring teeth</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">R2 (Rear Gear):</label>
                          <select
                            value={r2}
                            onChange={(e) => setR2(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          >
                            {R2_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt || 'Not set'}
                              </option>
                            ))}
                          </select>
                          <p className="mt-0.5 text-[10px] text-gray-500">Rear cog teeth (10-52)</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Exercise Selection - Only for FREE_MOVES */}
                    {sport === 'FREE_MOVES' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Exercise: <span className="text-red-500">*</span>
                          </label>
                          
                          {/* Dropdown/Autocomplete with exercise history */}
                          <div className="relative">
                            <select
                              value={exercise}
                              onChange={(e) => {
                                const selectedValue = e.target.value;
                                if (selectedValue === '__NEW__') {
                                  // User wants to add a new exercise
                                  setExercise('');
                                } else {
                                  setExercise(selectedValue);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 text-sm"
                            >
                              <option value="">Select or type new exercise...</option>
                              <option value="__NEW__">➕ Add new exercise</option>
                              {freeMoveExercises.map((ex) => (
                                <option key={ex.id} value={ex.name}>
                                  {ex.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Manual input field (always visible for new entries) */}
                          <div className="mt-2">
                            <input
                              type="text"
                              value={exercise}
                              onChange={(e) => setExercise(e.target.value)}
                              onBlur={async (e) => {
                                const newExercise = e.target.value.trim();
                                // If exercise is typed and not in history, save it
                                if (newExercise && !freeMoveExercises.some(ex => ex.name === newExercise)) {
                                  console.log('💾 Saving new FREE_MOVES exercise:', newExercise);
                                  const success = await addFreeMoveExercise(newExercise);
                                  if (success) {
                                    console.log('✅ Exercise saved to history');
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 text-sm"
                              placeholder="Type exercise name..."
                            />
                            <p className="mt-1 text-[10px] text-gray-500">
                              Type a new exercise or select from your history. New exercises are automatically saved.
                            </p>
                          </div>
                          
                          {/* Exercise history with delete option */}
                          {freeMoveExercises.length > 0 && (
                            <div className="mt-3 p-2 bg-white border border-gray-200 rounded max-h-40 overflow-y-auto">
                              <p className="text-[10px] font-semibold text-gray-600 mb-2">Your Exercise History:</p>
                              <div className="space-y-1">
                                {freeMoveExercises.map((ex) => (
                                  <div key={ex.id} className="flex items-center justify-between group hover:bg-gray-50 px-2 py-1 rounded">
                                    <button
                                      type="button"
                                      onClick={() => setExercise(ex.name)}
                                      className="flex-1 text-left text-xs text-gray-700 hover:text-cyan-600"
                                    >
                                      {ex.name}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (confirm(`Delete "${ex.name}" from your exercise history?`)) {
                                          const success = await deleteFreeMoveExercise(ex.id);
                                          if (success) {
                                            console.log('✅ Exercise deleted from history');
                                            // If the deleted exercise was selected, clear the field
                                            if (exercise === ex.name) {
                                              setExercise('');
                                            }
                                          }
                                        }
                                      }}
                                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs px-2 py-0.5 transition-opacity"
                                      title="Delete from history"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {loadingExercises && (
                            <p className="mt-2 text-xs text-gray-500">Loading exercise history...</p>
                          )}
                          
                          {errors.exercise && <p className="mt-1 text-xs text-red-500">{errors.exercise}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Individual Repetition Planning Table for DISTANCE-BASED SPORTS ONLY */}
                {(() => {
                  const isDistanceBased = DISTANCE_BASED_SPORTS.includes(sport as any);
                  
                  if (!isDistanceBased || planningMode !== 'individual' || !canShowIndividualPlanning) return null;
                  
                  return (
                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-xs text-gray-700 mb-3 flex items-center gap-2">
                      <span>📋 INDIVIDUAL REPETITION PLANNING</span>
                      <span className="text-[10px] bg-blue-200 text-blue-700 px-2 py-0.5 rounded font-normal">
                        {individualPlans.length} reps
                      </span>
                    </h3>
                    
                    {/* Pace/100m field for reference */}
                    <div className="mb-3 p-2 bg-white rounded border border-gray-300">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Pace/100m: <span className="text-[10px] text-green-600 font-semibold">⚡ Type numbers only (e.g., 130)</span>
                      </label>
                      <input
                        type="text"
                        value={pace}
                        onChange={(e) => {
                          const input = e.target.value;
                          // Auto-format as user types
                          const parsed = parsePaceInput(input);
                          setPace(parsed);
                        }}
                        onBlur={(e) => setPace(formatPace(e.target.value))}
                        className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono bg-green-50"
                        placeholder="130"
                      />
                      <p className="mt-1 text-[10px] text-green-600">
                        ⚡ Fast input: Just type <strong>130</strong> → auto-formats to <strong>1'30"0</strong>
                      </p>
                    </div>
                    
                    {/* Scrollable table - 6 rows visible */}
                    <div className="border border-gray-300 rounded overflow-hidden bg-white">
                      <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                        <table className="w-full text-xs">
                          <thead className="bg-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="border border-gray-300 px-2 py-2 text-center w-12">#</th>
                              <th className="border border-gray-300 px-2 py-2 text-center">SPEED & PACING</th>
                              <th className="border border-gray-300 px-2 py-2 text-center">REST & ALERTS</th>
                            </tr>
                            <tr>
                              <th className="border-b border-gray-300"></th>
                              <th className="border border-gray-300 px-2 py-1.5 text-left bg-gray-100">
                                <div className="grid grid-cols-2 gap-2">
                                  <span className="font-semibold">Speed</span>
                                  <span className="font-semibold">Time</span>
                                </div>
                              </th>
                              <th className="border border-gray-300 px-2 py-1.5 text-left bg-gray-100">
                                <span className="font-semibold">Pause</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {individualPlans.map((plan, idx) => (
                              <tr key={idx} className="hover:bg-blue-50">
                                <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-gray-50">
                                  {plan.index}
                                </td>
                                <td className="border border-gray-300 px-2 py-1.5">
                                  <div className="grid grid-cols-2 gap-2">
                                    <select
                                      value={plan.speed}
                                      onChange={(e) => updateIndividualPlan(idx, 'speed', e.target.value)}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                                    >
                                      {sportConfig.speeds.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      value={plan.time}
                                      onChange={(e) => {
                                        const input = e.target.value;
                                        // Auto-format as user types
                                        const parsed = parseTimeInput(input);
                                        updateIndividualPlan(idx, 'time', parsed);
                                      }}
                                      onBlur={(e) => updateIndividualPlan(idx, 'time', formatTime(e.target.value))}
                                      className="w-full px-2 py-1.5 border-2 border-green-300 rounded text-xs focus:ring-1 focus:ring-green-500 font-mono bg-green-50"
                                      placeholder="530 ⚡"
                                      title="⚡ Fast input: Type 530 for 0h05'30&quot;0"
                                    />
                                  </div>
                                </td>
                                <td className="border border-gray-300 px-2 py-1.5">
                                  <select
                                    value={plan.pause}
                                    onChange={(e) => updateIndividualPlan(idx, 'pause', e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                                  >
                                    {(Array.isArray(sportConfig.pauses) ? sportConfig.pauses : (sportConfig.pauses as any)?.['Set time'] || []).map((p: string) => (
                                      <option key={p} value={p}>{p}</option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-[10px] text-blue-600 flex items-center gap-1">
                      <span>ℹ️</span>
                      <span>Scroll to view all {individualPlans.length} repetitions. Each can have unique speed, time, and pause values.</span>
                    </p>
                  </div>
                  );
                })()}

                {/* Individual Repetition Planning Table for BODY BUILDING */}
                {sport === 'BODY_BUILDING' && planningMode === 'individual' && canShowIndividualPlanning && (
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-xs text-gray-700 mb-3 flex items-center gap-2">
                      <span>💪 REPS & WEIGHTS PLANNING</span>
                      <span className="text-[10px] bg-blue-200 text-blue-700 px-2 py-0.5 rounded font-normal">
                        {individualPlans.length} series
                      </span>
                    </h3>
                    
                    {/* Scrollable table - 6 rows visible */}
                    <div className="border border-gray-300 rounded overflow-hidden bg-white">
                      <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                        <table className="w-full text-xs">
                          <thead className="bg-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="border border-gray-300 px-2 py-2 text-center w-12">#</th>
                              <th className="border border-gray-300 px-2 py-2 text-center" colSpan={2}>REPS & WEIGHTS</th>
                              <th className="border border-gray-300 px-2 py-2 text-center">REST & ALERTS</th>
                            </tr>
                            <tr>
                              <th className="border-b border-gray-300"></th>
                              <th className="border border-gray-300 px-2 py-1.5 text-center bg-gray-100">
                                <span className="font-semibold">Reps</span>
                              </th>
                              <th className="border border-gray-300 px-2 py-1.5 text-center bg-gray-100">
                                <span className="font-semibold">Weights</span>
                              </th>
                              <th className="border border-gray-300 px-2 py-1.5 text-center bg-gray-100">
                                <span className="font-semibold">Pause</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {individualPlans.map((plan, idx) => (
                              <tr key={idx} className="hover:bg-blue-50">
                                <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-gray-50">
                                  {plan.index}
                                </td>
                                <td className="border border-gray-300 px-2 py-1.5">
                                  <input
                                    type="number"
                                    value={plan.reps || ''}
                                    onChange={(e) => updateIndividualPlan(idx, 'reps', e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-cyan-500 text-center"
                                    placeholder="12"
                                    min="1"
                                  />
                                </td>
                                <td className="border border-gray-300 px-2 py-1.5">
                                  <input
                                    type="text"
                                    value={plan.weight || ''}
                                    onChange={(e) => updateIndividualPlan(idx, 'weight', e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-cyan-500 text-center"
                                    placeholder="12"
                                  />
                                </td>
                                <td className="border border-gray-300 px-2 py-1.5">
                                  <select
                                    value={plan.pause}
                                    onChange={(e) => updateIndividualPlan(idx, 'pause', e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                                  >
                                    {(Array.isArray(sportConfig.pauses) ? sportConfig.pauses : (sportConfig.pauses as any)?.['Set time'] || []).map((p: string) => (
                                      <option key={p} value={p}>{p}</option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-[10px] text-blue-600 flex items-center gap-1">
                      <span>ℹ️</span>
                      <span>Scroll to view all {individualPlans.length} series. Each can have unique reps, weights, and pause values.</span>
                    </p>
                  </div>
                )}

                {/* Individual Repetition Planning Table for OTHER SPORTS (Gymnastic, Stretching, Pilates, Yoga, etc.) */}
                {(() => {
                  const hasTools = !DISTANCE_BASED_SPORTS.includes(sport as any) && sport !== 'BODY_BUILDING';
                  
                  if (!hasTools || planningMode !== 'individual' || !canShowIndividualPlanning) return null;
                  
                  return (
                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                      <h3 className="font-bold text-xs text-gray-700 mb-3 flex items-center gap-2">
                        <span>🏋️ REPS & TOOLS PLANNING</span>
                        <span className="text-[10px] bg-blue-200 text-blue-700 px-2 py-0.5 rounded font-normal">
                          {individualPlans.length} reps
                        </span>
                      </h3>
                      
                      {/* Scrollable table - 6 rows visible */}
                      <div className="border border-gray-300 rounded overflow-hidden bg-white">
                        <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                          <table className="w-full text-xs">
                            <thead className="bg-gray-200 sticky top-0 z-10">
                              <tr>
                                <th className="border border-gray-300 px-2 py-2 text-center w-12">#</th>
                                <th className="border border-gray-300 px-2 py-2 text-center" colSpan={2}>REPS & TOOLS</th>
                                <th className="border border-gray-300 px-2 py-2 text-center">REST & ALERTS</th>
                              </tr>
                              <tr>
                                <th className="border-b border-gray-300"></th>
                                <th className="border border-gray-300 px-2 py-1.5 text-center bg-gray-100">
                                  <span className="font-semibold">Reps</span>
                                </th>
                                <th className="border border-gray-300 px-2 py-1.5 text-center bg-gray-100">
                                  <span className="font-semibold">Tools</span>
                                </th>
                                <th className="border border-gray-300 px-2 py-1.5 text-center bg-gray-100">
                                  <span className="font-semibold">Pause</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {individualPlans.map((plan, idx) => (
                                <tr key={idx} className="hover:bg-blue-50">
                                  <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-gray-50">
                                    {plan.index}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1.5">
                                    <input
                                      type="number"
                                      value={plan.reps || ''}
                                      onChange={(e) => updateIndividualPlan(idx, 'reps', e.target.value)}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-cyan-500 text-center"
                                      placeholder="12"
                                      min="1"
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1.5">
                                    <input
                                      type="text"
                                      value={plan.tools || ''}
                                      onChange={(e) => updateIndividualPlan(idx, 'tools', e.target.value)}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-cyan-500 text-center"
                                      placeholder="Tools"
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1.5">
                                    <select
                                      value={plan.pause}
                                      onChange={(e) => updateIndividualPlan(idx, 'pause', e.target.value)}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-cyan-500"
                                    >
                                      {(Array.isArray(sportConfig.pauses) ? sportConfig.pauses : (sportConfig.pauses as any)?.['Set time'] || []).map((p: string) => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-[10px] text-blue-600 flex items-center gap-1">
                        <span>ℹ️</span>
                        <span>Scroll to view all {individualPlans.length} repetitions. Each can have unique reps, tools, and pause values.</span>
                      </p>
                    </div>
                  );
                })()}

                {/* 3. Speed/Pace/Tempo */}
                {/* Only show this section when NOT in individual planning mode */}
                {(() => {
                  // Don't show in individual planning mode for ANY sport
                  if (planningMode === 'individual') return null;
                  
                  const hasTools = !DISTANCE_BASED_SPORTS.includes(sport as any) && sport !== 'BODY_BUILDING';
                  const showSpeedSection = (sport === 'BODY_BUILDING' || hasTools || planningMode === 'all');
                  
                  if (!showSpeedSection) return null;
                  
                  return (
                    <div className="bg-gray-50 p-2.5 rounded-lg">
                      <h3 className="font-bold text-xs font-medium text-gray-700 mb-2">
                        {sport === 'BODY_BUILDING' ? 'TEMPO' : hasTools ? 'TEMPO' : 'SPEED / PACE'}
                      </h3>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {sport === 'BODY_BUILDING' ? 'Tempo:' : 'Speed:'}
                    </label>
                    <select
                      value={speed}
                      onChange={(e) => setSpeed(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                    >
                      {sportConfig.speeds.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {sport === 'BODY_BUILDING' && (
                      <p className="mt-0.5 text-[10px] text-gray-500">
                        Exercise execution speed
                      </p>
                    )}
                  </div>

                  {/* Row/min field - ROWING only */}
                  {sport === 'ROWING' && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Row/min: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={rowPerMin}
                        onChange={(e) => setRowPerMin(e.target.value)}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (e.target.value && value < 10) {
                            alert('⚠️ Row/min value too low!\n\nMinimum allowed: 10\nPlease enter a value within the valid range (10-99).');
                            setRowPerMin('10');
                          } else if (value > 99) {
                            alert('⚠️ Row/min value too high!\n\nMaximum allowed: 99\nPlease enter a value within the valid range (10-99).');
                            setRowPerMin('99');
                          }
                        }}
                        min="10"
                        max="99"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter rows per minute (10-99)"
                      />
                      <p className="mt-0.5 text-[10px] text-gray-500">
                        Strokes per minute (Range: 10-99)
                      </p>
                    </div>
                  )}

                  {shouldShowPaceField(sport) && (
                    <div>
                      {(() => {
                        // Get current distance/meters value
                        const currentMeters = distance === 'custom' || distance === 'input' ? customDistance : distance;
                        
                        // Use helper function to determine pace label
                        const paceLabel = getPaceLabel(sport, currentMeters);
                        const isKmPace = paceLabel === 'Pace\\km' || paceLabel === 'Pace\\mile';
                        
                        // Set range and placeholder based on pace type
                        let paceRange = "(0'00\"0 to 9'59\"0)";
                        let pacePlaceholder = "1'30\"0";
                        
                        if (isKmPace) {
                            paceRange = "(2'00\"0 to 9'59\"0)";
                            pacePlaceholder = "4'30\"0";
                          } else {
                            paceRange = "(0'00\"0 to 1'59\"0)";
                            pacePlaceholder = "0'45\"0";
                          }
                        
                        // Special handling for BIKE (no decimal)
                        if (sport === 'BIKE') {
                          paceRange = "(0'00\" to 9'59\")";
                          pacePlaceholder = "1'30\"";
                        }
                        
                        return (
                          <>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {paceLabel.replace('\\', '/')}: <span className="text-green-600 font-semibold text-[10px]">⚡ Type numbers only</span>
                            </label>
                            <input
                              type="text"
                              value={pace}
                              onChange={(e) => {
                                const input = e.target.value;
                                // Auto-format as user types
                                const parsed = parsePaceInput(input, isKmPace);
                                setPace(parsed);
                              }}
                              onBlur={(e) => {
                                if (e.target.value) {
                                  const formatted = formatPace(e.target.value, isKmPace);
                                  setPace(formatted);
                                }
                              }}
                              className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono bg-green-50"
                              placeholder="130"
                              title="⚡ Fast input: Type 130 for 1'30&quot;0"
                            />
                            <p className="mt-0.5 text-[10px] text-green-600">⚡ Fast input: Type <strong>130</strong> → <strong>1'30"0</strong></p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                  );
                })()}

                {/* 4. Reset/Pause & Macro */}
                {/* Only show pause section if NOT in individual planning mode */}
                {planningMode === 'all' && (
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <h3 className="font-bold text-xs text-gray-700 mb-2">REST / PAUSE & MACRO</h3>
                  <div className="space-y-3">
                    {/* Rest Type Selector */}
                    {sportConfig.restTypes && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rest Type:</label>
                        <select
                          value={restType}
                          onChange={(e) => {
                            setRestType(e.target.value);
                            // Reset pause when changing rest type
                            const pauseOptions = getPauseOptions(sport, e.target.value);
                            if (Array.isArray(pauseOptions) && pauseOptions.length > 0) {
                              setPause(pauseOptions[0]);
                            } else {
                              setPause('');
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        >
                          {sportConfig.restTypes.map((rt: string) => (
                            <option key={rt} value={rt}>
                              {rt}
                            </option>
                          ))}
                        </select>
                        <p className="mt-0.5 text-[10px] text-gray-500">
                          {restType === 'Set time' && 'Select from predefined pause values'}
                          {restType === 'Restart time' && 'Enter time > workout time'}
                          {restType === 'Restart pulse' && 'Enter pulse rate (60-200)'}
                        </p>
                      </div>
                    )}
                    
                    {/* Pause Field - Conditional based on Rest Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pause:</label>
                      {(() => {
                        const pauseOptions = getPauseOptions(sport, restType);
                        
                        // If it's 'input', show an input field instead of select
                        if (pauseOptions === 'input') {
                          if (restType === 'Restart time') {
                            return (
                              <>
                                <input
                                  type="text"
                                  value={pause}
                                  onChange={(e) => {
                                    const input = e.target.value;
                                    // Auto-format as user types using fast input
                                    const parsed = parsePauseInput(input);
                                    setPause(parsed);
                                  }}
                                  onBlur={(e) => setPause(formatPause(e.target.value))}
                                  className="w-full px-3 py-2 border-2 border-green-300 rounded focus:ring-2 focus:ring-green-500 font-mono bg-green-50"
                                  placeholder="130 ⚡"
                                  title="⚡ Fast input: Type 130 for 1'30&quot;"
                                />
                                <p className="mt-0.5 text-[10px] text-green-600 font-semibold">
                                  ⚡ Fast input: Type <span className="font-mono bg-white px-1 rounded">130</span> → 1'30" | Must be &gt; Time
                                </p>
                              </>
                            );
                          } else if (restType === 'Restart pulse') {
                            return (
                              <>
                                <input
                                  type="number"
                                  value={pause}
                                  onChange={(e) => setPause(e.target.value)}
                                  onBlur={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (e.target.value && value < 60) {
                                      alert('⚠️ Pulse rate value too low!\n\nMinimum allowed: 60 bpm\nPlease enter a value within the valid range (60-200).');
                                      setPause('60');
                                    } else if (value > 200) {
                                      alert('⚠️ Pulse rate value too high!\n\nMaximum allowed: 200 bpm\nPlease enter a value within the valid range (60-200).');
                                      setPause('200');
                                    }
                                  }}
                                  min="60"
                                  max="200"
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                                  placeholder="60-200"
                                />
                                <p className="mt-0.5 text-[10px] text-gray-500">Pulse rate range: 60-200 bpm</p>
                              </>
                            );
                          }
                        }
                        
                        // Otherwise show dropdown
                        return (
                          <>
                    <select
                      value={pause}
                      onChange={(e) => setPause(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                    >
                              {(Array.isArray(pauseOptions) ? pauseOptions : []).map((p: string) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    {parseInt(repetitions) === 1 && (
                      <p className="mt-0.5 text-[10px] text-gray-500">Pause can be 0 when repetitions = 1</p>
                    )}
                          </>
                        );
                      })()}
                  </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Macro Final:</label>
                      <select
                        value={macroFinal}
                        onChange={(e) => setMacroFinal(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                      >
                        {sportConfig.macroFinals.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Alarm:</label>
                      <select
                        value={alarm}
                        onChange={(e) => setAlarm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                      >
                        {sportConfig.alarms.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sound:</label>
                      <select
                        value={sound}
                        onChange={(e) => setSound(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                      >
                        {sportConfig.sounds.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                )}

                {/* Macro Final - Show always */}
                {planningMode === 'individual' && canShowIndividualPlanning && (
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <h3 className="font-bold text-xs text-gray-700 mb-2">MACRO FINAL</h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Macro Final:</label>
                      <select
                        value={macroFinal}
                        onChange={(e) => setMacroFinal(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                      >
                        {MACRO_FINAL_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 5. Description */}
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <h3 className="font-bold text-xs text-gray-700 mb-2">DESCRIPTION</h3>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Note / Description:</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                      rows={3}
                      placeholder="Add notes or description..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Battery Mode */}
          {type === 'BATTERY' && (
            <div className="bg-blue-50 border border-blue-300 p-4 rounded">
              <p className="text-sm text-blue-800">
                Battery mode is coming soon. This will allow you to create groups of moveframes with patterns.
              </p>
              </div>
          )}

          {/* Preview */}
          {type === 'STANDARD' && !manualMode && (
            <div className="mt-3 bg-blue-50 border border-blue-300 p-3 rounded">
              <h4 className="text-xs font-bold text-blue-900 mb-2">PREVIEW:</h4>
              <p className="text-sm text-blue-800 font-medium break-words">{generateDescription()}</p>
              {(parseInt(repetitions) > 1 || (macroFinal && macroFinal !== "0'")) && (
                <div className="mt-2 text-xs text-blue-600 space-y-0.5">
                  {parseInt(repetitions) > 1 && (
                    <div>• Repetitions: {repetitions} reps</div>
                  )}
                  {macroFinal && macroFinal !== "0'" && (
                    <div>• Macro Final: {macroFinal}</div>
                  )}
                    </div>
              )}
                  </div>
          )}
                    </div>
          )}

          {/* Manual Mode Tab */}
          {type === 'STANDARD' && activeTab === 'manual' && (
            <div key="manual-tab" className="space-y-4">
              <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center w-10 h-10 bg-white border border-blue-300 rounded">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      Moveframe edited manually
                    </span>
                </div>
              </div>
                <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <>
                  <div className="flex items-center justify-end">
              <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualPriority}
                      onChange={(e) => setManualPriority(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Priority 'manual' in the display</span>
                  </label>
                    <div className="ml-2 flex items-center justify-center w-6 h-6 bg-green-500 rounded">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Rich Text Editor Toolbar */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 items-center">
                      <select 
                        onChange={(e) => execCommand('fontName', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                      <select 
                        onChange={(e) => execCommand('fontSize', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs bg-white ml-1"
                      >
                        <option value="3">Normal</option>
                        <option value="1">Very Small</option>
                        <option value="2">Small</option>
                        <option value="4">Large</option>
                        <option value="5">Very Large</option>
                        <option value="6">Huge</option>
                      </select>
                      <div className="h-4 w-px bg-gray-300 mx-1"></div>
                      <button 
                        type="button"
                        onClick={() => execCommand('bold')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Bold"
                      >
                        <span className="font-bold text-sm">B</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => execCommand('italic')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Italic"
                      >
                        <span className="italic text-sm">I</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => execCommand('underline')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Underline"
                      >
                        <span className="underline text-sm">U</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => execCommand('strikeThrough')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Strikethrough"
                      >
                        <span className="line-through text-sm">S</span>
                      </button>
                      <div className="h-4 w-px bg-gray-300 mx-1"></div>
                      <input
                        type="color"
                        onChange={(e) => execCommand('foreColor', e.target.value)}
                        className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                        title="Text Color"
                      />
                      <input
                        type="color"
                        onChange={(e) => execCommand('backColor', e.target.value)}
                        defaultValue="#ffffff"
                        className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                        title="Background Color"
                      />
                      <div className="h-4 w-px bg-gray-300 mx-1"></div>
                      <button 
                        type="button"
                        onClick={() => execCommand('justifyLeft')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Align Left"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4h14v2H3V4zm0 4h10v2H3V8zm0 4h14v2H3v-2zm0 4h10v2H3v-2z" />
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => execCommand('justifyCenter')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Align Center"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4h14v2H3V4zm2 4h10v2H5V8zm-2 4h14v2H3v-2zm2 4h10v2H5v-2z" />
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => execCommand('justifyRight')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Align Right"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4h14v2H3V4zm4 4h10v2H7V8zm-4 4h14v2H3v-2zm4 4h10v2H7v-2z" />
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => execCommand('justifyFull')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Justify"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4h14v2H3V4zm0 4h14v2H3V8zm0 4h14v2H3v-2zm0 4h14v2H3v-2z" />
                        </svg>
                      </button>
                      <div className="h-4 w-px bg-gray-300 mx-1"></div>
                      <button 
                        type="button"
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Bullet List"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a1 1 0 100 2 1 1 0 000-2zm3 1h10v1H7V5zm-3 4a1 1 0 100 2 1 1 0 000-2zm3 1h10v1H7v-1zm-3 4a1 1 0 100 2 1 1 0 000-2zm3 1h10v1H7v-1z" />
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Numbered List"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4h1v2H3V4zm0 4h1v2H3V8zm0 4h1v2H3v-2zM6 5h11v1H6V5zm0 4h11v1H6V9zm0 4h11v1H6v-1z" />
                        </svg>
                      </button>
                      <div className="h-4 w-px bg-gray-300 mx-1"></div>
                      <button 
                        type="button"
                        onClick={() => {
                          if (editorRef.current) {
                            editorRef.current.innerHTML = '';
                            setManualContent('');
                          }
                        }}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="relative">
                      {(!manualContent || manualContent === '' || manualContent === '<br>') && (
                        <div className="absolute top-2 left-3 text-sm text-gray-400 pointer-events-none z-0">
                          Here you can edit freely your moveframe that will be showed in the moveframe section
                        </div>
                      )}
                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleEditorInput}
                        className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-0 min-h-[200px] max-h-[300px] overflow-y-auto relative z-10 bg-white"
                        style={{ wordBreak: 'break-word' }}
                        suppressContentEditableWarning
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                  <button
                    onClick={() => setManualContent('')}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Save
                  </button>
                </div>
              </>
            </div>
          )}

          {/* Favorites Tab */}
          {type === 'STANDARD' && activeTab === 'favorites' && (
            <div key="favorites-tab" className="text-center py-12 text-gray-500 h-full">
              <p>Favourites feature coming soon...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : mode === 'add' ? 'Add Moveframe' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

