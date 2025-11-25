# Workout System - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Database set up (SQLite by default)
- User account created

## Getting Started

### 1. Database Setup

The workout system uses existing database models. Ensure your database is up to date:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed sample data
npx prisma db seed
```

### 2. Access the Workout System

#### For Athletes:
1. Log in to your account
2. Navigate to **"MY PAGE"** or **"Workouts"** in the main navigation
3. You'll see the workout planning interface

#### For Coaches/Managers:
1. Log in to your account
2. Navigate to your dashboard
3. Select an athlete from your coaching group
4. Access their workout section

### 3. Initial Configuration

Before creating workouts, set up your preferences:

#### Step 1: Define Training Periods
1. Open the left sidebar
2. Click **Settings → Training Periods**
3. Add periods like:
   - **Base** (Blue) - Base building phase
   - **Build** (Green) - Building intensity
   - **Peak** (Orange) - Peak performance
   - **Taper** (Purple) - Pre-competition taper
   - **Recovery** (Gray) - Recovery phase

#### Step 2: Define Workout Sections
1. Click **Settings → Workout Sections**
2. Add sections like:
   - **Warm-up** (Yellow) - Preparation
   - **Main Set** (Red) - Core workout
   - **Cool-down** (Blue) - Recovery
   - **Drills** (Green) - Technical work
   - **Strength** (Orange) - Strength training

#### Step 3: Order Your Main Sports
1. Click **Settings → Main Sports Used**
2. Drag to reorder (top 5 shown prominently)
3. Toggle sports on/off based on what you practice

### 4. Create Your First Workout

#### Step 1: Select Section
- **Section A**: Current 3 weeks (for immediate planning)
- **Section B**: Yearly plan (for long-term planning)
- Click on the desired section in the left sidebar

#### Step 2: Select a Day
- Click on any day row in the central grid
- The day will be highlighted
- Right sidebar will show "Add Workout" button

#### Step 3: Add a Workout Session
- Click **"Add Workout"** in right sidebar
- A new workout session will be created (1, 2, or 3 per day max)
- The workout appears with a white circle (not planned status)

#### Step 4: Add an Exercise (Moveframe)
- Click on the workout to select it
- Click **"Add Exercise"** in right sidebar
- The moveframe form modal opens

#### Step 5: Fill the Moveframe Form

**Moveframe Data Tab:**
1. Select **"Work to Do"** (or "Annotation" for notes)
2. Click your sport (e.g., Swimming 🏊)
3. Select workout section (e.g., "Main Set")
4. Choose input mode:
   - **Monodistance**: Same distance repeated (e.g., 400m x 6)
   - **Battery**: Different distances (advanced)

**Sport-Specific Fields:**
For swimming example:
- **Distance**: 400 (meters)
- **Repetitions**: 6 (will create 6 x 400m)
- **Speed**: Fast
- **Style**: Freestyle
- **Pace**: 1:30 (per 100m)
- **Rest Type**: Set Time
- **Pause**: 30s (between reps)
- **Description**: "Aerobic endurance set"

**Workout Info Tab** (optional):
- Name: "Morning Swim"
- Code: "MS-001"
- Time: 06:00 AM
- Location: "Olympic Pool"
- Heart Rate Max: 175
- Calories: 800

**Day Info Tab** (optional):
- Period: Base
- Weather: Sunny ☀️
- Feeling: Good 🙂
- Notes: "Felt strong today"

#### Step 6: Save
- Click **"Save"** button
- The system automatically generates 6 movelaps of 400m each
- The moveframe appears in the workout grid with letter "A"

### 5. Viewing Your Workout

#### Expand to See Details
- Click the **day** → Shows workouts (1, 2, 3)
- Click the **workout** → Shows moveframes (A, B, C...)
- Click the **moveframe** → Shows movelaps (1, 2, 3...)

#### Status Symbols
- **Circle** = Workout Session 1
- **Square** = Workout Session 2
- **Triangle** = Workout Session 3

Colors indicate status:
- **White** = Not yet planned
- **Yellow** = Planned (future)
- **Orange** = Planned (next week)
- **Red** = Planned (this week)
- **Blue** = Done (differently)
- **Light Green** = Done (<75%)
- **Green** = Done (>75%)

### 6. Common Actions

#### Copy a Workout
1. Click on a workout to select it
2. In right sidebar, click **"Copy Workout"**
3. Select destination day
4. Workout is duplicated with all moveframes

#### Move a Workout
1. Click on a workout
2. Click **"Move Workout"**
3. Select destination day
4. Workout moves with all data

#### Edit a Moveframe
1. Expand the workout to see moveframes
2. Click on a moveframe row
3. In right sidebar, click **"Edit Exercise"**
4. Modify form fields
5. Save changes

#### Delete Elements
- **Day**: Select day → "Delete Day" (removes all workouts)
- **Workout**: Select workout → "Delete Workout"
- **Moveframe**: Select moveframe → "Delete Exercise"

### 7. Advanced Features

#### Drag & Drop Sports (Planned)
- Drag a sport icon from right sidebar
- Drop onto a workout
- Instantly creates a new moveframe for that sport

#### Annotations
When adding a moveframe:
1. Select **"Annotation"** instead of "Work to Do"
2. Enter your note/comment
3. Appears as a colored annotation row

#### Smart Form
When adding multiple moveframes in sequence:
- Form pre-fills with previous moveframe data
- Only change what's different
- Faster data entry for similar exercises

### 8. Sections Overview

#### Section A: Current Microcycle (3 Weeks)
- **Use for**: Day-to-day training
- **Contains**: This week, next week, previous week
- **Best for**: Active training phase

#### Section B: Yearly Workout Plan
- **Use for**: Long-term planning
- **Contains**: Up to 52 weeks
- **Best for**: Annual periodization

#### Section C: Workouts Done (Diary)
- **Use for**: Training log
- **Contains**: Completed workouts only
- **Best for**: Historical analysis

#### Section D: Archive (Templates)
- **Use for**: Workout library
- **Contains**: Favorite workout templates
- **Best for**: Quick workout insertion

### 9. Tips & Best Practices

#### Planning Strategy
1. **Start with Section B**: Plan your year with major events
2. **Use Section A**: For weekly adjustments
3. **Log in Section C**: Record actual completed workouts
4. **Save to Section D**: Store your favorite workouts

#### Efficient Data Entry
1. **Set up periods first**: Makes day planning faster
2. **Define sections early**: Categorizes workouts automatically
3. **Use annotations**: For rest days or notes
4. **Leverage smart form**: Pre-fills save time

#### Visual Organization
1. **Color code periods**: Easy visual identification
2. **Color code sections**: Quickly spot workout types
3. **Use status colors**: Track completion at a glance
4. **Expand strategically**: Focus on current week

#### For Coaches
1. **Create templates**: Build library in Section D
2. **Assign to athletes**: Import to athlete's Section A/B
3. **Monitor completion**: Check athlete's Section C
4. **Duplicate patterns**: Copy successful weeks

### 10. Keyboard Shortcuts (Planned)

- `E` - Expand/collapse selected item
- `A` - Add workout to selected day
- `M` - Add moveframe to selected workout
- `C` - Copy selected item
- `Del` - Delete selected item
- `Esc` - Close modal/deselect
- `↑↓` - Navigate days
- `←→` - Navigate weeks

### 11. Mobile Access (Planned)

- Touch-optimized interface
- Swipe to expand/collapse
- Pinch to zoom weekly view
- Offline mode for viewing

### 12. Troubleshooting

#### "Add Workout" button is disabled
- **Solution**: Select a day first by clicking on it

#### "Add Exercise" button is disabled
- **Solution**: Select a workout first by clicking on it

#### Moveframe won't save
- **Solution**: Ensure sport and section are selected
- **Check**: At least one repetition is entered

#### Can't see my workouts
- **Solution**: Check you're in the right section (A, B, C, or D)
- **Check**: Scroll to find your weeks

#### Status colors not updating
- **Solution**: Refresh the page
- **Check**: Ensure date ranges are correct

### 13. Support & Resources

#### Documentation
- Full system guide: `docs/WORKOUT-SYSTEM-COMPLETE.md`
- Translation guide: `docs/translation-system-summary.md`
- Settings guide: `docs/settings-backgrounds-colors-guide.md`

#### Community
- Ask questions in the forum
- Share workout templates
- Request features

#### Development
- GitHub repository: [Your repo URL]
- Report bugs: [Issue tracker]
- Contribute: [Contributing guide]

## Quick Reference Card

| Action | Steps |
|--------|-------|
| **Create Workout** | Select day → Add Workout → Select workout → Add Exercise |
| **Edit Exercise** | Expand workout → Click moveframe → Edit Exercise |
| **Copy Workout** | Select workout → Copy Workout → Choose destination |
| **Change Period** | Click day → Edit Day Info → Select period |
| **Add Annotation** | Add Exercise → Select Annotation → Enter text |
| **View Totals** | Expand day to see sport totals per workout |
| **Change Status** | Select workout → Edit Workout Info → Update status |
| **Bulk Expand** | Click "Expand All Days" button |

## Next Steps

1. **Set up your periods and sections** (5 minutes)
2. **Create your first week of workouts** (15 minutes)
3. **Explore all four sections** (A, B, C, D)
4. **Save favorite templates** to Section D
5. **Invite athletes** (for coaches)
6. **Track progress** in Section C

Happy training! 🏃‍♂️🚴‍♀️🏊‍♂️

