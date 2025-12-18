'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SPORTS_LIST, MACRO_FINAL_OPTIONS, MUSCULAR_SECTORS } from '@/constants/moveframe.constants';
import { useMoveframeForm } from '@/hooks/useMoveframeForm';
import { getSportIcon } from '@/utils/sportIcons';
import { useSportIconType } from '@/hooks/useSportIconType';
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
  // Format validation helpers
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
        if (sec > 59) return `${minutes}'59"${decimals}`;
      } else {
        // Pace/100m range: 0'00"0 to 1'59"0
        if (min > 1) return "1'59\"0";
        if (sec > 59) return `${minutes}'59"${decimals}`;
      }
      return `${minutes}'${seconds}"${decimals}`;
    }
    
    // BIKE: 0'00" to 9'59" (no decimal)
    if (sport === 'BIKE') {
      if (min > 9) return value;
      if (sec > 59) return `${minutes}'59"`;
      return `${minutes}'${seconds}"`;
    }
    
    // Other sports: 0'00"0 to 9'59"0
    if (min > 9) return value;
    if (sec > 59) return `${minutes}'59"${decimals}`;
    return `${minutes}'${seconds}"${decimals}`;
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
      return `9h00'00"0`;
    }
    if (m > 59) return `${hours}h59'${seconds}"${decimals}`;
    if (s > 59) return `${hours}h${minutes}'59"${decimals}`;
    
    return `${hours}h${minutes}'${seconds}"${decimals}`;
  };
  
  // R1 and R2 options for BIKE
  const R1_OPTIONS = ['', '34', '36', '38', '39', '40', '48', '50', '52', '53', '54', '55'];
  const R2_OPTIONS = ['', ...Array.from({ length: 43 }, (_, i) => (i + 10).toString())]; // 10-52

  // Get sport icon type
  const iconType = useSportIconType();

  // Use custom hook for form management
  const {
    formData,
    setters,
    sportConfig,
    totalDistance,
    estimatedTime,
    description,
    errors,
    isSaving,
    setIsSaving,
    resetForm,
    validateForm,
    buildMoveframeData,
    generateDescription
  } = useMoveframeForm({
    mode,
    existingMoveframe,
    isOpen,
    workout,
    day
  });

  // Workout Sections state
  const [workoutSections, setWorkoutSections] = useState<any[]>([]);

  // Load workout sections from API
  useEffect(() => {
    const loadWorkoutSections = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/workouts/sections', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setWorkoutSections(data.sections || []);
        }
      } catch (error) {
        console.error('Error loading workout sections:', error);
      }
    };
    
    if (isOpen) {
      loadWorkoutSections();
    }
  }, [isOpen]);

  // Destructure for easier access
  const {
    sport,
    type,
    manualMode,
    manualPriority,
    sectionId, // Workout section for ALL sports
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
  } = formData;

  const {
    setSport,
    setType,
    setManualMode,
    setManualPriority,
    setSectionId, // Workout section setter for ALL sports
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
  } = setters;

  // Auto-initialize sport and section for standard mode
  useEffect(() => {
    if (isOpen && type === 'STANDARD' && !manualMode && mode === 'add') {
      // Set default sport if not set
      if (!sport) {
        setSport('SWIM');
      }
      // Set default section if not set and sections are loaded
      if (!sectionId && workoutSections.length > 0) {
        setSectionId(workoutSections[0].id);
      }
    }
  }, [isOpen, type, manualMode, mode, sport, sectionId, workoutSections, setSport, setSectionId]);

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

  if (!isOpen) return null;

  // totalDistance and estimatedTime are already provided by useMoveframeForm hook

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 py-2.5 flex items-center justify-between">
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
          <div className="flex border-b border-gray-300 bg-gray-50">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'edit'
                  ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Edit Moveframe
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'manual'
                  ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Moveframe Info (manual input)
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
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
        <div className="flex-1 overflow-y-auto p-4">
          {/* Edit Moveframe Tab */}
          {(type !== 'STANDARD' || activeTab === 'edit') && (
            <>
              {/* Error Message */}
              {errors.general && (
                <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {errors.general}
                </div>
              )}

              {/* Sport Selection */}
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Sport <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              >
                {SPORTS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
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

          {/* Workout Section Selection (ALL SPORTS) */}
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Workout Section <span className="text-red-500">*</span>
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              <option value="">Select section...</option>
              {workoutSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
            {errors.sectionId && <p className="mt-0.5 text-xs text-red-500">{errors.sectionId}</p>}
          </div>

          {/* Type Selection */}
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-700 mb-2">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('STANDARD')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded border-2 transition-colors ${
                  type === 'STANDARD'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setType('BATTERY')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded border-2 transition-colors ${
                  type === 'BATTERY'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Battery
              </button>
              <button
                type="button"
                onClick={() => setType('ANNOTATION')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded border-2 transition-colors ${
                  type === 'ANNOTATION'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Annotation
              </button>
            </div>
          </div>

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
                          Exercise: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={exercise}
                          onChange={(e) => setExercise(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          placeholder="e.g., Bench Press, Bicep Curls..."
                        />
                        <p className="mt-1 text-[10px] text-gray-500">
                          Enter exercise name manually (Exercise archive coming soon)
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
                    </>
                  ) : (
                    <>
                      {'meters' in sportConfig && (
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
                                {m}m
                              </option>
                            ))}
                          </select>
                          {errors.distance && <p className="mt-1 text-xs text-red-500">{errors.distance}</p>}
                        </div>
                      )}

                      {distance === 'custom' && (
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
                    </>
                  )}
                </div>

                {/* 3. Speed/Pace */}
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <h3 className="font-bold text-xs font-medium text-gray-700 mb-2">SPEED / PACE</h3>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Speed:</label>
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
                  </div>

                  {sport !== 'BODY_BUILDING' && (
                    <div>
                      {(() => {
                        // Determine pace type for RUN sport
                        let paceLabel = 'Pace/100m';
                        let paceRange = "(0'00\"0 to 9'59\"0)";
                        let pacePlaceholder = "1'30\"0";
                        let paceFormat = "M'SS\"D (e.g., 1'30\"0)";
                        let isKmPace = false;
                        
                        if (sport === 'BIKE') {
                          paceLabel = 'Pace/km';
                          paceRange = "(0'00\" to 9'59\")";
                          pacePlaceholder = "1'30\"";
                          paceFormat = "M'SS\" (e.g., 1'30\")";
                        } else if (sport === 'RUN') {
                          const currentDistance = distance === 'custom' ? parseInt(customDistance) || 0 : parseInt(distance) || 0;
                          if (currentDistance > 401) {
                            paceLabel = 'Pace/km';
                            paceRange = "(2'00\"0 to 9'59\"0)";
                            pacePlaceholder = "4'30\"0";
                            paceFormat = "M'SS\"D (e.g., 4'30\"0)";
                            isKmPace = true;
                          } else {
                            paceLabel = 'Pace/100m';
                            paceRange = "(0'00\"0 to 1'59\"0)";
                            pacePlaceholder = "0'45\"0";
                            paceFormat = "M'SS\"D (e.g., 0'45\"0)";
                            isKmPace = false;
                          }
                        }
                        
                        return (
                          <>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {paceLabel}: <span className="text-gray-500 text-[10px]">{paceRange}</span>
                            </label>
                            <input
                              type="text"
                              value={pace}
                              onChange={(e) => setPace(e.target.value)}
                              onBlur={(e) => {
                                if (e.target.value) {
                                  const formatted = formatPace(e.target.value, isKmPace);
                                  setPace(formatted);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                              placeholder={pacePlaceholder}
                            />
                            <p className="mt-0.5 text-[10px] text-gray-500">Format: {paceFormat}</p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 4. Reset/Pause & Macro */}
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <h3 className="font-bold text-xs text-gray-700 mb-2">REST / PAUSE & MACRO</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pause:</label>
                      <select
                        value={pause}
                        onChange={(e) => setPause(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                      >
                        {sportConfig.pauses.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      {parseInt(repetitions) === 1 && (
                        <p className="mt-0.5 text-[10px] text-gray-500">Pause can be 0 when repetitions = 1</p>
                      )}
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

          {/* Annotation Mode */}
          {type === 'ANNOTATION' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annotation in the row
                </label>
                <input
                  type="text"
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter annotation text..."
                />
                {errors.annotationText && <p className="mt-1 text-xs text-red-500">{errors.annotationText}</p>}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-64">
                    Annotation header background
                  </label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={annotationBgColor}
                      onChange={(e) => setAnnotationBgColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={annotationBgColor}
                      onChange={(e) => setAnnotationBgColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-64">
                    Annotation text background
                  </label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={annotationTextColor}
                      onChange={(e) => setAnnotationTextColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={annotationTextColor}
                      onChange={(e) => setAnnotationTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-sm text-gray-700 mb-2">PREVIEW</h3>
                <div
                  style={{
                    backgroundColor: annotationBgColor,
                    color: annotationTextColor
                  }}
                  className="p-3 rounded"
                >
                  {annotationText || 'Annotation text will appear here'}
                </div>
              </div>
            </div>
          )}

          {/* Battery Mode */}
          {type === 'BATTERY' && (
            <div className="bg-yellow-50 border border-yellow-300 p-4 rounded">
              <p className="text-sm text-yellow-800">
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
            </>
          )}

          {/* Manual Mode Tab */}
          {type === 'STANDARD' && activeTab === 'manual' && (
            <div className="space-y-4">
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
            <div className="text-center py-12 text-gray-500">
              <p>Favourites feature coming soon...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
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

