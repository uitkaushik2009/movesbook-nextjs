'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { SportType } from '@/types';
import ModernNavbar from '@/components/ModernNavbar';
import SimpleFooter from '@/components/SimpleFooter';
import WorkoutGrid from '@/components/workouts/WorkoutGrid';
import WorkoutLeftSidebar from '@/components/workouts/WorkoutLeftSidebar';
import WorkoutRightSidebar from '@/components/workouts/WorkoutRightSidebar';
import MoveframeFormModal from '@/components/workouts/MoveframeFormModal';
import ArchiveModal from '@/components/workouts/ArchiveModal';
import SaveTemplateModal from '@/components/workouts/SaveTemplateModal';
import AthleteSelector from '@/components/workouts/AthleteSelector';
import ImportFromCoachModal from '@/components/workouts/ImportFromCoachModal';
import MarkAsDoneModal from '@/components/workouts/MarkAsDoneModal';
import PrintWorkoutModal from '@/components/workouts/PrintWorkoutModal';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default function WorkoutsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  // Section state (A, B, C, D)
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D'>('B');
  
  // Workout plan data
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [workoutSections, setWorkoutSections] = useState<any[]>([]);
  const [mainSports, setMainSports] = useState<SportType[]>([]);
  const [userType, setUserType] = useState<string>('ATHLETE');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  
  // Expansion state
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [expandedMoveframes, setExpandedMoveframes] = useState<Set<string>>(new Set());
  
  // Selection state
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [selectedMoveframe, setSelectedMoveframe] = useState<string | null>(null);
  
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
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Drag & drop state
  const [draggedSport, setDraggedSport] = useState<SportType | null>(null);
  const [draggedWorkout, setDraggedWorkout] = useState<any | null>(null);
  const [draggedMoveframe, setDraggedMoveframe] = useState<any | null>(null);

  // Clipboard state for copy/paste
  const [clipboard, setClipboard] = useState<{
    type: 'day' | 'workout' | 'moveframe' | null;
    data: any;
    isCut: boolean; // true for move (cut), false for copy
  }>({ type: null, data: null, isCut: false });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Load workout plan when section changes
  useEffect(() => {
    if (user) {
      loadWorkoutPlan();
    }
  }, [activeSection, user]);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadPeriods(),
      loadWorkoutSections(),
      loadMainSports(),
      loadWorkoutPlan()
    ]);
    setIsLoading(false);
  };

  const loadWorkoutPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const planTypeMap = {
        'A': 'CURRENT_WEEKS',
        'B': 'YEARLY_PLAN',
        'C': 'WORKOUTS_DONE',
        'D': 'YEARLY_PLAN' // Use yearly plan for archive view
      };
      
      const response = await fetch(
        `/api/workouts/plan?type=${planTypeMap[activeSection]}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setWorkoutPlan(data.plan);
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
      // Default sports if API fails
      setMainSports(['SWIM', 'BIKE', 'RUN', 'BODY_BUILDING', 'ROWING', 'SKATE'] as SportType[]);
    }
  };

  // Section change handler
  const handleSectionChange = (section: 'A' | 'B' | 'C' | 'D') => {
    setActiveSection(section);
    // Clear selections when changing sections
    setSelectedDay(null);
    setSelectedWorkout(null);
    setSelectedMoveframe(null);
    // Clear expansions
    setExpandedDays(new Set());
    setExpandedWorkouts(new Set());
    setExpandedMoveframes(new Set());
  };

  // Expansion handlers
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
    if (!workoutPlan?.weeks) return;
    
    const allDays = new Set<string>();
    const allWorkouts = new Set<string>();
    const allMoveframes = new Set<string>();
    
    workoutPlan.weeks.forEach((week: any) => {
      week.days?.forEach((day: any) => {
        allDays.add(day.id);
        day.workouts?.forEach((workout: any) => {
          allWorkouts.add(workout.id);
          workout.moveframes?.forEach((moveframe: any) => {
            allMoveframes.add(moveframe.id);
          });
        });
      });
    });
    
    setExpandedDays(allDays);
    setExpandedWorkouts(allWorkouts);
    setExpandedMoveframes(allMoveframes);
  };

  const handleCollapseAll = () => {
    setExpandedDays(new Set());
    setExpandedWorkouts(new Set());
    setExpandedMoveframes(new Set());
  };

  // Selection handlers
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

  // Add workout handler
  const handleAddWorkout = async () => {
    if (!selectedDay) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // Find the selected day to get details
      let dayData: any = null;
      workoutPlan.weeks?.forEach((week: any) => {
        week.days?.forEach((day: any) => {
          if (day.id === selectedDay) {
            dayData = day;
          }
        });
      });
      
      if (!dayData) return;
      
      // Check max 3 workouts per day
      const existingWorkouts = dayData.workouts?.length || 0;
      if (existingWorkouts >= 3) {
        alert(t('workout_max_sessions_reached'));
        return;
      }
      
      // Determine session number
      const sessionNumber = existingWorkouts + 1;
      
      // Determine status based on date
      const dayDate = new Date(dayData.date);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(currentWeekStart.getDate() - today.getDay());
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
      
      let status = 'PLANNED_FUTURE';
      if (dayDate >= currentWeekStart && dayDate <= currentWeekEnd) {
        status = 'PLANNED_CURRENT_WEEK';
      } else if (dayDate > currentWeekEnd && dayDate < nextWeek) {
        status = 'PLANNED_NEXT_WEEK';
      }
      
      // Create workout session
      const response = await fetch('/api/workouts/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workoutDayId: selectedDay,
          sessionNumber,
          name: `${t('workout_session')} ${sessionNumber}`,
          code: '',
          time: '',
          status
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Reload plan
        await loadWorkoutPlan();
        // Auto-select new workout
        setSelectedWorkout(data.session.id);
        // Expand the day if not already expanded
        if (!expandedDays.has(selectedDay)) {
          handleToggleDay(selectedDay);
        }
      } else {
        const error = await response.json();
        alert(error.error || t('workout_create_failed'));
      }
    } catch (error) {
      console.error('Error adding workout:', error);
      alert(t('workout_create_failed'));
    }
  };

  // Add moveframe handler
  const handleAddMoveframe = () => {
    if (!selectedWorkout) return;
    setEditingMoveframe(null);
    setShowMoveframeModal(true);
  };

  // Refresh handler
  const handleRefresh = () => {
    loadWorkoutPlan();
  };

  // Settings change handler
  const handleSettingsChange = () => {
    loadPeriods();
    loadWorkoutSections();
    loadMainSports();
  };

  // Moveframe save handler
  const handleMoveframeSave = async () => {
    setShowMoveframeModal(false);
    setEditingMoveframe(null);
    await loadWorkoutPlan();
  };

  // Archive/Template handlers
  const handleOpenArchive = () => {
    setShowArchiveModal(true);
  };

  const handleApplyTemplate = async () => {
    // Reload workout plan after template is applied
    await loadWorkoutPlan();
  };

  const handleSaveAsTemplate = async (type: 'workout' | 'day') => {
    // Get the selected item's full data
    if (type === 'workout' && selectedWorkout) {
      // Find the workout data
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
        setSaveTemplateType('workout');
        setSaveTemplateData(workoutData);
        setShowSaveTemplateModal(true);
      } else {
        alert('Please select a workout first');
      }
    } else if (type === 'day' && selectedDay) {
      // Find the day data
      let dayData: any = null;
      workoutPlan?.weeks?.forEach((week: any) => {
        week.days?.forEach((day: any) => {
          if (day.id === selectedDay) {
            dayData = day;
          }
        });
      });

      if (dayData) {
        setSaveTemplateType('day');
        setSaveTemplateData(dayData);
        setShowSaveTemplateModal(true);
      } else {
        alert('Please select a day first');
      }
    } else {
      alert(`Please select a ${type} first`);
    }
  };

  const handleTemplateSaved = async () => {
    // Optional: reload templates or show success message
    console.log('Template saved successfully');
  };

  const handleImportFromCoach = () => {
    setShowImportFromCoachModal(true);
  };

  const handleImportComplete = async () => {
    // Reload workout plan after import
    await loadWorkoutPlan();
  };

  const handleMarkAsDone = () => {
    if (!selectedWorkout) {
      alert('Please select a workout first');
      return;
    }

    // Find the workout data
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

  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Keyboard shortcut handlers
  const handleKeyboardCopy = () => {
    if (selectedMoveframe) {
      handleCopy('moveframe');
    } else if (selectedWorkout) {
      handleCopy('workout');
    } else if (selectedDay) {
      handleCopy('day');
    }
  };

  const handleKeyboardCut = () => {
    if (selectedMoveframe) {
      handleCut('moveframe');
    } else if (selectedWorkout) {
      handleCut('workout');
    }
  };

  const handleKeyboardPaste = () => {
    if (clipboard.type) {
      handlePaste();
    }
  };

  const handleKeyboardDelete = () => {
    // TODO: Implement delete functionality
    if (selectedMoveframe) {
      console.log('Delete moveframe:', selectedMoveframe);
    } else if (selectedWorkout) {
      console.log('Delete workout:', selectedWorkout);
    }
  };

  // Register keyboard shortcuts using useEffect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      // Copy: Ctrl+C / Cmd+C
      if (isCtrlOrCmd && event.key === 'c') {
        event.preventDefault();
        handleKeyboardCopy();
      }

      // Cut: Ctrl+X / Cmd+X
      if (isCtrlOrCmd && event.key === 'x') {
        event.preventDefault();
        handleKeyboardCut();
      }

      // Paste: Ctrl+V / Cmd+V
      if (isCtrlOrCmd && event.key === 'v') {
        event.preventDefault();
        handleKeyboardPaste();
      }

      // Delete: Delete key
      if (event.key === 'Delete') {
        event.preventDefault();
        handleKeyboardDelete();
      }

      // Escape
      if (event.key === 'Escape') {
        event.preventDefault();
        if (showMoveframeModal) setShowMoveframeModal(false);
        if (showArchiveModal) setShowArchiveModal(false);
        if (showSaveTemplateModal) setShowSaveTemplateModal(false);
        if (showImportFromCoachModal) setShowImportFromCoachModal(false);
        if (showMarkAsDoneModal) setShowMarkAsDoneModal(false);
        if (showPrintModal) setShowPrintModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDay, selectedWorkout, selectedMoveframe, clipboard, showMoveframeModal, showArchiveModal, showSaveTemplateModal, showImportFromCoachModal, showMarkAsDoneModal, showPrintModal]);

  // Drag & drop handlers
  const handleSportDragStart = (sport: SportType) => {
    setDraggedSport(sport);
  };

  const handleSportDragEnd = () => {
    setDraggedSport(null);
  };

  const handleWorkoutDrop = async (workoutId: string) => {
    if (!draggedSport) return;

    // Auto-open moveframe modal with pre-selected sport
    setSelectedWorkout(workoutId);
    setShowMoveframeModal(true);
    
    // The modal will use draggedSport to pre-select the sport
    // Reset after a short delay to allow modal to read it
    setTimeout(() => setDraggedSport(null), 100);
  };

  // Reorder workouts within day
  const handleWorkoutReorder = async (dayId: string, workouts: any[]) => {
    try {
      const token = localStorage.getItem('token');
      
      // Build session orders array
      const sessionOrders = workouts.map((workout, index) => ({
        sessionId: workout.id,
        newSessionNumber: index + 1
      }));

      const response = await fetch('/api/workouts/sessions/reorder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workoutDayId: dayId,
          sessionOrders
        })
      });

      if (response.ok) {
        await loadWorkoutPlan();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reorder workouts');
      }
    } catch (error) {
      console.error('Error reordering workouts:', error);
      alert('Failed to reorder workouts');
    }
  };

  // Reorder moveframes within workout
  const handleMoveframeReorder = async (workoutId: string, moveframes: any[]) => {
    try {
      const token = localStorage.getItem('token');
      
      // Build moveframe orders array
      const moveframeOrders = moveframes.map((moveframe, index) => ({
        moveframeId: moveframe.id,
        newIndex: index
      }));

      const response = await fetch('/api/workouts/moveframes/reorder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workoutSessionId: workoutId,
          moveframeOrders
        })
      });

      if (response.ok) {
        await loadWorkoutPlan();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reorder moveframes');
      }
    } catch (error) {
      console.error('Error reordering moveframes:', error);
      alert('Failed to reorder moveframes');
    }
  };

  // Copy/Paste handlers
  const handleCopy = (type: 'day' | 'workout' | 'moveframe') => {
    let data: any = null;

    if (type === 'day' && selectedDay) {
      // Find day data
      workoutPlan?.weeks?.forEach((week: any) => {
        week.days?.forEach((day: any) => {
          if (day.id === selectedDay) {
            data = day;
          }
        });
      });
    } else if (type === 'workout' && selectedWorkout) {
      // Find workout data
      workoutPlan?.weeks?.forEach((week: any) => {
        week.days?.forEach((day: any) => {
          day.workouts?.forEach((workout: any) => {
            if (workout.id === selectedWorkout) {
              data = { ...workout, sourceDayId: day.id };
            }
          });
        });
      });
    } else if (type === 'moveframe' && selectedMoveframe) {
      // Find moveframe data
      workoutPlan?.weeks?.forEach((week: any) => {
        week.days?.forEach((day: any) => {
          day.workouts?.forEach((workout: any) => {
            workout.moveframes?.forEach((mf: any) => {
              if (mf.id === selectedMoveframe) {
                data = { ...mf, sourceWorkoutId: workout.id };
              }
            });
          });
        });
      });
    }

    if (data) {
      setClipboard({ type, data, isCut: false });
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} copied!`);
    } else {
      alert(`Please select a ${type} first`);
    }
  };

  const handleCut = (type: 'day' | 'workout' | 'moveframe') => {
    handleCopy(type);
    setClipboard(prev => ({ ...prev, isCut: true }));
  };

  const handlePaste = async () => {
    if (!clipboard.type || !clipboard.data) {
      alert('Nothing to paste');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (clipboard.type === 'workout' && selectedDay) {
        // Paste workout to selected day
        const response = await fetch('/api/workouts/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            workoutDayId: selectedDay,
            name: clipboard.data.name,
            code: clipboard.data.code,
            time: clipboard.data.time,
            location: clipboard.data.location,
            surface: clipboard.data.surface,
            heartRateMax: clipboard.data.heartRateMax,
            heartRateAvg: clipboard.data.heartRateAvg,
            calories: clipboard.data.calories,
            feelingStatus: clipboard.data.feelingStatus,
            notes: clipboard.data.notes
          })
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || 'Failed to paste workout');
          return;
        }

        const { workoutSession } = await response.json();

        // Copy all moveframes
        for (const mf of clipboard.data.moveframes || []) {
          await fetch('/api/workouts/moveframes', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              workoutSessionId: workoutSession.id,
              sport: mf.sport,
              type: mf.type,
              sectionId: mf.sectionId,
              description: mf.description,
              movelaps: mf.movelaps || []
            })
          });
        }

        // If cut, delete the original
        if (clipboard.isCut) {
          await fetch(`/api/workouts/sessions/${clipboard.data.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }

        await loadWorkoutPlan();
        alert('Workout pasted successfully!');
        setClipboard({ type: null, data: null, isCut: false });
      } else if (clipboard.type === 'moveframe' && selectedWorkout) {
        // Paste moveframe to selected workout
        const response = await fetch('/api/workouts/moveframes', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            workoutSessionId: selectedWorkout,
            sport: clipboard.data.sport,
            type: clipboard.data.type,
            sectionId: clipboard.data.sectionId,
            description: clipboard.data.description,
            movelaps: clipboard.data.movelaps || []
          })
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || 'Failed to paste moveframe');
          return;
        }

        // If cut, delete the original
        if (clipboard.isCut) {
          await fetch(`/api/workouts/moveframes/${clipboard.data.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }

        await loadWorkoutPlan();
        alert('Moveframe pasted successfully!');
        setClipboard({ type: null, data: null, isCut: false });
      } else {
        alert('Invalid paste target');
      }
    } catch (error) {
      console.error('Paste error:', error);
      alert('Failed to paste');
    }
  };

  // Don't render if not authenticated
  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ModernNavbar />
      
      {/* Athlete Selector for Coaches */}
      {['COACH', 'TEAM_MANAGER', 'CLUB_TRAINER'].includes(userType) && (
        <AthleteSelector
          selectedAthleteId={selectedAthleteId}
          onSelectAthlete={setSelectedAthleteId}
        />
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
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
        
        {/* Central Grid */}
        <div className="flex-1 overflow-auto">
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
        
        {/* Right Sidebar */}
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
      
      {/* Moveframe Form Modal */}
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

      {/* Archive Modal */}
      {showArchiveModal && (
        <ArchiveModal
          onClose={() => setShowArchiveModal(false)}
          onApplyTemplate={handleApplyTemplate}
          targetDayId={selectedDay}
        />
      )}

      {/* Save Template Modal */}
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

      {/* Import from Coach Modal */}
      {showImportFromCoachModal && (
        <ImportFromCoachModal
          onClose={() => setShowImportFromCoachModal(false)}
          onImport={handleImportComplete}
          targetDayId={selectedDay}
        />
      )}

      {/* Mark as Done Modal */}
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

      {/* Print/Export Modal */}
      {showPrintModal && (
        <PrintWorkoutModal
          onClose={() => setShowPrintModal(false)}
          selectedDay={selectedDay}
          selectedWorkout={selectedWorkout}
          workoutPlan={workoutPlan}
        />
      )}
      
      <SimpleFooter />
    </div>
  );
}
