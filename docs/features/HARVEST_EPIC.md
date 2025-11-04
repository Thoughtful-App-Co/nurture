# Harvest Epic - Quest System & Achievement Framework

## Overview

The Harvest Epic transforms Harvest from a simple "suggestion engine" into a **gamified quest system** that guides users through meaningful relationship actions while building critical data (like `intuitiveRank`) through daily micro-interactions.

**Core Concept**: Mini quests that act as "feature flags" - turning on daily needs that help users:
1. Generate intuitive ranking data (Would You Rather questions)
2. Complete relationship maintenance actions
3. Earn badges and achievements
4. Build sustainable relationship habits

---

## Architecture: Quests as Feature Flags

### What Are Quests?

Quests are **user-configurable, time-bound goals** that:
- Enable specific daily tasks/features
- Track progress and completion
- Unlock badges and achievements
- Can be paused, resumed, or completed

Think of them as:
- **User Perspective**: "Goals I'm working toward"
- **System Perspective**: "Feature flags that enable daily prompts"

### Quest Categories

#### 1. **Ranking Quests** (Data Generation)
**Purpose**: Build intuitive ranking data gradually

**Quest**: "Know Your Circle"
- **Description**: "Answer 2-3 comparison questions daily to understand your true priorities"
- **Daily Task**: Show 2-3 Would You Rather questions
- **Progress**: "45 comparisons completed / 100 needed"
- **Duration**: 30-45 days
- **Reward**: "Circle Clarity" badge + unlock advanced reports
- **Feature Flag**: Enables daily ranking questions modal

**Quest**: "Complete Your Ranking"
- **Description**: "Rank all contacts in your [Layer Name]"
- **Daily Task**: 5 comparisons per day
- **Progress**: "23 / 150 contacts ranked"
- **Duration**: Until layer complete
- **Reward**: Layer-specific badge (e.g., "Tribe Ranker")
- **Feature Flag**: Enables targeted ranking for specific layer

#### 2. **Maintenance Quests** (Relationship Actions)
**Purpose**: Proactive relationship nurturing

**Quest**: "Weekly Check-In Streak"
- **Description**: "Reach out to someone every week for 4 weeks"
- **Daily Task**: Suggests 3 people to contact
- **Progress**: "Week 2 / 4"
- **Reward**: "Steady Gardener" badge
- **Feature Flag**: Enables weekly contact suggestions

**Quest**: "Rekindle Old Connections"
- **Description**: "Reconnect with 5 people you haven't talked to in 90+ days"
- **Daily Task**: Suggests 1-2 people to reconnect with
- **Progress**: "2 / 5 reconnected"
- **Reward**: "Rekindler" badge
- **Feature Flag**: Enables lapsed-contact suggestions

#### 3. **Quality Quests** (Data Enrichment)
**Purpose**: Improve data quality

**Quest**: "Rate Your Interactions"
- **Description**: "Add quality ratings to your last 20 interactions"
- **Daily Task**: Prompt to rate recent calls/texts
- **Progress**: "12 / 20 rated"
- **Reward**: "Reflective" badge + better personalization
- **Feature Flag**: Enables post-interaction rating prompts

**Quest**: "Family Tree Builder"
- **Description**: "Identify all family members in your contacts"
- **Daily Task**: Shows potential family matches
- **Progress**: "8 family members tagged"
- **Reward**: "Genealogist" badge
- **Feature Flag**: Enables family detection workflow

#### 4. **Discovery Quests** (Feature Exploration)
**Purpose**: Guide users through app features

**Quest**: "Explore Your Garden"
- **Description**: "Learn about each Dunbar layer"
- **Daily Task**: Interactive layer walkthrough
- **Progress**: "3 / 6 layers explored"
- **Reward**: "Gardener" badge
- **Feature Flag**: Enables daily feature tips

---

## Daily Quest Flow

### Morning Quest Check (8:00 AM)

```
User opens app → Harvest tab badge shows "3"

Harvest Screen:
┌─────────────────────────────────┐
│ 🌅 Good Morning, [Name]!        │
│                                  │
│ Today's Quests (3 active):      │
│                                  │
│ 🎯 Know Your Circle              │
│ ├─ 2 questions ready             │
│ ├─ Progress: 45/100 (45%)       │
│ └─ Streak: 15 days 🔥           │
│                                  │
│ 💬 Weekly Check-In               │
│ ├─ 3 people to contact           │
│ ├─ Progress: Week 2/4            │
│ └─ Streak: 8 days 🔥            │
│                                  │
│ ⭐ Rate Your Interactions        │
│ ├─ 1 recent call to rate         │
│ ├─ Progress: 12/20 (60%)        │
│ └─ No streak yet                │
│                                  │
│ [Start Daily Quests →]          │
└─────────────────────────────────┘
```

