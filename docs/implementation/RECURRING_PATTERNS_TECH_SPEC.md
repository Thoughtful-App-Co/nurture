# Recurring Patterns - Technical Specification

**Feature**: STORY-021 - Recurring Interaction Patterns  
**Status**: Design Phase  
**Priority**: P0 - Critical for MVP  
**Author**: Engineering Team  
**Last Updated**: 2025-11-04

---

## Overview

This document provides the technical specification for implementing recurring interaction patterns in Nurture. It covers schema changes, algorithm modifications, data flow, and implementation considerations.

---

## Schema Changes

### 1. New Model: RecurringPattern

**File**: `/jazz/schema.ts`

```typescript
/**
 * Represents a recurring interaction pattern
 * Examples: "I live with this person", "Weekly soccer game", "Daily standup meeting"
 */
export const RecurringPattern = co.map({
  id: z.string(),
  title: z.string(), // "Living together", "Soccer team", "Work colleagues"
  description: z.string().optional(),
  
  // Contacts involved (can be 1 or many)
  contactIds: z.array(z.string()),
  
  // Pattern type (for analytics and smart suggestions)
  patternType: z.enum([
    "COHABITATION",     // Living together (roommates, family)
    "WORK",             // Work colleagues (office, remote team)
    "HOBBY_SPORTS",     // Regular hobby/sports activity
    "FAMILY_ROUTINE",   // Regular family time (dinners, visits)
    "SOCIAL_RECURRING", // Regular social events (game nights, etc.)
    "STUDY_PROJECT",    // School/work projects with regular meetings
    "CUSTOM"            // User-defined
  ]),
  
  // Time commitment
  frequency: z.enum([
    "DAILY",      // Every day
    "WEEKLY",     // Once per week
    "BIWEEKLY",   // Every 2 weeks
    "MONTHLY",    // Once per month
    "CUSTOM"      // Irregular pattern (user specifies)
  ]),
  
  // Duration per occurrence
  hoursPerOccurrence: z.number(), // e.g., 3 hours for soccer game
  
  // For daily patterns, total hours per day
  hoursPerDay: z.number().optional(), // e.g., 8 hours/day for roommate
  
  // For weekly patterns, total hours per week
  hoursPerWeek: z.number().optional(), // e.g., 40 hours/week for coworkers
  
  // Schedule details (for non-daily patterns)
  schedule: z.object({
    daysOfWeek: z.array(z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])).optional(),
    timeOfDay: z.string().optional(), // "18:00" for 6pm
    specificDates: z.array(z.string()).optional(), // For monthly or irregular
  }).optional(),
  
  // Quality/intensity of interaction
  interactionQuality: z.number().min(1).max(5), // How meaningful is this time? (1-5 stars)
  
  interactionIntensity: z.enum([
    "LOW",    // Present but not deeply engaged (e.g., open office, passive coexistence)
    "MEDIUM", // Normal interaction level (conversation, collaboration)
    "HIGH"    // Deep engagement (living together, close team, intense activity)
  ]),
  
  // Lifecycle metadata
  startDate: z.string(), // When did this pattern start? (ISO date)
  endDate: z.string().optional(), // When did it end? (for past patterns)
  isActive: z.boolean(), // Currently active?
  
  // Auto-generation settings
  autoGenerateInteractions: z.boolean(), // Should this create interaction logs automatically?
  lastGeneratedDate: z.string().optional(), // Last time we generated logs
  
  // User notes
  notes: z.string().optional(),
  
  createdAt: z.string(), // ISO date
  updatedAt: z.string(), // ISO date
});

export const RecurringPatternList = co.list(RecurringPattern);
```

### 2. Update: UserProfile

```typescript
export const UserProfile = co.map({
  displayName: z.string(),
  email: z.string().optional(),
  // ... existing fields
  
  // NEW: Recurring patterns
  recurringPatterns: RecurringPatternList.optional(),
  
  contacts: ContactList,
  interactions: InteractionList,
  // ... rest of fields
});
```

### 3. Update: Contact

