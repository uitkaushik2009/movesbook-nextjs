'use client';

import { useState, useEffect } from 'react';

// Drag and Drop
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';

// Configuration and Types
import { 
  WORKOUT_SECTIONS, 
  UI_CONFIG, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  STORAGE_KEYS
} from '@/config/workout.constants';
import type { 
  WorkoutPlan, 
  WorkoutDay, 
  Workout, 
  Moveframe,
  Period,
  SectionId,
  ViewMode
} from '@/types/workout.types';

// API Utilities
import { movelapApi } from '@/utils/api.utils';

// Helper Functions
import { sectionHelpers } from '@/utils/workout.helpers';

// Custom Hooks
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useWorkoutModals } from '@/hooks/useWorkoutModals';
import { useWorkoutExpansion } from '@/hooks/useWorkoutExpansion';

// Components
import WorkoutSectionHeader from '@/components/workouts/WorkoutSectionHeader';
import WorkoutCalendarView from '@/components/workouts/WorkoutCalendarView';
import DayTableView from '@/components/workouts/tables/DayTableView';
import StyledTableWrapper from '@/components/workouts/tables/StyledTableWrapper';
import AddWorkoutModal from '@/components/workouts/AddWorkoutModal';
import AddMoveframeModal from '@/components/workouts/AddMoveframeModal';
import AddEditMoveframeModal from '@/components/workouts/AddEditMoveframeModal';
import ImportWorkoutsModal from '@/components/workouts/ImportWorkoutsModal';
import AddDayModal from '@/components/workouts/AddDayModal';
import EditDayModal from '@/components/workouts/modals/EditDayModal';
import AddMovelapModal from '@/components/workouts/modals/AddMovelapModal';
import EditMoveframeModal from '@/components/workouts/modals/EditMoveframeModal';
import EditMovelapModal from '@/components/workouts/modals/EditMovelapModal';
import AddEditMovelapModal from '@/components/workouts/AddEditMovelapModal';
import CopyDayModal from '@/components/workouts/modals/CopyDayModal';
import MoveDayModal from '@/components/workouts/modals/MoveDayModal';
import CopyWorkoutModal from '@/components/workouts/modals/CopyWorkoutModal';
import MoveWorkoutModal from '@/components/workouts/modals/MoveWorkoutModal';
import CopyMoveframeModal from '@/components/workouts/modals/CopyMoveframeModal';
import MoveMoveframeModal from '@/components/workouts/modals/MoveMoveframeModal';
import ColumnSettingsModal from '@/components/workouts/ColumnSettingsModal';
import BulkAddMovelapModal from '@/components/workouts/BulkAddMovelapModal';
import ExportSharePrint from '@/components/workouts/ExportSharePrint';
import { useColumnSettings } from '@/hooks/useColumnSettings';
import DragDropConfirmModal, { DragAction, DropPosition } from '@/components/workouts/modals/DragDropConfirmModal';

// Icons
import { X, Download, Plus, Table, Calendar } from 'lucide-react';

interface WorkoutSectionProps {
  onClose: () => void;
}

