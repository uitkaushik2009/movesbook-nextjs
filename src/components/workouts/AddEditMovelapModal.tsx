'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';

interface AddEditMovelapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movelapData: any) => void;
  onCopyToAll?: (fieldName: string, fieldValue: any) => Promise<void>;
  mode: 'add' | 'edit';
  moveframe: any;
  existingMovelap?: any;
}

// Sport-specific configurations
const SPORT_CONFIGS = {
  SWIM: {
    distances: ['20', '50', '75', '100', '150', '200', '400', '500', '800', '1000', '1200', '1500'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Freestyle', 'Dolphin', 'Backstroke', 'Breaststroke', 'Sliding', 'Apnea'],
    pauses: ['0"', '5"', '10"', '15"', '20"', '25"', '30"', '35"', '40"', '45"', '50"', "1'", "1'10\"", "1'15\"", "1'30\"", "2'", "2'30\"", "3'"]
  },
  RUN: {
    distances: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Road', 'Cross', 'Beach', 'Hill', 'Downhill'],
    pauses: ['20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"]
  },
  WALKING: {
    distances: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Road', 'Cross', 'Beach', 'Hill', 'Downhill'],
    pauses: ['20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"]
  },
  HIKING: {
    distances: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Road', 'Cross', 'Beach', 'Hill', 'Downhill'],
    pauses: ['20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"]
  },
  BIKE: {
    distances: ['200', '400', '500', '1000', '1500', '2000', '3000', '4000', '5000', '7000', '8000', '10000'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    ranges: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    pauses: ['15"', '30"', '45"', "1'", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'"]
  },
  BODY_BUILDING: {
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive', 'Negative'],
    muscularSectors: [
      'Shoulders',
      'Anterior arms',
      'Rear arms',
      'Forearms',
      'Chest',
      'Abdominals',
      'Intercostals',
      'Trapezius',
      'Lats',
      'Lumbosacral',
      'Front thighs',
      'Hind thighs',
      'Calves',
      'Tibials'
    ],
    restTypes: ['SET_TIME', 'RESTART_TIME', 'RESTART_PULSE'],
    pauses: ['0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"]
  }
};

const MACRO_FINALS = ["0'", "1'", "2'", "3'", "4'", "5'", "6'", "7'", "8'", "9'"];
const ALARMS = ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'];
const SOUNDS = ['Beep', 'Bell', 'Chime', 'None'];

export default function AddEditMovelapModal({
  isOpen,
  onClose,
  onSave,
  onCopyToAll,
  mode,
  moveframe,
  existingMovelap
}: AddEditMovelapModalProps) {
  const sport = moveframe.sport || 'SWIM';
  const config = SPORT_CONFIGS[sport as keyof typeof SPORT_CONFIGS] || SPORT_CONFIGS.SWIM;

  // Form state - inherit from moveframe
  const [sequence, setSequence] = useState(1);
  const [distance, setDistance] = useState('');
  const [speed, setSpeed] = useState('');
  const [style, setStyle] = useState('');
  const [pause, setPause] = useState('');
  const [pace, setPace] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [alarm, setAlarm] = useState('');
  const [sound, setSound] = useState('Beep');
  const [macroFinal, setMacroFinal] = useState("0'");
  
  // BODY_BUILDING specific
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [muscularSector, setMuscularSector] = useState('');
  const [exercise, setExercise] = useState('');
  const [restType, setRestType] = useState('');
  
  // OTHER SPORTS (Gymnastic, Stretching, Pilates, Yoga, etc.)
  const [tools, setTools] = useState('');
  
  // BIKE specific
  const [r1, setR1] = useState('');
  const [r2, setR2] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [copyingFields, setCopyingFields] = useState<Set<string>>(new Set());

  // Copy button component
  const CopyButton = ({ fieldName, fieldValue, disabled }: { fieldName: string; fieldValue: any; disabled?: boolean }) => {
    const isCopying = copyingFields.has(fieldName);
    
    if (!onCopyToAll || mode === 'add' || disabled) return null;
    
    return (
      <button
        type="button"
        onClick={async () => {
          // Add field to copying set
          setCopyingFields(prev => new Set(prev).add(fieldName));
          try {
            await onCopyToAll(fieldName, fieldValue);
          } catch (error) {
            console.error('Error copying to all:', error);
          } finally {
            // Remove field from copying set
            setCopyingFields(prev => {
              const newSet = new Set(prev);
              newSet.delete(fieldName);
              return newSet;
            });
          }
        }}
        disabled={isCopying}
        className="ml-2 p-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Copy this value to all other movelaps"
      >
        <Copy size={14} />
      </button>
    );
  };

  // Fast input parsing functions with decisecond support
  // Format: 113255 → 1h13'25"5 (hours, minutes, seconds, deciseconds)
  const parsePaceInput = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    if (!digits) return '';

    // Parse from right to left: decisecond, seconds, minutes
    const len = digits.length;
    let decisec = '0';
    let sec = '00';
    let min = '0';
    
    if (len === 1) {
      // "5" → "0'00"5"
      decisec = digits[0];
    } else if (len === 2) {
      // "25" → "0'02"5"
      sec = digits[0].padStart(2, '0');
      decisec = digits[1];
    } else if (len === 3) {
      // "255" → "0'25"5"
      sec = digits.slice(0, 2);
      decisec = digits[2];
    } else if (len === 4) {
      // "1325" → "1'32"5"
      min = digits[0];
      sec = digits.slice(1, 3);
      decisec = digits[3];
    } else if (len === 5) {
      // "13255" → "13'25"5"
      min = digits.slice(0, 2);
      sec = digits.slice(2, 4);
      decisec = digits[4];
    } else {
      // 6+ digits: treat first digits as extra minutes
      min = digits.slice(0, -3);
      sec = digits.slice(-3, -1);
      decisec = digits.slice(-1);
    }
    
    return `${min}'${sec}"${decisec}`;
  };

  const parseTimeInput = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    if (!digits) return '';

    // Parse from right to left: decisecond, seconds, minutes, hours
    const len = digits.length;
    let decisec = '0';
    let sec = '00';
    let min = '00';
    let hour = '0';
    
    if (len === 1) {
      // "5" → "0h00'00"5"
      decisec = digits[0];
    } else if (len === 2) {
      // "25" → "0h00'02"5"
      sec = digits[0].padStart(2, '0');
      decisec = digits[1];
    } else if (len === 3) {
      // "255" → "0h00'25"5"
      sec = digits.slice(0, 2);
      decisec = digits[2];
    } else if (len === 4) {
      // "1325" → "0h01'32"5"
      min = digits[0].padStart(2, '0');
      sec = digits.slice(1, 3);
      decisec = digits[3];
    } else if (len === 5) {
      // "13255" → "0h13'25"5"
      min = digits.slice(0, 2);
      sec = digits.slice(2, 4);
      decisec = digits[4];
    } else if (len === 6) {
      // "113255" → "1h13'25"5"
      hour = digits[0];
      min = digits.slice(1, 3);
      sec = digits.slice(3, 5);
      decisec = digits[5];
    } else {
      // 7+ digits: HH+:MM'SS"D
      hour = digits.slice(0, -5);
      min = digits.slice(-5, -3);
      sec = digits.slice(-3, -1);
      decisec = digits.slice(-1);
    }
    
    return `${hour}h${min}'${sec}"${decisec}`;
  };

  const handlePaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow clearing the field
    if (input === '') {
      setPace('');
      return;
    }
    
    // If user is typing numbers, auto-format
    if (/^\d+$/.test(input)) {
      const formatted = parsePaceInput(input);
      setPace(formatted);
    } else {
      // Allow manual editing with quotes and apostrophes
      setPace(input);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow clearing the field
    if (input === '') {
      setTime('');
      return;
    }
    
    // If user is typing numbers, auto-format
    if (/^\d+$/.test(input)) {
      const formatted = parseTimeInput(input);
      setTime(formatted);
    } else {
      // Allow manual editing
      setTime(input);
    }
  };

  // Initialize form
  useEffect(() => {
    if (mode === 'edit' && existingMovelap) {
      setSequence(existingMovelap.repetitionNumber || 1);
      setDistance(existingMovelap.distance?.toString() || '');
      setSpeed(existingMovelap.speed || '');
      setStyle(existingMovelap.style || '');
      setPause(existingMovelap.pause || '');
      setPace(existingMovelap.pace || '');
      setTime(existingMovelap.time || '');
      setNotes(existingMovelap.notes || '');
      setAlarm(existingMovelap.alarm?.toString() || '');
      setSound(existingMovelap.sound || 'Beep');
      setMacroFinal(existingMovelap.macroFinal || "0'");
      setReps(existingMovelap.reps?.toString() || '');
      setWeight(existingMovelap.weight || '');
      setTools(existingMovelap.tools || '');
      setMuscularSector(existingMovelap.muscularSector || '');
      setExercise(existingMovelap.exercise || '');
      setRestType(existingMovelap.restType || '');
      setR1(existingMovelap.r1 || '');
      setR2(existingMovelap.r2 || '');
    } else {
      // Inherit from moveframe for new movelap
      const movelaps = moveframe.movelaps || [];
      const nextSequence = movelaps.length + 1;
      
      setSequence(nextSequence);
      setDistance(moveframe.distance?.toString() || '');
      setSpeed(moveframe.speed || '');
      setStyle(moveframe.style || '');
      setPause(moveframe.pause || '');
      setPace('');  // Always start empty for new movelaps
      setTime('');  // Always start empty for new movelaps
      setNotes('');
      setAlarm('');
      setSound('Beep');
      setMacroFinal("0'");
      setReps('');
      setWeight('');
      setTools('');
      setMuscularSector('');
      setExercise('');
      setRestType('');
      setR1('');
      setR2('');
    }
  }, [mode, existingMovelap, moveframe, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Distance-based sports (SWIM, BIKE, RUN, ROWING, SKATE, SKI, SNOWBOARD)
    const distanceBasedSports = ['SWIM', 'BIKE', 'RUN', 'ROWING', 'SKATE', 'SKI', 'SNOWBOARD'];
    
    if (sport === 'BODY_BUILDING') {
      // Body building requires reps
      if (!reps) newErrors.reps = 'Reps is required';
    } else if (distanceBasedSports.includes(sport)) {
      // Distance-based sports require distance
      if (!distance) newErrors.distance = 'Distance is required';
    } else {
      // Tools-based sports (Gymnastic, Stretching, Pilates, Yoga, etc.) require reps
      if (!reps) newErrors.reps = 'Reps is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const movelapData = {
        repetitionNumber: sequence,
        distance: distance ? parseInt(distance) : null,
        speed,
        style,
        pace,
        time,
        pause,
        macroFinal,
        alarm: alarm ? parseInt(alarm) : null,
        sound,
        notes,
        // BODY_BUILDING specific
        reps: reps ? parseInt(reps) : null,
        weight: weight || null,
        muscularSector: muscularSector || null,
        exercise: exercise || null,
        restType: restType || null,
        // OTHER SPORTS specific
        tools: tools || null,
        // BIKE specific
        r1: r1 || null,
        r2: r2 || null,
        status: existingMovelap?.status || 'PENDING',
        isSkipped: false,
        isDisabled: false,
        moveframeId: moveframe.id
      };

      console.log('📤 Saving movelap:', movelapData);
      await onSave(movelapData);
      onClose();
    } catch (error) {
      console.error('Error saving movelap:', error);
      setErrors({ general: 'Failed to save movelap' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {mode === 'add' ? 'Add Movelap' : 'Edit Movelap'}
            </h2>
            <p className="text-xs text-blue-100 mt-1">
              Moveframe: {moveframe.description || 'No description'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          {/* Sequence */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Sequence: <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-blue-600 font-normal">
                {mode === 'add' ? '(New movelap will be inserted after this position)' : '(Position in sequence)'}
              </span>
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={sequence}
                onChange={(e) => setSequence(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={(moveframe.movelaps?.length || 0) + (mode === 'add' ? 1 : 0)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <CopyButton fieldName="repetitionNumber" fieldValue={sequence} disabled={true} />
              <span className="ml-2 text-sm text-gray-500">
                (#{sequence} of {(moveframe.movelaps?.length || 0) + (mode === 'add' ? 1 : 0)})
              </span>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-sm text-gray-700 mb-3">
                  {sport === 'BODY_BUILDING' ? '💪 EXERCISE DETAILS' : '🏃 MOVEMENT DETAILS'}
                </h3>

                {sport === 'BODY_BUILDING' ? (
                  <>
                    {/* Body Building Fields */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Muscular Sector:
                      </label>
                      <div className="flex items-center">
                        <select
                          value={muscularSector}
                          onChange={(e) => setMuscularSector(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          {(config as any).muscularSectors?.map((m: string) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <CopyButton fieldName="muscularSector" fieldValue={muscularSector} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Exercise:
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={exercise}
                          onChange={(e) => setExercise(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Bench Press, Squat..."
                        />
                        <CopyButton fieldName="exercise" fieldValue={exercise} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reps: <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="12"
                        />
                        <CopyButton fieldName="reps" fieldValue={reps} />
                      </div>
                      {errors.reps && <p className="mt-1 text-xs text-red-500">{errors.reps}</p>}
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Weight:
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="12 kg, 50 lbs, etc."
                        />
                        <CopyButton fieldName="weight" fieldValue={weight} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tempo/Speed:
                      </label>
                      <div className="flex items-center">
                        <select
                          value={speed}
                          onChange={(e) => setSpeed(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          {config.speeds.map((s: string) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <CopyButton fieldName="speed" fieldValue={speed} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Check if it's a tools-based sport (not distance-based) */}
                    {(() => {
                      const distanceBasedSports = ['SWIM', 'BIKE', 'RUN', 'ROWING', 'SKATE', 'SKI', 'SNOWBOARD'];
                      const isDistanceBased = distanceBasedSports.includes(sport);
                      const hasTools = !isDistanceBased;
                      
                      if (hasTools) {
                        // Sports with tools (Gymnastic, Stretching, Pilates, Yoga, etc.)
                        return (
                          <>
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Reps: <span className="text-red-500">*</span>
                              </label>
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  value={reps}
                                  onChange={(e) => setReps(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  placeholder="12"
                                />
                                <CopyButton fieldName="reps" fieldValue={reps} />
                              </div>
                              {errors.reps && <p className="mt-1 text-xs text-red-500">{errors.reps}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tools:
                              </label>
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  value={tools}
                                  onChange={(e) => setTools(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  placeholder="Enter tools (alphanumeric)"
                                />
                                <CopyButton fieldName="tools" fieldValue={tools} />
                              </div>
                            </div>
                          </>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Distance-based sports (SWIM, BIKE, RUN, ROWING, SKATE, SKI, SNOWBOARD) */}
                    {(() => {
                      const distanceBasedSports = ['SWIM', 'BIKE', 'RUN', 'ROWING', 'SKATE', 'SKI', 'SNOWBOARD'];
                      const isDistanceBased = distanceBasedSports.includes(sport);
                      
                      if (!isDistanceBased) return null;
                      
                      return (
                        <>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Distance (m): <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        {'distances' in config && (
                          <select
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select...</option>
                            {config.distances.map((d: string) => (
                              <option key={d} value={d}>
                                {d}m
                              </option>
                            ))}
                          </select>
                        )}
                        <CopyButton fieldName="distance" fieldValue={distance} />
                      </div>
                      {errors.distance && <p className="mt-1 text-xs text-red-500">{errors.distance}</p>}
                    </div>

                    {/* Style - Only for SWIM and RUN */}
                    {(sport === 'SWIM' || sport === 'RUN') && 'styles' in config && (
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Style:</label>
                        <div className="flex items-center">
                          <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select...</option>
                            {config.styles.map((s: string) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <CopyButton fieldName="style" fieldValue={style} />
                        </div>
                      </div>
                    )}

                    {/* R1, R2 - Only for BIKE */}
                    {sport === 'BIKE' && 'ranges' in config && (
                      <>
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">R1 (Range 1):</label>
                          <div className="flex items-center">
                            <select
                              value={r1}
                              onChange={(e) => setR1(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {config.ranges.map((r: string) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                            <CopyButton fieldName="r1" fieldValue={r1} />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">R2 (Range 2):</label>
                          <div className="flex items-center">
                            <select
                              value={r2}
                              onChange={(e) => setR2(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {config.ranges.map((r: string) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                            <CopyButton fieldName="r2" fieldValue={r2} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Speed - For all distance-based sports */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Speed/Zone:</label>
                      <div className="flex items-center">
                        <select
                          value={speed}
                          onChange={(e) => setSpeed(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          {config.speeds.map((s: string) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <CopyButton fieldName="speed" fieldValue={speed} />
                      </div>
                    </div>
                          </>
                        );
                    })()}
                  </>
                )}
              </div>

              {/* Timing Section - Only for distance-based sports */}
              {sport !== 'BODY_BUILDING' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-sm text-gray-700 mb-3">⏱️ TIMING</h3>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Time:
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (Type: 113255 → 1h13'25"5)
                      </span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={time}
                        onChange={handleTimeChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Type: 113255 for 1h13'25&quot;5"
                      />
                      <CopyButton fieldName="time" fieldValue={time} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Pace/100m:
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (Type: 1325 → 1'32"5)
                      </span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={pace}
                        onChange={handlePaceChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Type: 1325 for 1'32&quot;5"
                      />
                      <CopyButton fieldName="pace" fieldValue={pace} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-sm text-gray-700 mb-3">⏸️ REST & RECOVERY</h3>
                
                {/* Rest Type - Only for BODY_BUILDING */}
                {sport === 'BODY_BUILDING' && 'restTypes' in config && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rest Type:</label>
                    <div className="flex items-center">
                      <select
                        value={restType}
                        onChange={(e) => setRestType(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {config.restTypes.map((rt: string) => (
                          <option key={rt} value={rt}>
                            {rt.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <CopyButton fieldName="restType" fieldValue={restType} />
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pause:</label>
                  <div className="flex items-center">
                    <select
                      value={pause}
                      onChange={(e) => setPause(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select...</option>
                      {config.pauses.map((p: string) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <CopyButton fieldName="pause" fieldValue={pause} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Macro Final:</label>
                  <div className="flex items-center">
                    <select
                      value={macroFinal}
                      onChange={(e) => setMacroFinal(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      {MACRO_FINALS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <CopyButton fieldName="macroFinal" fieldValue={macroFinal} />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-sm text-gray-700 mb-3">🔔 ALERTS</h3>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Alarm:</label>
                  <div className="flex items-center">
                    <select
                      value={alarm}
                      onChange={(e) => setAlarm(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      {ALARMS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                    <CopyButton fieldName="alarm" fieldValue={alarm} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sound:</label>
                  <div className="flex items-center">
                    <select
                      value={sound}
                      onChange={(e) => setSound(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      {SOUNDS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <CopyButton fieldName="sound" fieldValue={sound} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Notes:
              <CopyButton fieldName="notes" fieldValue={notes} />
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any notes or special instructions..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : mode === 'add' ? 'Add Movelap' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

