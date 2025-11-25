'use client';

import { useState } from 'react';
import { X, Plus, Edit, Trash2, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Period {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface PeriodsSettingsModalProps {
  periods: Period[];
  onClose: () => void;
  onSave: () => void;
}

export default function PeriodsSettingsModal({
  periods: initialPeriods,
  onClose,
  onSave
}: PeriodsSettingsModalProps) {
  const { t } = useLanguage();
  const [periods, setPeriods] = useState<Period[]>(initialPeriods);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const handleAdd = () => {
    setEditingId('new');
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  const handleEdit = (period: Period) => {
    setEditingId(period.id);
    setFormData({
      name: period.name,
      description: period.description,
      color: period.color
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingId === 'new') {
        // Create new period
        const response = await fetch('/api/workouts/periods', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const data = await response.json();
          setPeriods([...periods, data.period]);
        }
      } else if (editingId) {
        // Update existing period
        const response = await fetch(`/api/workouts/periods/${editingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          setPeriods(periods.map(p => 
            p.id === editingId ? { ...p, ...formData } : p
          ));
        }
      }
      
      setEditingId(null);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      onSave();
    } catch (error) {
      console.error('Error saving period:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('workout_confirm_delete_period'))) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/periods/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setPeriods(periods.filter(p => p.id !== id));
        onSave();
      }
    } catch (error) {
      console.error('Error deleting period:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {t('workout_periods_settings')}
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
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-4"
          >
            <Plus className="w-5 h-5" />
            <span>{t('workout_add_period')}</span>
          </button>

          {/* Edit Form */}
          {editingId && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-blue-500">
              <h3 className="text-lg font-semibold mb-4">
                {editingId === 'new' ? t('workout_new_period') : t('workout_edit_period')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_period_name')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('workout_period_name_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_period_description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder={t('workout_period_desc_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workout_period_color')}
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
                      placeholder="#3B82F6"
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

          {/* Periods List */}
          <div className="space-y-3">
            {periods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('workout_no_periods')}
              </div>
            ) : (
              periods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition"
                >
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: period.color }}
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{period.name}</h4>
                    <p className="text-sm text-gray-600">{period.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(period)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(period.id)}
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

