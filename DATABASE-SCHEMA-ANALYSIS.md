# 🗄️ DATABASE SCHEMA ANALYSIS - Moveframe System

## ✅ CURRENT SCHEMA

### Moveframe Table
```prisma
model Moveframe {
  id               String        @id @default(cuid())
  workoutSessionId String
  letter           String        // A, B, C, etc.
  sport            SportType     // ENUM
  sectionId        String
  type             MoveframeType // STANDARD, BATTERY, ANNOTATION
  description      String        // Free text description
  createdAt        DateTime      @default(now())
  
  workoutSession WorkoutSession @relation(...)
  section        WorkoutSection @relation(...)
  movelaps       Movelap[]
}
```

### Movelap Table (Has all detail fields!)
```prisma
model Movelap {
  id               String        @id @default(cuid())
  moveframeId      String
  repetitionNumber Int           // 1, 2, 3, etc.
  distance         Int?          // ✅ For meters
  speed            String?       // ✅ For A1, A2, B1, etc.
  style            String?       // ✅ For Freestyle, Track, etc.
  pace             String?       // ✅ For pace\100
  time             String?       // ✅ For time
  reps             Int?          // ✅ For body building reps
  restType         RestType?     // ✅ Enum
  pause            String?       // ✅ For pause duration
  alarm            Int?          // ✅ For countdown alarm
  sound            String?       // ✅ For sound selection
  notes            String?       // ✅ For additional notes
  status           MovelapStatus // PENDING, COMPLETED, SKIPPED, DISABLED
  isSkipped        Boolean       @default(false)
  isDisabled       Boolean       @default(false)
  createdAt        DateTime      @default(now())
  
  moveframe Moveframe @relation(...)
}
```

---

## 🎯 ASSESSMENT

### ✅ GOOD NEWS
**The Movelap table already has ALL the fields we need!**

Every sport-specific field is covered:
- ✅ `distance` - For meters (SWIM, BIKE, RUN)
- ✅ `speed` - For A1/A2/B1/etc. (All sports)
- ✅ `style` - For Freestyle/Track/etc. (SWIM, RUN)
- ✅ `pace` - For pace\100 (SWIM, BIKE, RUN)
- ✅ `time` - For time input (All sports)
- ✅ `reps` - For repetitions (BODY BUILDING)
- ✅ `pause` - For rest periods (All sports)
- ✅ `alarm` - For countdown alerts (All sports)
- ✅ `sound` - For sound selection (All sports)
- ✅ `notes` - For additional info (All sports)

### 🤔 CURRENT ARCHITECTURE

**Two-Level System:**
1. **Moveframe** = Container/Template
   - Stores: sport, type, letter, description
   - Example: "Run 400m x 6 Speed A2 Pause 1'30""

2. **Movelap** = Individual Repetition
   - Stores: ALL specific values for each rep
   - Example Rep 1: distance=400, speed="A2", pause="1'30""
   - Example Rep 2: distance=400, speed="A2", pause="1'30""
   - Example Rep 6: distance=400, speed="A2", pause="5'" (different pause!)

---

## 💡 DESIGN DECISION

### Current Approach: ✅ CORRECT!
**Store details in Movelap, not Moveframe**

**Advantages:**
- ✅ Flexibility: Each rep can have different values
- ✅ Simplicity: One table structure for all sports
- ✅ Scalability: Easy to add new sports without schema changes
- ✅ History: Each movelap tracks its own status (DONE, SKIPPED, etc.)

**Disadvantages:**
- ⚠️ Duplication: Same values repeated across movelaps (acceptable)
- ⚠️ Template: No "template" storage in Moveframe (can use description)

---

## 🔧 POTENTIAL ENHANCEMENTS

### Option A: Add Template Fields to Moveframe (OPTIONAL)
```prisma
model Moveframe {
  // ... existing fields ...
  
  // Template fields (optional - for UI convenience)
  templateDistance  Int?
  templateSpeed     String?
  templateStyle     String?
  templatePace      String?
  templateTime      String?
  templateReps      Int?
  templatePause     String?
  templateAlarm     Int?
  templateSound     String?
  repetitions       Int?     // Number of reps to generate
}
```

**Pros:**
- Can regenerate movelaps from template
- Easier to edit "all reps at once"
- Better for UI pre-population

**Cons:**
- Duplicates data (stored in both Moveframe and Movelaps)
- More complex to maintain
- Not necessary if we parse from description

### Option B: Keep Current Schema (RECOMMENDED) ✅
**Reason**: Current schema is sufficient!

**Workflow:**
1. User fills sport-specific form
2. System generates description (e.g., "400m x 6 A2 pause 1'30"")
3. System creates movelaps with actual values
4. Description serves as human-readable template

**Benefits:**
- ✅ No schema changes needed
- ✅ Simpler to implement
- ✅ Flexible for any sport
- ✅ Works with current database

---

## 🎨 IMPLEMENTATION STRATEGY

### Step 1: Create Sport-Specific UI Forms
**No database changes needed!**

Forms collect:
- SWIM: meters, speed, style, pace, time, pause, alarm, sound
- BIKE: meters, speed, R1/R2, pace, time, pause, alarm, sound
- RUN: meters, speed, style, pace, time, pause, alarm, sound
- BODY BUILDING: sector/exercise, speed, style, reps, pause, alarm, sound

### Step 2: Generate Movelaps from Form Data
```typescript
// Example: SWIM form submission
const formData = {
  sport: 'SWIM',
  meters: 400,
  speed: 'A2',
  style: 'Freestyle',
  pace: '1:30/100',
  repetitions: 6,
  pause: "1'30\"",
  lastPause: "5'", // Different pause on last rep
  alarm: -3,
  sound: 'Beep'
};

// Generate description
const description = `${formData.meters}m x ${formData.repetitions} ${formData.speed} ${formData.style} pause ${formData.pause}`;

// Create Moveframe
const moveframe = await prisma.moveframe.create({
  data: {
    letter: 'A',
    sport: 'SWIM',
    type: 'STANDARD',
    description: description,
    workoutSessionId: workoutId,
    sectionId: sectionId
  }
});

// Create Movelaps
for (let i = 1; i <= formData.repetitions; i++) {
  await prisma.movelap.create({
    data: {
      moveframeId: moveframe.id,
      repetitionNumber: i,
      distance: formData.meters,
      speed: formData.speed,
      style: formData.style,
      pace: formData.pace,
      pause: i === formData.repetitions ? formData.lastPause : formData.pause,
      alarm: formData.alarm,
      sound: formData.sound,
      status: 'PENDING'
    }
  });
}
```

### Step 3: Display in UI
**Use existing Movelap table display!**

Movelaps already show:
- Distance, Speed, Style, Pace, Time, Reps, Pause, Alarm, Sound, Notes
- Exactly what we need!

---

## ✅ CONCLUSION

**NO DATABASE CHANGES REQUIRED!**

Current schema is perfect for the moveframe system:
- ✅ Moveframe stores container info
- ✅ Movelap stores ALL detail fields
- ✅ Supports all sports
- ✅ Flexible for future sports
- ✅ Ready for implementation

**Next Steps:**
1. Create sport-specific form components
2. Implement movelap generation logic
3. Update UI to show sport-specific fields
4. Add battery mode (later)

---

**Status**: Schema analysis COMPLETE ✅  
**Recommendation**: Proceed with UI implementation, no schema changes needed.