```typescript
export const Contact = co.map({
  id: z.string(),
  userId: z.string(),
  // ... existing basic info
  
  // NEW: References to recurring patterns this contact is in
  recurringPatternIds: z.array(z.string()).optional(),
  
  // NEW: Aggregated time from all recurring patterns (calculated field)
  totalRecurringHoursPerWeek: z.number().optional(),
  
  // Existing behavioral metrics
  dunbarLayer: z.number().optional(),
  interactionScore: z.number().optional(),
  // ... rest of fields
});
```

### Migration Strategy

```typescript
/**
 * Migration for existing users
 * Run once on app upgrade to v1.1
 */
export async function migrateToRecurringPatterns(userProfile: UserProfile) {
  // Check if already migrated
  if (userProfile.recurringPatterns !== undefined) {
    return; // Already migrated
  }
  
  // Initialize empty recurring patterns list
  userProfile.recurringPatterns = RecurringPatternList.create([], {
    owner: userProfile._owner
  });
  
  // Initialize recurringPatternIds on all contacts
  const contacts = userProfile.contacts;
  if (contacts) {
    for (const contact of contacts) {
      if (!contact.recurringPatternIds) {
        contact.recurringPatternIds = [];
      }
      if (!contact.totalRecurringHoursPerWeek) {
        contact.totalRecurringHoursPerWeek = 0;
      }
    }
  }
  
  console.log('✅ Migration complete: Recurring patterns initialized');
}
```

---

## Algorithm Changes

### 1. Updated Interaction Score Calculation

**File**: `/services/dataMining.ts`

**Current Function Signature**:
```typescript
function calculateInteractionScore(metrics: {
  callFrequency: number;
  totalCallDuration: number;
  smsFrequency: number;
  smsReciprocity: number;
  lastInteraction: number | null;
}): number
```

**New Function Signature**:
```typescript
function calculateInteractionScore(metrics: {
  // Existing digital metrics
  callFrequency: number;
  totalCallDuration: number;
  smsFrequency: number;
  smsReciprocity: number;
  lastInteraction: number | null;
  
  // NEW: Recurring pattern metrics
  recurringHoursPerWeek?: number;
  recurringQuality?: number; // 1-5
  recurringIntensity?: 'LOW' | 'MEDIUM' | 'HIGH';
}): number
```

**Implementation**:
```typescript
export function calculateInteractionScore(metrics: {
  // Existing digital metrics
  callFrequency: number;
  totalCallDuration: number;
  smsFrequency: number;
  smsReciprocity: number;
  lastInteraction: number | null;
  
  // NEW: Recurring pattern metrics
  recurringHoursPerWeek?: number;
  recurringQuality?: number; // 1-5
  recurringIntensity?: 'LOW' | 'MEDIUM' | 'HIGH';
}): number {
  const now = Date.now();
  
  // === DIGITAL SCORE (calls + SMS) ===
  const recencyWeight = calculateRecencyWeight(metrics.lastInteraction);
  const frequencyScore = (metrics.callFrequency * 5) + metrics.smsFrequency;
  const durationScore = Math.log(metrics.totalCallDuration + 1) / 5;
  const reciprocityBonus = metrics.smsReciprocity * 0.3;
  const callPresenceBonus = metrics.callFrequency > 0 ? 2 : 0;
  
  const digitalScore = (
    frequencyScore + 
    durationScore + 
    reciprocityBonus + 
    callPresenceBonus
  ) * recencyWeight;
  
  // === PHYSICAL/RECURRING SCORE ===
  let recurringScore = 0;
  
  if (metrics.recurringHoursPerWeek && metrics.recurringHoursPerWeek > 0) {
    // Base score from time commitment
    // Uses logarithmic scale to prevent domination
    // 3 hours/week (hobby) = 3.3 points
    // 8 hours/week (regular friend) = 6.2 points
    // 40 hours/week (coworker) = 11.1 points
    // 56 hours/week (roommate, 8 hrs/day) = 12.2 points
    const timeScore = Math.log(metrics.recurringHoursPerWeek + 1) * 3;
    
    // Quality multiplier (1-5 scale)
    // Low quality (2/5) = 0.67x
    // Medium quality (3/5) = 1.0x
    // High quality (5/5) = 1.67x
    const qualityMultiplier = (metrics.recurringQuality || 3) / 3;
    
    // Intensity multiplier
    const intensityMultiplier = {
      'LOW': 0.5,    // Present but not deeply engaged (e.g., large open office)
      'MEDIUM': 1.0, // Normal interaction level (collaboration, conversation)
      'HIGH': 1.5,   // Deep engagement (roommate, close team, intense activity)
    }[metrics.recurringIntensity || 'MEDIUM'];
    
    // Calculate base recurring score
    recurringScore = timeScore * qualityMultiplier * intensityMultiplier;
    
    // IMPORTANT: Recurring patterns are STRONG signals
    // Physical presence > digital communication
    // Weight recurring patterns heavily
    recurringScore *= 2;
  }
  
  // === COMBINED SCORE ===
  const totalScore = digitalScore + recurringScore;
  
  return Math.round(totalScore * 100) / 100;
}

/**
 * Helper: Calculate recency weight (unchanged)
 */
function calculateRecencyWeight(lastInteraction: number | null): number {
  if (!lastInteraction) return 0.1; // Very old or never
  
  const now = Date.now();
  const daysSince = (now - lastInteraction) / (24 * 60 * 60 * 1000);
  
  // Exponential decay: half-life of 30 days
  return Math.exp(-daysSince / 30);
}
```