### Quest Execution Flow

#### Example: "Know Your Circle" Quest

**Step 1: User taps quest**
```
┌─────────────────────────────────┐
│ 🎯 Know Your Circle              │
│                                  │
│ Answer 2 questions to understand │
│ your true relationship priorities│
│                                  │
│ Today: 2 / 2 questions           │
│ Total: 45 / 100 comparisons      │
│                                  │
│ Estimated time: 30 seconds       │
│                                  │
│ [Start Questions →]              │
└─────────────────────────────────┘
```

**Step 2: Lightweight Would You Rather**
```
┌─────────────────────────────────┐
│ Question 1 of 2                  │
│                                  │
│ Who would you rather grab        │
│ coffee with?                     │
│                                  │
│ ┌───────────┐ ┌───────────┐    │
│ │   Alice   │ │    Bob    │    │
│ │  Layer 2  │ │  Layer 2  │    │
│ └───────────┘ └───────────┘    │
│                                  │
│ [Skip]                          │
└─────────────────────────────────┘
```

**Step 3: Completion**
```
┌─────────────────────────────────┐
│ ✅ Quest Progress Updated!       │
│                                  │
│ Know Your Circle                 │
│ ├─ Today: 2/2 complete ✓        │
│ ├─ Total: 47/100 (47%)          │
│ └─ Streak: 16 days 🔥           │
│                                  │
│ Keep going! Only 53 more         │
│ comparisons until "Circle        │
│ Clarity" badge 🏆               │
│                                  │
│ [Back to Quests]                │
└─────────────────────────────────┘
```

---

## Badge System

### Badge Categories

#### 🏆 **Completion Badges** (Milestone Achievements)

**"Circle Clarity"**
- **Requirement**: Complete 100 comparisons across all layers
- **Reward**: Unlock "Ranking Report" feature
- **Description**: "You know where you stand with people"

**"Tribe Ranker"**
- **Requirement**: Rank all contacts in Tribe layer
- **Reward**: Layer-specific insights
- **Description**: "Master of your Tribe relationships"

**"Full Garden Ranker"** ⭐ FIRST BADGE
- **Requirement**: Rank ALL contacts across ALL layers
- **Reward**: "Relationship Master" title + special dashboard theme
- **Description**: "You've ranked every relationship in your life"
- **Why This is Special**: This is transformative - user now has complete clarity on every relationship

#### 🔥 **Streak Badges**

**"Week Warrior"**
- **Requirement**: 7-day quest streak
- **Description**: "Completed quests 7 days in a row"

**"Month Master"**
- **Requirement**: 30-day quest streak
- **Description**: "Completed quests 30 days in a row"

**"Year Gardener"**
- **Requirement**: 365-day quest streak
- **Description**: "A full year of relationship cultivation"

#### 💬 **Action Badges**

**"Rekindler"**
- **Requirement**: Reconnect with 10 people (90+ days lapsed)
- **Description**: "You brought old friendships back to life"

**"Steady Gardener"**
- **Requirement**: Complete 50 weekly check-ins
- **Description**: "Consistent relationship maintenance"

**"Social Butterfly"**
- **Requirement**: Contact 100 different people via Harvest
- **Description**: "You've nurtured connections across your entire garden"

#### 📊 **Data Quality Badges**

**"Reflective"**
- **Requirement**: Rate 50 interactions
- **Description**: "You think deeply about your relationships"

**"Genealogist"**
- **Requirement**: Tag all family members
- **Description**: "Family tree complete"

---

## Quest Management UI

### Harvest Screen Structure

