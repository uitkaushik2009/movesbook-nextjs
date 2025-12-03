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
  onEditMoveframe?: (moveframe: any, workout: any, day: any) => void;
  onEditMovelap?: (movelap: any, moveframe: any, workout: any, day: any) => void;
  onAddWorkout?: (day: any) => void;
  onAddMoveframe?: (workout: any, day: any) => void;
  onAddMovelap?: (moveframe: any, workout: any, day: any) => void; // Direct add movelap with context
  onDataChanged?: () => void; // New prop to refresh data without full reload
  // Active selection setters for hierarchical button behavior
  setActiveDay?: (day: any) => void;
  setActiveWorkout?: (workout: any) => void;
  setActiveMoveframe?: (moveframe: any) => void;
  setActiveMovelap?: (movelap: any) => void;
  // Smart button handlers
  onEditDayClick?: () => void;
  onAddWorkoutClick?: () => void;
  onAddMoveframeClick?: () => void;
  onAddMovelapClick?: () => void;
}

export default function WorkoutTableView({
  workoutPlan,
  periods,
  activeSection = 'A',
  excludeStretchingFromTotals,
  setExcludeStretchingFromTotals,
  onEditWorkout,
  onEditDay,
  onEditMoveframe,
  onEditMovelap,
  onAddWorkout,
  onAddMoveframe,
  onAddMovelap,
  onDataChanged,
  setActiveDay,
  setActiveWorkout,
  setActiveMoveframe,
  setActiveMovelap,
  onEditDayClick,
  onAddWorkoutClick,
  onAddMoveframeClick,
  onAddMovelapClick
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
    checkbox: 40, date: 100, workout: 80, period: 100, week: 80, 
    match: 90, icon: 40, sportName: 80, distance: 70, duration: 70, k: 40, dayname: 80
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
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [workoutSelectorDay, setWorkoutSelectorDay] = useState<any>(null);
  const [workoutOptionsOpen, setWorkoutOptionsOpen] = useState<string | null>(null);
  const [moveframeOptionsOpen, setMoveframeOptionsOpen] = useState<string | null>(null);
  const [movelapOptionsOpen, setMovelapOptionsOpen] = useState<string | null>(null);
  
  // Color and border settings - matches Live Preview from admin settings
  const [colorSettings, setColorSettings] = useState<any>({
    // Page & Background
    pageBackground: '#f3f4f6',
    pageBackgroundOpacity: 100,
    // Week Header (Row 1)
    weekHeader: '#1e40af',
    weekHeaderText: '#ffffff',
    // Day Header (Row 2)
    dayHeader: '#3b82f6',
    dayHeaderText: '#ffffff',
    dayAlternateRow: '#dbeafe',
    dayAlternateRowText: '#1e293b',
    // Workout Headers (Rows 3-4)
    workoutHeader: '#22c55e',
    workoutHeaderText: '#ffffff',
    workout2Header: '#16a34a',
    workout2HeaderText: '#ffffff',
    workout3Header: '#15803d',
    workout3HeaderText: '#ffffff',
    // Moveframe (Rows 5-6)
    moveframeHeader: '#eab308',
    moveframeHeaderText: '#1e293b',
    alternateRowMoveframe: '#fef08a',
    alternateRowTextMoveframe: '#1e293b',
    // Movelap (Rows 7-10)
    movelapHeader: '#fecaca',
    movelapHeaderText: '#1e293b',
    alternateRowMovelap: '#fee2e2',
    alternateRowTextMovelap: '#1e293b',
    // Microlap Details (Row 11)
    microlapBackground: '#f3f4f6',
    microlapText: '#1e293b',
    // Selected Row
    selectedRow: '#3b82f6',
    selectedRowText: '#ffffff',
    // Buttons
    buttonAdd: '#22c55e',
    buttonAddHover: '#16a34a',
    buttonAddText: '#ffffff',
    buttonAddHeaderText: '#ffffff',
    buttonEdit: '#3b82f6',
    buttonEditHover: '#2563eb',
    buttonEditText: '#ffffff',
    buttonEditHeaderText: '#ffffff',
    buttonDelete: '#ef4444',
    buttonDeleteHover: '#dc2626',
    buttonDeleteText: '#ffffff',
    buttonDeleteHeaderText: '#ffffff',
    buttonPrint: '#8b5cf6',
    buttonPrintHover: '#7c3aed',
    buttonPrintText: '#ffffff',
    buttonPrintHeaderText: '#ffffff',
    // Border settings - Separate for each section
    dayBorderEnabled: false,
    dayBorderColor: '#000000',
    dayBorderWidth: 'normal',
    workoutBorderEnabled: false,
    workoutBorderColor: '#000000',
    workoutBorderWidth: 'normal',
    moveframeBorderEnabled: false,
    moveframeBorderColor: '#000000',
    moveframeBorderWidth: 'normal',
    movelapBorderEnabled: false,
    movelapBorderColor: '#000000',
    movelapBorderWidth: 'normal',
    // Movelaps settings
    movelapTextColorSource: 'table',
    movelapRows: {}
  });

  // Helper function to generate border style based on settings
  const getBorderStyle = (section: 'day' | 'workout' | 'moveframe' | 'movelap') => {
    const enabledKey = `${section}BorderEnabled` as keyof typeof colorSettings;
    const colorKey = `${section}BorderColor` as keyof typeof colorSettings;
    const widthKey = `${section}BorderWidth` as keyof typeof colorSettings;
    
    const isEnabled = colorSettings[enabledKey];
    const borderColor = colorSettings[colorKey] || '#000000';
    const borderWidth = colorSettings[widthKey] || 'normal';
    
    const widthValue = 
      borderWidth === 'very-thin' ? '1px' :
      borderWidth === 'thin' ? '2px' :
      borderWidth === 'thick' ? '4px' : '3px';
    
    return isEnabled 
      ? `${widthValue} solid ${borderColor}` 
      : '2px solid transparent';
  };

  // Helper function for button styles
  const getButtonStyle = (type: 'add' | 'edit' | 'delete' | 'print', isHeader = true) => {
    const bgKey = `button${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof colorSettings;
    const textKey = isHeader 
      ? `button${type.charAt(0).toUpperCase() + type.slice(1)}HeaderText` as keyof typeof colorSettings
      : `button${type.charAt(0).toUpperCase() + type.slice(1)}Text` as keyof typeof colorSettings;
    
    return {
      backgroundColor: colorSettings[bgKey] || '#3b82f6',
      color: colorSettings[textKey] || '#ffffff'
    };
  };

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

  // Save/Reset grid settings to database
  const saveGridSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workoutPreferences: {
            tableView: {
              columnWidths,
              excludeStretchingFromTotals
            }
          }
        })
      });

      if (response.ok) {
        alert('Grid settings saved to database!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving grid settings:', error);
      alert('Failed to save grid settings');
    }
  };

  const resetGridSettings = async () => {
    const defaultWidths = {
      checkbox: 40, date: 100, workout: 80, period: 100, week: 80, 
      match: 90, icon: 40, sportName: 80, distance: 70, duration: 70, k: 40, dayname: 80
    };
    setColumnWidths(defaultWidths);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workoutPreferences: {
            tableView: {
              columnWidths: defaultWidths,
              excludeStretchingFromTotals
            }
          }
        })
      });

      if (response.ok) {
        alert('Grid settings reset to default!');
      }
    } catch (error) {
      console.error('Error resetting grid settings:', error);
      alert('Grid settings reset locally but failed to save to database');
    }
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

  const handleMoveframeAction = async (action: 'copy' | 'move', position?: 'before' | 'after' | 'append') => {
    if (!dragContext) return;
    
    const { moveframe: sourceMoveframe, sourceWorkout, targetWorkout, targetMoveframe } = dragContext;

    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (action === 'copy') {
        // Copy: Create a new moveframe with same data in target workout
        const response = await fetch(`/api/workouts/${targetWorkout.id}/moveframes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sport: sourceMoveframe.sport,
            sectionId: sourceMoveframe.sectionId,
            description: sourceMoveframe.description,
            patternType: 'MONODISTANCE',
            distance: sourceMoveframe.distance,
            reps: sourceMoveframe.repetitions || sourceMoveframe.totalReps || 1,
            speedCode: sourceMoveframe.speedCode,
            style: sourceMoveframe.style,
            pace: sourceMoveframe.pace,
            time: sourceMoveframe.time,
            restType: sourceMoveframe.restType,
            pause: sourceMoveframe.pause,
            alarm: sourceMoveframe.alarm,
            sound: sourceMoveframe.sound,
            macroRest: sourceMoveframe.macroRest,
            // Position information
            insertPosition: position,
            targetMoveframeId: targetMoveframe?.id
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Copy failed');
        }

        alert('✅ Moveframe copied successfully!');

      } else if (action === 'move') {
        // Move: Update the moveframe's workout ID
        const response = await fetch(`/api/workouts/moveframes/${sourceMoveframe.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            workoutSessionId: targetWorkout.id,
            // Position information
            insertPosition: position,
            targetMoveframeId: targetMoveframe?.id
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Move failed');
        }

        alert('✅ Moveframe moved successfully!');
      }

      // Refresh data
      if (onDataChanged) {
        onDataChanged();
      }

      // Close modals
      setShowMoveframePositionModal(false);
      setDragContext(null);

    } catch (error) {
      console.error('Moveframe action failed:', error);
      alert(`Failed to ${action} moveframe: ${(error as Error).message}`);
    }
  };

  // Load saved settings from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/user/settings', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const settings = await response.json();
          const workoutPrefs = settings.workoutPreferences || {};
          const tableView = workoutPrefs.tableView || {};
          
          // Load column widths if saved
          if (tableView.columnWidths) {
            setColumnWidths(tableView.columnWidths);
          }
          
          // Load color settings
          if (settings.colorSettings) {
            setColorSettings((prevSettings: any) => ({
              ...prevSettings,
              ...settings.colorSettings
            }));
          }
          
          // Note: excludeStretchingFromTotals is managed by parent component (WorkoutSection)
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
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

  // Check if day is Sunday (end of week)
  const isSunday = (dayOfWeek: number): boolean => {
    return dayOfWeek === 7;
  };

  // Get thicker border class for Sunday (end of week)
  const getWeekEndBorder = (dayOfWeek: number): string => {
    return isSunday(dayOfWeek) ? 'border-b-4 border-b-gray-800' : '';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
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

  const getWorkoutNumbers = (day: any) => {
    if (!day.workouts || day.workouts.length === 0) return '-';
    return day.workouts.map((_: any, idx: number) => idx + 1).join(', ');
  };

  const getMatchPercentage = (day: any) => {
    // Calculate planned vs actual match percentage
    // This is a placeholder - implement based on your business logic
    return '85% + 20%';
  };

  const getPrimarySport = (day: any) => {
    // Get the primary sport for the day (most frequent or first)
    const sports = getDaySports(day);
    return sports[0] || null;
  };

  const getTotalDistance = (day: any, sport?: string) => {
    if (!day.workouts) return '-';
    let total = 0;
    day.workouts.forEach((workout: any) => {
      workout.moveframes?.forEach((mf: any) => {
        if (!sport || mf.sport === sport) {
          const dist = parseFloat(mf.distance) || 0;
          total += dist;
        }
      });
    });
    return total > 0 ? total.toFixed(1) : '-';
  };

  const getTotalDuration = (day: any, sport?: string) => {
    if (!day.workouts) return '-';
    let totalMinutes = 0;
    day.workouts.forEach((workout: any) => {
      workout.moveframes?.forEach((mf: any) => {
        if (!sport || mf.sport === sport) {
          // Parse duration like "0:45" to minutes
          const duration = mf.duration || '';
          const parts = duration.split(':');
          if (parts.length === 2) {
            totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]);
          }
        }
      });
    });
    if (totalMinutes === 0) return '-';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
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

  // Helper to get unique sports for a single workout
  const getWorkoutSports = (workout: any): string[] => {
    const sports = new Set<string>();
    workout.moveframes?.forEach((mf: any) => {
      if (mf.sport) sports.add(mf.sport);
    });
    return Array.from(sports).slice(0, 4);
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

  // Workout symbols based on session number
  const getWorkoutSymbol = (sessionNumber: number): string => {
    const symbols: Record<number, string> = {
      1: '○', // Circle for workout #1
      2: '□', // Square for workout #2
      3: '△'  // Triangle for workout #3
    };
    return symbols[sessionNumber] || '◇'; // Diamond for 4+
  };

  // Get workout status color based on status
  const getWorkoutStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'NOT_PLANNED': '#ffffff',                    // White
      'PLANNED_FUTURE': '#fef08a',                 // Yellow - Planned in future
      'PLANNED_NEXT_WEEK': '#fed7aa',              // Orange - Next week
      'PLANNED_CURRENT_WEEK': '#fecaca',           // Red - This week
      'DONE_DIFFERENTLY': '#bfdbfe',               // Blue - Done differently
      'DONE_LESS_75': '#bbf7d0',                   // Light Green - Done <75%
      'DONE_MORE_75': '#86efac'                    // Green - Done >75%
    };
    return colorMap[status] || '#ffffff';
  };

  // Get day status indicator
  const getDayStatusIndicator = (day: any): { border: string; bg: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    
    const isToday = dayDate.getTime() === today.getTime();
    const hasWorkouts = day.workouts && day.workouts.length > 0;
    
    if (isToday) {
      return { border: 'ring-2 ring-green-500', bg: '' };
    }
    
    if (hasWorkouts) {
      return { border: 'border-blue-300', bg: 'bg-blue-50' };
    }
    
    return { border: 'border-gray-200', bg: 'bg-white' };
  };

  // Get movelap row colors (alternating)
  const getMovelapRowStyle = (lapIndex: number) => {
    const isEven = lapIndex % 2 === 0;
    const bgColor = isEven ? colorSettings.alternateRowMovelap : colorSettings.movelapHeader;
    const textColor = isEven ? colorSettings.alternateRowTextMovelap : colorSettings.movelapHeaderText;
    
    // Get border style for movelap section
    const borderStyle = getBorderStyle('movelap');
    
    return {
      backgroundColor: bgColor,
      color: textColor,
      border: borderStyle
    };
  };

  return (
    <div ref={containerRef} className="relative flex flex-col pb-8">
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
      
      {/* Action Buttons Toolbar */}
      <div className="flex items-center justify-between mb-2 px-2 py-2 bg-white border border-gray-300 rounded">
        <div className="flex gap-2">
          <button
            onClick={onEditDayClick}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium flex items-center gap-1"
            title="Edit selected day metadata (date, period, weather, feeling, notes)"
          >
            📅 Edit Day
          </button>
          <button
            onClick={onAddWorkoutClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center gap-1"
            title="Add workout to selected day (click a day row first)"
          >
            🏋️ Add Workout
          </button>
          <button
            onClick={onAddMoveframeClick}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium flex items-center gap-1"
            title="Add moveframe to selected workout (click a workout row first)"
          >
            📋 Add Moveframe
          </button>
          <button
            onClick={onAddMovelapClick}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-medium flex items-center gap-1"
            title="Add movelap to selected moveframe (click a moveframe row first)"
          >
            🔄 Add Movelap
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
        <table className="border-collapse text-xs" style={{ minWidth: '2800px', width: 'max-content' }}>
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
            {/* Checkbox Column - Sticky */}
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
            </th>
            
            {/* Date Column - Sticky */}
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200 relative" style={{width: `${columnWidths.date}px`, left: `${columnWidths.checkbox}px`}} rowSpan={2}>
              Date
            </th>
            
            {/* Workout # Column - Sticky */}
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200 relative" style={{width: `${columnWidths.workout}px`, left: `${columnWidths.checkbox + columnWidths.date}px`}} rowSpan={2}>
              Workout
            </th>
            
            {/* Period Column - Sticky */}
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200 relative" style={{width: `${columnWidths.period}px`, left: `${columnWidths.checkbox + columnWidths.date + columnWidths.workout}px`}} rowSpan={2}>
              Period
            </th>
            
            {/* Week Column - Sticky */}
            <th className="border border-gray-400 px-2 py-1 text-center font-bold sticky z-50 bg-gray-200 relative" style={{width: `${columnWidths.week}px`, left: `${columnWidths.checkbox + columnWidths.date + columnWidths.workout + columnWidths.period}px`}} rowSpan={2}>
              Week
            </th>
            
            {/* Match Column */}
            <th className="border border-gray-400 px-2 py-1 text-center font-bold bg-gray-200" style={{width: `${columnWidths.match}px`}} rowSpan={2}>
              Match
            </th>
            
            {/* Icon Column */}
            <th className="border border-gray-400 px-1 py-1 text-center font-bold bg-gray-200" style={{width: `${columnWidths.icon}px`}} rowSpan={2}>
              Icon
            </th>
            
            {/* Sport Name Column */}
            <th className="border border-gray-400 px-2 py-1 text-center font-bold bg-gray-200" style={{width: `${columnWidths.sportName}px`}} rowSpan={2}>
              Sport Name
            </th>
            
            {/* Distance Column */}
            <th className="border border-gray-400 px-2 py-1 text-center font-bold bg-gray-200" style={{width: `${columnWidths.distance}px`}} rowSpan={2}>
              Distance
            </th>
            
            {/* Duration Column */}
            <th className="border border-gray-400 px-2 py-1 text-center font-bold bg-gray-200" style={{width: `${columnWidths.duration}px`}} rowSpan={2}>
              Duration
            </th>
            
            {/* K Column */}
            <th className="border border-gray-400 px-1 py-1 text-center font-bold bg-gray-200" style={{width: `${columnWidths.k}px`}} rowSpan={2}>
              K
            </th>
            
            {/* S1-S4 Sports columns */}
            {[0, 1, 2, 3].map((sportIndex) => (
              <th key={sportIndex} className={`border border-gray-400 px-1 py-1 text-center font-bold ${sportColors[sportIndex].header}`} colSpan={5}>
                S{sportIndex + 1}
              </th>
            ))}
            
            {/* S4 Indicator Column */}
            <th className="border border-gray-400 px-1 py-1 text-center font-bold bg-gray-200" style={{width: '40px'}} rowSpan={2}>
              S4
            </th>
            
            {/* Summary Columns */}
            <th className="border border-gray-400 px-2 py-1 text-center font-bold bg-green-100" style={{width: '80px'}} rowSpan={2}>
              Sport
            </th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold bg-green-100" style={{width: '80px'}} rowSpan={2}>
              Distance
            </th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold bg-green-100" style={{width: '80px'}} rowSpan={2}>
              Duration
            </th>
            <th className="border border-gray-400 px-1 py-1 text-center font-bold bg-green-100" style={{width: '50px'}} rowSpan={2}>
              K
            </th>
            
            <th className="border border-gray-400 px-1 py-1 text-center font-bold sticky right-0 z-50 bg-gray-200" style={{width: '80px', boxShadow: '-4px 0 8px rgba(0,0,0,0.15)'}} rowSpan={2}>Options</th>
          </tr>
          <tr className="bg-gray-100 border-b border-gray-400">
            {/* Sub-headers for each sport S1-S4 */}
            {[0, 1, 2, 3].map((sportIndex) => (
              <React.Fragment key={sportIndex}>
                <th className={`border border-gray-400 px-1 py-1 text-center font-semibold text-xs ${sportColors[sportIndex].cell}`} style={{width: '40px'}}>Icon</th>
                <th className={`border border-gray-400 px-1 py-1 text-center font-semibold text-xs ${sportColors[sportIndex].cell}`} style={{width: '70px'}}>Sport</th>
                <th className={`border border-gray-400 px-1 py-1 text-center font-semibold text-xs ${sportColors[sportIndex].cell}`} style={{width: '70px'}}>Distance</th>
                <th className={`border border-gray-400 px-1 py-1 text-center font-semibold text-xs ${sportColors[sportIndex].cell}`} style={{width: '70px'}}>Duration</th>
                <th className={`border border-gray-400 px-1 py-1 text-center font-semibold text-xs ${sportColors[sportIndex].cell}`} style={{width: '40px'}}>K</th>
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
              const dayStatus = getDayStatusIndicator(day);
              const rowBgClass = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : isSelected ? 'bg-yellow-50' : dayStatus.bg + ' hover:bg-gray-100';
              
              const stickyBg = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : isSelected ? 'bg-yellow-50' : 'bg-white';
              
              let leftPos = columnWidths.checkbox;
              
              return (
                <tr 
                  key={day.id} 
                  className={`${rowBgClass} cursor-pointer ${dayStatus.border} ${getWeekEndBorder(day.dayOfWeek)}`}
                  onClick={() => {
                    // Set as active day for add buttons
                    setActiveDay?.(day);
                    
                    // Check if this day has workouts
                    if (day.workouts && day.workouts.length > 0) {
                      toggleDayDetails(day.id);
                    } else {
                      // For days without workouts, just select it
                      toggleDaySelection(day.id);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onEditDay?.(day);
                  }}
                  title={day.workouts && day.workouts.length > 0 ? "Click to expand/collapse | Double-click to edit" : "Click to select | Double-click to edit"}
                >
                  {/* Checkbox */}
                  <td className={`border border-gray-300 px-1 py-1 text-center sticky left-0 z-10 ${stickyBg}`} onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleDaySelection(day.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer"
                    />
                  </td>
                  
                  {/* Date */}
                  <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: `${leftPos}px`}}>
                    {formatDate(day.date)}
                  </td>
                  
                  {/* Workout # */}
                  <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: `${leftPos += columnWidths.date}px`}}>
                    -
                  </td>
                  
                  {/* Period */}
                  <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: `${leftPos += columnWidths.workout}px`}}>
                    <div className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: day.period?.color || '#3b82f6' }}>
                      {day.period?.name || '-'}
                    </div>
                  </td>
                  
                  {/* Week */}
                  <td className={`border border-gray-300 px-2 py-1 text-center font-semibold sticky z-10 ${stickyBg}`} style={{left: `${leftPos += columnWidths.period}px`}}>
                    {getDayName(day.dayOfWeek)}
                  </td>
                  
                  {/* Match, Icon, Sport Name, Distance, Duration, K - Empty for no workouts */}
                  <td className="border border-gray-300 px-2 py-2 text-center text-gray-400 italic" colSpan={6}>
                    No workouts
                  </td>
                  
                  {/* S1-S4 columns - Empty */}
                  {[0, 1, 2, 3].map((sportIndex) => (
                    <React.Fragment key={sportIndex}>
                      <td className={`border border-gray-300 text-center ${sportColors[sportIndex].cell}`}>-</td>
                      <td className={`border border-gray-300 text-center ${sportColors[sportIndex].cell}`}>-</td>
                      <td className={`border border-gray-300 text-center ${sportColors[sportIndex].cell}`}>-</td>
                      <td className={`border border-gray-300 text-center ${sportColors[sportIndex].cell}`}>-</td>
                      <td className={`border border-gray-300 text-center ${sportColors[sportIndex].cell}`}>-</td>
                    </React.Fragment>
                  ))}
                  
                  {/* S4 Indicator */}
                  <td className="border border-gray-300 text-center">-</td>
                  
                  {/* Summary columns */}
                  <td className="border border-gray-300 text-center bg-green-50">-</td>
                  <td className="border border-gray-300 text-center bg-green-50">-</td>
                  <td className="border border-gray-300 text-center bg-green-50">-</td>
                  <td className="border border-gray-300 text-center bg-green-50">-</td>
                  <td className="border border-gray-300 px-1 py-1 text-center sticky right-0 z-10 bg-white" style={{boxShadow: '-4px 0 8px rgba(0,0,0,0.1)'}}>
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

            // Day with workouts - show one row per workout
            const workoutRows: JSX.Element[] = [];
            const primarySport = getPrimarySport(day);
            
            dayWorkouts.forEach((workout: any, workoutIndex: number) => {
              const isFirstWorkout = workoutIndex === 0;
              const isCopied = copiedDays.some((d: any) => d.id === day.id);
              const isCut = cutDays.some((d: any) => d.id === day.id);
              const isSelected = selectedDays.has(day.id);
              const isExpanded = expandedDayDetails.has(day.id);
              const isWorkoutExpanded = expandedWorkouts.has(workout.id);
              
              // Apply workout status color to background
              const statusColor = getWorkoutStatusColor(workout.status || 'NOT_PLANNED');
              let rowBgStyle: React.CSSProperties = { backgroundColor: statusColor };
              let rowBgClass = 'hover:opacity-90';
              
              if (isCut) {
                rowBgClass = 'bg-gray-300';
                rowBgStyle = { backgroundColor: 'transparent' };
              } else if (isCopied) {
                rowBgClass = 'bg-blue-100';
                rowBgStyle = { backgroundColor: 'transparent' };
              } else if (isSelected) {
                rowBgClass = 'bg-yellow-50';
                rowBgStyle = { backgroundColor: 'transparent' };
              }
              
              const stickyBg = isCut ? 'bg-gray-300' : isCopied ? 'bg-blue-100' : isSelected ? 'bg-yellow-50' : 'bg-white';
              
              // Get day status indicator for first workout row
              const dayStatus = isFirstWorkout ? getDayStatusIndicator(day) : null;
              
              let leftPos = columnWidths.checkbox;
              
              // Check if this is the last workout of the day
              const isLastWorkout = workoutIndex === dayWorkouts.length - 1;
              
              // Workout row
              workoutRows.push(
                <tr 
                  key={`${day.id}-${workout.id}`} 
                  className={`${rowBgClass} cursor-pointer ${isFirstWorkout && dayStatus ? dayStatus.border : ''} ${isLastWorkout ? getWeekEndBorder(day.dayOfWeek) : ''}`}
                  style={rowBgStyle}
                  draggable
                  onDragStart={(e) => handleWorkoutDragStart(e, workout, day)}
                  onClick={(e) => {
                    // Only toggle if not clicking on interactive elements
                    const target = e.target as HTMLElement;
                    if (!target.closest('input, button, select, textarea, a')) {
                      // Set active selections for hierarchy
                      setActiveDay?.(day);
                      setActiveWorkout?.(workout);
                      setActiveMoveframe?.(null); // Clear lower levels
                      setActiveMovelap?.(null);
                      toggleDayDetails(day.id);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onEditWorkout?.(workout, day);
                  }}
                  title="Click to select day + workout | Double-click to edit workout | Drag to move"
                >
                  {isFirstWorkout && (
                    <>
                      {/* Checkbox */}
                      <td className={`border border-gray-300 px-1 py-1 text-center sticky left-0 z-10 ${stickyBg}`} rowSpan={dayWorkouts.length} onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleDaySelection(day.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer"
                        />
                      </td>
                      
                      {/* Date */}
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: `${leftPos}px`}} rowSpan={dayWorkouts.length}>
                        {formatDate(day.date)}
                      </td>
                      
                      {/* Workout # with symbols */}
                      <td className={`border border-gray-300 px-2 py-1 text-center sticky z-10 ${stickyBg}`} style={{left: `${leftPos += columnWidths.date}px`}} rowSpan={dayWorkouts.length}>
                        <div className="flex flex-col items-center gap-0.5">
                          {dayWorkouts.map((w: any, idx: number) => (
                            <span key={w.id} className="text-base" style={{ color: getWorkoutStatusColor(w.status || 'NOT_PLANNED').replace('#', '') === 'ffffff' ? '#d1d5db' : getWorkoutStatusColor(w.status || 'NOT_PLANNED') }}>
                              {getWorkoutSymbol(w.sessionNumber || idx + 1)}
                            </span>
                          ))}
                        </div>
                      </td>
                      
                      {/* Period */}
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs sticky z-10 ${stickyBg}`} style={{left: `${leftPos += columnWidths.workout}px`}} rowSpan={dayWorkouts.length}>
                        <div className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: day.period?.color || '#3b82f6' }}>
                          {day.period?.name || '-'}
                        </div>
                      </td>
                      
                      {/* Week (Day name) */}
                      <td 
                        className={`border border-gray-300 px-2 py-1 text-center font-medium sticky z-10 ${stickyBg} cursor-pointer hover:bg-blue-200 ${dragOverDay === day.id ? 'ring-4 ring-green-500 bg-green-100' : ''}`} 
                        style={{left: `${leftPos += columnWidths.period}px`}}
                        rowSpan={dayWorkouts.length}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          toggleDayDetails(day.id);
                        }}
                        onDragOver={(e) => handleDayDragOver(e, day)}
                        onDragLeave={handleDayDragLeave}
                        onDrop={(e) => handleWorkoutDrop(e, day)}
                        title="Click to expand/collapse workouts | Drop workout here"
                      >
                        {getDayName(day.dayOfWeek)}
                      </td>
                      
                      {/* Match */}
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs ${stickyBg}`} rowSpan={dayWorkouts.length}>
                        {getMatchPercentage(day)}
                      </td>
                      
                      {/* Icon */}
                      <td className={`border border-gray-300 px-1 py-1 text-center text-lg ${stickyBg}`} rowSpan={dayWorkouts.length}>
                        {primarySport && getSportIcon(primarySport)}
                      </td>
                      
                      {/* Sport Name */}
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs font-semibold ${stickyBg}`} rowSpan={dayWorkouts.length}>
                        {primarySport || '-'}
                      </td>
                      
                      {/* Distance */}
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs ${stickyBg}`} rowSpan={dayWorkouts.length}>
                        {getTotalDistance(day, primarySport || undefined)}
                      </td>
                      
                      {/* Duration */}
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs ${stickyBg}`} rowSpan={dayWorkouts.length}>
                        {getTotalDuration(day, primarySport || undefined)}
                      </td>
                      
                      {/* K */}
                      <td className={`border border-gray-300 px-1 py-1 text-center text-xs ${stickyBg}`} rowSpan={dayWorkouts.length}>
                        -
                      </td>
                    </>
                  )}
                  
                  {/* S1-S4 Sport columns - DAY LEVEL aggregation */}
                  {isFirstWorkout && [0, 1, 2, 3].map((sportIndex) => {
                    const sport = daySports[sportIndex];
                    const sportData = sport ? getDaySportData(day, sport) : null;
                    
                    return (
                      <React.Fragment key={sportIndex}>
                        <td className={`border border-gray-300 px-1 py-1 text-center text-lg ${sportColors[sportIndex].cell}`} rowSpan={dayWorkouts.length}>
                          {sport && getSportIcon(sport)}
                        </td>
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
                  
                  {/* S4 Indicator */}
                  {isFirstWorkout && (
                    <td className={`border border-gray-300 px-1 py-1 text-center text-xs ${stickyBg}`} rowSpan={dayWorkouts.length}>
                      {daySports.length >= 4 ? '✓' : '-'}
                    </td>
                  )}
                  
                  {/* Summary Columns */}
                  {isFirstWorkout && (
                    <>
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs font-semibold bg-green-50`} rowSpan={dayWorkouts.length}>
                        {daySports.join(', ') || '-'}
                      </td>
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs bg-green-50`} rowSpan={dayWorkouts.length}>
                        {getTotalDistance(day)}
                      </td>
                      <td className={`border border-gray-300 px-2 py-1 text-center text-xs bg-green-50`} rowSpan={dayWorkouts.length}>
                        {getTotalDuration(day)}
                      </td>
                      <td className={`border border-gray-300 px-1 py-1 text-center text-xs bg-green-50`} rowSpan={dayWorkouts.length}>
                        -
                      </td>
                    </>
                  )}
                  
                  {/* Options column - sticky on the right */}
                  {isFirstWorkout ? (
                    <td className={`border border-gray-300 px-1 py-1 text-center sticky right-0 z-10 ${stickyBg}`} style={{boxShadow: '-4px 0 8px rgba(0,0,0,0.1)'}} rowSpan={dayWorkouts.length}>
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
                </tr>
              );

              // Add moveframe rows if workout is expanded
              if (isWorkoutExpanded) {
                const sortedMoveframes = getSortedMoveframes(workout);
                
                // Add header row for moveframe details
                workoutRows.push(
                  <tr key={`${workout.id}-mf-header`} className="bg-purple-100">
                    <td colSpan={6} className="border border-gray-300 px-4 py-1 text-xs font-bold sticky left-0 z-10 bg-purple-100">
                      Moveframes for {workout.name || `Workout ${workoutIndex + 1}`}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-xs font-bold text-center">MF</td>
                    <td className="border border-gray-300 px-2 py-1 text-xs font-bold text-center">Color</td>
                    <td className="border border-gray-300 px-2 py-1 text-xs font-bold text-center">Workout type</td>
                    <td className="border border-gray-300 px-1 py-1 text-xs font-bold text-center">Icon</td>
                    <td className="border border-gray-300 px-2 py-1 text-xs font-bold text-center">Sport</td>
                    <td className="border border-gray-300 px-2 py-1 text-xs font-bold text-center">Moveframe description</td>
                    <td className="border border-gray-300 px-2 py-1 text-xs font-bold text-center">Rip</td>
                    <td className="border border-gray-300 px-2 py-1 text-xs font-bold text-center">Macro</td>
                    <td className="border border-gray-300 px-2 py-1 text-xs font-bold text-center">Alarm & Sound</td>
                    <td colSpan={17} className="border border-gray-300"></td>
                    <td className="border border-gray-300 px-2 py-1 text-xs font-bold text-center sticky right-0 z-10 bg-purple-100">Options</td>
                  </tr>
                );
                
                sortedMoveframes.forEach((moveframe: any, mfIndex: number) => {
                  const isMoveframeExpanded = expandedMoveframes.has(moveframe.id);
                  let leftPos = columnWidths.checkbox;
                  
                  // Calculate moveframe distance and duration
                  const mfDistance = parseFloat(moveframe.distance) || 0;
                  const mfDurationParts = (moveframe.duration || '').split(':');
                  const mfDurationMinutes = mfDurationParts.length === 2 
                    ? parseInt(mfDurationParts[0]) * 60 + parseInt(mfDurationParts[1])
                    : 0;
                  const mfDurationFormatted = mfDurationMinutes > 0 
                    ? `${Math.floor(mfDurationMinutes / 60)}:${(mfDurationMinutes % 60).toString().padStart(2, '0')}`
                    : '-';
                  
                  // Moveframe row with structured columns
                  workoutRows.push(
                    <tr 
                      key={`mf-${moveframe.id}`}
                      className={`bg-blue-50 hover:bg-blue-100 cursor-pointer ${dragOverMoveframe === moveframe.id ? 'ring-2 ring-purple-500' : ''}`}
                      draggable
                      onDragStart={(e) => handleMoveframeDragStart(e, moveframe, workout, day)}
                      onDragOver={(e) => handleMoveframeDragOver(e, moveframe)}
                      onDragLeave={handleMoveframeDragLeave}
                      onDrop={(e) => handleMoveframeDrop(e, moveframe, workout, day)}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target.closest('button, select, textarea, a')) {
                          // Set active selections for hierarchy
                          setActiveDay?.(day);
                          setActiveWorkout?.(workout);
                          setActiveMoveframe?.(moveframe);
                          setActiveMovelap?.(null); // Clear lower level
                        }
                      }}
                      title="Click to select moveframe | Drag to move"
                    >
                      {/* First 6 columns - merged cell with moveframe details */}
                      <td colSpan={6} className="border border-gray-300 px-4 py-1 text-xs sticky left-0 z-10 bg-blue-50">
                        <div className="flex items-center gap-2">
                          <div title="Drag to move moveframe">
                            <GripVertical size={12} className="text-gray-400 cursor-grab active:cursor-grabbing" />
                          </div>
                          <button
                            onClick={() => toggleMoveframeExpansion(moveframe.id)}
                            className="hover:bg-purple-100 rounded p-0.5 text-purple-600"
                            title="Expand to show movelaps"
                          >
                            {isMoveframeExpanded ? <ChevronDown size={12} className="font-bold" /> : <ChevronRight size={12} className="font-bold" />}
                          </button>
                          <span className="text-lg">{getSportIcon(moveframe.sport)}</span>
                          <span className="font-bold text-blue-700">{moveframe.letter}</span>
                          <span className="text-gray-700 font-semibold">{moveframe.sport}</span>
                          <span className="text-gray-500 text-xs">({moveframe.type || 'Exercise'})</span>
                          {moveframe.description && <span className="text-gray-400 italic text-xs">- {moveframe.description}</span>}
                        </div>
                      </td>
                      
                      {/* MF (Moveframe Letter) */}
                      <td className="border border-gray-300 px-2 py-1 text-xs text-center font-bold text-blue-700">
                        {moveframe.letter}
                      </td>
                      
                      {/* Color */}
                      <td className="border border-gray-300 px-1 py-1 text-xs text-center" style={{ backgroundColor: moveframe.color || '#F5C2E7' }}>
                        {/* Color cell - shows the moveframe color */}
                      </td>
                      
                      {/* Workout type */}
                      <td className="border border-gray-300 px-2 py-1 text-xs text-center">
                        {moveframe.type || 'Warm-up'}
                      </td>
                      
                      {/* Icon */}
                      <td className="border border-gray-300 px-1 py-1 text-lg text-center">
                        {getSportIcon(moveframe.sport)}
                      </td>
                      
                      {/* Sport */}
                      <td className="border border-gray-300 px-2 py-1 text-xs text-center font-medium">
                        {moveframe.sport}
                      </td>
                      
                      {/* Moveframe description */}
                      <td className="border border-gray-300 px-2 py-1 text-xs text-center">
                        {moveframe.description || '-'}
                      </td>
                      
                      {/* Rip */}
                      <td className="border border-gray-300 px-2 py-1 text-xs text-center">
                        {moveframe.repetitions || '-'}
                      </td>
                      
                      {/* Macro */}
                      <td className="border border-gray-300 px-2 py-1 text-xs text-center">
                        {moveframe.macro || '-'}
                      </td>
                      
                      {/* Alarm & Sound */}
                      <td className="border border-gray-300 px-2 py-1 text-xs text-center">
                        {moveframe.alarm ? '🔔' : '-'}
                      </td>
                      
                      {/* Empty columns to fill the rest */}
                      <td colSpan={17} className="border border-gray-300 px-2 py-1 text-xs text-gray-600">
                        {moveframe.notes || ''}
                      </td>
                      
                      {/* Moveframe Options */}
                      <td className="border border-gray-300 px-2 py-1 text-xs text-center sticky right-0 z-10 bg-blue-50">
                        <div className="relative">
                          <button 
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMoveframeOptionsOpen(moveframeOptionsOpen === moveframe.id ? null : moveframe.id);
                            }}
                            title="Moveframe options"
                          >
                            Options
                          </button>
                          
                          {moveframeOptionsOpen === moveframe.id && (
                            <div 
                              className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-400 rounded shadow-2xl z-[9999] min-w-[140px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                onClick={() => { alert(`Edit moveframe ${moveframe.letter}`); setMoveframeOptionsOpen(null); }}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 font-medium"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => { alert(`Copy moveframe ${moveframe.letter}`); setMoveframeOptionsOpen(null); }}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 border-t"
                              >
                                Copy
                              </button>
                              <button 
                                onClick={() => { alert(`Move moveframe ${moveframe.letter}`); setMoveframeOptionsOpen(null); }}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                              >
                                Move
                              </button>
                              <button 
                                onClick={() => { alert(`Duplicate moveframe ${moveframe.letter}`); setMoveframeOptionsOpen(null); }}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-purple-50 border-t"
                              >
                                Duplicate
                              </button>
                              <button 
                                onClick={() => { if(confirm(`Delete moveframe ${moveframe.letter}?`)) alert('Deleted'); setMoveframeOptionsOpen(null); }}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 border-t"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );

                  // Add movelap rows if moveframe is expanded
                  if (isMoveframeExpanded) {
                    const sortedMovelaps = getSortedMovelaps(moveframe);
                    
                    // Add header row for movelaps
                    const movelapBorderStyle = { border: getBorderStyle('movelap') };
                    workoutRows.push(
                      <tr key={`${moveframe.id}-lap-header`} style={{ backgroundColor: colorSettings.movelapHeader, color: colorSettings.movelapHeaderText }}>
                        <td colSpan={6} className="px-8 py-1 text-xs font-bold sticky left-0 z-10" style={{ backgroundColor: colorSettings.movelapHeader, color: colorSettings.movelapHeaderText, ...movelapBorderStyle }}>
                          Movelaps for {moveframe.letter}
                        </td>
                        <td className="px-1 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>MF</td>
                        <td className="px-1 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Color</td>
                        <td className="px-2 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Workout type</td>
                        <td className="px-2 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Sport</td>
                        <td className="px-2 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Distance</td>
                        <td className="px-2 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Style</td>
                        <td className="px-2 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Speed</td>
                        <td className="px-2 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Time</td>
                        <td className="px-2 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Pace</td>
                        <td className="px-2 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Rec</td>
                        <td className="px-2 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Rest To</td>
                        <td className="px-2 py-1 text-xs font-bold text-center" style={movelapBorderStyle}>Alm Sound</td>
                        <td colSpan={11} className="px-2 py-1 text-xs font-bold" style={movelapBorderStyle}>Annotation</td>
                        <td className="px-2 py-1 text-xs font-bold text-center sticky right-0 z-10" style={{ backgroundColor: colorSettings.movelapHeader, color: colorSettings.movelapHeaderText, ...movelapBorderStyle }}>Actions</td>
                      </tr>
                    );
                    
                    sortedMovelaps.forEach((movelap: any, lapIndex: number) => {
                      const rowStyle = getMovelapRowStyle(lapIndex);
                      
                      workoutRows.push(
                        <tr 
                          key={`lap-${movelap.id}`}
                          className="hover:opacity-90 cursor-pointer"
                          style={rowStyle}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (!target.closest('button, select, textarea, a')) {
                              // Set active selections for full hierarchy
                              setActiveDay?.(day);
                              setActiveWorkout?.(workout);
                              setActiveMoveframe?.(moveframe);
                              setActiveMovelap?.(movelap);
                            }
                          }}
                          title="Click to select movelap"
                        >
                          <td colSpan={6} className="px-8 py-1 text-xs sticky left-0 z-10" style={rowStyle}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs cursor-move" title="Drag to reorder within moveframe">⋮⋮</span>
                              <span className="font-bold">{movelap.number}.</span>
                              <span>Lap {movelap.number}</span>
                            </div>
                          </td>
                          
                          {/* MF (Moveframe letter) */}
                          <td className="px-1 py-1 text-xs text-center font-bold" style={rowStyle}>
                            {moveframe.letter}
                          </td>
                          
                          {/* Color */}
                          <td className="px-1 py-1 text-xs text-center" style={{ ...rowStyle, backgroundColor: movelap.color || rowStyle.backgroundColor }}>
                          </td>
                          
                          {/* Workout type */}
                          <td className="px-2 py-1 text-xs text-center" style={rowStyle}>
                            {moveframe.type || '-'}
                          </td>
                          
                          {/* Sport */}
                          <td className="px-2 py-1 text-xs text-center" style={rowStyle}>
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-sm">{getSportIcon(moveframe.sport)}</span>
                              <span>{moveframe.sport}</span>
                            </div>
                          </td>
                          
                          {/* Distance */}
                          <td className="px-2 py-1 text-xs text-center" style={rowStyle}>
                            {movelap.distance || '-'}
                          </td>
                          
                          {/* Style */}
                          <td className="px-2 py-1 text-xs text-center" style={rowStyle}>
                            {movelap.style || '-'}
                          </td>
                          
                          {/* Speed */}
                          <td className="px-2 py-1 text-xs text-center" style={rowStyle}>
                            {movelap.speed || '-'}
                          </td>
                          
                          {/* Time */}
                          <td className="px-2 py-1 text-xs text-center" style={rowStyle}>
                            {movelap.time || '-'}
                          </td>
                          
                          {/* Pace */}
                          <td className="px-2 py-1 text-xs text-center" style={rowStyle}>
                            {movelap.pace || '-'}
                          </td>
                          
                          {/* Rec (Recovery) */}
                          <td className="px-2 py-1 text-xs text-center" style={rowStyle}>
                            {movelap.pause || '-'}
                          </td>
                          
                          {/* Rest To */}
                          <td className="px-2 py-1 text-xs text-center" style={rowStyle}>
                            {movelap.restTo || '-'}
                          </td>
                          
                          {/* Alm Sound (Alarm Sound) */}
                          <td className="px-2 py-1 text-xs text-center" style={rowStyle}>
                            {movelap.alarm ? '🔔' : '-'}
                          </td>
                          
                          {/* Annotation (Notes) */}
                          <td colSpan={11} className="px-2 py-1 text-xs" style={rowStyle}>
                            {movelap.notes || ''}
                          </td>
                          
                          {/* Movelap Options */}
                          <td className="px-2 py-1 text-xs text-center sticky right-0 z-10" style={rowStyle}>
                            <div className="relative">
                              <button 
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMovelapOptionsOpen(movelapOptionsOpen === movelap.id ? null : movelap.id);
                                }}
                                title="Movelap options"
                              >
                                Options
                              </button>
                              
                              {movelapOptionsOpen === movelap.id && (
                                <div 
                                  className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-400 rounded shadow-2xl z-[9999] min-w-[140px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button 
                                    onClick={() => { alert(`Edit movelap ${movelap.number}`); setMovelapOptionsOpen(null); }}
                                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => { alert(`Copy movelap ${movelap.number}`); setMovelapOptionsOpen(null); }}
                                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 border-t"
                                  >
                                    Copy
                                  </button>
                                  <button 
                                    onClick={() => { alert(`Move movelap ${movelap.number}`); setMovelapOptionsOpen(null); }}
                                    className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                                  >
                                    Move
                                  </button>
                                  <button 
                                    onClick={() => { alert(`Duplicate movelap ${movelap.number}`); setMovelapOptionsOpen(null); }}
                                    className="w-full px-3 py-2 text-left text-xs hover:bg-purple-50 border-t"
                                  >
                                    Duplicate
                                  </button>
                                  <button 
                                    onClick={() => { alert(`Change color of movelap ${movelap.number}`); setMovelapOptionsOpen(null); }}
                                    className="w-full px-3 py-2 text-left text-xs hover:bg-yellow-50 border-t"
                                  >
                                    Change Color
                                  </button>
                                  <button 
                                    onClick={() => { if(confirm(`Delete movelap ${movelap.number}?`)) alert('Deleted'); setMovelapOptionsOpen(null); }}
                                    className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 border-t"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                    
                    // Add "Add new row" button
                    workoutRows.push(
                      <tr key={`${moveframe.id}-add-lap`} className="bg-green-100">
                        <td colSpan={33} className="border border-gray-300 px-8 py-2 text-center">
                          <button 
                            className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium"
                            onClick={() => {
                              // Set active selections for the hierarchy
                              setActiveDay?.(day);
                              setActiveWorkout?.(workout);
                              setActiveMoveframe?.(moveframe);
                              // Call the smart Add Movelap handler
                              onAddMovelapClick?.();
                            }}
                          >
                            + Add new row to {moveframe.letter}
                          </button>
                        </td>
                      </tr>
                    );
                  }
                });
              }
            });

            // Add expanded day details row if day details are expanded - LIVE PREVIEW STYLED LAYOUT
            if (expandedDayDetails.has(day.id) && hasWorkouts) {
              // ==================== DAY HEADER - 100% width ====================
              workoutRows.push(
                <tr 
                  key={`${day.id}-workouts-header`} 
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedMoveframe) {
                      setDragOverDay(day.id);
                    }
                  }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedMoveframe) {
                      setDragContext({
                        ...draggedMoveframe,
                        targetDay: day,
                        targetWorkout: day.workouts?.[0],
                        dropPosition: 'append'
                      });
                      setShowMoveframePositionModal(true);
                    }
                    setDragOverDay(null);
                  }}
                >
                  <td colSpan={37} className={`px-0 py-1 ${dragOverDay === day.id && draggedMoveframe ? 'ring-2 ring-yellow-400' : ''}`}>
                    <div 
                      className="p-3 rounded-lg font-bold flex items-center justify-between cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor: colorSettings.dayHeader,
                        color: colorSettings.dayHeaderText,
                        border: getBorderStyle('day'),
                        boxSizing: 'border-box'
                      }}
                      onDoubleClick={() => onEditDay?.(day)}
                      title="Double-click to edit day"
                    >
                      <span>📋 {getDayName(day.dayOfWeek)} - {formatDate(day.date)} - Week {day.weekNumber || 1}</span>
                      <div className="flex gap-1">
                        <button 
                          className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                          style={getButtonStyle('edit', true)}
                          onClick={() => onEditDay?.(day)}
                        >Edit</button>
                        <button 
                          className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                          style={getButtonStyle('delete', true)}
                        >Delete</button>
                        <button 
                          className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                          style={getButtonStyle('print', true)}
                        >Print</button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
              
              // ==================== WORKOUT ROWS - 92% width, right-sided ====================
              dayWorkouts.forEach((workout: any, wkIdx: number) => {
                const workoutSports = getWorkoutSports(workout);
                const isWorkoutExpanded = expandedWorkouts.has(workout.id);
                
                // Choose workout color based on index (1, 2, or 3)
                const workoutBgColor = wkIdx === 0 ? colorSettings.workoutHeader :
                                       wkIdx === 1 ? colorSettings.workout2Header :
                                       colorSettings.workout3Header;
                const workoutTextColor = wkIdx === 0 ? colorSettings.workoutHeaderText :
                                         wkIdx === 1 ? colorSettings.workout2HeaderText :
                                         colorSettings.workout3HeaderText;
                
                workoutRows.push(
                  <tr 
                    key={`${day.id}-workout-${workout.id}`} 
                    className={`cursor-pointer ${dragOverWorkout === workout.id ? 'ring-2 ring-blue-500' : ''}`}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDraggedWorkout({ workout, sourceDay: day });
                      e.dataTransfer.effectAllowed = 'copyMove';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedWorkout && draggedWorkout.workout.id !== workout.id) {
                        setDragOverWorkout(workout.id);
                      }
                      if (draggedMoveframe) {
                        setDragOverWorkout(workout.id);
                      }
                    }}
                    onDragLeave={() => setDragOverWorkout(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedWorkout && draggedWorkout.workout.id !== workout.id) {
                        setDragContext({
                          sourceWorkout: draggedWorkout.workout,
                          sourceDay: draggedWorkout.sourceDay,
                          targetWorkout: workout,
                          targetDay: day
                        });
                        setShowWorkoutActionModal(true);
                      }
                      if (draggedMoveframe) {
                        setDragContext({
                          ...draggedMoveframe,
                          targetDay: day,
                          targetWorkout: workout,
                          dropPosition: 'append'
                        });
                        setShowMoveframePositionModal(true);
                      }
                      setDragOverWorkout(null);
                      setDraggedWorkout(null);
                    }}
                    onClick={() => {
                      setActiveDay?.(day);
                      setActiveWorkout?.(workout);
                      toggleWorkoutExpansion(workout.id);
                    }}
                  >
                    <td colSpan={37} className="px-0 py-1">
                      <div className="flex justify-end">
                        <div 
                          className="p-3 rounded-lg hover:opacity-90"
                          style={{
                            width: '92%',
                            backgroundColor: workoutBgColor,
                            color: workoutTextColor,
                            border: getBorderStyle('workout'),
                            boxSizing: 'border-box'
                          }}
                          onDoubleClick={(e) => { e.stopPropagation(); onEditWorkout?.(workout, day); }}
                          title="Double-click to edit workout"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="cursor-move text-white/70" title="Drag to move workout">⋮⋮</span>
                              <button className="hover:bg-white/20 rounded p-0.5">
                                {isWorkoutExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                              <span className="font-bold">Workout #{wkIdx + 1}</span>
                              <span className="text-lg">{workoutSports[0] && getSportIcon(workoutSports[0])}</span>
                              <span>{workoutSports.join(', ') || '-'}</span>
                              <span className="opacity-70">|</span>
                              <span className="text-sm">Dist: {getTotalDistance(day)}</span>
                              <span className="opacity-70">|</span>
                              <span className="text-sm">Time: {workout.time || '-'}</span>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                                style={getButtonStyle('add', true)}
                                onClick={(e) => { e.stopPropagation(); onAddMoveframe?.(workout, day); }}
                              >Add</button>
                              <button 
                                className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                                style={getButtonStyle('edit', true)}
                                onClick={(e) => { e.stopPropagation(); onEditWorkout?.(workout, day); }}
                              >Edit</button>
                              <button 
                                className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                                style={getButtonStyle('delete', true)}
                                onClick={(e) => e.stopPropagation()}
                              >Delete</button>
                              <button 
                                className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                                style={getButtonStyle('print', true)}
                                onClick={(e) => e.stopPropagation()}
                              >Print</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
                
                // ==================== MOVEFRAMES - 84% width, right-sided ====================
                if (isWorkoutExpanded && workout.moveframes && workout.moveframes.length > 0) {
                  const sortedMoveframes = getSortedMoveframes(workout);
                  
                  sortedMoveframes.forEach((mf: any, mfIdx: number) => {
                    const isMoveframeExpanded = expandedMoveframes.has(mf.id);
                    const isAlternateMf = mfIdx % 2 === 1;
                    
                    workoutRows.push(
                      <tr 
                        key={`mf-detail-${mf.id}`} 
                        className={`cursor-pointer ${dragOverMoveframe === mf.id ? 'ring-2 ring-purple-500' : ''}`}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggedMoveframe({ moveframe: mf, sourceWorkout: workout, sourceDay: day });
                          e.dataTransfer.effectAllowed = 'copyMove';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (draggedMoveframe && draggedMoveframe.moveframe.id !== mf.id) {
                            setDragOverMoveframe(mf.id);
                          }
                        }}
                        onDragLeave={() => setDragOverMoveframe(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedMoveframe && draggedMoveframe.moveframe.id !== mf.id) {
                            setDragContext({
                              ...draggedMoveframe,
                              targetMoveframe: mf,
                              targetWorkout: workout,
                              targetDay: day,
                              dropPosition: 'onMoveframe'
                            });
                            setShowMoveframePositionModal(true);
                          }
                          setDragOverMoveframe(null);
                        }}
                        onClick={() => {
                          setActiveDay?.(day);
                          setActiveWorkout?.(workout);
                          setActiveMoveframe?.(mf);
                          toggleMoveframeExpansion(mf.id);
                        }}
                      >
                        <td colSpan={37} className="px-0 py-0.5">
                          <div className="flex justify-end">
                            <div 
                              className="p-2.5 rounded font-semibold text-sm flex items-center justify-between hover:opacity-90"
                              style={{
                                width: '84%',
                                backgroundColor: isAlternateMf ? colorSettings.alternateRowMoveframe : colorSettings.moveframeHeader,
                                color: isAlternateMf ? colorSettings.alternateRowTextMoveframe : colorSettings.moveframeHeaderText,
                                border: getBorderStyle('moveframe'),
                                boxSizing: 'border-box'
                              }}
                              onDoubleClick={(e) => { e.stopPropagation(); onEditMoveframe?.(mf, workout, day); }}
                              title="Double-click to edit moveframe"
                            >
                              <div className="flex items-center gap-2">
                                <span className="cursor-move opacity-50" title="Drag to move moveframe">⋮⋮</span>
                                <button className="hover:bg-black/10 rounded p-0.5">
                                  {isMoveframeExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                <span className="font-bold text-blue-700">{mf.letter || mf.code}</span>
                                <span className="w-4 h-4 rounded" style={{ backgroundColor: mf.sectionColor || mf.color || '#FDE047' }}></span>
                                <span className="text-lg">{getSportIcon(mf.sport)}</span>
                                <span>{mf.sport}</span>
                                <span className="opacity-50">|</span>
                                <span>{mf.type || mf.sectionName || 'Warm up'}</span>
                                <span className="opacity-50">|</span>
                                <span>{mf.description || `${mf.distance || ''}m × ${mf.repetitions || ''}`}</span>
                                {mf.pause && <><span className="opacity-50">|</span><span>R: {mf.pause}</span></>}
                              </div>
                              <div className="flex gap-1">
                                <button 
                                  className="px-2 py-0.5 rounded text-xs font-semibold"
                                  style={getButtonStyle('edit', true)}
                                  onClick={(e) => { e.stopPropagation(); onEditMoveframe?.(mf, workout, day); }}
                                >Edit</button>
                                <button 
                                  className="px-2 py-0.5 rounded text-xs font-semibold"
                                  style={getButtonStyle('delete', true)}
                                  onClick={(e) => e.stopPropagation()}
                                >Delete</button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                    
                    // ==================== MOVELAPS - 60% width, right-sided ====================
                    if (isMoveframeExpanded && mf.movelaps && mf.movelaps.length > 0) {
                      const sortedLaps = getSortedMovelaps(mf);
                      
                      sortedLaps.forEach((lap: any, lapIdx: number) => {
                        const isAlternateLap = lapIdx % 2 === 1;
                        
                        workoutRows.push(
                          <tr 
                            key={`lap-detail-${lap.id}`} 
                            className="cursor-pointer"
                            onClick={() => {
                              setActiveDay?.(day);
                              setActiveWorkout?.(workout);
                              setActiveMoveframe?.(mf);
                              setActiveMovelap?.(lap);
                            }}
                          >
                            <td colSpan={37} className="px-0 py-0.5">
                              <div className="flex justify-end">
                                <div 
                                  className="p-2 rounded text-xs flex items-center justify-between hover:opacity-90"
                                  style={{
                                    width: '60%',
                                    backgroundColor: isAlternateLap ? colorSettings.alternateRowMovelap : colorSettings.movelapHeader,
                                    color: colorSettings.movelapHeaderText,
                                    border: getBorderStyle('movelap'),
                                    boxSizing: 'border-box'
                                  }}
                                  onDoubleClick={(e) => { e.stopPropagation(); onEditMovelap?.(lap, mf, workout, day); }}
                                  title="Double-click to edit movelap"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold w-6">#{lapIdx + 1}</span>
                                    <span className="w-3 h-3 rounded" style={{ backgroundColor: lap.color || mf.sectionColor || '#FCA5A5' }}></span>
                                    <span>{getSportIcon(mf.sport)}</span>
                                    <span className="font-medium">{lap.distance || '-'}m</span>
                                    <span className="opacity-50">|</span>
                                    <span>{lap.style || '-'}</span>
                                    <span className="opacity-50">|</span>
                                    <span>{lap.speed || lap.speedCode || '-'}</span>
                                    <span className="opacity-50">|</span>
                                    <span>⏱ {lap.time || '-'}</span>
                                    <span className="opacity-50">|</span>
                                    <span>R: {lap.pause || '-'}</span>
                                    {lap.notes && <span className="opacity-70 italic ml-2">{lap.notes}</span>}
                                  </div>
                                  <div className="flex gap-1">
                                    <button 
                                      className="px-2 py-0.5 rounded text-xs font-semibold"
                                      style={getButtonStyle('edit', true)}
                                      onClick={(e) => { e.stopPropagation(); onEditMovelap?.(lap, mf, workout, day); }}
                                    >Edit</button>
                                    <button 
                                      className="px-2 py-0.5 rounded text-xs font-semibold"
                                      style={getButtonStyle('delete', true)}
                                      onClick={(e) => e.stopPropagation()}
                                    >Delete</button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                      
                      // Add New Movelap Row Button - 60% width, right-sided
                      workoutRows.push(
                        <tr key={`${mf.id}-add-lap-btn`}>
                          <td colSpan={37} className="px-0 py-0.5">
                            <div className="flex justify-end">
                              <div style={{ width: '60%' }} className="flex justify-end">
                                <button 
                                  className="px-4 py-1 rounded text-xs font-semibold transition-colors"
                                  style={getButtonStyle('add', true)}
                                  onClick={() => {
                                    setActiveDay?.(day);
                                    setActiveWorkout?.(workout);
                                    setActiveMoveframe?.(mf);
                                    if (onAddMovelap) {
                                      onAddMovelap(mf, workout, day);
                                    } else {
                                      setTimeout(() => {
                                        onAddMovelapClick?.();
                                      }, 50);
                                    }
                                  }}
                                >
                                  + Add movelap to {mf.letter || mf.code}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  });
                  
                  // Add New Moveframe Button - 84% width, right-sided
                  workoutRows.push(
                    <tr key={`${workout.id}-add-mf-btn`}>
                      <td colSpan={37} className="px-0 py-0.5">
                        <div className="flex justify-end">
                          <div style={{ width: '84%' }} className="flex justify-end">
                            <button 
                              className="px-4 py-1 rounded text-xs font-semibold transition-colors"
                              style={getButtonStyle('add', true)}
                              onClick={() => {
                                setActiveDay?.(day);
                                setActiveWorkout?.(workout);
                                onAddMoveframe?.(workout, day);
                              }}
                            >
                              + Add moveframe to Workout #{wkIdx + 1}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }
              });
              
              // Add New Workout Button - 92% width, right-sided
              workoutRows.push(
                <tr key={`${day.id}-add-workout-btn`}>
                  <td colSpan={37} className="px-0 py-1">
                    <div className="flex justify-end">
                      <div style={{ width: '92%' }} className="flex justify-end">
                        <button 
                          className="px-4 py-1.5 rounded text-xs font-semibold transition-colors"
                          style={getButtonStyle('add', true)}
                          onClick={() => {
                            setActiveDay?.(day);
                            onAddWorkout?.(day);
                          }}
                        >
                          + Add workout to {getDayName(day.dayOfWeek)}
                        </button>
                      </div>
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
      <div style={{ width: '2800px', height: '1px' }}></div>
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
          onAction={handleMoveframeAction}
          sourceMoveframe={dragContext.moveframe}
          sourceWorkout={dragContext.sourceWorkout}
          sourceDay={dragContext.sourceDay}
          targetMoveframe={dragContext.targetMoveframe}
          targetWorkout={dragContext.targetWorkout}
          targetDay={dragContext.targetDay}
          dropPosition={dragContext.dropPosition || 'append'}
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
    
    {/* Workout Selector Modal */}
    {showWorkoutSelector && workoutSelectorDay && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={() => setShowWorkoutSelector(false)}>
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-4 text-gray-800">Select Workout</h3>
          <p className="text-sm text-gray-600 mb-4">
            This day has {workoutSelectorDay.workouts?.length || 0} workouts. Please select which workout you want to add the moveframe to:
          </p>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {workoutSelectorDay.workouts?.map((workout: any, idx: number) => (
              <button
                key={workout.id}
                onClick={() => {
                  setShowWorkoutSelector(false);
                  if (onAddMoveframe) {
                    onAddMoveframe(workout, workoutSelectorDay);
                  }
                }}
                className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getWorkoutSymbol(workout.sessionNumber || idx + 1)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      Workout #{workout.sessionNumber || idx + 1}: {workout.name || 'Unnamed Workout'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Code: {workout.code || 'N/A'} | Status: {workout.status || 'PLANNED'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {workout.moveframes?.length || 0} moveframes
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setShowWorkoutSelector(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
