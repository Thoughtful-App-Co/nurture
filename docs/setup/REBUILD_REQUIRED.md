# 🚨 EAS Rebuild Required

## Critical Changes Made

Several native modules and config plugins have been added. **You must rebuild with EAS for the app to work.**

---

## What Changed

### 1. Added Config Plugins
```json
{
  "plugins": [
    "./plugins/withNetInfo",  // NEW - Jazz sync (netinfo)
    "./plugins/withCallLog",  // NEW - SMS/call log support
    "./plugins/withSMS"       // NEW - SMS/call log support
  ]
}
```

### 2. Created Custom Plugins
- `/plugins/withNetInfo.js` - For @react-native-community/netinfo
- `/plugins/withCallLog.js` - For react-native-call-log
- `/plugins/withSMS.js` - For react-native-get-sms-android

### 3. Added New Features
- **Harvest Module** - New tab with 7 relationship algorithms
- **Loading Animations** - Beautiful branded loaders
- **Diagnostics Tool** - Debug SMS/call log issues
- **Feature Flags** - Control debug features

---

## Why Rebuild is Required

**EAS builds need config plugins to include native modules.** Without rebuilding:

❌ **You'll see these errors:**
```
ERROR: @react-native-community/netinfo: NativeModule.RNCNetInfo is null
ERROR: react-native-call-log module not properly linked
ERROR: react-native-get-sms-android module not properly linked
```

✅ **After rebuild:**
- Jazz sync works (netinfo)
- SMS data mining works
- Call log data mining works
- All native features functional

---

## How to Rebuild

### Option 1: EAS Build (Recommended)

```bash
# Build for development
eas build --profile development --platform android

# Wait ~15-20 minutes for build to complete

# Download via QR code on your device

# Install and test
```

### Option 2: Local Build

```bash
# Generate native code
npx expo prebuild --clean

# Build and run
npx expo run:android

# Takes ~10-15 minutes first time
```

---

## Testing Checklist

After rebuilding, verify:

### ✅ NetInfo (Jazz Sync)
- [ ] App loads without NetInfo errors
- [ ] Dashboard shows contacts
- [ ] Data syncs across devices (if enabled)

### ✅ SMS & Call Logs
- [ ] Open Harvest or Garden
- [ ] Tap "Run Diagnostics" (dev mode)
- [ ] Console shows:
  ```
  ✅ react-native-call-log: LOADED
  ✅ react-native-get-sms-android: LOADED
  ✅ Fetched X call log entries
  ✅ Fetched X SMS entries
  ```

### ✅ UI Features
- [ ] Bottom tab bar is dark green
- [ ] Harvest tab appears
- [ ] Loading animations work during data mining
- [ ] Algorithm selection works in Harvest

---

## What Happens If You Don't Rebuild?

**The app will crash immediately** because:

1. **Jazz Tools** (line 10 in dashboard.tsx) tries to import NetInfo
2. NetInfo native module isn't linked
3. App throws error and stops

**Metro bundler hot reload won't fix this** - it's a native code issue.

---

## Commands Quick Reference

```bash
# Check if rebuild is needed
cat app.json | grep netinfo
# Should show: "@react-native-community/netinfo",

# Check plugins exist
ls plugins/
# Should show: withCallLog.js, withSMS.js

# Rebuild with EAS
eas build --profile development --platform android

# Or rebuild locally
npx expo prebuild --clean && npx expo run:android

# Check logs after installing
adb logcat | grep "NetInfo\|CallLog\|SmsAndroid"
```

---

## Expected Build Time

| Method | First Build | Subsequent |
|--------|-------------|------------|
| EAS Build | 15-20 min | 10-15 min |
| Local Build | 10-15 min | 3-5 min |

---

## Files Modified

| File | Change |
|------|--------|
| `app.json` | Added 3 plugins |
| `plugins/withCallLog.js` | Created |
| `plugins/withSMS.js` | Created |
| `app/(tabs)/_layout.tsx` | Harvest tab + styling |
| `app/(tabs)/harvest.tsx` | Created |
| `jazz/harvestSchema.ts` | Created |
| `jazz/schema.ts` | Added relationship fields |
| `components/LoadingAnimation.tsx` | Created |
| `components/onboarding/DataMiningScreen.tsx` | Added animation |
| `config/featureFlags.ts` | Created |
| `scripts/diagnose-data-mining.ts` | Created |

---

## Summary

**Before Rebuild:**
- ❌ NetInfo error crashes app
- ❌ SMS/call logs don't work
- ❌ Harvest tab may not show
- ❌ Missing native features

**After Rebuild:**
- ✅ All native modules work
- ✅ Jazz sync functional
- ✅ SMS/call data mining works
- ✅ Harvest module fully functional
- ✅ Loading animations show
- ✅ App stable and complete

---

## 🚀 Next Step

```bash
eas build --profile development --platform android
```

Then scan QR code, install, and test all features!

---

**Questions?** See:
- `/docs/EAS_BUILD_SETUP.md` - Complete EAS guide
- `/docs/NETINFO_FIX.md` - NetInfo error details
- `/FIX_SMS_CALLLOG.md` - Quick troubleshooting
