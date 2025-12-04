# 🚀 MOVEFRAME SYSTEM - IMPLEMENTATION PLAN

## ✅ CLARIFICATIONS RECEIVED

### 1. Movelap Auto-Generation
**Answer**: ✅ **Automatic** generation, but movelaps are **editable** afterward

**Implementation**:
- System creates movelaps when moveframe is saved
- User can edit individual movelaps after creation
- User can add/delete movelaps manually

### 2. Sound Options
**Answer**: ✅ **Beep** or **Bell** (simple choice)

**Implementation**:
```typescript
const soundOptions = ['Beep', 'Bell'];
```

### 3. Body Building Sector+Exercise
**Answer**: ✅ **Modal with exercise library**

**Implementation**:
- Create `ExerciseLibraryModal.tsx`
- Categories/sectors with exercise list
- Search and filter functionality
- Select exercise → returns to moveframe form

### 4. Battery Mode
**Answer**: ✅ **User adds multiple exercises**

**Implementation**:
- Battery mode allows grouping multiple exercises
- User adds exercise 1, 2, 3, etc. to the battery
- All exercises execute as a sequence
- Movelaps generated for entire battery

### 5. R1/R2 in BIKE
**Answer**: ✅ **RPM (Revolutions Per Minute)**

**Implementation**:
- R1 = RPM range 1 (e.g., 80-90)
- R2 = RPM range 2 (e.g., 90-100)
- Input fields for both ranges

---

## 📋 IMPLEMENTATION TASKS

### Phase 1: Core Sport Forms (Priority 1) 🔥

#### Task 1.1: Create Form Components
- [ ] `SwimMoveframeForm.tsx`
- [ ] `BikeMoveframeForm.tsx`
- [ ] `RunMoveframeForm.tsx`
- [ ] `BodyBuildingMoveframeForm.tsx`

#### Task 1.2: Update AddMoveframeModal
- [ ] Add mode selector: Standard / Battery
- [ ] Add sport selector (conditional rendering)
- [ ] Render appropriate form based on sport
- [ ] Handle form submission
- [ ] Auto-generate movelaps

#### Task 1.3: Movelap Auto-Generation Logic
- [ ] Create `generateMovelaps()` utility function
- [ ] Parse moveframe data (repetitions, values)
- [ ] Create movelaps via API
- [ ] Handle special cases (last rep different pause)

---

### Phase 2: Body Building Exercise Library (Priority 2) 🎯

#### Task 2.1: Exercise Library Database
- [ ] Create `ExerciseCategory` model (sectors)
- [ ] Create `Exercise` model
- [ ] Seed with initial exercises
- [ ] API endpoints for exercises

#### Task 2.2: Exercise Library Modal
- [ ] Create `ExerciseLibraryModal.tsx`
- [ ] Category navigation (sectors)
- [ ] Exercise list with search
- [ ] Filter by muscle group
- [ ] Select and return exercise

---

### Phase 3: Battery Mode (Priority 3) 🔋

#### Task 3.1: Battery UI
- [ ] Battery mode toggle in modal
- [ ] "Add Exercise to Battery" button
- [ ] List of exercises in battery
- [ ] Reorder exercises in battery
- [ ] Remove exercise from battery

#### Task 3.2: Battery Logic
- [ ] Store multiple exercises in moveframe
- [ ] Generate movelaps for entire sequence
- [ ] Handle transitions between exercises
- [ ] Display battery in table view

---

## 📝 DETAILED SPECIFICATIONS

### 1. SWIM Moveframe Form

**IMPORTANT**: One Moveframe can contain MULTIPLE SEQUENCES!

Example: "400m x 6 A2 + 5' + 200m x 3 B1" = ONE moveframe with TWO sequences

```typescript
interface SwimSequence {
  meters: number; // Dropdown: 20, 50, 75, 100, 150, 200, 400, 500, 800, 1000, 1200, 1500
  speed: string; // Dropdown: A1, A2, A3, B1, B2, B3, C1, C2
  style: string; // Dropdown: Freestyle, Dolphin, Backstroke, Breaststroke, Sliding, Apnea
  repetitions: number; // Input: How many reps in this sequence
  pause: string; // Pause between reps
  endPause?: string; // Pause after completing this sequence (before next sequence)
}

interface SwimFormData {
  // Required
  section: string; // Section name (from Workout section settings)
  letter: string; // A, B, C, etc.
  sequences: SwimSequence[]; // Array of sequences - ONE or MORE
  
  // Optional (apply to all sequences)
  pace100?: string; // Input: e.g., "1:30/100"
  time?: string; // Input: e.g., "5:00"
  note?: string; // Input: Free text
  alarm?: number; // Dropdown: -1 to -10
  sound?: string; // Dropdown: Beep, Bell
}
```

