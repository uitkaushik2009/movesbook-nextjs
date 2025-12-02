# Database Settings Integration

## Overview
All workout-related settings are now stored in the Prisma database instead of localStorage, providing persistence across devices and sessions.

## Changes Made

### 1. Column Header Update
**File**: `src/components/workouts/WorkoutTableView.tsx`
- Changed last column header from "Options" to "Option" (singular)

### 2. Database Schema
**File**: `prisma/schema.prisma`
- Uses existing `UserSettings` model with `workoutPreferences` JSON field
- Structure:
```typescript
workoutPreferences: {
  excludeStretchingFromTotals: boolean,
  tableView: {
    columnWidths: { ... }
  }
}
```

### 3. API Integration
**File**: `src/app/api/user/settings/route.ts`
- Already implemented with GET, POST, and PATCH endpoints
- Handles JSON serialization/deserialization for `workoutPreferences`
- Supports partial updates via PATCH method

### 4. WorkoutTableView Updates
**File**: `src/components/workouts/WorkoutTableView.tsx`

#### Load Settings from Database
```typescript
useEffect(() => {
  const loadSettings = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/settings', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const settings = await response.json();
      const tableView = settings.workoutPreferences?.tableView || {};
      
      if (tableView.columnWidths) {
        setColumnWidths(tableView.columnWidths);
      }
    }
  };
  
  loadSettings();
}, []);
```

#### Save Grid Settings to Database
```typescript
const saveGridSettings = async () => {
  const token = localStorage.getItem('token');
  
  await fetch('/api/user/settings', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      workoutPreferences: {
        tableView: {
          columnWidths,
          excludeStretchingFromTotals
        }
      }
    })
  });
  
  alert('Grid settings saved to database!');
};
```

#### Reset Grid Settings
```typescript
const resetGridSettings = async () => {
  const defaultWidths = {
    checkbox: 40, week: 60, dayWeek: 60, dayname: 80, date: 100, period: 100
  };
  setColumnWidths(defaultWidths);
  
  const token = localStorage.getItem('token');
  
  await fetch('/api/user/settings', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      workoutPreferences: {
        tableView: {
          columnWidths: defaultWidths,
          excludeStretchingFromTotals
        }
      }
    })
  });
  
  alert('Grid settings reset to default!');
};
```

### 5. WorkoutSection Updates
**File**: `src/components/workouts/WorkoutSection.tsx`

#### Load Workout Preferences
```typescript
const loadWorkoutPreferences = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/user/settings', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.ok) {
    const settings = await response.json();
    const workoutPrefs = settings.workoutPreferences || {};
    
    if (workoutPrefs.excludeStretchingFromTotals !== undefined) {
      setExcludeStretchingFromTotals(workoutPrefs.excludeStretchingFromTotals);
    }
  }
};
```

#### Auto-Save Exclude Stretching Setting
```typescript
useEffect(() => {
  const saveExcludeStretchingSetting = async () => {
    const token = localStorage.getItem('token');
    
    await fetch('/api/user/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        workoutPreferences: {
          excludeStretchingFromTotals
        }
      })
    });
  };
  
  saveExcludeStretchingSetting();
}, [excludeStretchingFromTotals]);
```

## Settings Hierarchy

### Global Settings (WorkoutSection)
- `excludeStretchingFromTotals` - Managed at the section level, passed down to all views
- Automatically saved to database when changed
- Loaded from database on component mount

### View-Specific Settings (WorkoutTableView)
- `columnWidths` - Table column widths
- Saved to database via "💾 Save Grid" button
- Reset to defaults via "🔄 Reset" button
- Loaded from database on component mount

## Benefits

1. **Cross-Device Sync**: Settings persist across different devices when user logs in
2. **User Profiles**: Each user has their own personalized settings
3. **Data Persistence**: No data loss when clearing browser cache or switching browsers
4. **Centralized Management**: All settings managed through a single API endpoint
5. **Flexibility**: JSON storage allows for easy addition of new settings without schema changes
6. **Partial Updates**: PATCH endpoint allows updating specific settings without affecting others

## Usage

### For Users
1. **Exclude Stretching Checkbox**: Changes are automatically saved to the database
2. **Grid Settings**: 
   - Click "💾 Save Grid" to save current column widths
   - Click "🔄 Reset" to restore default column widths
3. All settings persist across sessions and devices

### For Developers
To add new workout preferences:

1. Add the setting to the component state
2. Load it in the `loadWorkoutPreferences` function
3. Save it using the PATCH endpoint with the `workoutPreferences` field
4. The setting will be automatically stored in the database

Example:
```typescript
// Add to workoutPreferences object
body: JSON.stringify({
  workoutPreferences: {
    excludeStretchingFromTotals,
    myNewSetting: value,
    tableView: {
      columnWidths,
      anotherSetting: anotherValue
    }
  }
})
```

## Migration Notes

- Old localStorage data is ignored
- Settings will use defaults until user saves them to the database
- No data migration needed from localStorage (users will need to re-configure their preferences)

## Future Enhancements

Potential settings to add to the database:
- View mode preference (tree/table/calendar)
- Expanded states for weeks, days, workouts
- Calendar view preferences (narrow/wide mode)
- Color preferences for each section
- Default sort orders
- Filter preferences

