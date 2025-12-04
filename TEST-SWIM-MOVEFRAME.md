# 🧪 TESTING GUIDE: SWIM MOVEFRAME SYSTEM

## ✅ QUICK START

The SWIM moveframe system is now fully integrated and ready to test!

---

## 🎯 WHAT TO TEST

### Test 1: **Basic Single Sequence** (Simple)

**Steps**:
1. Open your browser: `http://localhost:3000`
2. Login as a user/athlete
3. Go to **Workout Planning** → **Section A** → **Table View**
4. Find a workout and click "**Add Moveframe**" button (in the workout options)
5. **Selection Screen**:
   - Sport: Click **SWIM**
   - Type: **Standard** (default)
   - Section: **Warm-up** (or any section)
   - See: "Next Moveframe Letter: A"
6. Click **"Next: Build Moveframe →"**
7. **SWIM Form**:
   - Keep defaults: 100m × 1, A2, Freestyle, 1'
   - See: "Total Movelaps: 1"
8. Click **"Create Moveframe"**

**Expected Result**:
- ✅ Modal closes
- ✅ Workout refreshes
- ✅ New moveframe "A" appears in the table
- ✅ 1 movelap created (100m, A2, Freestyle)

---

### Test 2: **Multi-Sequence** (The Example from Spec)

**Steps**:
1. Click "**Add Moveframe**" button again
2. Select **SWIM**, **Standard**, **Main Set**
3. Click **"Next"**
4. **SWIM Form - Sequence 1**:
   - Meters: **400m**
   - Repetitions: **6**
   - Speed: **A2**
   - Style: **Freestyle**
   - Pause: **1'30"**
   - End Pause: **5'** ← Important for transition!
5. Click **"+ Add Another Sequence"**
6. **Sequence 2**:
   - Meters: **200m**
   - Repetitions: **3**
   - Speed: **B1**
   - Style: **Freestyle**
   - Pause: **1'**
   - End Pause: (leave empty)
7. See: **"Total Movelaps: 9"** (6 + 3)
8. Optionally fill:
   - Pace\100: `1:30/100`
   - Time: `5:00`
   - Alarm: `-3`
   - Sound: `Beep`
   - Note: `Main set for speed endurance`
9. Click **"Create Moveframe"**

**Expected Result**:
- ✅ Modal closes
- ✅ New moveframe "B" appears (or next available letter)
- ✅ Description: "400m x 6 A2 Freestyle pause 1'30" + 5' + 200m x 3 B1 Freestyle pause 1'"
- ✅ 9 movelaps created:
  - Movelaps 1-5: 400m, A2, pause 1'30"
  - Movelap 6: 400m, A2, pause **5'** (transition!)
  - Movelaps 7-9: 200m, B1, pause 1'

---

### Test 3: **Three Sequences** (Advanced)

**Steps**:
1. Add moveframe → SWIM → Standard → Cool-down
2. **Sequence 1**: 100m × 4, A1, Freestyle, 30", end 2'
3. **Add Another Sequence**
4. **Sequence 2**: 50m × 8, A2, Backstroke, 20", end 3'
5. **Add Another Sequence**
6. **Sequence 3**: 25m × 4, A1, Breaststroke, 15"
7. See: **"Total Movelaps: 16"** (4 + 8 + 4)
8. Click **"Create Moveframe"**

**Expected Result**:
- ✅ 1 moveframe
- ✅ 16 movelaps
- ✅ Description: "100m x 4 A1 Freestyle pause 30" + 2' + 50m x 8 A2 Backstroke pause 20" + 3' + 25m x 4 A1 Breaststroke pause 15""

---

### Test 4: **Remove Sequence**

**Steps**:
1. Add moveframe → SWIM
2. Add 3 sequences
3. Click **[🗑]** (trash icon) on Sequence 2
4. See: Sequence 2 removed, total movelaps updated

**Expected Result**:
- ✅ Sequence removed
- ✅ Total count recalculated

---

### Test 5: **Section Auto-Creation**

**Steps**:
1. Login as a **brand new user** (or delete all sections from DB)
2. Go to Add Moveframe
3. Select SWIM

