# Changelog

All notable changes to the Nurture app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.3] - 2025-11-01

### Changed

#### Dunbar Layer Naming and Descriptions
- **Improved layer names** with clearer, research-based terminology:
  - Layer 0: **Loved Ones** (0-5) - was "Intimate Core" (1-5)
  - Layer 1: **Good Friends** (5-15) - was "Sympathy Group"
  - Layer 2: **Friends (Clan)** (15-50) - was "Close Group"
  - Layer 3: **Meaningful Contacts (Tribe)** (50-150) - was "Tribe"
  - Layer 4: **Acquaintances** (150-500) - expanded from 150-250
  - Layer 5: **Social Nebula** (500-1500) - expanded from 250+
- **Enhanced layer descriptions** with better prose explaining Dunbar's research
  - Each description now clearly explains the relationship depth and social dynamics
  - Added context about cognitive limits and recognition boundaries
  - Loved Ones: "Your innermost circle of 5 people... The people who know your deepest fears and greatest dreams"
  - Good Friends: "Your core support network of 15 people... You'd be devastated if something happened to them"
  - Friends (Clan): "Your extended friend group of 50 people... who shape your social identity"
  - Meaningful Contacts (Tribe): "Your broader tribe of 150 people... Dunbar's number—the cognitive limit for stable social relationships"
  - Acquaintances: "People you recognize and interact with occasionally—up to 500 individuals"
  - Social Nebula: "The outer limit of recognition—up to 1,500 people... anyone you'd recognize by face or name"

#### Garden View Display Format
- **Changed display format** from "47 left" / "room for X more" to **"3/5 (60%)"** format
  - Shows current count / total capacity with percentage
  - More intuitive and informative for users at a glance
  - Updated prompt text from "room for X more" to "X remaining"
  - Visual progress bars now accurately reflect percentage of layer capacity

#### Calculator Logic
- Updated layer capacity thresholds in dunbarCalculator.ts to match new definitions
- Adjusted percentile distribution for proper scaling across all 1500 recognizable people
  - Layer 0: 0.3% (top 5 people)
  - Layer 1: 0.7% (5-15 people)
  - Layer 2: 2.3% (15-50 people)
  - Layer 3: 6.7% (50-150 people)
  - Layer 4: 23.3% (150-500 people)
  - Layer 5: 66.7% (500-1500 people)

---

## [0.2.2] - 2025-11-01

### Added