### 2. Aggregate Recurring Pattern Data

**File**: `/services/dunbarCalculator.ts` (new function)

```typescript
/**
 * Aggregate all recurring pattern data for a contact
 * Returns total hours/week, average quality, and highest intensity
 */
export function aggregateRecurringPatternData(
  contactId: string,
  patterns: RecurringPattern[]
): {
  hoursPerWeek: number;
  quality: number;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
} | null {
  // Filter to active patterns that include this contact
  const activePatterns = patterns.filter(p => 
    p.isActive && p.contactIds.includes(contactId)
  );
  
  if (activePatterns.length === 0) {
    return null;
  }
  
  let totalHoursPerWeek = 0;
  let totalQuality = 0;
  let highestIntensity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  
  const intensityRank = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
  
  for (const pattern of activePatterns) {
    // Calculate hours per week from pattern
    let hoursPerWeek = 0;
    
    if (pattern.hoursPerWeek) {
      hoursPerWeek = pattern.hoursPerWeek;
    } else if (pattern.hoursPerDay) {
      hoursPerWeek = pattern.hoursPerDay * 7;
    } else if (pattern.frequency === 'WEEKLY') {
      hoursPerWeek = pattern.hoursPerOccurrence;
    } else if (pattern.frequency === 'DAILY') {
      hoursPerWeek = pattern.hoursPerOccurrence * 7;
    } else if (pattern.frequency === 'BIWEEKLY') {
      hoursPerWeek = pattern.hoursPerOccurrence / 2;
    } else if (pattern.frequency === 'MONTHLY') {
      hoursPerWeek = pattern.hoursPerOccurrence / 4;
    }
    
    totalHoursPerWeek += hoursPerWeek;
    totalQuality += pattern.interactionQuality;
    
    // Track highest intensity
    if (intensityRank[pattern.interactionIntensity] > intensityRank[highestIntensity]) {
      highestIntensity = pattern.interactionIntensity;
    }
  }
  
  return {
    hoursPerWeek: totalHoursPerWeek,
    quality: totalQuality / activePatterns.length, // Average quality
    intensity: highestIntensity,
  };
}
```

### 3. Update Dunbar Layer Calculation

**File**: `/services/dunbarCalculator.ts`

