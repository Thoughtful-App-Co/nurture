/**
 * MetricExplainerModal - Explain Internal Work % calculation
 * 
 * Shows visual breakdown of the 4 components:
 * - Ranking Completeness (40%)
 * - Interaction Ratings (30%)
 * - Data Enrichment (20%)
 * - Review Completion (10%)
 * 
 * Usage:
 * <MetricExplainerModal
 *   visible={showModal}
 *   breakdown={{
 *     ranking: 65,
 *     ratings: 20,
 *     enrichment: 80,
 *     review: 50
 *   }}
 *   onClose={() => setShowModal(false)}
 * />
 */

import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';

interface MetricBreakdown {
  ranking: number;        // 0-100
  ratings: number;        // 0-100
  enrichment: number;     // 0-100
  review: number;         // 0-100
}

interface MetricExplainerModalProps {
  visible: boolean;
  breakdown: MetricBreakdown;
  onClose: () => void;
}

interface MetricComponent {
  name: string;
  weight: number;
  description: string;
  whatItMeans: string;
  howToImprove: string;
  color: string;
}

const METRIC_COMPONENTS: MetricComponent[] = [
  {
    name: 'Ranking Completeness',
    weight: 0.40,
    description: 'How well you understand your relationship priorities',
    whatItMeans: 'Percentage of contacts with intuitive ranking data from comparison questions.',
    howToImprove: 'Answer daily "Who would you rather..." questions to build ranking data.',
    color: '#3b82f6', // blue
  },
  {
    name: 'Interaction Ratings',
    weight: 0.30,
    description: 'Quality assessment of your recent interactions',
    whatItMeans: 'Percentage of recent interactions you\'ve rated for quality (energizing vs. draining).',
    howToImprove: 'Rate recent calls/texts after they happen to train the algorithm.',
    color: '#a855f7', // purple
  },
  {
    name: 'Data Enrichment',
    weight: 0.20,
    description: 'How much detail you\'ve added to contacts',
    whatItMeans: 'Percentage of contacts with rich profile data (notes, tags, context).',
    howToImprove: 'Add notes, tags, and context to contact profiles as you learn about them.',
    color: '#22c55e', // green
  },
  {
    name: 'Review Completion',
    weight: 0.10,
    description: 'Regular review of your Dunbar layers',
    whatItMeans: 'How recently you\'ve reviewed each Dunbar layer for accuracy.',
    howToImprove: 'Review each layer monthly to ensure contacts are in the right place.',
    color: '#f97316', // orange
  },
];

