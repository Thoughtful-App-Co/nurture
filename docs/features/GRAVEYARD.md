# Graveyard Feature

## Overview

The Graveyard is a dedicated space for viewing and managing hidden contacts - people you've intentionally removed from your active garden during the "Tend Your Garden" process. It provides introspection and cleanup opportunities, helping you understand patterns in your relationships.

## Philosophy

**"Understanding yourself through what you hide"**

When you hide someone during garden tending, you're making a statement: "who is this person?" or "do I need this connection?" The Graveyard makes this action transparent and reversible, turning it into a tool for self-reflection rather than a black hole.

## Access Method

The Graveyard uses an **elastic overscroll reveal** pattern - it's literally "buried underground" in the UI:

1. **Navigate to Dashboard** (Garden tab)
2. **Scroll to the top** of the page
3. **Continue scrolling up** (pull down ~80px)
4. **Graveyard card appears** showing count of hidden contacts
5. **Tap the card** to enter the Graveyard screen

### Why Overscroll?

- **Intentional access**: Not accidentally discovered, requires deliberate action
- **Metaphorically coherent**: Literally "digging beneath the surface" to see what's buried
- **Clean UI**: Doesn't clutter the main dashboard
- **Purposeful interaction**: You go to the graveyard "with some purpose"

## Features

### 👁️ View Hidden Contacts

See all contacts with `quickSortStatus: "hidden"` including:

- **Basic info**: Name, phone, email
- **Hidden date**: When you buried them
- **Last interaction**: When you last connected
- **Relationship type**: Family, Friend, Business
- **Interaction stats**: Calls and texts from last 3 months

### 🌱 Unhide Contacts

**Action**: Restore a contact to your active garden

**What it does**:
- Resets `quickSortStatus` from `"hidden"` to `"not_sorted"`
- Contact reappears in "Tend Your Garden" flow
- You can re-categorize them into appropriate layer

**Use cases**:
- Hid someone by mistake
- Circumstances changed (reconnected with old friend)
- Want to give them another chance

### 🗑️ Delete Permanently

**Action**: Remove a contact from your database entirely

**What it does**:
- Permanently deletes contact from Jazz database
- Removes all associated data (metrics, interactions)
- **Cannot be undone**

**Use cases**:
- Wrong number you'll never need
- Spam/marketing contacts
- People you're 100% sure you'll never contact again
- Cleaning up your digital baggage

### 🪦 Empty State

If you haven't hidden anyone yet:
- Shows encouraging empty state
- Explains that hidden contacts will appear here
- Maintains the garden metaphor

## User Flow

```
Garden Dashboard
    ↓ (scroll up at top)
Graveyard Reveal Card appears
    ↓ (tap card)
Graveyard Screen
    ↓ (select contact)
[Unhide] or [Delete]
    ↓
Returns to Garden (refreshed)
```

## Implementation Details

### Data Model

Uses existing `Contact` schema fields:
- `quickSortStatus: "hidden"` - Marks contact as hidden
- `quickSortedAt: string` - ISO date when hidden
- `dunbarLayer: 5` - Hidden contacts go to layer 5 (Social Nebula)

### Animation

- **Pull threshold**: -80px scroll offset
- **Reveal animation**: Smooth interpolation using Reanimated
- **Visual feedback**: Opacity and translateY based on scroll position
- **No performance impact**: Uses native driver for 60fps animations

### Technical Stack

**Components**:
- `GraveyardScreen.tsx` - Main graveyard view
- `dashboard.tsx` - Overscroll detection and reveal card

**Libraries**:
- `react-native-reanimated` - Smooth scroll-based animations
- `jazz-tools` - Data persistence and sync

### Database Operations

**Unhide**:
```typescript
Contact.create({
  ...existingFields,
  quickSortStatus: "not_sorted",
  quickSortedAt: new Date().toISOString(),
}, me);
```

**Delete**:
```typescript
const newContactsList = contacts.filter(c => c.id !== deletedContactId);
const newContacts = ContactList.create(newContactsList, me);
root.$jazz.set('contacts', newContacts);
```

## Design Decisions

### Why "Graveyard" and not "Archive"?

- **Emotionally honest**: You're not "archiving" them, you're burying them
- **Memorable**: Creates a clear mental model
- **Garden metaphor**: Fits perfectly with cultivation theme
- **Encourages reflection**: Makes you confront what you're hiding

### Why Not a Tab?

Considered making Graveyard a third tab, but rejected because:
- Promotes negative actions (hiding) over positive (cultivating)
- Clutters navigation
- Gets less usage than Garden or Harvest
- Breaks the focused 2-tab structure

### Why Allow Delete?

Some users have hundreds of spam contacts or wrong numbers. Providing a delete option:
- Gives users full control over their data
- Enables "digital hygiene" for peace of mind
- Respects user agency (with appropriate warnings)

## Best Practices

### When to Use

1. **After hiding multiple contacts**: Review who you buried and why
2. **Periodic cleanup**: Every few months, audit your graveyard
3. **Before major life changes**: Moving cities, changing jobs
4. **Digital spring cleaning**: Declutter your contact list

### When NOT to Use

- Don't use Graveyard for active relationship management
- Don't delete contacts impulsively (can't undo!)
- Don't hide contacts you're just unsure about (use "Skip" in Tend Garden)

## Self-Reflection Prompts

The Graveyard enables users to ask themselves:

- **Patterns**: "Do I hide mostly work contacts? Family? Why?"
- **Baggage**: "Am I holding onto old contacts I'll never need?"
- **Boundaries**: "Am I comfortable with who I've removed from my life?"
- **Mistakes**: "Did I hide someone I actually care about?"

## Future Enhancements

- [ ] **Graveyard analytics**: "You've hidden 23 business contacts"
- [ ] **Bulk actions**: Unhide or delete multiple at once
- [ ] **Auto-suggest delete**: "Haven't interacted in 2 years, delete?"
- [ ] **Undo delete**: 30-day grace period before permanent deletion
- [ ] **Export graveyard**: Download list of hidden contacts
- [ ] **Search graveyard**: Find specific buried contacts

## Accessibility

- Clear visual hierarchy
- Large tap targets (44pt minimum)
- Screen reader support with descriptive labels
- Warning dialogs for destructive actions
- Keyboard navigation support (web version)

## Files Modified

- `/components/relationships/GraveyardScreen.tsx` - New component
- `/app/(tabs)/dashboard.tsx` - Overscroll detection and reveal UI
- `/docs/features/GRAVEYARD.md` - This documentation

## Related Documentation

- [Tend Garden](./TEND_GARDEN.md) - How contacts get hidden
- [Jazz Integration](../architecture/JAZZ_INTEGRATION.md) - Data persistence
- [Tab Navigation](./TAB_NAVIGATION_IMPROVEMENTS.md) - Navigation structure

## Summary

The Graveyard transforms hiding contacts from a one-way action into a tool for self-understanding. By making buried connections visible and manageable, it helps users maintain a clean, intentional relationship garden while providing opportunities for reflection and course correction.

**"What you hide says as much about you as what you keep."**
