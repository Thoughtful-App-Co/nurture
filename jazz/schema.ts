/**
 * Nurture Jazz Schema
 * 
 * Defines the data models for relationships, connections, and user growth tracking.
 * Based on Nurture's core tenets of intentional relationship cultivation.
 */

import { co, z } from "jazz-tools";

// ============================================================================
// Contact & Relationship Models
// ============================================================================

/**
 * Represents a person in the user's social circle
 * Matches PRD Contact model
 */
export const Contact = co.map({
  sourceId: z.string().optional(), // Original device contact ID
  
  // Basic Info
  name: z.string(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  photoUrl: z.string().optional(),
  
  // Behavioral Metrics (calculated from interaction data)
  dunbarLayer: z.number().optional(), // 0-6
  interactionScore: z.number().optional(),
  lastInteraction: z.string().optional(), // ISO date
  interactionFrequency: z.number().optional(),
  reciprocityScore: z.number().optional(), // 0-1
  contactInitiationRatio: z.number().optional(), // 0-1
  averageResponseTime: z.number().optional(), // seconds
  
  // Raw interaction counts (for UI transparency)
  callCount: z.number().optional(), // Total calls in last 3 months
  smsCount: z.number().optional(), // Total SMS in last 3 months
  totalDuration: z.number().optional(), // Total call duration in seconds
  
  // Relationship Type & Family Structure
  relationshipType: z.enum(["FAMILY", "FRIEND", "BUSINESS"]).optional(),
  
  // Family subcategories
  isFamily: z.boolean().optional(),
  familyTier: z.enum(["NUCLEAR", "SECONDARY", "TERTIARY"]).optional(),
  familyRole: z.string().optional(), // "mother", "brother", "cousin", etc.
  
  // Friend connection context (how you met - orthogonal to Dunbar layers)
  connectionOrigin: z.enum(["FAMILY_FRIEND", "NEIGHBOR", "SCHOOL", "HOBBY_SPORTS", "WORK", "OTHER"]).optional(),
  
  // Connection context details
  schoolName: z.string().optional(), // Which school (if connectionOrigin is SCHOOL)
  hobbyName: z.string().optional(), // Which hobby (if connectionOrigin is HOBBY_SPORTS)
  workCompany: z.string().optional(), // Which company (if connectionOrigin is WORK)
  
  // Business subcategories
  businessTier: z.enum(["CONTACT", "ACQUAINTANCE", "COWORKER", "CLIENT"]).optional(),
  
  // Relationship depth signals
  knownSinceYear: z.number().optional(), // YYYY format - year met
  closeEnoughToVisit: z.enum(["YES", "NO", "SOMETIMES"]).optional(), // Physical proximity/relationship depth
  
  // User Intent & Manual Overrides
  targetLayer: z.number().optional(), // desired layer
  cultivationGoal: z.enum(["MAINTAIN", "STRENGTHEN", "RECONNECT", "DEPRIORITIZE"]).optional(),
  notes: z.string().optional(),
  manualLayerOverride: z.boolean().optional(), // Disable automatic strata placement
  lockedLayer: z.number().optional(), // User-locked layer (ignores algorithm)
  
  // Manual Tracking & Quality Signals
  qualityRating: z.number().min(1).max(5).optional(), // Average quality of recent interactions
  manuallyPinned: z.boolean().optional(), // Force into a specific layer regardless of data
  lastManualInteraction: z.string().optional(), // ISO date of last manual log
  
  // Classification
  vertical: z.enum(["FRIENDS", "BUSINESS"]).optional(),
  tags: z.array(z.string()).optional(),
  
  // Quick Sort Utility (prevents double-sorting)
  quickSortStatus: z.enum(["not_sorted", "sorted", "hidden"]).optional(), // Tracks if contact has been sorted
  quickSortedAt: z.string().optional(), // ISO date of when contact was quick-sorted
  
  // User-Intuitive Ranking (from Would You Rather sessions)
  // This is SEPARATE from interactionScore (which is algorithmic/data-driven)
  // intuitiveRank represents the user's explicit preference from manual sorting
  intuitiveRank: z.number().optional(), // 1-based rank from manual sorting (1 = highest priority)
  intuitiveRankedAt: z.string().optional(), // ISO date of when user last ranked this contact
  intuitiveRankingSessionId: z.string().optional(), // Which ranking session produced this rank
  
  createdAt: z.string(), // ISO date
});

/**
 * Represents an interaction/check-in with a contact
 * Can be automatically detected OR manually logged
 */
export const Interaction = co.map({
  contactId: z.string(),
  contactName: z.string(),
  date: z.string(), // ISO date
  type: z.enum(["face-to-face", "call", "text", "video", "email", "social-media", "other"]),
  duration: z.number().optional(), // in minutes
  quality: z.number().min(1).max(5), // 1-5 rating (required for manual entries)
  notes: z.string().optional(),
  platform: z.string().optional(), // e.g., "WhatsApp", "Instagram", "Zoom"
  location: z.string().optional(),
  source: z.enum(["manual", "automatic"]), // Track how it was logged
  createdAt: z.string(), // ISO date
});

/**
 * List of all interactions for the user
 */
export const InteractionList = co.list(Interaction);

/**
 * List of all contacts for the user
 * @deprecated Use layer-specific ContactSummaryList for better performance
 */
export const ContactList = co.list(Contact);

// ============================================================================
// Performance-Optimized Contact Structure (Reference-Based Lazy Loading)
// ============================================================================

/**
 * Lightweight contact summary for list views and dashboards
 * Contains only essential fields for display, references full Contact for details
 * 
 * Performance: ~200 bytes vs ~2KB for full Contact (10x reduction)
 */
export const ContactSummary = co.map({
  sourceId: z.string().optional(), // Original device contact ID
  
  // Essential display fields
  name: z.string(),
  dunbarLayer: z.number().optional(), // 0-6
  lastInteraction: z.string().optional(), // ISO date
  interactionScore: z.number().optional(),
  
  // Relationship classification
  relationshipType: z.enum(["FAMILY", "FRIEND", "BUSINESS"]).optional(),
  isFamily: z.boolean().optional(),
  familyTier: z.enum(["NUCLEAR", "SECONDARY", "TERTIARY"]).optional(),
  familyRole: z.string().optional(),
  
  // Quick sort state
  quickSortStatus: z.enum(["not_sorted", "sorted", "hidden"]).optional(),
  
  // Reference to full contact details (load on-demand)
  fullContactId: z.string(), // ID of the full Contact CoMap
  
  createdAt: z.string(), // ISO date
  lastUpdated: z.string().optional(), // ISO date
});

/**
 * List of contact summaries for a specific layer
 * Enables lazy loading per layer instead of loading all contacts upfront
 */
export const ContactSummaryList = co.list(ContactSummary);

// ============================================================================
// Goals & Intentions (Planting)
// ============================================================================

/**
 * Represents a relationship goal or intention
 */
export const RelationshipGoal = co.map({
  title: z.string(),
  description: z.string().optional(),
  category: z.enum(["planting", "tending", "pruning", "time-management"]),
  status: z.enum(["active", "completed", "archived"]),
  createdAt: z.string(), // ISO date
  targetDate: z.string().optional(), // ISO date
  relatedContacts: z.array(z.string()).optional(), // contact IDs
  progress: z.number().min(0).max(100), // Default 0 will be set in code
});

/**
 * List of relationship goals
 */
export const GoalList = co.list(RelationshipGoal);

// ============================================================================
// User Profile & Settings
// ============================================================================

/**
 * User preferences and settings
 */
export const UserSettings = co.map({
  notificationsEnabled: z.boolean(), // Default true will be set in code
  darkMode: z.boolean(), // Default true will be set in code
  checkInReminders: z.boolean(), // Default true will be set in code
  weeklyReviewDay: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]), // Default "sunday" will be set in code
  privacyLevel: z.enum(["full", "partial", "minimal"]), // Default "full" will be set in code
});

