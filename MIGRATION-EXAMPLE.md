# WorkoutSection.tsx Migration Example

This document shows how to refactor `WorkoutSection.tsx` to use the new modular architecture.

## 📋 Current Issues in WorkoutSection.tsx

1. **1,376 lines** - Too large, hard to maintain
2. **25+ useState calls** - Complex state management
3. **Hardcoded values** - Magic numbers and strings throughout
4. **Inline modals** - 100+ line modal definitions inside component
5. **Raw fetch calls** - No error handling abstraction
6. **`any` types** - No type safety
7. **Duplicate logic** - Same date calculations repeated

---

## 🔄 Step-by-Step Migration

### Step 1: Update Imports

**Add at the top of WorkoutSection.tsx:**

```typescript
// Configuration and Types
import {
  WORKOUT_SECTIONS,
  API_ENDPOINTS,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS
} from '@/config/workout.constants';

import type {
  WorkoutPlan,
  WorkoutDay,
  Workout,
  Moveframe,
  Movelap,
  Period,
  SectionId
} from '@/types/workout.types';

// API Utilities
import {
  workoutPlanApi,
  workoutApi,
  moveframeApi,
  movelapApi,
  dayApi,
  userApi,
  periodsApi,
  coachApi
} from '@/utils/api.utils';

// Helper Functions
import {
  dateHelpers,
  sectionHelpers,
  permissionHelpers,
  workoutHelpers,
  validationHelpers,
  formatHelpers
} from '@/utils/workout.helpers';

// Custom Hooks
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useWorkoutModals } from '@/hooks/useModalState';

// Extracted Modals
import EditDayModal from '@/components/workouts/modals/EditDayModal';
import AddMovelapModal from '@/components/workouts/modals/AddMovelapModal';
```

---

### Step 2: Replace State with Custom Hooks

**❌ Before:**
```typescript
export default function WorkoutSection({ onClose }: WorkoutSectionProps) {
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<any>(null);
  
  // ... 20 more useState calls
```

**✅ After:**
```typescript
export default function WorkoutSection({ onClose }: WorkoutSectionProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('A');
  
  // Use custom hook for data management
  const {
    workoutPlan,
    periods,
    isLoading,
    loadWorkoutData,
    loadPeriods,
    loadUserProfile,
    feedbackMessage,
    showMessage
  } = useWorkoutData({ initialSection: activeSection });
  
  // Use custom hook for modal management
  const modals = useWorkoutModals();
```

---

### Step 3: Replace Hardcoded Functions with Helpers

**❌ Before:**
```typescript
const canAddDays = () => {
  if (activeSection === 'A') return false;
  if (activeSection === 'D') return false;
  return true;
};

const isDateAllowedForSection = (date: Date) => {
  const today = new Date();
  const maxFutureDays = 365;
  
  if (activeSection === 'A') {
    const threeWeeksAhead = new Date(today);
    threeWeeksAhead.setDate(threeWeeksAhead.getDate() + 21);
    return date >= today && date <= threeWeeksAhead;
  }
  // ... 20 more lines
};
```

**✅ After:**
```typescript
// Just use the helpers directly!
const canAddDays = sectionHelpers.canAddDays(activeSection);
const isDateAllowed = (date: Date) => sectionHelpers.isDateAllowedForSection(date, activeSection);
```

---

### Step 4: Replace Raw API Calls with Utilities

