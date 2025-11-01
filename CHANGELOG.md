# Changelog

All notable changes to the Nurture app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- **0.2.0** - Quick Sort feature, relationship categorization, UI improvements
- **0.1.0** - Initial MVP with core features

