# 🎯 MOVEFRAME ↔ MOVELAP RELATIONSHIP - CRITICAL UNDERSTANDING

## 🔑 KEY CONCEPT

**ONE Moveframe can contain MULTIPLE SEQUENCES**

Each sequence generates its own set of movelaps.

---

## 📝 EXAMPLE BREAKDOWN

### Moveframe (Compact Representation):
```
Run 400 x 6 Speed A2 Pause 1'30 + Pause 5' + 200 x 3 Speed B1 Pause 1'
```

This ONE moveframe contains **TWO SEQUENCES**:
1. **Sequence 1**: 400m × 6 reps, Speed A2, Pause 1'30" (with 5' after sequence)
2. **Sequence 2**: 200m × 3 reps, Speed B1, Pause 1'

---

### Movelaps (Detailed List):

From this ONE moveframe, the system generates **9 movelaps**:

```
Movelap #1: 400m  A2  1'30"
Movelap #2: 400m  A2  1'30"
Movelap #3: 400m  A2  1'30"
Movelap #4: 400m  A2  1'30"
Movelap #5: 400m  A2  1'30"
Movelap #6: 400m  A2  5'      ← Last rep of sequence 1 has different pause!
Movelap #7: 200m  B1  1'
Movelap #8: 200m  B1  1'
Movelap #9: 200m  B1  1'      ← Last rep of sequence 2
```

---

## 🏗️ ARCHITECTURE UNDERSTANDING

### Hierarchy:
```
MOVEFRAME (Container)
  └── SEQUENCE 1 (400 x 6 A2)
       ├── Movelap 1
       ├── Movelap 2
       ├── Movelap 3
       ├── Movelap 4
       ├── Movelap 5
       └── Movelap 6 (different pause)
  └── SEQUENCE 2 (200 x 3 B1)
       ├── Movelap 7
       ├── Movelap 8
       └── Movelap 9
```

### The Pattern:
- **Moveframe** = Compact, human-readable format
- **Movelaps** = Expanded, detailed list (one row per repetition)
- **One Moveframe** → **Multiple Movelaps** (as many as total reps across all sequences)

---

## 🎨 UI IMPLICATIONS

### Moveframe Form Should Support:

**Option 1: Simple Single Sequence**
```
400m × 6 reps
Speed: A2
Pause: 1'30"
```
→ Generates 6 movelaps

**Option 2: Multiple Sequences (Advanced)**
```
Sequence 1:
  - 400m × 6 reps, A2, 1'30"
  - Transition pause: 5'

Sequence 2:
  - 200m × 3 reps, B1, 1'

[+ Add Another Sequence]
```
→ Generates 9 movelaps (6 + 3)

---

## 🔧 PERIOD & SECTION SETTINGS

### When Adding a Day Workout:
**Select**:
1. Day (week + day of week)
2. Period name (with color)

**Period Names come from**: "Period settings" section where athlete configures:
- Period names (e.g., "Base Training", "Competition", "Recovery")
- Period colors (for visual distinction)

### When Adding a Moveframe:
**Select**:
1. Sport
2. Section name (with color)

**Section Names come from**: "Workout section settings" where athlete configures:
- Section names (e.g., "Warm-up", "Main Set", "Cool-down")
- Section colors (for visual distinction)

---

## 📊 COLUMN ORDER CLARIFICATION

**Sport column placement**: After "Name" section

Suggested table column order:
```
[ ] Select | Day | Period | Name | Sport | Section | Distance | Speed | Style | Pace | Time | Reps | Pause | Alarm | Sound | Notes
```

---

## 🔄 THE UNIVERSAL PATTERN

### Key Insight:
> "Moveframes are the building blocks - they have the same structure whether in a daily plan, weekly plan, or yearly plan"

**Workout Structure is Universal**:
```
SECTION (A, B, or C)
  └── WEEKS (1-52 for A/B, unlimited for C)
       └── DAYS (7 per week)
            └── WORKOUTS (max 3 per day)
                 └── MOVEFRAMES (multiple per workout)
                      └── MOVELAPS (multiple per moveframe)
```

The **moveframe structure doesn't change** based on where it is:
- ✅ Same in Section A (2-week plan)
- ✅ Same in Section B (yearly plan)
- ✅ Same in Section C (workout diary)

---

## 🎯 FORM DESIGN IMPLICATIONS