export default function WorkoutSection({ onClose }: WorkoutSectionProps) {
  // ==================== SECTION & VIEW STATE ====================
  const [activeSection, setActiveSection] = useState<SectionId>('A');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedWeekForTable, setSelectedWeekForTable] = useState<number | null>(null);
  
  // ==================== USE CUSTOM HOOK FOR DATA MANAGEMENT ====================
  const {
    workoutPlan,
    periods,
    isLoading,
    userType,
    athleteList,
    loadWorkoutData,
    loadPeriods,
    loadUserProfile,
    loadAthleteList,
    updateWorkoutPlan,
    feedbackMessage,
    showMessage
  } = useWorkoutData({ initialSection: activeSection });
  
  // ==================== MODAL STATES (Using Custom Hook) ====================
  const { modals, modes, settings, actions: modalActions } = useWorkoutModals();

  // Column Settings Hook
  const columnSettings = useColumnSettings();
  
  // Copy/Paste state
  const [copiedDay, setCopiedDay] = useState<any>(null);
  const [copiedWorkout, setCopiedWorkout] = useState<any>(null);
  const [copiedMoveframe, setCopiedMoveframe] = useState<any>(null);
  
  // ==================== SELECTION STATES (Properly Typed) ====================
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [selectedMoveframe, setSelectedMoveframe] = useState<Moveframe | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  
  // Active selections for workout context
  const [activeDay, setActiveDay] = useState<WorkoutDay | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [activeMoveframe, setActiveMoveframe] = useState<Moveframe | null>(null);
  const [activeMovelap, setActiveMovelap] = useState<any>(null);
  
  // Editing states
  const [addWorkoutDay, setAddWorkoutDay] = useState<WorkoutDay | null>(null);
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editingMoveframe, setEditingMoveframe] = useState<Moveframe | null>(null);
  const [editingMovelap, setEditingMovelap] = useState<any>(null);
  
  // ==================== UI STATE ====================
  const [excludeStretchingFromTotals, setExcludeStretchingFromTotals] = useState(false);

  // ==================== EXPANSION STATE (Using Custom Hook) ====================
  const {
    expandedWeeks,
    expandedDays,
    expandedWorkouts,
    toggleDayExpansion,
    toggleWorkoutExpansion,
    toggleWeekExpansion,
    expandAll,
    collapseAll,
    expandDayWithAllWorkouts
  } = useWorkoutExpansion({
    workoutPlan,
    activeSection,
    selectedAthleteId: selectedAthlete?.id
  });

  // ==================== MODAL MODE STATE ====================
  const [workoutModalMode, setWorkoutModalMode] = useState<'add' | 'edit'>('add');
  const [moveframeModalMode, setMoveframeModalMode] = useState<'add' | 'edit'>('add');
  
  // ==================== DRAG & DROP STATE ====================
  // Note: activeWorkout and activeMoveframe already defined above for workout context
  const [draggedWorkout, setDraggedWorkout] = useState<any>(null);
  const [draggedMoveframe, setDraggedMoveframe] = useState<any>(null);
  const [dropTarget, setDropTarget] = useState<any>(null);
  const [dragModalConfig, setDragModalConfig] = useState<{
    dragType: 'workout' | 'moveframe';
    hasConflict: boolean;
    conflictMessage?: string;
    showPositionChoice?: boolean;
    sourceData: any;
    targetData: any;
  } | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag starts after 8px movement
      },
    }),
    useSensor(KeyboardSensor)
  );

  const [virtualStartDate, setVirtualStartDate] = useState<Date | null>(null);
  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);
  // Auto-expansion tracking for newly added items
  const [autoExpandDayId, setAutoExpandDayId] = useState<string | null>(null);
  const [autoExpandWorkoutId, setAutoExpandWorkoutId] = useState<string | null>(null);
  const [autoExpandMoveframeId, setAutoExpandMoveframeId] = useState<string | null>(null);
  
  // Section-specific settings
  const [userSubscription, setUserSubscription] = useState<{ expiryDate: Date | null, isActive: boolean }>({ 
    expiryDate: null, 
    isActive: true 
  });
  const [managedAthletes, setManagedAthletes] = useState<any[]>([]);
  
  // ==================== HELPER FUNCTIONS (Using Utilities) ====================
  const canAddDays = () => sectionHelpers.canAddDays(activeSection);
  const isDateAllowedForSection = (date: Date) => sectionHelpers.isDateAllowedForSection(date, activeSection);

  // ==================== LOAD DATA ON SECTION CHANGE ====================
  useEffect(() => {
    loadUserProfile();
    loadWorkoutData(activeSection);
    loadPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]); // Only re-run when section changes

  // ===== SMART BUTTON HANDLERS WITH SELECTION VALIDATION =====
  
  /**
   * EDIT DAY - Requires active day selection
   * Edits day metadata (date, period, weather, feeling, notes)
   * Does NOT modify workouts, moveframes, or movelaps
   */
  const handleEditDay = () => {
    if (!activeDay) {
      showMessage('warning', 'Please select a day first to edit its information');
      return;
    }
    
    // Open Edit Day modal with the active day
    setEditingDay(activeDay);
    modalActions.openEditDayModal();
  };
  
  /**
   * ADD WORKOUT - Requires active day selection
   * Creates a workout inside the selected day (max 3 per day)
   */
  const handleAddWorkout = () => {
    console.log('🏋️ handleAddWorkout called. activeDay:', activeDay);
    
    // Check if day is selected
    if (!activeDay) {
      console.log('⚠️ No activeDay selected');
      showMessage('warning', 'Please select a day first to add a workout');
      return;
    }
    
    // Check max 3 workouts per day
    const existingWorkouts = activeDay.workouts || [];
    console.log(`✓ activeDay found. Existing workouts: ${existingWorkouts.length}/3`);
    
    if (existingWorkouts.length >= 3) {
      showMessage('warning', 'This day already has 3 workouts (max)');
      return;
    }
    
    // All checks passed - open modal
    console.log('✅ Opening Add Workout modal');
    setAddWorkoutDay(activeDay);
    modalActions.setWorkoutModalMode('add');
    setEditingWorkout(null);
    modalActions.openAddWorkoutModal();
  };
  
  /**
   * ADD MOVEFRAME - Requires active day + active workout
   * Creates a moveframe inside the selected workout
   */
  const handleAddMoveframe = () => {
    console.log('📋 handleAddMoveframe called. activeDay:', activeDay, 'activeWorkout:', activeWorkout);
    
    // Check if day is selected
    if (!activeDay) {
      console.log('⚠️ No activeDay selected');
      showMessage('warning', 'Please select a day first');
      return;
    }
    
    // Check if workout is selected
    if (!activeWorkout) {
      console.log('⚠️ No activeWorkout selected');
      showMessage('warning', 'Please select a workout first to add a moveframe');
      return;
    }
    
    // All checks passed - open modal
    console.log('✅ Opening Add Moveframe modal');
    setSelectedWorkout(activeWorkout.id);
    setSelectedDay(activeDay);
    modalActions.openAddMoveframeModal();
  };
  
  /**
   * ADD MOVELAP - Requires active moveframe
   * Creates a movelap (microlap/repetition) inside the selected moveframe
   */
  const handleAddMovelap = () => {
    console.log('🔄 handleAddMovelap called. activeMoveframe:', activeMoveframe);
    
    // Check if moveframe is selected
    if (!activeMoveframe) {
      console.log('⚠️ No activeMoveframe selected');
      showMessage('warning', 'Please select a moveframe first to add a movelap');
      return;
    }
    
    // Show Add Movelap modal
    console.log('✅ Opening Add Movelap modal');
    modalActions.openAddMovelapModal();
  };
  
  /**
   * Create new movelap via API (Using API Utility)
   */
  const createMovelap = async (formData: any) => {
    if (!activeMoveframe) {
      showMessage('error', ERROR_MESSAGES.NO_ACTIVE_MOVEFRAME);
      return;
    }

    const response = await movelapApi.create(activeMoveframe.id, {
      mode: 'APPEND',
      ...formData
    });
    
    if (response.success) {
      modalActions.closeMovelapModal();
      
      // Auto-expand the day, workout, and moveframe to show the new movelap
      if (activeDay && activeWorkout && activeMoveframe) {
        setAutoExpandDayId(activeDay.id);
        setAutoExpandWorkoutId(activeWorkout.id);
        setAutoExpandMoveframeId(activeMoveframe.id);
        setTimeout(() => {
          setAutoExpandDayId(null);
          setAutoExpandWorkoutId(null);
          setAutoExpandMoveframeId(null);
        }, UI_CONFIG.AUTO_EXPAND_DELAY);
      }
      
      showMessage('success', SUCCESS_MESSAGES.MOVELAP_ADDED(activeMoveframe.letter || activeMoveframe.code));
    } else {
      showMessage('error', response.error || ERROR_MESSAGES.GENERIC_ERROR);
    }
  };

  // ==================== DRAG & DROP HANDLERS ====================
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.type === 'workout') {
      setDraggedWorkout(active.data.current.workout);
    } else if (active.data.current?.type === 'moveframe') {
      setDraggedMoveframe(active.data.current.moveframe);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDraggedWorkout(null);
      setDraggedMoveframe(null);
      return;
    }
    
    const dragType = active.data.current?.type;
    const dropType = over.data.current?.type;
    
    if (dragType === 'workout' && dropType === 'day') {
      // Check for conflicts
      const sourceWorkout = active.data.current?.workout;
      const targetDay = over.data.current?.day;
      const existingWorkout = targetDay?.workouts?.[0]; // Days can have max 3 workouts
      
      setDragModalConfig({
        dragType: 'workout',
        hasConflict: !!existingWorkout,
        conflictMessage: existingWorkout ? 'This day already has a workout. Choose an action:' : undefined,
        sourceData: { workout: sourceWorkout, sourceDay: active.data.current?.day },
        targetData: { targetDay, existingWorkout }
      });
      modalActions.setShowDragModal(true);
    } else if (dragType === 'moveframe') {
      // Handle moveframe drops
      const showPosition = dropType === 'moveframe';
      
      setDragModalConfig({
        dragType: 'moveframe',
        hasConflict: false,
        showPositionChoice: showPosition,
        sourceData: active.data.current,
        targetData: over.data.current
      });
      modalActions.setShowDragModal(true);
    }
    
    setDraggedWorkout(null);
    setDraggedMoveframe(null);
  };

  const handleDragConfirm = async (action: DragAction, position?: DropPosition) => {
    if (!dragModalConfig) return;
    
    try {
      if (dragModalConfig.dragType === 'workout') {
        await handleWorkoutDragAction(action, dragModalConfig.sourceData, dragModalConfig.targetData);
      } else {
        await handleMoveframeDragAction(action, position, dragModalConfig.sourceData, dragModalConfig.targetData);
      }
      
      // Better success messages
      const actionPastTense = action === 'copy' ? 'copied' : action === 'move' ? 'moved' : 'switched';
      const itemType = dragModalConfig.dragType === 'workout' ? 'Workout' : 'Moveframe';
      showMessage('success', `${itemType} ${actionPastTense} successfully!`);
    } catch (error) {
      console.error('Drag action failed:', error);
      const errorMsg = error instanceof Error ? error.message : `Failed to ${action} ${dragModalConfig.dragType}`;
      showMessage('error', errorMsg);
    }
    
    setDragModalConfig(null);
  };

  const handleWorkoutDragAction = async (action: DragAction, sourceData: any, targetData: any) => {
    const { workout, sourceDay } = sourceData;
    const { targetDay, existingWorkout } = targetData;
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    if (action === 'copy') {
      // Duplicate workout
      const response = await fetch('/api/workouts/sessions/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workoutId: workout.id,
          targetDayId: targetDay.id
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to copy workout');
      }
      
      console.log('✅ Workout copied:', workout.id, '→', targetDay.id);
    } else if (action === 'move') {
      // Move workout
      const response = await fetch('/api/workouts/sessions/move', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workoutId: workout.id,
          targetDayId: targetDay.id
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move workout');
      }
      
      console.log('✅ Workout moved:', workout.id, '→', targetDay.id);
    } else if (action === 'switch' && existingWorkout) {
      // Switch workouts
      const response = await fetch('/api/workouts/sessions/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workout1Id: workout.id,
          workout2Id: existingWorkout.id
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to switch workouts');
      }
      
      console.log('✅ Workouts switched:', workout.id, '↔', existingWorkout.id);
    }
  };

  const handleMoveframeDragAction = async (action: DragAction, position: DropPosition | undefined, sourceData: any, targetData: any) => {
    const { moveframe, workout: sourceWorkout, day: sourceDay } = sourceData;
    const dropType = targetData.type;
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Determine target workout based on drop type
    let targetWorkoutId: string;
    let insertBeforeId: string | undefined;
    let finalPosition: string = 'append';

    if (dropType === 'day') {
      // Dropped on day header → append to last workout of that day
      const targetDay = targetData.day;
      const lastWorkout = targetDay.workouts?.[targetDay.workouts.length - 1];
      if (!lastWorkout) {
        throw new Error('Target day has no workouts');
      }
      targetWorkoutId = lastWorkout.id;
      finalPosition = 'append';
    } else if (dropType === 'workout') {
      // Dropped on workout → append to moveframes
      targetWorkoutId = targetData.workout.id;
      finalPosition = 'append';
    } else if (dropType === 'moveframe') {
      // Dropped on specific moveframe → use position (before/after)
      targetWorkoutId = targetData.workout.id;
      if (position === 'before') {
        insertBeforeId = targetData.moveframe.id;
      } else {
        // After: insert before the next moveframe
        const currentIndex = targetData.workout.moveframes.findIndex((mf: any) => mf.id === targetData.moveframe.id);
        const nextMoveframe = targetData.workout.moveframes[currentIndex + 1];
        if (nextMoveframe) {
          insertBeforeId = nextMoveframe.id;
        } else {
          finalPosition = 'append';
        }
      }
    } else {
      throw new Error('Invalid drop target');
    }

    if (action === 'copy') {
      // Duplicate moveframe
      const response = await fetch('/api/workouts/moveframes/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          moveframeId: moveframe.id,
          targetWorkoutId,
          position: finalPosition,
          insertBeforeId
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to copy moveframe');
      }
      
      console.log('✅ Moveframe copied:', moveframe.id, '→', targetWorkoutId);
    } else if (action === 'move') {
      // Move moveframe
      const response = await fetch('/api/workouts/moveframes/move', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          moveframeId: moveframe.id,
          targetWorkoutId,
          position: finalPosition,
          insertBeforeId
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move moveframe');
      }
      
      console.log('✅ Moveframe moved:', moveframe.id, '→', targetWorkoutId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full bg-white">
      {/* Small header bar with close button */}
      {/* Header Component */}
      <WorkoutSectionHeader
        activeSection={activeSection}
        viewMode={viewMode}
        selectedWeekForTable={selectedWeekForTable}
        virtualStartDate={virtualStartDate}
        userType={userType ?? undefined}
        selectedAthlete={selectedAthlete}
        onSectionChange={setActiveSection}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          if (mode === 'calendar') {
            setSelectedWeekForTable(null);
          }
        }}
        onImportClick={() => modalActions.openImportModal()}
        onStartDateClick={() => modalActions.openStartDatePicker()}
        onAthleteSelect={() => modalActions.openAthleteSelector()}
        onWeekFilterClear={() => {
          setSelectedWeekForTable(null);
          setViewMode('calendar');
        }}
        onClose={onClose}
      />

      {/* Workout area - full width */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center - main workout area (full width, no sidebars) */}
        <main className="flex-1 bg-white overflow-y-auto overflow-x-hidden w-full">
          <div className="p-2">

            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : viewMode === 'calendar' ? (
              <WorkoutCalendarView
                workoutPlan={workoutPlan}
                periods={periods}
                excludeStretchingFromTotals={excludeStretchingFromTotals}
                setExcludeStretchingFromTotals={setExcludeStretchingFromTotals}
                onDayClick={(day) => {
                  setSelectedDay(day.id);
                  setAddWorkoutDay(day);
                  setSelectedWeekForTable(day.weekNumber);
                  setViewMode('table'); // Switch to table view
                 }}
               />
            ) : (
              <>
                {/* Exclude Stretching Checkbox */}
                <div className="mb-4 flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <input
                    type="checkbox"
                    id="exclude-stretching"
                    checked={excludeStretchingFromTotals}
                    onChange={(e) => setExcludeStretchingFromTotals(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                  <label 
                    htmlFor="exclude-stretching"
                    className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                  >
                    Exclude stretching from the totals
                  </label>
                  <span className="text-xs text-gray-500 ml-2">
                    ⚠️ Note: Stretching is auto-excluded when 4+ sports are selected in a day
                  </span>
                </div>
                
                <StyledTableWrapper>
                <DayTableView
                 workoutPlan={
                   selectedWeekForTable && workoutPlan
                     ? {
                         ...workoutPlan,
                         weeks: workoutPlan.weeks?.filter((week: any) => {
                           const weekNum = week.weekNumber;
                           return weekNum >= selectedWeekForTable - 1 && weekNum <= selectedWeekForTable + 1;
                         }) || []
                       }
                     : workoutPlan
                 }
                 expandedDays={expandedDays}
                 expandedWorkouts={expandedWorkouts}
                 onToggleDay={toggleDayExpansion}
                 onToggleWorkout={toggleWorkoutExpansion}
                 onExpandDayWithAllWorkouts={expandDayWithAllWorkouts}
                 onEditDay={(day) => {
                   setEditingDay(day);
                   modalActions.setShowEditDayModal(true);
                 }}
                 onAddWorkout={(day) => {
                   setAddWorkoutDay(day);
                   setWorkoutModalMode('add');
                   modalActions.setShowAddWorkoutModal(true);
                 }}
                 onCopyDay={(day) => {
                   setCopiedDay(day);
                   modalActions.setShowCopyDayModal(true);
                 }}
                 onMoveDay={(day) => {
                   setCopiedDay(day);
                   modalActions.setShowMoveDayModal(true);
                 }}
                 onPasteDay={async (targetDay) => {
                   if (!copiedDay) {
                     showMessage('error', 'No day copied. Please copy a day first.');
                     return;
                   }
                   
                   try {
                     const token = localStorage.getItem('token');
                     const response = await fetch('/api/workouts/days/copy', {
                       method: 'POST',
                       headers: {
                         'Content-Type': 'application/json',
                         'Authorization': `Bearer ${token}`
                       },
                      body: JSON.stringify({
                        sourceDayId: copiedDay.id,
                        targetDate: targetDay.date,
                        targetWeekId: targetDay.workoutWeekId
                      })
                     });
                     
                     if (!response.ok) {
                       const error = await response.json();
                       throw new Error(error.error || 'Failed to paste day');
                     }
                     
                     showMessage('success', 'Day pasted successfully');
                   } catch (error: any) {
                     showMessage('error', error.message || 'Failed to paste day');
                   }
                 }}
                onEditWorkout={(workout, day) => {
                  setEditingWorkout(workout);
                  setAddWorkoutDay(day);
                  setWorkoutModalMode('edit');
                  modalActions.setShowAddWorkoutModal(true);
                }}
                onCopyWorkout={(workout, day) => {
                  setCopiedWorkout(workout);
                  setActiveWorkout(workout);
                  setActiveDay(day);
                  modalActions.openCopyWorkoutModal();
                }}
                onMoveWorkout={(workout, day) => {
                  setCopiedWorkout(workout);
                  setActiveWorkout(workout);
                  setActiveDay(day);
                  modalActions.openMoveWorkoutModal();
                }}
                onAddMoveframe={(workout, day) => {
                  setActiveWorkout(workout);
                  setActiveDay(day);
                  setSelectedWorkout(workout.id);
                  setSelectedDay(day);
                  setMoveframeModalMode('add');
                  setEditingMoveframe(null);
                  modalActions.setShowAddMoveframeModal(true);
                }}
                 onEditMoveframe={(moveframe, workout, day) => {
                   setEditingMoveframe(moveframe);
                   setActiveDay(day);
                   setActiveWorkout(workout);
                   setActiveMoveframe(moveframe);
                   setMoveframeModalMode('edit');
                   modalActions.setShowAddMoveframeModal(true);
                 }}
                 onEditMovelap={(movelap, moveframe, workout, day) => {
                  setEditingMovelap(movelap);
                  setActiveDay(day);
                  setActiveWorkout(workout);
                  setActiveMoveframe(moveframe);
                  setActiveMovelap(movelap);
                  modalActions.setMovelapModalMode('edit');
                  modalActions.setShowAddEditMovelapModal(true);
                }}
                onAddMovelap={(moveframe, workout, day) => {
                  setActiveMoveframe(moveframe);
                  setActiveWorkout(workout);
                  setActiveDay(day);
                  setEditingMovelap(null);
                  modalActions.setMovelapModalMode('add');
                  modalActions.setShowAddEditMovelapModal(true);
                }}
                 onDeleteDay={async (day) => {
                   if (confirm(`Are you sure you want to delete this day (${new Date(day.date).toLocaleDateString()})? This will also delete all workouts, moveframes, and movelaps for this day.`)) {
                     try {
                       const token = localStorage.getItem('token');
                       const response = await fetch(`/api/workouts/days/${day.id}`, {
                         method: 'DELETE',
                         headers: { 'Authorization': `Bearer ${token}` }
                       });
                       
                       if (response.ok) {
                         showMessage('success', 'Day deleted successfully');
                         // Refresh workout data to remove deleted day from view
                         await loadWorkoutData(activeSection);
                       } else {
                         showMessage('error', 'Failed to delete day');
                       }
                     } catch (error) {
                       console.error('Error deleting day:', error);
                       showMessage('error', 'Error deleting day');
                     }
                   }
                 }}
                 onDeleteWorkout={async (workout, day) => {
                   if (confirm('Are you sure you want to delete this workout?')) {
                     try {
                       const token = localStorage.getItem('token');
                       const response = await fetch(`/api/workouts/sessions/${workout.id}`, {
                         method: 'DELETE',
                         headers: { 'Authorization': `Bearer ${token}` }
                       });
                       
                       if (response.ok) {
                         showMessage('success', 'Workout deleted successfully');
                       } else {
                         showMessage('error', 'Failed to delete workout');
                       }
                     } catch (error) {
                       console.error('Error deleting workout:', error);
                       showMessage('error', 'Error deleting workout');
                     }
                   }
                 }}
                 onCopyMoveframe={(moveframe, workout, day) => {
                   setCopiedMoveframe(moveframe);
                   setActiveWorkout(workout);
                   setActiveDay(day);
                   modalActions.setShowCopyMoveframeModal(true);
                 }}
                 onMoveMoveframe={(moveframe, workout, day) => {
                   setCopiedMoveframe(moveframe);
                   setActiveWorkout(workout);
                   setActiveDay(day);
                   modalActions.setShowMoveMoveframeModal(true);
                 }}
                onOpenColumnSettings={(tableType) => {
                  modalActions.setColumnSettingsTableType(tableType);
                  modalActions.setShowColumnSettingsModal(true);
                }}
                 columnSettings={columnSettings}
                 onDeleteMoveframe={async (moveframe, workout, day) => {
                   if (confirm(`Are you sure you want to delete moveframe ${moveframe.letter || moveframe.code}?`)) {
                     try {
                       const token = localStorage.getItem('token');
                       const response = await fetch(`/api/workouts/moveframes/${moveframe.id}`, {
                         method: 'DELETE',
                         headers: { 'Authorization': `Bearer ${token}` }
                       });
                       
                       if (response.ok) {
                         showMessage('success', 'Moveframe deleted successfully');
                       } else {
                         showMessage('error', 'Failed to delete moveframe');
                       }
                     } catch (error) {
                       console.error('Error deleting moveframe:', error);
                       showMessage('error', 'Error deleting moveframe');
                     }
                   }
                 }}
                 onDeleteMovelap={async (movelap, moveframe, workout, day) => {
                   if (confirm('Are you sure you want to delete this movelap?')) {
                     try {
                       const token = localStorage.getItem('token');
                       const response = await fetch(`/api/workouts/movelaps/${movelap.id}`, {
                         method: 'DELETE',
                         headers: { 'Authorization': `Bearer ${token}` }
                       });
                       
                       if (response.ok) {
                         showMessage('success', 'Movelap deleted successfully');
                       } else {
                         showMessage('error', 'Failed to delete movelap');
                       }
                     } catch (error) {
                       console.error('Error deleting movelap:', error);
                       showMessage('error', 'Error deleting movelap');
                     }
                   }
                 }}
               />
               </StyledTableWrapper>
              </>
            )}
          </div>
        </main>
      </div>
      
      {modals.showAddWorkoutModal && addWorkoutDay && (
        <AddWorkoutModal
          isOpen={modals.showAddWorkoutModal}
          day={addWorkoutDay}
          existingWorkouts={addWorkoutDay.workouts || []}
          mode={workoutModalMode}
          existingWorkout={editingWorkout}
          onClose={() => {
            modalActions.closeAddWorkoutModal();
            setAddWorkoutDay(null);
            setEditingWorkout(null);
            modalActions.setWorkoutModalMode('add');
          }}
          onSave={async (workoutData) => {
            const token = localStorage.getItem('token');
            
            if (workoutModalMode === 'edit' && editingWorkout) {
              // UPDATE existing workout
              console.log('Updating workout with data:', workoutData);
              
              const response = await fetch(`/api/workouts/sessions/${editingWorkout.id}`, {
                method: 'PATCH',
                headers: { 
                  'Authorization': `Bearer ${token}`, 
                  'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                  name: workoutData.name,
                  code: workoutData.code,
                  sports: workoutData.sports,
                  symbol: workoutData.symbol,
                  includeStretching: workoutData.includeStretching
                })
              });
              
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update workout');
              }
              
              showMessage('success', 'Workout updated successfully');
            } else {
              // CREATE new workout
              console.log('Creating workout with data:', workoutData);
              
              const response = await fetch('/api/workouts/sessions', {
                method: 'POST',
                headers: { 
                  'Authorization': `Bearer ${token}`, 
                  'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                  workoutDayId: workoutData.dayId,
                  sessionNumber: workoutData.sessionNumber,
                  name: workoutData.name,
                  code: workoutData.code,
                  sports: workoutData.sports,
                  symbol: workoutData.symbol,
                  includeStretching: workoutData.includeStretching,
                  status: 'PLANNED_FUTURE',
                  time: '',
                  location: '',
                  notes: ''
                })
              });
              
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create workout');
              }
              
              showMessage('success', 'Workout added successfully');
            }
            
            // Keep day and its parent week expanded (for new workouts)
            if (workoutModalMode === 'add' && addWorkoutDay) {
              // Auto-expand the day using toggle if it's not already expanded
              if (!expandedDays.has(addWorkoutDay.id)) {
                toggleDayExpansion(addWorkoutDay.id);
              }
              
              // Find and expand the parent week
              const parentWeek = workoutPlan?.weeks?.find((week: any) => 
                week.days?.some((day: any) => day.id === addWorkoutDay.id)
              );
              if (parentWeek && !expandedWeeks.has(parentWeek.id)) {
                toggleWeekExpansion(parentWeek.id);
              }
              
              // Auto-expand the day to show the new workout
              setAutoExpandDayId(addWorkoutDay.id);
              setTimeout(() => setAutoExpandDayId(null), 500); // Clear after expansion
            }
            
            modalActions.setShowAddWorkoutModal(false);
            setAddWorkoutDay(null);
            setEditingWorkout(null);
            setWorkoutModalMode('add');
            
            // Refresh workout data to show the changes
            await loadWorkoutData(activeSection);
          }}
        />
      )}
      
       {modals.showAddMoveframeModal && activeWorkout && activeDay && (
         <AddEditMoveframeModal
           isOpen={modals.showAddMoveframeModal}
             onClose={() => {
               modalActions.setShowAddMoveframeModal(false);
             setActiveWorkout(null);
             setActiveDay(null);
             setSelectedWorkout(null);
               setSelectedDay(null);
             setEditingMoveframe(null);
             setMoveframeModalMode('add');
             }}
             onSave={async (moveframeData) => {
             console.log(`📤 ${moveframeModalMode === 'edit' ? 'Updating' : 'Creating'} moveframe with data:`, moveframeData);
             
             try {
               const token = localStorage.getItem('token');
               
               if (moveframeModalMode === 'edit' && editingMoveframe) {
                 // UPDATE existing moveframe
                 const response = await fetch(`/api/workouts/moveframes/${editingMoveframe.id}`, {
                   method: 'PATCH',
                   headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${token}`
                   },
                   body: JSON.stringify({
                     sport: moveframeData.sport,
                     description: moveframeData.description,
                     notes: moveframeData.notes
                   })
                 });
                 
                 if (!response.ok) {
                   const errorData = await response.json();
                   console.error('❌ API Error:', errorData);
                   throw new Error(errorData.error || 'Failed to update moveframe');
                 }
                 
                 const result = await response.json();
                 console.log('✅ Moveframe updated successfully:', result);
                 showMessage('success', 'Moveframe updated successfully');
                 
                 // Reload data to show changes
                 await loadWorkoutData(activeSection);
               } else {
                 // CREATE new moveframe
                 const movelaps: any[] = [];
                 const repsCount = parseInt(moveframeData.repetitions) || 1;
                 
                 for (let i = 0; i < repsCount; i++) {
                   movelaps.push({
                     repetitionNumber: i + 1,
                     distance: moveframeData.distance?.toString() || null,
                     speed: moveframeData.speed || null,
                     style: moveframeData.style || null,
                     pace: moveframeData.pace || null,
                     time: moveframeData.time || null,
                     reps: moveframeData.reps || null,
                     restType: null,
                     pause: moveframeData.pause || null,
                     alarm: moveframeData.alarm || null,
                     sound: moveframeData.sound || null,
                     notes: moveframeData.notes || null,
                     status: 'PENDING',
                     isSkipped: false,
                     isDisabled: false
                   });
                 }
                 
                 console.log('📤 Generated movelaps:', movelaps);
               
               const response = await fetch('/api/workouts/moveframes', {
                 method: 'POST',
                   headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${token}`
                   },
                 body: JSON.stringify({
                     workoutSessionId: activeWorkout.id,
                   sport: moveframeData.sport,
                   type: moveframeData.type || 'STANDARD',
                     description: moveframeData.description,
                     movelaps,
                     sectionId: 'default'
                 })
               });
               
                 if (!response.ok) {
                   const errorData = await response.json();
                   console.error('❌ API Error:', errorData);
                   throw new Error(errorData.error || 'Failed to create moveframe');
                 }
                 
                const result = await response.json();
                 console.log('✅ Moveframe created successfully:', result);
                 showMessage('success', 'Moveframe created successfully');
                 
                 // Reload data to show the new moveframe immediately
                 await loadWorkoutData(activeSection);
               }
                
                // Keep workout expanded
               if (activeWorkout && !expandedWorkouts.has(activeWorkout.id)) {
                  toggleWorkoutExpansion(activeWorkout.id);
                }
                
               // Auto-expand the day and workout
               if (activeDay && activeWorkout) {
                 setAutoExpandDayId(activeDay.id);
                 setAutoExpandWorkoutId(activeWorkout.id);
                  setTimeout(() => {
                    setAutoExpandDayId(null);
                    setAutoExpandWorkoutId(null);
                 }, 500);
                }
             } catch (error: any) {
               console.error('❌ Failed to save moveframe:', error);
               showMessage('error', error.message || 'Failed to save moveframe');
               throw error;
               }
           }}
           mode={moveframeModalMode}
           workout={activeWorkout}
           day={activeDay}
           existingMoveframe={moveframeModalMode === 'edit' ? editingMoveframe : undefined}
         />
       )}
       
      {modals.showImportModal && (activeSection === 'A' || activeSection === 'B') && (
        <ImportWorkoutsModal
          targetSection={activeSection}
          onClose={() => modalActions.setShowImportModal(false)}
          onImport={async (sourceType, sourceId, workouts) => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch('/api/workouts/import', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  targetSection: activeSection,
                  sourceType,
                  sourceId,
                  workoutIds: workouts.map(w => w.id)
                })
              });
              
              if (response.ok) {
                modalActions.setShowImportModal(false);
                alert(`Successfully imported ${workouts.length} workout(s)!`);
              } else {
                alert('Failed to import workouts');
              }
             } catch (error) {
               console.error('Error importing workouts:', error);
               alert('Error importing workouts');
             }
           }}
         />
       )}
       
      {modals.showAddDayModal && workoutPlan && (
        <AddDayModal
          workoutPlanId={workoutPlan.id}
          onClose={() => modalActions.setShowAddDayModal(false)}
          onSave={() => {
            modalActions.setShowAddDayModal(false);
          }}
        />
      )}
      
      {/* Virtual Start Date Modal for Sections B & C */}
      {modals.showStartDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Set Virtual Start Date</h2>
              <button onClick={() => modalActions.setShowStartDatePicker(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {activeSection === 'B' ? 
                'Set the starting date for your yearly plan (365 days from this date)' :
                'Set the starting date to view your completed workouts (365 days from this date)'
              }
            </p>
            
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              onChange={(e) => {
                if (e.target.value) {
                  const selected = new Date(e.target.value);
                  setVirtualStartDate(selected);
                }
              }}
            />
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => modalActions.setShowStartDatePicker(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (virtualStartDate) {
                    modalActions.setShowStartDatePicker(false);
                    // Reload data with new start date
                    await loadWorkoutData();
                  }
                }}
                disabled={!virtualStartDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Athlete Selector Modal for Section C (Coaches/Teams/Clubs) */}
      {modals.showAthleteSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select Athlete</h2>
              <button onClick={() => modalActions.setShowAthleteSelector(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Select an athlete to view their completed workouts. You can only view workouts if the athlete has given you permission.
            </p>
            
            {athleteList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No athletes found.</p>
                <p className="text-sm mt-2">Athletes you manage will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {athleteList.map((athlete) => (
                  <button
                    key={athlete.id}
                    onClick={() => {
                      setSelectedAthlete(athlete);
                      modalActions.setShowAthleteSelector(false);
                      loadWorkoutData(activeSection); // Reload data for selected athlete
                    }}
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{athlete.name}</div>
                      <div className="text-sm text-gray-500">{athlete.email}</div>
                    </div>
                    {selectedAthlete?.id === athlete.id && (
                      <div className="text-blue-600 text-sm font-medium">✓ Selected</div>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setSelectedAthlete(null);
                  modalActions.setShowAthleteSelector(false);
                  loadWorkoutData(activeSection); // Reload own data
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                View My Workouts
              </button>
              <button
                onClick={() => modalActions.setShowAthleteSelector(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Workout Selector Modal - For Adding Moveframe */}
      {modals.showWorkoutSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select Workout for Moveframe</h2>
              <button onClick={() => modalActions.setShowWorkoutSelector(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Select which workout to add the moveframe to. Showing all existing workouts for {addWorkoutDay?.date ? new Date(addWorkoutDay.date).toLocaleDateString() : 'selected day'}.
            </p>
            
            <div className="space-y-3">
              {availableWorkouts.map((workout, index) => (
                <button
                  key={workout.id}
                  onClick={() => {
                    setSelectedWorkout(workout.id);
                    modalActions.setShowWorkoutSelector(false);
                    modalActions.setShowAddMoveframeModal(true);
                  }}
                  className="w-full text-left px-4 py-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-blue-600">Workout #{index + 1}</span>
                        <span className="text-sm text-gray-500">
                          {addWorkoutDay?.date ? new Date(addWorkoutDay.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="font-medium text-gray-900">
                          {workout.name || '<no name assigned>'}
                        </span>
                      </div>
                      {workout.moveframes && workout.moveframes.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-600">Sports:</span>
                          <div className="flex gap-1">
                            {(Array.from(new Set(workout.moveframes.map((mf: any) => mf.sport as string))) as string[]).slice(0, 4).map((sport: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                {sport}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-blue-600 text-2xl">→</div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => modalActions.setShowWorkoutSelector(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      
      {/* Day Selector Modal - For Editing Day Notes/Annotations */}
      {modals.showDaySelector && workoutPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select Day to Edit</h2>
              <button onClick={() => modalActions.setShowDaySelector(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Select a day from the grid below to edit its notes, weather, feeling, and annotations.
            </p>
            
            {/* Display days in a grid format by week */}
            <div className="space-y-6">
              {workoutPlan.weeks.map((week: any) => (
                <div key={week.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Week {week.weekNumber}</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {week.days.map((day: any) => {
                      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      return (
                        <button
                          key={day.id}
                          onClick={() => {
                            setEditingDay(day);
                            modalActions.setShowDaySelector(false);
                            modalActions.setShowEditDayModal(true);
                          }}
                          className="p-3 border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors text-center"
                        >
                          <div className="text-xs font-medium text-gray-600">
                            {dayNames[day.dayOfWeek - 1]}
                          </div>
                          <div className="text-sm font-bold text-gray-900 mt-1">
                            {new Date(day.date).getDate()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          {day.notes && (
                            <div className="mt-1 text-xs text-blue-600">📝</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => modalActions.setShowDaySelector(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Day Modal - Edit day notes, weather, feeling, annotations */}
      {/* ==================== EDIT DAY MODAL (Extracted Component) ==================== */}
      {modals.showEditDayModal && editingDay && (
        <EditDayModal
          day={editingDay}
          periods={periods}
          activeSection={activeSection === 'D' ? 'A' : activeSection as 'A' | 'B' | 'C'}
          onClose={() => {
            modalActions.closeEditDayModal();
            setEditingDay(null);
          }}
          onSave={async () => {
            modalActions.closeEditDayModal();
            setEditingDay(null);
            await loadWorkoutData(activeSection);
          }}
          onError={(msg) => showMessage('error', msg)}
          onSuccess={(msg) => showMessage('success', msg)}
        />
      )}

      {/* ==================== ADD MOVELAP MODAL (Extracted Component) ==================== */}
      {modals.showAddMovelapModal && activeMoveframe && activeWorkout && activeDay && (
        <AddMovelapModal
          moveframe={activeMoveframe}
          workout={activeWorkout}
          day={activeDay}
          onClose={() => modalActions.setShowAddMovelapModal(false)}
          onSave={(moveframeId, newMovelap) => {
            // Update local state without full page reload
            if (workoutPlan && newMovelap) {
              const updatedPlan = { ...workoutPlan };
              
              // Find and update the specific moveframe with the new movelap
              updatedPlan.weeks = workoutPlan.weeks.map((week: any) => ({
                ...week,
                days: week.days.map((day: any) => ({
                  ...day,
                  workouts: day.workouts?.map((workout: any) => ({
                    ...workout,
                    moveframes: workout.moveframes?.map((mf: any) => {
                      if (mf.id === moveframeId) {
                        return {
                          ...mf,
                          movelaps: [...(mf.movelaps || []), newMovelap]
                        };
                      }
                      return mf;
                    })
                  }))
                }))
              }));
              
              updateWorkoutPlan(updatedPlan);
            }
            
            // Keep moveframe expanded so user can see the new movelap
            if (activeDay && activeWorkout && moveframeId) {
              setAutoExpandDayId(activeDay.id);
              setAutoExpandWorkoutId(activeWorkout.id);
              setAutoExpandMoveframeId(moveframeId);
            }
          }}
          onError={(msg) => showMessage('error', msg)}
          onSuccess={(msg) => showMessage('success', msg)}
        />
      )}

      {/* ==================== EDIT MOVEFRAME MODAL (Extracted Component) ==================== */}
      {modals.showEditMoveframeModal && editingMoveframe && activeWorkout && activeDay && (
        <EditMoveframeModal
          moveframe={editingMoveframe}
          workout={activeWorkout}
          day={activeDay}
          onClose={() => {
            modalActions.setShowEditMoveframeModal(false);
            setEditingMoveframe(null);
          }}
          onSave={async () => {
            modalActions.setShowEditMoveframeModal(false);
            setEditingMoveframe(null);
            await loadWorkoutData(activeSection);
          }}
          onError={(msg) => showMessage('error', msg)}
          onSuccess={(msg) => showMessage('success', msg)}
        />
      )}

      {/* ==================== ADD/EDIT MOVELAP MODAL (New Unified Component) ==================== */}
      {modals.showAddEditMovelapModal && activeMoveframe && (
        <AddEditMovelapModal
          isOpen={modals.showAddEditMovelapModal}
          mode={modes.movelapModalMode}
          moveframe={activeMoveframe}
          existingMovelap={editingMovelap}
          onClose={() => {
            modalActions.setShowAddEditMovelapModal(false);
            setEditingMovelap(null);
            setActiveMoveframe(null);
          }}
          onSave={async (movelapData) => {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                showMessage('error', 'Authentication required');
                return;
              }

              let response;
              if (modes.movelapModalMode === 'edit' && editingMovelap) {
                // Update existing movelap
                response = await fetch(`/api/workouts/movelaps?id=${editingMovelap.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(movelapData)
                });
              } else {
                // Create new movelap
                response = await fetch('/api/workouts/movelaps', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(movelapData)
                });
              }

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save movelap');
              }

              showMessage('success', modes.movelapModalMode === 'edit' ? 'Movelap updated successfully' : 'Movelap created successfully');
              modalActions.setShowAddEditMovelapModal(false);
              setEditingMovelap(null);
              setActiveMoveframe(null);
              
              // Refresh workout data to show changes
              await loadWorkoutData(activeSection);
            } catch (error: any) {
              console.error('Error saving movelap:', error);
              showMessage('error', error.message || 'Failed to save movelap');
            }
          }}
        />
      )}

      {/* ==================== COPY DAY MODAL ==================== */}
      {modals.showCopyDayModal && copiedDay && workoutPlan && (
        <CopyDayModal
          isOpen={modals.showCopyDayModal}
          onClose={() => {
            modalActions.closeCopyDayModal();
            setCopiedDay(null);
          }}
          sourceDay={copiedDay}
          workoutPlan={workoutPlan}
          onConfirm={async (targetDate, targetWeekId) => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch('/api/workouts/days/copy', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  sourceDayId: copiedDay.id,
                  targetDate: targetDate.toISOString(),
                  targetWeekId
                })
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to copy day');
              }

              showMessage('success', 'Day copied successfully');
              modalActions.closeCopyDayModal();
              setCopiedDay(null);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to copy day');
            }
          }}
        />
      )}

      {/* ==================== MOVE DAY MODAL ==================== */}
      {modals.showMoveDayModal && copiedDay && workoutPlan && (
        <MoveDayModal
          isOpen={modals.showMoveDayModal}
          onClose={() => {
            modalActions.closeMoveDayModal();
            setCopiedDay(null);
          }}
          sourceDay={copiedDay}
          workoutPlan={workoutPlan}
          onConfirm={async (targetDate, targetWeekId) => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch('/api/workouts/days/move', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  sourceDayId: copiedDay.id,
                  targetDate: targetDate.toISOString(),
                  targetWeekId
                })
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to move day');
              }

              showMessage('success', 'Day moved successfully');
              modalActions.closeMoveDayModal();
              setCopiedDay(null);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to move day');
            }
          }}
        />
      )}

      {/* ==================== COPY WORKOUT MODAL ==================== */}
      {modals.showCopyWorkoutModal && copiedWorkout && workoutPlan && (
        <CopyWorkoutModal
          isOpen={modals.showCopyWorkoutModal}
          onClose={() => {
            modalActions.closeCopyWorkoutModal();
            setCopiedWorkout(null);
          }}
          sourceWorkout={copiedWorkout}
          workoutPlan={workoutPlan}
          onConfirm={async (targetDayId, sessionNumber) => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch('/api/workouts/sessions/copy', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  sourceWorkoutId: copiedWorkout.id,
                  targetDayId,
                  sessionNumber
                })
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to copy workout');
              }

              showMessage('success', 'Workout copied successfully');
              modalActions.closeCopyWorkoutModal();
              setCopiedWorkout(null);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to copy workout');
            }
          }}
        />
      )}

      {/* ==================== MOVE WORKOUT MODAL ==================== */}
      {modals.showMoveWorkoutModal && copiedWorkout && workoutPlan && (
        <MoveWorkoutModal
          isOpen={modals.showMoveWorkoutModal}
          onClose={() => {
            modalActions.closeMoveWorkoutModal();
            setCopiedWorkout(null);
          }}
          sourceWorkout={copiedWorkout}
          workoutPlan={workoutPlan}
          onConfirm={async (targetDayId, sessionNumber) => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch('/api/workouts/sessions/move', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  workoutId: copiedWorkout.id,
                  targetDayId,
                  sessionNumber
                })
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to move workout');
              }

              showMessage('success', 'Workout moved successfully');
              modalActions.closeMoveWorkoutModal();
              setCopiedWorkout(null);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to move workout');
            }
          }}
        />
      )}

      {/* ==================== COPY MOVEFRAME MODAL ==================== */}
      {modals.showCopyMoveframeModal && copiedMoveframe && workoutPlan && (
        <CopyMoveframeModal
          isOpen={modals.showCopyMoveframeModal}
          onClose={() => {
            modalActions.setShowCopyMoveframeModal(false);
            setCopiedMoveframe(null);
          }}
          sourceMoveframe={copiedMoveframe}
          workoutPlan={workoutPlan}
          onConfirm={async (targetWorkoutId, position, targetMoveframeId) => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch('/api/workouts/moveframes/copy', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  sourceMoveframeId: copiedMoveframe.id,
                  targetWorkoutId,
                  position,
                  targetMoveframeId
                })
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to copy moveframe');
              }

              showMessage('success', 'Moveframe copied successfully');
              modalActions.setShowCopyMoveframeModal(false);
              setCopiedMoveframe(null);
              await loadWorkoutData(activeSection);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to copy moveframe');
            }
          }}
        />
      )}

      {/* ==================== MOVE MOVEFRAME MODAL ==================== */}
      {modals.showMoveMoveframeModal && copiedMoveframe && activeWorkout && workoutPlan && (
        <MoveMoveframeModal
          isOpen={modals.showMoveMoveframeModal}
          onClose={() => {
            modalActions.setShowMoveMoveframeModal(false);
            setCopiedMoveframe(null);
          }}
          sourceMoveframe={copiedMoveframe}
          sourceWorkout={activeWorkout}
          workoutPlan={workoutPlan}
          onConfirm={async (targetWorkoutId, position, targetMoveframeId) => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch('/api/workouts/moveframes/move', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  moveframeId: copiedMoveframe.id,
                  targetWorkoutId,
                  position,
                  targetMoveframeId
                })
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to move moveframe');
              }

              showMessage('success', 'Moveframe moved successfully');
              modalActions.setShowMoveMoveframeModal(false);
              setCopiedMoveframe(null);
              await loadWorkoutData(activeSection);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to move moveframe');
            }
          }}
        />
      )}

      {/* ==================== COLUMN SETTINGS MODAL ==================== */}
      {modals.showColumnSettingsModal && (
        <ColumnSettingsModal
          isOpen={modals.showColumnSettingsModal}
          onClose={() => modalActions.setShowColumnSettingsModal(false)}
          tableType={settings.columnSettingsTableType}
          visibleColumns={columnSettings.getVisibleColumns(settings.columnSettingsTableType)}
          columnOrder={columnSettings.getColumnOrder(settings.columnSettingsTableType)}
          onSave={(visibleColumns, columnOrder) => {
            columnSettings.updateTableSettings(settings.columnSettingsTableType, visibleColumns, columnOrder);
            showMessage('success', 'Column settings saved');
          }}
          onReset={() => {
            columnSettings.resetTableSettings(settings.columnSettingsTableType);
            showMessage('success', 'Column settings reset to default');
          }}
        />
      )}

      {/* ==================== BULK ADD MOVELAP MODAL ==================== */}
      {modals.showBulkAddMovelapModal && activeMoveframe && activeWorkout && activeDay && (
        <BulkAddMovelapModal
          isOpen={modals.showBulkAddMovelapModal}
          onClose={() => {
            modalActions.setShowBulkAddMovelapModal(false);
            setActiveMoveframe(null);
          }}
          moveframe={activeMoveframe}
          workout={activeWorkout}
          day={activeDay}
          onSave={async (movelaps) => {
            try {
              const token = localStorage.getItem('token');
              
              // Create all movelaps
              for (const movelapData of movelaps) {
                await fetch('/api/workouts/movelaps', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    ...movelapData,
                    moveframeId: activeMoveframe.id
                  })
                });
              }

              showMessage('success', `${movelaps.length} movelaps added successfully`);
              modalActions.setShowBulkAddMovelapModal(false);
              setActiveMoveframe(null);
              await loadWorkoutData(activeSection);
            } catch (error) {
              console.error('Error bulk adding movelaps:', error);
              showMessage('error', 'Failed to add movelaps');
            }
          }}
        />
      )}
     </div>

      {/* Drag Overlay - Shows preview while dragging */}
      <DragOverlay>
        {draggedWorkout && (
          <div className="bg-cyan-400 text-white px-4 py-2 rounded shadow-lg opacity-90">
            🏃 Dragging Workout...
          </div>
        )}
        {draggedMoveframe && (
          <div className="bg-purple-400 text-white px-4 py-2 rounded shadow-lg opacity-90">
            💪 Dragging Moveframe...
          </div>
        )}
      </DragOverlay>

      {/* Drag & Drop Confirmation Modal */}
      {dragModalConfig && (
        <DragDropConfirmModal
          isOpen={modals.showDragModal}
          onClose={() => {
            modalActions.setShowDragModal(false);
            setDragModalConfig(null);
          }}
          onConfirm={handleDragConfirm}
          dragType={dragModalConfig.dragType}
          hasConflict={dragModalConfig.hasConflict}
          conflictMessage={dragModalConfig.conflictMessage}
          showPositionChoice={dragModalConfig.showPositionChoice}
        />
      )}
    </DndContext>
   );
}
