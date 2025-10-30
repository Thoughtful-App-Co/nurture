# EAS Build Setup for SMS & Call Log Data Mining

## Critical Information

**You are using EAS builds, NOT Expo Go.** This means:
- ✅ Native modules CAN work (if configured correctly)
- ✅ You download the app via QR code from EAS
- ⚠️ Native modules need Config Plugins to be registered
- ⚠️ Must rebuild after any native changes

---

## The Problem

When you scan the QR code and download the app from EAS, the native modules (`react-native-call-log` and `react-native-get-sms-android`) are NOT automatically included unless they have:

1. **Expo Config Plugins** registered in `app.json`
2. **Proper autolinking** during the EAS build process

Since these third-party modules don't provide official Expo config plugins, **we created custom ones**.

---

## Solution Implemented

### 1. Created Custom Config Plugins

**Location:** `/plugins/`

- `withCallLog.js` - Ensures `react-native-call-log` is linked
- `withSMS.js` - Ensures `react-native-get-sms-android` is linked

These plugins:
- Add necessary Android permissions
- Ensure native modules are properly linked during EAS build
- Run automatically when you build with `eas build`

### 2. Registered Plugins in app.json

**Updated:** `app.json` lines 73-74

```json
{
  "plugins": [
    "expo-router",
    "expo-secure-store",
    "expo-contacts",
    "expo-local-authentication",
    "./plugins/withCallLog",   // ← Added
    "./plugins/withSMS"         // ← Added
  ]
}
```

### 3. Added Feature Flags

**Created:** `/config/featureFlags.ts`

Controls debug features like the diagnostics button:

```typescript
export const FeatureFlags = {
  SHOW_DATA_MINING_DIAGNOSTICS: __DEV__, // Only in dev
  VERBOSE_DATA_MINING_LOGS: __DEV__,
  // ... more flags
};
```

### 4. Enhanced DataMiningScreen

**Updated:** `components/onboarding/DataMiningScreen.tsx`

Added:
- ✅ Status indicator showing if native data mining is available
- ✅ Diagnostics button (dev mode only via feature flag)
- ✅ Real-time status checks
- ✅ Better error messages specific to EAS builds

### 5. Enhanced Fetch Functions

**Updated:** `services/dataMining.ts`

Added:
- ✅ 30-second timeouts for call log and SMS fetching
- ✅ EAS-specific error messages
- ✅ Better timeout handling
- ✅ Promise race conditions to prevent hanging

---

## How to Rebuild with Native Modules

### Step 1: Verify Config is Correct

```bash
cd /home/shuppdev/daemon/nurture

# Check plugins are registered
cat app.json | grep -A 3 "plugins"

# Should show:
# "./plugins/withCallLog",
# "./plugins/withSMS"
```

### Step 2: Rebuild with EAS

```bash
# For development build (recommended for testing)
eas build --profile development --platform android

# This will:
# 1. Run the config plugins
# 2. Link native modules
# 3. Build APK with native code included
# 4. Generate new QR code
```

**Build time:** ~15-20 minutes (first build), ~10 minutes (subsequent)

### Step 3: Download New Build

1. Wait for build to complete on EAS
2. You'll get a new QR code
3. Scan QR code on your Android device
4. Install the new APK
5. Open app and grant ALL permissions

### Step 4: Verify It Worked

1. Open the app
2. Go to onboarding/data mining screen
3. Look for status indicator:
   - ✅ **Green** = "Native data mining available" ← SUCCESS!
   - ❌ **Red** = "Native modules not loaded" ← Need to rebuild

4. If in dev mode, tap "Run Diagnostics" button
5. Check console logs for:
   ```
   ✅ react-native-call-log: LOADED
   ✅ react-native-get-sms-android: LOADED
   ✅ Permissions: GRANTED
   📞 Fetching call logs...
   ✅ Fetched X call log entries
   💬 Fetching SMS history...
   ✅ Fetched X SMS entries
   ```

---

## Common Issues & Solutions

### Issue 1: "Native modules not loaded"

**Cause:** Build doesn't include native code

**Solution:**
```bash
# Verify plugins are in app.json
cat app.json | grep "withCallLog\|withSMS"

# If missing, they weren't included in last build
# Rebuild:
eas build --profile development --platform android --clear-cache
```

### Issue 2: Still getting 0 calls / 0 SMS

**Possible causes:**

1. **Permissions not granted**
   - Check: Settings → Apps → Nurture → Permissions
   - Enable: Contacts, Phone, SMS

