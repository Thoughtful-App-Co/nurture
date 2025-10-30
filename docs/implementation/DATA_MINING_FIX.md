# SMS & Call Log Data Mining - Complete Fix Guide

## Problem: "No completion" when fetching SMS and call data

### Symptoms
- Permission dialogs appear
- Analysis shows "0 texts, 0 calls"
- No errors thrown
- Functions return empty arrays `[]`
- Silently fails without indication

### Root Causes

#### 1. **Using EAS Builds Without Config Plugins** (MOST COMMON FOR THIS PROJECT)
You're downloading the app via QR code from EAS (not Expo Go), but native modules need **Config Plugins** to be included in EAS builds.

**How to detect:**
- You scan QR code and download APK from EAS
- NOT running in "Expo Go" app
- Status indicator shows red "Native modules not loaded"
- Console shows "module not properly linked"

**Solution:**
```bash
# Config plugins have been added to app.json
# Rebuild with EAS to include them:
eas build --profile development --platform android

# Wait for build (~15 min)
# Download new build via QR code
# Native modules will now be included
```

**See:** `/docs/EAS_BUILD_SETUP.md` for complete EAS setup guide

#### 2. **Running in Expo Go** (If you were using Expo Go)
Expo Go is a pre-built app that **cannot** include custom native modules.

**Not applicable to your project** - you're using EAS builds.

**Solution if you were using Expo Go:**
```bash
# Switch to local builds
npx expo prebuild --clean
npx expo run:android
```

#### 2. **Native Modules Not Autolin

ked**
Even if you built natively, the modules might not be properly linked.

**How to detect:**
```bash
# Check if modules exist
ls node_modules/react-native-call-log
ls node_modules/react-native-get-sms-android

# Check if they're in native code
grep -r "CallLog" android/
grep -r "SmsAndroid" android/
```

**Solution:**
```bash
# Force rebuild with clean autolink
rm -rf android/ ios/
npx expo prebuild --clean
npx expo run:android
```

#### 3. **Permissions Denied at Runtime**
Android has runtime permissions that can be denied even if declared in AndroidManifest.xml.

**How to detect:**
```javascript
import { PermissionsAndroid } from 'react-native';

const callLogPerm = await PermissionsAndroid.check(
  PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
);
const smsPerm = await PermissionsAndroid.check(
  PermissionsAndroid.PERMISSIONS.READ_SMS
);

console.log({ callLogPerm, smsPerm }); // Should both be true
```

**Solution:**
1. Request permissions in code (already done in `dataMining.ts:85-139`)
2. Manually grant in Settings if needed:
   - Settings → Apps → Nurture → Permissions
   - Enable: Contacts, Phone, SMS

#### 4. **Promise Never Resolves (SMS)**
The `fetchSMSHistory()` function uses a callback-based API wrapped in a Promise (dataMining.ts:290-316).

If the callback is never fired, the Promise hangs forever.

**How to detect:**
```javascript
// Add timeout to the Promise
const smsPromise = fetchSMSHistory();
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 10000)
);

const result = await Promise.race([smsPromise, timeoutPromise]);
```

**Solution:** Already handled with error callbacks, but could add explicit timeout

#### 5. **Wrong Module Export Structure**
The modules might export differently than expected.

**Current code expects:**
```javascript
const CallLogsModule = require('react-native-call-log');
const CallLogs = CallLogsModule.default; // Expects .default
```

**But some versions export as:**
```javascript
const CallLogs = require('react-native-call-log'); // Direct export
```

**Solution:** Check both patterns

---

## Complete Fix Procedure (EAS Builds)

### Step 1: Verify Config Plugins are Registered

```bash
cd /home/shuppdev/daemon/nurture

# Check that plugins are in app.json
cat app.json | grep -A 2 "withCallLog\|withSMS"

# Should show:
# "./plugins/withCallLog",
# "./plugins/withSMS"
```

✅ **Already done** - config plugins are registered in your app.json

### Step 2: Verify Plugin Files Exist

```bash
ls -la plugins/

# Should show:
# withCallLog.js
# withSMS.js
```

✅ **Already done** - plugin files exist

### Step 3: Rebuild with EAS

