'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddEditMoveframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moveframeData: any) => void;
  mode: 'add' | 'edit';
  workout: any;
  day: any;
  existingMoveframe?: any;
}

// Sport-specific field configurations
const SPORT_CONFIGS = {
  SWIM: {
    meters: ['20', '50', '75', '100', '150', '200', '400', '500', '800', '1000', '1200', '1500'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Freestyle', 'Dolphin', 'Backstroke', 'Breaststroke', 'Sliding', 'Apnea'],
    pauses: ['0"', '5"', '10"', '15"', '20"', '25"', '30"', '35"', '40"', '45"', '50"', "1'", "1'10\"", "1'15\"", "1'30\"", "2'", "2'30\"", "3'"],
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  RUN: {
    meters: ['50', '60', '80', '100', '110', '150', '200', '300', '400', '500', '600', '800', '1000', '1200', '1500', '2000', '3000', '5000', '10000'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    styles: ['Track', 'Road', 'Cross', 'Beach', 'Hill', 'Downhill'],
    pauses: ['20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  BIKE: {
    meters: ['200', '400', '500', '1000', '1500', '2000', '3000', '4000', '5000', '7000', '8000', '10000', 'custom'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    pauses: ['15"', '30"', '45"', "1'", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'"],
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  },
  BODY_BUILDING: {
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive', 'Negative'],
    pauses: ['0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"],
    alarms: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'],
    sounds: ['Beep', 'Bell', 'Chime', 'None']
  }
};

const SPORTS_LIST = [
  'SWIM', 'BIKE', 'RUN', 'BODY_BUILDING', 'ROWING', 'SKATE', 'GYMNASTIC',
  'STRETCHING', 'PILATES', 'YOGA', 'SKI', 'SNOWBOARD', 'TECHNICAL_MOVES',
  'FREE_MOVES', 'SOCCER', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'GOLF',
  'BOXING', 'MARTIAL_ARTS', 'CLIMBING', 'HIKING', 'WALKING', 'DANCING',
  'CROSSFIT', 'TRIATHLON', 'TRACK_FIELD'
];

export default function AddEditMoveframeModal({
  isOpen,
  onClose,
  onSave,
  mode,
  workout,
  day,
  existingMoveframe
}: AddEditMoveframeModalProps) {
  // Form state
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
  const [alarm, setAlarm] = useState('-1');
  const [sound, setSound] = useState('Beep');
  const [reps, setReps] = useState('');
  const [r1, setR1] = useState('');
  const [r2, setR2] = useState('');

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

  // Initialize form with existing data in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingMoveframe) {
      setSport(existingMoveframe.sport || 'SWIM');
      setDistance(existingMoveframe.distance?.toString() || '100');
      setRepetitions(existingMoveframe.repetitions?.toString() || '1');
      setSpeed(existingMoveframe.speed || 'A2');
      setStyle(existingMoveframe.style || '');
      setPace(existingMoveframe.pace || '');
      setTime(existingMoveframe.time || '');
      setNote(existingMoveframe.notes || '');
      setPause(existingMoveframe.pause || '20"');
      setAlarm(existingMoveframe.alarm?.toString() || '-1');
      setSound(existingMoveframe.sound || 'Beep');
      setReps(existingMoveframe.reps?.toString() || '');
      setManualContent(existingMoveframe.description || '');
    } else {
      resetForm();
    }
  }, [mode, existingMoveframe, isOpen]);

  // Reset form
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
    setAlarm('-1');
    setSound('Beep');
    setReps('');
    setR1('');
    setR2('');
    setAnnotationText('');
    setAnnotationBgColor('#5168c2');
    setAnnotationTextColor('#000000');
    setBatteryCount(3);
    setBatterySequence([]);
    setManualContent('');
    setErrors({});
  };

  // Get sport config
  const getSportConfig = () => {
    return SPORT_CONFIGS[sport as keyof typeof SPORT_CONFIGS] || SPORT_CONFIGS.SWIM;
  };

  // Calculate total distance
  const calculateTotalDistance = () => {
    const dist = distance === 'custom' ? parseInt(customDistance) || 0 : parseInt(distance) || 0;
    const reps = parseInt(repetitions) || 1;
    return dist * reps;
  };

  // Calculate estimated time
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

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!sport) {
      newErrors.sport = 'Sport is required';
    }

    if (type === 'STANDARD' && !manualMode) {
      if (sport === 'BODY_BUILDING') {
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

  // Generate moveframe description
  const generateDescription = () => {
    if (manualMode && manualPriority) {
      return manualContent;
    }

    if (type === 'ANNOTATION') {
      return annotationText;
    }

    if (sport === 'BODY_BUILDING') {
      return `${reps} reps ${speed} ${pause ? `P${pause}` : ''}`;
    }

    const dist = distance === 'custom' ? customDistance : distance;
    const repsText = parseInt(repetitions) > 1 ? ` × ${repetitions}` : '';
    const styleText = style ? ` ${style}` : '';
    const speedText = speed ? ` ${speed}` : '';
    const pauseText = pause ? ` P${pause}` : '';
    
    return `${dist}m${repsText}${styleText}${speedText}${pauseText}`;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const moveframeData = {
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
        alarm: parseInt(alarm),
        sound,
        reps: sport === 'BODY_BUILDING' ? parseInt(reps) : null,
        
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

      console.log('📤 Sending moveframe data:', moveframeData);

      await onSave(moveframeData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving moveframe:', error);
      setErrors({ general: 'Failed to save moveframe' });
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

  const config = getSportConfig();
  const totalDistance = calculateTotalDistance();
  const estimatedTime = calculateEstimatedTime();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {mode === 'add' ? 'Add Moveframe' : 'Edit Moveframe'}
          </h2>
          <button
            onClick={handleClose}
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

          {/* Sport Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Sport <span className="text-red-500">*</span>
            </label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              {SPORTS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {errors.sport && <p className="mt-1 text-xs text-red-500">{errors.sport}</p>}
          </div>

          {/* Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Type:</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="STANDARD"
                  checked={type === 'STANDARD'}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">Standard</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="BATTERY"
                  checked={type === 'BATTERY'}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">Battery</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ANNOTATION"
                  checked={type === 'ANNOTATION'}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">Annotation</span>
              </label>
            </div>
          </div>

          {/* Standard Mode */}
          {type === 'STANDARD' && !manualMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-sm text-gray-700 mb-3">DISTANCE SECTION</h3>
                  
                  {sport === 'BODY_BUILDING' ? (
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
                  ) : (
                    <>
                      {'meters' in config && (
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Meters: <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          >
                            {config.meters.map((m) => (
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

                {'styles' in config && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-sm text-gray-700 mb-3">STYLE & NOTES</h3>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Style:</label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Select style</option>
                        {config.styles.map((s) => (
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
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-sm text-gray-700 mb-3">SPEED & PACING</h3>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Speed:</label>
                    <select
                      value={speed}
                      onChange={(e) => setSpeed(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                    >
                      {config.speeds.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  {sport !== 'BODY_BUILDING' && (
                    <>
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Pace/100m:</label>
                        <input
                          type="text"
                          value={pace}
                          onChange={(e) => setPace(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          placeholder="1:30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Time:</label>
                        <input
                          type="text"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                          placeholder="MM:SS"
                        />
                        {estimatedTime && (
                          <p className="mt-1 text-xs text-blue-600">
                            Estimated: {estimatedTime}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-sm text-gray-700 mb-3">REST & ALERTS</h3>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pause:</label>
                    <select
                      value={pause}
                      onChange={(e) => setPause(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                    >
                      {config.pauses.map((p) => (
                        <option key={p} value={p}>
                          {p}
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
                      {config.alarms.map((a) => (
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
                      {config.sounds.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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
            <div className="mt-6 bg-blue-50 border border-blue-300 p-4 rounded">
              <h4 className="text-xs font-bold text-blue-900 mb-2">PREVIEW:</h4>
              <p className="text-sm text-blue-800 font-medium">{generateDescription()}</p>
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

