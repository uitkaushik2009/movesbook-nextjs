# 🚀 Quick Start: Editable Table Columns

**Date:** December 4, 2025

---

## ✅ What's New

The workout table views now have **editable/configurable columns** that you can customize!

---

## 🎯 How to Use

### Step 1: Open Column Settings
Look for the **"Columns"** button (⚙️ gear icon) in each table header:
- **Workout Table** - In the Options column header (cyan/blue table)
- **Moveframe Table** - Top-right corner of title row (purple table)
- **Movelap Table** - Top-right corner of title row (yellow table)

### Step 2: Show/Hide Columns
- Click on any column to toggle its visibility
- ✅ Green = Visible
- ⚪ Gray = Hidden
- 🔒 Required columns (like "MF") cannot be hidden

### Step 3: Reset if Needed
Click **"Reset to Default"** to restore the original column configuration

### Step 4: Done!
Click **"Close"** - your preferences are **automatically saved**!

---

## 📊 Available Columns

### Movelap Table (15 total)
**Visible by default (13):**
MF, Color, Workout type, Sport, Distance, Style, Speed, Time, Pace, Rec, Rest To, Aim Sound, Annotation

**Hidden by default (2):**
HR (Heart Rate), Cal (Calories)

### Moveframe Table (10 total)
**Visible by default (7):**
MF, Color, Workout type, Sport, Description, Rip, Metri

**Hidden by default (3):**
Macro, Alarm, Notes

### Workout Table (22 total)
**Visible by default (14):**
No, Match, Sport 1-2 (each with Icon, Distance, Duration, K)

**Hidden by default (14):**
Sport 3-4 (each with Icon, Distance, Duration, K)

---

## 💾 Automatic Saving

Your column preferences are automatically saved to your browser's localStorage and will persist:
- ✅ Between page refreshes
- ✅ Between browser sessions
- ✅ Until you clear browser data or reset to default

Each table type (Workout, Moveframe, Movelap) has independent settings.

---

## 📍 Section A - 3 Weeks Confirmed

**Section A (Current Weeks)** is configured to show exactly **3 weeks (21 days)**:
- From today
- To 20 days ahead
- Total of 21 days (3 weeks × 7 days)

This is already working correctly in the system!

---

## 🎨 Visual Design

- **Configuration Modal** - Clean, modern interface with visual toggles
- **Color Coding** - Green for visible, gray for hidden
- **Live Preview** - See column count update in real-time
- **User-Friendly** - No technical knowledge required

---

## 🔧 Technical Details

For developers:

```typescript
// Use in any table component
const {
  visibleColumns,      // Filtered list of visible columns
  visibleColumnCount,  // Number for colSpan calculations
  toggleColumn,        // Show/hide a column
  resetToDefault      // Restore defaults
} = useTableColumns('movelap'); // or 'workout', 'moveframe'
```

Storage keys:
- `workout_table_columns`
- `moveframe_table_columns`
- `movelap_table_columns`

---

## 🎉 Benefits

1. **Cleaner Interface** - Hide columns you don't use
2. **Better Performance** - Fewer columns = faster rendering
3. **Personalized View** - Configure once, use forever
4. **Easy to Use** - No complex settings, just click!

---

**Enjoy your customizable workout tables!** 🏋️‍♂️

