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
import WorkoutTreeView from '@/components/workouts/WorkoutTreeView';
import DayTableView from '@/components/workouts/tables/DayTableView';
import StyledTableWrapper from '@/components/workouts/tables/StyledTableWrapper';
import AddWorkoutModal from '@/components/workouts/AddWorkoutModal';
import WorkoutInfoModal from '@/components/workouts/WorkoutInfoModal';
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
import CreateYearlyPlanModal from '@/components/workouts/modals/CreateYearlyPlanModal';
import ImportFromPlanModal from '@/components/workouts/modals/ImportFromPlanModal';
import DayPrintModal from '@/components/workouts/modals/DayPrintModal';
import WeekTotalsModal from '@/components/workouts/modals/WeekTotalsModal';
import CopyWeekModal from '@/components/workouts/modals/CopyWeekModal';
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
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [selectedWeekForTable, setSelectedWeekForTable] = useState<number | null>(null);
  
  // Week grouping for Section B pagination
  const [weeksPerPage, setWeeksPerPage] = useState<number>(3); // 1, 2, 3, 4, 6, 8, 13
  const [currentPageStart, setCurrentPageStart] = useState<number>(1); // Starting week number for current page
  
  // Reset view mode when section changes
  useEffect(() => {
    // Section A: Only Tree and Table (default to Tree)
    // Section B: Tree, Table, and Calendar
    // Section C & D: Only Tree and Table (default to Tree)
    if (activeSection === 'A' || activeSection === 'C' || activeSection === 'D') {
      // If currently on calendar view, switch to tree view
      if (viewMode === 'calendar') {
        setViewMode('tree');
      }
    }
    // Clear week filter when changing sections
    setSelectedWeekForTable(null);
    // Reset pagination when changing sections
    setCurrentPageStart(1);
  }, [activeSection]);
  
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
  const { modals, modes, settings, setters, actions: modalActions } = useWorkoutModals();

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
  const [movelapInsertIndex, setMovelapInsertIndex] = useState<number | null>(null);
  
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

  // Handler to expand only the selected workout and collapse all others
  const handleExpandOnlyThisWorkout = (workout: any, day: any) => {
    console.log('🎯 Expanding ONLY workout:', workout.id, 'on day:', day.id);
    console.log('📊 Currently expanded workouts BEFORE:', Array.from(expandedWorkouts));
    
    // Step 1: Ensure the day is expanded first
    if (!expandedDays.has(day.id)) {
      console.log('📅 Day is collapsed, expanding day:', day.id);
      toggleDayExpansion(day.id);
    } else {
      console.log('📅 Day is already expanded:', day.id);
    }
    
    // Step 2: Get snapshot of all currently expanded workouts
    const currentlyExpandedWorkouts = Array.from(expandedWorkouts);
    console.log('📊 Workouts to close:', currentlyExpandedWorkouts.filter(id => id !== workout.id));
    
    // Step 3: Close ALL workouts except the target
    currentlyExpandedWorkouts.forEach((workoutId: string) => {
      if (workoutId !== workout.id) {
        console.log('❌ Closing workout:', workoutId);
        toggleWorkoutExpansion(workoutId);
      }
    });
    
    // Step 4: Open the target workout if it's not already open
    if (!expandedWorkouts.has(workout.id)) {
      console.log('✅ Opening target workout:', workout.id);
      toggleWorkoutExpansion(workout.id);
    } else {
      console.log('ℹ️ Target workout already open:', workout.id);
    }
    
    console.log('📊 Expanded workouts AFTER:', Array.from(expandedWorkouts));
    console.log('✅ Done. Should have ONLY workout', workout.id, 'open');
  };

  // ==================== MODAL MODE STATE ====================
  const [workoutModalMode, setWorkoutModalMode] = useState<'add' | 'edit'>('add');
  const [showWorkoutInfoModal, setShowWorkoutInfoModal] = useState(false);
  const [showCreateYearlyPlanModal, setShowCreateYearlyPlanModal] = useState(false);
  const [showDayPrintModal, setShowDayPrintModal] = useState(false);
  const [dayToPrint, setDayToPrint] = useState<any>(null);
  const [autoPrintDay, setAutoPrintDay] = useState(false);
  const [showCopyWeekModal, setShowCopyWeekModal] = useState(false);
  const [showMoveWeekModal, setShowMoveWeekModal] = useState(false);
  const [showWeekTotalsModal, setShowWeekTotalsModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<any>(null);
  const [autoPrintWeek, setAutoPrintWeek] = useState(false);
  const [targetWeeks, setTargetWeeks] = useState<any[]>([]);
  // Use moveframeModalMode from the hook instead of local state
  const moveframeModalMode = modes.moveframeModalMode;
  const setMoveframeModalMode = setters.setMoveframeModalMode;
  const [moveframeInsertIndex, setMoveframeInsertIndex] = useState<number | null>(null); // For "Add MF" after specific moveframe
  
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
    setMoveframeModalMode('add');
    setEditingMoveframe(null);
    setMoveframeInsertIndex(null); // Reset insert index for regular add (append to end)
    modalActions.openAddMoveframeModal();
  };
  
  /**
   * ADD MOVEFRAME AFTER - Adds a moveframe after a specific moveframe
   * @param moveframe - The moveframe to insert after
   * @param index - The index of the moveframe in the list
   */
  const handleAddMoveframeAfter = (moveframe: any, index: number, workout: any, day: any) => {
    if (!workout || !day) {
      showMessage('error', 'Could not find workout or day context');
      return;
    }
    
    setActiveWorkout(workout);
    setActiveDay(day);
    setSelectedWorkout(workout.id);
    setSelectedDay(day);
    setMoveframeModalMode('add');
    setEditingMoveframe(null);
    setMoveframeInsertIndex(index + 1);
    
    setters.setShowAddMoveframeModal(true);
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

  /**
   * IMPORT WORKOUTS - Handler for importing workouts from Yearly Plan to Workouts Done
   */
  const handleImportWorkouts = async (workoutIds: string[], targetDate?: string) => {
    modalActions.closeImportModal();
    
    try {
      showMessage('info', 'Importing workouts...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'Please log in first');
        return;
      }

      const response = await fetch('/api/workouts/import-from-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workoutIds, targetDate })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage('success', data.message || 'Workouts imported successfully!');
      } else {
        showMessage('error', data.error || 'Failed to import workouts');
      }
    } catch (error) {
      console.error('Error importing workouts:', error);
      showMessage('error', 'Failed to import workouts');
    }
  };

  /**
   * COPY WEEK - Handler for copying a week to another week (Section A to Section B)
   */
  const handleCopyWeek = async (targetWeekId: string) => {
    if (!currentWeek) {
      showMessage('error', 'No source week selected');
      return;
    }

    try {
      showMessage('info', `Copying Week ${currentWeek.weekNumber}...`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'Please log in first');
        return;
      }

      const response = await fetch('/api/workouts/weeks/copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          sourceWeekId: currentWeek.id, 
          targetWeekId 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage('success', data.message || 'Week copied successfully!');
        // Reload the workout plan to show the changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showMessage('error', data.error || 'Failed to copy week');
      }
    } catch (error) {
      console.error('Error copying week:', error);
      showMessage('error', 'An error occurred while copying the week');
    }
  };

  /**
   * CREATE YEARLY PLAN - Handler for creating yearly plan from start date
   */
  const handleCreateYearlyPlan = async (startDate: Date) => {
    // Close modal immediately to prevent overlapping
    setShowCreateYearlyPlanModal(false);
    
    try {
      showMessage('info', 'Creating yearly plan...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'Please log in first');
        return;
      }

      const response = await fetch('/api/workouts/plan/create-yearly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ startDate: startDate.toISOString() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Plan created! Response data:', data);
        console.log('📊 Plan has', data.plan?.weeks?.length, 'weeks');
        showMessage('success', data.message || 'Yearly plan created successfully!');
        
        // Use the plan data directly from the response instead of reloading
        if (data.plan && data.plan.weeks) {
          console.log('📊 Setting workoutPlan directly from create response');
          console.log('   Plan ID:', data.plan.id);
          console.log('   Weeks:', data.plan.weeks.length);
          console.log('   First week days:', data.plan.weeks[0]?.days?.length);
          
          updateWorkoutPlan(data.plan);
          setCurrentPageStart(1);
          setViewMode('table');
          
          console.log('✅ Data set successfully! WorkoutPlan now has', data.plan.weeks.length, 'weeks');
        } else {
          console.warn('⚠️ Plan created but no weeks in response, reloading...');
          // Fallback: reload from API
          setCurrentPageStart(1);
          setViewMode('table');
          await new Promise(resolve => setTimeout(resolve, 500));
          await loadWorkoutData('B');
        }
      } else {
        console.error('❌ Failed:', data.error);
        showMessage('error', data.error || 'Failed to create yearly plan');
      }
    } catch (error) {
      console.error('Error creating yearly plan:', error);
      showMessage('error', 'Failed to create yearly plan');
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDraggedWorkout(null);
      setDraggedMoveframe(null);
      return;
    }
    
    const dragType = active.data.current?.type;
    const dropType = over.data.current?.type;
    
    // Handle same-workout moveframe reordering (simple case)
    if (dragType === 'moveframe' && dropType === 'moveframe') {
      const sourceWorkout = active.data.current?.workout;
      const targetWorkout = over.data.current?.workout;
      
      // Same workout - simple reorder
      if (sourceWorkout?.id === targetWorkout?.id) {
        console.log('🔄 Same-workout reorder - calling reorder API');
        await handleSameWorkoutMoveframeReorder(active.id, over.id, sourceWorkout);
        setDraggedMoveframe(null);
        return;
      }
      
      // Cross-workout - show modal
      setDragModalConfig({
        dragType: 'moveframe',
        hasConflict: false,
        showPositionChoice: true,
        sourceData: active.data.current,
        targetData: over.data.current
      });
      modalActions.setShowDragModal(true);
    } else if (dragType === 'workout' && (dropType === 'day' || dropType === 'workout')) {
      // Handle workout dragging
      const sourceWorkout = active.data.current?.workout;
      const sourceDay = active.data.current?.day;
      const targetDay = dropType === 'day' ? over.data.current?.day : over.data.current?.day;
      
      // Same day - simple reorder
      if (sourceDay?.id === targetDay?.id && active.id !== over.id) {
        console.log('🔄 Same-day workout reorder');
        await handleSameDayWorkoutReorder(active.id, over.id, sourceDay);
        setDraggedWorkout(null);
        return;
      }
      
      // Cross-day - show modal
      const existingWorkoutCount = targetDay?.workouts?.length || 0;
      const hasConflict = existingWorkoutCount >= 3;
      
      setDragModalConfig({
        dragType: 'workout',
        hasConflict: hasConflict,
        conflictMessage: hasConflict ? 'This day already has 3 workouts (maximum). Choose an action:' : undefined,
        sourceData: { workout: sourceWorkout, sourceDay: sourceDay },
        targetData: { targetDay, existingWorkout: null }
      });
      modalActions.setShowDragModal(true);
    } else if (dragType === 'moveframe' && (dropType === 'workout' || dropType === 'day')) {
      // Handle moveframe dropped on workout or day
      setDragModalConfig({
        dragType: 'moveframe',
        hasConflict: false,
        showPositionChoice: false,
        sourceData: active.data.current,
        targetData: over.data.current
      });
      modalActions.setShowDragModal(true);
    }
    
    setDraggedWorkout(null);
    setDraggedMoveframe(null);
  };

  // Handle same-workout moveframe reordering
  const handleSameWorkoutMoveframeReorder = async (activeMoveframeId: any, overMoveframeId: any, workout: any) => {
    try {
      const moveframes = workout.moveframes || [];
      const oldIndex = moveframes.findIndex((mf: any) => mf.id === activeMoveframeId);
      const newIndex = moveframes.findIndex((mf: any) => mf.id === overMoveframeId);
      
      if (oldIndex === -1 || newIndex === -1) return;
      
      // Reorder array
      const newOrder = [...moveframes];
      const [movedItem] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, movedItem);
      
      // Reassign letters alphabetically
      const updatedOrder = newOrder.map((mf, index) => ({
        id: mf.id,
        letter: String.fromCharCode(65 + index) // A, B, C, D...
      }));
      
      // Call reorder API
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      
      const response = await fetch('/api/workouts/moveframes/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ moveframes: updatedOrder })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reorder moveframes');
      }
      
      console.log('✅ Moveframes reordered successfully');
      showMessage('success', 'Moveframes reordered successfully');
      await loadWorkoutData(activeSection);
    } catch (error) {
      console.error('Error reordering moveframes:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to reorder moveframes');
    }
  };

  // Handle same-day workout reordering  
  const handleSameDayWorkoutReorder = async (activeWorkoutId: any, overWorkoutId: any, day: any) => {
    try {
      const workouts = day.workouts || [];
      const oldIndex = workouts.findIndex((w: any) => w.id === activeWorkoutId.replace('workout-', ''));
      const newIndex = workouts.findIndex((w: any) => w.id === overWorkoutId.replace('workout-', ''));
      
      if (oldIndex === -1 || newIndex === -1) return;
      
      // Reorder array
      const newOrder = [...workouts];
      const [movedItem] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, movedItem);
      
      // Reassign session numbers
      const updatedOrder = newOrder.map((w, index) => ({
        id: w.id,
        sessionNumber: index + 1 // 1, 2, 3
      }));
      
      // Call reorder API
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      
      const response = await fetch('/api/workouts/sessions/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workouts: updatedOrder })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reorder workouts');
      }
      
      console.log('✅ Workouts reordered successfully');
      showMessage('success', 'Workouts reordered successfully');
      await loadWorkoutData(activeSection);
    } catch (error) {
      console.error('Error reordering workouts:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to reorder workouts');
    }
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
      // Move workout to different day
      const response = await fetch('/api/workouts/sessions/move-to-day', {
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
      await loadWorkoutData(activeSection); // Reload to show changes
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
      // Move moveframe to different workout
      // Check if same workout or different
      if (sourceWorkout.id === targetWorkoutId) {
        // Same workout - this shouldn't happen as we handle it separately
        console.warn('Same workout move detected in modal handler - should be handled earlier');
        return;
      }
      
      // Cross-workout move - use move-to-workout API
      const response = await fetch('/api/workouts/moveframes/move-to-workout', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          moveframeId: moveframe.id,
          targetWorkoutId,
          targetIndex: position === 'before' ? 0 : undefined
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move moveframe');
      }
      
      console.log('✅ Moveframe moved:', moveframe.id, '→', targetWorkoutId);
      await loadWorkoutData(activeSection); // Reload to show changes
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
      {/* Feedback Message */}
      {feedbackMessage && (
        <div 
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
            feedbackMessage.type === 'success' ? 'bg-green-500' :
            feedbackMessage.type === 'error' ? 'bg-red-500' :
            feedbackMessage.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}
      {/* Small header bar with close button */}
      {/* Header Component */}
      {/* Check if we can add a day (Section A: only if a week has < 7 days) */}
      {(() => {
        let canAddDay = true;
        if (activeSection === 'A' && workoutPlan?.weeks) {
          // For Section A, check if any week has less than 7 days
          canAddDay = workoutPlan.weeks.some((week: any) => {
            const dayCount = week.days?.length || 0;
            return dayCount < 7;
          });
        }
        // For sections B and C, always allow adding days
        
        return (
          <WorkoutSectionHeader
            activeSection={activeSection}
            viewMode={viewMode}
            selectedWeekForTable={selectedWeekForTable}
            virtualStartDate={virtualStartDate}
            userType={userType ?? undefined}
            selectedAthlete={selectedAthlete}
            canAddDay={canAddDay}
            weeksPerPage={weeksPerPage}
            currentPageStart={currentPageStart}
            totalWeeks={workoutPlan?.weeks?.length || 0}
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
            onAddDay={() => modalActions.openAddDayModal()}
            onCreatePlan={() => setShowCreateYearlyPlanModal(true)}
            onClose={onClose}
        onWeeksPerPageChange={(weeks: number) => {
          setWeeksPerPage(weeks);
          setCurrentPageStart(1); // Reset to first page when changing grouping
        }}
        onPrevPage={() => {
          setCurrentPageStart(Math.max(1, currentPageStart - weeksPerPage));
        }}
        onNextPage={() => {
          const totalWeeks = workoutPlan?.weeks?.length || 0;
          setCurrentPageStart(Math.min(totalWeeks, currentPageStart + weeksPerPage));
        }}
          />
        );
      })()}
      
      {/* ==================== CREATE YEARLY PLAN MODAL ==================== */}
      {showCreateYearlyPlanModal && (
        <CreateYearlyPlanModal
          isOpen={showCreateYearlyPlanModal}
          onClose={() => setShowCreateYearlyPlanModal(false)}
          onConfirm={handleCreateYearlyPlan}
        />
      )}

      {/* ==================== IMPORT FROM PLAN MODAL ==================== */}
      {modals.showImportModal && (
        <ImportFromPlanModal
          isOpen={modals.showImportModal}
          onClose={() => modalActions.closeImportModal()}
          onConfirm={handleImportWorkouts}
        />
      )}

      {/* Workout area - full width */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center - main workout area (full width, no sidebars) */}
        <main className="flex-1 bg-white overflow-y-auto overflow-x-hidden w-full">
          <div className="p-2">

            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : viewMode === 'tree' ? (
              <div className="flex flex-col h-full">
                {/* Tree View Week Navigation Header - Same as Table View */}
                {(activeSection === 'A' || activeSection === 'B') && workoutPlan && workoutPlan.weeks && workoutPlan.weeks.length > 0 && (
                  <div className="sticky top-0 z-50 bg-white shadow-lg p-4 border-b-2 border-gray-300">
                    <div className="flex items-center justify-between gap-2">
                      {/* Left side buttons */}
                      <div className="flex items-center gap-2">
                        {/* Previous Week Button */}
                        <button
                          onClick={() => {
                            const newStart = Math.max(1, currentPageStart - weeksPerPage);
                            setCurrentPageStart(newStart);
                          }}
                          disabled={currentPageStart <= 1}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            currentPageStart <= 1
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          ← Previous
                        </button>

                        {/* Expand/Collapse All Button */}
                        <button
                          onClick={() => {
                            const allWeeks = workoutPlan.weeks || [];
                            if (expandedWeeks.size === 0) {
                              // Expand all weeks
                              allWeeks.forEach((week: any) => {
                                if (!expandedWeeks.has(week.id)) {
                                  toggleWeekExpansion(week.id);
                                }
                              });
                            } else {
                              // Collapse all weeks
                              allWeeks.forEach((week: any) => {
                                if (expandedWeeks.has(week.id)) {
                                  toggleWeekExpansion(week.id);
                                }
                              });
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-purple-500 text-white hover:bg-purple-600"
                        >
                          {expandedWeeks.size === 0 ? 'Expand All' : 'Collapse All'}
                        </button>
                      </div>

                      {/* Center: Week Info */}
                      <div className="flex-1 flex items-center justify-center gap-6">
                        <div className="text-lg font-bold text-gray-900">
                          {activeSection === 'B' && weeksPerPage > 1
                            ? `Weeks ${currentPageStart} - ${Math.min(currentPageStart + weeksPerPage - 1, workoutPlan?.weeks?.length || 0)}`
                            : activeSection === 'A'
                            ? `3 Weeks Plan`
                            : `Week ${currentPageStart}`}
                        </div>

                        {/* Week action buttons */}
                        <div className="flex items-center gap-2">
                          {/* Edit Button - Switch to table view to edit items */}
                          <button
                            onClick={() => {
                              setViewMode('table');
                              showMessage('info', 'Now you can edit days, workouts, moveframes, and movelaps');
                            }}
                            className="flex items-center gap-1 px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex-shrink-0"
                            title="Switch to table view to edit items"
                          >
                            Edit
                          </button>

                          {/* Copy Button - Copy first week in range */}
                          <button
                            onClick={async () => {
                              const firstWeek = workoutPlan.weeks?.find((w: any) => w.weekNumber === currentPageStart);
                              if (firstWeek) {
                                setCurrentWeek(firstWeek);
                                
                                // Fetch target plan weeks (opposite section)
                                const token = localStorage.getItem('token');
                                if (!token) {
                                  showMessage('error', 'Please log in first');
                                  return;
                                }
                                
                                try {
                                  showMessage('info', 'Loading available weeks...');
                                  const targetPlanType = activeSection === 'A' ? 'YEARLY_PLAN' : 'THREE_WEEKS_PLAN';
                                  const response = await fetch(`/api/workouts/plan?type=${targetPlanType}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  
                                  if (response.ok) {
                                    const data = await response.json();
                                    console.log('📥 Loaded target plan:', data.plan?.type, 'with', data.plan?.weeks?.length || 0, 'weeks');
                                    setTargetWeeks(data.plan?.weeks || []);
                                    setShowCopyWeekModal(true);
                                    setCurrentWeek(firstWeek);
                                    showMessage('success', `Ready to copy Week ${firstWeek.weekNumber}. Found ${data.plan?.weeks?.length || 0} available weeks.`);
                                  } else {
                                    showMessage('error', 'Failed to load target weeks');
                                  }
                                } catch (error) {
                                  console.error('Error loading target weeks:', error);
                                  showMessage('error', 'An error occurred while loading available weeks');
                                }
                              } else {
                                showMessage('error', 'No week selected to copy');
                              }
                            }}
                            className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex-shrink-0"
                            title="Copy the first week in the displayed range"
                          >
                            Copy
                          </button>

                          {/* Move Button - Move first week in range */}
                          <button
                            onClick={() => {
                              const firstWeek = workoutPlan.weeks?.find((w: any) => w.weekNumber === currentPageStart);
                              if (firstWeek) {
                                setShowMoveWeekModal(true);
                                setCurrentWeek(firstWeek);
                                showMessage('info', `Moving Week ${firstWeek.weekNumber}`);
                              } else {
                                showMessage('error', 'No week selected to move');
                              }
                            }}
                            className="flex items-center gap-1 px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex-shrink-0"
                            title="Move the first week in the displayed range"
                          >
                            Move
                          </button>

                          {/* Overview Button - Show week totals for first week */}
                          <button
                            onClick={() => {
                              const firstWeek = workoutPlan.weeks?.find((w: any) => w.weekNumber === currentPageStart);
                              if (firstWeek) {
                                setCurrentWeek(firstWeek);
                                setShowWeekTotalsModal(true);
                              } else {
                                showMessage('error', 'No week selected for overview');
                              }
                            }}
                            className="flex items-center gap-1 px-4 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors flex-shrink-0"
                            title="View overview and totals for the first week"
                          >
                            Overview
                          </button>

                          {/* Print Button - Print first week */}
                          <button
                            onClick={() => {
                              const firstWeek = workoutPlan.weeks?.find((w: any) => w.weekNumber === currentPageStart);
                              if (firstWeek) {
                                setCurrentWeek(firstWeek);
                                setAutoPrintWeek(true);
                                setShowWeekTotalsModal(true);
                              } else {
                                showMessage('error', 'No week selected to print');
                              }
                            }}
                            className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors flex-shrink-0"
                            title="Print the first week in the displayed range"
                          >
                            Print
                          </button>
                        </div>
                      </div>

                      {/* Right: Next Button */}
                      <button
                        onClick={() => {
                          const totalWeeks = workoutPlan?.weeks?.length || 0;
                          const newStart = Math.min(totalWeeks - weeksPerPage + 1, currentPageStart + weeksPerPage);
                          setCurrentPageStart(newStart);
                        }}
                        disabled={currentPageStart + weeksPerPage > (workoutPlan?.weeks?.length || 0)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          currentPageStart + weeksPerPage > (workoutPlan?.weeks?.length || 0)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {/* Tree View Content */}
                <div className="flex-1 overflow-y-auto">
                  <WorkoutTreeView
                    workoutPlan={
                      // Apply pagination filter for Section A and B
                      (activeSection === 'A' || activeSection === 'B') && workoutPlan
                        ? {
                            ...workoutPlan,
                            weeks: workoutPlan.weeks?.filter((week: any) => {
                              const weekNum = week.weekNumber;
                              return weekNum >= currentPageStart && weekNum < currentPageStart + weeksPerPage;
                            }) || []
                          }
                        : workoutPlan
                    }
                    activeSection={activeSection}
                    onWeekClick={(weekNumber) => {
                      setSelectedWeekForTable(weekNumber);
                      setViewMode('table');
                    }}
                    onDayClick={(day) => {
                      setSelectedDay(day.id);
                      setAddWorkoutDay(day);
                      setSelectedWeekForTable(day.weekNumber);
                      setViewMode('table'); // Switch to table view
                    }}
                  />
                </div>
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
                     : activeSection === 'B' && workoutPlan
                     ? {
                         ...workoutPlan,
                         weeks: workoutPlan.weeks?.filter((week: any) => {
                           const weekNum = week.weekNumber;
                           return weekNum >= currentPageStart && weekNum < currentPageStart + weeksPerPage;
                         }) || []
                       }
                     : workoutPlan
                 }
                 activeSection={activeSection}
                 expandedDays={expandedDays}
                 expandedWorkouts={expandedWorkouts}
                 expandedMoveframeId={autoExpandMoveframeId}
                 onToggleDay={toggleDayExpansion}
                 onToggleWorkout={toggleWorkoutExpansion}
                 onExpandOnlyThisWorkout={handleExpandOnlyThisWorkout}
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
                 onShareDay={(day) => {
                   const dayDate = new Date(day.date).toLocaleDateString('en-US', { 
                     weekday: 'long', 
                     year: 'numeric', 
                     month: 'long', 
                     day: 'numeric' 
                   });
                   
                   let shareText = `📅 Workout Plan for ${dayDate}\n\n`;
                   
                   if (day.workouts && day.workouts.length > 0) {
                     day.workouts.forEach((workout: any, idx: number) => {
                       shareText += `🏋️ Workout ${idx + 1}: ${workout.name || 'Unnamed Workout'}\n`;
                       
                       if (workout.moveframes && workout.moveframes.length > 0) {
                         workout.moveframes.forEach((mf: any) => {
                           shareText += `  • ${mf.sport}: ${mf.description || 'No description'}\n`;
                         });
                       }
                       shareText += '\n';
                     });
                   } else {
                     shareText += 'No workouts planned for this day.\n';
                   }
                   
                   shareText += `\n✨ Created with MovesBook`;
                   
                   // Copy to clipboard
                   navigator.clipboard.writeText(shareText)
                     .then(() => {
                       showMessage('success', 'Workout plan copied to clipboard! You can now paste and share it.');
                     })
                     .catch((error) => {
                       console.error('Error copying to clipboard:', error);
                       // Fallback: show the text in an alert
                       alert(`Copy this workout plan:\n\n${shareText}`);
                       showMessage('info', 'Could not copy automatically. Please copy from the dialog.');
                     });
                 }}
                 onExportPdfDay={(day) => {
                   setDayToPrint(day);
                   setAutoPrintDay(true);
                   setShowDayPrintModal(true);
                 }}
                 onPrintDay={(day) => {
                   setDayToPrint(day);
                   setAutoPrintDay(false);
                   setShowDayPrintModal(true);
                 }}
                onEditWorkout={(workout, day) => {
                  setEditingWorkout(workout);
                  setAddWorkoutDay(day);
                  setShowWorkoutInfoModal(true); // Open info modal
                }}
                onCopyWorkout={(workout, day) => {
                  setCopiedWorkout(workout);
                  setActiveWorkout(workout);
                  setActiveDay(day);
                  modalActions.openCopyWorkoutModal();
                }}
                onPasteWorkout={async (day) => {
                  if (!copiedWorkout) {
                    showMessage('error', 'No workout copied. Please copy a workout first.');
                    return;
                  }
                  
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('/api/workouts/copy', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        sourceWorkoutId: copiedWorkout.id,
                        targetDayId: day.id
                      })
                    });
                    
                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error || 'Failed to paste workout');
                    }
                    
                    showMessage('success', 'Workout pasted successfully');
                    await loadWorkoutData(activeSection);
                  } catch (error: any) {
                    showMessage('error', error.message || 'Failed to paste workout');
                  }
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
                onAddMoveframeAfter={handleAddMoveframeAfter}
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
                  setMovelapInsertIndex(null); // Clear insert index for edit mode
                  modalActions.setMovelapModalMode('edit');
                  modalActions.setShowAddEditMovelapModal(true);
                }}
                onAddMovelap={(moveframe, workout, day) => {
                  setActiveMoveframe(moveframe);
                  setActiveWorkout(workout);
                  setActiveDay(day);
                  setEditingMovelap(null);
                  setMovelapInsertIndex(null); // Clear insert index for regular add
                  modalActions.setMovelapModalMode('add');
                  modalActions.setShowAddEditMovelapModal(true);
                }}
                onAddMovelapAfter={(movelap, index, moveframe, workout, day) => {
                  setActiveMoveframe(moveframe);
                  setActiveWorkout(workout);
                  setActiveDay(day);
                  setEditingMovelap(null);
                  setMovelapInsertIndex(index); // Store the position where to insert (after this index)
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
                        // Refresh workout data to remove deleted workout from view
                        await loadWorkoutData(activeSection);
                      } else {
                        showMessage('error', 'Failed to delete workout');
                      }
                    } catch (error) {
                      console.error('Error deleting workout:', error);
                      showMessage('error', 'Error deleting workout');
                    }
                  }
                }}
                onSaveFavoriteWorkout={async (workout, day) => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('/api/workouts/favorites', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                      },
                      body: JSON.stringify({ workoutId: workout.id })
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      showMessage('success', `"${workout.name}" saved to favorites!`);
                    } else {
                      const error = await response.json();
                      showMessage('error', error.error || 'Failed to save to favorites');
                    }
                  } catch (error) {
                    console.error('Error saving workout to favorites:', error);
                    showMessage('error', 'Error saving workout to favorites');
                  }
                }}
                onShareWorkout={(workout, day) => {
                  // TODO: Implement share functionality
                  showMessage('info', 'Share workout functionality coming soon!');
                  console.log('Share workout:', workout, day);
                }}
                onExportPdfWorkout={(workout, day) => {
                  // TODO: Implement PDF export functionality
                  showMessage('info', 'Export workout to PDF functionality coming soon!');
                  console.log('Export workout PDF:', workout, day);
                }}
                onPrintWorkout={(workout, day) => {
                  // TODO: Implement print functionality
                  showMessage('info', 'Print workout functionality coming soon!');
                  console.log('Print workout:', workout, day);
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
                 reloadWorkouts={async () => {
                   await loadWorkoutData(activeSection);
                 }}
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
                         // Refresh workout data to remove deleted moveframe from view
                         await loadWorkoutData(activeSection);
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
                         // Refresh workout data to remove deleted movelap from view
                         await loadWorkoutData(activeSection);
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
          activeSection={activeSection === 'D' ? 'A' : activeSection as 'A' | 'B' | 'C'}
          onClose={() => {
            modalActions.closeAddWorkoutModal();
            setAddWorkoutDay(null);
            setEditingWorkout(null);
            modalActions.setWorkoutModalMode('add');
          }}
          onEdit={() => {
            // Switch from view mode to edit mode
            setWorkoutModalMode('edit');
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

      {/* Workout Info Modal (Read-only view) */}
      {showWorkoutInfoModal && editingWorkout && addWorkoutDay && (
        <WorkoutInfoModal
          isOpen={showWorkoutInfoModal}
          workout={editingWorkout}
          day={addWorkoutDay}
          onClose={() => {
            setShowWorkoutInfoModal(false);
            setEditingWorkout(null);
            setAddWorkoutDay(null);
          }}
          onEdit={() => {
            // Switch to edit mode
            setShowWorkoutInfoModal(false);
            setWorkoutModalMode('edit');
            modalActions.setShowAddWorkoutModal(true);
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
            setMoveframeInsertIndex(null); // Reset insert index
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
                    type: moveframeData.type,
                    description: moveframeData.description,
                    notes: moveframeData.notes,
                    macroFinal: moveframeData.macroFinal,
                    alarm: moveframeData.alarm
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
                
                // Only create movelaps for non-ANNOTATION types
                if (moveframeData.type !== 'ANNOTATION') {
                  const repsCount = parseInt(moveframeData.repetitions) || 1;
                  
                  // Check if we're using individual planning mode
                  const hasIndividualPlans = moveframeData.planningMode === 'individual' && 
                                            moveframeData.individualPlans && 
                                            moveframeData.individualPlans.length > 0;
                  
                  for (let i = 0; i < repsCount; i++) {
                    // If using individual plans, get values from the specific plan
                    const plan = hasIndividualPlans ? moveframeData.individualPlans[i] : null;
                    
                    movelaps.push({
                      repetitionNumber: i + 1,
                      distance: moveframeData.distance?.toString() || null,
                      speed: plan?.speed || moveframeData.speed || null,
                      style: moveframeData.style || null,
                      pace: moveframeData.pace || null,
                      time: plan?.time || moveframeData.time || null,
                      reps: plan?.reps || moveframeData.reps || null,
                      weight: plan?.weight || null, // For BODY_BUILDING
                      tools: plan?.tools || null, // For tools-based sports
                      r1: moveframeData.r1 || null,
                      r2: moveframeData.r2 || null,
                      muscularSector: moveframeData.muscularSector || null,
                      exercise: moveframeData.exercise || null,
                      restType: null,
                      pause: plan?.pause || moveframeData.pause || null,
                      macroFinal: plan?.macroFinal || moveframeData.macroFinal || null, // Per-movelap macro
                      alarm: moveframeData.alarm || null,
                      sound: moveframeData.sound || null,
                      notes: moveframeData.notes || null,
                      status: 'PENDING',
                      isSkipped: false,
                      isDisabled: false
                    });
                  }
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
                    notes: moveframeData.notes,
                    macroFinal: moveframeData.macroFinal,
                    alarm: moveframeData.alarm,
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
                 
                 // If we have an insert index, reorder the moveframes BEFORE reloading
                 if (moveframeInsertIndex !== null) {
                   console.log('📍 Inserting new moveframe at index:', moveframeInsertIndex);
                   
                   // Fetch fresh workout plan data directly from API
                   const planType = sectionHelpers.getPlanType(activeSection);
                   const planResponse = await fetch(`/api/workouts/plan?type=${planType}`, {
                     headers: {
                       'Authorization': `Bearer ${token}`
                     }
                   });
                   
                   if (planResponse.ok) {
                     const freshPlanData = await planResponse.json();
                     const updatedWorkout = freshPlanData.plan?.weeks
                       ?.flatMap((w: any) => w.days)
                       ?.find((d: any) => d.id === activeDay.id)
                       ?.workouts?.find((w: any) => w.id === activeWorkout.id);
                   
                     if (updatedWorkout && updatedWorkout.moveframes && updatedWorkout.moveframes.length > 1) {
                       const moveframes = [...updatedWorkout.moveframes];
                       const newMoveframeId = result.moveframe.id;
                       
                       // Find the new moveframe
                       const newMoveframeIndex = moveframes.findIndex((mf: any) => mf.id === newMoveframeId);
                       
                       if (newMoveframeIndex !== -1 && newMoveframeIndex !== moveframeInsertIndex) {
                         console.log('📍 Reordering: moving moveframe from position', newMoveframeIndex, 'to', moveframeInsertIndex);
                         
                         // Remove the new moveframe from its current position
                         const [newMoveframe] = moveframes.splice(newMoveframeIndex, 1);
                         
                         // Insert it at the desired position
                         moveframes.splice(moveframeInsertIndex, 0, newMoveframe);
                         
                         // Reassign letters
                         const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                         const reorderedMoveframes = moveframes.map((mf: any, idx: number) => ({
                           id: mf.id,
                           letter: letters[idx] || `${letters[25]}${idx - 25}`
                         }));
                         
                         // Call reorder API
                         const reorderResponse = await fetch('/api/workouts/moveframes/reorder', {
                           method: 'PATCH',
                           headers: {
                             'Content-Type': 'application/json',
                             'Authorization': `Bearer ${token}`
                           },
                           body: JSON.stringify({
                             moveframes: reorderedMoveframes
                           })
                         });
                         
                         if (!reorderResponse.ok) {
                           const errorData = await reorderResponse.json();
                           console.error('❌ Failed to reorder moveframes:', errorData);
                           showMessage('error', 'Failed to reorder moveframes');
                         } else {
                           console.log('✅ Moveframes reordered successfully');
                         }
                       }
                     }
                   }
                   
                   // Reset insert index
                   setMoveframeInsertIndex(null);
                 }
                 
                 showMessage('success', 'Moveframe created successfully');
                 
                 // Reload data to show the final result
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
            setMovelapInsertIndex(null); // Clear insert index on close
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

                // Always reorder based on sequence number or insert index
                if (response.ok) {
                  const newMovelap = await response.json();
                  
                  // Fetch fresh moveframe data with all movelaps
                  const moveframeResponse = await fetch(`/api/workouts/moveframes/${activeMoveframe.id}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });

                  if (moveframeResponse.ok) {
                    const freshMoveframe = await moveframeResponse.json();
                    const allMovelaps = [...freshMoveframe.movelaps];
                    
                    // Find the newly created movelap (it will be at the end)
                    const newMovelapIndex = allMovelaps.findIndex((ml: any) => ml.id === newMovelap.id);
                    
                    if (newMovelapIndex !== -1) {
                      // Remove the new movelap from its current position
                      const [movedMovelap] = allMovelaps.splice(newMovelapIndex, 1);
                      
                      // Determine insertion position
                      let insertPosition;
                      if (movelapInsertIndex !== null) {
                        // Insert after the specified index (for "Add movelap after" button)
                        insertPosition = movelapInsertIndex + 1;
                      } else {
                        // Use sequence number from modal (insert AT that position, pushing others down)
                        insertPosition = (movelapData.repetitionNumber || 1) - 1;
                        if (insertPosition < 0) insertPosition = 0;
                        if (insertPosition > allMovelaps.length) insertPosition = allMovelaps.length;
                      }
                      
                      // Insert at the specified position
                      allMovelaps.splice(insertPosition, 0, movedMovelap);
                      
                      // Update repetitionNumbers for all movelaps and mark the new one
                      const reorderData = allMovelaps.map((ml: any, idx: number) => ({
                        id: ml.id,
                        repetitionNumber: idx + 1,
                        isNewlyAdded: ml.id === newMovelap.id // Mark newly added movelap
                      }));
                      
                      // Call reorder API
                      const reorderResponse = await fetch('/api/workouts/movelaps/reorder', {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ movelaps: reorderData })
                      });
                      
                      if (!reorderResponse.ok) {
                        console.error('Failed to reorder movelaps');
                      }
                    }
                  }
                  
                  // Reset insert index
                  setMovelapInsertIndex(null);
                }
              }

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save movelap');
              }

              showMessage('success', modes.movelapModalMode === 'edit' ? 'Movelap updated successfully' : 'Movelap created successfully');
              
              // Store the IDs we need to keep expanded before clearing states
              const dayIdToExpand = activeDay?.id;
              const workoutIdToExpand = activeWorkout?.id;
              const moveframeIdToExpand = activeMoveframe?.id;
              
              modalActions.setShowAddEditMovelapModal(false);
              setEditingMovelap(null);
              setActiveMoveframe(null);
              setMovelapInsertIndex(null);
              
              // Refresh workout data to show changes
              await loadWorkoutData(activeSection);
              
              // Keep the moveframe expanded after reload
              if (dayIdToExpand && workoutIdToExpand && moveframeIdToExpand) {
                setAutoExpandDayId(dayIdToExpand);
                setAutoExpandWorkoutId(workoutIdToExpand);
                setAutoExpandMoveframeId(moveframeIdToExpand);
                setTimeout(() => {
                  setAutoExpandDayId(null);
                  setAutoExpandWorkoutId(null);
                  setAutoExpandMoveframeId(null);
                }, 500);
              }
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

      {/* Day Print/PDF Export Modal */}
      {showDayPrintModal && dayToPrint && (
        <DayPrintModal
          isOpen={showDayPrintModal}
          onClose={() => {
            setShowDayPrintModal(false);
            setDayToPrint(null);
            setAutoPrintDay(false);
          }}
          day={dayToPrint}
          autoPrint={autoPrintDay}
        />
      )}

      {/* Week Totals Modal (Overview & Print) */}
      {showWeekTotalsModal && currentWeek && (
        <WeekTotalsModal
          isOpen={showWeekTotalsModal}
          onClose={() => {
            setShowWeekTotalsModal(false);
            setCurrentWeek(null);
            setAutoPrintWeek(false);
          }}
          week={currentWeek}
          autoPrint={autoPrintWeek}
        />
      )}

      {/* Copy Week Modal */}
      {showCopyWeekModal && currentWeek && (
        <CopyWeekModal
          isOpen={showCopyWeekModal}
          sourceWeek={currentWeek}
          allWeeks={targetWeeks}
          onClose={() => {
            setShowCopyWeekModal(false);
            setCurrentWeek(null);
            setTargetWeeks([]);
          }}
          onCopy={handleCopyWeek}
        />
      )}

      {/* Move Week Modal - Coming Soon */}
      {showMoveWeekModal && currentWeek && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Move Week</h2>
              <button
                onClick={() => {
                  setShowMoveWeekModal(false);
                  setCurrentWeek(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Move Week {currentWeek.weekNumber} functionality is coming in the next update.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Use the table view Move buttons to move individual days, workouts, moveframes, or movelaps.
            </p>
            <button
              onClick={() => {
                setShowMoveWeekModal(false);
                setCurrentWeek(null);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </DndContext>
   );
}
