# Authentication Implementation

## Overview

Nurture uses Jazz's **PassphraseAuth** for local-first, device-encrypted authentication. This provides maximum privacy and security while maintaining a simple user experience.

### Why PassphraseAuth?

1. **True Local-First**: All data encrypted on-device with your passphrase
2. **Zero Third-Party Dependencies**: No Clerk, no Better Auth, no external services
3. **Maximum Privacy**: Your passphrase never leaves your device
4. **Multi-Device Support**: Use the same passphrase to access your account on other devices
5. **Production Ready**: Jazz handles all the cryptography securely

## Authentication Flow

### New User Signup

1. **Welcome Screen** → User sees brand introduction
2. **Name Collection** → First and last name
3. **Contacts Permission** → Optional request for contact access
4. **Passphrase Generation** → Jazz automatically generates a secure passphrase
5. **Account Creation** → User saves passphrase and account is created

### Returning User Login

Users can log in on other devices by entering their passphrase.

## Implementation

### Components

#### OnboardingFlow (`components/auth/onboarding-flow.tsx`)

Handles the complete signup flow:
- Uses `usePassphraseAuth({ wordlist })` hook from Jazz
- Calls `auth.signUp(fullName)` to create account
- Returns auto-generated passphrase to user
- User must save the passphrase for multi-device access

#### Main App (`app/index.tsx`)

Entry point that:
- Uses `useAccount()` to check authentication status
- Shows `OnboardingFlow` if not authenticated
- Shows home screen if authenticated

### Jazz Provider (`jazz/provider.tsx`)

Configured with:
- `JazzExpoProvider` for React Native
- `NurtureAccount` schema (root + profile)
- Jazz Cloud sync for multi-device support
- No auth provider needed (handled by hooks in components)

## Data Flow

```
User enters name → auth.signUp(name)
                 ↓
          Jazz generates passphrase
                 ↓
        Passphrase shown to user
                 ↓
       User must save passphrase
                 ↓
     Jazz creates encrypted account
                 ↓
          Migration runs
                 ↓
   Initializes root with user data
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

### Root (Private, Encrypted)

```typescript
{
  displayName: string,
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
  name: string
}
```

## Security Model

### Passphrase

- **Auto-generated** by Jazz using BIP39 wordlist
- **Never transmitted** over the network
- **Used to encrypt** all local data
- **Required for multi-device access**

### Encryption

- All data encrypted on-device before sync
- Only devices with the passphrase can decrypt
- Jazz uses industry-standard cryptography
- No plaintext data ever leaves the device

### Storage

- **Local-first**: All data stored on device
- **Encrypted at rest**: Using passphrase-derived keys
- **Secure sync**: Only encrypted data syncs via Jazz Cloud
- **No server access**: Jazz Cloud cannot decrypt your data

## Multi-Device Workflow

### Setup on First Device

1. Complete onboarding → Get passphrase
2. **IMPORTANT**: Save passphrase somewhere secure
3. Account created and syncing to Jazz Cloud (encrypted)

### Setup on Second Device

1. Open app → See login screen (future implementation)
2. Enter saved passphrase
3. Jazz downloads encrypted data from Jazz Cloud
4. Data decrypted locally with passphrase
5. Full account access on new device

## Authentication States

The app handles three states:

### 1. Loading (`me === undefined`)
```tsx
<ActivityIndicator size="large" color="#22c55e" />
```

### 2. Not Authenticated (`!me`)
```tsx
<OnboardingFlow />
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

## Why Not Clerk / Better Auth / DemoAuth?

### ❌ Clerk
- **Third-party dependency** - Violates local-first principle
- **Data passes through their servers** - Privacy concern
- **Costs at scale** - Unnecessary expense
- **Overcomplicated** - Too many features we don't need

### ❌ Better Auth
- **Requires backend server** - Defeats local-first architecture
- **Database dependency** - More infrastructure to maintain
- **Overcomplicated** - We don't need traditional auth flows

