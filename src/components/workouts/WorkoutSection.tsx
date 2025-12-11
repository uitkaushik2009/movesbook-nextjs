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

// Components
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
  
  // ==================== MODAL STATES ====================
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [showAddMoveframeModal, setShowAddMoveframeModal] = useState(false);
  const [showEditMoveframeModal, setShowEditMoveframeModal] = useState(false);
  const [showAddMovelapModal, setShowAddMovelapModal] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showEditDayModal, setShowEditDayModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showAthleteSelector, setShowAthleteSelector] = useState(false);
  const [workoutModalMode, setWorkoutModalMode] = useState<'add' | 'edit'>('add');
  const [moveframeModalMode, setMoveframeModalMode] = useState<'add' | 'edit'>('add');
  const [movelapModalMode, setMovelapModalMode] = useState<'add' | 'edit'>('add');
  const [showAddEditMovelapModal, setShowAddEditMovelapModal] = useState(false);
  const [showBulkAddMovelapModal, setShowBulkAddMovelapModal] = useState(false);
  
  // Copy/Move/Export Modals
  const [showCopyDayModal, setShowCopyDayModal] = useState(false);
  const [showMoveDayModal, setShowMoveDayModal] = useState(false);
  const [showCopyWorkoutModal, setShowCopyWorkoutModal] = useState(false);
  const [showMoveWorkoutModal, setShowMoveWorkoutModal] = useState(false);
  const [showCopyMoveframeModal, setShowCopyMoveframeModal] = useState(false);
  const [showMoveMoveframeModal, setShowMoveMoveframeModal] = useState(false);
  const [showColumnSettingsModal, setShowColumnSettingsModal] = useState(false);
  const [columnSettingsTableType, setColumnSettingsTableType] = useState<'day' | 'workout' | 'moveframe' | 'movelap'>('workout');
  const [showExportSharePrint, setShowExportSharePrint] = useState(false);
  const [exportType, setExportType] = useState<'day' | 'week' | 'plan'>('day');
  const [exportId, setExportId] = useState<string>('');

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
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [excludeStretchingFromTotals, setExcludeStretchingFromTotals] = useState(false);

  // Toggle functions for expand/collapse
  const toggleDayExpansion = (dayId: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayId)) {
        newSet.delete(dayId);
      } else {
        newSet.add(dayId);
      }
      return newSet;
    });
  };

  const toggleWorkoutExpansion = (workoutId: string) => {
    setExpandedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  };

  // Auto-expand all days and workouts when plan loads
  useEffect(() => {
    if (workoutPlan && workoutPlan.weeks) {
      const dayIds = new Set<string>();
      const workoutIds = new Set<string>();
      
      workoutPlan.weeks.forEach((week: any) => {
        week.days?.forEach((day: any) => {
          dayIds.add(day.id);
          day.workouts?.forEach((workout: any) => {
            workoutIds.add(workout.id);
          });
        });
      });
      
      setExpandedDays(dayIds);
      setExpandedWorkouts(workoutIds);
    }
  }, [workoutPlan]);

  // ==================== DRAG & DROP STATE ====================
  // Note: activeWorkout and activeMoveframe already defined above for workout context
  const [draggedWorkout, setDraggedWorkout] = useState<any>(null);
  const [draggedMoveframe, setDraggedMoveframe] = useState<any>(null);
  const [dropTarget, setDropTarget] = useState<any>(null);
  const [showDragModal, setShowDragModal] = useState(false);
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
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [showEditMovelapModal, setShowEditMovelapModal] = useState(false);
  
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
    setShowEditDayModal(true);
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
    setWorkoutModalMode('add');
    setEditingWorkout(null);
    setShowAddWorkoutModal(true);
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
    setShowAddMoveframeModal(true);
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
    setShowAddMovelapModal(true);
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
      setShowAddMovelapModal(false);
      
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
      setShowDragModal(true);
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
      setShowDragModal(true);
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
      <div className="bg-blue-600 text-white px-2 py-2 flex items-center justify-between border-b">
        <h3 className="text-lg font-semibold">Workout Planning</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-blue-700 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Internal Navbar - Section Tabs */}
      <div className="bg-white border-b border-gray-300 px-2 py-2">
        <div className="flex items-center gap-2">
          {/* Section Tabs */}
          {['A', 'B', 'C', 'D'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section as 'A' | 'B' | 'C' | 'D')}
              className={`px-4 py-2 rounded-t font-semibold text-sm transition-colors ${
                activeSection === section 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sec {section}: {section === 'A' ? '2-3 Weeks' : section === 'B' ? 'Year' : section === 'C' ? 'Done' : 'Archive'}
            </button>
          ))}
          
          {/* Import Button - Only for sections A & B */}
          {(activeSection === 'A' || activeSection === 'B') && (
            <button
              onClick={() => setShowImportModal(true)}
              className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Import from Coach/Team/Club
            </button>
          )}
        </div>
      </div>

      {/* Workout area - full width */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center - main workout area (full width, no sidebars) */}
        <main className="flex-1 bg-white overflow-y-auto overflow-x-hidden w-full">
          <div className="p-2">
            {/* View Toggle & Quick Actions */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {activeSection === 'A' && 'Current 2-3 Weeks'}
                {activeSection === 'B' && 'Yearly Plan'}
                {activeSection === 'C' && 'Workouts Done'}
                {activeSection === 'D' && 'Archive & Templates'}
              </h2>
              
              <div className="flex gap-2 items-center">
                
                {/* Virtual Start Date for Sections B & C */}
                {(activeSection === 'B' || activeSection === 'C') && (
                  <button 
                    onClick={() => setShowStartDatePicker(true)}
                    className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    {virtualStartDate ? `Start: ${virtualStartDate.toLocaleDateString()}` : 'Set Virtual Start Date'}
                  </button>
                )}
                
                {/* Athlete Selector for Section C (Coaches/Teams/Clubs only) */}
                {activeSection === 'C' && userType && ['COACH', 'TEAM', 'CLUB', 'TEAM_MANAGER', 'CLUB_TRAINER'].includes(userType) && (
                  <button 
                    onClick={() => setShowAthleteSelector(true)}
                    className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {selectedAthlete ? `Viewing: ${selectedAthlete.name}` : 'Select Athlete'}
                  </button>
                )}
                
                
                {/* View Toggle */}
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors ${
                    viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  Table
                </button>
                {activeSection === 'B' && (
                  <button
                    onClick={() => {
                      setViewMode('calendar');
                      setSelectedWeekForTable(null);
                    }}
                    className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors ${
                      viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Calendar
                  </button>
                )}
              </div>
            </div>

            {/* Week Context Header - Show when viewing filtered weeks */}
            {selectedWeekForTable && viewMode === 'table' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    Viewing: Week {selectedWeekForTable - 1} - Week {selectedWeekForTable} - Week {selectedWeekForTable + 1}
                  </span>
                  <span className="text-sm text-blue-700">(3 weeks context)</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedWeekForTable(null);
                    setViewMode('calendar');
                  }}
                  className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  ← Back to Calendar
                </button>
              </div>
            )}

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
                 onEditDay={(day) => {
                   setEditingDay(day);
                   setShowEditDayModal(true);
                 }}
                 onAddWorkout={(day) => {
                   setAddWorkoutDay(day);
                   setWorkoutModalMode('add');
                   setShowAddWorkoutModal(true);
                 }}
                 onCopyDay={(day) => {
                   setCopiedDay(day);
                   setShowCopyDayModal(true);
                 }}
                 onMoveDay={(day) => {
                   setCopiedDay(day);
                   setShowMoveDayModal(true);
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
                   setShowAddWorkoutModal(true);
                 }}
                 onCopyWorkout={(workout, day) => {
                   setCopiedWorkout(workout);
                   setActiveWorkout(workout);
                   setActiveDay(day);
                   setShowCopyWorkoutModal(true);
                 }}
                 onMoveWorkout={(workout, day) => {
                   setCopiedWorkout(workout);
                   setActiveWorkout(workout);
                   setActiveDay(day);
                   setShowMoveWorkoutModal(true);
                 }}
                 onAddMoveframe={(workout, day) => {
                   setActiveWorkout(workout);
                   setActiveDay(day);
                   setSelectedWorkout(workout.id);
                   setSelectedDay(day);
                   setMoveframeModalMode('add');
                   setEditingMoveframe(null);
                   setShowAddMoveframeModal(true);
                 }}
                 onEditMoveframe={(moveframe, workout, day) => {
                   setEditingMoveframe(moveframe);
                   setActiveDay(day);
                   setActiveWorkout(workout);
                   setActiveMoveframe(moveframe);
                   setMoveframeModalMode('edit');
                   setShowAddMoveframeModal(true);
                 }}
                 onEditMovelap={(movelap, moveframe, workout, day) => {
                   setEditingMovelap(movelap);
                   setActiveDay(day);
                   setActiveWorkout(workout);
                   setActiveMoveframe(moveframe);
                   setActiveMovelap(movelap);
                   setMovelapModalMode('edit');
                   setShowAddEditMovelapModal(true);
                 }}
                 onAddMovelap={(moveframe, workout, day) => {
                   setActiveMoveframe(moveframe);
                   setActiveWorkout(workout);
                   setActiveDay(day);
                   setEditingMovelap(null);
                   setMovelapModalMode('add');
                   setShowAddEditMovelapModal(true);
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
                   setShowCopyMoveframeModal(true);
                 }}
                 onMoveMoveframe={(moveframe, workout, day) => {
                   setCopiedMoveframe(moveframe);
                   setActiveWorkout(workout);
                   setActiveDay(day);
                   setShowMoveMoveframeModal(true);
                 }}
                 onOpenColumnSettings={(tableType) => {
                   setColumnSettingsTableType(tableType);
                   setShowColumnSettingsModal(true);
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
      
      {showAddWorkoutModal && addWorkoutDay && workoutModalMode === 'add' && (
        <AddWorkoutModal
          isOpen={showAddWorkoutModal}
          day={addWorkoutDay}
          existingWorkouts={addWorkoutDay.workouts || []}
          onClose={() => {
            setShowAddWorkoutModal(false);
            setAddWorkoutDay(null);
            setEditingWorkout(null);
          }}
          onSave={async (workoutData) => {
            const token = localStorage.getItem('token');
            
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
            
            // Keep day and its parent week expanded
            if (addWorkoutDay) {
              const newExpandedDays = new Set(expandedDays);
              newExpandedDays.add(addWorkoutDay.id);
              setExpandedDays(newExpandedDays);
              
              // Find and expand the parent week
              const parentWeek = workoutPlan?.weeks?.find((week: any) => 
                week.days?.some((day: any) => day.id === addWorkoutDay.id)
              );
              if (parentWeek) {
                const newExpandedWeeks = new Set(expandedWeeks);
                newExpandedWeeks.add(parentWeek.id);
                setExpandedWeeks(newExpandedWeeks);
              }
            }
            
            setShowAddWorkoutModal(false);
            setAddWorkoutDay(null);
            
            // Auto-expand the day to show the new workout
            if (addWorkoutDay) {
              setAutoExpandDayId(addWorkoutDay.id);
              setTimeout(() => setAutoExpandDayId(null), 500); // Clear after expansion
            }
            
            // Show success message
            showMessage('success', 'Workout added successfully');
            
            // Refresh workout data to show the new workout
            await loadWorkoutData(activeSection);
          }}
        />
      )}
      
       {showAddMoveframeModal && activeWorkout && activeDay && (
         <AddEditMoveframeModal
           isOpen={showAddMoveframeModal}
             onClose={() => {
               setShowAddMoveframeModal(false);
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
               }
                
                // Keep workout expanded
               if (activeWorkout) {
                  const newExpandedWorkouts = new Set(expandedWorkouts);
                 newExpandedWorkouts.add(activeWorkout.id);
                  setExpandedWorkouts(newExpandedWorkouts);
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
       
       {showImportModal && (activeSection === 'A' || activeSection === 'B') && (
         <ImportWorkoutsModal
           targetSection={activeSection}
           onClose={() => setShowImportModal(false)}
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
                 setShowImportModal(false);
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
       
      {showAddDayModal && workoutPlan && (
        <AddDayModal
          workoutPlanId={workoutPlan.id}
          onClose={() => setShowAddDayModal(false)}
          onSave={() => {
            setShowAddDayModal(false);
          }}
        />
      )}
      
      {/* Virtual Start Date Modal for Sections B & C */}
      {showStartDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Set Virtual Start Date</h2>
              <button onClick={() => setShowStartDatePicker(false)} className="text-gray-400 hover:text-gray-600">
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
                onClick={() => setShowStartDatePicker(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (virtualStartDate) {
                    setShowStartDatePicker(false);
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
      {showAthleteSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select Athlete</h2>
              <button onClick={() => setShowAthleteSelector(false)} className="text-gray-400 hover:text-gray-600">
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
                      setShowAthleteSelector(false);
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
                  setShowAthleteSelector(false);
                  loadWorkoutData(activeSection); // Reload own data
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                View My Workouts
              </button>
              <button
                onClick={() => setShowAthleteSelector(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Workout Selector Modal - For Adding Moveframe */}
      {showWorkoutSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select Workout for Moveframe</h2>
              <button onClick={() => setShowWorkoutSelector(false)} className="text-gray-400 hover:text-gray-600">
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
                    setShowWorkoutSelector(false);
                    setShowAddMoveframeModal(true);
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
                onClick={() => setShowWorkoutSelector(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      
      {/* Day Selector Modal - For Editing Day Notes/Annotations */}
      {showDaySelector && workoutPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select Day to Edit</h2>
              <button onClick={() => setShowDaySelector(false)} className="text-gray-400 hover:text-gray-600">
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
                            setShowDaySelector(false);
                            setShowEditDayModal(true);
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
                onClick={() => setShowDaySelector(false)}
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
      {showEditDayModal && editingDay && (
        <EditDayModal
          day={editingDay}
          periods={periods}
          onClose={() => {
            setShowEditDayModal(false);
            setEditingDay(null);
          }}
          onSave={async () => {
            setShowEditDayModal(false);
            setEditingDay(null);
            await loadWorkoutData(activeSection);
          }}
          onError={(msg) => showMessage('error', msg)}
          onSuccess={(msg) => showMessage('success', msg)}
        />
      )}

      {/* ==================== ADD MOVELAP MODAL (Extracted Component) ==================== */}
      {showAddMovelapModal && activeMoveframe && activeWorkout && activeDay && (
        <AddMovelapModal
          moveframe={activeMoveframe}
          workout={activeWorkout}
          day={activeDay}
          onClose={() => setShowAddMovelapModal(false)}
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
      {showEditMoveframeModal && editingMoveframe && activeWorkout && activeDay && (
        <EditMoveframeModal
          moveframe={editingMoveframe}
          workout={activeWorkout}
          day={activeDay}
          onClose={() => {
            setShowEditMoveframeModal(false);
            setEditingMoveframe(null);
          }}
          onSave={async () => {
            setShowEditMoveframeModal(false);
            setEditingMoveframe(null);
            await loadWorkoutData(activeSection);
          }}
          onError={(msg) => showMessage('error', msg)}
          onSuccess={(msg) => showMessage('success', msg)}
        />
      )}

      {/* ==================== ADD/EDIT MOVELAP MODAL (New Unified Component) ==================== */}
      {showAddEditMovelapModal && activeMoveframe && (
        <AddEditMovelapModal
          isOpen={showAddEditMovelapModal}
          mode={movelapModalMode}
          moveframe={activeMoveframe}
          existingMovelap={editingMovelap}
          onClose={() => {
            setShowAddEditMovelapModal(false);
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
              if (movelapModalMode === 'edit' && editingMovelap) {
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

              showMessage('success', movelapModalMode === 'edit' ? 'Movelap updated successfully' : 'Movelap created successfully');
              setShowAddEditMovelapModal(false);
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
      {showCopyDayModal && copiedDay && workoutPlan && (
        <CopyDayModal
          isOpen={showCopyDayModal}
          onClose={() => {
            setShowCopyDayModal(false);
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
              setShowCopyDayModal(false);
              setCopiedDay(null);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to copy day');
            }
          }}
        />
      )}

      {/* ==================== MOVE DAY MODAL ==================== */}
      {showMoveDayModal && copiedDay && workoutPlan && (
        <MoveDayModal
          isOpen={showMoveDayModal}
          onClose={() => {
            setShowMoveDayModal(false);
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
              setShowMoveDayModal(false);
              setCopiedDay(null);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to move day');
            }
          }}
        />
      )}

      {/* ==================== COPY WORKOUT MODAL ==================== */}
      {showCopyWorkoutModal && copiedWorkout && workoutPlan && (
        <CopyWorkoutModal
          isOpen={showCopyWorkoutModal}
          onClose={() => {
            setShowCopyWorkoutModal(false);
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
              setShowCopyWorkoutModal(false);
              setCopiedWorkout(null);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to copy workout');
            }
          }}
        />
      )}

      {/* ==================== MOVE WORKOUT MODAL ==================== */}
      {showMoveWorkoutModal && copiedWorkout && workoutPlan && (
        <MoveWorkoutModal
          isOpen={showMoveWorkoutModal}
          onClose={() => {
            setShowMoveWorkoutModal(false);
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
              setShowMoveWorkoutModal(false);
              setCopiedWorkout(null);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to move workout');
            }
          }}
        />
      )}

      {/* ==================== COPY MOVEFRAME MODAL ==================== */}
      {showCopyMoveframeModal && copiedMoveframe && workoutPlan && (
        <CopyMoveframeModal
          isOpen={showCopyMoveframeModal}
          onClose={() => {
            setShowCopyMoveframeModal(false);
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
              setShowCopyMoveframeModal(false);
              setCopiedMoveframe(null);
              await loadWorkoutData(activeSection);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to copy moveframe');
            }
          }}
        />
      )}

      {/* ==================== MOVE MOVEFRAME MODAL ==================== */}
      {showMoveMoveframeModal && copiedMoveframe && activeWorkout && workoutPlan && (
        <MoveMoveframeModal
          isOpen={showMoveMoveframeModal}
          onClose={() => {
            setShowMoveMoveframeModal(false);
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
              setShowMoveMoveframeModal(false);
              setCopiedMoveframe(null);
              await loadWorkoutData(activeSection);
            } catch (error: any) {
              showMessage('error', error.message || 'Failed to move moveframe');
            }
          }}
        />
      )}

      {/* ==================== COLUMN SETTINGS MODAL ==================== */}
      {showColumnSettingsModal && (
        <ColumnSettingsModal
          isOpen={showColumnSettingsModal}
          onClose={() => setShowColumnSettingsModal(false)}
          tableType={columnSettingsTableType}
          visibleColumns={columnSettings.getVisibleColumns(columnSettingsTableType)}
          columnOrder={columnSettings.getColumnOrder(columnSettingsTableType)}
          onSave={(visibleColumns, columnOrder) => {
            columnSettings.updateTableSettings(columnSettingsTableType, visibleColumns, columnOrder);
            showMessage('success', 'Column settings saved');
          }}
          onReset={() => {
            columnSettings.resetTableSettings(columnSettingsTableType);
            showMessage('success', 'Column settings reset to default');
          }}
        />
      )}

      {/* ==================== BULK ADD MOVELAP MODAL ==================== */}
      {showBulkAddMovelapModal && activeMoveframe && activeWorkout && activeDay && (
        <BulkAddMovelapModal
          isOpen={showBulkAddMovelapModal}
          onClose={() => {
            setShowBulkAddMovelapModal(false);
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
              setShowBulkAddMovelapModal(false);
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
          isOpen={showDragModal}
          onClose={() => {
            setShowDragModal(false);
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
