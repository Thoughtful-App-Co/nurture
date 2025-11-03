# DemoAuth Feature Flag - Quick Reference

## TL;DR

```bash
# .env file

# Normal development (data persists) - DEFAULT
EXPO_PUBLIC_USE_DEMO_AUTH=false

# Testing mode (data resets on every restart)
EXPO_PUBLIC_USE_DEMO_AUTH=true
```

**After changing `.env`, restart Metro:**
```bash
npm start --clear
```

## When to Use Each Mode

### Use `false` (Default) When:
- ✅ Building features normally
- ✅ Testing multi-session workflows
- ✅ You want data to persist
- ✅ Production-like development

### Use `true` When:
- 🧪 Testing onboarding flow repeatedly
- 🧪 Testing data mining with different contacts
- 🧪 Simulating first-time user experience
- 🧪 QA testing fresh installs

## How to Toggle

### Enable DemoAuth (Testing Mode)
```bash
# 1. Edit .env
echo "EXPO_PUBLIC_USE_DEMO_AUTH=true" > .env

# 2. Restart Metro (REQUIRED)
npm start --clear

# 3. You'll see warnings in console:
# ⚠️ DEMO AUTH ENABLED - Data will reset on app restart!
```

### Disable DemoAuth (Normal Mode)
```bash
# 1. Edit .env
echo "EXPO_PUBLIC_USE_DEMO_AUTH=false" > .env

# 2. Restart Metro (REQUIRED)
npm start --clear

# 3. Data will now persist between restarts
```

## What You'll See

### With DemoAuth Enabled (`true`)
```
Console output:
⚠️ DEMO AUTH ENABLED - Data will reset on app restart!
⚠️ Set EXPO_PUBLIC_USE_DEMO_AUTH=false in .env to disable

Every app restart:
- Shows onboarding flow
- Creates new account
- Previous data is lost
```

### With DemoAuth Disabled (`false`)
```
Console output:
(No warnings)

Every app restart:
- Loads existing account
- Shows dashboard directly
- All data persists
```

## Common Issues

### Changes Not Taking Effect?
```bash
# Must restart Metro bundler!
# Stop current process (Ctrl+C)
npm start --clear
```

### Still Showing Onboarding with DemoAuth Disabled?
```bash
# First time? Complete onboarding once, then:
# Close and reopen app - should go to dashboard
```

### Data Still Resetting?
```bash
# Check .env file
cat .env | grep DEMO_AUTH

# Should show:
# EXPO_PUBLIC_USE_DEMO_AUTH=false

# If not, fix it and restart Metro
```

## Files Modified

- ✅ `.env` - Feature flag configuration
- ✅ `config/featureFlags.ts` - Feature flag definition
- ✅ `app/index.tsx` - Conditional DemoAuth usage
- ✅ `.env.example` - Documentation for other devs

## More Info

See full documentation: `docs/features/DEMO_AUTH_FEATURE_FLAG.md`
