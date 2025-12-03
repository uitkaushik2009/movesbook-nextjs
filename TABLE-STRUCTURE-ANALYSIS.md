# 🎯 Correct Table Structure from Screenshot

## ❌ CURRENT (Wrong)
One big table with all rows mixed together.

## ✅ REQUIRED (Correct)

### Structure from Screenshot:

```
┌─────────────────────────────────────────────────┐
│ WORKOUT TABLE                                   │
│ No | Match | Sport | Icon | Distance | ... |Option│
│ 1  | 85%+20| Swim  |  🏊  | 2800    | ...|E|O|D │
└─────────────────────────────────────────────────┘

       ⬇️ GAP (margin-bottom: 16px)

┌─────────────────────────────────────────────────┐
│ MOVEFRAME TABLE                                 │
│ Moveframes of workout < title > Moveframe opts │
│ MF | Color | Type | Sport | Description | Option│
│ A  |  🟢  |Warm-up| Swim | 100s*10 A2..|E|O|D │
└─────────────────────────────────────────────────┘

       ⬇️ GAP (margin-bottom: 16px)

┌─────────────────────────────────────────────────┐
│ MOVELAPS TABLE for Moveframe A                 │
│ Movelaps of moveframe A of workout #1 Monday   │
│ MF | Color | Type | Sport | Dist | Style |Option│
│ A  |  🟢  |Warm-up| Swim | 50  | SI   |E|O|D │
│ A  |  🟢  |Warm-up| Swim | 0   |      |E|O|D │
│ A  |  🟢  |Warm-up| Swim | 0   |      |E|O|D │
│ + Add new row                                   │
└─────────────────────────────────────────────────┘

       ⬇️ GAP (margin-bottom: 16px)

┌─────────────────────────────────────────────────┐
│ MOVEFRAME B TABLE                               │
│ B  |  🟢  |Warm-up| Swim | 100s*10...|E|O|D │
└─────────────────────────────────────────────────┘
```

## 🔑 Key Points

1. **Each category is a SEPARATE `<table>` element**
2. **Gaps are `margin-bottom` or `<div>` spacers, NOT borders**
3. **Options column has `position: sticky; right: 0`**
4. **Each table has its own header row with context**

## 📦 Component Structure

```tsx
<div className="workout-hierarchy">
  {/* WORKOUT TABLE */}
  <table className="mb-4">
    <thead>
      <tr>
        <th>No</th>
        <th>Match</th>
        {/* ... */}
        <th className="sticky right-0">Option</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>85%+20%</td>
        {/* ... */}
        <td className="sticky right-0">[Edit][Options][Delete]</td>
      </tr>
    </tbody>
  </table>

  {/* GAP */}
  <div className="h-4"></div>

  {/* MOVEFRAME TABLE */}
  <table className="mb-4">
    <thead>
      <tr>
        <th colSpan="all">Moveframes of the workout...</th>
      </tr>
      <tr>
        <th>MF</th>
        <th>Color</th>
        {/* ... */}
        <th className="sticky right-0">Option</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>A</td>
        <td>🟢</td>
        {/* ... */}
        <td className="sticky right-0">[Edit][Options][Delete]</td>
      </tr>
    </tbody>
  </table>

  {/* GAP */}
  <div className="h-4"></div>

  {/* MOVELAPS TABLE for Moveframe A */}
  <table className="mb-4">
    <thead>
      <tr>
        <th colSpan="all">Movelaps of moveframe A...</th>
      </tr>
      <tr>
        <th>MF</th>
        <th>Distance</th>
        {/* ... */}
        <th className="sticky right-0">Option</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>A</td>
        <td>50</td>
        <td className="sticky right-0">[Edit][Options][Delete]</td>
      </tr>
      {/* More movelap rows */}
    </tbody>
    <tfoot>
      <tr>
        <td colSpan="all">
          <button>+ Add new row</button>
        </td>
      </tr>
    </tfoot>
  </table>

  {/* Repeat for each moveframe... */}
</div>
```

## 🚨 CRITICAL: This Requires Complete Rebuild

The current implementation uses ONE `<table>` with nested rows.
Screenshot shows MULTIPLE `<table>` elements with gaps.

This is a MAJOR structural change!

## ✅ Recommended Approach

Create a new component structure:
- `DayWorkoutTable.tsx` - Renders workout rows
- `MoveframeTable.tsx` - Renders one moveframe
- `MovelapTable.tsx` - Renders movelaps for one moveframe
- `WorkoutHierarchyView.tsx` - Composes all tables with gaps

Each component returns its own `<table>` element with proper sticky columns.

