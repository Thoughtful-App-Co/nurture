# Product Requirements Document
# Nurture - Relationship Cultivation Platform v2.0

**Last Updated**: 2025-10-27  
**Document Type**: Product Requirements Document  
**MVP Status**: 🔄 In Development - Authentication Complete

---

## Implementation Status

### ✅ Completed (2025-10-27)
- **Authentication Flow**: Login → Home page working
- **Jazz Integration**: Provider, schema, and migration configured
- **User Account**: DemoAuth creates persistent accounts
- **Data Model**: CoValue schemas defined for contacts, interactions, goals
- **UI Foundation**: Auth screen and welcome screen match design system
- **Documentation**: Implementation guides and testing instructions complete

### 🔄 In Progress
- None currently - ready for next epic

### 📋 Next Up (Priority Order)
1. **STORY-006**: Data Mining Onboarding Screen (permissions request)
2. **STORY-001**: Contact Data Ingestion (read device contacts)
3. **STORY-002**: Call & SMS Log Mining (analyze interaction patterns)
4. **STORY-003**: Dunbar Layer Calculator (assign behavioral layers)

### 🎯 MVP Goal
Complete authentication + data mining + layer discovery for 100 beta users within 3 months.

**Current Progress**: ~10% complete (Auth foundation laid)

---

## Core Philosophy

**Principle**: Show behavioral reality, enable intentional cultivation

**Approach**: Data mining reveals who you actually interact with. User chooses who they want to prioritize.

**Key Insight**: Dunbar layers are discovered through behavior, not declared. Family is a separate structural dimension.

---

## Architectural Principles

### Layer System

**Type**: Behavioral Dunbar Layers  
**Calculation**: Automatic, based on interaction data

#### Layers

| Layer | Name | Size | Description | Characteristics |
|-------|------|------|-------------|-----------------|
| 0 | Intimate Core | 1-5 people | Highest interaction frequency and reciprocity | Daily/near-daily contact, high emotional investment signals |
| 1 | Sympathy Group | 5-15 people | Close friends, regular meaningful contact | Weekly+ interaction, strong reciprocity |
| 2 | Close Group | 15-50 people | Active social circle | Regular contact, maintained relationships |
| 3 | Tribe | 50-150 people | Real relationships within Dunbar's number | Occasional contact, recognized relationships |
| 4 | Acquaintances | 150-250 people | Outer Dunbar limit | Infrequent contact, know who they are |
| 5 | Social Nebula | 250+ | Weak ties, ambient awareness | Rare/no contact, outside active management |

### Relationship Categorization System

**Type**: User-Defined Relationship Categories  
**Registration**: Manual, via long-press on contact cards  
**Independent**: Exists alongside Dunbar layers

#### Three Main Categories

**FAMILY**
- Nuclear: Spouse, children, parents, siblings
- Secondary (Extended): Aunts, uncles, cousins, grandparents
- Tertiary (Distant): Extended relatives, in-laws, distant connections

**FRIENDS**
- Inner Circle: Closest confidants (typically Layer 0-1)
- Close Friend: Regular contact friends (typically Layer 2)
- Good Friend: Broader social circle (typically Layer 3)
- Casual Friend: Occasional hangouts (typically Layer 4+)

**BUSINESS**
- Close Colleague: Work closely together, professional relationship
- Acquaintance/Social Nebula: Professional network, occasional contact
- Note: If closer than acquaintance outside work, mark as Friend instead

#### Interaction Model

**Activation**: Long-press (800ms) on any contact card  
**Quick Access**: Tap existing relationship badge to change  
**UI Flow**: Category selection → Subcategory selection → Auto-save

**Philosophy**: Relationship categories complement Dunbar layers. Categories show intentional structure, layers show behavioral reality.

### Hero Card System

**Purpose**: Surface critical user actions that require immediate attention through high-visibility carousel

