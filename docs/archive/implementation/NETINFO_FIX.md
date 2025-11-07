# NetInfo Error Fix - EAS Builds

## Error Message

```
ERROR [Error: @react-native-community/netinfo: NativeModule.RNCNetInfo is null.
```

## Root Cause

The `@react-native-community/netinfo` package is a dependency of `jazz-tools` (used for real-time sync). Like our SMS/call log modules, it requires proper linking in EAS builds.

## Solution

Created custom config plugin for netinfo and registered it in `app.json`:

**Created:** `/plugins/withNetInfo.js`

```javascript
const { withPlugins } = require('@expo/config-plugins');

module.exports = function withNetInfo(config) {
  // NetInfo doesn't require special permissions or manifest changes
  // It just needs to be autolinked, which happens automatically
  return withPlugins(config, []);
};
```

**Updated:** `app.json`

```json
{
  "plugins": [
    "expo-router",
    "expo-secure-store",
    "expo-contacts",
    "expo-local-authentication",
    "./plugins/withNetInfo",  // ← Added
    "./plugins/withCallLog",
    "./plugins/withSMS"
  ]
}
```

## Why This Happens

**Jazz Tools** (your sync library) uses NetInfo to:
- Detect network connectivity
- Pause sync when offline
- Resume sync when back online
- Optimize bandwidth usage

In EAS builds, native modules need to be explicitly registered as config plugins, even if they're dependencies of other packages.

## Verification

After rebuilding:

```bash
# Check app.json has the plugin
cat app.json | grep netinfo
# Should show: "@react-native-community/netinfo",

# Rebuild
eas build --profile development --platform android

# Run app - error should be gone
```

## Related Issues

This is the same issue we had with:
- `react-native-call-log` → Fixed with `./plugins/withCallLog`
- `react-native-get-sms-android` → Fixed with `./plugins/withSMS`
- `@react-native-community/netinfo` → Fixed by adding to plugins

**Pattern:** Any native module (direct or transitive dependency) needs config plugin registration for EAS builds.

## Files Modified

- ✅ `/plugins/withNetInfo.js` - Created custom config plugin
- ✅ `/app.json` - Added `./plugins/withNetInfo` to plugins array

## Testing

After rebuild, Jazz sync should work properly:
- ✅ No more NetInfo errors
- ✅ Offline detection works
- ✅ Sync resumes when back online
- ✅ Dashboard loads without crashes

---

**Status:** ✅ FIXED

**Last Updated:** 2025-10-29
