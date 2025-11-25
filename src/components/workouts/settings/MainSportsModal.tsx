'use client';

import { useState } from 'react';
import { X, GripVertical, Save } from 'lucide-react';
import { SportType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface MainSportsModalProps {
  mainSports: SportType[];
  onClose: () => void;
  onSave: () => void;
}

const ALL_SPORTS: SportType[] = [
  'SWIM',
  'BIKE',
  'RUN',
  'BODY_BUILDING',
  'ROWING',
  'SKATE',
  'GYMNASTIC',
  'STRETCHING',
  'PILATES',
  'SKI',
  'TECHNICAL_MOVES',
  'FREE_MOVES'
];

export default function MainSportsModal({
  mainSports: initialMainSports,
  onClose,
  onSave
}: MainSportsModalProps) {
  const { t } = useLanguage();
  const [mainSports, setMainSports] = useState<SportType[]>(initialMainSports);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSports = [...mainSports];
    const draggedSport = newSports[draggedIndex];
    newSports.splice(draggedIndex, 1);
    newSports.splice(index, 0, draggedSport);
    
    setMainSports(newSports);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const toggleSport = (sport: SportType) => {
    if (mainSports.includes(sport)) {
      setMainSports(mainSports.filter(s => s !== sport));
    } else {
      setMainSports([...mainSports, sport]);
    }
  };

  const handleSaveOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts/main-sports', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sports: mainSports })
      });
      
      if (response.ok) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving main sports order:', error);
    }
  };

  const getSportIcon = (sport: SportType): string => {
    switch (sport) {
      case 'SWIM': return '🏊';
      case 'BIKE': return '🚴';
      case 'RUN': return '🏃';
      case 'BODY_BUILDING': return '💪';
      case 'ROWING': return '🚣';
      case 'SKATE': return '⛸️';
      case 'GYMNASTIC': return '🤸';
      case 'STRETCHING': return '🧘';
      case 'PILATES': return '🧘';
      case 'SKI': return '⛷️';
      case 'TECHNICAL_MOVES': return '🎯';
      case 'FREE_MOVES': return '🎪';
      default: return '🏃';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {t('workout_main_sports_settings')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('workout_main_sports_desc')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Selected Sports - Draggable */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {t('workout_selected_sports')} ({mainSports.length})
            </h3>
            <div className="space-y-2">
              {mainSports.map((sport, index) => (
                <div
                  key={sport}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-move transition ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl">{getSportIcon(sport)}</span>
                  <span className="flex-1 font-medium text-gray-800">
                    {t(`sport_${sport.toLowerCase()}`)}
                  </span>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                  <button
                    onClick={() => toggleSport(sport)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                  >
                    {t('workout_remove')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Sports */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {t('workout_available_sports')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {ALL_SPORTS.filter(sport => !mainSports.includes(sport)).map((sport) => (
                <button
                  key={sport}
                  onClick={() => toggleSport(sport)}
                  className="flex items-center gap-3 p-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                >
                  <span className="text-2xl">{getSportIcon(sport)}</span>
                  <span className="flex-1 text-left font-medium text-gray-700">
                    {t(`sport_${sport.toLowerCase()}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
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
            onClick={handleSaveOrder}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Save className="w-4 h-4" />
            <span>{t('workout_save_order')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

