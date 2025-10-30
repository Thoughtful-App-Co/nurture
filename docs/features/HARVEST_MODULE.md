# Harvest Module - Proactive Relationship Nurturing

## Overview

The Harvest module transforms Nurture from a **passive analysis tool** into an **active relationship coach**. While the Garden (dashboard) shows you the state of your relationships, Harvest guides you to actively tend them.

Think of it as the difference between:
- **Garden:** "Here's what your relationships look like"
- **Harvest:** "Here's who you should reach out to today, and why"

---

## Core Philosophy

### Behavioral Reality Meets Intentional Action

Nurture's core principle is "behavioral reality, not wishful thinking." The Garden shows you the truth. But Harvest asks: **"What do you want to do about it?"**

Users set **goals** (algorithms) that reflect their values:
- Want to deepen your closest bonds? → **Tend & Befriend**
- Need to meet new people? → **Expand Horizons**
- Drifted from old friends? → **Rekindle**
- Feel overwhelmed? → **Inner Circle** (focus on few)

The app then **proactively suggests actions** based on these goals.

---

## Algorithm Types

### 1. Tend & Befriend
**Philosophy:** Nurture your closest relationships with consistent emotional support.

**Research Basis:** Taylor (2006) - "Tend-and-befriend" stress response emphasizes caregiving and social affiliation.

**Target:** Layers 0-2 (Intimate Core, Sympathy Group, Close Group)

**Behavior:**
- Daily checks
- Suggests contact if no interaction in 7 days
- Heavy weight on recency
- Prioritizes emotional support actions

**Best For:**
- People who value depth over breadth
- Those going through stressful times
- Users with strong existing close relationships

### 2. Plant & Prune
**Philosophy:** Strategic social energy allocation. Prune weak connections, invest in promising ones.

**Research Basis:** Dunbar (1998) - Cognitive limits mean strategic investment is necessary.

**Target:** Layers 2-4 (Close Group, Tribe, Acquaintances)

**Behavior:**
- Weekly checks
- Suggests contact if no interaction in 30 days
- Prioritizes people you usually talk to often
- Identifies "weak ties" worth strengthening

**Best For:**
- Career-focused individuals
- People building professional networks
- Those with limited time for social maintenance

### 3. Cultivate
**Philosophy:** Balanced, consistent maintenance across all relationship layers.

**Research Basis:** Reis & Shaver (1988) - Consistent interaction builds intimacy.

**Target:** All layers (0-5)

**Behavior:**
- Checks every 3 days
- Suggests contact if no interaction in 14 days
- Balanced weighting across metrics
- No favoritism - all layers get attention

**Best For:**
- People who want holistic relationship health
- Those with good time management
- Users who don't want anyone neglected

### 4. Inner Circle
**Philosophy:** Intense focus on your intimate core. Deep over wide.

**Research Basis:** Marsden (1987) - Core discussion network averaging 2-3 people.

**Target:** Layers 0-1 only (Intimate Core, Sympathy Group)

**Behavior:**
- Daily checks
- Very short threshold (3 days)
- Heavy recency weighting
- Ignores outer layers entirely

**Best For:**
- Introverts who prefer few deep connections
- People in crisis needing support circle
- Those consciously limiting social obligations

### 5. Expand Horizons
**Philosophy:** Focus on meeting new people and moving acquaintances to closer layers.

**Research Basis:** Granovetter (1973) - "Strength of weak ties" for new opportunities.

**Target:** Layers 3-5 (Tribe, Acquaintances, Social Nebula)

**Behavior:**
- Weekly checks
- Long threshold (60 days) - focuses on rarely-seen people
- Heavy weight on interaction quality
- Encourages face-to-face meetings

**Best For:**
- People new to a city
- Career changers building new networks
- Those feeling socially isolated
- Extroverts seeking variety

### 6. Rekindle
**Philosophy:** Reconnect with people you've drifted from. Revive old friendships.

**Research Basis:** Ledbetter et al. (2011) - Reconnection maintenance behaviors.

