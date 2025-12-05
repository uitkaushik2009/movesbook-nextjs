'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface SportSummary {
  sport: string;
  icon: string;
  name: string; // Section name
  distance: number;
  duration: string;
  color: string;
}

interface DayRowTableProps {
  day: any;
  currentWeek: any;
  isExpanded: boolean;
  onToggleDay: (dayId: string) => void;
  onEditDay?: (day: any) => void;
  onAddWorkout?: (day: any) => void;
  onCopyDay?: (day: any) => void;
  onMoveDay?: (day: any) => void;
  onDeleteDay?: (day: any) => void;
}

// Helper to get sport icon
const getSportIcon = (sport: string): string => {
  const icons: Record<string, string> = {
    'SWIM': '🏊',
    'BIKE': '🚴',
    'RUN': '🏃',
    'BODY_BUILDING': '💪',
    'ROWING': '🚣',
    'SKATE': '⛸️',
    'GYMNASTIC': '🤸',
    'STRETCHING': '🧘',
    'PILATES': '🧘',
    'SKI': '⛷️',
    'TECHNICAL_MOVES': '⚙️',
    'FREE_MOVES': '🤾'
  };
  return icons[sport] || '🏋️';
};

// Calculate sport summaries for the day (up to 4 sports)
const calculateSportSummaries = (day: any): SportSummary[] => {
  if (!day.workouts || day.workouts.length === 0) {
    return [];
  }

  const sportMap = new Map<string, SportSummary>();

  day.workouts.forEach((workout: any) => {
    if (workout.moveframes) {
      workout.moveframes.forEach((moveframe: any) => {
        const sport = moveframe.sport;
        const sectionName = moveframe.section?.name || 'No Section';
        const sectionColor = moveframe.section?.color || '#E5E7EB';
        
        if (!sportMap.has(sport)) {
          sportMap.set(sport, {
            sport,
            icon: getSportIcon(sport),
            name: sectionName,
            distance: 0,
            duration: '0:00',
            color: sectionColor
          });
        }

        const summary = sportMap.get(sport)!;
        
        // Sum distances from movelaps
        if (moveframe.movelaps) {
          moveframe.movelaps.forEach((movelap: any) => {
            if (movelap.distance) {
              summary.distance += Number(movelap.distance);
            }
          });
        }
      });
    }
  });

  // Return up to 4 sports
  return Array.from(sportMap.values()).slice(0, 4);
};

// Calculate day totals (sum of all sports)
const calculateDayTotals = (day: any) => {
  if (!day.workouts || day.workouts.length === 0) {
    return { totalDistance: 0, totalDuration: '0:00', totalK: 0 };
  }

  let totalDistance = 0;

  day.workouts.forEach((workout: any) => {
    if (workout.moveframes) {
      workout.moveframes.forEach((moveframe: any) => {
        if (moveframe.movelaps) {
          moveframe.movelaps.forEach((movelap: any) => {
            if (movelap.distance) {
              totalDistance += Number(movelap.distance);
            }
          });
        }
      });
    }
  });

  return {
    totalDistance,
    totalDuration: '0:00', // TODO: Calculate actual duration
    totalK: Math.round(totalDistance / 1000)
  };
};

