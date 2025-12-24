import React from 'react';
import { Calendar, Download, Table, Plus, X, List, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SectionId, ViewMode } from '@/types/workout.types';

interface WorkoutSectionHeaderProps {
  // State
  activeSection: SectionId;
  viewMode: ViewMode;
  selectedWeekForTable: number | null;
  virtualStartDate: Date | null;
  userType?: string;
  selectedAthlete: any;
  canAddDay?: boolean; // Whether adding a day is allowed (checks 7-day limit for Section A)
  weeksPerPage?: number; // For Section B pagination
  currentPageStart?: number; // Starting week number for current page
  totalWeeks?: number; // Total weeks in the plan
  
  // Actions
  onSectionChange: (section: SectionId) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onImportClick: () => void;
  onStartDateClick: () => void;
  onAthleteSelect: () => void;
  onWeekFilterClear: () => void;
  onAddDay: () => void;
  onCreatePlan?: () => void; // For Section B: Create yearly plan button
  onClose: () => void;
  onWeeksPerPageChange?: (weeks: number) => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

export default function WorkoutSectionHeader({
  activeSection,
  viewMode,
  selectedWeekForTable,
  virtualStartDate,
  userType,
  selectedAthlete,
  canAddDay = true,
  weeksPerPage = 3,
  currentPageStart = 1,
  totalWeeks = 0,
  onSectionChange,
  onViewModeChange,
  onImportClick,
  onStartDateClick,
  onAthleteSelect,
  onWeekFilterClear,
  onAddDay,
  onCreatePlan,
  onClose,
  onWeeksPerPageChange,
  onPrevPage,
  onNextPage
}: WorkoutSectionHeaderProps) {
  
  // Section labels
  const getSectionLabel = (section: SectionId): string => {
    switch (section) {
      case 'A': return '3 Weeks Plan';
      case 'B': return 'Year';
      case 'C': return 'Done';
      case 'D': return 'Archive';
      default: return '';
    }
  };
  
  // Section title
  const getSectionTitle = (section: SectionId): string => {
    switch (section) {
      case 'A': return '3 Weeks Plan';
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
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
              {getSectionTitle(activeSection)}
            </h2>
            {/* Status Badge */}
            {activeSection === 'B' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-300">
                📋 PLANNED
              </span>
            )}
            {activeSection === 'C' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-300">
                ✅ COMPLETED
              </span>
            )}
            {activeSection === 'A' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-300">
                📝 DRAFT
              </span>
            )}
          </div>
          
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
            
            {/* Add Day Button - Available for sections A & C */}
            {(activeSection === 'A' || activeSection === 'C') && (
              <button
                onClick={onAddDay}
                disabled={!canAddDay}
                className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors ${
                  canAddDay 
                    ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={!canAddDay && activeSection === 'A' ? 'All weeks are full (7 days each)' : 'Add a new day'}
              >
                <Plus className="w-4 h-4" />
                Add Day
              </button>
            )}
            
            {/* Create Plan Button - Only for Section B */}
            {activeSection === 'B' && onCreatePlan && (
              <button
                onClick={onCreatePlan}
                className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded text-sm font-medium flex items-center gap-2 transition-colors"
                title="Create yearly plan from start date"
              >
                <Plus className="w-4 h-4" />
                Create Plan
              </button>
            )}
            
            {/* Import Button - Only for Section C (Workouts Done) */}
            {activeSection === 'C' && (
              <button
                onClick={onImportClick}
                className="px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded text-sm font-medium flex items-center gap-2 transition-colors"
                title="Import workouts from Yearly Plan"
              >
                <Download className="w-4 h-4" />
                Import from Plan
              </button>
            )}
            
            {/* View Toggle */}
            <button
              onClick={() => onViewModeChange('tree')}
              className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors ${
                viewMode === 'tree' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
              Tree
            </button>
            
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
            
            {/* Week Grouping Selector for Section B (Table/Tree view only) */}
            {activeSection === 'B' && viewMode !== 'calendar' && onWeeksPerPageChange && (
              <>
                <div className="flex items-center gap-2 ml-4 border-l pl-4">
                  <label htmlFor="weeks-per-page" className="text-sm font-medium text-gray-700">
                    Display:
                  </label>
                  <select
                    id="weeks-per-page"
                    value={weeksPerPage}
                    onChange={(e) => onWeeksPerPageChange(parseInt(e.target.value))}
                    className="px-3 py-1.5 rounded border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Week {currentPageStart}</option>
                    <option value={2}>Weeks {currentPageStart} - {Math.min(currentPageStart + 1, totalWeeks)}</option>
                    <option value={3}>Weeks {currentPageStart} - {Math.min(currentPageStart + 2, totalWeeks)}</option>
                    <option value={4}>Weeks {currentPageStart} - {Math.min(currentPageStart + 3, totalWeeks)}</option>
                    <option value={6}>Weeks {currentPageStart} - {Math.min(currentPageStart + 5, totalWeeks)}</option>
                    <option value={8}>Weeks {currentPageStart} - {Math.min(currentPageStart + 7, totalWeeks)}</option>
                    <option value={13}>Weeks {currentPageStart} - {Math.min(currentPageStart + 12, totalWeeks)} (3 months)</option>
                  </select>
                </div>
              </>
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

