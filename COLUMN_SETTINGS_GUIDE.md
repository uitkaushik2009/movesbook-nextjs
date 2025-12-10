# ⚙️ COLUMN SETTINGS - USER GUIDE

## ✨ NEW FEATURE

**Column Settings** gives you full control over which columns appear in your workout tables. Customize your view to see only what matters to you!

---

## 🎯 HOW TO ACCESS

### **Method 1: From Moveframe Options (Quick Access)**

In any workout's moveframe section:

```
Options: [MF Info] [Add MF] [Copy] [Move] [Del] [⚙ Col]
                                                    ↑
                                              Click here!
```

**Steps**:
1. Expand any workout in the table
2. Look for the Options bar above moveframes
3. Click the **"⚙ Col"** button
4. Modal opens with moveframe column settings

### **Method 2: Future - From Table Headers**
*(Coming soon: Right-click on any table header)*

---

## 📊 AVAILABLE TABLE TYPES

You can customize columns for 4 different table types:

### **1. Day Row Table** 📅
Columns available:
- :: (Drag handle) - Required
- Day - Required
- Date - Required  
- Period
- Week#
- Day Type
- Weather
- Location
- Notes
- Options - Required

### **2. Workout Table** 💪
Columns available:
- :: (Drag handle) - Required
- Session - Required
- Name
- Code
- Time
- Location
- Weather
- HR Max
- HR Avg
- Calories
- Feeling
- Notes
- Actions - Required

### **3. Moveframe Table** 🏃
Columns available:
- :: (Drag handle) - Required
- MF - Required
- Color
- Type
- Sport - Required
- Description - Required
- Rip
- Dist
- Time
- Macro
- Alarm
- Actions - Required

### **4. Movelap Table** 🔢
Columns available:
- # - Required
- Status
- Distance
- Speed
- Style
- Pace
- Time
- Reps
- Rest
- Pause
- Alarm
- Sound
- Notes
- Actions - Required

---

## 🎨 MODAL FEATURES

### **Header Section**
- **Title**: "Column Settings"
- **Subtitle**: Shows table type and visible count (e.g., "7/12 columns visible")
- **Quick Actions**:
  - **Show All**: Make all columns visible
  - **Hide Optional**: Show only required columns
  - **Reset to Default**: Restore original settings

### **Column List**
Each column shows:
- **Reorder Buttons**: ▲ ▼ to move column up/down
- **Drag Handle**: :: for visual reference
- **Visibility Checkbox**: ✓ (visible) or eye-off icon (hidden)
- **Column Name**: Bold label
- **Required Badge**: Red badge if column can't be hidden
- **Description**: Help text explaining the column
- **Order Number**: Shows current position (1, 2, 3...)

### **Footer**
- **Count Display**: "X of Y columns visible"
- **Cancel Button**: Close without saving
- **Save Changes Button**: Apply and save settings

---

## 💡 HOW TO USE

### **Show/Hide Columns**
1. Click the checkbox next to any column
2. ✓ = Column is visible
3. Eye-off icon = Column is hidden
4. Required columns can't be hidden (disabled checkbox)

### **Reorder Columns**
1. Use ▲ button to move column up
2. Use ▼ button to move column down
3. Watch the order number update
4. Columns will appear in this order in the table

### **Quick Actions**
**Show All**:
- Makes every column visible
- Great for detailed analysis
- May make table wider

**Hide Optional**:
- Shows only required columns
- Creates minimal, clean view
- Perfect for mobile or quick glance

**Reset to Default**:
- Restores original column configuration
- Cancels all custom changes
- Returns to recommended view

### **Save Changes**
1. Make your adjustments
2. Click **"Save Changes"** button
3. Settings save immediately
4. Table updates instantly
5. Settings persist across sessions

---

## 🔥 USE CASES

### **1. Simplified Mobile View** 📱
**Problem**: Too many columns on small screen  
**Solution**:
1. Open Column Settings
2. Click "Hide Optional"
3. Keep only essential columns
4. Easy scrolling on mobile