```bash
# Rebuild to include config plugins
eas build --profile development --platform android

# If build fails with cache issues:
eas build --profile development --platform android --clear-cache
```

**IMPORTANT:** EAS builds take 15-20 minutes.

### Step 4: Download New Build

1. Wait for EAS build to complete
2. You'll get a new QR code or build URL
3. Scan QR code on your Android device
4. Download and install the new APK
5. **This new build** will have native modules properly linked

### Step 3: Run Diagnostics

Add this to your onboarding screen or a test button:

```typescript
import { runDiagnostics } from '@/scripts/diagnose-data-mining';

// In your component
<Pressable onPress={() => runDiagnostics()}>
  <Text>Run Diagnostics</Text>
</Pressable>
```

This will tell you:
- ✅ or ❌ Platform check
- ✅ or ❌ Expo Go detection
- ✅ or ❌ Native modules loaded
- ✅ or ❌ Permissions granted
- ✅ or ❌ Actual data fetch test

### Step 4: Grant Permissions

When the app starts:
1. You'll see permission dialogs
2. **Grant ALL permissions:**
   - ✅ Contacts
   - ✅ Phone (for call logs)
   - ✅ SMS

If you denied them:
1. Go to: Settings → Apps → Nurture → Permissions
2. Enable all three

### Step 5: Test on Real Device

**Don't use emulator for testing actual data!**

Emulators have no real call/SMS history. Connect a physical Android phone:

```bash
# Enable USB debugging on phone
# Settings → About Phone → Tap "Build Number" 7 times
# Settings → Developer Options → USB Debugging

# Check device is connected
adb devices

# Should show:
# List of devices attached
# ABC123XYZ    device

# Build and install
npx expo run:android
```

### Step 6: Verify Data is Being Fetched

Check the console logs. You should see:

```
📞 Fetching call logs...
✅ Fetched 547 call log entries from last 3 months

💬 Fetching SMS history...
✅ Fetched 1,243 SMS entries from last 3 months

========================================
📊 DATA MINING RESULTS
========================================
Contacts: 234
Call logs: 547
SMS messages: 1,243
========================================
```

**If you see zeros:**

```
========================================
📊 DATA MINING RESULTS
========================================
Contacts: 234
Call logs: 0
SMS messages: 0
========================================

🚨 CRITICAL: ZERO INTERACTION DATA!
```

This means native modules aren't working. Go back to Step 2.

---

## Enhanced Detection

### Add Status Indicator to UI

Update `DataMiningScreen.tsx` to show real-time status:

```typescript
import { canMineData, getDataMiningStatus } from '@/scripts/diagnose-data-mining';

// In component
const [status, setStatus] = useState(getDataMiningStatus());

useEffect(() => {
  setStatus(getDataMiningStatus());
}, []);

// In render
{!status.canMine && (
  <View className="p-4 border border-red-500 bg-red-950/20">
    <Text className="text-red-400 font-bold">⚠️ Data Mining Unavailable</Text>
    <Text className="text-red-300 text-sm mt-2">{status.reason}</Text>
    <Text className="text-red-200 text-xs mt-2">{status.solution}</Text>
  </View>
)}
```

### Add Timeout to Promises

Update `fetchSMSHistory()` to include timeout:

```typescript
export async function fetchSMSHistory(): Promise<SMSEntry[]> {
  // ... existing code ...
  
  // Wrap in timeout
  const SMS_FETCH_TIMEOUT = 30000; // 30 seconds
  
  const fetchPromise = new Promise<SMSEntry[]>((resolve, reject) => {
    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        console.error('❌ Failed to fetch SMS:', fail);
        resolve([]);
      },
      (count: number, smsList: string) => {
        // ... existing parse code ...
      }
    );
  });
  
  const timeoutPromise = new Promise<SMSEntry[]>((resolve) => 
    setTimeout(() => {
      console.warn('⏱️ SMS fetch timeout after 30s');
      resolve([]);
    }, SMS_FETCH_TIMEOUT)
  );
  
  return Promise.race([fetchPromise, timeoutPromise]);
}
```

---

## Expected Console Output (Success)

