# Phase 3 Features - Testing Guide 🧪

**How to Test All New Features**

---

## 🎯 What to Test

Phase 3 added these features:
1. Coach-Athlete Management
2. Import from Coach
3. Mark as Done + Statistics
4. Keyboard Shortcuts
5. Print & Export

Let me show you how to test each one!

---

## 1️⃣ **Coach-Athlete Features** (For Coaches Only)

### Prerequisites
- You need a user account with `userType: COACH`
- Or create a new user and manually change their type in the database

### What You Should See
**When logged in as a COACH:**
- At the top of the workout page (just below navbar), you'll see an **Athlete Selector** bar
- It has:
  - A dropdown that says "My Personal Workouts"
  - An "Add Athlete" button (blue)

### How to Test

**Step 1: Add an Athlete**
```
1. Click "Add Athlete" button
2. Modal opens
3. Enter an athlete's email (must be an existing user with userType: ATHLETE)
4. Optionally add notes
5. Click "Add Athlete"
6. ✅ Success: Athlete appears in dropdown
```

**Step 2: View Athlete's Workouts**
```
1. Select an athlete from the dropdown
2. ✅ Grid should reload showing THEIR workout plan
3. Blue info banner appears showing "Viewing workouts for: [Name]"
4. You can see all their weeks, days, workouts
```

**Step 3: Switch Back**
```
1. Select "My Personal Workouts" from dropdown
2. ✅ Your own workouts load
```

### If You Don't See This
- You're logged in as an ATHLETE (not a coach)
- Athlete selector only appears for COACH, TEAM_MANAGER, CLUB_TRAINER user types

---

## 2️⃣ **Import from Coach** (For Athletes Only)

### Prerequisites
- You need to be logged in as an ATHLETE
- You need at least one coach assigned to you
- That coach needs to have templates with `isShared: true`

### What You Should See
**When logged in as an ATHLETE:**
- In the **Left Sidebar**, below "Section D: Archive"
- You'll see a purple/blue gradient button: **"Import from Coach"**

### How to Test

**Step 1: Open Import Modal**
```
1. Click "Import from Coach" button (left sidebar)
2. ✅ Modal opens with purple/blue header
3. You see:
   - Coach dropdown (lists your coaches)
   - Search bar
   - Template grid (if coach has shared templates)
```

**Step 2: Browse Templates**
```
1. Select a coach from dropdown
2. ✅ Their shared templates load
3. Search by keyword
4. Click a template card to select it
5. ✅ Card gets purple border when selected
```

**Step 3: Import Template**
```
1. Select a day in the main grid (click on a day)
2. Select a template in the import modal
3. Click "Import to Day" button (bottom right)
4. ✅ Complete workout structure created in your plan
5. Modal closes
6. Grid reloads showing new workout
```

### If You Don't See This
- You're logged in as a COACH (not athlete)
- Button only appears for ATHLETE user type
- If no coaches assigned → Modal shows "No Coaches Yet" message
- If coach has no shared templates → Shows "No Workouts Available"

---

## 3️⃣ **Mark as Done + Statistics**

### What You Should See
**In the Right Sidebar:**
- When you select a WORKOUT, you'll see a green button: **"Mark as Done"**
- At the bottom of right sidebar: **Statistics dashboard** with:
  - Completion Rate (%)
  - Total/Done/Planned counts
  - Distance (km)
  - Heart rate, calories (if data exists)

### How to Test

**Step 1: Mark a Workout as Done**
```
1. Expand a day to see workouts
2. Click on a workout row to select it
3. In right sidebar, click "Mark as Done" (green button)
4. ✅ Modal opens with completion form
```

**Step 2: Fill Completion Form**
```
In the modal you'll see:

A. Completion Type:
   - [As Planned] or [Differently] buttons
   - Click one to select

B. Completion Percentage (if "As Planned"):
   - Slider from 0-100%
   - Drag to set percentage
   - Status preview shows:
     * Green = Done >75%
     * Yellow = Done <75%
     * Blue = Done Differently

C. Actual Performance Data:
   - Max Heart Rate (optional)
   - Avg Heart Rate (optional)
   - Calories (optional)
   - Feeling (1-5 dropdown)

D. Notes (optional)

5. Fill in the form
6. Click "Mark as Done"
7. ✅ Workout status updates (colored dot changes)
8. ✅ Statistics update in right sidebar
```

**Step 3: View in Section C**
```
1. Click "Section C" in left sidebar
2. ✅ Only completed workouts show
3. If no completed workouts → Shows empty state message
```

**Step 4: Check Statistics**
```
Look at bottom of right sidebar:
- Completion Rate updates
- Done count increases
- Distance/calories/HR update
✅ All numbers should reflect the workouts you've marked as done
```

---

## 4️⃣ **Keyboard Shortcuts**

### How to Test

