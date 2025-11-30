'use client';

import { useState, useEffect } from 'react';
import { X, Search, Calendar, Download, Users, TrendingUp } from 'lucide-react';

interface Coach {
  id: string;
  name: string;
  email: string;
  userType: string;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  sports: string | null;
  totalDistance: number | null;
  totalDuration: number | null;
  timesUsed: number;
  templateType: string;
}

interface ImportFromCoachModalProps {
  onClose: () => void;
  onImport: () => void;
  targetDayId: string | null;
}

export default function ImportFromCoachModal({
  onClose,
  onImport,
  targetDayId
}: ImportFromCoachModalProps) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadCoaches();
  }, []);

  useEffect(() => {
    if (selectedCoachId) {
      loadTemplates(selectedCoachId);
    }
  }, [selectedCoachId]);

  const loadCoaches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/athlete/coaches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCoaches(data.coaches || []);
        if (data.coaches && data.coaches.length > 0) {
          setSelectedCoachId(data.coaches[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading coaches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async (coachId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/athlete/coaches/${coachId}/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleApply = async () => {
    if (!selectedTemplate || !targetDayId) {
      alert('Please select a template and a target day');
      return;
    }

    setIsApplying(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/templates/${selectedTemplate.id}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetDayId })
      });

      if (response.ok) {
        alert('Workout imported successfully!');
        onImport();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to import workout');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Failed to import workout');
    } finally {
      setIsApplying(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (template.category && template.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCoach = coaches.find(c => c.id === selectedCoachId);

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6" />
              Import from Coach
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              Browse and import workouts shared by your coaches
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : coaches.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Coaches Yet</h3>
              <p className="text-gray-600">
                You don't have any coaches assigned. Ask your coach to add you to their roster.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Coach Selector + Search */}
            <div className="px-6 py-4 border-b bg-gray-50 space-y-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Coach
                  </label>
                  <select
                    value={selectedCoachId || ''}
                    onChange={(e) => setSelectedCoachId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {coaches.map(coach => (
                      <option key={coach.id} value={coach.id}>
                        {coach.name} ({coach.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Workouts
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search workouts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {selectedCoach && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Viewing workouts from <span className="font-medium text-purple-700">{selectedCoach.name}</span></span>
                </div>
              )}
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-auto p-6">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workouts Available</h3>
                  <p className="text-gray-600">
                    Your coach hasn't shared any workouts yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        selectedTemplate?.id === template.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{template.name}</h4>
                        {template.difficulty && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty}
                          </span>
                        )}
                      </div>

                      {template.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {template.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {template.category}
                          </span>
                        )}
                        {template.sports && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {template.sports}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {template.totalDistance && (
                          <span>📏 {template.totalDistance}m</span>
                        )}
                        {template.totalDuration && (
                          <span>⏱️ {template.totalDuration}min</span>
                        )}
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Used {template.timesUsed} times
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <div>
                {!targetDayId && (
                  <p className="text-sm text-orange-600 flex items-center gap-2">
                    ⚠️ Please select a day in the workout grid first
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!selectedTemplate || !targetDayId || isApplying}
                  className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    selectedTemplate && targetDayId && !isApplying
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {isApplying ? 'Importing...' : 'Import to Day'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

