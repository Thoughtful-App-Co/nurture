/**
 * Dunbar Layer Calculator (STORY-003)
 * 
 * Algorithm to assign contacts to Dunbar layers based on interaction data.
 * Implements weighted scoring with exponential decay for recency.
 */

export interface Contact {
  id?: string;
  sourceId?: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  photoUrl?: string;
  
  // Behavioral metrics (calculated)
  dunbarLayer?: number;
  interactionScore?: number;
  lastInteraction?: string;
  interactionFrequency?: number;
  reciprocityScore?: number;
  contactInitiationRatio?: number;
  averageResponseTime?: number;
  
  // Family structure
  isFamily?: boolean;
  familyTier?: 'NUCLEAR' | 'SECONDARY' | 'TERTIARY';
  
  // Raw interaction data
  callCount?: number;
  smsCount?: number;
  totalDuration?: number;
  initiatedByUser?: number;
  initiatedByContact?: number;
  
  // Manual signals (override automatic detection)
  qualityRating?: number; // 1-5 average from manual logs
  manuallyPinned?: boolean;
}

interface LayerThreshold {
  layer: number;
  minScore: number;
  maxCount: number;
}

// Dunbar layer thresholds based on Dunbar's research
// IMPORTANT: Layers are INCLUSIVE/NESTED, not additive
// Layer 0 = 5 total, Layer 1 = 15 total (including Layer 0), etc.
const LAYER_THRESHOLDS: LayerThreshold[] = [
  { layer: 0, minScore: 90, maxCount: 5 },      // Loved Ones (1-5 total)
  { layer: 1, minScore: 70, maxCount: 10 },     // Inner Circle (6-15 total, adds 10)
  { layer: 2, minScore: 50, maxCount: 35 },     // Clan (16-50 total, adds 35)
  { layer: 3, minScore: 30, maxCount: 100 },    // Tribe (51-150 total, adds 100)
  { layer: 4, minScore: 10, maxCount: 350 },    // Acquaintances (151-500 total, adds 350)
  { layer: 5, minScore: 0, maxCount: 1000 },    // Social Nebula (501-1500 total, adds 1000)
];

/**
 * Calculate interaction score for a contact based on multiple factors
 */
function calculateInteractionScore(contact: Contact): number {
  let score = 0;
  
  // Base frequency score (0-30 points)
  const interactionCount = (contact.callCount || 0) + (contact.smsCount || 0);
  if (interactionCount > 100) score += 30;
  else if (interactionCount > 50) score += 25;
  else if (interactionCount > 20) score += 20;
  else if (interactionCount > 10) score += 15;
  else if (interactionCount > 5) score += 10;
  else if (interactionCount > 0) score += 5;
  
  // Call weight bonus (calls are 5x more valuable than SMS)
  const callWeight = (contact.callCount || 0) * 5;
  const smsWeight = (contact.smsCount || 0);
  const weightedInteractions = callWeight + smsWeight;
  if (weightedInteractions > 200) score += 20;
  else if (weightedInteractions > 100) score += 15;
  else if (weightedInteractions > 50) score += 10;
  else if (weightedInteractions > 20) score += 5;
  
  // Duration score (0-20 points) - quality indicator
  const avgDuration = (contact.callCount || 0) > 0 
    ? (contact.totalDuration || 0) / (contact.callCount || 1) 
    : 0;
  if (avgDuration > 600) score += 20; // 10+ min average
  else if (avgDuration > 300) score += 15; // 5+ min average
  else if (avgDuration > 120) score += 10; // 2+ min average
  else if (avgDuration > 60) score += 5; // 1+ min average
  
  // Reciprocity score (0-20 points)
  const totalInitiations = (contact.initiatedByUser || 0) + (contact.initiatedByContact || 0);
  if (totalInitiations > 0) {
    const reciprocity = Math.min(
      (contact.initiatedByContact || 0) / totalInitiations,
      (contact.initiatedByUser || 0) / totalInitiations
    ) * 2; // 0-1 scale, where 0.5 is perfect balance
    score += reciprocity * 20;
  }
  
  // Recency boost (0-10 points)
  if (contact.lastInteraction) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(contact.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceContact < 7) score += 10;
    else if (daysSinceContact < 14) score += 8;
    else if (daysSinceContact < 30) score += 6;
    else if (daysSinceContact < 60) score += 4;
    else if (daysSinceContact < 90) score += 2;
  }
  
  // Family boost (special consideration)
  if (contact.isFamily) {
    if (contact.familyTier === 'NUCLEAR') score += 15;
    else if (contact.familyTier === 'SECONDARY') score += 10;
    else if (contact.familyTier === 'TERTIARY') score += 5;
  }
  
  // ⭐ MANUAL SIGNALS - these can override automatic detection
  
  // Quality rating boost - quality over quantity
  if (contact.qualityRating) {
    // 1-star = +0, 5-star = +15 points
    score += (contact.qualityRating - 1) * 3.75;
  }
  
  // Normalize to 0-100 scale
  return Math.min(100, score);
}

