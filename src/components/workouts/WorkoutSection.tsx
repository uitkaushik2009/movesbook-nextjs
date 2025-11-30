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
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
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

  useEffect(() => {
    loadWorkoutData();
    loadPeriods();
  }, [activeSection]);

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
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between border-b">
        <h3 className="text-lg font-semibold">Workout Planning</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-blue-700 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Internal Navbar - Section Tabs */}
      <div className="bg-white border-b border-gray-300 px-4 py-2">
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
          <div className="p-4">
            {/* View Toggle & Quick Actions */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {activeSection === 'A' && 'Current 2-3 Weeks'}
                {activeSection === 'B' && 'Yearly Plan'}
                {activeSection === 'C' && 'Workouts Done'}
                {activeSection === 'D' && 'Archive & Templates'}
              </h2>
              
              <div className="flex gap-2 items-center">
                {/* Quick Action Buttons */}
                <button 
                  onClick={() => setShowAddDayModal(true)}
                  className="px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Day
                </button>
                
                <button 
                  onClick={() => selectedDay && setShowAddWorkoutModal(true)}
                  disabled={!selectedDay}
                  className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors ${
                    selectedDay ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!selectedDay ? 'Select a day first' : 'Add workout to selected day'}
                >
                  <Plus className="w-4 h-4" />
                  Add Workout
                </button>
                
                <button 
                  onClick={() => selectedWorkout && setShowAddMoveframeModal(true)}
                  disabled={!selectedWorkout}
                  className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors ${
                    selectedWorkout ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!selectedWorkout ? 'Select a workout first' : 'Add moveframe to selected workout'}
                >
                  <Plus className="w-4 h-4" />
                  Add Moveframe
                </button>
                
                <div className="w-px h-8 bg-gray-300 mx-2"></div>
                
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
                 onDaySelect={(day) => setSelectedDay(day.id)}
                 onWorkoutSelect={(workoutId) => setSelectedWorkout(workoutId)}
                 onAddWorkoutToDay={(day) => {
                   setAddWorkoutDay(day);
                   setWorkoutModalMode('add');
                   setEditingWorkout(null);
                   setShowAddWorkoutModal(true);
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
                     
                     console.log('Creating plan:', {
                       type: planTypeMap[activeSection],
                       startDate: nextMonday.toISOString(),
                       numberOfWeeks
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
                         numberOfWeeks
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
                 onEditWorkout={(workout, day) => {
                   setEditingWorkout(workout);
                   setAddWorkoutDay(day);
                   setWorkoutModalMode('edit');
                   setShowAddWorkoutModal(true);
                 }}
                 onEditDay={(day) => {
                   console.log('Edit day:', day);
                 }}
                 onAddWorkout={(day) => {
                   setAddWorkoutDay(day);
                   setWorkoutModalMode('add');
                   setEditingWorkout(null);
                   setShowAddWorkoutModal(true);
                 }}
                 onAddMoveframe={(workout) => {
                   setSelectedWorkout(workout.id);
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
      
       {showAddMoveframeModal && selectedWorkout && (
         <AddMoveframeModal
           workoutId={selectedWorkout}
           onClose={() => setShowAddMoveframeModal(false)}
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
     </div>
   );
 }
