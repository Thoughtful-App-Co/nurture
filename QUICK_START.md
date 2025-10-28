# Quick Start Guide

## Run the App

```bash
# First time setup
npm install
npx expo prebuild

# Then run
npx expo run:ios
# or
npx expo run:android
```

## What You'll See

1. **Auth Screen** - Enter first and last name
2. **Welcome Screen** - Shows "Welcome {FirstName} {LastName}"

## Key Files

| File | Purpose |
|------|---------|
| `app/index.tsx` | Main entry (auth gate + home) |
| `components/auth/auth-screen.tsx` | Name signup form |
| `jazz/schema.ts` | Data models |
| `jazz/provider.tsx` | Backend config |

## Data Access

```typescript
import { useAccount } from "jazz-tools/expo";

const { me } = useAccount();
const root = me.root as any;

// User data
const name = root?.displayName;
const contacts = root?.contacts;
const interactions = root?.interactions;
const goals = root?.goals;
const settings = root?.settings;
```

## Creating Data

```typescript
import { Contact } from "@/jazz/schema";

// Create a contact
const contact = Contact.create({
  name: "Jane Doe",
  createdAt: new Date().toISOString(),
}, me);

// Add to list
me.root.contacts.push(contact);
```

## Styling

```tsx
// Use NativeWind (Tailwind classes)
<View className="flex-1 bg-black px-8">
  <Text className="text-primary text-4xl">
    Title
  </Text>
</View>
```

## Colors

- `text-primary` = green (#22c55e)
- `text-secondary` = steel (#64748b)
- `text-accent-purple` = purple (#a855f7)
- `text-accent-orange` = orange (#f97316)

## Next Steps

See [docs/PRD.md](docs/PRD.md) for feature roadmap.

Start with **STORY-001**: Contact Data Ingestion

## Help

- Full docs in `docs/` folder
- Jazz docs: https://jazz.tools/docs/react-native-expo
- Expo docs: https://docs.expo.dev
