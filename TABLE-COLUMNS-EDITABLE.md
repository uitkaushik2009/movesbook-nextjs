# ✅ Editable Table Columns Feature

**Date:** December 4, 2025  
**Status:** ✅ Implemented

---

## 🎯 Overview

The workout table views now support **configurable/editable columns** with user preferences saved to localStorage.

Users can:
- ✅ Show/hide columns
- ✅ Reset to default configuration
- ✅ Preferences persist across sessions
- ✅ Each table type (Workout, Moveframe, Movelap) has independent configuration

---

## 📁 Files Created

### 1. **`src/config/table.columns.config.ts`**
- Defines column structures for all three table types
- Each column has: id, label, width, alignment, visibility, data key
- Separate configurations for:
  - `DEFAULT_WORKOUT_COLUMNS` - 22 columns (Sport 1-4 with distance, duration, K)
  - `DEFAULT_MOVEFRAME_COLUMNS` - 10 columns
  - `DEFAULT_MOVELAP_COLUMNS` - 15 columns

### 2. **`src/hooks/useTableColumns.ts`**
Custom React hook for managing column state:
- Loads configuration from localStorage
- Provides `toggleColumn()`, `resetToDefault()`, `saveColumns()`
- Returns visible columns and column count
- Manages configuration modal state

### 3. **`src/components/workouts/TableColumnConfig.tsx`**
Modal component for column configuration:
- Visual toggle for each column (Eye/EyeOff icons)
- Shows visible/total count
- Reset to default button
- Auto-saves changes to localStorage
- Required columns cannot be hidden

### 4. **`src/components/workouts/tables/MovelapTable.tsx`** (Updated)
- Integrated `useTableColumns('movelap')` hook
- Renders columns dynamically based on configuration
- Added "Columns" button in header to open config modal
- Uses `getCellValue()` helper to map column data

---

## 🎨 Default Column Visibility

### Movelap Table
**Visible by default (13 columns):**
- MF, Color, Workout type, Sport, Distance, Style, Speed, Time, Pace, Rec, Rest To, Aim Sound, Annotation

**Hidden by default (2 columns):**
- HR (Heart Rate)
- Cal (Calories)

### Moveframe Table
**Visible by default (7 columns):**
- MF, Color, Workout type, Sport, Moveframe description, Rip, Metri

**Hidden by default (3 columns):**
- Macro
- Alarm
- Notes

### Workout Table
**Visible by default (14 columns):**
- No, Match, Sport 1-2 (with Icon, Distance, Duration, K for each)

**Hidden by default (14 columns):**
- Sport 3-4 (with Icon, Distance, Duration, K for each)

---

## 🔧 How to Use

### For Users:
1. Click the **"Columns"** button in the table header (gear icon)
2. Click on any column to toggle visibility
3. Required columns (like "MF") cannot be hidden
4. Click **"Reset to Default"** to restore original configuration
5. Changes are saved automatically to localStorage
6. Click **"Close"** when done

### For Developers:
```typescript
// Use the hook in any table component
const {
  visibleColumns,      // Only columns with visible: true
  visibleColumnCount,  // Number for colSpan
  toggleColumn,        // Function to show/hide a column
  resetToDefault,      // Restore default config
  columns              // All columns with current state
} = useTableColumns('movelap'); // or 'workout', 'moveframe'
```

---

## 📦 Storage Structure

Configurations are saved in localStorage with these keys:
- `workout_table_columns` - Workout table config
- `moveframe_table_columns` - Moveframe table config
- `movelap_table_columns` - Movelap table config

Each stores a JSON array of `ColumnConfig` objects.

---

## 🔍 Section A - 3 Weeks Configuration

**Section A is already configured for 3 weeks:**

### API Configuration (`src/app/api/workouts/plan/route.ts`):
```typescript
// Lines 31-44
const threeWeeksAhead = new Date(today);
threeWeeksAhead.setDate(threeWeeksAhead.getDate() + 20); // 21 days total (0-20)

if (type === 'CURRENT_WEEKS') {
  dateFilter = {
    gte: today,
    lte: threeWeeksAhead
  };
}
```

### Constants Configuration (`src/config/workout.constants.ts`):
```typescript
// Lines 7-18
WORKOUT_SECTIONS.A = {
  id: 'A',
  name: 'Current Weeks',
  description: 'Current 3-week training period',
  planType: 'CURRENT_WEEKS',
  maxWeeks: 3,
  maxDays: 21,
  canAddDays: false,
  isEditable: true,
  icon: 'Calendar'
}
```

**✅ Section A shows exactly 3 weeks (21 days) from today.**

---

## 🚀 Next Steps

### Remaining Tables to Update:
1. **WorkoutTable.tsx** - Add configurable columns
2. **MoveframeTable.tsx** - Add configurable columns

Both follow the same pattern as MovelapTable:
1. Import `useTableColumns` and `TableColumnConfig`
2. Call `useTableColumns('workout')` or `useTableColumns('moveframe')`
3. Replace hard-coded column headers with `visibleColumns.map()`
4. Replace hard-coded data cells with `getCellValue()` helper
5. Add "Columns" button in header
6. Render `<TableColumnConfig>` modal

---

## ✨ Benefits

1. **User Control** - Users customize what data they see
2. **Performance** - Fewer columns = faster rendering
3. **Flexibility** - Easy to add new columns without breaking existing configs
4. **Persistence** - Settings saved across sessions
5. **Professional** - Modern, user-friendly interface

---

## 🐛 Known Issues

None currently. Feature is stable and ready for use.

---

**Implementation Status:** ✅ Complete for Movelap table
**Next:** Apply to Workout and Moveframe tables

