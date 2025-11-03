/**
 * Dunbar Violation Hero Card
 * 
 * High-priority hero card that appears when a Dunbar layer is over capacity.
 * Uses Von Restorff effect (high visual contrast) to grab attention.
 * 
 * Triggers the "Would You Rather" ranking tool to resolve violations.
 * 
 * Priority: 5 (higher than Tend Garden which is 10)
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { Card } from "@/components/ui";

interface DunbarViolation {
  layer: number;
  layerName: string;
  current: number;
  max: number;
  overage: number;
}

interface DunbarViolationHeroCardProps {
  violation: DunbarViolation;
  onStart: () => void;
  onDismiss?: () => void; // Optional: allow snoozing
}

export function DunbarViolationHeroCard({
  violation,
  onStart,
  onDismiss,
}: DunbarViolationHeroCardProps) {
  const { layer, layerName, current, max, overage } = violation;
  
  // Different messaging based on layer
  const getLayerMessage = () => {
    switch (layer) {
      case 0:
        return {
          title: "🚨 Your Loved Ones Need Attention",
          description: `You have ${current} people in your innermost circle, but research shows we can only maintain ${max} truly intimate relationships.`,
          warning: "Spreading yourself too thin can lead to burnout and shallow connections.",
        };
      case 1:
        return {
          title: "⚠️ Your Inner Circle is Overflowing",
          description: `You have ${current} people in your Inner Circle, but the healthy limit is ${max} close relationships.`,
          warning: "This can make it hard to give each person the attention they deserve.",
        };
      case 2:
        return {
          title: "🌿 Your Clan Needs Pruning",
          description: `Your Clan has ${current} people, but ${max} is the recommended size for maintaining meaningful connections.`,
          warning: "A crowded clan makes it difficult to nurture each relationship.",
        };
      case 3:
        return {
          title: "👥 Your Tribe is Too Large",
          description: `Your Tribe has grown to ${current} people, exceeding Dunbar's number of ${max} relationships we can meaningfully track.`,
          warning: "Beyond this size, relationships tend to become superficial.",
        };
      default:
        return {
          title: "📊 Layer Needs Balancing",
          description: `You have ${current} contacts in ${layerName}, but the capacity is ${max}.`,
          warning: "Let's prioritize who matters most.",
        };
    }
  };
  
  const message = getLayerMessage();
  
  return (
    <View className="bg-gradient-to-br from-red-500/20 to-red-500/5 border-3 border-red-500 p-6 shadow-lg">
      {/* Attention-grabbing header */}
      <View className="flex-row items-center mb-3">
        <View className="bg-red-500 w-2 h-2 rounded-full mr-2 animate-pulse" />
        <Text className="text-red-400 text-xs font-bold uppercase tracking-widest">
          🚨 LAYER {layer} OVERFLOWING
        </Text>
      </View>
      
      <Text className="text-white text-2xl font-bold mb-2 tracking-tight">
        Your {layerName} Needs Attention
      </Text>
      
      <Text className="text-zinc-300 text-base leading-relaxed mb-4">
        You have <Text className="text-red-400 font-bold">{current}</Text> people in this layer, but the healthy limit is <Text className="text-primary font-bold">{max}</Text>. Let's prioritize who matters most.
      </Text>
      
      <Pressable
        onPress={onStart}
        className="bg-primary py-4 px-6 border-2 border-primary shadow-xl"
        accessibilityLabel="Start prioritizing relationships"
        accessibilityRole="button"
        style={({ pressed }) => ({ 
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Text className="text-center text-lg font-bold text-black tracking-wide">
          PRIORITIZE NOW (5 min)
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * Detect Dunbar violations from contacts
 * Returns array of violations sorted by priority (Layer 0 first)
 */
export function detectDunbarViolations(contacts: any[]): DunbarViolation[] {
  // Layer capacities (matching dunbarCalculator.ts LAYER_THRESHOLDS)
  const LAYER_CAPACITIES = [
    { layer: 0, name: "Loved Ones", max: 5 },
    { layer: 1, name: "Inner Circle", max: 15 },
    { layer: 2, name: "Clan", max: 50 },
    { layer: 3, name: "Tribe", max: 150 },
    { layer: 4, name: "Acquaintances", max: 500 },
  ];
  
  // Count contacts per layer
  const layerCounts = new Map<number, number>();
  for (const contact of contacts) {
    const layer = contact.dunbarLayer ?? 5;
    layerCounts.set(layer, (layerCounts.get(layer) || 0) + 1);
  }
  
  // Find violations
  const violations: DunbarViolation[] = [];
  
  for (const { layer, name, max } of LAYER_CAPACITIES) {
    const current = layerCounts.get(layer) || 0;
    
    if (current > max) {
      violations.push({
        layer,
        layerName: name,
        current,
        max,
        overage: current - max,
      });
    }
  }
  
  // Sort by priority (Layer 0 violations are most critical)
  violations.sort((a, b) => a.layer - b.layer);
  
  return violations;
}
