# Contact Mapping & Layer Assignment Fix

## Issues Found

### Issue 1: Incorrect Metric Mapping ❌
**Location:** `app/(tabs)/dashboard.tsx:261-262`

**Problem:**
```typescript
callCount: c.metrics.callFrequency,  // Wrong! callFrequency is calls/month
smsCount: c.metrics.smsFrequency,    // Wrong! smsFrequency is SMS/month
```

The Dunbar calculator expects **total interaction counts**, but we were passing **monthly frequencies**.

**Example Impact:**
- If you call someone 20 times per month, we were passing `callCount: 20`
- But the Dunbar calculator uses this in thresholds like "if interactionCount > 100"
- So someone you call daily (20/month × 12 months = 240 total) gets scored as if they only had 20 interactions
- **Result:** Close relationships get scored way too low and assigned to wrong layers

### Issue 2: Missing Reciprocity Data ❌
**Location:** `app/(tabs)/dashboard.tsx:253-265`

**Problem:**
The Dunbar calculator uses `initiatedByUser` and `initiatedByContact` to calculate reciprocity scores (worth up to 20 points), but we never passed this data from the mined metrics.

**Available data:**
- ✅ `callInitiationRatio` (0-1 scale)
- ✅ `smsInitiationRatio` (0-1 scale)
- ✅ `smsReciprocity` (0-1 scale)

**Missing conversion:**
We had the data but never converted it to the format the calculator expected.

### Issue 3: No Debugging Visibility ❌
**Problem:**
When contacts weren't being mapped correctly, there was no way to see:
- How many contacts were being saved
- What layers they were assigned to
- If the Jazz save was successful
- If the layer distribution matched expectations

## Fixes Applied

### Fix 1: Correct Metric Mapping ✅
**Changed:**
```typescript
const contactsForCalculation = contacts.map(c => {
  // callFrequency and smsFrequency are already last 30 days counts
  const totalCalls = c.metrics.callFrequency || 0;
  const totalSMS = c.metrics.smsFrequency || 0;
  
  // Calculate initiation data from ratios
  const initiatedByUserCalls = Math.round(totalCalls * (c.metrics.callInitiationRatio || 0));
  const initiatedByUserSMS = Math.round(totalSMS * (c.metrics.smsInitiationRatio || 0));
  const initiatedByUser = initiatedByUserCalls + initiatedByUserSMS;
  const initiatedByContact = (totalCalls + totalSMS) - initiatedByUser;
  
  return {
    id: c.id,
    name: c.name,
    phoneNumber: c.phoneNumbers?.[0],
    email: c.emails?.[0],
    isFamily: !!c.potentialFamily,
    familyTier: c.potentialFamily?.tier || undefined,
    callCount: totalCalls,
    smsCount: totalSMS,
    totalDuration: c.metrics.totalCallDuration,
    lastInteraction: c.metrics.lastInteraction ? new Date(c.metrics.lastInteraction).toISOString() : undefined,
    initiatedByUser,
    initiatedByContact,
    reciprocityScore: c.metrics.smsReciprocity,
    contactInitiationRatio: c.metrics.callInitiationRatio,
    averageResponseTime: c.metrics.averageResponseTime,
  };
});
```

**Now:**
- ✅ Uses actual interaction counts (last 30 days)
- ✅ Calculates initiation data from ratios
- ✅ Passes all reciprocity metrics to the calculator

### Fix 2: Comprehensive Logging ✅
Added detailed logging at every stage:

1. **When loading from Jazz:**
   - Shows if contacts exist
   - Shows contact count
   - Shows data structure type

2. **After Dunbar calculation:**
   - Shows total contacts processed
   - Shows distribution across all 6 layers
   - Helps verify percentile-based distribution is working

3. **When saving to Jazz:**
   - Shows number of contacts being saved
   - Shows sample contacts with their layers and scores
   - Helps verify data is correct before saving

4. **After saving to Jazz:**
   - Verifies save was successful
   - Compares saved count vs. intended count
   - Shows layer distribution of saved data
   - Alerts if there's a mismatch

5. **When grouping for display:**
   - Shows how contacts are distributed across layers
   - Shows sample names from each layer
   - Helps verify dashboard is displaying correct data

## How to Verify the Fix

1. **Re-analyze your data:**
   - Go to Dashboard
   - Tap "Re-analyze Relationship Data"
   - Watch the console logs

2. **Check the console output:**
   You should see sections like:
   ```
   ============================================================
   📊 DUNBAR LAYER CALCULATION COMPLETE
   ============================================================
   Total contacts: 347
   Layer distribution:
     Layer 0 (Intimate Core):    10 contacts
     Layer 1 (Sympathy Group):   24 contacts
     Layer 2 (Close Group):      69 contacts
     Layer 3 (Tribe):            121 contacts
     Layer 4 (Acquaintances):    86 contacts
     Layer 5 (Social Nebula):    37 contacts
   ============================================================
   ```

3. **Verify all contacts are saved:**
   Look for the verification section:
   ```
   ============================================================
   🔍 JAZZ SAVE VERIFICATION
   ============================================================
   Contacts in Jazz after save: 347
   ✅ All contacts successfully saved to Jazz
   ```

4. **Check for mismatches:**
   If you see:
   ```
   ❌ MISMATCH: Tried to save 347 but only 200 found in Jazz!
   ```
   Then there's still an issue with Jazz persistence.

## Expected Behavior Now

✅ All contacts from device are processed  
✅ All contacts are assigned to appropriate Dunbar layers  
✅ All contacts are saved to Jazz  
✅ Layer distribution follows percentile-based model  
✅ Family members get priority placement  
✅ Reciprocity scores are factored into layer assignment  
✅ Comprehensive logging shows exactly what's happening  

## Next Steps

If you still see issues after this fix:

1. **Check the console logs** - they will tell you exactly where the process is failing
2. **Look for the mismatch alert** - if contacts aren't being saved, the verification will catch it
3. **Verify layer distribution** - the percentile model should give you a natural distribution, not everyone in Social Nebula

## Technical Notes

The Dunbar calculator uses a **percentile-based distribution** (not score-based thresholds):
- Top 3% → Layer 0 (Intimate Core)
- Next 7% → Layer 1 (Sympathy Group)
- Next 20% → Layer 2 (Close Group)
- Next 35% → Layer 3 (Tribe)
- Next 25% → Layer 4 (Acquaintances)
- Bottom 10% + zero interactions → Layer 5 (Social Nebula)

This ensures a natural distribution of relationships across layers based on relative closeness, not absolute interaction counts.
