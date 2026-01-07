import { useState, useEffect } from 'react';

interface FreeMoveExercise {
  id: string;
  name: string;
  createdAt: string;
}

export function useFreeMoveExercises() {
  const [exercises, setExercises] = useState<FreeMoveExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check both regular token and admin token
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        console.log('⚠️ No token found, skipping FREE_MOVES exercises load');
        setExercises([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/workouts/free-move-exercises', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch exercises: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.exercises)) {
        console.log(`✅ Loaded ${data.exercises.length} FREE_MOVES exercises`);
        setExercises(data.exercises);
      } else {
        console.warn('⚠️ No exercises found or invalid response');
        setExercises([]);
      }
    } catch (err: any) {
      console.error('❌ Error loading FREE_MOVES exercises:', err);
      setError(err.message);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async (exerciseName: string): Promise<boolean> => {
    try {
      // Check both regular token and admin token
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        console.error('⚠️ No token found');
        return false;
      }

      const response = await fetch('/api/workouts/free-move-exercises', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exercise: exerciseName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add exercise: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Added FREE_MOVES exercise: ${exerciseName}`);
        // Reload exercises to get updated list
        await loadExercises();
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('❌ Error adding FREE_MOVES exercise:', err);
      setError(err.message);
      return false;
    }
  };

  const deleteExercise = async (exerciseId: string): Promise<boolean> => {
    try {
      // Check both regular token and admin token
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        console.error('⚠️ No token found');
        return false;
      }

      const response = await fetch(`/api/workouts/free-move-exercises?id=${exerciseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete exercise: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Deleted FREE_MOVES exercise: ${exerciseId}`);
        // Reload exercises to get updated list
        await loadExercises();
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('❌ Error deleting FREE_MOVES exercise:', err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  return {
    exercises,
    loading,
    error,
    reload: loadExercises,
    addExercise,
    deleteExercise,
  };
}

