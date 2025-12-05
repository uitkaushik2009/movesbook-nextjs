'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import DayRowTable from './DayRowTable';
import WorkoutHierarchyView from './WorkoutHierarchyView';
import WeeklyInfoModal from '../WeeklyInfoModal';
import '../../../styles/sticky-table.css';

interface DayTableViewProps {
  workoutPlan: any;
  expandedDays?: Set<string>;
  expandedWorkouts?: Set<string>;
  onToggleDay?: (dayId: string) => void;
  onToggleWorkout?: (workoutId: string) => void;
  onEditDay?: (day: any) => void;
  onAddWorkout?: (day: any) => void;
  onCopyDay?: (day: any) => void;
  onMoveDay?: (day: any) => void;
  onEditWorkout?: (workout: any, day: any) => void;
  onEditMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onAddMoveframe?: (workout: any, day: any) => void;
  onAddMovelap?: (moveframe: any, workout: any, day: any) => void;
  onDeleteDay?: (day: any) => void;
  onDeleteWorkout?: (workout: any, day: any) => void;
  onDeleteMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onDeleteMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
}

export default function DayTableView({
  workoutPlan,
  expandedDays,
  expandedWorkouts,
  onToggleDay,
  onToggleWorkout,
  onEditDay,
  onAddWorkout,
  onCopyDay,
  onMoveDay,
  onEditWorkout,
  onEditMoveframe,
  onEditMovelap,
  onAddMoveframe,
  onAddMovelap,
  onDeleteDay,
  onDeleteWorkout,
  onDeleteMoveframe,
  onDeleteMovelap
}: DayTableViewProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [isWeeklyInfoModalOpen, setIsWeeklyInfoModalOpen] = useState(false);
  const [weeklyNotes, setWeeklyNotes] = useState<Record<number, string[]>>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  
  const expandedDaysSet = expandedDays || new Set<string>();
  const expandedWorkoutsSet = expandedWorkouts || new Set<string>();
  
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

  const handleSaveWeeklyNotes = (notes: string[]) => {
    const weekNumber = currentWeek?.weekNumber || currentWeekIndex + 1;
    setWeeklyNotes(prev => ({
      ...prev,
      [weekNumber]: notes
    }));
  };

  const currentWeekNotes = weeklyNotes[currentWeek?.weekNumber || currentWeekIndex + 1] || [];
  const firstNote = currentWeekNotes[0] || '';

  return (
    <div className="p-4 bg-gray-100" style={{ paddingBottom: '30px' }}>
      {/* Week Navigation */}
      {totalWeeks > 1 && (
        <div className="mb-4 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
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

            <div className="text-center flex-1">
              <div className="text-lg font-bold text-gray-900">
                Week {currentWeek?.weekNumber || currentWeekIndex + 1}
              </div>
              <div className="text-sm text-gray-500">
                {currentWeekIndex + 1} of {totalWeeks}
              </div>
              {/* Weekly Info Display */}
              {firstNote && (
                <div 
                  className="mt-2 text-xs text-gray-700 bg-blue-50 px-3 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => setIsWeeklyInfoModalOpen(true)}
                  title="Click to view/edit all weekly notes"
                >
                  {firstNote}
                </div>
              )}
              {/* Weekly Info Button */}
              <div className="mt-2">
                <button
                  onClick={() => setIsWeeklyInfoModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors mx-auto"
                >
                  <FileText size={14} />
                  {firstNote ? 'Edit Weekly Info' : 'Add Weekly Info'}
                </button>
              </div>
            </div>

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
      )}

      {/* Days Table */}
      <div ref={tableWrapperRef} className="bg-white rounded-lg shadow-md relative mb-6">
        <div className="relative">
          <div 
            ref={tableContainerRef}
            className="overflow-x-auto overflow-y-visible table-scrollbar" 
          >
            <table className="text-sm" style={{ minWidth: '2200px', width: '100%' }}>
            <thead className="bg-blue-600 text-white sticky top-0 z-20 shadow-md">
             <tr>
               <th className="border border-gray-400 px-1 py-2 text-xs font-bold sticky-header-1 w-[50px] min-w-[50px]" rowSpan={2}>
                 No<br/>workouts
               </th>
               <th className="border border-gray-400 px-1 py-2 text-xs font-bold sticky-header-2 w-[50px] min-w-[50px]" rowSpan={2}>
                 Color<br/>cycle
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-3 w-[90px] min-w-[90px]" rowSpan={2}>
                 Name<br/>cycle
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-4 w-[80px] min-w-[80px]" rowSpan={2}>
                 Dayname
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-5 w-[80px] min-w-[80px]" rowSpan={2}>
                 Date
               </th>
               <th className="border border-gray-400 px-1 py-2 text-xs font-bold sticky-header-6 w-[60px] min-w-[60px]" rowSpan={2}>
                 Match<br/>done
               </th>
               <th className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-header-7 w-[80px] min-w-[80px]" rowSpan={2}>
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
              
              {/* Day Totals */}
              <th className="border border-gray-400 px-2 py-1 text-xs font-bold bg-green-100" colSpan={3}>
                Day Totals
              </th>
              
              <th 
                className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-options-header bg-blue-600 w-[500px] min-w-[500px]" 
                rowSpan={2}
              >
                Options
              </th>
            </tr>
            <tr>
              {/* S1 sub-headers */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[40px] min-w-[40px]">ico</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[80px] min-w-[80px]">Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[90px] min-w-[90px]">name</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[70px] min-w-[70px]">Distance</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[70px] min-w-[70px]">Duration</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[40px] min-w-[40px]">K</th>
              
              {/* S2 sub-headers */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[40px] min-w-[40px]">ico</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[80px] min-w-[80px]">Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[90px] min-w-[90px]">name</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[70px] min-w-[70px]">Distance</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[70px] min-w-[70px]">Duration</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[40px] min-w-[40px]">K</th>
              
              {/* S3 sub-headers */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[40px] min-w-[40px]">ico</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[80px] min-w-[80px]">Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[90px] min-w-[90px]">name</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[70px] min-w-[70px]">Distance</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[70px] min-w-[70px]">Duration</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[40px] min-w-[40px]">K</th>
              
              {/* S4 sub-headers */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[40px] min-w-[40px]">ico</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[80px] min-w-[80px]">Sport</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[90px] min-w-[90px]">name</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[70px] min-w-[70px]">Distance</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[70px] min-w-[70px]">Duration</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold w-[40px] min-w-[40px]">K</th>
              
              {/* Day Totals sub-headers */}
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-green-100 w-[80px] min-w-[80px]">Distance</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-green-100 w-[70px] min-w-[70px]">Duration</th>
              <th className="border border-gray-400 px-1 py-1 text-xs font-bold bg-green-100 w-[50px] min-w-[50px]">K</th>
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
                  onEditDay={onEditDay}
                  onAddWorkout={onAddWorkout}
                  onCopyDay={onCopyDay}
                  onMoveDay={onMoveDay}
                  onDeleteDay={onDeleteDay}
                />
                
                {/* Expanded Workouts Section */}
                  {expandedDaysSet.has(day.id) && (
                    <tr>
                     <td colSpan={32} className="p-0 bg-gray-50" style={{ position: 'relative' }}>
                      <div className="p-4">
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
                          />
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-xs">
                            No workouts scheduled for this day
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
      
      {/* Fixed Horizontal Scrollbar - Always visible at bottom */}
      <div 
        ref={scrollbarRef}
        className="overflow-x-auto custom-scrollbar bg-gradient-to-b from-gray-300 to-gray-200 border-t-2 border-blue-400 shadow-lg"
        style={{ 
          position: 'fixed',
          bottom: 0,
          height: '22px',
          zIndex: 1000
        }}
        title="Horizontal scroll - Drag to navigate table"
      >
        <div style={{ height: '1px', minWidth: '2200px', width: '2200px' }}></div>
      </div>

      {/* Weekly Info Modal */}
      <WeeklyInfoModal
        isOpen={isWeeklyInfoModalOpen}
        onClose={() => setIsWeeklyInfoModalOpen(false)}
        weekNumber={currentWeek?.weekNumber || currentWeekIndex + 1}
        initialNotes={currentWeekNotes}
        onSave={handleSaveWeeklyNotes}
      />
    </div>
  );
}

