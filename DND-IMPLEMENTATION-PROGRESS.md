# 🎯 Drag & Drop Implementation Progress

**Status:** In Progress  
**Current Phase:** Setting up DnD Context

---

## ✅ Completed (5 minutes)

### 1. Imports Added to WorkoutSection.tsx
```typescript
// DnD Kit imports
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';

// Modal import
import DragDropConfirmModal from '@/components/workouts/modals/DragDropConfirmModal';
```

### 2. State Management Added
```typescript
// Drag & Drop State
const [activeWorkout, setActiveWorkout] = useState<any>(null);
const [activeMoveframe, setActiveMoveframe] = useState<any>(null);
const [dropTarget, setDropTarget] = useState<any>(null);
const [showDragModal, setShowDragModal] = useState(false);
const [dragModalConfig, setDragModalConfig] = useState<{
  dragType: 'workout' | 'moveframe';
  hasConflict: boolean;
  conflictMessage?: string;
  showPositionChoice?: boolean;
  sourceData: any;
  targetData: any;
} | null>(null);

// DnD Sensors (mouse, touch, keyboard)
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Prevents accidental drags
    },
  }),
  useSensor(KeyboardSensor)
);
```

---

## 🔄 Next Steps (Continuing Now)

### Step 1: Add Drag Handlers to WorkoutSection
```typescript
const handleDragStart = (event: DragStartEvent) => {
  const { active } = event;
  
  // Determine what's being dragged
  if (active.data.current?.type === 'workout') {
    setActiveWorkout(active.data.current.workout);
  } else if (active.data.current?.type === 'moveframe') {
    setActiveMoveframe(active.data.current.moveframe);
  }
};

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (!over) {
    // Dropped outside valid zone
    setActiveWorkout(null);
    setActiveMoveframe(null);
    return;
  }
  
  // Determine what was dragged and where
  const dragType = active.data.current?.type;
  const dropType = over.data.current?.type;
  
  if (dragType === 'workout' && dropType === 'day') {
    handleWorkoutDrop(active.data.current, over.data.current);
  } else if (dragType === 'moveframe') {
    handleMoveframeDrop(active.data.current, over.data.current);
  }
  
  // Reset
  setActiveWorkout(null);
  setActiveMoveframe(null);
};
```

### Step 2: Wrap JSX with DndContext
```typescript
return (
  <DndContext
    sensors={sensors}
    collisionDetection={closestCenter}
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
  >
    {/* All existing JSX */}
    
    {/* Drag overlay */}
    <DragOverlay>
      {activeWorkout && <div>Dragging Workout...</div>}
      {activeMoveframe && <div>Dragging Moveframe...</div>}
    </DragOverlay>
    
    {/* Confirmation Modal */}
    {dragModalConfig && (
      <DragDropConfirmModal
        isOpen={showDragModal}
        onClose={() => setShowDragModal(false)}
        onConfirm={handleDragConfirm}
        {...dragModalConfig}
      />
    )}
  </DndContext>
);
```

### Step 3: Make WorkoutTable Draggable
Add to `WorkoutTable.tsx`:
```typescript
import { useDraggable } from '@dnd-kit/core';

const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
  id: `workout-${workout.id}`,
  data: {
    type: 'workout',
    workout: workout,
    day: day
  }
});

// Apply to workout title row
<tr
  ref={setNodeRef}
  {...attributes}
  {...listeners}
  className={isDragging ? 'opacity-50' : ''}
>
```

### Step 4: Make Day Headers Droppable
Add to `DayWorkoutHierarchy.tsx`:
```typescript
import { useDroppable } from '@dnd-kit/core';

const { setNodeRef, isOver } = useDroppable({
  id: `day-${day.id}`,
  data: {
    type: 'day',
    day: day
  }
});

// Apply to day header
<div
  ref={setNodeRef}
  className={isOver ? 'ring-2 ring-blue-500' : ''}
>
```

---

## 📊 Estimated Time Remaining

- Step 1-2: 15 minutes (Handlers + Context wrap)
- Step 3-4: 20 minutes (Draggable + Droppable)
- API Endpoints: 30 minutes
- Testing: 15 minutes

**Total:** ~1.5 hours for workout dragging

---

## 🎯 Current Focus

Implementing drag handlers and wrapping with DndContext now...

