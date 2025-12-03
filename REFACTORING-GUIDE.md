# Workout System Refactoring Guide

This guide explains the modular architecture and how to use the refactored workout system components.

## 📁 Project Structure

```
src/
├── config/
│   └── workout.constants.ts       # Centralized configuration constants
├── types/
│   └── workout.types.ts           # TypeScript type definitions
├── utils/
│   ├── api.utils.ts              # API utility functions
│   └── workout.helpers.ts        # Helper functions (date, validation, etc.)
├── hooks/
│   ├── useWorkoutData.ts         # Custom hook for workout data management
│   └── useModalState.ts          # Custom hook for modal state management
└── components/workouts/
    └── modals/
        ├── EditDayModal.tsx       # Extracted Edit Day modal
        └── AddMovelapModal.tsx    # Extracted Add Movelap modal
```

---

## 🔧 Usage Examples

### 1. Using Constants Instead of Hardcoding

**❌ Before (Hardcoded):**
```typescript
if (activeSection === 'A') {
  const threeWeeksAhead = new Date(today);
  threeWeeksAhead.setDate(threeWeeksAhead.getDate() + 21);
  // ...
}
```

**✅ After (Using Constants):**
```typescript
import { WORKOUT_SECTIONS, DATE_RANGES } from '@/config/workout.constants';
import { dateHelpers } from '@/utils/workout.helpers';

if (activeSection === 'A') {
  const threeWeeksAhead = dateHelpers.addDays(today, DATE_RANGES.CURRENT_WEEKS.days);
  // ...
}
```

### 2. Using API Utilities Instead of Raw Fetch

**❌ Before (Hardcoded Fetch):**
```typescript
const token = localStorage.getItem('token');
const response = await fetch(`/api/workouts/days/${dayId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

**✅ After (Using API Utils):**
```typescript
import { dayApi } from '@/utils/api.utils';

const response = await dayApi.update(dayId, data);
if (response.success) {
  // Handle success
} else {
  // Handle error: response.error
}
```

### 3. Using TypeScript Types Instead of 'any'

**❌ Before:**
```typescript
const [workoutPlan, setWorkoutPlan] = useState<any>(null);
const [selectedDay, setSelectedDay] = useState<any>(null);
```

**✅ After:**
```typescript
import type { WorkoutPlan, WorkoutDay } from '@/types/workout.types';

const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
```

### 4. Using Helper Functions

**❌ Before:**
```typescript
const day = date.getDay();
const weekday = day === 0 ? 7 : day; // Convert Sunday=0 to Sunday=7
```

**✅ After:**
```typescript
import { dateHelpers } from '@/utils/workout.helpers';

const weekday = dateHelpers.getWeekday(date);
```

### 5. Using Custom Hooks

**❌ Before (State Management in Component):**
```typescript
export default function WorkoutSection() {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadWorkoutData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workouts/plan?type=...`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // ... lots of code
    } catch (error) {
      // ... error handling
    }
    setIsLoading(false);
  };
  
  // ... 1000+ more lines
}
```

**✅ After (Using Custom Hook):**
```typescript
import { useWorkoutData } from '@/hooks/useWorkoutData';

export default function WorkoutSection() {
  const {
    workoutPlan,
    periods,
    isLoading,
    loadWorkoutData,
    showMessage
  } = useWorkoutData({ initialSection: 'A' });
  
  // Component is now much cleaner!
}
```

### 6. Using Extracted Modal Components

**❌ Before (Inline Modal):**
```typescript
{showEditDayModal && editingDay && (
  <div className="fixed inset-0 bg-black bg-opacity-50...">
    <div className="bg-white rounded-lg...">
      {/* 100+ lines of modal code inline */}
    </div>
  </div>
)}
```

**✅ After (Extracted Component):**
```typescript
import EditDayModal from '@/components/workouts/modals/EditDayModal';

{showEditDayModal && editingDay && (
  <EditDayModal
    day={editingDay}
    periods={periods}
    onClose={() => setShowEditDayModal(false)}
    onSave={loadWorkoutData}
    onError={showMessage.bind(null, 'error')}
    onSuccess={showMessage.bind(null, 'success')}
  />
)}
```

### 7. Using Modal State Hook

**❌ Before:**
```typescript
const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
const [addWorkoutDay, setAddWorkoutDay] = useState(null);
const [workoutModalMode, setWorkoutModalMode] = useState('add');

// Open modal
setAddWorkoutDay(day);
setWorkoutModalMode('add');
setShowAddWorkoutModal(true);

// Close modal
setShowAddWorkoutModal(false);
setAddWorkoutDay(null);
```

**✅ After:**
```typescript
import { useModalState } from '@/hooks/useModalState';

const addWorkoutModal = useModalState();

// Open modal
addWorkoutModal.open(day, 'add');

// Close modal
addWorkoutModal.close();

