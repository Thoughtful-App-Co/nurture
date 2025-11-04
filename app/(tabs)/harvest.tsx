/**
 * Harvest Screen - Relationship Cultivation Management
 * 
 * A CRM for your social health. Manage active volitions (relationship goals)
 * and track time investment in understanding and maintaining your garden.
 * 
 * Available Volitions:
 * - Tend & Befriend: Nurture close relationships
 * - Plant & Prune: Strategic social energy allocation
 * - Cultivate: Balanced maintenance
 * - Inner Circle: Focus on intimate core
 * - Expand Horizons: Meet new people
 * - Rekindle: Reconnect with past friends
 * - Balance: Maintain equilibrium
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ALGORITHM_PRESETS, type AlgorithmType } from "@/jazz/harvestSchema";
import { Card, Button, SectionHeader, InfoTooltip } from "@/components/ui";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { getMockMetrics } from "@/hooks/useHarvestMetrics";

export default function HarvestScreen() {
  const [activeAlgorithms, setActiveAlgorithms] = useState<AlgorithmType[]>([]);
  const [suggestions] = useState<any[]>([]); // TODO: Load from Jazz
  
  // TODO: Replace with real data from Jazz
  // const metrics = useHarvestMetrics({
  //   activeVolitions: [...],
  //   totalContacts: ...,
  //   ... etc
  // });
  const metrics = getMockMetrics();

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

  // Metrics calculation - will be real when Jazz data is wired
  const activeVolitionsCount = activeAlgorithms.length || metrics.activeVolitionsCount;
  const weeklyTimeHours = metrics.weeklyTimeHours;
  const internalWorkPercent = metrics.internalWorkPercent;

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
          Relationship cultivation management. Track your active volitions and time investment.
        </Text>
      </View>

      {/* Metrics Bar - CRM Style */}
      <View className="px-6 mb-8">
        <View className="flex-row gap-3">
          <TouchableOpacity 
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4"
            onPress={() => {
              // TODO: Navigate to Volition Management page
              console.log('Navigate to volition management');
            }}
            activeOpacity={0.7}
          >
            <Text className="text-3xl font-bold text-primary mb-1">
              {activeVolitionsCount}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-zinc-400 uppercase tracking-wider">
                Volitions{'\n'}Active
              </Text>
              <InfoTooltip
                title="Active Volitions"
                content="Number of relationship cultivation strategies currently in progress. Each volition generates daily actions and tracks your time investment."
                size="sm"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4"
            onPress={() => {
              // TODO: Open time breakdown modal
              console.log('Show time breakdown');
            }}
            activeOpacity={0.7}
          >
            <Text className="text-3xl font-bold text-white mb-1">
              {weeklyTimeHours.toFixed(1)}h
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-zinc-400 uppercase tracking-wider">
                Weekly{'\n'}Time
              </Text>
              <InfoTooltip
                title="Weekly Time Investment"
                content="Estimated hours per week across all active volitions. This includes ranking questions, relationship actions, and data quality work."
                size="sm"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4"
            onPress={() => {
              // TODO: Open internal work detail modal
              console.log('Show internal work details');
            }}
            activeOpacity={0.7}
          >
            <Text className="text-3xl font-bold text-zinc-400 mb-1">
              {internalWorkPercent}%
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-zinc-400 uppercase tracking-wider">
                Internal{'\n'}Work
              </Text>
              <InfoTooltip
                title="Internal Work Progress"
                content="Percentage of time spent on foundational work (ranking, quality ratings, enrichment, and review) vs. relationship actions. Higher % means better data quality."
                size="sm"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Actions Section */}
      {suggestions.length > 0 && (
        <View className="px-6 mb-8">
          <SectionHeader>Today&apos;s Actions</SectionHeader>
          <View className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <Card key={index}>
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-base mb-1">
                      {suggestion.actionType} {suggestion.contactName}
                    </Text>
                    <Text className="text-sm text-zinc-400 mb-1">
                      {suggestion.reason}
                    </Text>
                    <Text className="text-xs text-zinc-500">
                      Est: {suggestion.estimatedTime || '15 min'}
                    </Text>
                  </View>
                  <View
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: getAlgorithmColor(suggestion.algorithmType) + "20" }}
                  >
                    <Text className="text-xs" style={{ color: getAlgorithmColor(suggestion.algorithmType) }}>
                      {ALGORITHM_PRESETS[suggestion.algorithmType as AlgorithmType]?.name}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2 mt-3">
                  <Button variant="primary" className="flex-1">
                    <Text className="text-black font-semibold">Complete</Text>
                  </Button>
                  <Button variant="secondary" className="px-4">
                    <Text className="text-white">Snooze</Text>
                  </Button>
                </View>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* Active Volitions Section */}
      {activeAlgorithms.length > 0 && (
        <View className="px-6 mb-8">
          <SectionHeader>Active Volitions</SectionHeader>
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
                  <Text className="text-sm text-zinc-400 leading-relaxed mb-2">
                    {preset.description}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-zinc-500">
                      Layers: {preset.targetLayers.join(", ")} • Every {preset.checkFrequency}d
                    </Text>
                    <Text className="text-xs text-zinc-500">
                      ~30 min/week
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      )}

      {/* Available Volitions Selection */}
      <View className="px-6 mb-8">
        <SectionHeader>Available Volitions</SectionHeader>
        <Text className="text-sm text-zinc-400 mb-4 leading-relaxed">
          Select relationship cultivation strategies that align with your goals.
        </Text>
        <View className="space-y-3">
          {(Object.keys(ALGORITHM_PRESETS) as AlgorithmType[]).map((type) => {
            const preset = ALGORITHM_PRESETS[type];
            const isActive = activeAlgorithms.includes(type);
            
            return (
              <Card
                key={type}
                onPress={() => toggleAlgorithm(type)}
                className={isActive ? "border-2 border-primary" : "border-2 border-zinc-800"}
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
                  <View className="px-2 py-1 bg-zinc-800 rounded">
                    <Text className="text-xs text-zinc-400">
                      Layers: {preset.targetLayers.join(", ")}
                    </Text>
                  </View>
                  <View className="px-2 py-1 bg-zinc-800 rounded">
                    <Text className="text-xs text-zinc-400">
                      Every {preset.checkFrequency} days
                    </Text>
                  </View>
                  <View className="px-2 py-1 bg-zinc-800 rounded">
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

      {/* Bottom Spacing */}
      <View className="h-20" />
    </Animated.ScrollView>
  );
}
