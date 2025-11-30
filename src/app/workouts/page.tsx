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
  
  // Modal states
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [addWorkoutDay, setAddWorkoutDay] = useState<any>(null);
  const [showAddMoveframeModal, setShowAddMoveframeModal] = useState(false);

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
        <aside className="w-64 bg-gray-900 text-white flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Workout Menu</h2>
          </div>
          
          {/* Workout Sections */}
          <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Sections
            </h3>
            
            <button
              onClick={() => setActiveSection('A')}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                activeSection === 'A'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="font-semibold text-sm">Section A: Current</div>
              <div className="text-xs opacity-75">2-3 Weeks</div>
            </button>
            
            <button
              onClick={() => setActiveSection('B')}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                activeSection === 'B'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="font-semibold text-sm">Section B: Yearly</div>
              <div className="text-xs opacity-75">Full Year</div>
            </button>
            
            <button
              onClick={() => setActiveSection('C')}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                activeSection === 'C'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="font-semibold text-sm">Section C: Done</div>
              <div className="text-xs opacity-75">Diary</div>
            </button>
            
            <button
              onClick={() => setActiveSection('D')}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                activeSection === 'D'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="font-semibold text-sm">Section D: Archive</div>
              <div className="text-xs opacity-75">Templates</div>
            </button>
          </div>
        </aside>
        
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
        <aside className="w-64 bg-gray-50 border-l border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-4 bg-white border-b">
            <h3 className="text-lg font-bold text-gray-800">Workout Tools</h3>
          </div>
          
          <div className="p-4 space-y-3">
            <button 
              onClick={() => selectedDay && setShowAddWorkoutModal(true)}
              disabled={!selectedDay}
              className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${
                selectedDay
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              + Add Workout
            </button>
            
            <button 
              onClick={() => selectedWorkout && setShowAddMoveframeModal(true)}
              disabled={!selectedWorkout}
              className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${
                selectedWorkout
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              + Add Moveframe
            </button>
            
            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              📁 Load from Archive
            </button>
          </div>
          
          <div className="p-4 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Options</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                🔄 Refresh
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                📤 Export
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                📥 Import
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                🖨️ Print
              </button>
            </div>
          </div>
        </aside>
        
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
    </div>
  );
}