/**
 * Family names for smart contact matching
 * Used to identify potential family members
 */
export const FamilyNames = co.map({
  birthLastName: z.string().optional(),
  currentLastName: z.string().optional(),
  spouseLastName: z.string().optional(),
  otherFamilyNames: z.array(z.string()).optional(),
});

/**
 * Data sharing consent tracking
 * Enables users to opt-in to data sharing for rebates/credits
 */
export const DataSharingConsent = co.map({
  hasConsented: z.boolean(),
  consentedAt: z.string().optional(), // ISO date
  level: z.enum(["NONE", "ANONYMIZED", "FULL"]),
  lastUpdated: z.string().optional(), // ISO date
});

/**
 * Dashboard summary cache for performance
 * Pre-computed contact counts to avoid loading all contacts on dashboard load
 * Updated when contacts are added/removed/modified
 */
export const DashboardSummary = co.map({
  totalContacts: z.number(),
  layer0Count: z.number(), // Loved Ones (0-5)
  layer1Count: z.number(), // Inner Circle (5-15)
  layer2Count: z.number(), // Clan (15-50)
  layer3Count: z.number(), // Tribe (50-150)
  layer4Count: z.number(), // Acquaintances (150-500)
  layer5Count: z.number(), // Social Nebula (500-1500)
  hiddenCount: z.number(), // Graveyard contacts
  unsortedCount: z.number(), // Contacts needing Quick Sort
  lastUpdated: z.string(), // ISO date
});

