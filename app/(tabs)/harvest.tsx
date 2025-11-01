/**
 * Harvest Screen - Proactive Relationship Nurturing
 * 
 * The Harvest module pushes users to maintain relationships based on
 * selected algorithms that align with their relationship goals.
 * 
 * Algorithms available:
 * - Tend & Befriend: Nurture close relationships
 * - Plant & Prune: Strategic social energy allocation
 * - Cultivate: Balanced maintenance
 * - Inner Circle: Focus on intimate core
 * - Expand Horizons: Meet new people
 * - Rekindle: Reconnect with past friends
 * - Balance: Maintain equilibrium
 */

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useAccount } from "jazz-tools/expo";
import { ALGORITHM_PRESETS, type AlgorithmType } from "@/jazz/harvestSchema";
import { Card, Button, SectionHeader } from "@/components/ui";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function HarvestScreen() {
  const { me } = useAccount();
  const [activeAlgorithms, setActiveAlgorithms] = useState<AlgorithmType[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Get algorithm color based on type
  const getAlgorithmColor = (type: AlgorithmType): string => {
    const colors: Record<AlgorithmType, string> = {
      TEND_AND_BEFRIEND: "#ef4444",
      PLANT_AND_PRUNE: "#f97316",
      CULTIVATE: "#22c55e",
      INNER_CIRCLE: "#ec4899",
      EXPAND_HORIZONS: "#3b82f6",
      REKINDLE: "#a855f7",
      BALANCE: "#14b8a6",
    };
    return colors[type];
  };

  // Toggle algorithm on/off
  const toggleAlgorithm = (type: AlgorithmType) => {
    if (activeAlgorithms.includes(type)) {
      setActiveAlgorithms(activeAlgorithms.filter((a) => a !== type));
    } else {
      setActiveAlgorithms([...activeAlgorithms, type]);
    }
  };

  return (
    <Animated.ScrollView 
      className="flex-1 bg-black"
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-8">
        <Text className="text-4xl font-bold tracking-wide text-primary mb-2">Harvest</Text>
        <Text className="text-base text-zinc-400 leading-relaxed">
          Set your relationship goals. We'll guide you to tend your garden.
        </Text>
      </View>

      {/* Active Algorithms Section */}
      {activeAlgorithms.length > 0 && (
        <View className="px-6 mb-8">
          <SectionHeader>Active Goals</SectionHeader>
          <View className="space-y-3">
            {activeAlgorithms.map((type) => {
              const preset = ALGORITHM_PRESETS[type];
              return (
                <Card
                  key={type}
                  variant="accent"
                  accentColor={getAlgorithmColor(type)}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-white font-medium text-lg">
                      {preset.name}
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => toggleAlgorithm(type)}
                      accessibilityLabel={`Disable ${preset.name}`}
                    >
                      <Text className="text-xs text-zinc-400">Disable</Text>
                    </Button>
                  </View>
                  <Text className="text-sm text-zinc-400 leading-relaxed">
                    {preset.description}
                  </Text>
                  <View className="mt-3 flex-row items-center">
                    <Text className="text-xs text-zinc-500">
                      Layers: {preset.targetLayers.join(", ")} • Checks every {preset.checkFrequency}d
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      )}

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <View className="px-6 mb-8">
          <SectionHeader>Today's Suggestions</SectionHeader>
          <View className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <Card key={index}>
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-base mb-1">
                      {suggestion.actionType} {suggestion.contactName}
                    </Text>
                    <Text className="text-sm text-zinc-400">
                      {suggestion.reason}
                    </Text>
                  </View>
                  <View
                    className="px-2 py-1"
                    style={{ backgroundColor: getAlgorithmColor(suggestion.algorithmType) + "20" }}
                  >
                    <Text className="text-xs" style={{ color: getAlgorithmColor(suggestion.algorithmType) }}>
                      {ALGORITHM_PRESETS[suggestion.algorithmType as AlgorithmType]?.name}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2 mt-3">
                  <Button variant="primary" className="flex-1">
                    Complete
                  </Button>
                  <Button variant="secondary" className="px-4">
                    Snooze
                  </Button>
                </View>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* Algorithm Selection */}
      <View className="px-6 mb-8">
        <SectionHeader>Available Algorithms</SectionHeader>
        <Text className="text-sm text-zinc-400 mb-4 leading-relaxed">
          Choose the approaches that match your relationship goals. You can enable multiple algorithms.
        </Text>
        <View className="space-y-3">
          {(Object.keys(ALGORITHM_PRESETS) as AlgorithmType[]).map((type) => {
            const preset = ALGORITHM_PRESETS[type];
            const isActive = activeAlgorithms.includes(type);
            
            return (
              <Card
                key={type}
                onPress={() => toggleAlgorithm(type)}
                className={isActive ? "border-2 border-primary" : "bg-black border-2"}
                variant={isActive ? "accent" : "default"}
                accentColor={isActive ? getAlgorithmColor(type) : "#27272a"}
                accessibilityLabel={`${preset.name}, ${isActive ? 'active' : 'inactive'}`}
                accessibilityRole="button"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className={`font-medium text-lg ${isActive ? "text-primary" : "text-white"}`}>
                    {preset.name}
                  </Text>
                  <View
                    className={`w-6 h-6 rounded-full border-2 ${
                      isActive ? "bg-primary border-primary" : "border-zinc-700"
                    } items-center justify-center`}
                  >
                    {isActive && <Text className="text-black text-xs font-bold">✓</Text>}
                  </View>
                </View>
                <Text className="text-sm text-zinc-400 mb-3 leading-relaxed">
                  {preset.description}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <View className="px-2 py-1 bg-zinc-800">
                    <Text className="text-xs text-zinc-400">
                      Layers: {preset.targetLayers.join(", ")}
                    </Text>
                  </View>
                  <View className="px-2 py-1 bg-zinc-800">
                    <Text className="text-xs text-zinc-400">
                      Every {preset.checkFrequency} days
                    </Text>
                  </View>
                  <View className="px-2 py-1 bg-zinc-800">
                    <Text className="text-xs text-zinc-400">
                      {preset.actionThreshold}d threshold
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </View>

      {/* Streak/Stats Section */}
      <View className="px-6 mb-20">
        <Card className="p-6 border-2">
          <Text className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-4">Your Progress</Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-3xl font-bold text-primary">0</Text>
              <Text className="text-xs text-zinc-500 mt-2">Current Streak</Text>
            </View>
            <View>
              <Text className="text-3xl font-bold text-white">0</Text>
              <Text className="text-xs text-zinc-500 mt-2">Actions Completed</Text>
            </View>
            <View>
              <Text className="text-3xl font-bold text-zinc-400">0</Text>
              <Text className="text-xs text-zinc-500 mt-2">Best Streak</Text>
            </View>
          </View>
        </Card>
      </View>
    </Animated.ScrollView>
  );
}
