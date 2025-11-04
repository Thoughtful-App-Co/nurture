/**
 * Volition Manager - Handles relationship cultivation strategies and time tracking
 * 
 * This service manages:
 * - Daily action generation based on active volitions
 * - Volition progress and time tracking
 * - Weekly time investment calculations
 * - Internal work completion metrics
 */

import { VOLITION_PRESETS, BADGE_DEFINITIONS, type VolitionConfig, type BadgeConfig } from "@/jazz/harvestSchema";

/**
 * Daily Action - A single actionable item for the user
 */
export interface DailyAction {
  id: string;
  volitionId: string;
  type: "RANKING" | "CONTACT" | "RATE" | "DISCOVERY";
  title: string;
  subtitle: string;
  estimatedMinutes: number; // Time estimate for this specific action
  action: {
    type: "MODAL" | "CONTACT" | "NAVIGATE";
    modalType?: "WOULD_YOU_RATHER" | "RATE_INTERACTION" | "CONTACT_SUGGESTION";
    data?: any;
  };
}

/**
 * Volition Instance - Runtime state of a volition
 */
export interface VolitionInstance extends VolitionConfig {
  isActive: boolean;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  currentProgress: number;
  streakCount: number;
  longestStreak: number;
  lastCompletedDate?: string;
  weeklyTimeSpent: number; // Actual time spent this week in minutes
}

/**
 * Badge Instance - Runtime state of a badge
 */
export interface BadgeInstance extends BadgeConfig {
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
}

/**
 * Generate daily tasks from active quests
 */
export function generateDailyActions(
  activeQuests: VolitionInstance[],
  completedToday: Set<string> // Quest IDs already completed today
): DailyAction[] {
  const tasks: DailyAction[] = [];
  
  for (const volition of activeQuests) {
    // Skip if volition is paused or completed
    if (volition.pausedAt || volition.completedAt) continue;
    
    // Skip if already completed today
    if (completedToday.has(volition.id)) continue;
    
    // Generate tasks based on volition type
    const questTasks = generateTasksForQuest(volition);
    tasks.push(...questTasks);
  }
  
  // Limit to 10 tasks per day (avoid overwhelming user)
  return tasks.slice(0, 10);
}

/**
 * Generate tasks for a specific volition
 */
function generateTasksForQuest(volition: VolitionInstance): DailyAction[] {
  const tasks: DailyAction[] = [];
  
  switch (volition.type) {
    case "RANKING":
      tasks.push(...generateRankingTasks(volition));
      break;
    
    case "MAINTENANCE":
      tasks.push(...generateMaintenanceTasks(volition));
      break;
    
    case "QUALITY":
      tasks.push(...generateQualityTasks(volition));
      break;
    
    case "DISCOVERY":
      tasks.push(...generateDiscoveryTasks(volition));
      break;
  }
  
  return tasks;
}

/**
 * Generate ranking comparison tasks
 */
function generateRankingTasks(volition: VolitionInstance): DailyAction[] {
  const tasks: DailyAction[] = [];
  
  for (let i = 0; i < volition.dailyTarget; i++) {
    tasks.push({
      id: `${volition.id}_ranking_${i}`,
      volitionId: volition.id,
      type: "RANKING",
      title: "Compare two contacts",
      subtitle: "Who would you rather spend time with?",
      emoji: volition.emoji,
      action: {
        type: "MODAL",
        modalType: "WOULD_YOU_RATHER",
        data: {
          targetLayer: volition.targetLayer,
        },
      },
    });
  }
  
  return tasks;
}

/**
 * Generate relationship maintenance tasks
 */
function generateMaintenanceTasks(volition: VolitionInstance): DailyAction[] {
  const tasks: DailyAction[] = [];
  
  for (let i = 0; i < volition.dailyTarget; i++) {
    tasks.push({
      id: `${volition.id}_maintenance_${i}`,
      volitionId: volition.id,
      type: "CONTACT",
      title: "Reach out to someone",
      subtitle: "Strengthen a connection today",
      emoji: volition.emoji,
      action: {
        type: "MODAL",
        modalType: "CONTACT_SUGGESTION",
        data: {
          contactFilter: volition.contactFilter,
        },
      },
    });
  }
  
  return tasks;
}

/**
 * Generate quality/rating tasks
 */
function generateQualityTasks(volition: VolitionInstance): DailyAction[] {
  const tasks: DailyAction[] = [];
  
  for (let i = 0; i < volition.dailyTarget; i++) {
    tasks.push({
      id: `${volition.id}_quality_${i}`,
      volitionId: volition.id,
      type: "RATE",
      title: "Rate a recent interaction",
      subtitle: "How was your last conversation?",
      emoji: volition.emoji,
      action: {
        type: "MODAL",
        modalType: "RATE_INTERACTION",
      },
    });
  }
  
  return tasks;
}

