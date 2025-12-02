# 🚀 API Quick Reference Guide

## 📌 Base URL
All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1️⃣ **Add Workout to Day**

```typescript
POST /api/days/{dayId}/workouts

// Request
{
  "sessionNumber": 1,           // Optional: 1, 2, or 3 (auto if omitted)
  "name": "Morning Swim",       // Optional, max 40 chars
  "code": "SW1",                // Optional, max 5 chars
  "durationMinutes": 60,
  "statusColor": "YELLOW"
}

// Response
{
  "workout": {
    "id": "clx...",
    "sessionNumber": 1,
    "name": "Morning Swim",
    "status": "PLANNED_FUTURE"
  },
  "message": "Workout #1 created successfully"
}

// Errors
400 - Max 3 workouts per day
400 - Workout number already used
404 - Day not found
```

---

## 2️⃣ **Add Moveframe to Workout**

```typescript
POST /api/workouts/{workoutId}/moveframes

// Request (Monodistance Pattern)
{
  "sport": "SWIM",              // Required
  "sectionId": "clx...",        // Required
  "description": "100 FR x 10",
  "patternType": "MONODISTANCE",
  "distance": 100,
  "reps": 10,
  "speedCode": "A2",
  "style": "Freestyle",
  "pause": "00:20",
  "restType": "SET_TIME"
}

// Response
{
  "moveframe": {
    "id": "clx...",
    "code": "A",                // Auto-generated
    "sport": "SWIM",
    "totalDistance": 1000,      // Auto-calculated
    "totalReps": 10,
    "movelaps": [...]           // Auto-generated
  },
  "message": "Moveframe A created with 10 movelaps"
}

// Errors
400 - Sport or section required
400 - Invalid reps (must be >= 1)
404 - Workout not found
```

---

## 3️⃣ **Add Movelap to Moveframe**

```typescript
POST /api/moveframes/{moveframeId}/movelaps

// Append to End
{
  "mode": "APPEND",
  "distance": 200,
  "speedCode": "B1",
  "pause": "00:30"
}

// Insert After Specific Position
{
  "mode": "INSERT_AFTER",
  "afterIndex": 5,              // Required for INSERT_AFTER
  "distance": 200,
  "speedCode": "B1",
  "pause": "00:30",
  "notes": "Extra lap"
}

// Response
{
  "movelap": {
    "id": "clx...",
    "index": 6,                 // Auto-calculated
    "mfCode": "A",              // Cached from moveframe
    "origin": "NEW"
  },
  "updatedTotals": {
    "totalDistance": 1200,      // Recalculated
    "totalReps": 11
  },
  "message": "Movelap added at position 6"
}

// Errors
400 - Invalid mode
400 - afterIndex required for INSERT_AFTER
404 - Moveframe not found
```

---

## 4️⃣ **Get All Workouts for Day**

```typescript
GET /api/days/{dayId}/workouts

// Response
{
  "workouts": [
    {
      "id": "clx...",
      "sessionNumber": 1,
      "name": "Morning Swim",
      "moveframes": [
        {
          "code": "A",
          "sport": "SWIM",
          "movelaps": [...]
        }
      ]
    }
  ]
}
```

---

## 5️⃣ **Get All Moveframes for Workout**

```typescript
GET /api/workouts/{workoutId}/moveframes

// Response
{
  "moveframes": [
    {
      "id": "clx...",
      "code": "A",
      "sport": "SWIM",
      "totalDistance": 1000,
      "movelaps": [...]
    }
  ]
}
```

---

## 6️⃣ **Get All Movelaps for Moveframe**

```typescript
GET /api/moveframes/{moveframeId}/movelaps

// Response
{
  "movelaps": [
    {
      "id": "clx...",
      "index": 1,
      "distance": 100,
      "speedCode": "A2"
    }
  ]
}
```

---

## 🔑 **Common Response Codes**

| Code | Meaning |
|------|---------|
| 200 | Success (GET) |
| 201 | Created (POST) |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (not your resource) |
| 404 | Not Found |
| 500 | Server Error |

---

## 💡 **Usage Examples**

### **Example 1: Create Complete Workout**

```typescript
// 1. Add Workout to Day
const workout = await fetch(`/api/days/${dayId}/workouts`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionNumber: 1,
    name: "Morning Training"
  })
});

// 2. Add Moveframe to Workout
const moveframe = await fetch(`/api/workouts/${workout.id}/moveframes`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sport: "SWIM",
    sectionId: sectionId,
    distance: 100,
    reps: 10,
    speedCode: "A2",
    pause: "00:20"
  })
});

// 3. Add Extra Movelap (Optional)
const movelap = await fetch(`/api/moveframes/${moveframe.id}/movelaps`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mode: "APPEND",
    distance: 200,
    speedCode: "B1"
  })
});
```

---

### **Example 2: Build Multi-Sport Workout**

```typescript
// Add Workout
const workout = await createWorkout(dayId, { sessionNumber: 1 });

// Add Swim Moveframe
await createMoveframe(workout.id, {
  sport: "SWIM",
  sectionId: warmupSectionId,
  distance: 400,
  reps: 5,
  speedCode: "A1"
});

// Add Run Moveframe
await createMoveframe(workout.id, {
  sport: "RUN",
  sectionId: mainSetSectionId,
  distance: 1000,
  reps: 4,
  speedCode: "B2"
});

// Add Bike Moveframe
await createMoveframe(workout.id, {
  sport: "BIKE",
  sectionId: cooldownSectionId,
  distance: 5000,
  reps: 1,
  speedCode: "A2"
});
```

---

## 🎯 **Key Features**

### **Automatic Processing**
- ✅ Workout numbers auto-assigned (1, 2, 3)
- ✅ Moveframe codes auto-generated (A, B, C, ...)
- ✅ Movelaps auto-created from pattern
- ✅ Totals auto-calculated
- ✅ Indexes auto-managed

### **Smart Validation**
- ✅ Max 3 workouts per day
- ✅ Unique workout numbers
- ✅ Unique moveframe codes
- ✅ Unique movelap indexes
- ✅ Resource ownership checks

### **Performance**
- ✅ Cached section names/colors
- ✅ Precomputed totals
- ✅ Indexed queries
- ✅ Transaction safety

---

## 🔧 **Integration Tips**

1. **Always check response status:**
   ```typescript
   if (!response.ok) {
     const error = await response.json();
     console.error(error.message);
   }
   ```

2. **Use auto-assignment when possible:**
   ```typescript
   // Let backend assign workout number
   { name: "Morning Swim" }  // sessionNumber auto-assigned
   ```

3. **Refresh UI after operations:**
   ```typescript
   await createWorkout(...);
   await loadWorkoutData();  // Refresh display
   ```

4. **Handle errors gracefully:**
   ```typescript
   try {
     await createMoveframe(...);
   } catch (error) {
     alert(`Failed: ${error.message}`);
   }
   ```

---

## 📖 **Full Documentation**

For complete details, see:
- `DATABASE-API-COMPLETE-SPEC.md` - Complete specification
- `PRISMA-API-IMPLEMENTATION-COMPLETE.md` - Implementation details

**All APIs are production-ready and fully documented!** 🎉

