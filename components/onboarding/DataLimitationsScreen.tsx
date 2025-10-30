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
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        {/* Header */}
        <Text className="text-3xl text-white font-bold mb-2">
          Your Behavioral Reality
        </Text>
        <Text className="text-lg text-secondary mb-8">
          Not wishful thinking - what the data shows
        </Text>

        {/* Combined Status */}
        <View className="mb-6 p-4 border border-zinc-700 bg-zinc-900">
          <Text className="text-sm text-secondary font-medium mb-3">
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
              <Text className="text-orange-400 mr-2">❌</Text>
              <Text className="text-zinc-400 flex-1">
                WhatsApp, Instagram, Telegram, in-person meetings
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
        <View className="mb-6 p-4 border border-primary bg-green-950/30">
          <Text className="text-sm text-primary font-medium mb-3">
            💡 HERE'S THE REALITY
          </Text>
          
          <Text className="text-white text-base mb-3 leading-relaxed">
            Most of your relationships happen on WhatsApp, Instagram, and in-person. 
            {!hasAnyInteractionData && ' Without call/SMS data, we have almost nothing to analyze.'}
          </Text>
          
          <Text className="text-white text-base mb-4 leading-relaxed">
            <Text className="font-semibold">That's where you come in.</Text> We've built quick logging tools so you can teach the app who matters to you through gamified ranking.
          </Text>
          
          <View className="bg-black/50 p-3 border border-primary/30">
            <Text className="text-xs text-zinc-300 leading-relaxed">
              <Text className="text-primary font-semibold">Log interactions</Text> → <Text className="text-primary font-semibold">Rate quality</Text> → <Text className="text-primary font-semibold">Mark favorites</Text>
              {'\n\n'}
              Over time, you'll discover who you actually enjoy spending time with vs. who drains you. Behavioral reality, not wishful thinking.
            </Text>
          </View>
        </View>

        {/* Honesty Statement */}
        <View className="mb-8 p-4 border border-zinc-700 bg-zinc-900">
          <Text className="text-xs text-zinc-400 leading-relaxed">
            <Text className="text-white font-semibold">Our Philosophy:</Text> We show you behavioral reality, not wishful thinking. 
            {!hasAnyInteractionData && ' With zero interaction data, your layers are basically random. '}
            Use the manual tools to build an accurate picture of your relationships.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 py-4 border-t border-zinc-800 bg-zinc-950">
        <Pressable
          onPress={onContinue}
          className="bg-primary py-4 px-6"
        >
          <Text className="text-center text-lg font-bold text-black">
            I Understand - Continue to Dashboard
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
