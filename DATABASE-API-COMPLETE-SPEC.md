# 🗄️ Complete Database & API Specification

## 📊 Prisma Schema Updates

### ✅ 1. WorkoutDay Model

```prisma
model WorkoutDay {
  id           String   @id @default(cuid())
  workoutWeekId String
  userId       String   // Direct user reference for easier queries
  date         DateTime
  weekNumber   Int
  dayOfWeek    Int      // 1-7 (Monday=1, Sunday=7)
  periodId     String
  periodName   String?  // Cached for faster display
  periodColor  String?  // Cached for faster display
  weather      String?
  feelingStatus String?
  notes        String?  @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  workoutWeek WorkoutWeek  @relation(fields: [workoutWeekId], references: [id], onDelete: Cascade)
  period      Period       @relation(fields: [periodId], references: [id], onDelete: Cascade)
  workouts    WorkoutSession[]

  @@unique([userId, date]) // Ensure one day per date per user
  @@index([userId, date])
  @@map("workout_days")
}
```

**Key Features:**
- ✅ Direct `userId` field for efficient queries
- ✅ Cached `periodName` and `periodColor` for performance
- ✅ Unique constraint on `(userId, date)` to prevent duplicates
- ✅ `updatedAt` for tracking modifications

---

### ✅ 2. WorkoutSession Model (Workout)

```prisma
model WorkoutSession {
  id             String   @id @default(cuid())
  workoutDayId   String
  sessionNumber  Int      // 1, 2, or 3 (Workout #1, #2, #3)
  name           String?  @db.VarChar(40)  // Optional, max 40 chars
  code           String?  @db.VarChar(5)   // Optional, max 5 chars
  time           String?
  durationMinutes Int?
  weather        String?
  location       String?
  surface        String?
  heartRateMax   Int?
  heartRateAvg   Int?
  calories       Int?
  feelingStatus  String?
  notes          String?  @db.Text
  status         WorkoutStatus
  statusColor    String?  // WHITE, YELLOW, ORANGE, RED, BLUE, LIGHT_GREEN, GREEN
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  workoutDay WorkoutDay @relation(fields: [workoutDayId], references: [id], onDelete: Cascade)
  moveframes Moveframe[]
  sports     WorkoutSessionSport[]

  @@unique([workoutDayId, sessionNumber]) // Unique workout number per day
  @@index([workoutDayId])
  @@map("workout_sessions")
}
```

**Key Features:**
- ✅ `sessionNumber` field (1-3) instead of generic `index`
- ✅ `durationMinutes` for planned duration
- ✅ `statusColor` for visual indicators
- ✅ Unique constraint on `(workoutDayId, sessionNumber)` prevents duplicate workout numbers
- ✅ Optional `name` (40 chars) and `code` (5 chars)

---

### ✅ 3. Moveframe Model

```prisma
model Moveframe {
  id               String   @id @default(cuid())
  workoutSessionId String
  code             String   // "A", "B", "C", ..., "Z", "AA", "AB", etc.
  letter           String   // Same as code (legacy compatibility)
  sport            SportType
  sectionId        String
  sectionName      String?  // Cached section name
  sectionColor     String?  // Cached section color
  type             MoveframeType
  description      String?  @db.Text
  totalDistance    Int?     // Sum of all movelaps' distance
  totalReps        Int?     // Number of work repetitions
  macroRest        String?  // Final rest description if used
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  workoutSession WorkoutSession @relation(fields: [workoutSessionId], references: [id], onDelete: Cascade)
  section        WorkoutSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  movelaps       Movelap[]

  @@unique([workoutSessionId, code]) // Unique code per workout
  @@index([workoutSessionId])
  @@map("moveframes")
}
```

**Key Features:**
- ✅ Both `code` and `letter` fields (for migration compatibility)
- ✅ Cached `sectionName` and `sectionColor`
- ✅ `totalDistance` and `totalReps` for aggregate calculations
- ✅ `macroRest` for complex rest patterns
- ✅ Unique constraint on `(workoutSessionId, code)`

---

### ✅ 4. Movelap Model (Microlap)

```prisma
model Movelap {
  id               String       @id @default(cuid())
  moveframeId      String
  index            Int          // Position in sequence (1..n)
  repetitionNumber Int          // Legacy compatibility
  mfCode           String?      // Cached moveframe code ("A", "B", etc.)
  distance         Int?         // Meters
  speed            String?      // Speed code (A1, A2, B1, etc.)
  speedCode        String?      // Alias for speed
  style            String?      // Sport-specific style
  pace             String?      // e.g., "0:45:0"
  time             String?      // Duration
  reps             Int?         // Number of reps (default 1)
  restType         RestType?
  pause            String?      // Rest time
  restTo           String?      // Restart time target
  alarm            Int?         // -1 to -10
  sound            String?
  notes            String?      @db.Text
  status           MovelapStatus
  isSkipped        Boolean      @default(false)
  isDisabled       Boolean      @default(false)
  origin           MovelapOrigin @default(NORMAL)
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  moveframe Moveframe @relation(fields: [moveframeId], references: [id], onDelete: Cascade)

  @@unique([moveframeId, index]) // Unique position within moveframe
  @@index([moveframeId])
  @@map("movelaps")
}

enum MovelapOrigin {
  NORMAL
  DUPLICATE
  NEW
  PASTE
}
```

