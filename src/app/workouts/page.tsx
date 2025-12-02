'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import ModernNavbar from '@/components/ModernNavbar';
import SimpleFooter from '@/components/SimpleFooter';
import WorkoutGrid from '@/components/workouts/WorkoutGrid';
import AddWorkoutModal from '@/components/workouts/AddWorkoutModal';
import AddMoveframeModal from '@/components/workouts/AddMoveframeModal';
import WorkoutRightSidebar from '@/components/workouts/WorkoutRightSidebar';
import WorkoutLeftSidebar from '@/components/workouts/WorkoutLeftSidebar';
import WorkoutHierarchyGuide from '@/components/workouts/WorkoutHierarchyGuide';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function WorkoutsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  // Active section: A (Current 2-3 weeks), B (Yearly), C (Done), D (Archive)
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D'>('B');
  
  // Data states
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Selection states
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [selectedMoveframe, setSelectedMoveframe] = useState<string | null>(null);
  const [selectedMovelap, setSelectedMovelap] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<'day' | 'workout' | 'moveframe' | 'movelap' | null>(null);
  
  // Modal states
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [addWorkoutDay, setAddWorkoutDay] = useState<any>(null);
  const [showAddMoveframeModal, setShowAddMoveframeModal] = useState(false);
  const [excludeStretchingFromTotals, setExcludeStretchingFromTotals] = useState(false);
  const [showHierarchyGuide, setShowHierarchyGuide] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadWorkoutData();
      loadPeriods();
    }
  }, [user, activeSection]);

  const loadWorkoutData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const planTypeMap = {
        'A': 'CURRENT_WEEKS',
        'B': 'YEARLY_PLAN',
        'C': 'WORKOUTS_DONE',
        'D': 'YEARLY_PLAN' // Archive uses yearly structure
      };
      
      const response = await fetch(
        `/api/workouts/plan?type=${planTypeMap[activeSection]}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setWorkoutPlan(data.plan);
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (loading || !user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ModernNavbar />
      
      {/* Main Workout Area - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR - Workout Menu */}
        <WorkoutLeftSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onAddNewDay={() => console.log('Add new day')}
          onAddWorkout={() => selectedDay && setShowAddWorkoutModal(true)}
          onAddMoveframe={() => selectedWorkout && setShowAddMoveframeModal(true)}
          onOpenSettings={() => console.log('Open settings')}
          onOpenHierarchyGuide={() => setShowHierarchyGuide(true)}
        />
        
        {/* CENTER - Main Workout Grid */}
        <main className="flex-1 bg-white overflow-auto">
          <div className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading workouts...</p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  {activeSection === 'A' && 'Current 2-3 Weeks'}
                  {activeSection === 'B' && 'Yearly Plan'}
                  {activeSection === 'C' && 'Workouts Done'}
                  {activeSection === 'D' && 'Archive & Templates'}
                </h1>
                
                {/* Workout Grid */}
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
                    setShowAddWorkoutModal(true);
                  }}
                />
              </div>
            )}
          </div>
        </main>
        
        {/* RIGHT SIDEBAR - Workout Tools */}
        <WorkoutRightSidebar
          activeLevel={activeLevel}
          selectedDay={selectedDay ? { id: selectedDay } : undefined}
          selectedWorkout={selectedWorkout ? { id: selectedWorkout } : undefined}
          selectedMoveframe={selectedMoveframe ? { id: selectedMoveframe } : undefined}
          selectedMovelap={selectedMovelap ? { id: selectedMovelap } : undefined}
          onAddWorkout={() => selectedDay && setShowAddWorkoutModal(true)}
          onAddMoveframe={() => selectedWorkout && setShowAddMoveframeModal(true)}
        />
        
      </div>
      
      <SimpleFooter />
      
      {/* Modals */}
      {showAddWorkoutModal && addWorkoutDay && (
        <AddWorkoutModal
          dayId={addWorkoutDay.id}
          sessionNumber={(addWorkoutDay.workouts?.length || 0) + 1}
          onClose={() => {
            setShowAddWorkoutModal(false);
            setAddWorkoutDay(null);
          }}
          onSave={async (workoutData) => {
    try {
      const token = localStorage.getItem('token');
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
                  time: workoutData.time,
                  location: workoutData.location,
                  notes: workoutData.notes,
                  status: 'PLANNED_FUTURE'
        })
      });
      
      if (response.ok) {
                setShowAddWorkoutModal(false);
                setAddWorkoutDay(null);
                loadWorkoutData(); // Reload data
      }
    } catch (error) {
      console.error('Error adding workout:', error);
    }
          }}
        />
      )}
      
      {showAddMoveframeModal && selectedWorkout && (
        <AddMoveframeModal
          workoutId={selectedWorkout}
          onClose={() => setShowAddMoveframeModal(false)}
          onSave={async (moveframeData) => {
    try {
      const token = localStorage.getItem('token');
        const response = await fetch('/api/workouts/moveframes', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
                  workoutSessionId: moveframeData.workoutId,
                  sport: moveframeData.sport,
                  type: moveframeData.type,
                  description: moveframeData.description,
                  sectionId: 'default-section-id' // You'll need to get this from settings
          })
        });

              if (response.ok) {
                setShowAddMoveframeModal(false);
                loadWorkoutData(); // Reload data
      }
    } catch (error) {
              console.error('Error adding moveframe:', error);
            }
          }}
        />
      )}
      
      {/* Hierarchy Guide Modal */}
      {showHierarchyGuide && (
        <WorkoutHierarchyGuide
          onClose={() => setShowHierarchyGuide(false)}
        />
      )}
    </div>
  );
}
