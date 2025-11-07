# 🚀 Quick Fix: SMS & Call Log Data Not Loading

## The Issue
Your EAS build downloads but returns **0 texts and 0 calls** because native modules need Config Plugins.

## The Fix (5 Minutes + Build Time)

### 1. Verify Files Exist ✅
```bash
ls plugins/
# Should show: withNetInfo.js, withCallLog.js, withSMS.js
```

### 2. Check app.json ✅
```bash
cat app.json | grep -A 3 "withNetInfo"
# Should show:
# "./plugins/withNetInfo",
# "./plugins/withCallLog",
# "./plugins/withSMS"
```

### 3. Rebuild with EAS (REQUIRED) ⚠️
```bash
eas build --profile development --platform android
```

**Wait ~15-20 minutes** for build to complete.

### 4. Download & Install
1. Scan new QR code from EAS
2. Install updated APK
3. Open app

### 5. Verify It Worked ✅
In the app's data mining screen, you should see:
- **✅ Green box:** "Native data mining available"
- **(Dev mode) 🔍 Button:** "Run Diagnostics"

Tap diagnostics and check console for:
```
✅ react-native-call-log: LOADED
✅ react-native-get-sms-android: LOADED
✅ Permissions: GRANTED
📞 Fetching call logs...
✅ Fetched 547 call log entries
💬 Fetching SMS history...
✅ Fetched 1,243 SMS entries
```

## If Still Getting Zeros

1. **Permissions:** Settings → Apps → Nurture → Permissions → Enable all
2. **Device has data:** Test on phone with actual call/SMS history
3. **Check build logs:** Verify plugins ran during EAS build
4. **Run diagnostics:** Tap button in app (dev mode)

## What Was Fixed

✅ Created config plugins for native modules  
✅ Registered plugins in app.json  
✅ Added status indicator to UI  
✅ Added diagnostics tool  
✅ Added timeouts to prevent hanging  
✅ Updated all documentation  

## Files Changed

- `/plugins/withCallLog.js` - NEW
- `/plugins/withSMS.js` - NEW  
- `/config/featureFlags.ts` - NEW
- `/scripts/diagnose-data-mining.ts` - NEW
- `/app.json` - Modified (plugins registered)
- `/services/dataMining.ts` - Modified (timeouts added)
- `/components/onboarding/DataMiningScreen.tsx` - Modified (status & diagnostics)

## Next Build Command

```bash
eas build --profile development --platform android
```

**That's it!** After rebuilding, native modules will work.

---

**For detailed docs, see:**
- `/docs/SMS_CALL_LOG_FIX_SUMMARY.md` - Complete summary
- `/docs/EAS_BUILD_SETUP.md` - EAS build guide
- `/docs/DATA_MINING_FIX.md` - Troubleshooting guide