**Expected Result**:
- ✅ 3 default sections auto-created:
  - Warm-up (Yellow #FEF3C7)
  - Main Set (Blue #DBEAFE)
  - Cool-down (Green #D1FAE5)

---

### Test 6: **Sport Validation**

**Scenario**: Day already has 4 different sports

**Steps**:
1. Add moveframes with 4 different sports (e.g., SWIM, RUN, BIKE, ROWING)
2. Try to add 5th sport (e.g., SKATE)

**Expected Result**:
- ❌ SKATE button is **disabled**
- ❌ Tooltip shows: "Day already has 4 sports (SWIM, RUN, BIKE, ROWING)"
- ✅ Can still add more SWIM moveframes (already used sport)

---

### Test 7: **Letter Auto-Generation**

**Steps**:
1. Add moveframe → See "Next Moveframe Letter: **A**"
2. Create it
3. Add another → See "Next Moveframe Letter: **B**"
4. Create it
5. Add another → See "Next Moveframe Letter: **C**"

**Expected Result**:
- ✅ Letters auto-increment: A → B → C → D → ...

---

### Test 8: **Optional Fields**

**Steps**:
1. Add SWIM moveframe
2. Fill optional fields:
   - Pace\100: `1:25/100`
   - Time: `10:00`
   - Alarm: `-5`
   - Sound: `Bell`
   - Note: `Focus on technique`
3. Create moveframe

**Expected Result**:
- ✅ All movelaps have:
  - pace: `1:25/100`
  - time: `10:00`
  - alarm: `-5`
  - sound: `Bell`
  - notes: `Focus on technique`

---

### Test 9: **Cancel Actions**

**Steps**:
1. Add moveframe → SWIM → Next
2. Fill in sequences
3. Click **"Cancel"**

**Expected Result**:
- ✅ Returns to selection screen
- ✅ Data preserved (sport, type, section still selected)

**Then**:
1. On selection screen, click top **"Cancel"**

**Expected Result**:
- ✅ Modal closes
- ✅ No moveframe created

---

### Test 10: **Validation Errors**

**Scenario**: No section selected

**Steps**:
1. Add moveframe → SWIM
2. **Don't select a section** (somehow)
3. Click "Next"

**Expected Result**:
- ❌ Alert: "Please select a section"

**Scenario**: Sport validation error

**Steps**:
1. Day has 4 sports
2. Try to add 5th sport
3. Click "Next"

**Expected Result**:
- ❌ Alert: "Cannot add this sport: Day already has 4 sports (...)"

---

## 🗄️ DATABASE CHECK

After creating moveframes, check your database:

### Check Moveframes:
```sql
SELECT id, letter, sport, type, description 
FROM moveframes 
ORDER BY createdAt DESC 
LIMIT 5;
```

**Expected**:
- See new moveframes with letters A, B, C...
- Description shows full exercise description

### Check Movelaps:
```sql
SELECT m.letter, ml.repetitionNumber, ml.distance, ml.speed, ml.style, ml.pause
FROM movelaps ml
JOIN moveframes m ON ml.moveframeId = m.id
WHERE m.id = 'YOUR_MOVEFRAME_ID'
ORDER BY ml.repetitionNumber;
```

**Expected**:
- See all movelaps in order
- Last rep of sequence has different pause (endPause)

### Check Sections:
```sql
SELECT * FROM workout_sections WHERE userId = 'YOUR_USER_ID';
```

**Expected**:
- See Warm-up, Main Set, Cool-down (if auto-created)
- Or user's custom sections

---

## 🐛 POTENTIAL ISSUES & FIXES

### Issue 1: "Section not found"
**Cause**: No sections in database  
**Fix**: API auto-creates default sections, but check:
```javascript
const response = await fetch('/api/workouts/sections', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Issue 2: "Moveframe not appearing"
**Cause**: Data not refreshing  
**Fix**: Check `onSave()` callback in `AddMoveframeModal`:
```javascript
onSave(result); // Should trigger parent refresh
```

### Issue 3: "Movelaps not created"
**Cause**: API error  
**Check**: Browser console and server logs for errors

### Issue 4: Modal doesn't open
**Cause**: Button not connected  
**Check**: `MoveframeTable.tsx` has `onClick` for "Add Moveframe"

---

## 📱 BROWSER CONSOLE TESTS

Open browser DevTools → Console, then:

### Test API Directly:
```javascript
// Fetch sections
fetch('/api/workouts/sections', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(d => console.log('Sections:', d));

// Create moveframe with movelaps
fetch('/api/workouts/moveframes/create-with-movelaps', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    workoutSessionId: 'YOUR_WORKOUT_ID',
    sectionId: 'YOUR_SECTION_ID',
    letter: 'Z',
    sport: 'SWIM',
    type: 'STANDARD',
    description: 'Test 100m x 4',
    movelaps: [
      { repetitionNumber: 1, distance: 100, speed: 'A2', style: 'Freestyle', pause: '1\'', status: 'PENDING', isSkipped: false, isDisabled: false },
      { repetitionNumber: 2, distance: 100, speed: 'A2', style: 'Freestyle', pause: '1\'', status: 'PENDING', isSkipped: false, isDisabled: false },
      { repetitionNumber: 3, distance: 100, speed: 'A2', style: 'Freestyle', pause: '1\'', status: 'PENDING', isSkipped: false, isDisabled: false },
      { repetitionNumber: 4, distance: 100, speed: 'A2', style: 'Freestyle', pause: '1\'', status: 'PENDING', isSkipped: false, isDisabled: false }
    ]
  })
})
.then(r => r.json())
.then(d => console.log('Created:', d));
```

---

## ✅ SUCCESS CRITERIA

All tests pass when:
- ✅ Modal opens without errors
- ✅ Sections load (or auto-create)
- ✅ Sport selection works
- ✅ SWIM form displays
- ✅ Can add/remove sequences
- ✅ Total movelaps calculates correctly
- ✅ Create button works
- ✅ Moveframe + movelaps appear in database
- ✅ UI refreshes and shows new moveframe
- ✅ Description is generated correctly
- ✅ Letters auto-increment

---

## 🎉 NEXT STEPS AFTER SUCCESSFUL TEST

Once SWIM is working:
1. ✅ Create RUN form (similar structure)
2. ✅ Create BIKE form (add R1/R2 fields)
3. ✅ Create BODY_BUILDING form (different structure)
4. ✅ Add Exercise Library modal
5. ✅ Implement Battery Mode

---

**Current Status**: SWIM MOVEFRAME SYSTEM READY FOR TESTING! 🏊‍♂️✅

**Your Task**: Test the workflows above and report any issues!