/**
 * Assign Dunbar layers to contacts based on interaction scores
 * WITH BUMP ALGORITHMS to fill layers top-to-bottom when data is sparse
 */
export async function calculateDunbarLayers(contacts: Contact[]): Promise<Contact[]> {
  // Step 1: Calculate interaction scores for all contacts
  const scoredContacts = contacts.map(contact => ({
    ...contact,
    interactionScore: calculateInteractionScore(contact),
  }));
  
  // Step 2: Separate nuclear family from others
  const nuclearFamily = scoredContacts.filter(c => c.isFamily && c.familyTier === 'NUCLEAR');
  const nonNuclearContacts = scoredContacts.filter(c => !(c.isFamily && c.familyTier === 'NUCLEAR'));
  
  // Step 3: Sort both groups by score (highest first)
  nuclearFamily.sort((a, b) => (b.interactionScore || 0) - (a.interactionScore || 0));
  nonNuclearContacts.sort((a, b) => (b.interactionScore || 0) - (a.interactionScore || 0));
  
  // Step 4: Merge with nuclear family first (prioritize for intimate layers)
  const sortedContacts = [...nuclearFamily, ...nonNuclearContacts];
  
  console.log(`👨‍👩‍👧‍👦 Prioritizing ${nuclearFamily.length} nuclear family members for intimate layers`);
  
  // Step 5: Apply BUMP ALGORITHMS for contacts with zero interaction but strong signals
  // These should NOT automatically go to Social Nebula
  const contactsWithBumps = sortedContacts.map(contact => {
    let bumpedScore = contact.interactionScore || 0;
    const bumps: string[] = [];
    
    // BUMP #1: Family members ALWAYS get bumped to their tier minimum (OVERRIDE)
    // This ensures family members are placed appropriately even with low interaction data
    if (contact.isFamily) {
      if (contact.familyTier === 'NUCLEAR') {
        // Nuclear family = Layer 0/1 range (85-100 score)
        const minNuclearScore = 85;
        if (bumpedScore < minNuclearScore) {
          bumpedScore = Math.max(bumpedScore, minNuclearScore);
          bumps.push(`Nuclear family (score ${contact.interactionScore}) -> Layer 0-1 minimum`);
        }
      } else if (contact.familyTier === 'SECONDARY') {
        // Secondary family = Layer 2 range (60-70 score)
        const minSecondaryScore = 60;
        if (bumpedScore < minSecondaryScore) {
          bumpedScore = Math.max(bumpedScore, minSecondaryScore);
          bumps.push(`Secondary family (score ${contact.interactionScore}) -> Layer 2 minimum`);
        }
      } else {
        // Tertiary/Extended family = Layer 3 range (40-50 score)
        const minTertiaryScore = 40;
        if (bumpedScore < minTertiaryScore) {
          bumpedScore = Math.max(bumpedScore, minTertiaryScore);
          bumps.push(`Extended family (score ${contact.interactionScore}) -> Layer 3 minimum`);
        }
      }
    }
    
    // BUMP #2: High manual quality ratings bump up
    if (contact.qualityRating && contact.qualityRating >= 4 && bumpedScore < 50) {
      bumpedScore = Math.max(bumpedScore, 50); // Layer 2 minimum
      bumps.push(`Quality ${contact.qualityRating}⭐ -> Layer 2 minimum`);
    }
    
    // BUMP #3: Contacts in phone but no data should still be distributed across layers 2-4
    // This prevents EVERYONE going to layer 5 when there's no conversation data
    if (bumpedScore === 0 && !contact.isFamily) {
      // Give them a small baseline score so they can be distributed
      // This will be refined by the "fill top-to-bottom" algorithm below
      bumpedScore = 5; // Just above zero, will place in layer 4 by default
      bumps.push('Contact with no data -> Layer 4 baseline');
    }
    
    if (bumps.length > 0) {
      console.log(`🚀 BUMP: ${contact.name} - ${bumps.join(', ')}`);
    }
    
    return {
      ...contact,
      interactionScore: bumpedScore,
    };
  });
  
  // Re-sort after bumps
  contactsWithBumps.sort((a, b) => (b.interactionScore || 0) - (a.interactionScore || 0));
  
  const layerCounts = [0, 0, 0, 0, 0, 0];
  
  // Step 6: Assign layers based on SCORE THRESHOLDS with capacity limits
  const layeredContacts = contactsWithBumps.map(contact => {
    const score = contact.interactionScore || 0;
    let assignedLayer = 5; // Default to Social Nebula
    
    // Find the appropriate layer based on score thresholds
    for (const threshold of LAYER_THRESHOLDS) {
      if (score >= threshold.minScore) {
        // Check if this layer is at capacity
        if (layerCounts[threshold.layer] < threshold.maxCount) {
          assignedLayer = threshold.layer;
          break;
        }
      }
    }
    
    // Family members get special treatment
    if (contact.isFamily) {
      if (contact.familyTier === 'NUCLEAR') {
        // Nuclear family should be in top 2 layers (0 or 1)
        assignedLayer = Math.min(assignedLayer, 1);
        // If layer 0 is full, put in layer 1
        if (assignedLayer === 0 && layerCounts[0] >= LAYER_THRESHOLDS[0].maxCount) {
          assignedLayer = 1;
        }
      } else if (contact.familyTier === 'SECONDARY') {
        // Secondary family should be in top 3 layers (0-2)
        assignedLayer = Math.min(assignedLayer, 2);
      }
    }
    
    // High quality interactions boost placement
    if (contact.qualityRating && contact.qualityRating >= 4 && assignedLayer > 2) {
      assignedLayer = Math.min(assignedLayer, 2);
    }
    
    layerCounts[assignedLayer]++;
    
    return {
      ...contact,
      dunbarLayer: assignedLayer,
    };
  });
  
  // Step 7: SMART REDISTRIBUTION - Fill layers top-to-bottom if layer 5 is overcrowded
  // This handles the case where most contacts have no conversation data
  const layer5Count = layerCounts[5];
  const totalContacts = contacts.length;
  const layer5Percentage = (layer5Count / totalContacts) * 100;
  
  console.log(`📊 Layer 5 (Social Nebula): ${layer5Count} contacts (${layer5Percentage.toFixed(1)}%)`);
  
  // If more than 50% of contacts are in layer 5, redistribute them
  if (layer5Percentage > 50) {
    console.log(`🚨 WARNING: ${layer5Percentage.toFixed(1)}% of contacts in Layer 5 (Social Nebula)`);
    console.log(`🔄 REDISTRIBUTION: Filling layers top-to-bottom to prevent overcrowding`);
    
    // Get all layer 5 contacts sorted by any available signal
    const layer5Contacts = layeredContacts.filter(c => c.dunbarLayer === 5);
    
    // Re-sort layer 5 by priority signals (family > manual quality > alphabetical)
    layer5Contacts.sort((a, b) => {
      // Family first
      if (a.isFamily && !b.isFamily) return -1;
      if (!a.isFamily && b.isFamily) return 1;
      
      // Then quality rating
      const aQuality = a.qualityRating || 0;
      const bQuality = b.qualityRating || 0;
      if (aQuality !== bQuality) return bQuality - aQuality;
      
      // Then alphabetical
      return a.name.localeCompare(b.name);
    });
    
    // Redistribute into higher layers (fill 4 -> 3 -> 2)
    const layersToFill = [4, 3, 2]; // Acquaintances, Tribe, Clan
    let redistributed = 0;
    
    for (const contact of layer5Contacts) {
      // Try to place in the next available layer
      for (const targetLayer of layersToFill) {
        const threshold = LAYER_THRESHOLDS[targetLayer];
        if (layerCounts[targetLayer] < threshold.maxCount) {
          contact.dunbarLayer = targetLayer;
          layerCounts[5]--;
          layerCounts[targetLayer]++;
          redistributed++;
          break;
        }
      }
    }
    
    console.log(`✅ Redistributed ${redistributed} contacts from Layer 5 to Layers 2-4`);
  }
  
  // Step 8: Sort by layer, then by score within each layer
  layeredContacts.sort((a, b) => {
    if (a.dunbarLayer !== b.dunbarLayer) {
      return a.dunbarLayer! - b.dunbarLayer!;
    }
    return (b.interactionScore || 0) - (a.interactionScore || 0);
  });
  
  // Log layer distribution for debugging
  console.log("Dunbar Layer Distribution (Bump Algorithm):", {
    layer0_loved: `${layerCounts[0]} (${((layerCounts[0] / contacts.length) * 100).toFixed(1)}%)`,
    layer1_close: `${layerCounts[1]} (${((layerCounts[1] / contacts.length) * 100).toFixed(1)}%)`,
    layer2_clan: `${layerCounts[2]} (${((layerCounts[2] / contacts.length) * 100).toFixed(1)}%)`,
    layer3_tribe: `${layerCounts[3]} (${((layerCounts[3] / contacts.length) * 100).toFixed(1)}%)`,
    layer4_acquaintances: `${layerCounts[4]} (${((layerCounts[4] / contacts.length) * 100).toFixed(1)}%)`,
    layer5_nebula: `${layerCounts[5]} (${((layerCounts[5] / contacts.length) * 100).toFixed(1)}%)`,
    total: contacts.length,
  });
  
  return layeredContacts;
}

