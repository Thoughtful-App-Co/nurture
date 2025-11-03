# Sorting Systems Architecture

## Overview

Nurture uses **two distinct sorting systems** to help users organize their relationships. Understanding how these systems work together is critical for maintaining data integrity and preventing bugs.

---

## The Two Systems

### 1. Tend Garden (QuickSortModal)
**Purpose:** Initial relationship categorization  
**File:** `components/relationships/QuickSortModal.tsx`  
**Trigger:** User has unsorted contacts (`quickSortStatus === "not_sorted"`)

#### What It Does
- Presents contacts one at a time in a swipeable card interface
- User categorizes each contact into:
  - **Relationship Type**: Family, Friend, or Business
  - **Layer Assignment**: Layer 0-4 or Hidden (Layer 5)
  - **Subcategories**: Family tier, connection origin, business tier

#### Data Updates
When a contact is sorted via Tend Garden:
```typescript
{
  dunbarLayer: 0-5,                    // Layer assignment
  quickSortStatus: "sorted" | "hidden", // Prevents re-sorting
  quickSortedAt: ISO_DATE,             // Timestamp
  relationshipType: "FAMILY" | "FRIEND" | "BUSINESS",
  // Plus subcategory fields
}
```

#### User Flow
```
Dashboard → "Tend Garden" Button → QuickSortModal
  ↓
User categorizes contacts (swipe through cards)
  ↓
Each contact saved to Jazz immediately
  ↓
Modal closes → Dashboard refreshes → Contacts appear in layers
```

---

### 2. Would You Rather (WouldYouRatherModal)
**Purpose:** Dunbar violation resolution via pairwise ranking  
**File:** `components/relationships/WouldYouRatherModal.tsx`  
**Trigger:** A layer exceeds its capacity (Dunbar violation detected)

#### What It Does
- Shows two contacts side-by-side with a question prompt
- User chooses which contact they prioritize
- Uses QuickSort or Swiss Tournament algorithm to rank all contacts
- Top N contacts stay in current layer, rest move down

#### Data Updates (After Fix)
When ranking completes:
```typescript
// Contacts staying in current layer
{
  dunbarLayer: CURRENT_LAYER,          // Unchanged
  quickSortStatus: "sorted",           // Marked as sorted
  quickSortedAt: ISO_DATE,             // Timestamp
}

// Contacts moving down
{
  dunbarLayer: CURRENT_LAYER + 1,      // Moved to next layer
  quickSortStatus: "sorted",           // Marked as sorted
  quickSortedAt: ISO_DATE,             // Timestamp
}
```

#### User Flow
```
Dashboard → Dunbar Violation Hero Card → "Help Me Prioritize"
  ↓
WouldYouRatherModal opens with violated layer contacts
  ↓
User makes pairwise comparisons (tap left or right card)
  ↓
Algorithm ranks all contacts (O(n log n) comparisons)
  ↓
Top N contacts stay, rest move to next layer down
  ↓
Contacts updated in Jazz database ✅ (FIXED)
  ↓
Modal closes → Dashboard refreshes → Contacts in new layers
```

---

## Critical Integration Points

### 1. The `quickSortStatus` Field
This field prevents contacts from being sorted multiple times:

| Status | Meaning | Shown in Tend Garden? | Shown in Would You Rather? |
|--------|---------|----------------------|---------------------------|
| `"not_sorted"` | Never categorized | ✅ YES | Only if in violated layer |
| `"sorted"` | Categorized via either system | ❌ NO | Only if in violated layer |
| `"hidden"` | Hidden in graveyard | ❌ NO | ❌ NO |
| `undefined` | Legacy (treated as not_sorted) | ✅ YES | Only if in violated layer |

### 2. The `dunbarLayer` Field
Determines which layer a contact appears in on the dashboard:

- **Layer 0-4**: Active relationship layers
- **Layer 5**: Hidden contacts (graveyard)

### 3. Filter Logic in Dashboard

#### Tend Garden Contacts
```typescript
// dashboard.tsx line 856-858
const unsortedCount = Array.from(contacts).filter(
  (c: any) => c?.quickSortStatus === "not_sorted" || !c?.quickSortStatus
).length;
```

#### Would You Rather Contacts
```typescript
// dashboard.tsx line 786
const layerContacts = allContacts.filter(
  (c: any) => c?.dunbarLayer === violation.layer
);
```

**Key Difference:**
- Tend Garden filters by `quickSortStatus`
- Would You Rather filters by `dunbarLayer`

This means:
- ✅ Contacts sorted via Tend Garden won't appear in Tend Garden again
- ✅ Contacts sorted via Would You Rather won't appear in Would You Rather again (for that layer)
- ❌ **BUG (FIXED)**: If Would You Rather doesn't update `quickSortStatus`, contacts could appear in Tend Garden

---

## The Bug We Fixed

