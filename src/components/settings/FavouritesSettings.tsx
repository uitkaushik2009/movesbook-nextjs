'use client';

import { useState, useEffect } from 'react';
import { Star, Plus, Edit2, Trash2, Calendar, Dumbbell, Target, Clock, Search, Filter, Copy, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeeklyPlan {
  id: string;
  name: string;
  description: string;
  weekStart: string;
  daysCount: number;
  workoutsCount: number;
  lastUsed: string;
  tags: string[];
}

interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  intensity: 'Low' | 'Medium' | 'High';
  moveframesCount: number;
  sport: string;
  lastUsed: string;
  tags: string[];
}

interface Moveframe {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: string;
  restTime: number; // in seconds
  equipment: string[];
  muscleGroups: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lastUsed: string;
  usageCount: number;
}

export default function FavouritesSettings() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'plans' | 'workouts' | 'moveframes'>('plans');
  
  // Weekly Plans State
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WeeklyPlan | null>(null);
  
  // Workouts State
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showWorkoutDialog, setShowWorkoutDialog] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  
  // Moveframes State
  const [moveframes, setMoveframes] = useState<Moveframe[]>([]);
  const [showMoveframeDialog, setShowMoveframeDialog] = useState(false);
  const [editingMoveframe, setEditingMoveframe] = useState<Moveframe | null>(null);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastUsed' | 'popular'>('lastUsed');

  // Load data from localStorage
  useEffect(() => {
    // Load Weekly Plans
    const savedPlans = localStorage.getItem('favouriteWeeklyPlans');
    if (savedPlans) {
      try {
        setWeeklyPlans(JSON.parse(savedPlans));
      } catch (e) {
        console.error('Failed to load weekly plans');
      }
    } else {
      // Default plans
      setWeeklyPlans([
        {
          id: '1',
          name: 'Beginner Strength Program',
          description: 'Full body workout routine for beginners',
          weekStart: 'Monday',
          daysCount: 3,
          workoutsCount: 9,
          lastUsed: '2025-11-20',
          tags: ['Strength', 'Beginner']
        },
        {
          id: '2',
          name: 'Cardio & Core',
          description: 'High intensity cardio with core strengthening',
          weekStart: 'Monday',
          daysCount: 4,
          workoutsCount: 12,
          lastUsed: '2025-11-22',
          tags: ['Cardio', 'Core']
        }
      ]);
    }

    // Load Workouts
    const savedWorkouts = localStorage.getItem('favouriteWorkouts');
    if (savedWorkouts) {
      try {
        setWorkouts(JSON.parse(savedWorkouts));
      } catch (e) {
        console.error('Failed to load workouts');
      }
    } else {
      // Default workouts
      setWorkouts([
        {
          id: '1',
          name: 'Upper Body Push',
          description: 'Chest, shoulders, and triceps workout',
          duration: 45,
          intensity: 'High',
          moveframesCount: 6,
          sport: 'Weightlifting',
          lastUsed: '2025-11-23',
          tags: ['Upper Body', 'Push']
        },
        {
          id: '2',
          name: '5K Run Training',
          description: 'Interval training for 5K preparation',
          duration: 30,
          intensity: 'Medium',
          moveframesCount: 4,
          sport: 'Running',
          lastUsed: '2025-11-21',
          tags: ['Cardio', 'Running']
        }
      ]);
    }

    // Load Moveframes
    const savedMoveframes = localStorage.getItem('favouriteMoveframes');
    if (savedMoveframes) {
      try {
        setMoveframes(JSON.parse(savedMoveframes));
      } catch (e) {
        console.error('Failed to load moveframes');
      }
    } else {
      // Default moveframes
      setMoveframes([
        {
          id: '1',
          name: 'Barbell Bench Press',
          description: 'Compound chest exercise',
          sets: 4,
          reps: '8-10',
          restTime: 120,
          equipment: ['Barbell', 'Bench'],
          muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
          difficulty: 'Intermediate',
          lastUsed: '2025-11-23',
          usageCount: 45
        },
        {
          id: '2',
          name: 'Bodyweight Squats',
          description: 'Basic lower body movement',
          sets: 3,
          reps: '15-20',
          restTime: 60,
          equipment: [],
          muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
          difficulty: 'Beginner',
          lastUsed: '2025-11-22',
          usageCount: 78
        }
      ]);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (weeklyPlans.length > 0) {
      localStorage.setItem('favouriteWeeklyPlans', JSON.stringify(weeklyPlans));
    }
  }, [weeklyPlans]);

  useEffect(() => {
    if (workouts.length > 0) {
      localStorage.setItem('favouriteWorkouts', JSON.stringify(workouts));
    }
  }, [workouts]);

  useEffect(() => {
    if (moveframes.length > 0) {
      localStorage.setItem('favouriteMoveframes', JSON.stringify(moveframes));
    }
  }, [moveframes]);

  // Helper functions
  const getAllTags = () => {
    if (activeTab === 'plans') {
      return Array.from(new Set(weeklyPlans.flatMap(p => p.tags)));
    } else if (activeTab === 'workouts') {
      return Array.from(new Set(workouts.flatMap(w => w.tags)));
    }
    return [];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Favourites</h2>
        <p className="text-gray-600">Manage your favourite plans, workouts, and moveframes</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'plans'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Weekly Plans ({weeklyPlans.length})
        </button>
        <button
          onClick={() => setActiveTab('workouts')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'workouts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Dumbbell className="w-4 h-4 inline mr-2" />
          Workouts ({workouts.length})
        </button>
        <button
          onClick={() => setActiveTab('moveframes')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'moveframes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Moveframes ({moveframes.length})
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (activeTab === 'plans') {
                setEditingPlan({
                  id: '',
                  name: '',
                  description: '',
                  weekStart: 'Monday',
                  daysCount: 3,
                  workoutsCount: 0,
                  lastUsed: new Date().toISOString().split('T')[0],
                  tags: []
                });
                setShowPlanDialog(true);
              } else if (activeTab === 'workouts') {
                setEditingWorkout({
                  id: '',
                  name: '',
                  description: '',
                  duration: 30,
                  intensity: 'Medium',
                  moveframesCount: 0,
                  sport: '',
                  lastUsed: new Date().toISOString().split('T')[0],
                  tags: []
                });
                setShowWorkoutDialog(true);
              } else {
                setEditingMoveframe({
                  id: '',
                  name: '',
                  description: '',
                  sets: 3,
                  reps: '10',
                  restTime: 60,
                  equipment: [],
                  muscleGroups: [],
                  difficulty: 'Beginner',
                  lastUsed: new Date().toISOString().split('T')[0],
                  usageCount: 0
                });
                setShowMoveframeDialog(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'plans' ? 'Plan' : activeTab === 'workouts' ? 'Workout' : 'Moveframe'}
          </button>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {activeTab !== 'moveframes' && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tags</option>
              {getAllTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="lastUsed">Recently Used</option>
            {activeTab === 'moveframes' && <option value="popular">Most Popular</option>}
          </select>
        </div>
      </div>

      {/* Weekly Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyPlans
            .filter(plan => 
              (searchQuery === '' || plan.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
              (filterTag === 'all' || plan.tags.includes(filterTag))
            )
            .sort((a, b) => {
              if (sortBy === 'name') return a.name.localeCompare(b.name);
              if (sortBy === 'lastUsed') return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
              return 0;
            })
            .map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowPlanDialog(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Remove from favourites?')) {
                          setWeeklyPlans(weeklyPlans.filter(p => p.id !== plan.id));
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Week starts:</span>
                    <span className="font-semibold text-gray-900">{plan.weekStart}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Training days:</span>
                    <span className="font-semibold text-gray-900">{plan.daysCount} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Workouts:</span>
                    <span className="font-semibold text-gray-900">{plan.workoutsCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last used:</span>
                    <span className="font-semibold text-gray-900">{formatDate(plan.lastUsed)}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {plan.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
                    Use Plan
                  </button>
                  <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Workouts Tab */}
      {activeTab === 'workouts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts
            .filter(workout => 
              (searchQuery === '' || workout.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
              (filterTag === 'all' || workout.tags.includes(filterTag))
            )
            .sort((a, b) => {
              if (sortBy === 'name') return a.name.localeCompare(b.name);
              if (sortBy === 'lastUsed') return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
              return 0;
            })
            .map((workout) => (
              <div
                key={workout.id}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <h3 className="font-bold text-gray-900">{workout.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingWorkout(workout);
                        setShowWorkoutDialog(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Remove from favourites?')) {
                          setWorkouts(workouts.filter(w => w.id !== workout.id));
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{workout.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Clock className="w-4 h-4 text-gray-400 mb-1" />
                    <div className="text-lg font-bold text-gray-900">{workout.duration} min</div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Target className="w-4 h-4 text-gray-400 mb-1" />
                    <div className="text-lg font-bold text-gray-900">{workout.moveframesCount}</div>
                    <div className="text-xs text-gray-500">Moveframes</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sport:</span>
                    <span className="font-semibold text-gray-900">{workout.sport}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Intensity:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold text-xs ${
                      workout.intensity === 'Low' ? 'bg-green-100 text-green-700' :
                      workout.intensity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {workout.intensity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last used:</span>
                    <span className="font-semibold text-gray-900">{formatDate(workout.lastUsed)}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {workout.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
                    Start Workout
                  </button>
                  <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Moveframes Tab */}
      {activeTab === 'moveframes' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Exercise</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sets × Reps</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Last Used</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {moveframes
                .filter(mf => searchQuery === '' || mf.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => {
                  if (sortBy === 'name') return a.name.localeCompare(b.name);
                  if (sortBy === 'lastUsed') return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
                  if (sortBy === 'popular') return b.usageCount - a.usageCount;
                  return 0;
                })
                .map((mf) => (
                  <tr key={mf.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900">{mf.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{mf.description}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mf.muscleGroups.map((muscle, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                {muscle}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{mf.sets} × {mf.reps}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{mf.restTime}s</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {mf.equipment.length > 0 ? mf.equipment.join(', ') : 'None'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        mf.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                        mf.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {mf.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{mf.usageCount}×</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{formatDate(mf.lastUsed)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingMoveframe(mf);
                            setShowMoveframeDialog(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Remove from favourites?')) {
                              setMoveframes(moveframes.filter(m => m.id !== mf.id));
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'plans' && weeklyPlans.filter(p => 
          (searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (filterTag === 'all' || p.tags.includes(filterTag))
        ).length === 0) ||
        (activeTab === 'workouts' && workouts.filter(w => 
          (searchQuery === '' || w.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (filterTag === 'all' || w.tags.includes(filterTag))
        ).length === 0) ||
        (activeTab === 'moveframes' && moveframes.filter(mf => 
          searchQuery === '' || mf.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0)) && (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No favourites found</p>
          <p className="text-gray-500 text-sm">
            {searchQuery || filterTag !== 'all' ? 'Try adjusting your filters' : 'Add your first favourite to get started!'}
          </p>
        </div>
      )}

      {/* Weekly Plan Dialog */}
      {showPlanDialog && editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingPlan.id ? 'Edit Weekly Plan' : 'Add Weekly Plan'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Full Body Strength Program"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your weekly plan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Week Starts</label>
                  <select
                    value={editingPlan.weekStart}
                    onChange={(e) => setEditingPlan({ ...editingPlan, weekStart: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Training Days</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={editingPlan.daysCount}
                    onChange={(e) => setEditingPlan({ ...editingPlan, daysCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Workouts</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPlan.workoutsCount}
                    onChange={(e) => setEditingPlan({ ...editingPlan, workoutsCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingPlan.tags.join(', ')}
                  onChange={(e) => setEditingPlan({ ...editingPlan, tags: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Strength, Beginner, Full Body"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  if (!editingPlan.name) {
                    alert('Please enter a plan name');
                    return;
                  }
                  if (editingPlan.id) {
                    setWeeklyPlans(weeklyPlans.map(p => p.id === editingPlan.id ? editingPlan : p));
                  } else {
                    setWeeklyPlans([...weeklyPlans, { ...editingPlan, id: Date.now().toString() }]);
                  }
                  setShowPlanDialog(false);
                  setEditingPlan(null);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {editingPlan.id ? 'Save Changes' : 'Add to Favourites'}
              </button>
              <button
                onClick={() => {
                  setShowPlanDialog(false);
                  setEditingPlan(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Dialog */}
      {showWorkoutDialog && editingWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingWorkout.id ? 'Edit Workout' : 'Add Workout'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Workout Name</label>
                <input
                  type="text"
                  value={editingWorkout.name}
                  onChange={(e) => setEditingWorkout({ ...editingWorkout, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Upper Body Push"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingWorkout.description}
                  onChange={(e) => setEditingWorkout({ ...editingWorkout, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your workout..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingWorkout.duration}
                    onChange={(e) => setEditingWorkout({ ...editingWorkout, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Intensity</label>
                  <select
                    value={editingWorkout.intensity}
                    onChange={(e) => setEditingWorkout({ ...editingWorkout, intensity: e.target.value as 'Low' | 'Medium' | 'High' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sport</label>
                  <input
                    type="text"
                    value={editingWorkout.sport}
                    onChange={(e) => setEditingWorkout({ ...editingWorkout, sport: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Weightlifting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Moveframes Count</label>
                  <input
                    type="number"
                    min="0"
                    value={editingWorkout.moveframesCount}
                    onChange={(e) => setEditingWorkout({ ...editingWorkout, moveframesCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingWorkout.tags.join(', ')}
                  onChange={(e) => setEditingWorkout({ ...editingWorkout, tags: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Upper Body, Push, Strength"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  if (!editingWorkout.name) {
                    alert('Please enter a workout name');
                    return;
                  }
                  if (editingWorkout.id) {
                    setWorkouts(workouts.map(w => w.id === editingWorkout.id ? editingWorkout : w));
                  } else {
                    setWorkouts([...workouts, { ...editingWorkout, id: Date.now().toString() }]);
                  }
                  setShowWorkoutDialog(false);
                  setEditingWorkout(null);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {editingWorkout.id ? 'Save Changes' : 'Add to Favourites'}
              </button>
              <button
                onClick={() => {
                  setShowWorkoutDialog(false);
                  setEditingWorkout(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moveframe Dialog */}
      {showMoveframeDialog && editingMoveframe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingMoveframe.id ? 'Edit Moveframe' : 'Add Moveframe'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exercise Name</label>
                <input
                  type="text"
                  value={editingMoveframe.name}
                  onChange={(e) => setEditingMoveframe({ ...editingMoveframe, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Barbell Bench Press"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingMoveframe.description}
                  onChange={(e) => setEditingMoveframe({ ...editingMoveframe, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={editingMoveframe.sets}
                    onChange={(e) => setEditingMoveframe({ ...editingMoveframe, sets: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reps</label>
                  <input
                    type="text"
                    value={editingMoveframe.reps}
                    onChange={(e) => setEditingMoveframe({ ...editingMoveframe, reps: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 10 or 8-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rest (sec)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingMoveframe.restTime}
                    onChange={(e) => setEditingMoveframe({ ...editingMoveframe, restTime: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  value={editingMoveframe.difficulty}
                  onChange={(e) => setEditingMoveframe({ ...editingMoveframe, difficulty: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment (comma-separated)</label>
                <input
                  type="text"
                  value={editingMoveframe.equipment.join(', ')}
                  onChange={(e) => setEditingMoveframe({ ...editingMoveframe, equipment: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Barbell, Bench"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Muscle Groups (comma-separated)</label>
                <input
                  type="text"
                  value={editingMoveframe.muscleGroups.join(', ')}
                  onChange={(e) => setEditingMoveframe({ ...editingMoveframe, muscleGroups: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Chest, Triceps, Shoulders"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  if (!editingMoveframe.name) {
                    alert('Please enter an exercise name');
                    return;
                  }
                  if (editingMoveframe.id) {
                    setMoveframes(moveframes.map(m => m.id === editingMoveframe.id ? editingMoveframe : m));
                  } else {
                    setMoveframes([...moveframes, { ...editingMoveframe, id: Date.now().toString() }]);
                  }
                  setShowMoveframeDialog(false);
                  setEditingMoveframe(null);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {editingMoveframe.id ? 'Save Changes' : 'Add to Favourites'}
              </button>
              <button
                onClick={() => {
                  setShowMoveframeDialog(false);
                  setEditingMoveframe(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
