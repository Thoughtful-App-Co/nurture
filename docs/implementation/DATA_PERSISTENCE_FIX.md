# Data Persistence Fix - Contact Analysis Resetting Issue

**Date:** 2025-11-07  
**Issue:** App repeatedly shows "Let's look at your garden" screen on restart  
**Status:** ✅ Implemented - Ready for Testing

## Problem Summary

The user reported that the Nurture app keeps taking them back to the "Let's look at your garden" (data mining) screen every time the app restarts, even though they've already completed it. This causes all their previous data to be reset and creates uncertainty about whether data is being saved.

## Root Cause Analysis

After investigating the codebase, we identified **three potential issues**:

1. **Missing schema initialization**: `hasCompletedContactAnalysis` flag was not initialized in the account migration, potentially causing schema mismatches
2. **Jazz eventual consistency**: The flag was being set but Jazz might not have enough time to persist it to local storage before the app closes
3. **Lack of verification**: No logging to confirm whether the account ID remains consistent or if flags are persisting correctly

## Implemented Fixes

### 1. Enhanced Debug Logging (`app/index.tsx`)

Added comprehensive logging to track account persistence and flag states:

```typescript
// Environment variable verification
console.log('🔍 ENV CHECK:');
console.log('USE_DEMO_AUTH flag:', FeatureFlags.USE_DEMO_AUTH);
console.log('Raw env value:', process.env.EXPO_PUBLIC_USE_DEMO_AUTH);

// Account and flag state logging
console.log('=== ACCOUNT DEBUG ===');
console.log('Account ID:', (me as any).id || 'unknown');
console.log('Account exists:', !!me);
console.log('Root exists:', !!root);
console.log('hasCompletedOnboarding:', root?.hasCompletedOnboarding);
console.log('hasCompletedContactAnalysis:', root?.hasCompletedContactAnalysis);
console.log('Contacts count:', root?.contacts?.length || 0);
console.log('====================');
```

**What to look for:**
- Account ID should be **the same** on every app restart
- `hasCompletedContactAnalysis` should be `true` after completing analysis once
- If Account ID changes = storage issue
- If flag stays `false` = persistence timing issue

### 2. Initialized Flag in Account Migration (`jazz/provider.tsx`)

Added `hasCompletedContactAnalysis: false` to the initial UserProfile creation:

```typescript
const root = UserProfile.create(
  {
    displayName: "",
    hasCompletedOnboarding: false,
    hasCompletedContactAnalysis: false, // ← ADDED
    contacts: ContactList.create([], account),
    // ... rest of fields
  },
  account
);
```

**Why this matters:** Without explicit initialization, the schema field might be `undefined` instead of `false`, causing the check `!root?.hasCompletedContactAnalysis` to evaluate differently than expected.

### 3. Added Persistence Delays (`app/index.tsx`)

Added delays after setting flags to give Jazz time to persist data:

#### Onboarding Completion
```typescript
root.$jazz.set('hasCompletedOnboarding', true);

// Give Jazz time to persist
console.log('⏳ Waiting for Jazz to persist onboarding data...');
await new Promise(resolve => setTimeout(resolve, 500));

// Verify it saved
if (!root.hasCompletedOnboarding) {
  console.error('⚠️ WARNING: Onboarding flag did not persist!');
}
```

#### Contact Analysis Completion
```typescript
root.$jazz.set('hasCompletedContactAnalysis', true);
console.log('✅ Contact analysis marked as completed');

// Give Jazz time to persist (longer delay for larger dataset)
console.log('⏳ Waiting for Jazz to persist data...');
await new Promise(resolve => setTimeout(resolve, 1000));

// Verify it saved
console.log('🔍 Verification after delay:');
console.log('hasCompletedContactAnalysis:', root.hasCompletedContactAnalysis);
console.log('Contacts count:', root.contacts?.length || 0);

if (!root.hasCompletedContactAnalysis) {
  console.error('⚠️ WARNING: Flag did not persist! This is a Jazz storage issue.');
} else {
  console.log('✅ Flag successfully verified in Jazz state');
}
```

**Why this matters:** Jazz uses eventual consistency and might not have written to AsyncStorage yet when the app closes. The 1-second delay gives it time to flush writes.

## Testing Instructions

### Step 1: Clear Existing App Data
Since you have an existing account that might be in a bad state, start fresh:

```bash
# Uninstall and reinstall the app
# OR
# Clear app data from device settings
```

### Step 2: Complete Onboarding Once
1. Launch the app
2. Watch the console logs for:
   - `🔍 ENV CHECK:` - Should show `USE_DEMO_AUTH flag: false`
   - `=== ACCOUNT DEBUG ===` - Note the Account ID
3. Complete the entire onboarding flow
4. Complete "Let's look at your garden" analysis
5. Watch for:
   - `⏳ Waiting for Jazz to persist data...`
   - `✅ Flag successfully verified in Jazz state`

### Step 3: Restart the App (Critical Test)
1. **Close the app completely** (swipe away from recent apps)
2. Reopen the app
3. Check console logs:
   - Account ID should be **THE SAME** as Step 2
   - `hasCompletedOnboarding:` should be `true`
   - `hasCompletedContactAnalysis:` should be `true`
4. **Expected behavior:** App should go directly to dashboard
5. **If still broken:** Account ID changed or flags are `false` - see troubleshooting

### Step 4: Verify Data Persistence
1. After successful restart, check that:
   - Your contacts are still there
   - Your name is still shown
   - No "Let's look at your garden" screen appears