2. **Device has no history**
   - Test on a phone with actual call/SMS data
   - Not a brand new device or factory reset

3. **Timeout issues**
   - Check console for "timeout" messages
   - May need to increase timeout or reduce timeframe

4. **Module API mismatch**
   - Run diagnostics to see actual error
   - Check module versions match expected API

### Issue 3: Build fails

**Error:** "Plugin not found"

**Solution:**
```bash
# Ensure plugin files exist
ls -la plugins/

# Should show:
# withCallLog.js
# withSMS.js

# If missing, they weren't committed to git
git add plugins/
git commit -m "Add config plugins"
git push
```

**Error:** "Module resolution failed"

**Solution:**
```bash
# Clear EAS cache
eas build --profile development --platform android --clear-cache

# Or try local prebuild first
npx expo prebuild --clean
# Check if android/ folder is generated correctly
# Then build with EAS
```

---

## Development Workflow

### For JavaScript Changes (Fast)

No rebuild needed:

```bash
npm start

# Metro will hot reload
# Native modules already in the APK from last build
```

### For Native Changes (Slow)

Requires rebuild:

```bash
# Any changes to:
# - app.json (plugins)
# - plugins/*.js
# - Native module versions

# Rebuild:
eas build --profile development --platform android
```

---

## Testing Checklist

Before considering data mining "fixed":

- [ ] Config plugins registered in app.json
- [ ] Rebuilt with EAS including plugins
- [ ] Downloaded latest build via QR code
- [ ] Status indicator shows green "Native data mining available"
- [ ] Permissions granted (Contacts, Phone, SMS)
- [ ] Diagnostics shows modules LOADED
- [ ] Diagnostics shows permissions GRANTED
- [ ] Diagnostics fetches actual data (> 0 calls/SMS)
- [ ] Console shows "Fetched X entries" (not 0)
- [ ] Dashboard shows real Dunbar layers (not all in nebula)

---

## Diagnostic Commands

### Check if modules are in the build

```bash
# After downloading APK, check logs when app starts
adb logcat | grep "CallLog\|SmsAndroid"

# Should see native module initialization
```

### Check permissions on device

```bash
adb shell dumpsys package com.thoughtfulappco.nurture | grep permission

# Should show:
# android.permission.READ_CALL_LOG: granted=true
# android.permission.READ_SMS: granted=true
```

### Verify plugin files in build

```bash
# Check if plugins were run during build
# Look in EAS build logs for:
# "Running config plugin: ./plugins/withCallLog"
# "Running config plugin: ./plugins/withSMS"
```

---

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `/plugins/withCallLog.js` | Created | Config plugin for call log module |
| `/plugins/withSMS.js` | Created | Config plugin for SMS module |
| `/config/featureFlags.ts` | Created | Feature flag system |
| `/scripts/diagnose-data-mining.ts` | Created | Diagnostic tool |
| `app.json` | Modified | Registered config plugins |
| `services/dataMining.ts` | Modified | Added timeouts, EAS messages |
| `components/onboarding/DataMiningScreen.tsx` | Modified | Added status indicator & diagnostics |
| `docs/EAS_BUILD_SETUP.md` | Created | This file |

---

## Quick Reference: EAS vs Expo Go vs Local

| Feature | Expo Go | EAS Build | Local Build |
|---------|---------|-----------|-------------|
| Native modules | ❌ No | ✅ Yes (with plugins) | ✅ Yes |
| Download method | QR scan | QR scan | USB/adb |
| Build time | 0s | ~15min | ~10min |
| Hot reload | ✅ Yes | ✅ Yes | ✅ Yes |
| Call/SMS access | ❌ No | ✅ Yes | ✅ Yes |
| Rebuild needed | Never | After native changes | After native changes |

**You are using:** EAS Build (column 2)

---

## Next Steps

1. **Rebuild now:**
   ```bash
   eas build --profile development --platform android
   ```

2. **Download new build** via QR code

3. **Run diagnostics** in app (dev mode)

4. **Verify data** is being fetched

5. **If still failing:** Share diagnostic output for debugging

---

## Support

If you're still seeing issues:

1. **Run diagnostics:** Tap "Run Diagnostics" button in app
2. **Check console:** Look for specific error messages
3. **Verify build:** Ensure latest build includes plugins
4. **Check permissions:** Settings → Apps → Nurture → Permissions
5. **Test with data:** Use device with actual call/SMS history

**Remember:** EAS builds take time but are necessary for native modules to work!
