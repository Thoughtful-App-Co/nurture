# Nurture

> Reclaim the depth and authenticity of human connection in an age of digital superficiality.

Nurture is a relationship cultivation platform that helps you nurture meaningful connections through intentional care. We analyze your actual behavior to show you who you really interact with, then empower you to cultivate the relationships that matter most.

## Philosophy

We are the anti-social media platform. Where others optimize for engagement and screen time, we optimize for real-world connections and face-to-face interactions.

**Core Principle**: Show behavioral reality, enable intentional cultivation.

Learn more in [docs/CORE_TENETS.md](docs/CORE_TENETS.md)

## Quick Start

### 🚨 CRITICAL: You Need Real Data

Nurture analyzes your **actual behavior** - call logs, SMS history, interaction patterns. Without this data, you'll just see a list of names with random layers.

**"Behavioral reality, not wishful thinking"** - this requires native modules.

### Getting REAL Data (Android)

```bash
# 1. Install and verify setup
npm install
npm run verify

# 2. Build with native modules
npx expo prebuild --clean

# 3. Build and run
npx expo run:android

# 4. Grant ALL permissions when prompted
# ✅ Contacts
# ✅ Call logs
# ✅ SMS history
```

**Expected output in console:**
```
📊 DATA MINING RESULTS
Contacts: 234
Call logs: 547
SMS messages: 1,243
✅ SUCCESS: Got real interaction data!
```

**If you see "0 calls, 0 texts"** - you're not running natively. See [QUICK_START.md](QUICK_START.md).

### iOS Limitations

```bash
npm install
npx expo prebuild --clean
npx expo run:ios
```

**⚠️ iOS Restriction:** Apple doesn't allow third-party apps to access call logs or SMS history. You'll only get contact names.

**Solution:** Use the built-in manual logging to track WhatsApp, Instagram, video calls, and in-person meetings.

### Prerequisites

- Node.js v20+
- **Android**: Android Studio + physical device (emulators have no call/SMS history)
- **iOS**: Xcode (for testing only - limited data due to Apple restrictions)

## Tech Stack

- **Framework**: React Native (Expo)
- **Backend**: Jazz (local-first sync database)
- **Authentication**: Jazz DemoAuth (upgrading to PasskeyAuth)
- **Styling**: NativeWind (Tailwind CSS)
- **Language**: TypeScript

## Project Structure

```
nurture/
├── app/                    # Expo Router pages
│   ├── index.tsx          # Auth flow & welcome home
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable components
│   └── auth/             # Authentication screens
├── jazz/                  # Backend integration
│   ├── schema.ts         # Data models (Contacts, Interactions, Goals)
│   └── provider.tsx      # Jazz configuration
├── docs/                  # Documentation
│   ├── CORE_TENETS.md    # Philosophy and principles
│   ├── PRD.md            # Product requirements
│   ├── AUTHENTICATION.md # Auth implementation
│   ├── JAZZ_INTEGRATION.md # Backend docs
│   └── GETTING_STARTED.md  # Developer guide
└── polyfills.js          # React Native polyfills
```

## Documentation

- **[Core Tenets](docs/CORE_TENETS.md)** - Philosophy and design principles
- **[PRD](docs/PRD.md)** - Complete product requirements document
- **[Authentication](docs/AUTHENTICATION.md)** - Auth implementation guide
- **[Jazz Integration](docs/JAZZ_INTEGRATION.md)** - Backend architecture
- **[Getting Started](docs/GETTING_STARTED.md)** - Developer onboarding

## Features

### Current (MVP)

- ✅ User authentication with name signup
- ✅ Welcome screen with personalized greeting
- ✅ Jazz backend integration
- ✅ Local-first data sync
- ✅ Privacy-first architecture
- ✅ Dark mode UI with green/steel theme

### In Development

- 🔨 Contact data ingestion
- 🔨 Call & SMS log mining
- 🔨 Dunbar layer calculation
- 🔨 Layer discovery visualization
- 🔨 Family structure registration

### Planned

- 📋 Goal setting & tracking
- 📋 Cultivation nudges & reminders
- 📋 Relationship analytics
- 📋 Pruning recommendations

See [docs/PRD.md](docs/PRD.md) for full roadmap.

## Development

### Running the App

```bash
# Start development server
npm start

# Run on specific platform
npx expo run:ios
npx expo run:android
```

### Key Commands

```bash
# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Architecture

Nurture uses **Jazz**, a local-first sync database:

- Data stored on device first
- Automatic sync across devices
- Works fully offline
- End-to-end encrypted
- No traditional backend needed

```
User Device ←→ Jazz Cloud ←→ Other Devices
     ↓
  Local SQLite
  (Encrypted)
```

## Design System

### Colors

- **Primary**: Green (#22c55e) - Growth, cultivation
- **Secondary**: Steel (#64748b) - Stability
- **Accents**: Purple (#a855f7), Orange (#f97316)

### Style

- Stark, paper-like aesthetic
- Pixelated, lo-fi feel
- Dark mode by default
- No rounded corners
- High information density with breathing room

### Voice

- Calm and transparent
- Garden/growth metaphors
- "Cultivate" over "manage"
- "Nurture" over "optimize"
- Non-judgmental about pruning

## Success Metrics

Unlike traditional apps, we measure:

- **Weekly active offline interactions** (not app usage)
- Relationship satisfaction scores
- Face-to-face interaction time
- Quality of connections

**Anti-metric**: Daily app open duration (target: <5 min/day)

## Privacy

- All data encrypted on device
- Servers cannot read your data
- No data sharing without explicit opt-in
- Subscription model (not ad-supported)
- User controls data deletion

See our [Privacy Philosophy](docs/CORE_TENETS.md#privacy-and-value-exchange)

## Contributing

This is currently a private project. Documentation and code structure are designed for clarity and maintainability.

## Resources

- [Expo Docs](https://docs.expo.dev/)
- [Jazz Docs](https://jazz.tools/docs/react-native-expo)
- [NativeWind Docs](https://www.nativewind.dev/)

## License

Proprietary - Thoughtful App Co.

---

*Build thoughtfully. Cultivate intentionally. 🌱*
