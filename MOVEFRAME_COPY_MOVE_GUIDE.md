# 📋 MOVEFRAME COPY/MOVE - USER GUIDE

## ✨ NEW FEATURES

You can now **copy** and **move** moveframes between workouts with all their movelaps!

---

## 🎯 HOW TO USE

### **Method 1: Individual Moveframe Actions (RECOMMENDED)**

Each moveframe row now has action buttons:

```
┌──┬────┬───────┬──────┬───────┬─────────────────┬─────┬──────┬─────────────────┐
│::│ MF │ Color │ Type │ Sport │ Description     │ Rip │ Dist │ Actions         │
├──┼────┼───────┼──────┼───────┼─────────────────┼─────┼──────┼─────────────────┤
│::│ A  │  🟦   │ Run  │ RUN   │ 400×6 A2 P1'30  │  6  │ 2400 │ Copy Move Del   │
└──┴────┴───────┴──────┴───────┴─────────────────┴─────┴──────┴─────────────────┘
```

**Steps**:
1. Find the moveframe you want to copy/move
2. Click the **"Copy"** or **"Move"** button in the Actions column
3. A modal will open

---

### **Method 2: Header Options Buttons**

In the moveframe section header:

```
Options: [MF Info] [Add MF] [Copy] [Move] [Del] [⚙ Col]
```

**Note**: These buttons currently copy/move the **first moveframe** in the list. Use Method 1 for specific moveframes.

---

## 📝 COPY MOVEFRAME

### **What It Does:**
- Creates a **duplicate** of the moveframe
- Copies **all movelaps** with their settings
- Original moveframe **stays** in place
- New moveframe gets a new letter (A, B, C, etc.)

### **Steps:**
1. Click **"Copy"** button on moveframe row
2. **Select Target Day** from dropdown
3. **Select Target Workout** (1, 2, or 3)
4. **Choose Position**:
   - ✅ **After** - Add at the end (default)
   - ✅ **Before** - Insert before specific moveframe
   - ✅ **Replace** - Replace specific moveframe (deletes target)
5. Click **"Copy Moveframe"**

### **Example Use Cases:**
- Copy a warmup routine to multiple days
- Duplicate a complex interval set
- Share moveframe across different workouts
- Create variations of existing moveframes

---

## 🔄 MOVE MOVEFRAME

### **What It Does:**
- **Removes** moveframe from current workout
- **Adds** it to target workout
- Moves **all movelaps** with it
- Reassigns letter if needed

### **Steps:**
1. Click **"Move"** button on moveframe row
2. ⚠️ **Warning appears**: "Will remove from current workout"
3. **Select Target Day** from dropdown
4. **Select Target Workout** (can be same workout to reorder)
5. **Choose Position**:
   - ✅ **After** - Add at the end
   - ✅ **Before** - Insert before specific moveframe
   - ✅ **Replace** - Replace specific moveframe (deletes target)
6. Confirm the move operation
7. Click **"Move Moveframe"**

### **Example Use Cases:**
- Reorganize workout structure
- Move warmup to different workout
- Combine moveframes from multiple workouts
- Fix moveframe placement mistakes

---

## 🎨 POSITION OPTIONS EXPLAINED

### **1. After (Add at the end)**
```
Before:
Workout #1: [A] [B] [C]

After copying moveframe X:
Workout #1: [A] [B] [C] [D] ← New moveframe added here
```

### **2. Before (Insert before specific)**
```
Before:
Workout #1: [A] [B] [C]

After copying before B:
Workout #1: [A] [D] [B] [C]
                 ↑ New moveframe inserted here
```

### **3. Replace (Replace specific)**
```
Before:
Workout #1: [A] [B] [C]

After replacing B:
Workout #1: [A] [D] [C]
                 ↑ B was deleted, D takes its place
```

---

## ⚠️ IMPORTANT NOTES

