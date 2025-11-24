'use client';

import { useState } from 'react';
import { 
  Users, 
  Target, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  Save,
  Archive,
  FolderOpen
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RightSidebarProps {
  onAddMember: () => void;
  workoutPlanLabel?: string;
  onWorkoutPlan?: () => void;
  context?: 'my-page' | 'my-club';
  activeTab?: 'my-page' | 'my-entity';
}

export default function RightSidebar({ 
  onAddMember, 
  workoutPlanLabel,
  onWorkoutPlan,
  context = 'my-page',
  activeTab
}: RightSidebarProps) {
  const { t } = useLanguage();
  const [activeRightTab, setActiveRightTab] = useState<'actions-planner' | 'chat-panel'>('actions-planner');
  const [expandedActionsPlanner, setExpandedActionsPlanner] = useState(true);
  
  // If activeTab is provided, use it; otherwise use context
  const currentContext = activeTab ? (activeTab === 'my-page' ? 'my-page' : 'my-club') : context;

  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm border p-4 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sidebar_quick_actions')}</h3>
        <div className="space-y-2">
          {/* Add Member Button */}
          <button 
            onClick={onAddMember}
            className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
          >
            <Users className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-left">{t('sidebar_add_member')}</span>
          </button>
          
          {/* Quick Actions for My Page */}
          {currentContext === 'my-page' && (
            <>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                <Calendar className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-left">{t('sidebar_plan_new_workout')}</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                <CalendarDays className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-left">{t('sidebar_plan_3_weeks')}</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                <CalendarCheck className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-left">{t('sidebar_plan_of_year')}</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                <CheckSquare className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-left">{t('sidebar_log_completed')}</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                <Save className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-left">{t('sidebar_save_session')}</span>
              </button>
            </>
          )}
          
          {/* Quick Actions for My Club */}
          {currentContext === 'my-club' && (
            <>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                <Calendar className="w-5 h-5 text-gray-400 group-hover:text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 text-left">{t('sidebar_plan_new_workout')}</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                <Archive className="w-5 h-5 text-gray-400 group-hover:text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 text-left">{t('sidebar_archive_workouts')}</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                <CalendarDays className="w-5 h-5 text-gray-400 group-hover:text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 text-left">{t('sidebar_plan_microcycles')}</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                <FolderOpen className="w-5 h-5 text-gray-400 group-hover:text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 text-left">{t('sidebar_open_workout_plans')}</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                <CheckSquare className="w-5 h-5 text-gray-400 group-hover:text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 text-left">{t('sidebar_open_completed_sessions')}</span>
              </button>
            </>
          )}
        </div>

        {/* Actions Planner and Chat Panel Tabs */}
        <div className="mt-6">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveRightTab('actions-planner')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeRightTab === 'actions-planner'
                  ? 'bg-gray-100 text-gray-900 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('sidebar_actions_planner')}
            </button>
            <button
              onClick={() => setActiveRightTab('chat-panel')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeRightTab === 'chat-panel'
                  ? 'bg-gray-100 text-gray-900 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('sidebar_chat_panel')}
            </button>
          </div>

          {/* Actions Planner Content */}
          {activeRightTab === 'actions-planner' && (
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <span>{t('sidebar_timeline_all_users')}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <span>{t('sidebar_timeline_user')}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <span>{t('sidebar_actions_planned')}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <span>{t('sidebar_users_action_planner')}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button 
                onClick={() => setExpandedActionsPlanner(!expandedActionsPlanner)}
                className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span>{t('sidebar_settings')}</span>
                {expandedActionsPlanner ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedActionsPlanner && (
                <div className="ml-4 space-y-1">
                  <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <span>{t('sidebar_preset_timelines')}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <span>{t('sidebar_actions_settings')}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <span>{t('sidebar_action_settings_mb')}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat Panel Content */}
          {activeRightTab === 'chat-panel' && (
            <div className="text-sm text-gray-600 py-4">
              {t('sidebar_chat_content')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

