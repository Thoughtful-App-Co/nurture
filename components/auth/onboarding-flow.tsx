/**
 * Onboarding Flow
 * 
 * Collects essential user data on first launch:
 * - Name (for personalization & family features)
 * - Email (disaster recovery)
 * - Phone (disaster recovery)
 * - Contacts permission (for relationship analysis)
 * 
 * After onboarding, biometric lock is enabled for session security.
 */

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from "react-native";

// Dynamically import expo-contacts to avoid errors in Expo Go
let Contacts: any = null;
try {
  Contacts = require("expo-contacts");
} catch (error) {
  console.log("expo-contacts not available - running in Expo Go or dev client");
}

type OnboardingStep = "welcome" | "basic-info" | "contact-info" | "contacts-permission" | "complete";

interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hasContactsPermission: boolean;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [data, setData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hasContactsPermission: false,
  });

  const handleRequestContactsPermission = async () => {
    if (!Contacts) {
      console.log("Contacts API not available - completing onboarding");
      setCurrentStep("complete");
      return;
    }

    try {
      console.log("Requesting contacts permission...");
      const { status } = await Contacts.requestPermissionsAsync();
      console.log("Contacts permission status:", status);
      
      setData({ ...data, hasContactsPermission: status === "granted" });
      setCurrentStep("complete");
    } catch (error) {
      console.error("Failed to request contacts permission:", error);
      setCurrentStep("complete");
    }
  };

  const handleComplete = () => {
    console.log("Onboarding complete with data:", data);
    onComplete(data);
  };

  // Step 1: Welcome
  if (currentStep === "welcome") {
    return (
      <View className="flex-1 bg-black justify-center px-8">
        <View className="mb-12">
          <Text className="text-5xl text-primary mb-6" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
            Nurture
          </Text>
          <Text className="text-2xl text-white font-light mb-4 leading-relaxed">
            Cultivate meaningful connections.
          </Text>
          <Text className="text-lg text-secondary leading-relaxed">
            Reclaim authentic relationships in a world of endless scrolling.{"\n\n"}
            Your data stays private, encrypted, and under your control.
          </Text>
        </View>

        <Pressable
          onPress={() => setCurrentStep("basic-info")}
          className="bg-primary py-5 px-6 rounded-none border-2 border-primary"
        >
          <Text className="text-center text-lg font-bold text-black">
            BEGIN YOUR JOURNEY
          </Text>
        </Pressable>

        <View className="mt-8">
          <Text className="text-xs text-secondary text-center leading-relaxed">
            Takes 2 minutes • Your privacy is paramount
          </Text>
        </View>
      </View>
    );
  }

  // Step 2: Basic Info (Name)
  if (currentStep === "basic-info") {
    const isValid = data.firstName.trim().length > 0 && data.lastName.trim().length > 0;

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black"
      >
        <ScrollView className="flex-1" contentContainerClassName="px-8 py-16">
          {/* Progress */}
          <View className="mb-8">
            <Text className="text-sm text-secondary font-medium">STEP 1 OF 3</Text>
          </View>

          {/* Header */}
          <View className="mb-12">
            <Text className="text-3xl font-bold text-white mb-4">
              What should we call you?
            </Text>
            <Text className="text-base text-secondary leading-relaxed">
              We'll use this to personalize your experience and enable family relationship features.
            </Text>
          </View>

          {/* Input Fields */}
          <View className="space-y-6 mb-8">
            <View>
              <Text className="text-sm text-secondary mb-2 font-medium">
                FIRST NAME
              </Text>
              <TextInput
                value={data.firstName}
                onChangeText={(text) => setData({ ...data, firstName: text })}
                placeholder="Enter your first name"
                placeholderTextColor="#475569"
                className="bg-zinc-900 text-white text-lg px-4 py-4 border border-zinc-800 rounded-none"
                autoCapitalize="words"
                autoComplete="name-given"
              />
            </View>

            <View>
              <Text className="text-sm text-secondary mb-2 font-medium">
                LAST NAME
              </Text>
              <TextInput
                value={data.lastName}
                onChangeText={(text) => setData({ ...data, lastName: text })}
                placeholder="Enter your last name"
                placeholderTextColor="#475569"
                className="bg-zinc-900 text-white text-lg px-4 py-4 border border-zinc-800 rounded-none"
                autoCapitalize="words"
                autoComplete="name-family"
              />
            </View>
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setTimeout(() => setCurrentStep("contact-info"), 100);
            }}
            disabled={!isValid}
            className={`py-4 px-6 rounded-none border-2 ${
              isValid
                ? "bg-primary border-primary"
                : "bg-zinc-900 border-zinc-800"
            }`}
          >
            <Text
              className={`text-center text-lg font-bold ${
                isValid ? "text-black" : "text-zinc-600"
              }`}
            >
              CONTINUE
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 3: Contact Info (Email & Phone)
  if (currentStep === "contact-info") {
    const isValidEmail = data.email.trim().includes("@");
    const isValidPhone = data.phone.trim().length >= 10; // Basic validation
    const isValid = isValidEmail && isValidPhone;

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black"
      >
        <ScrollView className="flex-1" contentContainerClassName="px-8 py-16">
          {/* Progress */}
          <View className="mb-8">
            <Text className="text-sm text-secondary font-medium">STEP 2 OF 3</Text>
          </View>

          {/* Header */}
          <View className="mb-12">
            <Text className="text-3xl font-bold text-white mb-4">
              How can we reach you?
            </Text>
            <Text className="text-base text-secondary leading-relaxed">
              For account recovery and important notifications.{"\n\n"}
              We'll never spam you or share your information.
            </Text>
          </View>

          {/* Input Fields */}
          <View className="space-y-6 mb-8">
            <View>
              <Text className="text-sm text-secondary mb-2 font-medium">
                EMAIL ADDRESS
              </Text>
              <TextInput
                value={data.email}
                onChangeText={(text) => setData({ ...data, email: text })}
                placeholder="your.email@example.com"
                placeholderTextColor="#475569"
                className="bg-zinc-900 text-white text-lg px-4 py-4 border border-zinc-800 rounded-none"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View>
              <Text className="text-sm text-secondary mb-2 font-medium">
                PHONE NUMBER
              </Text>
              <TextInput
                value={data.phone}
                onChangeText={(text) => setData({ ...data, phone: text })}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#475569"
                className="bg-zinc-900 text-white text-lg px-4 py-4 border border-zinc-800 rounded-none"
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setTimeout(() => setCurrentStep("contacts-permission"), 100);
            }}
            disabled={!isValid}
            className={`py-4 px-6 rounded-none border-2 ${
              isValid
                ? "bg-primary border-primary"
                : "bg-zinc-900 border-zinc-800"
            }`}
          >
            <Text
              className={`text-center text-lg font-bold ${
                isValid ? "text-black" : "text-zinc-600"
              }`}
            >
              CONTINUE
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 4: Contacts Permission
  if (currentStep === "contacts-permission") {
    return (
      <View className="flex-1 bg-black justify-center px-8">
        {/* Progress */}
        <View className="mb-8">
          <Text className="text-sm text-secondary font-medium">STEP 3 OF 3</Text>
        </View>

        {/* Header */}
        <View className="mb-12">
          <Text className="text-3xl font-bold text-white mb-4">
            Access your contacts
          </Text>
          <Text className="text-base text-secondary leading-relaxed">
            Nurture analyzes your phone contacts to help you identify and cultivate meaningful relationships.{"\n\n"}
            Your contact data stays encrypted and never leaves your device without your permission.
          </Text>
        </View>

        {/* Privacy Features */}
        <View className="mb-12 space-y-4">
          <View className="flex-row items-start">
            <Text className="text-primary text-2xl mr-3">🔒</Text>
            <View className="flex-1">
              <Text className="text-white text-base mb-1 font-medium">
                End-to-end encrypted
              </Text>
              <Text className="text-secondary text-sm leading-relaxed">
                Your data is encrypted before it ever leaves your device
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="text-primary text-2xl mr-3">💾</Text>
            <View className="flex-1">
              <Text className="text-white text-base mb-1 font-medium">
                Local-first storage
              </Text>
              <Text className="text-secondary text-sm leading-relaxed">
                Everything stored on your device, synced only when you choose
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="text-primary text-2xl mr-3">🛡️</Text>
            <View className="flex-1">
              <Text className="text-white text-base mb-1 font-medium">
                You're in control
              </Text>
              <Text className="text-secondary text-sm leading-relaxed">
                Revoke access anytime in your device settings
              </Text>
            </View>
          </View>
        </View>

        {/* Allow Access Button */}
        <Pressable
          onPress={handleRequestContactsPermission}
          className="bg-primary py-5 px-6 rounded-none border-2 border-primary mb-4"
        >
          <Text className="text-center text-lg font-bold text-black">
            ALLOW CONTACTS ACCESS
          </Text>
        </Pressable>

        {/* Skip Option */}
        <Pressable
          onPress={() => setCurrentStep("complete")}
          className="py-3"
        >
          <Text className="text-center text-sm text-secondary">
            I'll do this later
          </Text>
        </Pressable>
      </View>
    );
  }

  // Step 5: Complete
  if (currentStep === "complete") {
    return (
      <View className="flex-1 bg-black justify-center px-8">
        {/* Header */}
        <View className="mb-12">
          <Text className="text-3xl font-bold text-white mb-4">
            You're all set!
          </Text>
          <Text className="text-base text-secondary leading-relaxed">
            Your account is configured and ready.{"\n\n"}
            Next, we'll enable biometric security to protect your data.
          </Text>
        </View>

        {/* Security Features */}
        <View className="mb-12 p-6 border border-zinc-800 bg-zinc-900">
          <Text className="text-sm text-secondary font-medium mb-4">
            WHAT HAPPENS NEXT
          </Text>
          <View className="space-y-3">
            <Text className="text-white text-base leading-relaxed">
              • Biometric lock enabled (Face ID / Fingerprint)
            </Text>
            <Text className="text-white text-base leading-relaxed">
              • All data encrypted on your device
            </Text>
            <Text className="text-white text-base leading-relaxed">
              • Start analyzing your relationships
            </Text>
          </View>
        </View>

        {/* Complete Button */}
        <Pressable
          onPress={handleComplete}
          className="bg-primary py-5 px-6 rounded-none border-2 border-primary"
        >
          <Text className="text-center text-lg font-bold text-black">
            ENABLE BIOMETRIC LOCK
          </Text>
        </Pressable>

        {/* Privacy Note */}
        <View className="mt-8">
          <Text className="text-xs text-secondary text-center leading-relaxed">
            By continuing, you agree to our privacy-first approach.{"\n"}
            Your data, your rules, always.
          </Text>
        </View>
      </View>
    );
  }

  return null;
}
