# Scalable Sorting Strategy for Large Dunbar Layers

## Problem Statement

The current "Would You Rather" pairwise comparison algorithm requires too many questions for large layers:
- **Tribe (100 people)**: ~173 questions
- **Acquaintances (350 people)**: ~900+ questions

**This is completely unacceptable from a UX perspective.** No user will answer 200+ questions.

## Solution: Hybrid Multi-Strategy Approach

### Strategy 1: Visual Selection for Overflow (IMMEDIATE FIX)

**When to Use**: When a layer is over capacity and needs immediate resolution

**How It Works**:
1. User sees a **scrollable list** of contacts in the violated layer
2. List is **pre-sorted** by combined score (interactionScore + intuitiveRank if available)
3. **Lowest scores at the top** (candidates for moving down)
4. User **selects X contacts** to move to the next layer
5. Simple checkbox selection, multi-select enabled
6. Submit button shows "Move 20 people to [Next Layer Name]"

**UX Flow**:
```
Dunbar Violation Detected
  ↓
"Your Tribe has 120 people but can only hold 100"
  ↓
[Button: Quick Select] [Button: Detailed Ranking]
  ↓ (Quick Select chosen)
Show list sorted by lowest scores
  ↓
User checks 20 people to move
  ↓
Review screen shows who's staying vs moving
  ↓
User approves
  ↓
Done in 30 seconds instead of 2 hours!
```

**Advantages**:
- ✅ Fast: ~30 seconds vs ~30 minutes
- ✅ Intuitive: Visual selection is familiar
- ✅ Scalable: Works for any size
- ✅ User control: Can override algorithm suggestions
- ✅ Smart defaults: Algorithm pre-selects lowest scores

**Implementation**:
- Component: `QuickSortModal.tsx` (NEW)
- Shows contacts in FlatList with checkbox
- Pre-selects lowest scoring contacts
- User can adjust selections
- Uses same review/approval flow as Would You Rather

---

### Strategy 2: Top-K Selection (ALTERNATIVE)

**When to Use**: When user wants more control than Quick Select but less tedious than full ranking

**How It Works**:
1. User is shown a **curated subset** (30-40 contacts near the cutoff)
2. User picks their **top K to keep** in current layer
3. Algorithm handles the rest based on scores
4. "Pick your top 30, we'll move the rest down"

**UX Flow**:
```
"Pick your top 30 people to keep in Tribe"
  ↓
Show 40 contacts (20 staying + 20 at risk)
  ↓
User selects 30 favorites
  ↓
Algorithm moves bottom 70 based on scores
  ↓
Review and approve
```

**Advantages**:
- ✅ Less overwhelming than full ranking
- ✅ User focuses on important decisions
- ✅ Hybrid: User control + algorithm assistance
- ✅ ~5 minutes instead of 30 minutes

**Use Case**: Users who want more input than Quick Select but not full ranking

---

### Strategy 3: Daily Gamified Questions (LONG-TERM SOLUTION)

**When to Use**: Continuous background ranking, not tied to violations

**How It Works**:
1. Part of **daily Harvest routine** (Expand, Cultivate, Plant, Prune)
2. Show **2-3 comparison questions** per day
3. Questions are **contextual** and **meaningful**
4. Gradually builds `intuitiveRank` over time
5. When violation occurs, algorithm already has rich ranking data

**UX Flow**:
```
User opens app for daily check-in
  ↓
"Daily Reflection" section in Harvest tab
  ↓
"Would you rather grab coffee with Alice or Bob?"
  ↓
User answers (takes 5 seconds)
  ↓
Next question tomorrow
  ↓
After 30 days: 90 comparisons completed
  ↓
When Tribe overflows, algorithm already knows preferences!
```

**Harvest Integration**:
- **Expand Horizons**: Questions about acquaintances/new people
- **Cultivate**: Questions about close relationships
- **Plant**: Questions about growth potential
- **Prune**: Questions about who to deprioritize

**Advantages**:
- ✅ No overwhelming "200 questions" session
- ✅ Builds ranking gradually over time
- ✅ Feels like daily reflection, not a chore
- ✅ Contextual and meaningful
- ✅ Gamified: streaks, progress, insights
- ✅ When violation happens, ranking is already 80% complete

**Implementation Details**:
- Store partial rankings in Jazz
- Track which pairs have been compared
- Use merge sort state to resume where left off
- Questions rotate through different categories
- Show progress: "You've ranked 45% of your Tribe"