**Design Philosophy**: 
- **Von Restorff Effect**: High visual contrast to stand out from normal dashboard content
- **Progressive Disclosure**: Only show cards when action is genuinely needed
- **Swipeable Carousel**: Horizontal navigation between multiple hero cards when applicable
- **Single Focus**: Maximum one hero card visible at a time for cognitive clarity

**Architecture**:
```typescript
interface HeroCard {
  id: string;
  type: 'TEND_GARDEN' | 'DUNBAR_VIOLATION' | 'DORMANT_ALERT' | 'PRUNING_SUGGESTION';
  priority: number; // Lower = higher priority, determines carousel order
  triggerCondition: () => boolean; // Function that determines if card should show
  dismissible: boolean; // Can user dismiss or is it forced?
  snoozeableDays?: number; // If dismissible, how many days until it returns
  component: ReactComponent; // The actual UI component to render
  analyticsId: string; // For tracking engagement
}
```

**Current Hero Cards**:
1. **Tend Garden** (Priority: 10)
   - Trigger: Unsorted contacts exist (`quickSortStatus === 'not_sorted'`)
   - Dismissible: Yes (returns after 7 days)
   - Action: Opens QuickSortModal for relationship classification
   
2. **Dunbar Violation Cleanup** (Priority: 5 - HIGHER than Tend Garden)
   - Trigger: Any layer exceeds maximum capacity
     - Layer 0 > 5 people
     - Layer 1 > 15 people
     - Layer 2 > 50 people
     - Layer 3 > 150 people
   - Dismissible: No (forced action to maintain network health)
   - Action: Opens Would You Rather ranking tool
   - Visual: Red/warning theme (vs green for Tend Garden)

3. **Future**: Dormant Relationship Alert (Priority: 15)
   - Trigger: Close relationship (Layer 0-2) with no contact in 30+ days
   - Dismissible: Yes (snooze 7 days)

**Display Rules**:
- Show maximum 1 hero card at a time (highest priority wins)
- Hero card appears at top of dashboard, below search bar
- If multiple cards applicable, use horizontal swipe dots to indicate more
- User can swipe between applicable cards
- Card must be completed or dismissed before it disappears
- Analytics track: impressions, swipes, completions, dismissals

**Visual Hierarchy**:
1. Dashboard header ("Your Garden")
2. Search bar
3. **→ Hero Card Carousel** ← Inserted here
4. Family members count
5. Dunbar status
6. Relationship layers
7. Re-analyze data button

**UX Principles**:
- **Urgency Indication**: Color-coded by severity (green = helpful, yellow = suggested, red = critical)
- **Clear CTAs**: Single, obvious action button with descriptive text
- **Progress Transparency**: Show completion state (e.g., "15/32 contacts classified")
- **Celebratory Completion**: Reward screens when tasks are finished
- **Intelligent Scheduling**: Don't show multiple high-priority cards simultaneously to avoid overwhelm

### Would You Rather - Forced Ranking Engine

**Purpose**: Resolve Dunbar layer violations through pairwise comparison when users are unable to make hard prioritization decisions

**Problem**:
- Users struggle with abstract "move this person to Layer 3" decisions
- Comparing family vs friends creates emotional paralysis
- Binary choices are cognitively easier than ranking 50+ people
- Acts of service framing makes decisions more concrete

**Algorithm**: QuickSort-based pairwise comparison
```typescript
interface RankingSession {
  sessionId: string;
  violatedLayer: number; // Which layer is over capacity
  contactsToRank: Contact[]; // People in violated layer + candidates from layer below
  comparisons: Comparison[]; // Record of all decisions
  currentPair: [Contact, Contact]; // Current choice being presented
  progress: number; // Percentage complete
  resumable: true; // Can exit and return later
}

interface Comparison {
  contactA: Contact;
  contactB: Contact;
  chosen: Contact; // Who user chose
  question: string; // Which question was asked
  timestamp: number;
  responseTimeMs: number; // How long to decide
}
```

