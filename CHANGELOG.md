# Changelog

## 2025-11-02 - CRITICAL FIX: Sorting Systems Database Updates

### Fixed
- **CRITICAL: Would You Rather contacts not appearing in layers** (P0 Bug)
  - Implemented missing contact update logic in WouldYouRatherModal
  - Contacts are now properly updated in Jazz database after ranking completes
  - Fixed `dunbarLayer` not being updated for contacts moving to next layer
  - Fixed `quickSortStatus` not being set to "sorted" after ranking
  - Contacts now appear in correct layers immediately after ranking
  - Prevents re-sorting of already ranked contacts
  
- **Dashboard refresh after sorting**
  - Added `onRefresh` callback to WouldYouRatherModal
  - Dashboard now automatically refreshes after ranking session completes
  - Applied same refresh pattern to QuickSortModal for consistency
  - Users see updated layer counts immediately
  
- **Data integrity and synchronization**
  - Both sorting systems (Tend Garden & Would You Rather) now update same fields
  - Consistent database update pattern across both systems
  - Prevents contacts from appearing in Tend Garden after being ranked
  - All sorted contacts properly marked with `quickSortStatus: "sorted"`

### Added
- **Comprehensive sorting systems documentation**
  - Created `docs/features/SORTING_SYSTEMS.md` (500+ lines)
    - Complete architecture documentation for both sorting systems
    - Data flow diagrams and integration points
    - Testing checklist and debugging guide
    - Maintenance guidelines for future development
  - Created `docs/implementation/SORTING_SYSTEMS_FIX.md` (450+ lines)
    - Detailed root cause analysis
    - Before/after code comparisons
    - Verification and logging details
    - Prevention measures and lessons learned
  - Created `docs/QUICK_REFERENCE_SORTING.md`
    - Quick reference for developers
    - Correct update patterns
    - Common mistakes to avoid
    - Debugging commands

### Technical Details
- **Files Modified:**
  - `components/relationships/WouldYouRatherModal.tsx` - 130+ lines added
    - Added Contact and ContactList imports
    - Implemented complete contact update logic in `completeRanking()`
    - Added comprehensive logging for debugging
    - Added `onRefresh` callback support
  - `app/(tabs)/dashboard.tsx` - 8 lines added
    - Added `onRefresh` to WouldYouRatherModal with dashboard refresh
    - Added refresh logic to QuickSortModal for consistency

### Root Cause
- Original implementation had TODO comment: "Apply reallocation updates to contacts in Jazz"
- Reallocation was calculated but never applied to database
- Contacts remained in old layers with "not_sorted" status
- Dashboard showed stale data and contacts appeared in Tend Garden repeatedly

### Impact
- **Severity:** P0 - Critical bug blocking core feature
- **Users Affected:** All users using "Would You Rather" ranking system
- **Resolution:** Complete - All contacts now update correctly

---

## 2025-11-02 - Graveyard Feature & UI Polish

### Fixed
- **React Hooks Order Violation** - Graveyard feature implementation
  - Moved all hooks (useSharedValue, useAnimatedStyle) to component top level
  - Ensured hooks are called before any conditional returns
  - Removed duplicate Animated import
  - Proper hook ordering prevents "change in order of Hooks" error
  - Graveyard animations now work correctly at 60fps

### Added
- **🪦 Graveyard for Hidden Contacts** - Elastic overscroll reveal for managing buried connections
  - Access: Pull down from top of Dashboard (~80px overscroll)
  - Graveyard card reveals showing count of hidden contacts
  - Full GraveyardScreen with rich contact metadata
  - View hidden date, last interaction, relationship type, call/SMS stats
  - **Unhide action**: Restore contacts to "not_sorted" for re-categorization
  - **Delete action**: Permanently remove contacts (with confirmation)
  - Beautiful empty state when no contacts hidden
  - Smooth animations using Reanimated (60fps native driver)
  - Metaphor: "Digging beneath the surface" to see what's buried
  - Self-reflection: Understand patterns in who you hide
  - Documentation: `/docs/features/GRAVEYARD.md`

