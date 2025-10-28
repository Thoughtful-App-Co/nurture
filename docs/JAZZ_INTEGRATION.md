# Jazz Integration Documentation

## Overview

Nurture uses **Jazz** as its backend and authentication system. Jazz is a distributed database that syncs across devices with built-in auth, offline support, end-to-end encryption, and real-time multiplayer capabilities.

### Why Jazz for Nurture?

Jazz aligns perfectly with Nurture's core tenets:

1. **Privacy by Design**: All data is encrypted and signed on your device, invisible to servers
2. **Digital Minimalism**: Local-first architecture means the app works offline and minimizes server dependencies
3. **Device Sync**: Your data syncs seamlessly across all your devices
4. **No Traditional Backend**: No need to build and maintain API endpoints, databases, or authentication servers

## Architecture

### Local-First Sync

Jazz operates on a local-first principle:
- Data lives on your device first
- Changes sync automatically when online
- Works fully offline
- Instant UI updates (no loading spinners for data you already have)

### Data Flow

```
User Device <-> Jazz Cloud (wss://cloud.jazz.tools) <-> Other Devices
     ↓
  Local SQLite
  (Encrypted)
```

## Configuration Files

### 1. Schema Definition (`jazz/schema.ts`)

Defines the structure of all data in Nurture:

```typescript
// Core data models
- Contact: People in your social circle
- Interaction: Check-ins and interactions with contacts
- RelationshipGoal: Intentions for relationship growth
- UserProfile: Main user data container
- UserSettings: App preferences
- RelationshipInsights: Analytics and metrics
```

**Key Features:**
- Type-safe data structures using Zod schemas
- CoValues (Collaborative Values) that sync automatically
- Structured around Nurture's core concepts: Planting, Tending, Pruning

### 2. Provider Setup (`jazz/provider.tsx`)

Configures Jazz for Expo with:
- Connection to Jazz Cloud sync infrastructure
- Account schema with root (private) and profile (public) data
- Migration logic to initialize user data on first use

**API Key Location:** Embedded in `JAZZ_PEER_URL`
- Key format: `wss://cloud.jazz.tools/?key=<YOUR_KEY>`
- Current tier: Free (supports up to 100 monthly active users)

### 3. Polyfills (`polyfills.js`)

Required polyfills for React Native compatibility:
- ReadableStream
- Async Iterator
- Text Decoder
- Random Values
- URL

## Data Models

### UserProfile (Root - Private)

The root of all user data, completely private:

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

### Contact

```typescript
{
  name: string,
  notes?: string,
  tags?: string[],
  createdAt: string,
  lastInteraction?: string
}
```

### Interaction

Tracks meaningful connections:

```typescript
{
  contactId: string,
  date: string,
  type: "face-to-face" | "call" | "text" | "video" | "email" | "other",
  duration?: number, // minutes
  quality?: 1-5,
  notes?: string,
  location?: string
}
```

### RelationshipGoal

Based on Nurture's focus areas:

```typescript
{
  title: string,
  description?: string,
  category: "planting" | "tending" | "pruning" | "time-management",
  status: "active" | "completed" | "archived",
  createdAt: string,
  targetDate?: string,
  relatedContacts?: string[],
  progress: number (0-100)
}
```

## Using Jazz in Components

### Import Hooks

```typescript
import { useAccount, useCoState } from "jazz-tools/expo";
```

### Access Current User

```typescript
const { me } = useAccount();

// Access user data
const displayName = me?.root?.displayName;
const contacts = me?.root?.contacts;
```

### Create Data

```typescript
import { Contact } from "@/jazz/schema";

// Add a new contact
const newContact = Contact.create({
  name: "Jane Doe",
  createdAt: new Date().toISOString(),
}, me); // 'me' is the owner (from useAccount)

me?.root?.contacts?.push(newContact);
```

### Update Data

```typescript
// Direct mutation triggers sync
if (contact) {
  contact.$jazz.set("notes", "Had a great conversation today");
  contact.$jazz.set("lastInteraction", new Date().toISOString());
}
```

### Query Data

```typescript
// CoValues are reactive - component re-renders on changes
const contacts = me?.root?.contacts;

// Map over contacts
contacts?.map(contact => (
  <Text key={contact.id}>{contact.name}</Text>
))
```

## Authentication

Currently configured with **PasskeyAuth** (Touch ID / Face ID):

- Biometric authentication on device
- Secure key storage using Expo SecureStore
- No passwords to remember
- Keys never leave the device

### Future Auth Options

Jazz supports multiple auth providers:
- **Clerk**: OAuth, social logins
- **Better Auth**: Custom authentication
- **Passphrase**: Password-based auth

