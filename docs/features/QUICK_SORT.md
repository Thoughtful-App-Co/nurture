# Quick Sort Feature

## Overview

The Quick Sort utility provides a fast, intuitive way to categorize contacts into Dunbar layers or hide them. It uses a swipeable card interface to make sorting hundreds of contacts quick and effortless.

## Features

### 🎯 Core Functionality
- **Swipeable card interface** - One contact at a time, smooth animations
- **6 categories**: Layers 0-4 + Hidden
- **Prevents double-sorting** - Each contact can only be sorted once per session
- **Progress tracking** - Visual progress bar and count
- **Skip functionality** - Skip contacts you're unsure about
- **Reset capability** - Start over and re-sort all contacts

### 🛡️ Data Integrity
- `quickSortStatus` field tracks sorting state: `"not_sorted" | "sorted" | "hidden"`
- `quickSortedAt` timestamp records when contact was last sorted
- Status persists across app sessions in Jazz database

## Categories

Each category has an emoji, a descriptor word, and a layer number for easy recognition:

### ❤️ Adore (Layer 0 - Intimate Core)
**1-5 people** - Your closest confidants. People you adore and turn to in crisis.

### 🧡 Love (Layer 1 - Sympathy Group)
**5-15 people** - Close friends you see regularly. You love these people deeply.

### 💛 Respect (Layer 2 - Close Group)
**15-50 people** - Good friends you actively maintain. Deep respect and genuine care.

### 💚 Like (Layer 3 - Tribe)
**50-150 people** - Friends and extended family. You like them and enjoy their company.

### 💙 Know (Layer 4 - Acquaintances)
**150-250 people** - People you know and interact with occasionally.

### 👻 Hide (Hidden)
**Unlimited** - People you don't care about, don't know, or want hidden from your active layers.

## User Flow

1. **Launch Quick Sort** from dashboard
   - Shows count of unsorted contacts
   - Disabled if all contacts are sorted

2. **Categorize contacts**
   - Card appears with contact name and current layer
   - Tap one of 6 category buttons to sort
   - Card animates away, next contact appears
   - Progress bar updates automatically

3. **Skip or Complete**
   - Skip contacts you're unsure about
   - When done, see completion screen
   - Option to return to dashboard or reset

4. **Reset (optional)**
   - Clear all quick sort statuses
   - Start fresh sorting session
   - Useful for periodic re-evaluation

## Implementation Details

### Schema Changes
```typescript
// Added to Contact schema
quickSortStatus: z.enum(["not_sorted", "sorted", "hidden"]).optional()
quickSortedAt: z.string().optional() // ISO date
```

### Component Structure
```
QuickSortModal.tsx
├── State Management
│   ├── currentIndex (which contact is showing)
│   ├── sortedCount (how many sorted)
│   └── isComplete (all done?)
├── Card Stack
│   └── Single current card (animated, no preview)
├── Category Buttons
│   ├── 6 buttons (2 rows of 3)
│   ├── Emoji + Descriptor + Layer number
│   └── Color-coded by layer
└── Controls
    ├── Skip button
    └── Close button
```

### Database Operations
- **Sort Contact**: Updates `dunbarLayer`, `quickSortStatus`, and `quickSortedAt`
- **Reset All**: Sets all contacts to `quickSortStatus: "not_sorted"`
- **Hide Contact**: Sets `dunbarLayer: 5` and `quickSortStatus: "hidden"`

## Dashboard Integration

Replaced "Cultivation Opportunities" section with "Quick Sort":
- Shows count of unsorted contacts
- Button to launch Quick Sort modal
- Disabled when all contacts sorted
- Refreshes dashboard after sorting complete

## Usage Tips

### Best Practices
1. **First time**: Sort all contacts to establish baseline
2. **New contacts**: Quick Sort automatically includes unsorted contacts
3. **Re-evaluation**: Reset and re-sort every few months
4. **Skip liberally**: Better to skip than mis-categorize

### When to Use
- **After initial data mining** - All contacts start as "not_sorted"
- **After adding new contacts** - New contacts are automatically "not_sorted"
- **Periodic review** - Every 3-6 months, reset and re-sort
- **Life changes** - Major life events may shift relationship priorities

### When NOT to Use
- Don't use Quick Sort for fine-tuning individual contacts
- Use the contact detail screen for notes and cultivation goals
- Quick Sort is for bulk categorization, not detailed management

## Technical Notes

### Performance
- Handles hundreds of contacts smoothly
- Animations run at 60fps
- Database updates are batched per contact
- No lag between cards

### Accessibility
- Large tap targets (category buttons)
- Clear visual feedback
- Progress indicator
- Skip option for uncertainty

### Future Enhancements
- [ ] Swipe gestures (currently tap-only)
- [ ] Undo last sort
- [ ] Bulk operations (sort entire layer)
- [ ] Smart suggestions based on metrics
- [ ] Keyboard shortcuts (web version)

## Troubleshooting

### "No Contacts to Sort"
- All contacts have been sorted
- Use "Reset & Sort Again" to start over

### Dashboard Not Updating
- Close and reopen Quick Sort modal
- Modal automatically triggers dashboard refresh on close

### Contact Sorted Twice
- This shouldn't happen due to `quickSortStatus` check
- If it does, report as a bug

### Lost Progress
- Quick Sort saves after each contact
- Progress persists in Jazz database
- If app crashes, resume where you left off

## Files Modified

- `/jazz/schema.ts` - Added quickSort fields to Contact
- `/components/relationships/QuickSortModal.tsx` - New component
- `/components/ui/Card.tsx` - Added onPress support
- `/app/(tabs)/dashboard.tsx` - Integrated Quick Sort, replaced Cultivation Opportunities

## Related Documentation

- [Jazz Integration](../architecture/JAZZ_INTEGRATION.md)
- [Tab Navigation](./TAB_NAVIGATION_IMPROVEMENTS.md)
- [Contact Schema](../PRD.md#contact-model)
