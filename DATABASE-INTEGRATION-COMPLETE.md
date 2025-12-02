# ✅ Complete Database Integration - Workout System

## 📊 Database Structure (Prisma)

All workout data is fully integrated with MySQL database using Prisma ORM.

### Hierarchy of Models

```
User
  └─ WorkoutPlan (Section A, B, C, D)
      └─ WorkoutWeek (Week 1, 2, 3, ...)
          └─ WorkoutDay (Monday - Sunday)
              ├─ Period (Training period/phase)
              └─ WorkoutSession (Workout 1, 2, 3)
                  └─ Moveframe (A, B, C, ...)
                      └─ Movelap (1, 2, 3, ...)
```

---

## 🗄️ Database Models

### 1. **WorkoutPlan**
Main container for organizing workout sections.

**Fields:**
- `id` (String) - Unique ID
- `userId` (String) - Owner
- `name` (String) - Plan name
- `type` (Enum) - `CURRENT_WEEKS`, `YEARLY_PLAN`, `WORKOUTS_DONE`
- `startDate` (DateTime)
- `endDate` (DateTime)
- `createdAt`, `updatedAt`

---

### 2. **WorkoutWeek**
Individual weeks within a plan.

**Fields:**
- `id` (String)
- `workoutPlanId` (String)
- `weekNumber` (Int) - 1, 2, 3, ...
- `createdAt`

---

### 3. **WorkoutDay**
Individual days (Monday-Sunday).

**Fields:**
- `id` (String)
- `workoutWeekId` (String)
- `date` (DateTime)
- `weekNumber` (Int)
- `dayOfWeek` (Int) - 1=Monday, 7=Sunday
- `periodId` (String) - Training period reference
- `weather` (String?) - Optional
- `feelingStatus` (String?) - 1-10 scale
- `notes` (String?) - Day notes
- `createdAt`

---

### 4. **WorkoutSession**
Individual workout sessions (up to 3 per day).

**Fields:**
- `id` (String)
- `workoutDayId` (String)
- `sessionNumber` (Int) - 1, 2, or 3
- `name` (String) - "Workout 1", etc.
- `code` (String) - Workout code
- `time` (String) - Time of day
- `weather` (String?)
- `location` (String?)
- `surface` (String?) - Track, road, trail, etc.
- `heartRateMax` (Int?)
- `heartRateAvg` (Int?)
- `calories` (Int?)
- `feelingStatus` (String?)
- `notes` (String?)
- `status` (Enum) - Workout status (planned, done, etc.)
- `createdAt`

**Status Options:**
- `NOT_PLANNED`
- `PLANNED_FUTURE`
- `PLANNED_NEXT_WEEK`
- `PLANNED_CURRENT_WEEK`
- `DONE_DIFFERENTLY`
- `DONE_LESS_75`
- `DONE_MORE_75`

---

### 5. **Moveframe**
Exercise blocks within a workout.

**Fields:**
- `id` (String)
- `workoutSessionId` (String)
- `letter` (String) - A, B, C, ..., Z, AA, AB, ...
- `sport` (Enum) - Sport type
- `sectionId` (String) - Workout section reference
- `type` (Enum) - `STANDARD`, `BATTERY`, `ANNOTATION`
- `description` (String) - Moveframe details
- `createdAt`

**Sport Types:**
- `SWIM`, `BIKE`, `RUN`, `BODY_BUILDING`, `ROWING`, `SKATE`, `GYMNASTIC`, `STRETCHING`, `PILATES`, `SKI`, `TECHNICAL_MOVES`, `FREE_MOVES`

---

### 6. **Movelap**
Individual repetitions within a moveframe.

**Fields:**
- `id` (String)
- `moveframeId` (String)
- `repetitionNumber` (Int) - 1, 2, 3, ...
- `distance` (Int?) - In meters
- `speed` (String?) - Speed code (A1, A2, B1, etc.)
- `style` (String?) - Swimming style, running form, etc.
- `pace` (String?) - Pace (min/km, min/100m, etc.)
- `time` (String?) - Target time
- `reps` (Int?) - Number of reps
- `restType` (Enum?) - `SET_TIME`, `RESTART_TIME`, `RESTART_PULSE`
- `pause` (String?) - Rest duration
- `alarm` (Int?) - Alarm/notification setting
- `sound` (String?) - Sound/notification type
- `notes` (String?) - Lap notes
- `status` (Enum) - `PENDING`, `COMPLETED`, `SKIPPED`, `DISABLED`
- `isSkipped` (Boolean) - Default: false
- `isDisabled` (Boolean) - Default: false
- `createdAt`

