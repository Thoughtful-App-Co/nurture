# Building Nurture with Native Modules

## The Problem

You're seeing `Cannot find native ExpoLocalAuthentication` because:

1. **Native modules require a development build** (they don't work in Expo Go)
2. We're using:
   - `expo-local-authentication` (biometric lock)
   - `react-native-call-log` (call history)
   - `react-native-get-sms-android` (SMS history)

## Solution: Build a Development Client

### Prerequisites

```bash
# Make sure you have the latest dependencies
npm install

# For Android
# - Install Android Studio
# - Set up Android SDK
# - Connect physical device or start emulator

# For iOS (macOS only)
# - Install Xcode
# - Set up iOS simulator or connect physical device
```

### Option 1: Build for Android (Recommended - Full Functionality)

```bash
# Clean install
rm -rf node_modules
npm install

# Prebuild (generates native directories)
npx expo prebuild --clean

# Build and run on Android
npx expo run:android
```

**This will**:
- Generate `android/` directory with native code
- Install all native modules
- Build APK
- Install on connected device/emulator
- Start Metro bundler

**First build takes 5-10 minutes**. Subsequent builds are faster.

### Option 2: Build for iOS (Limited - Contacts Only)

```bash
# Clean install
rm -rf node_modules
npm install

# Prebuild (generates native directories)
npx expo prebuild --clean

# Build and run on iOS
npx expo run:ios
```

**Remember**: iOS has NO access to call logs or SMS (Apple restriction)

### Option 3: Use EAS Build (Cloud Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android (development)
eas build --profile development --platform android

# Build for iOS (development)
eas build --profile development --platform ios
```

**Download the APK/IPA** from the EAS dashboard and install on your device.

## After Building

### 1. Verify Native Modules Loaded

When you run the app, check the console for:

```
✅ expo-local-authentication loaded
✅ react-native-call-log loaded
✅ react-native-get-sms-android loaded
```

### 2. Test the Flow

1. Complete onboarding (name, email, phone)
2. Grant permissions:
   - ✅ Contacts
   - ✅ Call logs (Android only)
   - ✅ SMS (Android only)
3. Watch data mining progress
4. See biometric lock appear
5. Unlock with Face ID/Fingerprint or PIN (1234)
6. View dashboard with real Dunbar layers

### 3. Check for Errors

**If biometric lock fails**:
```javascript
// The app should show PIN fallback automatically
// Default PIN: 1234
```

**If permissions denied**:
- Go to Settings → Apps → Nurture → Permissions
- Enable Contacts, Phone, SMS

**If no data appears**:
- Check console for errors
- Ensure device has call/SMS history
- Verify permissions granted

## Development Workflow

### After First Build

Once you've built the native app, you can use:

```bash
# Just start the metro bundler (no rebuild needed)
npm start

# Press 'a' for Android
# Press 'i' for iOS
```

**Rebuild only when**:
- Adding new native modules
- Changing app.json plugins
- Updating native dependencies
- Changing Android/iOS permissions

### Making Changes

**JavaScript/TypeScript changes**: Hot reload works (no rebuild)
**Native changes**: Requires rebuild with `npx expo run:android`

## Troubleshooting

### "Cannot find module X"

```bash
# Clear everything
rm -rf node_modules
npm install
npx expo prebuild --clean
npx expo run:android
```

### "Build failed"

```bash
# Clear Metro cache
npx expo start -c

# Clear Gradle cache (Android)
cd android
./gradlew clean
cd ..

# Try again
npx expo run:android
```

### "App crashes on startup"

1. Check logs: `npx react-native log-android`
2. Look for permission errors
3. Verify app.json has all required permissions
4. Rebuild from scratch

### Still not working?

```bash
# Nuclear option: Delete everything and start fresh
rm -rf node_modules
rm -rf android
rm -rf ios
npm install
npx expo prebuild
npx expo run:android
```

## Expected Build Output

### Android

```
android/
├── app/
│   ├── src/
│   └── build.gradle
├── gradle/
└── build.gradle
```

**APK Location**: `android/app/build/outputs/apk/debug/app-debug.apk`

### iOS

```
ios/
├── nurture/
├── nurture.xcodeproj
└── nurture.xcworkspace
```

## Next Steps After Successful Build

1. ✅ App runs with biometric lock
2. ✅ Data mining fetches real call/SMS data
3. ✅ Dashboard shows accurate Dunbar layers
4. 🎯 Start testing with real device data
5. 🎯 Monitor performance with large contact lists
6. 🎯 Iterate based on real user behavior

---

**TL;DR**: Run `npx expo run:android` to build a development client with all native modules included.
