'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Flag } from 'lucide-react';
import DayRowTable from './DayRowTable';
import WorkoutHierarchyView from './WorkoutHierarchyView';
import WeeklyInfoModal from '../WeeklyInfoModal';
import '../../../styles/sticky-table.css';

interface DayTableViewProps {
  workoutPlan: any;
  activeSection?: 'A' | 'B' | 'C' | 'D'; // Active section for conditional display
  expandedDays?: Set<string>;
  expandedWorkouts?: Set<string>;
  onToggleDay?: (dayId: string) => void;
  onToggleWorkout?: (workoutId: string) => void;
  onExpandDayWithAllWorkouts?: (dayId: string, workouts: any[]) => void;
  onEditDay?: (day: any) => void;
  onAddWorkout?: (day: any) => void;
  onCopyDay?: (day: any) => void;
  onMoveDay?: (day: any) => void;
  onPasteDay?: (day: any) => void;
  onEditWorkout?: (workout: any, day: any) => void;
  onEditMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onAddMoveframe?: (workout: any, day: any) => void;
  onAddMovelap?: (moveframe: any, workout: any, day: any) => void;
  onDeleteDay?: (day: any) => void;
  onDeleteWorkout?: (workout: any, day: any) => void;
  onDeleteMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onCopyWorkout?: (workout: any, day: any) => void;
  onMoveWorkout?: (workout: any, day: any) => void;
  onCopyMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onMoveMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onOpenColumnSettings?: (tableType: 'day' | 'workout' | 'moveframe' | 'movelap') => void;
  columnSettings?: any;
}

