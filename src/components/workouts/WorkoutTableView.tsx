'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Edit, Copy, Trash2, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';

interface WorkoutTableViewProps {
  workoutPlan: any;
  periods: any[];
  onEditWorkout?: (workout: any, day: any) => void;
  onEditDay?: (day: any) => void;
  onAddWorkout?: (day: any) => void;
  onAddMoveframe?: (workout: any) => void;
  onDataChanged?: () => void; // New prop to refresh data without full reload
}

export default function WorkoutTableView({
  workoutPlan,
  periods,
  onEditWorkout,
  onEditDay,
  onAddWorkout,
  onAddMoveframe,
  onDataChanged
}: WorkoutTableViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollbarStyle, setScrollbarStyle] = useState({ left: 0, width: '100%' });
  const [expandedOptions, setExpandedOptions] = useState<string | null>(null);
  const [copiedDay, setCopiedDay] = useState<any>(null);
  const [cutDay, setCutDay] = useState<any>(null);

  const toggleOptions = (dayId: string) => {
    setExpandedOptions(expandedOptions === dayId ? null : dayId);
  };

  const handleCopy = (day: any) => {
    setCopiedDay(day);
    setCutDay(null);
    setExpandedOptions(null);
  };

  const handleMove = (day: any) => {
    setCutDay(day);
    setCopiedDay(null);
    setExpandedOptions(null);
  };

  const handlePaste = async (targetDay: any) => {
    const sourceDay = copiedDay || cutDay;
    if (!sourceDay) {
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      // Copy all workouts from source day to target day
      const workoutsToCopy = sourceDay.workouts || [];
      
      for (const workout of workoutsToCopy) {
        // Create workout in target day
        const workoutResponse = await fetch('/api/workouts/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            workoutDayId: targetDay.id,
            sessionNumber: (targetDay.workouts?.length || 0) + 1,
            name: workout.name,
            code: workout.code,
            time: workout.time,
            location: workout.location,
            notes: workout.notes,
            status: 'PLANNED_FUTURE'
          })
        });

        if (!workoutResponse.ok) {
          console.error('Failed to copy workout:', await workoutResponse.json());
          continue;
        }

        const { session: newWorkout } = await workoutResponse.json();

        // Copy all moveframes for this workout
        for (const moveframe of (workout.moveframes || [])) {
          const moveframeResponse = await fetch('/api/workouts/moveframes', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              workoutSessionId: newWorkout.id,
              sport: moveframe.sport,
              type: moveframe.type,
              description: moveframe.description,
              sectionId: moveframe.sectionId,
              movelaps: moveframe.movelaps?.map((lap: any) => ({
                distance: lap.distance,
                speed: lap.speed,
                reps: lap.reps,
                pause: lap.pause,
                notes: lap.notes,
                status: 'PENDING'
              })) || []
            })
          });

          if (!moveframeResponse.ok) {
            console.error('Failed to copy moveframe:', await moveframeResponse.json());
          }
        }
      }

      // If it was a move (cut), delete workouts from source day
      if (cutDay) {
        for (const workout of workoutsToCopy) {
          await fetch(`/api/workouts/sessions/${workout.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        setCutDay(null);
      }

      setCopiedDay(null);
      setExpandedOptions(null);
      
      // Refresh data to show changes
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (error) {
      console.error('Error pasting workouts:', error);
    }
  };

  const handleShare = (day: any) => {
    // TODO: Implement share functionality
    setExpandedOptions(null);
  };

  const handleClear = async (day: any) => {
    if (!confirm(`Clear all workouts from ${getDayName(day.dayOfWeek)}?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      // Delete all workouts for this day
      const workoutsToDelete = day.workouts || [];
      
      for (const workout of workoutsToDelete) {
        await fetch(`/api/workouts/sessions/${workout.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      setExpandedOptions(null);
      
      // Refresh data to show changes
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (error) {
      console.error('Error clearing workouts:', error);
    }
  };

  useEffect(() => {
    const updateScrollbarPosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setScrollbarStyle({
          left: rect.left,
          width: `${rect.width}px`
        });
      }
    };

    updateScrollbarPosition();
    window.addEventListener('resize', updateScrollbarPosition);
    return () => window.removeEventListener('resize', updateScrollbarPosition);
  }, []);

  // Close accordion when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedOptions) {
        setExpandedOptions(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [expandedOptions]);
  
  if (!workoutPlan || !workoutPlan.weeks || workoutPlan.weeks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No workout data to display</p>
      </div>
    );
  }

  // Flatten all days from all weeks
  const allDays: any[] = [];
  workoutPlan.weeks.forEach((week: any) => {
    week.days?.forEach((day: any) => {
      allDays.push({ ...day, weekNumber: week.weekNumber });
    });
  });

  // Sort by date
  allDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dayOfWeek - 1] || 'Day';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper to get unique sports for a day (max 4)
  const getDaySports = (day: any): string[] => {
    const sports = new Set<string>();
    day.workouts?.forEach((workout: any) => {
      workout.moveframes?.forEach((mf: any) => {
        if (mf.sport) sports.add(mf.sport);
      });
    });
    return Array.from(sports).slice(0, 4); // Max 4 sports
  };

  // Helper to aggregate sport data for a workout
  const getWorkoutSportData = (workout: any, sport: string) => {
    let totalDistance = 0;
    let totalDuration = 0;
    let totalCalories = 0;

    workout.moveframes?.forEach((mf: any) => {
      if (mf.sport === sport) {
        mf.movelaps?.forEach((lap: any) => {
          if (lap.distance) totalDistance += lap.distance;
          // Add duration and calories calculations here
        });
      }
    });

    return {
      distance: totalDistance > 0 ? totalDistance : null,
      duration: totalDuration > 0 ? totalDuration : null,
      calories: totalCalories > 0 ? totalCalories : null
    };
  };

  const sportColors = [
    { header: 'bg-blue-100', cell: 'bg-blue-50' },
    { header: 'bg-green-100', cell: 'bg-green-50' },
    { header: 'bg-yellow-100', cell: 'bg-yellow-50' },
    { header: 'bg-red-100', cell: 'bg-red-50' }
  ];

  return (
    <div ref={containerRef} className="relative flex flex-col pb-8">
      {/* Main table container - horizontal scroll hidden, vertical scroll visible */}
      <div 
        className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-360px)] border border-gray-400 relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        id="main-table-scroll"
        onScroll={(e) => {
          // Sync with bottom scrollbar for horizontal scroll
          const bottomScroll = document.getElementById('bottom-scrollbar');
          if (bottomScroll) {
            bottomScroll.scrollLeft = e.currentTarget.scrollLeft;
          }
        }}
      >
        <table className="border-collapse text-xs" style={{ minWidth: '1600px', width: 'max-content' }}>
          {/* Header - Sticky to top */}
          <thead className="sticky top-0 z-40 bg-white shadow-sm">
            {/* CSS to hide horizontal scrollbar */}
            <style jsx>{`
              #main-table-scroll::-webkit-scrollbar {
                height: 0px;
              }
              #main-table-scroll::-webkit-scrollbar:vertical {
                width: 8px;
              }
            `}</style>
          <tr className="bg-gray-200 border-b-2 border-gray-400">
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky left-0 z-50 bg-gray-200" style={{width: '60px'}} rowSpan={2}>Week n.</th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200" style={{width: '60px', left: '60px'}} rowSpan={2}>Day week n.</th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200" style={{width: '80px', left: '120px'}} rowSpan={2}>Dayname</th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200" style={{width: '100px', left: '200px'}} rowSpan={2}>Date</th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200" style={{width: '100px', left: '300px'}} rowSpan={2}>Period</th>
            
            {/* S1-S4 Sports columns */}
            {[0, 1, 2, 3].map((sportIndex) => (
              <th key={sportIndex} className={`border border-gray-400 px-1 py-1 text-center font-bold ${sportColors[sportIndex].header}`} colSpan={4}>
                S{sportIndex + 1} ico
              </th>
            ))}
            
            <th className="border border-gray-400 px-1 py-1 text-center font-bold" style={{width: '60px'}} rowSpan={2}>Options</th>
          </tr>
          <tr className="bg-gray-100 border-b border-gray-400">
            {/* Sub-headers for each sport */}
            {[0, 1, 2, 3].map((sportIndex) => (
              <React.Fragment key={sportIndex}>
                <th className={`border border-gray-400 px-1 py-1 text-center font-semibold ${sportColors[sportIndex].cell}`} style={{width: '80px'}}>Sport</th>
                <th className={`border border-gray-400 px-1 py-1 text-center font-semibold ${sportColors[sportIndex].cell}`} style={{width: '70px'}}>Distance</th>
                <th className={`border border-gray-400 px-1 py-1 text-center font-semibold ${sportColors[sportIndex].cell}`} style={{width: '70px'}}>Duration</th>
                <th className={`border border-gray-400 px-1 py-1 text-center font-semibold ${sportColors[sportIndex].cell}`} style={{width: '50px'}}>K</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        {/* Body - Scrollable */}
        <tbody>
          {allDays.map((day: any) => {
            const dayWorkouts = (day.workouts || []).slice(0, 3); // Max 3 workouts
            const daySports = getDaySports(day);
            const hasWorkouts = dayWorkouts.length > 0;

            if (!hasWorkouts) {
              const isCopied = copiedDay?.id === day.id;
              const isCut = cutDay?.id === day.id;
              const rowBgClass = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : 'hover:bg-gray-50';
              
              const stickyBg = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : 'bg-white';
              
              return (
                <tr key={day.id} className={rowBgClass}>
                  <td className={`border border-gray-300 px-2 py-2 text-center font-semibold sticky left-0 z-10 ${stickyBg}`}>
                    {day.weekNumber}
                  </td>
                  <td className={`border border-gray-300 px-2 py-2 text-center sticky z-10 ${stickyBg}`} style={{left: '60px'}}>
                    {day.dayOfWeek}
                  </td>
                  <td className={`border border-gray-300 px-2 py-2 text-center font-medium sticky z-10 ${stickyBg}`} style={{left: '120px'}}>
                    {getDayName(day.dayOfWeek)}
                  </td>
                  <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: '200px'}}>
                    {formatDate(day.date)}
                  </td>
                  <td className={`border border-gray-300 px-2 py-1 text-center sticky z-10 ${stickyBg}`} style={{left: '300px'}}>
                    {day.period?.name || '-'}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center text-gray-400 italic" colSpan={16}>
                    No workouts
                  </td>
                  <td className="border border-gray-300 px-1 py-1 text-center">
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOptions(day.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded text-gray-600"
                        title="Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {expandedOptions === day.id && (
                        <div 
                          className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[120px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            onClick={() => handleCopy(day)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2"
                            title="Copy"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                          <button 
                            onClick={() => handleMove(day)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                            title="Move (Cut)"
                          >
                            <Edit className="w-3 h-3" /> Move
                          </button>
                          <button 
                            onClick={() => handlePaste(day)}
                            disabled={!copiedDay && !cutDay}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 ${
                              copiedDay || cutDay ? 'hover:bg-purple-50 text-purple-600' : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title="Paste"
                          >
                            📋 Paste
                          </button>
                          <button 
                            onClick={() => handleShare(day)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-green-50 flex items-center gap-2 border-t"
                            title="Share"
                          >
                            <Copy className="w-3 h-3" /> Share
                          </button>
                          <button 
                            onClick={() => handleClear(day)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 flex items-center gap-2 text-red-600"
                            title="Clear"
                          >
                            <Trash2 className="w-3 h-3" /> Clear
                          </button>
                          <button 
                            onClick={() => {
                              onAddWorkout?.(day);
                              setExpandedOptions(null);
                            }}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-green-50 flex items-center gap-2 text-green-600 border-t font-bold"
                            title="Add Workout"
                          >
                            + Add Workout
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }

            // Day with workouts
            return dayWorkouts.map((workout: any, workoutIndex: number) => {
              const isFirstWorkout = workoutIndex === 0;
              const isCopied = copiedDay?.id === day.id;
              const isCut = cutDay?.id === day.id;
              const rowBgClass = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : 'hover:bg-blue-50';
              
              const stickyBg = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : 'bg-white';
              
              return (
                <tr key={`${day.id}-${workout.id}`} className={rowBgClass}>
                  {isFirstWorkout && (
                    <>
                      <td className={`border border-gray-300 px-2 py-2 text-center font-semibold sticky left-0 z-10 ${stickyBg}`} rowSpan={dayWorkouts.length}>
                        {day.weekNumber}
                      </td>
                      <td className={`border border-gray-300 px-2 py-2 text-center sticky z-10 ${stickyBg}`} style={{left: '60px'}} rowSpan={dayWorkouts.length}>
                        {day.dayOfWeek}
                      </td>
                      <td className={`border border-gray-300 px-2 py-2 text-center font-medium sticky z-10 ${stickyBg}`} style={{left: '120px'}} rowSpan={dayWorkouts.length}>
                        {getDayName(day.dayOfWeek)}
                      </td>
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: '200px'}} rowSpan={dayWorkouts.length}>
                        {formatDate(day.date)}
                      </td>
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: '300px'}} rowSpan={dayWorkouts.length}>
                        <div className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: day.period?.color || '#3b82f6' }}>
                          {day.period?.name || 'Period'}
                        </div>
                      </td>
                    </>
                  )}
                  
                  {/* Sport columns - show data for each sport */}
                  {[0, 1, 2, 3].map((sportIndex) => {
                    const sport = daySports[sportIndex];
                    const sportData = sport ? getWorkoutSportData(workout, sport) : null;
                    
                    return (
                      <React.Fragment key={sportIndex}>
                        <td className={`border border-gray-300 px-1 py-1 text-center text-xs font-medium ${sportColors[sportIndex].cell}`}>
                          {sport || '-'}
                        </td>
                        <td className={`border border-gray-300 px-1 py-1 text-right text-xs ${sportColors[sportIndex].cell}`}>
                          {sportData?.distance || '-'}
                        </td>
                        <td className={`border border-gray-300 px-1 py-1 text-right text-xs ${sportColors[sportIndex].cell}`}>
                          {sportData?.duration || '-'}
                        </td>
                        <td className={`border border-gray-300 px-1 py-1 text-right text-xs ${sportColors[sportIndex].cell}`}>
                          {sportData?.calories || '-'}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  
                  {/* Options column - accordion for day and workout actions */}
                  {isFirstWorkout ? (
                    <td className="border border-gray-300 px-1 py-1 text-center" rowSpan={dayWorkouts.length}>
                      <div className="relative flex flex-col gap-1">
                        {/* Day Options Accordion */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOptions(day.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs flex items-center justify-center gap-1"
                          title="Day Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {expandedOptions === day.id && (
                          <div 
                            className="absolute right-full top-0 mr-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[120px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              onClick={() => handleCopy(day)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2"
                              title="Copy Day"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                            <button 
                              onClick={() => handleMove(day)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                              title="Move Day (Cut)"
                            >
                              <Edit className="w-3 h-3" /> Move
                            </button>
                            <button 
                              onClick={() => handlePaste(day)}
                              disabled={!copiedDay && !cutDay}
                              className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 ${
                                copiedDay || cutDay ? 'hover:bg-purple-50 text-purple-600' : 'text-gray-400 cursor-not-allowed'
                              }`}
                              title="Paste"
                            >
                              📋 Paste
                            </button>
                            <button 
                              onClick={() => handleShare(day)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-green-50 flex items-center gap-2 border-t"
                              title="Share Day"
                            >
                              <Copy className="w-3 h-3" /> Share
                            </button>
                            <button 
                              onClick={() => handleClear(day)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 flex items-center gap-2 text-red-600"
                              title="Clear Day"
                            >
                              <Trash2 className="w-3 h-3" /> Clear
                            </button>
                          </div>
                        )}
                        
                        {/* Workout Edit Buttons */}
                        <div className="border-t border-gray-300 pt-1 flex flex-col gap-0.5">
                          {dayWorkouts.map((wo: any, idx: number) => (
                            <button 
                              key={wo.id}
                              onClick={() => onEditWorkout?.(wo, day)}
                              className="text-blue-600 hover:bg-blue-100 px-1 py-0.5 rounded text-xs"
                              title={`Edit Workout ${idx + 1}`}
                            >
                              W{idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
    
    {/* Horizontal scrollbar - fixed at bottom of viewport, width matches sheet */}
    <div 
      className="fixed bottom-0 overflow-x-auto overflow-y-hidden bg-gray-200 border-t-2 border-gray-400 z-40"
      style={{ 
        height: '24px',
        left: `${scrollbarStyle.left}px`,
        width: scrollbarStyle.width
      }}
      onScroll={(e) => {
        // Control main table horizontal position
        const mainScroll = document.getElementById('main-table-scroll');
        if (mainScroll) {
          mainScroll.scrollLeft = e.currentTarget.scrollLeft;
        }
      }}
      id="bottom-scrollbar"
    >
      {/* Inner div with same width as table to create scrollbar */}
      <div style={{ width: '1600px', height: '1px' }}></div>
    </div>
  </div>
  );
}
