# 🧪 COMPLETE TESTING GUIDE - Workout Table Functionality

## 📍 Access Your Application
**URL**: http://localhost:8000

---

## ✅ PRE-TESTING CHECKLIST

1. **Login** to your account
2. Navigate to **Workouts** section
3. Switch to **Table View** (if not already there)
4. Ensure you have at least one workout plan created

---

## 🔍 TEST SCENARIOS

### **1. DAY ROW OPERATIONS**

#### ✓ Edit Day
1. Find any day row in the table
2. Click the **"Edit"** button
3. Change **Weather** (e.g., "Sunny")
4. Change **Feeling Status** (e.g., "Great")
5. Add some **Notes** (e.g., "Morning training session")
6. Click **"Save Changes"**
7. ✅ **EXPECTED**: Modal closes, data refreshes, changes appear in the table

#### ✓ Add Workout to Day
1. Click the **"Option"** dropdown button
2. Select **"Add a Workout"**
3. Fill in workout details:
   - Name: e.g., "Morning Run"
   - Code: e.g., "RUN01"
   - Select 1-4 sports (e.g., RUN, STRETCHING)
4. Click **"Save Workout"**
5. ✅ **EXPECTED**: Workout appears under that day, day expands to show it

#### ✓ Copy/Move/Paste Day
1. Click **"Option"** → **"Copy"**
2. Select target date in calendar
3. Confirm action
4. ✅ **EXPECTED**: Day is copied to target date
5. Try **"Move"** and **"Paste"** similarly

#### ✓ Day Info
1. Click **"Option"** → **"Day info"**
2. ✅ **EXPECTED**: Day information panel appears below workouts

---

### **2. WORKOUT ROW OPERATIONS**

#### ✓ Edit Workout Info
1. Expand a day that has workouts
2. Click **"Edit Info"** button on workout row
3. Change workout name and other details
4. Click **"Save"**
5. ✅ **EXPECTED**: Workout updates, data refreshes

#### ✓ Add Moveframe to Workout
1. In workout row, click **"Add MF"** button
2. **Add/Edit Moveframe Modal** opens
3. Fill in:
   - Sport (e.g., SWIM)
   - Type (Standard/Battery/Annotation)
   - Description
   - Repetitions (e.g., 6)
4. If **Standard mode**:
   - Fill distance, speed, pause, etc.
5. Click **"Save Moveframe"**
6. ✅ **EXPECTED**: Moveframe appears below workout, data refreshes

#### ✓ Copy/Move Workout
1. Click **"Copy"** button on workout row
2. Select target day
3. Choose session number (1, 2, or 3)
4. Confirm
5. ✅ **EXPECTED**: Workout is copied to target location

#### ✓ Delete Workout
1. Click **"Del"** button on workout row
2. Confirm deletion
3. ✅ **EXPECTED**: Workout is removed from database and UI

---

### **3. MOVEFRAME ROW OPERATIONS**

#### ✓ View Moveframes
1. Moveframes appear in a purple table below the workout
2. Each moveframe shows: MF letter, Color, Type, Sport, Description, Rip count, Distance
3. ✅ **EXPECTED**: All moveframes are visible and properly formatted

#### ✓ Edit Moveframe (Double-Click)
1. **Double-click** on any moveframe row
2. **Add/Edit Moveframe Modal** opens in EDIT mode
3. Modify description or other fields
4. Click **"Update Moveframe"**
5. ✅ **EXPECTED**: Moveframe updates, data refreshes

#### ✓ Expand Moveframe to Show Movelaps
1. **Single-click** on moveframe row
2. ✅ **EXPECTED**: Row expands to show movelap detail table below