**Question Bank** (Acts of Service Framework):
- **Emergency Support**: "Who would you call first in a crisis?"
- **Time Investment**: "Who would you help move apartments on a Saturday?"
- **Emotional Labor**: "Whose birthday would you never want to miss?"
- **Reciprocity**: "Who has shown up for you when you needed them?"
- **Loyalty**: "Who has been consistently there through ups and downs?"
- **Intent**: "Who do you genuinely want to spend more time with?"
- **Future-Focused**: "Who do you want in your life 5 years from now?"
- **Mutual Benefit**: "Who brings out the best in you?"
- **Energy**: "After spending time with this person, do you feel energized?"
- **Trust**: "Who would you trust with your deepest secret?"

**Cross-Category Handling** (Family vs Friend):
- Use universal human values: loyalty, reciprocity, trust, energy
- Avoid category-specific framing ("family duty" vs "friendship fun")
- Focus on behavioral reality ("who have you called lately?") not social obligation
- Acknowledge difficulty: "This is a hard choice - go with your gut"

**Comparison Strategy**:
1. **Randomize question order** to prevent pattern answering
2. **Rotate questions** within session to avoid fatigue
3. **Skip option** for truly impossible decisions (counts as tie, both stay in layer)
4. **Consistency check**: Occasionally re-ask same comparison with different framing
5. **Early termination**: Stop when ranking is stable (no changes in last 5 comparisons)

**Outcome Processing**:
```typescript
// After ranking session completes
function reallocateContacts(rankedContacts: Contact[], layerCapacity: number) {
  // Top N stay in current layer (where N = layer capacity)
  const stayInLayer = rankedContacts.slice(0, layerCapacity);
  
  // Bottom contacts move down one layer
  const moveToLowerLayer = rankedContacts.slice(layerCapacity);
  
  // Update contact records
  stayInLayer.forEach(c => c.dunbarLayer = currentLayer);
  moveToLowerLayer.forEach(c => c.dunbarLayer = currentLayer + 1);
  
  // Record event for analytics
  trackLayerReallocation(stayInLayer, moveToLowerLayer);
}
```

**UI/UX Flow**:
1. **Hero Card Trigger**: Red warning card appears on dashboard
   - Title: "Your Inner Circle needs attention"
   - Description: "You have 23 people in Layer 1, but research shows we can only maintain 15 close relationships"
   - CTA: "Help me prioritize (5 min)"
   
2. **Introduction Screen**: 
   - Explain the process: "We'll ask you to choose between pairs of people"
   - Set expectations: "This takes about 5 minutes for 20 comparisons"
   - Frame positively: "You're not removing anyone, just being honest about closeness"
   
3. **Comparison Cards**:
   - Two contact cards side-by-side with photos/names
   - Question at top: "Who would you call first in an emergency?"
   - Tap left or right card to choose
   - Progress bar at bottom
   - "Skip this one" button for impossible choices
   
4. **Completion Screen**:
   - Celebrate: "You've clarified your Inner Circle!"
   - Summary: "15 people staying in Layer 1, 8 moving to Clan (Layer 2)"
   - Reassurance: "You can still spend time with everyone - this just helps you focus"
   - CTA: "Return to Garden"

**Resumability**:
- Session saved to Jazz database after each comparison
- Can close app and return later without losing progress
- Progress bar shows where you left off
- Maximum session time: 7 days (then resets to prevent stale data)

**Analytics Tracking**:
- Comparison count per session
- Average response time per comparison
- Skip rate (should be <5%)
- Family vs friend comparison outcomes
- Layer reallocation patterns
- User satisfaction rating post-completion

### Data Sources

#### Primary Sources (P0)

1. **Phone Contacts**
   - Data: name, phone, email, photo
   - Priority: P0

2. **Call Logs**
   - Data: frequency, duration, recency
   - Priority: P0