**Copy (Ctrl+C / Cmd+C)**
```
1. Select a workout (click on workout row)
2. Press Ctrl+C (or Cmd+C on Mac)
3. ✅ Alert appears: "Workout copied!"
```

**Paste (Ctrl+V / Cmd+V)**
```
1. After copying a workout
2. Select a DIFFERENT day
3. Press Ctrl+V
4. ✅ Alert appears: "Workout pasted successfully!"
5. ✅ Complete workout duplicated to new day
```

**Cut/Move (Ctrl+X / Cmd+X)**
```
1. Select a workout
2. Press Ctrl+X
3. ✅ Alert: "Workout copied!" (with isCut flag)
4. Select different day
5. Press Ctrl+V
6. ✅ Workout moves (original deleted, new created)
```

**Escape Key**
```
1. Open any modal (Add Moveframe, Archive, etc.)
2. Press Escape key
3. ✅ Modal closes
```

**Delete Key**
```
1. Select a workout or moveframe
2. Press Delete key
3. ✅ Console log appears (delete not fully implemented yet)
```

### Important Notes
- Shortcuts DON'T work when typing in input/textarea (by design)
- Only works on the workout page
- Must have item selected first

---

## 5️⃣ **Print & Export**

### What You Should See
**In the Right Sidebar:**
- Under "General Actions" section
- You'll see a "Print" button with printer icon

### How to Test

**Step 1: Open Print Modal**
```
1. Scroll to bottom of right sidebar
2. Click "Print" button (printer icon)
3. ✅ Modal opens with blue/purple header
```

**Step 2: Configure Print Options**
```
In the modal:

A. Scope Selection:
   - [Current Day] - requires day selected
   - [Current Week] - requires day selected
   - [Entire Plan] - always available

B. Options:
   - [ ] Include movelap details
   - [ ] Include notes

3. Select options
```

**Step 3: Print**
```
1. Click "Print" button (blue)
2. ✅ Browser print dialog opens
3. You can print or save as PDF
```

**Step 4: Export to JSON**
```
1. In print modal, click "Export JSON"
2. ✅ File downloads: "workouts.json"
3. Open file → See complete workout structure
```

**Step 5: Export to CSV**
```
1. Click "Export CSV"
2. ✅ File downloads: "workouts.csv"
3. Open in Excel → See workout data in spreadsheet format
```

---

## 🔍 **Quick Visual Checklist**

When you open the workout page, you should see:

### If You're an ATHLETE:
- [ ] Left sidebar has "Import from Coach" button (purple)
- [ ] Right sidebar has "Mark as Done" button (when workout selected)
- [ ] Right sidebar shows Statistics dashboard at bottom
- [ ] Right sidebar has "Print" button

### If You're a COACH:
- [ ] Athlete selector bar at top (below navbar)
- [ ] "Add Athlete" button
- [ ] Athlete dropdown
- [ ] Everything else same as athlete

### For Everyone:
- [ ] Section C in left sidebar (filter for done workouts)
- [ ] Keyboard shortcuts work (Ctrl+C/V/X)
- [ ] Print modal opens
- [ ] Export buttons download files

---

## 🚨 **Troubleshooting**

### "I don't see the Athlete Selector"
→ You're logged in as an ATHLETE. Only COACH/TEAM_MANAGER/CLUB_TRAINER see this.

### "I don't see Import from Coach button"
→ You're logged in as a COACH. Only ATHLETE sees this.

### "Import from Coach shows 'No Coaches'"
→ You need a coach-athlete relationship in the database. Ask a coach to add you.

### "No templates when importing"
→ Coach hasn't shared any templates. Templates need `isShared: true` in database.

### "Statistics show 0 for everything"
→ You haven't marked any workouts as done yet. Mark some workouts first.

### "Keyboard shortcuts don't work"
→ Make sure you're not typing in an input field. Try clicking on the grid first.

### "Print/Export doesn't work"
→ Check browser console for errors. Make sure you're on the workout page.

---

## ✅ **Success Criteria**

You've successfully tested Phase 3 if:

- [ ] Can add athlete and switch between them (as coach)
- [ ] Import from coach modal opens and shows templates (as athlete)
- [ ] Can mark workout as done and see status change
- [ ] Statistics update after marking workouts done
- [ ] Section C filters to show only completed workouts
- [ ] Ctrl+C copies workout
- [ ] Ctrl+V pastes workout to different day
- [ ] Escape closes modals
- [ ] Print modal opens
- [ ] Export downloads JSON/CSV files

---

## 🎯 **Next Steps After Testing**

If everything works:
✅ Phase 3 is confirmed working!
✅ Ready for production deployment
✅ Follow the DEPLOYMENT-GUIDE.md

If you find issues:
- Note which feature isn't working
- Check browser console for errors
- Let me know and I'll fix it!

---

**Happy Testing!** 🎉

