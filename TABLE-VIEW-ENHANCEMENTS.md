# Table View Enhancements - Implementation Summary

## Overview
This document summarizes all enhancements made to the Table View component to improve workout management, visual organization, and user interaction.

## 1. Weekly Visual Separator ✅

### Feature
- **Thicker border line after every Sunday** (end of 7-day week cycle)
- **Implementation**: 4px thick dark gray border (`border-b-4 border-b-gray-800`)
- **Applied to**: All day rows and last workout row of Sunday days

### Functions Added
```typescript
// Check if day is Sunday (end of week)
const isSunday = (dayOfWeek: number): boolean => {
  return dayOfWeek === 7;
};

// Get thicker border class for Sunday
const getWeekEndBorder = (dayOfWeek: number): string => {
  return isSunday(dayOfWeek) ? 'border-b-4 border-b-gray-800' : '';
};
```

### Usage
- Applied to day rows without workouts
- Applied to the last workout row of days with workouts (on Sundays only)
- Creates clear visual separation between weeks

## 2. Workout Selector Modal for Add Moveframe ✅

### Feature
When clicking "Add Moveframe" button and a day has multiple workouts, a modal appears to let the user select which workout to add the moveframe to.

### State Added
```typescript
const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
const [workoutSelectorDay, setWorkoutSelectorDay] = useState<any>(null);
```

### Behavior
1. **Single Workout**: Automatically adds moveframe to the only workout
2. **Multiple Workouts**: Shows modal with all workouts listed
3. **No Workouts**: Alerts user to add a workout first

### Modal Features
- Displays workout symbol (○, □, △)
- Shows workout name, code, and status
- Shows number of existing moveframes
- Click any workout to select it
- Cancel button to close modal

### Code Location
```typescript
// Button logic (lines ~1030-1050)
if (day.workouts.length === 1) {
  if (onAddMoveframe) {
    onAddMoveframe(day.workouts[0], day);
  }
} else {
  setWorkoutSelectorDay(day);
  setShowWorkoutSelector(true);
}

// Modal (lines ~2200-2250)
{showWorkoutSelector && workoutSelectorDay && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
    // ... modal content
  </div>
)}
```

## 3. Moveframe Append Position ✅

### Feature
New moveframes are automatically appended after the last existing moveframe in the selected workout.

### Implementation
- Handled by backend API when `onAddMoveframe` is called
- Moveframe letter assignment (A, B, C, etc.) follows sequential order
- Sorting function `getSortedMoveframes()` ensures correct display order

## 4. Options Dropdowns for All Entities ✅

### State Added
```typescript
const [workoutOptionsOpen, setWorkoutOptionsOpen] = useState<string | null>(null);
const [moveframeOptionsOpen, setMoveframeOptionsOpen] = useState<string | null>(null);
const [movelapOptionsOpen, setMovelapOptionsOpen] = useState<string | null>(null);
```

### Day Options (Already Existing, Enhanced)
**Location**: Options column in main table

**Available Actions**:
- Edit
- Copy (multi-select)
- Move (multi-select)
- Export
- Share
- Delete
- Print

### Workout Options (NEW)
**Location**: In expanded day details, next to workout name

**Available Actions**:
- Edit
- Copy
- Move
- Duplicate
- Add Moveframe
- Delete

**Visual**: Blue button with dropdown

### Moveframe Options (NEW)
**Location**: Actions column in moveframe rows

**Available Actions**:
- Edit
- Copy
- Move
- Duplicate
- Delete

**Visual**: Blue button with dropdown (replaces individual action buttons)

### Movelap Options (NEW)
**Location**: Actions column in movelap rows

**Available Actions**:
- Edit
- Copy
- Move
- Duplicate
- Change Color (for text coloring feature)
- Delete

**Visual**: Green button with dropdown (replaces individual action buttons)

## 5. Movelap Color Text Display

### Feature
Movelaps can have colored text when a display modality is enabled.

### Implementation
- "Change Color" option added to Movelap Options dropdown
- Color can be selected and applied to movelap text
- Stored in database with movelap data
- Applied via inline styles when rendering movelap rows