```typescript
/**
 * Calculate Dunbar layers for all contacts
 * NOW includes recurring pattern data
 */
export function calculateDunbarLayers(
  contacts: Contact[],
  interactions: Interaction[],
  recurringPatterns: RecurringPattern[] // NEW parameter
): Contact[] {
  const updatedContacts: Contact[] = [];
  
  for (const contact of contacts) {
    // Aggregate recurring pattern data for this contact
    const recurringData = aggregateRecurringPatternData(
      contact.id,
      recurringPatterns
    );
    
    // Update contact's recurring hours (calculated field)
    contact.totalRecurringHoursPerWeek = recurringData?.hoursPerWeek || 0;
    
    // Calculate interaction metrics from digital data
    const digitalMetrics = calculateInteractionMetrics(
      contact.phoneNumbers || [],
      callLogs, // Assume these are available in scope
      smsHistory // Assume these are available in scope
    );
    
    // Calculate combined score (digital + recurring)
    const score = calculateInteractionScore({
      // Digital metrics
      callFrequency: digitalMetrics.callFrequency,
      totalCallDuration: digitalMetrics.totalCallDuration,
      smsFrequency: digitalMetrics.smsFrequency,
      smsReciprocity: digitalMetrics.smsReciprocity,
      lastInteraction: digitalMetrics.lastInteraction,
      
      // Recurring metrics
      recurringHoursPerWeek: recurringData?.hoursPerWeek,
      recurringQuality: recurringData?.quality,
      recurringIntensity: recurringData?.intensity,
    });
    
    contact.interactionScore = score;
    
    // Assign to Dunbar layer based on score
    contact.dunbarLayer = assignLayerFromScore(score, contact.isFamily);
    
    updatedContacts.push(contact);
  }
  
  return updatedContacts;
}

/**
 * Assign Dunbar layer based on interaction score
 * Family members get +15 bonus
 */
function assignLayerFromScore(score: number, isFamily: boolean): number {
  let adjustedScore = score;
  
  if (isFamily) {
    adjustedScore += 15; // Family bonus
  }
  
  // Layer thresholds (tuned for new scoring with recurring patterns)
  if (adjustedScore >= 60) return 0; // Intimate Core
  if (adjustedScore >= 40) return 1; // Sympathy Group
  if (adjustedScore >= 25) return 2; // Close Group
  if (adjustedScore >= 15) return 3; // Tribe
  if (adjustedScore >= 5) return 4;  // Acquaintances
  return 5; // Social Nebula
}
```

---

## Data Flow

### Creating a Recurring Pattern

```
USER ACTION: Create pattern for "Tuesday Soccer" with 10 contacts
              ↓
┌──────────────────────────────────────────────────────────┐
│ 1. Create RecurringPattern record in Jazz                │
│    - patternType: "HOBBY_SPORTS"                         │
│    - contactIds: [id1, id2, ..., id10]                   │
│    - frequency: "WEEKLY"                                 │
│    - hoursPerOccurrence: 3                               │
│    - schedule: { daysOfWeek: ["TUE"], timeOfDay: "19:00" }│
│    - interactionQuality: 4                               │
│    - interactionIntensity: "HIGH"                        │
│    - isActive: true                                      │
│    - autoGenerateInteractions: true                      │
└──────────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Update Contact records (batch operation)              │
│    For each contactId in pattern.contactIds:             │
│    - Add pattern.id to contact.recurringPatternIds       │
│    - Recalculate contact.totalRecurringHoursPerWeek      │
│      (aggregate all patterns this contact is in)         │
└──────────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Recalculate interaction scores (batch)                │
│    For each contact:                                     │
│    - Fetch recurring pattern data (aggregated)           │
│    - Call calculateInteractionScore() with:              │
│      • Digital metrics (calls, SMS)                      │
│      • Recurring metrics (hours, quality, intensity)     │
│    - Update contact.interactionScore                     │
└──────────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ 4. Recalculate Dunbar layers                            │
│    - Run assignLayerFromScore() for each contact         │
│    - Contacts may move layers:                           │
│      • Layer 5 → Layer 2 (3 layer jump)                 │
│    - Update contact.dunbarLayer                          │
└──────────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ 5. Update UI (reactive via Jazz)                        │
│    - Contact cards show new layer badges                 │
│    - Pattern badge appears on contact details            │
│    - Dashboard shows "10 contacts updated" summary       │
└──────────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────┐
│ 6. Schedule auto-generation (background task)            │
│    - If autoGenerateInteractions is true:                │
│    - Check pattern schedule                              │
│    - Generate Interaction logs for upcoming occurrences  │
│    - Mark source: "automatic"                            │
│    - Update pattern.lastGeneratedDate                    │
└──────────────────────────────────────────────────────────┘
```

### Performance Considerations

**Problem**: Updating 10 contacts at once could be slow