**Key Features:**
- ✅ `index` field for absolute positioning
- ✅ `mfCode` cached from parent moveframe
- ✅ `restTo` for restart time targets
- ✅ `origin` enum to track how the lap was created
- ✅ Both `speed` and `speedCode` for compatibility
- ✅ Unique constraint on `(moveframeId, index)`

---

## 🚀 API Route Handlers

### 1. Edit Day - `PATCH /api/days/[dayId]`

**File:** `src/app/api/days/[dayId]/route.ts`

**Purpose:** Modify day metadata without affecting workouts/moveframes/movelaps

**Request Body:**
```typescript
{
  date?: string;          // ISO date string
  periodId?: string;
  weather?: string;
  feelingStatus?: string;
  notes?: string;
}
```

**Validation Rules:**
1. ✅ Authenticate user
2. ✅ Verify day belongs to user
3. ✅ If date changes, check no duplicate `(userId, date)` exists
4. ✅ Auto-calculate `weekNumber` and `dayOfWeek` from date
5. ✅ If periodId changes, fetch period and cache name/color

**Response:**
```typescript
{
  day: {
    id: string;
    date: DateTime;
    weekNumber: number;
    dayOfWeek: number;
    periodId: string;
    periodName: string;
    periodColor: string;
    weather: string;
    feelingStatus: string;
    notes: string;
    updatedAt: DateTime;
  }
}
```

**Business Logic:**
- Does NOT modify workouts, moveframes, or movelaps
- Recalculates week number based on yearly start date
- Reorders days chronologically after date change

---

### 2. Add Workout - `POST /api/days/[dayId]/workouts`

**File:** `src/app/api/days/[dayId]/workouts/route.ts`

**Purpose:** Add a new workout (1, 2, or 3) to an existing day

**Request Body:**
```typescript
{
  sessionNumber?: number;    // 1, 2, or 3 (auto-assigned if not provided)
  name?: string;            // Max 40 chars
  code?: string;            // Max 5 chars
  time?: string;
  durationMinutes?: number;
  location?: string;
  surface?: string;
  weather?: string;
  heartRateMax?: number;
  heartRateAvg?: number;
  calories?: number;
  feelingStatus?: string;
  notes?: string;
  statusColor?: string;     // Default: "YELLOW"
}
```

**Validation Rules:**
1. ✅ Authenticate user
2. ✅ Verify day exists and belongs to user
3. ✅ Count existing workouts for day
4. ✅ If count >= 3 → Return 400 "Max 3 workouts per day"
5. ✅ If sessionNumber provided, check no duplicate `(dayId, sessionNumber)`
6. ✅ If sessionNumber not provided, auto-assign next free number (1, 2, or 3)

**Response:**
```typescript
{
  workout: {
    id: string;
    workoutDayId: string;
    sessionNumber: number;
    name: string;
    code: string;
    status: WorkoutStatus;
    statusColor: string;
    // ... other fields
    createdAt: DateTime;
  }
}
```

**Business Logic:**
- Initially empty: no moveframes, no movelaps
- Default status: `PLANNED_FUTURE`
- Default statusColor: `YELLOW`
- Totals are zero until moveframes are added

---

### 3. Add Moveframe - `POST /api/workouts/[workoutId]/moveframes`

**File:** `src/app/api/workouts/[workoutId]/moveframes/route.ts`

**Purpose:** Add a moveframe block with auto-generated movelaps

**Request Body:**
```typescript
{
  sport: SportType;
  sectionId: string;
  description?: string;
  patternType: "MONODISTANCE" | "BATTERY";
  
  // For MONODISTANCE:
  distance: number;
  reps: number;
  speedCode: string;
  style?: string;
  pace?: string;
  time?: string;
  restType?: RestType;
  pause?: string;
  alarm?: number;
  sound?: string;
  
  // For BATTERY (future):
  battery?: Array<{
    distance: number;
    reps: number;
    speedCode: string;
    // ... other fields
  }>;
}
```

**Validation Rules:**
1. ✅ Authenticate user
2. ✅ Fetch workout and verify ownership
3. ✅ Determine next moveframe code (A, B, ..., Z, AA, AB, ...)
4. ✅ Check no duplicate `(workoutId, code)`
5. ✅ Validate distance is in allowed list for sport
6. ✅ Validate reps >= 1

