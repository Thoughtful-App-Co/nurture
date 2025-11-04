# Recurring Interaction Patterns

**Status**: 🚨 CRITICAL GAP - Not Yet Implemented  
**Priority**: P0 (Required for MVP)  
**Story**: STORY-021  
**Epic**: EPIC-003 (Core Relationship Management)

---

## Executive Summary

**Problem**: Phones track digital communication (calls, texts) but not physical presence. This creates a massive blind spot where roommates, coworkers, and regular activity partners appear as strangers in Dunbar calculations.

**Solution**: Two-tier system allowing users to define recurring time blocks and standing patterns for consistent physical interactions.

**Impact**: Without this feature, Nurture's core promise of "behavioral reality, not wishful thinking" is fundamentally broken for physical relationships.

---

## The Problem

### Current State: Digital Interactions Only

Nurture currently tracks:
- ✅ Phone calls (Android only)
- ✅ SMS messages (Android only)
- ✅ Manual one-time events (via ManualInteractionLogger)

Nurture does **NOT** track:
- ❌ Living together (roommates, family cohabitation)
- ❌ Working together (coworkers, daily colleagues)
- ❌ Regular activities (sports teams, hobby groups, recurring meetups)
- ❌ Scheduled family time (Sunday dinners, weekly visits)

### Real-World Impact: Broken Dunbar Calculations

#### Scenario 1: Roommates
- **Reality**: User lives with 2 roommates, interacts 6-8 hours/day
- **Current System**: Zero automatic detection (no calls/texts between roommates)
- **Dunbar Calculation**: Roommates appear in Layer 5 (Social Nebula)
- **Correct Layer**: Should be Layer 0-1 (Intimate Core)
- **Error Magnitude**: Off by 4-5 layers 🚨

#### Scenario 2: Close Coworkers
- **Reality**: User works with 5 colleagues, 40 hours/week, daily standup + collaboration
- **Current System**: Maybe some Slack messages, rare calls
- **Dunbar Calculation**: Coworkers in Layer 3-4 (Tribe/Acquaintances)
- **Correct Layer**: Should be Layer 1-2 (Sympathy Group/Close Group)
- **Error Magnitude**: Off by 2-3 layers 🚨

#### Scenario 3: Sports Team
- **Reality**: User plays soccer with 10 people, 3 hours/week for past year
- **Current System**: No group chat = no detection
- **Dunbar Calculation**: Team members in Layer 5 (Social Nebula)
- **Correct Layer**: Should be Layer 2-3 (Close Group/Tribe)
- **Error Magnitude**: Off by 2-3 layers 🚨

### Why This Violates Core Tenets

From `/docs/CORE_TENETS.md`:

> **"Behavioral reality, not wishful thinking."**

When the algorithm can't see 40+ hours/week of coworker interaction, it's showing **wishful thinking** (they're strangers) rather than **behavioral reality** (they're close colleagues).

> **"Measuring What Matters"**

Physical presence and consistent time together are the **strongest signals** of relationship depth. Ignoring them means measuring the wrong things.

---

## The Solution

### Two-Tier System

#### Tier 1: Contact-Level Standing Patterns
Quick-add patterns directly on contact detail screen:

**Pre-Built Templates:**
- 🏠 **Living Together**: 6-8 hours/day (roommate, spouse, family)
- 💼 **Work Colleagues**: 40 hours/week (close coworkers, daily collaboration)
- 👨‍👩‍👧 **Regular Family Time**: Custom schedule (Sunday dinners, weekly visits)
- 🎓 **Study/Project Partner**: Custom hours (school, work projects)

**Configuration:**
- Hours per day OR hours per week
- Quality rating (1-5 stars)
- Intensity level (LOW/MEDIUM/HIGH)
- Start date and optional end date
- Notes for context

#### Tier 2: Group Activity Scheduler
Create recurring events with multiple contacts:

**Use Cases:**
- **Sports Teams**: "Soccer every Tuesday, 7-10pm, 10 people"
- **Hobby Groups**: "Book club 1st Thursday, 7-9pm, 6 people"
- **Work Meetings**: "Daily standup, 9-9:30am, 5 people"
- **Family Events**: "Sunday dinner, 6-8pm, 8 people"
- **Social Clubs**: "Board game night Fridays, 7-11pm, 8 people"

**Features:**
- Bulk contact selection (multi-select search)
- Recurring schedule builder (daily, weekly, biweekly, monthly)
- Days of week selector
- Time of day picker
- Duration slider
- Quality and intensity ratings
- Auto-generate interaction logs (optional)
- Edit entire group at once

---

## User Flows

### Flow 1: Mark Roommate (Contact-Level Pattern)

