# Tend Garden Feature

## Overview

The Tend Garden tool helps you organize and catalog your relationships into appropriate Dunbar layers. Like tending a garden, it brings clarity and order to your relationship network through an intuitive swipeable interface.

## Features

### 🎯 Core Functionality
- **Swipeable card interface** - One contact at a time, smooth animations
- **6 categories**: Layers 0-4 + Hidden
- **Prevents double-tending** - Each contact can only be tended once per session
- **Progress tracking** - Visual progress bar and count
- **Skip functionality** - Skip contacts you're unsure about
- **Reset capability** - Start over and re-tend all contacts

### 🛡️ Data Integrity
- `quickSortStatus` field tracks tending state: `"not_tended" | "tended" | "hidden"`
- `quickSortedAt` timestamp records when contact was last tended
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

1. **Launch Tend Garden** from dashboard
   - Shows count of untended contacts
   - Disabled if all contacts are tended

2. **Categorize contacts**
   - Card appears with contact name and current layer
   - Tap one of 6 category buttons to tend
   - Card animates away, next contact appears
   - Progress bar updates automatically

3. **Skip or Complete**
   - Skip contacts you're unsure about
   - When done, see completion screen
   - Option to return to dashboard or reset

4. **Reset (optional)**
   - Clear all tend garden statuses
   - Start fresh tending session
   - Useful for periodic re-evaluation

## Implementation Details

### Schema Changes
```typescript
// Added to Contact schema
quickSortStatus: z.enum(["not_tended", "tended", "hidden"]).optional()
quickSortedAt: z.string().optional() // ISO date
```

### Component Structure
```
QuickSortModal.tsx
├── State Management
│   ├── currentIndex (which contact is showing)
│   ├── tendedCount (how many tended)
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
- **Reset All**: Sets all contacts to `quickSortStatus: "not_tended"`
- **Hide Contact**: Sets `dunbarLayer: 5` and `quickSortStatus: "hidden"`

## Dashboard Integration

Replaced "Cultivation Opportunities" section with "Tend Garden":
- Shows count of untended contacts
- Button to launch Tend Garden modal
- Disabled when all contacts tended
- Refreshes dashboard after tending complete

## Usage Tips

### Best Practices
1. **First time**: Sort all contacts to establish baseline
2. **New contacts**: Tend Garden automatically includes untended contacts
3. **Re-evaluation**: Reset and re-tend every few months
4. **Skip liberally**: Better to skip than mis-categorize

### When to Use
- **After initial data mining** - All contacts start as "not_tended"
- **After adding new contacts** - New contacts are automatically "not_tended"
- **Periodic review** - Every 3-6 months, reset and re-tend
- **Life changes** - Major life events may shift relationship priorities

### When NOT to Use
- Don't use Tend Garden for fine-tuning individual contacts
- Use the contact detail screen for notes and cultivation goals
- Tend Garden is for bulk categorization, not detailed management

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
- [ ] Undo last tend
- [ ] Bulk operations (tend entire layer)
- [ ] Smart suggestions based on metrics
- [ ] Keyboard shortcuts (web version)

## Troubleshooting

### "No Contacts to Sort"
- All contacts have been tended
- Use "Reset & Sort Again" to start over

### Dashboard Not Updating
- Close and reopen Tend Garden modal
- Modal automatically triggers dashboard refresh on close

### Contact Sorted Twice
- This shouldn't happen due to `quickSortStatus` check
- If it does, report as a bug

### Lost Progress
- Tend Garden saves after each contact
- Progress persists in Jazz database
- If app crashes, resume where you left off

## Files Modified

- `/jazz/schema.ts` - Added quickSort fields to Contact
- `/components/relationships/QuickSortModal.tsx` - New component
- `/components/ui/Card.tsx` - Added onPress support
- `/app/(tabs)/dashboard.tsx` - Integrated Tend Garden, replaced Cultivation Opportunities

## Related Documentation

- [Jazz Integration](../architecture/JAZZ_INTEGRATION.md)
- [Tab Navigation](./TAB_NAVIGATION_IMPROVEMENTS.md)
- [Contact Schema](../PRD.md#contact-model)
