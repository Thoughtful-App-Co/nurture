# Quick Start Guide - Nurture

## Current Status

✅ App now runs WITHOUT development build (with limited functionality)
✅ Graceful fallback to PIN-only when biometric not available
⚠️ Full functionality requires development build

## Quick Test (No Build Required)

Want to see the app work RIGHT NOW?

```bash
npm start
```

**What works**:
- ✅ Onboarding flow
- ✅ PIN lock (default: 1234)
- ✅ Contact import (names/numbers only)
- ✅ Dashboard UI

**What doesn't work**:
- ❌ Biometric lock (Face ID/Fingerprint)
- ❌ Call log mining
- ❌ SMS mining
- ❌ Real interaction data

**You'll see**: PIN-only lock with warning banner

## Full Functionality (Requires Build)

For REAL interaction data and biometric lock:

```bash
npx expo run:android
```

**First build takes 5-10 minutes.**

**What works**:
- ✅ Everything above PLUS:
- ✅ Face ID / Fingerprint lock
- ✅ Real call log mining (Android)
- ✅ Real SMS mining (Android)
- ✅ Accurate Dunbar layers

## Understanding the App Flow

### 1. Onboarding (5 steps)
1. Welcome screen
2. Name collection (first/last)
3. Email/phone collection
4. Contacts permission request
5. Complete

### 2. Data Mining
- Shows progress screen
- Fetches contacts
- Fetches call logs (Android dev build only)
- Fetches SMS (Android dev build only)
- Calculates interaction scores

### 3. Biometric Lock
- **With dev build**: Face ID / Fingerprint
- **Without dev build**: PIN only (1234)

### 4. Dashboard
- Shows Dunbar layers (0-5)
- Health status
- Relationship distribution

## Default PIN

**Default PIN**: `1234`

Change this in `app/index.tsx:181`:
```typescript
fallbackPIN="1234" // Change to your PIN
```

## Permissions Required

### Android
- READ_CONTACTS ✅
- READ_CALL_LOG ✅ (dev build only)
- READ_SMS ✅ (dev build only)

### iOS
- READ_CONTACTS ✅
- Face ID (biometric) ✅ (dev build only)
- ❌ No call/SMS access (Apple restriction)

## Build Options

### Option 1: Local Build (Fastest)
```bash
npx expo run:android
```

### Option 2: Cloud Build (EAS)
```bash
npx eas-cli login
eas build --profile development --platform android
```

### Option 3: Production Build
```bash
eas build --profile production --platform android
```

## Troubleshooting

### App won't start
```bash
npm install
npm start -- --clear
```

### "Cannot find module" errors
```bash
rm -rf node_modules
npm install
```

### Native module errors (even after build)
```bash
npx expo prebuild --clean
npx expo run:android
```

### Want to skip biometric lock during development?
In `app/index.tsx`, comment out the lock check:
```typescript
// if (flow === 'locked') {
//   return <BiometricLock ... />
// }
```

## Development Workflow

### Without Dev Build (Quick Testing)
```bash
npm start
# Test UI, onboarding, basic functionality
# PIN lock only, no real data
```

### With Dev Build (Full Testing)
```bash
npx expo run:android
# Test everything
# Real call/SMS data, biometric lock
```

### Making Changes
- **JS/TS changes**: Hot reload works (no rebuild)
- **Native changes**: Rebuild required (`npx expo run:android`)

## What to Expect

### First Launch (No Dev Build)
1. Onboarding completes
2. Data mining imports contacts only
3. PIN lock appears (warning banner shows)
4. Dashboard shows contacts in Layer 5 (no real data)

### First Launch (With Dev Build)
1. Onboarding completes
2. Data mining imports contacts, calls, SMS
3. Biometric/PIN lock appears
4. Dashboard shows accurate Dunbar layers

### Subsequent Launches
- Biometric/PIN lock appears immediately
- Unlock to see dashboard

## Testing Real Data

1. **Use physical device** (not emulator)
2. **Grant all permissions**
3. **Have call/SMS history** (can't test on new device)
4. **Check console logs**:
   ```
   Fetched X contacts
   Fetched X call log entries
   Fetched X SMS entries
   Analysis complete: X contacts processed
   ```

## Next Steps After Testing

1. Test onboarding flow
2. Grant permissions
3. Check dashboard data
4. Build development client for real data
5. Test with actual device history

## Common Issues

**"Cannot find native module"**
→ Need development build. Run `npx expo run:android`

**No data in dashboard**
→ Without dev build, only contacts imported. Need full build for call/SMS data.

**Lock screen keeps appearing**
→ Working as designed. Use PIN 1234 or disable in code.

**TypeScript errors**
→ Run `npx tsc --noEmit` to check

## Quick Commands

```bash
# Start development server
npm start

# Build development client
npx expo run:android

# Check TypeScript
npx tsc --noEmit

# Clear cache
npm start -- --clear

# View logs
npx react-native log-android
```

---

**Ready to test?**

For quick test (limited): `npm start`
For full test (real data): `npx expo run:android`

---

## UPDATE: Biometric Lock Temporarily Disabled

**For easier testing**, the biometric lock has been temporarily disabled.

The app now goes straight to the dashboard after:
1. Onboarding completes
2. Data mining completes

**To re-enable the lock**, edit `app/index.tsx`:

```typescript
// Line ~30: Uncomment this to enable lock after onboarding
if (needsOnboarding) {
  setFlow('onboarding');
} else {
  // Change this:
  setFlow('ready');
  // To this:
  setFlow('locked');
}

// Line ~50: Uncomment this to enable lock on app foreground
if (me && flow !== 'onboarding' && flow !== 'data-mining') {
  console.log("App came to foreground - locking");
  setFlow('locked');
}
```

**Why disabled?**
- Makes development/testing faster
- No need to unlock every time you reload
- Can focus on testing data mining and dashboard
- Will re-enable for production

**Current flow**:
1. Onboarding → Data Mining → **Dashboard** (no lock)
2. App backgrounds/foregrounds → Stay on current screen (no lock)

**With lock enabled**:
1. Onboarding → Data Mining → **Lock Screen** → Dashboard
2. App backgrounds/foregrounds → **Lock Screen** → Dashboard

