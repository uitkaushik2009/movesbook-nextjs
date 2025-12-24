'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Flag } from 'lucide-react';
// import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import DayRowTable from './DayRowTable';
import WorkoutHierarchyView from './WorkoutHierarchyView';
import WeeklyInfoModal from '../WeeklyInfoModal';
import WeekTotalsModal from '../modals/WeekTotalsModal';
import CopyWeekModal from '../modals/CopyWeekModal';
import MoveWeekModal from '../modals/MoveWeekModal';
import '../../../styles/sticky-table.css';

interface DayTableViewProps {
  workoutPlan: any;
  activeSection?: 'A' | 'B' | 'C' | 'D'; // Active section for conditional display
  expandedDays?: Set<string>;
  expandedWorkouts?: Set<string>;
  expandedMoveframeId?: string | null;
  onToggleDay?: (dayId: string) => void;
  onToggleWorkout?: (workoutId: string) => void;
  onExpandOnlyThisWorkout?: (workout: any, day: any) => void;
  onExpandDayWithAllWorkouts?: (dayId: string, workouts: any[]) => void;
  onEditDay?: (day: any) => void;
  onAddWorkout?: (day: any) => void;
  onCopyDay?: (day: any) => void;
  onMoveDay?: (day: any) => void;
  onPasteDay?: (day: any) => void;
  onShareDay?: (day: any) => void;
  onExportPdfDay?: (day: any) => void;
  onPrintDay?: (day: any) => void;
  onEditWorkout?: (workout: any, day: any) => void;
  onEditMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onAddMoveframe?: (workout: any, day: any) => void;
  onAddMoveframeAfter?: (moveframe: any, index: number, workout: any, day: any) => void;
  onAddMovelap?: (moveframe: any, workout: any, day: any) => void;
  onAddMovelapAfter?: (movelap: any, index: number, moveframe: any, workout: any, day: any) => void;
  onDeleteDay?: (day: any) => void;
  onDeleteWorkout?: (workout: any, day: any) => void;
  onSaveFavoriteWorkout?: (workout: any, day: any) => void;
  onShareWorkout?: (workout: any, day: any) => void;
  onExportPdfWorkout?: (workout: any, day: any) => void;
  onPrintWorkout?: (workout: any, day: any) => void;
  onDeleteMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onCopyWorkout?: (workout: any, day: any) => void;
  onPasteWorkout?: (day: any) => void;
  onMoveWorkout?: (workout: any, day: any) => void;
  onCopyMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onMoveMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onOpenColumnSettings?: (tableType: 'day' | 'workout' | 'moveframe' | 'movelap') => void;
  columnSettings?: any;
  reloadWorkouts?: () => Promise<void>; // Added for reloading after copy/move
}