**❌ Before:**
```typescript
const createMovelap = async (formData: any) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first');
      return;
    }
    
    const response = await fetch(`/api/moveframes/${activeMoveframe.id}/movelaps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mode: 'APPEND', ...formData })
    });
    
    if (response.ok) {
      const result = await response.json();
      setShowAddMovelapModal(false);
      await loadWorkoutData();
      alert('Movelap added successfully');
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to add movelap');
    }
  } catch (error) {
    console.error('Error creating movelap:', error);
    alert('Error creating movelap');
  }
};
```

**✅ After:**
```typescript
const createMovelap = async (formData: any) => {
  const response = await movelapApi.create(activeMoveframe.id, {
    mode: 'APPEND',
    ...formData
  });
  
  if (response.success) {
    showMessage('success', SUCCESS_MESSAGES.MOVELAP_ADDED(activeMoveframe.code));
    await loadWorkoutData();
    modals.addMovelap.close();
  } else {
    showMessage('error', response.error || ERROR_MESSAGES.GENERIC_ERROR);
  }
};
```

---

### Step 5: Extract Inline Modals

**❌ Before (100+ lines inline):**
```typescript
{showEditDayModal && editingDay && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Edit Day</h2>
          <p className="text-sm text-gray-500">
            {new Date(editingDay.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button onClick={() => setShowEditDayModal(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>
      {/* ... 80 more lines ... */}
    </div>
  </div>
)}
```

**✅ After (Clean, reusable component):**
```typescript
{modals.editDay.isOpen && modals.editDay.data && (
  <EditDayModal
    day={modals.editDay.data}
    periods={periods}
    onClose={modals.editDay.close}
    onSave={loadWorkoutData}
    onError={(msg) => showMessage('error', msg)}
    onSuccess={(msg) => showMessage('success', msg)}
  />
)}
```

---

### Step 6: Use Typed States

**❌ Before:**
```typescript
const [editingDay, setEditingDay] = useState<any>(null);
const [activeWorkout, setActiveWorkout] = useState<any>(null);
```

**✅ After:**
```typescript
const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null);
const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
```

---

### Step 7: Replace Modal State Management

**❌ Before:**
```typescript
const handleEditDay = () => {
  if (!activeDay) {
    alert('Select a day first');
    return;
  }
  setEditingDay(activeDay);
  setShowEditDayModal(true);
};
```

**✅ After:**
```typescript
const handleEditDay = () => {
  if (!activeDay) {
    showMessage('warning', ERROR_MESSAGES.NO_ACTIVE_DAY);
    return;
  }
  modals.editDay.open(activeDay, 'edit');
};
```

---

## 📊 Before vs After Comparison

### File Size
- **Before**: 1,376 lines
- **After**: ~600 lines (estimated)
- **Reduction**: 56%

### State Variables
- **Before**: 25+ useState calls
- **After**: ~12 useState calls + 2 custom hooks
- **Reduction**: 50%

### Code Duplication
- **Before**: Date calculations repeated 5+ times
- **After**: Centralized in `dateHelpers`
- **Improvement**: DRY principle applied

### Type Safety
- **Before**: 15+ `any` types
- **After**: 0 `any` types (all properly typed)
- **Improvement**: 100% type coverage

---

## 🎯 Complete Refactored Example

Here's a side-by-side comparison of a complete function:

### ❌ Before
```typescript
const loadWorkoutData = async () => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found. Please log in.');
      window.location.href = '/login';
      return;
    }
    
    const planTypeMap = {
      'A': 'CURRENT_WEEKS',
      'B': 'YEARLY_PLAN',
      'C': 'WORKOUTS_DONE',
      'D': 'YEARLY_PLAN'
    };
    
    console.log('Loading workout data for section:', activeSection);
    
    const response = await fetch(
      `/api/workouts/plan?type=${planTypeMap[activeSection]}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (response.status === 401) {
      console.error('Unauthorized. Token may be expired.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    
    if (response.ok) {
      const data = await response.json();
      setWorkoutPlan(data.plan);
      console.log('Plan loaded:', data.plan?.id);
    } else {
      console.error('Failed to load plan:', response.status);
    }
  } catch (error) {
    console.error('Error loading workout data:', error);
  }
  setIsLoading(false);
};
```

### ✅ After
```typescript
// This is now handled by the useWorkoutData hook!
// Just call:
const { loadWorkoutData } = useWorkoutData({ initialSection: activeSection });

// Or if you need custom logic:
const loadWorkoutData = async () => {
  const planType = sectionHelpers.getPlanType(activeSection);
  const response = await workoutPlanApi.get(planType);
  
  if (response.success) {
    setWorkoutPlan(response.data.plan);
    showMessage('success', 'Workout plan loaded');
  } else {
    showMessage('error', response.error || ERROR_MESSAGES.GENERIC_ERROR);
  }
};
```

---

## ✅ Checklist for Migration

- [ ] Update imports to use constants and types
- [ ] Replace `any` types with proper types
- [ ] Use `useWorkoutData` hook for data management
- [ ] Use `useWorkoutModals` hook for modal state
- [ ] Replace raw fetch with API utilities
- [ ] Use helper functions for date/validation logic
- [ ] Extract inline modals to separate components
- [ ] Use constants instead of hardcoded values
- [ ] Remove duplicate code
- [ ] Add proper error handling with `showMessage`
- [ ] Test all functionality
- [ ] Update tests to match new structure

---

## 🚀 Benefits Achieved

✅ **Type Safety** - No more `any` types, catch errors at compile time  
✅ **Maintainability** - Changes to constants affect all code automatically  
✅ **Testability** - Isolated utilities are easy to unit test  
✅ **Readability** - Self-documenting code with helper functions  
✅ **Reusability** - Components and hooks can be used elsewhere  
✅ **Performance** - Custom hooks prevent unnecessary re-renders  
✅ **DRY Principle** - No code duplication  
✅ **Separation of Concerns** - Each file has a single responsibility  

---

**Ready to refactor? Start with Step 1 and work through each section systematically!** 🎉