---

## Recommended Phased Implementation

### Phase 1: IMMEDIATE (Week 1) - Visual Selection
**Goal**: Fix the immediate UX problem

Components to Build:
1. `QuickSortModal.tsx` - Visual selection interface
2. Update `dashboard.tsx` to offer Quick Select option
3. Pre-sort contacts by combined score
4. Multi-select checkbox UI
5. Review/approval screen (reuse from Would You Rather)

**User Journey**:
```
Violation Detected → Show Quick Select → User selects → Review → Done
```

Time to complete: ~30 seconds
Questions asked: 0
User satisfaction: ⭐⭐⭐⭐⭐

---

### Phase 2: ENHANCEMENT (Week 2-3) - Top-K Selection
**Goal**: Give users a middle option

Components to Build:
1. `TopKSelectionModal.tsx` - Curated subset selection
2. Algorithm to identify "bubble zone" (contacts near cutoff)
3. Interactive card selection UI
4. Clear messaging about algorithm handling the rest

**User Journey**:
```
Violation → Choose: Quick Select / Top-K / Full Ranking
           ↓ (Top-K chosen)
           Pick top 30 → Algorithm handles rest → Review → Done
```

Time to complete: ~5 minutes
Questions asked: 0 (just selections)
User satisfaction: ⭐⭐⭐⭐

---

### Phase 3: LONG-TERM (Month 2) - Daily Gamified Questions
**Goal**: Build rich ranking data over time

Components to Build:
1. `DailyReflectionCard.tsx` - Daily question component
2. Integration with Harvest tab
3. Progress tracking system
4. Question bank rotation logic
5. Partial ranking state management
6. Analytics: Show user their ranking progress

**User Journey**:
```
Day 1: Answer 2 questions (10 seconds)
Day 2: Answer 2 questions (10 seconds)
...
Day 30: 60 questions completed
Day 45: Tribe overflows → Algorithm has 80% of ranking → Quick Select for final 20% → Done
```

Time investment: 10 seconds/day
Total questions over time: 60-90 over a month
User satisfaction: ⭐⭐⭐⭐⭐ (feels like reflection, not work)

---

## Algorithm Modifications

### Current: Merge Sort (n log n)
- **Pros**: Optimal for complete sorting
- **Cons**: Requires too many questions for large n

### New Hybrid Approach:

#### 1. For Quick Select:
```typescript
// No questions! Just use existing scores
function quickSelectStrategy(contacts: Contact[], capacity: number) {
  // Sort by combined score (interactionScore + intuitiveRank bonus)
  const sorted = contacts.sort((a, b) => {
    const scoreA = (a.interactionScore || 0) + (a.intuitiveRank ? 100 / a.intuitiveRank : 0);
    const scoreB = (b.interactionScore || 0) + (b.intuitiveRank ? 100 / b.intuitiveRank : 0);
    return scoreB - scoreA;
  });
  
  // Pre-select bottom X for moving
  const staying = sorted.slice(0, capacity);
  const moving = sorted.slice(capacity);
  
  return { staying, moving, preselectedForMove: moving };
}
```

#### 2. For Top-K Selection:
```typescript
// Show only "bubble zone" contacts
function topKStrategy(contacts: Contact[], capacity: number) {
  const sorted = sortByScore(contacts);
  
  // Show contacts around the cutoff line
  const bubbleStart = Math.max(0, capacity - 20);
  const bubbleEnd = Math.min(contacts.length, capacity + 20);
  const bubbleZone = sorted.slice(bubbleStart, bubbleEnd);
  
  return {
    bubbleContacts: bubbleZone,
    needToKeep: capacity,
    automaticStaying: sorted.slice(0, bubbleStart),
    automaticMoving: sorted.slice(bubbleEnd)
  };
}
```

#### 3. For Daily Questions:
```typescript
// Resume partial merge sort
function dailyQuestionsStrategy(state: PartialRankingState) {
  // Continue merge sort from where we left off
  const nextPair = getNextPair(state);
  
  // Only ask 2-3 questions per day
  const dailyLimit = 3;
  const questionsAskedToday = state.questionsToday || 0;
  
  if (questionsAskedToday >= dailyLimit) {
    return { done: false, resumeTomorrow: true };
  }
  
  return { pair: nextPair, questionsRemaining: dailyLimit - questionsAskedToday };
}
```

---

## Data Model Updates

### New Fields Needed:

