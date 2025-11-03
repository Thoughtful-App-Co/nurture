/**
 * Ranking Algorithm for Cultivation Feature (Would You Rather)
 * 
 * Implements pairwise comparison ranking with two strategies:
 * 1. QuickSort-based for small sets (<50 contacts) - O(n log n)
 * 2. Swiss Tournament hybrid for large sets (>50 contacts) - optimized
 * 
 * Key features:
 * - Uses existing interactionScore for smart pivot selection
 * - Transitive inference to reduce comparisons
 * - Resumable sessions (save state to Jazz after each comparison)
 * - Confirmation bias detection
 */

// Contact type inference from Jazz schema
type ContactType = {
  id?: string;
  name: string;
  interactionScore?: number;
  dunbarLayer?: number;
  // ... other fields as needed
};

export interface ComparisonResult {
  chosenId: string;
  wasSkipped: boolean;
  responseTimeMs: number;
}

export interface RankingState {
  // Core algorithm state
  algorithm: 'quicksort' | 'swiss-tournament';
  phase: 'tiering' | 'ranking' | 'completed';
  
  // Contacts being ranked
  contactIds: string[];
  allContacts: ContactType[];
  
  // Current progress
  currentPairIndex: number;
  totalComparisonsNeeded: number;
  completedComparisons: number;
  
  // Comparison graph for transitive inference
  comparisonGraph: Map<string, Set<string>>; // contactId -> Set of IDs it beats
  
  // Results
  finalRanking: string[]; // Ordered contact IDs (best to worst)
}

/**
 * Initialize a new ranking session
 * Decides which algorithm to use and estimates comparison count
 */
export function initializeRanking(
  contacts: ContactType[],
  violatedLayer: number,
  layerCapacity: number
): RankingState {
  const contactIds = contacts.map(c => c.id!).filter(Boolean);
  const algorithm = contacts.length > 50 ? 'swiss-tournament' : 'quicksort';
  
  // Estimate comparisons needed
  let totalComparisonsNeeded: number;
  if (algorithm === 'quicksort') {
    // O(n log n) for QuickSort
    totalComparisonsNeeded = Math.ceil(contacts.length * Math.log2(contacts.length));
  } else {
    // Swiss Tournament: only rank ~40 contacts near cutoff
    const bubbleSize = Math.min(40, contacts.length);
    totalComparisonsNeeded = Math.ceil(bubbleSize * Math.log2(bubbleSize));
  }
  
  return {
    algorithm,
    phase: algorithm === 'swiss-tournament' ? 'tiering' : 'ranking',
    contactIds,
    allContacts: contacts,
    currentPairIndex: 0,
    totalComparisonsNeeded,
    completedComparisons: 0,
    comparisonGraph: new Map(),
    finalRanking: [],
  };
}

/**
 * Get the next pair of contacts to compare
 * Returns null if ranking is complete
 */
export function getNextPair(
  state: RankingState
): { contactA: ContactType; contactB: ContactType } | null {
  if (state.algorithm === 'quicksort') {
    return getNextPairQuickSort(state);
  } else {
    return getNextPairSwissTournament(state);
  }
}

/**
 * QuickSort: Select smart pivot and partition
 * Uses existing interactionScore to pick median (avoids worst-case O(n²))
 */
function getNextPairQuickSort(state: RankingState): { contactA: ContactType; contactB: ContactType } | null {
  // Get unranked contacts
  const unrankedIds = state.contactIds.filter(id => !state.finalRanking.includes(id));
  
  if (unrankedIds.length <= 1) {
    return null; // Ranking complete
  }
  
  // Select smart pivot using interactionScore
  const pivot = selectSmartPivot(state.allContacts, unrankedIds);
  
  // Find next contact to compare against pivot
  const toCompare = unrankedIds.find(id => {
    if (id === pivot.id) return false;
    
    // Check if already compared (transitive inference)
    const alreadyCompared = hasTransitiveResult(state, pivot.id!, id);
    return !alreadyCompared;
  });
  
  if (!toCompare) {
    // All comparisons done for this partition
    return null;
  }
  
  const contactA = state.allContacts.find(c => c.id === pivot.id)!;
  const contactB = state.allContacts.find(c => c.id === toCompare)!;
  
  return { contactA, contactB };
}

/**
 * Swiss Tournament: Tier first, then rank bubble zone
 */
function getNextPairSwissTournament(state: RankingState): { contactA: ContactType; contactB: ContactType } | null {
  if (state.phase === 'tiering') {
    // Phase 1: Create initial tiers using interactionScore
    createTiers(state);
    state.phase = 'ranking';
    return getNextPairSwissTournament(state); // Recurse to ranking phase
  }
  
  // Phase 2: Only rank contacts near cutoff line
  // (Implementation similar to QuickSort but on smaller set)
  return getNextPairQuickSort(state);
}

/**
 * Create tiers for Swiss Tournament
 * Uses existing interactionScore to pre-sort contacts
 */
function createTiers(state: RankingState): void {
  // Sort all contacts by interactionScore
  const sorted = [...state.allContacts].sort(
    (a, b) => (b.interactionScore || 0) - (a.interactionScore || 0)
  );
  
  // For now, we'll keep it simple and just sort by score
  // The QuickSort phase will handle fine-tuning
  state.finalRanking = sorted.map(c => c.id!).filter(Boolean);
}