## Privacy & Encryption

### What Gets Encrypted?

- **All user data** in `root` (contacts, interactions, goals, settings)
- Encrypted on device before sync
- Servers cannot read the data

### What's Public?

- **Profile data** (basic info like display name)
- Set to public by default for discoverability
- Controlled via Group permissions

### Opt-in Data Sharing

Per Nurture's core tenet on privacy:
- Users have full privacy by default
- Can opt-in to share anonymized insights for subscription discounts
- Implemented through separate data structures

## Offline Support

Jazz works fully offline:

1. **All data cached locally** in SQLite
2. **Mutations queued** when offline
3. **Automatic sync** when connection restored
4. **Conflict resolution** handled automatically

## File Storage

Jazz supports file uploads:

```typescript
import { co } from "jazz-tools";

// Upload an image
const imageFile = co.fileStream().createFromBlob(blob);
```

Useful for future features:
- Profile pictures
- Shared photos from interactions
- Document attachments

## Performance Considerations

### Deep Loading

Jazz uses subscription-based loading. Specify what to load:

```typescript
const { me } = useAccount({
  resolve: {
    root: {
      contacts: true,
      interactions: { contactId: true },
    }
  }
});
```

### Lazy Loading

Don't load everything at once:

```typescript
// Load contacts on demand
const contact = useCoState(Contact, contactId);
```

## Sync Infrastructure

### Jazz Cloud

- **Endpoint**: `wss://cloud.jazz.tools`
- **Region**: Auto-routed to nearest edge location
- **Latency**: <5ms to <100ms depending on location
- **Reliability**: Built-in smart caching and optimal routing

### Monitoring

Access Jazz Dashboard at: https://dashboard.jazz.tools
- View sync status
- Monitor storage usage
- Track active users
- Manage API keys

## Development Workflow

### 1. Run Development Build

```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

### 2. View Data

Use Jazz Inspector (development tool) to view synced data in real-time.

### 3. Clear Local Data

```bash
# iOS
xcrun simctl --set ~/Library/Developer/CoreSimulator/Devices delete unavailable

# Android
adb shell pm clear com.yourapp
```

## Schema Migrations

When adding new fields to schemas:

```typescript
export const NurtureAccount = co.account({
  root: UserProfile,
  profile: co.profile(),
}).withMigration(async (account, creationProps) => {
  // Check if field exists
  const { root } = await account.$jazz.ensureLoaded({
    resolve: { root: true }
  });

  // Add new field if missing
  if (!root.$jazz.has('newField')) {
    root.$jazz.set('newField', defaultValue);
  }
});
```

## Troubleshooting

### Build Errors

**"Cannot find module 'jazz-tools/expo'"**
- Ensure all dependencies installed: `npm install`
- Run `npx expo prebuild` to generate native code

**Polyfill errors**
- Check `polyfills.js` is imported first in `app/_layout.tsx`
- Verify all polyfill packages are installed

### Runtime Errors

**"Failed to connect to sync server"**
- Check internet connection
- Verify API key is correct
- Check Jazz Cloud status

**"Cannot read property of undefined"**
- Data may not be loaded yet
- Use optional chaining: `me?.root?.contacts`
- Use loading states

### Data Issues

**Data not syncing**
- Check network connection
- Verify you're mutating CoValues correctly
- Check Jazz Dashboard for errors

**Can't access other user's data**
- Verify sharing/permissions are set up correctly
- Check Group membership

## Next Steps

1. **Implement Authentication UI**: Create login/signup screens using Jazz auth hooks
2. **Build Contact Management**: CRUD operations for contacts
3. **Interaction Tracking**: Log and view interactions
4. **Goal Setting**: Implement planting/tending/pruning workflows
5. **Analytics**: Build relationship insights dashboard
6. **Sharing**: Enable sharing data with accountability partners

## Resources

- [Jazz Documentation](https://jazz.tools/docs/react-native-expo)
- [Jazz Discord Community](https://discord.gg/utDMjHYg42)
- [Jazz Examples](https://jazz.tools/examples)
- [Jazz GitHub](https://github.com/garden-co/jazz)

## Cost Considerations

### Current Plan: Free Tier

- 100 monthly active users
- 10 GB storage
- 2 GB egress/mo

### Scaling

When you exceed free tier:

**Indie Tier ($4/month)**
- 10,000 monthly active users
- 100 GB storage + $0.02/GB
- 20 GB egress + $0.10/GB

**Pro Tier (from $199/month)**
- Custom limits
- SLAs and certifications
- Dedicated support
- On-premise options

Per Nurture's subscription model, users cover infrastructure costs, maintaining full privacy and data ownership.