export function MetricExplainerModal({
  visible,
  breakdown,
  onClose,
}: MetricExplainerModalProps) {
  // Calculate weighted overall percentage
  const overallPercentage = Math.round(
    breakdown.ranking * 0.40 +
    breakdown.ratings * 0.30 +
    breakdown.enrichment * 0.20 +
    breakdown.review * 0.10
  );

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
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">
                Internal Work
              </Text>
              <Text className="text-zinc-400 text-base mt-2">
                Foundation-building progress
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center bg-zinc-900 rounded-full"
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Text className="text-zinc-400 text-xl">✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Overall Score */}
          <View className="mb-8">
            <View className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 items-center">
              <Text className="text-6xl font-bold text-primary mb-2">
                {overallPercentage}%
              </Text>
              <Text className="text-zinc-400 text-base text-center">
                Overall Internal Work Completion
              </Text>
            </View>
          </View>

          {/* What This Means */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-xl mb-3">
              What This Means
            </Text>
            <Text className="text-zinc-300 text-base leading-relaxed">
              Internal Work measures how much foundational work you've done to understand 
              and enrich your relationship data. Higher percentages mean the algorithm can 
              provide better suggestions and insights.
            </Text>
          </View>

          {/* Components Breakdown */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-xl mb-4">
              Components (Weighted)
            </Text>
            <View className="space-y-4">
              {METRIC_COMPONENTS.map((component, index) => {
                const value = [
                  breakdown.ranking,
                  breakdown.ratings,
                  breakdown.enrichment,
                  breakdown.review,
                ][index];
                
                return (
                  <View key={component.name} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-white font-medium text-base">
                          {component.name}
                        </Text>
                        <Text className="text-zinc-400 text-xs mt-0.5">
                          {(component.weight * 100).toFixed(0)}% of overall score
                        </Text>
                      </View>
                      <Text className="text-2xl font-bold" style={{ color: component.color }}>
                        {value}%
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 bg-zinc-800 rounded-full mb-3 overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${value}%`,
                          backgroundColor: component.color,
                        }}
                      />
                    </View>

                    {/* Description */}
                    <Text className="text-zinc-300 text-sm leading-relaxed mb-2">
                      {component.description}
                    </Text>

                    {/* Details (Collapsible-style but always shown) */}
                    <View className="mt-3 pt-3 border-t border-zinc-800">
                      <Text className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
                        What It Means
                      </Text>
                      <Text className="text-zinc-400 text-sm leading-relaxed mb-3">
                        {component.whatItMeans}
                      </Text>
                      
                      <Text className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
                        How To Improve
                      </Text>
                      <Text className="text-zinc-400 text-sm leading-relaxed">
                        {component.howToImprove}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Why It Matters */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-xl mb-3">
              Why Internal Work Matters
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-start bg-zinc-900 rounded-lg p-3">
                <Text className="text-primary text-base mr-2">→</Text>
                <Text className="text-zinc-300 text-base leading-relaxed flex-1">
                  Better algorithm suggestions based on your true preferences
                </Text>
              </View>
              <View className="flex-row items-start bg-zinc-900 rounded-lg p-3">
                <Text className="text-primary text-base mr-2">→</Text>
                <Text className="text-zinc-300 text-base leading-relaxed flex-1">
                  Clearer understanding of who matters most in your life
                </Text>
              </View>
              <View className="flex-row items-start bg-zinc-900 rounded-lg p-3">
                <Text className="text-primary text-base mr-2">→</Text>
                <Text className="text-zinc-300 text-base leading-relaxed flex-1">
                  More accurate Dunbar layer allocations
                </Text>
              </View>
              <View className="flex-row items-start bg-zinc-900 rounded-lg p-3">
                <Text className="text-primary text-base mr-2">→</Text>
                <Text className="text-zinc-300 text-base leading-relaxed flex-1">
                  Richer context for maintaining relationships
                </Text>
              </View>
            </View>
          </View>

          {/* Recommended Volitions */}
          {overallPercentage < 70 && (
            <View className="mb-8">
              <Text className="text-white font-semibold text-xl mb-3">
                Recommended Volitions
              </Text>
              <Text className="text-zinc-400 text-sm mb-3 leading-relaxed">
                To improve your Internal Work completion, consider activating these volitions:
              </Text>
              <View className="space-y-2">
                {breakdown.ranking < 50 && (
                  <View className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                    <Text className="text-white font-medium text-sm mb-1">
                      Know Your Circle
                    </Text>
                    <Text className="text-zinc-400 text-xs">
                      Build ranking data through daily comparisons (5 min/week)
                    </Text>
                  </View>
                )}
                {breakdown.ratings < 50 && (
                  <View className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                    <Text className="text-white font-medium text-sm mb-1">
                      Rate Interactions
                    </Text>
                    <Text className="text-zinc-400 text-xs">
                      Reflect on interaction quality (10 min/week)
                    </Text>
                  </View>
                )}
                {breakdown.review < 50 && (
                  <View className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                    <Text className="text-white font-medium text-sm mb-1">
                      Explore Garden
                    </Text>
                    <Text className="text-zinc-400 text-xs">
                      Learn about and review your Dunbar layers (15 min/week)
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Bottom spacing */}
          <View className="h-8" />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View className="px-6 py-4 border-t border-zinc-800 bg-black">
          <TouchableOpacity
            onPress={onClose}
            className="bg-primary py-4 rounded-lg items-center"
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text className="text-black font-bold text-lg">
              Got It
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