#### Glassmorphic Tab Bar Design
- Implemented modern glassmorphic (frosted glass) design for tab navigation
- Added `expo-blur` v15.0.7 dependency for blur effects
- BlurView with 80% intensity for authentic frosted glass appearance
- Layered transparent gradient overlay (85%, 75%, 80% opacity) for visual depth
- Glowing green border (#22c55e) with shadow effect instead of solid line
- Deeper shadows (16px blur radius) for floating tab bar appearance

#### Smooth Tab Transitions
- Added fade-in/fade-out animations between Garden and Harvest tabs
- 300ms fade-in and 200ms fade-out for seamless screen transitions
- Integrated `react-native-reanimated` for smooth animations
- Enhanced user experience when switching between tabs

### Changed

#### Tab Bar Behavior
- Changed tab bar position from `relative` to `absolute` to prevent shifting
- Tab bar now maintains consistent height across all screens
- Removed duplicate tab bar style definitions from individual screen options
- Centralized tab bar styling in layout component

### Fixed

- **Critical**: Fixed tab bar height inconsistency between Garden and Harvest tabs
  - Root cause: Dashboard was setting `tabBarStyle: undefined` when visible
  - Solution: Replace undefined with proper glassmorphic style object
  - Tab bar now maintains 88pt (iOS) or 72pt (Android) consistently
- Fixed tab bar "jumping" and movement when switching between screens
- Fixed console log spam from tab selection logging
  - Logs now only fire on actual tab changes, not on every render
  - Added state tracking to prevent duplicate logs
- Fixed verbose console output during tab bar visibility changes
  - Only logs when visibility actually changes, not on every useEffect run

### Developer Experience

- Improved console logging for tab selection (only shows actual changes)
- Added state tracking for tab bar visibility to reduce log noise
- Removed redundant tab bar layout configuration logs
- Better debugging experience with meaningful, non-repetitive logs

### Technical Notes

- **Breaking**: Requires native rebuild due to `expo-blur` integration
- Run `npx expo prebuild --clean && npx expo run:ios` (or `run:android`)
- Glassmorphic effect works best with scrollable content behind tab bar

---

## [0.2.1] - 2025-11-01

### Added

#### Interaction Metrics Persistence
- Added `callCount`, `smsCount`, and `totalDuration` fields to Contact schema
- Raw interaction data now persists in Jazz database
- Contact detail screen now displays:
  - Voice call count and total duration
  - SMS message count
  - Average call duration
  - Interaction breakdown from last 3 months

#### Dunbar Layer Editor
- Added layer selector to contact edit screen
- Users can now manually adjust Dunbar layer assignments
- Visual layer picker shows all 6 layers with color indicators
- Tap current layer to open dropdown selector

#### Relationship Type Management
- Hold gesture on contact cards opens relationship type selector
- Removed redundant "tap to set relationship type" interaction
- Keep only long-press (500ms) for setting Family/Friend/Business
- Added relationship type editor to contact detail modal with:
  - Family tier selector (Nuclear/Secondary/Tertiary)
  - Friend tier selector (Inner Circle/Close/Good/Casual)
  - Business tier selector (Close Colleague/Acquaintance)

### Changed

#### Dunbar Layer Prioritization
- Nuclear family members now prioritized for intimate layers (0-1)
- Algorithm separates nuclear family before sorting by interaction score
- Ensures important family members aren't relegated to outer layers due to low call/text frequency
- Nuclear family sorted by interaction score and placed first in layer assignment queue

#### Data Mining Progress
- Removed percentage-based progress bar (was unreliable and inaccurate)
- Simplified to show pulsing animation with descriptive text
- Cleaner UX without fake progress indicators
- Animation shows work is happening without misleading percentages

### Fixed
- **Critical**: Fixed interaction metrics (calls/texts) not showing in contact detail screen
  - Root cause: Raw interaction counts weren't being saved to Jazz database
  - Solution: Added persistence for callCount, smsCount, totalDuration fields
  - Users must re-run "Re-analyze Relationship Data" to populate metrics for existing contacts
- Fixed long-press on contact card opening edit screen instead of relationship selector
  - Implemented proper gesture detection with `isLongPress` ref
  - Short tap → Opens detail/edit screen
  - Long press → Opens relationship type selector
- Fixed data mining animation freezing before completion
- Fixed dunbarLayer not persisting when edited in contact modal

### Removed
- Removed "Add to Favorites" feature (redundant, not aligned with app philosophy)
- Removed tap interaction for relationship type on contact cards (hold only now)

### UI/UX Improvements
- Improved dashboard styling with better borders and spacing
- Enhanced typography consistency (removed Montserrat font-specific styling)
- Added accessibility labels to all interactive elements
- Added press states and opacity feedback
- Improved progress bar visibility (increased height from 2px to 3px)
- Added fade animations to ScrollView for smoother transitions
- Better visual hierarchy throughout the app

---

## [0.2.0] - 2025-10-31

### Added

#### Quick Sort Utility
- **New Feature**: Quick Sort modal for rapid contact categorization
  - Swipeable card interface with smooth animations
  - 6 categories with descriptive labels: Adore (L0), Love (L1), Respect (L2), Like (L3), Know (L4), Hide
  - Relationship type selector (Family, Friend, Business) with emoji icons
  - Dynamic subcategory selection:
    - Family: Nuclear, Secondary, Extended
    - Friend: Inner Circle, Close Friend, Good Friend, Casual Friend
    - Business: Close Colleague, Acquaintance
  - Progress tracking with visual progress bar
  - Skip functionality for uncertain contacts
  - Reset capability to restart sorting session
  - Prevents double-sorting via `quickSortStatus` tracking
  - Full Jazz database integration with persistent state
  - Clean single-card UI (removed transparent preview)
  - Console logging for debugging
  - Comprehensive documentation in `docs/features/QUICK_SORT.md`

#### Schema Enhancements
- Added `quickSortStatus` enum field to Contact schema (`not_sorted`, `sorted`, `hidden`)
- Added `quickSortedAt` timestamp field for sort session tracking
- Enables prevention of double-sorting in Quick Sort utility

#### UI Component Improvements
- Added `onPress` support to Card component for interactive cards
- Maintains backward compatibility for non-interactive cards

### Changed

#### Dashboard
- **Breaking Change**: Replaced "Cultivation Opportunities" section with "Quick Sort"
- Show dynamic count of unsorted contacts
- Auto-refresh dashboard after Quick Sort completion
- Hide tab bar when Quick Sort modal is active

#### Contact Data Persistence
- Include `quickSortStatus` in contact conversion from Jazz objects
- Add `relationshipType`, `friendTier`, `businessTier` to plain contact objects
- Preserve Quick Sort fields during contact updates
- Initialize new contacts with `not_sorted` status

#### Contact Detail UI
- Enhanced contact detail modal with visual layer selector
- Improved contact editing experience
- Added layer constants for consistent display across app

### Fixed
- **Critical**: Fixed sorted contacts reappearing in Quick Sort
  - Root cause: `quickSortStatus` field wasn't being passed through from Jazz
  - Solution: Added Quick Sort fields to contact conversion in dashboard
- Fixed inconsistent relationship type button layout
  - All buttons now display icon above text (matching BUSINESS style)
  - Consistent padding and alignment across all three buttons

### Removed
- Removed unused `isFavorite` field from contact detail modal

---

## [0.1.0] - 2025-10-30

### Added
- Initial MVP release
- Contact data ingestion from device
- Call log and SMS mining (Android only)
- Dunbar layer calculation algorithm
- Family detection via last names and pet names
- Dashboard with layer visualization
- Contact search functionality
- Manual interaction logging
- Jazz database integration
- Clerk authentication
- Biometric lock support
- Developer tools and Jazz inspector

### Known Limitations
- iOS platform cannot access call logs or SMS history (Apple restriction)
- Native modules require EAS build or local build (not available in Expo Go)
- Contact analysis is one-time on first login

---

## Version History

- **0.2.3** - Improved Dunbar layer naming, better descriptions, garden view display format
- **0.2.2** - Glassmorphic tab bar, smooth transitions, tab consistency fixes
- **0.2.1** - Interaction metrics persistence, nuclear family prioritization, UX fixes
- **0.2.0** - Quick Sort feature, relationship categorization, UI improvements
- **0.1.0** - Initial MVP with core features

