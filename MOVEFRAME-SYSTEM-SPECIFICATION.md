# 📋 MOVEFRAME SYSTEM - COMPLETE SPECIFICATION

## 🏗️ SYSTEM HIERARCHY

```
ATHLETE
  └── SECTIONS (A, B, C)
       ├── A: 2-week workout plan (current planning)
       ├── B: Yearly workout plan (52 weeks max)
       └── C: Yearly workouts done (unlimited - sport diary)
            └── WEEKS (52 max for A/B, unlimited for C)
                 └── DAYS (7 days per week)
                      └── WORKOUTS (MAX 3 per day)
                           └── MOVEFRAMES (multiple exercises)
                                └── MOVELAPS (individual repetitions)
```

---

## 🎯 DEFINITIONS

### Moveframe
**Definition**: An exercise to do in a workout session

**Example**: 
```
Run 400m x 6 Speed A2 Pause 1'30" + Pause 5' + 200m x 3 Speed B1 Pause 1'
```

### Movelap
**Definition**: Individual repetitions of a moveframe

**Example from above moveframe**:
1. 400m A2 1'30"
2. 400m A2 1'30"
3. 400m A2 1'30"
4. 400m A2 1'30"
5. 400m A2 1'30"
6. 400m A2 5'
7. 200m B1 1'
8. 200m B1 1'
9. 200m B1 1'

### Daily Workout Session
**Definition**: Multiple moveframes constitute a daily workout session

**Limit**: Max 3 workout sessions per day per athlete

### Weekly Workouts Plan
**Definition**: Multiple daily workout sessions constitute the weekly plan

**Limit**: Max 52 weekly workout plans from year start date

---

## 🔧 WORKOUT MANAGEMENT

### Adding Workouts to a Day

**Button**: "Add a workout"

**Logic**:
- No workouts → Add Workout 1
- Workout 1 exists → Add Workout 2
- Workout 1 & 2 exist → Add Workout 3
- Cannot add more than 3 workouts per day

### Adding Moveframes to a Workout

**Button**: "Add a moveframe"

**Description**: Most important button - creates moveframes that constitute the workout session

**Two Modes**:
1. **Standard Moveframe** - Individual exercise with specific parameters
2. **Battery Mode / Group Mode** - Multiple exercises grouped together

---

## 📝 MOVEFRAME FIELDS BY SPORT

### 🏊 SWIM

| Field | Type | Options/Range |
|-------|------|---------------|
| **Meters** | Dropdown | 20, 50, 75, 100, 150, 200, 400, 500, 800, 1000, 1200, 1500 |
| **Speed** | Dropdown | A1, A2, A3, B1, B2, B3, C1, C2 |
| **Style** | Dropdown | Freestyle, Dolphin, Backstroke, Breaststroke, Sliding, Apnea |
| **Pace\100** | Input | Free text |
| **Time** | Input | Free text |
| **Note** | Input | Free text |
| **Pause** | Dropdown | 0", 5", 10", 15", 20", 25", 30", 35", 40", 45", 50", 1', 1'10", 1'15", 1'30", 2', 2'30", 3' |
| **Alarm** | Dropdown | -1, -2, -3, -4, -5, -6, -7, -8, -9, -10 |
| **Sound** | Dropdown | (Select from dropdown selector) |

---

### 🚴 BIKE

| Field | Type | Options/Range |
|-------|------|---------------|
| **Meters** | Dropdown + Input | 200, 400, 500, 1000, 1500, 2000, 3000, 4000, 5000, 7000, 8000, 10000 + custom input |
| **Speed** | Dropdown | A1, A2, A3, B1, B2, B3, C1, C2 |
| **R1\R2** | Input (2 fields) | Range R1 (input), Range R2 (input) |
| **Pace\100** | Input | Free text |
| **Time** | Input | Free text |
| **Note** | Input | Free text |
| **Pause** | Dropdown | 15", 30", 45", 1', 1'30", 2', 2'30", 3', 4', 5' |
| **Alarm** | Dropdown | -1, -2, -3, -4, -5, -6, -7, -8, -9, -10 |
| **Sound** | Dropdown | (Select from dropdown selector) |

---

### 🏃 RUN

