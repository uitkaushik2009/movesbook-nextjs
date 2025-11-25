# Workout System - Next Steps Action Plan

**Date**: November 25, 2025  
**Based on**: Specification vs Implementation Validation

---

## 🎯 Objective

Transform the existing workout components (76% complete) into a fully functional system that matches the specification (100% complete).

---

## 📋 Implementation Roadmap

### Phase 1: Make It Work (Priority 1) 🔴
**Timeline**: 3-4 days  
**Goal**: Users can access and use workout planning interface

#### Task 1.1: Create Working Workout Page ⏱️ 3 hours
**File**: Create `src/app/workouts/page.tsx`

```typescript
// Integration checklist:
☐ Import WorkoutGrid, WorkoutLeftSidebar, WorkoutRightSidebar
☐ Import MoveframeFormModal
☐ Set up state management for:
   - activeSection (A/B/C/D)
   - expandedDays, expandedWorkouts, expandedMoveframes
   - selectedDay, selectedWorkout, selectedMoveframe
   - showMoveframeModal
☐ Load data:
   - Fetch workout plan based on activeSection
   - Fetch periods, workoutSections, mainSports
☐ Wire up handlers:
   - onSectionChange → fetch new plan
   - onAddWorkout → create session
   - onAddMoveframe → open modal
   - onSave → refresh plan
☐ Add to navigation (ModernNavbar)
```

**Acceptance Criteria**:
- [ ] User can click "Workouts" in navigation
- [ ] Three-column layout displays correctly
- [ ] Can switch between Sections A, B, C, D
- [ ] Data loads and displays in grid

---

#### Task 1.2: Complete Sport-Specific Forms ⏱️ 8 hours
**File**: `src/components/workouts/MoveframeFormModal.tsx`

**Current**: Only swimming fields implemented (lines 265-428)

**Add fields for**:

```typescript
// CYCLING (2 hours)
☐ Distance (km)
☐ Speed (km/h)
☐ Pace per km
☐ Cadence (rpm)
☐ Power (watts)
☐ Gear
☐ Terrain (flat/hills)
☐ Rest type, Pause, Alarm

// RUNNING (2 hours)
☐ Distance (km/m)
☐ Speed (km/h, min/km)
☐ Pace per km
☐ Incline (%)
☐ Terrain (road/trail/track)
☐ Heart rate zones
☐ Rest type, Pause, Alarm

// BODY_BUILDING (Strength) (2 hours)
☐ Exercise name
☐ Sets
☐ Reps
☐ Weight (kg)
☐ Rest between sets
☐ Tempo (eccentric-concentric)
☐ Notes

// ROWING (1 hour)
☐ Distance (m)
☐ Pace per 500m
☐ Stroke rate
☐ Power (watts)
☐ Rest, Pause, Alarm

// REMAINING SPORTS (1 hour)
☐ SKATE, GYMNASTIC, STRETCHING, PILATES
☐ SKI, TECHNICAL_MOVES, FREE_MOVES
☐ Generic fields: Duration, Intensity, Notes
```

**Pattern**:
```typescript
{selectedSport === 'BIKE' && (
  <>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label>Distance (km)</label>
        <input type="number" ... />
      </div>
      <div>
        <label>Cadence (rpm)</label>
        <input type="number" ... />
      </div>
      // ... more fields
    </div>
  </>
)}
```

**Acceptance Criteria**:
- [ ] All 12 sports have appropriate input fields
- [ ] Fields are sport-specific and relevant
- [ ] Movelaps generate correctly for each sport
- [ ] Form validation works for all sports

---

#### Task 1.3: Wire Up Add Workout Flow ⏱️ 4 hours
**Files**: 
- `src/components/workouts/WorkoutRightSidebar.tsx`
- `src/app/api/workouts/sessions/route.ts` (create new file)

**Current**: Button exists but disabled when no day selected

