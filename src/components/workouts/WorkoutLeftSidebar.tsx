'use client';

import { useState } from 'react';
import { 
  Calendar,
  CalendarCheck,
  CheckSquare,
  Archive,
  Settings,
  Palette,
  ListOrdered,
  Globe,
  ChevronRight,
  ChevronDown,
  Download
} from 'lucide-react';
import { SportType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import PeriodsSettingsModal from './settings/PeriodsSettingsModal';
import WorkoutSectionsModal from './settings/WorkoutSectionsModal';
import MainSportsModal from './settings/MainSportsModal';

interface WorkoutLeftSidebarProps {
  activeSection: 'A' | 'B' | 'C' | 'D';
  onSectionChange: (section: 'A' | 'B' | 'C' | 'D') => void;
  periods: any[];
  workoutSections: any[];
  mainSports: SportType[];
  onSettingsChange: () => void;
  onImportFromCoach?: () => void;
  userType?: string;
}

export default function WorkoutLeftSidebar({
  activeSection,
  onSectionChange,
  periods,
  workoutSections,
  mainSports,
  onSettingsChange,
  onImportFromCoach,
  userType = 'ATHLETE'
}: WorkoutLeftSidebarProps) {
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [showPeriodsModal, setShowPeriodsModal] = useState(false);
  const [showSectionsModal, setShowSectionsModal] = useState(false);
  const [showSportsModal, setShowSportsModal] = useState(false);

  return (
    <>
      <div className="w-80 bg-gray-800 text-white flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Workout Menu</h2>
        </div>

        {/* Workout Sections */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
            Workout Sections
          </h3>
          
          <button
            onClick={() => onSectionChange('A')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeSection === 'A' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Section A: Current Microcycle</div>
              <div className="text-xs opacity-75">3 Weeks View</div>
            </div>
          </button>

          <button
            onClick={() => onSectionChange('B')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeSection === 'B' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <CalendarCheck className="w-5 h-5" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Section B: Yearly Plan</div>
              <div className="text-xs opacity-75">Full Year View</div>
            </div>
          </button>

          <button
            onClick={() => onSectionChange('C')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeSection === 'C' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Section C: Workouts Done</div>
              <div className="text-xs opacity-75">Training Diary</div>
            </div>
          </button>

          <button
            onClick={() => onSectionChange('D')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeSection === 'D' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Archive className="w-5 h-5" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Section D: Archive</div>
              <div className="text-xs opacity-75">Workout Templates</div>
            </div>
          </button>
        </div>

        {/* Import from Coach (Athletes Only) */}
        {userType === 'ATHLETE' && onImportFromCoach && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={onImportFromCoach}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Import from Coach</div>
                <div className="text-xs opacity-90">Browse coach's workouts</div>
              </div>
            </button>
          </div>
        )}

        {/* Settings Section */}
        <div className="mt-4 border-t border-gray-700">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <span className="font-semibold">{t('workout_settings_title')}</span>
            </div>
            {showSettings ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {showSettings && (
            <div className="bg-gray-900 py-2">
              <button
                onClick={() => setShowPeriodsModal(true)}
                className="w-full flex items-center gap-3 px-8 py-2 hover:bg-gray-700 transition text-sm"
              >
                <Palette className="w-4 h-4" />
                <span>Periods</span>
                <span className="ml-auto text-xs text-gray-400">
                  ({periods.length})
                </span>
              </button>

              <button
                onClick={() => setShowSectionsModal(true)}
                className="w-full flex items-center gap-3 px-8 py-2 hover:bg-gray-700 transition text-sm"
              >
                <ListOrdered className="w-4 h-4" />
                <span>Workout Sections</span>
                <span className="ml-auto text-xs text-gray-400">
                  ({workoutSections.length})
                </span>
              </button>

              <button
                onClick={() => setShowSportsModal(true)}
                className="w-full flex items-center gap-3 px-8 py-2 hover:bg-gray-700 transition text-sm"
              >
                <Globe className="w-4 h-4" />
                <span>Main Sports</span>
                <span className="ml-auto text-xs text-gray-400">
                  ({mainSports.length})
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-auto p-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
            {t('workout_status_legend')}
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <span>{t('workout_status_not_planned')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>{t('workout_status_planned_future')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span>{t('workout_status_planned_next')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>{t('workout_status_planned_current')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>{t('workout_status_done_differently')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 rounded-full"></div>
              <span>{t('workout_status_done_less')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{t('workout_status_done_more')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPeriodsModal && (
        <PeriodsSettingsModal
          periods={periods}
          onClose={() => setShowPeriodsModal(false)}
          onSave={onSettingsChange}
        />
      )}

      {showSectionsModal && (
        <WorkoutSectionsModal
          sections={workoutSections}
          onClose={() => setShowSectionsModal(false)}
          onSave={onSettingsChange}
        />
      )}

      {showSportsModal && (
        <MainSportsModal
          mainSports={mainSports}
          onClose={() => setShowSportsModal(false)}
          onSave={onSettingsChange}
        />
      )}
    </>
  );
}

