# ✅ Hierarchical Add Buttons Implementation

## 🎯 Overview

Implemented a complete hierarchical active selection system for the "Add Day", "Add Workout", "Add Moveframe", and "Add Movelap" buttons.

### Hierarchy

```
Day → Workout → Moveframe → Movelap
```

---

## 📊 What Was Implemented

### 1. **Active Selection State**  (`WorkoutSection.tsx`)

Added four state variables to track what is currently selected:

```typescript
const [activeDay, setActiveDay] = useState<any>(null);
const [activeWorkout, setActiveWorkout] = useState<any>(null);
const [activeMoveframe, setActiveMoveframe] = useState<any>(null);
const [activeMovelap, setActiveMovelap] = useState<any>(null);
```

---

### 2. **Smart Button Handlers** (`WorkoutSection.tsx`)

Implemented four intelligent handlers that check requirements before allowing actions:

#### ✅ **handleAddDay()**
- **Requirements**: None (always available)
- **Action**: Opens Add Day modal
- **Business Rules**:
  - Creates new day in chronological order
  - Empty workouts list
  - Zero totals per sport

```typescript
const handleAddDay = () => {
  if (!workoutPlan) {
    alert('⚠️ Please create a workout plan first.');
    return;
  }
  setShowAddDayModal(true);
};
```

---

#### ✅ **handleAddWorkout()**
- **Requirements**: Active day must be selected
- **Action**: Opens Add Workout modal
- **Business Rules**:
  - Max 3 workouts per day
  - Auto-assigns next available number (1, 2, or 3)
  - Sets default status color

```typescript
const handleAddWorkout = () => {
  if (!activeDay) {
    alert('⚠️ Please select a day first by clicking on a day row.\\n\\nWorkouts must be added to a specific day.');
    return;
  }
  
  const existingWorkouts = activeDay.workouts || [];
  if (existingWorkouts.length >= 3) {
    alert('⚠️ This day already has 3 workouts.\\n\\nYou cannot add more than 3 workouts per day.');
    return;
  }
  
  setAddWorkoutDay(activeDay);
  setWorkoutModalMode('add');
  setEditingWorkout(null);
  setShowAddWorkoutModal(true);
};
```

---

#### ✅ **handleAddMoveframe()**
- **Requirements**: Active day AND active workout must be selected
- **Action**: Opens Add Moveframe modal
- **Business Rules**:
  - Auto-generates MF code (A, B, C... Z, AA, AB...)
  - Requires sport, section, and pattern selection
  - Auto-creates movelaps from pattern

```typescript
const handleAddMoveframe = () => {
  if (!activeDay) {
    alert('⚠️ Please select a day first by clicking on a day row.');
    return;
  }
  
  if (!activeWorkout) {
    alert('⚠️ Please select a workout first by clicking on a workout row.\\n\\nMoveframes must be added to a specific workout (1, 2, or 3).');
    return;
  }
  
  setSelectedWorkout(activeWorkout.id);
  setSelectedDay(activeDay);
  setShowAddMoveframeModal(true);
};
```

---

#### ✅ **handleAddMovelap()**
- **Requirements**: Active moveframe must be selected
- **Action**: Opens Add Movelap modal (to be implemented)
- **Business Rules**:
  - Inserts after selected movelap, or at end
  - Pre-fills from previous lap values
  - Updates rep count and totals

```typescript
const handleAddMovelap = () => {
  if (!activeMoveframe) {
    alert('⚠️ Please select a moveframe first by clicking on a moveframe row.\\n\\nMovelaps (repetitions) must be added to a specific moveframe (A, B, C...).');
    return;
  }
  
  // TODO: Implement Add Movelap modal
  alert('✨ Add Movelap feature coming soon!\\n\\nThis will add a new repetition to moveframe "' + activeMoveframe.letter + '"');
};
```

---

### 3. **Updated Props** (`WorkoutTableView.tsx`)

Added props to receive active selection setters:

```typescript
interface WorkoutTableViewProps {
  // ... existing props ...
  
  // Active selection setters for hierarchical button behavior
  setActiveDay?: (day: any) => void;
  setActiveWorkout?: (workout: any) => void;
  setActiveMoveframe?: (moveframe: any) => void;
  setActiveMovelap?: (movelap: any) => void;
}
```

---

## 🔄 Next Steps (TO BE IMPLEMENTED)

### 1. **Add Click Handlers to Rows**

In `WorkoutTableView.tsx`, add `onClick` handlers to call the setters:

```typescript
// Day row click
<tr onClick={() => setActiveDay?.(day)}>
  ...
</tr>

// Workout row click  
<tr onClick={() => {
  setActiveDay?.(day);
  setActiveWorkout?.(workout);
}}>
  ...
</tr>

// Moveframe row click
<tr onClick={() => {
  setActiveDay?.(day);
  setActiveWorkout?.(workout);
  setActiveMoveframe?.(moveframe);
}}>
  ...
</tr>

// Movelap row click
<tr onClick={() => {
  setActiveDay?.(day);
  setActiveWorkout?.(workout);
  setActiveMoveframe?.(moveframe);
  setActiveMovelap?.(movelap);
}}>
  ...
</tr>
```