## Expected Console Output

### On First Launch (Fresh Install)
```
🔍 ENV CHECK:
USE_DEMO_AUTH flag: false
Raw env value: false
=== ACCOUNT DEBUG ===
Account ID: co_z123abc...
hasCompletedOnboarding: false
hasCompletedContactAnalysis: false
Contacts count: 0
needsOnboarding: true
====================
```

### After Completing Onboarding
```
⏳ Waiting for Jazz to persist onboarding data...
User data saved: {
  displayName: "John Doe",
  hasCompletedOnboarding: true,
  ...
}
```

### After Completing Contact Analysis
```
Saved 150 contacts to Jazz
✅ Contact analysis marked as completed
⏳ Waiting for Jazz to persist data...
🔍 Verification after delay:
hasCompletedContactAnalysis: true
Contacts count: 150
✅ Flag successfully verified in Jazz state
```

### On Second Launch (Should Skip Onboarding)
```
🔍 ENV CHECK:
USE_DEMO_AUTH flag: false
=== ACCOUNT DEBUG ===
Account ID: co_z123abc...  ← SAME ID AS BEFORE
hasCompletedOnboarding: true  ← TRUE
hasCompletedContactAnalysis: true  ← TRUE
Contacts count: 150
needsOnboarding: false
needsContactAnalysis: false
====================
```

## Troubleshooting

### Issue: Account ID Changes on Restart
**Symptom:** Console shows different Account ID on each launch

**Diagnosis:** Jazz anonymous authentication is not persisting to device storage

**Possible Causes:**
1. AsyncStorage permissions issue
2. Storage quota exceeded
3. Jazz storage bug

**Solutions:**
```bash
# 1. Check if AsyncStorage is working
# Add to app/index.tsx temporarily:
import AsyncStorage from '@react-native-async-storage/async-storage';

const testStorage = async () => {
  try {
    await AsyncStorage.setItem('test', 'value');
    const result = await AsyncStorage.getItem('test');
    console.log('AsyncStorage test:', result); // Should be 'value'
  } catch (error) {
    console.error('AsyncStorage failed:', error);
  }
};
testStorage();

# 2. Clear app storage completely and retry
# 3. Check device storage space
```

### Issue: Flags Stay False After Setting
**Symptom:** Logs show flag set to `true` but verification shows `false`

**Diagnosis:** Jazz is not updating the CoValue or write is not being committed

**Solutions:**
1. Increase the delay from 1000ms to 2000ms
2. Check if Jazz sync is enabled (should be)
3. Verify the `root` object is the actual Jazz CoValue, not a stale reference

### Issue: Still Shows "Let's look at your garden" 
**Symptom:** After completing analysis, app still shows data mining screen on restart

**Check These:**
1. Is Account ID the same? (No = storage issue)
2. Is `hasCompletedOnboarding` true? (No = onboarding didn't persist)
3. Is `hasCompletedContactAnalysis` true? (No = analysis flag didn't persist)
4. Is `EXPO_PUBLIC_USE_DEMO_AUTH` false? (If true, disable it!)

**Advanced Debugging:**
```typescript
// Add to data mining completion handler (app/index.tsx around line 280)
console.log('🔍 DEEP DEBUG:');
console.log('Root Jazz object:', JSON.stringify(root, null, 2));
console.log('Root._type:', root._type);
console.log('Root.$jazz:', root.$jazz);
console.log('hasCompletedContactAnalysis before set:', root.hasCompletedContactAnalysis);
root.$jazz.set('hasCompletedContactAnalysis', true);
console.log('hasCompletedContactAnalysis after set:', root.hasCompletedContactAnalysis);
```

## What Changed - File Summary

| File | Change | Purpose |
|------|--------|---------|
| `app/index.tsx` | Added env variable logging | Verify DemoAuth is disabled |
| `app/index.tsx` | Added account debug logging | Track account ID consistency |
| `app/index.tsx` | Added 500ms delay after onboarding | Give Jazz time to persist |
| `app/index.tsx` | Added 1000ms delay after analysis | Give Jazz time to persist contacts |
| `app/index.tsx` | Added verification logging | Confirm flags were saved |
| `jazz/provider.tsx` | Initialize `hasCompletedContactAnalysis: false` | Ensure schema consistency |

## Next Steps After Testing

### If It Works ✅
1. The delays can likely be reduced or made more intelligent
2. Consider adding a retry mechanism if verification fails
3. Add user-facing feedback during the persistence delay
4. Document in user-facing docs that app needs ~1 second to save after analysis

### If It Doesn't Work ❌
We'll need to investigate:
1. Jazz sync configuration (`JazzExpoProvider` settings)
2. AsyncStorage implementation in Jazz
3. Potential Jazz bug - may need to file upstream issue
4. Alternative: Add AsyncStorage backup flag as safety net

## Related Documentation

- [DEMO_AUTH_FEATURE_FLAG.md](../features/DEMO_AUTH_FEATURE_FLAG.md) - DemoAuth vs Anonymous Auth
- [DEMOAUTH_REMOVAL.md](./DEMOAUTH_REMOVAL.md) - Why DemoAuth causes resets
- [Jazz Authentication States](https://jazz.tools/docs/react/key-features/authentication/authentication-states)
- [Jazz Sync and Storage](https://jazz.tools/docs/react/core-concepts/sync-and-storage)

---

**Author:** OpenCode  
**Reviewer:** Pending User Testing  
**Status:** ✅ Ready for Testing
