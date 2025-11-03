# DemoAuth Feature Flag

## Overview

A feature flag to toggle between **Anonymous Authentication** (production) and **DemoAuth** (testing) modes.

## Configuration

### Enable DemoAuth

Edit `.env`:

```bash
# WARNING: This will reset data on every app restart!
EXPO_PUBLIC_USE_DEMO_AUTH=true
```

### Disable DemoAuth (Default - Recommended)

```bash
EXPO_PUBLIC_USE_DEMO_AUTH=false
```

## How It Works

### When EXPO_PUBLIC_USE_DEMO_AUTH=false (Default)

**Uses Anonymous Authentication:**
- ✅ Data persists between app restarts
- ✅ Same account every time you open the app
- ✅ Production-ready behavior
- ✅ Data syncs to Jazz Cloud
- ✅ Works offline with local storage

**Perfect for:**
- Normal development work
- Testing features that require persistent data
- Production-like testing
- Multi-session workflows

### When EXPO_PUBLIC_USE_DEMO_AUTH=true

**Uses DemoAuth:**
- ⚠️ Creates NEW account on every app restart
- ⚠️ All data is lost when you close the app
- ⚠️ Previous account is orphaned in Jazz Cloud
- ⚠️ Simulates brand new user every time

**Perfect for:**
- Testing onboarding flow repeatedly
- Testing data mining with different contact sets
- Simulating first-time user experience
- Debugging initial setup flows
- QA testing of fresh installs

## Visual Indicators

When DemoAuth is enabled in development mode, you'll see:

**Console Warnings:**
```
⚠️ DEMO AUTH ENABLED - Data will reset on app restart!
⚠️ Set EXPO_PUBLIC_USE_DEMO_AUTH=false in .env to disable
```

**Dev Menu Indicator:**
The DevToolsMenu will show a warning badge when DemoAuth is active.

## Code Implementation

### Feature Flag Definition

In `config/featureFlags.ts`:

```typescript
export const FeatureFlags = {
  /**
   * Use DemoAuth instead of Anonymous Authentication
   * Set in .env: EXPO_PUBLIC_USE_DEMO_AUTH=true
   */
  USE_DEMO_AUTH: process.env.EXPO_PUBLIC_USE_DEMO_AUTH === 'true',
  // ... other flags
}
```

### Usage in app/index.tsx

```typescript
import { useDemoAuth } from "jazz-tools/expo";
import { FeatureFlags } from "@/config/featureFlags";

export default function Index() {
  // Conditionally enable DemoAuth
  if (FeatureFlags.USE_DEMO_AUTH) {
    useDemoAuth();
    console.warn('⚠️ DEMO AUTH ENABLED - Data will reset on app restart!');
  }
  
  // Rest of component...
}
```

## Testing Scenarios

### Scenario 1: Testing Onboarding Flow

**Goal:** Test the onboarding experience multiple times without clearing app data

**Setup:**
1. Set `EXPO_PUBLIC_USE_DEMO_AUTH=true` in `.env`
2. Restart Metro bundler (`npm start`)
3. Launch app

**Expected Behavior:**
- Every app launch shows onboarding
- Can test different user inputs
- Can test permission flows
- No need to uninstall/reinstall app

**When Done:**
- Set `EXPO_PUBLIC_USE_DEMO_AUTH=false`
- Restart Metro bundler

### Scenario 2: Testing Data Mining with Different Contacts

**Goal:** Import different contact sets to test family detection, Dunbar layers, etc.

**Setup:**
1. Set `EXPO_PUBLIC_USE_DEMO_AUTH=true`
2. Modify device contacts
3. Restart app → Goes through data mining again

**Expected Behavior:**
- Each restart re-imports contacts
- Can test different family name configurations
- Can debug contact analysis logic

### Scenario 3: Production-Like Development (Default)

**Goal:** Normal development with persistent data

**Setup:**
1. Set `EXPO_PUBLIC_USE_DEMO_AUTH=false` (or omit entirely)
2. Complete onboarding once
3. Develop features normally

**Expected Behavior:**
- Data persists across restarts
- Same account every time
- Realistic user experience
- Test multi-session workflows

### Scenario 4: QA Testing Fresh Installs

**Goal:** Simulate fresh installs without uninstalling app

**Setup:**
1. Set `EXPO_PUBLIC_USE_DEMO_AUTH=true`
2. Document each restart as a "fresh install"

**Expected Behavior:**
- Each restart = new user simulation
- No data carryover
- Fast iteration on first-run experience

## Environment Variables

### Required

```bash
# In .env file
EXPO_PUBLIC_USE_DEMO_AUTH=false  # or true
```

