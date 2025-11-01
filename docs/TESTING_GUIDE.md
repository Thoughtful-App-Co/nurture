# Testing Guide - Nurture App

## Quick Decision Tree

**Do you have a physical Android device?**
- ✅ YES → Use **EAS Build** (easiest, recommended)
- ❌ NO → Need emulator (requires Java + Android SDK locally)

---

## Option 1: EAS Build (RECOMMENDED - What You Have)

### ✅ Pros:
- ✅ Compiles native modules (call-log, SMS) in the cloud
- ✅ No local Java/Android SDK installation needed
- ✅ Works with physical devices
- ✅ Production-ready builds

### ❌ Cons:
- Takes 15-20 minutes per build
- Need to rebuild for code changes

### How to Use:

```bash
# Build development client (includes native modules)
eas build --profile development --platform android

# Wait for build to complete (~15-20 min)
# Download APK from Expo dashboard
# Install on your Android device
# Run metro bundler
npx expo start --dev-client
```

**When to use:** Testing with real device, need native modules (call/SMS data)

---

## Option 2: Local Android Build

### ✅ Pros:
- Faster iteration (2-3 min rebuilds)
- Full development environment

### ❌ Cons:
- Requires Java + Android SDK installation
- Requires emulator or physical device connected via USB
- Complex setup

### How to Use:

```bash
# Only works if you have Java installed
npx expo run:android
```

**When to use:** Rapid development, frequent code changes

---

## Option 3: Expo Go (LIMITED - What's Running Now)

### ✅ Pros:
- Instant testing
- No build required
- Works right now

### ❌ Cons:
- ❌ NO native modules (no call-log, no SMS)
- ❌ Contact analysis will show zero interaction scores
- ❌ Can only test contact list (names/emails/phones)

### How to Use:

```bash
# Already running
npx expo start
# Scan QR code with Expo Go app
```

**When to use:** Testing UI, flow logic, non-native features

---

## What We Fixed Today

### Contact Analysis Re-run Issue ✅
- **Status:** FIXED
- **Test with:** Any option (Expo Go, EAS Build, or local)
- **What to test:** App restart behavior

**Test steps:**
1. Complete onboarding
2. Close app completely
3. Reopen app
4. ✅ Should go directly to dashboard (no re-analysis)

---

## Native Modules Confusion - CLARIFIED

### The Confusion:
You saw "native modules not installed" and thought you needed local Android SDK.

### The Truth:
- **Expo Go** = No native modules ❌
- **EAS Build** = Native modules compiled in cloud ✅
- **Local build** = Native modules compiled locally ✅

### What You Should Do:
**Use EAS Build** - you already have it set up, it compiles native modules, no local SDK needed!

---

## Recommended Testing Flow

### For Your Current Situation:

1. **Quick UI/Flow Testing** (Right now)
   ```bash
   npx expo start
   # Use Expo Go - test contact analysis fix
   ```

2. **Full Native Testing** (When ready)
   ```bash
   eas build --profile development --platform android
   # Install APK on device
   # Get real call/SMS data
   ```

---

## Command Quick Reference

### Test contact analysis fix (works now):
```bash
npx expo start
# Scan QR code, test app restart behavior
```

### Build with native modules (15-20 min):
```bash
eas build --profile development --platform android
```

### Start metro for EAS dev client:
```bash
npx expo start --dev-client
```

### Clear app data (fresh install test):
```bash
adb shell pm clear com.thoughtfulappco.nurture
```

---

## What You DON'T Need

- ❌ Local Java installation (unless doing local builds)
- ❌ Android SDK (unless doing local builds)
- ❌ Android emulator (use physical device with EAS build)

## What You DO Need

- ✅ EAS account (you have this)
- ✅ Physical Android device (for testing EAS builds)
- ✅ USB cable (to install APK) OR wireless install via QR

---

## Next Steps

1. **Test contact analysis fix right now:**
   - Use Expo Go (already running)
   - Clear app data, test restart behavior

2. **Get full native functionality:**
   - Run `eas build --profile development --platform android`
   - Install APK on device
   - Test with real call/SMS data

That's it! No Java, no SDK, no emulator needed.