**UI Layout**:
```
┌─────────────────────────────────────────┐
│  Add SWIM Moveframe                     │
├─────────────────────────────────────────┤
│  Meters:      [100 ▼]                   │
│  Speed:       [A2 ▼]                    │
│  Style:       [Freestyle ▼]             │
│  Repetitions: [6]                       │
│  Pause:       [1'30" ▼]                 │
│  Last Pause:  [5' ▼] (optional)         │
│                                          │
│  ── Optional Fields ──                  │
│  Pace\100:    [1:30/100]                │
│  Time:        [5:00]                    │
│  Alarm:       [-3 ▼]                    │
│  Sound:       [Beep ▼]                  │
│  Note:        [Free text...]            │
│                                          │
│  [Cancel]          [Create Moveframe]   │
└─────────────────────────────────────────┘
```

**Result**: Creates moveframe + 6 movelaps automatically

---

### 2. BIKE Moveframe Form

```typescript
interface BikeFormData {
  // Required
  meters: number | string; // Dropdown + input: 200, 400, 500, 1000, 1500, 2000, 3000, 4000, 5000, 7000, 8000, 10000, custom
  speed: string; // Dropdown: A1, A2, A3, B1, B2, B3, C1, C2
  r1: string; // Input: RPM range 1 (e.g., "80-90")
  r2: string; // Input: RPM range 2 (e.g., "90-100")
  repetitions: number;
  pause: string; // Dropdown: 15", 30", 45", 1', 1'30", 2', 2'30", 3', 4', 5'
  
  // Optional
  pace100?: string;
  time?: string;
  note?: string;
  lastPause?: string;
  alarm?: number;
  sound?: string;
}
```

---

### 3. RUN Moveframe Form

```typescript
interface RunFormData {
  // Required
  meters: number; // Dropdown: 50, 60, 80, 100, 110, 150, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 3000, 5000, 10000
  speed: string; // Dropdown: A1, A2, A3, B1, B2, B3, C1, C2
  style: string; // Dropdown: Track, Road, Cross, Beach, Hill, Downhill
  repetitions: number;
  pause: string; // Dropdown: 20", 30", 45", 1', 1'15", 1'30", 2', 2'30", 3', 4', 5', 6', 7'
  
  // Optional
  pace100?: string;
  time?: string;
  note?: string;
  lastPause?: string;
  alarm?: number;
  sound?: string;
}
```

---

### 4. BODY BUILDING Moveframe Form

```typescript
interface BodyBuildingFormData {
  // Required
  sector: string; // From exercise library
  exercise: string; // From exercise library
  speed: string; // Dropdown: Very slow, Slow, Normal, Quick, Fast, Very fast, Explosive, Negative
  reps: number; // Input: Number of reps per set
  sets: number; // Input: Number of sets
  pause: string; // Dropdown: 0", 5", 10", 15", 20", 30", 45", 1', 1'15", 1'30", 2', 2'30", 3', 4', 5', 6', 7'
  
  // Optional
  style?: string; // Dropdown: (TBD)
  note?: string;
  lastPause?: string;
  alarm?: number;
  sound?: string;
}
```

**Special**: Click "Select Exercise" → Opens `ExerciseLibraryModal`

---

## 🔧 UTILITY FUNCTIONS

### Generate Movelaps Function (Multi-Sequence Support)

```typescript
// src/utils/movelapGenerator.ts

export interface MovelapGeneratorParams {
  moveframeId: string;
  sport: SportType;
  formData: any;
}

export async function generateMovelaps(params: MovelapGeneratorParams) {
  const { moveframeId, sport, formData } = params;
  const movelaps = [];
  let currentRepNumber = 1;
  
  // Handle multiple sequences
  const sequences = formData.sequences || [formData]; // Support both single and multi-sequence
  
  for (let seqIndex = 0; seqIndex < sequences.length; seqIndex++) {
    const sequence = sequences[seqIndex];
    const isLastSequence = seqIndex === sequences.length - 1;
    
    // Generate movelaps for this sequence
    for (let i = 1; i <= sequence.repetitions; i++) {
      const isLastRepInSequence = i === sequence.repetitions;
      const isLastRepOverall = isLastSequence && isLastRepInSequence;
      
      // Determine pause for this rep
      let pause = sequence.pause;
      if (isLastRepInSequence && sequence.endPause) {
        // Last rep of sequence gets endPause (transition to next sequence)
        pause = sequence.endPause;
      } else if (isLastRepInSequence && formData.lastPause) {
        // Fallback to global lastPause if set
        pause = formData.lastPause;
      }
      
      const movelap = {
        moveframeId,
        repetitionNumber: currentRepNumber++,
        distance: sequence.meters || sequence.distance || null,
        speed: sequence.speed || null,
        style: sequence.style || null,
        pace: formData.pace100 || null, // Global for all sequences
        time: formData.time || null, // Global for all sequences
        reps: sequence.reps || null, // For body building
        pause: pause,
        alarm: formData.alarm || null, // Global for all sequences
        sound: formData.sound || null, // Global for all sequences
        notes: formData.note || null, // Global for all sequences
        status: 'PENDING',
        isSkipped: false,
        isDisabled: false
      };
      
      movelaps.push(movelap);
    }
  }
  
  return movelaps;
}
```

