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
 */
export const Contact = co.map({
  name: z.string(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string(), // ISO date
  lastInteraction: z.string().optional(), // ISO date
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
  progress: z.number().min(0).max(100).default(0),
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
  notificationsEnabled: z.boolean().default(true),
  darkMode: z.boolean().default(true),
  checkInReminders: z.boolean().default(true),
  weeklyReviewDay: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).default("sunday"),
  privacyLevel: z.enum(["full", "partial", "minimal"]).default("full"),
});

/**
 * Main user profile with all data
 */
export const UserProfile = co.map({
  displayName: z.string(),
  email: z.string().email().optional(),
  contacts: ContactList,
  interactions: InteractionList,
  goals: GoalList,
  settings: UserSettings,
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
