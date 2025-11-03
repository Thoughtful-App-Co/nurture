# Quick Reference: Sorting Systems

## 🚨 Critical Fields for Contact Sorting

Every time you update a contact's layer or categorization, you **MUST** update these fields:

```typescript
{
  dunbarLayer: number,              // 0-5 (where the contact belongs)
  quickSortStatus: "sorted",        // Prevents re-sorting
  quickSortedAt: ISO_DATE,         // Timestamp for auditing
}
```

## ✅ Correct Update Pattern

```typescript
// 1. Get all contacts
const root = me.root as any;
const allContacts = Array.from(root?.contacts || []);

// 2. Map to updated contacts
const updatedContacts = allContacts.map(contact => {
  if (shouldUpdate(contact)) {
    return Contact.create({
      ...contact,                    // Preserve all existing fields
      dunbarLayer: newLayer,         // Update layer
      quickSortStatus: "sorted",     // Mark as sorted
      quickSortedAt: new Date().toISOString(),
    }, me);
  }
  return contact;
});

// 3. Save to Jazz
const newContacts = ContactList.create(updatedContacts, me);
root.$jazz.set('contacts', newContacts);

// 4. Trigger refresh (if applicable)
onRefresh?.();
```

## ❌ Common Mistakes

### Mistake 1: Updating layer without quickSortStatus
```typescript
// BAD - Contact will appear in Tend Garden again
contact.dunbarLayer = 2;
```

### Mistake 2: Not saving to Jazz
```typescript
// BAD - Changes only in memory, lost on refresh
const updated = Contact.create({ ...contact, dunbarLayer: 2 }, me);
// Missing: root.$jazz.set('contacts', newContacts);
```

### Mistake 3: Modifying contact directly
```typescript
// BAD - Jazz CoMaps are immutable
existingContact.dunbarLayer = 2;
```

### Mistake 4: Forgetting to refresh
```typescript
// BAD - Dashboard shows stale data
root.$jazz.set('contacts', newContacts);
// Missing: onRefresh?.();
```

## 🔍 Quick Debugging

### Check if contact was updated in Jazz
```typescript
const saved = root.contacts.find(c => c.id === contactId);
console.log('Layer:', saved?.dunbarLayer);
console.log('Status:', saved?.quickSortStatus);
console.log('Sorted at:', saved?.quickSortedAt);
```

### Check if contact will appear in Tend Garden
```typescript
const willAppear = 
  contact.quickSortStatus === "not_sorted" || 
  !contact.quickSortStatus;
console.log('Will appear in Tend Garden:', willAppear);
```

### Check if contact is in correct layer
```typescript
const layer = layerStats[contact.dunbarLayer];
const isInLayer = layer?.contacts.some(c => c.id === contact.id);
console.log('Contact in correct layer:', isInLayer);
```

## 📋 The Two Sorting Systems

| System | Purpose | Updates dunbarLayer? | Updates quickSortStatus? |
|--------|---------|---------------------|------------------------|
| **Tend Garden** | Initial categorization | ✅ YES | ✅ YES |
| **Would You Rather** | Dunbar violation resolution | ✅ YES | ✅ YES |

Both systems now work correctly and prevent re-sorting.

## 🔗 Related Documentation

- [Full Sorting Systems Documentation](./features/SORTING_SYSTEMS.md)
- [Implementation Fix Details](./implementation/SORTING_SYSTEMS_FIX.md)
- [Tend Garden Feature](./features/TEND_GARDEN.md)
- [Cultivation Ranking](./features/CULTIVATION_RANKING.md)

---

**Last Updated:** November 2, 2025  
**Status:** ✅ Both systems working correctly
