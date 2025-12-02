# Admin Background & Colors Settings Update

## Overview
Updated the Background & Colors settings in the admin panel to include new color options for day rows, workout variations, and an improved Live Preview that matches the workout hierarchy.

## New Features Added

### 1. Week Header Colors
**New Settings:**
- `weekHeader`: Background color for week headers
- `weekHeaderText`: Text color for week headers

**Default Values:**
- Background: `#6b7cde` (Purple/Blue)
- Text: `#ffffff` (White)

**Usage:** Week headers appear at the top of the hierarchy showing "Monday - Week 1"

### 2. Day Alternate Row Colors
**New Settings:**
- `dayAlternateRow`: Background color for even day rows
- `dayAlternateRowText`: Text color for even day rows

**Default Values:**
- Background: `#e0f2fe` (Light Blue)
- Text: `#0c4a6e` (Dark Blue)

**Usage:** Applied to even-numbered day rows to create visual distinction

### 3. Workout #2 Specific Colors (Even Workout)
**New Settings:**
- `workout2Header`: Background color for Workout #2 (even workouts)
- `workout2HeaderText`: Text color for Workout #2

**Default Values:**
- Background: `#fed7aa` (Light Orange/Peach)
- Text: `#9a3412` (Dark Orange/Brown)

**Usage:** Workout #2 now has its own distinct color scheme, separate from Workout #1 and #3

**Note:** Workout #1 and #3 use the same colors (already configured as `workoutHeader` and `workoutHeaderText`)

### 4. Workout #3 Colors
**New Settings:**
- `workout3Header`: Background color for Workout #3
- `workout3HeaderText`: Text color for Workout #3