/**
 * Generate discovery/tutorial tasks
 */
function generateDiscoveryTasks(volition: VolitionInstance): DailyAction[] {
  const tasks: DailyAction[] = [];
  
  // Discovery tasks are more complex - they guide users through features
  // For now, create a placeholder
  tasks.push({
    id: `${volition.id}_discovery`,
    volitionId: volition.id,
    type: "DISCOVERY",
    title: "Explore a feature",
    subtitle: volition.description,
    emoji: volition.emoji,
    action: {
      type: "NAVIGATE",
      data: {
        screen: "Dashboard",
      },
    },
  });
  
  return tasks;
}

/**
 * Complete a task and update volition progress
 */
export function completeTask(
  _task: DailyAction, // Underscore prefix indicates intentionally unused
  volition: VolitionInstance,
  today: string // ISO date string (YYYY-MM-DD)
): {
  volition: VolitionInstance;
  badgeUnlocked?: BadgeInstance;
  questCompleted: boolean;
} {
  // Update progress
  const updatedQuest = { ...volition };
  updatedQuest.currentProgress++;
  
  // Update streak
  const lastDate = volition.lastCompletedDate?.split('T')[0];
  
  if (lastDate === today) {
    // Already completed today, don't update streak
  } else if (isYesterday(lastDate, today)) {
    // Streak continues
    updatedQuest.streakCount++;
    updatedQuest.longestStreak = Math.max(updatedQuest.streakCount, updatedQuest.longestStreak);
  } else {
    // Streak broken - reset to 1
    updatedQuest.streakCount = 1;
  }
  
  updatedQuest.lastCompletedDate = new Date().toISOString();
  
  // Check if volition is complete
  let questCompleted = false;
  let badgeUnlocked: BadgeInstance | undefined;
  
  if (volition.totalTarget && updatedQuest.currentProgress >= volition.totalTarget) {
    updatedQuest.completedAt = new Date().toISOString();
    questCompleted = true;
    
    // Check if this unlocks a badge
    if (volition.badgeId && BADGE_DEFINITIONS[volition.badgeId]) {
      badgeUnlocked = {
        ...BADGE_DEFINITIONS[volition.badgeId],
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      };
    }
  }
  
  return {
    volition: updatedQuest,
    badgeUnlocked,
    questCompleted,
  };
}

/**
 * Check if a date is yesterday relative to today
 */
function isYesterday(dateStr: string | undefined, today: string): boolean {
  if (!dateStr) return false;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  return dateStr === yesterdayStr;
}

/**
 * Calculate streak status for display
 */
export function getStreakStatus(quests: VolitionInstance[]): {
  currentStreak: number;
  longestStreak: number;
  streakAtRisk: boolean; // True if user hasn't completed anything today
} {
  const today = new Date().toISOString().split('T')[0];
  
  // Find the longest current streak across all quests
  let currentStreak = 0;
  let longestStreak = 0;
  let completedToday = false;
  
  for (const volition of quests) {
    currentStreak = Math.max(currentStreak, volition.streakCount);
    longestStreak = Math.max(longestStreak, volition.longestStreak);
    
    const lastDate = volition.lastCompletedDate?.split('T')[0];
    if (lastDate === today) {
      completedToday = true;
    }
  }
  
  return {
    currentStreak,
    longestStreak,
    streakAtRisk: !completedToday && currentStreak > 0,
  };
}

/**
 * Check which badges the user should have unlocked
 */
export function checkBadgeUnlocks(
  quests: VolitionInstance[],
  currentBadges: BadgeInstance[]
): BadgeInstance[] {
  const newBadges: BadgeInstance[] = [];
  
  // Check each badge definition
  for (const badgeDef of Object.values(BADGE_DEFINITIONS)) {
    // Skip if already unlocked
    if (currentBadges.find(b => b.id === badgeDef.id && b.isUnlocked)) {
      continue;
    }
    
    // Check requirements
    let shouldUnlock = false;
    let progress = 0;
    
    switch (badgeDef.requirementType) {
      case "COUNT":
        // Check if any volition has reached the target count
        const volition = quests.find(q => q.id === badgeDef.volitionId);
        if (volition && badgeDef.requirementTarget) {
          progress = volition.currentProgress;
          shouldUnlock = progress >= badgeDef.requirementTarget;
        }
        break;
      
      case "STREAK":
        // Check if any volition has reached the streak target
        const maxStreak = Math.max(...quests.map(q => q.streakCount));
        progress = maxStreak;
        shouldUnlock = badgeDef.requirementTarget 
          ? maxStreak >= badgeDef.requirementTarget
          : false;
        break;
      
      case "COMPLETE_ALL":
        // Check if the volition is completed
        const completedQuest = quests.find(q => q.id === badgeDef.volitionId && q.completedAt);
        shouldUnlock = !!completedQuest;
        progress = shouldUnlock ? 100 : 0;
        break;
    }
    
    if (shouldUnlock) {
      newBadges.push({
        ...badgeDef,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      });
    } else {
      // Add as locked badge with progress
      newBadges.push({
        ...badgeDef,
        isUnlocked: false,
        progress,
      });
    }
  }
  
  return newBadges;
}

