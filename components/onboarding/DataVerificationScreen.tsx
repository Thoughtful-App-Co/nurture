/**
 * Data Verification Screen
 * 
 * Shows users what demographic data has been collected and offers
 * opt-in to data sharing for rebates/credits on the full suite.
 * 
 * Core principles:
 * - Transparency: Show exactly what data we have
 * - Consent: Explicit opt-in, not opt-out
 * - Value exchange: Clear explanation of benefits
 * - Privacy: Easy to decline without consequences
 */

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hasContactsPermission: boolean;
}

interface DataVerificationScreenProps {
  userData: UserData;
  onComplete: (consentLevel: "NONE" | "ANONYMIZED" | "FULL") => void;
}

export function DataVerificationScreen({ userData, onComplete }: DataVerificationScreenProps) {
  const [selectedLevel, setSelectedLevel] = useState<"NONE" | "ANONYMIZED" | "FULL" | null>(null);

  const dataItems = [
    { label: "Name", value: `${userData.firstName} ${userData.lastName}`, collected: true },
    { label: "Email", value: userData.email, collected: !!userData.email },
    { label: "Phone", value: userData.phone, collected: !!userData.phone },
    { label: "Contacts Access", value: userData.hasContactsPermission ? "Granted" : "Not Granted", collected: userData.hasContactsPermission },
  ];

  const sharingOptions = [
    {
      level: "NONE" as const,
      title: "No Data Sharing",
      description: "Keep everything private. Full price for premium features.",
      benefits: ["Complete privacy", "No data leaves your device", "Full app functionality"],
      discount: "0%",
    },
    {
      level: "ANONYMIZED" as const,
      title: "Anonymous Insights",
      description: "Share anonymized usage patterns to improve the app.",
      benefits: ["Help improve Nurture", "Aggregated data only", "No personal identifiers", "10% off premium"],
      discount: "10%",
    },
    {
      level: "FULL" as const,
      title: "Full Data Sharing",
      description: "Share demographic and usage data for maximum benefits.",
      benefits: ["Maximum discount", "Early access to features", "Priority support", "25% off premium"],
      discount: "25%",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-8 py-16">
        {/* Header */}
        <View className="mb-12">
          <Text className="text-3xl font-bold tracking-wide text-white mb-4">
            Verify Your Data
          </Text>
          <Text className="text-base text-zinc-400 leading-relaxed">
            Here's the information we've collected. You can choose to share this data in exchange for premium discounts, or keep everything completely private.
          </Text>
        </View>

        {/* Data Collected */}
        <View className="mb-12">
          <Text className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-4">
            DATA WE HAVE
          </Text>
          <View className="border-2 border-zinc-800 bg-zinc-900">
            {dataItems.map((item, index) => (
              <View
                key={item.label}
                className={`p-4 ${index < dataItems.length - 1 ? 'border-b border-zinc-800' : ''}`}
              >
                <Text className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">
                  {item.label}
                </Text>
                <Text className={`text-base ${item.collected ? 'text-white' : 'text-zinc-600'}`}>
                  {item.collected ? item.value : "Not provided"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sharing Options */}
        <View className="mb-12">
          <Text className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-4">
            CHOOSE YOUR PRIVACY LEVEL
          </Text>
          <View className="space-y-4">
            {sharingOptions.map((option) => (
              <Pressable
                key={option.level}
                onPress={() => setSelectedLevel(option.level)}
                className={`border-2 p-6 ${
                  selectedLevel === option.level
                    ? 'border-primary bg-primary/10'
                    : 'border-zinc-800 bg-zinc-900'
                }`}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className={`text-lg font-bold mb-1 ${
                      selectedLevel === option.level ? 'text-primary' : 'text-white'
                    }`}>
                      {option.title}
                    </Text>
                    <Text className="text-sm text-zinc-400 leading-relaxed">
                      {option.description}
                    </Text>
                  </View>
                  <View className="ml-4 bg-primary px-3 py-1">
                    <Text className="text-black text-xs font-bold">
                      {option.discount} OFF
                    </Text>
                  </View>
                </View>

                <View className="space-y-2 mt-4">
                  {option.benefits.map((benefit, index) => (
                    <View key={index} className="flex-row items-center">
                      <Text className="text-primary mr-2">✓</Text>
                      <Text className="text-sm text-zinc-300">{benefit}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Privacy Note */}
        <View className="mb-8 p-4 border-2 border-zinc-800 bg-zinc-900">
          <Text className="text-xs text-zinc-400 leading-relaxed">
            <Text className="font-bold text-zinc-300">Your Choice, Anytime: </Text>
            You can change your data sharing preference at any time in Settings. Opting out will not affect your existing data or app functionality.
          </Text>
        </View>

        {/* Continue Button */}
        <Pressable
          onPress={() => {
            if (selectedLevel) {
              onComplete(selectedLevel);
            }
          }}
          disabled={!selectedLevel}
          className={`py-4 px-6 border-2 min-h-[52px] justify-center ${
            selectedLevel
              ? "bg-primary border-primary"
              : "bg-zinc-900 border-zinc-800"
          }`}
          accessibilityLabel="Continue with selected privacy level"
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedLevel }}
          style={({ pressed }) => ({
            opacity: !selectedLevel ? 0.5 : pressed ? 0.9 : 1,
            transform: [{ scale: pressed && selectedLevel ? 0.98 : 1 }],
          })}
        >
          <Text
            className={`text-center text-lg font-bold ${
              selectedLevel ? "text-black" : "text-zinc-600"
            }`}
          >
            CONTINUE
          </Text>
        </Pressable>

        {/* Legal */}
        <View className="mt-8">
          <Text className="text-xs text-zinc-500 text-center leading-relaxed">
            By continuing, you agree to our Privacy Policy and Terms of Service.{"\n"}
            Your data is encrypted and stored securely on your device.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