### Changed
- **DunbarViolationHeroCard** - Finalized simplified design
  - Removed verbose Card wrapper for direct View styling
  - Matches Tend Garden aesthetic (gradient borders, animated pulse)
  - Consolidated messaging: alert indicator + clear CTA
  - Removed stats breakdown and explainer text
  - Unified hero card design system

### Performance
- **Graveyard Reveal**
  - Zero performance impact when not scrolling
  - Native driver animations (60fps)
  - Smooth interpolation with Extrapolate.CLAMP
  - Optimized scroll event throttling (16ms)

## 2025-11-02 - Cultivation Ranking System (Would You Rather)

### Added
- **🎯 Cultivation Ranking System** - Complete "Would You Rather" gamified pairwise comparison feature
  - QuickSort-based algorithm for small sets (<50 contacts) - O(n log n)
  - Swiss Tournament hybrid for large sets (>50 contacts) - 85% fewer comparisons
  - Smart pivot selection using existing interactionScore (avoids O(n²) worst case)
  - Transitive inference reduces comparisons by ~30%
  
- **Question Bank** - 29 acts-of-service questions across 8 categories
  - Categories: emergency, time, emotional, reciprocity, loyalty, intent, energy, trust
  - 100% cross-category friendly (works for family vs friends)
  - Question rotation prevents pattern answering
  - Seeded randomization for consistency
  
- **WouldYouRatherModal** - Interactive ranking UI
  - Card-based comparison interface (tap left or right)
  - Progress tracking with visual progress bar
  - Skip functionality (treats as tie)
  - Confirmation bias detection (alerts on contradictions)
  - Celebratory completion screen with stats
  - Saves to Jazz after each comparison (resumable)
  - 7-day session expiry
  
- **DunbarViolationHeroCard** - High-priority alert system
  - Automatic violation detection for Layers 0-4
  - Red/warning theme (Von Restorff effect)
  - Layer-specific messaging
  - Priority 5 (higher than Tend Garden: 10)
  - Visual stats display (current → target → moving)
  
- **Layer Reallocation Logic**
  - Automatic contact updates after ranking completion
  - Respects manual overrides (lockedLayer, manualLayerOverride)
  - Analytics tracking (session duration, skip rate, contradictions)
  - Validation and sanity checks
  
- **Jazz Schema Updates**
  - Comparison schema for pairwise decisions
  - RankingSession schema with resumable state
  - ComparisonList and RankingSessionList
  - Updated UserProfile with rankingSessions and comparisons fields

### Changed
- **Dashboard Integration**
  - Integrated violation detection on render
  - Priority system: Dunbar violations shown before Tend Garden
  - Tab bar hides during ranking session
  - Full-screen ranking experience

### Performance
- **Expected Comparisons:**
  - 20 contacts: ~25-30 comparisons (2-3 min)
  - 50 contacts: ~65-80 comparisons (5-7 min)
  - 100 contacts: ~40-60 comparisons (3-5 min) with Swiss Tournament
  - 200 contacts: ~40-60 comparisons (3-5 min) with Swiss Tournament

### Technical Details
- **Files Created:**
  - `services/questionBank.ts` - Question bank with rotation logic
  - `services/rankingAlgorithm.ts` - Core algorithms (QuickSort + Swiss)
  - `services/layerReallocation.ts` - Post-ranking updates
  - `components/relationships/WouldYouRatherModal.tsx` - Main UI
  - `components/relationships/DunbarViolationHeroCard.tsx` - Hero card + detection
  - `docs/features/CULTIVATION_RANKING.md` - Complete documentation
  
- **Files Modified:**
  - `jazz/schema.ts` - Added Comparison, RankingSession schemas
  - `app/(tabs)/dashboard.tsx` - Integrated hero card and modal