### Description Generator Function (Multi-Sequence Support)

```typescript
// src/utils/moveframeDescriptionGenerator.ts

export function generateMoveframeDescription(sport: SportType, formData: any): string {
  const sequences = formData.sequences || [formData];
  
  const sequenceDescriptions = sequences.map((seq: any, index: number) => {
    let desc = '';
    
    switch (sport) {
      case 'SWIM':
        desc = `${seq.meters}m x ${seq.repetitions} ${seq.speed} ${seq.style} pause ${seq.pause}`;
        break;
      
      case 'BIKE':
        desc = `${seq.meters}m x ${seq.repetitions} ${seq.speed} R1:${seq.r1} R2:${seq.r2} pause ${seq.pause}`;
        break;
      
      case 'RUN':
        desc = `${seq.meters}m x ${seq.repetitions} ${seq.speed} ${seq.style} pause ${seq.pause}`;
        break;
      
      case 'BODY_BUILDING':
        desc = `${seq.exercise} ${seq.reps} reps x ${seq.sets} sets ${seq.speed} pause ${seq.pause}`;
        break;
      
      default:
        desc = 'Unknown';
    }
    
    // Add endPause if present and not last sequence
    if (seq.endPause && index < sequences.length - 1) {
      desc += ` + ${seq.endPause}`;
    }
    
    return desc;
  });
  
  // Join sequences with " + "
  return sequenceDescriptions.join(' + ');
}

// Examples:
// Single: "400m x 6 A2 Freestyle pause 1'30""
// Multi:  "400m x 6 A2 Freestyle pause 1'30" + 5' + 200m x 3 B1 Freestyle pause 1'"
```

---

## 🎨 API ENDPOINTS NEEDED

### Create Moveframe with Movelaps
```typescript
// POST /api/workouts/moveframes/create-with-movelaps

{
  workoutSessionId: string;
  sectionId: string;
  letter: string;
  sport: SportType;
  type: 'STANDARD' | 'BATTERY';
  description: string;
  movelaps: Array<{
    repetitionNumber: number;
    distance?: number;
    speed?: string;
    style?: string;
    pace?: string;
    time?: string;
    reps?: number;
    pause?: string;
    alarm?: number;
    sound?: string;
    notes?: string;
  }>;
}
```

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1: Core Forms (SWIM, RUN)
- Day 1-2: SwimMoveframeForm + tests
- Day 3-4: RunMoveframeForm + tests
- Day 5: Integration + movelap generation

### Week 2: Advanced Forms (BIKE, BODY BUILDING)
- Day 1-2: BikeMoveframeForm + R1/R2 logic
- Day 3-4: BodyBuildingMoveframeForm (without library)
- Day 5: Integration testing

### Week 3: Exercise Library
- Day 1-2: Database schema + API
- Day 3-4: ExerciseLibraryModal UI
- Day 5: Integration with Body Building form

### Week 4: Battery Mode
- Day 1-2: Battery UI
- Day 3-4: Battery logic + movelap generation
- Day 5: Testing + polish

---

## ✅ ACCEPTANCE CRITERIA

### For Each Sport Form:
- [ ] All required fields present
- [ ] Dropdown options match specification
- [ ] Form validation works
- [ ] Creates moveframe + movelaps automatically
- [ ] Movelaps are editable after creation
- [ ] Description is human-readable

### For Exercise Library:
- [ ] Modal opens from Body Building form
- [ ] Categories/sectors are listed
- [ ] Exercises are searchable/filterable
- [ ] Selection returns to form
- [ ] Exercise name appears in form

### For Battery Mode:
- [ ] Can add multiple exercises to battery
- [ ] Can reorder exercises
- [ ] Can remove exercises
- [ ] Generates correct movelaps sequence
- [ ] Displays properly in table view

---

## 🚀 READY TO START!

**All clarifications received ✅**  
**Database schema ready ✅**  
**Implementation plan complete ✅**

**Next Step**: Start with `SwimMoveframeForm.tsx` implementation!

Should I begin implementing the SWIM form component?