3. **SMS Messages**
   - Data: message count, frequency, recency, reciprocity
   - Priority: P0

4. **Calendar Events** (P1)
   - Data: shared events, meeting frequency, attendees
   - Priority: P1

#### Secondary Sources

1. **Social Media** (P1)
   - Platforms: Instagram, Facebook, Twitter, LinkedIn
   - Data: interaction frequency, connection strength
   - Note: If user grants permissions

2. **Location Data** (P2)
   - Data: co-occurrence, shared locations
   - Note: Privacy-sensitive, opt-in only

---

## Data Model

### Contact

```typescript
{
  id: string,
  userId: string,
  sourceId?: string,
  
  // Basic Info
  basicInfo: {
    name: string,
    phoneNumber?: string,
    email?: string,
    photoUrl?: string
  },
  
  // Behavioral Metrics
  behavioralMetrics: {
    dunbarLayer: number(0-6),
    interactionScore: number,
    lastInteraction: timestamp,
    interactionFrequency: number,
    reciprocityScore: number(0-1),
    contactInitiationRatio: number(0-1),
    averageResponseTime: number,
    conversationDepth: number
  },
  
  // Family Structure
  familyStructure: {
    isFamily: boolean,
    familyTier?: 'NUCLEAR' | 'SECONDARY' | 'TERTIARY',
    familyRole?: string,
    lastName?: string
  },
  
  // User Intent
  userIntent: {
    targetLayer?: number(0-6),
    cultivationGoal?: 'MAINTAIN' | 'STRENGTHEN' | 'RECONNECT' | 'DEPRIORITIZE',
    notes?: string
  },
  
  // Classification
  classification: {
    vertical?: 'FRIENDS' | 'BUSINESS',
    tags: string[]
  }
}
```

### InteractionEvent

```typescript
{
  id: string,
  userId: string,
  contactId: string,
  timestamp: timestamp,
  type: 'CALL' | 'SMS' | 'MEETING' | 'SOCIAL_MEDIA' | 'IN_PERSON',
  duration?: number,
  initiatedBy: 'USER' | 'CONTACT',
  responseTime?: number,
  quality?: number(1-5),
  notes?: string,
  location?: {
    latitude: number,
    longitude: number
  }
}
```

### DunbarAnalytics

```typescript
{
  userId: string,
  calculatedAt: timestamp,
  layerDistribution: {
    layer0: number,
    layer1: number,
    layer2: number,
    layer3: number,
    layer4: number,
    layer5: number
  },
  networkHealth: {
    totalActiveRelationships: number,
    withinDunbarNumber: boolean,
    layerBalance: number(0-1),
    cultivationOpportunities: number
  }
}
```

### Goals

```typescript
{
  id: string,
  userId: string,
  type: 'LAYER_MAINTENANCE' | 'FAMILY_RECONNECTION' | 'NEW_CONNECTIONS' | 'PRUNING',
  target: {
    layerTarget?: number,
    contactIds?: string[],
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    count: number
  },
  progress: {
    current: number,
    lastUpdated: timestamp
  },
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
}
```

---

## Epics

### EPIC-001: Data Mining & Layer Discovery Engine

**Priority**: P0  
**Description**: Build comprehensive data mining system to automatically discover and calculate Dunbar layers

#### Stories

**STORY-001: Contact Data Ingestion** (P0)
- Import and normalize contact data from device
- **Definition of Done**:
  - Contact permissions granted and handled gracefully
  - All device contacts imported with metadata
  - Deduplication algorithm removes 95%+ duplicates
  - Raw data persisted to Jazz
  - Background sync runs without UI
- **Test Criteria**:
  - Import 1000+ contacts in <10 seconds
  - Handle permission denial gracefully
  - Process contacts with missing fields
  - Verify deduplication accuracy >95%
  - Confirm Jazz persistence and retrieval