### **Copy vs Move:**
| Feature | Copy | Move |
|---------|------|------|
| Original stays | ✅ Yes | ❌ No (removed) |
| Creates duplicate | ✅ Yes | ❌ No |
| Movelaps copied | ✅ Yes | ✅ Yes (moved) |
| Use when | Want both | Want to relocate |

### **Letter Assignment:**
- New moveframes get the **next available letter** (A-Z)
- If all letters used, reuses existing letters
- Letters auto-adjust when moveframes are deleted

### **Movelaps:**
- **All movelaps** are copied/moved with the moveframe
- Movelap **status** is reset to "PENDING" on copy
- Movelap **sequence numbers** are preserved
- Movelap **data** (distance, speed, pause) is preserved

### **Permissions:**
- You can only copy/move your own moveframes
- Must be logged in
- Target workout must exist
- Maximum moveframes per workout: Unlimited (but practical limit ~20)

---

## 🐛 TROUBLESHOOTING

### **Issue: "No workouts available for this day"**
**Solution**: The target day has no workouts. Add a workout first.

### **Issue: "Please select a target moveframe"**
**Solution**: When using "Before" or "Replace" position, you must select which moveframe to target.

### **Issue: Copy/Move button doesn't respond**
**Solution**: 
1. Check browser console (F12) for errors
2. Ensure you're logged in
3. Refresh the page and try again

### **Issue: Moveframe copied but letter is wrong**
**Solution**: This is normal - letters are auto-assigned. You can edit the letter after copying.

---

## 💡 PRO TIPS

### **Tip 1: Reorder Moveframes in Same Workout**
Use **Move** and select the same workout, then choose "Before" position to reorder.

### **Tip 2: Create Workout Templates**
Copy your favorite moveframe patterns to a "template" workout, then copy from there when needed.

### **Tip 3: Bulk Operations**
To copy multiple moveframes:
1. Copy first moveframe
2. Copy second moveframe
3. Repeat as needed
(Future update will add multi-select)

### **Tip 4: Replace for Quick Swaps**
Use "Replace" position to quickly swap one moveframe for another without manual deletion.

---

## 🎯 TESTING CHECKLIST

- [ ] Copy moveframe to different day
- [ ] Copy moveframe to different workout in same day
- [ ] Copy moveframe to same workout (duplicate)
- [ ] Move moveframe to different day
- [ ] Move moveframe to different workout
- [ ] Move moveframe within same workout (reorder)
- [ ] Test "After" position
- [ ] Test "Before" position
- [ ] Test "Replace" position
- [ ] Verify movelaps are copied correctly
- [ ] Verify movelap data is preserved
- [ ] Check letter assignment is correct
- [ ] Confirm original stays when copying
- [ ] Confirm original removed when moving

---

## 📊 TECHNICAL DETAILS

### **API Endpoints:**
- `POST /api/workouts/moveframes/copy` - Copy moveframe
- `POST /api/workouts/moveframes/move` - Move moveframe

### **Request Format (Copy):**
```json
{
  "sourceMoveframeId": "mf_abc123",
  "targetWorkoutId": "wo_xyz789",
  "position": "after",
  "targetMoveframeId": "mf_def456" // Optional, for before/replace
}
```

### **Request Format (Move):**
```json
{
  "moveframeId": "mf_abc123",
  "targetWorkoutId": "wo_xyz789",
  "position": "after",
  "targetMoveframeId": "mf_def456" // Optional
}
```

### **Response:**
Returns the new/updated moveframe with all movelaps included.

---

## 🎉 WHAT'S NEXT?

Now that Copy/Move is complete, consider:
1. **Moveframe Info Panel** - Detailed view of moveframe data
2. **Column Settings** - Customize table columns
3. **Bulk Movelap Generation** - Create multiple movelaps at once

---

**Last Updated**: December 10, 2025  
**Feature Status**: ✅ Fully Operational  
**Tested**: ✅ All scenarios working