### **2. Detailed Analysis** 📊
**Problem**: Need to see all data fields  
**Solution**:
1. Open Column Settings
2. Click "Show All"
3. Review every data point
4. Make data-driven decisions

### **3. Coach View** 👨‍🏫
**Problem**: Need specific metrics only  
**Solution**:
1. Show: HR Max, HR Avg, Feeling, Calories
2. Hide: Code, Location, Weather
3. Focus on performance metrics
4. Track athlete progress

### **4. Athlete Training View** 🏃‍♂️
**Problem**: Want simple workout overview  
**Solution**:
1. Show: Name, Time, Feeling, Notes
2. Hide: Technical fields
3. Focus on execution
4. Less distraction

### **5. Print-Friendly View** 🖨️
**Problem**: Table too wide to print  
**Solution**:
1. Hide: Optional decorative columns
2. Keep: Core data columns
3. Reorder: Most important first
4. Perfect for paper

---

## 💾 SETTINGS PERSISTENCE

### **Where Settings Are Stored**
- **Browser localStorage**: Settings saved locally
- **Per Table Type**: Each table has its own settings
- **Persistent**: Settings survive page refreshes
- **User-Specific**: Each browser has its own settings

### **What Gets Saved**
```javascript
{
  day: {
    visibleColumns: ['drag', 'day', 'date', 'period', 'options'],
    columnOrder: ['drag', 'day', 'date', 'period', 'weekNumber', ...]
  },
  workout: { ... },
  moveframe: { ... },
  movelap: { ... }
}
```

### **When Settings Apply**
- ✅ Immediately after clicking "Save Changes"
- ✅ On next page load
- ✅ In all tabs/windows
- ✅ Until reset or changed

### **Clearing Settings**
**Method 1**: Use "Reset to Default" button  
**Method 2**: Clear browser localStorage  
**Method 3**: Use different browser/profile

---

## 🎯 REQUIRED VS OPTIONAL