**Implement**:
```typescript
// 1. In WorkoutRightSidebar.tsx
const handleAddWorkout = async () => {
  ☐ Validate day is selected
  ☐ Check max 3 workouts per day
  ☐ Determine session number (1, 2, or 3)
  ☐ Determine status based on date:
     - Current week → PLANNED_CURRENT_WEEK
     - Next week → PLANNED_NEXT_WEEK
     - Future → PLANNED_FUTURE
  ☐ Create workout via API
  ☐ Refresh plan
  ☐ Auto-select new workout
};

// 2. Create API endpoint
// POST /api/workouts/sessions
{
  workoutDayId: string,
  sessionNumber: 1 | 2 | 3,
  name: string,
  code: string,
  status: WorkoutStatus
}
```

**Acceptance Criteria**:
- [ ] Can add workout to any day
- [ ] Max 3 workouts per day enforced
- [ ] Status auto-calculated based on date
- [ ] New workout appears in grid immediately
- [ ] Error handling for failures

---

### Phase 2: Core Features (Priority 2) 🟡
**Timeline**: 5-6 days  
**Goal**: Essential workflows complete

#### Task 2.1: Section D - Archive/Templates ⏱️ 10 hours

**Step 1: Database Schema (1 hour)**
```prisma
// Add to prisma/schema.prisma
model WorkoutTemplate {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  category    String?  // "Swim", "Bike", "Run", "Mixed"
  tags        String?  // JSON array of tags
  createdAt   DateTime @default(now())
  
  // Template can contain:
  // - Single workout session
  // - Full day with multiple sessions
  templateData String  // JSON: { workouts: [...], moveframes: [...] }
  
  user User @relation(fields: [userId], references: [id])
  
  @@map("workout_templates")
}

// Add to User model
workoutTemplates WorkoutTemplate[]
```

**Step 2: API Endpoints (2 hours)**
```typescript
// Create files:
☐ src/app/api/workouts/templates/route.ts (GET, POST)
☐ src/app/api/workouts/templates/[id]/route.ts (GET, PUT, DELETE)

// Endpoints:
GET    /api/workouts/templates       // List user's templates
POST   /api/workouts/templates       // Create template
GET    /api/workouts/templates/[id]  // Get template
PUT    /api/workouts/templates/[id]  // Update template
DELETE /api/workouts/templates/[id]  // Delete template
POST   /api/workouts/templates/[id]/apply  // Apply to day/week
```

**Step 3: UI Components (7 hours)**
```typescript
// Create components:
☐ src/components/workouts/ArchiveModal.tsx
   - List of templates (grid or list view)
   - Search and filter by category/tags
   - Preview template details
   - "Apply to Date" action

☐ src/components/workouts/SaveTemplateModal.tsx
   - Template name input
   - Description textarea
   - Category dropdown
   - Tags input
   - "Save" button

// Add buttons:
☐ In WorkoutRightSidebar:
   - "Save to Archive" (when workout/day selected)
   - "Load from Archive" (always visible)

☐ In WorkoutGrid context menu:
   - Right-click workout → "Save as Template"
   - Right-click day → "Save as Template"
```

**Acceptance Criteria**:
- [ ] Can save workout as template
- [ ] Can save full day as template
- [ ] Templates appear in archive modal
- [ ] Can apply template to any day
- [ ] Template preserves moveframes and movelaps
- [ ] Can edit/delete templates

---

#### Task 2.2: Drag & Drop Implementation ⏱️ 15 hours

**Current**: Sport icons draggable, but no drop handlers

**Step 1: Sport Icon to Workout (5 hours)**
```typescript
// In WorkoutRightSidebar.tsx - already has onDragStart
const handleDragStart = (sport: SportType) => {
  setDraggedSport(sport);
};

// In WorkoutGrid.tsx - add drop zones
const handleWorkoutDrop = async (workoutId: string, e: DragEvent) => {
  e.preventDefault();
  if (!draggedSport) return;
  
  ☐ Get workout details
  ☐ Open MoveframeFormModal with:
     - Pre-selected sport
     - Pre-filled workoutId
  ☐ Auto-focus first input field
};

// Add to workout row:
<div 
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => handleWorkoutDrop(workout.id, e)}
  className="drop-zone"
>
  {/* existing workout content */}
</div>
```

**Step 2: Reorder Workouts Within Day (5 hours)**
```typescript
// Make workout rows draggable
<div
  draggable
  onDragStart={() => setDraggedWorkout(workout)}
  onDragOver={(e) => handleDragOver(e, workout)}
  onDrop={() => handleWorkoutReorder()}
>
  {/* workout content */}
</div>

const handleWorkoutReorder = async () => {
  ☐ Calculate new order
  ☐ Update sessionNumber in database
  ☐ Re-fetch plan
  ☐ Show success feedback
};
```

