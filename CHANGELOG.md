# Changelog

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

