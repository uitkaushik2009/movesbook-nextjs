'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddEditMovelapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movelapData: any) => void;
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
  BIKE: {
    distances: ['200', '400', '500', '1000', '1500', '2000', '3000', '4000', '5000', '7000', '8000', '10000'],
    speeds: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'],
    pauses: ['15"', '30"', '45"', "1'", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'"]
  },
  BODY_BUILDING: {
    speeds: ['Very slow', 'Slow', 'Normal', 'Quick', 'Fast', 'Very fast', 'Explosive', 'Negative'],
    pauses: ['0"', '5"', '10"', '15"', '20"', '30"', '45"', "1'", "1'15\"", "1'30\"", "2'", "2'30\"", "3'", "4'", "5'", "6'", "7'"]
  }
};

const ALARMS = ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10'];
const SOUNDS = ['Beep', 'Bell', 'Chime', 'None'];

export default function AddEditMovelapModal({
  isOpen,
  onClose,
  onSave,
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
  const [reps, setReps] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

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
      setReps(existingMovelap.reps?.toString() || '');
    } else {
      // Inherit from moveframe for new movelap
      const movelaps = moveframe.movelaps || [];
      const nextSequence = movelaps.length + 1;
      
      setSequence(nextSequence);
      setDistance(moveframe.distance?.toString() || '');
      setSpeed(moveframe.speed || '');
      setStyle(moveframe.style || '');
      setPause(moveframe.pause || '');
      setPace(moveframe.pace || '');
      setTime('');
      setNotes('');
      setAlarm('');
      setSound('Beep');
      setReps('');
    }
  }, [mode, existingMovelap, moveframe, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (sport === 'BODY_BUILDING') {
      if (!reps) newErrors.reps = 'Reps is required';
    } else {
      if (!distance) newErrors.distance = 'Distance is required';
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
        alarm: alarm ? parseInt(alarm) : null,
        sound,
        notes,
        reps: reps ? parseInt(reps) : null,
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
            </label>
            <input
              type="number"
              value={sequence}
              onChange={(e) => setSequence(parseInt(e.target.value) || 1)}
              min="1"
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="ml-2 text-sm text-gray-500">
              (#{sequence} of {(moveframe.movelaps?.length || 0) + (mode === 'add' ? 1 : 0)})
            </span>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-sm text-gray-700 mb-3">MOVELAP DETAILS</h3>

                {sport === 'BODY_BUILDING' ? (
                  <>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reps: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="12"
                      />
                      {errors.reps && <p className="mt-1 text-xs text-red-500">{errors.reps}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Distance: <span className="text-red-500">*</span>
                      </label>
                      {'distances' in config && (
                        <select
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          {config.distances.map((d) => (
                            <option key={d} value={d}>
                              {d}m
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.distance && <p className="mt-1 text-xs text-red-500">{errors.distance}</p>}
                    </div>

                    {'styles' in config && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Style:</label>
                        <select
                          value={style}
                          onChange={(e) => setStyle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          {config.styles.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-sm text-gray-700 mb-3">TIMING</h3>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pace/100m:</label>
                  <input
                    type="text"
                    value={pace}
                    onChange={(e) => setPace(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="1:30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time:</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="MM:SS"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-sm text-gray-700 mb-3">INTENSITY & REST</h3>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Speed/Zone:</label>
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    {config.speeds.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pause:</label>
                  <select
                    value={pause}
                    onChange={(e) => setPause(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    {config.pauses.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-sm text-gray-700 mb-3">ALERTS</h3>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Alarm:</label>
                  <select
                    value={alarm}
                    onChange={(e) => setAlarm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {ALARMS.map((a) => (
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
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {SOUNDS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes:</label>
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