**STORY-002: Call & SMS Log Mining** (P0)
- Extract interaction patterns from call and message history
- **Definition of Done**:
  - Permissions requested progressively
  - 6 months of history processed
  - Interaction events stored with all metrics
  - Background processing (phone as server)
  - No UI required after permission grant
- **Test Criteria**:
  - Process 10K call logs in <30 seconds
  - Calculate reciprocity score accurately
  - Response time calculation ±5 minutes accuracy
  - Background processing completes without UI

**STORY-003: Dunbar Layer Calculator** (P0)
- Algorithm to assign contacts to Dunbar layers
- **Definition of Done**:
  - Layers calculated for all contacts
  - Algorithm runs in background daily
  - Push notification when layers shift significantly
  - No manual intervention required
- **Test Criteria**:
  - <2 seconds for 1000 contacts
  - Layer stability (90% remain stable week-to-week)
  - Validate against manual classification (80% accuracy)
  - Background execution without UI

~~**STORY-004: Calendar Integration**~~ (REMOVED - not implementing)

**STORY-005: Social Media Integration** (MOONSHOT - Future)
- Reserved for future enhancement

---

### EPIC-002: Onboarding Flow - Reality First

**Priority**: P0  
**Description**: Show users their behavioral reality, then enable intentional structuring

#### Stories

**STORY-006: Data Mining Onboarding Screen** (P0)
- Initial screen requesting permissions and explaining data mining
- UX Requirements:
  - Tone: Transparent, calm, garden metaphor
  - Style: Dark mode, green primary, stark lo-fi aesthetic
  - Copy: "We'll analyze your phone to show you who you actually talk to - not who you think you talk to."
- Complexity: Medium

**STORY-007: Layer Discovery Results Screen** (P0)
- Present calculated Dunbar layers with behavioral insights
- UX:
  - Visualization: Garden/growth metaphor
  - Interactions: Swipeable layers, tap for details
  - Callouts: Non-judgmental observations
- Complexity: High

**STORY-008: Family Registration Flow** (P0)
- Opt-in family structure definition separate from behavioral layers
- UX:
  - Interaction: Tinder-style swipe + tap for role
  - Speed: Process 20+ contacts in <2 minutes
- Complexity: Medium

**STORY-009: Goal Setting - Reality to Intention** (P0)
- Set goals based on observed reality vs desired state
- UX:
  - Presentation: Gap → Goal → Plan structure
  - Tone: Empowering, non-judgmental about pruning
- Complexity: High

**STORY-010: Classification & Vertical Assignment** (P1)
- Assign contacts to FRIENDS or BUSINESS verticals
- Speed: Classify 50 contacts in <3 minutes
- Complexity: Medium

---

### EPIC-003: Core Relationship Management

**Priority**: P0  
**Description**: Tools for maintaining and cultivating relationships based on layers and goals

#### Stories

**STORY-011: Proactive Dashboard** (P0)
- Push insights, don't make users hunt
- **Definition of Done**:
  - Opens directly to "What matters today" card
  - Maximum 3 actions shown
  - Each action is one-tap executable
  - Dashboard visit <30 seconds average
- **Test Criteria**:
  - Time to first action <5 seconds
  - 90% of visits result in action taken
  - No scrolling required for primary actions

**STORY-012: Contact Detail View** (P0)
- Deep dive into individual relationship
- Visualization: Timeline view of interaction history
- Complexity: High

**STORY-013: Smart Nudges** (P0)
- Proactive push notifications driving offline action
- **Definition of Done**:
  - Nudges fire at optimal times (lunch, evening)
  - One-tap to mark complete
  - Actionable text ("Call Mom" not "Contact reminder")
  - Snooze reschedules intelligently
- **Test Criteria**:
  - 60% nudge → action rate
  - Average response time <2 hours
  - Nudge text clarity (A/B test variants)