**Solution 1: Batch Operations**
```typescript
async function createRecurringPattern(
  pattern: RecurringPattern,
  userProfile: UserProfile
): Promise<void> {
  // 1. Create pattern (single write)
  userProfile.recurringPatterns.push(pattern);
  
  // 2. Update all contacts in ONE transaction
  const contactUpdates = pattern.contactIds.map(contactId => {
    const contact = userProfile.contacts.find(c => c.id === contactId);
    if (contact) {
      contact.recurringPatternIds = [
        ...(contact.recurringPatternIds || []),
        pattern.id
      ];
    }
    return contact;
  });
  
  // 3. Recalculate scores (batched)
  await recalculateScoresInBatch(contactUpdates, userProfile.recurringPatterns);
  
  // Jazz will sync all changes in one transaction
}
```

**Solution 2: Debounced Recalculation**
```typescript
// Debounce recalculation to avoid multiple rapid updates
const debouncedRecalculate = debounce((contacts: Contact[], patterns: RecurringPattern[]) => {
  recalculateScoresInBatch(contacts, patterns);
}, 500);

// Usage:
pattern.hoursPerWeek = 30; // User edits pattern
debouncedRecalculate(affectedContacts, allPatterns);
```

---

## Auto-Generation System

### Background Task: Generate Interaction Logs

**File**: `/services/recurringPatternService.ts` (new file)

```typescript
/**
 * Background task to auto-generate interaction logs from recurring patterns
 * Should run daily at 2am local time
 */
export async function generateInteractionLogsFromPatterns(
  userProfile: UserProfile
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Midnight today
  
  let generatedCount = 0;
  
  const patterns = userProfile.recurringPatterns || [];
  
  for (const pattern of patterns) {
    // Skip if pattern is inactive or doesn't auto-generate
    if (!pattern.isActive || !pattern.autoGenerateInteractions) {
      continue;
    }
    
    // Check if we've already generated for this pattern today
    const lastGenerated = pattern.lastGeneratedDate 
      ? new Date(pattern.lastGeneratedDate)
      : new Date(0);
    
    if (lastGenerated >= today) {
      continue; // Already generated today
    }
    
    // Check if today matches the pattern schedule
    const shouldGenerateToday = checkIfPatternOccursToday(pattern, today);
    
    if (shouldGenerateToday) {
      // Generate interaction log for each contact in pattern
      for (const contactId of pattern.contactIds) {
        const contact = userProfile.contacts.find(c => c.id === contactId);
        if (!contact) continue;
        
        const interaction = Interaction.create({
          contactId: contact.id,
          contactName: contact.name,
          date: today.toISOString(),
          type: pattern.patternType === 'COHABITATION' ? 'other' : 'face-to-face',
          duration: pattern.hoursPerOccurrence * 60, // Convert to minutes
          quality: pattern.interactionQuality,
          notes: `Auto-generated from "${pattern.title}"`,
          source: 'automatic',
          createdAt: new Date().toISOString(),
        }, { owner: userProfile._owner });
        
        userProfile.interactions.push(interaction);
        generatedCount++;
      }
      
      // Update last generated date
      pattern.lastGeneratedDate = today.toISOString();
    }
  }
  
  console.log(`✅ Generated ${generatedCount} interaction logs from recurring patterns`);
  return generatedCount;
}

/**
 * Check if a pattern occurs on the given date
 */
function checkIfPatternOccursToday(
  pattern: RecurringPattern,
  date: Date
): boolean {
  const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
  
  if (pattern.frequency === 'DAILY') {
    return true;
  }
  
  if (pattern.frequency === 'WEEKLY' && pattern.schedule?.daysOfWeek) {
    return pattern.schedule.daysOfWeek.includes(dayOfWeek);
  }
  
  if (pattern.frequency === 'BIWEEKLY' && pattern.schedule?.daysOfWeek) {
    // Check if it's the right day AND if it's been 2 weeks since start
    const startDate = new Date(pattern.startDate);
    const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const isRightWeek = Math.floor(daysSinceStart / 7) % 2 === 0;
    return isRightWeek && pattern.schedule.daysOfWeek.includes(dayOfWeek);
  }
  
  // TODO: Implement monthly and custom frequency checks
  
  return false;
}
```

---

## Edge Cases & Error Handling

### Edge Case 1: Pattern with Future Start Date

**Problem**: User creates pattern with startDate in future

