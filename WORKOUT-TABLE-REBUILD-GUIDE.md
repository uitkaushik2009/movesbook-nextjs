# WorkoutTableView Rebuild Guide

## 🎯 Objective
Add **Edit | Options | Delete** buttons to EVERY row type (Day, Workout, Moveframe, Movelap) instead of using rowSpan which only shows day-level buttons.

## ✅ Created Components
- **RowActionButtons.tsx**: Reusable button trio component

## 🔧 Required Changes

### 1. Remove rowSpan from ALL Options Columns

**Current (WRONG):**
```tsx
{isFirstWorkout && (
  <td className="sticky right-0" rowSpan={dayWorkouts.length}>
    {/* Day options only */}
  </td>
)}
```

**New (CORRECT):**
```tsx
{/* Day row - no rowSpan */}
<td className="sticky right-0 z-10 bg-white shadow-lg">
  <RowActionButtons
    rowType="day"
    rowId={day.id}
    rowData={day}
    onEdit={() => onEditDay?.(day)}
    onDelete={() => handleDeleteDay(day)}
    optionsMenuItems={[
      { label: 'Copy', onClick: () => handleCopy() },
      { label: 'Move', onClick: () => handleMove() },
      { label: 'Export', onClick: () => handleExport(day) },
      { label: 'Share', onClick: () => handleShare(day) },
      { label: 'Print', onClick: () => handlePrint(day) }
    ]}
  />
</td>

{/* EACH workout row gets its own Options cell */}
<td className="sticky right-0 z-10 bg-white shadow-lg">
  <RowActionButtons
    rowType="workout"
    rowId={workout.id}
    rowData={workout}
    onEdit={() => onEditWorkout?.(workout, day)}
    onDelete={() => handleDeleteWorkout(workout)}
    optionsMenuItems={[
      { label: 'Copy Workout', onClick: () => handleCopyWorkout(workout) },
      { label: 'Move Workout', onClick: () => handleMoveWorkout(workout) },
      { label: 'Duplicate', onClick: () => handleDuplicateWorkout(workout) },
      { label: 'Add Moveframe', onClick: () => onAddMoveframe?.(workout, day) }
    ]}
  />
</td>
```

### 2. Update All 4 Row Types

#### A. Day Rows (lines ~1295-1470)
**Location:** First row of each day
**Action:** Replace single Options cell with RowActionButtons
**Options menu:** Copy, Move, Export, Share, Print

#### B. Workout Rows (lines ~1490-1790)
**Location:** Each workout within a day (1-3 per day)
**Action:** Add Options cell to EACH workout row (no rowSpan!)
**Options menu:** Copy Workout, Move Workout, Duplicate, Add Moveframe

#### C. Moveframe Rows (lines ~1796-1990)
**Location:** Each moveframe within expanded workout
**Action:** Add Options cell with RowActionButtons
**Options menu:** Copy Moveframe, Move Moveframe, Duplicate, Add Movelap

#### D. Movelap Rows (lines ~1992-2150)
**Location:** Each movelap within expanded moveframe
**Action:** Add Options cell with RowActionButtons
**Options menu:** Copy Movelap, Duplicate, Move Up, Move Down

### 3. Key Structural Changes

**Before:**
```
Day Row (options column with rowSpan=3)
├─ Workout 1 (no options column, covered by day's rowSpan)
├─ Workout 2 (no options column, covered by day's rowSpan)
└─ Workout 3 (no options column, covered by day's rowSpan)
```

**After:**
```
Day Row (options column, no rowSpan)
├─ Workout 1 (OWN options column)
├─ Workout 2 (OWN options column)
└─ Workout 3 (OWN options column)
    ├─ Moveframe A (OWN options column)
    │   ├─ Movelap 1 (OWN options column)
    │   ├─ Movelap 2 (OWN options column)
    │   └─ Movelap n (OWN options column)
    └─ Moveframe B...
```

### 4. Search Patterns

To find all Options columns that need updating:

```bash
# Find all rowSpan in Options columns
grep -n "rowSpan.*Options\|Options.*rowSpan" WorkoutTableView.tsx

# Find isFirstWorkout checks (these create rowSpans)
grep -n "isFirstWorkout &&" WorkoutTableView.tsx

# Find sticky right-0 (Options columns)
grep -n "sticky right-0" WorkoutTableView.tsx
```

### 5. Implementation Checklist

