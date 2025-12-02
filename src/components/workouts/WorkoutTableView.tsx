'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Edit, Copy, Trash2, ChevronDown, ChevronRight, MoreVertical, GripVertical } from 'lucide-react';
import { WorkoutActionModal, MoveframePositionModal, ConfirmRemovalModal } from './DragDropModals';
import WorkoutLegend from './WorkoutLegend';

interface WorkoutTableViewProps {
  workoutPlan: any;
  periods: any[];
  activeSection?: 'A' | 'B' | 'C' | 'D';
  excludeStretchingFromTotals: boolean;
  setExcludeStretchingFromTotals: (value: boolean) => void;
  onEditWorkout?: (workout: any, day: any) => void;
  onEditDay?: (day: any) => void;
  onAddWorkout?: (day: any) => void;
  onAddMoveframe?: (workout: any, day: any) => void;
  onDataChanged?: () => void; // New prop to refresh data without full reload
}

export default function WorkoutTableView({
  workoutPlan,
  periods,
  activeSection = 'A',
  excludeStretchingFromTotals,
  setExcludeStretchingFromTotals,
  onEditWorkout,
  onEditDay,
  onAddWorkout,
  onAddMoveframe,
  onDataChanged
}: WorkoutTableViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollbarStyle, setScrollbarStyle] = useState({ left: 0, width: '100%' });
  const [expandedOptions, setExpandedOptions] = useState<string | null>(null);
  const [copiedDays, setCopiedDays] = useState<any[]>([]);
  const [cutDays, setCutDays] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [expandedDayDetails, setExpandedDayDetails] = useState<Set<string>>(new Set());
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [expandedMoveframes, setExpandedMoveframes] = useState<Set<string>>(new Set());
  
  // Column configuration state
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    checkbox: 40, week: 60, dayWeek: 60, dayname: 80, date: 100, period: 100
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  
  // Drag and drop state
  const [draggedWorkout, setDraggedWorkout] = useState<any>(null);
  const [draggedMoveframe, setDraggedMoveframe] = useState<any>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [dragOverWorkout, setDragOverWorkout] = useState<string | null>(null);
  const [dragOverMoveframe, setDragOverMoveframe] = useState<string | null>(null);
  const [showWorkoutActionModal, setShowWorkoutActionModal] = useState(false);
  const [showMoveframePositionModal, setShowMoveframePositionModal] = useState(false);
  const [showConfirmRemovalModal, setShowConfirmRemovalModal] = useState(false);
  const [dragContext, setDragContext] = useState<any>(null);

  const toggleOptions = (dayId: string) => {
    setExpandedOptions(expandedOptions === dayId ? null : dayId);
  };

  const toggleDaySelection = (dayId: string) => {
    const newSelected = new Set(selectedDays);
    if (newSelected.has(dayId)) {
      newSelected.delete(dayId);
    } else {
      newSelected.add(dayId);
    }
    setSelectedDays(newSelected);
  };

  const toggleDayDetails = (dayId: string) => {
    const newExpanded = new Set(expandedDayDetails);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDayDetails(newExpanded);
  };

  const toggleWorkoutExpansion = (workoutId: string) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedWorkouts(newExpanded);
  };

  const toggleMoveframeExpansion = (moveframeId: string) => {
    const newExpanded = new Set(expandedMoveframes);
    if (newExpanded.has(moveframeId)) {
      newExpanded.delete(moveframeId);
    } else {
      newExpanded.add(moveframeId);
    }
    setExpandedMoveframes(newExpanded);
  };

  // Column resize handlers
  const handleResizeStart = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setResizingColumn(columnKey);
    setResizeStartX(e.clientX);
    setResizeStartWidth(columnWidths[columnKey] || 100);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn) {
        const diff = e.clientX - resizeStartX;
        const newWidth = Math.max(40, resizeStartWidth + diff);
        setColumnWidths(prev => ({ ...prev, [resizingColumn]: newWidth }));
      }
    };

    const handleMouseUp = () => {
      if (resizingColumn) {
        setResizingColumn(null);
      }
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  // Save/Reset grid settings
  const saveGridSettings = () => {
    localStorage.setItem('workoutTableGridSettings', JSON.stringify({ columnWidths }));
    alert('Grid settings saved!');
  };

  const resetGridSettings = () => {
    const defaultWidths = {
      checkbox: 40, week: 60, dayWeek: 60, dayname: 80, date: 100, period: 100
    };
    setColumnWidths(defaultWidths);
    localStorage.removeItem('workoutTableGridSettings');
    alert('Grid settings reset to default!');
  };

  // ========== DRAG AND DROP HANDLERS ==========
  
  // Workout drag handlers
  const handleWorkoutDragStart = (e: React.DragEvent, workout: any, day: any) => {
    e.stopPropagation();
    setDraggedWorkout({ workout, sourceDay: day });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDayDragOver = (e: React.DragEvent, day: any) => {
    if (draggedWorkout) {
      e.preventDefault();
      e.stopPropagation();
      setDragOverDay(day.id);
    }
  };

  const handleDayDragLeave = () => {
    setDragOverDay(null);
  };

  const handleWorkoutDrop = (e: React.DragEvent, targetDay: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDay(null);

    if (!draggedWorkout) return;

    const { workout: sourceWorkout, sourceDay } = draggedWorkout;
    
    // Check if target day already has workouts
    const existingWorkout = targetDay.workouts?.[0]; // Check first workout slot

    setDragContext({
      sourceWorkout,
      sourceDay,
      targetDay,
      existingWorkout
    });

    setShowWorkoutActionModal(true);
    setDraggedWorkout(null);
  };

  const handleWorkoutAction = async (action: 'copy' | 'move' | 'switch') => {
    const { sourceWorkout, sourceDay, targetDay, existingWorkout } = dragContext;

    // If Copy or Move and target exists, confirm removal
    if ((action === 'copy' || action === 'move') && existingWorkout) {
      setDragContext({ ...dragContext, pendingAction: action });
      setShowWorkoutActionModal(false);
      setShowConfirmRemovalModal(true);
      return;
    }

    await executeWorkoutAction(action);
  };

  const executeWorkoutAction = async (action: 'copy' | 'move' | 'switch') => {
    const { sourceWorkout, sourceDay, targetDay, existingWorkout } = dragContext;

    try {
      if (action === 'copy') {
        // Delete existing if confirmed
        if (existingWorkout) {
          await fetch(`/api/workouts/sessions/${existingWorkout.id}`, {
            method: 'DELETE',
          });
        }

        // Copy workout
        const response = await fetch('/api/workouts/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...sourceWorkout,
            id: undefined,
            dayId: targetDay.id,
          }),
        });

        if (!response.ok) throw new Error('Copy failed');

      } else if (action === 'move') {
        // Delete existing if confirmed
        if (existingWorkout) {
          await fetch(`/api/workouts/sessions/${existingWorkout.id}`, {
            method: 'DELETE',
          });
        }

        // Move workout
        const response = await fetch(`/api/workouts/sessions/${sourceWorkout.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dayId: targetDay.id }),
        });

        if (!response.ok) throw new Error('Move failed');

      } else if (action === 'switch') {
        // Switch both workouts' days
        await Promise.all([
          fetch(`/api/workouts/sessions/${sourceWorkout.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayId: targetDay.id }),
          }),
          fetch(`/api/workouts/sessions/${existingWorkout.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayId: sourceDay.id }),
          }),
        ]);
      }

      // Refresh data
      if (onDataChanged) {
        onDataChanged();
      }

      // Close modals
      setShowWorkoutActionModal(false);
      setShowConfirmRemovalModal(false);
      setDragContext(null);

    } catch (error) {
      console.error('Workout action failed:', error);
      alert('Failed to complete action');
    }
  };

  // Moveframe drag handlers
  const handleMoveframeDragStart = (e: React.DragEvent, moveframe: any, workout: any, day: any) => {
    e.stopPropagation();
    setDraggedMoveframe({ moveframe, sourceWorkout: workout, sourceDay: day });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleMoveframeDragOver = (e: React.DragEvent, targetMoveframe: any) => {
    if (draggedMoveframe) {
      e.preventDefault();
      e.stopPropagation();
      setDragOverMoveframe(targetMoveframe.id);
    }
  };

  const handleMoveframeDragLeave = () => {
    setDragOverMoveframe(null);
  };

  const handleMoveframeDrop = (e: React.DragEvent, targetMoveframe: any, targetWorkout: any, targetDay: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverMoveframe(null);

    if (!draggedMoveframe) return;

    const { moveframe: sourceMoveframe, sourceWorkout, sourceDay } = draggedMoveframe;

    // Save context for position modal
    setDragContext({
      sourceMoveframe,
      sourceWorkout,
      sourceDay,
      targetMoveframe,
      targetWorkout,
      targetDay
    });

    setShowMoveframePositionModal(true);
    setDraggedMoveframe(null);
  };

  const handleMoveframeDropOnDay = async (e: React.DragEvent, targetDay: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedMoveframe) return;

    const { moveframe: sourceMoveframe, sourceWorkout } = draggedMoveframe;
    
    // Get first workout of target day or create one
    let targetWorkout = targetDay.workouts?.[0];

    if (!targetWorkout) {
      // Create a workout
      const response = await fetch('/api/workouts/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Workout',
          dayId: targetDay.id,
        }),
      });

      if (!response.ok) {
        alert('Failed to create workout');
        return;
      }

      const data = await response.json();
      targetWorkout = data.session;
    }

    // Move moveframe to end of target workout (append)
    try {
      await fetch(`/api/workouts/moveframes/${sourceMoveframe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutSessionId: targetWorkout.id,
        }),
      });

      if (onDataChanged) {
        onDataChanged();
      }

      setDraggedMoveframe(null);
    } catch (error) {
      console.error('Moveframe drop failed:', error);
      alert('Failed to move moveframe');
    }
  };

  const handleMoveframePosition = async (position: 'before' | 'after') => {
    const { sourceMoveframe, targetWorkout } = dragContext;

    try {
      // Just move the moveframe to the target workout
      // Position will be handled by alphabetical sorting (A, B, C...)
      await fetch(`/api/workouts/moveframes/${sourceMoveframe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutSessionId: targetWorkout.id,
        }),
      });

      if (onDataChanged) {
        onDataChanged();
      }

      setShowMoveframePositionModal(false);
      setDragContext(null);

    } catch (error) {
      console.error('Moveframe position failed:', error);
      alert('Failed to position moveframe');
    }
  };

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('workoutTableGridSettings');
    if (saved) {
      const { columnWidths: savedWidths } = JSON.parse(saved);
      setColumnWidths(savedWidths);
    }
  }, []);

  const handleCopy = () => {
    if (selectedDays.size === 0) return;
    
    const allDays = workoutPlan.weeks.flatMap((week: any) => week.days || []);
    const daysToCopy = allDays.filter((day: any) => selectedDays.has(day.id));
    
    setCopiedDays(daysToCopy);
    setCutDays([]);
    setExpandedOptions(null);
  };

  const handleMove = () => {
    if (selectedDays.size === 0) return;
    
    const allDays = workoutPlan.weeks.flatMap((week: any) => week.days || []);
    const daysToCut = allDays.filter((day: any) => selectedDays.has(day.id));
    
    setCutDays(daysToCut);
    setCopiedDays([]);
    setExpandedOptions(null);
  };

  const handlePaste = async (targetDay: any) => {
    const sourceDays = copiedDays.length > 0 ? copiedDays : cutDays;
    if (sourceDays.length === 0) {
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      // Copy workouts from all selected source days to target day
      for (const sourceDay of sourceDays) {
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
      }

      // If it was a move (cut), delete workouts from source days
      if (cutDays.length > 0) {
        for (const sourceDay of sourceDays) {
          const workoutsToDelete = sourceDay.workouts || [];
          for (const workout of workoutsToDelete) {
            await fetch(`/api/workouts/sessions/${workout.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }
        }
        setCutDays([]);
      }

      setCopiedDays([]);
      setSelectedDays(new Set());
      setExpandedOptions(null);
      
      // Refresh data to show changes
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (error) {
      console.error('Error pasting workouts:', error);
    }
  };

  const handleEdit = (day: any) => {
    onEditDay?.(day);
    setExpandedOptions(null);
  };

  const handleExport = (day: any) => {
    // TODO: Implement export functionality
    alert(`Export day: ${getDayName(day.dayOfWeek)} - Week ${day.weekNumber}\nThis will export the day data to a file.`);
    setExpandedOptions(null);
  };

  const handleShare = (day: any) => {
    // TODO: Implement share functionality
    alert(`Share day: ${getDayName(day.dayOfWeek)}\nThis will share the day with coach/team/club.`);
    setExpandedOptions(null);
  };

  const handleDelete = async (day: any) => {
    if (!confirm(`Delete all workouts from ${getDayName(day.dayOfWeek)}?`)) {
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
      console.error('Error deleting workouts:', error);
    }
  };

  const handlePrint = (day: any) => {
    // TODO: Implement print functionality
    alert(`Print day: ${getDayName(day.dayOfWeek)} - Week ${day.weekNumber}\nThis will open a print dialog for the day.`);
    setExpandedOptions(null);
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

  // Generate alphabetical letter for moveframe (A, B, C...Z, AA, AB, AC...)
  const generateMoveframeLetter = (index: number): string => {
    let letter = '';
    let num = index;
    while (num >= 0) {
      letter = String.fromCharCode(65 + (num % 26)) + letter;
      num = Math.floor(num / 26) - 1;
    }
    return letter;
  };

  // Sort and assign letters to moveframes
  const getSortedMoveframes = (workout: any) => {
    if (!workout.moveframes) return [];
    return workout.moveframes
      .sort((a: any, b: any) => {
        // Sort by creation order or ID
        return (a.createdAt || a.id).localeCompare(b.createdAt || b.id);
      })
      .map((mf: any, index: number) => ({
        ...mf,
        letter: generateMoveframeLetter(index)
      }));
  };

  // Sort movelaps numerically
  const getSortedMovelaps = (moveframe: any) => {
    if (!moveframe.movelaps) return [];
    return moveframe.movelaps
      .sort((a: any, b: any) => {
        // Sort by creation order or ID
        return (a.createdAt || a.id).localeCompare(b.createdAt || b.id);
      })
      .map((lap: any, index: number) => ({
        ...lap,
        number: index + 1
      }));
  };

  // Helper to get unique sports for a day (max 4) - aggregated across ALL workouts in the day
  const getDaySports = (day: any): string[] => {
    const sports = new Set<string>();
    day.workouts?.forEach((workout: any) => {
      workout.moveframes?.forEach((mf: any) => {
        if (mf.sport) sports.add(mf.sport);
      });
    });
    
    const sportsArray = Array.from(sports);
    
    // Auto-exclude stretching if there are 4 sports and stretching is one of them
    if (sportsArray.length === 4 && sportsArray.some(s => s.toLowerCase() === 'stretching')) {
      return sportsArray.filter(s => s.toLowerCase() !== 'stretching').slice(0, 4);
    }
    
    // Manual exclusion if checkbox is checked
    if (excludeStretchingFromTotals) {
      return sportsArray.filter(s => s.toLowerCase() !== 'stretching').slice(0, 4);
    }
    
    return sportsArray.slice(0, 4); // Max 4 different sports per day
  };

  // Helper to get sport data aggregated at DAY level (not per workout)
  const getDaySportData = (day: any, sport: string) => {
    let totalDistance = 0;
    let totalDuration = 0;
    let totalCalories = 0;

    day.workouts?.forEach((workout: any) => {
      workout.moveframes?.forEach((mf: any) => {
        if (mf.sport === sport) {
          mf.movelaps?.forEach((lap: any) => {
            if (lap.distance) totalDistance += lap.distance;
            // Add duration and calories calculations here
          });
        }
      });
    });

    return {
      distance: totalDistance > 0 ? totalDistance : null,
      duration: totalDuration > 0 ? totalDuration : null,
      calories: totalCalories > 0 ? totalCalories : null
    };
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
      
      {/* Action Buttons Toolbar */}
      <div className="flex items-center justify-between mb-2 px-2 py-2 bg-white border border-gray-300 rounded">
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium flex items-center gap-1"
            title="Day options"
          >
            📅 Day
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center gap-1"
            title="Workout options"
          >
            🏋️ Workout
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium flex items-center gap-1"
            title="Moveframe options"
          >
            📋 Moveframe
          </button>
          <button
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-medium flex items-center gap-1"
            title="Movelaps options"
          >
            🔄 Movelaps
          </button>
        </div>
        
        {/* Grid Settings */}
        <div className="flex gap-2">
          <button
            onClick={saveGridSettings}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
          >
            💾 Save Grid
          </button>
          <button
            onClick={resetGridSettings}
            className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs font-medium"
          >
            🔄 Reset
          </button>
        </div>
      </div>
      
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
            <th className="border border-gray-400 px-1 py-1 text-center font-bold sticky left-0 z-50 bg-gray-200 relative" style={{width: `${columnWidths.checkbox}px`}} rowSpan={2}>
              <input 
                type="checkbox" 
                onChange={(e) => {
                  if (e.target.checked) {
                    const allDayIds = new Set(allDays.map((d: any) => d.id));
                    setSelectedDays(allDayIds);
                  } else {
                    setSelectedDays(new Set());
                  }
                }}
                checked={selectedDays.size > 0 && selectedDays.size === allDays.length}
                className="cursor-pointer"
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                onMouseDown={(e) => handleResizeStart(e, 'checkbox')}
                title="Double-click and drag to resize"
              />
            </th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200 relative" style={{width: `${columnWidths.week}px`, left: `${columnWidths.checkbox}px`}} rowSpan={2}>
              Week
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                onMouseDown={(e) => handleResizeStart(e, 'week')}
                title="Double-click and drag to resize"
              />
            </th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200 relative" style={{width: `${columnWidths.dayWeek}px`, left: `${columnWidths.checkbox + columnWidths.week}px`}} rowSpan={2}>
              Day
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                onMouseDown={(e) => handleResizeStart(e, 'dayWeek')}
                title="Double-click and drag to resize"
              />
            </th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200 relative" style={{width: `${columnWidths.dayname}px`, left: `${columnWidths.checkbox + columnWidths.week + columnWidths.dayWeek}px`}} rowSpan={2}>
              Dayname
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                onMouseDown={(e) => handleResizeStart(e, 'dayname')}
                title="Double-click and drag to resize"
              />
            </th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200 relative" style={{width: `${columnWidths.date}px`, left: `${columnWidths.checkbox + columnWidths.week + columnWidths.dayWeek + columnWidths.dayname}px`}} rowSpan={2}>
              Date
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                onMouseDown={(e) => handleResizeStart(e, 'date')}
                title="Double-click and drag to resize"
              />
            </th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200 relative" style={{width: `${columnWidths.period}px`, left: `${columnWidths.checkbox + columnWidths.week + columnWidths.dayWeek + columnWidths.dayname + columnWidths.date}px`}} rowSpan={2}>
              Period
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                onMouseDown={(e) => handleResizeStart(e, 'period')}
                title="Double-click and drag to resize"
              />
            </th>
            
            {/* S1-S4 Sports columns */}
            {[0, 1, 2, 3].map((sportIndex) => (
              <th key={sportIndex} className={`border border-gray-400 px-1 py-1 text-center font-bold ${sportColors[sportIndex].header}`} colSpan={4}>
                S{sportIndex + 1} ico
              </th>
            ))}
            
            <th className="border border-gray-400 px-1 py-1 text-center font-bold sticky right-0 z-50 bg-gray-200 shadow-lg" style={{width: '80px'}} rowSpan={2}>Options</th>
            
            {/* Workout Name column header */}
            <th className="border border-gray-400 px-2 py-1 text-center font-bold bg-purple-100" style={{width: '250px'}} rowSpan={2}>Workout / Moveframe / Movelap</th>
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
              const isCopied = copiedDays.some((d: any) => d.id === day.id);
              const isCut = cutDays.some((d: any) => d.id === day.id);
              const isSelected = selectedDays.has(day.id);
              const rowBgClass = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : isSelected ? 'bg-yellow-50' : 'hover:bg-gray-50';
              
              const stickyBg = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : isSelected ? 'bg-yellow-50' : 'bg-white';
              
              return (
                <tr 
                  key={day.id} 
                  className={rowBgClass}
                  onDoubleClick={() => onEditDay?.(day)}
                >
                  <td className={`border border-gray-300 px-1 py-1 text-center sticky left-0 z-10 ${stickyBg}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleDaySelection(day.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className={`border border-gray-300 px-2 py-2 text-center font-semibold sticky z-10 ${stickyBg}`} style={{left: '40px'}}>
                    {day.weekNumber}
                  </td>
                  <td className={`border border-gray-300 px-2 py-2 text-center sticky z-10 ${stickyBg}`} style={{left: '100px'}}>
                    {day.dayOfWeek}
                  </td>
                  <td 
                    className={`border border-gray-300 px-2 py-2 text-center font-medium sticky z-10 ${stickyBg} cursor-pointer hover:bg-blue-100`} 
                    style={{left: '160px'}}
                    onClick={() => toggleDayDetails(day.id)}
                    title="Click to expand/collapse day details"
                  >
                    {getDayName(day.dayOfWeek)}
                  </td>
                  <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: '240px'}}>
                    {formatDate(day.date)}
                  </td>
                  <td className={`border border-gray-300 px-2 py-1 text-center sticky z-10 ${stickyBg}`} style={{left: '340px'}}>
                    {day.period?.name || '-'}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center text-gray-400 italic" colSpan={16}>
                    No workouts
                  </td>
                  <td className="border border-gray-300 px-1 py-1 text-center sticky right-0 z-10 bg-white shadow-lg">
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOptions(day.id);
                        }}
                        className="px-2 py-1 hover:bg-gray-200 rounded text-gray-700 text-xs font-medium"
                        title="Click for options"
                      >
                        Options
                      </button>
                      
                      {expandedOptions === day.id && (
                        <div 
                          className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-400 rounded shadow-2xl z-[9999] min-w-[140px]"
                          onClick={(e) => e.stopPropagation()}
                          style={{ marginRight: '-1px' }}
                        >
                          <button 
                            onClick={() => handleEdit(day)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 font-medium"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={handleCopy}
                            disabled={selectedDays.size === 0}
                            className={`w-full px-3 py-2 text-left text-xs border-t ${
                              selectedDays.size > 0 ? 'hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={selectedDays.size > 0 ? `Copy ${selectedDays.size} selected day(s)` : 'Select days first'}
                          >
                            Copy
                          </button>
                          <button 
                            onClick={handleMove}
                            disabled={selectedDays.size === 0}
                            className={`w-full px-3 py-2 text-left text-xs ${
                              selectedDays.size > 0 ? 'hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={selectedDays.size > 0 ? `Move ${selectedDays.size} selected day(s)` : 'Select days first'}
                          >
                            Move
                          </button>
                          <button 
                            onClick={() => handleExport(day)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-purple-50 border-t"
                            title="Export"
                          >
                            Export
                          </button>
                          <button 
                            onClick={() => handleShare(day)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-green-50"
                            title="Share"
                          >
                            Share
                          </button>
                          <button 
                            onClick={() => handleDelete(day)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 border-t"
                            title="Delete"
                          >
                            Delete
                          </button>
                          <button 
                            onClick={() => handlePrint(day)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                            title="Print"
                          >
                            Print
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }

            // Day with workouts - show one row per workout, but aggregate sports at DAY level
            const workoutRows: JSX.Element[] = [];
            
            dayWorkouts.forEach((workout: any, workoutIndex: number) => {
              const isFirstWorkout = workoutIndex === 0;
              const isCopied = copiedDays.some((d: any) => d.id === day.id);
              const isCut = cutDays.some((d: any) => d.id === day.id);
              const isSelected = selectedDays.has(day.id);
              const isExpanded = expandedDayDetails.has(day.id);
              const isWorkoutExpanded = expandedWorkouts.has(workout.id);
              const rowBgClass = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : isSelected ? 'bg-yellow-50' : 'hover:bg-blue-50';
              
              const stickyBg = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : isSelected ? 'bg-yellow-50' : 'bg-white';
              
              // Workout row
              workoutRows.push(
                <tr 
                  key={`${day.id}-${workout.id}`} 
                  className={rowBgClass}
                  draggable
                  onDragStart={(e) => handleWorkoutDragStart(e, workout, day)}
                  onDoubleClick={() => onEditWorkout?.(workout, day)}
                >
                  {isFirstWorkout && (
                    <>
                      <td className={`border border-gray-300 px-1 py-1 text-center sticky left-0 z-10 ${stickyBg}`} rowSpan={dayWorkouts.length}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleDaySelection(day.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className={`border border-gray-300 px-2 py-2 text-center font-semibold sticky z-10 ${stickyBg}`} style={{left: '40px'}} rowSpan={dayWorkouts.length}>
                        {day.weekNumber}
                      </td>
                      <td className={`border border-gray-300 px-2 py-2 text-center sticky z-10 ${stickyBg}`} style={{left: '100px'}} rowSpan={dayWorkouts.length}>
                        {day.dayOfWeek}
                      </td>
                      <td 
                        className={`border border-gray-300 px-2 py-2 text-center font-medium sticky z-10 ${stickyBg} cursor-pointer hover:bg-blue-200 ${dragOverDay === day.id ? 'ring-4 ring-green-500 bg-green-100' : ''}`} 
                        style={{left: '160px'}} 
                        rowSpan={dayWorkouts.length}
                        onClick={() => toggleDayDetails(day.id)}
                        onDragOver={(e) => handleDayDragOver(e, day)}
                        onDragLeave={handleDayDragLeave}
                        onDrop={(e) => handleWorkoutDrop(e, day)}
                        title="Click to expand/collapse workouts | Drop workout here"
                      >
                        {getDayName(day.dayOfWeek)}
                      </td>
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: '240px'}} rowSpan={dayWorkouts.length}>
                        {formatDate(day.date)}
                      </td>
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: '340px'}} rowSpan={dayWorkouts.length}>
                        <div className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: day.period?.color || '#3b82f6' }}>
                          {day.period?.name || 'Period'}
                        </div>
                      </td>
                    </>
                  )}
                  
                  {/* Sport columns - DAY LEVEL aggregation (S1-S4 are unique sports in the entire day) */}
                  {isFirstWorkout && [0, 1, 2, 3].map((sportIndex) => {
                    const sport = daySports[sportIndex];
                    const sportData = sport ? getDaySportData(day, sport) : null;
                    
                    return (
                      <React.Fragment key={sportIndex}>
                        <td className={`border border-gray-300 px-1 py-1 text-center text-xs font-medium ${sportColors[sportIndex].cell}`} rowSpan={dayWorkouts.length}>
                          {sport || '-'}
                        </td>
                        <td className={`border border-gray-300 px-1 py-1 text-right text-xs ${sportColors[sportIndex].cell}`} rowSpan={dayWorkouts.length}>
                          {sportData?.distance || '-'}
                        </td>
                        <td className={`border border-gray-300 px-1 py-1 text-right text-xs ${sportColors[sportIndex].cell}`} rowSpan={dayWorkouts.length}>
                          {sportData?.duration || '-'}
                        </td>
                        <td className={`border border-gray-300 px-1 py-1 text-right text-xs ${sportColors[sportIndex].cell}`} rowSpan={dayWorkouts.length}>
                          {sportData?.calories || '-'}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  
                  {/* Options column - sticky on the right */}
                  {isFirstWorkout ? (
                    <td className={`border border-gray-300 px-1 py-1 text-center sticky right-0 z-10 shadow-lg ${stickyBg}`} rowSpan={dayWorkouts.length}>
                      <div className="relative flex flex-col gap-1">
                        {/* Day Options Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOptions(day.id);
                          }}
                          className="px-2 py-1 hover:bg-gray-200 rounded text-gray-700 text-xs font-medium"
                          title="Click for options"
                        >
                          Options
                        </button>
                        
                        {expandedOptions === day.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-400 rounded shadow-2xl z-[9999] min-w-[140px]"
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginRight: '-1px' }}
                          >
                            <button 
                              onClick={() => handleEdit(day)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 font-medium"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={handleCopy}
                              disabled={selectedDays.size === 0}
                              className={`w-full px-3 py-2 text-left text-xs border-t ${
                                selectedDays.size > 0 ? 'hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'
                              }`}
                              title={selectedDays.size > 0 ? `Copy ${selectedDays.size} selected day(s)` : 'Select days first'}
                            >
                              Copy
                            </button>
                            <button 
                              onClick={handleMove}
                              disabled={selectedDays.size === 0}
                              className={`w-full px-3 py-2 text-left text-xs ${
                                selectedDays.size > 0 ? 'hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'
                              }`}
                              title={selectedDays.size > 0 ? `Move ${selectedDays.size} selected day(s)` : 'Select days first'}
                            >
                              Move
                            </button>
                            <button 
                              onClick={() => handleExport(day)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-purple-50 border-t"
                              title="Export"
                            >
                              Export
                            </button>
                            <button 
                              onClick={() => handleShare(day)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-green-50"
                              title="Share"
                            >
                              Share
                            </button>
                            <button 
                              onClick={() => handleDelete(day)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 border-t"
                              title="Delete"
                            >
                              Delete
                            </button>
                            <button 
                              onClick={() => handlePrint(day)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                              title="Print"
                            >
                              Print
                            </button>
                          </div>
                        )}
                        
                      </div>
                    </td>
                  ) : null}
                  
                  {/* Workout name/details column with expand icon */}
                  <td 
                    className="border border-gray-300 px-2 py-1 text-xs"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleMoveframeDropOnDay(e, day)}
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-1 flex-1">
                        <div title="Drag to move workout">
                          <GripVertical size={14} className="text-gray-400 cursor-grab active:cursor-grabbing" />
                        </div>
                        <button
                          onClick={() => toggleWorkoutExpansion(workout.id)}
                          className="hover:bg-gray-200 rounded p-0.5"
                          title="Expand to show moveframes"
                        >
                          {isWorkoutExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <span className="font-medium">{workout.name || `Workout ${workoutIndex + 1}`}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddMoveframe?.(workout, day);
                        }}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex-shrink-0"
                        title="Add moveframe to this workout"
                      >
                        + Add Moveframe
                      </button>
                    </div>
                  </td>
                </tr>
              );

              // Add moveframe rows if workout is expanded
              if (isWorkoutExpanded) {
                const sortedMoveframes = getSortedMoveframes(workout);
                
                sortedMoveframes.forEach((moveframe: any, mfIndex: number) => {
                  const isMoveframeExpanded = expandedMoveframes.has(moveframe.id);
                  
                  // Moveframe row
                  workoutRows.push(
                    <tr 
                      key={`mf-${moveframe.id}`}
                      className={`bg-blue-50 hover:bg-blue-100 ${dragOverMoveframe === moveframe.id ? 'ring-2 ring-purple-500' : ''}`}
                      draggable
                      onDragStart={(e) => handleMoveframeDragStart(e, moveframe, workout, day)}
                      onDragOver={(e) => handleMoveframeDragOver(e, moveframe)}
                      onDragLeave={handleMoveframeDragLeave}
                      onDrop={(e) => handleMoveframeDrop(e, moveframe, workout, day)}
                    >
                      <td colSpan={6} className="border border-gray-300 px-4 py-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div title="Drag to move moveframe">
                            <GripVertical size={12} className="text-gray-400 cursor-grab active:cursor-grabbing" />
                          </div>
                          <button
                            onClick={() => toggleMoveframeExpansion(moveframe.id)}
                            className="hover:bg-gray-200 rounded p-0.5"
                            title="Expand to show movelaps"
                          >
                            {isMoveframeExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>
                          <span className="font-bold text-blue-700">{moveframe.letter}</span>
                          <span className="text-gray-700">{moveframe.sport}</span>
                          <span className="text-gray-500">({moveframe.type || 'Exercise'})</span>
                          {moveframe.description && <span className="text-gray-400 italic">- {moveframe.description}</span>}
                        </div>
                      </td>
                      <td colSpan={16} className="border border-gray-300 px-2 py-1 text-xs text-gray-600">
                        {moveframe.notes || ''}
                      </td>
                    </tr>
                  );

                  // Add movelap rows if moveframe is expanded
                  if (isMoveframeExpanded) {
                    const sortedMovelaps = getSortedMovelaps(moveframe);
                    
                    sortedMovelaps.forEach((movelap: any, lapIndex: number) => {
                      workoutRows.push(
                        <tr 
                          key={`lap-${movelap.id}`}
                          className="bg-green-50 hover:bg-green-100"
                        >
                          <td colSpan={6} className="border border-gray-300 px-8 py-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-700">{movelap.number}.</span>
                              <span className="text-gray-600">Dist: {movelap.distance || '-'}</span>
                              <span className="text-gray-600">Speed: {movelap.speed || '-'}</span>
                              <span className="text-gray-600">Reps: {movelap.reps || '-'}</span>
                              <span className="text-gray-600">Pause: {movelap.pause || '-'}</span>
                              <span className="ml-auto text-gray-500 text-xs cursor-move" title="Drag to reorder within moveframe">⋮⋮</span>
                            </div>
                          </td>
                          <td colSpan={16} className="border border-gray-300 px-2 py-1 text-xs text-gray-600">
                            {movelap.notes || ''}
                          </td>
                        </tr>
                      );
                    });
                  }
                });
              }
            });

            // Add expanded day details row if day details are expanded
            if (expandedDayDetails.has(day.id) && hasWorkouts) {
              workoutRows.push(
                <tr key={`${day.id}-details`} className="bg-gray-50">
                  <td colSpan={23} className="border border-gray-300 px-4 py-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300">
                        <div className="font-bold text-base text-gray-700">
                          📋 Day Details for {getDayName(day.dayOfWeek)}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-600">
                          <span><span className="font-medium text-gray-700">Week:</span> {day.weekNumber}</span>
                          <span><span className="font-medium text-gray-700">Date:</span> {formatDate(day.date)}</span>
                          <span><span className="font-medium text-gray-700">Period:</span> 
                            <span className="ml-1 px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: day.period?.color || '#3b82f6' }}>
                              {day.period?.name || 'N/A'}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mb-3">
                        <span className="font-medium">Feeling:</span> {day.feeling || 'N/A'}
                      </div>
                      {day.notes && (
                        <div className="text-xs text-gray-600 italic mb-3 p-2 bg-yellow-50 border-l-2 border-yellow-400">
                          <span className="font-medium">Day Notes:</span> {day.notes}
                        </div>
                      )}
                      <div className="font-semibold text-sm text-blue-700 mb-2">🏋️ Workouts ({dayWorkouts.length}):</div>
                      {dayWorkouts.map((workout: any, idx: number) => (
                        <div key={workout.id} className="bg-white border border-gray-200 rounded p-3 shadow-sm">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="font-semibold text-sm text-blue-600">
                              Workout #{idx + 1}: {workout.name || 'Unnamed Workout'}
                            </div>
                            <span className="text-xs text-gray-600">
                              <span className="font-medium text-gray-700">Code:</span> {workout.code || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-600">
                              <span className="font-medium text-gray-700">Status:</span> 
                              <span className="ml-1 px-2 py-0.5 rounded text-xs font-medium" style={{ 
                                backgroundColor: workout.status === 'COMPLETED' ? '#10b981' : workout.status === 'IN_PROGRESS' ? '#fbbf24' : '#6b7280', 
                                color: 'white' 
                              }}>
                                {workout.status || 'PLANNED'}
                              </span>
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1 grid grid-cols-2 gap-2">
                            <div><span className="font-medium">Time:</span> {workout.time || 'N/A'}</div>
                            <div><span className="font-medium">Location:</span> {workout.location || 'N/A'}</div>
                            {activeSection === 'C' && (
                              <>
                                <div><span className="font-medium">Weather:</span> {day.weather || 'N/A'}</div>
                                <div><span className="font-medium">Surface:</span> {workout.surface || 'N/A'}</div>
                              </>
                            )}
                          </div>
                          {workout.notes && (
                            <div className="text-xs text-gray-500 mt-2 p-2 bg-blue-50 rounded">
                              <span className="font-medium">Notes:</span> {workout.notes}
                            </div>
                          )}
                          {workout.moveframes && workout.moveframes.length > 0 && (
                            <div className="mt-3 pl-3 border-l-4 border-blue-300">
                              <div className="text-xs font-medium text-gray-700 mb-2">📋 Moveframes ({workout.moveframes.length}):</div>
                              {getSortedMoveframes(workout).map((mf: any, mfIdx: number) => (
                                <div key={mf.id} className="bg-blue-50 rounded p-2 mb-2 text-xs">
                                  <div className="flex items-start gap-2 mb-1">
                                    <span className="font-bold text-blue-700 min-w-[20px]">{mf.letter}.</span>
                                    <div className="flex-1">
                                      <div className="font-semibold text-gray-800">
                                        {mf.sport} - <span className="text-blue-600">{mf.type || 'STANDARD'}</span>
                                      </div>
                                      {mf.description && (
                                        <div className="text-gray-600 italic mt-1">{mf.description}</div>
                                      )}
                                      <div className="grid grid-cols-4 gap-2 mt-2 text-gray-600">
                                        {mf.distance && <div><span className="font-medium">Distance:</span> {mf.distance}</div>}
                                        {mf.repetitions && <div><span className="font-medium">Reps:</span> {mf.repetitions}</div>}
                                        {mf.speed && <div><span className="font-medium">Speed:</span> {mf.speed}</div>}
                                        {mf.pause && <div><span className="font-medium">Pause:</span> {mf.pause}</div>}
                                        {mf.duration && <div><span className="font-medium">Duration:</span> {mf.duration}</div>}
                                        {mf.intensity && <div><span className="font-medium">Intensity:</span> {mf.intensity}</div>}
                                      </div>
                                      {mf.equipment && (
                                        <div className="text-gray-600 mt-1">
                                          <span className="font-medium">Equipment:</span> {mf.equipment}
                                        </div>
                                      )}
                                      {mf.notes && (
                                        <div className="text-gray-500 italic mt-1 text-xs bg-white p-1 rounded">
                                          💬 {mf.notes}
                                        </div>
                                      )}
                                      {mf.movelaps && mf.movelaps.length > 0 && (
                                        <div className="mt-2 ml-4 space-y-1">
                                          <div className="text-xs font-medium text-green-700">🔄 Movelaps ({mf.movelaps.length}):</div>
                                          {mf.movelaps.map((lap: any, lapIdx: number) => (
                                            <div key={lap.id} className="bg-white rounded p-1.5 text-xs border border-green-200">
                                              <span className="font-semibold text-green-600">Lap {lapIdx + 1}:</span>
                                              <span className="ml-2 text-gray-600">
                                                {lap.distance && `${lap.distance} `}
                                                {lap.speed && `@ ${lap.speed} `}
                                                {lap.reps && `× ${lap.reps} `}
                                                {lap.pause && `⏸️ ${lap.pause}`}
                                              </span>
                                              {lap.notes && <div className="text-gray-500 italic text-xs mt-0.5">💬 {lap.notes}</div>}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            }

            return workoutRows;
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

    {/* Drag and Drop Modals */}
    {dragContext && (
      <>
        <WorkoutActionModal
          isOpen={showWorkoutActionModal}
          onClose={() => {
            setShowWorkoutActionModal(false);
            setDragContext(null);
          }}
          onAction={handleWorkoutAction}
          sourceWorkout={dragContext.sourceWorkout}
          targetDay={dragContext.targetDay}
          existingWorkout={dragContext.existingWorkout}
        />

        <MoveframePositionModal
          isOpen={showMoveframePositionModal}
          onClose={() => {
            setShowMoveframePositionModal(false);
            setDragContext(null);
          }}
          onPosition={handleMoveframePosition}
          sourceMoveframe={dragContext.sourceMoveframe}
          targetMoveframe={dragContext.targetMoveframe}
        />

        <ConfirmRemovalModal
          isOpen={showConfirmRemovalModal}
          onClose={() => {
            setShowConfirmRemovalModal(false);
            setShowWorkoutActionModal(true); // Go back to action modal
          }}
          onConfirm={() => {
            const action = dragContext.pendingAction || 'move';
            executeWorkoutAction(action);
          }}
          itemType="workout"
          itemName={dragContext.existingWorkout?.name || 'Unnamed Workout'}
        />
      </>
    )}
    
    {/* Legend */}
    <WorkoutLegend />
  </div>
  );
}
