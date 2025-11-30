'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Year Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentYear(currentYear - 1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Previous Year"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-3xl font-bold text-gray-900">
          {currentYear}
        </h2>
        
        <button
          onClick={() => setCurrentYear(currentYear + 1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Next Year"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 12 Months Grid - 4 columns x 3 rows */}
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

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((item, dayIndex) => {
                  if (!item) {
                    return <div key={`empty-${dayIndex}`} className="aspect-square"></div>;
                  }

                  const { date, workoutDay } = item;
                  const hasWorkouts = workoutDay && workoutDay.workouts && workoutDay.workouts.length > 0;
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={dayIndex}
                      onClick={() => workoutDay && onDayClick?.(workoutDay)}
                      className={`aspect-square flex items-center justify-center text-xs rounded transition-all ${
                        hasWorkouts
                          ? 'bg-blue-500 text-white font-bold cursor-pointer hover:bg-blue-600'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      } ${isToday ? 'ring-2 ring-green-500 ring-inset' : ''}`}
                      title={workoutDay ? `Week ${workoutDay.weekNumber}${hasWorkouts ? `, ${workoutDay.workouts.length} workout(s)` : ''}` : ''}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Has Workouts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
          <span>No Workouts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 ring-2 ring-green-500 rounded"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