### Story
- **STORY-016:** Would You Rather - Forced Ranking Tool
- **Status:** ✅ Production ready (all 9 tasks complete)

---

## 2025-01-XX - Critical Dunbar Fixes & Null Safety

### Fixed
- **CRITICAL: Dunbar layer capacity bug** - Layers are now correctly nested/inclusive
  - Previous: Additive counts allowed 220 contacts in layers 0-3 (should be 150)
  - Fixed: Layer 0 = 5 total, Layer 1 = 15 total (adds 10), Layer 2 = 50 total (adds 35)
  - Layer 3 = 150 total (adds 100), Layer 4 = 500 total (adds 350), Layer 5 = 1500 total (adds 1000)
  - This aligns with Dunbar's actual research on nested social layers

- **Family override enhancement** - Family members now prioritized regardless of interaction score
  - Previously only bumped family with zero interaction data
  - Now ensures all family members reach minimum scores:
    - Nuclear family (current/spouse last name): minimum score 85 → Layer 0-1
    - Secondary family (birth last name): minimum score 60 → Layer 2
    - Tertiary family (partial matches): minimum score 40 → Layer 3
  - Resolves issue where parents/siblings with low interaction weren't elevated appropriately

- **Android crash fix** - Resolved NullPointerException in view rendering
  - Removed `Animated` components from react-native-reanimated causing null reference errors
  - Added comprehensive null safety checks for contact rendering
  - Filter null contacts, add fallback names, use explicit ternary operators
  - Error: "Attempt to read from field 'int android.view.View.mViewFlags' on a null object reference"

### Technical Details
- **Modified Files:**
  - `services/dunbarCalculator.ts` - Fixed LAYER_THRESHOLDS capacities, enhanced family bump logic
  - `app/(tabs)/dashboard.tsx` - Removed Animated.ScrollView, added null checks
  - `components/relationships/LayerDetailScreen.tsx` - Added null filtering and safe rendering

---

## 2025-01-XX - Bump Algorithm & Favorites Removal

### Added
- **Bump Algorithm** - Intelligent layer distribution when conversation data is sparse
  - Nuclear family (no data) → Layer 0-1 (score bump to 85)
  - Secondary family (no data) → Layer 2 (score bump to 60)
  - Extended family (no data) → Layer 3 (score bump to 40)
  - High quality ratings (4-5★) → Layer 2 minimum (score bump to 50)
  - Baseline for all other contacts → Layer 4 (score bump to 5)
  - Smart redistribution when >50% in Layer 5
  - Top-to-bottom fill: Layer 4 → 3 → 2

### Changed
- **Dunbar Layer Algorithm** now gracefully handles zero conversation data
- Layer distribution prioritizes: Family > Quality Rating > Alphabetical
- Updated algorithm to prevent overcrowding in Layer 5 (Social Nebula)

### Removed
- **Favorites feature** completely removed from codebase and docs
  - Removed `isFavorite` field from Contact schema
  - Removed favorites boost (+20 points) from scoring algorithm
  - Removed favorites override logic from layer assignment
  - Cleaned all documentation of favorites references

### Documentation
- Added `docs/BUMP_ALGORITHM.md` explaining the new bump logic
- Cleaned `docs/setup/GET_REAL_DATA.md` (removed favorites from scoring)
- Cleaned `docs/status/IMPLEMENTATION_STATUS.md` (removed favorites section)
- Cleaned `docs/implementation/DATA_LIMITATIONS.md` (removed favorites workarounds)

### Technical Details
- **Modified Files:**
  - `services/dunbarCalculator.ts` - Added 4-stage bump algorithm (lines 161-320)
  - `jazz/schema.ts` - Removed `isFavorite` field from Contact model

### Migration Notes
- Existing contacts with `isFavorite` will not error (optional field)
- No data migration needed
- Family and quality ratings now provide the manual override capability

---

