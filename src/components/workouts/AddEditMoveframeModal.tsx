'use client';

import React from 'react';
import { X } from 'lucide-react';
import { SPORTS_LIST, MACRO_FINAL_OPTIONS, MUSCULAR_SECTORS } from '@/constants/moveframe.constants';
import { useMoveframeForm } from '@/hooks/useMoveframeForm';

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

  // Destructure for easier access
  const {
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
  } = formData;

  const {
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
  } = setters;

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
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
            >
              {SPORTS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {errors.sport && <p className="mt-0.5 text-xs text-red-500">{errors.sport}</p>}
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

          {/* Standard Mode */}
          {type === 'STANDARD' && !manualMode && (
            <div className="space-y-3">
              {/* All fields in vertical layout */}
              <div className="space-y-2">
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <h3 className="font-bold text-xs text-gray-700 mb-2">DISTANCE SECTION</h3>
                  
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
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reps:</label>
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

                {/* STYLE & NOTES Section - Show for sports with styles */}
                {'styles' in sportConfig && (
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <h3 className="font-bold text-xs text-gray-700 mb-2">STYLE & NOTES</h3>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Style:</label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Select style</option>
                        {sportConfig.styles.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Note:</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        rows={3}
                        placeholder="Add notes..."
                      />
                    </div>
                  </div>
                )}

                {/* NOTES Section - Show for sports without styles (like BIKE) */}
                {!('styles' in sportConfig) && sport !== 'BODY_BUILDING' && (
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <h3 className="font-bold text-xs text-gray-700 mb-2">NOTES</h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Note:</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        rows={3}
                        placeholder="Add notes..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SPEED & PACING Section */}
              <div className="bg-gray-50 p-2.5 rounded-lg">
                <h3 className="font-bold text-xs text-gray-700 mb-2">SPEED & PACING</h3>
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

                {/* R1 and R2 fields (BIKE only) */}
                {sport === 'BIKE' && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-2">R1\R2 (Range):</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-600 mb-1">R1:</label>
                        <select
                          value={r1}
                          onChange={(e) => setR1(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        >
                          {R1_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option || '(blank)'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-600 mb-1">R2:</label>
                        <select
                          value={r2}
                          onChange={(e) => setR2(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        >
                          {R2_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option || '(blank)'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {sport !== 'BODY_BUILDING' && (
                  <>
                    <div className="mb-3">
                      {(() => {
                        // Determine pace type for RUN sport
                        let paceLabel = 'Pace/100m';
                        let paceRange = "(0'00\"0 to 9'59\"0)";
                        let pacePlaceholder = "1'30\"0";
                        let paceFormat = "M'SS\"D (e.g., 1'30\"0)";
                        let isKmPace = false;
                        let maxLength = 7;
                        
                        if (sport === 'BIKE') {
                          paceLabel = 'Pace/km';
                          paceRange = "(0'00\" to 9'59\")";
                          pacePlaceholder = "1'30\"";
                          paceFormat = "M'SS\" (e.g., 1'30\")";
                          maxLength = 5;
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
                          maxLength = 7;
                        }
                        
                        return (
                          <>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {paceLabel}: <span className="text-gray-500 text-[10px]">{paceRange}</span>
                            </label>
                            <input
                              type="text"
                              value={pace}
                              onChange={(e) => {
                                const formatted = formatPace(e.target.value, isKmPace);
                                setPace(formatted);
                              }}
                              onBlur={(e) => {
                                // Auto-format on blur if user entered raw numbers
                                if (e.target.value && !e.target.value.includes("'")) {
                                  const formatted = formatPace(e.target.value, isKmPace);
                                  setPace(formatted);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                              placeholder={pacePlaceholder}
                              maxLength={maxLength}
                            />
                            <p className="mt-0.5 text-[10px] text-gray-500">Format: {paceFormat}</p>
                          </>
                        );
                      })()}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Time: <span className="text-gray-500 text-[10px]">(0h00'00"0 to 9h00'00"0)</span>
                      </label>
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => {
                          const formatted = formatTime(e.target.value);
                          setTime(formatted);
                        }}
                        onBlur={(e) => {
                          // Auto-format on blur if user entered raw numbers
                          if (e.target.value && !e.target.value.includes("h")) {
                            const formatted = formatTime(e.target.value);
                            setTime(formatted);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        placeholder="0h05'30&quot;0"
                        maxLength={11}
                      />
                      <p className="mt-0.5 text-[10px] text-gray-500">Format: Hh MM'SS"D (e.g., 0h05'30"0) - Max 9 hours</p>
                      {estimatedTime && (
                        <p className="mt-1 text-xs text-blue-600">
                          Estimated: {estimatedTime}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* REST & ALERTS Section */}
              <div className="bg-gray-50 p-2.5 rounded-lg">
                <h3 className="font-bold text-xs text-gray-700 mb-2">REST & ALERTS</h3>
                <div className="mb-3">
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
                
                {/* Macro Final - NEW FIELD */}
                <div className="mb-3">
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
                
                <div className="mb-3">
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