### **Required Columns** 🔒
These columns **CANNOT** be hidden:
- **Drag handles** (::) - For reordering
- **Identifiers** (Day, Session, MF, #) - Core data
- **Actions** - Essential controls
- **Key fields** - Critical information

**Why?**
- Maintain table functionality
- Ensure data integrity
- Preserve user interactions
- Avoid confusion

### **Optional Columns** ✨
These columns **CAN** be hidden:
- Weather
- Location
- Notes
- HR metrics
- Calories
- Time details
- Style
- Alarm settings

**Why?**
- Personal preference
- Screen space
- Workflow focus
- Print optimization

---

## 🎨 VISUAL INDICATORS

### **Visible Column**
```
┌────────────────────────────────┐
│ ✓  Name                     3  │
│    Workout name                │
└────────────────────────────────┘
  ↑ Green checkmark = visible
```

### **Hidden Column**
```
┌────────────────────────────────┐
│ 👁️‍🗨️  Weather                  7  │
│    Weather conditions          │
└────────────────────────────────┘
  ↑ Eye-off icon = hidden
  (Faded appearance)
```

### **Required Column**
```
┌────────────────────────────────┐
│ ✓  Session  [Required]      1  │
│    Workout session number      │
└────────────────────────────────┘
         ↑ Red badge, can't toggle
```

---

## 📊 COLUMN REORDERING

### **How It Works**
1. Columns display in the order shown
2. Use ▲ ▼ buttons to change order
3. Order number updates in real-time
4. Table reflects new order instantly

### **Reorder Strategy**
**Most Important First**:
- Put critical columns on left
- Users see them first
- Less scrolling needed

**Group Related Columns**:
- Keep similar data together
- HR Max and HR Avg adjacent
- Distance, Speed, Pace grouped

**Actions Last**:
- Action buttons typically right-aligned
- Follows UI conventions
- Consistent user experience

---

## 🐛 TROUBLESHOOTING

### **Issue: Settings not saving**
**Solution**:
- Check browser allows localStorage
- Try different browser
- Clear cache and retry
- Check for browser extensions blocking storage

### **Issue: Column still shows after hiding**
**Solution**:
- Check if it's a required column (red badge)
- Click "Save Changes" button
- Refresh page
- Try "Reset to Default" then reapply

### **Issue: Table looks weird after changes**
**Solution**:
- Click "Reset to Default"
- Reload page
- Try "Show All" to see all columns
- Check for very wide columns

### **Issue: Can't reorder columns**
**Solution**:
- Use ▲ ▼ buttons (not drag and drop yet)
- Can't move beyond first/last position
- Save changes after reordering

---

## 💡 PRO TIPS

### **Tip 1: Create View Presets**
Create different "views" for different purposes:
- Training View: Minimal columns, focus on execution
- Analysis View: All columns, detailed review
- Print View: Essential only, fits on paper

*(Manual for now, preset feature coming soon)*

### **Tip 2: Mobile-First Design**
Start with minimal columns, add as needed:
1. Hide Optional
2. Add back only what you use
3. Keep under 6 columns for mobile
4. Test on actual device

### **Tip 3: Performance Optimization**
Fewer columns = faster rendering:
- Hide unused columns
- Especially for large datasets
- Improves scroll performance
- Reduces memory usage

### **Tip 4: Accessibility**
For better accessibility:
- Keep Action columns visible
- Ensure key identifiers shown
- Don't hide too many columns
- Maintain logical column order

### **Tip 5: Team Consistency**
If sharing with team:
- Document your column setup
- Share screenshot of settings
- Use Reset to Default for standard view
- Train team on your configuration

---

## 🎯 DEFAULT CONFIGURATIONS

### **Day Row Default**
✅ Visible:
- ::, Day, Date, Period, Week#, Day Type, Options

❌ Hidden:
- Weather, Location, Notes

### **Workout Default**
✅ Visible:
- ::, Session, Name, Time, Feeling, Actions

❌ Hidden:
- Code, Location, Weather, HR Max, HR Avg, Calories, Notes

### **Moveframe Default**
✅ Visible:
- ::, MF, Color, Type, Sport, Description, Rip, Dist, Actions

❌ Hidden:
- Time, Macro, Alarm

### **Movelap Default**
✅ Visible:
- #, Status, Distance, Speed, Pace, Time, Pause, Actions

❌ Hidden:
- Style, Reps, Rest, Alarm, Sound, Notes

---

## 🚀 FUTURE ENHANCEMENTS

Coming soon:
- [ ] Right-click on headers to toggle columns
- [ ] Drag-and-drop column reordering
- [ ] Save multiple preset configurations
- [ ] Export/import column settings
- [ ] Sync settings across devices
- [ ] Column width customization
- [ ] Freeze columns (keep left while scrolling)
- [ ] Filter columns by category

---

## 📈 TECHNICAL DETAILS

### **Storage Format**
```typescript
interface ColumnSettings {
  [tableType: string]: {
    visibleColumns: string[];  // IDs of visible columns
    columnOrder: string[];     // Ordered list of all column IDs
  };
}
```

### **localStorage Key**
```
workout_column_settings
```

### **Hook Usage**
```typescript
const {
  settings,
  updateTableSettings,
  resetTableSettings,
  isColumnVisible,
  getVisibleColumns,
  getColumnOrder
} = useColumnSettings();
```

---

## 🎉 BENEFITS

### **For Athletes** 🏃
- Simplified view of daily workouts
- Focus on what matters
- Less distraction
- Faster navigation

### **For Coaches** 👨‍🏫
- Detailed analytics when needed
- Performance metrics front and center
- Quick overview for many athletes
- Print-friendly reports

### **For Teams** 🤝
- Consistent viewing experience
- Standardized configurations
- Easy training
- Shared workflows

### **For Developers** 💻
- Flexible architecture
- Easy to add new columns
- Maintainable code
- Extensible system

---

**Last Updated**: December 10, 2025  
**Feature Status**: ✅ Fully Operational  
**Tested**: ✅ All 4 table types working  
**Settings Persistence**: ✅ localStorage implemented  
**Ready for Production**: ✅ Yes