```
┌─────────────────────────────────┐
│ 🌾 Harvest                       │
│                                  │
│ ┌─────────────────────────────┐ │
│ │ 🏆 Badges: 5 / 23           │ │
│ │ 🔥 Streak: 16 days          │ │
│ │ ✓ Today: 2/3 quests done   │ │
│ └─────────────────────────────┘ │
│                                  │
│ Active Quests (3):              │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Know Your Circle         │ │
│ │ ├─ Today: 2/2 ✓            │ │
│ │ └─ 47/100 total (47%)      │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 💬 Weekly Check-In          │ │
│ │ ├─ Today: 0/1               │ │
│ │ └─ Week 2/4                 │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ⭐ Rate Interactions         │ │
│ │ ├─ Today: 0/1               │ │
│ │ └─ 12/20 total (60%)       │ │
│ └─────────────────────────────┘ │
│                                  │
│ [+ Add Quest]                   │
│                                  │
│ Available Quests:               │
│ • Rekindle Old Connections      │
│ • Complete Your Tribe Ranking   │
│ • Family Tree Builder           │
│ • Explore Your Garden           │
│                                  │
│ [View All Badges →]             │
└─────────────────────────────────┘
```

### Badge Collection Screen

```
┌─────────────────────────────────┐
│ 🏆 Your Badges                   │
│                                  │
│ Earned (5):                     │
│ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │ 🎯  │ │ 🔥  │ │ 💬  │        │
│ │Circle│ │Week │ │Steady│       │
│ │Clarity│ │Warrior│ │Garden│     │
│ └─────┘ └─────┘ └─────┘        │
│                                  │
│ Locked (18):                    │
│ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │ 🔒  │ │ 🔒  │ │ 🔒  │        │
│ │Tribe │ │Month │ │Rekin-│      │
│ │Ranker│ │Master│ │dler  │      │
│ └─────┘ └─────┘ └─────┘        │
│ 75/150  │ 16/30 │  2/10 │       │
│                                  │
│ Next Badge: "Tribe Ranker"      │
│ 75 more contacts to rank!       │
│                                  │
│ [Back]                          │
└─────────────────────────────────┘
```

---

## Data Model

### Quest Schema

```typescript
export const Quest = co.map({
  id: z.string(),
  type: z.enum([
    "RANKING",        // Builds intuitiveRank data
    "MAINTENANCE",    // Relationship actions
    "QUALITY",        // Data enrichment
    "DISCOVERY",      // Feature exploration
  ]),
  
  // Metadata
  name: z.string(),                    // "Know Your Circle"
  description: z.string(),             // "Answer 2-3 questions daily..."
  emoji: z.string(),                   // "🎯"
  
  // Configuration
  isActive: z.boolean(),               // User toggled on/off
  startedAt: z.string().optional(),    // ISO date
  completedAt: z.string().optional(),  // ISO date
  pausedAt: z.string().optional(),     // ISO date
  
  // Progress Tracking
  dailyTarget: z.number(),             // How many tasks per day
  totalTarget: z.number().optional(),  // Total goal (if applicable)
  currentProgress: z.number(),         // Current count
  
  // Streak
  streakCount: z.number(),             // Current streak
  longestStreak: z.number(),           // Personal best
  lastCompletedDate: z.string().optional(), // ISO date (for streak tracking)
  
  // Rewards
  badgeId: z.string().optional(),      // Which badge this unlocks
  rewardDescription: z.string().optional(),
  
  // Feature Flag Behavior
  featureConfig: z.object({
    enableDailyModal: z.boolean(),                    // Show modal on app open?
    modalType: z.enum(["RANKING", "CONTACT", "RATE"]).optional(),
    targetLayer: z.number().optional(),               // For layer-specific quests
    contactFilter: z.enum(["LAPSED", "FREQUENT", "ALL"]).optional(),
  }).optional(),
});

export const QuestList = co.list(Quest);
```

### Badge Schema

```typescript
export const Badge = co.map({
  id: z.string(),
  name: z.string(),                    // "Circle Clarity"
  description: z.string(),             // "You know where you stand..."
  emoji: z.string(),                   // "🎯"
  
  // Requirements
  category: z.enum([
    "COMPLETION",     // Milestone achievements
    "STREAK",         // Consistency
    "ACTION",         // Relationship actions
    "QUALITY",        // Data quality
  ]),
  
  requirement: z.object({
    type: z.enum(["COUNT", "STREAK", "COMPLETE_ALL"]),
    target: z.number().optional(),     // e.g., 100 comparisons
    questId: z.string().optional(),    // Which quest unlocks this
  }),
  
  // Status
  isUnlocked: z.boolean(),
  unlockedAt: z.string().optional(),   // ISO date
  progress: z.number().optional(),     // For locked badges, show progress
  
  // Rewards
  unlocks: z.array(z.string()).optional(), // Feature IDs this unlocks
});

export const BadgeList = co.list(Badge);
```

### Updated Harvest Profile

