'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2 } from 'lucide-react';
import WorkoutLegend from './WorkoutLegend';
import { DroppableDay } from './grid/DroppableDay';
import { DraggableWorkout } from './grid/DraggableWorkout';
import { DraggableMoveframe } from './grid/DraggableMoveframe';

interface WorkoutGridProps {
  workoutPlan: any;
  activeSection: 'A' | 'B' | 'C' | 'D';
  periods: any[];
  excludeStretchingFromTotals: boolean;
  setExcludeStretchingFromTotals: (value: boolean) => void;
  onDaySelect?: (day: any) => void;
  onWorkoutSelect?: (workoutId: string) => void;
  onAddWorkoutToDay?: (day: any) => void;
  onEditDay?: (day: any) => void;
  onEditWorkout?: (workout: any, day: any) => void;
  onCreatePlan?: () => void;
  expandedWeeks?: Set<string>;
  setExpandedWeeks?: (weeks: Set<string>) => void;
  expandedDays?: Set<string>;
  setExpandedDays?: (days: Set<string>) => void;
  expandedWorkouts?: Set<string>;
  setExpandedWorkouts?: (workouts: Set<string>) => void;
}

export default function WorkoutGrid({ 
  workoutPlan, 
  activeSection,
  periods,
  excludeStretchingFromTotals,
  setExcludeStretchingFromTotals,
  onDaySelect,
  onWorkoutSelect,
  onAddWorkoutToDay,
  onEditDay,
  onEditWorkout,
  onCreatePlan,
  expandedWeeks: externalExpandedWeeks,
  setExpandedWeeks: externalSetExpandedWeeks,
  expandedDays: externalExpandedDays,
  setExpandedDays: externalSetExpandedDays,
  expandedWorkouts: externalExpandedWorkouts,
  setExpandedWorkouts: externalSetExpandedWorkouts
}: WorkoutGridProps) {
  // Use external state if provided, otherwise use internal state
  const [internalExpandedWeeks, setInternalExpandedWeeks] = useState<Set<string>>(new Set());
  const [internalExpandedDays, setInternalExpandedDays] = useState<Set<string>>(new Set());
  const [internalExpandedWorkouts, setInternalExpandedWorkouts] = useState<Set<string>>(new Set());
  const [expandedMoveframes, setExpandedMoveframes] = useState<Set<string>>(new Set());
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editingWorkoutName, setEditingWorkoutName] = useState<string>('');
  const [openOptionsMenu, setOpenOptionsMenu] = useState<string | null>(null);
  const [editingWeekNotes, setEditingWeekNotes] = useState<string | null>(null);
  const [weekNotesText, setWeekNotesText] = useState<string>('');
  
  // Color settings
  const [colors, setColors] = useState({
    dayHeader: '#5168c2',
    dayHeaderText: '#e6e6ad',
    workoutHeader: '#c6f8e2',
    workoutHeaderText: '#2386d1',
    moveframeHeader: '#f7f2bb',
    moveframeHeaderText: '#f61909'
  });
  
  const expandedWeeks = externalExpandedWeeks || internalExpandedWeeks;
  const setExpandedWeeks = externalSetExpandedWeeks || setInternalExpandedWeeks;
  const expandedDays = externalExpandedDays || internalExpandedDays;
  const setExpandedDays = externalSetExpandedDays || setInternalExpandedDays;
  const expandedWorkouts = externalExpandedWorkouts || internalExpandedWorkouts;
  const setExpandedWorkouts = externalSetExpandedWorkouts || setInternalExpandedWorkouts;

  // Load color settings from user preferences
  useEffect(() => {
    const loadColors = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.settings?.colorSettings) {
            const colorSettings = typeof data.settings.colorSettings === 'string' 
              ? JSON.parse(data.settings.colorSettings)
              : data.settings.colorSettings;
            
            setColors(prev => ({
              ...prev,
              dayHeader: colorSettings.dayHeader || prev.dayHeader,
              dayHeaderText: colorSettings.dayHeaderText || prev.dayHeaderText,
              workoutHeader: colorSettings.workoutHeader || prev.workoutHeader,
              workoutHeaderText: colorSettings.workoutHeaderText || prev.workoutHeaderText,
              moveframeHeader: colorSettings.moveframeHeader || prev.moveframeHeader,
              moveframeHeaderText: colorSettings.moveframeHeaderText || prev.moveframeHeaderText
            }));
          }
        }
      } catch (error) {
        console.error('Error loading color settings:', error);
      }
    };
    
    loadColors();
  }, []);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openOptionsMenu) {
        setOpenOptionsMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openOptionsMenu]);

  const toggleWeek = (weekId: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekId)) {
      newExpanded.delete(weekId);
    } else {
      newExpanded.add(weekId);
    }
    setExpandedWeeks(newExpanded);
  };

  const toggleDay = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  const toggleWorkout = (workoutId: string) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedWorkouts(newExpanded);
  };

  const toggleMoveframe = (moveframeId: string) => {
    const newExpanded = new Set(expandedMoveframes);
    if (newExpanded.has(moveframeId)) {
      newExpanded.delete(moveframeId);
    } else {
      newExpanded.add(moveframeId);
    }
    setExpandedMoveframes(newExpanded);
  };

  const getSportIcon = (sport: string) => {
    const sportIcons: Record<string, string> = {
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
      'FREE_MOVES': '🆓'
    };
    return sportIcons[sport?.toUpperCase()] || '🏋️';
  };

  // Debug: Log what WorkoutGrid receives
  console.log('🎯 WorkoutGrid received workoutPlan:', workoutPlan);
  console.log('🎯 workoutPlan?.weeks:', workoutPlan?.weeks);
  console.log('🎯 workoutPlan?.weeks?.length:', workoutPlan?.weeks?.length);
  
  if (!workoutPlan || !workoutPlan.weeks) {
    console.warn('⚠️ WorkoutGrid: No workoutPlan or no weeks');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">No workout plan yet</p>
        <button 
          onClick={onCreatePlan}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create Workout Plan
        </button>
      </div>
    );
  }
  
  if (workoutPlan.weeks.length === 0) {
    console.warn('⚠️ WorkoutGrid: Weeks array is empty');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">No weeks in workout plan</p>
        <p className="text-sm text-gray-600 mb-4">
          Plan created: {new Date(workoutPlan.createdAt).toLocaleString()}<br/>
          Start date: {new Date(workoutPlan.startDate).toLocaleDateString()}
        </p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => {
              // Force hard refresh
              window.location.reload();
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🔄 Hard Refresh Page
          </button>
          <button 
            onClick={onCreatePlan}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Create New Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <WorkoutLegend />
      
      {/* Exclude Stretching Checkbox */}
      <div className="flex items-center justify-between mb-3 px-2 py-2 bg-gray-50 border border-gray-300 rounded">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={excludeStretchingFromTotals}
            onChange={(e) => setExcludeStretchingFromTotals(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Exclude stretching from the totals
          </span>
        </label>
        <span className="text-xs text-gray-500 italic">
          Note: Stretching is auto-excluded when 4 sports are selected
        </span>
      </div>
      
      {/* Weeks */}
      {workoutPlan.weeks?.map((week: any) => {
        const isWeekExpanded = expandedWeeks.has(week.id);
        const totalDays = week.days?.length || 0;
        const totalWorkouts = week.days?.reduce((sum: number, day: any) => sum + (day.workouts?.length || 0), 0) || 0;
        
        return (
          <div key={week.id} className="border-2 border-blue-300 rounded-lg bg-white shadow-sm" style={{ overflow: 'visible' }}>
            {/* WEEK HEADER */}
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all rounded-t-lg"
              onClick={() => toggleWeek(week.id)}
            >
              <div className="flex items-center gap-3">
                {isWeekExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">WEEK {week.weekNumber}</h3>
                  <p className="text-xs text-blue-100 mt-1">
                    {totalDays} days • {totalWorkouts} workouts planned
                  </p>
                </div>
                <div className="text-right text-sm">
                  <div className="text-blue-100">
                    {week.days?.[0]?.date && new Date(week.days[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' - '}
                    {week.days?.[6]?.date && new Date(week.days[6].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* WEEK NOTICE BOX */}
            {isWeekExpanded && (
              <div className="p-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-blue-700">📋 Week Planning:</span>
                  {editingWeekNotes === week.id ? (
                    <textarea
                      value={weekNotesText}
                      onChange={(e) => setWeekNotesText(e.target.value)}
                      onBlur={async () => {
                        // Save week notes
                        try {
                          const token = localStorage.getItem('token');
                          await fetch(`/api/workouts/sections/${week.id}`, {
                            method: 'PATCH',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ notes: weekNotesText })
                          });
                          week.notes = weekNotesText;
                        } catch (error) {
                          console.error('Error saving week notes:', error);
                        }
                        setEditingWeekNotes(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingWeekNotes(null);
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-blue-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="flex-1 text-sm text-gray-700 cursor-text hover:bg-blue-100 p-2 rounded"
                      onDoubleClick={() => {
                        setEditingWeekNotes(week.id);
                        setWeekNotesText(week.notes || '');
                      }}
                    >
                      {week.notes || 'Double-click to add week planning notes...'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DAYS inside this WEEK */}
            {isWeekExpanded && (
              <div className="p-3 space-y-2 bg-gray-50">
                {week.days?.map((day: any) => {
                  const isDayExpanded = expandedDays.has(day.id);
                  
                  return (
                    <div key={day.id} className="border border-gray-200 rounded-lg bg-white relative" style={{ overflow: 'visible' }}>
                      {/* Day Row */}
                      <div 
                        className="p-3 hover:opacity-90 cursor-pointer transition-colors flex items-center gap-3"
                        style={{ backgroundColor: colors.dayHeader, color: colors.dayHeaderText }}
                        onClick={() => {
                          toggleDay(day.id);
                          onDaySelect?.(day);
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-[120px]">
                          {isDayExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          <span className="font-bold text-gray-700">{getDayName(day.dayOfWeek)}</span>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        
                        <div>
                          {day.period ? (
                            <span 
                              className="px-3 py-1 text-white rounded-full text-xs font-medium"
                              style={{ backgroundColor: day.period.color || '#3b82f6' }}
                            >
                              {day.period.name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No period</span>
                          )}
                        </div>
                        
                        <div className="ml-auto flex items-center gap-3">
                          <span className="text-sm" style={{ color: colors.dayHeaderText }}>
                            {day.workouts?.length || 0} workout{day.workouts?.length === 1 ? '' : 's'}
                          </span>
                          
                          {/* Day Options Dropdown */}
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenOptionsMenu(openOptionsMenu === `day-${day.id}` ? null : `day-${day.id}`);
                              }}
                              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium"
                              style={{ color: colors.dayHeaderText }}
                              title="Day options"
                            >
                              Options
                            </button>
                            
                            {openOptionsMenu === `day-${day.id}` && (
                              <div className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-400 rounded shadow-xl min-w-[140px]"
                                style={{ zIndex: 9999 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button 
                                  onClick={() => {
                                    onEditDay?.(day);
                                    setOpenOptionsMenu(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 font-medium"
                                >
                                  Edit Day
                                </button>
                                <button className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 border-t">
                                  Copy
                                </button>
                                <button className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50">
                                  Move
                                </button>
                                <button className="w-full px-3 py-2 text-left text-xs hover:bg-purple-50 border-t">
                                  Export
                                </button>
                                <button className="w-full px-3 py-2 text-left text-xs hover:bg-green-50">
                                  Share
                                </button>
                                <button className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 border-t">
                                  Delete
                                </button>
                                <button className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50">
                                  Print
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Workouts */}
                      {isDayExpanded && (
                        <div className="bg-white p-4 space-y-2 border-t border-gray-200">
                          {day.workouts?.map((workout: any, index: number) => {
                            const isWorkoutExpanded = expandedWorkouts.has(workout.id);
                            
                            return (
                              <div key={workout.id} className="border border-green-200 rounded-lg relative" style={{ overflow: 'visible' }}>
                                {/* Workout Row */}
                                <div 
                                  className="p-3 hover:opacity-90 cursor-pointer transition-colors flex items-center gap-3"
                                  style={{ backgroundColor: colors.workoutHeader, color: colors.workoutHeaderText }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWorkout(workout.id);
                                    onWorkoutSelect?.(workout.id);
                                  }}
                                >
                                  {isWorkoutExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  <span className="font-semibold text-green-700">Workout #{workout.sessionNumber || index + 1}</span>
                                  {editingWorkoutId === workout.id ? (
                                    <input
                                      type="text"
                                      value={editingWorkoutName}
                                      onChange={(e) => setEditingWorkoutName(e.target.value)}
                                      onBlur={async () => {
                                        // Save the workout name
                                        if (editingWorkoutName.trim() !== workout.name) {
                                          try {
                                            const token = localStorage.getItem('token');
                                            await fetch(`/api/workouts/sessions/${workout.id}`, {
                                              method: 'PATCH',
                                              headers: {
                                                'Authorization': `Bearer ${token}`,
                                                'Content-Type': 'application/json'
                                              },
                                              body: JSON.stringify({ name: editingWorkoutName.trim() })
                                            });
                                            workout.name = editingWorkoutName.trim();
                                          } catch (error) {
                                            console.error('Error updating workout name:', error);
                                          }
                                        }
                                        setEditingWorkoutId(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.currentTarget.blur();
                                        } else if (e.key === 'Escape') {
                                          setEditingWorkoutId(null);
                                          setEditingWorkoutName(workout.name || '');
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-sm text-gray-700 border border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      className="text-sm text-gray-700 cursor-text hover:text-blue-600"
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        setEditingWorkoutId(workout.id);
                                        setEditingWorkoutName(workout.name || '');
                                      }}
                                      title="Double-click to edit workout name"
                                    >
                                      {workout.name || 'Unnamed (double-click to edit)'}
                                    </span>
                                  )}
                                  <div className="ml-auto flex gap-2 items-center">
                                    {/* Workout Options Dropdown */}
                                    <div className="relative">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenOptionsMenu(openOptionsMenu === `workout-${workout.id}` ? null : `workout-${workout.id}`);
                                        }}
                                        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium"
                                        style={{ color: colors.workoutHeaderText }}
                                        title="Workout options"
                                      >
                                        Options
                                      </button>
                                      
                                      {openOptionsMenu === `workout-${workout.id}` && (
                                        <div className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-400 rounded shadow-xl min-w-[150px]"
                                          style={{ zIndex: 9999 }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button 
                                            onClick={() => {
                                              onEditWorkout?.(workout, day);
                                              setOpenOptionsMenu(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 font-medium"
                                          >
                                            Edit Workout
                                          </button>
                                          <button className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 border-t">
                                            Add Moveframe
                                          </button>
                                          <button className="w-full px-3 py-2 text-left text-xs hover:bg-purple-50 border-t">
                                            Copy
                                          </button>
                                          <button className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50">
                                            Move
                                          </button>
                                          <button className="w-full px-3 py-2 text-left text-xs hover:bg-green-50 border-t">
                                            Export
                                          </button>
                                          <button className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 border-t">
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded Moveframes */}
                                {isWorkoutExpanded && workout.moveframes && (
                                  <div className="p-3 space-y-2" style={{ backgroundColor: colors.moveframeHeader }}>
                                    {workout.moveframes.map((moveframe: any, mfIndex: number) => {
                                      const isMoveframeExpanded = expandedMoveframes.has(moveframe.id);
                                      
                                      return (
                                        <div key={moveframe.id} className="border rounded-lg relative" style={{ borderColor: colors.moveframeHeaderText, overflow: 'visible' }}>
                                          {/* Moveframe Row */}
                                          <div 
                                            className="p-2 bg-white hover:bg-yellow-50 cursor-pointer flex items-center gap-2"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleMoveframe(moveframe.id);
                                            }}
                                          >
                                            {isMoveframeExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            <span className="font-bold w-6" style={{ color: colors.moveframeHeaderText }}>{moveframe.letter || String.fromCharCode(65 + mfIndex)}</span>
                                            <span className="text-lg">{getSportIcon(moveframe.sport)}</span>
                                            <span className="font-semibold text-sm" style={{ color: colors.moveframeHeaderText }}>{moveframe.sport}</span>
                                            <span className="text-xs text-gray-600">({moveframe.type || 'STANDARD'})</span>
                                            {moveframe.description && <span className="text-xs text-gray-500 italic">- {moveframe.description}</span>}
                                            
                                            {/* Moveframe data summary */}
                                            <div className="ml-2 flex gap-3 text-xs text-gray-600">
                                              {moveframe.distance && <span>📏 {moveframe.distance}</span>}
                                              {moveframe.repetitions && <span>🔢 {moveframe.repetitions}x</span>}
                                              {moveframe.speed && <span>⚡ {moveframe.speed}</span>}
                                              {moveframe.pause && <span>⏸️ {moveframe.pause}</span>}
                                            </div>
                                            
                                            {/* Moveframe Options Dropdown */}
                                            <div className="ml-auto relative">
                                              <button 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setOpenOptionsMenu(openOptionsMenu === `moveframe-${moveframe.id}` ? null : `moveframe-${moveframe.id}`);
                                                }}
                                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium"
                                                title="Moveframe options"
                                              >
                                                Options
                                              </button>
                                              
                                              {openOptionsMenu === `moveframe-${moveframe.id}` && (
                                                <div className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-400 rounded shadow-xl min-w-[140px]"
                                                  style={{ zIndex: 9999 }}
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <button className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 font-medium">
                                                    Edit Moveframe
                                                  </button>
                                                  <button className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 border-t">
                                                    Add Movelap
                                                  </button>
                                                  <button className="w-full px-3 py-2 text-left text-xs hover:bg-purple-50 border-t">
                                                    Copy
                                                  </button>
                                                  <button className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50">
                                                    Move
                                                  </button>
                                                  <button className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 border-t">
                                                    Delete
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {/* Expanded Movelaps */}
                                          {isMoveframeExpanded && moveframe.movelaps && (
                                            <div className="p-2 bg-green-50 space-y-1">
                                              {moveframe.movelaps.map((movelap: any, lapIndex: number) => (
                                                <div key={movelap.id} className="p-2 bg-white border border-green-200 rounded flex items-center gap-2">
                                                  <span className="font-bold text-green-700 w-8">{lapIndex + 1}.</span>
                                                  <span className="text-xs">Dist: {movelap.distance || '-'}</span>
                                                  <span className="text-xs">Speed: {movelap.speed || '-'}</span>
                                                  <span className="text-xs">Reps: {movelap.reps || '-'}</span>
                                                  <span className="text-xs">Pause: {movelap.pause || '-'}</span>
                                                  {movelap.notes && <span className="text-xs text-gray-500 italic ml-2">- {movelap.notes}</span>}
                                                  
                                                  {/* Movelap Options */}
                                                  <div className="ml-auto relative">
                                                    <button 
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenOptionsMenu(openOptionsMenu === `movelap-${movelap.id}` ? null : `movelap-${movelap.id}`);
                                                      }}
                                                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                                      title="Movelap options"
                                                    >
                                                      ⋮
                                                    </button>
                                                    
                                                    {openOptionsMenu === `movelap-${movelap.id}` && (
                                                      <div className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-400 rounded shadow-xl min-w-[120px]"
                                                        style={{ zIndex: 9999 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                      >
                                                        <button className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50">
                                                          Edit
                                                        </button>
                                                        <button className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 border-t">
                                                          Delete
                                                        </button>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                              {(!moveframe.movelaps || moveframe.movelaps.length === 0) && (
                                                <p className="text-center text-gray-500 text-xs py-2">
                                                  No movelaps yet
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                    {(!workout.moveframes || workout.moveframes.length === 0) && (
                                      <p className="text-center text-gray-500 text-sm py-4">
                                        No moveframes yet - click + Add Moveframe
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          
                          {(!day.workouts || day.workouts.length === 0) && (
                            <p className="text-center text-gray-500 py-6 text-sm italic">
                              No workouts planned for this day
                            </p>
                          )}
                          
                          {day.workouts && day.workouts.length < 3 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddWorkoutToDay?.(day);
                              }}
                              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-gray-500 hover:text-green-700 font-medium"
                            >
                              + Add Workout to {getDayName(day.dayOfWeek)} ({day.workouts.length}/3)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {(!week.days || week.days.length === 0) && (
                  <div className="text-center py-8 text-gray-500 italic">
                    No days in this week yet
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {(!workoutPlan.weeks || workoutPlan.weeks.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-4">No weeks scheduled yet</p>
          <button 
            onClick={onCreatePlan}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Planning
          </button>
        </div>
      )}
    </div>
  );
}

function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Day';
}

