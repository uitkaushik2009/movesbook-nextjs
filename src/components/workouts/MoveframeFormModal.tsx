'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Info } from 'lucide-react';
import { SportType, RestType, MoveframeType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface MoveframeFormModalProps {
  workoutId: string;
  dayId: string;
  existingMoveframe?: any;
  mainSports: SportType[];
  workoutSections: any[];
  periods: any[];
  onClose: () => void;
  onSave: () => void;
}

export default function MoveframeFormModal({
  workoutId,
  dayId,
  existingMoveframe,
  mainSports,
  workoutSections,
  periods,
  onClose,
  onSave
}: MoveframeFormModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'moveframe' | 'workout' | 'day'>('moveframe');
  
  // Moveframe data
  const [moveframeType, setMoveframeType] = useState<MoveframeType>('STANDARD');
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [inputMode, setInputMode] = useState<'mono' | 'battery'>('mono');
  
  // Sport-specific fields
  const [sportFields, setSportFields] = useState({
    distance: '',
    speed: '',
    style: '',
    pace: '',
    time: '',
    reps: '1',
    restType: 'SET_TIME' as RestType,
    pause: '',
    alarm: '',
    sound: '',
    description: '',
    // Cycling fields
    cadence: '',
    power: '',
    gear: '',
    terrain: '',
    // Running fields
    incline: '',
    hrZone: '',
    // Strength fields
    exerciseName: '',
    weight: '',
    sets: '',
    repsPerSet: '',
    restBetweenSets: '',
    tempo: '',
    // Rowing fields
    strokeRate: '',
    // Generic fields
    duration: '',
    intensity: ''
  });

  // Workout info
  const [workoutInfo, setWorkoutInfo] = useState({
    name: '',
    code: '',
    time: '',
    location: '',
    surface: '',
    heartRateMax: '',
    heartRateAvg: '',
    calories: '',
    feelingStatus: '',
    notes: ''
  });

  // Day info
  const [dayInfo, setDayInfo] = useState({
    periodId: '',
    weather: '',
    feelingStatus: '',
    notes: ''
  });

  const [previousData, setPreviousData] = useState<any>(null);

  useEffect(() => {
    if (existingMoveframe) {
      // Load existing moveframe data
      setSelectedSport(existingMoveframe.sport);
      setSelectedSection(existingMoveframe.sectionId);
      setMoveframeType(existingMoveframe.type);
      // Load other fields...
    } else {
      // Load previous moveframe data if available (smart form behavior)
      loadPreviousMoveframeData();
    }
    
    // Load workout and day info
    loadWorkoutInfo();
    loadDayInfo();
  }, []);

  const loadPreviousMoveframeData = async () => {
    // TODO: Fetch the most recent moveframe to pre-fill form
  };

  const loadWorkoutInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/sessions/${workoutId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkoutInfo({
          name: data.workout.name || '',
          code: data.workout.code || '',
          time: data.workout.time || '',
          location: data.workout.location || '',
          surface: data.workout.surface || '',
          heartRateMax: data.workout.heartRateMax?.toString() || '',
          heartRateAvg: data.workout.heartRateAvg?.toString() || '',
          calories: data.workout.calories?.toString() || '',
          feelingStatus: data.workout.feelingStatus || '',
          notes: data.workout.notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading workout info:', error);
    }
  };

  const loadDayInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/days/${dayId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDayInfo({
          periodId: data.day.periodId || '',
          weather: data.day.weather || '',
          feelingStatus: data.day.feelingStatus || '',
          notes: data.day.notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading day info:', error);
    }
  };

  const handleSportChange = (sport: SportType) => {
    setSelectedSport(sport);
    // Reset sport-specific fields when sport changes
    setSportFields({
      distance: '',
      speed: '',
      style: '',
      pace: '',
      time: '',
      reps: '1',
      restType: 'SET_TIME',
      pause: '',
      alarm: '',
      sound: '',
      description: ''
    });
  };

  const handleSaveMoveframe = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Generate movelaps based on input mode and reps
      const reps = parseInt(sportFields.reps) || 1;
      const movelaps = [];
      
      for (let i = 1; i <= reps; i++) {
        movelaps.push({
          repetitionNumber: i,
          distance: parseInt(sportFields.distance) || 0,
          speed: sportFields.speed,
          style: sportFields.style,
          pace: sportFields.pace,
          time: sportFields.time,
          restType: sportFields.restType,
          pause: sportFields.pause,
          alarm: parseInt(sportFields.alarm) || null,
          sound: sportFields.sound,
          notes: '',
          status: 'PENDING',
          isSkipped: false,
          isDisabled: false
        });
      }

      const moveframeData = {
        workoutSessionId: workoutId,
        sport: selectedSport,
        sectionId: selectedSection,
        type: moveframeType,
        description: sportFields.description,
        movelaps
      };

      const endpoint = existingMoveframe
        ? `/api/workouts/moveframes/${existingMoveframe.id}`
        : '/api/workouts/moveframes';
      
      const method = existingMoveframe ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(moveframeData)
      });

      if (response.ok) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving moveframe:', error);
    }
  };

  const renderSportSpecificFields = () => {
    if (!selectedSport) {
      return (
        <div className="text-center py-8 text-gray-500">
          {t('workout_select_sport_first')}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Common fields for all sports */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workout_distance')} (m)
            </label>
            <input
              type="number"
              value={sportFields.distance}
              onChange={(e) => setSportFields({ ...sportFields, distance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workout_reps')}
            </label>
            <input
              type="number"
              value={sportFields.reps}
              onChange={(e) => setSportFields({ ...sportFields, reps: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1"
            />
          </div>
        </div>

        {/* Sport-specific fields */}
        {selectedSport === 'SWIM' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('workout_speed')}
                </label>
                <select
                  value={sportFields.speed}
                  onChange={(e) => setSportFields({ ...sportFields, speed: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('workout_select')}</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="fast">Fast</option>
                  <option value="sprint">Sprint</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('workout_style')}
                </label>
                <select
                  value={sportFields.style}
                  onChange={(e) => setSportFields({ ...sportFields, style: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('workout_select')}</option>
                  <option value="freestyle">Freestyle</option>
                  <option value="backstroke">Backstroke</option>
                  <option value="breaststroke">Breaststroke</option>
                  <option value="butterfly">Butterfly</option>
                  <option value="medley">Medley</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('workout_pace')} (/100m)
              </label>
              <input
                type="text"
                value={sportFields.pace}
                onChange={(e) => setSportFields({ ...sportFields, pace: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1:30"
              />
            </div>
          </>
        )}

        {/* CYCLING specific fields */}
        {selectedSport === 'BIKE' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed (km/h)
                </label>
                <input
                  type="text"
                  value={sportFields.speed}
                  onChange={(e) => setSportFields({ ...sportFields, speed: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pace (/km)
                </label>
                <input
                  type="text"
                  value={sportFields.pace}
                  onChange={(e) => setSportFields({ ...sportFields, pace: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2:24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cadence (rpm)
                </label>
                <input
                  type="number"
                  value={sportFields.cadence || ''}
                  onChange={(e) => setSportFields({ ...sportFields, cadence: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="90"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Power (watts)
                </label>
                <input
                  type="number"
                  value={sportFields.power || ''}
                  onChange={(e) => setSportFields({ ...sportFields, power: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gear
                </label>
                <input
                  type="text"
                  value={sportFields.gear || ''}
                  onChange={(e) => setSportFields({ ...sportFields, gear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="53/19"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terrain
                </label>
                <select
                  value={sportFields.terrain || ''}
                  onChange={(e) => setSportFields({ ...sportFields, terrain: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="flat">Flat</option>
                  <option value="rolling">Rolling</option>
                  <option value="hilly">Hilly</option>
                  <option value="mountainous">Mountainous</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* RUNNING specific fields */}
        {selectedSport === 'RUN' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed (km/h)
                </label>
                <input
                  type="text"
                  value={sportFields.speed}
                  onChange={(e) => setSportFields({ ...sportFields, speed: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pace (/km)
                </label>
                <input
                  type="text"
                  value={sportFields.pace}
                  onChange={(e) => setSportFields({ ...sportFields, pace: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5:00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incline (%)
                </label>
                <input
                  type="number"
                  value={sportFields.incline || ''}
                  onChange={(e) => setSportFields({ ...sportFields, incline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  step="0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terrain
                </label>
                <select
                  value={sportFields.terrain || ''}
                  onChange={(e) => setSportFields({ ...sportFields, terrain: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="road">Road</option>
                  <option value="trail">Trail</option>
                  <option value="track">Track</option>
                  <option value="treadmill">Treadmill</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heart Rate Zone
              </label>
              <select
                value={sportFields.hrZone || ''}
                onChange={(e) => setSportFields({ ...sportFields, hrZone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="z1">Zone 1 (Recovery)</option>
                <option value="z2">Zone 2 (Endurance)</option>
                <option value="z3">Zone 3 (Tempo)</option>
                <option value="z4">Zone 4 (Threshold)</option>
                <option value="z5">Zone 5 (VO2 Max)</option>
              </select>
            </div>
          </>
        )}

        {/* STRENGTH / BODYBUILDING specific fields */}
        {selectedSport === 'BODY_BUILDING' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={sportFields.exerciseName || ''}
                  onChange={(e) => setSportFields({ ...sportFields, exerciseName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bench Press"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={sportFields.weight || ''}
                  onChange={(e) => setSportFields({ ...sportFields, weight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="80"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sets
                </label>
                <input
                  type="number"
                  value={sportFields.sets || ''}
                  onChange={(e) => setSportFields({ ...sportFields, sets: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reps per Set
                </label>
                <input
                  type="number"
                  value={sportFields.repsPerSet || ''}
                  onChange={(e) => setSportFields({ ...sportFields, repsPerSet: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rest Between Sets
                </label>
                <input
                  type="text"
                  value={sportFields.restBetweenSets || ''}
                  onChange={(e) => setSportFields({ ...sportFields, restBetweenSets: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="90s"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo (eccentric-pause-concentric-pause)
              </label>
              <input
                type="text"
                value={sportFields.tempo || ''}
                onChange={(e) => setSportFields({ ...sportFields, tempo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3-0-1-0"
              />
            </div>
          </>
        )}

        {/* ROWING specific fields */}
        {selectedSport === 'ROWING' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pace (/500m)
                </label>
                <input
                  type="text"
                  value={sportFields.pace}
                  onChange={(e) => setSportFields({ ...sportFields, pace: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1:50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stroke Rate (spm)
                </label>
                <input
                  type="number"
                  value={sportFields.strokeRate || ''}
                  onChange={(e) => setSportFields({ ...sportFields, strokeRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Power (watts)
                </label>
                <input
                  type="number"
                  value={sportFields.power || ''}
                  onChange={(e) => setSportFields({ ...sportFields, power: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="200"
                />
              </div>
            </div>
          </>
        )}

        {/* GENERIC fields for remaining sports (SKATE, GYMNASTIC, STRETCHING, PILATES, SKI, TECHNICAL_MOVES, FREE_MOVES) */}
        {(selectedSport === 'SKATE' || selectedSport === 'GYMNASTIC' || selectedSport === 'STRETCHING' || 
          selectedSport === 'PILATES' || selectedSport === 'SKI' || selectedSport === 'TECHNICAL_MOVES' || 
          selectedSport === 'FREE_MOVES') && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={sportFields.duration || ''}
                  onChange={(e) => setSportFields({ ...sportFields, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intensity
                </label>
                <select
                  value={sportFields.intensity || ''}
                  onChange={(e) => setSportFields({ ...sportFields, intensity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very-high">Very High</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Rest/Pause fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workout_rest_type')}
            </label>
            <select
              value={sportFields.restType}
              onChange={(e) => setSportFields({ ...sportFields, restType: e.target.value as RestType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="SET_TIME">Set Time</option>
              <option value="RESTART_TIME">Restart Time</option>
              <option value="RESTART_PULSE">Restart Pulse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workout_pause')}
            </label>
            <input
              type="text"
              value={sportFields.pause}
              onChange={(e) => setSportFields({ ...sportFields, pause: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="30s"
            />
          </div>
        </div>

        {/* Alarm and Sound */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workout_alarm')} (s)
            </label>
            <input
              type="number"
              value={sportFields.alarm}
              onChange={(e) => setSportFields({ ...sportFields, alarm: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workout_sound')}
            </label>
            <select
              value={sportFields.sound}
              onChange={(e) => setSportFields({ ...sportFields, sound: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('workout_select')}</option>
              <option value="beep">Beep</option>
              <option value="bell">Bell</option>
              <option value="whistle">Whistle</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('workout_description')}
          </label>
          <textarea
            value={sportFields.description}
            onChange={(e) => setSportFields({ ...sportFields, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder={t('workout_description_placeholder')}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {existingMoveframe ? t('workout_edit_moveframe') : t('workout_add_moveframe')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('moveframe')}
            className={`flex-1 px-6 py-3 font-medium transition ${
              activeTab === 'moveframe'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('workout_moveframe_data')}
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex-1 px-6 py-3 font-medium transition ${
              activeTab === 'workout'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('workout_workout_info')}
          </button>
          <button
            onClick={() => setActiveTab('day')}
            className={`flex-1 px-6 py-3 font-medium transition ${
              activeTab === 'day'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('workout_day_info')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'moveframe' && (
            <div className="space-y-6">
              {/* Moveframe Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('workout_moveframe_type')}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMoveframeType('ANNOTATION')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      moveframeType === 'ANNOTATION'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('workout_annotation')}
                  </button>
                  <button
                    onClick={() => setMoveframeType('STANDARD')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      moveframeType === 'STANDARD' || moveframeType === 'BATTERY'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('workout_work_to_do')}
                  </button>
                </div>
              </div>

              {moveframeType !== 'ANNOTATION' && (
                <>
                  {/* Sport Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('workout_select_sport')} *
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {mainSports.map((sport) => (
                        <button
                          key={sport}
                          onClick={() => handleSportChange(sport)}
                          className={`flex flex-col items-center p-3 rounded-lg border-2 transition ${
                            selectedSport === sport
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl mb-1">
                            {sport === 'SWIM' && '🏊'}
                            {sport === 'BIKE' && '🚴'}
                            {sport === 'RUN' && '🏃'}
                          </span>
                          <span className="text-xs text-center">
                            {t(`sport_${sport.toLowerCase()}`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Workout Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('workout_section')} *
                    </label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">{t('workout_select_section')}</option>
                      {workoutSections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('workout_input_mode')}
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setInputMode('mono')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          inputMode === 'mono'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t('workout_monodistance')}
                      </button>
                      <button
                        onClick={() => setInputMode('battery')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          inputMode === 'battery'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t('workout_battery')}
                      </button>
                    </div>
                  </div>

                  {/* Sport-Specific Fields */}
                  {renderSportSpecificFields()}
                </>
              )}

              {moveframeType === 'ANNOTATION' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('workout_annotation_text')}
                  </label>
                  <textarea
                    value={sportFields.description}
                    onChange={(e) => setSportFields({ ...sportFields, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder={t('workout_annotation_placeholder')}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'workout' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_name')}
                  </label>
                  <input
                    type="text"
                    value={workoutInfo.name}
                    onChange={(e) => setWorkoutInfo({ ...workoutInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={t('workout_name_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_code')}
                  </label>
                  <input
                    type="text"
                    value={workoutInfo.code}
                    onChange={(e) => setWorkoutInfo({ ...workoutInfo, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={t('workout_code_placeholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_time')}
                  </label>
                  <input
                    type="time"
                    value={workoutInfo.time}
                    onChange={(e) => setWorkoutInfo({ ...workoutInfo, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_location')}
                  </label>
                  <input
                    type="text"
                    value={workoutInfo.location}
                    onChange={(e) => setWorkoutInfo({ ...workoutInfo, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_surface')}
                  </label>
                  <input
                    type="text"
                    value={workoutInfo.surface}
                    onChange={(e) => setWorkoutInfo({ ...workoutInfo, surface: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_hr_max')}
                  </label>
                  <input
                    type="number"
                    value={workoutInfo.heartRateMax}
                    onChange={(e) => setWorkoutInfo({ ...workoutInfo, heartRateMax: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_hr_avg')}
                  </label>
                  <input
                    type="number"
                    value={workoutInfo.heartRateAvg}
                    onChange={(e) => setWorkoutInfo({ ...workoutInfo, heartRateAvg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_calories')}
                  </label>
                  <input
                    type="number"
                    value={workoutInfo.calories}
                    onChange={(e) => setWorkoutInfo({ ...workoutInfo, calories: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('workout_notes')}
                </label>
                <textarea
                  value={workoutInfo.notes}
                  onChange={(e) => setWorkoutInfo({ ...workoutInfo, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
            </div>
          )}

          {activeTab === 'day' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('workout_period')}
                </label>
                <select
                  value={dayInfo.periodId}
                  onChange={(e) => setDayInfo({ ...dayInfo, periodId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{t('workout_select_period')}</option>
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('workout_weather')}
                </label>
                <select
                  value={dayInfo.weather}
                  onChange={(e) => setDayInfo({ ...dayInfo, weather: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{t('workout_select')}</option>
                  <option value="sunny">☀️ Sunny</option>
                  <option value="cloudy">☁️ Cloudy</option>
                  <option value="rainy">🌧️ Rainy</option>
                  <option value="snowy">❄️ Snowy</option>
                  <option value="windy">💨 Windy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('workout_feeling')}
                </label>
                <select
                  value={dayInfo.feelingStatus}
                  onChange={(e) => setDayInfo({ ...dayInfo, feelingStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{t('workout_select')}</option>
                  <option value="excellent">😄 Excellent</option>
                  <option value="good">🙂 Good</option>
                  <option value="ok">😐 OK</option>
                  <option value="tired">😓 Tired</option>
                  <option value="exhausted">😫 Exhausted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('workout_notes')}
                </label>
                <textarea
                  value={dayInfo.notes}
                  onChange={(e) => setDayInfo({ ...dayInfo, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            {t('workout_cancel')}
          </button>
          <button
            onClick={handleSaveMoveframe}
            disabled={!selectedSport && moveframeType !== 'ANNOTATION'}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${
              selectedSport || moveframeType === 'ANNOTATION'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{t('workout_save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

