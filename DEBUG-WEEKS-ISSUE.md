# Debug: No Weeks Displaying

## Added Debug Logging

I've added extensive console logging to help diagnose the issue:

### In `WorkoutSection.tsx`:
- Logs the full API response
- Logs plan ID, weeks count, and structure
- Logs first week and its days
- Warns if no weeks found

### In `WorkoutGrid.tsx`:
- Logs what props it receives
- Logs workoutPlan object
- Logs weeks array and length
- Shows different messages for different scenarios

## What to Check Now

### 1. Open Browser Console (F12)

Look for these log messages after loading the Workout section:

**Expected (if working):**
```
🔄 Loading workout data for section: A type: CURRENT_WEEKS
✅ Full API response: {...}
✅ Plan loaded: [some-id]
📊 Number of weeks: 3
✅ First week: {...}
✅ First week days: [...]
🎯 WorkoutGrid received workoutPlan: {...}
🎯 workoutPlan?.weeks?.length: 3
```

**If you see:**
```
⚠️ No weeks found in plan!
```
Then the API is returning a plan but with no weeks.

**If you see:**
```
⚠️ WorkoutGrid: No workoutPlan or no weeks
```
Then workoutPlan is null or weeks is undefined.

**If you see:**
```
⚠️ WorkoutGrid: Weeks array is empty
```
Then weeks array exists but has 0 items.

### 2. Possible Issues & Solutions

#### Issue A: Old Plan in Database
**Problem**: You might have an old workout plan in the database that was created before my fix (with empty weeks array).

**Solution**: Delete the old plan so a new one is created:
1. Open browser console
2. Run this in the console:
```javascript
// Get token
const token = localStorage.getItem('token');

// Delete old plan (optional - backup first)
fetch('/api/workouts/plan?type=CURRENT_WEEKS', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
}).then(() => {
  console.log('Plan deleted, refresh page');
  window.location.reload();
});
```

Or manually in database:
```sql
-- Find your workout plans
SELECT * FROM WorkoutPlan WHERE type = 'CURRENT_WEEKS';

-- Delete the plan (replace with your ID)
DELETE FROM WorkoutPlan WHERE id = 'your-plan-id-here';
```

#### Issue B: Database Connection
**Check**: Are you able to access other parts of the app that use the database?

**Test**: Try creating a new user or accessing settings to verify database is working.

#### Issue C: Token/Auth Issue
**Check**: Even though no 401 error, the token might be invalid.

**Solution**: 
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Try Workout section

### 3. Manual API Test

Test the API directly in browser console:

```javascript
const token = localStorage.getItem('token');

// Test the API
fetch('/api/workouts/plan?type=CURRENT_WEEKS', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('API Response:', data);
  console.log('Plan ID:', data.plan?.id);
  console.log('Weeks:', data.plan?.weeks);
  console.log('Number of weeks:', data.plan?.weeks?.length);
});
```

### 4. Check Database Directly

If you have database access, run:

```sql
-- Find all plans
SELECT 
  wp.id as plan_id,
  wp.type,
  wp.name,
  COUNT(DISTINCT ww.id) as week_count,
  COUNT(DISTINCT wd.id) as day_count
FROM WorkoutPlan wp
LEFT JOIN WorkoutWeek ww ON ww.workoutPlanId = wp.id
LEFT JOIN WorkoutDay wd ON wd.workoutWeekId = ww.id
GROUP BY wp.id, wp.type, wp.name;
```

Expected result: Should see a plan with 3 weeks and 21 days for CURRENT_WEEKS.

## Next Steps

Please:
1. **Refresh the page** and open browser console (F12)
2. **Navigate to Workouts → Section A**
3. **Copy all console logs** and send them to me
4. **Take a screenshot** of what you see

This will help me identify exactly where the issue is!

---

**Note**: The debug logging will stay in the code until we resolve this.

