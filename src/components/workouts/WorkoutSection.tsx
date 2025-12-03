'use client';

import { useState, useEffect } from 'react';
import WorkoutGrid from '@/components/workouts/WorkoutGrid';
import WorkoutTableView from '@/components/workouts/WorkoutTableView';
import WorkoutCalendarView from '@/components/workouts/WorkoutCalendarView';
import AddWorkoutModal from '@/components/workouts/AddWorkoutModal';
import AddMoveframeModal from '@/components/workouts/AddMoveframeModal';
import ImportWorkoutsModal from '@/components/workouts/ImportWorkoutsModal';
import AddDayModal from '@/components/workouts/AddDayModal';
import { X, Download, Plus, List, Table, Calendar } from 'lucide-react';

interface WorkoutSectionProps {
  onClose: () => void;
}

export default function WorkoutSection({ onClose }: WorkoutSectionProps) {
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [addWorkoutDay, setAddWorkoutDay] = useState<any>(null);
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [workoutModalMode, setWorkoutModalMode] = useState<'add' | 'edit'>('add');
  const [showAddMoveframeModal, setShowAddMoveframeModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'table' | 'calendar'>('tree');
  const [selectedWeekForTable, setSelectedWeekForTable] = useState<number | null>(null);
  
  // ===== HIERARCHICAL ACTIVE SELECTION SYSTEM =====
  // Track what is currently selected at each level
  const [activeDay, setActiveDay] = useState<any>(null);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [activeMoveframe, setActiveMoveframe] = useState<any>(null);
  const [activeMovelap, setActiveMovelap] = useState<any>(null);
  
  // Preserve expansion states across reloads
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [virtualStartDate, setVirtualStartDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [athleteList, setAthleteList] = useState<any[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [showAthleteSelector, setShowAthleteSelector] = useState(false);
  const [selectedMoveframe, setSelectedMoveframe] = useState<any>(null);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([]);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [editingDay, setEditingDay] = useState<any>(null);
  const [showEditDayModal, setShowEditDayModal] = useState(false);
  const [excludeStretchingFromTotals, setExcludeStretchingFromTotals] = useState(false);
  const [showAddMovelapModal, setShowAddMovelapModal] = useState(false);
  
  // Edit modal states for moveframe and movelap
  const [editingMoveframe, setEditingMoveframe] = useState<any>(null);
  const [editingMovelap, setEditingMovelap] = useState<any>(null);
  const [showEditMoveframeModal, setShowEditMoveframeModal] = useState(false);
  const [showEditMovelapModal, setShowEditMovelapModal] = useState(false);
  
  // Inline feedback message (replaces alert modals)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning', text: string } | null>(null);
  
  // Section-specific settings
  const [userSubscription, setUserSubscription] = useState<{ expiryDate: Date | null, isActive: boolean }>({ expiryDate: null, isActive: true });
  const [managedAthletes, setManagedAthletes] = useState<any[]>([]);
  
  // Helper to show inline message (auto-clears after 4 seconds)
  const showMessage = (type: 'success' | 'error' | 'info' | 'warning', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };
  
  // Check if user can add days based on section
  const canAddDays = () => {
    if (activeSection === 'A') return false; // Section A: days are fixed Mon-Sun for 3 weeks
    if (activeSection === 'D') return false; // Archive: no adding days, just storing
    return true; // B and C can add days
  };
  
  // Check if date is within allowed range for section
  const isDateAllowedForSection = (date: Date) => {
    const today = new Date();
    const maxFutureDays = 365;
    
    if (activeSection === 'A') {
      // Section A: only current 3 weeks
      const threeWeeksAhead = new Date(today);
      threeWeeksAhead.setDate(threeWeeksAhead.getDate() + 21);
      return date >= today && date <= threeWeeksAhead;
    }
    
    if (activeSection === 'B') {
      // Section B: from virtual start date, 365 days ahead
      const startDate = virtualStartDate || today;
      const maxDate = new Date(startDate);
      maxDate.setDate(maxDate.getDate() + maxFutureDays);
      return date >= startDate && date <= maxDate;
    }
    
    if (activeSection === 'C') {
      // Section C: workouts done - limited by subscription
      if (!userSubscription.isActive || !userSubscription.expiryDate) {
        return date <= today; // Can only add past workouts
      }
      return date <= today && date <= userSubscription.expiryDate;
    }
    
    return true;
  };
  
  // Check if user is Coach/Team/Club (affects Section C visibility)
  const isCoachOrTeamOrClub = () => {
    return userType === 'coach' || userType === 'team_trainer' || userType === 'club_trainer';
  };

  useEffect(() => {
    loadUserProfile();
    loadWorkoutData();
    loadPeriods();
    loadWorkoutPreferences();
  }, [activeSection]);

  // Load workout preferences from database
  const loadWorkoutPreferences = async () => {
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
        
        // Load excludeStretchingFromTotals setting
        if (workoutPrefs.excludeStretchingFromTotals !== undefined) {
          setExcludeStretchingFromTotals(workoutPrefs.excludeStretchingFromTotals);
        }
      }
    } catch (error) {
      console.error('Error loading workout preferences:', error);
    }
  };

  // Save excludeStretchingFromTotals to database when it changes
  useEffect(() => {
    const saveExcludeStretchingSetting = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await fetch('/api/user/settings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            workoutPreferences: {
              excludeStretchingFromTotals
            }
          })
        });
      } catch (error) {
        console.error('Error saving excludeStretchingFromTotals setting:', error);
      }
    };

    // Only save after initial load (skip first render)
    if (excludeStretchingFromTotals !== false || document.readyState === 'complete') {
      saveExcludeStretchingSetting();
    }
  }, [excludeStretchingFromTotals]);
  
  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setUserType(userData.userType);
        
        // For Section C, if user is coach/team/club, load their athletes
        if (activeSection === 'C' && ['COACH', 'TEAM', 'CLUB', 'TEAM_MANAGER', 'CLUB_TRAINER'].includes(userData.userType)) {
          await loadAthleteList();
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };
  
  const loadAthleteList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/coach/athletes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAthleteList(data.athletes || []);
      }
    } catch (error) {
      console.error('Error loading athletes:', error);
    }
  };

  const loadWorkoutData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Redirect to login if no token
      if (!token) {
        console.error('❌ No authentication token found. Please log in.');
        window.location.href = '/login';
        return;
      }
      
      const planTypeMap = {
        'A': 'CURRENT_WEEKS',
        'B': 'YEARLY_PLAN',
        'C': 'WORKOUTS_DONE',
        'D': 'YEARLY_PLAN'
      };
      
      console.log('🔄 Loading workout data for section:', activeSection, 'type:', planTypeMap[activeSection]);
      
      const response = await fetch(
        `/api/workouts/plan?type=${planTypeMap[activeSection]}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.status === 401) {
        console.error('❌ Unauthorized. Token may be expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Plan loaded:', data.plan?.id);
        console.log('📊 Number of weeks:', data.plan?.weeks?.length);
        
        // Debug: Check moveframes
        if (data.plan?.weeks) {
          data.plan.weeks.forEach((week: any) => {
            week.days?.forEach((day: any) => {
              day.workouts?.forEach((workout: any) => {
                if (workout.moveframes && workout.moveframes.length > 0) {
                  console.log(`💪 Workout ${workout.id} has ${workout.moveframes.length} moveframes:`, 
                    workout.moveframes.map((mf: any) => `${mf.letter}-${mf.sport}`).join(', ')
                  );
                }
              });
            });
          });
        }
        
        setWorkoutPlan(data.plan);
      } else {
        console.error('❌ Failed to load plan:', response.status);
      }
    } catch (error) {
      console.error('💥 Error loading workout data:', error);
    }
    setIsLoading(false);
  };

  const loadPeriods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts/periods', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPeriods(data.periods || []);
      }
    } catch (error) {
      console.error('Error loading periods:', error);
    }
  };

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
    // Check if day is selected
    if (!activeDay) {
      showMessage('warning', 'Please select a day first to add a workout');
      return;
    }
    
    // Check max 3 workouts per day
    const existingWorkouts = activeDay.workouts || [];
    if (existingWorkouts.length >= 3) {
      showMessage('warning', 'This day already has 3 workouts (max)');
      return;
    }
    
    // All checks passed - open modal
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
    // Check if day is selected
    if (!activeDay) {
      showMessage('warning', 'Please select a day first');
      return;
    }
    
    // Check if workout is selected
    if (!activeWorkout) {
      showMessage('warning', 'Please select a workout first to add a moveframe');
      return;
    }
    
    // All checks passed - open modal
    setSelectedWorkout(activeWorkout.id);
    setSelectedDay(activeDay);
    setShowAddMoveframeModal(true);
  };
  
  /**
   * ADD MOVELAP - Requires active moveframe
   * Creates a movelap (microlap/repetition) inside the selected moveframe
   */
  const handleAddMovelap = () => {
    // Check if moveframe is selected
    if (!activeMoveframe) {
      showMessage('warning', 'Please select a moveframe first to add a movelap');
      return;
    }
    
    // Show Add Movelap modal
    setShowAddMovelapModal(true);
  };
  
  /**
   * Create new movelap via API
   */
  const createMovelap = async (formData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'Please log in first');
        return;
      }
      
      const response = await fetch(`/api/moveframes/${activeMoveframe.id}/movelaps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'APPEND',
          ...formData
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setShowAddMovelapModal(false);
        await loadWorkoutData(); // Reload to show new movelap
        showMessage('success', `Movelap added to ${activeMoveframe.letter || activeMoveframe.code}`);
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to add movelap');
      }
    } catch (error) {
      console.error('Error creating movelap:', error);
      showMessage('error', 'Error creating movelap');
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
          
          {/* Virtual Start Date - Only for sections B & C */}
          {(activeSection === 'B' || activeSection === 'C') && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-gray-500">Start:</span>
              <input
                type="date"
                value={virtualStartDate ? virtualStartDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setVirtualStartDate(e.target.value ? new Date(e.target.value) : null)}
                className="px-2 py-1 text-xs border border-gray-300 rounded"
              />
              {virtualStartDate && (
                <button
                  onClick={() => setVirtualStartDate(null)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              )}
            </div>
          )}
          
          {/* Coach/Team/Club Athlete Selector - Only for section C */}
          {activeSection === 'C' && isCoachOrTeamOrClub() && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-gray-500">Athlete:</span>
              <select
                value={selectedAthlete?.id || ''}
                onChange={(e) => {
                  const athlete = managedAthletes.find(a => a.id === e.target.value);
                  setSelectedAthlete(athlete || null);
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded min-w-[120px]"
              >
                <option value="">Select athlete...</option>
                {managedAthletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name || athlete.username}
                  </option>
                ))}
              </select>
            </div>
          )}
          
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
      
      {/* Inline Feedback Message - replaces alert modals */}
      {feedbackMessage && (
        <div className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
          feedbackMessage.type === 'success' ? 'bg-green-100 text-green-800 border-b border-green-200' :
          feedbackMessage.type === 'error' ? 'bg-red-100 text-red-800 border-b border-red-200' :
          feedbackMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-b border-yellow-200' :
          'bg-blue-100 text-blue-800 border-b border-blue-200'
        }`}>
          <span>
            {feedbackMessage.type === 'success' && '✓'}
            {feedbackMessage.type === 'error' && '✗'}
            {feedbackMessage.type === 'warning' && '⚠'}
            {feedbackMessage.type === 'info' && 'ℹ'}
          </span>
          <span>{feedbackMessage.text}</span>
          <button 
            onClick={() => setFeedbackMessage(null)} 
            className="ml-auto text-xs opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Section-specific Info Banner */}
      {activeSection === 'A' && (
        <div className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs border-b border-blue-100">
          📅 Section A: Current 2-3 weeks — Days are fixed (Mon-Sun). You can only add workouts, moveframes, and movelaps.
        </div>
      )}
      {activeSection === 'B' && (
        <div className="px-4 py-1.5 bg-purple-50 text-purple-700 text-xs border-b border-purple-100">
          📆 Section B: Yearly Plan — Up to 365 days from {virtualStartDate ? virtualStartDate.toLocaleDateString() : 'start date'}. Set a virtual start date above.
        </div>
      )}
      {activeSection === 'C' && !isCoachOrTeamOrClub() && (
        <div className="px-4 py-1.5 bg-green-50 text-green-700 text-xs border-b border-green-100">
          ✅ Section C: Workouts Done — Record completed workouts. Limited by your subscription expiry date.
        </div>
      )}
      {activeSection === 'C' && isCoachOrTeamOrClub() && (
        <div className="px-4 py-1.5 bg-orange-50 text-orange-700 text-xs border-b border-orange-100">
          👥 Section C (Coach/Team/Club View): Select an athlete to view their completed workouts (requires permission).
        </div>
      )}
      {activeSection === 'D' && (
        <div className="px-4 py-1.5 bg-gray-50 text-gray-700 text-xs border-b border-gray-100">
          📦 Archive: Store workouts and weeks as templates for future use. No new days can be added here.
        </div>
      )}

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
                       showMessage('error', 'Error creating workout plan');
                     }
                   } catch (error) {
                     console.error('Error creating plan:', error);
                     showMessage('error', 'Error creating workout plan');
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
                 onAddMovelap={(moveframe, workout, day) => {
                   // Set the context directly from the parameters
                   setActiveDay(day);
                   setActiveWorkout(workout);
                   setActiveMoveframe(moveframe);
                   setShowAddMovelapModal(true);
                 }}
                 onEditMoveframe={(moveframe, workout, day) => {
                   setActiveDay(day);
                   setActiveWorkout(workout);
                   setActiveMoveframe(moveframe);
                   setEditingMoveframe(moveframe);
                   setShowEditMoveframeModal(true);
                 }}
                 onEditMovelap={(movelap, moveframe, workout, day) => {
                   setActiveDay(day);
                   setActiveWorkout(workout);
                   setActiveMoveframe(moveframe);
                   setActiveMovelap(movelap);
                   setEditingMovelap(movelap);
                   setShowEditMovelapModal(true);
                 }}
                 onDataChanged={loadWorkoutData}
                 setActiveDay={setActiveDay}
                 setActiveWorkout={setActiveWorkout}
                 setActiveMoveframe={setActiveMoveframe}
                 setActiveMovelap={setActiveMovelap}
                 onEditDayClick={handleEditDay}
                 onAddWorkoutClick={handleAddWorkout}
                 onAddMoveframeClick={handleAddMoveframe}
                 onAddMovelapClick={handleAddMovelap}
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
            loadWorkoutData();
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
                 
                 showMessage('success', 'Moveframe added successfully');
               } else {
                 const error = await response.json();
                 console.error('Failed to create moveframe:', error);
                 showMessage('error', error.error || 'Failed to create moveframe');
               }
             } catch (error) {
               console.error('Error creating moveframe:', error);
               showMessage('error', 'Error creating moveframe');
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
                 showMessage('success', `Imported ${workouts.length} workout(s)`);
               } else {
                 showMessage('error', 'Failed to import workouts');
               }
             } catch (error) {
               console.error('Error importing workouts:', error);
               showMessage('error', 'Error importing workouts');
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
      
      {/* Edit Day Modal - Edit day metadata (date, period, weather, feeling, notes) */}
      {showEditDayModal && editingDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Day Metadata</h2>
                <p className="text-sm text-gray-500">
                  Modify day information (does not affect workouts, moveframes, or movelaps)
                </p>
              </div>
              <button onClick={() => setShowEditDayModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newDate = formData.get('date') as string;
              const periodId = formData.get('periodId') as string;
              
              try {
                // Validate date uniqueness (check if another day has this date)
                const allDays = workoutPlan?.weeks?.flatMap((week: any) => week.days || []) || [];
                const duplicateDay = allDays.find((d: any) => 
                  d.id !== editingDay.id && 
                  new Date(d.date).toDateString() === new Date(newDate).toDateString()
                );
                
                if (duplicateDay) {
                  showMessage('warning', 'A workout day already exists for this date');
                  return;
                }
                
                // Calculate week number and day of week from the new date
                const selectedDate = new Date(newDate);
                const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay(); // Monday=1, Sunday=7
                
                // Calculate week number (you may need to adjust based on your yearly start date logic)
                // For now, using a simple calculation
                const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
                const weekNumber = Math.ceil((((selectedDate.getTime() - yearStart.getTime()) / 86400000) + yearStart.getDay() + 1) / 7);
                
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/workouts/days/${editingDay.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    date: newDate,
                    periodId: periodId || editingDay.periodId,
                    weather: formData.get('weather'),
                    feelingStatus: formData.get('feelingStatus'),
                    notes: formData.get('notes')
                  })
                });
                
                if (response.ok) {
                  setShowEditDayModal(false);
                  setEditingDay(null);
                  await loadWorkoutData(); // Reload to show changes and reorder
                  showMessage('success', 'Day updated successfully');
                } else {
                  const error = await response.json();
                  showMessage('error', error.error || 'Failed to update day');
                }
              } catch (error) {
                console.error('Error updating day:', error);
                showMessage('error', 'Error updating day');
              }
            }} className="space-y-4">
              
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={editingDay.date ? new Date(editingDay.date).toISOString().split('T')[0] : ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Changing the date will auto-update week number and day of week
                </p>
              </div>
              
              {/* Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period <span className="text-red-500">*</span>
                </label>
                <select
                  name="periodId"
                  defaultValue={editingDay.periodId || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a period...</option>
                  {periods.map((period: any) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  The period determines the color and context of this day
                </p>
              </div>
              
              {/* Auto-calculated fields (read-only display) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Auto-Calculated Fields</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium text-blue-700">Week Number:</span>
                    <span className="ml-1 text-blue-600">{editingDay.weekNumber || 'Auto'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Day of Week:</span>
                    <span className="ml-1 text-blue-600">
                      {editingDay.dayOfWeek ? ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][editingDay.dayOfWeek] : 'Auto'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  These values are automatically calculated from the date
                </p>
              </div>
              
              {/* Weather */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weather
                </label>
                <input
                  type="text"
                  name="weather"
                  defaultValue={editingDay.weather || ''}
                  placeholder="Sunny, Rainy, Cloudy, Windy, etc."
                  list="weather-suggestions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <datalist id="weather-suggestions">
                  <option value="Sunny" />
                  <option value="Cloudy" />
                  <option value="Rainy" />
                  <option value="Windy" />
                  <option value="Snowy" />
                  <option value="Foggy" />
                  <option value="Hot" />
                  <option value="Cold" />
                </datalist>
              </div>
              
              {/* Feeling/Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feeling Status
                </label>
                <select
                  name="feelingStatus"
                  defaultValue={editingDay.feelingStatus || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select feeling --</option>
                  <option value="Excellent">😊 Excellent</option>
                  <option value="Very Good">🙂 Very Good</option>
                  <option value="Good">👍 Good</option>
                  <option value="Average">😐 Average</option>
                  <option value="Tired">😓 Tired</option>
                  <option value="Exhausted">😩 Exhausted</option>
                  <option value="Strong">💪 Strong</option>
                  <option value="Weak">😢 Weak</option>
                  <option value="Sore">🤕 Sore</option>
                  <option value="Energetic">⚡ Energetic</option>
                  <option value="Motivated">🔥 Motivated</option>
                  <option value="Stressed">😰 Stressed</option>
                  <option value="Relaxed">😌 Relaxed</option>
                </select>
              </div>
              
              {/* Notes / Annotations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / Annotations
                </label>
                <textarea
                  name="notes"
                  defaultValue={editingDay.notes || ''}
                  placeholder="Add any notes, observations, or annotations for this day..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
              </div>
              
              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Note:</strong> Editing day metadata does <strong>not</strong> modify workouts, moveframes, or movelaps. It only updates day-level information.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditDayModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Movelap Modal */}
      {showAddMovelapModal && activeMoveframe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Movelap</h2>
                <p className="text-sm text-gray-500">
                  Adding to moveframe "{activeMoveframe.letter || activeMoveframe.code}" ({activeMoveframe.sport})
                </p>
              </div>
              <button onClick={() => setShowAddMovelapModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createMovelap({
                distance: formData.get('distance'),
                speedCode: formData.get('speedCode'),
                style: formData.get('style'),
                pace: formData.get('pace'),
                time: formData.get('time'),
                pause: formData.get('pause'),
                restType: formData.get('restType') || null,
                notes: formData.get('notes')
              });
            }} className="space-y-4">
              
              {/* Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (meters)
                </label>
                <input
                  type="number"
                  name="distance"
                  placeholder="e.g., 100, 200, 400"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Speed Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed Code
                </label>
                <select
                  name="speedCode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select speed...</option>
                  <option value="A1">A1 - Recovery</option>
                  <option value="A2">A2 - Aerobic Base</option>
                  <option value="B1">B1 - Tempo</option>
                  <option value="B2">B2 - Threshold</option>
                  <option value="C1">C1 - VO2max</option>
                  <option value="C2">C2 - Anaerobic</option>
                  <option value="D">D - Sprint</option>
                </select>
              </div>
              
              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style
                </label>
                <input
                  type="text"
                  name="style"
                  placeholder="e.g., Freestyle, Backstroke, Easy, Hard"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Time and Pace - Side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    name="time"
                    placeholder="e.g., 01:30, 00:45"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pace
                  </label>
                  <input
                    type="text"
                    name="pace"
                    placeholder="e.g., 1:30/100m"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Pause/Rest */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rest Type
                  </label>
                  <select
                    name="restType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type...</option>
                    <option value="SET_TIME">Set Time</option>
                    <option value="RESTART_TIME">Restart Time</option>
                    <option value="RESTART_PULSE">Restart at Pulse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pause
                  </label>
                  <input
                    type="text"
                    name="pause"
                    placeholder="e.g., 00:20, 00:30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  placeholder="Optional notes for this lap..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Tip:</strong> This will add a new lap at the end of the movelaps list. You can reorder laps later.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddMovelapModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  ➕ Add Movelap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Moveframe Modal */}
      {showEditMoveframeModal && editingMoveframe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Moveframe</h2>
                <p className="text-sm text-gray-500">
                  Editing moveframe "{editingMoveframe.letter || editingMoveframe.code}" ({editingMoveframe.sport})
                </p>
              </div>
              <button onClick={() => setShowEditMoveframeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/workouts/moveframes/${editingMoveframe.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    description: formData.get('description'),
                    distance: formData.get('distance'),
                    repetitions: formData.get('repetitions'),
                    pause: formData.get('pause'),
                  })
                });
                
                if (response.ok) {
                  setShowEditMoveframeModal(false);
                  await loadWorkoutData();
                  showMessage('success', 'Moveframe updated successfully');
                } else {
                  const error = await response.json();
                  showMessage('error', error.error || 'Failed to update moveframe');
                }
              } catch (error) {
                console.error('Error updating moveframe:', error);
                showMessage('error', 'Error updating moveframe');
              }
            }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  defaultValue={editingMoveframe.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (m)</label>
                  <input
                    type="number"
                    name="distance"
                    defaultValue={editingMoveframe.distance || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repetitions</label>
                  <input
                    type="number"
                    name="repetitions"
                    defaultValue={editingMoveframe.repetitions || editingMoveframe.totalReps || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rest/Pause</label>
                <input
                  type="text"
                  name="pause"
                  defaultValue={editingMoveframe.pause || editingMoveframe.macroRest || ''}
                  placeholder="e.g., 00:30, 1:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditMoveframeModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Movelap Modal */}
      {showEditMovelapModal && editingMovelap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Movelap</h2>
                <p className="text-sm text-gray-500">
                  Editing lap #{editingMovelap.index || editingMovelap.repetitionNumber || 1}
                </p>
              </div>
              <button onClick={() => setShowEditMovelapModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/workouts/movelaps/${editingMovelap.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    distance: formData.get('distance'),
                    speedCode: formData.get('speedCode'),
                    style: formData.get('style'),
                    pace: formData.get('pace'),
                    time: formData.get('time'),
                    pause: formData.get('pause'),
                    notes: formData.get('notes')
                  })
                });
                
                if (response.ok) {
                  setShowEditMovelapModal(false);
                  await loadWorkoutData();
                  showMessage('success', 'Movelap updated successfully');
                } else {
                  const error = await response.json();
                  showMessage('error', error.error || 'Failed to update movelap');
                }
              } catch (error) {
                console.error('Error updating movelap:', error);
                showMessage('error', 'Error updating movelap');
              }
            }} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (m)</label>
                  <input
                    type="number"
                    name="distance"
                    defaultValue={editingMovelap.distance || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speed Code</label>
                  <select
                    name="speedCode"
                    defaultValue={editingMovelap.speedCode || editingMovelap.speed || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select speed...</option>
                    <option value="A1">A1 - Recovery</option>
                    <option value="A2">A2 - Aerobic Base</option>
                    <option value="B1">B1 - Tempo</option>
                    <option value="B2">B2 - Threshold</option>
                    <option value="C1">C1 - VO2max</option>
                    <option value="C2">C2 - Anaerobic</option>
                    <option value="D">D - Sprint</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                  <input
                    type="text"
                    name="style"
                    defaultValue={editingMovelap.style || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    name="time"
                    defaultValue={editingMovelap.time || ''}
                    placeholder="e.g., 01:30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pace</label>
                  <input
                    type="text"
                    name="pace"
                    defaultValue={editingMovelap.pace || ''}
                    placeholder="e.g., 1:30/100m"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pause/Rest</label>
                  <input
                    type="text"
                    name="pause"
                    defaultValue={editingMovelap.pause || ''}
                    placeholder="e.g., 00:20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingMovelap.notes || ''}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditMovelapModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
     </div>
   );
}
