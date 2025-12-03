/**
 * useWorkoutData Hook
 * Custom hook for managing workout data loading and state
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { workoutPlanApi, periodsApi, userApi, coachApi } from '@/utils/api.utils';
import { sectionHelpers, permissionHelpers } from '@/utils/workout.helpers';
import type { 
  WorkoutPlan, 
  Period, 
  User,
  SectionId, 
  FeedbackMessage 
} from '@/types/workout.types';

interface UseWorkoutDataOptions {
  initialSection?: SectionId;
}

interface UseWorkoutDataReturn {
  // Data
  workoutPlan: WorkoutPlan | null;
  periods: Period[];
  userType: string | null;
  athleteList: any[];
  
  // Loading states
  isLoading: boolean;
  isLoadingPeriods: boolean;
  isLoadingProfile: boolean;
  
  // Actions
  loadWorkoutData: () => Promise<void>;
  loadPeriods: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  loadAthleteList: () => Promise<void>;
  
  // Feedback
  feedbackMessage: FeedbackMessage | null;
  showMessage: (type: FeedbackMessage['type'], text: string) => void;
}

export function useWorkoutData({ 
  initialSection = 'A' 
}: UseWorkoutDataOptions = {}): UseWorkoutDataReturn {
  // State
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [athleteList, setAthleteList] = useState<any[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Feedback
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null);
  
  /**
   * Show feedback message (auto-clears after 4 seconds)
   */
  const showMessage = useCallback((type: FeedbackMessage['type'], text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  }, []);

  /**
   * Load workout data for active section
   */
  const loadWorkoutData = useCallback(async (section: SectionId = initialSection) => {
    setIsLoading(true);
    
    try {
      const planType = sectionHelpers.getPlanType(section);
      console.log('🔄 Loading workout data for section:', section, 'type:', planType);
      
      const response = await workoutPlanApi.get(planType);

      if (response.success && response.data) {
        const { plan } = response.data;
        console.log('✅ Plan loaded:', plan?.id);
        console.log('📊 Number of weeks:', plan?.weeks?.length);
        
        // Debug: Check weeks structure
        if (plan?.weeks && plan.weeks.length > 0) {
          console.log('✅ First week:', plan.weeks[0]);
          console.log('✅ First week days:', plan.weeks[0].days);
        } else {
          console.warn('⚠️ No weeks found in plan!');
        }
        
        // Debug: Check moveframes
        if (plan?.weeks) {
          plan.weeks.forEach((week: any) => {
            week.days?.forEach((day: any) => {
              day.workouts?.forEach((workout: any) => {
                if (workout.moveframes && workout.moveframes.length > 0) {
                  console.log(
                    `💪 Workout ${workout.id} has ${workout.moveframes.length} moveframes:`,
                    workout.moveframes.map((mf: any) => `${mf.letter}-${mf.sport}`).join(', ')
                  );
                }
              });
            });
          });
        }
        
        setWorkoutPlan(plan);
        console.log('✅ workoutPlan state set to:', plan);
      } else {
        console.error('❌ Failed to load plan:', response.error);
        showMessage('error', response.error || 'Failed to load workout plan');
      }
    } catch (error) {
      console.error('💥 Error loading workout data:', error);
      showMessage('error', 'Error loading workout data');
    } finally {
      setIsLoading(false);
    }
  }, [initialSection, showMessage]);

  /**
   * Load periods from API
   */
  const loadPeriods = useCallback(async () => {
    setIsLoadingPeriods(true);
    
    try {
      const response = await periodsApi.getAll();
      
      if (response.success && response.data) {
        setPeriods(response.data || []);
        console.log('✅ Periods loaded:', response.data?.length);
      } else {
        console.error('❌ Failed to load periods:', response.error);
      }
    } catch (error) {
      console.error('💥 Error loading periods:', error);
    } finally {
      setIsLoadingPeriods(false);
    }
  }, []);

  /**
   * Load user profile
   */
  const loadUserProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUserType(userData.userType);
        console.log('✅ User type:', userData.userType);
      }
    } catch (error) {
      console.error('💥 Error loading user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  /**
   * Load athlete list for coaches
   */
  const loadAthleteList = useCallback(async () => {
    try {
      const response = await coachApi.getAthletes();
      
      if (response.success && response.data) {
        setAthleteList(response.data.athletes || []);
        console.log('✅ Athletes loaded:', response.data.athletes?.length);
      }
    } catch (error) {
      console.error('💥 Error loading athlete list:', error);
    }
  }, []);

  return {
    // Data
    workoutPlan,
    periods,
    userType,
    athleteList,
    
    // Loading states
    isLoading,
    isLoadingPeriods,
    isLoadingProfile,
    
    // Actions
    loadWorkoutData,
    loadPeriods,
    loadUserProfile,
    loadAthleteList,
    
    // Feedback
    feedbackMessage,
    showMessage
  };
}