**Default Values:**
- Background: `#c6f8e2` (Light Green/Cyan - same as Workout #1)
- Text: `#2386d1` (Blue - same as Workout #1)

**Usage:** Workout #3 shares colors with Workout #1 by default, creating an alternating pattern

## Live Preview Updates

### New Hierarchical Structure
The Live Preview panel has been completely reorganized to match the actual workout data structure:

```
📦 Page Background
  ├── 🔹 Week Header (Monday - Week 1)
  ├── 🔹 Day Header (Monday - Week 1)
  ├── 🔹 Workout 1 - Monday 23 [Add] [Edit] [Delete] [Print]
  ├── 🔸 Workout 1 - Monday 23 [Add] [Edit] [Delete] [Print] (Workout #2 colors)
  ├── 🔸 Moveframe A Warmup
  ├── 🔸 Moveframe B - 100 × 4 A2 Break 1'30" (Alternate)
  ├── 🔸 Lap #1: 100m - A2 - B 1'30"
  ├── 🔸 Lap #2: 100m - A2 - B 1'30" (Alternate)
  ├── 🔸 Lap #3: 100m - A2 - B 1'30"
  ├── 🔸 Lap #4: 100m - A2 - B 1'30" (Alternate)
  ├── 🔸 Microlap Details
  └── 🔸 Selected Row - Active Moveframe
```

### Border Settings Applied
All boxes and rows in the Live Preview now respect the Border Settings:
- When "Enable Border" is checked, all elements show the configured border
- Border color (Black, Red, Blue) applies to all elements
- Border thickness (Very Thin, Thin, Normal, Thick) applies consistently

## Color Picker Updates

### Headers Configuration Section
Added new color pickers in the "Headers Configuration" collapsible section:

1. **Week Header** (2 pickers)
   - Week Header Background
   - Week Header Text

2. **Day Headers** (4 pickers)
   - Day Header Background
   - Day Header Text
   - Day Alternate Row Background (Even Days)
   - Day Alternate Row Text (Even Days)

3. **Workout Headers** (6 pickers)
   - Workout #1 Header Background
   - Workout #1 Header Text
   - Workout #2 Header Background (Even Workout)
   - Workout #2 Header Text
   - Workout #3 Header Background
   - Workout #3 Header Text

4. **Moveframe Headers** (2 pickers - unchanged)
   - Moveframe Header Background
   - Moveframe Header Text

5. **Movelap Headers** (2 pickers - unchanged)
   - Movelap Header Background (Odd Rows: 1, 3, 5...)
   - Movelap Header Text (All Rows: Even & Odd)

## Movelap Text Color Settings

### Already Implemented
The settings already include comprehensive movelap text color customization:

**Text Color Source Toggle:**
- Option 1: Use Movelaps Table text color (single color for all movelaps)
- Option 2: Use individual Movelaps Rows settings (different colors per field)

**Individual Movelap Row Settings** (when "rows" mode is selected):
- Code Section: Color, Bold, Display Mode (always/once)
- Mova Action: Color, Bold, Display Mode (always/once)
- Exercise: Color, Bold
- Style: Color
- Speed: Color, Bold
- Time: Color, Bold, Font Style (normal/italic)
- Pace: Color, Font Style (normal/italic)
- Recover/Rest: Color, Bold, Font Style (normal/italic)
- Restart To: Color, Bold, Font Style (normal/italic)
- Annotations: Color
- Aim & Sound: Color

**To Enable Colored Movelap Text:**
1. Scroll to "Movelaps Table" section
2. Select "Use individual Movelaps Rows settings (below)"
3. Expand "Movelaps Rows Settings" section
4. Customize colors for each field type

## Border Settings

### Implementation Details
Border settings apply to ALL elements in both Live Preview and real pages:

**Border Options:**
- Enable/Disable toggle
- Color: Black, Red, Blue (easily extendable)
- Thickness: Very Thin (1px), Thin (2px), Normal (3px), Thick (4px)

**Applied To:**
- Week headers
- Day headers
- Workout headers (all 3 types)
- Moveframe rows
- Movelap rows
- Microlap detail boxes
- Selected row indicators

**Live Preview Integration:**
All elements in the Live Preview now conditionally render borders:
```typescript
style={{
  backgroundColor: colors.moveframeHeader,
  color: colors.moveframeHeaderText,
  ...(colors.borderEnabled && {
    border: `${
      colors.borderWidth === 'very-thin' ? '1px' :
      colors.borderWidth === 'thin' ? '2px' :
      colors.borderWidth === 'thick' ? '4px' : '3px'
    } solid ${colors.borderColor || '#000000'}`
  })
}}
```

## Database Storage

All settings are automatically saved to the database:

**Storage Location:** `UserSettings.colorSettings` (JSON field)

**Auto-Save Behavior:**
- Changes save automatically when modified
- Save status indicator shows "Saving..." then "✓ Colors saved to database!"
- Fallback to localStorage if database save fails

**Language-Specific Defaults:**
- Super Admins can save current colors as defaults for specific languages
- Users can load language-specific defaults
- Supports all 12 languages: English, Français, Italiano, Deutsch, Español, Português, Русский, हिन्दी, 日本語, Indonesia, 中文, العربية

## Implementation in Workout Views

### Applying Colors in Components

To use these colors in workout components, fetch from user settings:

```typescript
// Example: Apply workout colors based on workout number
const getWorkoutColor = (workoutNumber: number, colors: ColorSettings) => {
  switch (workoutNumber) {
    case 1:
      return {
        bg: colors.workoutHeader,
        text: colors.workoutHeaderText
      };
    case 2:
      return {
        bg: colors.workout2Header,
        text: colors.workout2HeaderText
      };
    case 3:
      return {
        bg: colors.workout3Header,
        text: colors.workout3HeaderText
      };
    default:
      // For workout 4+, cycle through or use default
      return {
        bg: colors.workoutHeader,
        text: colors.workoutHeaderText
      };
  }
};

// Usage
<div style={{
  backgroundColor: workoutColors.bg,
  color: workoutColors.text,
  ...(colors.borderEnabled && {
    border: `${getBorderWidth(colors.borderWidth)} solid ${colors.borderColor}`
  })
}}>
  Workout #{workoutNumber}
</div>
```

### Applying Day Alternate Colors

```typescript
// Apply alternate color to even day rows
const dayIndex = /* calculate day index within week or month */;
const isEvenDay = dayIndex % 2 === 0;

<div style={{
  backgroundColor: isEvenDay ? colors.dayAlternateRow : colors.dayHeader,
  color: isEvenDay ? colors.dayAlternateRowText : colors.dayHeaderText
}}>
  Day content
</div>
```

### Applying Movelap Text Colors

```typescript
// If using individual row colors
if (colors.movelapTextColorSource === 'rows') {
  const fieldColors = colors.movelapRows;
  
  return (
    <div>
      <span style={{ 
        color: fieldColors.exercise.color,
        fontWeight: fieldColors.exercise.bold ? 'bold' : 'normal'
      }}>
        {exercise}
      </span>
      <span style={{ 
        color: fieldColors.speed.color,
        fontWeight: fieldColors.speed.bold ? 'bold' : 'normal'
      }}>
        {speed}
      </span>
      {/* ... other fields */}
    </div>
  );
}
```

## Testing Checklist

- [ ] Week header displays with custom colors
- [ ] Day headers alternate colors on even rows
- [ ] Workout #1 displays with configured colors
- [ ] Workout #2 displays with distinct colors (orange/peach by default)
- [ ] Workout #3 displays with configured colors
- [ ] Moveframes alternate colors correctly
- [ ] Movelaps alternate between odd/even colors
- [ ] Border settings apply to all elements when enabled
- [ ] Border color changes reflect across all elements
- [ ] Border thickness changes reflect across all elements
- [ ] Live Preview updates in real-time
- [ ] Settings save to database automatically
- [ ] Settings persist across page reloads
- [ ] Language-specific defaults can be saved (Super Admin)
- [ ] Language-specific defaults can be loaded
- [ ] Movelap text colors apply when "rows" mode is selected
- [ ] Contrast ratios display for accessibility
- [ ] Color schemes can be saved and loaded
- [ ] Settings can be exported as JSON
- [ ] Settings can be imported from JSON

## Migration Notes

**Backward Compatibility:**
- Existing color settings remain unchanged
- New color properties use sensible defaults
- If `workout2Header` is not defined, falls back to `workoutHeader`
- If `dayAlternateRow` is not defined, falls back to `dayHeader`

**Default Behavior:**
- Workout #1 and #3: Light cyan/green background
- Workout #2: Light orange/peach background (distinct from 1 and 3)
- Days: Alternate between primary blue and light blue
- Weeks: Dark purple/blue header at the top

## Future Enhancements

### Potential Additions:
1. **Workout #4, #5, #6 colors** - For days with more than 3 workouts
2. **Period-specific colors** - Different colors for different training periods
3. **Sport-specific colors** - Color code by sport type (swim, bike, run, etc.)
4. **Intensity-based colors** - Visual indication of workout intensity
5. **Status-based colors** - Different colors for planned, completed, skipped workouts
6. **Custom border styles** - Dashed, dotted, double borders
7. **Border per element type** - Different borders for different element types
8. **Gradient backgrounds** - Support for gradient color schemes
9. **Dark mode preset** - One-click dark mode color scheme
10. **Color accessibility checker** - Automatic WCAG compliance validation

## Documentation

All color settings are documented in:
- `src/components/settings/BackgroundsColorsSettings.tsx` - Main component
- `DATABASE-SETTINGS-INTEGRATION.md` - Settings storage documentation
- This file - Admin colors settings update

## Conclusion

The Background & Colors settings now provide comprehensive control over:
- ✅ Week header colors
- ✅ Day row colors with alternating even/odd support
- ✅ Individual colors for Workout #1, #2, and #3
- ✅ Moveframe colors (already existed)
- ✅ Movelap colors with field-specific text colors
- ✅ Border settings for all elements
- ✅ Live Preview showing complete hierarchy
- ✅ Database persistence
- ✅ Language-specific defaults
- ✅ Real-time preview updates

The system is now ready for implementation in the actual workout views (Tree View, Table View, Calendar View).