/**
 * Analyze network health based on Dunbar principles
 */
export function analyzeNetworkHealth(contacts: Contact[]): {
  totalActiveRelationships: number;
  withinDunbarNumber: boolean;
  layerBalance: number;
  cultivationOpportunities: number;
  recommendations: string[];
} {
  const activeLayers = contacts.filter(c => (c.dunbarLayer || 5) <= 3);
  const totalActive = activeLayers.length;
  const withinDunbar = totalActive <= 150;
  
  // Calculate layer balance (ideal distribution)
  const layerCounts = [0, 0, 0, 0, 0, 0];
  contacts.forEach(c => {
    layerCounts[c.dunbarLayer || 5]++;
  });
  
  // Ideal ratios based on Dunbar research
  const idealRatios = [0.03, 0.09, 0.21, 0.67]; // Layers 0-3
  let balanceScore = 0;
  
  if (totalActive > 0) {
    for (let i = 0; i < 4; i++) {
      const actual = layerCounts[i] / totalActive;
      const ideal = idealRatios[i];
      balanceScore += 1 - Math.abs(actual - ideal);
    }
    balanceScore /= 4; // Average across layers
  }
  
  // Find cultivation opportunities (dormant relationships)
  const dormantDays = 30;
  const cultivationOpportunities = contacts.filter(c => {
    if ((c.dunbarLayer || 5) > 3) return false;
    if (!c.lastInteraction) return true;
    
    const daysSince = Math.floor(
      (Date.now() - new Date(c.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince > dormantDays;
  }).length;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (!withinDunbar) {
    recommendations.push("Your network exceeds Dunbar's number. Consider pruning distant connections.");
  }
  
  if (layerCounts[0] < 3) {
    recommendations.push("You have few intimate connections. Focus on deepening close relationships.");
  }
  
  if (layerCounts[0] > 5) {
    recommendations.push("You may be spreading yourself thin. Not everyone can be in your inner circle.");
  }
  
  if (balanceScore < 0.5) {
    recommendations.push("Your network layers are imbalanced. Aim for natural distribution.");
  }
  
  if (cultivationOpportunities > 10) {
    recommendations.push(`${cultivationOpportunities} relationships need attention. Schedule check-ins.`);
  }
  
  return {
    totalActiveRelationships: totalActive,
    withinDunbarNumber: withinDunbar,
    layerBalance: balanceScore,
    cultivationOpportunities,
    recommendations,
  };
}