### ❌ DemoAuth
- **Development only** - Not secure for production
- **No real encryption** - Anyone can access any account
- **Username-based** - No multi-device support

### ✅ PassphraseAuth
- **Perfect for local-first** - Data stays on device
- **No infrastructure** - Just Jazz Cloud for sync
- **Maximum privacy** - Zero third-party access
- **Production ready** - Secure cryptography
- **Simple UX** - One passphrase, done

## Design Principles

### Visual Design
- Dark mode by default
- Green primary (#22c55e)
- Steel secondary (#64748b)
- Stark, paper-like aesthetic
- No rounded corners (`rounded-none`)

### Copy Tone
- Transparent about encryption
- Clear warnings about saving passphrase
- Garden/growth metaphors
- "Cultivate" over "manage"

### Privacy
- Passphrase generation explained
- Clear warnings about passphrase loss
- No recovery option (by design)
- Explicit about what stays local

## Testing the Authentication Flow

### First Time User

1. **Launch app** → See welcome screen
2. **Tap "BEGIN YOUR JOURNEY"** → Enter name
3. **Grant contacts permission** (optional)
4. **Tap "COMPLETE SETUP"** → Jazz creates account
5. **Alert shows passphrase** → User MUST save it
6. **Logged in** → See welcome screen

### Multi-Device (Future)

1. **Open app on new device** → See login screen
2. **Enter passphrase** → Jazz syncs encrypted data
3. **Logged in** → All data available

## Reset Account for Testing

```bash
# iOS Simulator
xcrun simctl erase all

# Android Emulator
adb shell pm clear com.thoughtfulappco.nurture

# Physical Device
# Uninstall and reinstall the app
```

## Expected Behavior

✅ **First Launch**: Welcome → Name → Passphrase → Home
✅ **Subsequent Launches**: Direct to home (passphrase stored securely)
✅ **Offline**: Works completely offline after first setup
✅ **Data Sync**: Encrypted data syncs via Jazz Cloud when online
✅ **Multi-Device**: Same passphrase works on all devices

## Security Considerations

### Passphrase Storage

- **On first device**: Stored securely in device keychain
- **On other devices**: User must enter manually
- **Never transmitted**: Stays on your devices only
- **Cannot be recovered**: If lost, account is lost (by design)

### Data Protection

- ✅ End-to-end encryption
- ✅ Local-first storage
- ✅ No plaintext transmission
- ✅ Device keychain protection
- ✅ Zero knowledge architecture

### Threat Model

**Protected Against:**
- Network eavesdropping
- Server compromise
- Third-party access
- Unauthorized device access

**Not Protected Against:**
- Device compromise with root access
- User sharing passphrase
- Physical device theft (if unlocked)

## Future Enhancements

### Login Screen (Not Yet Implemented)

For users who want to log in on a new device:

```tsx
const auth = usePassphraseAuth({ wordlist });
await auth.logIn(userEnteredPassphrase);
```

### Biometric Unlock (Future)

Could add biometric authentication for convenience:
- Passphrase still used for encryption
- Biometrics just unlock access to passphrase
- No reduction in security

## Troubleshooting

**Issue**: "Cannot read property 'displayName'"  
**Solution**: Check that migration ran. Verify root is initialized.

**Issue**: Passphrase not working on second device  
**Solution**: Ensure exact passphrase (case-sensitive, exact spacing).

**Issue**: Account lost passphrase  
**Solution**: No recovery possible (by design). Create new account.

**Issue**: App stuck on loading  
**Solution**: Check Jazz Cloud connection at wss://cloud.jazz.tools

## Next Steps

1. ✅ Authentication implemented with PassphraseAuth
2. **Implement login screen** for existing users
3. **Data mining** (STORY-006) - Import contacts after signup
4. **Layer discovery** (STORY-007) - Calculate Dunbar layers
5. **Family registration** (STORY-008) - Define family structure