**Step 3: Move Workout to Another Day (3 hours)**
```typescript
// Make days drop zones for workouts
<div
  onDragOver={(e) => draggedWorkout ? e.preventDefault() : null}
  onDrop={() => handleMoveWorkoutToDay(day.id)}
  className={draggedWorkout ? 'drop-zone-active' : ''}
>
  {/* day content */}
</div>

const handleMoveWorkoutToDay = async (targetDayId: string) => {
  ☐ Update workout's workoutDayId
  ☐ Recalculate status based on new date
  ☐ Re-fetch both days
  ☐ Show moved animation
};
```

**Step 4: Reorder Moveframes (2 hours)**
```typescript
// Similar pattern for moveframe reordering
<tr
  draggable
  onDragStart={() => setDraggedMoveframe(moveframe)}
  onDrop={() => handleMoveframeReorder()}
>
  {/* moveframe row */}
</tr>
```

**Acceptance Criteria**:
- [ ] Drag sport icon → drop on workout → opens form
- [ ] Drag workout within day → reorders session numbers
- [ ] Drag workout to another day → moves workout
- [ ] Drag moveframe → reorders letters (A, B, C...)
- [ ] Visual feedback during drag (highlight drop zones)
- [ ] Touch support for mobile devices

---

#### Task 2.3: Copy/Move/Paste Functionality ⏱️ 10 hours

**Implement clipboard management**:

```typescript
// Create clipboard context
// src/contexts/WorkoutClipboardContext.tsx
interface ClipboardItem {
  type: 'day' | 'workout' | 'moveframe';
  data: any;
  copiedFrom: string;
  timestamp: Date;
}

const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);

// Copy actions
const copyDay = (day: WorkoutDay) => {
  setClipboard({
    type: 'day',
    data: day,
    copiedFrom: `Week ${day.weekNumber}, Day ${day.dayOfWeek}`,
    timestamp: new Date()
  });
};

// Paste actions
const pasteToDay = async (targetDayId: string) => {
  if (!clipboard || clipboard.type !== 'day') return;
  
  ☐ Deep clone workouts, moveframes, movelaps
  ☐ Generate new IDs
  ☐ Update references
  ☐ Create in database
  ☐ Show success toast
};

// Move actions (copy + delete original)
const moveWorkout = async (workoutId: string, targetDayId: string) => {
  ☐ Copy workout data
  ☐ Create in target day
  ☐ Delete from original day
  ☐ Update UI
};
```

**Add to context menus**:
```typescript
// In WorkoutRightSidebar.tsx
{selectedDay && (
  <>
    <button onClick={() => copyDay(selectedDay)}>
      <Copy /> Copy Day
    </button>
    <button onClick={() => pasteToDay(selectedDay.id)} disabled={!clipboard}>
      <Clipboard /> Paste
    </button>
    <button onClick={() => moveDay(selectedDay)}>
      <Move /> Move Day
    </button>
  </>
)}
```

**Acceptance Criteria**:
- [ ] Can copy day/workout/moveframe
- [ ] Clipboard persists during session
- [ ] Can paste to valid targets only
- [ ] Move = copy + delete original
- [ ] Visual indicator when clipboard has content
- [ ] Keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+X)

---

### Phase 3: Coach Features (Priority 3) 🟡
**Timeline**: 5-6 days  
**Goal**: Multi-user collaboration

#### Task 3.1: Athlete Selector for Coaches ⏱️ 4 hours

```typescript
// Create component
// src/components/workouts/AthleteSelector.tsx

interface AthleteSelectorProps {
  coachId: string;
  selectedAthleteId: string | null;
  onSelectAthlete: (athleteId: string) => void;
}

export default function AthleteSelector({ ... }) {
  const [athletes, setAthletes] = useState([]);
  
  useEffect(() => {
    // Fetch coach's athletes
    ☐ GET /api/coaches/my-athletes
    ☐ Include from: coaching groups, teams, clubs
    ☐ Show count per group
  }, [coachId]);
  
  return (
    <div className="athlete-selector">
      ☐ Dropdown with athlete list
      ☐ Group by: Coaching Groups, Teams, Clubs
      ☐ Search/filter athletes
      ☐ Show athlete's photo + name
      ☐ "View as Coach" / "View as Athlete" toggle
    </div>
  );
}
```

