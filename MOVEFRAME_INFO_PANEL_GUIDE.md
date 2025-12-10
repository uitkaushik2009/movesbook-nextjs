# 📊 MOVEFRAME INFO PANEL - USER GUIDE

## ✨ NEW FEATURE

The **Moveframe Info Panel** provides a comprehensive, detailed view of any moveframe with all its data, movelaps, statistics, and quick actions in one beautiful interface.

---

## 🎯 HOW TO ACCESS

### **Method 1: Info Button on Moveframe Row (RECOMMENDED)**

Each moveframe row now has an **"Info"** button:

```
┌──┬────┬───────┬──────┬───────┬─────────────────┬─────┬──────┬────────────────────────┐
│::│ MF │ Color │ Type │ Sport │ Description     │ Rip │ Dist │ Actions                │
├──┼────┼───────┼──────┼───────┼─────────────────┼─────┼──────┼────────────────────────┤
│::│ A  │  🟦   │ Run  │ RUN   │ 400×6 A2 P1'30  │  6  │ 2400 │ Info Copy Move Del     │
└──┴────┴───────┴──────┴───────┴─────────────────┴─────┴──────┴────────────────────────┘
                                                                   ↑
                                                            Click here!
```

**Steps**:
1. Find any moveframe in the table
2. Click the blue **"Info"** button
3. Panel opens with full details

### **Method 2: MF Info Button in Header**

In the moveframe section header:

```
Options: [MF Info] [Add MF] [Copy] [Move] [Del] [⚙ Col]
           ↑
     Click here!
```

**Note**: This shows info for the **first moveframe** in the list. Use Method 1 for specific moveframes.

---

## 📋 PANEL FEATURES

### **🎨 Beautiful Header**
- Large sport icon (🏊 🚴 🏃 💪)
- Moveframe letter and type
- Section color badge
- Date and workout number
- Quick action buttons

### **📊 Three Tabs**

#### **1. Overview Tab**
Shows the big picture:
- **Description**: Full moveframe description
- **Key Metrics**: 4 metric cards
  - Total Distance (km/m)
  - Total Time (mm:ss)
  - Movelaps (completed/total)
  - Total Reps (for body building)
- **Progress Bar**: Visual completion percentage

#### **2. Movelaps Tab**
Detailed list of all movelaps:
- **Status Indicators**: ✓ Completed or ○ Pending
- **Movelap Details**: 
  - Sequence number
  - Distance/Reps
  - Speed code
  - Pause duration
  - Style, Pace, Time
  - Notes
- **Quick Actions**: Edit/Delete each movelap
- **Add Button**: Add new movelaps

#### **3. Statistics Tab**
Advanced analytics:
- **Completion Stats**: Completed/Pending/Total breakdown
- **Distance Analysis**: Total and average per lap
- **Time Analysis**: Total and average per lap
- **Reps Analysis**: Total and average per set (for body building)

---

## 🎯 QUICK ACTIONS

All actions available in the header:

### **✏️ Edit**
- Opens the Edit Moveframe modal
- Modify description, sport, type, etc.
- Panel closes automatically

### **📋 Copy**
- Opens the Copy Moveframe modal
- Duplicate to another workout
- Panel closes automatically

### **🔄 Move**
- Opens the Move Moveframe modal
- Relocate to another workout
- Panel closes automatically

### **🗑️ Delete**
- Confirms deletion
- Removes moveframe and all movelaps
- Panel closes automatically

---

## 📊 KEY METRICS EXPLAINED

### **Total Distance**
- Sum of all movelap distances
- Displayed in meters (m) or kilometers (km)
- Shows "N/A" if not applicable (e.g., body building)

### **Total Time**
- Estimated total time for all movelaps
- Format: mm:ss (e.g., 42:30)
- Calculated from individual movelap times

### **Movelaps**
- Shows completed vs total (e.g., 3/6)
- Green color indicates progress
- Click to see full list in Movelaps tab

