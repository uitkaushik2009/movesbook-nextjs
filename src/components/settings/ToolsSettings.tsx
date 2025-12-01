'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, ArrowUpAZ, ArrowDownZA, Save, X, Download, Globe, Image as ImageIcon, Smile } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type IconType = 'emoji' | 'bw_icons';

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

interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: 'Watch' | 'Tracker' | 'Monitor' | 'Scale' | 'Sensor' | 'Other';
  compatibility: string[];
  isEnabled: boolean;
  syncProtocol: string;
  description: string;
}

export default function ToolsSettings() {
  const { t, currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'periods' | 'sections' | 'sports' | 'equipment' | 'exercises' | 'devices'>('periods');
  const [periods, setPeriods] = useState<Period[]>([]);
  const [sections, setSections] = useState<WorkoutSection[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [editingItem, setEditingItem] = useState<Period | WorkoutSection | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', color: '#3b82f6' });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedSport, setDraggedSport] = useState<string | null>(null);
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [showDeviceDialog, setShowDeviceDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Language-specific defaults state
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage || 'en');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  
  // Icon type preference
  const [iconType, setIconType] = useState<IconType>('emoji');
  const [isLoadingIconPreference, setIsLoadingIconPreference] = useState(true);
  
  // Save status
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  
  // Auto-update selected language when user's language changes
  useEffect(() => {
    if (currentLanguage) {
      setSelectedLanguage(currentLanguage);
    }
  }, [currentLanguage]);
  
  // Load icon type preference from settings
  useEffect(() => {
    const loadIconTypePreference = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoadingIconPreference(false);
          return;
        }
        
        const response = await fetch('/api/user/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const settings = await response.json();
          setIconType(settings.sportIconType || 'emoji');
        }
      } catch (error) {
        console.error('Error loading icon type preference:', error);
      } finally {
        setIsLoadingIconPreference(false);
      }
    };
    
    loadIconTypePreference();
  }, []);
  
  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ja', name: '日本語' },
    { code: 'id', name: 'Indonesia' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
  ];

  // Load all tools settings from database first, then fallback to localStorage
  useEffect(() => {
    loadToolsSettingsFromDatabase();
  }, []);

  const loadToolsSettingsFromDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const settings = await response.json();
        const toolsSettings = settings.toolsSettings || {};

        // Load from database if available
        if (toolsSettings.periods && toolsSettings.periods.length > 0) {
          setPeriods(toolsSettings.periods);
        } else {
          loadPeriodsFromLocalStorage();
        }

        if (toolsSettings.sections && toolsSettings.sections.length > 0) {
          setSections(toolsSettings.sections);
        } else {
          loadSectionsFromLocalStorage();
        }

        if (toolsSettings.sports && toolsSettings.sports.length > 0) {
          setSports(toolsSettings.sports);
        } else {
          loadSportsFromLocalStorage();
        }

        if (toolsSettings.equipment && toolsSettings.equipment.length > 0) {
          setEquipment(toolsSettings.equipment);
        } else {
          loadEquipmentFromLocalStorage();
        }

        if (toolsSettings.exercises && toolsSettings.exercises.length > 0) {
          setExercises(toolsSettings.exercises);
        } else {
          loadExercisesFromLocalStorage();
        }

        if (toolsSettings.devices && toolsSettings.devices.length > 0) {
          setDevices(toolsSettings.devices);
        } else {
          loadDevicesFromLocalStorage();
        }
      } else {
        // Fallback to localStorage if API fails
        loadAllFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading tools settings from database:', error);
      // Fallback to localStorage on error
      loadAllFromLocalStorage();
    }
  };

  const loadAllFromLocalStorage = () => {
    loadPeriodsFromLocalStorage();
    loadSectionsFromLocalStorage();
    loadSportsFromLocalStorage();
    loadEquipmentFromLocalStorage();
    loadExercisesFromLocalStorage();
    loadDevicesFromLocalStorage();
  };

  const loadPeriodsFromLocalStorage = () => {
    const savedPeriods = localStorage.getItem('workoutPeriods');
    if (savedPeriods) {
      try {
        setPeriods(JSON.parse(savedPeriods));
      } catch (e) {
        console.error('Failed to load periods');
        setDefaultPeriods();
      }
    } else {
      setDefaultPeriods();
    }
  };

  const loadSectionsFromLocalStorage = () => {
    const savedSections = localStorage.getItem('workoutSections');
    if (savedSections) {
      try {
        setSections(JSON.parse(savedSections));
      } catch (e) {
        console.error('Failed to load sections');
        setDefaultSections();
      }
    } else {
      setDefaultSections();
    }
  };

  const loadSportsFromLocalStorage = () => {
    const savedSports = localStorage.getItem('mainSports');
    if (savedSports) {
      try {
        setSports(JSON.parse(savedSports));
      } catch (e) {
        console.error('Failed to load sports');
        setDefaultSports();
      }
    } else {
      setDefaultSports();
    }
  };

  const setDefaultPeriods = () => {
    setPeriods([
      { id: '1', title: 'Preparation Phase', description: 'Building base fitness', color: '#3b82f6', order: 0 },
      { id: '2', title: 'Competition Phase', description: 'Peak performance period', color: '#ef4444', order: 1 },
      { id: '3', title: 'Recovery Phase', description: 'Active recovery and rest', color: '#10b981', order: 2 },
    ]);
  };

  const setDefaultSections = () => {
    setSections([
      { id: '1', title: 'Warm-up', description: 'Preparation exercises', color: '#f59e0b', order: 0 },
      { id: '2', title: 'Main Set', description: 'Primary workout', color: '#3b82f6', order: 1 },
      { id: '3', title: 'Cool-down', description: 'Recovery exercises', color: '#10b981', order: 2 },
    ]);
  };

  const setDefaultSports = () => {
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
  };

  const loadEquipmentFromLocalStorage = () => {
    const savedEquipment = localStorage.getItem('equipment');
    if (savedEquipment) {
      try {
        setEquipment(JSON.parse(savedEquipment));
      } catch (e) {
        console.error('Failed to load equipment');
        setDefaultEquipment();
      }
    } else {
      setDefaultEquipment();
    }
  };

  const loadExercisesFromLocalStorage = () => {
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
      try {
        setExercises(JSON.parse(savedExercises));
      } catch (e) {
        console.error('Failed to load exercises');
        setDefaultExercises();
      }
    } else {
      setDefaultExercises();
    }
  };

  const loadDevicesFromLocalStorage = () => {
    const savedDevices = localStorage.getItem('compatibleDevices');
    if (savedDevices) {
      try {
        setDevices(JSON.parse(savedDevices));
      } catch (e) {
        console.error('Failed to load devices');
        setDefaultDevices();
      }
    } else {
      setDefaultDevices();
    }
  };

  const setDefaultEquipment = () => {
    setEquipment([
      { id: '1', name: 'Treadmill', category: 'Cardio', description: 'Indoor running machine', inStock: true },
      { id: '2', name: 'Dumbbells', category: 'Weights', description: 'Free weights for strength training', inStock: true },
      { id: '3', name: 'Barbell', category: 'Weights', description: 'Long bar for heavy lifting', inStock: true },
      { id: '4', name: 'Rowing Machine', category: 'Cardio', description: 'Full body cardio equipment', inStock: true },
      { id: '5', name: 'Resistance Bands', category: 'Accessories', description: 'Elastic bands for resistance training', inStock: true },
    ]);
  };

  const setDefaultExercises = () => {
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
  };

  const setDefaultDevices = () => {
    setDevices([
      { 
        id: '1', 
        name: 'Apple Watch', 
        brand: 'Apple',
        model: 'Series 8, 9, Ultra',
        type: 'Watch', 
        compatibility: ['iOS', 'watchOS'],
        isEnabled: true,
        syncProtocol: 'HealthKit',
        description: 'Syncs workout data via HealthKit API'
      },
      { 
        id: '2', 
        name: 'Garmin Forerunner', 
        brand: 'Garmin',
        model: '945, 955, 965',
        type: 'Watch', 
        compatibility: ['Garmin Connect'],
        isEnabled: true,
        syncProtocol: 'Garmin API',
        description: 'Advanced GPS running and triathlon watch'
      },
      { 
        id: '3', 
        name: 'Fitbit Charge', 
        brand: 'Fitbit',
        model: 'Charge 5, 6',
        type: 'Tracker', 
        compatibility: ['iOS', 'Android'],
        isEnabled: true,
        syncProtocol: 'Fitbit API',
        description: 'Fitness tracker with heart rate monitoring'
      },
      { 
        id: '4', 
        name: 'Polar H10', 
        brand: 'Polar',
        model: 'H10',
        type: 'Monitor', 
        compatibility: ['Bluetooth', 'ANT+'],
        isEnabled: true,
        syncProtocol: 'Bluetooth LE',
        description: 'Chest strap heart rate monitor'
      },
      { 
        id: '5', 
        name: 'Withings Body+', 
        brand: 'Withings',
        model: 'Body+',
        type: 'Scale', 
        compatibility: ['Wi-Fi', 'Bluetooth'],
        isEnabled: true,
        syncProtocol: 'Withings API',
        description: 'Smart scale with body composition analysis'
      },
    ]);
  };

  // Save all tools settings to database
  const saveToolsSettingsToDatabase = async (showAlert = false) => {
    try {
      setIsSavingToDatabase(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found - user not logged in');
        if (showAlert) {
          alert('❌ Please login first to save settings');
        }
        return;
      }
      
      const toolsSettings = {
        periods,
        sections,
        sports,
        equipment,
        exercises,
        devices
      };

      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ toolsSettings })
      });

      if (response.ok) {
        setLastSavedTime(new Date());
        console.log('✅ Tools settings saved to database');
        if (showAlert) {
          alert('✅ All tools settings saved to database successfully!');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to save tools settings:', response.status, errorData);
        if (showAlert) {
          alert(`❌ Failed to save settings: ${errorData.error || response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error saving tools settings to database:', error);
      if (showAlert) {
        alert('❌ Error saving settings to database: ' + (error as Error).message);
      }
    } finally {
      setIsSavingToDatabase(false);
    }
  };

  // Manual save handler (triggered by button click)
  const handleManualSave = () => {
    saveToolsSettingsToDatabase(true);
  };

  // Debounced auto-save to database (prevent spam)
  useEffect(() => {
    // Don't auto-save if data is being loaded initially
    if (periods.length === 0 && sections.length === 0 && sports.length === 0) {
      return;
    }
    
    // Save to localStorage immediately (backup)
    if (periods.length > 0) localStorage.setItem('workoutPeriods', JSON.stringify(periods));
    if (sections.length > 0) localStorage.setItem('workoutSections', JSON.stringify(sections));
    if (sports.length > 0) localStorage.setItem('mainSports', JSON.stringify(sports));
    if (equipment.length > 0) localStorage.setItem('equipment', JSON.stringify(equipment));
    if (exercises.length > 0) localStorage.setItem('exercises', JSON.stringify(exercises));
    if (devices.length > 0) localStorage.setItem('compatibleDevices', JSON.stringify(devices));
    
    // Debounce database save (wait 1 second after last change)
    const timeoutId = setTimeout(() => {
      saveToolsSettingsToDatabase(false);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [periods, sections, sports, equipment, exercises, devices]);

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

  // Language-specific defaults handlers
  const saveLanguageDefaults = async () => {
    setShowPasswordDialog(true);
  };

  const loadLanguageDefaults = async () => {
    setShowLoadDialog(true);
  };

  const handlePasswordSubmit = async () => {
    if (!superAdminPassword.trim()) {
      alert('❌ Please enter Super Admin password');
      return;
    }

    try {
      const toolsData = {
        periods,
        sections,
        sports,
        equipment,
        exercises,
        devices
      };

      const response = await fetch('/api/admin/tools-defaults/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          toolsData,
          password: superAdminPassword
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Default tools settings saved for ${supportedLanguages.find(l => l.code === selectedLanguage)?.name}!`);
        setShowPasswordDialog(false);
        setSuperAdminPassword('');
      } else {
        alert(`❌ ${data.error || 'Failed to save defaults'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error saving defaults');
    }
  };

  const handleLoadConfirm = async () => {
    try {
      // Always load from English (en) as the base/default language
      const response = await fetch(`/api/admin/tools-defaults/load?language=en`);
      const data = await response.json();

      if (response.ok && data.toolsData) {
        // Load English settings into current language for translation
        if (data.toolsData.periods) {
          setPeriods(prev => [...prev, ...data.toolsData.periods.filter((p: Period) => 
            !prev.some(existing => existing.id === p.id)
          )]);
        }
        if (data.toolsData.sections) {
          setSections(prev => [...prev, ...data.toolsData.sections.filter((s: WorkoutSection) => 
            !prev.some(existing => existing.id === s.id)
          )]);
        }
        if (data.toolsData.sports) {
          setSports(prev => [...prev, ...data.toolsData.sports.filter((s: Sport) => 
            !prev.some(existing => existing.id === s.id)
          )]);
        }
        if (data.toolsData.equipment) {
          setEquipment(prev => [...prev, ...data.toolsData.equipment.filter((e: Equipment) => 
            !prev.some(existing => existing.id === e.id)
          )]);
        }
        if (data.toolsData.exercises) {
          setExercises(prev => [...prev, ...data.toolsData.exercises.filter((e: Exercise) => 
            !prev.some(existing => existing.id === e.id)
          )]);
        }
        if (data.toolsData.devices) {
          setDevices(prev => [...prev, ...data.toolsData.devices.filter((d: Device) => 
            !prev.some(existing => existing.id === d.id)
          )]);
        }
        
        alert(`✅ English default settings loaded!\n\nYou can now edit and translate these items into ${supportedLanguages.find(l => l.code === selectedLanguage)?.name}, then click "Save as DEFAULT" to save them for this language.\n\nNote: Your existing items have been preserved.`);
        setShowLoadDialog(false);
      } else {
        alert(`ℹ️ No English default settings found. Please create English defaults first.`);
        setShowLoadDialog(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error loading defaults');
    }
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

  // Handle icon type change
  const handleIconTypeChange = async (newType: IconType) => {
    setIconType(newType);
    
    // Save to user settings
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sportIconType: newType })
      });
    } catch (error) {
      console.error('Error saving icon type preference:', error);
    }
  };

  // Map sport names to icon filenames
  const getSportIconFilename = (sportName: string): string => {
    const iconMap: Record<string, string> = {
      'Swimming': 'swimming.jpg',
      'Running': 'running.jpg',
      'Cycling': 'cycling.jpg',
      'Weightlifting': 'weights.jpg',
      'Football/Soccer': 'Technical/soccer.jpg',
      'Basketball': 'Technical/basketball.jpg',
      'Tennis': 'Technical/tennis.jpg',
      'Volleyball': 'volley.jpg',
      'Boxing': 'boxe.jpg',
      'Martial Arts': 'Technical/martial_arts.jpg',
      'Rowing': 'rowing.jpg',
      'Yoga': 'yoga.jpg',
      'Gymnastics': 'gymnastics.jpg',
      'Skiing': 'skiing.jpg',
      'Surfing': 'surfing.jpg',
      'Golf': 'golf.jpg',
      'Baseball': 'Technical/baseball.jpg',
      'Ice Hockey': 'ice_hockey.jpg',
      'Rugby': 'Technical/rugby.jpg',
      'Climbing': 'climbing.jpg',
    };
    return iconMap[sportName] || 'running.jpg';
  };

  // Render sport icon based on type
  const renderSportIcon = (sport: Sport) => {
    if (iconType === 'emoji') {
      return <div className="w-8 h-8 flex items-center justify-center text-2xl flex-shrink-0">{sport.icon}</div>;
    } else {
      return (
        <img 
          src={`/icons/${getSportIconFilename(sport.name)}`} 
          alt={sport.name}
          className="w-8 h-8 object-cover rounded flex-shrink-0"
        />
      );
    }
  };

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
          Personal Equipment
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
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'devices'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Device Enabled
        </button>
      </div>

      {/* Save to Database & Language Defaults */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Save to Database */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Save className="w-4 h-4 text-green-600" />
            <div>
              <span className="text-sm font-semibold text-gray-800">Personal Settings</span>
              {lastSavedTime && (
                <div className="text-xs text-gray-600">
                  Last saved: {lastSavedTime.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualSave}
            disabled={isSavingToDatabase}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            title="Save all tools settings to database (auto-saves on changes)"
          >
            {isSavingToDatabase ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save to Database
              </>
            )}
          </button>
        </div>

        {/* Language Defaults */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Language Defaults:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {supportedLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadLanguageDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              title="Load English defaults for translation into current language"
            >
              <Download className="w-3.5 h-3.5" />
              Load (EN→{supportedLanguages.find(l => l.code === selectedLanguage)?.code.toUpperCase()})
            </button>
            <button
              onClick={saveLanguageDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition font-semibold"
              title={`Save current tools as DEFAULT for ${supportedLanguages.find(l => l.code === selectedLanguage)?.name} (requires Super Admin password)`}
            >
              <Save className="w-3.5 h-3.5" />
              Save as DEFAULT
            </button>
          </div>
        </div>
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

          {/* Icon Type Selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Icon Type Preference
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleIconTypeChange('emoji')}
                disabled={isLoadingIconPreference}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                  iconType === 'emoji'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <Smile className="w-5 h-5" />
                <span className="font-medium">Colored Icons (Emoji)</span>
                <span className="text-xl ml-1">🏊🚴🏃</span>
              </button>
              
              <button
                onClick={() => handleIconTypeChange('bw_icons')}
                disabled={isLoadingIconPreference}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                  iconType === 'bw_icons'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="font-medium">Black & White Icons</span>
                <div className="flex gap-1 ml-1">
                  <img src="/icons/swimming.jpg" alt="" className="w-6 h-6 rounded" />
                  <img src="/icons/cycling.jpg" alt="" className="w-6 h-6 rounded" />
                  <img src="/icons/running.jpg" alt="" className="w-6 h-6 rounded" />
                </div>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {iconType === 'emoji' 
                ? 'System emoji icons - colorful and consistent across devices' 
                : 'Custom black & white sport icons from image library'
              }
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
                  
                  {renderSportIcon(sport)}

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
                  
                  {iconType === 'emoji' ? (
                    <div className="w-6 h-6 flex items-center justify-center text-xl flex-shrink-0">
                      {sport.icon}
                    </div>
                  ) : (
                    <img 
                      src={`/icons/${getSportIconFilename(sport.name)}`} 
                      alt={sport.name}
                      className="w-6 h-6 object-cover rounded flex-shrink-0"
                    />
                  )}

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

      {/* Personal Equipment Tab */}
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

      {/* Device Enabled Tab */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">📱</span>
              Compatible Devices
            </h3>
            <p className="text-gray-600 text-sm">
              Manage fitness devices and wearables that can sync with Movesbook. Enable/disable device integration and configure sync protocols.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingDevice({ 
                    id: '', 
                    name: '', 
                    brand: '',
                    model: '',
                    type: 'Watch',
                    compatibility: [],
                    isEnabled: true,
                    syncProtocol: '',
                    description: ''
                  });
                  setShowDeviceDialog(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Device
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Device Types</option>
                <option value="Watch">Smart Watches</option>
                <option value="Tracker">Fitness Trackers</option>
                <option value="Monitor">Heart Rate Monitors</option>
                <option value="Scale">Smart Scales</option>
                <option value="Sensor">Sensors</option>
                <option value="Other">Other Devices</option>
              </select>
              <div className="text-sm text-gray-600">
                {devices.filter(d => categoryFilter === 'all' || d.type === categoryFilter).length} devices
              </div>
            </div>
          </div>

          {/* Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices
              .filter(d => categoryFilter === 'all' || d.type === categoryFilter)
              .map((device) => (
                <div
                  key={device.id}
                  className={`bg-white rounded-xl border-2 p-5 transition ${
                    device.isEnabled ? 'border-green-200 bg-green-50/30' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{device.name}</h3>
                        <span className={`w-3 h-3 rounded-full ${device.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{device.brand} {device.model}</p>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        {device.type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingDevice(device);
                          setShowDeviceDialog(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this device?')) {
                            setDevices(devices.filter(d => d.id !== device.id));
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{device.description}</p>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">Sync:</span>
                      <span className="text-xs text-gray-700 font-medium">{device.syncProtocol}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">Compatible:</span>
                      <div className="flex flex-wrap gap-1">
                        {device.compatibility.map((comp, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className={`text-sm font-semibold ${device.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {device.isEnabled ? '✓ Enabled' : '✗ Disabled'}
                    </span>
                    <button
                      onClick={() => {
                        setDevices(devices.map(d => 
                          d.id === device.id ? { ...d, isEnabled: !d.isEnabled } : d
                        ));
                      }}
                      className="text-xs text-purple-600 hover:underline font-medium"
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {devices.filter(d => categoryFilter === 'all' || d.type === categoryFilter).length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600">No devices found. Click "Add Device" to register a compatible device!</p>
            </div>
          )}

          {/* Device Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{devices.length}</div>
              <div className="text-sm text-gray-600">Total Devices</div>
            </div>
            <div className="bg-white rounded-xl border border-green-200 p-4">
              <div className="text-2xl font-bold text-green-600">{devices.filter(d => d.isEnabled).length}</div>
              <div className="text-sm text-gray-600">Enabled</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-600">{devices.filter(d => !d.isEnabled).length}</div>
              <div className="text-sm text-gray-600">Disabled</div>
            </div>
          </div>
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

      {/* Device Dialog */}
      {showDeviceDialog && editingDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-2xl">📱</span>
              {editingDevice.id ? 'Edit Device' : 'Add New Compatible Device'}
            </h3>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Device Name *</label>
                  <input
                    type="text"
                    value={editingDevice.name}
                    onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Apple Watch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Brand *</label>
                  <input
                    type="text"
                    value={editingDevice.brand}
                    onChange={(e) => setEditingDevice({ ...editingDevice, brand: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Apple, Garmin, Fitbit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                  <input
                    type="text"
                    value={editingDevice.model}
                    onChange={(e) => setEditingDevice({ ...editingDevice, model: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Series 9, Forerunner 945"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Device Type *</label>
                  <select
                    value={editingDevice.type}
                    onChange={(e) => setEditingDevice({ ...editingDevice, type: e.target.value as Device['type'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Watch">Smart Watch</option>
                    <option value="Tracker">Fitness Tracker</option>
                    <option value="Monitor">Heart Rate Monitor</option>
                    <option value="Scale">Smart Scale</option>
                    <option value="Sensor">Sensor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sync Protocol *</label>
                  <input
                    type="text"
                    value={editingDevice.syncProtocol}
                    onChange={(e) => setEditingDevice({ ...editingDevice, syncProtocol: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Bluetooth LE, HealthKit, Garmin API, ANT+"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Compatibility (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingDevice.compatibility.join(', ')}
                    onChange={(e) => setEditingDevice({ 
                      ...editingDevice, 
                      compatibility: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., iOS, Android, Windows, macOS, Bluetooth, Wi-Fi"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingDevice.description}
                    onChange={(e) => setEditingDevice({ ...editingDevice, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Device description and features"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="deviceEnabled"
                      checked={editingDevice.isEnabled}
                      onChange={(e) => setEditingDevice({ ...editingDevice, isEnabled: e.target.checked })}
                      className="w-5 h-5 text-purple-600"
                    />
                    <label htmlFor="deviceEnabled" className="text-sm font-semibold text-gray-700">
                      Enable this device for app integration
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-8">
                    Enabled devices will be available for users to connect and sync workout data
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  if (!editingDevice.name || !editingDevice.brand || !editingDevice.syncProtocol) {
                    alert('Please fill in all required fields (Name, Brand, Sync Protocol)');
                    return;
                  }
                  if (editingDevice.id) {
                    setDevices(devices.map(d => d.id === editingDevice.id ? editingDevice : d));
                  } else {
                    setDevices([...devices, { ...editingDevice, id: Date.now().toString() }]);
                  }
                  setShowDeviceDialog(false);
                  setEditingDevice(null);
                }}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                {editingDevice.id ? 'Save Device' : 'Add Device'}
              </button>
              <button
                onClick={() => {
                  setShowDeviceDialog(false);
                  setEditingDevice(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">🔐 Super Admin Authentication</h3>
            <p className="text-gray-600 mb-4">
              You are about to save the current tools settings as <strong>DEFAULT</strong> for <strong>{supportedLanguages.find(l => l.code === selectedLanguage)?.name}</strong>.
            </p>
            <p className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg mb-4">
              📌 <strong>Note:</strong> These settings will be automatically loaded when users select {supportedLanguages.find(l => l.code === selectedLanguage)?.name} as their language for the first time.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Super Admin Password:
              </label>
              <input
                type="password"
                value={superAdminPassword}
                onChange={(e) => setSuperAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
              >
                Save Defaults
              </button>
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setSuperAdminPassword('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Language Defaults Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">📥 Load English Defaults for Translation</h3>
            <p className="text-gray-600 mb-4">
              Load <strong>English</strong> default tools settings into <strong>{supportedLanguages.find(l => l.code === selectedLanguage)?.name}</strong> for translation?
            </p>
            <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg mb-4">
              📖 <strong>How it works:</strong> This will load the English defaults, which you can then edit/translate into {supportedLanguages.find(l => l.code === selectedLanguage)?.name}. After translation, click "Save as DEFAULT" to save them for {supportedLanguages.find(l => l.code === selectedLanguage)?.name}.
            </p>
            <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg mb-4">
              ⚠️ <strong>Note:</strong> Your existing items will be preserved (no duplicates will be added).
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLoadConfirm}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
              >
                Load Defaults
              </button>
              <button
                onClick={() => setShowLoadDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