**Integrate into coach dashboard**:
```typescript
// src/app/coach/dashboard/page.tsx
const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
const [viewMode, setViewMode] = useState<'coach' | 'athlete'>('coach');

return (
  <div>
    ☐ Show AthleteSelector at top
    ☐ If athlete selected:
       - Load THAT athlete's workout plan
       - Show "Editing as Coach" banner
       - Enable coach actions (assign, modify, comment)
    ☐ If no athlete:
       - Show coach's personal library (View 2)
  </div>
);
```

**Acceptance Criteria**:
- [ ] Coach sees dropdown of all their athletes
- [ ] Can select an athlete
- [ ] Athlete's workout plan loads
- [ ] Can switch back to "My Library" view
- [ ] Athlete grouping visible

---

#### Task 3.2: Coach View 1 - Manage Athletes ⏱️ 8 hours

**Features**:
```typescript
// When coach views athlete's plan:
☐ Can view Sections A, B, C (read-only)
☐ Can create/edit workouts in Section A & B
☐ Cannot create in Section C (athlete's log)
☐ Shows "Created by Coach" badge on workouts
☐ Shows last updated timestamp

// Additional coach actions:
☐ Add comment to workout/day
☐ Mark workout as "Coach Assigned"
☐ Set workout as "Mandatory" vs "Optional"
☐ View athlete's completion rate
☐ Bulk assign workouts (copy week to multiple athletes)
```

**Database additions**:
```prisma
// Add to WorkoutSession model
model WorkoutSession {
  // ... existing fields
  createdBy        String?  // userId of coach who created it
  coachComment     String?
  isMandatory      Boolean  @default(false)
  isCoachAssigned  Boolean  @default(false)
}
```

**UI Indicators**:
```typescript
// In WorkoutGrid.tsx
{workout.isCoachAssigned && (
  <span className="badge bg-purple-500">Coach Assigned</span>
)}
{workout.isMandatory && (
  <span className="badge bg-red-500">Mandatory</span>
)}
```

**Acceptance Criteria**:
- [ ] Coach can create workouts for athletes
- [ ] Athletes see "Coach Assigned" badge
- [ ] Coach can add comments visible to athlete
- [ ] Cannot modify athlete's Section C
- [ ] Completion tracking visible

---

#### Task 3.3: Import from Coach ⏱️ 6 hours

**Athlete's perspective**:
```typescript
// Add button in WorkoutLeftSidebar.tsx
<button onClick={() => setShowImportModal(true)}>
  <Download /> Import from Coach
</button>

// Create ImportWorkoutModal.tsx
const ImportWorkoutModal = () => {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [availableWorkouts, setAvailableWorkouts] = useState([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  
  useEffect(() => {
    ☐ Fetch athlete's coaches
    ☐ GET /api/athletes/my-coaches
  }, []);
  
  useEffect(() => {
    if (selectedCoach) {
      ☐ Fetch workouts shared by coach
      ☐ GET /api/coaches/[id]/shared-workouts
    }
  }, [selectedCoach]);
  
  const handleImport = async () => {
    ☐ Copy selected workouts
    ☐ Paste to athlete's Section A or B
    ☐ Mark as "Imported from Coach"
    ☐ Show success message
  };
  
  return (
    ☐ Coach selector dropdown
    ☐ Available workouts list (with preview)
    ☐ Checkbox for each workout
    ☐ Target section selector (A or B)
    ☐ Target date picker
    ☐ "Import" button
  );
};
```

**API Endpoints**:
```typescript
// GET /api/coaches/[coachId]/shared-workouts
// Returns workouts marked as shareable by coach

// POST /api/athletes/import-workout
{
  workoutId: string,
  targetSection: 'A' | 'B',
  targetDate: Date
}
```

**Acceptance Criteria**:
- [ ] Athlete can see list of their coaches
- [ ] Can view workouts shared by each coach
- [ ] Can select multiple workouts to import
- [ ] Can choose target section and date
- [ ] Imported workouts maintain structure
- [ ] Shows "Imported from Coach" indicator