### How Expo Handles Env Variables

Expo automatically:
1. Reads `.env` files
2. Exposes variables prefixed with `EXPO_PUBLIC_` to the client
3. Makes them available via `process.env.EXPO_PUBLIC_*`
4. Bundles them into the app during build

**Important:** Changes to `.env` require restarting Metro bundler:
```bash
# Stop Metro (Ctrl+C)
npm start
# Or
npx expo start --clear
```

## Troubleshooting

### Flag Not Working / Changes Not Applied

**Problem:** Changed `.env` but flag still uses old value

**Solution:**
```bash
# 1. Stop Metro bundler (Ctrl+C)
# 2. Clear Metro cache
npx expo start --clear

# 3. If still not working, restart dev server
npm start
```

### Data Still Persisting with DemoAuth Enabled

**Problem:** Set `EXPO_PUBLIC_USE_DEMO_AUTH=true` but data persists

**Checks:**
1. Did you restart Metro bundler?
2. Check console for warning messages
3. Verify `.env` syntax (no quotes around true/false)
4. Clear Metro cache: `npx expo start --clear`

**Verify in code:**
```typescript
// Add this to app/index.tsx temporarily
console.log('USE_DEMO_AUTH:', FeatureFlags.USE_DEMO_AUTH);
console.log('ENV VALUE:', process.env.EXPO_PUBLIC_USE_DEMO_AUTH);
```

### Data Resetting Unexpectedly

**Problem:** Data keeps resetting on app restart

**Solution:**
- Check `.env`: Should be `EXPO_PUBLIC_USE_DEMO_AUTH=false`
- Restart Metro bundler
- If still resetting, verify FeatureFlags.USE_DEMO_AUTH is false

## Best Practices

### ✅ Do:

- **Use DemoAuth for testing onboarding** - Perfect for iterating on first-run experience
- **Use DemoAuth for testing data mining** - Test different contact configurations
- **Document when DemoAuth is enabled** - Leave comment in code or Slack
- **Set back to false when done** - Avoid accidentally leaving it on
- **Commit `.env.example` with false** - Document the default

### ❌ Don't:

- **Don't use DemoAuth for feature development** - You'll lose data constantly
- **Don't commit `.env` with true** - Could confuse other developers
- **Don't leave DemoAuth enabled overnight** - You'll forget and lose progress
- **Don't test multi-session flows with DemoAuth** - Data doesn't persist

## Production Builds

**Important:** This flag only works in development mode.

In production builds:
- `.env` files are NOT included
- `EXPO_PUBLIC_USE_DEMO_AUTH` will be undefined
- Feature flag defaults to `false`
- Always uses Anonymous Authentication

This is a safety feature to prevent DemoAuth from ever running in production.

## Related Documentation

- [DemoAuth Removal](../implementation/DEMOAUTH_REMOVAL.md) - Why we removed DemoAuth by default
- [Authentication Architecture](../architecture/AUTHENTICATION.md) - Full auth system design
- [Jazz Authentication States](https://jazz.tools/docs/react/key-features/authentication/authentication-states) - Official Jazz docs
- [Feature Flags](../../config/featureFlags.ts) - All feature flags

## Quick Reference

| Scenario | Flag Value | Behavior |
|----------|-----------|----------|
| Normal Development | `false` or omitted | Data persists, same account |
| Testing Onboarding | `true` | Reset on every restart |
| Testing Data Mining | `true` | Re-import contacts each time |
| Production | N/A (always false) | Always uses Anonymous Auth |

## Example Workflow

```bash
# Day 1: Testing onboarding
echo "EXPO_PUBLIC_USE_DEMO_AUTH=true" >> .env
npm start --clear
# Test onboarding flow 10 times
# Each restart = fresh account

# Day 2: Building dashboard features
echo "EXPO_PUBLIC_USE_DEMO_AUTH=false" > .env
npm start --clear
# Complete onboarding once
# Build features with persistent data

# Day 3: Testing contact analysis
echo "EXPO_PUBLIC_USE_DEMO_AUTH=true" > .env
npm start --clear
# Change device contacts
# Restart app to re-analyze
```

## Summary

This feature flag gives you the best of both worlds:

- **Development:** Use persistent Anonymous Authentication for normal work
- **Testing:** Toggle to DemoAuth when you need fresh accounts for testing
- **Production:** Always uses Anonymous Authentication (secure & persistent)

Remember: **Default is `false` (Anonymous Auth) for a reason!** Only enable DemoAuth when you specifically need the reset-on-restart behavior for testing.

---

**Status:** ✅ Implemented  
**Author:** OpenCode  
**Date:** 2025-11-02  
**Last Updated:** 2025-11-02