### Problem Statement
**Issue 1:** Contacts sorted via Would You Rather were not appearing in their new layers  
**Issue 2:** Contacts sorted via Would You Rather were appearing again in Tend Garden

### Root Cause
In `WouldYouRatherModal.tsx` line 338, there was a TODO comment:
```typescript
// TODO: Apply reallocation updates to contacts in Jazz
```

The reallocation logic was **calculating** which contacts should move, but **never actually updating** the Jazz database.

### What Was Missing
After completing a ranking session, the code needed to:
1. ✅ Calculate which contacts stay/move (implemented)
2. ❌ Update `dunbarLayer` for moving contacts (MISSING)
3. ❌ Update `quickSortStatus` to "sorted" (MISSING)
4. ❌ Save changes to Jazz database (MISSING)
5. ❌ Trigger dashboard refresh (MISSING)

### The Fix
We implemented the missing contact update logic following the same pattern as QuickSortModal:

```typescript
// Apply reallocation updates to contacts in Jazz
if (me) {
  const root = me.root as any;
  const allContactsArray = Array.from(root?.contacts || []);
  
  const updatedContactsList = allContactsArray.map((c: any) => {
    const contactId = c.id || c.sourceId;
    
    // Check if contact is moving down
    if (reallocationResult.movingDown.includes(contactId)) {
      return Contact.create({
        sourceId: c.sourceId,
        name: c.name,
        // ... all existing fields ...
        dunbarLayer: violatedLayer + 1,      // Move to next layer
        quickSortStatus: "sorted",           // Mark as sorted
        quickSortedAt: new Date().toISOString(),
      }, me);
    }
    
    // Check if contact is staying
    if (reallocationResult.staying.includes(contactId)) {
      return Contact.create({
        // ... all existing fields ...
        quickSortStatus: "sorted",           // Mark as sorted
        quickSortedAt: new Date().toISOString(),
      }, me);
    }
    
    return c; // Unchanged
  });
  
  const newContacts = ContactList.create(updatedContactsList, me);
  root.$jazz.set('contacts', newContacts);
}
```

---

## Data Flow Diagrams

### Tend Garden Flow
```
User taps contact category
    ↓
handleCategorySelect() called
    ↓
Create new Contact with updated fields:
  - dunbarLayer = selected layer
  - quickSortStatus = "sorted"
  - relationshipType = selected type
    ↓
Update contacts list in Jazz
    ↓
Dashboard re-analyzes
    ↓
Contact appears in correct layer
```

### Would You Rather Flow
```
User completes pairwise comparisons
    ↓
completeRanking() called
    ↓
finalizeRanking() creates ranked list
    ↓
reallocateContacts() calculates who stays/moves
    ↓
✅ NEW: Update contacts in Jazz
  - Moving contacts: dunbarLayer += 1, quickSortStatus = "sorted"
  - Staying contacts: quickSortStatus = "sorted"
    ↓
Save to Jazz database
    ↓
Trigger dashboard refresh via onRefresh callback
    ↓
Dashboard re-analyzes
    ↓
Contacts appear in correct layers
```

---

## Testing Checklist

### Scenario 1: Tend Garden Solo
- [ ] User has 50 unsorted contacts
- [ ] User opens Tend Garden
- [ ] User categorizes all 50 contacts
- [ ] User closes Tend Garden
- [ ] ✅ All 50 contacts appear in correct layers on dashboard
- [ ] ✅ Tend Garden button shows "0 remaining"
- [ ] ✅ Reopening Tend Garden shows "Garden Fully Tended"

### Scenario 2: Would You Rather Solo
- [ ] Layer 0 has 8 contacts (capacity: 5)
- [ ] Dunbar violation hero card appears
- [ ] User taps "Help Me Prioritize"
- [ ] User completes ~25-30 pairwise comparisons
- [ ] Ranking completes successfully
- [ ] ✅ Top 5 contacts remain in Layer 0
- [ ] ✅ Bottom 3 contacts move to Layer 1
- [ ] ✅ All 8 contacts marked as "sorted"
- [ ] ✅ Dashboard shows correct layer counts

### Scenario 3: Both Systems in Sequence
- [ ] User runs Tend Garden to categorize 100 contacts
- [ ] Some layers end up over capacity (e.g., Layer 1 has 20, capacity 15)
- [ ] Dunbar violation hero card appears
- [ ] User runs Would You Rather to resolve violation
- [ ] ✅ Contacts are moved correctly
- [ ] ✅ No contacts appear in Tend Garden again
- [ ] ✅ Dashboard reflects all changes

### Scenario 4: Edge Cases
- [ ] Contact with `lockedLayer` set → Should NOT move during Would You Rather
- [ ] Contact with `manualLayerOverride: true` → Should NOT move during Would You Rather
- [ ] Contact already sorted via Tend Garden → Should NOT appear in Tend Garden again
- [ ] Contact ranked via Would You Rather → Should NOT appear in Tend Garden

---

## Maintenance Guidelines