---

#### Task 3.4: Coach View 2 - Personal Library ⏱️ 6 hours

**Personal workout templates for coaches**:

```typescript
// When no athlete selected in coach dashboard
return (
  <div>
    <h2>My Workout Library</h2>
    
    ☐ Grid of workout templates
    ☐ Create new template button
    ☐ Edit/Delete template
    ☐ "Share with Athletes" action
    ☐ Category organization
    
    ☐ Quick actions:
       - "Assign to Athlete" → opens athlete selector
       - "Assign to Group" → assigns to all in coaching group
       - "Publish to Library" → makes discoverable
  </div>
);
```

**Share functionality**:
```typescript
const shareWithAthletes = async (templateId: string, athleteIds: string[]) => {
  ☐ Create workout instances for each athlete
  ☐ Optionally set target date
  ☐ Mark as "Coach Assigned"
  ☐ Send notification to athletes
  ☐ Show confirmation
};
```

**Acceptance Criteria**:
- [ ] Coach has personal template library
- [ ] Can create templates without athlete context
- [ ] Can share template with specific athletes
- [ ] Can share with entire coaching group
- [ ] Athletes see shared workouts in import modal

---

### Phase 4: Polish & UX (Priority 4) 🟢
**Timeline**: 4-5 days  
**Goal**: Production-ready refinements

#### Task 4.1: Movelap Micro-Management ⏱️ 8 hours

**Current**: Movelap table displays data, but can't edit individually

**Add inline editing**:
```typescript
// In WorkoutGrid.tsx movelap table (lines 404-426)
const [editingLapId, setEditingLapId] = useState<string | null>(null);
const [lapEdits, setLapEdits] = useState<Record<string, any>>({});

<tbody>
  {moveframe.movelaps.map((lap) => {
    const isEdited = lapEdits[lap.id];
    const isEditing = editingLapId === lap.id;
    
    return (
      <tr 
        className={`
          ${lap.isDisabled ? 'opacity-50 line-through' : ''}
          ${isEdited ? 'bg-red-50 text-red-600' : ''}
        `}
      >
        <td>{lap.repetitionNumber}</td>
        <td>
          {isEditing ? (
            <input
              type="number"
              value={lap.distance}
              onChange={(e) => handleLapEdit(lap.id, 'distance', e.target.value)}
              className="w-full"
            />
          ) : (
            lap.distance
          )}
        </td>
        {/* ... other fields */}
        <td>
          <div className="flex gap-1">
            ☐ <button onClick={() => setEditingLapId(lap.id)}>Edit</button>
            ☐ <button onClick={() => handleDuplicateLap(lap)}>Duplicate</button>
            ☐ <button onClick={() => handleToggleDisable(lap.id)}>
                {lap.isDisabled ? 'Enable' : 'Disable'}
              </button>
            ☐ <button onClick={() => handleToggleSkip(lap.id)}>
                {lap.isSkipped ? 'Unskip' : 'Skip'}
              </button>
            ☐ <button onClick={() => handleDeleteLap(lap.id)}>Delete</button>
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
```

**Color coding**:
```typescript
// Edited laps: red background
☐ When modified, add to lapEdits: { [lapId]: { field: newValue } }
☐ Apply bg-red-50 text-red-600 classes

// Duplicated/Added laps: blue background
☐ New laps have isNew flag
☐ Apply bg-blue-50 text-blue-600 classes

// Disabled laps: grey + strikethrough
☐ Already working (line 408)

// Skipped laps: yellow background
☐ Apply bg-yellow-50 classes
```

**Add note annotation row**:
```typescript
const [lapNotes, setLapNotes] = useState<Record<string, string>>({});

{lapNotes[lap.id] && (
  <tr className="bg-gray-100">
    <td colSpan={9}>
      <div 
        className="p-2 rounded"
        style={{ backgroundColor: '#fef3c7' }}
      >
        📝 Note: {lapNotes[lap.id]}
      </div>
    </td>
  </tr>
)}
```

