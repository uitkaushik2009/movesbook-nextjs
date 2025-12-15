import React from 'react';
import { Calendar, Download, Table, Plus, X } from 'lucide-react';
import type { SectionId, ViewMode } from '@/types/workout.types';

interface WorkoutSectionHeaderProps {
  // State
  activeSection: SectionId;
  viewMode: ViewMode;
  selectedWeekForTable: number | null;
  virtualStartDate: Date | null;
  userType?: string;
  selectedAthlete: any;
  
  // Actions
  onSectionChange: (section: SectionId) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onImportClick: () => void;
  onStartDateClick: () => void;
  onAthleteSelect: () => void;
  onWeekFilterClear: () => void;
  onClose: () => void;
}

export default function WorkoutSectionHeader({
  activeSection,
  viewMode,
  selectedWeekForTable,
  virtualStartDate,
  userType,
  selectedAthlete,
  onSectionChange,
  onViewModeChange,
  onImportClick,
  onStartDateClick,
  onAthleteSelect,
  onWeekFilterClear,
  onClose
}: WorkoutSectionHeaderProps) {
  
  // Section labels
  const getSectionLabel = (section: SectionId): string => {
    switch (section) {
      case 'A': return '2-3 Weeks';
      case 'B': return 'Year';
      case 'C': return 'Done';
      case 'D': return 'Archive';
      default: return '';
    }
  };
  
  // Section title
  const getSectionTitle = (section: SectionId): string => {
    switch (section) {
      case 'A': return 'Current 2-3 Weeks';
      case 'B': return 'Yearly Plan';
      case 'C': return 'Workouts Done';
      case 'D': return 'Archive & Templates';
      default: return '';
    }
  };
  
  return (
    <>
      {/* Top Close Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Workout Management</h1>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Close workout section"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Section Tabs */}
      <div className="bg-white border-b border-gray-300 px-2 py-2">
        <div className="flex items-center gap-2">
          {/* Section Tabs */}
          {(['A', 'B', 'C', 'D'] as SectionId[]).map((section) => (
            <button
              key={section}
              onClick={() => onSectionChange(section)}
              className={`px-4 py-2 rounded-t font-semibold text-sm transition-colors ${
                activeSection === section 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sec {section}: {getSectionLabel(section)}
            </button>
          ))}
          
          {/* Import Button - Only for sections A & B */}
          {(activeSection === 'A' || activeSection === 'B') && (
            <button
              onClick={onImportClick}
              className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Import from Coach/Team/Club
            </button>
          )}
        </div>
      </div>

      {/* Sub-Header: Title + Actions */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {getSectionTitle(activeSection)}
          </h2>
          
          <div className="flex gap-2 items-center">
            {/* Virtual Start Date for Sections B & C */}
            {(activeSection === 'B' || activeSection === 'C') && (
              <button 
                onClick={onStartDateClick}
                className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {virtualStartDate ? `Start: ${virtualStartDate.toLocaleDateString()}` : 'Set Virtual Start Date'}
              </button>
            )}
            
            {/* Athlete Selector for Section C (Coaches/Teams/Clubs only) */}
            {activeSection === 'C' && userType && ['COACH', 'TEAM', 'CLUB', 'TEAM_MANAGER', 'CLUB_TRAINER'].includes(userType) && (
              <button 
                onClick={onAthleteSelect}
                className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {selectedAthlete ? `Viewing: ${selectedAthlete.name}` : 'Select Athlete'}
              </button>
            )}
            
            {/* View Toggle */}
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Table className="w-4 h-4" />
              Table
            </button>
            
            {/* Calendar view only for Section B */}
            {activeSection === 'B' && (
              <button
                onClick={() => onViewModeChange('calendar')}
                className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Week Context Header - Show when viewing filtered weeks */}
      {selectedWeekForTable && viewMode === 'table' && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              Viewing: Week {selectedWeekForTable - 1} - Week {selectedWeekForTable} - Week {selectedWeekForTable + 1}
            </span>
            <span className="text-sm text-blue-700">(3 weeks context)</span>
          </div>
          <button
            onClick={onWeekFilterClear}
            className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            ← Back to Calendar
          </button>
        </div>
      )}
    </>
  );
}