### Adding New Sorting Systems
If you need to add a new sorting mechanism in the future:

1. **Always update these fields:**
   - `dunbarLayer` - Where the contact belongs
   - `quickSortStatus` - Prevents re-sorting (set to "sorted")
   - `quickSortedAt` - Timestamp for auditing

2. **Follow the update pattern:**
   ```typescript
   // 1. Get all contacts from Jazz
   const root = me.root as any;
   const allContacts = Array.from(root?.contacts || []);
   
   // 2. Map to updated contacts
   const updatedContacts = allContacts.map(contact => {
     if (shouldUpdate(contact)) {
       return Contact.create({
         ...existingFields,
         dunbarLayer: newLayer,
         quickSortStatus: "sorted",
         quickSortedAt: new Date().toISOString(),
       }, me);
     }
     return contact;
   });
   
   // 3. Save to Jazz
   const newContactsList = ContactList.create(updatedContacts, me);
   root.$jazz.set('contacts', newContactsList);
   ```

3. **Trigger dashboard refresh:**
   - Either call `analyzeRelationships()` directly
   - Or use the `onRefresh` callback pattern

### Common Pitfalls to Avoid

❌ **Don't update layer without updating quickSortStatus**
```typescript
// BAD - Contact will appear in Tend Garden again
contact.dunbarLayer = 2;
```

✅ **Always update both fields**
```typescript
// GOOD - Contact properly marked as sorted
contact.dunbarLayer = 2;
contact.quickSortStatus = "sorted";
contact.quickSortedAt = new Date().toISOString();
```

❌ **Don't forget to save to Jazz**
```typescript
// BAD - Changes only in memory, lost on refresh
contact.dunbarLayer = 2;
```

✅ **Always save to Jazz**
```typescript
// GOOD - Changes persisted
const newContacts = ContactList.create(updatedContacts, me);
root.$jazz.set('contacts', newContacts);
```

❌ **Don't modify contacts directly**
```typescript
// BAD - Jazz CoMaps are immutable
existingContact.dunbarLayer = 2;
```

✅ **Always create new Contact instances**
```typescript
// GOOD - Create new Contact with Contact.create()
const updated = Contact.create({ ...existing, dunbarLayer: 2 }, me);
```

---

## Debugging Guide

### Issue: Contacts not appearing after sorting

**Check:**
1. Was `dunbarLayer` updated in Jazz?
   ```typescript
   console.log('Contact after sorting:', contact.dunbarLayer);
   ```

2. Was the update saved to Jazz?
   ```typescript
   const saved = root.contacts.find(c => c.id === contactId);
   console.log('Saved layer:', saved?.dunbarLayer);
   ```

3. Did dashboard refresh?
   ```typescript
   // In dashboard.tsx analyzeRelationships()
   console.log('Analyzing relationships...');
   ```

### Issue: Contacts appearing in Tend Garden again

**Check:**
1. Was `quickSortStatus` set to "sorted"?
   ```typescript
   console.log('Contact status:', contact.quickSortStatus);
   ```

2. Is the filter logic correct?
   ```typescript
   const unsorted = contacts.filter(
     c => c?.quickSortStatus === "not_sorted" || !c?.quickSortStatus
   );
   console.log('Unsorted count:', unsorted.length);
   ```

### Issue: Contacts in wrong layer

**Check:**
1. What was the intended layer?
   ```typescript
   console.log('Reallocation result:', reallocationResult);
   ```

2. What layer did it get assigned?
   ```typescript
   console.log('Final layer:', contact.dunbarLayer);
   ```

3. Are there any overrides?
   ```typescript
   console.log('Locked layer:', contact.lockedLayer);
   console.log('Manual override:', contact.manualLayerOverride);
   ```

---

## Performance Considerations

### Tend Garden
- **Complexity:** O(n) - One update per contact
- **Database Writes:** 1 per contact sorted
- **Recommended:** Sort in batches of 20-50 contacts at a time

### Would You Rather
- **Complexity:** O(n log n) - QuickSort algorithm
- **Comparisons:** ~25-30 for 20 contacts, ~65-80 for 50 contacts
- **Database Writes:** 1 bulk update after ranking complete
- **Recommended:** Use for layers with <100 contacts

### Optimization Tips
1. **Batch updates:** Update all contacts in a single Jazz transaction
2. **Debounce refresh:** Wait 500ms after sorting before refreshing dashboard
3. **Lazy loading:** Only load contact details when layer is opened
4. **Memoization:** Cache layer groupings until contacts change

---

## Related Documentation

- [Tend Garden Feature](./TEND_GARDEN.md)
- [Cultivation Ranking System](./CULTIVATION_RANKING.md)
- [Jazz Schema](../../jazz/schema.ts)
- [Dashboard Architecture](../../app/(tabs)/dashboard.tsx)

---

**Last Updated:** November 2, 2025  
**Status:** ✅ Both systems working correctly after fix