**Recalculate totals**:
```typescript
const calculateMoveframeTotals = (moveframe) => {
  return moveframe.movelaps
    .filter(lap => !lap.isDisabled)  // Exclude disabled
    .reduce((sum, lap) => sum + lap.distance, 0);
};

// Update in WorkoutGrid display
<td className="px-4 py-2 text-center font-semibold">
  {calculateMoveframeTotals(moveframe)}m
</td>
```

**Acceptance Criteria**:
- [ ] Can edit any movelap field inline
- [ ] Edited laps show red background
- [ ] Can duplicate any lap (appears with blue background)
- [ ] Can disable lap (greys out, excludes from totals)
- [ ] Can skip lap for player
- [ ] Can add colored note to any lap
- [ ] Can delete individual lap
- [ ] Totals recalculate dynamically

---

#### Task 4.2: Visual Customization Settings ⏱️ 8 hours

**Create BackgroundsColorsSettings modal**:

```typescript
// src/components/workouts/settings/BackgroundsColorsModal.tsx
interface ColorSettings {
  pageBackground: string;
  dayHeader: string;
  moveframeHeader: string;
  movelapHeader: string;
  selectedRow: string;
  buttons: {
    add: string;
    edit: string;
    delete: string;
    print: string;
  };
}

const BackgroundsColorsModal = ({ onClose, onSave }) => {
  const [colors, setColors] = useState<ColorSettings>({
    pageBackground: '#f9fafb',
    dayHeader: '#1f2937',
    moveframeHeader: '#374151',
    movelapHeader: '#6b7280',
    selectedRow: '#dbeafe',
    buttons: {
      add: '#2563eb',
      edit: '#059669',
      delete: '#dc2626',
      print: '#7c3aed'
    }
  });
  
  return (
    <div className="modal">
      <h3>Backgrounds & Colors</h3>
      
      ☐ Color picker for page background
      ☐ Color picker for day header
      ☐ Color picker for moveframe header
      ☐ Color picker for movelap header
      ☐ Color picker for selected row
      ☐ Color pickers for each button type
      
      ☐ "Reset to Defaults" button
      ☐ "Preview" live update
      ☐ "Save" button
    </div>
  );
};
```

**Save to UserSettings**:
```prisma
// Already exists in schema (line 303-314)
model UserSettings {
  colorSettings String  // JSON string
}
```

**Apply custom colors**:
```typescript
// In WorkoutGrid.tsx and other components
const { colorSettings } = useUserSettings();

<div 
  style={{ backgroundColor: colorSettings.pageBackground }}
  className="workout-grid"
>
  <div 
    style={{ backgroundColor: colorSettings.dayHeader }}
    className="day-header"
  >
    {/* day content */}
  </div>
</div>

<button
  style={{ backgroundColor: colorSettings.buttons.add }}
  className="add-button"
>
  Add Workout
</button>
```

**Acceptance Criteria**:
- [ ] Can customize all background colors
- [ ] Can customize button colors
- [ ] Colors persist to database
- [ ] Colors apply immediately across app
- [ ] Can reset to defaults
- [ ] Preview shows changes before saving

---

#### Task 4.3: Export Functionality ⏱️ 10 hours

**Export to CSV (3 hours)**:
```typescript
// src/lib/export-utils.ts
export const exportToCSV = (workoutPlan: WorkoutPlan) => {
  const csvData = [];
  
  // Header row
  csvData.push([
    'Week', 'Day', 'Period', 'Session', 'Status',
    'Moveframe', 'Sport', 'Section', 'Distance', 'Reps',
    'Speed', 'Pace', 'Rest', 'Notes'
  ]);
  
  // Data rows
  workoutPlan.weeks.forEach(week => {
    week.days.forEach(day => {
      day.workouts.forEach(workout => {
        workout.moveframes.forEach(moveframe => {
          moveframe.movelaps.forEach(lap => {
            csvData.push([
              week.weekNumber,
              day.dayOfWeek,
              day.period.name,
              workout.sessionNumber,
              workout.status,
              moveframe.letter,
              moveframe.sport,
              moveframe.section.name,
              lap.distance,
              lap.reps,
              lap.speed,
              lap.pace,
              lap.pause,
              lap.notes
            ]);
          });
        });
      });
    });
  });
  
  ☐ Convert to CSV string
  ☐ Trigger download
  ☐ Filename: `workout-plan-${date}.csv`
};
```

