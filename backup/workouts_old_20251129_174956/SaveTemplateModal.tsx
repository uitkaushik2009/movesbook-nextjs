'use client';

import { useState, useEffect } from 'react';
import { X, Save, Tag, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SaveTemplateModalProps {
  onClose: () => void;
  onSave: () => void;
  sourceType: 'workout' | 'day';
  sourceData: any; // workout or day data to save as template
}

export default function SaveTemplateModal({
  onClose,
  onSave,
  sourceType,
  sourceData
}: SaveTemplateModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill some data from source
  useEffect(() => {
    if (sourceType === 'workout' && sourceData) {
      setName(sourceData.name || 'Untitled Workout');
      setDescription(sourceData.notes || '');
      
      // Determine category from moveframes' sports
      if (sourceData.moveframes && sourceData.moveframes.length > 0) {
        const sports = Array.from(new Set(sourceData.moveframes.map((mf: any) => mf.sport))) as string[];
        if (sports.length === 1) {
          setCategory(sports[0]);
        } else {
          setCategory('Mixed');
        }
      }
    } else if (sourceType === 'day' && sourceData) {
      const date = new Date(sourceData.date);
      setName(`Day ${date.toLocaleDateString()}`);
      setDescription(`${sourceData.workouts?.length || 0} workout${sourceData.workouts?.length !== 1 ? 's' : ''}`);
      setCategory('Mixed');
    }
  }, [sourceType, sourceData]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      // Build template data
      const templateData: any = {};
      let sports = '';
      let totalDistance = 0;
      let totalDuration = 0;

      if (sourceType === 'workout') {
        // Save single workout
        templateData.name = sourceData.name;
        templateData.code = sourceData.code;
        templateData.time = sourceData.time;
        templateData.location = sourceData.location;
        templateData.surface = sourceData.surface;
        templateData.heartRateMax = sourceData.heartRateMax;
        templateData.heartRateAvg = sourceData.heartRateAvg;
        templateData.calories = sourceData.calories;
        templateData.feelingStatus = sourceData.feelingStatus;
        templateData.notes = sourceData.notes;
        templateData.status = sourceData.status;
        
        // Include moveframes and movelaps
        templateData.moveframes = sourceData.moveframes || [];
        
        // Calculate metadata
        const sportsSet = new Set();
        sourceData.moveframes?.forEach((mf: any) => {
          sportsSet.add(mf.sport);
          mf.movelaps?.forEach((lap: any) => {
            totalDistance += lap.distance || 0;
          });
        });
        sports = Array.from(sportsSet).join(', ');

      } else if (sourceType === 'day') {
        // Save full day
        templateData.workouts = [];
        
        const sportsSet = new Set();
        sourceData.workouts?.forEach((workout: any) => {
          const workoutData: any = {
            name: workout.name,
            code: workout.code,
            time: workout.time,
            location: workout.location,
            surface: workout.surface,
            heartRateMax: workout.heartRateMax,
            heartRateAvg: workout.heartRateAvg,
            calories: workout.calories,
            feelingStatus: workout.feelingStatus,
            notes: workout.notes,
            status: workout.status,
            moveframes: workout.moveframes || []
          };
          
          workout.moveframes?.forEach((mf: any) => {
            sportsSet.add(mf.sport);
            mf.movelaps?.forEach((lap: any) => {
              totalDistance += lap.distance || 0;
            });
          });
          
          templateData.workouts.push(workoutData);
        });
        
        sports = Array.from(sportsSet).join(', ');
      }

      // Create template
      const response = await fetch('/api/workouts/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          category: category || null,
          tags: tags.length > 0 ? tags : null,
          templateType: sourceType,
          templateData,
          sports: sports || null,
          totalDistance: totalDistance > 0 ? totalDistance : null,
          totalDuration: totalDuration > 0 ? totalDuration : null,
          difficulty: difficulty || null
        })
      });

      if (response.ok) {
        alert('Template saved successfully!');
        onSave();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Save as Template
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Save this {sourceType} to your archive for future use
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Morning Swim Session"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe this workout template..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              <option value="Swim">Swimming</option>
              <option value="Bike">Cycling</option>
              <option value="Run">Running</option>
              <option value="Strength">Strength Training</option>
              <option value="Rowing">Rowing</option>
              <option value="Mixed">Mixed / Multi-Sport</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
              <option value="extreme">Extreme</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (for easier search)
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type a tag and press Enter"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                  Add
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What gets saved:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                {sourceType === 'workout' ? (
                  <>
                    <li>All moveframes and movelaps</li>
                    <li>Workout info (name, time, location, etc.)</li>
                    <li>Sport-specific settings</li>
                  </>
                ) : (
                  <>
                    <li>All workouts from this day</li>
                    <li>All moveframes and movelaps</li>
                    <li>Day and workout metadata</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
              isSaving || !name.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