/**
 * Initialize a new volition from a preset
 */
export function startQuest(volitionId: string): VolitionInstance | null {
  const preset = VOLITION_PRESETS[volitionId];
  if (!preset) return null;
  
  return {
    ...preset,
    isActive: true,
    startedAt: new Date().toISOString(),
    currentProgress: 0,
    streakCount: 0,
    longestStreak: 0,
  };
}

/**
 * Pause or resume a volition
 */
export function toggleVolitionPause(volition: VolitionInstance): VolitionInstance {
  if (volition.pausedAt) {
    // Resume
    return {
      ...volition,
      pausedAt: undefined,
    };
  } else {
    // Pause
    return {
      ...volition,
      pausedAt: new Date().toISOString(),
    };
  }
}

/**
 * Calculate total weekly time investment across all active volitions
 */
export function calculateWeeklyTime(volitions: VolitionInstance[]): number {
  return volitions
    .filter(v => v.isActive && !v.pausedAt)
    .reduce((total, v) => total + (v.estimatedMinutesPerWeek || 0), 0);
}

/**
 * Calculate actual time spent this week across volitions
 */
export function calculateActualWeeklyTime(volitions: VolitionInstance[]): number {
  return volitions
    .filter(v => v.isActive && !v.pausedAt)
    .reduce((total, v) => total + (v.weeklyTimeSpent || 0), 0);
}

/**
 * Internal Work Metrics - Measures progress on understanding your garden
 */
export interface InternalWorkMetrics {
  rankingCompleteness: number;     // % of contacts with intuitiveRank data
  interactionRatings: number;       // % of interactions with quality ratings
  dataEnrichment: number;           // % of contacts with enriched data
  reviewCompletion: number;         // % of layers reviewed
  overallPercentage: number;        // Weighted total
}

/**
 * Calculate internal work completion percentage
 * This measures how well the user understands their social garden
 */
export function calculateInternalWork(data: {
  totalContacts: number;
  contactsWithRanking: number;
  totalInteractions: number;
  interactionsRated: number;
  contactsWithEnrichedData: number;
  layersReviewed: number;
  totalLayers: number;
}): InternalWorkMetrics {
  // Ranking completeness (40% weight)
  const rankingCompleteness = data.totalContacts > 0
    ? (data.contactsWithRanking / data.totalContacts) * 100
    : 0;
  
  // Interaction ratings (30% weight)
  const interactionRatings = data.totalInteractions > 0
    ? (data.interactionsRated / data.totalInteractions) * 100
    : 0;
  
  // Data enrichment (20% weight) - contacts with photos, notes, tags, etc.
  const dataEnrichment = data.totalContacts > 0
    ? (data.contactsWithEnrichedData / data.totalContacts) * 100
    : 0;
  
  // Layer review completion (10% weight)
  const reviewCompletion = data.totalLayers > 0
    ? (data.layersReviewed / data.totalLayers) * 100
    : 0;
  
  // Weighted overall percentage
  const overallPercentage = Math.round(
    rankingCompleteness * 0.4 +
    interactionRatings * 0.3 +
    dataEnrichment * 0.2 +
    reviewCompletion * 0.1
  );
  
  return {
    rankingCompleteness: Math.round(rankingCompleteness),
    interactionRatings: Math.round(interactionRatings),
    dataEnrichment: Math.round(dataEnrichment),
    reviewCompletion: Math.round(reviewCompletion),
    overallPercentage,
  };
}

/**
 * Time breakdown by volition type
 */
export interface TimeBreakdown {
  volitionId: string;
  name: string;
  estimatedMinutes: number;
  actualMinutes: number;
  type: string;
}

/**
 * Get detailed time breakdown for all volitions
 */
export function getTimeBreakdown(volitions: VolitionInstance[]): TimeBreakdown[] {
  return volitions
    .filter(v => v.isActive && !v.pausedAt)
    .map(v => ({
      volitionId: v.id,
      name: v.name,
      estimatedMinutes: v.estimatedMinutesPerWeek || 0,
      actualMinutes: v.weeklyTimeSpent || 0,
      type: v.type,
    }));
}

/**
 * Record time spent on a volition action
 */
export function recordTimeSpent(
  volition: VolitionInstance,
  minutes: number
): VolitionInstance {
  return {
    ...volition,
    weeklyTimeSpent: (volition.weeklyTimeSpent || 0) + minutes,
  };
}
