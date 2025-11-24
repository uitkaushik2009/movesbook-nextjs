'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, ArrowUpAZ, ArrowDownZA, Save, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Period {
  id: string;
  title: string;
  description: string;
  color: string;
  order: number;
}

interface WorkoutSection {
  id: string;
  title: string;
  description: string;
  color: string;
  order: number;
}

interface Sport {
  id: string;
  name: string;
  icon: string;
  order: number;
  isTop5: boolean;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  inStock: boolean;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  equipment: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  muscleGroups: string[];
}

export default function ToolsSettings() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'periods' | 'sections' | 'sports' | 'equipment' | 'exercises'>('periods');
  const [periods, setPeriods] = useState<Period[]>([]);
  const [sections, setSections] = useState<WorkoutSection[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editingItem, setEditingItem] = useState<Period | WorkoutSection | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', color: '#3b82f6' });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedSport, setDraggedSport] = useState<string | null>(null);
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load periods, sections, and sports from localStorage
  useEffect(() => {
    const savedPeriods = localStorage.getItem('workoutPeriods');
    const savedSections = localStorage.getItem('workoutSections');
    const savedSports = localStorage.getItem('mainSports');
    
    if (savedPeriods) {
      try {
        setPeriods(JSON.parse(savedPeriods));
      } catch (e) {
        console.error('Failed to load periods');
      }
    } else {
      // Default periods
      setPeriods([
        { id: '1', title: 'Preparation Phase', description: 'Building base fitness', color: '#3b82f6', order: 0 },
        { id: '2', title: 'Competition Phase', description: 'Peak performance period', color: '#ef4444', order: 1 },
        { id: '3', title: 'Recovery Phase', description: 'Active recovery and rest', color: '#10b981', order: 2 },
      ]);
    }

    if (savedSections) {
      try {
        setSections(JSON.parse(savedSections));
      } catch (e) {
        console.error('Failed to load sections');
      }
    } else {
      // Default sections
      setSections([
        { id: '1', title: 'Warm-up', description: 'Preparation exercises', color: '#f59e0b', order: 0 },
        { id: '2', title: 'Main Set', description: 'Primary workout', color: '#3b82f6', order: 1 },
        { id: '3', title: 'Cool-down', description: 'Recovery exercises', color: '#10b981', order: 2 },
      ]);
    }

    if (savedSports) {
      try {
        setSports(JSON.parse(savedSports));
      } catch (e) {
        console.error('Failed to load sports');
      }
    } else {
      // Default sports (comprehensive list)
      setSports([
        { id: '1', name: 'Swimming', icon: '🏊‍♂️', order: 0, isTop5: true },
        { id: '2', name: 'Running', icon: '🏃‍♂️', order: 1, isTop5: true },
        { id: '3', name: 'Cycling', icon: '🚴‍♂️', order: 2, isTop5: true },
        { id: '4', name: 'Weightlifting', icon: '🏋️‍♂️', order: 3, isTop5: true },
        { id: '5', name: 'Football/Soccer', icon: '⚽', order: 4, isTop5: true },
        { id: '6', name: 'Basketball', icon: '🏀', order: 5, isTop5: false },
        { id: '7', name: 'Tennis', icon: '🎾', order: 6, isTop5: false },
        { id: '8', name: 'Volleyball', icon: '🏐', order: 7, isTop5: false },
        { id: '9', name: 'Boxing', icon: '🥊', order: 8, isTop5: false },
        { id: '10', name: 'Martial Arts', icon: '🥋', order: 9, isTop5: false },
        { id: '11', name: 'Rowing', icon: '🚣‍♂️', order: 10, isTop5: false },
        { id: '12', name: 'Yoga', icon: '🧘‍♂️', order: 11, isTop5: false },
        { id: '13', name: 'Gymnastics', icon: '🤸‍♂️', order: 12, isTop5: false },
        { id: '14', name: 'Skiing', icon: '⛷️', order: 13, isTop5: false },
        { id: '15', name: 'Surfing', icon: '🏄‍♂️', order: 14, isTop5: false },
        { id: '16', name: 'Golf', icon: '⛳', order: 15, isTop5: false },
        { id: '17', name: 'Baseball', icon: '⚾', order: 16, isTop5: false },
        { id: '18', name: 'Ice Hockey', icon: '🏒', order: 17, isTop5: false },
        { id: '19', name: 'Rugby', icon: '🏉', order: 18, isTop5: false },
        { id: '20', name: 'Climbing', icon: '🧗‍♂️', order: 19, isTop5: false },
      ]);
    }

    // Load equipment
    const savedEquipment = localStorage.getItem('equipment');
    if (savedEquipment) {
      try {
        setEquipment(JSON.parse(savedEquipment));
      } catch (e) {
        console.error('Failed to load equipment');
      }
    } else {
      // Default equipment
      setEquipment([
        { id: '1', name: 'Treadmill', category: 'Cardio', description: 'Indoor running machine', inStock: true },
        { id: '2', name: 'Dumbbells', category: 'Weights', description: 'Free weights for strength training', inStock: true },
        { id: '3', name: 'Barbell', category: 'Weights', description: 'Long bar for heavy lifting', inStock: true },
        { id: '4', name: 'Rowing Machine', category: 'Cardio', description: 'Full body cardio equipment', inStock: true },
        { id: '5', name: 'Resistance Bands', category: 'Accessories', description: 'Elastic bands for resistance training', inStock: true },
      ]);
    }

    // Load exercises
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
      try {
        setExercises(JSON.parse(savedExercises));
      } catch (e) {
        console.error('Failed to load exercises');
      }
    } else {
      // Default exercises
      setExercises([
        { 
          id: '1', 
          name: 'Push-ups', 
          category: 'Strength', 
          description: 'Upper body exercise', 
          equipment: [],
          difficulty: 'Beginner',
          muscleGroups: ['Chest', 'Triceps', 'Shoulders']
        },
        { 
          id: '2', 
          name: 'Squats', 
          category: 'Strength', 
          description: 'Lower body compound exercise', 
          equipment: [],
          difficulty: 'Beginner',
          muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings']
        },
        { 
          id: '3', 
          name: 'Bench Press', 
          category: 'Strength', 
          description: 'Upper body pressing movement', 
          equipment: ['Barbell', 'Bench'],
          difficulty: 'Intermediate',
          muscleGroups: ['Chest', 'Triceps', 'Shoulders']
        },
        { 
          id: '4', 
          name: 'Running Intervals', 
          category: 'Cardio', 
          description: 'High intensity interval training', 
          equipment: ['Treadmill'],
          difficulty: 'Intermediate',
          muscleGroups: ['Legs', 'Core']
        },
        { 
          id: '5', 
          name: 'Deadlift', 
          category: 'Strength', 
          description: 'Full body compound movement', 
          equipment: ['Barbell'],
          difficulty: 'Advanced',
          muscleGroups: ['Back', 'Legs', 'Core']
        },
      ]);
    }
  }, []);

  // Save to localStorage whenever periods, sections, or sports change
  useEffect(() => {
    if (periods.length > 0) {
      localStorage.setItem('workoutPeriods', JSON.stringify(periods));
    }
  }, [periods]);

  useEffect(() => {
    if (sections.length > 0) {
      localStorage.setItem('workoutSections', JSON.stringify(sections));
    }
  }, [sections]);

  useEffect(() => {
    if (sports.length > 0) {
      localStorage.setItem('mainSports', JSON.stringify(sports));
    }
  }, [sports]);

  useEffect(() => {
    if (equipment.length > 0) {
      localStorage.setItem('equipment', JSON.stringify(equipment));
    }
  }, [equipment]);

  useEffect(() => {
    if (exercises.length > 0) {
      localStorage.setItem('exercises', JSON.stringify(exercises));
    }
  }, [exercises]);

  const getActiveItems = () => {
    return activeTab === 'periods' ? periods : sections;
  };

  const setActiveItems = (items: Period[] | WorkoutSection[]) => {
    if (activeTab === 'periods') {
      setPeriods(items as Period[]);
    } else {
      setSections(items as WorkoutSection[]);
    }
  };

  const handleAdd = () => {
    if (!newItem.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (newItem.title.length > 30) {
      alert('Title must be 30 characters or less');
      return;
    }

    if (newItem.description.length > 255) {
      alert('Description must be 255 characters or less');
      return;
    }

    const items = getActiveItems();
    const newEntry = {
      id: Date.now().toString(),
      title: newItem.title,
      description: newItem.description,
      color: newItem.color,
      order: items.length,
    };

    setActiveItems([...items, newEntry]);
    setNewItem({ title: '', description: '', color: '#3b82f6' });
    setShowAddDialog(false);
  };

  const handleEdit = (item: Period | WorkoutSection) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    if (editingItem.title.length > 30) {
      alert('Title must be 30 characters or less');
      return;
    }

    if (editingItem.description.length > 255) {
      alert('Description must be 255 characters or less');
      return;
    }

    const items = getActiveItems();
    const updated = items.map(item => 
      item.id === editingItem.id ? editingItem : item
    );
    setActiveItems(updated);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this item?')) return;
    
    const items = getActiveItems();
    const updated = items.filter(item => item.id !== id);
    setActiveItems(updated);
  };

  const handleSortAZ = () => {
    const items = getActiveItems();
    const sorted = [...items].sort((a, b) => a.title.localeCompare(b.title));
    setActiveItems(sorted.map((item, index) => ({ ...item, order: index })));
  };

  const handleSortZA = () => {
    const items = getActiveItems();
    const sorted = [...items].sort((a, b) => b.title.localeCompare(a.title));
    setActiveItems(sorted.map((item, index) => ({ ...item, order: index })));
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === id) return;

    const items = getActiveItems();
    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    setActiveItems(newItems.map((item, index) => ({ ...item, order: index })));
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Sports-specific handlers
  const handleSportDragStart = (id: string) => {
    setDraggedSport(id);
  };

  const handleSportDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedSport || draggedSport === id) return;

    const draggedIndex = sports.findIndex(sport => sport.id === draggedSport);
    const targetIndex = sports.findIndex(sport => sport.id === id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSports = [...sports];
    const [removed] = newSports.splice(draggedIndex, 1);
    newSports.splice(targetIndex, 0, removed);

    // Update top5 status based on new positions
    const updated = newSports.map((sport, index) => ({
      ...sport,
      order: index,
      isTop5: index < 5
    }));

    setSports(updated);
  };

  const handleSportDragEnd = () => {
    setDraggedSport(null);
  };

  const top5Sports = sports.filter(s => s.isTop5).sort((a, b) => a.order - b.order);
  const otherSports = sports.filter(s => !s.isTop5).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Tools Settings</h2>
        <p className="text-gray-600 mt-1">Manage your workout periods, sections, sports, and equipment</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('periods')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'periods'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Periods
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'sections'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Workout Sections
        </button>
        <button
          onClick={() => setActiveTab('sports')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'sports'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Main Sports
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'equipment'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Equipment
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'exercises'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Exercise Bank
        </button>
      </div>

      {/* Periods & Sections Tab Content */}
      {(activeTab === 'periods' || activeTab === 'sections') && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
              <button
                onClick={handleSortAZ}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <ArrowUpAZ className="w-4 h-4" />
                A-Z
              </button>
              <button
                onClick={handleSortZA}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <ArrowDownZA className="w-4 h-4" />
                Z-A
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Drag to reorder • {getActiveItems().length} items
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getActiveItems().map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-xl border-2 p-4 cursor-move transition ${
                  draggedItem === item.id ? 'opacity-50 border-blue-500' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getActiveItems().length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600 mb-4">No items yet. Click "Add New" to get started!</p>
            </div>
          )}
        </div>
      )}

      {/* Main Sports Tab */}
      {activeTab === 'sports' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Organize Your Sports by Preference</h3>
            <p className="text-gray-600 text-sm">
              Drag sports to reorder them. Your <span className="font-semibold text-blue-600">Top 5 sports</span> will appear as quick access shortcuts throughout the app.
            </p>
          </div>

          {/* Top 5 Sports - Quick Access */}
          <div className="bg-white rounded-2xl border-2 border-blue-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                Top 5 Sports - Quick Access
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                {top5Sports.length}/5
              </span>
            </div>

            <div className="space-y-2">
              {top5Sports.map((sport, index) => (
                <div
                  key={sport.id}
                  draggable
                  onDragStart={() => handleSportDragStart(sport.id)}
                  onDragOver={(e) => handleSportDragOver(e, sport.id)}
                  onDragEnd={handleSportDragEnd}
                  className={`flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 cursor-move transition ${
                    draggedSport === sport.id ? 'opacity-50 border-blue-500' : 'border-blue-200 hover:border-blue-300'
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  
                  <div className="w-8 h-8 flex items-center justify-center text-2xl flex-shrink-0">
                    {sport.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{sport.name}</span>
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">
                        #{index + 1}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">Quick access sport</span>
                  </div>

                  <div className="text-sm text-blue-600 font-semibold">
                    Top {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Sports */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Other Sports</h3>
              <span className="text-sm text-gray-600">
                {otherSports.length} sports
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {otherSports.map((sport, index) => (
                <div
                  key={sport.id}
                  draggable
                  onDragStart={() => handleSportDragStart(sport.id)}
                  onDragOver={(e) => handleSportDragOver(e, sport.id)}
                  onDragEnd={handleSportDragEnd}
                  className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border cursor-move transition ${
                    draggedSport === sport.id ? 'opacity-50 border-gray-400' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  
                  <div className="w-6 h-6 flex items-center justify-center text-xl flex-shrink-0">
                    {sport.icon}
                  </div>

                  <span className="font-medium text-gray-700 flex-1">{sport.name}</span>

                  <span className="text-xs text-gray-500">
                    #{5 + index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">How to Use:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Drag any sport from "Other Sports" to the "Top 5" section to add it to quick access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Drag sports within "Top 5" to change their priority order</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Drag a sport from "Top 5" to "Other Sports" to remove it from quick access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Your Top 5 sports will appear as shortcuts when creating workouts</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingEquipment({ id: '', name: '', category: '', description: '', inStock: true });
                  setShowEquipmentDialog(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Equipment
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="Cardio">Cardio</option>
                <option value="Weights">Weights</option>
                <option value="Accessories">Accessories</option>
                <option value="Machines">Machines</option>
              </select>
              <div className="text-sm text-gray-600">
                {equipment.filter(e => categoryFilter === 'all' || e.category === categoryFilter).length} items
              </div>
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment
              .filter(e => categoryFilter === 'all' || e.category === categoryFilter)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEquipment(item);
                          setShowEquipmentDialog(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this equipment?')) {
                            setEquipment(equipment.filter(e => e.id !== item.id));
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {item.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                    </span>
                    <button
                      onClick={() => {
                        setEquipment(equipment.map(e => 
                          e.id === item.id ? { ...e, inStock: !e.inStock } : e
                        ));
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {equipment.filter(e => categoryFilter === 'all' || e.category === categoryFilter).length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600">No equipment found. Click "Add Equipment" to get started!</p>
            </div>
          )}
        </div>
      )}

      {/* Exercises Tab */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingExercise({ 
                    id: '', 
                    name: '', 
                    category: '', 
                    description: '', 
                    equipment: [],
                    difficulty: 'Beginner',
                    muscleGroups: []
                  });
                  setShowExerciseDialog(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Exercise
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="Flexibility">Flexibility</option>
                <option value="Balance">Balance</option>
              </select>
              <div className="text-sm text-gray-600">
                {exercises.filter(ex => 
                  (categoryFilter === 'all' || ex.category === categoryFilter) &&
                  (searchQuery === '' || ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length} exercises
              </div>
            </div>
          </div>

          {/* Exercises Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Muscle Groups</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exercises
                  .filter(ex => 
                    (categoryFilter === 'all' || ex.category === categoryFilter) &&
                    (searchQuery === '' || ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((exercise) => (
                    <tr key={exercise.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{exercise.name}</div>
                        <div className="text-xs text-gray-500">{exercise.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                          {exercise.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {exercise.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {exercise.equipment.length > 0 ? exercise.equipment.join(', ') : 'None'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {exercise.muscleGroups.map((muscle, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingExercise(exercise);
                              setShowExerciseDialog(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this exercise?')) {
                                setExercises(exercises.filter(e => e.id !== exercise.id));
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

          {exercises.filter(ex => 
            (categoryFilter === 'all' || ex.category === categoryFilter) &&
            (searchQuery === '' || ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
          ).length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600">No exercises found. Try adjusting your search or add a new exercise!</p>
            </div>
          )}
        </div>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6">
              Add New {activeTab === 'periods' ? 'Period' : 'Section'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-gray-500">(max 30 characters)</span>
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value.slice(0, 30) })}
                  placeholder="Enter title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={30}
                />
                <div className="text-xs text-gray-500 mt-1">{newItem.title.length}/30</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-gray-500">(max 255 characters)</span>
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value.slice(0, 255) })}
                  placeholder="Enter description..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={255}
                />
                <div className="text-xs text-gray-500 mt-1">{newItem.description.length}/255</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: newItem.color }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'color';
                      input.value = newItem.color;
                      input.onchange = (e) => setNewItem({ ...newItem, color: (e.target as HTMLInputElement).value });
                      input.click();
                    }}
                  />
                  <input
                    type="text"
                    value={newItem.color}
                    onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAdd}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setNewItem({ title: '', description: '', color: '#3b82f6' });
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6">
              Edit {activeTab === 'periods' ? 'Period' : 'Section'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-gray-500">(max 30 characters)</span>
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value.slice(0, 30) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={30}
                />
                <div className="text-xs text-gray-500 mt-1">{editingItem.title.length}/30</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-gray-500">(max 255 characters)</span>
                </label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value.slice(0, 255) })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={255}
                />
                <div className="text-xs text-gray-500 mt-1">{editingItem.description.length}/255</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: editingItem.color }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'color';
                      input.value = editingItem.color;
                      input.onchange = (e) => setEditingItem({ ...editingItem, color: (e.target as HTMLInputElement).value });
                      input.click();
                    }}
                  />
                  <input
                    type="text"
                    value={editingItem.color}
                    onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Dialog */}
      {showEquipmentDialog && editingEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6">
              {editingEquipment.id ? 'Edit Equipment' : 'Add New Equipment'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editingEquipment.name}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Equipment name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={editingEquipment.category}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Weights">Weights</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Machines">Machines</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingEquipment.description}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Equipment description"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={editingEquipment.inStock}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, inStock: e.target.checked })}
                  className="w-5 h-5 text-blue-600"
                />
                <label htmlFor="inStock" className="text-sm font-semibold text-gray-700">
                  In Stock
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  if (!editingEquipment.name || !editingEquipment.category) {
                    alert('Please fill in all required fields');
                    return;
                  }
                  if (editingEquipment.id) {
                    setEquipment(equipment.map(e => e.id === editingEquipment.id ? editingEquipment : e));
                  } else {
                    setEquipment([...equipment, { ...editingEquipment, id: Date.now().toString() }]);
                  }
                  setShowEquipmentDialog(false);
                  setEditingEquipment(null);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {editingEquipment.id ? 'Save' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setShowEquipmentDialog(false);
                  setEditingEquipment(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Dialog */}
      {showExerciseDialog && editingExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingExercise.id ? 'Edit Exercise' : 'Add New Exercise'}
            </h3>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exercise Name</label>
                  <input
                    type="text"
                    value={editingExercise.name}
                    onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Exercise name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={editingExercise.category}
                    onChange={(e) => setEditingExercise({ ...editingExercise, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Balance">Balance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={editingExercise.difficulty}
                    onChange={(e) => setEditingExercise({ ...editingExercise, difficulty: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingExercise.description}
                    onChange={(e) => setEditingExercise({ ...editingExercise, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Exercise description"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Required Equipment (comma-separated)</label>
                  <input
                    type="text"
                    value={editingExercise.equipment.join(', ')}
                    onChange={(e) => setEditingExercise({ ...editingExercise, equipment: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Dumbbells, Bench, Resistance Bands"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Muscle Groups (comma-separated)</label>
                  <input
                    type="text"
                    value={editingExercise.muscleGroups.join(', ')}
                    onChange={(e) => setEditingExercise({ ...editingExercise, muscleGroups: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Chest, Triceps, Shoulders"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  if (!editingExercise.name || !editingExercise.category) {
                    alert('Please fill in all required fields');
                    return;
                  }
                  if (editingExercise.id) {
                    setExercises(exercises.map(e => e.id === editingExercise.id ? editingExercise : e));
                  } else {
                    setExercises([...exercises, { ...editingExercise, id: Date.now().toString() }]);
                  }
                  setShowExerciseDialog(false);
                  setEditingExercise(null);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {editingExercise.id ? 'Save' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setShowExerciseDialog(false);
                  setEditingExercise(null);
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