**Export to PDF (4 hours)**:
```typescript
// Use jsPDF library
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (workoutPlan: WorkoutPlan) => {
  const doc = new jsPDF();
  
  ☐ Add header: "Workout Plan - {planName}"
  ☐ Add summary: total weeks, workouts, distance
  ☐ Create table for each week
  ☐ Format with colors (periods, status)
  ☐ Add page breaks
  ☐ Footer with page numbers
  
  doc.save(`workout-plan-${date}.pdf`);
};
```

**Export to Excel (3 hours)**:
```typescript
// Use xlsx library
import * as XLSX from 'xlsx';

export const exportToExcel = (workoutPlan: WorkoutPlan) => {
  const workbook = XLSX.utils.book_new();
  
  ☐ Sheet 1: Summary
  ☐ Sheet 2: Full workout data
  ☐ Sheet 3: Statistics
  ☐ Add formulas for totals
  ☐ Apply cell formatting
  ☐ Conditional formatting for status
  
  XLSX.writeFile(workbook, `workout-plan-${date}.xlsx`);
};
```

**Add export modal**:
```typescript
// src/components/workouts/ExportModal.tsx
const ExportModal = ({ workoutPlan, onClose }) => {
  return (
    <div className="modal">
      <h3>Export Workout Plan</h3>
      
      <div className="export-options">
        ☐ <button onClick={() => exportToCSV(workoutPlan)}>
            Export as CSV
          </button>
        ☐ <button onClick={() => exportToPDF(workoutPlan)}>
            Export as PDF
          </button>
        ☐ <button onClick={() => exportToExcel(workoutPlan)}>
            Export as Excel
          </button>
      </div>
      
      <div className="export-settings">
        ☐ Date range selector
        ☐ Include/exclude sections
        ☐ Include/exclude completed workouts
        ☐ Detailed vs Summary view
      </div>
    </div>
  );
};
```

**Acceptance Criteria**:
- [ ] Can export to CSV format
- [ ] Can export to PDF (print-friendly)
- [ ] Can export to Excel with formulas
- [ ] Can customize export options
- [ ] File downloads automatically
- [ ] Filename includes date

---

## 🎯 Success Metrics

### After Phase 1 (Week 1)
- [ ] Workout page accessible from navigation
- [ ] Athletes can create workouts with all 12 sports
- [ ] Data persists and displays correctly
- [ ] No critical bugs

### After Phase 2 (Week 2)
- [ ] Section D functional (save/load templates)
- [ ] Basic drag & drop working
- [ ] Copy/paste functionality working
- [ ] Workflow efficiency improved by 50%

### After Phase 3 (Week 3)
- [ ] Coaches can manage athlete workouts
- [ ] Athletes can import from coaches
- [ ] Multi-user collaboration working
- [ ] Coach library functional

### After Phase 4 (Week 4)
- [ ] Movelap micro-management complete
- [ ] Visual customization available
- [ ] Export to CSV/PDF/Excel working
- [ ] System ready for production

---

## 📝 Development Notes

### Testing Strategy
- [ ] Unit tests for each new component
- [ ] Integration tests for workflows
- [ ] E2E tests for critical paths
- [ ] Manual QA for UX validation

### Performance Optimization
- [ ] Lazy load workout data (paginate weeks)
- [ ] Cache periods, sections, sports
- [ ] Debounce search and filter
- [ ] Optimize re-renders with React.memo

### Error Handling
- [ ] Graceful API error messages
- [ ] Offline mode indication
- [ ] Retry logic for failed requests
- [ ] Form validation with helpful messages

### Documentation
- [ ] Update README with new features
- [ ] Create user guide for athletes
- [ ] Create user guide for coaches
- [ ] API documentation for integrations

---

## ✅ Definition of Done

A feature is "done" when:
- [ ] Code written and tested
- [ ] No linter errors
- [ ] Responsive on mobile
- [ ] Accessible (keyboard nav, screen reader)
- [ ] Translated (all UI strings)
- [ ] Documented (inline comments + docs/)
- [ ] Reviewed by peer
- [ ] User tested

---

**Ready to start? Begin with Phase 1, Task 1.1!** 🚀

