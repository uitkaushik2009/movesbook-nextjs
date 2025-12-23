'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { useDroppable } from '@dnd-kit/core';
import { ChevronDown } from 'lucide-react';
import EditableCell from './EditableCell';
import { useColorSettings } from '@/hooks/useColorSettings';
import { isImageIcon } from '@/utils/sportIcons';
import { useSportIconType } from '@/hooks/useSportIconType';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { calculateSportSummaries, type SportSummary } from '@/utils/workoutHelpers';

interface DayRowTableProps {
  day: any;
  currentWeek: any;
  isExpanded: boolean;
  onToggleDay: (dayId: string) => void;
  onToggleWorkout?: (workoutId: string) => void;  // Added for clickable workout numbers
  onExpandOnlyThisWorkout?: (workout: any, day: any) => void; // For expanding only one workout
  onExpandDayWithAllWorkouts?: (dayId: string, workouts: any[]) => void; // For row click
  onEditDay?: (day: any) => void;
  onAddWorkout?: (day: any) => void;
  onShowDayInfo?: (day: any) => void;
  onCopyDay?: (day: any) => void;
  onMoveDay?: (day: any) => void;
  onPasteDay?: (day: any) => void;
  onShareDay?: (day: any) => void;
  onExportPdfDay?: (day: any) => void;
  onPrintDay?: (day: any) => void;
  onDeleteDay?: (day: any) => void;
}

