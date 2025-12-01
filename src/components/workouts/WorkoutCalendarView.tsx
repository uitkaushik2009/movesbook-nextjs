'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface WorkoutCalendarViewProps {
  workoutPlan: any;
  periods: any[];
  onDayClick?: (day: any) => void;
}

export default function WorkoutCalendarView({
  workoutPlan,
  periods,
  onDayClick
}: WorkoutCalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'narrow' | 'wide'>('narrow');

  if (!workoutPlan || !workoutPlan.weeks || workoutPlan.weeks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No workout plan data available for calendar view.</p>
      </div>
    );
  }

  // Get all days from the workout plan
  const allDays = workoutPlan.weeks.flatMap((week: any) =>
    week.days.map((day: any) => ({ ...day, weekNumber: week.weekNumber }))
  );

  // Group days by month and year
  const daysByMonth: { [key: string]: any[] } = {};
  allDays.forEach((day: any) => {
    const date = new Date(day.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (!daysByMonth[monthKey]) {
      daysByMonth[monthKey] = [];
    }
    daysByMonth[monthKey].push(day);
  });

  // Generate calendar for a specific month
  const generateMonthCalendar = (year: number, month: number) => {
    const monthKey = `${year}-${month}`;
    const monthDays = daysByMonth[monthKey] || [];
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarDays: (any | null)[] = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const workoutDay = monthDays.find((d: any) => {
        const dDate = new Date(d.date);
        return dDate.getDate() === day;
      });
      calendarDays.push({ date, workoutDay });
    }

    return calendarDays;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get workout status color based on plan date and completion
  const getWorkoutStatusColor = (workout: any, dayDate: Date) => {
    if (!workout) return 'text-gray-300'; // White (not planned) - greyed out
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const workoutDate = new Date(dayDate);
    workoutDate.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const diffTime = workoutDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Check if workout is completed
    const isCompleted = workout.status === 'COMPLETED' || workout.isDone;
    const completionRate = workout.completionRate || 0;
    const isDifferent = workout.isDifferent || false;
    
    if (isCompleted) {
      if (isDifferent) {
        return 'text-blue-500'; // Blue = done but differently
      } else if (completionRate < 75) {
        return 'text-green-300'; // Light green = done at <75%
      } else {
        return 'text-green-600'; // Green = done at >75%
      }
    }
    
    // Planned but not done yet
    if (diffDays < 0) {
      return 'text-white'; // Past but not done = white
    } else if (diffDays <= 7) {
      return 'text-red-500'; // Red = planned this week
    } else if (diffDays <= 14) {
      return 'text-orange-500'; // Orange = planned next week
    } else {
      return 'text-yellow-400'; // Yellow = planned in future
    }
  };
  
  // Helper function to render workout symbols
  const renderWorkoutSymbols = (workouts: any[], dayDate: Date, inline: boolean = true) => {
    const symbols = ['○', '□', '△']; // Circle, Square, Triangle
    
    if (inline) {
      return (
        <div className="flex gap-0.5 justify-center mt-0.5">
          {symbols.map((symbol, idx) => {
            const workout = workouts?.[idx];
            const colorClass = getWorkoutStatusColor(workout, dayDate);
            
            return (
              <span
                key={idx}
                className={`text-xs font-bold ${colorClass}`}
              >
                {symbol}
              </span>
            );
          })}
        </div>
      );
    }
    
    return null;
  };
  
  // Get total distance for a workout
  const getWorkoutTotal = (workout: any) => {
    if (!workout || !workout.moveframes) return { distance: 0, coefficient: 1 };
    
    let totalDistance = 0;
    workout.moveframes.forEach((mf: any) => {
      totalDistance += mf.totalDistance || 0;
    });
    
    return { distance: totalDistance, coefficient: 1 }; // K coefficient placeholder
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Year Header with View Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentYear(currentYear - 1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Previous Year"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900">
            {currentYear}
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('narrow')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'narrow' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Narrow view - 12 months"
            >
              <Minimize2 className="w-4 h-4" />
              Narrow
            </button>
            <button
              onClick={() => setViewMode('wide')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'wide' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Wide view - 3 months with details"
            >
              <Maximize2 className="w-4 h-4" />
              Wide
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setCurrentYear(currentYear + 1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Next Year"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Narrow Mode - 12 Months Grid (4x3) with Workout Symbols */}
      {viewMode === 'narrow' && (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, monthIndex) => {
            const calendarDays = generateMonthCalendar(currentYear, monthIndex);
            
            return (
              <div key={monthIndex} className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                {/* Month Name */}
                <div className="text-center font-bold text-gray-800 text-sm mb-2">
                  {monthNames[monthIndex]}
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-center text-xs font-semibold text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days with Workout Symbols */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDays.map((item, dayIndex) => {
                    if (!item) {
                      return <div key={`empty-${dayIndex}`} className="h-10"></div>;
                    }

                    const { date, workoutDay } = item;
                    const hasWorkouts = workoutDay && workoutDay.workouts && workoutDay.workouts.length > 0;
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={dayIndex}
                        onClick={() => workoutDay && onDayClick?.(workoutDay)}
                        className={`h-10 flex flex-col items-center justify-center text-xs rounded transition-all ${
                          hasWorkouts
                            ? 'bg-gray-50 border border-gray-300 cursor-pointer hover:bg-gray-100'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        } ${isToday ? 'ring-2 ring-green-500 ring-inset' : ''}`}
                        title={workoutDay ? `Week ${workoutDay.weekNumber}${hasWorkouts ? `, ${workoutDay.workouts.length} workout(s)` : ''}` : ''}
                      >
                        <span className="font-semibold text-gray-800">{date.getDate()}</span>
                        {renderWorkoutSymbols(workoutDay?.workouts || [], date)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Wide Mode - 3 Months per Row with Vertical Workout Details */}
      {viewMode === 'wide' && (
        <div className="space-y-6">
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-3 gap-6">
              {Array.from({ length: 3 }, (_, colIndex) => {
                const monthIndex = rowIndex * 3 + colIndex;
                if (monthIndex >= 12) return null;
                
                const calendarDays = generateMonthCalendar(currentYear, monthIndex);
                
                return (
                  <div key={monthIndex} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                    {/* Month Name */}
                    <div className="text-center font-bold text-gray-900 text-lg mb-3">
                      {monthNames[monthIndex]}
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={idx} className="text-center text-sm font-semibold text-gray-700">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days with Vertical Workout Details */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((item, dayIndex) => {
                        if (!item) {
                          return <div key={`empty-${dayIndex}`} className="h-24"></div>;
                        }

                        const { date, workoutDay } = item;
                        const workouts = workoutDay?.workouts || [];
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return (
                          <div
                            key={dayIndex}
                            onClick={() => workoutDay && onDayClick?.(workoutDay)}
                            className={`h-24 p-1 border rounded transition-all cursor-pointer ${
                              workouts.length > 0
                                ? 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            } ${isToday ? 'ring-2 ring-green-500' : ''}`}
                            title={workoutDay ? `Week ${workoutDay.weekNumber}` : ''}
                          >
                            {/* Day Number */}
                            <div className="text-center font-bold text-sm text-gray-900 mb-1">
                              {date.getDate()}
                            </div>
                            
                            {/* Vertical Workout Symbols with Sports & Distance */}
                            <div className="space-y-0.5 text-xs overflow-hidden">
                              {[0, 1, 2].map((idx) => {
                                const symbols = ['○', '□', '△'];
                                const workout = workouts[idx];
                                const colorClass = getWorkoutStatusColor(workout, date);
                                
                                if (!workout) {
                                  return (
                                    <div key={idx} className="text-gray-300 text-center">
                                      {symbols[idx]}
                                    </div>
                                  );
                                }
                                
                                const { distance, coefficient } = getWorkoutTotal(workout);
                                const sports = Array.from(new Set(workout.moveframes?.map((mf: any) => mf.sport) || []));
                                
                                return (
                                  <div key={idx} className={`flex items-center gap-0.5 ${colorClass}`}>
                                    <span className="font-bold">{symbols[idx]}</span>
                                    <span className="truncate text-xs">
                                      {sports.slice(0, 2).join(',') || '-'}
                                    </span>
                                    {distance > 0 && (
                                      <span className="text-xs font-semibold">
                                        {(distance / 1000).toFixed(1)}k·K{coefficient}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-6 text-sm">
          {/* Workout Symbols */}
          <div className="space-y-1">
            <div className="font-semibold text-gray-700 mb-2">Workout Symbols:</div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-lg">○</span>
              <span>Workout #1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-lg">□</span>
              <span>Workout #2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-lg">△</span>
              <span>Workout #3</span>
            </div>
          </div>
          
          {/* Workout Status Colors */}
          <div className="space-y-1">
            <div className="font-semibold text-gray-700 mb-2">Workout Status Colors:</div>
            <div className="flex items-center gap-2">
              <span className="text-gray-300 font-bold text-lg">○</span>
              <span className="text-xs">White = Not planned</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 font-bold text-lg">○</span>
              <span className="text-xs">Yellow = Planned in future</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold text-lg">○</span>
              <span className="text-xs">Orange = Next week</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold text-lg">○</span>
              <span className="text-xs">Red = This week</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-bold text-lg">○</span>
              <span className="text-xs">Blue = Done differently</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-300 font-bold text-lg">○</span>
              <span className="text-xs">Light Green = Done &lt;75%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold text-lg">○</span>
              <span className="text-xs">Green = Done &gt;75%</span>
            </div>
          </div>
          
          {/* Day Indicators */}
          <div className="space-y-1">
            <div className="font-semibold text-gray-700 mb-2">Day Status:</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Has Workouts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
              <span>No Workouts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 ring-2 ring-green-500 rounded"></div>
              <span>Today</span>
            </div>
          </div>
          
          {/* Wide Mode Info */}
          {viewMode === 'wide' && (
            <div className="space-y-1">
              <div className="font-semibold text-gray-700 mb-2">Wide Mode Details:</div>
              <div className="text-xs text-gray-600">
                • Sports shown beside symbols<br />
                • Distance in kilometers (k)<br />
                • K = Coefficient (future)<br />
                • Max 2 sports shown per workout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

