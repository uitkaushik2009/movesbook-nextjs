'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SportType } from '@/types';
import WorkoutGrid from './WorkoutGrid';
import WorkoutLeftSidebar from './WorkoutLeftSidebar';
import WorkoutRightSidebar from './WorkoutRightSidebar';
import MoveframeFormModal from './MoveframeFormModal';
import ArchiveModal from './ArchiveModal';
import SaveTemplateModal from './SaveTemplateModal';
import ImportFromCoachModal from './ImportFromCoachModal';
import MarkAsDoneModal from './MarkAsDoneModal';
import PrintWorkoutModal from './PrintWorkoutModal';
import AthleteSelector from './AthleteSelector';
import { X } from 'lucide-react';

interface WorkoutSectionProps {
  onClose: () => void;
}

export default function WorkoutSection({ onClose }: WorkoutSectionProps) {
  const { t } = useLanguage();
  
  // Core state
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [workoutSections, setWorkoutSections] = useState<any[]>([]);
  const [mainSports, setMainSports] = useState<SportType[]>([]);
  const [userType, setUserType] = useState<string>('ATHLETE');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D'>('B');
  
  // Selection state
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [selectedMoveframe, setSelectedMoveframe] = useState<string | null>(null);
  
  // Expansion state
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [expandedMoveframes, setExpandedMoveframes] = useState<Set<string>>(new Set());
  
  // Modal state
  const [showMoveframeModal, setShowMoveframeModal] = useState(false);
  const [editingMoveframe, setEditingMoveframe] = useState<any>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [saveTemplateData, setSaveTemplateData] = useState<any>(null);
  const [saveTemplateType, setSaveTemplateType] = useState<'workout' | 'day'>('workout');
  const [showImportFromCoachModal, setShowImportFromCoachModal] = useState(false);
  const [showMarkAsDoneModal, setShowMarkAsDoneModal] = useState(false);
  const [workoutToMarkDone, setWorkoutToMarkDone] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Drag & drop state
  const [draggedSport, setDraggedSport] = useState<SportType | null>(null);
  
  // Clipboard state
  const [clipboard, setClipboard] = useState<{
    type: 'day' | 'workout' | 'moveframe' | null;
    data: any;
    isCut: boolean;
  }>({ type: null, data: null, isCut: false });
  
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadUserType();
    loadAllData();
  }, []);

  // Reload when athlete changes
  useEffect(() => {
    if (!isLoading) {
      loadWorkoutPlan();
      loadStatistics();
    }
  }, [selectedAthleteId]);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadPeriods(),
      loadWorkoutSections(),
      loadMainSports(),
      loadWorkoutPlan(),
      loadStatistics()
    ]);
    setIsLoading(false);
  };

  const loadUserType = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserType(data.user.userType);
      }
    } catch (error) {
      console.error('Error loading user type:', error);
    }
  };

  const loadWorkoutPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const planTypeMap = {
        'A': 'CURRENT_WEEKS',
        'B': 'YEARLY_PLAN',
        'C': 'WORKOUTS_DONE',
        'D': 'YEARLY_PLAN'
      };
      
      let url = `/api/workouts/plan?type=${planTypeMap[activeSection]}`;
      
      // If coach viewing athlete
      if (selectedAthleteId) {
        url = `/api/coach/athletes/${selectedAthleteId}/workouts`;
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkoutPlan(selectedAthleteId ? data.workoutPlan : data.plan);
      }
    } catch (error) {
      console.error('Error loading workout plan:', error);
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

  const loadWorkoutSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts/sections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkoutSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error loading workout sections:', error);
    }
  };

  const loadMainSports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts/main-sports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMainSports(data.sports || []);
      }
    } catch (error) {
      console.error('Error loading main sports:', error);
      setMainSports(['SWIM', 'BIKE', 'RUN', 'BODY_BUILDING', 'ROWING', 'SKATE'] as SportType[]);
    }
  };

  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // All handlers from the original workout page
  const handleSectionChange = (section: 'A' | 'B' | 'C' | 'D') => {
    setActiveSection(section);
    setSelectedDay(null);
    setSelectedWorkout(null);
    setSelectedMoveframe(null);
    setExpandedDays(new Set());
    setExpandedWorkouts(new Set());
    setExpandedMoveframes(new Set());
    loadWorkoutPlan();
  };

  const handleToggleDay = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  const handleToggleWorkout = (workoutId: string) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedWorkouts(newExpanded);
  };

  const handleToggleMoveframe = (moveframeId: string) => {
    const newExpanded = new Set(expandedMoveframes);
    if (newExpanded.has(moveframeId)) {
      newExpanded.delete(moveframeId);
    } else {
      newExpanded.add(moveframeId);
    }
    setExpandedMoveframes(newExpanded);
  };

  const handleExpandAll = () => {
    const allDays = new Set<string>();
    workoutPlan?.weeks?.forEach((week: any) => {
      week.days?.forEach((day: any) => {
        allDays.add(day.id);
      });
    });
    setExpandedDays(allDays);
  };

  const handleCollapseAll = () => {
    setExpandedDays(new Set());
    setExpandedWorkouts(new Set());
    setExpandedMoveframes(new Set());
  };

  const handleSelectDay = (dayId: string) => {
    setSelectedDay(dayId);
    setSelectedWorkout(null);
    setSelectedMoveframe(null);
  };

  const handleSelectWorkout = (workoutId: string) => {
    setSelectedWorkout(workoutId);
    setSelectedMoveframe(null);
  };

  const handleSelectMoveframe = (moveframeId: string) => {
    setSelectedMoveframe(moveframeId);
  };

  const handleAddWorkout = () => {
    if (!selectedDay) {
      alert('Please select a day first');
      return;
    }
    // Add workout logic here
    alert('Add workout functionality - to be implemented');
  };

  const handleAddMoveframe = () => {
    if (!selectedWorkout) {
      alert('Please select a workout first');
      return;
    }
    setShowMoveframeModal(true);
  };

  const handleRefresh = async () => {
    await loadWorkoutPlan();
    await loadStatistics();
  };

  const handleMoveframeSave = async () => {
    setShowMoveframeModal(false);
    setEditingMoveframe(null);
    await loadWorkoutPlan();
  };

  const handleOpenArchive = () => {
    setShowArchiveModal(true);
  };

  const handleApplyTemplate = async () => {
    await loadWorkoutPlan();
  };

  const handleSaveAsTemplate = async (type: 'workout' | 'day') => {
    let data: any = null;

    if (type === 'day' && selectedDay) {
      workoutPlan?.weeks?.forEach((week: any) => {
        week.days?.forEach((day: any) => {
          if (day.id === selectedDay) data = day;
        });
      });
    } else if (type === 'workout' && selectedWorkout) {
      workoutPlan?.weeks?.forEach((week: any) => {
        week.days?.forEach((day: any) => {
          day.workouts?.forEach((workout: any) => {
            if (workout.id === selectedWorkout) data = workout;
          });
        });
      });
    }

    if (data) {
      setSaveTemplateType(type);
      setSaveTemplateData(data);
      setShowSaveTemplateModal(true);
    } else {
      alert(`Please select a ${type} first`);
    }
  };

  const handleTemplateSaved = async () => {
    console.log('Template saved successfully');
  };

  const handleImportFromCoach = () => {
    setShowImportFromCoachModal(true);
  };

  const handleImportComplete = async () => {
    await loadWorkoutPlan();
  };

  const handleMarkAsDone = () => {
    if (!selectedWorkout) {
      alert('Please select a workout first');
      return;
    }

    let workoutData: any = null;
    workoutPlan?.weeks?.forEach((week: any) => {
      week.days?.forEach((day: any) => {
        day.workouts?.forEach((workout: any) => {
          if (workout.id === selectedWorkout) {
            workoutData = workout;
          }
        });
      });
    });

    if (workoutData) {
      setWorkoutToMarkDone(workoutData);
      setShowMarkAsDoneModal(true);
    }
  };

  const handleSaveMarkAsDone = async (data: any) => {
    if (!workoutToMarkDone) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/sessions/${workoutToMarkDone.id}/mark-done`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('Workout marked as done!');
        setShowMarkAsDoneModal(false);
        setWorkoutToMarkDone(null);
        await loadWorkoutPlan();
        await loadStatistics();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to mark workout as done');
      }
    } catch (error) {
      console.error('Error marking workout as done:', error);
      alert('Failed to mark workout as done');
    }
  };

  const handleSportDragStart = (sport: SportType) => {
    setDraggedSport(sport);
  };

  const handleSportDragEnd = () => {
    setDraggedSport(null);
  };

  const handleWorkoutDrop = async (workoutId: string) => {
    if (!draggedSport) return;
    setSelectedWorkout(workoutId);
    setShowMoveframeModal(true);
    setTimeout(() => setDraggedSport(null), 100);
  };

  const handleWorkoutReorder = async (dayId: string, workouts: any[]) => {
    // Reorder logic here
    console.log('Reorder workouts:', dayId, workouts);
  };

  const handleMoveframeReorder = async (workoutId: string, moveframes: any[]) => {
    // Reorder logic here
    console.log('Reorder moveframes:', workoutId, moveframes);
  };

  const handleCopy = (type: 'day' | 'workout' | 'moveframe') => {
    // Copy logic here
    console.log('Copy:', type);
  };

  const handleCut = (type: 'day' | 'workout' | 'moveframe') => {
    handleCopy(type);
    setClipboard(prev => ({ ...prev, isCut: true }));
  };

  const handlePaste = async () => {
    // Paste logic here
    console.log('Paste');
  };

  const handleSettingsChange = async () => {
    await loadPeriods();
    await loadWorkoutSections();
    await loadMainSports();
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Athlete Selector for Coaches */}
      {['COACH', 'TEAM_MANAGER', 'CLUB_TRAINER'].includes(userType) && (
        <div className="bg-white border-b shadow-sm">
          <AthleteSelector
            selectedAthleteId={selectedAthleteId}
            onSelectAthlete={setSelectedAthleteId}
          />
        </div>
      )}

      {/* Main Workout Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Compact */}
        <div className="w-64 border-r bg-gray-50">
          <WorkoutLeftSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            periods={periods}
            workoutSections={workoutSections}
            mainSports={mainSports}
            onSettingsChange={handleSettingsChange}
            onImportFromCoach={handleImportFromCoach}
            userType={userType}
          />
        </div>
        
        {/* Central Grid */}
        <div className="flex-1 overflow-auto bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('workout_loading')}</p>
              </div>
            </div>
          ) : (
            <WorkoutGrid
              workoutPlan={workoutPlan}
              activeSection={activeSection}
              expandedDays={expandedDays}
              expandedWorkouts={expandedWorkouts}
              expandedMoveframes={expandedMoveframes}
              onToggleDay={handleToggleDay}
              onToggleWorkout={handleToggleWorkout}
              onToggleMoveframe={handleToggleMoveframe}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
              onSelectDay={handleSelectDay}
              onSelectWorkout={handleSelectWorkout}
              onSelectMoveframe={handleSelectMoveframe}
              periods={periods}
              mainSports={mainSports}
              draggedSport={draggedSport}
              onWorkoutDrop={handleWorkoutDrop}
              onWorkoutReorder={handleWorkoutReorder}
              onMoveframeReorder={handleMoveframeReorder}
            />
          )}
        </div>
        
        {/* Right Sidebar - Compact */}
        <div className="w-64 border-l bg-gray-50">
          <WorkoutRightSidebar
            selectedDay={selectedDay}
            selectedWorkout={selectedWorkout}
            selectedMoveframe={selectedMoveframe}
            mainSports={mainSports}
            onAddWorkout={handleAddWorkout}
            onAddMoveframe={handleAddMoveframe}
            onRefresh={handleRefresh}
            onOpenArchive={handleOpenArchive}
            onSaveAsTemplate={handleSaveAsTemplate}
            onSportDragStart={handleSportDragStart}
            onSportDragEnd={handleSportDragEnd}
            onCopy={handleCopy}
            onCut={handleCut}
            onPaste={handlePaste}
            clipboard={clipboard}
            onMarkAsDone={handleMarkAsDone}
            statistics={statistics}
            onPrint={() => setShowPrintModal(true)}
          />
        </div>
      </div>

      {/* Modals */}
      {showMoveframeModal && selectedWorkout && (
        <MoveframeFormModal
          workoutId={selectedWorkout}
          dayId={selectedDay || ''}
          existingMoveframe={editingMoveframe}
          mainSports={mainSports}
          workoutSections={workoutSections}
          periods={periods}
          onClose={() => {
            setShowMoveframeModal(false);
            setEditingMoveframe(null);
          }}
          onSave={handleMoveframeSave}
        />
      )}

      {showArchiveModal && (
        <ArchiveModal
          onClose={() => setShowArchiveModal(false)}
          onApplyTemplate={handleApplyTemplate}
          targetDayId={selectedDay}
        />
      )}

      {showSaveTemplateModal && saveTemplateData && (
        <SaveTemplateModal
          onClose={() => {
            setShowSaveTemplateModal(false);
            setSaveTemplateData(null);
          }}
          onSave={handleTemplateSaved}
          sourceType={saveTemplateType}
          sourceData={saveTemplateData}
        />
      )}

      {showImportFromCoachModal && (
        <ImportFromCoachModal
          onClose={() => setShowImportFromCoachModal(false)}
          onImport={handleImportComplete}
          targetDayId={selectedDay}
        />
      )}

      {showMarkAsDoneModal && workoutToMarkDone && (
        <MarkAsDoneModal
          workoutSession={workoutToMarkDone}
          onClose={() => {
            setShowMarkAsDoneModal(false);
            setWorkoutToMarkDone(null);
          }}
          onSave={handleSaveMarkAsDone}
        />
      )}

      {showPrintModal && (
        <PrintWorkoutModal
          onClose={() => setShowPrintModal(false)}
          selectedDay={selectedDay}
          selectedWorkout={selectedWorkout}
          workoutPlan={workoutPlan}
        />
      )}
    </div>
  );
}

