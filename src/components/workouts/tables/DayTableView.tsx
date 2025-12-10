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
  expandedDays,
  expandedWorkouts,
  onToggleDay,
  onToggleWorkout,
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
  const [weeklyNotes, setWeeklyNotes] = useState<Record<number, string[]>>({});
  const [dayInfoOpenForDay, setDayInfoOpenForDay] = useState<string | null>(null);
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

  const handleShowDayInfo = (day: any) => {
    // Toggle day info: if already open for this day, close it; otherwise, open it
    setDayInfoOpenForDay(prev => prev === day.id ? null : day.id);
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

            <div className="flex-1 flex items-center justify-center gap-6">
              <div className="text-lg font-bold text-gray-900">
                Week {currentWeek?.weekNumber || currentWeekIndex + 1}
              </div>
              
              {/* Weekly Information - Right side of week number */}
              {firstNote && (
                <div className="text-sm text-gray-700 max-w-md px-4 border-l-2 border-gray-200">
                  {firstNote}
                </div>
              )}
              
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
                className="border border-gray-400 px-2 py-2 text-xs font-bold sticky-options-header bg-blue-600 w-[250px] min-w-[250px]" 
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
                  onShowDayInfo={handleShowDayInfo}
                  onCopyDay={onCopyDay}
                  onMoveDay={onMoveDay}
                  onPasteDay={onPasteDay}
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
                              <div className="grid grid-cols-2 gap-4">
                                {/* Left Column */}
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Number of Workouts</label>
                                    <div className="text-sm text-gray-800">
                                      {day.workouts?.length || 0} / 3 
                                      <span className="text-xs text-gray-500 ml-2">(max 3 workouts per day)</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Right Column */}
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Period Name</label>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded-full border border-gray-400"
                                        style={{ backgroundColor: day.period?.color || '#9CA3AF' }}
                                      />
                                      <span className="text-sm text-gray-800">{day.period?.name || 'No Period'}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Weather</label>
                                    <div className="text-sm text-gray-800">{day.weather || '—'}</div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Feeling Status</label>
                                    <div className="text-sm text-gray-800">{day.feelingStatus || '—'}</div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                                    <div className="text-sm text-gray-800">{day.notes || 'No notes'}</div>
                                  </div>
                                </div>
                              </div>
                              
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
      
      {/* Horizontal Scrollbar - Synced with table */}
      <div 
        ref={scrollbarRef}
        className="overflow-x-auto custom-scrollbar bg-gradient-to-b from-gray-300 to-gray-200 border-t-2 border-blue-400 shadow-sm"
        style={{ 
          height: '22px',
          position: 'relative',
          zIndex: 10
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

