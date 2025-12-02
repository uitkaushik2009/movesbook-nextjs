# Table View User Guide

## How to Expand/Collapse Rows

### Day Rows
**Click on the "Week" column (day name)** to expand or collapse the day's workout details.

- ✅ Expanded: Shows all workouts, moveframes, and movelaps for that day
- ⬇️ Collapsed: Shows only the summary row

**Visual Indicators:**
- Hover effect on the "Week" column shows it's clickable
- Tooltip: "Click to expand/collapse workouts | Drop workout here"

### Workout Rows (within expanded day)
Currently, workout rows expand automatically when the day is expanded. Individual workout collapse/expand feature coming soon.

### Moveframe Rows
Click the ▶️ or ▼ chevron icon next to each moveframe to expand/collapse its movelaps.

## How to Set Values

### 1. Color (Row Background Color)

#### For Days:
**Location:** "Color" column in the table

**How to Set:**
1. Find the row for the day you want to color
2. Look for the "Color" column (solid color cell)
3. Click on the color cell
4. A color picker will appear
5. Select your desired color
6. The color is automatically saved to the database

**Current Implementation:**
```typescript
// The color input is in the "Color" column
<input 
  type="color" 
  value={day.color || '#ffffff'}
  onChange={async (e) => {
    const newColor = e.target.value;
    // Update local state
    day.color = newColor;
    // Save to database
    await fetch(`/api/workouts/days/${day.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ color: newColor })
    });
  }}
/>
```

#### For Workouts:
Colors for individual workouts will be available soon. Currently, the day color applies to all workouts within that day.

#### For Movelaps:
When moveframes are expanded, each movelap has its own color picker in the "Color" column.

### 2. Match % (Match Percentage)

**What it means:** Percentage indicating how closely the workout matches the plan (0-100%)

**Location:** "Match" column in the table

**How to Set:**
The Match % is calculated automatically based on:
- Planned vs Actual distance
- Planned vs Actual duration
- Planned vs Actual intensity
- Completed moveframes vs Total moveframes

**Manual Override (Coming Soon):**
Future feature will allow manual entry by clicking the Match % cell and typing a value.

**Current Auto-Calculation Logic:**
```typescript
const getMatchPercentage = (workout: any): number => {
  if (!workout.moveframes || workout.moveframes.length === 0) return 0;
  
  const completedFrames = workout.moveframes.filter((mf: any) => 
    mf.status === 'COMPLETED'
  ).length;
  
  const totalFrames = workout.moveframes.length;
  const matchPercent = Math.round((completedFrames / totalFrames) * 100);
  
  return matchPercent;
};
```

### 3. Sport Icon

**What it means:** Visual representation of the sport type (🏊 swimming, 🚴 cycling, 🏃 running, etc.)

**Location:** "Icon" column in the S1-S4 sections

**How Icons are Set:**
Icons are **automatically determined** based on the sport selected for each moveframe.

**Sport-to-Icon Mapping:**
```typescript
const getSportIcon = (sport: string): string => {
  const icons: Record<string, string> = {
    'SWIM': '🏊',
    'BIKE': '🚴',
    'RUN': '🏃',
    'BODY_BUILDING': '💪',
    'ROWING': '🚣',
    'SKATE': '⛸️',
    'GYMNASTIC': '🤸',
    'STRETCHING': '🧘',
    'PILATES': '🧘‍♀️',
    'SKI': '⛷️',
    'TECHNICAL_MOVES': '⚙️',
    'FREE_MOVES': '🎯'
  };
  return icons[sport] || '🏋️';
};
```

**How to Change Sport (and Icon):**
1. Click on the moveframe you want to edit
2. Select "Edit Moveframe" from the Options menu
3. Choose a different sport from the dropdown
4. The icon will automatically update to match the new sport

**Alternative: Add New Moveframe**
1. Click "📋 Add Moveframe" button
2. Select the sport from the sport selector
3. The icon will automatically be assigned

### 4. Primary Sport

**What it means:** The main sport for a workout or day (shown in the summary columns)

**Location:** "Sport" column in the summary section (green background)

**How it's Determined:**
The primary sport is the sport with the:
1. **Highest total distance**, OR
2. **Most moveframes** if distances are equal, OR
3. **First sport** alphabetically if tied

**Auto-Calculation:**
```typescript
const getPrimarySport = (day: any): string => {
  const sportData: Record<string, number> = {};
  
  day.workouts?.forEach((workout: any) => {
    workout.moveframes?.forEach((mf: any) => {
      if (!sportData[mf.sport]) {
        sportData[mf.sport] = 0;
      }
      mf.movelaps?.forEach((lap: any) => {
        sportData[mf.sport] += lap.distance || 0;
      });
    });
  });
  
  // Return sport with highest distance
  return Object.entries(sportData)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '-';
};
```

## Additional Settings

### S4 Indicator
**What it means:** Shows if a day has 4 different sports

**Location:** "S4" column (between S4 sport columns and summary columns)

**Values:**
- ✅ = Day has exactly 4 sports
- ❌ = Day has fewer than 4 sports
- (Empty) = No sports tracked

### Weather & Surface
**Only in Section C (Workouts Done)**

These fields appear in the expanded day details for recording actual workout conditions:
- **Weather:** Sunny, Cloudy, Rainy, etc.
- **Surface:** Road, Track, Trail, Pool, etc.

**How to Set:**
1. Expand a day in Section C
2. Find the workout you want to edit
3. Click the "Edit" button next to the workout
4. Fill in Weather and Surface fields in the modal

## Quick Tips

### Bulk Operations
1. **Select Multiple Days:** Click checkboxes on multiple day rows
2. **Copy Days:** Click "Copy" from the Options menu
3. **Move Days:** Click "Move" from the Options menu
4. **Paste Days:** Navigate to target location and click "Paste"

### Grid Customization
- **Resize Columns:** Drag the column borders in the header row
- **Save Layout:** Click "💾 Save Grid" to save column widths to database
- **Reset Layout:** Click "🔄 Reset" to restore default column widths

### Keyboard Shortcuts (Coming Soon)
- `Space` = Expand/Collapse selected day
- `E` = Edit selected day
- `N` = Add new workout to selected day
- `Delete` = Delete selected days (with confirmation)

## Troubleshooting

### "Match % shows 0%"
- Ensure moveframes have been completed
- Check that movelaps have actual data entered

### "Sport icon not showing"
- Verify the sport is properly selected in the moveframe
- Check that the sport name matches the enum values (SWIM, BIKE, RUN, etc.)

### "Color picker not working"
- Ensure you're clicking directly on the color cell
- Check that you have permission to edit the day
- Verify you're not in a read-only section

### "Can't expand row"
- Make sure you're clicking on the "Week" column (day name)
- Check that the day has workouts to display
- Try refreshing the page if the state is stuck

## Future Features

### Coming Soon:
- ⏳ Manual Match % override
- ⏳ Individual workout expand/collapse
- ⏳ Bulk color assignment
- ⏳ Custom sport icons (upload your own)
- ⏳ Drag-to-resize row heights
- ⏳ Column visibility toggles
- ⏳ Export to Excel with colors preserved
- ⏳ Right-click context menus
- ⏳ Inline editing for all fields

## Need Help?

For more detailed information about specific features:
- **Stretching Exclusion:** See `SPORT-VALIDATION-AND-UI-UPDATE.md`
- **Database Settings:** See `DATABASE-SETTINGS-INTEGRATION.md`
- **Action Buttons:** See main README

