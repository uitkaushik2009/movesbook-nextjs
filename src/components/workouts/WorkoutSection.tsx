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
                 
                 alert('Moveframe added successfully!');
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
      {showEditDayModal && editingDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Day</h2>
                <p className="text-sm text-gray-500">
                  {new Date(editingDay.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowEditDayModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/workouts/days/${editingDay.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    notes: formData.get('notes'),
                    weather: formData.get('weather'),
                    feelingStatus: formData.get('feelingStatus'),
                    periodId: editingDay.periodId // Keep existing period
                  })
                });
                
                if (response.ok) {
                  setShowEditDayModal(false);
                  setEditingDay(null);
                  await loadWorkoutData(); // Reload to show changes
                  alert('Day updated successfully!');
                } else {
                  alert('Failed to update day');
                }
              } catch (error) {
                console.error('Error updating day:', error);
                alert('Error updating day');
              }
            }} className="space-y-4">
              
              {/* Weather */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weather
                </label>
                <input
                  type="text"
                  name="weather"
                  defaultValue={editingDay.weather || ''}
                  placeholder="Sunny, Rainy, Cloudy, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Feeling/Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feeling (1-10)
                </label>
                <select
                  name="feelingStatus"
                  defaultValue={editingDay.feelingStatus || '5'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1">1 - Very Poor</option>
                  <option value="2">2 - Poor</option>
                  <option value="3">3 - Below Average</option>
                  <option value="4">4 - Below Average</option>
                  <option value="5">5 - Average</option>
                  <option value="6">6 - Above Average</option>
                  <option value="7">7 - Good</option>
                  <option value="8">8 - Very Good</option>
                  <option value="9">9 - Excellent</option>
                  <option value="10">10 - Perfect</option>
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
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use this field to store day annotations, training observations, how you felt, etc.
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
     </div>
   );
 }