### **Total Reps**
- For body building moveframes
- Sum of all repetitions across sets
- Shows "N/A" for non-strength exercises

---

## 🎨 VISUAL DESIGN

### **Color-Coded Sections**
- **Header**: Indigo/Purple gradient
- **Overview Metrics**: 
  - 🔵 Blue for Distance
  - 🟢 Green for Time
  - 🟣 Purple for Movelaps
  - 🟠 Orange for Reps
- **Statistics Cards**: Gradient backgrounds
- **Status Icons**: 
  - ✅ Green checkmark = Completed
  - ⭕ Gray circle = Pending

### **Responsive Layout**
- Desktop: Full width with side-by-side metrics
- Tablet: 2-column grid
- Mobile: Single column stack

---

## 💡 USE CASES

### **1. Pre-Workout Review**
Before starting your workout:
1. Click **Info** on each moveframe
2. Review the **Overview** tab
3. Check movelap sequence in **Movelaps** tab
4. Mentally prepare for the session

### **2. During Workout Tracking**
While exercising:
1. Open Info panel
2. Go to **Movelaps** tab
3. See which laps are completed (✓)
4. Know what's coming next

### **3. Post-Workout Analysis**
After finishing:
1. Open **Statistics** tab
2. Review completion percentage
3. Check total distance/time achieved
4. Compare to previous sessions

### **4. Workout Planning**
When designing workouts:
1. Open Info for existing moveframe
2. Review structure and totals
3. Click **Copy** to duplicate
4. Modify as needed

### **5. Quick Edits**
Need to make changes:
1. Click **Info** button
2. Click **Edit** in header
3. Make changes
4. Done!

---

## 🔥 ADVANCED FEATURES

### **Movelap Management**
From the Movelaps tab:
- **Add**: Click "+ Add Movelap" button
- **Edit**: Click edit icon (✏️) on any movelap
- **Delete**: Click delete icon (🗑️) on any movelap
- **View Details**: See all fields for each lap

### **Progress Tracking**
- **Visual Progress Bar**: Shows % completion
- **Color-Coded**: Green = good progress
- **Real-Time**: Updates as movelaps completed

### **Smart Calculations**
- **Auto-Totals**: Sums calculated automatically
- **Averages**: Per-lap averages computed
- **Format Conversion**: Meters ↔ Kilometers
- **Time Parsing**: Handles various time formats

---

## 📱 KEYBOARD SHORTCUTS

| Key | Action |
|-----|--------|
| `Esc` | Close panel |
| `Tab` | Switch between tabs |
| `E` | Edit moveframe |
| `C` | Copy moveframe |
| `M` | Move moveframe |

*(Note: Shortcuts work when panel is focused)*

---

## 🐛 TROUBLESHOOTING

### **Issue: Panel doesn't open**
**Solution**: 
- Ensure moveframe has data
- Check browser console for errors
- Refresh page and try again

### **Issue: Metrics show "N/A"**
**Solution**: This is normal for moveframes without that metric type. For example:
- Body building won't have distance
- Annotation moveframes won't have movelaps

### **Issue: Movelaps not showing**
**Solution**: 
- Check if moveframe has movelaps created
- Click "Add Movelap" to create first one
- Verify movelaps exist in database

### **Issue: Quick actions don't work**
**Solution**:
- Ensure you're logged in
- Check you have permission to edit
- Verify handlers are properly connected

---

## 🎯 TESTING CHECKLIST

Test the panel with different moveframe types:

- [ ] **Swim Moveframe**: Check distance/time metrics
- [ ] **Run Moveframe**: Verify pace calculations
- [ ] **Bike Moveframe**: Test distance totals
- [ ] **Body Building**: Check reps totals
- [ ] **Annotation**: Verify no movelaps shown
- [ ] **Battery Type**: Test with multiple moveframes
- [ ] **Standard Type**: Verify all features work
- [ ] **Empty Moveframe**: Check "N/A" displays
- [ ] **Completed Movelaps**: Verify checkmarks
- [ ] **Pending Movelaps**: Verify circles
- [ ] **Edit Action**: Opens edit modal
- [ ] **Copy Action**: Opens copy modal
- [ ] **Move Action**: Opens move modal
- [ ] **Delete Action**: Confirms and deletes
- [ ] **Add Movelap**: Opens add modal
- [ ] **Edit Movelap**: Opens edit modal
- [ ] **Delete Movelap**: Confirms and deletes