export default function DayTableView({
  workoutPlan,
  activeSection = 'A',
  expandedDays,
  expandedWorkouts,
  onToggleDay,
  onToggleWorkout,
  onExpandDayWithAllWorkouts,
  onEditDay,
  onAddWorkout,
  onCopyDay,
  onMoveDay,
  onPasteDay,
  onEditWorkout,
  onEditMoveframe,
  onEditMovelap,
  onAddMoveframe,
  onAddMovelap,
  onDeleteDay,
  onDeleteWorkout,
  onDeleteMoveframe,
  onDeleteMovelap,
  onCopyWorkout,
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
          setPeriods(data);
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
    dayname: 80,
    date: 80,
    matchDone: 60,
    workouts: 80,
    sportIco: 40,
    sport: 80,
    sportName: 90,
    distance: 70,
    duration: 70,
    k: 40,
    options: 250
  };
  
  // Calculate minimum table width dynamically based on column widths
  // 7 sticky columns + 4 sport sections (6 cols each) + 1 options column
  const TABLE_MIN_WIDTH = 
    COL_WIDTHS.noWorkouts + 
    COL_WIDTHS.colorCycle + 
    COL_WIDTHS.nameCycle + 
    COL_WIDTHS.dayname + 
    COL_WIDTHS.date + 
    COL_WIDTHS.matchDone + 
    COL_WIDTHS.workouts + 
    (COL_WIDTHS.sportIco + COL_WIDTHS.sport + COL_WIDTHS.sportName + COL_WIDTHS.distance + COL_WIDTHS.duration + COL_WIDTHS.k) * 4 + // 4 sport sections
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
      allDayIds.forEach(dayId => {
        if (expandedDaysSet.has(dayId) && onToggleDay) {
          onToggleDay(dayId);
        }
      });
      
      setAreWeekWorkoutsExpanded(false);
    } else {
      // Expand all: open all days and workouts (but NOT moveframes)
      console.log('📖 Expanding all workouts for week', currentWeek.weekNumber);
      
      // First open all days
      allDayIds.forEach(dayId => {
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
    // Toggle day info: if already open for this day, close it; otherwise, open it
    setDayInfoOpenForDay(prev => prev === day.id ? null : day.id);
  };

  const currentWeekId = currentWeek?.id || '';
  const currentWeekData = weeklyNotes[currentWeekId] || { periodId: '', notes: '' };
  
  // Debug logging
  useEffect(() => {
    console.log('📝 Week notes state changed:', {
      currentWeekId,
      hasData: !!currentWeekData.notes,
      notesLength: currentWeekData.notes?.length || 0,
      notesPreview: currentWeekData.notes?.substring(0, 100)
    });
  }, [weeklyNotes, currentWeekId]);
  
  console.log('📝 Current week notes:', { currentWeekId, hasNotes: !!currentWeekData.notes });

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
      
      <div className="p-4 bg-gray-100" style={{ paddingBottom: '30px' }}>
        {/* Week Navigation - Always show */}
        <div className="mb-4 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            {/* Left side buttons */}
            <div className="flex items-center gap-2">
              {/* Previous Week Button - Always visible */}
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
                Week {currentWeek?.weekNumber || currentWeekIndex + 1}
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
              
              {/* Edit Weekly Info Button - Right side of information */}
                <button
                  onClick={() => setIsWeeklyInfoModalOpen(true)}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex-shrink-0"
                title="Edit Weekly Information"
                >
                <FileText size={16} />
                Edit Weekly Info
                </button>
            </div>

            {/* Next Week Button - Always visible */}
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
          </div>
        </div>

      {/* Days Table */}
      <div ref={tableWrapperRef} className="bg-white rounded-lg shadow-md relative mb-6">
        <div className="relative">
          <div 
            ref={tableContainerRef}
            className="overflow-x-auto overflow-y-visible table-scrollbar" 
          >
            <table className="text-sm" style={{ minWidth: `${TABLE_MIN_WIDTH}px`, width: '100%' }}>
            <thead className="bg-blue-600 text-white sticky top-0 z-20 shadow-md">
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
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-4" style={{ width: COL_WIDTHS.dayname, minWidth: COL_WIDTHS.dayname }} rowSpan={2}>
                 Dayname
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-5" style={{ width: COL_WIDTHS.date, minWidth: COL_WIDTHS.date }} rowSpan={2}>
                 Date
               </th>
               <th className="border border-gray-400 px-1 py-2 text-xs font-bold sticky-header-6" style={{ width: COL_WIDTHS.matchDone, minWidth: COL_WIDTHS.matchDone }} rowSpan={2}>
                 Match<br/>done
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-7" style={{ width: COL_WIDTHS.workouts, minWidth: COL_WIDTHS.workouts }} rowSpan={2}>
                 Workouts
               </th>
              
              {/* S1 */}
              <th className="border border-gray-400 px-2 py-1 text-xs font-bold" colSpan={6}>
                S1
              </th>
              
              {/* S2 */}
              <th className="border border-gray-400 px-2 py-1 text-xs font-bold" colSpan={6}>
                S2
              </th>
              
              {/* S3 */}
              <th className="border border-gray-400 px-2 py-1 text-xs font-bold" colSpan={6}>
                S3
              </th>
              
              {/* S4 */}
              <th className="border border-gray-400 px-2 py-1 text-xs font-bold" colSpan={6}>
                S4
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
              {/* S1 sub-headers */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sportIco, minWidth: COL_WIDTHS.sportIco }}>ico</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sport, minWidth: COL_WIDTHS.sport }}>Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sportName, minWidth: COL_WIDTHS.sportName }}>name</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.distance, minWidth: COL_WIDTHS.distance }}>Distance</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.duration, minWidth: COL_WIDTHS.duration }}>Duration</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.k, minWidth: COL_WIDTHS.k }}>K</th>
              
              {/* S2 sub-headers */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sportIco, minWidth: COL_WIDTHS.sportIco }}>ico</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sport, minWidth: COL_WIDTHS.sport }}>Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sportName, minWidth: COL_WIDTHS.sportName }}>name</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.distance, minWidth: COL_WIDTHS.distance }}>Distance</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.duration, minWidth: COL_WIDTHS.duration }}>Duration</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.k, minWidth: COL_WIDTHS.k }}>K</th>
              
              {/* S3 sub-headers */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sportIco, minWidth: COL_WIDTHS.sportIco }}>ico</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sport, minWidth: COL_WIDTHS.sport }}>Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sportName, minWidth: COL_WIDTHS.sportName }}>name</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.distance, minWidth: COL_WIDTHS.distance }}>Distance</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.duration, minWidth: COL_WIDTHS.duration }}>Duration</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.k, minWidth: COL_WIDTHS.k }}>K</th>
              
              {/* S4 sub-headers */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sportIco, minWidth: COL_WIDTHS.sportIco }}>ico</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sport, minWidth: COL_WIDTHS.sport }}>Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.sportName, minWidth: COL_WIDTHS.sportName }}>name</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.distance, minWidth: COL_WIDTHS.distance }}>Distance</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.duration, minWidth: COL_WIDTHS.duration }}>Duration</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold" style={{ width: COL_WIDTHS.k, minWidth: COL_WIDTHS.k }}>K</th>
            </tr>
          </thead>
          <tbody>
            {sortedDays.map((day) => (
              <React.Fragment key={day.id}>
                {/* Day Row */}
                <DayRowTable
                  day={day}
                  currentWeek={currentWeek}
                  isExpanded={expandedDaysSet.has(day.id)}
                  onToggleDay={onToggleDay!}
                  onToggleWorkout={onToggleWorkout}
                  onExpandDayWithAllWorkouts={onExpandDayWithAllWorkouts}
                  onEditDay={onEditDay}
                  onAddWorkout={onAddWorkout}
                  onShowDayInfo={handleShowDayInfo}
                  onCopyDay={onCopyDay}
                  onMoveDay={onMoveDay}
                  onPasteDay={onPasteDay}
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
                        {day.workouts && day.workouts.length > 0 ? (
                          <WorkoutHierarchyView
                            day={{ ...day, weekNumber: currentWeek?.weekNumber }}
                            expandedWorkouts={expandedWorkoutsSet}
                            onToggleWorkout={onToggleWorkout!}
                            onAddWorkout={onAddWorkout}
                            onEditWorkout={onEditWorkout}
                            onEditMoveframe={onEditMoveframe}
                            onEditMovelap={onEditMovelap}
                            onAddMoveframe={onAddMoveframe}
                            onAddMovelap={onAddMovelap}
                            onDeleteWorkout={onDeleteWorkout}
                            onDeleteMoveframe={onDeleteMoveframe}
                            onDeleteMovelap={onDeleteMovelap}
                            onCopyWorkout={onCopyWorkout}
                            onMoveWorkout={onMoveWorkout}
                            onCopyMoveframe={onCopyMoveframe}
                            onMoveMoveframe={onMoveMoveframe}
                            onOpenColumnSettings={onOpenColumnSettings}
                            columnSettings={columnSettings}
                          />
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-xs">
                            No workouts scheduled for this day
                          </div>
                        )}
                        
                        {/* Day Info Panel - Shows below workouts when toggled */}
                        {dayInfoOpenForDay === day.id && (
                          <div className="mt-4 border-t-2 border-cyan-400 pt-4">
                            <div className="bg-white rounded-lg shadow-md p-4">
                               <h3 className="text-base font-bold text-cyan-700 mb-3 flex items-center gap-2">
                                 <span>ℹ️</span>
                                 <span>Day Information</span>
                               </h3>
                               
                               {/* All data in single column, left-aligned */}
                               <div className="space-y-3">
                                 <div>
                                   <label className="block text-xs font-semibold text-gray-600 mb-1">Week Number</label>
                                   <div className="text-sm text-gray-800">{currentWeek?.weekNumber || '—'}</div>
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
                                     {new Date(day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                   </div>
                                 </div>
                                 
                                 <div>
                                   <label className="block text-xs font-semibold text-gray-600 mb-1">Period Name</label>
                                   <div className="flex items-center gap-2">
                                     <div
                                       className="w-4 h-4 rounded-full border border-gray-400 flex-shrink-0"
                                       style={{ backgroundColor: day.period?.color || '#9CA3AF' }}
                                     />
                                     <span className="text-sm text-gray-800">{day.period?.name || 'No Period'}</span>
                                   </div>
                                 </div>
                                 
                                 <div>
                                   <label className="block text-xs font-semibold text-gray-600 mb-1">Number of Workouts</label>
                                   <div className="text-sm text-gray-800">
                                     {day.workouts?.length || 0} / 3 
                                     <span className="text-xs text-gray-500 ml-2">(max 3 workouts per day)</span>
                                   </div>
                                 </div>
                                 
                                 {/* Weather and Feeling Status - Only show in section C */}
                                 {activeSection === 'C' && (
                                   <>
                                     <div>
                                       <label className="block text-xs font-semibold text-gray-600 mb-1">Weather</label>
                                       <div className="text-sm text-gray-800">{day.weather || '—'}</div>
                                     </div>
                                     <div>
                                       <label className="block text-xs font-semibold text-gray-600 mb-1">Feeling Status</label>
                                       <div className="text-sm text-gray-800">{day.feelingStatus || '—'}</div>
                                     </div>
                                   </>
                                 )}
                               </div>
                              
                              {/* Notes/Description - Full width with blue highlight on left */}
                              {day.notes && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="flex gap-3">
                                    <div className="w-1 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1">
                                      <label className="block text-xs font-semibold text-blue-600 mb-2">Description / Notes</label>
                                      <div className="text-sm text-gray-800 leading-relaxed">{day.notes}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Workout Summary */}
                              {day.workouts && day.workouts.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Workouts Summary</h4>
                                  <div className="space-y-2">
                                    {day.workouts.map((workout: any, idx: number) => (
                                      <div key={workout.id} className="text-xs bg-gray-50 p-2 rounded flex items-center gap-2">
                                        <span className="font-bold text-blue-600">#{idx + 1}</span>
                                        <span>{workout.name || `Workout ${idx + 1}`}</span>
                                        <span className="text-gray-500">
                                          ({workout.moveframes?.length || 0} moveframe{workout.moveframes?.length !== 1 ? 's' : ''})
                                        </span>
                                        {workout.moveframes && workout.moveframes.slice(0, 4).map((mf: any, mfIdx: number) => (
                                          <span key={mfIdx} className="text-base" title={mf.sport}>
                                            {mf.sport === 'SWIM' ? '🏊' : mf.sport === 'BIKE' ? '🚴' : mf.sport === 'RUN' ? '🏃' : '🏋️'}
                                          </span>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
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
        <div style={{ height: '1px', width: '100%' }}></div>
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
                        // Reload the page to show updated data
                        window.location.reload();
                      } else {
                        alert('Failed to update week period');
                      }
                    } catch (error) {
                      console.error('Error updating week period:', error);
                      alert('Error updating week period');
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
      </div>
    </>
  );
}

