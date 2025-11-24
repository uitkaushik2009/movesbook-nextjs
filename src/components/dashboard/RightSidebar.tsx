'use client';

import { useState } from 'react';
import { Users, Target, ChevronRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RightSidebarProps {
  onAddMember: () => void;
  workoutPlanLabel?: string;
  onWorkoutPlan?: () => void;
}

export default function RightSidebar({ 
  onAddMember, 
  workoutPlanLabel,
  onWorkoutPlan 
}: RightSidebarProps) {
  const { t } = useLanguage();
  const [activeRightTab, setActiveRightTab] = useState<'actions-planner' | 'chat-panel'>('actions-planner');
  const [expandedActionsPlanner, setExpandedActionsPlanner] = useState(true);

  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm border p-4 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sidebar_quick_actions')}</h3>
        <div className="space-y-3">
          <button 
            onClick={onAddMember}
            className="w-full flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
          >
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{t('sidebar_add_member')}</span>
            <Users className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
          </button>
          {onWorkoutPlan && (
            <button 
              onClick={onWorkoutPlan}
              className="w-full flex items-center justify-between p-4 border-2 border-dashed border-green-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">{workoutPlanLabel || t('sidebar_workout_plan')}</span>
              <Target className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
            </button>
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