**Response:**
```typescript
{
  moveframe: {
    id: string;
    workoutSessionId: string;
    code: string;
    sport: SportType;
    sectionId: string;
    sectionName: string;
    sectionColor: string;
    description: string;
    totalDistance: number;
    totalReps: number;
    movelaps: Movelap[];
    createdAt: DateTime;
  }
}
```

**Business Logic:**
1. **Generate Moveframe Code:**
   - Query existing moveframes for workout
   - Calculate next code: A → B → ... → Z → AA → AB → ...

2. **Cache Section Info:**
   - Fetch section by `sectionId`
   - Copy `name` and `color` to moveframe

3. **Generate Movelaps:**
   - Create `reps` number of movelaps
   - Each with `index` 1..n
   - Copy pattern fields to each lap
   - Set `mfCode` to moveframe code

4. **Calculate Totals:**
   - `totalDistance` = sum of all movelap distances
   - `totalReps` = count of work laps

5. **Update Aggregates (Optional):**
   - Update workout totals
   - Update day totals

---

### 4. Add Movelap - `POST /api/moveframes/[moveframeId]/movelaps`

**File:** `src/app/api/moveframes/[moveframeId]/movelaps/route.ts`

**Purpose:** Add a single movelap to a moveframe

**Request Body:**
```typescript
{
  mode: "APPEND" | "INSERT_AFTER";
  afterIndex?: number;      // Required if INSERT_AFTER
  
  distance?: number;
  speedCode?: string;
  style?: string;
  pace?: string;
  time?: string;
  reps?: number;
  restType?: RestType;
  pause?: string;
  restTo?: string;
  alarm?: number;
  sound?: string;
  notes?: string;
  isNoteOnly?: boolean;
}
```

**Validation Rules:**
1. ✅ Authenticate user
2. ✅ Fetch moveframe and verify ownership
3. ✅ Validate mode and required fields

**Response:**
```typescript
{
  movelap: {
    id: string;
    moveframeId: string;
    index: number;
    mfCode: string;
    distance: number;
    speedCode: string;
    // ... other fields
    createdAt: DateTime;
  },
  updatedTotals: {
    totalDistance: number;
    totalReps: number;
  }
}
```

**Business Logic:**
1. **Determine Index:**
   - If APPEND: `newIndex = maxCurrentIndex + 1`
   - If INSERT_AFTER: `newIndex = afterIndex + 1`

2. **Shift Indexes (if INSERT_AFTER):**
   - Update all laps with `index > afterIndex`
   - Increment their index by 1
   - Maintains consecutive sequence

3. **Create New Movelap:**
   - Set `mfCode` from parent moveframe
   - Set `origin = NEW`
   - Insert with calculated index

4. **Recalculate Totals:**
   - Sum all non-disabled lap distances
   - Count work laps
   - Update moveframe totals

5. **Update Aggregates:**
   - Propagate to workout totals
   - Propagate to day totals

---

## 📋 Complete API Endpoint Summary

| Operation | Method | Endpoint | Purpose |
|-----------|--------|----------|---------|
| **Edit Day** | PATCH | `/api/days/[dayId]` | Update day metadata only |
| **Add Workout** | POST | `/api/days/[dayId]/workouts` | Add workout (1, 2, or 3) to day |
| **Add Moveframe** | POST | `/api/workouts/[workoutId]/moveframes` | Add moveframe block with movelaps |
| **Add Movelap** | POST | `/api/moveframes/[moveframeId]/movelaps` | Add single lap to moveframe |

---

## 🔒 Common Validation Rules

All endpoints enforce:

1. **Authentication**: JWT token required
2. **Authorization**: User must own the resource
3. **Business Rules**:
   - Max 3 workouts per day
   - Unique workout numbers per day
   - Unique moveframe codes per workout
   - Unique movelap indexes per moveframe
   - One day per date per user

4. **Data Integrity**:
   - Cascading deletes via foreign keys
   - Transaction support for complex operations
   - Automatic timestamp updates

5. **Performance**:
   - Cached names and colors for periods/sections
   - Precomputed totals (distance, reps)
   - Indexed foreign keys

---

## ✅ Migration Required

To apply these schema changes:

```bash
# Generate migration
npx prisma migrate dev --name enhance_workout_hierarchy

# Apply to production
npx prisma migrate deploy
```

**Important Notes:**
- Existing data will be preserved
- New fields have defaults or are optional
- Unique constraints may require data cleanup first
- Test in development before production deployment

---

## 🎉 Benefits of This Design

1. **Data Integrity**: Strong constraints prevent duplicates and invalid states
2. **Performance**: Cached fields and indexes for fast queries
3. **Flexibility**: Optional fields support gradual feature adoption
4. **Maintainability**: Clear relationships and consistent naming
5. **Scalability**: Efficient queries with proper indexes
6. **User Experience**: Fast lookups with cached display values

**All four button operations are now fully supported by the database schema and API design!** 🚀

