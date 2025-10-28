# Authentication Implementation

## Overview

Nurture uses Jazz's built-in authentication system with **DemoAuth** as the MVP authentication method. This provides a frictionless user experience for our local-first app, allowing users to start immediately without signup friction.

### Why DemoAuth for MVP?

1. **Zero Friction**: Users can start using the app immediately
2. **Local-First**: Creates a real persistent account that syncs across Jazz
3. **Production Ready**: Despite the name, DemoAuth creates real accounts with proper encryption
4. **Simple**: No backend server, no third-party services, no complexity
5. **Upgradeable**: Can be upgraded to Better Auth or Clerk later when multi-device sync is critical

### Future Authentication Options

For multi-device support and social login, we'll upgrade to:
- **Better Auth**: Self-hosted, requires backend server + database
- **Clerk**: Third-party service with OAuth and social logins

**Note**: PasskeyAuth (biometric) is only available for web browsers, not React Native/Expo.

## Current Implementation

### Flow

1. **App Launch** → Check if user is authenticated
2. **Not Authenticated** → Show `AuthScreen` with name input
3. **User Signs Up** → Creates Jazz account with name
4. **Authenticated** → Show Welcome Home screen with user's name

### Components

#### AuthScreen (`components/auth/auth-screen.tsx`)

Handles user signup with first and last name:
- Simple two-field form (First Name, Last Name)
- Stark, lo-fi design matching Nurture aesthetic
- Uses `useDemoAuth()` hook from Jazz
- Calls `signUp(fullName)` on submit

#### Welcome Home (`app/index.tsx`)

Main entry point that:
- Checks authentication status with `useAccount()`
- Shows loading spinner while checking
- Renders `AuthScreen` if not authenticated
- Renders welcome message with user's name if authenticated

### Jazz Provider (`jazz/provider.tsx`)

Configured with:
- `NurtureAccount` schema (root + profile)
- Jazz Cloud sync
- Migration to initialize user data on first login

## Data Flow

```
User enters name → DemoAuth.signUp(name)
                 ↓
          Jazz creates account
                 ↓
         Migration runs
                 ↓
    Initializes root with:
      - displayName
      - empty contacts/interactions/goals
      - default settings
                 ↓
      User sees welcome screen
```

## Account Schema

```typescript
NurtureAccount = co.account({
  root: UserProfile,    // Private user data
  profile: co.profile() // Public profile
})
```

### Root (Private)

```typescript
{
  displayName: string,
  email?: string,
  contacts: ContactList,
  interactions: InteractionList,
  goals: GoalList,
  settings: UserSettings,
  createdAt: string,
  lastActive: string
}
```

### Profile (Public)

```typescript
{
  name: string,
  inbox?: string,
  inboxInvite?: string
}
```

## Migration Logic

On account creation:

1. **Initialize Root**
   - Set displayName from signup
   - Create empty lists for contacts, interactions, goals
   - Set default settings (dark mode, notifications, etc.)
   - Record timestamps

2. **Initialize Profile**
   - Create public Group
   - Set profile name
   - Make group publicly readable

## Authentication States

The app handles three states:

### 1. Loading (`me === undefined`)
```tsx
<ActivityIndicator size="large" color="#22c55e" />
```

### 2. Not Authenticated (`!me`)
```tsx
<AuthScreen />
```

### 3. Authenticated (`me`)
```tsx
<WelcomeHome firstName={...} lastName={...} />
```

## Accessing User Data

```typescript
const { me } = useAccount();

// Get display name
const root = me.root as any;
const displayName = root?.displayName;

// Parse first/last name
const nameParts = displayName.split(" ");
const firstName = nameParts[0];
const lastName = nameParts.slice(1).join(" ");
```

## Production Upgrade Path

### Option 1: Better Auth (Self-Hosted)

When you need multi-device sync and more auth options:

1. **Set up backend server** with Better Auth
2. **Install dependencies**: `npm install better-auth jazz-tools`
3. **Configure database** (PostgreSQL, MySQL, etc.)
4. **Add Jazz plugin** to Better Auth server
5. **Update client** to use Better Auth React Native client

**Pros**: Full control, self-hosted, supports many auth methods
**Cons**: Requires backend infrastructure

### Option 2: Clerk (Third-Party Service)

For fastest production auth with social logins:

1. **Sign up for Clerk** at clerk.com
2. **Install**: `npm install @clerk/clerk-expo`
3. **Configure Jazz** to use Clerk auth
4. **Add social providers** (Google, Apple, etc.)

**Pros**: Fastest to implement, managed service, great UX
**Cons**: Third-party dependency, costs at scale

### When to Upgrade

Stay with DemoAuth until you need:
- ✅ Multi-device account sync (same user, multiple phones)
- ✅ Social login (Sign in with Google/Apple)
- ✅ Password recovery flows
- ✅ Enterprise SSO integration