export default function DayRowTable({
  day,
  currentWeek,
  isExpanded,
  onToggleDay,
  onToggleWorkout,
  onExpandOnlyThisWorkout,
  onExpandDayWithAllWorkouts,
  onEditDay,
  onAddWorkout,
  onShowDayInfo,
  onCopyDay,
  onMoveDay,
  onPasteDay,
  onShareDay,
  onExportPdfDay,
  onPrintDay,
  onDeleteDay
}: DayRowTableProps) {
  const { colors, getBorderStyle } = useColorSettings();
  const iconType = useSportIconType();
  const hasWorkouts = day.workouts && day.workouts.length > 0;
  const dayWithWeek = { ...day, weekNumber: currentWeek?.weekNumber };
  const sportSummaries = calculateSportSummaries(day, iconType);
  const useImageIcons = isImageIcon(iconType);
  
  // Sort workouts by creation time (earliest = #1)
  const sortedWorkouts = day.workouts 
    ? [...day.workouts].sort((a, b) => {
        // Sort by id (earlier id = earlier created) or by createdAt timestamp
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : parseInt(a.id) || 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : parseInt(b.id) || 0;
        return timeA - timeB;
      })
    : [];
  
  // Dropdown state management (using custom hook)
  const {
    isOpen: isOptionsOpen,
    dropdownPosition,
    dropdownRef,
    dropdownContentRef,
    buttonRef,
    isMounted,
    toggleDropdown,
    closeDropdown
  } = useDropdownPosition();
  
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
  
  // Check if this day is Sunday (0) for week separator
  const isSunday = dayOfWeek === 0;
  
  return (
    <tr
      ref={setNodeRef}
      className={`day-row-table border-b transition-colors hover:opacity-90 cursor-pointer ${
        isSunday ? 'week-separator' : ''
      }`}
      style={{
        backgroundColor: bgStyle,
        color: rowTextColor,
        borderTop: borderStyle,
        borderLeft: borderStyle,
        borderRight: borderStyle,
        borderBottom: isSunday ? '4px solid black' : borderStyle
      }}
      onClick={() => {
        // Clicking on the row expands the day (shows workout headers) but collapses all moveframes
        if (onExpandDayWithAllWorkouts && sortedWorkouts.length > 0) {
          onExpandDayWithAllWorkouts(day.id, sortedWorkouts);
        } else if (onToggleDay) {
          // Fallback to regular toggle if no workouts
          onToggleDay(day.id);
        }
      }}
    >
      {/* No Workouts Checkbox */}
      <td className="px-1 py-2 text-center sticky-col-1 w-[50px] min-w-[50px]" style={{ backgroundColor: bgStyle, color: rowTextColor }}>
        <input
          type="checkbox"
          checked={!hasWorkouts}
          readOnly
          className="w-4 h-4 cursor-pointer"
          title={hasWorkouts ? 'Has workouts' : 'No workouts'}
        />
      </td>

      {/* Color Cycle (Period Color) */}
      <td className="px-1 py-2 text-center sticky-col-2 w-[50px] min-w-[50px]" style={{ backgroundColor: bgStyle, color: rowTextColor }}>
        <div
          className="w-6 h-6 rounded-full mx-auto border border-gray-400"
          style={{ backgroundColor: day.period?.color || '#9CA3AF' }}
          title={day.period?.name || 'No period'}
        />
      </td>

      {/* Name Cycle (Period Name) */}
      <td className="px-2 py-2 text-xs font-medium text-center sticky-col-3 w-[90px] min-w-[90px]" style={{ backgroundColor: bgStyle, color: rowTextColor }}>
        {day.period?.name || '—'}
      </td>

      {/* Week n. (Week Number) */}
      <td className="border border-gray-200 px-2 py-2 text-xs font-bold text-center sticky-col-4 w-[60px] min-w-[60px]" style={{ backgroundColor: bgStyle, color: rowTextColor }}>
        {currentWeek?.weekNumber || '—'}
      </td>

      {/* Day wk (Day Number of Week) */}
      <td className="border border-gray-200 px-2 py-2 text-xs font-bold text-center sticky-col-5 w-[50px] min-w-[50px]" style={{ backgroundColor: bgStyle, color: rowTextColor }}>
        {dayOfWeek === 0 ? 7 : dayOfWeek}
      </td>

      {/* Dayname */}
      <td 
        className="border border-gray-200 px-2 py-2 text-xs font-bold cursor-pointer hover:bg-blue-100 sticky-col-6 w-[80px] min-w-[80px]"
        style={{ backgroundColor: bgStyle }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent row click
          onToggleDay(day.id); // Toggle just the day (collapse/expand)
        }}
        title="Click to collapse/expand day only"
      >
        <div className="flex items-center justify-center gap-1">
          <span>{isExpanded ? '▼' : '▶'}</span>
          <span>{dayName}</span>
        </div>
      </td>

      {/* Date */}
      <td className="border border-gray-200 px-2 py-2 text-xs text-center sticky-col-7 w-[80px] min-w-[80px]" style={{ backgroundColor: bgStyle }}>
        {dateFormatted}
      </td>

      {/* Match Done (Workout Completion Status) */}
      <td className="border border-gray-200 px-1 py-2 text-center sticky-col-8 w-[60px] min-w-[60px]" style={{ backgroundColor: bgStyle }}>
        <input
          type="checkbox"
          checked={hasWorkouts}
          readOnly
          className="w-4 h-4"
          title={hasWorkouts ? 'Workouts planned' : 'No workouts'}
        />
      </td>

      {/* Workout Sessions - Show numbers with symbols for each workout + Day Description */}
      <td 
        className="border border-gray-200 px-1 py-2 text-center sticky-col-9" 
        style={{ backgroundColor: bgStyle }}
        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking on workout numbers
      >
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((num) => {
              const workout = sortedWorkouts[num - 1]; // Use sorted workouts
              const symbols = ['○', '□', '△'];
              const symbol = symbols[num - 1];
              const hasData = workout && workout.moveframes && workout.moveframes.length > 0;
              const colorClass = hasData ? 'text-black' : 'text-gray-400';
              
              return (
                <span 
                  key={num} 
                  className={`text-xs font-bold ${colorClass} flex items-center gap-0.5 ${workout ? 'cursor-pointer hover:bg-blue-200 px-1 rounded transition-colors' : ''}`}
                  title={workout ? `Click to expand ONLY Workout ${num}` : `Workout ${num} (not created)`}
                  onClick={(e) => {
                    if (workout && onExpandOnlyThisWorkout) {
                      e.stopPropagation();
                      console.log('🔢 User clicked workout number in day table:', num, workout.id);
                      // Expand ONLY this workout and collapse all others
                      onExpandOnlyThisWorkout(workout, day);
                    }
                  }}
                >
                  {num}<span className="text-sm">{symbol}</span>
                </span>
              );
          })}
          </div>
          
          {/* Day Description Text */}
          {day.description && (
            <div className="flex-1 text-[10px] text-gray-700 truncate px-2 max-w-[150px]" title={day.description}>
              {day.description}
            </div>
          )}
        </div>
      </td>

      {/* S1 - Sport 1 - Blue */}
      <td className="border border-gray-200 px-1 py-1 text-xs text-center bg-blue-100 text-black">
        {sportSummaries[0] ? (
          <div className="flex items-center justify-center gap-2">
            {useImageIcons ? (
              <img src={sportSummaries[0].icon} alt={sportSummaries[0].sport} className="w-5 h-5 object-cover rounded flex-shrink-0" />
            ) : (
              <span className="text-base flex-shrink-0">{sportSummaries[0].icon}</span>
            )}
            <span className="font-medium text-[10px]">{sportSummaries[0].sport}</span>
          </div>
        ) : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center bg-blue-100 text-black">
        {sportSummaries[0] ? (
          <div className="text-[10px]">
            <div>{sportSummaries[0].distance > 0 ? `${sportSummaries[0].distance}m` : '—'}</div>
            <div>{sportSummaries[0]?.duration || '—'}</div>
          </div>
        ) : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center text-black font-semibold bg-blue-100">
        {sportSummaries[0]?.mainWork || '—'}
      </td>

      {/* S2 - Sport 2 - Green */}
      <td className="border border-gray-200 px-1 py-1 text-xs text-center bg-green-100 text-black">
        {sportSummaries[1] ? (
          <div className="flex items-center justify-center gap-2">
            {useImageIcons ? (
              <img src={sportSummaries[1].icon} alt={sportSummaries[1].sport} className="w-5 h-5 object-cover rounded flex-shrink-0" />
            ) : (
              <span className="text-base flex-shrink-0">{sportSummaries[1].icon}</span>
            )}
            <span className="font-medium text-[10px]">{sportSummaries[1].sport}</span>
          </div>
        ) : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center bg-green-100 text-black">
        {sportSummaries[1] ? (
          <div className="text-[10px]">
            <div>{sportSummaries[1].distance > 0 ? `${sportSummaries[1].distance}m` : '—'}</div>
            <div>{sportSummaries[1]?.duration || '—'}</div>
          </div>
        ) : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center text-black font-semibold bg-green-100">
        {sportSummaries[1]?.mainWork || '—'}
      </td>

      {/* S3 - Sport 3 - Orange */}
      <td className="border border-gray-200 px-1 py-1 text-xs text-center bg-orange-100 text-black">
        {sportSummaries[2] ? (
          <div className="flex items-center justify-center gap-2">
            {useImageIcons ? (
              <img src={sportSummaries[2].icon} alt={sportSummaries[2].sport} className="w-5 h-5 object-cover rounded flex-shrink-0" />
            ) : (
              <span className="text-base flex-shrink-0">{sportSummaries[2].icon}</span>
            )}
            <span className="font-medium text-[10px]">{sportSummaries[2].sport}</span>
          </div>
        ) : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center bg-orange-100 text-black">
        {sportSummaries[2] ? (
          <div className="text-[10px]">
            <div>{sportSummaries[2].distance > 0 ? `${sportSummaries[2].distance}m` : '—'}</div>
            <div>{sportSummaries[2]?.duration || '—'}</div>
          </div>
        ) : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center text-black font-semibold bg-orange-100">
        {sportSummaries[2]?.mainWork || '—'}
      </td>

      {/* S4 - Sport 4 - Pink */}
      <td className="border border-gray-200 px-1 py-1 text-xs text-center bg-pink-100 text-black">
        {sportSummaries[3] ? (
          <div className="flex items-center justify-center gap-2">
            {useImageIcons ? (
              <img src={sportSummaries[3].icon} alt={sportSummaries[3].sport} className="w-5 h-5 object-cover rounded flex-shrink-0" />
            ) : (
              <span className="text-base flex-shrink-0">{sportSummaries[3].icon}</span>
            )}
            <span className="font-medium text-[10px]">{sportSummaries[3].sport}</span>
          </div>
        ) : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center bg-pink-100 text-black">
        {sportSummaries[3] ? (
          <div className="text-[10px]">
            <div>{sportSummaries[3].distance > 0 ? `${sportSummaries[3].distance}m` : '—'}</div>
            <div>{sportSummaries[3]?.duration || '—'}</div>
          </div>
        ) : '—'}
      </td>
      <td className="border border-gray-200 px-1 py-1 text-xs text-center text-black font-semibold bg-pink-100">
        {sportSummaries[3]?.mainWork || '—'}
      </td>

      {/* Options */}
      <td 
        className="border border-gray-200 px-1 py-1 sticky-options-col"
        style={{ backgroundColor: bgStyle }}
        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking on buttons
      >
        <div className="flex gap-1 justify-center items-center relative" ref={dropdownRef}>
          {/* Day Info Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowDayInfo?.(dayWithWeek);
            }}
            className="px-2 py-1 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
            title="View Day Information"
          >
            Day Info
          </button>
          
          {/* Option Button with Dropdown */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown();
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
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`
                }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeDropdown();
                    onEditDay?.(dayWithWeek);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] hover:bg-green-50 transition-colors flex items-center gap-2"
                >
                  <span className="text-green-600">✏️</span>
                  <span>Edit Day</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeDropdown();
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
                    closeDropdown();
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
                    closeDropdown();
                    onPasteDay?.(dayWithWeek);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] hover:bg-green-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                >
                  <span className="text-green-600">📄</span>
                  <span>Paste</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeDropdown();
                    onShareDay?.(dayWithWeek);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] hover:bg-blue-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                >
                  <span className="text-blue-600">🔗</span>
                  <span>Share</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeDropdown();
                    onExportPdfDay?.(dayWithWeek);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                >
                  <span className="text-red-600">📕</span>
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeDropdown();
                    onPrintDay?.(dayWithWeek);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                >
                  <span className="text-gray-600">🖨️</span>
                  <span>Print</span>
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