**STORY-014: Interaction Logging** (P1)
- Manual logging of interactions outside auto-detection
- Speed: Log interaction in <5 seconds
- Complexity: Medium

**STORY-015: Swipeable Hero Card System** (P0)
- **Priority**: P0  
- **Description**: Extensible hero card carousel on dashboard for critical user actions
- **Purpose**: Surface high-priority tasks that require user intervention
- **Initial Use Cases**:
  1. Tend Garden (relationship classification)
  2. Dunbar Violation Cleanup (forced ranking when layers are overallocated)
  3. Future: Dormant relationship alerts, pruning suggestions, etc.
- **Interaction Model**: Horizontal swipe to navigate between hero cards, tap to enter flow
- **Design**: Prominent, unmissable, uses Von Restorff effect (high contrast)
- **Behavior**: Only shows cards when action is genuinely needed (progressive disclosure)
- **Complexity**: Medium

**STORY-016: Would You Rather - Forced Ranking Tool** (P0)
- **Priority**: P0  
- **Description**: Decision engine for resolving Dunbar layer violations through pairwise comparison
- **Problem Statement**: Users struggle to make difficult prioritization decisions, especially comparing family vs friends
- **Solution**: Binary choice interface ("Would You Rather spend time with...") with acts of service framing
- **Triggering Conditions**:
  - Layer 0 (Loved Ones) has >5 people
  - Layer 1 (Inner Circle) has >15 people  
  - Layer 2 (Clan) has >50 people
  - Layer 3 (Tribe) has >150 people
  - User is cognitively overextended and needs forced prioritization
- **Comparison Algorithm**:
  - **Stage 1**: Present pairs from same layer, rank by preference
  - **Stage 2**: Bottom-ranked contacts compared against top of next layer down
  - **Decision Framework**: Acts of service, loyalty, reciprocity-based questions
  - **Example Questions**:
    - "Who would you call first in an emergency?"
    - "Who would you help move apartments on a Saturday?"
    - "Whose birthday would you never want to miss?"
    - "Who have you thought about reaching out to lately?"
  - **Cross-Category Handling**: When comparing family vs friends, use universal metrics
    - Loyalty: "Who has been there for you consistently?"
    - Reciprocity: "Who shows up when you need them?"
    - Intent: "Who do you genuinely want in your inner circle?"
- **Outcome**: Contacts automatically re-assigned to appropriate layers based on ranking
- **UI/UX**:
  - Swipeable cards with two contact photos side-by-side
  - Tap left or right to choose
  - Progress bar showing ranking completion
  - Option to skip truly impossible decisions (counted as tie)
  - Celebratory completion screen when layers are balanced
- **Progressive Disclosure**: 
  - Only triggered when Dunbar violations exist
  - Presented as hero card in dashboard carousel
  - Can be dismissed/snoozed but returns weekly until resolved
- **Complexity**: High
- **Definition of Done**:
  - Pairwise comparison algorithm implemented
  - Question bank with 20+ variants
  - Layer reallocation logic working correctly
  - Progress tracking and resumability (can exit and return)
  - Integration with hero card system
  - Analytics tracking for decision patterns
- **Test Criteria**:
  - Resolve 100-contact ranking in <10 minutes
  - Algorithm converges to stable layer allocation
  - User satisfaction rating >7/10 for decision clarity
  - <5% of comparisons result in "skip" (well-designed questions)

---

### EPIC-004: Analytics & Insights

**Priority**: P1  
**Description**: Provide data-driven insights about network health and patterns

#### Stories

**STORY-017: Network Health Dashboard** (P1)
- Aggregate view of relationship network status
- Complexity: Medium

**STORY-018: Pruning Recommendations** (P2)
- Identify relationships that may no longer serve growth
- Tone: Empowering, aligned with 'courage to prune' philosophy
- Complexity: High

---

## Technical Architecture