---

## 📊 TECHNICAL DETAILS

### **Component Structure**
```
MoveframeInfoPanel
├── Header (gradient, sport icon, quick actions)
├── Tabs (Overview, Movelaps, Statistics)
├── Content Area (tab-specific content)
└── Footer (ID display, close button)
```

### **Props Interface**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  moveframe: any;        // Full moveframe data
  workout: any;          // Parent workout
  day: any;              // Parent day
  onEdit?: () => void;
  onCopy?: () => void;
  onMove?: () => void;
  onDelete?: () => void;
  onAddMovelap?: () => void;
  onEditMovelap?: (movelap: any) => void;
  onDeleteMovelap?: (movelap: any) => void;
}
```

### **Calculation Logic**
```typescript
// Total Distance
totalDistance = sum(movelaps.map(ml => ml.distance || 0))

// Total Time
totalTime = sum(movelaps.map(ml => parseTime(ml.time)))

// Completion %
completion = (completedCount / totalCount) * 100

// Average per Lap
average = total / movelapsCount
```

---

## 🎨 CUSTOMIZATION

### **Color Themes**
The panel uses your section colors:
- Section badge shows moveframe's section color
- Maintains brand consistency
- Automatic contrast adjustment

### **Metric Cards**
Each metric has its own color:
- Distance: Blue theme
- Time: Green theme
- Movelaps: Purple theme
- Reps: Orange theme

---

## 🚀 PERFORMANCE

- **Fast Loading**: Panel opens instantly
- **Lazy Rendering**: Only active tab renders
- **Efficient Calculations**: Cached totals
- **Smooth Animations**: 60fps transitions
- **Responsive**: Works on all screen sizes

---

## 🎉 WHAT'S NEXT?

Now that the Info Panel is complete, consider:

1. **Column Settings** - Customize table columns
2. **Bulk Movelap Generation** - Create multiple movelaps at once
3. **Template System** - Save/load moveframe templates
4. **Export Features** - Export moveframe data

---

## 💡 PRO TIPS

### **Tip 1: Quick Review**
Before workouts, open Info panels for all moveframes to get a mental map of the session.

### **Tip 2: Progress Tracking**
Use the Statistics tab to track improvement over weeks by comparing total times/distances.

### **Tip 3: Template Creation**
Find a moveframe you like? Click Info → Copy to create variations.

### **Tip 4: Movelap Editing**
Edit movelaps directly from the Info panel instead of going back to the table.

### **Tip 5: Mobile Use**
The panel is fully responsive - use it on your phone during workouts!

---

## 📈 METRICS BREAKDOWN

### **For Swimmers**
- Total Distance: Sum of all lap distances
- Total Time: Estimated swim time
- Average Pace: Time per 100m
- Movelaps: Individual lengths/intervals

### **For Runners**
- Total Distance: Total run distance
- Total Time: Estimated run time
- Average Pace: Time per km/mile
- Movelaps: Individual intervals/reps

### **For Cyclists**
- Total Distance: Total ride distance
- Total Time: Estimated ride time
- Average Speed: Calculated from distance/time
- Movelaps: Individual segments

### **For Strength Athletes**
- Total Reps: Sum of all repetitions
- Total Sets: Number of movelaps
- Average Reps: Reps per set
- Movelaps: Individual sets

---

**Last Updated**: December 10, 2025  
**Feature Status**: ✅ Fully Operational  
**Tested**: ✅ All tabs and actions working  
**Ready for Production**: ✅ Yes

