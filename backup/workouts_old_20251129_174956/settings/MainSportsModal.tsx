'use client';

import { useState, useEffect } from 'react';
import { X, GripVertical, Save, Image as ImageIcon, Smile } from 'lucide-react';
import { SportType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface MainSportsModalProps {
  mainSports: SportType[];
  onClose: () => void;
  onSave: () => void;
}

const ALL_SPORTS: SportType[] = [
  SportType.SWIM,
  SportType.BIKE,
  SportType.RUN,
  SportType.BODY_BUILDING,
  SportType.ROWING,
  SportType.SKATE,
  SportType.GYMNASTIC,
  SportType.STRETCHING,
  SportType.PILATES,
  SportType.SKI,
  SportType.TECHNICAL_MOVES,
  SportType.FREE_MOVES
];

type IconType = 'emoji' | 'bw_icons';

export default function MainSportsModal({
  mainSports: initialMainSports,
  onClose,
  onSave
}: MainSportsModalProps) {
  const { t } = useLanguage();
  const [mainSports, setMainSports] = useState<SportType[]>(initialMainSports);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [iconType, setIconType] = useState<IconType>('emoji');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Load icon type preference from settings
  useEffect(() => {
    const loadIconTypePreference = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const settings = await response.json();
          setIconType(settings.sportIconType || 'emoji');
        }
      } catch (error) {
        console.error('Error loading icon type preference:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    
    loadIconTypePreference();
  }, []);

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

  const handleIconTypeChange = async (newType: IconType) => {
    setIconType(newType);
    
    // Save to user settings
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sportIconType: newType })
      });
    } catch (error) {
      console.error('Error saving icon type preference:', error);
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

  // Map sport types to icon filenames in public/icons
  const getSportIconFilename = (sport: SportType): string => {
    const iconMap: Record<SportType, string> = {
      SWIM: 'swimming.jpg',
      BIKE: 'cycling.jpg',
      RUN: 'running.jpg',
      BODY_BUILDING: 'weights.jpg',
      ROWING: 'rowing.jpg',
      SKATE: 'skating.jpg',
      GYMNASTIC: 'gymnastics.jpg',
      STRETCHING: 'stretching.jpg',
      PILATES: 'pilaters.jpg',
      SKI: 'skiing.jpg',
      TECHNICAL_MOVES: 'Technical/technical.jpg',
      FREE_MOVES: 'freestyle_wrestling.jpg'
    };
    return iconMap[sport] || 'running.jpg';
  };

  const getSportEmoji = (sport: SportType): string => {
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

  const renderSportIcon = (sport: SportType) => {
    if (iconType === 'emoji') {
      return <span className="text-2xl">{getSportEmoji(sport)}</span>;
    } else {
      return (
        <img 
          src={`/icons/${getSportIconFilename(sport)}`} 
          alt={sport}
          className="w-8 h-8 object-cover rounded"
        />
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('workout_main_sports_settings')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('workout_main_sports_desc')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X className="w-5 h-5 dark:text-gray-300" />
          </button>
        </div>

        {/* Icon Type Selector */}
        <div className="px-6 pt-6 pb-4 border-b dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('workout_icon_type_preference')}
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleIconTypeChange('emoji')}
              disabled={isLoadingSettings}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                iconType === 'emoji'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <Smile className="w-5 h-5" />
              <span className="font-medium">{t('workout_colored_icons')}</span>
              <span className="text-xl ml-1">🏊🚴🏃</span>
            </button>
            
            <button
              onClick={() => handleIconTypeChange('bw_icons')}
              disabled={isLoadingSettings}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                iconType === 'bw_icons'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="font-medium">{t('workout_bw_icons')}</span>
              <div className="flex gap-1 ml-1">
                <img src="/icons/swimming.jpg" alt="" className="w-6 h-6 rounded" />
                <img src="/icons/cycling.jpg" alt="" className="w-6 h-6 rounded" />
                <img src="/icons/running.jpg" alt="" className="w-6 h-6 rounded" />
              </div>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {iconType === 'emoji' 
              ? t('workout_icon_type_emoji_desc') 
              : t('workout_icon_type_bw_desc')
            }
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Selected Sports - Draggable */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
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
                  className={`flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-lg cursor-move transition ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  {renderSportIcon(sport)}
                  <span className="flex-1 font-medium text-gray-800 dark:text-gray-200">
                    {t(`sport_${sport.toLowerCase()}`)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">#{index + 1}</span>
                  <button
                    onClick={() => toggleSport(sport)}
                    className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                  >
                    {t('workout_remove')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Sports */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              {t('workout_available_sports')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {ALL_SPORTS.filter(sport => !mainSports.includes(sport)).map((sport) => (
                <button
                  key={sport}
                  onClick={() => toggleSport(sport)}
                  className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  {renderSportIcon(sport)}
                  <span className="flex-1 text-left font-medium text-gray-700 dark:text-gray-300">
                    {t(`sport_${sport.toLowerCase()}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
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

