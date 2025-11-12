# Jazz Tools 0.19.x Upgrade - Blocked by Breaking Changes

**Date**: 2025-11-12  
**Attempted Upgrade**: 0.18.30 → 0.19.1  
**Status**: ❌ BLOCKED - Requires extensive refactoring  
**Decision**: Stay on 0.18.30 for now

## Summary

Attempted to upgrade jazz-tools from 0.18.30 to 0.19.1 to potentially improve performance further after implementing the `$each` optimization. However, discovered significant breaking changes that require extensive refactoring across the entire codebase.

## Breaking Changes in 0.19.0

From the [Jazz CHANGELOG](https://github.com/garden-co/jazz/blob/main/packages/jazz-tools/CHANGELOG.md):

### 1. **useAccount Hook API Change**
**Before (0.18.x):**
```typescript
const { me, agent, logOut } = useAccount();
// me is Account | undefined | null
```

**After (0.19.x):**
```typescript
const me = useAccount();
// me is MaybeLoaded<Account>
// Returns Account directly, not an object
```

### 2. **Split into Multiple Hooks**
The `useAccount` hook was split into three separate hooks:
- `useAccount()` - Returns the Account CoValue only
- `useAgent()` - Returns the current agent
- `useLogOut()` - Returns the logout function

### 3. **New Loading State System**
Jazz 0.19 introduces explicit CoValue loading states:
- Added `$isLoaded` field to discriminate between loaded/unloaded
- Added `$jazz.loadingState` for detailed loading info
- All load methods now return `MaybeLoaded<CoValue>` instead of `CoValue | null | undefined`

**Must check if loaded before accessing properties:**
```typescript
const me = useAccount();

// OLD WAY (0.18.x)
if (!me) return <Loading />;
const contacts = me.root?.contacts;

// NEW WAY (0.19.x)
if (!me.$isLoaded) {
  switch (me.$jazz.loadingState) {
    case "unauthorized": return <Unauthorized />;
    case "unavailable": return <NotFound />;
    case "loading": return <Loading />;
  }
}
const contacts = me.root.contacts;
```

### 4. **Selector API Changes**
- Removed `useAccountWithSelector` and `useCoStateWithSelector`
- Added `select` option directly to `useAccount` and `useCoState`
- Added optional `equalityFn` for custom equality checking

### 5. **Schema-Level Resolve Queries**
Can now specify resolve queries at the schema level, which will be used by default when loading CoValues.

## Impact on Nurture Codebase

### Files Requiring Changes: 40+

**Critical Path (8 files):**
1. `app/(tabs)/dashboard.tsx` - Main dashboard
2. `app/index.tsx` - Auth/onboarding flow
3. `components/relationships/QuickSortModal.tsx`
4. `components/relationships/WouldYouRatherModal.tsx`
5. `components/relationships/OverflowSelectionModal.tsx`
6. `components/relationships/GraveyardScreen.tsx`
7. `components/relationships/InteractionStatsScreen.tsx`
8. `components/dev/JazzInspector.tsx`

**Additional Files:**
- 30+ other components that use `const { me } = useAccount()`
- All places where CoValues are created with `.create(data, me)`
- All places where `me` is passed as an owner parameter

### Example Required Changes

**1. Simple useAccount conversion:**
```typescript
// BEFORE
const { me } = useAccount();
if (!me) return <Loading />;
const root = me.root as any;

// AFTER
const me = useAccount();
if (!me.$isLoaded) {
  return <Loading message={me.$jazz.loadingState} />;
}
const root = me.root;
```

**2. CoValue creation:**
```typescript
// BEFORE
const contact = Contact.create(data, me);

// AFTER  
if (!me.$isLoaded) return; // Can't create if not loaded
const contact = Contact.create(data, me);
```

**3. Optional chaining patterns:**
```typescript
// BEFORE
const contacts = me?.root?.contacts;

// AFTER
const contacts = me.$isLoaded ? me.root.contacts : undefined;
```

## Effort Estimate

- **Simple refactors**: 30-40 files × 5 min = 2-3 hours
- **Complex refactors** (dashboard, modals): 5-8 hours
- **Testing**: 3-4 hours
- **Bug fixes**: 2-3 hours
- **Total**: 12-18 hours of work

## Why We're Not Upgrading Now

1. **Current Performance is Acceptable**
   - The `$each` optimization already provides significant improvement
   - From 33s baseline, seeing notable improvements
   - Additional performance gains from 0.19.x are unclear

2. **High Risk, Unclear Benefit**
   - Breaking changes affect 40+ files
   - Risk of introducing bugs in critical paths
   - No clear indication that 0.19.x has better CoMap performance

3. **API is Still Stabilizing**
   - Jazz went from 0.18.30 (Oct 27) to 0.19.1 (Nov 7) in 11 days
   - Major API changes suggest the library is still maturing
   - Better to wait for API stability

4. **Other Optimizations Available**
   - Phase 2: Schema decomposition (ContactCore + ContactMetrics)
   - Phase 3: Layer-based collections
   - Phase 4: Virtual scrolling
   - These may provide better ROI with less risk

## When to Reconsider Upgrade

Consider upgrading to 0.19.x or later when:

1. **API Stabilizes**
   - No major breaking changes for 2-3 months
   - Jazz reaches 1.0 or indicates API stability

2. **Clear Performance Benefits**
   - Jazz team reports significant CoMap performance improvements
   - Community reports measurable gains for our use case

3. **We Hit Performance Ceiling**
   - Exhausted other optimization strategies
   - Still need more performance improvements
   - 0.19.x demonstrates clear benefits for our bottlenecks

4. **We Have Development Bandwidth**
   - Not during critical feature development
   - Have 1-2 weeks for thorough testing
   - Can handle potential rollback if needed

## Alternative Path Forward

Instead of upgrading Jazz, focus on these optimizations:

### Phase 2: Schema Decomposition (1-2 weeks)
```typescript
// Split Contact into smaller CoMaps
export const ContactCore = co.map({
  name, phoneNumber, dunbarLayer, quickSortStatus
});

export const ContactMetrics = co.map({
  interactionScore, callCount, smsCount, etc.
});

export const Contact = co.map({
  core: ContactCore,  // Always loaded
  metricsId: z.string().optional(),  // Load on demand
});
```

**Benefits:**
- Load only what's needed per screen
- Dashboard: 5 fields instead of 40
- Estimated 2-3x additional performance improvement

### Phase 3: Layer-Based Collections (2-3 weeks)
```typescript
export const UserProfile = co.map({
  layer0Contacts: LayerContactList,
  layer1Contacts: LayerContactList,
  // One list per layer
});
```

**Benefits:**
- Load only the layer being viewed
- No filtering needed
- Estimated 2-4x improvement for layer views

### Phase 4: Virtual Scrolling (1 week)
- Implement FlashList for large contact lists
- Render only visible items
- Handles 10,000+ contacts smoothly

## Conclusion

The jazz-tools 0.19.x upgrade is blocked by extensive breaking changes that require significant refactoring effort. Given that:

1. We've already achieved notable performance improvements with `$each`
2. Other optimization strategies are available with less risk
3. The API is still evolving rapidly
4. The effort-to-benefit ratio is unclear

**Decision: Stay on jazz-tools 0.18.30** and pursue schema decomposition and layer-based collections for further performance gains.

## References

- [Jazz CHANGELOG - 0.19.0](https://github.com/garden-co/jazz/blob/main/packages/jazz-tools/CHANGELOG.md)
- [Jazz Documentation - Loading States](https://jazz.tools/docs/react/using-covalues/loading-data)
- [Jazz Discord - 0.19 Migration Discussion](https://discord.gg/utDMjHYg42)