// ============================================================================
// Cultivation Ranking System (Would You Rather - STORY-016)
// ============================================================================

/**
 * Represents a single pairwise comparison decision
 * Part of the "Would You Rather" gamified ranking system
 */
export const Comparison = co.map({
  contactAId: z.string(),
  contactBId: z.string(),
  contactAName: z.string(), // For display and debugging
  contactBName: z.string(),
  chosenId: z.string(), // ID of chosen contact
  questionId: z.string(), // Which question from bank
  questionText: z.string(), // Store text for analytics
  timestamp: z.string(), // ISO date
  responseTimeMs: z.number(), // Decision time in milliseconds
  wasSkipped: z.boolean(), // True if user skipped (counts as tie)
});

/**
 * List of all comparisons
 */
export const ComparisonList = co.list(Comparison);

/**
 * Represents an active ranking session for Dunbar violation resolution
 * 
 * Resumable - user can exit and return later
 * Persistent - saves after each comparison to Jazz
 * 
 * Algorithm: QuickSort (<50 contacts) or Swiss Tournament (>50 contacts)
 */
export const RankingSession = co.map({
  sessionId: z.string(),
  createdAt: z.string(), // ISO date
  lastUpdatedAt: z.string(), // ISO date
  expiresAt: z.string(), // ISO date (7 days max, prevents stale sessions)
  
  // Context - Which layer violation triggered this session
  violatedLayer: z.number(), // 0-4 (which layer is over capacity)
  violatedLayerName: z.string(), // "Loved Ones", "Inner Circle", "Clan", "Tribe", "Acquaintances"
  currentCapacity: z.number(), // How many people currently in layer
  maxCapacity: z.number(), // Layer's max capacity from LAYER_THRESHOLDS
  overageCount: z.number(), // How many need to be moved down
  
  // Algorithm state
  algorithm: z.enum(["mergesort", "quicksort", "swiss-tournament"]), // Merge sort for <50, Swiss for >50
  phase: z.enum(["sorting", "tiering", "ranking", "completed"]), // Merge sort uses sorting phase
  
  // Contacts being ranked (array of contact IDs)
  contactIds: z.array(z.string()), // All contacts in this ranking session
  
  // Current progress
  currentPairIndex: z.number(), // Which comparison we're on (0-indexed)
  totalComparisonsNeeded: z.number(), // Estimated total (O(n log n) for QuickSort)
  completedComparisons: z.number(), // How many comparisons completed so far
  
  // Comparison history (array of Comparison IDs)
  comparisonIds: z.array(z.string()), // References to Comparison objects
  
  // Results (populated after completion)
  finalRanking: z.array(z.string()).optional(), // Ordered contact IDs (best to worst)
  contactsStaying: z.array(z.string()).optional(), // IDs staying in current layer
  contactsMovingDown: z.array(z.string()).optional(), // IDs moving to next layer down
  
  // User experience
  questionBankSeed: z.number(), // Random seed for consistent question rotation
  skipCount: z.number(), // How many comparisons skipped (target: <5%)
  contradictionCount: z.number(), // How many contradictions detected (confirmation bias)
  
  // Session metadata
  status: z.enum(["active", "paused", "completed", "abandoned"]),
  completedAt: z.string().optional(), // ISO date
  totalDurationMs: z.number().optional(), // Total time spent in session
});

