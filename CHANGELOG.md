# Changelog

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

