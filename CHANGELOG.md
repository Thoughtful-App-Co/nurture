# Changelog

## 2025-11-02 - Graveyard Feature & UI Polish

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