### Basic Moveframe Form (Simple):
```
┌─────────────────────────────────────────┐
│  Add Moveframe - SWIM                   │
├─────────────────────────────────────────┤
│  Section: [Warm-up ▼]                   │
│  Letter: [A]                             │
│                                          │
│  Meters:      [400 ▼]                   │
│  Repetitions: [6]                        │
│  Speed:       [A2 ▼]                    │
│  Style:       [Freestyle ▼]             │
│  Pause:       [1'30" ▼]                 │
│  Last Pause:  [5' ▼]                    │
│                                          │
│  [Cancel]          [Create Moveframe]   │
└─────────────────────────────────────────┘
```
**Result**: 1 moveframe, 6 movelaps

### Advanced Moveframe Form (Multi-Sequence):
```
┌─────────────────────────────────────────┐
│  Add Moveframe - SWIM                   │
├─────────────────────────────────────────┤
│  Section: [Warm-up ▼]                   │
│  Letter: [A]                             │
│                                          │
│  ── Sequence 1 ──                       │
│  Meters:      [400 ▼]                   │
│  Repetitions: [6]                        │
│  Speed:       [A2 ▼]                    │
│  Style:       [Freestyle ▼]             │
│  Pause:       [1'30" ▼]                 │
│  End Sequence: [5' ▼]                   │
│                                          │
│  ── Sequence 2 ──                       │
│  Meters:      [200 ▼]                   │
│  Repetitions: [3]                        │
│  Speed:       [B1 ▼]                    │
│  Style:       [Freestyle ▼]             │
│  Pause:       [1' ▼]                    │
│                                          │
│  [+ Add Sequence] [Remove Sequence 2]   │
│                                          │
│  Total: 9 movelaps (6 + 3)              │
│                                          │
│  [Cancel]          [Create Moveframe]   │
└─────────────────────────────────────────┘
```
**Result**: 1 moveframe, 9 movelaps (from 2 sequences)

---

## 📋 UPDATED IMPLEMENTATION STRATEGY

### Phase 1A: Simple Moveframe (Single Sequence)
- One distance × reps
- One speed
- One pause (with optional different last pause)
- Generates N movelaps

### Phase 1B: Multi-Sequence Moveframe (Advanced)
- Multiple sequences in one moveframe
- Each sequence has its own: distance, reps, speed, pause
- Transition pause between sequences
- Generates sum of all reps as movelaps

### Movelap Generation Logic:
```typescript
function generateMovelaps(moveframe, sequences) {
  let movelaps = [];
  let currentNumber = 1;
  
  for (let seq of sequences) {
    for (let i = 1; i <= seq.repetitions; i++) {
      const isLastInSequence = (i === seq.repetitions);
      const isLastOverall = (seq === sequences[sequences.length - 1] && isLastInSequence);
      
      movelaps.push({
        repetitionNumber: currentNumber++,
        distance: seq.meters,
        speed: seq.speed,
        style: seq.style,
        pace: seq.pace,
        pause: isLastInSequence ? seq.endPause : seq.pause,
        // ... other fields
      });
    }
  }
  
  return movelaps;
}
```

---

## 🎯 DESCRIPTION GENERATION

### Single Sequence:
```
400m x 6 A2 Freestyle pause 1'30"
```

### Multiple Sequences:
```
400m x 6 A2 Freestyle pause 1'30" + 5' + 200m x 3 B1 Freestyle pause 1'
```

**Pattern**: `[distance]m x [reps] [speed] [style] pause [pause] + [transition] + [next sequence]`

---

## ✅ KEY TAKEAWAYS

1. ✅ **One Moveframe** → **Multiple Movelaps** (can be many!)
2. ✅ **One Moveframe** can contain **Multiple Sequences**
3. ✅ **Movelaps** = Detailed breakdown of moveframe (one row per rep)
4. ✅ **Period Settings** → Used when creating day workouts
5. ✅ **Section Settings** → Used when creating moveframes
6. ✅ **Sport Column** → Placed after "Name" section
7. ✅ **Structure is Universal** → Same moveframe structure across all sections (A, B, C)
8. ✅ **Forms are Repetitive** → Only dropdown values change per sport

---

## 🚀 NEXT STEPS

1. Update form design to support **multiple sequences**
2. Implement **sequence builder** UI component
3. Update **movelap generator** to handle multiple sequences
4. Add **transition pause** between sequences
5. Ensure **description generation** shows complete moveframe

---

**Critical Understanding**: ✅ COMPLETE  
**Ready for**: Multi-sequence moveframe implementation

