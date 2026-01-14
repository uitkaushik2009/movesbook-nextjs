'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import SwimMoveframeForm from './forms/SwimMoveframeForm';
import { generateMovelaps, generateMoveframeDescription } from '@/utils/movelapGenerator';

interface AddMoveframeModalProps {
  workoutId: string;
  dayData?: any; // The entire day with all workouts
  currentWorkoutData?: any; // The current workout
  onClose: () => void;
  onSave: (moveframeData: any) => void;
}

const SPORTS = [
  'SWIM', 'BIKE', 'RUN', 'BODY_BUILDING', 'ROWING', 
  'SKATE', 'GYMNASTIC', 'STRETCHING', 'PILATES', 
  'SKI', 'TECHNICAL_MOVES', 'FREE_MOVES'
];

export default function AddMoveframeModal({
  workoutId,
  dayData,
  currentWorkoutData,
  onClose,
  onSave
}: AddMoveframeModalProps) {
  const [selectedSport, setSelectedSport] = useState('SWIM');
  const [selectedType, setSelectedType] = useState('STANDARD');
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [showSportSpecificForm, setShowSportSpecificForm] = useState(false);
  
  const [moveframeData, setMoveframeData] = useState({
    sport: 'SWIM',
    type: 'STANDARD',
    description: '',
    distance: '',
    repetitions: '1',
    speed: '',
    pause: ''
  });
  
  const [validationError, setValidationError] = useState<string>('');

  // Get all unique sports used in the entire day (across all workouts)
  const getDaySports = (): string[] => {
    if (!dayData || !dayData.workouts) return [];
    
    const allSports = new Set<string>();
    dayData.workouts.forEach((workout: any) => {
      if (workout.moveframes) {
        workout.moveframes.forEach((mf: any) => {
          allSports.add(mf.sport);
        });
      }
    });
    
    const sportsArray = Array.from(allSports);
    
    // Auto-exclude stretching if there are 4 sports and stretching is one of them
    // This is for counting purposes only - stretching can still be selected
    if (sportsArray.length === 4 && sportsArray.some(s => s.toLowerCase() === 'stretching')) {
      return sportsArray.filter(s => s.toLowerCase() !== 'stretching');
    }
    
    return sportsArray;
  };

  // Get all unique sports used in the current workout only
  const getWorkoutSports = (): string[] => {
    if (!currentWorkoutData || !currentWorkoutData.moveframes) return [];
    
    const workoutSports = new Set<string>();
    currentWorkoutData.moveframes.forEach((mf: any) => {
      workoutSports.add(mf.sport);
    });
    
    return Array.from(workoutSports);
  };

  // Check if a sport can be selected
  const canSelectSport = (sport: string): boolean => {
    const daySports = getDaySports();
    const workoutSports = getWorkoutSports();
    
    // If sport is already in the day, it can always be used
    if (daySports.includes(sport)) {
      return true;
    }
    
    // If day already has 4 different sports, cannot add a new one
    if (daySports.length >= 4) {
      return false;
    }
    
    // If sport is not in workout yet, check if workout has less than 4 sports
    if (!workoutSports.includes(sport) && workoutSports.length >= 4) {
      return false;
    }
    
    return true;
  };

  // Get reason why sport cannot be selected
  const getSportDisabledReason = (sport: string): string => {
    const daySports = getDaySports();
    const workoutSports = getWorkoutSports();
    
    if (daySports.includes(sport)) {
      return '';
    }
    
    if (daySports.length >= 4) {
      return `Day already has 4 sports (${daySports.join(', ')})`;
    }
    
    if (!workoutSports.includes(sport) && workoutSports.length >= 4) {
      return `Workout already has 4 sports (${workoutSports.join(', ')})`;
    }
    
    return '';
  };

  // Fetch sections on mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/workouts/sections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSections(data.sections || []);
          if (data.sections && data.sections.length > 0) {
            setSelectedSectionId(data.sections[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      } finally {
        setIsLoadingSections(false);
      }
    };
    
    fetchSections();
  }, []);

  // Validate when sport changes
  useEffect(() => {
    const error = getSportDisabledReason(selectedSport);
    setValidationError(error);
  }, [selectedSport]);

  // Get next letter for moveframe
  const getNextLetter = (): string => {
    if (!currentWorkoutData || !currentWorkoutData.moveframes) return 'A';
    
    const existingLetters = currentWorkoutData.moveframes.map((mf: any) => mf.letter);
    
    // Find next available letter
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i); // A, B, C, ...
      if (!existingLetters.includes(letter)) {
        return letter;
      }
    }
    
    return 'A'; // Fallback
  };

  // Handle sport-specific form submission (SWIM, RUN, BIKE, etc.)
  const handleSportFormSubmit = async (formData: any) => {
    try {
      // Validate sport selection
      if (!canSelectSport(selectedSport)) {
        alert('Cannot add this sport: ' + getSportDisabledReason(selectedSport));
        return;
      }

      // Validate section
      if (!selectedSectionId) {
        alert('Please select a section');
        return;
      }

      // Generate movelaps from sequences
      const movelaps = generateMovelaps({
        moveframeId: '', // Will be set by API
        sport: selectedSport,
        sequences: formData.sequences,
        globalFields: {
          pace100: formData.pace100,
          time: formData.time,
          alarm: formData.alarm,
          sound: formData.sound,
          note: formData.note
        }
      });

      // Generate description
      const description = generateMoveframeDescription(selectedSport, formData.sequences);

      // Get next letter
      const letter = getNextLetter();

      // Call API to create moveframe with movelaps
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts/moveframes/create-with-movelaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workoutSessionId: workoutId,
          sectionId: selectedSectionId,
          letter,
          sport: selectedSport,
          type: selectedType,
          description,
          movelaps: movelaps.map(ml => ({ ...ml, moveframeId: undefined }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to create moveframe');
      }

      const result = await response.json();
      console.log('✅ Moveframe created with movelaps:', result);

      // Call onSave to refresh data
      onSave(result);
      
    } catch (error) {
      console.error('Error creating moveframe:', error);
      alert('Error creating moveframe: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSave = () => {
    // Final validation before save (for basic form)
    if (!canSelectSport(moveframeData.sport)) {
      alert('Cannot add this sport: ' + getSportDisabledReason(moveframeData.sport));
      return;
    }
    
    onSave({
      ...moveframeData,
      workoutId
    });
  };
  
  const handleSportChange = (newSport: string) => {
    setSelectedSport(newSport);
    setMoveframeData({ ...moveframeData, sport: newSport });
  };
  
  const handleProceedToForm = () => {
    if (!canSelectSport(selectedSport)) {
      alert('Cannot add this sport: ' + getSportDisabledReason(selectedSport));
      return;
    }
    setShowSportSpecificForm(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Add Moveframe</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!showSportSpecificForm ? (
            <>
              {/* Sport Limits Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Sport Selection Rules:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Max 4 different sports per day (across all workouts)</li>
                      <li>Max 4 different sports per workout</li>
                      <li>Day sports: {getDaySports().length}/4 ({getDaySports().join(', ') || 'None'})</li>
                      <li>Workout sports: {getWorkoutSports().length}/4 ({getWorkoutSports().join(', ') || 'None'})</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-900">
                      <p className="font-semibold">Cannot use this sport:</p>
                      <p className="text-red-800">{validationError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sport Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sport *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SPORTS.map(sport => {
                    const isDisabled = !canSelectSport(sport);
                    const isSelected = selectedSport === sport;
                    const reason = getSportDisabledReason(sport);
                    
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => handleSportChange(sport)}
                        disabled={isDisabled && !isSelected}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                            : isDisabled
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                        }`}
                        title={isDisabled ? reason : `Select ${sport}`}
                      >
                        {sport.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedType('STANDARD')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedType === 'STANDARD'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Standard Mode
                  </button>
                  <button
                    onClick={() => setSelectedType('BATTERY')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedType === 'BATTERY'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Battery
                  </button>
                  <button
                    onClick={() => setSelectedType('ANNOTATION')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedType === 'ANNOTATION'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Annotation
                  </button>
                </div>
              </div>

              {/* Section Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Section *
                </label>
                {isLoadingSections ? (
                  <div className="text-sm text-gray-500">Loading sections...</div>
                ) : sections.length === 0 ? (
                  <div className="text-sm text-orange-600">No sections found. Default section will be created.</div>
                ) : (
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name} {section.description && `- ${section.description}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Next Letter Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Next Moveframe Letter:</span>
                  <span className="text-2xl font-bold text-blue-600">{getNextLetter()}</span>
                </div>
              </div>
            </>
          ) : (
            /* Sport-Specific Form */
            <>
              {selectedSport === 'SWIM' && (
                <SwimMoveframeForm
                  onSubmit={handleSportFormSubmit}
                  onCancel={() => setShowSportSpecificForm(false)}
                />
              )}
              
              {selectedSport === 'RUN' && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">RUN form coming soon...</p>
                  <button
                    onClick={() => setShowSportSpecificForm(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    ← Back to Sport Selection
                  </button>
                </div>
              )}
              
              {selectedSport === 'BIKE' && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">BIKE form coming soon...</p>
                  <button
                    onClick={() => setShowSportSpecificForm(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    ← Back to Sport Selection
                  </button>
                </div>
              )}
              
              {selectedSport === 'BODY_BUILDING' && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">BODY BUILDING form coming soon...</p>
                  <button
                    onClick={() => setShowSportSpecificForm(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    ← Back to Sport Selection
                  </button>
                </div>
              )}
              
              {/* Other sports - basic form for now */}
              {!['SWIM', 'RUN', 'BIKE', 'BODY_BUILDING'].includes(selectedSport) && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Sport-specific form for {selectedSport} coming soon...</p>
                  <button
                    onClick={() => setShowSportSpecificForm(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    ← Back to Sport Selection
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - Only show for selection screen */}
        {!showSportSpecificForm && (
          <div className="flex gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToForm}
              disabled={!selectedSectionId || validationError !== ''}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Next: Build Moveframe →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