**Solution**:
```typescript
function isPatternActive(pattern: RecurringPattern): boolean {
  const now = new Date();
  const startDate = new Date(pattern.startDate);
  const endDate = pattern.endDate ? new Date(pattern.endDate) : null;
  
  // Check if pattern has started
  if (now < startDate) {
    return false; // Not started yet
  }
  
  // Check if pattern has ended
  if (endDate && now > endDate) {
    return false; // Already ended
  }
  
  return pattern.isActive;
}
```

### Edge Case 2: Contact Deleted from Device

**Problem**: Contact is deleted but still in pattern

**Solution**:
```typescript
function cleanupDeletedContacts(
  pattern: RecurringPattern,
  validContactIds: Set<string>
): boolean {
  const originalLength = pattern.contactIds.length;
  
  // Remove contact IDs that no longer exist
  pattern.contactIds = pattern.contactIds.filter(id => validContactIds.has(id));
  
  const deletedCount = originalLength - pattern.contactIds.length;
  
  if (deletedCount > 0) {
    console.warn(`⚠️  Removed ${deletedCount} deleted contacts from "${pattern.title}"`);
    
    // If no contacts left, deactivate pattern
    if (pattern.contactIds.length === 0) {
      pattern.isActive = false;
      pattern.endDate = new Date().toISOString();
    }
    
    return true; // Pattern was modified
  }
  
  return false; // No changes
}
```

### Edge Case 3: Overlapping Patterns

**Problem**: User creates two patterns with same contacts and same schedule

**Solution**: Warn user but allow (they might have different contexts)

```typescript
function detectOverlappingPatterns(
  newPattern: RecurringPattern,
  existingPatterns: RecurringPattern[]
): RecurringPattern[] {
  const overlaps: RecurringPattern[] = [];
  
  for (const existing of existingPatterns) {
    if (!existing.isActive) continue;
    
    // Check if contactIds overlap
    const contactOverlap = newPattern.contactIds.some(id => 
      existing.contactIds.includes(id)
    );
    
    if (!contactOverlap) continue;
    
    // Check if schedules overlap
    if (newPattern.frequency === existing.frequency) {
      if (newPattern.schedule?.daysOfWeek && existing.schedule?.daysOfWeek) {
        const dayOverlap = newPattern.schedule.daysOfWeek.some(day =>
          existing.schedule!.daysOfWeek!.includes(day)
        );
        
        if (dayOverlap) {
          overlaps.push(existing);
        }
      }
    }
  }
  
  return overlaps;
}

// In UI:
const overlaps = detectOverlappingPatterns(newPattern, userProfile.recurringPatterns);
if (overlaps.length > 0) {
  showWarning(`This pattern overlaps with "${overlaps[0].title}". Continue anyway?`);
}
```

### Edge Case 4: Pattern Hours = 0

**Problem**: User accidentally sets hours to 0

**Solution**: Validate minimum hours

```typescript
function validateRecurringPattern(pattern: RecurringPattern): string[] {
  const errors: string[] = [];
  
  // Validate hours
  if (pattern.hoursPerOccurrence <= 0) {
    errors.push('Duration must be at least 0.5 hours (30 minutes)');
  }
  
  if (pattern.hoursPerDay && pattern.hoursPerDay <= 0) {
    errors.push('Hours per day must be at least 0.1 (6 minutes)');
  }
  
  if (pattern.hoursPerWeek && pattern.hoursPerWeek <= 0) {
    errors.push('Hours per week must be at least 0.5 (30 minutes)');
  }
  
  // Validate contacts
  if (pattern.contactIds.length === 0) {
    errors.push('At least one contact is required');
  }
  
  // Validate dates
  if (pattern.endDate) {
    const start = new Date(pattern.startDate);
    const end = new Date(pattern.endDate);
    
    if (end <= start) {
      errors.push('End date must be after start date');
    }
  }
  
  return errors;
}
```

---

## Testing Strategy

### Unit Tests

**File**: `/services/__tests__/recurringPatterns.test.ts`