// Use in JSX
{addWorkoutModal.isOpen && (
  <AddWorkoutModal
    day={addWorkoutModal.data}
    mode={addWorkoutModal.mode}
    onClose={addWorkoutModal.close}
  />
)}
```

---

## 🎯 Migration Strategy

To migrate existing code to use the refactored modules:

### Phase 1: Update Imports
1. Replace hardcoded values with imports from `workout.constants.ts`
2. Add type imports from `workout.types.ts`

### Phase 2: Replace API Calls
1. Replace raw `fetch()` calls with functions from `api.utils.ts`
2. Update error handling to use `ApiResponse` type

### Phase 3: Use Helper Functions
1. Replace date manipulation with `dateHelpers`
2. Replace validation logic with `validationHelpers`
3. Replace permission checks with `permissionHelpers`

### Phase 4: Extract Components
1. Move inline modals to separate component files
2. Use extracted modal components in parent

### Phase 5: Use Custom Hooks
1. Move data fetching logic to `useWorkoutData` hook
2. Move modal state management to `useModalState` hook

---

## 📚 API Reference

### Constants (`workout.constants.ts`)

| Constant | Description |
|----------|-------------|
| `WORKOUT_SECTIONS` | Configuration for sections A, B, C, D |
| `API_ENDPOINTS` | All API endpoint URLs |
| `UI_CONFIG` | UI-related constants (timeouts, limits) |
| `VIEW_MODES` | Available view modes |
| `USER_ROLES` | User role constants |
| `DATE_RANGES` | Date range configurations |
| `ERROR_MESSAGES` | Standard error messages |
| `SUCCESS_MESSAGES` | Standard success messages |
| `VALIDATION` | Validation rules |
| `STORAGE_KEYS` | LocalStorage key names |

### API Utils (`api.utils.ts`)

| Function | Description |
|----------|-------------|
| `apiFetch<T>()` | Base fetch wrapper with auth |
| `workoutPlanApi` | Workout plan CRUD operations |
| `workoutApi` | Workout CRUD operations |
| `moveframeApi` | Moveframe CRUD operations |
| `movelapApi` | Movelap CRUD operations |
| `dayApi` | Day CRUD operations |
| `userApi` | User settings and profile |
| `periodsApi` | Period CRUD operations |
| `coachApi` | Coach-specific operations |

### Helper Functions (`workout.helpers.ts`)

| Helper | Functions |
|--------|-----------|
| `dateHelpers` | Date manipulation and formatting |
| `sectionHelpers` | Section-specific logic |
| `permissionHelpers` | Permission checking |
| `workoutHelpers` | Workout calculations |
| `validationHelpers` | Input validation |
| `formatHelpers` | Display formatting |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useWorkoutData()` | Manage workout data loading and state |
| `useModalState()` | Manage individual modal state |
| `useWorkoutModals()` | Manage multiple modal states |

---

## ✅ Benefits of Refactoring

### 1. **Type Safety**
- Replaced `any` types with proper TypeScript types
- Catch errors at compile time instead of runtime

### 2. **Code Reusability**
- Extracted logic into reusable functions
- DRY principle (Don't Repeat Yourself)

### 3. **Maintainability**
- Centralized configuration
- Easy to update constants in one place
- Clear separation of concerns

### 4. **Testability**
- Isolated utility functions are easy to unit test
- Mock API calls at the utility layer

### 5. **Readability**
- Smaller, focused components
- Self-documenting code through helper functions
- Consistent naming conventions

### 6. **Performance**
- Custom hooks prevent unnecessary re-renders
- Memoized callbacks

---

## 🚀 Next Steps

1. **Gradually migrate existing components** to use the new utilities
2. **Add unit tests** for utility functions
3. **Create more extracted modal components** for remaining inline modals
4. **Add JSDoc comments** to all public functions
5. **Create Storybook stories** for extracted components

---

## 🤝 Contributing

When adding new features:

1. ✅ Add constants to `workout.constants.ts`
2. ✅ Add types to `workout.types.ts`
3. ✅ Use API utilities instead of raw fetch
4. ✅ Extract reusable logic to helper functions
5. ✅ Keep components small and focused
6. ✅ Use custom hooks for complex state management

---

## 📝 Code Style Guidelines

### Naming Conventions
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`
- **Functions**: `camelCase`
- **Components**: `PascalCase`
- **Hooks**: `useCamelCase`

### File Organization
```typescript
// 1. Imports
import { useState } from 'react';
import { API_ENDPOINTS } from '@/config/workout.constants';
import type { WorkoutDay } from '@/types/workout.types';

// 2. Types/Interfaces (component-specific)
interface MyComponentProps {
  // ...
}

// 3. Component
export default function MyComponent({ ... }: MyComponentProps) {
  // State
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  const handleClick = () => {};
  
  // Render
  return <div>...</div>;
}
```

---

## 🐛 Common Pitfalls to Avoid

1. **Don't hardcode values** - Use constants
2. **Don't use `any` types** - Use proper types
3. **Don't write raw fetch calls** - Use API utilities
4. **Don't duplicate logic** - Extract to helpers
5. **Don't create giant components** - Break into smaller pieces

---

## 📖 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks Guide](https://react.dev/reference/react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

**Happy Coding! 🎉**

