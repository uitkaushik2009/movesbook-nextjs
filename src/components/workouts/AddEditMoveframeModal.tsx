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
  const handleClose = () => {
    onClose();
    resetForm();
  };

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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
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
            <label className="block text-xs font-bold text-gray-700 mb-1">Type:</label>
            <div className="flex gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="STANDARD"
                  checked={type === 'STANDARD'}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mr-1.5"
                />
                <span className="text-xs">Standard</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="BATTERY"
                  checked={type === 'BATTERY'}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mr-1.5"
                />
                <span className="text-xs">Battery</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ANNOTATION"
                  checked={type === 'ANNOTATION'}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mr-1.5"
                />
                <span className="text-xs">Annotation</span>
              </label>
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

                {/* 4. Reset/Pause */}
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <h3 className="font-bold text-xs text-gray-700 mb-2">REST / PAUSE</h3>
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
                  Annotation in the row: <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                  placeholder="Enter annotation text..."
                />
                {errors.annotationText && <p className="mt-1 text-xs text-red-500">{errors.annotationText}</p>}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-sm text-gray-700 mb-3">COLOR SETTINGS</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Annotation header background:
                    </label>
                    <div className="flex items-center gap-2">
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Annotation text color:
                    </label>
                    <div className="flex items-center gap-2">
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
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

          {/* Manual Mode Toggle */}
          {type === 'STANDARD' && (
            <div className="mt-6 border-t pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualMode}
                  onChange={(e) => setManualMode(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  Moveframe info (manual input)
                </span>
              </label>

              {manualMode && (
                <div className="mt-4 space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={manualPriority}
                      onChange={(e) => setManualPriority(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Priority 'manual' in the display</span>
                  </label>

                  <div>
                    <textarea
                      value={manualContent}
                      onChange={(e) => setManualContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                      rows={6}
                      placeholder="Here you can edit freely your moveframe that will be showed in the moveframe section"
                    />
                  </div>

                  <button
                    onClick={() => setManualContent('')}
                    className="px-3 py-1 text-xs bg-gray-300 hover:bg-gray-400 rounded"
                  >
                    Clear Editor
                  </button>
                </div>
              )}
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

