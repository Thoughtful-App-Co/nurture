/**
 * Quest Manager - Handles quest logic, daily tasks, and completion tracking
 * 
 * This service manages:
 * - Daily task generation based on active quests
 * - Quest completion and progress tracking
 * - Streak calculations
 * - Badge unlocking
 */

import { QUEST_PRESETS, BADGE_DEFINITIONS, type QuestConfig, type BadgeConfig } from "@/jazz/harvestSchema";

/**
 * Daily Task - A single actionable item for the user
 */
export interface DailyTask {
  id: string;
  questId: string;
  type: "RANKING" | "CONTACT" | "RATE" | "DISCOVERY";
  title: string;
  subtitle: string;
  emoji: string;
  action: {
    type: "MODAL" | "CONTACT" | "NAVIGATE";
    modalType?: "WOULD_YOU_RATHER" | "RATE_INTERACTION" | "CONTACT_SUGGESTION";
    data?: any;
  };
}

/**
 * Quest Instance - Runtime state of a quest
 */
export interface QuestInstance extends QuestConfig {
  isActive: boolean;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  currentProgress: number;
  streakCount: number;
  longestStreak: number;
  lastCompletedDate?: string;
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
export function generateDailyTasks(
  activeQuests: QuestInstance[],
  completedToday: Set<string> // Quest IDs already completed today
): DailyTask[] {
  const tasks: DailyTask[] = [];
  
  for (const quest of activeQuests) {
    // Skip if quest is paused or completed
    if (quest.pausedAt || quest.completedAt) continue;
    
    // Skip if already completed today
    if (completedToday.has(quest.id)) continue;
    
    // Generate tasks based on quest type
    const questTasks = generateTasksForQuest(quest);
    tasks.push(...questTasks);
  }
  
  // Limit to 10 tasks per day (avoid overwhelming user)
  return tasks.slice(0, 10);
}

/**
 * Generate tasks for a specific quest
 */
function generateTasksForQuest(quest: QuestInstance): DailyTask[] {
  const tasks: DailyTask[] = [];
  
  switch (quest.type) {
    case "RANKING":
      tasks.push(...generateRankingTasks(quest));
      break;
    
    case "MAINTENANCE":
      tasks.push(...generateMaintenanceTasks(quest));
      break;
    
    case "QUALITY":
      tasks.push(...generateQualityTasks(quest));
      break;
    
    case "DISCOVERY":
      tasks.push(...generateDiscoveryTasks(quest));
      break;
  }
  
  return tasks;
}

/**
 * Generate ranking comparison tasks
 */
function generateRankingTasks(quest: QuestInstance): DailyTask[] {
  const tasks: DailyTask[] = [];
  
  for (let i = 0; i < quest.dailyTarget; i++) {
    tasks.push({
      id: `${quest.id}_ranking_${i}`,
      questId: quest.id,
      type: "RANKING",
      title: "Compare two contacts",
      subtitle: "Who would you rather spend time with?",
      emoji: quest.emoji,
      action: {
        type: "MODAL",
        modalType: "WOULD_YOU_RATHER",
        data: {
          targetLayer: quest.targetLayer,
        },
      },
    });
  }
  
  return tasks;
}

/**
 * Generate relationship maintenance tasks
 */
function generateMaintenanceTasks(quest: QuestInstance): DailyTask[] {
  const tasks: DailyTask[] = [];
  
  for (let i = 0; i < quest.dailyTarget; i++) {
    tasks.push({
      id: `${quest.id}_maintenance_${i}`,
      questId: quest.id,
      type: "CONTACT",
      title: "Reach out to someone",
      subtitle: "Strengthen a connection today",
      emoji: quest.emoji,
      action: {
        type: "MODAL",
        modalType: "CONTACT_SUGGESTION",
        data: {
          contactFilter: quest.contactFilter,
        },
      },
    });
  }
  
  return tasks;
}

/**
 * Generate quality/rating tasks
 */
function generateQualityTasks(quest: QuestInstance): DailyTask[] {
  const tasks: DailyTask[] = [];
  
  for (let i = 0; i < quest.dailyTarget; i++) {
    tasks.push({
      id: `${quest.id}_quality_${i}`,
      questId: quest.id,
      type: "RATE",
      title: "Rate a recent interaction",
      subtitle: "How was your last conversation?",
      emoji: quest.emoji,
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
function generateDiscoveryTasks(quest: QuestInstance): DailyTask[] {
  const tasks: DailyTask[] = [];
  
  // Discovery tasks are more complex - they guide users through features
  // For now, create a placeholder
  tasks.push({
    id: `${quest.id}_discovery`,
    questId: quest.id,
    type: "DISCOVERY",
    title: "Explore a feature",
    subtitle: quest.description,
    emoji: quest.emoji,
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
 * Complete a task and update quest progress
 */
export function completeTask(
  _task: DailyTask, // Underscore prefix indicates intentionally unused
  quest: QuestInstance,
  today: string // ISO date string (YYYY-MM-DD)
): {
  quest: QuestInstance;
  badgeUnlocked?: BadgeInstance;
  questCompleted: boolean;
} {
  // Update progress
  const updatedQuest = { ...quest };
  updatedQuest.currentProgress++;
  
  // Update streak
  const lastDate = quest.lastCompletedDate?.split('T')[0];
  
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
  
  // Check if quest is complete
  let questCompleted = false;
  let badgeUnlocked: BadgeInstance | undefined;
  
  if (quest.totalTarget && updatedQuest.currentProgress >= quest.totalTarget) {
    updatedQuest.completedAt = new Date().toISOString();
    questCompleted = true;
    
    // Check if this unlocks a badge
    if (quest.badgeId && BADGE_DEFINITIONS[quest.badgeId]) {
      badgeUnlocked = {
        ...BADGE_DEFINITIONS[quest.badgeId],
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      };
    }
  }
  
  return {
    quest: updatedQuest,
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
export function getStreakStatus(quests: QuestInstance[]): {
  currentStreak: number;
  longestStreak: number;
  streakAtRisk: boolean; // True if user hasn't completed anything today
} {
  const today = new Date().toISOString().split('T')[0];
  
  // Find the longest current streak across all quests
  let currentStreak = 0;
  let longestStreak = 0;
  let completedToday = false;
  
  for (const quest of quests) {
    currentStreak = Math.max(currentStreak, quest.streakCount);
    longestStreak = Math.max(longestStreak, quest.longestStreak);
    
    const lastDate = quest.lastCompletedDate?.split('T')[0];
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
  quests: QuestInstance[],
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
        // Check if any quest has reached the target count
        const quest = quests.find(q => q.id === badgeDef.questId);
        if (quest && badgeDef.requirementTarget) {
          progress = quest.currentProgress;
          shouldUnlock = progress >= badgeDef.requirementTarget;
        }
        break;
      
      case "STREAK":
        // Check if any quest has reached the streak target
        const maxStreak = Math.max(...quests.map(q => q.streakCount));
        progress = maxStreak;
        shouldUnlock = badgeDef.requirementTarget 
          ? maxStreak >= badgeDef.requirementTarget
          : false;
        break;
      
      case "COMPLETE_ALL":
        // Check if the quest is completed
        const completedQuest = quests.find(q => q.id === badgeDef.questId && q.completedAt);
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
 * Initialize a new quest from a preset
 */
export function startQuest(questId: string): QuestInstance | null {
  const preset = QUEST_PRESETS[questId];
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
 * Pause or resume a quest
 */
export function toggleQuestPause(quest: QuestInstance): QuestInstance {
  if (quest.pausedAt) {
    // Resume
    return {
      ...quest,
      pausedAt: undefined,
    };
  } else {
    // Pause
    return {
      ...quest,
      pausedAt: new Date().toISOString(),
    };
  }
}
