/**
 * Badge Collection Modal - Display all badges (earned and locked)
 * 
 * Shows:
 * - Earned badges with unlock date
 * - Locked badges with progress toward unlock
 * - Badge categories and descriptions
 * - Next badge to earn
 */

import React from "react";
import { View, Text, Modal, ScrollView, TouchableOpacity } from "react-native";
import { BADGE_DEFINITIONS, type BadgeCategory } from "@/jazz/harvestSchema";
import { Card } from "@/components/ui";
import Animated, { FadeIn } from "react-native-reanimated";

interface BadgeCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  earnedBadgeIds?: string[];
  badgeProgress?: Record<string, number>; // Badge ID -> progress value
}

export default function BadgeCollectionModal({
  visible,
  onClose,
  earnedBadgeIds = [],
  badgeProgress = {},
}: BadgeCollectionModalProps) {
  // Group badges by category
  const badgesByCategory: Record<BadgeCategory, typeof BADGE_DEFINITIONS[string][]> = {
    COMPLETION: [],
    STREAK: [],
    ACTION: [],
    QUALITY: [],
  };

  Object.values(BADGE_DEFINITIONS).forEach((badge) => {
    badgesByCategory[badge.category as BadgeCategory].push(badge);
  });

  // Get category color
  const getCategoryColor = (category: BadgeCategory): string => {
    const colors: Record<BadgeCategory, string> = {
      COMPLETION: "#3b82f6",
      STREAK: "#f97316",
      ACTION: "#22c55e",
      QUALITY: "#a855f7",
    };
    return colors[category];
  };

  // Get category name
  const getCategoryName = (category: BadgeCategory): string => {
    const names: Record<BadgeCategory, string> = {
      COMPLETION: "Milestones",
      STREAK: "Consistency",
      ACTION: "Engagement",
      QUALITY: "Excellence",
    };
    return names[category];
  };

  // Check if badge is earned
  const isBadgeEarned = (badgeId: string): boolean => {
    return earnedBadgeIds.includes(badgeId);
  };

  // Get badge progress percentage
  const getBadgeProgress = (badge: typeof BADGE_DEFINITIONS[string]): number => {
    if (isBadgeEarned(badge.id)) return 100;
    
    const progress = badgeProgress[badge.id] || 0;
    const target = badge.requirementTarget || 100;
    
    return Math.min(100, Math.round((progress / target) * 100));
  };

  // Find next badge to earn (closest to completion)
  const nextBadge = Object.values(BADGE_DEFINITIONS)
    .filter((badge) => !isBadgeEarned(badge.id))
    .sort((a, b) => getBadgeProgress(b) - getBadgeProgress(a))[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="px-6 pt-16 pb-6 border-b border-zinc-800">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-primary mb-1">Badge Collection</Text>
              <Text className="text-sm text-zinc-400">
                {earnedBadgeIds.length} / {Object.keys(BADGE_DEFINITIONS).length} earned
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center bg-zinc-900 rounded-full"
            >
              <Text className="text-white text-xl">✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1">
          {/* Next Badge Section */}
          {nextBadge && (
            <Animated.View 
              entering={FadeIn.duration(300)}
              className="px-6 py-6"
            >
              <Text className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Next Badge
              </Text>
              <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-primary/50">
                <View className="flex-row items-start">
                  <View className="mr-4">
                    <View className="w-16 h-16 bg-zinc-800 rounded-full items-center justify-center">
                      <Text className="text-4xl opacity-40">{nextBadge.emoji}</Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg mb-1">
                      {nextBadge.name}
                    </Text>
                    <Text className="text-sm text-zinc-400 mb-3 leading-relaxed">
                      {nextBadge.description}
                    </Text>
                    
                    {/* Progress Bar */}
                    <View className="mb-2">
                      <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <View 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${getBadgeProgress(nextBadge)}%` }}
                        />
                      </View>
                    </View>
                    
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-zinc-500">
                        {badgeProgress[nextBadge.id] || 0} / {nextBadge.requirementTarget || 0}
                      </Text>
                      <Text className="text-xs text-primary font-medium">
                        {getBadgeProgress(nextBadge)}% complete
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )}

          {/* Badges by Category */}
          {(Object.keys(badgesByCategory) as BadgeCategory[]).map((category) => {
            const badges = badgesByCategory[category];
            const earnedCount = badges.filter((b) => isBadgeEarned(b.id)).length;

            return (
              <View key={category} className="px-6 py-4">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View
                      className="w-1 h-6 rounded-full mr-3"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <View>
                      <Text className="text-white font-semibold text-base">
                        {getCategoryName(category)}
                      </Text>
                      <Text className="text-xs text-zinc-500">
                        {earnedCount} / {badges.length} earned
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Badge Grid */}
                <View className="flex-row flex-wrap gap-3">
                  {badges.map((badge) => {
                    const earned = isBadgeEarned(badge.id);
                    const progress = getBadgeProgress(badge);

                    return (
                      <View
                        key={badge.id}
                        className={`bg-zinc-900 border-2 rounded-lg p-4 ${
                          earned ? "border-primary" : "border-zinc-800"
                        }`}
                        style={{ width: "48%" }}
                      >
                        {/* Badge Emoji */}
                        <View
                          className={`w-14 h-14 rounded-full items-center justify-center mb-3 ${
                            earned ? "bg-primary/20" : "bg-zinc-800"
                          }`}
                        >
                          <Text className={`text-3xl ${!earned && "opacity-40"}`}>
                            {badge.emoji}
                          </Text>
                        </View>

                        {/* Badge Name */}
                        <Text
                          className={`font-semibold text-sm mb-1 ${
                            earned ? "text-white" : "text-zinc-500"
                          }`}
                          numberOfLines={2}
                        >
                          {badge.name}
                        </Text>

                        {/* Badge Description */}
                        <Text
                          className="text-xs text-zinc-600 leading-relaxed mb-3"
                          numberOfLines={3}
                        >
                          {badge.description}
                        </Text>

                        {/* Progress or Earned Status */}
                        {earned ? (
                          <View className="bg-primary/20 px-2 py-1 rounded">
                            <Text className="text-primary text-xs font-bold text-center">
                              ✓ Earned
                            </Text>
                          </View>
                        ) : (
                          <View>
                            <View className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
                              <View
                                className="h-full rounded-full"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: getCategoryColor(category),
                                }}
                              />
                            </View>
                            <Text className="text-xs text-zinc-600 text-center">
                              {progress}%
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Bottom Spacing */}
          <View className="h-8" />
        </ScrollView>
      </View>
    </Modal>
  );
}
