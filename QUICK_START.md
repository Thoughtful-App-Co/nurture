# Quick Start - Testing Nurture

## Right Now (Expo Go - 30 seconds)

Test the contact analysis fix immediately:

```bash
# Already running? Just scan QR code
# Not running? Start it:
npx expo start
```

**What this tests:**
- ✅ Contact analysis fix (no re-run on restart)
- ✅ Onboarding flow
- ✅ UI/UX
- ❌ Call/SMS data (not available in Expo Go)

---

## Full Native Testing (EAS Build - 20 minutes)

Get call/SMS data and full functionality:

```bash
# Build with native modules (cloud build)
eas build --profile development --platform android

# Wait for build (~15-20 min)
# Download APK when complete
# Install on Android device
# Start metro bundler
npx expo start --dev-client
```

**What this tests:**
- ✅ Everything above PLUS
- ✅ Call log data
- ✅ SMS history data
- ✅ Real interaction scores
- ✅ Accurate Dunbar layers

---

## Key Commands

| Command | When to Use | Time |
|---------|------------|------|
| `npx expo start` | Quick testing, UI changes | Instant |
| `eas build --profile development --platform android` | Test native features, production testing | 20 min |
| `npx expo start --dev-client` | After installing EAS dev client | Instant |
| `adb shell pm clear com.thoughtfulappco.nurture` | Simulate fresh install | 1 sec |

---

## You DON'T Need

- ❌ Java installation
- ❌ Android SDK
- ❌ Android emulator
- ❌ Local native builds

## You DO Have

- ✅ EAS account
- ✅ Cloud builds with native modules
- ✅ Expo Go for quick testing

---

## Next Steps

1. **Test contact analysis fix** (do this now):
   ```bash
   npx expo start
   # Test app restart behavior
   ```

2. **Build with native modules** (when ready for call/SMS data):
   ```bash
   eas build --profile development --platform android
   ```

See `docs/TESTING_GUIDE.md` for detailed explanations.