---

### 7. **Period**
Training periods/phases.

**Fields:**
- `id` (String)
- `userId` (String)
- `name` (String) - "Base", "Build", "Peak", etc.
- `description` (String)
- `color` (String) - Hex color code
- `createdAt`

---

### 8. **WorkoutSection**
Workout sections/categories.

**Fields:**
- `id` (String)
- `userId` (String)
- `name` (String) - "Warm-up", "Main Set", "Cool-down", etc.
- `description` (String)
- `color` (String) - Hex color code
- `createdAt`

---

## 🔌 API Endpoints

### **Workout Plans**

#### GET `/api/workouts/plan`
Get workout plan with all nested data.

**Query Params:**
- `type` - `CURRENT_WEEKS`, `YEARLY_PLAN`, or `WORKOUTS_DONE`

**Returns:**
```json
{
  "plan": {
    "id": "...",
    "name": "Current 3 Weeks",
    "type": "CURRENT_WEEKS",
    "weeks": [
      {
        "weekNumber": 1,
        "days": [
          {
            "dayOfWeek": 1,
            "date": "2024-01-01",
            "period": { ... },
            "workouts": [
              {
                "sessionNumber": 1,
                "name": "Workout 1",
                "moveframes": [
                  {
                    "letter": "A",
                    "sport": "SWIM",
                    "movelaps": [ ... ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### POST `/api/workouts/plan`
Create a new workout plan.

**Body:**
```json
{
  "name": "My Training Plan",
  "type": "CURRENT_WEEKS",
  "startDate": "2024-01-01",
  "numberOfWeeks": 3
}
```

---

### **Days**

#### POST `/api/workouts/days`
Create a new workout day.

**Body:**
```json
{
  "workoutPlanId": "...",
  "weekNumber": 1,
  "date": "2024-01-01",
  "periodId": "..."
}
```

#### PATCH `/api/workouts/days`
Update a workout day.

**Body:**
```json
{
  "dayId": "...",
  "weather": "Sunny",
  "feelingStatus": "8",
  "notes": "Felt great today!",
  "periodId": "..."
}
```

#### DELETE `/api/workouts/days?dayId=...`
Delete a workout day.

---

### **Workout Sessions (Workouts)**

#### POST `/api/workouts/sessions`
Create a new workout session.

**Body:**
```json
{
  "workoutDayId": "...",
  "sessionNumber": 1,
  "name": "Morning Swim",
  "code": "SW-001",
  "time": "06:00",
  "status": "PLANNED_FUTURE"
}
```

#### GET `/api/workouts/sessions/[id]`
Get a specific workout session.

#### PUT `/api/workouts/sessions/[id]`
Update a workout session.

**Body:**
```json
{
  "name": "Morning Swim",
  "code": "SW-001",
  "time": "06:00",
  "location": "Pool",
  "surface": "Water",
  "heartRateMax": 180,
  "heartRateAvg": 140,
  "calories": 500,
  "feelingStatus": "8",
  "notes": "Great workout!",
  "status": "DONE_MORE_75"
}
```

#### DELETE `/api/workouts/sessions/[id]`
Delete a workout session.

---

### **Moveframes**

#### POST `/api/workouts/moveframes`
Create a new moveframe with movelaps.

**Body:**
```json
{
  "workoutSessionId": "...",
  "sport": "SWIM",
  "sectionId": "...",
  "type": "STANDARD",
  "description": "10 x 100m Freestyle",
  "movelaps": [
    {
      "distance": 100,
      "speed": "A2",
      "style": "Freestyle",
      "pace": "1:30",
      "pause": "0:20",
      "status": "PENDING"
    },
    // ... 9 more laps
  ]
}
```

#### PATCH `/api/workouts/moveframes/[id]`
Update moveframe (e.g., move to different workout).

**Body:**
```json
{
  "workoutSessionId": "new-workout-id"
}
```

#### DELETE `/api/workouts/moveframes/[id]`
Delete a moveframe (also deletes all movelaps).

---

### **Movelaps** ✨ NEW!

#### POST `/api/workouts/movelaps`
Create a single movelap.

**Body:**
```json
{
  "moveframeId": "...",
  "repetitionNumber": 1,
  "distance": 100,
  "speed": "A2",
  "style": "Freestyle",
  "pace": "1:30",
  "time": "1:30",
  "reps": 1,
  "restType": "SET_TIME",
  "pause": "0:20",
  "alarm": null,
  "sound": null,
  "notes": "Focus on technique",
  "status": "PENDING"
}
```

#### GET `/api/workouts/movelaps?moveframeId=...`
Get all movelaps for a moveframe.

#### GET `/api/workouts/movelaps/[id]`
Get a specific movelap.

#### PUT `/api/workouts/movelaps/[id]`
Update a movelap (full update).

**Body:**
```json
{
  "distance": 200,
  "speed": "B1",
  "pace": "3:00",
  "notes": "Updated distance"
}
```

#### PATCH `/api/workouts/movelaps/[id]`
Partial update (quick status changes).

**Body:**
```json
{
  "status": "COMPLETED",
  "isSkipped": false
}
```

#### DELETE `/api/workouts/movelaps/[id]`
Delete a movelap.

---

## 🔐 Authentication

All API endpoints require authentication via JWT token:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

The token must contain a valid `userId` that matches the data being accessed.

---

## 🔄 Data Flow

### Creating a Complete Workout:

1. **Create or Get Plan** → `/api/workouts/plan` (GET)
2. **Create Day** → `/api/workouts/days` (POST)
3. **Create Workout** → `/api/workouts/sessions` (POST)
4. **Create Moveframe** → `/api/workouts/moveframes` (POST)
   - Movelaps are created automatically with the moveframe
5. **Update Movelaps** → `/api/workouts/movelaps/[id]` (PUT/PATCH)

### Loading Data:

Single API call to `/api/workouts/plan?type=CURRENT_WEEKS` returns:
- ✅ All weeks
- ✅ All days
- ✅ All periods
- ✅ All workouts
- ✅ All moveframes
- ✅ All movelaps
- ✅ All sections

**Everything is loaded in ONE API call!** 🚀

---

## 💾 Automatic Persistence

All changes are automatically saved to the database:

1. **Create Day** → Immediately saved to `workout_days` table
2. **Add Workout** → Immediately saved to `workout_sessions` table
3. **Add Moveframe** → Immediately saved to `moveframes` + `movelaps` tables
4. **Edit Movelap** → Immediately updated in `movelaps` table
5. **Delete anything** → Cascade deletes (e.g., delete workout → deletes all moveframes and movelaps)

**No manual save required!** Everything persists automatically.

---

## 🎯 Key Features

✅ **Complete CRUD operations** for all workout levels
✅ **Cascade deletes** - Delete workout deletes all moveframes and movelaps
✅ **Relational integrity** - Foreign keys maintain data consistency
✅ **Efficient loading** - Single query loads entire workout plan
✅ **Flexible updates** - Partial updates supported (PATCH)
✅ **Authentication** - All endpoints secured with JWT
✅ **Type safety** - Full TypeScript support with Prisma types
✅ **Enums** - Constrained values for status, sport types, etc.

---

## 📝 Notes

- Maximum 3 workout sessions per day (enforced at API level)
- Moveframe letters: A-Z, then AA, AB, AC, ... (auto-generated)
- All dates stored as ISO 8601 format
- Colors stored as hex codes (#RRGGBB)
- Cascade deletes prevent orphaned data
- All timestamps tracked (createdAt, updatedAt)

---

## 🔍 Database Verification

To verify data is saved:

```bash
# Open Prisma Studio
npm run db:studio

# Or check via MySQL
mysql -u root -p
use movesbook;

# Check tables
SELECT * FROM workout_plans;
SELECT * FROM workout_weeks;
SELECT * FROM workout_days;
SELECT * FROM workout_sessions;
SELECT * FROM moveframes;
SELECT * FROM movelaps;
```

---

## ✅ Summary

**Your workout system is fully integrated with Prisma/MySQL database!**

- ✅ All 6 workout levels (Plan → Week → Day → Workout → Moveframe → Movelap) are stored
- ✅ Complete API coverage for all CRUD operations
- ✅ Automatic cascade deletes maintain data integrity
- ✅ Single query loads entire workout plan with all nested data
- ✅ All changes persist immediately to database
- ✅ Type-safe with full TypeScript support

**No additional database integration needed!** 🎉

