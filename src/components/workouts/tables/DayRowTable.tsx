'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDroppable } from '@dnd-kit/core';
import { ChevronDown } from 'lucide-react';
import EditableCell from './EditableCell';
import { useColorSettings } from '@/hooks/useColorSettings';

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
  onShowDayInfo?: (day: any) => void;
  onCopyDay?: (day: any) => void;
  onMoveDay?: (day: any) => void;
  onPasteDay?: (day: any) => void;
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

export default function DayRowTable({
  day,
  currentWeek,
  isExpanded,
  onToggleDay,
  onEditDay,
  onAddWorkout,
  onShowDayInfo,
  onCopyDay,
  onMoveDay,
  onPasteDay,
  onDeleteDay
}: DayRowTableProps) {
  const { colors, getBorderStyle } = useColorSettings();
  const hasWorkouts = day.workouts && day.workouts.length > 0;
  const dayWithWeek = { ...day, weekNumber: currentWeek?.weekNumber };
  const sportSummaries = calculateSportSummaries(day);
  
  // Dropdown state
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Make day row a drop zone
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.id}`,
    data: {
      type: 'day',
      day: dayWithWeek
    }
  });
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside both the button and the dropdown content
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownContentRef.current && !dropdownContentRef.current.contains(target)
      ) {
        setIsOptionsOpen(false);
      }
    };
    
    if (isOptionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOptionsOpen]);

  // Format date
  const dayDate = new Date(day.date);
  const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
  const dateFormatted = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Determine if this is an even day (for alternate row coloring)
  const dayOfWeek = dayDate.getDay();
  const isEvenDay = dayOfWeek % 2 === 0;
  
  // Use custom colors from settings
  const rowBgColor = isOver 
    ? colors.selectedRow 
    : (isEvenDay ? colors.dayAlternateRow : colors.dayHeader);
  const rowTextColor = isOver 
    ? colors.selectedRowText 
    : (isEvenDay ? colors.dayAlternateRowText : colors.dayHeaderText);
  const bgStyle = rowBgColor;
  const borderStyle = getBorderStyle('day');
  
  return (
    <tr
      ref={setNodeRef}
      className="day-row-table border-b transition-colors hover:opacity-90"
      style={{
        backgroundColor: bgStyle,
        color: rowTextColor,
        border: borderStyle
      }}
    >
      {/* No Workouts Checkbox */}
      <td className="px-1 py-2 text-center sticky-col-1 w-[50px] min-w-[50px]" style={{ backgroundColor: bgStyle, color: rowTextColor, border: borderStyle }}>
        <input
          type="checkbox"
          checked={!hasWorkouts}
          readOnly
          className="w-4 h-4 cursor-pointer"
          title={hasWorkouts ? 'Has workouts' : 'No workouts'}
        />
      </td>

      {/* Color Cycle (Period Color) */}
      <td className="px-1 py-2 text-center sticky-col-2 w-[50px] min-w-[50px]" style={{ backgroundColor: bgStyle, color: rowTextColor, border: borderStyle }}>
        <div
          className="w-6 h-6 rounded-full mx-auto border border-gray-400"
          style={{ backgroundColor: day.period?.color || '#9CA3AF' }}
          title={day.period?.name || 'No period'}
        />
      </td>

      {/* Name Cycle (Period Name) */}
      <td className="px-2 py-2 text-xs font-medium sticky-col-3 w-[90px] min-w-[90px]" style={{ backgroundColor: bgStyle, color: rowTextColor, border: borderStyle || 'none' }}>
        {day.period?.name || '—'}
      </td>

      {/* Dayname */}
      <td 
        className="border border-gray-200 px-2 py-2 text-xs font-bold cursor-pointer hover:bg-blue-100 sticky-col-4 w-[80px] min-w-[80px]"
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
      <td className="border border-gray-200 px-2 py-2 text-xs sticky-col-5 w-[80px] min-w-[80px]" style={{ backgroundColor: bgStyle }}>
        {dateFormatted}
      </td>

      {/* Match Done (Workout Completion Status) */}
      <td className="border border-gray-200 px-1 py-2 text-center sticky-col-6 w-[60px] min-w-[60px]" style={{ backgroundColor: bgStyle }}>
        <input
          type="checkbox"
          checked={hasWorkouts}
          readOnly
          className="w-4 h-4"
          title={hasWorkouts ? 'Workouts planned' : 'No workouts'}
        />
      </td>

      {/* Workout Sessions - Show numbers with symbols for each workout */}
      <td className="border border-gray-200 px-1 py-2 text-center sticky-col-7" style={{ backgroundColor: bgStyle }}>
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
      <td className="border border-gray-200 px-1 py-1 text-xs">
        {sportSummaries[0] ? (
          <div className="flex items-center justify-center">
            <span className="text-base">{sportSummaries[0].icon}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs">
        {sportSummaries[0]?.sport?.replace('_', ' ') || '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full border border-gray-400"
            style={{ backgroundColor: sportSummaries[0]?.color || '#E5E7EB' }}
            title={sportSummaries[0]?.name || 'No section'}
          />
          <span className="truncate">{sportSummaries[0]?.name || '—'}</span>
        </div>
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-right">
        {sportSummaries[0] ? `${sportSummaries[0].distance}m` : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center">
        {sportSummaries[0]?.duration || '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center">
        {sportSummaries[0] ? Math.round(sportSummaries[0].distance / 1000) : '—'}
      </td>

      {/* S2 - Sport 2 */}
      <td className="border border-gray-200 px-1 py-1 text-xs">
        {sportSummaries[1] ? (
          <div className="flex items-center justify-center">
            <span className="text-base">{sportSummaries[1].icon}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs">
        {sportSummaries[1]?.sport?.replace('_', ' ') || '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full border border-gray-400"
            style={{ backgroundColor: sportSummaries[1]?.color || '#E5E7EB' }}
            title={sportSummaries[1]?.name || 'No section'}
          />
          <span className="truncate">{sportSummaries[1]?.name || '—'}</span>
        </div>
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-right">
        {sportSummaries[1] ? `${sportSummaries[1].distance}m` : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center">
        {sportSummaries[1]?.duration || '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center">
        {sportSummaries[1] ? Math.round(sportSummaries[1].distance / 1000) : '—'}
      </td>

      {/* S3 - Sport 3 */}
      <td className="border border-gray-200 px-1 py-1 text-xs">
        {sportSummaries[2] ? (
          <div className="flex items-center justify-center">
            <span className="text-base">{sportSummaries[2].icon}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs">
        {sportSummaries[2]?.sport?.replace('_', ' ') || '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full border border-gray-400"
            style={{ backgroundColor: sportSummaries[2]?.color || '#E5E7EB' }}
            title={sportSummaries[2]?.name || 'No section'}
          />
          <span className="truncate">{sportSummaries[2]?.name || '—'}</span>
        </div>
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-right">
        {sportSummaries[2] ? `${sportSummaries[2].distance}m` : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center">
        {sportSummaries[2]?.duration || '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center">
        {sportSummaries[2] ? Math.round(sportSummaries[2].distance / 1000) : '—'}
      </td>

      {/* S4 - Sport 4 */}
      <td className="border border-gray-200 px-1 py-1 text-xs">
        {sportSummaries[3] ? (
          <div className="flex items-center justify-center">
            <span className="text-base">{sportSummaries[3].icon}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs">
        {sportSummaries[3]?.sport?.replace('_', ' ') || '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full border border-gray-400"
            style={{ backgroundColor: sportSummaries[3]?.color || '#E5E7EB' }}
            title={sportSummaries[3]?.name || 'No section'}
          />
          <span className="truncate">{sportSummaries[3]?.name || '—'}</span>
        </div>
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-right">
        {sportSummaries[3] ? `${sportSummaries[3].distance}m` : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center">
        {sportSummaries[3]?.duration || '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center">
        {sportSummaries[3] ? Math.round(sportSummaries[3].distance / 1000) : '—'}
      </td>

      {/* Options */}
      <td 
        className="border border-gray-200 px-1 py-1 sticky-options-col"
        style={{ backgroundColor: bgStyle }}
      >
        <div className="flex gap-1 justify-center items-center relative" ref={dropdownRef}>
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditDay?.(dayWithWeek);
            }}
            className="px-2 py-1 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
            title="Edit Day Info"
          >
            Edit
          </button>
          
          {/* Option Button with Dropdown */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsOptionsOpen(!isOptionsOpen);
              }}
              className="px-2 py-1 text-[11px] bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium flex items-center gap-1"
              title="More Options"
            >
              Option
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {/* Dropdown Menu - Rendered via Portal */}
            {isOptionsOpen && isMounted && ReactDOM.createPortal(
              <div 
                ref={dropdownContentRef}
                className="fixed bg-white border border-gray-300 rounded-lg shadow-2xl z-[99999] min-w-[160px]" 
                style={{
                  top: `${(buttonRef.current?.getBoundingClientRect().bottom || 0) + 4}px`,
                  left: `${(buttonRef.current?.getBoundingClientRect().left || 0)}px`
                }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOptionsOpen(false);
                    onAddWorkout?.(dayWithWeek);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <span className="text-blue-600">➕</span>
                  <span>Add a Workout</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOptionsOpen(false);
                    onShowDayInfo?.(dayWithWeek);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] hover:bg-cyan-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                >
                  <span className="text-cyan-600">ℹ️</span>
                  <span>Day info</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOptionsOpen(false);
                    onCopyDay?.(dayWithWeek);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] hover:bg-purple-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                >
                  <span className="text-purple-600">📋</span>
                  <span>Copy</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOptionsOpen(false);
                    onMoveDay?.(dayWithWeek);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] hover:bg-orange-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                >
                  <span className="text-orange-600">➜</span>
                  <span>Move</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOptionsOpen(false);
                    onPasteDay?.(dayWithWeek);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] hover:bg-green-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                >
                  <span className="text-green-600">📄</span>
                  <span>Paste</span>
                </button>
              </div>,
              document.body
            )}
          </div>
          
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteDay?.(dayWithWeek);
            }}
            className="px-2 py-1 text-[11px] bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
            title="Delete Day"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}