**Note**: For single-device MVP, DemoAuth is perfect!

## Design Principles

### Visual Design
- Dark mode by default
- Green primary (#22c55e)
- Steel secondary (#64748b)
- Stark, paper-like, pixelated aesthetic
- No rounded corners (`rounded-none`)

### Copy Tone
- Transparent and calm
- Garden/growth metaphors
- "Cultivate" over "manage"
- "Nurture" over "optimize"

### Privacy
- Data encrypted on device
- Clear explanation of what's analyzed
- No data sharing without explicit opt-in

## Testing the Authentication Flow

### MVP Test Flow (Login → Home)

1. **Launch app** (first time, no account)
   - ✅ See loading spinner briefly
   - ✅ Auth screen appears

2. **Sign up**
   - Enter first name: "Jane"
   - Enter last name: "Doe"
   - Tap "BEGIN CULTIVATING"
   - ✅ See "SETTING UP..." state

3. **Account created**
   - ✅ Jazz migration runs
   - ✅ Welcome screen shows "Welcome Jane Doe"
   - ✅ See next steps placeholder

4. **Persistence test**
   - Close and reopen app
   - ✅ Still logged in
   - ✅ Name persists

### Running the Test

```bash
# Start the development server
npm start

# Then press:
# - 'i' for iOS simulator
# - 'a' for Android emulator
# - Scan QR code for physical device
```

### Reset Account for Testing

```bash
# iOS Simulator
xcrun simctl erase all

# Android Emulator
adb shell pm clear com.thoughtfulappco.nurture

# Physical Device
# Uninstall and reinstall the app
```

### Expected Behavior

✅ **First Launch**: Auth screen → Enter name → Home screen
✅ **Subsequent Launches**: Direct to home screen (persisted login)
✅ **Offline**: Works completely offline after first setup
✅ **Data Sync**: Syncs to Jazz Cloud when online

## Next Steps

1. **Data Mining Onboarding** (STORY-006)
   - Request permissions after signup
   - Import contacts, call logs, SMS
   - Show progress during mining

2. **Layer Discovery** (STORY-007)
   - Calculate Dunbar layers from data
   - Present results to user
   - Show behavioral insights

3. **Family Registration** (STORY-008)
   - Opt-in family structure definition
   - Swipe interface for categorization
   - Show behavioral reality vs family structure

## Security Considerations

### Current (DemoAuth)
- ⚠️ Development only
- Not secure for production
- Easy account switching for testing

### Production (PasskeyAuth)
- ✅ Secure key storage
- ✅ Biometric authentication
- ✅ No password vulnerabilities
- ✅ Device-specific keys
- ✅ Phishing resistant

## Troubleshooting

**Issue**: "Cannot read property 'displayName'"  
**Solution**: Check that migration ran. Verify root is initialized with CoValues.

**Issue**: Auth screen doesn't show  
**Solution**: Check `me` state. Ensure JazzProvider wraps app in `_layout.tsx`.

**Issue**: Name not showing on welcome screen  
**Solution**: Verify displayName is set in root during migration. Check Jazz migration logic.

**Issue**: App stuck on loading spinner  
**Solution**: Check network connection. Verify Jazz Cloud is accessible at wss://cloud.jazz.tools

**Issue**: "Cannot create X" error during migration  
**Solution**: Ensure all CoValue types (ContactList, InteractionList, etc.) are properly imported in provider.tsx

**Issue**: Account not persisting between sessions  
**Solution**: Check Expo SecureStore permissions. Verify polyfills are loaded first in `_layout.tsx`.

## Testing Backend (Jazz Cloud)

Even though Nurture is local-first, Jazz provides sync infrastructure:

### 1. Check Sync Status

Visit the [Jazz Dashboard](https://dashboard.jazz.tools) to:
- View active users
- Monitor sync status
- Check storage usage
- See API key limits

### 2. Test Multi-Device Sync (Future)

Once you have multiple devices:
1. Create account on Device A → enters name "Jane Doe"
2. Log in on Device B → uses same username
3. Data syncs automatically via Jazz Cloud
4. Both devices stay in sync in real-time

### 3. Test Offline Mode

1. Enable airplane mode on device
2. App continues to work with local data
3. Make changes (add contacts, log interactions)
4. Disable airplane mode
5. Changes sync automatically to Jazz Cloud

### Current MVP Reality

For our MVP with DemoAuth:
- ✅ Single device works perfectly
- ✅ Data persists locally
- ✅ Syncs to Jazz Cloud
- ⚠️ Multiple devices need same username (not ideal)
- ⚠️ No password = anyone with username can access

**This is fine for MVP!** We'll upgrade to Better Auth when we need proper multi-device support.