```typescript
import { calculateInteractionScore, aggregateRecurringPatternData } from '../dataMining';
import { RecurringPattern } from '../../jazz/schema';

describe('Recurring Patterns - Interaction Scoring', () => {
  test('Roommate (8 hrs/day, HIGH intensity) scores into Layer 0', () => {
    const score = calculateInteractionScore({
      callFrequency: 0,
      totalCallDuration: 0,
      smsFrequency: 5,
      smsReciprocity: 0.5,
      lastInteraction: Date.now(),
      recurringHoursPerWeek: 56, // 8 hrs/day
      recurringQuality: 5,
      recurringIntensity: 'HIGH',
    });
    
    expect(score).toBeGreaterThan(60); // Layer 0 threshold
  });
  
  test('Coworker (40 hrs/week, MEDIUM intensity) scores into Layer 1-2', () => {
    const score = calculateInteractionScore({
      callFrequency: 2,
      totalCallDuration: 300,
      smsFrequency: 10,
      smsReciprocity: 0.6,
      lastInteraction: Date.now(),
      recurringHoursPerWeek: 40,
      recurringQuality: 3,
      recurringIntensity: 'MEDIUM',
    });
    
    expect(score).toBeGreaterThan(25); // Layer 2 threshold
    expect(score).toBeLessThan(60); // Layer 0 threshold
  });
  
  test('Sports team (3 hrs/week, HIGH intensity) scores into Layer 2-3', () => {
    const score = calculateInteractionScore({
      callFrequency: 0,
      totalCallDuration: 0,
      smsFrequency: 2,
      smsReciprocity: 0.5,
      lastInteraction: Date.now(),
      recurringHoursPerWeek: 3,
      recurringQuality: 4,
      recurringIntensity: 'HIGH',
    });
    
    expect(score).toBeGreaterThan(15); // Layer 3 threshold
    expect(score).toBeLessThan(40); // Layer 1 threshold
  });
  
  test('Distant coworker (40 hrs/week, LOW quality/intensity) scores into Layer 3-4', () => {
    const score = calculateInteractionScore({
      callFrequency: 0,
      totalCallDuration: 0,
      smsFrequency: 1,
      smsReciprocity: 0.5,
      lastInteraction: Date.now(),
      recurringHoursPerWeek: 40,
      recurringQuality: 2,
      recurringIntensity: 'LOW',
    });
    
    expect(score).toBeLessThan(25); // Below Layer 2
  });
  
  test('Aggregates multiple patterns correctly', () => {
    const patterns: RecurringPattern[] = [
      {
        id: '1',
        contactIds: ['contact-123'],
        hoursPerWeek: 40,
        interactionQuality: 3,
        interactionIntensity: 'MEDIUM',
        isActive: true,
        // ... other fields
      },
      {
        id: '2',
        contactIds: ['contact-123'],
        hoursPerWeek: 3,
        interactionQuality: 5,
        interactionIntensity: 'HIGH',
        isActive: true,
        // ... other fields
      }
    ];
    
    const result = aggregateRecurringPatternData('contact-123', patterns);
    
    expect(result).not.toBeNull();
    expect(result!.hoursPerWeek).toBe(43); // 40 + 3
    expect(result!.quality).toBe(4); // (3 + 5) / 2
    expect(result!.intensity).toBe('HIGH'); // Highest of MEDIUM and HIGH
  });
});
```

### Integration Tests

**File**: `/services/__tests__/recurringPatterns.integration.test.ts`

```typescript
describe('Recurring Patterns - End-to-End Flow', () => {
  test('Creating pattern updates all contacts and recalculates layers', async () => {
    // Setup: Create user with 10 contacts
    const userProfile = await createTestUser();
    const contacts = await createTestContacts(10);
    
    // Baseline: Contacts start in Layer 5 (no interaction data)
    contacts.forEach(c => {
      expect(c.dunbarLayer).toBe(5);
    });
    
    // Action: Create recurring pattern (sports team, 3 hrs/week)
    const pattern = await createRecurringPattern({
      title: 'Soccer Team',
      contactIds: contacts.map(c => c.id),
      hoursPerWeek: 3,
      interactionQuality: 4,
      interactionIntensity: 'HIGH',
    });
    
    // Assert: Contacts moved to Layer 2-3
    const updatedContacts = await getContacts(userProfile);
    updatedContacts.forEach(c => {
      expect(c.dunbarLayer).toBeLessThan(5);
      expect(c.dunbarLayer).toBeGreaterThanOrEqual(2);
      expect(c.recurringPatternIds).toContain(pattern.id);
      expect(c.totalRecurringHoursPerWeek).toBe(3);
    });
  });
  
  test('Editing pattern recalculates all affected contacts', async () => {
    // ... similar test for edit flow
  });
  
  test('Ending pattern removes recurring data but preserves history', async () => {
    // ... test for ending pattern
  });
});
```

