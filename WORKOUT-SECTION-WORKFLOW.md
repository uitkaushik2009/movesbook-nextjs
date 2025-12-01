# 📝 Workout Section A - Correct Workflow

**Date:** December 1, 2025  
**Status:** ✅ Implemented

---

## 🎯 **Key Principle**

**You CANNOT add days to Section A** - all 21 days (3 weeks × 7 days) are already visible on screen.

You can ONLY:
1. **Add a Workout** to an existing day
2. **Add a Moveframe** to an existing workout

---

## 🔄 **Case 1: Add Workout to a Day**

### **Step 1: Select a Day**
User must first select a day by:
- Clicking on a row in the table, OR
- Clicking on a date in the calendar

### **Step 2: Add Workout Button**
After selecting a day, click "Add Workout" button

### **Step 3: Workout Assignment Logic**

#### **Scenario A: No workouts exist on that day**
- System automatically assigns: **"Workout #1"**
- Button shows: "Add Workout #1"

#### **Scenario B: Only Workout #1 exists**
User sees two options:
- **"Edit Workout #1"** - Opens edit form for existing workout (shows assigned name)
- **"Add Workout #2"** - Opens add form for new workout (shows `<no name assigned>`)

#### **Scenario C: Workout #1 and #2 exist**
User sees three options:
- **"Edit Workout #1"** - Opens edit form (shows assigned name)
- **"Edit Workout #2"** - Opens edit form (shows assigned name)
- **"Add Workout #3"** - Opens add form (shows `<no name assigned>`)

#### **Scenario D: All 3 workouts exist**
- System shows alert: "Maximum 3 workouts per day. Please edit an existing workout."
- No add button available, only edit buttons

---

## 🏋️ **Case 2: Add Moveframe to a Workout** ⭐ **MOST IMPORTANT**

This is the **PRIMARY WORKFLOW** for the task system!

### **Step 1: Select a Day**
User must first select a day by:
- Clicking on a row in the table, OR
- Clicking on a date in the calendar

### **Step 2: Add Moveframe Button**
After selecting a day, click "Add Moveframe" button

### **Step 3: Workout Selection (Required)**
System shows a modal with **ONLY EXISTING workouts** for that day:

```
┌─────────────────────────────────────────────┐
│  Select Workout for Moveframe               │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │ Workout #1         08 Dec 2025      │  │
│  │ Morning Run                         │  │
│  │ Sports: 🏃 Running                  │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │ Workout #2         08 Dec 2025      │  │
│  │ Evening Swim                        │  │
│  │ Sports: 🏊 Swimming                 │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### **Step 4: Select a Workout**
User clicks on one of the existing workouts

### **Step 5: Add Moveframe Form**
System opens the "Add Moveframe" form for the selected workout

### **Step 6: Moveframe Insertion Position** 🎯

**Important Rule:**

#### **If a moveframe was previously selected/clicked in the grid:**
- New moveframe is inserted **AFTER** the selected moveframe
- Example: If Moveframe B is selected, new moveframe C is inserted after B

#### **If no moveframe was selected:**
- New moveframe is added in **APPEND** (at the end)
- Example: If moveframes A, B exist, new moveframe C is added at the end

---

## 🚫 **What You CANNOT Do in Section A**

❌ Cannot add days (all 21 days already visible)  
❌ Cannot add more than 3 workouts per day  
❌ Cannot add moveframe without selecting a workout first  
❌ Cannot add moveframe to a day with no workouts  

---

## ✅ **UI Implementation Details**

### **Buttons Visibility:**

```typescript
// Section A buttons:
- "Add Day" → HIDDEN (not needed, all days visible)
- "Add Workout" → VISIBLE (requires day selection)
- "Add Moveframe" → VISIBLE (requires day + workout selection)

// Validation:
if (!selectedDay) {
  alert('Please select a day first');
  return;
}

if (existingWorkouts.length === 0) {
  alert('No workouts exist. Please add a workout first.');
  return;
}

