# Getting REAL Data - Critical Setup (EAS Builds)

## 🚨 The Problem

You're seeing **"Processed 0 texts, 0 calls"** because native modules aren't included in your EAS build.

**You ARE using EAS builds** (downloading via QR code), but the native modules need **Config Plugins** to be included in the build.

Without native modules working, Nurture can only see:
- ✅ Contact names
- ❌ NO call history
- ❌ NO SMS history
- ❌ NO interaction data

**This means your Dunbar layers are basically random guesses.**

---

## ✅ The Solution (For EAS Builds)

Config plugins have been added. You need to **rebuild with EAS**:

```bash
# Step 1: Verify config plugins are registered
cat app.json | grep "withCallLog\|withSMS"
# Should see: "./plugins/withCallLog", "./plugins/withSMS"

# Step 2: Rebuild with EAS
eas build --profile development --platform android

# Step 3: Wait for build (~15-20 minutes)

# Step 4: Download new build via QR code on your device

# Step 5: Install and grant ALL permissions
# ✅ Contacts
# ✅ Phone (Call logs)  
# ✅ SMS
```

**First EAS build: 15-20 minutes**  
**Subsequent builds: 10-15 minutes**

**See:** `/docs/EAS_BUILD_SETUP.md` for detailed instructions

---

## 📊 How to Know It Worked

### Console Output Should Show:

```
📊 DATA MINING RESULTS
====================================
Contacts: 234
Call logs: 547
SMS messages: 1,243
====================================

✅ SUCCESS: Got real interaction data!
   Analyzing 234 contacts with 1,790 interactions

Dunbar Layer Distribution:
  layer0_intimate: 3 (1.3%)
  layer1_sympathy: 8 (3.4%)
  layer2_close: 23 (9.8%)
  layer3_tribe: 87 (37.2%)
  layer4_acquaintances: 59 (25.2%)
  layer5_nebula: 54 (23.1%)
```

### If You See Zero Data:

```
📊 DATA MINING RESULTS
====================================
Contacts: 234
Call logs: 0
SMS messages: 0
====================================

🚨 CRITICAL: ZERO INTERACTION DATA!

You processed 0 texts and 0 calls.
This means your Dunbar layers will be INACCURATE.
```

**This means native modules aren't working.**

---

## 🔧 Troubleshooting Zero Data

### Problem 1: Running in Expo Go

```bash
# ❌ This won't work:
npm start
# (then scanning QR code)

# ✅ This works:
npx expo run:android
```

Expo Go is a pre-built app that can't include custom native modules. You MUST build your own APK.

### Problem 2: Permissions Not Granted

Go to device settings:
1. Settings → Apps → Nurture → Permissions
2. Enable: Contacts, Phone (Call logs), SMS
3. Re-open app and re-run analysis

### Problem 3: Using Android Emulator

Emulators don't have real call/SMS history. You MUST use a physical device with actual data.

### Problem 4: Native Modules Not Linked

```bash
# Nuclear option - rebuild from scratch
rm -rf android/ ios/ node_modules/
npm install
npx expo prebuild --clean
npx expo run:android
```

---

## 📱 Platform Differences

### Android (Full Data) ⭐ RECOMMENDED

| Data Type | Available | How |
|-----------|-----------|-----|
| Contacts | ✅ | expo-contacts |
| Call Logs | ✅ | react-native-call-log |
| SMS History | ✅ | react-native-get-sms-android |

**Build command:** `npx expo run:android`

**Accuracy:** 85-90% with full data

### iOS (Limited Data)

| Data Type | Available | Reason |
|-----------|-----------|--------|
| Contacts | ✅ | expo-contacts |
| Call Logs | ❌ | Apple privacy restriction |
| SMS History | ❌ | Apple privacy restriction |

**Build command:** `npx expo run:ios`

**Accuracy:** 40-50% (contact names only)

**Solution:** Use manual logging for WhatsApp, Instagram, video calls, in-person meetings

---

## 🎯 What Gets Analyzed

### Call Logs (Last 3 Months)

- **Duration:** Longer calls = deeper connections
- **Initiation:** Do you call them or do they call you?
- **Frequency:** How often do you actually talk?
- **Recency:** Recent matters more (exponential decay)

### SMS History (Last 3 Months)

