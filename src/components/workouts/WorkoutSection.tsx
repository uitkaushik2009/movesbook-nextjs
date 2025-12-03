'use client';

import { useState, useEffect } from 'react';

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
import WorkoutGrid from '@/components/workouts/WorkoutGrid';
import WorkoutTableView from '@/components/workouts/WorkoutTableView';
import WorkoutCalendarView from '@/components/workouts/WorkoutCalendarView';
import AddWorkoutModal from '@/components/workouts/AddWorkoutModal';
import AddMoveframeModal from '@/components/workouts/AddMoveframeModal';
import ImportWorkoutsModal from '@/components/workouts/ImportWorkoutsModal';
import AddDayModal from '@/components/workouts/AddDayModal';
import EditDayModal from '@/components/workouts/modals/EditDayModal';
import AddMovelapModal from '@/components/workouts/modals/AddMovelapModal';

// Icons
import { X, Download, Plus, List, Table, Calendar } from 'lucide-react';

interface WorkoutSectionProps {
  onClose: () => void;
}

export default function WorkoutSection({ onClose }: WorkoutSectionProps) {
  // ==================== SECTION & VIEW STATE ====================
  const [activeSection, setActiveSection] = useState<SectionId>('A');
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
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
    feedbackMessage,
    showMessage
  } = useWorkoutData({ initialSection: activeSection });
  
  // ==================== MODAL STATES ====================
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [showAddMoveframeModal, setShowAddMoveframeModal] = useState(false);
  const [showAddMovelapModal, setShowAddMovelapModal] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showEditDayModal, setShowEditDayModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showAthleteSelector, setShowAthleteSelector] = useState(false);
  const [workoutModalMode, setWorkoutModalMode] = useState<'add' | 'edit'>('add');
  
  // ==================== SELECTION STATES (Properly Typed) ====================
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [selectedMoveframe, setSelectedMoveframe] = useState<Moveframe | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  
  // Active selections for hierarchical context
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
  const [virtualStartDate, setVirtualStartDate] = useState<Date | null>(null);
  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [showEditMoveframeModal, setShowEditMoveframeModal] = useState(false);
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
  }, [activeSection, loadUserProfile, loadWorkoutData, loadPeriods]);

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
      await loadWorkoutData(activeSection); // Reload to show new movelap
      
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

  return (
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
        <main className="flex-1 bg-white overflow-auto w-full">
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
                  onClick={() => setViewMode('tree')}
                  className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors ${
                    viewMode === 'tree' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Tree
                </button>
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
            ) : viewMode === 'tree' ? (
               <WorkoutGrid 
                 workoutPlan={workoutPlan}
                 activeSection={activeSection}
                 periods={periods}
                 excludeStretchingFromTotals={excludeStretchingFromTotals}
                 setExcludeStretchingFromTotals={setExcludeStretchingFromTotals}
                 onDaySelect={(day) => setSelectedDay(day.id)}
                 onWorkoutSelect={(workoutId) => setSelectedWorkout(workoutId)}
                 onAddWorkoutToDay={(day) => {
                   setAddWorkoutDay(day);
                   setWorkoutModalMode('add');
                   setEditingWorkout(null);
                   setShowAddWorkoutModal(true);
                 }}
                 onEditDay={(day) => {
                   setEditingDay(day);
                   setShowEditDayModal(true);
                 }}
                 onEditWorkout={(workout, day) => {
                   setEditingWorkout(workout);
                   setAddWorkoutDay(day);
                   setWorkoutModalMode('edit');
                   setShowAddWorkoutModal(true);
                 }}
                 expandedWeeks={expandedWeeks}
                 setExpandedWeeks={setExpandedWeeks}
                 expandedDays={expandedDays}
                 setExpandedDays={setExpandedDays}
                 expandedWorkouts={expandedWorkouts}
                 setExpandedWorkouts={setExpandedWorkouts}
                 onCreatePlan={async () => {
                   try {
                     const token = localStorage.getItem('token');
                     const planTypeMap = {
                       'A': 'CURRENT_WEEKS',
                       'B': 'YEARLY_PLAN',
                       'C': 'WORKOUTS_DONE',
                       'D': 'YEARLY_PLAN'
                     };
                     
                     // Get next Monday as start date
                     const today = new Date();
                     const nextMonday = new Date(today);
                     const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
                     nextMonday.setDate(today.getDate() + daysUntilMonday);
                     nextMonday.setHours(0, 0, 0, 0);
                     
                    // Calculate number of weeks based on section
                    const numberOfWeeks = activeSection === 'A' ? 3 : 52; // 3 weeks or full year
                    
                    // For Section A, auto-create all days (Monday-Sunday)
                    const autoCreateDays = activeSection === 'A';
                    
                    console.log('Creating plan:', {
                      type: planTypeMap[activeSection],
                      startDate: nextMonday.toISOString(),
                      numberOfWeeks,
                      autoCreateDays
                    });
                    
                    // Create workout plan
                    const response = await fetch('/api/workouts/plan', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        type: planTypeMap[activeSection],
                        name: `${activeSection === 'A' ? 'Current Weeks' : activeSection === 'B' ? 'Yearly Plan' : activeSection === 'C' ? 'Workouts Done' : 'Archive'} Plan`,
                        startDate: nextMonday.toISOString(),
                        numberOfWeeks,
                        autoCreateDays  // New flag for Section A
                      })
                    });
                     
                     if (response.ok) {
                       const result = await response.json();
                       console.log('Plan created:', result);
                       await loadWorkoutData(); // Reload to show new plan
                     } else {
                       const error = await response.json();
                       console.error('Failed to create plan:', error);
                       alert('Error creating workout plan. Check console for details.');
                     }
                   } catch (error) {
                     console.error('Error creating plan:', error);
                     alert('Error creating workout plan: ' + (error as Error).message);
                   }
                 }}
               />
            ) : (
               <WorkoutTableView
                 workoutPlan={
                   selectedWeekForTable 
                     ? {
                         ...workoutPlan,
                         weeks: workoutPlan.weeks?.filter((week: any) => {
                           const weekNum = week.weekNumber;
                           return weekNum >= selectedWeekForTable - 1 && weekNum <= selectedWeekForTable + 1;
                         }) || []
                       }
                     : workoutPlan
                 }
                 periods={periods}
                 activeSection={activeSection}
                 excludeStretchingFromTotals={excludeStretchingFromTotals}
                 setExcludeStretchingFromTotals={setExcludeStretchingFromTotals}
                 onEditWorkout={(workout, day) => {
                   setEditingWorkout(workout);
                   setAddWorkoutDay(day);
                   setWorkoutModalMode('edit');
                   setShowAddWorkoutModal(true);
                 }}
                onEditDay={(day) => {
                  setEditingDay(day);
                  setShowEditDayModal(true);
                }}
                 onAddWorkout={(day) => {
                   setAddWorkoutDay(day);
                   setWorkoutModalMode('add');
                   setEditingWorkout(null);
                   setShowAddWorkoutModal(true);
                 }}
                 onAddMoveframe={(workout, day) => {
                   setSelectedWorkout(workout.id);
                   setSelectedDay(day);
                   setShowAddMoveframeModal(true);
                 }}
                 onDataChanged={loadWorkoutData}
                 onEditMoveframe={(moveframe, workout, day) => {
                   setEditingMoveframe(moveframe);
                   setActiveDay(day);
                   setActiveWorkout(workout);
                   setActiveMoveframe(moveframe);
                   setShowEditMoveframeModal(true);
                 }}
                 onEditMovelap={(movelap, moveframe, workout, day) => {
                   setEditingMovelap(movelap);
                   setActiveDay(day);
                   setActiveWorkout(workout);
                   setActiveMoveframe(moveframe);
                   setActiveMovelap(movelap);
                   setShowEditMovelapModal(true);
                 }}
                 onAddMovelap={(moveframe, workout, day) => {
                   setActiveDay(day);
                   setActiveWorkout(workout);
                   setActiveMoveframe(moveframe);
                   setShowAddMovelapModal(true);
                 }}
                 setActiveDay={setActiveDay}
                 setActiveWorkout={setActiveWorkout}
                 setActiveMoveframe={setActiveMoveframe}
                 setActiveMovelap={setActiveMovelap}
               />
            )}
          </div>
        </main>
      </div>
      
      {showAddWorkoutModal && addWorkoutDay && (
        <AddWorkoutModal
          dayId={addWorkoutDay.id}
          sessionNumber={editingWorkout?.sessionNumber || (addWorkoutDay.workouts?.length || 0) + 1}
          mode={workoutModalMode}
          existingWorkout={editingWorkout}
          onClose={() => {
            setShowAddWorkoutModal(false);
            setAddWorkoutDay(null);
            setEditingWorkout(null);
          }}
          onSave={async (workoutData) => {
            const token = localStorage.getItem('token');
            const isEdit = workoutModalMode === 'edit' && workoutData.id;
            
            const url = isEdit 
              ? `/api/workouts/sessions?id=${workoutData.id}` 
              : '/api/workouts/sessions';
            
            await fetch(url, {
              method: isEdit ? 'PATCH' : 'POST',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...(isEdit ? {} : { workoutDayId: workoutData.dayId }),
                ...(isEdit ? {} : { sessionNumber: workoutData.sessionNumber }),
                name: workoutData.name,
                code: workoutData.code,
                time: workoutData.time,
                location: workoutData.location,
                notes: workoutData.notes,
                ...(isEdit ? {} : { status: 'PLANNED_FUTURE' })
              })
            });
            
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
            await loadWorkoutData();
            
            // Auto-expand the day to show the new workout
            if (addWorkoutDay && !isEdit) {
              setAutoExpandDayId(addWorkoutDay.id);
              setTimeout(() => setAutoExpandDayId(null), 500); // Clear after expansion
            }
            
            // Show success message
            showMessage('success', `Workout ${isEdit ? 'updated' : 'added'} successfully`);
          }}
        />
      )}
      
       {showAddMoveframeModal && selectedWorkout && selectedDay && (() => {
         // Find the current workout data
         const currentWorkoutData = selectedDay.workouts?.find((w: any) => w.id === selectedWorkout);
         
         return (
           <AddMoveframeModal
             workoutId={selectedWorkout}
             dayData={selectedDay}
             currentWorkoutData={currentWorkoutData}
             onClose={() => {
               setShowAddMoveframeModal(false);
               setSelectedDay(null);
             }}
             onSave={async (moveframeData) => {
             console.log('Creating moveframe with data:', moveframeData);
             
             try {
               const token = localStorage.getItem('token');
               
               // Get or create a default section first
               let sectionId = 'default';
               try {
                 const sectionsResponse = await fetch('/api/workouts/sections', {
                   headers: { 'Authorization': `Bearer ${token}` }
                 });
                 
                 if (sectionsResponse.ok) {
                   const sectionsData = await sectionsResponse.json();
                   if (sectionsData.sections && sectionsData.sections.length > 0) {
                     sectionId = sectionsData.sections[0].id;
                   }
                 }
               } catch (sectionError) {
                 console.warn('Could not fetch sections, using default:', sectionError);
               }
               
               const response = await fetch('/api/workouts/moveframes', {
                 method: 'POST',
                 headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   workoutSessionId: moveframeData.workoutId,
                   sport: moveframeData.sport,
                   type: moveframeData.type || 'STANDARD',
                   description: moveframeData.description || '',
                   sectionId: sectionId,
                   movelaps: [
                     {
                       distance: moveframeData.distance || '',
                       speed: moveframeData.speed || '',
                       reps: parseInt(moveframeData.repetitions) || 1,
                       pause: moveframeData.pause || '',
                       notes: '',
                       status: 'PENDING'  // ✅ FIXED: Changed from 'PLANNED' to 'PENDING'
                     }
                   ]
                 })
               });
               
              if (response.ok) {
                const result = await response.json();
                console.log('Moveframe created successfully:', result);
                
                // Keep workout expanded
                if (selectedWorkout) {
                  const newExpandedWorkouts = new Set(expandedWorkouts);
                  newExpandedWorkouts.add(selectedWorkout);
                  setExpandedWorkouts(newExpandedWorkouts);
                }
                
                setShowAddMoveframeModal(false);
                await loadWorkoutData();
                
                // Auto-expand the day and workout to show the new moveframe
                if (selectedDay && selectedWorkout) {
                  setAutoExpandDayId(selectedDay.id);
                  setAutoExpandWorkoutId(selectedWorkout);
                  setTimeout(() => {
                    setAutoExpandDayId(null);
                    setAutoExpandWorkoutId(null);
                  }, 500); // Clear after expansion
                }
                
                showMessage('success', 'Moveframe added successfully');
               } else {
                 const error = await response.json();
                 console.error('Failed to create moveframe:', error);
                 alert(`Failed to create moveframe: ${error.error || 'Unknown error'}`);
               }
             } catch (error) {
               console.error('Error creating moveframe:', error);
               alert('Error creating moveframe. Check console for details.');
             }
           }}
         />
         );
       })()}
       
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
                 loadWorkoutData();
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
            loadWorkoutData();
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
                      loadWorkoutData(); // Reload data for selected athlete
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
                  loadWorkoutData(); // Reload own data
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
          onSave={() => loadWorkoutData(activeSection)}
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
          onSave={(moveframeId) => {
            // Auto-expand to show the new movelap
            if (activeDay && activeWorkout) {
              setAutoExpandDayId(activeDay.id);
              setAutoExpandWorkoutId(activeWorkout.id);
              setAutoExpandMoveframeId(moveframeId);
              setTimeout(() => {
                setAutoExpandDayId(null);
                setAutoExpandWorkoutId(null);
                setAutoExpandMoveframeId(null);
              }, UI_CONFIG.AUTO_EXPAND_DELAY);
            }
            loadWorkoutData(activeSection);
          }}
          onError={(msg) => showMessage('error', msg)}
          onSuccess={(msg) => showMessage('success', msg)}
        />
      )}
     </div>
   );
 }
