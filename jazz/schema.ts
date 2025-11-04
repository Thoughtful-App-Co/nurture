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
  
  // Business subcategories
  businessTier: z.enum(["CLOSE_COLLEAGUE", "ACQUAINTANCE"]).optional(),
  
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
 */
export const ContactList = co.list(Contact);

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
  hasCompletedOnboarding: z.boolean().optional(), // Track if user has completed initial onboarding
  hasCompletedContactAnalysis: z.boolean().optional(), // Track if one-time contact analysis is complete
  dataSharing: DataSharingConsent.optional(), // Opt-in data sharing for rebates
  contacts: ContactList,
  interactions: InteractionList,
  goals: GoalList,
  settings: UserSettings,
  familyNames: FamilyNames.optional(),
  rankingSessions: RankingSessionList.optional(), // Cultivation ranking sessions
  comparisons: ComparisonList.optional(), // All pairwise comparisons
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
