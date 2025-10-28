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
  
  // Family Structure
  isFamily: z.boolean().optional(),
  familyTier: z.enum(["NUCLEAR", "SECONDARY", "TERTIARY"]).optional(),
  familyRole: z.string().optional(), // "mother", "brother", "cousin", etc.
  
  // User Intent
  targetLayer: z.number().optional(), // desired layer
  cultivationGoal: z.enum(["MAINTAIN", "STRENGTHEN", "RECONNECT", "DEPRIORITIZE"]).optional(),
  notes: z.string().optional(),
  
  // Classification
  vertical: z.enum(["FRIENDS", "BUSINESS"]).optional(),
  tags: z.array(z.string()).optional(),
  
  createdAt: z.string(), // ISO date
});

/**
 * Represents an interaction/check-in with a contact
 */
export const Interaction = co.map({
  contactId: z.string(),
  date: z.string(), // ISO date
  type: z.enum(["face-to-face", "call", "text", "video", "email", "other"]),
  duration: z.number().optional(), // in minutes
  quality: z.number().min(1).max(5).optional(), // 1-5 rating
  notes: z.string().optional(),
  location: z.string().optional(),
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
 * Main user profile with all data
 */
export const UserProfile = co.map({
  displayName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  contacts: ContactList,
  interactions: InteractionList,
  goals: GoalList,
  settings: UserSettings,
  familyNames: FamilyNames.optional(),
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