export default function DayRowTable({
  day,
  currentWeek,
  isExpanded,
  onToggleDay,
  onEditDay,
  onAddWorkout,
  onCopyDay,
  onMoveDay,
  onDeleteDay
}: DayRowTableProps) {
  const hasWorkouts = day.workouts && day.workouts.length > 0;
  const dayWithWeek = { ...day, weekNumber: currentWeek?.weekNumber };
  const sportSummaries = calculateSportSummaries(day);
  const dayTotals = calculateDayTotals(day);
  
  // Make day row a drop zone
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.id}`,
    data: {
      type: 'day',
      day: dayWithWeek
    }
  });

  // Format date
  const dayDate = new Date(day.date);
  const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
  const dateFormatted = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const rowBgColor = isOver ? 'bg-yellow-100' : hasWorkouts ? 'bg-white' : 'bg-gray-50';
  const bgStyle = isOver ? '#fef3c7' : (hasWorkouts ? 'white' : '#f9fafb');
  
  return (
    <tr
      ref={setNodeRef}
      className={`border-b border-gray-300 hover:bg-blue-50 transition-colors ${rowBgColor}`}
    >
      {/* No Workouts Checkbox */}
      <td className="border border-gray-300 px-1 py-2 text-center sticky-col-1 w-[50px] min-w-[50px]" style={{ backgroundColor: bgStyle }}>
        <input
          type="checkbox"
          checked={!hasWorkouts}
          readOnly
          className="w-4 h-4 cursor-pointer"
          title={hasWorkouts ? 'Has workouts' : 'No workouts'}
        />
      </td>

      {/* Color Cycle (Period Color) */}
      <td className="border border-gray-300 px-1 py-2 text-center sticky-col-2 w-[50px] min-w-[50px]" style={{ backgroundColor: bgStyle }}>
        <div
          className="w-6 h-6 rounded-full mx-auto border border-gray-400"
          style={{ backgroundColor: day.period?.color || '#9CA3AF' }}
          title={day.period?.name || 'No period'}
        />
      </td>

      {/* Name Cycle (Period Name) */}
      <td className="border border-gray-300 px-2 py-2 text-xs font-medium sticky-col-3 w-[90px] min-w-[90px]" style={{ backgroundColor: bgStyle }}>
        {day.period?.name || '—'}
      </td>

      {/* Dayname */}
      <td 
        className="border border-gray-300 px-2 py-2 text-xs font-bold cursor-pointer hover:bg-blue-100 sticky-col-4 w-[80px] min-w-[80px]"
        style={{ backgroundColor: bgStyle }}
        onClick={() => onToggleDay(day.id)}
        title="Click to expand/collapse"
      >
        <div className="flex items-center gap-1">
          <span>{isExpanded ? '▼' : '▶'}</span>
          <span>{dayName}</span>
        </div>
      </td>

      {/* Date */}
      <td className="border border-gray-300 px-2 py-2 text-xs sticky-col-5 w-[80px] min-w-[80px]" style={{ backgroundColor: bgStyle }}>
        {dateFormatted}
      </td>

      {/* Match Done (Workout Completion Status) */}
      <td className="border border-gray-300 px-1 py-2 text-center sticky-col-6 w-[60px] min-w-[60px]" style={{ backgroundColor: bgStyle }}>
        <input
          type="checkbox"
          checked={hasWorkouts}
          readOnly
          className="w-4 h-4"
          title={hasWorkouts ? 'Workouts planned' : 'No workouts'}
        />
      </td>

      {/* Workout Sessions - Show numbers with symbols for each workout */}
      <td className="border border-gray-300 px-1 py-2 text-center sticky-col-7 w-[120px] min-w-[120px]" style={{ backgroundColor: bgStyle }}>
        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3].map((num) => {
            const workout = day.workouts?.[num - 1];
            const symbols = ['○', '□', '△'];
            const symbol = symbols[num - 1];
            const hasData = workout && workout.moveframes && workout.moveframes.length > 0;
            const colorClass = hasData ? 'text-black' : 'text-gray-400';
            
            return (
              <span 
                key={num} 
                className={`text-xs font-bold ${colorClass} flex items-center gap-0.5`}
                title={hasData ? `Workout ${num} (has data)` : `Workout ${num} (no data)`}
              >
                {num}<span className="text-sm">{symbol}</span>
              </span>
            );
          })}
        </div>
      </td>

      {/* S1 - Sport 1 */}
      <td className="border border-gray-300 px-1 py-1 text-xs w-[40px] min-w-[40px]">
        {sportSummaries[0] ? (
          <div className="flex items-center justify-center">
            <span className="text-base">{sportSummaries[0].icon}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs w-[80px] min-w-[80px]">
        {sportSummaries[0]?.sport?.replace('_', ' ') || '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs w-[90px] min-w-[90px]">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full border border-gray-400"
            style={{ backgroundColor: sportSummaries[0]?.color || '#E5E7EB' }}
            title={sportSummaries[0]?.name || 'No section'}
          />
          <span className="truncate">{sportSummaries[0]?.name || '—'}</span>
        </div>
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-right w-[70px] min-w-[70px]">
        {sportSummaries[0] ? `${sportSummaries[0].distance}m` : '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-center w-[70px] min-w-[70px]">
        {sportSummaries[0]?.duration || '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-center w-[40px] min-w-[40px]">
        {sportSummaries[0] ? Math.round(sportSummaries[0].distance / 1000) : '—'}
      </td>

      {/* S2 - Sport 2 */}
      <td className="border border-gray-300 px-1 py-1 text-xs w-[40px] min-w-[40px]">
        {sportSummaries[1] ? (
          <div className="flex items-center justify-center">
            <span className="text-base">{sportSummaries[1].icon}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs w-[80px] min-w-[80px]">
        {sportSummaries[1]?.sport?.replace('_', ' ') || '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs w-[90px] min-w-[90px]">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full border border-gray-400"
            style={{ backgroundColor: sportSummaries[1]?.color || '#E5E7EB' }}
            title={sportSummaries[1]?.name || 'No section'}
          />
          <span className="truncate">{sportSummaries[1]?.name || '—'}</span>
        </div>
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-right w-[70px] min-w-[70px]">
        {sportSummaries[1] ? `${sportSummaries[1].distance}m` : '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-center w-[70px] min-w-[70px]">
        {sportSummaries[1]?.duration || '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-center w-[40px] min-w-[40px]">
        {sportSummaries[1] ? Math.round(sportSummaries[1].distance / 1000) : '—'}
      </td>

      {/* S3 - Sport 3 */}
      <td className="border border-gray-300 px-1 py-1 text-xs w-[40px] min-w-[40px]">
        {sportSummaries[2] ? (
          <div className="flex items-center justify-center">
            <span className="text-base">{sportSummaries[2].icon}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs w-[80px] min-w-[80px]">
        {sportSummaries[2]?.sport?.replace('_', ' ') || '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs w-[90px] min-w-[90px]">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full border border-gray-400"
            style={{ backgroundColor: sportSummaries[2]?.color || '#E5E7EB' }}
            title={sportSummaries[2]?.name || 'No section'}
          />
          <span className="truncate">{sportSummaries[2]?.name || '—'}</span>
        </div>
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-right w-[70px] min-w-[70px]">
        {sportSummaries[2] ? `${sportSummaries[2].distance}m` : '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-center w-[70px] min-w-[70px]">
        {sportSummaries[2]?.duration || '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-center w-[40px] min-w-[40px]">
        {sportSummaries[2] ? Math.round(sportSummaries[2].distance / 1000) : '—'}
      </td>

      {/* S4 - Sport 4 */}
      <td className="border border-gray-300 px-1 py-1 text-xs w-[40px] min-w-[40px]">
        {sportSummaries[3] ? (
          <div className="flex items-center justify-center">
            <span className="text-base">{sportSummaries[3].icon}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs w-[80px] min-w-[80px]">
        {sportSummaries[3]?.sport?.replace('_', ' ') || '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs w-[90px] min-w-[90px]">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full border border-gray-400"
            style={{ backgroundColor: sportSummaries[3]?.color || '#E5E7EB' }}
            title={sportSummaries[3]?.name || 'No section'}
          />
          <span className="truncate">{sportSummaries[3]?.name || '—'}</span>
        </div>
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-right w-[70px] min-w-[70px]">
        {sportSummaries[3] ? `${sportSummaries[3].distance}m` : '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-center w-[70px] min-w-[70px]">
        {sportSummaries[3]?.duration || '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-center w-[40px] min-w-[40px]">
        {sportSummaries[3] ? Math.round(sportSummaries[3].distance / 1000) : '—'}
      </td>

      {/* Day Totals */}
      <td className="border border-gray-300 px-1 py-1 text-xs text-right font-bold bg-green-50 w-[80px] min-w-[80px]">
        {dayTotals.totalDistance > 0 ? `${dayTotals.totalDistance}m` : '—'}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-center font-bold bg-green-50 w-[70px] min-w-[70px]">
        {dayTotals.totalDuration}
      </td>
      <td className="border border-gray-300 px-1 py-1 text-xs text-center font-bold bg-green-50 w-[50px] min-w-[50px]">
        {dayTotals.totalK > 0 ? dayTotals.totalK : '—'}
      </td>

      {/* Options */}
      <td 
        className="border border-gray-300 px-2 py-1 sticky-options-col w-[500px] min-w-[500px]"
        style={{ backgroundColor: bgStyle }}
      >
        <div className="flex gap-1 flex-wrap justify-center items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddWorkout?.(dayWithWeek);
            }}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="Add Workout"
          >
            Add Workout
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditDay?.(dayWithWeek);
            }}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Edit Day Info"
          >
            Edit Day Info
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyDay?.(dayWithWeek);
            }}
            className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            title="Copy Day"
          >
            Copy
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDay?.(dayWithWeek);
            }}
            className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            title="Move Day"
          >
            Move
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteDay?.(dayWithWeek);
            }}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Delete Day"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

