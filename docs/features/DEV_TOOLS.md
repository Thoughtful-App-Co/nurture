# Dev Tools & Feature Flags

## Overview

Nurture includes a comprehensive dev tools system that provides debugging capabilities, diagnostics, and feature toggles during development. These tools are automatically disabled in production builds.

---

## Dev Tools Menu

### Access
In development builds (`__DEV__ === true`), a floating 🛠️ button appears in the bottom-right corner of the app. Tap it to open the dev tools menu.

### Features

#### 1. Diagnostics
- **Run Full Diagnostics** - Comprehensive check of:
  - Platform detection (Android/iOS)
  - Build type (Expo Go vs Development Client)
  - Native module status (call-log, SMS)
  - Permission status
  - Data mining capabilities
  - Actual data fetch test

- **Inspect Jazz Data** - View CoValue structures, sync status

#### 2. Quick Actions
- **Clear App Data** - Reset to fresh install state
- **View Logs** - Access detailed console output

#### 3. Feature Flags Status
Real-time view of all feature flags and their current state

#### 4. Build Info
- Build mode (Development/Production)
- Platform
- Build type (EAS/Local)

---

## Feature Flags

Located in: `config/featureFlags.ts`

### Dev-Only Flags (Auto-disabled in production)

| Flag | Default | Purpose |
|------|---------|---------|
| `SHOW_DEV_MENU` | `__DEV__` | Show floating dev tools button |
| `SHOW_DATA_MINING_DIAGNOSTICS` | `__DEV__` | Diagnostics button in data mining screen |
| `VERBOSE_DATA_MINING_LOGS` | `__DEV__` | Detailed data mining logs |
| `SHOW_NATIVE_MODULE_STATUS` | `__DEV__` | Display native module availability in UI |
| `ENABLE_DEBUG_LOGGING` | `__DEV__` | Verbose logging throughout app |
| `SHOW_JAZZ_INSPECTOR` | `__DEV__` | Jazz data structure inspector |
| `SHOW_STATE_DEBUG_PANEL` | `__DEV__` | App state debug panel |

### Production-Safe Flags (Can be toggled in production)

| Flag | Default | Purpose |
|------|---------|---------|
| `SHOW_DETAILED_METRICS` | `false` | Show detailed interaction metrics in contact cards |
| `ENABLE_MANUAL_LOGGING` | `true` | Allow manual interaction logging |
| `ENABLE_FAMILY_DETECTION` | `true` | Enable family relationship detection |

### Usage

```typescript
import { FeatureFlags, isFeatureEnabled } from '@/config/featureFlags';

// Check a flag
if (FeatureFlags.SHOW_DEV_MENU) {
  // Show dev tools
}

// Or use helper
if (isFeatureEnabled('ENABLE_DEBUG_LOGGING')) {
  console.log('Debug info...');
}
```

---

## Diagnostics System

### Running Diagnostics

**From Dev Tools Menu:**
1. Tap 🛠️ button
2. Tap "Run Full Diagnostics"
3. Check console for detailed output

**Programmatically:**
```typescript
import { runDiagnostics } from '@/scripts/diagnose-data-mining';

await runDiagnostics();
```

### What Diagnostics Check

1. **Platform Detection**
   - Android vs iOS
   - Platform-specific capabilities

2. **Build Type Detection**
   - Expo Go (no native modules)
   - Development Client (EAS or local build)
   - Production build

3. **Native Modules**
   - `react-native-call-log` availability
   - `react-native-get-sms-android` availability
   - Module linking status

4. **Permissions**
   - READ_CONTACTS
   - READ_CALL_LOG
   - READ_SMS

5. **Data Fetching**
   - Actual call log fetch (10 recent calls)
   - Actual SMS fetch (10 recent messages)
   - Data structure validation

### Understanding Diagnostic Output