```
1. User opens Contact Detail for "Alex (Roommate)"
2. Tap "Add Standing Pattern" button
3. Modal opens with template choices
4. Tap "🏠 Living Together"
5. System auto-fills:
   - Pattern type: COHABITATION
   - Hours per day: 8 (default)
   - Quality: 4/5 (default)
   - Intensity: HIGH (default)
6. User adjusts slider to 6 hours/day (more accurate)
7. User adjusts quality to 5/5 (great roommate)
8. Tap "Save"
9. System immediately:
   - Creates RecurringPattern record
   - Recalculates Alex's interaction score
   - Alex moves from Layer 5 → Layer 0 (Intimate Core)
   - Shows confirmation: "Alex is now in your Intimate Core"
```

**Time to Complete**: ~15 seconds

### Flow 2: Create Sports Team (Group Activity)

```
1. User taps "Add Group Activity" from dashboard
2. Search modal opens
3. User searches "soccer" → sees all contacts with "soccer" tag
4. User taps "Select All" → 10 contacts selected
5. User taps "Next"
6. Activity configuration screen:
   a. Activity name: "Tuesday Soccer"
   b. Activity type: "Sports/Hobby"
   c. Schedule: "Weekly"
   d. Day: "Tuesday"
   e. Time: "7:00 PM"
   f. Duration: 3 hours
   g. Quality: 4/5 (fun, meaningful)
   h. Intensity: HIGH (active engagement)
   i. Auto-generate logs: ON (creates weekly interaction logs)
7. User taps "Create Pattern"
8. System immediately:
   - Creates RecurringPattern with 10 contactIds
   - Recalculates all 10 contacts (+3 hours/week each)
   - Several contacts move up layers
   - Shows summary: "10 contacts updated, 4 moved to closer layers"
```

**Time to Complete**: ~60 seconds for 10 people

### Flow 3: Bulk Edit Work Team

```
1. User navigates to "Recurring Patterns" dashboard
2. Sees list of active patterns:
   - "Living with Alex" (8 hrs/day, 1 person)
   - "Work Team" (40 hrs/week, 5 people) ← Tap this
   - "Tuesday Soccer" (3 hrs/week, 10 people)
3. Pattern detail screen opens
4. Shows 5 colleagues in pattern
5. User taps "Edit Pattern"
6. Changes hours/week: 40 → 30 (reduced schedule)
7. Changes intensity: MEDIUM → LOW (less direct collaboration now)
8. Taps "Save"
9. System immediately:
   - Updates pattern
   - Recalculates all 5 contacts
   - Some may move down layers (less time = weaker signal)
   - Shows update summary
```

**Time to Complete**: ~20 seconds

### Flow 4: End a Pattern (Person Moved Away)

```
1. Open Contact Detail for "Sarah (Former Roommate)"
2. See active pattern badge: "🏠 Living Together (8 hrs/day)"
3. Tap pattern badge → Pattern detail
4. Tap "End This Pattern"
5. System asks: "When did this pattern end?"
6. User selects date: 1 month ago
7. System:
   - Marks pattern as inactive (endDate set)
   - Stops auto-generating future interactions
   - Recalculates Sarah's score (only recent call/text data now)
   - Sarah moves from Layer 0 → Layer 3 (Tribe)
   - Preserves historical data for analytics
```

**Time to Complete**: ~10 seconds

---

## Data Model

### New Schema: RecurringPattern

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

### Updated Schema: UserProfile

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

### Updated Schema: Contact

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

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Create Recurring Pattern                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ CREATE RecurringPattern Record in Jazz                      │
│ - contactIds: ["contact-123", "contact-456", ...]          │
│ - hoursPerWeek: 40                                          │
│ - quality: 4, intensity: MEDIUM                             │
│ - isActive: true                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ UPDATE Contact Records                                       │
│ For each contactId in pattern:                              │
│ - Add pattern.id to contact.recurringPatternIds            │
│ - Recalculate contact.totalRecurringHoursPerWeek           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ RECALCULATE Interaction Scores                              │
│ - Fetch all recurring patterns for contact                  │
│ - Aggregate total hours/week, quality, intensity           │
│ - Pass to calculateInteractionScore()                       │
│ - New score includes recurring pattern weight              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ RECALCULATE Dunbar Layers                                   │
│ - Run calculateDunbarLayers() with new scores               │
│ - Contact may move layers (e.g., Layer 5 → Layer 0)        │
│ - Update contact.dunbarLayer                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ AUTO-GENERATE Interaction Logs (if enabled)                │
│ - Create Interaction records for each occurrence            │
│ - Type: "face-to-face" or "other"                          │
│ - Source: "automatic" (from recurring pattern)             │
│ - Quality: from pattern.interactionQuality                  │
│ - Duration: from pattern.hoursPerOccurrence                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ UPDATE UI                                                    │
│ - Contact card shows new layer badge                        │
│ - Pattern badge appears on contact detail                   │
│ - Dashboard shows "10 contacts updated"                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Algorithm Integration