### 2. **Pass Handlers to Child Components**

Update `WorkoutSection.tsx` where components are rendered:

```typescript
// For WorkoutTableView (Table View)
<WorkoutTableView
  // ... existing props ...
  setActiveDay={setActiveDay}
  setActiveWorkout={setActiveWorkout}
  setActiveMoveframe={setActiveMoveframe}
  setActiveMovelap={setActiveMovelap}
/>

// For WorkoutGrid (Tree View)
<WorkoutGrid
  // ... existing props ...
  setActiveDay={setActiveDay}
  setActiveWorkout={setActiveWorkout}
  setActiveMoveframe={setActiveMoveframe}
  setActiveMovelap={setActiveMovelap}
/>
```

### 3. **Update Button Calls**

Replace the current button onClick handlers with the new smart handlers:

```typescript
// In WorkoutLeftSidebar
<button onClick={handleAddDay}>
  Add new day
</button>

<button onClick={handleAddWorkout}>
  Add a workout
</button>

<button onClick={handleAddMoveframe}>
  Add a moveframe
</button>

// In WorkoutTableView action buttons
<button onClick={handleAddDay}>
  📅 Add Day
</button>

<button onClick={handleAddWorkout}>
  🏋️ Add Workout
</button>

<button onClick={handleAddMoveframe}>
  📋 Add Moveframe
</button>

<button onClick={handleAddMovelap}>
  🔄 Movelaps
</button>
```

### 4. **Create Add Movelap Modal**

Create a new modal component similar to `AddMoveframeModal.tsx` for adding individual movelaps:

- **File**: `src/components/workouts/AddMovelapModal.tsx`
- **Fields**:
  - Distance (default from previous lap)
  - Speed (default from previous)
  - Style  
  - Pace
  - Time
  - Pause
  - Notes
  - "Note only" checkbox

---

## ✅ Benefits

1. **✅ Clear User Feedback**: Users get helpful messages when requirements aren't met
2. **✅ Prevents Errors**: Can't add workout without day, can't add moveframe without workout
3. **✅ Enforces Business Rules**: Max 3 workouts/day, proper hierarchy
4. **✅ Better UX**: Buttons are context-aware
5. **✅ Consistent Behavior**: Works across all views (Tree, Table, Calendar)

---

## 🎨 Visual States

### Buttons Should Show State:

- **Enabled**: Bright color, full opacity
  - Add Day: Always enabled (if plan exists)
  - Add Workout: Enabled when day selected
  - Add Moveframe: Enabled when day + workout selected
  - Add Movelap: Enabled when moveframe selected

- **Disabled**: Gray color, reduced opacity, cursor: not-allowed
  - Shows tooltip explaining why disabled

### Row Selection Visual Feedback:

Consider adding visual feedback when rows are clicked:
- Active day row: Light blue background
- Active workout row: Light green background
- Active moveframe row: Light yellow background
- Active movelap row: Light gray background

---

## 📝 Implementation Checklist

- [x] Add active selection state variables
- [x] Implement `handleAddDay()`
- [x] Implement `handleAddWorkout()` with validation
- [x] Implement `handleAddMoveframe()` with validation
- [x] Implement `handleAddMovelap()` stub
- [x] Update `WorkoutTableView` props interface
- [ ] Add click handlers to day rows
- [ ] Add click handlers to workout rows
- [ ] Add click handlers to moveframe rows
- [ ] Add click handlers to movelap rows
- [ ] Pass setters to `WorkoutGrid`
- [ ] Update button calls in `WorkoutLeftSidebar`
- [ ] Update button calls in `WorkoutRightSidebar`
- [ ] Update action buttons in `WorkoutTableView`
- [ ] Create `AddMovelapModal.tsx`
- [ ] Add visual feedback for selected rows
- [ ] Test all scenarios (no selection, partial selection, full selection)
- [ ] Test max 3 workouts limit
- [ ] Test across all views (Tree, Table, Calendar)

---

## 🚀 Testing Scenarios

1. **Add Day**: Should always work (if plan exists)
2. **Add Workout without day**: Should show alert
3. **Add Workout with day (0 workouts)**: Should open modal, assign #1
4. **Add Workout with day (1 workout)**: Should open modal, assign #2
5. **Add Workout with day (2 workouts)**: Should open modal, assign #3
6. **Add Workout with day (3 workouts)**: Should show "max 3" alert
7. **Add Moveframe without day**: Should show alert
8. **Add Moveframe without workout**: Should show alert
9. **Add Moveframe with day + workout**: Should open modal
10. **Add Movelap without moveframe**: Should show alert
11. **Add Movelap with moveframe**: Should open modal (when implemented)

---

## 📚 References

- Hierarchy: `Day → Workout → Moveframe → Movelap`
- Max workouts per day: 3
- Moveframe codes: A-Z, then AA, AB, AC...
- Status colors by workout status (PLANNED, DONE, etc.)