**✅ SUCCESS (EAS Build or Local Build):**
```
1. Platform: android
   ✅ Android detected

2. Build Type: Development Client
   ✅ Running in development/production client (native modules available)

3. Checking native modules...
   ✅ react-native-call-log: LOADED
   ✅ react-native-get-sms-android: LOADED

4. Checking permissions...
   Call Log: ✅ GRANTED
   SMS: ✅ GRANTED
   Contacts: ✅ GRANTED

5. Testing data fetch...
   ✅ Call logs fetched: 150 entries
   ✅ SMS fetched: 2500 entries
```

**❌ FAIL (Expo Go):**
```
1. Platform: android
   ✅ Android detected

2. Build Type: Expo Go
   ❌ CRITICAL: You are running in Expo Go!
   
   SOLUTION - Build with native modules:
   • EAS Build: eas build --profile development --platform android
   • Local Build: npx expo run:android
```

**⚠️ PARTIAL (Permissions Issue):**
```
3. Checking native modules...
   ✅ react-native-call-log: LOADED
   ✅ react-native-get-sms-android: LOADED

4. Checking permissions...
   Call Log: ❌ DENIED
   SMS: ❌ DENIED
   
   ⚠️ MISSING PERMISSIONS
   Go to: Settings > Apps > Nurture > Permissions
   Enable: Call logs, SMS, Contacts
```

---

## Native Module Warnings - EXPLAINED

### The Confusion

You may see warnings like:
```
⚠️ react-native-call-log not available in current build
```

**This is often a FALSE WARNING when:**
- You built with EAS (`eas build --profile development`)
- You installed the APK on your device
- You're connecting to dev server with the installed app

### Why It Happens

The warning checks if modules are available in the **dev environment**, not in the **installed APK**. When you build with EAS, native modules ARE compiled into the APK, even if the warning appears.

### How to Verify Native Modules Work

1. **Run diagnostics in the installed app** (not during build)
2. **Check permissions** - most "module not found" errors are actually permission issues
3. **Look for actual data** - if you see call logs/SMS in the app, modules are working!

### When the Warning is REAL

The warning is accurate when:
- Running in Expo Go (no native modules possible)
- Haven't built with native support yet
- Local build without proper SDK setup

---

## Adding New Dev Tools

### 1. Add Feature Flag

```typescript
// config/featureFlags.ts
export const FeatureFlags = {
  // ... existing flags
  SHOW_MY_NEW_TOOL: __DEV__,
} as const;
```

### 2. Add to Dev Tools Menu

```typescript
// components/dev/DevToolsMenu.tsx
<TouchableOpacity
  onPress={handleMyNewTool}
  className="bg-purple-600 rounded-xl p-4 mb-3"
>
  <Text className="text-white font-semibold">🔧 My New Tool</Text>
  <Text className="text-purple-200 text-xs mt-1">
    Description of what it does
  </Text>
</TouchableOpacity>
```

### 3. Implement Handler

```typescript
const handleMyNewTool = () => {
  if (!FeatureFlags.SHOW_MY_NEW_TOOL) return;
  
  // Your dev tool logic
  console.log('🔧 Running my new tool...');
};
```

---

## Best Practices

1. **Always use `__DEV__`** for dev-only features to ensure they're stripped in production
2. **Log to console** - Dev tools should output detailed info to console
3. **Non-intrusive** - Dev tools shouldn't interfere with normal app flow
4. **Easy to disable** - Single flag should disable entire dev tool
5. **Document new tools** - Update this file when adding new dev features

---

## Troubleshooting

### Dev Menu Not Showing
- Check: `__DEV__ === true`
- Verify: `SHOW_DEV_MENU` flag is enabled
- Rebuild: Native changes require rebuild

### Diagnostics Not Running
- Check console for errors
- Verify: Platform is Android
- Check: Permissions in app settings

### False "Module Not Found" Warnings
- **Solution:** Ignore if you've built with EAS
- Verify: Run diagnostics in installed app
- Check: Actual data appears in app
- Confirm: Permissions are granted

---

## Files

- `config/featureFlags.ts` - Feature flag configuration
- `components/dev/DevToolsMenu.tsx` - Dev tools UI
- `scripts/diagnose-data-mining.ts` - Diagnostic script
- `docs/features/DEV_TOOLS.md` - This documentation