### Platform
- **Frontend**: React Native (Expo)
- **Backend**: Jazz (local-first sync database)
- **Authentication**: Jazz DemoAuth (MVP) → Better Auth (Production)
- **Database**: Jazz CoValues with E2E encryption
- **Sync**: Jazz Cloud (wss://cloud.jazz.tools)

### Data Flow
- **Ingestion**: Device → Local Processing → Jazz Local Storage → Jazz Cloud
- **Calculation**: Local computation with Jazz CoValues (future: scheduled functions)
- **Presentation**: Jazz → Reactive UI (automatic updates)

### Performance
- **Initial Sync**: <30 seconds for 500 contacts
- **Layer Recalculation**: Daily at 2am user local time (future)
- **Realtime**: Changes sync automatically across devices
- **Offline**: Full functionality without network connection

### Privacy
- **Storage**: User data isolated per account, encrypted on device
- **Encryption**: End-to-end encryption via Jazz (servers cannot read data)
- **Retention**: User controls data deletion
- **Sharing**: No data sharing without explicit annual opt-in for discounts
- **Local-First**: Data lives on device first, sync is optional

### Authentication Strategy

#### MVP (Current)
- **Method**: Jazz DemoAuth
- **Why**: Zero friction, no backend required, instant start
- **Limitations**: Username-only (acceptable for single-device MVP)
- **Timeline**: Immediate deployment

#### Production (Future)
- **Method**: Better Auth (self-hosted) or Clerk (managed service)
- **When**: When multi-device sync and password recovery are critical
- **Migration**: Seamless account upgrade from DemoAuth

**Decision Rationale**: For MVP speed-to-market, DemoAuth provides production-ready accounts without authentication infrastructure complexity. Upgrade when user base demands it.

---

## Success Metrics

### Engagement
- **Primary**: Weekly active offline interactions (not app usage)
- **Secondary**: Time from nudge to action

### Satisfaction
- **Primary**: Relationship satisfaction scores (monthly survey)
- **Secondary**: Goal completion rate

### Retention
- **Target**: 60% MAU at 3 months
- **Churn Indicator**: Ignored nudges >2 weeks

### Anti-Metrics
- **Minimize**: Daily app open duration
- **Target**: <5 minutes average per day

---

## Release Phases

### MVP (v1.0) - IN PROGRESS
- **Timeline**: 3 months
- **Status**: 
  - ✅ **Authentication**: DemoAuth implemented (Login → Home flow working)
  - ✅ **Jazz Integration**: Schema, provider, migration complete
  - ✅ **UI Foundation**: Auth screen and welcome screen with Nurture aesthetic
  - 🔄 **Next**: Data mining onboarding (STORY-006)
  
- **Scope**:
  - ✅ Authentication & Account Setup
  - 🔄 EPIC-001: Stories 1-3 (Contact ingestion, Call/SMS mining, Layer calculator)
  - 🔄 EPIC-002: Stories 6-8 (Onboarding, Layer discovery, Family registration)
  - 🔄 EPIC-003: Stories 11-12, 15-16 (Dashboard, Contact detail, Hero Cards, Would You Rather)
  
- **Validation**: 100 beta users, manual layer validation

**Critical Path Features** (Must-Have for MVP):
1. Data mining + Dunbar layer calculation
2. Tend Garden (relationship classification)
3. Hero card system (extensible for future features)
4. Would You Rather (Dunbar violation resolution)
   - Required because automated layer calculation WILL create violations
   - Users need tool to make hard prioritization decisions
   - Prevents cognitive overload from abstract layer management

### Completed Milestones
- **2025-10-27**: Authentication flow complete
  - DemoAuth integration with Jazz
  - User signup with name capture
  - Persistent login sessions
  - Data model schema defined
  - Migration logic for account initialization
  - Welcome screen with personalized greeting

### v1.1
- **Timeline**: +2 months after MVP
- **Scope**:
  - EPIC-001: Story 4 (Calendar integration)
  - EPIC-002: Stories 9-10 (Goal setting, Classification)
  - EPIC-003: Stories 13-14 (Nudges, Interaction logging)
  - Authentication upgrade to Better Auth or Clerk

### v2.0
- **Timeline**: +6 months after v1.1
- **Scope**:
  - EPIC-004 (Analytics & Insights)
  - Social media integration
  - Advanced ML features
  - Multi-device sync optimization

---

## Open Questions

1. **How do we handle contacts with zero interaction history?**
   - Options: Default to Layer 5 / Ask user to classify / Wait for first interaction
   - Decision: TBD

2. **Should we allow manual layer override or show warning?**
   - Options: Full override / Warning with confirmation / Suggest goal instead of override
   - Decision: TBD

3. **How often to recalculate layers?**
   - Options: Real-time / Daily / Weekly / On-demand
   - Decision: Daily with on-demand option ✅

4. **What's the threshold for 'dormant' relationship alerts?**
   - Options: Layer-specific / User-defined / ML-based on historical patterns
   - Decision: TBD

5. **When to upgrade from DemoAuth to production authentication?** ✅
   - Decision: Upgrade to Better Auth when multi-device sync becomes critical user need
   - Rationale: DemoAuth sufficient for MVP, avoids backend complexity
   - Timeline: Post-beta feedback will determine timing

6. **Should permissions be requested all at once or progressively?**
   - Options: All upfront / Progressive disclosure / Hybrid
   - Decision: TBD (leaning toward progressive to reduce friction)

7. **How many comparisons does Would You Rather need for accurate ranking?**
   - Options: Fixed count (20) / Dynamic based on contacts / QuickSort optimal (O(n log n))
   - Decision: TBD (leaning toward QuickSort algorithm for efficiency)

8. **Should Would You Rather be forced or dismissible?**
   - Options: Completely forced (blocks app) / Soft force (hero card returns daily) / Dismissible with warning
   - Decision: TBD (leaning toward soft force - can dismiss but returns until resolved)

9. **What happens to contacts moved down a layer?**
   - Options: Auto-notify user / Silent reallocation / Suggest goals for moved contacts / Ask for confirmation
   - Decision: TBD

10. **How to handle ties in Would You Rather (both equally important)?**
    - Options: Force choice / Allow "both stay" option / Re-ask with different question
    - Decision: TBD (leaning toward "skip" option that keeps both in current layer)

11. **Should hero cards show simultaneously or one at a time?**
    - Options: Stack all cards / Show highest priority only / Swipeable carousel
    - Decision: Swipeable carousel with dots indicator ✅

12. **How to prioritize between Tend Garden and Dunbar Violation cards?**
    - Options: Always show Dunbar first / User choice / Completion sequence (Tend first, then Dunbar)
    - Decision: Dunbar Violation higher priority (5 vs 10) - health issues trump classification ✅

---

## Technical Decisions

### Authentication (2025-10-27) ✅
- **Decision**: Use Jazz DemoAuth for MVP
- **Alternatives Considered**: 
  - PasskeyAuth (web-only, not available for React Native)
  - Better Auth (requires backend server + database)
  - Clerk (third-party service, adds complexity)
- **Rationale**: 
  - Speed to market is priority
  - DemoAuth creates real, persistent accounts
  - Zero infrastructure complexity
  - Can upgrade seamlessly to Better Auth/Clerk later
- **Trade-offs Accepted**: 
  - Username-only authentication (no password)
  - Multi-device sync requires same username
  - Less secure than production auth (acceptable for MVP)

### Data Storage (2025-10-27) ✅
- **Decision**: Jazz CoValues with local-first sync
- **Why**: 
  - End-to-end encryption built-in
  - Offline-first aligns with digital minimalism tenet
  - Automatic sync across devices
  - No backend API development needed
  - Reactive data updates in UI
- **Integration**: Successfully implemented with proper CoValue initialization
