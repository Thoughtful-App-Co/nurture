/**
 * Data Limitations Communication Screen
 * 
 * Streamlined version that combines what we have/don't have
 * and introduces gamified manual logging as the solution.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';

interface Props {
  onContinue: () => void;
  hasCallData: boolean;
  hasSMSData: boolean;
  contactCount: number;
}

export function DataLimitationsScreen({ onContinue, hasCallData, hasSMSData, contactCount }: Props) {
  const isIOS = Platform.OS === 'ios';
  const hasAnyInteractionData = hasCallData || hasSMSData;

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1" contentContainerClassName="px-8 py-16">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl text-white font-bold mb-4">
            Your Real-World Reality
          </Text>
          <Text className="text-base text-zinc-400 leading-relaxed">
            What the data shows — not wishful thinking
          </Text>
        </View>

        {/* Combined Status */}
        <View className="mb-8 p-4 border-2 border-zinc-800 bg-zinc-900">
          <Text className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3">
            WHAT WE FOUND
          </Text>
          
          <View className="space-y-2 mb-4">
            <View className="flex-row items-start">
              <Text className="text-green-400 mr-2">✅</Text>
              <Text className="text-white flex-1">
                {contactCount} contacts
              </Text>
            </View>
            
            {hasCallData ? (
              <View className="flex-row items-start">
                <Text className="text-green-400 mr-2">✅</Text>
                <Text className="text-white flex-1">
                  Call history (last 3 months)
                </Text>
              </View>
            ) : (
              <View className="flex-row items-start">
                <Text className="text-orange-400 mr-2">❌</Text>
                <Text className="text-zinc-400 flex-1">
                  No call data {isIOS ? '(iOS restriction)' : '(native modules not built)'}
                </Text>
              </View>
            )}
            
            {hasSMSData ? (
              <View className="flex-row items-start">
                <Text className="text-green-400 mr-2">✅</Text>
                <Text className="text-white flex-1">
                  SMS history (last 3 months)
                </Text>
              </View>
            ) : (
              <View className="flex-row items-start">
                <Text className="text-orange-400 mr-2">❌</Text>
                <Text className="text-zinc-400 flex-1">
                  No SMS data {isIOS ? '(iOS restriction)' : '(native modules not built)'}
                </Text>
              </View>
            )}
            
            <View className="flex-row items-start">
              <Text className="text-zinc-500 mr-2">⚪</Text>
              <Text className="text-zinc-400 flex-1">
                In-person meetings (requires manual logging)
              </Text>
            </View>
            
            <View className="flex-row items-start">
              <Text className="text-zinc-600 mr-2">—</Text>
              <Text className="text-zinc-500 flex-1 text-xs">
                Social media & messaging apps (intentionally excluded)
              </Text>
            </View>
          </View>

          {!isIOS && !hasAnyInteractionData && (
            <View className="pt-3 border-t border-zinc-700">
              <Text className="text-xs text-zinc-400 mb-2">
                To get call/SMS data on Android:
              </Text>
              <View className="bg-black p-3 border border-zinc-700">
                <Text className="text-zinc-500 text-xs font-mono">
                  npx expo prebuild{'\n'}
                  npx expo run:android
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* The Gap & The Solution */}
        <View className="mb-8 p-4 border-2 border-primary bg-green-950/30">
          <Text className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">
            💡 OUR PHILOSOPHY
          </Text>
          
          <Text className="text-white text-base mb-3 leading-relaxed">
            We focus on real-world behavioral signals — calls, texts, and in-person time. 
            {!hasAnyInteractionData && ' Without call/SMS data, we have limited signals to analyze.'}
          </Text>
          
          <Text className="text-white text-base mb-4 leading-relaxed">
            <Text className="font-semibold">Your cyberspace is yours to explore.</Text> We don't track social media or messaging apps because those spaces allow unlimited connection without real-world constraints. Here, we help you cultivate your real-world social garden.
          </Text>
          
          <View className="bg-black/50 p-3 border border-primary/30">
            <Text className="text-xs text-zinc-300 leading-relaxed">
              <Text className="text-primary font-semibold">Log interactions</Text> → <Text className="text-primary font-semibold">Rate quality</Text> → <Text className="text-primary font-semibold">Cultivate intentionally</Text>
              {'\n\n'}
              Discover who you actually enjoy spending time with in the real world. Behavioral reality, not digital illusions.
            </Text>
          </View>
        </View>

        {/* Honesty Statement */}
        <View className="mb-12 p-4 border-2 border-zinc-800 bg-zinc-900">
          <Text className="text-xs text-zinc-400 leading-relaxed">
            <Text className="text-white font-semibold">Note:</Text> We show you behavioral reality, not wishful thinking. 
            {!hasAnyInteractionData && ' With limited interaction data, your initial layers may be less accurate. '}
            Use the manual logging tools to build a complete picture of your real-world relationships.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-8 py-4 border-t border-zinc-800 bg-zinc-950">
        <Pressable
          onPress={onContinue}
          className="bg-primary py-4 px-6 border-2 border-primary min-h-[52px] justify-center"
          accessibilityLabel="Continue to Dashboard"
          accessibilityRole="button"
          style={({ pressed }) => ({ 
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text className="text-center text-lg font-bold text-black">
            CONTINUE TO DASHBOARD
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
