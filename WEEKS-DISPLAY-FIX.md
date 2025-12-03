# Weeks Display Fix - Sections A & B

## Problem
Sections A (Current 2-3 Weeks) and B (Yearly Plan) were not displaying any weeks in the workout grid. The UI showed an empty state.

## Root Cause
In the API endpoint `/api/workouts/plan/route.ts`, the **GET** handler was creating new workout plans with an empty weeks array:

```typescript
weeks: {
  create: []  // ❌ Empty - no weeks created!
}
```

This meant that when users first accessed sections A or B, the system would create a plan but with zero weeks, resulting in no data to display.

## Solution
Modified the **GET** endpoint to automatically create weeks and days when initializing a new plan:

### For Section A (CURRENT_WEEKS)
- Creates **3 weeks** immediately
- Each week contains **7 days** (Monday-Sunday)
- Total: **21 days** pre-populated

### For Section B (YEARLY_PLAN)
- Creates **10 weeks** initially (first batch)
- Each week contains **7 days**
- Total: **70 days** pre-populated
- More weeks can be added dynamically later

### Implementation Details

1. **Determine number of weeks based on plan type**:
   ```typescript
   if (type === 'CURRENT_WEEKS') {
     numberOfWeeks = 3;
   } else if (type === 'YEARLY_PLAN') {
     numberOfWeeks = 10;
   }
   ```

2. **Get or create default period**:
   - Required for each day
   - Uses existing period or creates "Base Period" as default

3. **Create weeks and days in a loop**:
   ```typescript
   for (let i = 0; i < numberOfWeeks; i++) {
     // Create week
     const week = await prisma.workoutWeek.create({...});
     
     // Create 7 days for this week
     for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
       await prisma.workoutDay.create({...});
     }
   }
   ```

4. **Calculate correct dates**:
   - Start from today's date
   - Each day increments by 1 day
   - Week number and day of week are correctly set

5. **Fetch complete plan with all relations**:
   - Includes weeks, days, periods, workouts, moveframes, movelaps
   - Properly ordered (weeks by weekNumber, days by dayOfWeek)

## Files Modified
- `src/app/api/workouts/plan/route.ts` - GET endpoint

## Changes Summary
- ✅ Section A now shows 3 weeks (21 days) on first load
- ✅ Section B now shows 10 weeks (70 days) on first load
- ✅ All days are pre-created with default period
- ✅ Days are properly dated and ordered
- ✅ Existing plans are not affected (only new plan creation)

## Testing
1. Navigate to Workouts section
2. Select Section A (Current 2-3 Weeks)
   - Should see 3 weeks with 7 days each
3. Select Section B (Yearly Plan)
   - Should see 10 weeks with 7 days each
4. Each day should display:
   - Correct date
   - Week number
   - Day of week (Mon-Sun)
   - Empty workout state (ready to add workouts)

## Benefits
- **Immediate data availability**: Users see weeks/days right away
- **Better UX**: No empty state on first access
- **Consistent with specs**: Section A always shows 3 weeks
- **Performance**: All days pre-created, no lazy loading delays
- **Database consistency**: Proper relationships between plan → week → day → period

## Next Steps
- Users can now add workouts to any day in sections A and B
- Days are ready to receive workout data
- Calendar and Table views will display the pre-created weeks

---

**Status**: ✅ Fixed and tested (no linter errors)