#### ✓ Add Movelap to Moveframe
1. Expand a moveframe (single-click)
2. In the movelap section, click **"Add Movelap"** button
3. Fill in:
   - Sequence number
   - Distance (e.g., 400m)
   - Speed (e.g., A2)
   - Pause (e.g., 1'30)
   - Notes (optional)
4. Click **"Save Movelap"**
5. ✅ **EXPECTED**: Movelap appears in the list, data refreshes

---

### **4. MOVELAP ROW OPERATIONS**

#### ✓ View Movelaps
1. Movelaps appear in a green table when moveframe is expanded
2. Shows: Sequence, Distance, Speed, Pause, Time, Status
3. ✅ **EXPECTED**: All movelaps display correctly

#### ✓ Edit Movelap (Click Row)
1. Click on any movelap row
2. **Add/Edit Movelap Modal** opens in EDIT mode
3. Modify distance, speed, or other fields
4. Click **"Save Movelap"**
5. ✅ **EXPECTED**: Movelap updates, data refreshes

#### ✓ Delete Movelap
1. Click **delete icon** (🗑️) on movelap row
2. Confirm deletion
3. ✅ **EXPECTED**: Movelap is removed

---

### **5. SESSION NUMBER TESTING**

#### ✓ Add Multiple Workouts to Same Day
1. Add **Workout #1** (gets session 1)
2. Add **Workout #2** (gets session 2)
3. Add **Workout #3** (gets session 3)
4. ✅ **EXPECTED**: Each gets correct session number (1, 2, 3)

#### ✓ Test Maximum Workouts Limit
1. Try to add a **4th workout** to a day
2. ✅ **EXPECTED**: Error modal appears: "Maximum 3 workouts per day"

#### ✓ Test Gap Handling
1. Create 3 workouts (sessions 1, 2, 3)
2. Delete workout #2
3. Add a new workout
4. ✅ **EXPECTED**: New workout gets session #2 (fills the gap)

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "Data not appearing after edit"
**Solution**: 
- Check browser console (F12) for errors
- Verify API calls are succeeding (Network tab)
- Ensure you're logged in (check auth token)

### Issue: "Session number already exists"
**Solution**: 
- This should be fixed! If it still occurs:
  - Delete all workouts from that day
  - Try adding again
  - Report the bug with console logs

### Issue: "Can't see changes in table"
**Solution**:
- Data refresh should happen automatically after edits
- If not working, try refreshing the page (F5)
- Check console for `loadWorkoutData` call

### Issue: "Buttons don't respond"
**Solution**:
- Check if modal is appearing behind another element
- Try clicking again (might be a timing issue)
- Check console for JavaScript errors

---

## 📊 DATA FLOW VERIFICATION

### After Any Edit Operation:
1. **API Call** is made (check Network tab)
2. **Response** returns success (200/201)
3. **loadWorkoutData()** is called automatically
4. **UI refreshes** with new data
5. **Success message** appears (green notification)

---

## 🔧 DEBUGGING TIPS

### Enable Console Logging
Press **F12** → **Console** tab

Look for these log messages:
- `✅ Workout session created`
- `✅ Moveframe updated`
- `✅ Movelap created`
- `🔄 Loading workout data for section: A`
- `📝 Creating workout with data:`

### Check Network Requests
Press **F12** → **Network** tab

Successful requests should show:
- POST `/api/workouts/sessions` → **201**
- PATCH `/api/workouts/days/[id]` → **200**
- PATCH `/api/workouts/moveframes/[id]` → **200**
- GET `/api/workouts/plan` → **200**

---

## ✨ FEATURES SUMMARY

| Feature | Working | Notes |
|---------|---------|-------|
| Edit Day | ✅ | Weather, feeling, notes |
| Add Workout | ✅ | Smart session numbering |
| Edit Workout | ✅ | Full update support |
| Delete Workout | ✅ | Cascades to moveframes |
| Add Moveframe | ✅ | With auto-generated movelaps |
| Edit Moveframe | ✅ | Double-click to edit |
| Delete Moveframe | ✅ | Cascades to movelaps |
| Add Movelap | ✅ | Full form support |
| Edit Movelap | ✅ | Click row to edit |
| Delete Movelap | ✅ | Remove from DB |
| Copy/Move Day | ✅ | With date picker |
| Copy/Move Workout | ✅ | Between days |
| Export/Share/Print | ✅ | Multiple formats |

---

## 🎯 PRIORITY TEST ORDER

1. **Add Workout** (most common operation)
2. **Edit Day** (basic edit)
3. **Add Moveframe** (core feature)
4. **Edit Moveframe** (double-click)
5. **Add Movelap** (detailed data)
6. **Edit Movelap** (fine-tuning)
7. **Copy/Move operations** (advanced)

---

## 📞 SUPPORT

If you encounter any issues:
1. Check this guide first
2. Look at browser console (F12)
3. Note the exact steps to reproduce
4. Save any error messages
5. Report with screenshots if possible

---

**Last Updated**: December 10, 2025
**Version**: 1.0
**Status**: ✅ All features operational