```typescript
export const HarvestProfile = co.map({
  userId: z.string(),
  
  // Quest Management
  activeQuests: QuestList,
  completedQuests: QuestList,
  availableQuests: z.array(z.string()), // Quest IDs user can start
  
  // Badges
  badges: BadgeList,
  
  // Overall Stats
  totalQuestsCompleted: z.number(),
  totalBadgesEarned: z.number(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  
  // Daily Completion
  lastDailyCompletionDate: z.string().optional(), // ISO date
  todayTasksCompleted: z.number(),
  todayTasksTotal: z.number(),
  
  // Settings
  notificationsEnabled: z.boolean(),
  preferredReminderTime: z.string(), // "08:00"
  quietHours: z.object({
    start: z.string(), // "22:00"
    end: z.string(),   // "08:00"
  }).optional(),
});
```

---

## Daily Quest Logic

### Quest Generation Algorithm

```typescript
function generateDailyTasks(profile: HarvestProfile): DailyTask[] {
  const tasks: DailyTask[] = [];
  
  for (const quest of profile.activeQuests) {
    if (!quest.isActive || quest.completedAt) continue;
    
    // Check if user already completed today's tasks for this quest
    const todayComplete = checkTodayComplete(quest);
    if (todayComplete) continue;
    
    // Generate tasks based on quest type
    switch (quest.type) {
      case "RANKING":
        tasks.push(...generateRankingTasks(quest, profile));
        break;
      
      case "MAINTENANCE":
        tasks.push(...generateMaintenanceTasks(quest, profile));
        break;
      
      case "QUALITY":
        tasks.push(...generateQualityTasks(quest, profile));
        break;
      
      case "DISCOVERY":
        tasks.push(...generateDiscoveryTasks(quest, profile));
        break;
    }
  }
  
  return tasks.slice(0, 10); // Max 10 tasks per day (don't overwhelm)
}

function generateRankingTasks(
  quest: Quest,
  profile: HarvestProfile
): DailyTask[] {
  const tasks: DailyTask[] = [];
  const targetCount = quest.dailyTarget;
  
  // Get next N comparisons from partial ranking state
  const partialState = loadPartialRankingState(profile.userId);
  
  for (let i = 0; i < targetCount; i++) {
    const nextPair = getNextPair(partialState);
    
    if (!nextPair) break; // No more pairs to compare
    
    tasks.push({
      questId: quest.id,
      type: "RANKING",
      title: "Compare two contacts",
      subtitle: `${nextPair.contactA.name} vs ${nextPair.contactB.name}`,
      action: {
        type: "MODAL",
        modalType: "WOULD_YOU_RATHER",
        data: nextPair,
      },
    });
  }
  
  return tasks;
}

function generateMaintenanceTasks(
  quest: Quest,
  profile: HarvestProfile
): DailyTask[] {
  const tasks: DailyTask[] = [];
  
  // Get contacts based on filter
  let contacts = [];
  switch (quest.featureConfig?.contactFilter) {
    case "LAPSED":
      contacts = getContactsNotContactedInDays(90);
      break;
    case "FREQUENT":
      contacts = getFrequentContacts();
      break;
    default:
      contacts = getAllContacts();
  }
  
  // Generate contact suggestions
  for (let i = 0; i < quest.dailyTarget; i++) {
    const contact = contacts[i];
    if (!contact) break;
    
    tasks.push({
      questId: quest.id,
      type: "CONTACT",
      title: `Reach out to ${contact.name}`,
      subtitle: `Last contact: ${formatDaysAgo(contact.lastInteraction)}`,
      action: {
        type: "CONTACT",
        contactId: contact.id,
        suggestedMethod: determineBestContactMethod(contact),
      },
    });
  }
  
  return tasks;
}
```

### Completion Tracking