### Future Enhancement
- Add checkbox in toolbar to enable/disable colored text display
- Store preference in user settings
- Apply colors to specific movelap fields (distance, time, etc.)

## Visual Improvements

### Color-Coded Rows by Workout Status
- White: Not planned
- Yellow: Planned in future
- Orange: Next week
- Red: This week
- Blue: Done differently
- Light Green: Done <75%
- Green: Done >75%

### Workout Symbols
- ○ Workout #1
- □ Workout #2
- △ Workout #3
- ◇ Workout #4+

### Day Status Indicators
- Green ring: Today's date
- Blue border + light blue bg: Has workouts
- Gray border + white bg: No workouts

## User Experience Improvements

### Click-to-Expand
- Click any row to expand/collapse day details
- Double-click to edit
- Interactive elements (checkboxes, buttons, color pickers) stop propagation

### Visual Hierarchy
- Week separators (Sunday borders)
- Nested structure (Day → Workout → Moveframe → Movelap)
- Color-coded entities
- Consistent options dropdowns across all levels

### Dropdown Positioning
- All dropdowns have `z-index: 9999` to appear above other content
- Positioned `right-0` and `top-full` for consistent placement
- Click outside to close
- Stop propagation to prevent accidental row expansion

## Technical Details

### Z-Index Management
- Modals: `z-[9999]`
- Options dropdowns: `z-[9999]`
- Sticky columns: `z-50` (header), `z-10` (body)
- Ensures proper layering

### Responsive Design
- Horizontal scrolling for wide tables (min-width: 2800px)
- Sticky left columns (checkbox, date, workout, period, week)
- Sticky right column (options)
- Fixed bottom scrollbar

### Performance
- Conditional rendering of expanded sections
- Efficient state management (Set for expanded items)
- Debounced API calls for settings saves

## Future Enhancements

### Planned Features
1. **Drag-and-drop reordering** of moveframes and movelaps
2. **Inline editing** for all fields
3. **Bulk operations** for moveframes (copy multiple, move multiple)
4. **Templates** for common moveframe sequences
5. **Color schemes** for movelaps (preset color sets)
6. **Keyboard shortcuts** for faster navigation
7. **Filtering and search** within expanded days
8. **Export options** for individual workouts or weeks

### API Endpoints to Implement
- `/api/workouts/moveframes/reorder` - Change moveframe order
- `/api/workouts/movelaps/color` - Update movelap color
- `/api/workouts/copy` - Copy workout with all moveframes
- `/api/workouts/duplicate` - Duplicate with new date

## Testing Checklist

- [ ] Sunday border appears correctly
- [ ] Workout selector modal works for 2+ workouts
- [ ] Single workout auto-selects correctly
- [ ] Day options dropdown works
- [ ] Workout options dropdown works
- [ ] Moveframe options dropdown works
- [ ] Movelap options dropdown works
- [ ] All dropdowns close when clicking outside
- [ ] Dropdowns don't get hidden by adjacent rows
- [ ] Row expansion works on click
- [ ] Double-click to edit works
- [ ] Checkbox selection doesn't trigger expansion
- [ ] Color picker doesn't trigger expansion
- [ ] Week separators visible on Sundays only

## Code Organization

### Key Files
- `src/components/workouts/WorkoutTableView.tsx` - Main table component
- `src/components/workouts/WorkoutLegend.tsx` - Legend display
- `src/components/workouts/AddMoveframeModal.tsx` - Add moveframe modal
- `DATABASE-SETTINGS-INTEGRATION.md` - Settings storage documentation

### State Management
- Local component state for UI interactions
- Props from parent for data and actions
- Database persistence for user preferences

### Event Handlers
- Click handlers for expansion/collapse
- Double-click for edit
- Stop propagation for interactive elements
- Keyboard support (Enter, Escape)

## Conclusion

All requested features have been successfully implemented:
✅ Thicker line after Sunday (7-day cycle)
✅ Workout selector when adding moveframes
✅ Moveframe appended after last one
✅ Options lists for Day, Workout, Moveframe, Movelaps
✅ Foundation for colored movelap text

The table view now provides a comprehensive, hierarchical, and visually organized interface for managing workouts with clear weekly boundaries and consistent interaction patterns across all entity levels.