### Updated Interaction Score Calculation

**File**: `/services/dataMining.ts`

**Current Logic** (lines 513-544):
```typescript
// Only considers calls and SMS
const frequencyScore = (metrics.callFrequency * 5) + metrics.smsFrequency;
const durationScore = Math.log(metrics.totalCallDuration + 1) / 5;
const reciprocityBonus = metrics.smsReciprocity * 0.3;
const callPresenceBonus = metrics.callFrequency > 0 ? 2 : 0;

const score = (frequencyScore + durationScore + reciprocityBonus + callPresenceBonus) * recencyWeight;
```

**New Logic** (with recurring patterns):
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
```

### Score Examples

#### Example 1: Roommate (High Quality)
```
Input:
- recurringHoursPerWeek: 56 (8 hrs/day)
- recurringQuality: 5
- recurringIntensity: HIGH
- callFrequency: 0 (don't call roommate)
- smsFrequency: 5

Calculation:
timeScore = log(56 + 1) * 3 = 12.15
qualityMultiplier = 5 / 3 = 1.67
intensityMultiplier = 1.5
recurringScore = 12.15 * 1.67 * 1.5 * 2 = 61.0

digitalScore = (0*5 + 5) * recencyWeight = ~5

totalScore = 61.0 + 5 = 66 points
→ Layer 0 (Intimate Core)
```

#### Example 2: Coworker (Medium Quality)
```
Input:
- recurringHoursPerWeek: 40 (standard work week)
- recurringQuality: 3
- recurringIntensity: MEDIUM
- callFrequency: 2
- smsFrequency: 10

Calculation:
timeScore = log(40 + 1) * 3 = 11.12
qualityMultiplier = 3 / 3 = 1.0
intensityMultiplier = 1.0
recurringScore = 11.12 * 1.0 * 1.0 * 2 = 22.2

digitalScore = (2*5 + 10) * recencyWeight = ~20

totalScore = 22.2 + 20 = 42 points
→ Layer 1-2 (Sympathy Group / Close Group)
```

#### Example 3: Sports Team Member (High Quality, Weekly)
```
Input:
- recurringHoursPerWeek: 3 (weekly game)
- recurringQuality: 4
- recurringIntensity: HIGH
- callFrequency: 0
- smsFrequency: 2

Calculation:
timeScore = log(3 + 1) * 3 = 4.16
qualityMultiplier = 4 / 3 = 1.33
intensityMultiplier = 1.5
recurringScore = 4.16 * 1.33 * 1.5 * 2 = 16.6

digitalScore = (0*5 + 2) * recencyWeight = ~2

totalScore = 16.6 + 2 = 18.6 points
→ Layer 2-3 (Close Group / Tribe)
```

#### Example 4: Distant Coworker (Low Quality, Low Intensity)
```
Input:
- recurringHoursPerWeek: 40 (same office, but minimal interaction)
- recurringQuality: 2
- recurringIntensity: LOW
- callFrequency: 0
- smsFrequency: 1

Calculation:
timeScore = log(40 + 1) * 3 = 11.12
qualityMultiplier = 2 / 3 = 0.67
intensityMultiplier = 0.5
recurringScore = 11.12 * 0.67 * 0.5 * 2 = 7.45

digitalScore = (0*5 + 1) * recencyWeight = ~1

totalScore = 7.45 + 1 = 8.45 points
→ Layer 3-4 (Tribe / Acquaintances)
```

### Key Insights from Algorithm

1. **Time alone isn't enough**: A distant coworker (40 hrs/week, LOW quality/intensity) scores lower than a close sports teammate (3 hrs/week, HIGH quality/intensity).

2. **Quality and intensity matter**: Two roommates with same hours/week will score differently based on relationship quality.

3. **Logarithmic scaling prevents domination**: 40 hours/week doesn't get 10x the score of 4 hours/week. It gets ~3x the base score.

4. **Physical presence is weighted heavily**: The 2x multiplier on recurring patterns recognizes that physical time together is a stronger signal than digital communication.

5. **Combination is powerful**: A coworker you also text/call regularly gets both digital AND physical scores, resulting in very high total.

---

## UI/UX Specifications

### Component 1: Standing Pattern Selector

**Location**: `/components/relationships/StandingPatternSelector.tsx`

**Trigger**: Button on Contact Detail Modal

**Design**:
```
┌─────────────────────────────────────────────────────┐
│  ADD STANDING PATTERN                               │
│  ───────────────────────────────────────────────── │
│                                                     │
│  Choose a pattern template or create custom:       │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 🏠  LIVING TOGETHER                          │  │
│  │     6-8 hours/day, HIGH intensity            │  │
│  │     Perfect for: Roommates, spouse, family  │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 💼  WORK COLLEAGUES                          │  │
│  │     40 hours/week, MEDIUM intensity          │  │
│  │     Perfect for: Coworkers, daily team       │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 👨‍👩‍👧  REGULAR FAMILY TIME                    │  │
│  │     Custom schedule                          │  │
│  │     Perfect for: Weekly dinners, visits      │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ ✏️  CUSTOM PATTERN                           │  │
│  │     Define your own schedule                 │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│                                      [Cancel]      │
└─────────────────────────────────────────────────────┘
```

**After selecting template** (e.g., "Living Together"):
```
┌─────────────────────────────────────────────────────┐
│  🏠 LIVING TOGETHER                                 │
│  ───────────────────────────────────────────────── │
│                                                     │
│  HOURS PER DAY                                      │
│  ├───────●──────────┤  8 hours                     │
│  1        5        10                              │
│                                                     │
│  INTERACTION QUALITY                                │
│  ⭐⭐⭐⭐⭐  (5/5) Excellent                           │
│  Deep, meaningful connection                        │
│                                                     │
│  INTENSITY                                          │
│  ○ LOW      ○ MEDIUM      ● HIGH                   │
│  Deep engagement, living together                   │
│                                                     │
│  START DATE                                         │
│  [2025-01-01] (When did this begin?)               │
│                                                     │
│  NOTES (OPTIONAL)                                   │
│  ┌───────────────────────────────────────────┐    │
│  │ Great roommate, we cook together often    │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│                         [Cancel]  [Save Pattern]   │
└─────────────────────────────────────────────────────┘
```

### Component 2: Group Activity Scheduler

**Location**: `/components/relationships/GroupActivityScheduler.tsx`

**Trigger**: "Add Group Activity" button on Dashboard

**Step 1: Select Contacts**
```
┌─────────────────────────────────────────────────────┐
│  SELECT CONTACTS                                    │
│  ───────────────────────────────────────────────── │
│                                                     │
│  🔍 [Search contacts...                         ]  │
│                                                     │
│  ✓ Alex Johnson           [Remove]                 │
│  ✓ Sarah Kim              [Remove]                 │
│  ✓ Mike Chen              [Remove]                 │
│  ✓ Jessica Brown          [Remove]                 │
│  ✓ Tom Wilson             [Remove]                 │
│  + 5 more selected                                  │
│                                                     │
│  ──────────────────────────────────────────────── │
│  Suggested contacts based on tags:                 │
│                                                     │
│  #soccer (8 contacts) [Select All]                 │
│    David Lee                            [+ Add]     │
│    Emma Garcia                          [+ Add]     │
│    ...                                              │
│                                                     │
│  10 contacts selected                 [Cancel] [Next] │
└─────────────────────────────────────────────────────┘
```

**Step 2: Configure Activity**
```
┌─────────────────────────────────────────────────────┐
│  CREATE GROUP ACTIVITY                              │
│  ───────────────────────────────────────────────── │
│                                                     │
│  ACTIVITY NAME                                      │
│  [Tuesday Night Soccer                          ]  │
│                                                     │
│  ACTIVITY TYPE                                      │
│  ● Sports/Hobby   ○ Work Meeting                   │
│  ○ Family Event   ○ Social Club   ○ Other          │
│                                                     │
│  SCHEDULE                                           │
│  Frequency: [Weekly ▼]                             │
│  Day: [Tuesday ▼]                                  │
│  Time: [7:00 PM ▼]                                 │
│  Duration: ├────●──┤ 3 hours                       │
│                                                     │
│  INTERACTION QUALITY                                │
│  ⭐⭐⭐⭐☆  (4/5) Good                                │
│  Quality conversation, felt great                   │
│                                                     │
│  INTENSITY                                          │
│  ○ LOW      ○ MEDIUM      ● HIGH                   │
│  Deep engagement, intense activity                  │
│                                                     │
│  AUTO-GENERATE INTERACTION LOGS                     │
│  ✓ Create weekly interaction logs automatically    │
│    (You can manually edit/delete later)            │
│                                                     │
│  START DATE                                         │
│  [2025-01-15] (When does this begin?)              │
│                                                     │
│                         [Cancel]  [Create Pattern] │
└─────────────────────────────────────────────────────┘
```

**Step 3: Confirmation**
```
┌─────────────────────────────────────────────────────┐
│  ✅ PATTERN CREATED                                 │
│  ───────────────────────────────────────────────── │
│                                                     │
│  "Tuesday Night Soccer" is now active!             │
│                                                     │
│  📊 IMPACT ON YOUR GARDEN:                          │
│                                                     │
│  10 contacts updated with +3 hours/week            │
│                                                     │
│  Layer Changes:                                     │
│  • 2 contacts moved to Sympathy Group (Layer 1)    │
│  • 3 contacts moved to Close Group (Layer 2)       │
│  • 5 contacts remained in current layer            │
│                                                     │
│  Next occurrence: Tuesday, Jan 15 at 7:00 PM       │
│                                                     │
│                           [View Pattern] [Close]   │
└─────────────────────────────────────────────────────┘
```

### Component 3: Recurring Patterns Dashboard

**Location**: `/components/relationships/RecurringPatternsView.tsx`

**Trigger**: New tab/section in Dashboard or Settings

**Design**:
```
┌─────────────────────────────────────────────────────┐
│  YOUR RECURRING PATTERNS                            │
│  ───────────────────────────────────────────────── │
│                                                     │
│  [+ Add Contact Pattern]  [+ Add Group Activity]   │
│                                                     │
│  ACTIVE PATTERNS (3)                                │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 🏠 Living with Alex                          │  │
│  │ 8 hours/day • HIGH intensity • 1 person      │  │
│  │ Since Jan 1, 2024                            │  │
│  │                              [Edit] [End]    │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 💼 Work Team                                 │  │
│  │ 40 hours/week • MEDIUM intensity • 5 people  │  │
│  │ Mon-Fri, 9am-5pm • Since Mar 1, 2024         │  │
│  │                              [Edit] [End]    │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ ⚽ Tuesday Night Soccer                      │  │
│  │ 3 hours/week • HIGH intensity • 10 people    │  │
│  │ Every Tuesday, 7pm • Since Jan 15, 2025      │  │
│  │                              [Edit] [End]    │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ENDED PATTERNS (1)                                 │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 👫 Study Group (Ended Dec 2024)             │  │
│  │ 6 hours/week • 4 people                      │  │
│  │ Sep 2024 - Dec 2024                          │  │
│  │                              [View] [Delete] │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Contact Detail Integration

**Before** (current):
```
┌─────────────────────────────────────────────────────┐
│  ALEX JOHNSON                                       │
│  Layer 5: Social Nebula                            │
│  ───────────────────────────────────────────────── │
│  Last contact: Never                                │
│  [Send Message] [Call] [Log Interaction]           │
└─────────────────────────────────────────────────────┘
```

**After** (with recurring pattern):
```
┌─────────────────────────────────────────────────────┐
│  ALEX JOHNSON                                       │
│  Layer 0: Intimate Core ⭐                         │
│  ───────────────────────────────────────────────── │
│                                                     │
│  🏠 Living Together                                 │
│  8 hours/day • HIGH intensity                      │
│  Since Jan 1, 2024                    [Edit]       │
│                                                     │
│  Last contact: Today (automatic)                    │
│  [Send Message] [Call] [+ Add Pattern]             │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Goal**: Core schema and data structures

- [ ] Create `RecurringPattern` schema in `/jazz/schema.ts`
- [ ] Add `recurringPatterns` to `UserProfile`
- [ ] Add `recurringPatternIds` to `Contact`
- [ ] Create migration logic for existing users
- [ ] Write unit tests for schema

**Deliverable**: Schema changes merged and tested

### Phase 2: Algorithm Integration (Week 1-2)
**Goal**: Make recurring patterns affect Dunbar calculations

- [ ] Update `calculateInteractionScore()` in `/services/dataMining.ts`
- [ ] Create `aggregateRecurringPatternData()` helper function
- [ ] Update `calculateDunbarLayers()` in `/services/dunbarCalculator.ts`
- [ ] Add `totalRecurringHoursPerWeek` calculation for contacts
- [ ] Write unit tests with example scenarios (roommate, coworker, sports team)
- [ ] Validate algorithm with real-world test data

**Deliverable**: Algorithm correctly scores contacts with recurring patterns

### Phase 3: Contact-Level UI (Week 2)
**Goal**: Users can add standing patterns to individual contacts

- [ ] Create `StandingPatternSelector.tsx` component
- [ ] Design template cards (Living Together, Work Colleagues, etc.)
- [ ] Build pattern configuration screen (hours/day, quality, intensity)
- [ ] Integrate with Contact Detail Modal
- [ ] Add "Add Pattern" button to contact detail
- [ ] Show active patterns as badges on contact card
- [ ] Implement edit/delete pattern functionality
- [ ] Add confirmation screen showing layer changes

**Deliverable**: Users can mark roommates/coworkers from contact detail

### Phase 4: Group Activity UI (Week 3)
**Goal**: Users can create group activities with multiple contacts

- [ ] Create `GroupActivityScheduler.tsx` component
- [ ] Build multi-select contact search
- [ ] Create activity configuration screen
- [ ] Add schedule builder (frequency, days, time)
- [ ] Implement bulk contact update logic
- [ ] Add confirmation screen with impact summary
- [ ] Create "Add Group Activity" entry point on dashboard
- [ ] Test with 10+ contacts in one pattern

**Deliverable**: Users can create sports teams, work groups, etc.

### Phase 5: Management UI (Week 3-4)
**Goal**: Users can view and manage all patterns

- [ ] Create `RecurringPatternsView.tsx` component
- [ ] List all active patterns
- [ ] Show ended/archived patterns
- [ ] Implement pattern detail view
- [ ] Add bulk edit functionality
- [ ] Create "End Pattern" flow with date picker
- [ ] Add pattern deletion (with confirmation)
- [ ] Show analytics (total time commitment, contacts affected)

**Deliverable**: Complete pattern management interface

### Phase 6: Auto-Generation (Week 4)
**Goal**: Recurring patterns auto-create interaction logs

- [ ] Create background task to generate interaction logs
- [ ] Run daily to check for new occurrences
- [ ] Create `Interaction` records for each occurrence
- [ ] Mark source as "automatic" (from recurring pattern)
- [ ] Update `lastGeneratedDate` on pattern
- [ ] Add user setting to enable/disable auto-generation
- [ ] Show auto-generated logs differently in UI (with badge)
- [ ] Allow users to edit/delete auto-generated logs

**Deliverable**: Weekly soccer game auto-creates interaction logs

### Phase 7: Polish & Testing (Week 4)
**Goal**: Production-ready feature

- [ ] End-to-end testing with all user flows
- [ ] Performance testing (100+ contacts, 20+ patterns)
- [ ] Edge case handling (invalid dates, zero hours, etc.)
- [ ] Error messages and validation
- [ ] Loading states and animations
- [ ] Accessibility (screen readers, keyboard navigation)
- [ ] Documentation for users (help text, tooltips)
- [ ] Analytics tracking (pattern creation, edits, deletions)

**Deliverable**: Feature ready for beta testing

### Phase 8: Beta & Iteration (Week 5-6)
**Goal**: Real-world validation and refinement

- [ ] Deploy to beta users (subset of user base)
- [ ] Collect feedback via in-app survey
- [ ] Monitor analytics (adoption rate, pattern types, layer changes)
- [ ] Identify pain points and confusion
- [ ] Iterate on UI/UX based on feedback
- [ ] Fix bugs and edge cases
- [ ] Optimize performance if needed
- [ ] Prepare for full rollout

**Deliverable**: Validated, polished feature ready for all users

---

## Success Metrics

### Adoption Metrics
- **Target**: 60% of active users create at least 1 recurring pattern
- **Metric**: Percentage of users with `recurringPatterns.length > 0`
- **Timeline**: Within 30 days of feature launch

### Usage Metrics
- **Patterns per user**: Average number of active patterns
  - **Target**: 2-3 patterns per active user
- **Contacts per pattern**: Average number of contacts in group patterns
  - **Target**: 5-10 contacts for group activities
- **Pattern types**: Distribution of pattern types (cohabitation vs work vs hobby)
  - **Hypothesis**: Work (40%), Cohabitation (20%), Hobby (30%), Other (10%)

### Impact Metrics
- **Layer corrections**: Number of contacts that moved layers after pattern creation
  - **Target**: 30% of contacts in patterns move up at least 1 layer
- **Dunbar accuracy**: User-reported accuracy improvement
  - **Metric**: "Does this layer feel right?" survey response
  - **Target**: Increase from 70% → 85% accuracy rating

### Engagement Metrics
- **Pattern longevity**: How long patterns remain active
  - **Target**: 80% of patterns still active after 3 months
- **Edit frequency**: How often users edit existing patterns
  - **Target**: <10% edit rate (patterns should be "set and forget")
- **Auto-log usage**: Percentage of users who enable auto-generation
  - **Target**: 70%+ enable auto-generation

---

## Technical Considerations

### Performance

**Challenge**: Recalculating scores for all contacts in a pattern

**Solution**: Batch updates with debouncing
```typescript
// When pattern changes, debounce recalculation
const debouncedRecalculate = debounce(() => {
  const affectedContacts = pattern.contactIds.map(id => getContact(id));
  recalculateScoresInBatch(affectedContacts);
}, 500);
```

**Challenge**: Auto-generating logs for many patterns

**Solution**: Background task with rate limiting
```typescript
// Run daily at 2am local time
// Process patterns in batches of 10
// Generate max 100 interaction logs per run
```

### Data Consistency

**Challenge**: Contact is in multiple patterns, hours add up

**Solution**: Aggregate at calculation time
```typescript
// Don't store totalRecurringHoursPerWeek on contact
// Calculate on-demand when scoring:
const patterns = getUserPatterns(userId).filter(p => 
  p.isActive && p.contactIds.includes(contactId)
);
const totalHours = patterns.reduce((sum, p) => sum + p.hoursPerWeek, 0);
```

### Edge Cases

**Case 1**: User creates pattern with start date in future
- **Solution**: Mark as `isActive: false` until start date reached
- **Behavior**: Don't include in score calculations until active

**Case 2**: User ends pattern but sets end date in past
- **Solution**: Retroactively adjust scores from that date forward
- **Behavior**: Re-run Dunbar calculation with historical data

**Case 3**: Contact is deleted but still in pattern
- **Solution**: Remove contact from pattern automatically
- **Behavior**: Show warning "1 contact no longer exists" in pattern detail

**Case 4**: Pattern has zero hours (user sets slider to 0)
- **Solution**: Validate minimum hours (0.5 hours/week or 0.1 hours/day)
- **Behavior**: Show error message, don't allow save

**Case 5**: User creates overlapping patterns (same contacts, same schedule)
- **Solution**: Warn user about potential double-counting
- **Behavior**: "You already have a Tuesday pattern with these contacts. Are you sure?"

### Migration Strategy

**For Existing Users**:
```typescript
// On first login after feature launch:
if (!user.hasSeenRecurringPatternsOnboarding) {
  // Show modal explaining new feature
  showRecurringPatternsIntro();
  
  // Offer quick-start wizard
  if (userAccepts) {
    // "Let's identify patterns in your relationships"
    // Show contact list with suggested patterns
    // "We noticed you text Alex every day - do you live together?"
    // "You have 5 coworkers in your contacts - do you work with them?"
  }
  
  user.hasSeenRecurringPatternsOnboarding = true;
}
```

**Smart Suggestions**:
```typescript
// Analyze existing interaction logs to suggest patterns
function suggestRecurringPatterns(user: UserProfile): PatternSuggestion[] {
  const suggestions = [];
  
  // Look for family members with "Mom", "Dad", etc. in name
  const familyMembers = contacts.filter(c => detectFamilyPetName(c.name));
  if (familyMembers.length > 0) {
    suggestions.push({
      type: 'FAMILY_ROUTINE',
      contacts: familyMembers,
      reason: 'Family members detected - do you see them regularly?'
    });
  }
  
  // Look for contacts with "work" or "colleague" tags
  const coworkers = contacts.filter(c => 
    c.tags?.includes('work') || c.tags?.includes('colleague')
  );
  if (coworkers.length >= 3) {
    suggestions.push({
      type: 'WORK',
      contacts: coworkers,
      reason: 'Do you work with these people regularly?'
    });
  }
  
  // Look for same-day-of-week interaction patterns in logs
  // e.g., multiple interactions every Tuesday with same group
  const weeklyPatterns = detectWeeklyPatterns(interactions);
  if (weeklyPatterns.length > 0) {
    suggestions.push({
      type: 'HOBBY_SPORTS',
      contacts: weeklyPatterns[0].contacts,
      reason: `You interact with this group every ${weeklyPatterns[0].dayOfWeek}`
    });
  }
  
  return suggestions;
}
```

---

## User Education

### Onboarding Flow

**Screen 1: The Problem**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           📱 → ❌ → 🤷                              │
│                                                     │
│  Your phone can't see physical interactions        │
│                                                     │
│  • Living with roommates? Hidden.                  │
│  • Working with colleagues? Invisible.              │
│  • Weekly sports team? Unknown.                     │
│                                                     │
│  This means your relationship layers are           │
│  missing critical information.                      │
│                                                     │
│                                        [Next]       │
└─────────────────────────────────────────────────────┘
```

**Screen 2: The Solution**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           ⏰ + 👥 = ✅                               │
│                                                     │
│  Tell Nurture about your regular patterns          │
│                                                     │
│  • Mark roommates: "I live with this person"       │
│  • Add work teams: "40 hours/week together"        │
│  • Create activities: "Soccer every Tuesday"       │
│                                                     │
│  Nurture will automatically factor this time       │
│  into your relationship calculations.               │
│                                                     │
│                           [Back]  [Get Started]    │
└─────────────────────────────────────────────────────┘
```

**Screen 3: Quick Start**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Let's identify your patterns (optional)            │
│                                                     │
│  Based on your contacts, we found:                  │
│                                                     │
│  ✓ 2 potential roommates                           │
│    Alex Johnson, Sarah Kim                         │
│    [Set up living pattern]                         │
│                                                     │
│  ✓ 5 coworkers                                      │
│    Mike Chen, Jessica Brown, +3 more               │
│    [Set up work team]                              │
│                                                     │
│  ✓ 1 sports team tag                               │
│    #soccer (8 contacts)                            │
│    [Set up group activity]                         │
│                                                     │
│                           [Skip]  [Continue]       │
└─────────────────────────────────────────────────────┘
```

### In-App Help

**Contextual Tooltips**:
- On Contact Detail: "💡 Do you live or work with [Name]? Add a standing pattern to improve accuracy."
- On Dashboard: "⚡ Quick tip: Add group activities for sports teams, book clubs, and recurring meetups."
- After Layer Calculation: "🔍 Some contacts seem under-weighted. Do you spend regular time with them?"

**Help Center Articles**:
- "What are Recurring Patterns?"
- "How to Add a Roommate or Coworker"
- "Creating Group Activities for Teams"
- "Understanding Interaction Scoring with Recurring Patterns"
- "Editing and Ending Patterns"

---

## Future Enhancements

### Phase 2 Features (Post-MVP)

#### 1. Calendar Integration
- Auto-detect recurring meetings from calendar
- Suggest patterns based on calendar events
- Extract attendees and duration automatically
- **Benefit**: Zero manual input for work meetings

#### 2. Location-Based Detection (Opt-in)
- Detect co-location patterns (same place, same time, regularly)
- Suggest patterns: "You're at this location with these people every Tuesday"
- Privacy-first: User must explicitly enable location tracking
- **Benefit**: Auto-discover patterns user didn't think to log

#### 3. Smart Suggestions
- "You've logged 5 Tuesday interactions with this group - create a pattern?"
- "You call [Name] every Sunday - make it recurring?"
- "These contacts are all tagged #work - create a team?"
- **Benefit**: Reduce manual pattern creation

#### 4. Pattern Templates Library
- User-submitted templates: "College Roommates", "Remote Team", "CrossFit Box"
- Community-voted best templates
- Import template with one tap
- **Benefit**: Faster setup, better defaults

#### 5. Time Block Heatmap View
- Visual calendar showing all recurring commitments
- Color-coded by pattern type
- Total hours/week breakdown
- Identify scheduling conflicts
- **Benefit**: See full time commitment at a glance

#### 6. Pattern Analytics
- "You spend 68 hours/week in recurring patterns"
- "Your work patterns involve 12 people"
- "You've maintained the soccer pattern for 52 weeks (1 year!)"
- Longest-running patterns, most-attended patterns
- **Benefit**: Insights into consistency and commitment

#### 7. Intensity Auto-Adjustment
- ML model learns from quality ratings over time
- Suggests intensity changes: "Your quality ratings are consistently high - mark as HIGH intensity?"
- Auto-adjusts based on manual interaction logs
- **Benefit**: More accurate scoring without constant user input

#### 8. Group Pattern Voting
- For group activities, invite other participants
- "Sarah wants to add you to 'Tuesday Soccer' pattern - accept?"
- Everyone in group can edit schedule
- Consensus-based quality/intensity ratings
- **Benefit**: Distributed pattern management, social accountability

---

## Conclusion

Recurring Interaction Patterns is **not optional** for Nurture. Without it:
- Roommates appear as strangers
- Coworkers are underweighted
- Regular activity groups are invisible
- Dunbar calculations are fundamentally inaccurate

This feature is **P0 - CRITICAL** and should be implemented **before MVP launch**.

**Estimated Timeline**: 4-6 weeks for full implementation  
**Priority**: Highest (blocks accurate Dunbar calculations)  
**Risk**: High (complex algorithm changes, new data model, extensive UI)  
**Value**: Essential (core feature for behavioral accuracy)

---

**Next Steps**:
1. ✅ Review and approve this specification
2. ⏳ Update PRD with STORY-021
3. ⏳ Begin Phase 1 (schema changes)
4. ⏳ Create technical design doc for algorithm changes
5. ⏳ Design UI components and user flows
6. ⏳ Implement and test in phases
7. ⏳ Beta test with real users
8. ⏳ Launch to all users

**Questions? Discuss in team sync or Slack #nurture-dev**