```typescript
function completeTask(task: DailyTask, profile: HarvestProfile) {
  const quest = profile.activeQuests.find(q => q.id === task.questId);
  if (!quest) return;
  
  // Update progress
  quest.currentProgress++;
  
  // Update streak
  const today = new Date().toISOString().split('T')[0];
  const lastDate = quest.lastCompletedDate?.split('T')[0];
  
  if (lastDate === today) {
    // Already completed today, don't update streak
  } else if (isYesterday(lastDate)) {
    // Streak continues
    quest.streakCount++;
    quest.longestStreak = Math.max(quest.streakCount, quest.longestStreak);
  } else {
    // Streak broken
    quest.streakCount = 1;
  }
  
  quest.lastCompletedDate = new Date().toISOString();
  
  // Check if quest is complete
  if (quest.totalTarget && quest.currentProgress >= quest.totalTarget) {
    quest.completedAt = new Date().toISOString();
    
    // Unlock badge
    if (quest.badgeId) {
      unlockBadge(quest.badgeId, profile);
    }
    
    // Show celebration
    showQuestCompletionModal(quest);
  }
  
  // Update daily stats
  profile.todayTasksCompleted++;
  updateDailyStreak(profile);
  
  // Save to Jazz
  saveHarvestProfile(profile);
}

function unlockBadge(badgeId: string, profile: HarvestProfile) {
  const badge = profile.badges.find(b => b.id === badgeId);
  if (!badge || badge.isUnlocked) return;
  
  badge.isUnlocked = true;
  badge.unlockedAt = new Date().toISOString();
  profile.totalBadgesEarned++;
  
  // Show badge earned modal
  showBadgeEarnedModal(badge);
  
  // Unlock features if any
  if (badge.unlocks) {
    for (const featureId of badge.unlocks) {
      unlockFeature(featureId, profile);
    }
  }
}
```

---

## Implementation Plan

### Phase 1: Core Quest System (Week 1-2)
- ✅ Quest data model
- ✅ Quest management UI
- ✅ Daily task generation
- ✅ Task completion tracking
- ✅ Streak calculation

### Phase 2: Ranking Integration (Week 2-3)
- ✅ Integrate daily ranking questions
- ✅ Save partial ranking state
- ✅ Resume ranking from where left off
- ✅ "Know Your Circle" quest
- ✅ "Complete Your Ranking" quest

### Phase 3: Badge System (Week 3-4)
- ✅ Badge data model
- ✅ Badge collection UI
- ✅ Badge unlock logic
- ✅ "Full Garden Ranker" badge
- ✅ Celebration animations

### Phase 4: Additional Quests (Week 4-5)
- ✅ Maintenance quests
- ✅ Quality quests
- ✅ Discovery quests
- ✅ Quest recommendations

### Phase 5: Notifications (Week 5-6)
- ✅ Daily reminder notifications
- ✅ Streak reminder notifications
- ✅ Badge earned notifications
- ✅ Quest completion notifications

---

## Success Metrics

### Engagement Metrics
- **Daily Active Users**: % who complete at least 1 task
- **Quest Completion Rate**: % who finish started quests
- **Streak Retention**: % maintaining 7+ day streaks
- **Badge Collection Rate**: Average badges per user

### Data Quality Metrics
- **Intuitive Ranking Coverage**: % of contacts with intuitiveRank
- **Interaction Rating Coverage**: % of interactions with quality rating
- **Family Tag Accuracy**: % of family members correctly tagged

### Behavioral Metrics
- **Contact Frequency Increase**: Change in contact rate after quest activation
- **Relationship Health Score**: Improvement in overall garden health
- **Feature Discovery**: % of users who discover features via quests

---

## Key Benefits

### For Users
- ✅ **Clear Goals**: Know what to focus on daily
- ✅ **Progress Tracking**: See improvement over time
- ✅ **Gamification**: Fun and rewarding
- ✅ **Habit Building**: Sustainable relationship practices
- ✅ **Achievement**: Badges provide sense of accomplishment

### For Product
- ✅ **Data Generation**: Builds intuitiveRank without overwhelming users
- ✅ **Engagement**: Daily active use through quests
- ✅ **Feature Discovery**: Guides users through app capabilities
- ✅ **Quality**: Enriches data through quality quests
- ✅ **Retention**: Streaks and badges keep users coming back

### For Algorithm
- ✅ **Rich Data**: intuitiveRank comparisons over time
- ✅ **Quality Signals**: User ratings improve personalization
- ✅ **Behavioral Patterns**: Learn from quest completion patterns
- ✅ **Validation**: Compare algorithmic suggestions vs user actions

---

## Summary

The Harvest Epic transforms daily relationship maintenance from a chore into an engaging, rewarding experience. By framing data collection (like intuitive ranking) as meaningful quests with tangible rewards (badges), we:

1. **Solve the scalability problem**: No more 173-question sessions
2. **Build data gradually**: 2-3 questions per day over 30-45 days
3. **Create habits**: Daily quests → sustainable relationship practices
4. **Provide clarity**: "Full Garden Ranker" badge = complete relationship awareness
5. **Drive engagement**: Quests, streaks, and badges keep users coming back

**"Transform relationship cultivation into a rewarding daily practice."**