```typescript
// Contact schema
export const Contact = co.map({
  // ... existing fields ...
  
  // Enhanced scoring for Quick Select
  combinedScore: z.number().optional(), // interactionScore + intuitiveRank bonus
  lastQuickSorted: z.string().optional(), // When user last used Quick Select
  
  // Daily questions tracking
  dailyComparisonCount: z.number().optional(), // How many times compared in daily questions
  lastDailyComparison: z.string().optional(), // Last daily question date
});

// New: Partial Ranking State (for daily questions)
export const PartialRankingState = co.map({
  userId: z.string(),
  layer: z.number(),
  startedAt: z.string(),
  lastQuestionAt: z.string(),
  questionsAskedToday: z.number(),
  totalQuestionsAsked: z.number(),
  completionPercentage: z.number(),
  
  // Merge sort state
  sortedLists: z.array(z.array(z.string())),
  currentMerge: z.any().optional(),
  comparisonGraph: z.any(), // Serialized Map
});
```

---

## UI Component Specifications

### QuickSortModal Component

**Props**:
```typescript
interface QuickSortModalProps {
  visible: boolean;
  contacts: Contact[];
  capacity: number;
  violatedLayer: number;
  violatedLayerName: string;
  onComplete: (staying: string[], moving: string[]) => void;
  onCancel: () => void;
}
```

**Features**:
- FlatList with checkboxes
- Search bar to filter contacts
- Sort toggle: "By Score" / "By Name" / "By Last Interaction"
- Multi-select with "Select All" / "Deselect All"
- Counter showing "20 / 20 selected"
- Visual indicator of who's pre-selected by algorithm
- One-tap to restore algorithm suggestions

**UI Layout**:
```
┌────────────────────────────────┐
│  Select 20 to Move Down        │
│  ─────────────────────────     │
│  [Search...]                   │
│  Sort: [By Score ▼]            │
│  ─────────────────────────     │
│  ☑ Alice Chen                  │
│  │ Score: 45 • Last: 3 mo ago │
│  ─────────────────────────     │
│  ☑ Bob Smith                   │
│  │ Score: 42 • Last: 4 mo ago │
│  ─────────────────────────     │
│  ☐ Carol White                 │
│  │ Score: 78 • Last: 1 wk ago │
│  ─────────────────────────     │
│  [20 / 20 Selected]            │
│  [Restore Algorithm Picks]     │
│  [Review Changes →]            │
└────────────────────────────────┘
```

---

## Success Metrics

### Current (Would You Rather for Tribe):
- Time to complete: 20-30 minutes
- Completion rate: ~30% (most users abandon)
- User satisfaction: ⭐⭐ (frustrating)
- Questions asked: 173

### Target (Quick Select):
- Time to complete: 30 seconds - 2 minutes
- Completion rate: 95%+
- User satisfaction: ⭐⭐⭐⭐⭐
- Questions asked: 0

### Target (Daily Questions over 30 days):
- Time per day: 10 seconds
- Completion rate: 80%+ (daily habit)
- User satisfaction: ⭐⭐⭐⭐⭐
- Total questions: 60-90 (spread over a month)
- Benefit: When violation happens, 80% of ranking is already done

---

## Recommendation

**IMMEDIATE**: Implement Phase 1 (Quick Select)
- Solves the immediate UX problem
- Simple to build (1-2 days)
- Huge improvement in user satisfaction
- Can be done without waiting for Phase 2/3

**NEXT**: Implement Phase 3 (Daily Questions) before Phase 2
- Phase 2 (Top-K) is nice-to-have
- Phase 3 (Daily Questions) is strategic for long-term
- Building ranking data gradually prevents future violations from being painful

**Timeline**:
- Week 1: Quick Select
- Week 2-4: Daily Questions in Harvest
- Later: Top-K Selection (if needed based on user feedback)

## Implementation Priority

1. ✅ **CRITICAL**: Quick Select for overflow (THIS WEEK)
2. ✅ **HIGH**: Daily gamified questions (NEXT 2 WEEKS)
3. ⚠️ **MEDIUM**: Top-K selection (NICE TO HAVE)
4. ⚠️ **LOW**: Keep full Would You Rather for small groups (<20 people)

---

## Next Steps

1. **Design UI mockups** for Quick Select modal
2. **Create QuickSortModal.tsx** component
3. **Update dashboard.tsx** to show Quick Select option
4. **Test with real user data** (100+ contacts in Tribe)
5. **Gather feedback** and iterate
6. **Then move to** Daily Questions system
