# Getting Started with Nurture

## Quick Start

### Prerequisites

- Node.js v20 or higher
- iOS: Xcode and CocoaPods (for iOS development)
- Android: Android Studio (for Android development)

### Installation

```bash
# Install dependencies
npm install

# Generate native code (required for Jazz)
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Project Structure

```
nurture/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout with Jazz provider
├── components/            # Reusable UI components
├── constants/             # App constants and theme
├── hooks/                 # Custom React hooks
├── jazz/                  # Jazz backend integration
│   ├── schema.ts         # Data models and types
│   └── provider.tsx      # Jazz configuration
├── docs/                  # Documentation
│   ├── CORE_TENETS.md    # App philosophy and principles
│   ├── JAZZ_INTEGRATION.md # Backend documentation
│   └── GETTING_STARTED.md  # This file
├── polyfills.js          # React Native polyfills for Jazz
├── metro.config.js       # Metro bundler config
└── tailwind.config.js    # Styling configuration
```

## Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router (file-based)
- **Backend**: Jazz (local-first sync database)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Language**: TypeScript

## Core Concepts

### Local-First Architecture

Nurture uses Jazz, a local-first database that:
- Stores all data on your device first
- Syncs automatically across devices when online
- Works fully offline
- Encrypts data end-to-end

### Data Models

Based on Nurture's core tenets, we track:

1. **Contacts** - People in your social circle
2. **Interactions** - Meaningful check-ins and connections
3. **Goals** - Relationship intentions (Planting, Tending, Pruning)
4. **Settings** - User preferences
5. **Insights** - Relationship analytics (opt-in)

### Privacy First

- All personal data encrypted on device
- Servers cannot read your data
- No data collection without explicit opt-in
- Subscription model (not ad-supported)

## Development

### Running the Development Server

```bash
npm start
```

This opens Expo Dev Tools where you can:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code for physical device (requires Expo Go or development build)

### Making Code Changes

1. Edit files in `app/`, `components/`, or `jazz/`
2. Save - Metro will hot reload automatically
3. For native changes, rebuild with `npx expo run:ios` or `npx expo run:android`

### Adding Dependencies

```bash
# For Expo-compatible packages
npx expo install package-name

# For other packages
npm install package-name
```

### Building for Production

```bash
# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Build both
eas build --platform all --profile production
```

## Key Files

### `app/_layout.tsx`

Root layout that:
- Imports global styles and polyfills
- Wraps app in JazzProvider for backend access
- Sets up navigation structure

### `jazz/schema.ts`

Defines data structure:
- Contact schema
- Interaction schema  
- Goal schema
- User profile schema

### `jazz/provider.tsx`

Configures Jazz:
- Connects to Jazz Cloud
- Sets up authentication
- Handles data migration

### `tailwind.config.js`

Theme configuration:
- Primary: green (growth)
- Secondary: steel
- Accents: purple, orange
- Dark mode by default

## Common Tasks

### Accessing User Data

```typescript
import { useAccount } from "jazz-tools/expo";

function MyComponent() {
  const { me } = useAccount();
  
  const contacts = me?.root?.contacts;
  const displayName = me?.root?.displayName;
  
  return <Text>{displayName}</Text>;
}
```

### Creating Data

```typescript
import { Contact } from "@/jazz/schema";
import { useAccount } from "jazz-tools/expo";

function AddContact() {
  const { me } = useAccount();
  
  const createContact = () => {
    const contact = Contact.create({
      name: "Jane Doe",
      createdAt: new Date().toISOString(),
    }, me);
    
    me?.root?.contacts?.push(contact);
  };
  
  return <Button onPress={createContact}>Add Contact</Button>;
}
```

### Updating Data

```typescript
// Direct mutation triggers automatic sync
contact.$jazz.set("notes", "Had a great chat!");
contact.$jazz.set("lastInteraction", new Date().toISOString());
```

## Troubleshooting

### Build Issues

**Problem**: "Cannot find module 'jazz-tools/expo'"
**Solution**: Run `npm install` and `npx expo prebuild`

**Problem**: Metro bundler errors
**Solution**: Clear cache with `npm start -- --clear`

**Problem**: iOS build fails
**Solution**: Run `cd ios && pod install && cd ..`

### Runtime Issues

**Problem**: Data not loading
**Solution**: Check network connection and verify Jazz Cloud is accessible

**Problem**: App crashes on startup
**Solution**: Check that polyfills are imported first in `app/_layout.tsx`

**Problem**: Type errors
**Solution**: Run `npx tsc --noEmit` to check TypeScript errors

## Next Steps

1. **Read the Core Tenets** (`docs/CORE_TENETS.md`) - Understand Nurture's philosophy
2. **Review Jazz Integration** (`docs/JAZZ_INTEGRATION.md`) - Deep dive into the backend
3. **Build Features** - Start with contact management
4. **Test on Device** - Use real devices for full biometric auth testing
5. **Deploy** - Use EAS Build for production releases

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Jazz Documentation](https://jazz.tools/docs/react-native-expo)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## Support

- **Jazz Discord**: https://discord.gg/utDMjHYg42
- **Expo Discord**: https://chat.expo.dev/

## Philosophy

Remember Nurture's mission:
> Reclaim the depth and authenticity of human connection in an age of digital superficiality.

Every feature should:
- Encourage face-to-face interactions
- Minimize screen time
- Support intentional relationship cultivation
- Respect user privacy
- Promote personal growth

Build thoughtfully. 🌱