// Helper function to get section label and color
const getSectionBadge = (section?: 'A' | 'B' | 'C' | 'D') => {
  switch(section) {
    case 'B':
      return { label: 'PLANNED', bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-300' };
    case 'C':
      return { label: 'COMPLETED', bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-300' };
    case 'A':
      return { label: 'DRAFT', bgColor: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-300' };
    case 'D':
      return { label: 'ARCHIVE', bgColor: 'bg-gray-100', textColor: 'text-gray-700', borderColor: 'border-gray-300' };
    default:
      return null;
  }
};

export default function DayTableView({
  workoutPlan,
  activeSection = 'A',
  expandedDays,
  expandedWorkouts,
  expandedMoveframeId,
  onToggleDay,
  onToggleWorkout,
  onExpandOnlyThisWorkout,
  onExpandDayWithAllWorkouts,
  onEditDay,
  onAddWorkout,
  onCopyDay,
  onMoveDay,
  onPasteDay,
  onShareDay,
  onExportPdfDay,
  onPrintDay,
  onEditWorkout,
  onEditMoveframe,
  onEditMovelap,
  onAddMoveframe,
  onAddMoveframeAfter,
  onAddMovelap,
  onAddMovelapAfter,
  reloadWorkouts,
  onDeleteDay,
  onDeleteWorkout,
  onSaveFavoriteWorkout,
  onShareWorkout,
  onExportPdfWorkout,
  onPrintWorkout,
  onDeleteMoveframe,
  onDeleteMovelap,
  onCopyWorkout,
  onPasteWorkout,
  onMoveWorkout,
  onCopyMoveframe,
  onMoveMoveframe,
  onOpenColumnSettings,
  columnSettings
}: DayTableViewProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [isWeeklyInfoModalOpen, setIsWeeklyInfoModalOpen] = useState(false);
  const [weeklyNotes, setWeeklyNotes] = useState<Record<string, { periodId: string; notes: string }>>({});
  const [dayInfoOpenForDay, setDayInfoOpenForDay] = useState<string | null>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [areWeekWorkoutsExpanded, setAreWeekWorkoutsExpanded] = useState(false);
  const [showWeekTotalsModal, setShowWeekTotalsModal] = useState(false);
  const [showCopyWeekModal, setShowCopyWeekModal] = useState(false);
  const [showMoveWeekModal, setShowMoveWeekModal] = useState(false);
  const [autoPrintWeek, setAutoPrintWeek] = useState(false);
  const [targetWeeks, setTargetWeeks] = useState<any[]>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  
  const expandedDaysSet = expandedDays || new Set<string>();
  const expandedWorkoutsSet = expandedWorkouts || new Set<string>();
  
  console.log('📅 DayTableView: expandedDays:', Array.from(expandedDaysSet));
  console.log('🏋️ DayTableView: expandedWorkouts:', Array.from(expandedWorkoutsSet));
  
  // Load periods
  useEffect(() => {
    const loadPeriods = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/workouts/periods', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPeriods(data.periods || []); // Extract periods array from response
        }
      } catch (error) {
        console.error('Error loading periods:', error);
      }
    };
    
    loadPeriods();
  }, []);

  // Reset expand state when week changes
  useEffect(() => {
    setAreWeekWorkoutsExpanded(false);
  }, [currentWeekIndex]);

  // Load week notes when weeks change
  useEffect(() => {
    const loadWeekNotes = async () => {
      if (!workoutPlan?.weeks || workoutPlan.weeks.length === 0) return;

      const token = localStorage.getItem('token');
      if (!token) return;

      // Load notes for all weeks
      const notesPromises = workoutPlan.weeks.map(async (week: any) => {
        try {
          const response = await fetch(`/api/workouts/weeks/${week.id}/notes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            return {
              weekId: week.id,
              data: {
                periodId: data.periodId || '',
                notes: data.notes || ''
              }
            };
          }
        } catch (error) {
          console.error(`Error loading notes for week ${week.id}:`, error);
        }
        return null;
      });

      const results = await Promise.all(notesPromises);
      const notesMap: Record<string, { periodId: string; notes: string }> = {};
      
      results.forEach(result => {
        if (result) {
          notesMap[result.weekId] = result.data;
        }
      });

      if (Object.keys(notesMap).length > 0) {
        setWeeklyNotes(prev => ({ ...prev, ...notesMap }));
        console.log('✅ Loaded week notes:', notesMap);
      }
    };

    loadWeekNotes();
  }, [workoutPlan?.weeks]);
  
  // Constants for UI dimensions
  const SCROLLBAR_HEIGHT = 24; // px
  
  // Column width constants (for consistent sizing across the table)
  const COL_WIDTHS = {
    noWorkouts: 50,
    colorCycle: 50,
    nameCycle: 90,
    weekNumber: 60,     // NEW: Week n.
    dayNumber: 50,      // NEW: Day wk
    dayname: 80,
    date: 80,
    matchDone: 60,
    workouts: 80,
    icoSport: 100,      // "Ico Sport" column
    distTime: 100,      // "Dist & Time" column
    mainWork: 200,      // "Main work" column
    options: 250
  };
  
  // Calculate minimum table width dynamically based on column widths
  // 9 sticky columns + 4 sport sections (3 cols each) + 1 options column
  const TABLE_MIN_WIDTH = 
    COL_WIDTHS.noWorkouts + 
    COL_WIDTHS.colorCycle + 
    COL_WIDTHS.nameCycle + 
    COL_WIDTHS.weekNumber + 
    COL_WIDTHS.dayNumber + 
    COL_WIDTHS.dayname + 
    COL_WIDTHS.date + 
    COL_WIDTHS.matchDone + 
    COL_WIDTHS.workouts + 
    (COL_WIDTHS.icoSport + COL_WIDTHS.distTime + COL_WIDTHS.mainWork) * 4 + // 4 sport sections (3 cols each)
    COL_WIDTHS.options;
  
  // Synchronize scrollbars and position
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const scrollbar = scrollbarRef.current;
    const tableWrapper = tableWrapperRef.current;
    
    if (!tableContainer || !scrollbar || !tableWrapper) return;
    
    const handleTableScroll = () => {
      if (scrollbar) {
        scrollbar.scrollLeft = tableContainer.scrollLeft;
      }
    };
    
    const handleScrollbarScroll = () => {
      if (tableContainer) {
        tableContainer.scrollLeft = scrollbar.scrollLeft;
      }
    };
    
    tableContainer.addEventListener('scroll', handleTableScroll);
    scrollbar.addEventListener('scroll', handleScrollbarScroll);
    
    // Update scrollbar position and width to match table
    const updateScrollbarPosition = () => {
      const table = tableContainer.querySelector('table');
      const scrollbarContent = scrollbar.firstElementChild as HTMLElement;
      const rect = tableWrapper.getBoundingClientRect();
      
      if (table && scrollbarContent) {
        // Set scrollbar content width to match table width
        const tableWidth = table.scrollWidth;
        scrollbarContent.style.width = `${tableWidth}px`;
        
        // Position scrollbar to match table wrapper
        scrollbar.style.left = `${rect.left}px`;
        scrollbar.style.width = `${rect.width}px`;
      }
    };
    
    // Initial update with a slight delay to ensure table is rendered
    setTimeout(updateScrollbarPosition, 100);
    
    // Update on window resize and scroll
    const handleUpdate = () => updateScrollbarPosition();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate);
    
    // Update scrollbar position when table content changes
    const resizeObserver = new ResizeObserver(() => {
      updateScrollbarPosition();
    });
    
    resizeObserver.observe(tableWrapper);
    
    return () => {
      tableContainer.removeEventListener('scroll', handleTableScroll);
      scrollbar.removeEventListener('scroll', handleScrollbarScroll);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
      resizeObserver.disconnect();
    };
  }, []); // Empty dependency array - only run once on mount

  if (!workoutPlan || !workoutPlan.weeks) {
    return (
      <div className="p-8 text-center text-gray-500">
        No workout plan available. Click "Create Plan" to start.
      </div>
    );
  }

  const sortedWeeks = [...workoutPlan.weeks].sort((a: any, b: any) => a.weekNumber - b.weekNumber);
  const totalWeeks = sortedWeeks.length;
  
  // For Section B, show ALL weeks (already filtered by parent)
  // For Section A/C, use pagination (show one week at a time)
  const weeksToDisplay = activeSection === 'B' ? sortedWeeks : [sortedWeeks[currentWeekIndex]].filter(Boolean);
  
  // Legacy variables for backward compatibility
  const currentWeek = sortedWeeks[currentWeekIndex];
  const weekDays = currentWeek?.days || [];
  const sortedDays = [...weekDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  console.log('🗓️ Current week data:', {
    currentWeekIndex,
    currentWeek: currentWeek?.id,
    weekNumber: currentWeek?.weekNumber
  });

  const goToPreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeekIndex < totalWeeks - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  const toggleWeekWorkouts = () => {
    if (!currentWeek || !currentWeek.days) return;
    
    const allDayIds = currentWeek.days.map((day: any) => day.id);
    const allWorkoutIds: string[] = [];
    
    currentWeek.days.forEach((day: any) => {
      if (day.workouts && Array.isArray(day.workouts)) {
        day.workouts.forEach((workout: any) => {
          allWorkoutIds.push(workout.id);
        });
      }
    });
    
    if (areWeekWorkoutsExpanded) {
      // Collapse all: close all workouts and days
      console.log('📕 Collapsing all workouts for week', currentWeek.weekNumber);
      
      // Close all workouts first
      allWorkoutIds.forEach(workoutId => {
        if (expandedWorkoutsSet.has(workoutId) && onToggleWorkout) {
          onToggleWorkout(workoutId);
        }
      });
      
      // Then close all days
      allDayIds.forEach((dayId: string) => {
        if (expandedDaysSet.has(dayId) && onToggleDay) {
          onToggleDay(dayId);
        }
      });
      
      setAreWeekWorkoutsExpanded(false);
    } else {
      // Expand all: open all days and workouts (but NOT moveframes)
      console.log('📖 Expanding all workouts for week', currentWeek.weekNumber);
      
      // First open all days
      allDayIds.forEach((dayId: string) => {
        if (!expandedDaysSet.has(dayId) && onToggleDay) {
          onToggleDay(dayId);
        }
      });
      
      // Then open all workouts
      allWorkoutIds.forEach(workoutId => {
        if (!expandedWorkoutsSet.has(workoutId) && onToggleWorkout) {
          onToggleWorkout(workoutId);
        }
      });
      
      setAreWeekWorkoutsExpanded(true);
    }
  };

  const handleSaveWeeklyNotes = async (data: { periodId: string; notes: string }) => {
    const weekId = currentWeek?.id;
    if (!weekId) {
      console.error('❌ No week ID available');
      return;
    }

    console.log('💾 Saving weekly notes:', { weekId, data });

    // Save to local state FIRST
    setWeeklyNotes(prev => {
      const updated = {
        ...prev,
        [weekId]: data
      };
      console.log('📝 Updated weeklyNotes state:', updated);
      return updated;
    });

    // Save to backend API
    try {
      const token = localStorage.getItem('token');
      if (token && weekId) {
        // Save the weekly notes and period to the backend
        const response = await fetch(`/api/workouts/weeks/${weekId}/notes`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          console.log('✅ Weekly notes saved to backend successfully');
        } else {
          console.warn('⚠️ Backend save failed, but local state is updated');
        }
      }
    } catch (error) {
      console.error('❌ Error saving weekly notes to backend:', error);
      // Local state is still saved, so this is just a warning
    }
  };

  const handleShowDayInfo = (day: any) => {
    setDayInfoOpenForDay(prev => prev === day.id ? null : day.id);
  };

  const handleCopyWeek = async (targetWeekId: string) => {
    const sourceWeekId = currentWeek?.id;
    if (!sourceWeekId) {
      console.error('❌ No source week ID available');
      return;
    }

    console.log('📋 Copying week:', { sourceWeekId, targetWeekId });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Authentication required');
        return;
      }

      const response = await fetch('/api/workouts/weeks/copy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceWeekId,
          targetWeekId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to copy week');
      }

      console.log('✅ Week copied successfully');
      
      // Close the modal first
      setShowCopyWeekModal(false);
      setTargetWeeks([]);
      
      // Reload the workout plan
      if (reloadWorkouts) {
        await reloadWorkouts();
      }
    } catch (error) {
      console.error('❌ Error copying week:', error);
    }
  };

  const handleMoveWeek = async (targetWeekId: string) => {
    const sourceWeekId = currentWeek?.id;
    if (!sourceWeekId) {
      console.error('❌ No source week ID available');
      return;
    }

    console.log('🚚 Moving week:', { sourceWeekId, targetWeekId });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Authentication required');
        return;
      }

      const response = await fetch('/api/workouts/weeks/move', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceWeekId,
          targetWeekId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move week');
      }

      console.log('✅ Week moved successfully');
      
      // Reload the workout plan
      if (reloadWorkouts) {
        await reloadWorkouts();
      }
    } catch (error) {
      console.error('❌ Error moving week:', error);
    }
  };

  const currentWeekId = currentWeek?.id || '';
  const currentWeekData = weeklyNotes[currentWeekId] || { periodId: '', notes: '' };

  return (
    <>
      {/* CSS for rich text preview and fixed workout details */}
      <style>{`
        .rich-text-preview b,
        .rich-text-preview strong {
          font-weight: bold !important;
        }
        .rich-text-preview i,
        .rich-text-preview em {
          font-style: italic !important;
        }
        .rich-text-preview u {
          text-decoration: underline !important;
        }
        .rich-text-preview strike,
        .rich-text-preview s {
          text-decoration: line-through !important;
        }
        .rich-text-preview ul {
          list-style-type: disc;
          margin-left: 20px;
          padding-left: 0;
        }
        .rich-text-preview ol {
          list-style-type: decimal;
          margin-left: 20px;
          padding-left: 0;
        }
        .rich-text-preview li {
          display: list-item;
        }
        .rich-text-preview a {
          color: #2563eb;
          text-decoration: underline;
        }
        .rich-text-preview p {
          display: inline;
          margin: 0;
        }
        .rich-text-preview div {
          display: inline;
        }
        /* Support for font colors */
        .rich-text-preview *[style*="color"] {
          color: inherit;
        }
        .rich-text-preview *[style*="background"] {
          background: inherit;
        }
        
        /* Fixed workout details - don't scroll with day row */
        .workout-expanded-row td {
          position: sticky !important;
          left: 0 !important;
        }
        .workout-details-container {
          position: relative;
          width: 100%;
          max-width: 100vw;
          overflow-x: visible;
        }
      `}</style>
      
      <div className="bg-gray-100 relative" style={{ minHeight: '100vh', paddingTop: '0' }}>
        {/* Week Navigation - Sticky Header */}
        <div className="sticky top-0 z-50 bg-white shadow-lg p-4 border-b-2 border-gray-300">
          <div className="flex items-center justify-between">
            {/* Left side buttons */}
            <div className="flex items-center gap-2">
              {/* Previous Week Button - Hidden for Section B (parent handles pagination) */}
              {activeSection !== 'B' && (
                <button
                  onClick={goToPreviousWeek}
                  disabled={currentWeekIndex === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentWeekIndex === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <ChevronLeft size={20} />
                  Previous Week
                </button>
              )}

              {/* Expand/Collapse All Workouts Button */}
              <button
                onClick={toggleWeekWorkouts}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-purple-500 text-white hover:bg-purple-600"
                title={areWeekWorkoutsExpanded ? "Collapse all workouts" : "Expand all workouts"}
              >
                {areWeekWorkoutsExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center gap-6">
              <div className="text-lg font-bold text-gray-900">
                {activeSection === 'B' && weeksToDisplay.length > 1
                  ? `Weeks ${weeksToDisplay[0]?.weekNumber || 1} - ${weeksToDisplay[weeksToDisplay.length - 1]?.weekNumber || 1}`
                  : `Week ${currentWeek?.weekNumber || currentWeekIndex + 1}`}
              </div>
              
              {/* Set Period Button - Right after week number */}
              <button
                onClick={() => setShowPeriodSelector(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors border-2"
                style={{
                  backgroundColor: currentWeek?.period?.color || '#e5e7eb',
                  borderColor: currentWeek?.period?.color || '#d1d5db',
                  color: '#000000'
                }}
                title="Set period for this week"
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: currentWeek?.period?.color || '#3b82f6' }}
                />
                <span className="font-medium">
                  {currentWeek?.period?.name || 'Set Period'}
                </span>
              </button>
              
              {/* Weekly Information - Right side of period */}
              <div className="text-sm max-w-md px-4 border-l-2 border-gray-200">
                {currentWeekData.notes ? (
                  <div 
                    className="rich-text-preview text-gray-700"
                    dangerouslySetInnerHTML={{ __html: currentWeekData.notes }}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      lineHeight: '1.5',
                      maxHeight: '3em'
                    }}
                  />
                ) : (
                  <span className="text-gray-400 italic">No notes yet</span>
                )}
              </div>
              
              {/* Edit Weekly Info Button */}
              <button
                onClick={() => setIsWeeklyInfoModalOpen(true)}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex-shrink-0"
                title="Edit Weekly Information"
              >
                <FileText size={16} />
                Edit
              </button>
              
              {/* Copy Week Button */}
              <button
                onClick={async () => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    console.error('❌ Please log in first');
                    return;
                  }
                  
                  try {
                    // Always fetch from Yearly Plan (Section B)
                    const targetPlanType = activeSection === 'A' ? 'YEARLY_PLAN' : 'TEMPLATE_WEEKS';
                    console.log('📥 Fetching target weeks for Copy from:', targetPlanType);
                    
                    const response = await fetch(`/api/workouts/plan?type=${targetPlanType}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      console.log('✅ Loaded target plan:', data.plan?.type, 'with', data.plan?.weeks?.length || 0, 'weeks');
                      setTargetWeeks(data.plan?.weeks || []);
                      setShowCopyWeekModal(true);
                    } else {
                      console.error('❌ Failed to load target weeks');
                    }
                  } catch (error) {
                    console.error('Error loading target weeks:', error);
                  }
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex-shrink-0"
                title="Copy this week"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy
              </button>
              
              {/* Move Week Button - Only show in Section C (Workouts Done) and D (Archive) */}
              {activeSection !== 'A' && activeSection !== 'B' && (
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      console.error('❌ Please log in first');
                      return;
                    }
                    
                    try {
                      // Always fetch from Yearly Plan (Section B)
                      const targetPlanType = activeSection === 'A' ? 'YEARLY_PLAN' : 'TEMPLATE_WEEKS';
                      console.log('📥 Fetching target weeks for Move from:', targetPlanType);
                      
                      const response = await fetch(`/api/workouts/plan?type=${targetPlanType}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Loaded target plan:', data.plan?.type, 'with', data.plan?.weeks?.length || 0, 'weeks');
                        setTargetWeeks(data.plan?.weeks || []);
                        setShowMoveWeekModal(true);
                      } else {
                        console.error('❌ Failed to load target weeks');
                      }
                    } catch (error) {
                      console.error('Error loading target weeks:', error);
                    }
                  }}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex-shrink-0"
                  title="Move this week"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
                  Move
                </button>
              )}
              
              {/* Overview/Totals Button */}
              <button
                onClick={() => {
                  console.log('📊 Overview button clicked');
                  console.log('📅 Current week:', currentWeek);
                  setAutoPrintWeek(false);
                  setShowWeekTotalsModal(true);
                  console.log('✅ Modal should open now');
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors flex-shrink-0"
                title="View complete week overview with all workouts and totals"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Overview
              </button>
              
              {/* Print/PDF Button */}
              <button
                onClick={() => {
                  console.log('🖨️ Print button clicked');
                  console.log('📅 Current week:', currentWeek);
                  setAutoPrintWeek(true);
                  setShowWeekTotalsModal(true);
                  console.log('✅ Modal should open AND print dialog should appear');
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors flex-shrink-0"
                title="Print week overview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print
              </button>
            </div>

            {/* Next Week Button - Hidden for Section B (parent handles pagination) */}
            {activeSection !== 'B' && (
              <button
                onClick={goToNextWeek}
                disabled={currentWeekIndex >= totalWeeks - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentWeekIndex >= totalWeeks - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next Week
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-4 pt-0">
          {/* Grid Settings Buttons - NOT Sticky, just below week header */}
          <div className="bg-gray-100 py-3 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              // TODO: Implement save grid settings
              console.log('Save Grid Settings clicked');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Save Grid Settings
          </button>
          <button
            onClick={() => {
              // TODO: Implement reset to default
              console.log('Reset to Default clicked');
              if (confirm('Are you sure you want to reset grid settings to default?')) {
                console.log('Grid settings reset');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Reset to Default
          </button>
        </div>

      {/* Days Table */}
      <div ref={tableWrapperRef} className="bg-white rounded-lg shadow-md relative mb-6">
        <div className="relative">
          <div 
            ref={tableContainerRef}
            className="overflow-x-auto overflow-y-visible table-scrollbar" 
          >
            <table className="text-sm" style={{ minWidth: `${TABLE_MIN_WIDTH}px`, width: '100%' }}>
            <thead className="bg-blue-600 text-white">
             <tr>
               <th className="border border-gray-400 px-1 py-2 text-xs font-bold sticky-header-1" style={{ width: COL_WIDTHS.noWorkouts, minWidth: COL_WIDTHS.noWorkouts }} rowSpan={2}>
                 Check
               </th>
               <th className="border border-gray-400 px-1 py-2 text-xs font-bold sticky-header-2" style={{ width: COL_WIDTHS.colorCycle, minWidth: COL_WIDTHS.colorCycle }} rowSpan={2}>
                 Color<br/>cycle
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-3" style={{ width: COL_WIDTHS.nameCycle, minWidth: COL_WIDTHS.nameCycle }} rowSpan={2}>
                 Name<br/>cycle
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-4" style={{ width: COL_WIDTHS.weekNumber, minWidth: COL_WIDTHS.weekNumber }} rowSpan={2}>
                 Week<br/>n.
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-5" style={{ width: COL_WIDTHS.dayNumber, minWidth: COL_WIDTHS.dayNumber }} rowSpan={2}>
                 Day<br/>wk
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-6" style={{ width: COL_WIDTHS.dayname, minWidth: COL_WIDTHS.dayname }} rowSpan={2}>
                 Dayname
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-7" style={{ width: COL_WIDTHS.date, minWidth: COL_WIDTHS.date }} rowSpan={2}>
                 Date
               </th>
               <th className="border border-gray-400 px-1 py-2 text-xs font-bold sticky-header-8" style={{ width: COL_WIDTHS.matchDone, minWidth: COL_WIDTHS.matchDone }} rowSpan={2}>
                 Match<br/>done
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-9" style={{ width: COL_WIDTHS.workouts, minWidth: COL_WIDTHS.workouts }} rowSpan={2}>
                 Workouts
               </th>
              
              {/* S1 - Blue */}
              <th className="border border-gray-400 px-2 py-1 text-xs font-bold bg-blue-300 text-black" colSpan={3}>
                S1 ico
              </th>
              
              {/* S2 - Green */}
              <th className="border border-gray-400 px-2 py-1 text-xs font-bold bg-green-300 text-black" colSpan={3}>
                S2 ico
              </th>
              
              {/* S3 - Orange */}
              <th className="border border-gray-400 px-2 py-1 text-xs font-bold bg-orange-300 text-black" colSpan={3}>
                S3 ico
              </th>
              
              {/* S4 - Pink */}
              <th className="border border-gray-400 px-2 py-1 text-xs font-bold bg-pink-300 text-black" colSpan={3}>
                S4 ico
              </th>
              
              <th 
                className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-options-header bg-blue-600" 
                style={{ width: COL_WIDTHS.options, minWidth: COL_WIDTHS.options }}
                rowSpan={2}
              >
                Options
              </th>
            </tr>
            <tr>
              {/* S1 sub-headers - Blue */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-blue-200 text-black" style={{ width: '100px', minWidth: '100px' }}>Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-blue-200 text-black" style={{ width: '100px', minWidth: '100px' }}>Dist & Time</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-blue-200 text-black" style={{ width: '200px', minWidth: '200px' }}>Main work</th>
              
              {/* S2 sub-headers - Green */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-green-200 text-black" style={{ width: '100px', minWidth: '100px' }}>Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-green-200 text-black" style={{ width: '100px', minWidth: '100px' }}>Dist & Time</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-green-200 text-black" style={{ width: '200px', minWidth: '200px' }}>Main work</th>
              
              {/* S3 sub-headers - Orange */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-orange-200 text-black" style={{ width: '100px', minWidth: '100px' }}>Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-orange-200 text-black" style={{ width: '100px', minWidth: '100px' }}>Dist & Time</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-orange-200 text-black" style={{ width: '200px', minWidth: '200px' }}>Main work</th>
              
              {/* S4 sub-headers - Pink */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-pink-200 text-black" style={{ width: '100px', minWidth: '100px' }}>Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-pink-200 text-black" style={{ width: '100px', minWidth: '100px' }}>Dist & Time</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-pink-200 text-black" style={{ width: '200px', minWidth: '200px' }}>Main work</th>
            </tr>
          </thead>
          <tbody>
            {weeksToDisplay.flatMap((week, weekIdx) => {
              const weekDays = week?.days || [];
              const sortedWeekDays = [...weekDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              
              return sortedWeekDays.map((day, dayIdx) => {
                const isLastDayOfWeek = dayIdx === sortedWeekDays.length - 1;
                const isNotLastWeek = weekIdx < weeksToDisplay.length - 1;
                const isMultiWeekView = weeksToDisplay.length > 1;
                const shouldShowWeekSeparator = isLastDayOfWeek && isNotLastWeek && isMultiWeekView;
                
                return (
                  <React.Fragment key={day.id}>
                    {/* Day Row */}
                    <DayRowTable
                      day={day}
                      currentWeek={week}
                      isExpanded={expandedDaysSet.has(day.id)}
                      isLastDayOfWeek={shouldShowWeekSeparator}
                      onToggleDay={onToggleDay!}
                      onToggleWorkout={onToggleWorkout}
                      onExpandOnlyThisWorkout={onExpandOnlyThisWorkout}
                      onExpandDayWithAllWorkouts={onExpandDayWithAllWorkouts}
                      onEditDay={onEditDay}
                      onAddWorkout={onAddWorkout}
                      onShowDayInfo={handleShowDayInfo}
                      onCopyDay={onCopyDay}
                      onMoveDay={onMoveDay}
                      onPasteDay={onPasteDay}
                      onShareDay={onShareDay}
                      onExportPdfDay={onExportPdfDay}
                      onPrintDay={onPrintDay}
                      onDeleteDay={onDeleteDay}
                    />
                  
                  {/* Expanded Workouts Section */}
                    {expandedDaysSet.has(day.id) && (
                      <tr className="workout-expanded-row">
                       <td colSpan={32} className="p-0 bg-gray-50" style={{ position: 'relative' }}>
                        <div className="p-4 workout-details-container">
                          <div className="mb-2 text-sm font-semibold text-gray-700">
                            Workouts for {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </div>
                          
                          {/* Day Info Panel - Shows immediately after day header when toggled */}
                          {dayInfoOpenForDay === day.id && (
                            <div className="mb-4 border-l-4 border-cyan-500">
                              <div className="bg-cyan-50 rounded-lg shadow-sm p-4">
                                 <h3 className="text-base font-bold text-cyan-700 mb-3 flex items-center gap-2">
                                   <span>ℹ️</span>
                                   <span>Day Information</span>
                                 </h3>
                                 
                                 {/* All data in single column, left-aligned */}
                                 <div className="space-y-3">
                                   <div>
                                     <label className="block text-xs font-semibold text-gray-600 mb-1">Week Number</label>
                                     <div className="text-sm text-gray-800">{week?.weekNumber || '—'}</div>
                                   </div>
                                   
                                   <div>
                                     <label className="block text-xs font-semibold text-gray-600 mb-1">Day of Week</label>
                                     <div className="text-sm text-gray-800">
                                       {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                     </div>
                                   </div>
                                   
                                   <div>
                                     <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                                     <div className="text-sm text-gray-800">
                                       {new Date(day.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                     </div>
                                   </div>
                                   
                                   <div>
                                     <label className="block text-xs font-semibold text-gray-600 mb-1">Number of Workouts</label>
                                     <div className="text-sm text-gray-800">{day.workouts?.length || 0}</div>
                                   </div>
                                   
                                   <div>
                                     <label className="block text-xs font-semibold text-gray-600 mb-1">Period</label>
                                     <div className="text-sm text-gray-800">
                                       {day.period ? (
                                         <div className="flex items-center gap-2">
                                           <div 
                                             className="w-4 h-4 rounded" 
                                             style={{ backgroundColor: day.period.color }}
                                           />
                                           <span>{day.period.name}</span>
                                         </div>
                                       ) : '—'}
                                     </div>
                                   </div>
                                   
                                   <div>
                                     <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                                     <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                       {day.notes || 'No notes'}
                                     </div>
                                   </div>
                                 </div>
                              </div>
                            </div>
                          )}
                          
                          {day.workouts && day.workouts.length > 0 ? (
                            <WorkoutHierarchyView
                              day={{ ...day, weekNumber: week?.weekNumber }}
                              expandedWorkouts={expandedWorkoutsSet}
                              expandedMoveframeId={expandedMoveframeId}
                              onToggleWorkout={onToggleWorkout!}
                              onExpandOnlyThisWorkout={onExpandOnlyThisWorkout}
                              onAddWorkout={onAddWorkout}
                              onEditWorkout={onEditWorkout}
                              onEditMoveframe={onEditMoveframe}
                              onEditMovelap={onEditMovelap}
                              onAddMoveframe={onAddMoveframe}
                              onAddMoveframeAfter={onAddMoveframeAfter}
                              onAddMovelap={onAddMovelap}
                              onAddMovelapAfter={onAddMovelapAfter}
                              onDeleteWorkout={onDeleteWorkout}
                              onSaveFavoriteWorkout={onSaveFavoriteWorkout}
                              onShareWorkout={onShareWorkout}
                              onExportPdfWorkout={onExportPdfWorkout}
                              onPrintWorkout={onPrintWorkout}
                              onDeleteMoveframe={onDeleteMoveframe}
                              onDeleteMovelap={onDeleteMovelap}
                              onCopyWorkout={onCopyWorkout}
                              onPasteWorkout={onPasteWorkout}
                              onMoveWorkout={onMoveWorkout}
                              onCopyMoveframe={onCopyMoveframe}
                              onMoveMoveframe={onMoveMoveframe}
                              onOpenColumnSettings={onOpenColumnSettings}
                              reloadWorkouts={reloadWorkouts}
                              columnSettings={columnSettings}
                            />
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-xs">
                              No workouts scheduled for this day
                            </div>
                          )}
                          
                          {/* Add Workout Button - Always visible, centered */}
                          <div className="flex justify-center mt-4 py-4" style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddWorkout?.(day);
                              }}
                              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-150"
                            >
                              Add a workout
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            });
          })}
          </tbody>
        </table>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollbar - Fixed at bottom of viewport */}
      <div 
        ref={scrollbarRef}
        className="overflow-x-auto custom-scrollbar bg-gradient-to-b from-gray-300 to-gray-200 border-t-2 border-blue-400 shadow-lg"
        style={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${SCROLLBAR_HEIGHT}px`,
          zIndex: 50,
        }}
        title="Horizontal scroll - Drag to navigate table"
      >
        <div style={{ height: '1px', width: '100%' }}>        </div>
      </div>
        </div>
        {/* End of Scrollable Content Area */}
      </div>

      {/* Weekly Info Modal */}
      <WeeklyInfoModal
        isOpen={isWeeklyInfoModalOpen}
        onClose={() => setIsWeeklyInfoModalOpen(false)}
        weekNumber={currentWeek?.weekNumber || currentWeekIndex + 1}
        weekId={currentWeekId}
        initialPeriodId={currentWeekData.periodId}
        initialNotes={currentWeekData.notes}
        onSave={handleSaveWeeklyNotes}
      />

      {/* Week Totals Modal */}
      <WeekTotalsModal
        isOpen={showWeekTotalsModal}
        week={currentWeek}
        autoPrint={autoPrintWeek}
        onClose={() => {
          console.log('🚪 WeekTotalsModal closing...');
          setShowWeekTotalsModal(false);
          setAutoPrintWeek(false);
          console.log('✅ Modal closed and autoPrint reset');
        }}
      />

      {/* Copy Week Modal */}
      <CopyWeekModal
        isOpen={showCopyWeekModal}
        sourceWeek={currentWeek}
        allWeeks={targetWeeks}
        onClose={() => {
          setShowCopyWeekModal(false);
          setTargetWeeks([]);
        }}
        onCopy={handleCopyWeek}
      />

      {/* Move Week Modal */}
      <MoveWeekModal
        isOpen={showMoveWeekModal}
        sourceWeek={currentWeek}
        allWeeks={targetWeeks}
        onClose={() => {
          setShowMoveWeekModal(false);
          setTargetWeeks([]);
        }}
        onMove={handleMoveWeek}
      />

      {/* Period Selector Modal */}
      {showPeriodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select Period for Week {currentWeek?.weekNumber}</h2>
              <button
                onClick={() => setShowPeriodSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              This will set the period for the entire week and update all days in this week.
            </p>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {periods && periods.length > 0 ? periods.map((period) => (
                <button
                  key={period.id}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`/api/workouts/weeks/${currentWeek?.id}/period`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          periodId: period.id,
                          updateAllDays: true
                        })
                      });

                      if (response.ok) {
                        setShowPeriodSelector(false);
                        // Reload workouts data without page refresh
                        if (reloadWorkouts) {
                          await reloadWorkouts();
                        }
                      } else {
                        console.error('Failed to update week period');
                      }
                    } catch (error) {
                      console.error('Error updating week period:', error);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: period.color,
                    backgroundColor: currentWeek?.period?.id === period.id ? period.color + '20' : 'white'
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: period.color }}
                  />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{period.name}</div>
                    {period.description && (
                      <div className="text-xs text-gray-600">{period.description}</div>
                    )}
                  </div>
                  {currentWeek?.period?.id === period.id && (
                    <div className="text-green-600 font-bold">✓</div>
                  )}
                </button>
              )) : null}
              
              {(!periods || periods.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No periods found.</p>
                  <p className="text-sm mt-2">Create periods in the Settings section.</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowPeriodSelector(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

