'use client';

import { useState, useEffect } from 'react';
import { X, Search, Filter, Calendar, Dumbbell, Tag, TrendingUp, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArchiveModalProps {
  onClose: () => void;
  onApplyTemplate: (templateId: string) => void;
  targetDayId: string | null;
}

export default function ArchiveModal({
  onClose,
  onApplyTemplate,
  targetDayId
}: ArchiveModalProps) {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory, selectedType]);

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.templateType === selectedType);
    }

    setFilteredTemplates(filtered);
  };

  const handleApplyTemplate = async (templateId: string) => {
    if (!targetDayId) {
      alert('Please select a day first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/templates/${templateId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetDayId })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Template applied successfully!');
        onApplyTemplate(templateId);
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Failed to apply template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/templates/${templateId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId));
        alert('Template deleted successfully!');
      } else {
        alert('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'swim': return '🏊';
      case 'bike': return '🚴';
      case 'run': return '🏃';
      case 'strength': return '💪';
      case 'mixed': return '🏋️';
      default: return '🎯';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-orange-100 text-orange-700';
      case 'extreme': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Workout Archive
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Swim">Swimming</option>
              <option value="Bike">Cycling</option>
              <option value="Run">Running</option>
              <option value="Strength">Strength</option>
              <option value="Mixed">Mixed</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="workout">Single Workout</option>
              <option value="day">Full Day</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading templates...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Dumbbell className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {templates.length === 0 ? 'No templates yet' : 'No matching templates'}
              </h3>
              <p className="text-gray-500 mb-4">
                {templates.length === 0 
                  ? 'Create your first workout template by saving a workout from the grid'
                  : 'Try adjusting your search or filters'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
                  onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                >
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800 line-clamp-1">
                          {template.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {template.templateType === 'workout' ? 'Single Workout' : 'Full Day'}
                        </span>
                      </div>
                    </div>
                    {template.difficulty && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="space-y-2 mb-3">
                    {template.sports && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Tag className="w-3 h-3" />
                        <span>{template.sports}</span>
                      </div>
                    )}
                    {template.totalDistance && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{template.totalDistance}m</span>
                      </div>
                    )}
                    {template.totalDuration && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{template.totalDuration} min</span>
                      </div>
                    )}
                    {template.timesUsed > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>Used {template.timesUsed} time{template.timesUsed !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {selectedTemplate?.id === template.id && (
                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTemplate(template.id);
                        }}
                        disabled={!targetDayId}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                          targetDayId
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Apply
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded text-sm font-medium hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!targetDayId && (
          <div className="p-4 border-t bg-yellow-50">
            <p className="text-sm text-yellow-800 text-center">
              ⚠️ Please select a day in the workout grid before applying a template
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

