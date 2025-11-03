/**
 * Layer Reallocation Logic
 * 
 * After ranking session completes, reallocate contacts to appropriate layers
 * based on the final ranking results.
 * 
 * Key principles:
 * - Top N contacts stay in current layer (where N = layer capacity)
 * - Remaining contacts move down to next layer
 * - Track all changes for undo/analytics
 * - Respect manual overrides (lockedLayer, manualLayerOverride)
 */

type ContactType = {
  id?: string;
  name: string;
  dunbarLayer?: number;
  lockedLayer?: number;
  manualLayerOverride?: boolean;
  interactionScore?: number;
};

export interface LayerReallocationResult {
  staying: string[]; // Contact IDs staying in current layer
  movingDown: string[]; // Contact IDs moving to next layer
  updates: ContactUpdate[];
  summary: {
    layerNumber: number;
    layerName: string;
    previousCount: number;
    newCount: number;
    movedCount: number;
    stayedCount: number;
  };
}

export interface ContactUpdate {
  contactId: string;
  contactName: string;
  oldLayer: number;
  newLayer: number;
  reason: 'ranking_session' | 'manual_override' | 'locked';
  timestamp: string; // ISO date
}

/**
 * Reallocate contacts after ranking session completes
 */
export function reallocateContacts(
  rankedContactIds: string[], // Ordered best to worst from ranking session
  allContacts: ContactType[],
  violatedLayer: number,
  layerCapacity: number,
  layerName: string
): LayerReallocationResult {
  // Split ranked contacts at capacity line
  const stayingIds = rankedContactIds.slice(0, layerCapacity);
  const movingDownIds = rankedContactIds.slice(layerCapacity);
  
  // Check for manual overrides (locked layers)
  const manuallyLocked = allContacts.filter(c => 
    rankedContactIds.includes(c.id!) && 
    (c.lockedLayer !== undefined || c.manualLayerOverride)
  );
  
  // Create update records
  const updates: ContactUpdate[] = [];
  const now = new Date().toISOString();
  
  for (const contactId of movingDownIds) {
    const contact = allContacts.find(c => c.id === contactId);
    if (!contact) continue;
    
    // Check if manually locked
    if (contact.lockedLayer !== undefined) {
      console.log(`⚠️ Contact ${contact.name} is locked to layer ${contact.lockedLayer}, skipping reallocation`);
      continue;
    }
    
    if (contact.manualLayerOverride) {
      console.log(`⚠️ Contact ${contact.name} has manual override, skipping reallocation`);
      continue;
    }
    
    updates.push({
      contactId: contact.id!,
      contactName: contact.name,
      oldLayer: violatedLayer,
      newLayer: violatedLayer + 1,
      reason: 'ranking_session',
      timestamp: now,
    });
  }
  
  // Handle manually locked contacts (they stay regardless of ranking)
  for (const contact of manuallyLocked) {
    if (contact.lockedLayer === violatedLayer || contact.dunbarLayer === violatedLayer) {
      // Locked to current layer - ensure they stay
      if (!stayingIds.includes(contact.id!)) {
        stayingIds.push(contact.id!);
        console.log(`🔒 Keeping ${contact.name} in Layer ${violatedLayer} (manually locked)`);
      }
    }
  }
  
  const summary = {
    layerNumber: violatedLayer,
    layerName,
    previousCount: rankedContactIds.length,
    newCount: stayingIds.length,
    movedCount: updates.length,
    stayedCount: stayingIds.length,
  };
  
  console.log(`📊 Layer ${violatedLayer} Reallocation Summary:`);
  console.log(`  - Previous: ${summary.previousCount} contacts`);
  console.log(`  - Staying: ${summary.stayedCount} contacts`);
  console.log(`  - Moving down: ${summary.movedCount} contacts`);
  console.log(`  - Manually locked: ${manuallyLocked.length} contacts`);
  
  return {
    staying: stayingIds,
    movingDown: movingDownIds.filter(id => {
      const contact = allContacts.find(c => c.id === id);
      return contact && !contact.lockedLayer && !contact.manualLayerOverride;
    }),
    updates,
    summary,
  };
}

/**
 * Generate user-friendly summary text for reallocation
 */
export function generateReallocationSummary(result: LayerReallocationResult): string {
  const { summary } = result;
  
  if (summary.movedCount === 0) {
    return `All ${summary.newCount} contacts in ${summary.layerName} are staying put! 🎉`;
  }
  
  return `
✅ ${summary.layerName} is now balanced

${summary.stayedCount} contacts staying in ${summary.layerName}
${summary.movedCount} contacts moving to the next layer

This helps you focus on the relationships that matter most.
`.trim();
}

/**
 * Get list of contacts that will move (for preview before confirmation)
 */
export function getContactsToMove(
  rankedContactIds: string[],
  allContacts: ContactType[],
  layerCapacity: number
): { name: string; interactionScore: number }[] {
  const movingDownIds = rankedContactIds.slice(layerCapacity);
  
  return movingDownIds
    .map(id => {
      const contact = allContacts.find(c => c.id === id);
      return contact ? {
        name: contact.name,
        interactionScore: contact.interactionScore || 0,
      } : null;
    })
    .filter((c): c is { name: string; interactionScore: number } => c !== null);
}

/**
 * Validate reallocation (sanity checks)
 */
export function validateReallocation(
  rankedContactIds: string[],
  layerCapacity: number,
  violatedLayer: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if ranking has enough contacts
  if (rankedContactIds.length === 0) {
    errors.push('No contacts in ranking');
  }
  
  // Check if layer capacity is valid
  if (layerCapacity < 1) {
    errors.push('Layer capacity must be at least 1');
  }
  
  // Check if violatedLayer is valid
  if (violatedLayer < 0 || violatedLayer > 5) {
    errors.push('Violated layer must be between 0 and 5');
  }
  
  // Check if we're actually over capacity
  if (rankedContactIds.length <= layerCapacity) {
    errors.push(`Layer is not over capacity (${rankedContactIds.length} ≤ ${layerCapacity})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Analytics event for tracking layer reallocations
 */
export interface LayerReallocationAnalytics {
  sessionId: string;
  layer: number;
  layerName: string;
  stayingCount: number;
  movedCount: number;
  sessionDurationMs: number;
  totalComparisons: number;
  skipRate: number;
  contradictionCount: number;
  timestamp: string;
}

/**
 * Track layer reallocation for analytics
 */
export function trackLayerReallocation(
  sessionId: string,
  result: LayerReallocationResult,
  sessionDurationMs: number,
  totalComparisons: number,
  skipCount: number,
  contradictionCount: number
): LayerReallocationAnalytics {
  const skipRate = totalComparisons > 0 ? (skipCount / totalComparisons) * 100 : 0;
  
  const analytics: LayerReallocationAnalytics = {
    sessionId,
    layer: result.summary.layerNumber,
    layerName: result.summary.layerName,
    stayingCount: result.summary.stayedCount,
    movedCount: result.summary.movedCount,
    sessionDurationMs,
    totalComparisons,
    skipRate,
    contradictionCount,
    timestamp: new Date().toISOString(),
  };
  
  console.log('📊 Layer Reallocation Analytics:', analytics);
  
  // TODO: Send to analytics service
  
  return analytics;
}
