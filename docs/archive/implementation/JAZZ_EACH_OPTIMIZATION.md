# Performance Optimization: $each Implementation

**Date**: 2025-11-12  
**Optimization Type**: N+1 Query Prevention  
**Status**: ✅ Implemented  
**Expected Impact**: High - Batch loading instead of sequential loads

## Problem Summary

The Nurture app was experiencing significant performance issues due to an **N+1 query problem** with Jazz CoMaps:

- Each `Array.from(contacts)` triggered **sequential loading** of individual Contact CoMaps
- For a user with 500 contacts, this meant **500+ sequential fetches** on dashboard load
- No use of Jazz's `$each` optimization for batch loading
- Multiple components loaded contacts independently, multiplying the problem

## Solution Implemented

Added `$each: true` to all `useAccount()` hooks that access contacts. This tells Jazz to **batch-load all contacts in a single operation** instead of loading them one-by-one.

### Changes Made

**Pattern Applied:**
```typescript
// BEFORE (N+1 problem)
const { me } = useAccount();

// AFTER (batch loading)
const { me } = useAccount(undefined, {
  resolve: {
    root: {
      contacts: { $each: true },  // Batch load all contacts
      dashboardSummary: true,      // Load other data as needed
    }
  }
});
```

### Files Modified

1. **app/(tabs)/dashboard.tsx** ⚡ HIGH PRIORITY
   - Most critical - dashboard is the main entry point
   - Added resolve for contacts, dashboardSummary, and familyNames
   
2. **components/relationships/QuickSortModal.tsx** ⚡ HIGH PRIORITY
   - Used during contact classification
   - Loads all unsorted contacts
   
3. **components/relationships/WouldYouRatherModal.tsx** ⚡ HIGH PRIORITY
   - Used for Dunbar layer ranking
   - Loads contacts in violated layers
   
4. **components/relationships/OverflowSelectionModal.tsx** ⚡ HIGH PRIORITY
   - Quick selection for large contact groups
   - Loads all contacts in a layer
   
5. **components/relationships/GraveyardScreen.tsx** ⚡ HIGH PRIORITY
   - Displays hidden contacts
   - Needs to load all contacts to filter hidden ones
   
6. **components/relationships/InteractionStatsScreen.tsx** 🔶 MEDIUM PRIORITY
   - Shows interaction statistics
   - May load contacts for context
   
7. **components/dev/JazzInspector.tsx** 🔷 LOW PRIORITY
   - Development tool for debugging
   - Added resolve for contacts, interactions, goals
   
8. **app/index.tsx** 🔶 MEDIUM PRIORITY
   - App entry point / auth flow
   - Checks for existing contacts during onboarding

## How It Works

### Before (N+1 Problem)
```
User opens dashboard
  → Load UserProfile
    → Access contacts list
      → Array.from(contacts) triggered
        → Load Contact 1 (fetch 1)
        → Load Contact 2 (fetch 2)
        → Load Contact 3 (fetch 3)
        → ... (N sequential fetches)
        
Total time: N × latency
Example: 500 contacts × 10ms = 5 seconds 😱
```

### After ($each optimization)
```
User opens dashboard
  → Load UserProfile with resolve config
    → Jazz sees $each: true
      → Batch load ALL contacts in one operation
        
Total time: 1 × latency
Example: 500 contacts in ~50ms ⚡
```

## Expected Performance Improvements

### Dashboard Load Time
- **Before**: 3-5 seconds (500 sequential loads)
- **After**: 500-800ms (1 batch load)
- **Improvement**: ~5-10x faster

### Layer Detail View
- **Before**: 1-2 seconds (50-150 sequential loads)
- **After**: 200-400ms (1 batch load)
- **Improvement**: ~4-8x faster

### Quick Sort / Ranking
- **Before**: 500ms+ per contact update
- **After**: 100-200ms per update
- **Improvement**: ~3-5x faster

### Memory Usage
- **Before**: Contacts loaded multiple times by different components
- **After**: Contacts loaded once and shared via Jazz cache
- **Improvement**: ~30-50% reduction in memory usage

## Testing Checklist

To verify the performance improvements:

### 1. Dashboard Load Time
```
1. Clear app data / fresh install
2. Import 100+ contacts
3. Time dashboard initial load
4. Should be < 1 second
```

### 2. Layer Navigation
```
1. Open dashboard
2. Tap a layer with 50+ contacts
3. Layer detail should load instantly
4. No visible loading delay
```

### 3. Contact Sorting
```
1. Open "Tend Garden" (Quick Sort)
2. Sort through 20+ contacts
3. Each swipe should be instant
4. No lag between cards
```

### 4. Search Performance
```
1. Open contact search
2. Search should be instant
3. Results update as you type
4. No loading spinner
```

### 5. Memory Monitoring
```
1. Check app memory usage in dev tools
2. Navigate between screens
3. Memory should stay stable
4. No memory leaks from repeated loads
```

## Technical Details

### Jazz $each Behavior

From Jazz documentation:
- `$each: true` tells Jazz to pre-load all items in a CoList
- Jazz optimizes this into a single batch operation
- Items are cached and shared across components
- Reduces network roundtrips from N to 1

### Why This Works

1. **Batch Loading**: Jazz fetches all contacts in one operation
2. **Caching**: Loaded contacts are cached by Jazz
3. **Sharing**: Multiple components access the same cached data
4. **Consistency**: All components see the same snapshot

### Resolve Query Structure

```typescript
{
  resolve: {
    root: {
      contacts: { $each: true },      // Load all contacts
      dashboardSummary: true,         // Load summary
      familyNames: true,              // Load family names
      interactions: { $each: true },  // Load all interactions (if needed)
    }
  }
}
```

## Next Steps & Future Optimizations

This is Phase 1 of performance improvements. Future optimizations:

### Phase 2: Schema Decomposition (2 weeks)
- Split Contact into ContactCore + ContactMetrics + ContactRelationship
- Load only what's needed per screen
- Dashboard: Only ContactCore (5 fields vs 40)
- Further 2-3x performance improvement

### Phase 3: Layer-Based Collections (3 weeks)
- Separate CoLists for each Dunbar layer
- Load only the layer being viewed
- Eliminates filtering overhead
- Further 2-4x improvement for layer views

### Phase 4: Virtual Scrolling (1 week)
- Implement FlashList for large contact lists
- Render only visible contacts
- Handles 10,000+ contacts smoothly

### Phase 5: Lazy Loading Patterns (1 week)
- Load contact details on-demand
- Progressive loading for better UX
- Perceived performance improvement

## Risk Assessment

**Risk Level**: LOW ✅

### What Could Go Wrong?
1. **Over-eager loading**: Loading all contacts upfront might use more memory
   - **Mitigation**: Still better than N sequential loads; contacts are needed anyway
   
2. **Initial load time**: First load might take longer
   - **Mitigation**: Only happens once; much faster than N+1 problem
   
3. **Jazz compatibility**: Resolve syntax might change
   - **Mitigation**: Using documented Jazz API; easy to update

### Rollback Plan
If issues occur:
1. Remove `resolve` parameter from useAccount() calls
2. Revert to plain `const { me } = useAccount()`
3. Falls back to original (slower) behavior

## Monitoring & Metrics

Add performance logging to track improvements:

```typescript
// In dashboard.tsx
useEffect(() => {
  const startTime = performance.now();
  
  if (me?.root?.contacts) {
    const loadTime = performance.now() - startTime;
    console.log(`📊 Dashboard load time: ${loadTime.toFixed(0)}ms`);
    console.log(`📦 Contacts loaded: ${me.root.contacts.length}`);
  }
}, [me?.root?.contacts]);
```

## References

- [Jazz Documentation - Performance](https://jazz.tools/docs/react/performance)
- [Jazz Documentation - Deep Loading](https://jazz.tools/docs/react/using-covalues/loading-data)
- [N+1 Query Problem](https://www.geeksforgeeks.org/n1-query-problem/)

## Conclusion

This optimization addresses the most critical performance bottleneck in Nurture by implementing Jazz's recommended `$each` pattern for batch loading. It's a low-risk, high-impact change that should result in 5-10x faster load times across the app.

**Next Action**: Test on device with 100+ contacts and measure actual performance improvements.