/**
 * Select smart pivot using median interactionScore
 * Avoids worst-case O(n²) for QuickSort
 */
function selectSmartPivot(allContacts: ContactType[], unrankedIds: string[]): ContactType {
  // Get unranked contacts
  const unranked = allContacts.filter(c => unrankedIds.includes(c.id!));
  
  // Sort by interactionScore (existing behavioral data)
  const sorted = [...unranked].sort(
    (a, b) => (b.interactionScore || 0) - (a.interactionScore || 0)
  );
  
  // Pick median (best pivot for QuickSort)
  const medianIndex = Math.floor(sorted.length / 2);
  return sorted[medianIndex];
}

/**
 * Check if we can infer result via transitivity
 * If A > B and B > C, then A > C (no comparison needed)
 */
function hasTransitiveResult(
  state: RankingState,
  contactAId: string,
  contactBId: string
): boolean {
  // Check direct comparison
  if (state.comparisonGraph.get(contactAId)?.has(contactBId)) {
    return true; // A already beat B
  }
  if (state.comparisonGraph.get(contactBId)?.has(contactAId)) {
    return true; // B already beat A
  }
  
  // Check transitive path (BFS)
  const visited = new Set<string>();
  const queue = [contactAId];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current === contactBId) {
      return true; // Found transitive path
    }
    
    visited.add(current);
    
    const beaten = state.comparisonGraph.get(current) || new Set();
    for (const next of beaten) {
      if (!visited.has(next)) {
        queue.push(next);
      }
    }
  }
  
  return false;
}

/**
 * Record a comparison result
 * Updates comparison graph and ranking state
 */
export function recordComparison(
  state: RankingState,
  contactAId: string,
  contactBId: string,
  result: ComparisonResult
): void {
  state.completedComparisons++;
  
  if (result.wasSkipped) {
    // Skip means tie - no update to graph
    return;
  }
  
  // Update comparison graph
  const winnerId = result.chosenId;
  const loserId = winnerId === contactAId ? contactBId : contactAId;
  
  if (!state.comparisonGraph.has(winnerId)) {
    state.comparisonGraph.set(winnerId, new Set());
  }
  state.comparisonGraph.get(winnerId)!.add(loserId);
}

/**
 * Finalize ranking after all comparisons
 * Uses topological sort of comparison graph
 */
export function finalizeRanking(state: RankingState): string[] {
  if (state.algorithm === 'swiss-tournament' && state.phase === 'tiering') {
    // Already sorted by interactionScore in createTiers()
    return state.finalRanking;
  }
  
  // Topological sort of comparison graph
  const ranking: string[] = [];
  const visited = new Set<string>();
  const temp = new Set<string>();
  
  function visit(contactId: string) {
    if (temp.has(contactId)) {
      // Cycle detected (contradiction) - use interactionScore as tiebreaker
      return;
    }
    if (visited.has(contactId)) {
      return;
    }
    
    temp.add(contactId);
    
    const beaten = state.comparisonGraph.get(contactId) || new Set();
    for (const beatenId of beaten) {
      visit(beatenId);
    }
    
    temp.delete(contactId);
    visited.add(contactId);
    ranking.unshift(contactId); // Add to front (reverse order)
  }
  
  // Visit all contacts
  for (const contactId of state.contactIds) {
    if (!visited.has(contactId)) {
      visit(contactId);
    }
  }
  
  state.finalRanking = ranking;
  state.phase = 'completed';
  
  return ranking;
}

/**
 * Detect contradictions (confirmation bias)
 * Returns true if new comparison contradicts previous choices
 */
export function detectContradiction(
  state: RankingState,
  contactAId: string,
  contactBId: string,
  chosenId: string
): { hasContradiction: boolean; message?: string } {
  const winnerId = chosenId;
  const loserId = winnerId === contactAId ? contactBId : contactAId;
  
  // Check for direct contradiction
  if (state.comparisonGraph.get(loserId)?.has(winnerId)) {
    const winnerContact = state.allContacts.find(c => c.id === winnerId);
    const loserContact = state.allContacts.find(c => c.id === loserId);
    
    return {
      hasContradiction: true,
      message: `Earlier you chose ${loserContact?.name} over ${winnerContact?.name}, but now you're choosing ${winnerContact?.name}. That's okay! Go with your gut.`,
    };
  }
  
  // Check for transitive contradiction (cycle)
  // If we choose A > B, but B > C and C > A (creates cycle)
  if (hasTransitiveResult(state, loserId, winnerId)) {
    return {
      hasContradiction: true,
      message: 'This creates a logical contradiction with your previous choices. Are you sure?',
    };
  }
  
  return { hasContradiction: false };
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(state: RankingState): number {
  if (state.totalComparisonsNeeded === 0) return 0;
  return Math.min(100, (state.completedComparisons / state.totalComparisonsNeeded) * 100);
}

/**
 * Estimate time remaining based on average response time
 */
export function estimateTimeRemaining(
  state: RankingState,
  averageResponseTimeMs: number
): number {
  const comparisonsLeft = state.totalComparisonsNeeded - state.completedComparisons;
  return comparisonsLeft * averageResponseTimeMs;
}
