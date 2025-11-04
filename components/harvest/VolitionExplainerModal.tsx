/**
 * VolitionExplainerModal - Full-screen detailed explanation of a volition
 * 
 * Shows comprehensive WHAT/WHY/HOW/WHO/OUTCOMES information
 * Includes checklist preview and "Start This Volition" CTA
 * 
 * Usage:
 * <VolitionExplainerModal
 *   visible={showModal}
 *   volitionId="KNOW_YOUR_CIRCLE"
 *   onClose={() => setShowModal(false)}
 *   onStart={(volitionId) => handleStartVolition(volitionId)}
 * />
 */

import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  Pressable 
} from 'react-native';
import { VOLITION_EXPLANATIONS, type VolitionExplanation } from '@/config/volitionExplanations';

interface VolitionExplainerModalProps {
  visible: boolean;
  volitionId: string;
  onClose: () => void;
  onStart?: (volitionId: string) => void;
  showStartButton?: boolean;
}

export function VolitionExplainerModal({
  visible,
  volitionId,
  onClose,
  onStart,
  showStartButton = true,
}: VolitionExplainerModalProps) {
  const explanation = VOLITION_EXPLANATIONS[volitionId];

  if (!explanation) {
    return null;
  }

  const handleStart = () => {
    onStart?.(volitionId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="px-6 pt-16 pb-6 border-b border-zinc-800">
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-white">
              {volitionId.split('_').map(w => 
                w.charAt(0) + w.slice(1).toLowerCase()
              ).join(' ')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center bg-zinc-900 rounded-full"
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Text className="text-zinc-400 text-xl">✕</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-primary text-base mt-2 font-medium">
            {explanation.tagline}
          </Text>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-6">
          {/* What It Is */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-xl mb-3">
              What It Is
            </Text>
            <Text className="text-zinc-300 text-base leading-relaxed">
              {explanation.description}
            </Text>
          </View>

          {/* Why It Matters */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-xl mb-3">
              Why It Matters
            </Text>
            <Text className="text-zinc-300 text-base leading-relaxed mb-3">
              {explanation.motive}
            </Text>
            <View className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <Text className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
                Research Basis
              </Text>
              <Text className="text-zinc-300 text-sm leading-relaxed">
                {explanation.psychologicalBasis}
              </Text>
            </View>
          </View>

          {/* How It Works */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-xl mb-3">
              How It Works
            </Text>
            <View className="space-y-2">
              {explanation.dailyActions.map((action, index) => (
                <View key={index} className="flex-row items-start">
                  <Text className="text-primary text-base mr-2">•</Text>
                  <Text className="text-zinc-300 text-base leading-relaxed flex-1">
                    {action}
                  </Text>
                </View>
              ))}
            </View>
            <View className="bg-zinc-900 rounded-lg p-3 mt-4">
              <Text className="text-zinc-400 text-sm">
                ⏱️ Time commitment: <Text className="text-white font-medium">{explanation.weeklyCommitment}</Text>
              </Text>
              <Text className="text-zinc-400 text-sm mt-1">
                📅 Duration: <Text className="text-white font-medium">{explanation.duration}</Text>
              </Text>
            </View>
          </View>

          {/* What You'll Do (Checklist) */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-xl mb-3">
              What You'll Do
            </Text>
            <View className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
              {explanation.checklist.map((item, index) => (
                <View key={index} className="flex-row items-start">
                  <View className="w-5 h-5 rounded border-2 border-zinc-600 items-center justify-center mr-3 mt-0.5">
                    <Text className="text-zinc-600 text-xs">□</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base leading-relaxed">
                      {item.item}
                    </Text>
                    <Text className="text-zinc-400 text-xs mt-1">
                      {item.frequency}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Best For / Not For */}
          <View className="mb-8">
            <View className="flex-row gap-3">
              {/* Best For */}
              <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <Text className="text-green-500 font-semibold text-sm mb-3">
                  ✓ Best For
                </Text>
                <View className="space-y-2">
                  {explanation.bestFor.map((item, index) => (
                    <Text key={index} className="text-zinc-300 text-sm leading-relaxed">
                      • {item}
                    </Text>
                  ))}
                </View>
              </View>

              {/* Not For */}
              <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <Text className="text-red-500 font-semibold text-sm mb-3">
                  ✗ Not For
                </Text>
                <View className="space-y-2">
                  {explanation.notFor.map((item, index) => (
                    <Text key={index} className="text-zinc-300 text-sm leading-relaxed">
                      • {item}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Expected Outcomes */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-xl mb-3">
              Expected Outcomes
            </Text>
            <View className="space-y-2">
              {explanation.outcomes.map((outcome, index) => (
                <View key={index} className="flex-row items-start bg-zinc-900 rounded-lg p-3">
                  <Text className="text-primary text-base mr-2">→</Text>
                  <Text className="text-zinc-300 text-base leading-relaxed flex-1">
                    {outcome}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom spacing */}
          <View className="h-24" />
        </ScrollView>

        {/* Fixed Bottom CTA */}
        {showStartButton && (
          <View className="px-6 py-4 border-t border-zinc-800 bg-black">
            <TouchableOpacity
              onPress={handleStart}
              className="bg-primary py-4 rounded-lg items-center"
              accessibilityLabel="Start this volition"
              accessibilityRole="button"
            >
              <Text className="text-black font-bold text-lg">
                Start This Volition
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
