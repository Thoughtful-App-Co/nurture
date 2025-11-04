/**
 * Harvest Screen - Quest-Based Relationship Cultivation
 * 
 * The Harvest module transforms relationship maintenance into an engaging
 * quest system with daily tasks, streaks, and badge rewards.
 * 
 * Quest Types:
 * - Ranking: Build intuitive ranking data through daily comparisons
 * - Maintenance: Proactive relationship nurturing actions
 * - Quality: Enrich data quality through reflection
 * - Discovery: Explore app features and layers
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { QUEST_PRESETS, BADGE_DEFINITIONS } from "@/jazz/harvestSchema";
import { Card, Button, SectionHeader } from "@/components/ui";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// Mock active quests for now (will be replaced with Jazz data)
const MOCK_ACTIVE_QUESTS = [
  {
    ...QUEST_PRESETS.KNOW_YOUR_CIRCLE,
    isActive: true,
    currentProgress: 47,
    streakCount: 16,
    todayCompleted: 2,
    todayTarget: 2,
  },
  {
    ...QUEST_PRESETS.WEEKLY_CHECKIN,
    isActive: true,
    currentProgress: 14,
    streakCount: 8,
    todayCompleted: 0,
    todayTarget: 1,
  },
];

export default function HarvestScreen() {
  const [activeQuests] = useState(MOCK_ACTIVE_QUESTS);

  // Get quest type color
  const getQuestColor = (type: string): string => {
    const colors: Record<string, string> = {
      RANKING: "#3b82f6",
      MAINTENANCE: "#22c55e",
      QUALITY: "#a855f7",
      DISCOVERY: "#f97316",
    };
    return colors[type] || "#71717a";
  };

  // Calculate total stats
  const totalBadgesEarned = 5; // Mock data
  const currentStreak = Math.max(...activeQuests.map(q => q.streakCount));
  const todayCompleted = activeQuests.reduce((sum, q) => sum + q.todayCompleted, 0);
  const todayTotal = activeQuests.reduce((sum, q) => sum + q.todayTarget, 0);

  // Available quests (not yet started)
  const availableQuests = Object.values(QUEST_PRESETS).filter(
    preset => !activeQuests.find(q => q.id === preset.id)
  );

  return (
    <Animated.ScrollView 
      className="flex-1 bg-black"
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-6">
        <Text className="text-4xl font-bold tracking-wide text-primary mb-2">Harvest</Text>
        <Text className="text-base text-zinc-400 leading-relaxed">
          Complete daily quests to cultivate your relationships and earn badges.
        </Text>
      </View>

      {/* Stats Overview */}
      <View className="px-6 mb-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <View className="flex-row justify-between items-center">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{currentStreak}</Text>
              <Text className="text-xs text-zinc-500 mt-1">Day Streak</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">{totalBadgesEarned}</Text>
              <Text className="text-xs text-zinc-500 mt-1">Badges</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-zinc-400">
                {todayCompleted}/{todayTotal}
              </Text>
              <Text className="text-xs text-zinc-500 mt-1">Today</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Active Quests Section */}
      {activeQuests.length > 0 && (
        <View className="px-6 mb-8">
          <SectionHeader>Active Quests</SectionHeader>
          <View className="space-y-3">
            {activeQuests.map((quest) => {
              const isComplete = quest.todayCompleted >= quest.todayTarget;
              const progressPercent = quest.totalTarget 
                ? Math.round((quest.currentProgress / quest.totalTarget) * 100)
                : 0;
              
              return (
                <Card 
                  key={quest.id}
                  className="bg-zinc-900 border-zinc-800"
                >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <Text className="text-2xl mr-2">{quest.emoji}</Text>
                          <Text className="text-white font-semibold text-lg flex-1">
                            {quest.name}
                          </Text>
                          {isComplete && (
                            <View className="bg-green-500/20 px-2 py-1 rounded">
                              <Text className="text-green-500 text-xs font-bold">✓ Today</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-zinc-400 mb-3 leading-relaxed">
                          {quest.description}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    {quest.totalTarget && (
                      <View className="mb-3">
                        <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <View 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </View>
                        <Text className="text-xs text-zinc-500 mt-1">
                          {quest.currentProgress} / {quest.totalTarget} ({progressPercent}%)
                        </Text>
                      </View>
                    )}

                    {/* Stats Row */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-4">
                        <View>
                          <Text className="text-xs text-zinc-500">Today</Text>
                          <Text className="text-sm text-white font-medium">
                            {quest.todayCompleted}/{quest.todayTarget}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-zinc-500">Streak</Text>
                          <Text className="text-sm text-white font-medium">
                            {quest.streakCount} days 🔥
                          </Text>
                        </View>
                      </View>
                      <View 
                        className="px-3 py-1 rounded"
                        style={{ backgroundColor: getQuestColor(quest.type) + "20" }}
                      >
                        <Text 
                          className="text-xs font-medium"
                          style={{ color: getQuestColor(quest.type) }}
                        >
                          {quest.type}
                        </Text>
                      </View>
                    </View>

                    {!isComplete && (
                      <Button 
                        variant="primary" 
                        className="mt-3"
                        onPress={() => {
                          // TODO: Open quest modal
                          console.log('Start quest:', quest.id);
                        }}
                      >
                        <Text className="text-black font-semibold">Start Task</Text>
                      </Button>
                    )}
                  </Card>
                );
              })}
          </View>
        </View>
      )}

      {/* Badges Section */}
      <View className="px-6 mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <SectionHeader>Your Badges</SectionHeader>
          <TouchableOpacity>
            <Text className="text-primary text-sm font-medium">View All →</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {/* Show first 4 earned badges */}
          {Object.values(BADGE_DEFINITIONS).slice(0, 4).map((badge) => (
            <View 
              key={badge.id}
              className="items-center bg-zinc-900 border-2 border-zinc-800 rounded-lg p-3"
              style={{ width: '22%' }}
            >
              <Text className="text-3xl mb-1">{badge.emoji}</Text>
              <Text className="text-xs text-white text-center" numberOfLines={2}>
                {badge.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Available Quests */}
      <View className="px-6 mb-8">
        <SectionHeader>Available Quests</SectionHeader>
        <Text className="text-sm text-zinc-400 mb-4 leading-relaxed">
          Start new quests to unlock badges and improve your relationship cultivation skills.
        </Text>
        <View className="space-y-3">
          {availableQuests.map((quest) => (
            <Card
              key={quest.id}
              className="bg-zinc-900 border-zinc-800"
            >
              <View className="flex-row items-start mb-3">
                <Text className="text-3xl mr-3">{quest.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base mb-1">
                    {quest.name}
                  </Text>
                  <Text className="text-sm text-zinc-400 leading-relaxed">
                    {quest.description}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3">
                  <View>
                    <Text className="text-xs text-zinc-500">Daily</Text>
                    <Text className="text-sm text-white">{quest.dailyTarget} tasks</Text>
                  </View>
                  {quest.totalTarget && (
                    <View>
                      <Text className="text-xs text-zinc-500">Goal</Text>
                      <Text className="text-sm text-white">{quest.totalTarget} total</Text>
                    </View>
                  )}
                </View>
                <View 
                  className="px-3 py-1 rounded"
                  style={{ backgroundColor: getQuestColor(quest.type) + "20" }}
                >
                  <Text 
                    className="text-xs font-medium"
                    style={{ color: getQuestColor(quest.type) }}
                  >
                    {quest.type}
                  </Text>
                </View>
              </View>

              {quest.badgeId && BADGE_DEFINITIONS[quest.badgeId] && (
                <View className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-3">
                  <View className="flex-row items-center">
                    <Text className="text-xl mr-2">
                      {BADGE_DEFINITIONS[quest.badgeId].emoji}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-xs text-zinc-500">Reward</Text>
                      <Text className="text-sm text-white font-medium">
                        {BADGE_DEFINITIONS[quest.badgeId].name}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <Button 
                variant="secondary"
                onPress={() => {
                  // TODO: Start quest
                  console.log('Start quest:', quest.id);
                }}
              >
                <Text className="text-white font-semibold">Start Quest</Text>
              </Button>
            </Card>
          ))}
        </View>
      </View>

      {/* Empty State */}
      {activeQuests.length === 0 && (
        <View className="px-6 py-12 items-center">
          <Text className="text-6xl mb-4">🌱</Text>
          <Text className="text-xl text-white font-semibold mb-2">Start Your First Quest</Text>
          <Text className="text-sm text-zinc-400 text-center leading-relaxed">
            Choose a quest above to begin cultivating your relationships with daily tasks and earn your first badge.
          </Text>
        </View>
      )}

      {/* Bottom Spacing */}
      <View className="h-20" />
    </Animated.ScrollView>
  );
}