| Field | Type | Options/Range |
|-------|------|---------------|
| **Meters** | Dropdown | 50, 60, 80, 100, 110, 150, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 3000, 5000, 10000 |
| **Speed** | Dropdown | A1, A2, A3, B1, B2, B3, C1, C2 |
| **Style** | Dropdown | Track, Road, Cross, Beach, Hill, Downhill |
| **Pace\100** | Input | Free text |
| **Time** | Input | Free text |
| **Note** | Input | Free text |
| **Pause** | Dropdown | 20", 30", 45", 1', 1'15", 1'30", 2', 2'30", 3', 4', 5', 6', 7' |
| **Alarm** | Dropdown | -1, -2, -3, -4, -5, -6, -7, -8, -9, -10 |
| **Sound** | Dropdown | (Select from dropdown selector) |

---

### 💪 BODY BUILDING

| Field | Type | Options/Range |
|-------|------|---------------|
| **Sector+Exercise** | Special Selector | Select from procedure (separate project) |
| **Speed** | Dropdown | Very slow, Slow, Normal, Quick, Fast, Very fast, Explosive, Negative |
| **Style** | Dropdown | (Options to be provided later) |
| **Pace\100** | N/A | NOT USED |
| **Reps** | Input | Free text (number) |
| **Note** | Input | Free text |
| **Pause** | Dropdown | 0", 5", 10", 15", 20", 30", 45", 1', 1'15", 1'30", 2', 2'30", 3', 4', 5', 6', 7' |
| **Alarm** | Dropdown | -1, -2, -3, -4, -5, -6, -7, -8, -9, -10 |
| **Sound** | Dropdown | (Select from dropdown selector) |

**Special Note**: Sector + Exercise will have a separate procedure/interface (to be explained later)

---

## 🎨 COMMON PATTERNS

### Speed Zones (Universal)
All sports use the same speed zone system:
- **A-Zones**: A1, A2, A3 (Lower intensity)
- **B-Zones**: B1, B2, B3 (Medium intensity)
- **C-Zones**: C1, C2 (Higher intensity)

### Alarm System
- Negative numbers: -1 through -10
- Purpose: Countdown alerts before next interval/exercise

### Sound Selector
- Dropdown with predefined sound options
- Same across all sports
- (Specific sounds to be defined)

---

## 📊 DATA SOURCES

### Section Origins

**Section A & B** (Planning):
- Built by athlete themselves
- Received from Coach
- Received from Team Manager
- Received from Club Trainer

**Section C** (Diary):
- Imported from Section A workouts (after completion)
- Imported from Section B workouts (after completion)
- Manually typed workouts done
- No limit on entries (complete history)

---

## 🚧 PENDING SPECIFICATIONS

### Additional Sports
The following sports are similar to SWIM/BIKE/RUN/BODY BUILDING but need field specifications:
- Stretching
- (Other sports to be provided)

### Body Building Details
- Sector + Exercise selection procedure
- Complete Style dropdown options

### Sound Options
- Complete list of available sounds for dropdown

### Battery/Group Mode
- Detailed specification for battery mode moveframes
- How multiple exercises are grouped
- UI/UX for battery mode creation

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: Core System ✅ (DONE)
- [x] Day → Workout → Moveframe → Movelap hierarchy
- [x] Max 3 workouts per day validation
- [x] Section A, B, C structure
- [x] Basic moveframe/movelap CRUD

### Phase 2: Sport-Specific Forms 🔄 (IN PROGRESS)
- [ ] SWIM moveframe form with all fields
- [ ] BIKE moveframe form with all fields
- [ ] RUN moveframe form with all fields
- [ ] BODY BUILDING moveframe form with all fields
- [ ] Dropdown validation
- [ ] Field-specific input validation

### Phase 3: Advanced Features ⏳ (PLANNED)
- [ ] Battery/Group mode
- [ ] Sector + Exercise selector (Body Building)
- [ ] Sound library integration
- [ ] Import from A/B to C functionality
- [ ] Additional sports forms

---

## 💡 NOTES FOR DEVELOPMENT

1. **Dropdown vs Input**: Some fields have predefined dropdowns, others are free input
2. **Sport-Specific**: Each sport has unique field sets - need conditional rendering
3. **Validation**: Meters, Speed, Pause must match predefined options when using dropdowns
4. **Extensibility**: System must support adding new sports easily
5. **UI Consistency**: All sports should have similar form layout despite different fields

---

**Document Version**: 1.0  
**Date**: December 2025  
**Status**: Specification Complete - Ready for Implementation

