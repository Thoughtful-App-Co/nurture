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
}

interface LayerThreshold {
  layer: number;
  minScore: number;
  maxCount: number;
}

// Dunbar layer thresholds based on PRD
const LAYER_THRESHOLDS: LayerThreshold[] = [
  { layer: 0, minScore: 90, maxCount: 5 },    // Intimate Core (1-5)
  { layer: 1, minScore: 70, maxCount: 15 },   // Sympathy Group (5-15)
  { layer: 2, minScore: 50, maxCount: 50 },   // Close Group (15-50)
  { layer: 3, minScore: 30, maxCount: 150 },  // Tribe (50-150)
  { layer: 4, minScore: 10, maxCount: 250 },  // Acquaintances (150-250)
  { layer: 5, minScore: 0, maxCount: 9999 },  // Social Nebula (250+)
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
  
  // Normalize to 0-100 scale
  return Math.min(100, score);
}

/**
 * Assign Dunbar layers to contacts based on interaction scores
 * Uses PERCENTILE-BASED distribution to avoid overcrowding Social Nebula
 */
export async function calculateDunbarLayers(contacts: Contact[]): Promise<Contact[]> {
  // Step 1: Calculate interaction scores for all contacts
  const scoredContacts = contacts.map(contact => ({
    ...contact,
    interactionScore: calculateInteractionScore(contact),
  }));
  
  // Step 2: Sort by score (highest first)
  scoredContacts.sort((a, b) => (b.interactionScore || 0) - (a.interactionScore || 0));
  
  // Step 3: Filter out zero-interaction contacts (they go to Social Nebula)
  const activeContacts = scoredContacts.filter(c => (c.interactionScore || 0) > 0);
  const zeroInteractionContacts = scoredContacts.filter(c => (c.interactionScore || 0) === 0);
  
  // Step 4: Use PERCENTILE-BASED distribution (inspired by Dunbar research)
  // These percentages represent the natural distribution of relationship intimacy
  const layerPercentages = [
    { layer: 0, percentage: 0.03, name: 'Intimate Core' },      // Top 3% (1-5 people)
    { layer: 1, percentage: 0.07, name: 'Sympathy Group' },     // Next 7% (6-15 people) 
    { layer: 2, percentage: 0.20, name: 'Close Group' },        // Next 20% (16-50 people)
    { layer: 3, percentage: 0.35, name: 'Tribe' },              // Next 35% (51-150 people)
    { layer: 4, percentage: 0.25, name: 'Acquaintances' },      // Next 25% (151-250 people)
    { layer: 5, percentage: 0.10, name: 'Social Nebula' },      // Bottom 10% + zero interactions
  ];
  
  const totalActive = activeContacts.length;
  let currentIndex = 0;
  const layerCounts = [0, 0, 0, 0, 0, 0];
  
  // Step 5: Assign layers based on percentiles
  const layeredActiveContacts = activeContacts.map((contact, index) => {
    let assignedLayer = 5; // Default
    
    // Calculate which percentile this contact falls into
    const percentile = (index + 1) / totalActive;
    
    let cumulativePercentage = 0;
    for (const { layer, percentage } of layerPercentages) {
      cumulativePercentage += percentage;
      if (percentile <= cumulativePercentage) {
        assignedLayer = layer;
        layerCounts[layer]++;
        break;
      }
    }
    
    // Family members get a boost to higher layers
    if (contact.isFamily) {
      if (contact.familyTier === 'NUCLEAR' && assignedLayer > 1) {
        // Nuclear family should be in top 2 layers
        assignedLayer = Math.min(assignedLayer, 1);
      } else if (contact.familyTier === 'SECONDARY' && assignedLayer > 2) {
        // Secondary family should be in top 3 layers
        assignedLayer = Math.min(assignedLayer, 2);
      }
    }
    
    return {
      ...contact,
      dunbarLayer: assignedLayer,
    };
  });
  
  // Step 6: Assign zero-interaction contacts to Social Nebula
  const layeredZeroContacts = zeroInteractionContacts.map(contact => ({
    ...contact,
    dunbarLayer: 5, // Social Nebula
  }));
  
  layerCounts[5] += zeroInteractionContacts.length;
  
  // Step 7: Combine and sort by layer
  const allLayeredContacts = [...layeredActiveContacts, ...layeredZeroContacts];
  allLayeredContacts.sort((a, b) => {
    if (a.dunbarLayer !== b.dunbarLayer) {
      return a.dunbarLayer! - b.dunbarLayer!;
    }
    return (b.interactionScore || 0) - (a.interactionScore || 0);
  });
  
  // Log layer distribution for debugging
  console.log("Dunbar Layer Distribution (Percentile-Based):", {
    layer0_intimate: `${layerCounts[0]} (${((layerCounts[0] / contacts.length) * 100).toFixed(1)}%)`,
    layer1_sympathy: `${layerCounts[1]} (${((layerCounts[1] / contacts.length) * 100).toFixed(1)}%)`,
    layer2_close: `${layerCounts[2]} (${((layerCounts[2] / contacts.length) * 100).toFixed(1)}%)`,
    layer3_tribe: `${layerCounts[3]} (${((layerCounts[3] / contacts.length) * 100).toFixed(1)}%)`,
    layer4_acquaintances: `${layerCounts[4]} (${((layerCounts[4] / contacts.length) * 100).toFixed(1)}%)`,
    layer5_nebula: `${layerCounts[5]} (${((layerCounts[5] / contacts.length) * 100).toFixed(1)}%)`,
    total: contacts.length,
    active_contacts: totalActive,
    zero_interaction: zeroInteractionContacts.length,
  });
  
  return allLayeredContacts;
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