**Target:** Layers 2-5 (people you haven't talked to recently)

**Behavior:**
- Biweekly checks
- Very long threshold (90 days) - focuses on long-lost connections
- Heavy recency weight (suggests people you've ignored)
- Lower priority on current frequency

**Best For:**
- People who've moved cities
- Those who've let friendships lapse
- Users feeling nostalgic
- Life transitions (post-graduation, new job, etc.)

### 7. Balance
**Philosophy:** Maintain equilibrium across all layers. No one gets neglected.

**Research Basis:** Multiple layers serve different psychological needs (Dunbar, 2018).

**Target:** All layers (0-5)

**Behavior:**
- Checks every 5 days
- Moderate threshold (21 days)
- Perfectly balanced weights (25% each metric)
- Prevents any layer from dominating suggestions

**Best For:**
- People who want "set it and forget it"
- Those with varied social needs
- Users who trust the algorithm
- Balanced personality types

---

## How It Works

### 1. Algorithm Selection (User Choice)

User opens Harvest screen and enables one or more algorithms:

```tsx
// Example: User enables "Tend & Befriend" and "Rekindle"
activeAlgorithms = ["TEND_AND_BEFRIEND", "REKINDLE"]
```

### 2. Background Generation (Scheduled)

At the configured frequency (e.g., daily), the app runs each active algorithm:

```typescript
for (const algorithm of activeAlgorithms) {
  const config = ALGORITHM_PRESETS[algorithm];
  
  // 1. Filter contacts by target layers
  const targetContacts = contacts.filter(c => 
    config.targetLayers.includes(c.dunbarLayer)
  );
  
  // 2. Calculate priority for each contact
  for (const contact of targetContacts) {
    const daysSinceContact = calculateDaysSince(contact.lastInteraction);
    
    if (daysSinceContact >= config.actionThreshold) {
      const priority = calculatePriority(contact, config.priorityWeights);
      
      // 3. Generate suggestion
      suggestions.push({
        contactId: contact.id,
        algorithmType: algorithm,
        actionType: determineActionType(contact, algorithm),
        priority,
        reason: generateReason(contact, algorithm, daysSinceContact),
      });
    }
  }
}

// 4. Sort by priority, take top N
const topSuggestions = suggestions
  .sort((a, b) => b.priority - a.priority)
  .slice(0, 5); // Show max 5 per day
```

### 3. Notification (Push)

User gets a push notification:

```
🌾 Harvest: You have 3 suggestions today
• Call Mom (Tend & Befriend)
• Text Alex (Rekindle)
• Meet Sarah for coffee (Cultivate)
```

### 4. User Action

User opens Harvest screen, sees suggestions, and can:
- **Complete:** Mark action as done → logs interaction → updates Dunbar layers
- **Snooze:** Hide for X days
- **Dismiss:** Permanently hide this suggestion

### 5. Feedback Loop

When user completes a suggestion:
1. Interaction is logged (automatically)
2. Contact's metrics update
3. Dunbar layer may change
4. Future suggestions adjust based on new data

---

## Priority Calculation

Each suggestion gets a priority score (0-100) based on:

```typescript
function calculatePriority(
  contact: Contact,
  weights: PriorityWeights
): number {
  // Recency: How long since last contact
  const recencyScore = Math.min(daysSinceContact / 90, 1) * weights.recency;
  
  // Frequency: How often you usually talk
  const frequencyScore = (contact.interactionFrequency / 10) * weights.frequency;
  
  // Quality: Average quality of interactions
  const qualityScore = (contact.qualityRating / 5) * weights.quality;
  
  // Family bonus: Prioritize family
  const familyBonus = contact.isFamily ? weights.familyBonus : 0;
  
  return (recencyScore + frequencyScore + qualityScore + familyBonus) * 100;
}
```

**Example:**

Contact: Mom
- Days since contact: 10
- Usual frequency: 8 calls/month
- Quality rating: 5/5
- Is family: true

Algorithm: Tend & Befriend
- Recency weight: 0.5
- Frequency weight: 0.2
- Quality weight: 0.2
- Family bonus: 0.1

```
recencyScore = min(10/90, 1) * 0.5 = 0.055
frequencyScore = (8/10) * 0.2 = 0.16
qualityScore = (5/5) * 0.2 = 0.2
familyBonus = 0.1

priority = (0.055 + 0.16 + 0.2 + 0.1) * 100 = 51.5
```

---

## Action Type Determination

Based on contact and algorithm, the app suggests appropriate actions:

| Layer | Algorithm | Suggested Action |
|-------|-----------|------------------|
| 0-1 | Any | CALL (voice = deeper connection) |
| 2 | Tend & Befriend | CALL or VIDEO_CALL |
| 2-3 | Cultivate | TEXT or MEET |
| 3-4 | Plant & Prune | MEET (face-to-face builds bonds) |
| 4-5 | Expand Horizons | MEET or CHECK_IN |
| Any | Rekindle | CALL or MEET (needs personal touch) |

---

## Reason Generation

Each suggestion includes a human-readable reason:

**Template:**
```
"It's been {days} days since you {lastAction} {contact}. 
{AlgorithmReason}"
```

**Examples:**

```
"It's been 12 days since you called Mom. Your Tend & Befriend goal prioritizes close family connections."

"You haven't talked to Alex in 94 days. Your Rekindle goal suggests reconnecting with old friends."

"Sarah is in your Close Group but you haven't met in 18 days. Your Cultivate goal keeps all layers healthy."
```

---

## Gamification

To encourage consistent use:

### Streaks
- **Current Streak:** Days in a row with completed actions
- **Longest Streak:** Personal best
- Visual streak counter on Harvest screen

### Action Count
- Total actions completed via Harvest
- Milestone celebrations (10, 50, 100, etc.)

### Badges (Future)
- "Tender": 30 days of Tend & Befriend
- "Gardener": 60 days of Cultivate
- "Rekindler": Reconnected with 10 people
- "Social Butterfly": 100 actions completed

---

## Notification Settings

User can configure:
- **Frequency:** Daily, Weekly, Biweekly
- **Preferred Time:** e.g., "8:00 AM"
- **Preferred Days:** e.g., ["MON", "WED", "FRI"]
- **Quiet Hours:** No notifications during sleep (22:00-08:00)

---

## Data Model

See `/jazz/harvestSchema.ts` for full schema.

**Key Models:**
- `HarvestAlgorithm`: User's active algorithms
- `HarvestSuggestion`: Generated suggestions
- `HarvestProfile`: User's settings, stats, streaks

---

## Implementation Status

### ✅ Completed
- Tab bar styling (dark green with elevation)
- Harvest schema with all 7 algorithms
- Algorithm presets with research-backed parameters
- Harvest screen UI
- Algorithm selection interface
- Stats/streak display

### 🚧 In Progress
- Algorithm engine (priority calculation)
- Suggestion generation logic
- Feedback loop (completing actions)

### 📋 TODO
- Push notifications
- Background task scheduling
- Snooze functionality
- Dismiss functionality
- Streak tracking
- Badges/achievements
- Algorithm customization (adjust weights)
- A/B testing different thresholds

---

## Future Enhancements

### Smart Scheduling
"Best time to reach out" predictions based on:
- Historical response patterns
- Time of day analysis
- Day of week patterns

### Context-Aware Suggestions
- "You're near Sarah's neighborhood - want to meet for coffee?"
- "It's Mom's birthday next week"
- "You usually call Dad on Sundays"

### Multi-Modal Actions
- One-tap actions: "Text now", "Schedule call", "Add to calendar"
- Integration with phone, messages, calendar
- Voice commands: "Hey Siri, complete Harvest suggestion"

### Social Learning
- "Users with similar goals found success with..."
- "People who enabled Rekindle saw 40% increase in layer 2 contacts"

### Relationship Health Score
- Overall score based on Harvest compliance
- "Garden Health: 85/100"
- Breakdown by layer

---

## Design Rationale

### Why Multiple Algorithms?

People have different relationship philosophies. Some value depth (Inner Circle), others value breadth (Expand Horizons). Allowing multiple algorithms lets users express complex goals:

**Example:** "I want to focus on my core (Tend & Befriend) BUT also reconnect with old friends (Rekindle)"

### Why Push vs. Pull?

Garden is **pull** - user opens app to check status.
Harvest is **push** - app nudges user to take action.

This is intentional: behavior change requires prompts.

### Why Gamification?

Streaks and milestones create positive reinforcement loops. Social maintenance is hard; gamification makes it rewarding.

---

## Files

| File | Purpose |
|------|---------|
| `/app/(tabs)/harvest.tsx` | Harvest screen UI |
| `/jazz/harvestSchema.ts` | Data models and algorithm definitions |
| `/services/harvestEngine.ts` | Algorithm logic (TODO) |
| `/services/notificationService.ts` | Push notifications (TODO) |
| `/docs/HARVEST_MODULE.md` | This file |

---

## Research References

- Dunbar, R. I. M. (1998). *Grooming, Gossip, and the Evolution of Language*
- Granovetter, M. S. (1973). "The Strength of Weak Ties"
- Marsden, P. V. (1987). "Core Discussion Networks of Americans"
- Reis, H. T., & Shaver, P. (1988). "Intimacy as an Interpersonal Process"
- Taylor, S. E. (2006). "Tend and Befriend: Biobehavioral Bases"
- Ledbetter, A. M. et al. (2011). "Attitude Toward Online Social Connection"

---

## Summary

Harvest is the **action engine** that transforms Nurture from analysis to behavior change. It respects user agency (choose your goals), leverages behavioral reality (Garden data), and guides intentional cultivation of relationships that matter.

**"Don't just see your garden. Actively tend it."**