- **Message count:** Total interactions
- **Reciprocity:** Balanced vs. one-sided conversations
- **Response time:** How quickly you reply
- **Conversation starts:** Who initiates?

### Scoring Algorithm

```javascript
Base Score = 0-100

Call logs:     +30 points (weighted 5x more than SMS)
Call duration: +20 points (quality indicator)
SMS frequency: +30 points
Reciprocity:   +20 points
Recency:       +10 points (exponential decay)
Family:        +15 points (nuclear family)
Favorites:     +20 points (manual override)
Quality:       +15 points (from manual logs)
```

---

## 🧪 Testing with Real Data

### Use Your Personal Device

1. Connect your Android phone via USB
2. Enable USB debugging:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → USB Debugging
3. Verify connection: `adb devices`
4. Build and install: `npx expo run:android`
5. Grant ALL permissions
6. Let it analyze your REAL data

### What You'll Discover

With 3 months of real data:
- Who you **actually** talk to (not who you think)
- Phone calls reveal deeper connections than texts
- One-sided relationships become obvious
- People you haven't talked to in months drop to lower layers

**"Behavioral reality, not wishful thinking"** - this is the core insight.

---

## 🎮 Manual Logging (Fills the Gaps)

Even with full Android data, you'll have gaps:
- ❌ WhatsApp, Telegram, Signal
- ❌ Instagram, Twitter, Facebook DMs
- ❌ Zoom, FaceTime, Google Meet
- ❌ In-person meetings

**Solution:** Built-in manual interaction logger

1. Open any contact
2. Tap "+ Log Interaction"
3. Select type (In Person, Video, Messaging, Social Media)
4. Rate quality (1-5 stars)
5. Add notes (optional)

**Quality > Quantity:** One 5-star deep conversation > 100 surface texts

---

## 🚀 Quick Commands

```bash
# Verify setup
npm run verify

# Full setup
npm run setup

# Build and run
npx expo run:android

# View logs
npx react-native log-android | grep "DATA MINING"

# Check permissions
adb shell dumpsys package com.thoughtfulappco.nurture | grep permission

# Rebuild from scratch
rm -rf android/ node_modules/ && npm install && npx expo prebuild --clean && npx expo run:android
```

---

## 💡 Pro Tips

### Faster Iteration

1. Build native app **once**
2. Use `npm start` for subsequent JS changes (hot reload works)
3. Only rebuild when changing native modules

### View Real-Time Analysis

```bash
# Watch data mining in real-time
npx react-native log-android | grep -E "Fetched|DATA MINING|Analyzing"
```

### Test Different Scenarios

- **Empty device:** See baseline (should show zero data warning)
- **Personal device:** Real relationships analyzed
- **Test account:** Edge cases

---

## 🎯 Success Criteria

**You'll know it's working when:**

✅ Console shows hundreds/thousands of call logs and SMS  
✅ Dashboard shows realistic layer distribution (not everyone in Social Nebula)  
✅ Interaction scores vary widely (0-100 range)  
✅ People you actually talk to are in higher layers  
✅ People you haven't contacted in months are in lower layers  

**"Behavioral reality, not wishful thinking."**

---

## 📞 Still Having Issues?

### Quick Checklist

- [ ] Using physical Android device (not emulator)?
- [ ] Built with `npx expo run:android` (not Expo Go)?
- [ ] Granted ALL permissions (Contacts, Call logs, SMS)?
- [ ] Device has actual call/SMS history (not brand new)?
- [ ] Console shows "Fetched X call logs" (not zero)?

### If Still Zero Data

1. Check Metro bundler console for errors
2. Run `npm run verify` to check setup
3. Try nuclear option: `rm -rf android/ && npx expo prebuild && npx expo run:android`
4. Check device permissions: Settings → Apps → Nurture → Permissions
5. View Android logs: `npx react-native log-android`

---

## TL;DR

```bash
# Three commands to get real data:
npm install
npx expo prebuild --clean  
npx expo run:android

# Grant ALL permissions when prompted
# Watch console for: "✅ SUCCESS: Got real interaction data!"
# If you see zeros, you're not running natively
```

**The data exists on your device. We just need native modules to access it.**

Without this, Nurture is just a fancy contact list. With it, you see your actual behavioral reality.