```
🔍 DATA MINING DIAGNOSTICS
========================================

1. Platform: android
   ✅ Android detected

2. Running in Expo Go: NO
   ✅ Not in Expo Go

3. Checking native modules...
   ✅ react-native-call-log: LOADED
   ✅ react-native-get-sms-android: LOADED

4. Checking permissions...
   Call Log: ✅ GRANTED
   SMS: ✅ GRANTED
   Contacts: ✅ GRANTED

5. Testing data fetch...
   📞 Fetching call logs...
   ✅ Call logs fetched: 10 entries
      Sample call: {
        number: '+1234567890',
        duration: 120,
        timestamp: 1730131200000
      }
   
   💬 Fetching SMS...
   ✅ SMS fetched: 10 entries
      Sample SMS: {
        address: '+1234567890',
        date: '1730131200000',
        type: 1
      }

========================================
✅ DIAGNOSTICS COMPLETE
========================================
```

## Expected Console Output (Failure - Expo Go)

```
🔍 DATA MINING DIAGNOSTICS
========================================

1. Platform: android
   ✅ Android detected

2. Running in Expo Go: YES
   ❌ CRITICAL: You are running in Expo Go!
   Expo Go cannot access native modules
   SOLUTION: Build development client
   Run: npx expo run:android

========================================
```

## Expected Console Output (Failure - Modules Not Loaded)

```
🔍 DATA MINING DIAGNOSTICS
========================================

1. Platform: android
   ✅ Android detected

2. Running in Expo Go: NO
   ✅ Not in Expo Go

3. Checking native modules...
   ❌ react-native-call-log: FAILED TO LOAD
      Error: Module not found

📱 NATIVE MODULES NOT LOADED
   This means the app was not built with native code
   
   SOLUTION:
   1. Stop Metro bundler
   2. Run: npx expo prebuild --clean
   3. Run: npx expo run:android
   4. Grant permissions when prompted

========================================
```

---

## Quick Reference: Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "0 texts, 0 calls" | Running in Expo Go | `npx expo run:android` |
| "Module not found" | Not built natively | `npx expo prebuild --clean` |
| "Permission denied" | Runtime permission | Grant in Settings or re-request |
| "Fetching..." hangs forever | Promise timeout | Add timeout wrapper |
| Empty arrays returned | Device has no data | Test on phone with actual history |
| TypeScript errors | Wrong import | Check module export structure |

---

## Files to Update

1. **Add diagnostics** (already created):
   - `/scripts/diagnose-data-mining.ts`

2. **Update data mining** (optional enhancements):
   - `/services/dataMining.ts`
   - Add timeout wrappers
   - Add better module detection
   - Add fallback export checks

3. **Update UI** (show status):
   - `/components/onboarding/DataMiningScreen.tsx`
   - Show `canMineData()` status
   - Display error if modules not loaded
   - Add "Run Diagnostics" button

4. **Update docs** (this file):
   - `/docs/DATA_MINING_FIX.md`

---

## Testing Checklist

- [ ] Modules installed: `npm list react-native-call-log react-native-get-sms-android`
- [ ] Native build created: `npx expo prebuild --clean`
- [ ] Built on device: `npx expo run:android`
- [ ] Permissions granted: Check Settings → Apps → Nurture
- [ ] Physical device connected: `adb devices`
- [ ] Device has call/SMS history
- [ ] Diagnostics pass: `runDiagnostics()` shows all ✅
- [ ] Data fetched: Console shows "Fetched X entries"
- [ ] Dashboard shows real layers (not all in Social Nebula)

---

## Next Steps After Fix

Once data mining works:

1. **Verify accuracy:** Check if relationship layers match reality
2. **Add manual logging:** For WhatsApp, Instagram, video calls
3. **Optimize performance:** Add incremental updates (don't re-fetch everything)
4. **Add user controls:** Let users adjust timeframes, exclude contacts
5. **Implement caching:** Don't re-analyze on every app open

---

## Support

If you're still seeing issues after following this guide:

1. Run diagnostics: `runDiagnostics()`
2. Check console output
3. Share the diagnostic logs
4. Verify you're not in Expo Go
5. Confirm it's a physical Android device with real data

**Remember:** iOS will never have call/SMS data due to Apple's privacy restrictions. This is a platform limitation, not a bug.
