'use client';

import { useState } from 'react';
import { X, Plus, Edit, Trash2, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WorkoutSection {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface WorkoutSectionsModalProps {
  sections: WorkoutSection[];
  onClose: () => void;
  onSave: () => void;
}

export default function WorkoutSectionsModal({
  sections: initialSections,
  onClose,
  onSave
}: WorkoutSectionsModalProps) {
  const { t } = useLanguage();
  const [sections, setSections] = useState<WorkoutSection[]>(initialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#10B981'
  });

  const handleAdd = () => {
    setEditingId('new');
    setFormData({ name: '', description: '', color: '#10B981' });
  };

  const handleEdit = (section: WorkoutSection) => {
    setEditingId(section.id);
    setFormData({
      name: section.name,
      description: section.description,
      color: section.color
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingId === 'new') {
        const response = await fetch('/api/workouts/sections', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const data = await response.json();
          setSections([...sections, data.section]);
        }
      } else if (editingId) {
        const response = await fetch(`/api/workouts/sections/${editingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          setSections(sections.map(s => 
            s.id === editingId ? { ...s, ...formData } : s
          ));
        }
      }
      
      setEditingId(null);
      setFormData({ name: '', description: '', color: '#10B981' });
      onSave();
    } catch (error) {
      console.error('Error saving section:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('workout_confirm_delete_section'))) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/sections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setSections(sections.filter(s => s.id !== id));
        onSave();
      }
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {t('workout_sections_settings')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mb-4"
          >
            <Plus className="w-5 h-5" />
            <span>{t('workout_add_section')}</span>
          </button>

          {/* Edit Form */}
          {editingId && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-green-500">
              <h3 className="text-lg font-semibold mb-4">
                {editingId === 'new' ? t('workout_new_section') : t('workout_edit_section')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_section_name')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('workout_section_name_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_section_description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder={t('workout_section_desc_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_section_color')}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="#10B981"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('workout_save')}</span>
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    {t('workout_cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sections List */}
          <div className="space-y-3">
            {sections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('workout_no_sections')}
              </div>
            ) : (
              sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition"
                >
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: section.color }}
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{section.name}</h4>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(section)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            {t('workout_close')}
          </button>
        </div>
      </div>
    </div>
  );
}