- [ ] Remove `rowSpan` from Day Options column (line ~1391)
- [ ] Add Options cell to EACH Workout row (line ~1525)
- [ ] Remove `isFirstWorkout &&` conditions from Options rendering
- [ ] Add Options cell to Moveframe rows (line ~1818)
- [ ] Add Options cell to Movelap rows (line ~2008)
- [ ] Test drag-and-drop still works
- [ ] Test expand/collapse still works
- [ ] Test Edit buttons open correct modals
- [ ] Test Options dropdowns show correct actions
- [ ] Test Delete buttons show confirmation

### 6. Helper Functions Needed

```typescript
const handleDeleteDay = (day: any) => {
  if (confirm(`Delete day ${formatDate(day.date)}?`)) {
    // Call API to delete day
    onDataChanged?.();
  }
};

const handleDeleteWorkout = (workout: any) => {
  if (confirm(`Delete workout "${workout.name}"?`)) {
    // Call API to delete workout
    onDataChanged?.();
  }
};

const handleDeleteMoveframe = (moveframe: any) => {
  if (confirm(`Delete moveframe ${moveframe.letter}?`)) {
    // Call API to delete moveframe
    onDataChanged?.();
  }
};

const handleDeleteMovelap = (movelap: any) => {
  if (confirm(`Delete movelap #${movelap.number}?`)) {
    // Call API to delete movelap
    onDataChanged?.();
  }
};
```

### 7. Testing Scenarios

1. **Single workout day**: 1 Options cell per workout ✅
2. **Triple workout day**: 3 separate Options cells ✅
3. **Expanded moveframes**: Each has its own Options ✅
4. **Expanded movelaps**: Each has its own Options ✅
5. **Drag workout**: Still works after changes ✅
6. **Drag moveframe**: Still works after changes ✅

### 8. Example: Complete Day Row

```tsx
<tr className="day-row">
  {/* ... other day columns ... */}
  
  {/* Options Column - NO rowSpan! */}
  <td className="border border-gray-300 px-1 py-1 text-center sticky right-0 z-10 bg-white shadow-lg">
    <RowActionButtons
      rowType="day"
      rowId={day.id}
      rowData={day}
      onEdit={() => onEditDay?.(day)}
      onDelete={() => handleDeleteDay(day)}
      optionsMenuItems={[
        { 
          label: 'Copy', 
          onClick: () => handleCopy(),
          disabled: selectedDays.size === 0,
          className: selectedDays.size > 0 ? 'w-full px-3 py-2 text-left text-xs hover:bg-blue-50' : 'w-full px-3 py-2 text-left text-xs text-gray-400 cursor-not-allowed'
        },
        { label: 'Move', onClick: () => handleMove(), disabled: selectedDays.size === 0 },
        { label: 'Export', onClick: () => handleExport(day), className: 'w-full px-3 py-2 text-left text-xs hover:bg-purple-50 border-t' },
        { label: 'Share', onClick: () => handleShare(day), className: 'w-full px-3 py-2 text-left text-xs hover:bg-green-50' },
        { label: 'Print', onClick: () => handlePrint(day), className: 'w-full px-3 py-2 text-left text-xs hover:bg-gray-50 border-t' }
      ]}
    />
  </td>
</tr>
```

## 🚀 Next Steps

1. Update Day rows first (easiest, template for others)
2. Update Workout rows (remove rowSpan logic)
3. Update Moveframe rows
4. Update Movelap rows
5. Test all functionality
6. Commit changes

## ⚠️ Critical Points

- **NO rowSpan on Options columns!** Every row gets its own.
- **Maintain drag-and-drop handlers** (don't remove onDragStart, onDrop, etc.)
- **Keep expand/collapse logic** (chevron buttons still needed)
- **Preserve sticky positioning** (sticky right-0)
- **Keep z-index layering** (z-10 for Options, higher for dropdowns)

## 📊 File Sections to Update

| Section | Lines | Row Type | Current State | Action Required |
|---------|-------|----------|---------------|-----------------|
| Day header | 1295-1470 | Day | rowSpan on Options | Remove rowSpan, add RowActionButtons |
| Workout rows | 1490-1790 | Workout | No Options cell | Add Options cell with RowActionButtons |
| Moveframe rows | 1796-1990 | Moveframe | No clear structure | Add Options cell with RowActionButtons |
| Movelap rows | 1992-2150 | Movelap | Embedded in details | Add Options cell with RowActionButtons |

---

**Status:** ✅ RowActionButtons component created
**Next:** Update WorkoutTableView.tsx systematically
**Goal:** Each row has visible Edit | Options | Delete buttons

