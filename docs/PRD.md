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

---

### EPIC-004: Analytics & Insights

**Priority**: P1  
**Description**: Provide data-driven insights about network health and patterns

#### Stories

**STORY-015: Network Health Dashboard** (P1)
- Aggregate view of relationship network status
- Complexity: Medium

**STORY-016: Pruning Recommendations** (P2)
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
  - 🔄 EPIC-003: Stories 11-12 (Dashboard, Contact detail)
  
- **Validation**: 100 beta users, manual layer validation

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