---

## Performance Benchmarks

### Target Performance

| Operation | Target | Max Acceptable |
|-----------|--------|----------------|
| Create pattern (1 contact) | <200ms | <500ms |
| Create pattern (10 contacts) | <500ms | <1s |
| Edit pattern (recalculate 10 contacts) | <300ms | <800ms |
| Delete pattern (cleanup 10 contacts) | <300ms | <800ms |
| Auto-generate logs (50 patterns) | <2s | <5s |
| Load recurring patterns dashboard | <300ms | <1s |

### Optimization Strategies

1. **Batch Updates**: Update all contacts in one Jazz transaction
2. **Debouncing**: Delay recalculation by 500ms to batch rapid changes
3. **Lazy Loading**: Only load pattern details when user taps to view
4. **Caching**: Cache aggregated hours/week per contact (don't recalculate on every render)
5. **Background Processing**: Run auto-generation in background thread at 2am

---

## Security & Privacy

### Data Storage

- All recurring patterns stored in Jazz (E2E encrypted)
- No server-side processing required
- User can delete patterns anytime (hard delete)
- Pattern history preserved when marked as ended (but can be deleted)

### Data Sharing

- Recurring patterns are NEVER shared without explicit consent
- If user opts into data sharing (for discounts), only anonymized aggregate stats shared:
  - "User has X active patterns"
  - "Average hours/week: Y"
  - NO contact names, NO specific schedules

### Access Control

- Only pattern owner can view/edit/delete
- No multi-user patterns in MVP (future enhancement)

---

## Migration & Rollout

### Phase 1: Soft Launch (Beta Users Only)

- Deploy schema changes
- Enable feature flag: `ENABLE_RECURRING_PATTERNS`
- Invite 50 beta users to test
- Collect feedback via in-app survey

### Phase 2: Full Rollout

- Remove feature flag
- Deploy to all users
- Show onboarding modal explaining feature
- Offer quick-start wizard with smart suggestions

### Phase 3: Optimization

- Analyze usage patterns
- Optimize performance based on real-world data
- Add smart suggestions based on ML

---

## Open Questions

1. **Should we limit the number of patterns per user?**
   - Proposal: 20 active patterns max (prevent abuse)
   - Rationale: Most users won't need more than 5-10

2. **How to handle time zones for distributed teams?**
   - Proposal: Store schedule in user's local time
   - Edge case: User travels, pattern schedule shifts

3. **Should we allow fractional hours (e.g., 0.5 hours)?**
   - Proposal: Yes, minimum 0.5 hours (30 minutes)
   - Rationale: Quick check-ins still matter

4. **Auto-generate logs for past dates when pattern is created retroactively?**
   - Proposal: No, only generate forward from creation date
   - Rationale: Avoid cluttering timeline with historical guesses

5. **Should pattern intensity auto-adjust based on quality ratings?**
   - Proposal: Phase 2 feature (ML-based)
   - Rationale: Need data first before auto-adjusting

---

## Success Metrics

### Adoption

- 60% of active users create at least 1 recurring pattern (within 30 days)
- Average 2-3 patterns per user
- 80% of patterns still active after 3 months

### Accuracy

- User-reported Dunbar accuracy improves from 70% → 85%
- "Does this layer feel right?" survey response
- Layer correction rate decreases by 50%

### Impact

- 30% of contacts in patterns move up at least 1 layer
- Average layer movement: +2 layers for contacts in patterns
- Roommates move from Layer 5 → Layer 0-1 (verified in 90% of cases)

---

## Conclusion

This technical specification provides a comprehensive blueprint for implementing recurring interaction patterns in Nurture. The feature is **critical for MVP** as it fixes a fundamental flaw in Dunbar calculations: the inability to see physical presence.

**Next Steps**:
1. Review and approve this spec
2. Begin Phase 1 implementation (schema changes)
3. Implement algorithm updates
4. Build UI components
5. Test extensively with beta users
6. Roll out to all users

**Estimated Timeline**: 4-6 weeks for full implementation

**Priority**: P0 - Blocks accurate Dunbar calculations
