# Authentication Fix - 401 Unauthorized Error

## Problem
Users were experiencing:
1. **No weeks displayed** in Sections A & B
2. **401 Unauthorized** error when loading workout data
3. **Error loading settings** from `useUserSettings` hook

## Root Cause
The authentication headers were inconsistent across the application:

### Issue 1: `useUserSettings` Hook
- **Wrong**: Using `x-user-id` header
- **Expected**: `Authorization: Bearer <token>` header

### Issue 2: Missing Token Checks
- No validation if user is logged in before making API calls
- No redirect to login page when token is missing or expired

## Solution

### 1. Fixed `useUserSettings.ts`
Updated both `loadSettings` and `saveSettings` functions:

**Before:**
```typescript
headers: {
  'x-user-id': userId
}
```

**After:**
```typescript
const token = localStorage.getItem('token');
if (!token) {
  throw new Error('No authentication token found');
}

headers: {
  'Authorization': `Bearer ${token}`
}
```

### 2. Enhanced `WorkoutSection.tsx`
Added authentication checks in `loadWorkoutData`:

```typescript
const token = localStorage.getItem('token');

// Redirect to login if no token
if (!token) {
  console.error('❌ No authentication token found. Please log in.');
  window.location.href = '/login';
  return;
}

// Handle 401 responses
if (response.status === 401) {
  console.error('❌ Unauthorized. Token may be expired. Please log in again.');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
  return;
}
```

## Files Modified
1. `src/hooks/useUserSettings.ts` - Fixed authentication headers
2. `src/components/workouts/WorkoutSection.tsx` - Added token validation and 401 handling

## What This Fixes

### ✅ Authentication Flow
- All API calls now use consistent `Authorization: Bearer <token>` header
- Token is validated before making requests
- Automatic redirect to login if token is missing or expired

### ✅ User Experience
- Clear error messages in console
- Automatic redirect to login page (no stuck state)
- Proper cleanup of expired tokens

### ✅ API Consistency
- All endpoints now receive the correct authentication format
- No more 401 errors for authenticated users
- Settings load properly

## How to Test

1. **Logout and Login Again**:
   - Clear browser data or logout
   - Login with valid credentials
   - Token will be stored in localStorage

2. **Navigate to Workouts**:
   - Go to Workouts section
   - Select Section A or B
   - Should see weeks displayed (no 401 error)

3. **Check Settings**:
   - Settings should load without errors
   - No "Failed to load settings" error in console

4. **Test Expired Token**:
   - Manually remove token from localStorage
   - Try to access Workouts
   - Should be redirected to login page

## Expected Behavior

### With Valid Token
- ✅ Weeks display in Sections A & B
- ✅ Settings load successfully
- ✅ All API calls succeed
- ✅ No 401 errors in console

### Without Token (or Expired)
- ✅ Automatic redirect to `/login`
- ✅ Clear error message in console
- ✅ Token removed from localStorage
- ✅ User can login again

## Next Steps

If you're still seeing "no weeks" after this fix, it means:
1. You need to **login again** to get a fresh token
2. Clear browser cache/localStorage
3. Check browser console for any remaining errors

---

**Status**: ✅ Authentication fixed. Please login again to get a fresh token.