/**
 * List of all ranking sessions for the user
 */
export const RankingSessionList = co.list(RankingSession);

/**
 * Main user profile with all data
 */
export const UserProfile = co.map({
  displayName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  birthYear: z.number().optional(), // User's birth year (YYYY) - for friendship timeline features
  hasCompletedOnboarding: z.boolean().optional(), // Track if user has completed initial onboarding
  hasCompletedContactAnalysis: z.boolean().optional(), // Track if one-time contact analysis is complete
  dataSharing: DataSharingConsent.optional(), // Opt-in data sharing for rebates
  contacts: ContactList, // @deprecated Use layer-specific lists for better performance
  interactions: InteractionList,
  goals: GoalList,
  settings: UserSettings,
  familyNames: FamilyNames.optional(),
  rankingSessions: RankingSessionList.optional(), // Cultivation ranking sessions
  comparisons: ComparisonList.optional(), // All pairwise comparisons
  dashboardSummary: DashboardSummary.optional(), // Pre-computed dashboard metrics for performance
  
  // ============================================================================
  // Performance-Optimized: Layer-specific contact lists (lazy loading)
  // Load only the layer you need instead of all contacts upfront
  // ============================================================================
  layer0Contacts: ContactSummaryList.optional(), // Loved Ones (0-5)
  layer1Contacts: ContactSummaryList.optional(), // Inner Circle (5-15)
  layer2Contacts: ContactSummaryList.optional(), // Clan (15-50)
  layer3Contacts: ContactSummaryList.optional(), // Tribe (50-150)
  layer4Contacts: ContactSummaryList.optional(), // Acquaintances (150-500)
  layer5Contacts: ContactSummaryList.optional(), // Social Nebula (500-1500)
  hiddenContacts: ContactSummaryList.optional(), // Graveyard (hidden contacts)
  
  // Full contact details map (loaded on-demand by ID)
  // This is a map of contactId -> Contact for quick lookup
  fullContacts: ContactList.optional(), // Map of full Contact objects, accessed by ID
  
  createdAt: z.string(), // ISO date
  lastActive: z.string(), // ISO date
});

// ============================================================================
// Analytics & Insights (Private by Design)
// ============================================================================

/**
 * Relationship metrics and insights
 * These are computed locally and only shared if user opts in
 */
export const RelationshipInsights = co.map({
  weeklyInteractionCount: z.number(),
  faceToFacePercentage: z.number(),
  topContacts: z.array(z.string()), // contact IDs
  longestGaps: z.array(z.string()), // contact IDs with longest time since interaction
  qualityTrend: z.enum(["improving", "stable", "declining"]),
  computedAt: z.string(), // ISO date
});

// ============================================================================
// Export types for use in components
// ============================================================================

// Types are inferred from the schema definitions above
// Use with: const contact = useCoState(Contact, id);
