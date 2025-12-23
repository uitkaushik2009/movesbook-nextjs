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
  loadWorkoutData: (section?: SectionId) => Promise<void>;
  loadPeriods: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  loadAthleteList: () => Promise<void>;
  updateWorkoutPlan: (plan: WorkoutPlan | null) => void;
  
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
   * @param section - Optional section ID to load (defaults to initialSection)
   */
  const loadWorkoutData = useCallback(async (section?: SectionId) => {
    const targetSection = section || initialSection;
    setIsLoading(true);
    
    try {
      const planType = sectionHelpers.getPlanType(targetSection);
      console.log('🔄 Loading workout data for section:', targetSection, 'type:', planType);
      
      const response = await workoutPlanApi.get(planType);

      if (response.success && response.data) {
        const { plan } = response.data;
        console.log('✅ Plan loaded:', plan?.id);
        console.log('📊 Number of weeks:', plan?.weeks?.length);
        
        // Check if Section A has less than 3 weeks - if so, force recreation
        if (targetSection === 'A' && plan?.weeks && plan.weeks.length < 3) {
          console.warn(`⚠️ Section A has only ${plan.weeks.length} weeks! Force recreating plan...`);
          const recreateResponse = await workoutPlanApi.get(planType, true); // forceRecreate = true
          if (recreateResponse.success && recreateResponse.data) {
            setWorkoutPlan(recreateResponse.data.plan);
            console.log('✅ Plan recreated successfully with', recreateResponse.data.plan?.weeks?.length, 'weeks');
          }
          setIsLoading(false);
          return;
        }
        
        // Debug: Check weeks structure
        if (plan?.weeks && plan.weeks.length > 0) {
          console.log('✅ First week:', plan.weeks[0]);
          console.log('✅ First week days:', plan.weeks[0].days);
        } else {
          // Only warn for sections A and B where weeks are expected to be pre-created
          if (targetSection === 'A' || targetSection === 'B') {
            console.warn('⚠️ No weeks found in plan! Force recreating...');
            const recreateResponse = await workoutPlanApi.get(planType, true);
            if (recreateResponse.success && recreateResponse.data) {
              setWorkoutPlan(recreateResponse.data.plan);
              console.log('✅ Plan recreated successfully');
            }
            setIsLoading(false);
            return;
          } else {
            // Sections C and D are expected to start empty
            console.log(`ℹ️ Section ${targetSection} plan is empty (expected)`);
          }
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

  /**
   * Update workout plan (for local state updates without reloading)
   */
  const updateWorkoutPlan = useCallback((plan: WorkoutPlan | null) => {
    setWorkoutPlan(plan);
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
    updateWorkoutPlan,
    
    // Feedback
    feedbackMessage,
    showMessage
  };
}