if (existingWorkouts.length >= 3) {
  alert('Maximum 3 workouts per day.');
  return;
}
```

### **Workout Selector Modal:**

Shows:
- Workout number (#1, #2, #3)
- Date
- Assigned name (or `<no name assigned>`)
- Sport icons (max 4 unique sports)

---

## 📋 **Example User Flow**

### **Scenario: Athlete Planning Monday Workout**

1. **View Section A** - See all 21 days (3 weeks)
2. **Click on Monday row** - Day is now selected
3. **Click "Add Workout"** - Workout #1 modal opens
4. **Fill workout details:**
   - Name: "Morning Run"
   - Sport: Running
   - Duration: 60 min
5. **Save workout** - Workout #1 created
6. **Click "Add Moveframe"** - Workout selector appears
7. **Select "Workout #1 - Morning Run"** - Moveframe form opens
8. **Fill moveframe details:**
   - Type: Work to Do
   - Sport: Running
   - Distance: 5000m
   - Repetitions: 1
9. **Save moveframe** - Moveframe A created in Workout #1
10. **Click on Moveframe A** - Moveframe is selected
11. **Click "Add Moveframe" again** - Workout selector appears
12. **Select "Workout #1 - Morning Run"** - Moveframe form opens
13. **Fill second moveframe** - Moveframe B will be inserted **after** A
14. **Save** - Moveframe B created after Moveframe A

---

## 🎨 **Visual Workflow Diagram**

```
START
  ↓
[View Section A - All 21 days visible]
  ↓
[Click on a DAY]
  ↓
Decision: Add Workout or Add Moveframe?
  ↓                    ↓
[Add Workout]      [Add Moveframe]
  ↓                    ↓
Check workouts     Check workouts exist?
  ↓                    ↓
0 workouts? → Add #1   No → Alert "Add workout first"
1 workout?  → Add #2   Yes → Show Workout Selector
2 workouts? → Add #3      ↓
3 workouts? → Alert    [Select Workout]
  ↓                    ↓
[Fill Form]         [Fill Moveframe Form]
  ↓                    ↓
[Save]              Check: Moveframe selected?
  ↓                    ↓
DONE                Yes → Insert AFTER
                     No → APPEND to end
                      ↓
                    [Save]
                      ↓
                    DONE
```

---

## 🔧 **Technical Implementation**

### **State Variables:**
```typescript
- selectedDay: string | null
- selectedWorkout: string | null
- selectedMoveframe: any | null
- showWorkoutSelector: boolean
- availableWorkouts: any[]
- addWorkoutDay: any | null
```

### **Key Functions:**
```typescript
handleAddWorkout() {
  // 1. Validate day selected
  // 2. Check workout count (<3)
  // 3. Open workout modal
}

handleAddMoveframe() {
  // 1. Validate day selected
  // 2. Check workouts exist (>0)
  // 3. Show workout selector
  // 4. After workout selected → open moveframe form
  // 5. Check if moveframe selected → insert position
}
```

---

## ✅ **Testing Checklist**

- [ ] Click "Add Workout" without selecting day → Shows alert
- [ ] Click "Add Moveframe" without selecting day → Shows alert
- [ ] Click "Add Moveframe" on day with no workouts → Shows alert
- [ ] Add Workout #1 to empty day → Works
- [ ] Add Workout #2 when #1 exists → Works
- [ ] Add Workout #3 when #1 and #2 exist → Works
- [ ] Try to add Workout #4 → Shows alert (max 3)
- [ ] Add Moveframe → Shows workout selector with existing workouts
- [ ] Select workout → Opens moveframe form
- [ ] Add moveframe without selection → Appends to end
- [ ] Select moveframe, then add new → Inserts after selected
- [ ] All 21 days visible without "Add Day" button

---

## 🚀 **Deployment Status**

✅ **Committed:** `b0b7d57`  
✅ **Pushed to GitHub:** Yes  
✅ **Ready for Testing:** Yes

### **Deploy Commands:**
```bash
cd movesbook-nextjs
git pull origin main
npm run build
pm2 restart movesbook
```

---

**Last Updated:** December 1, 2025  
**Workflow Confirmed:** ✅ Correct

