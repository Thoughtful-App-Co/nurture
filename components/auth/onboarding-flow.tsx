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
import Slider from "@react-native-community/slider";
import { DataVerificationScreen } from "@/components/onboarding/DataVerificationScreen";
import { z } from "zod";

// Dynamically import expo-contacts to avoid errors in Expo Go
let Contacts: any = null;
try {
  Contacts = require("expo-contacts");
} catch (error) {
  console.log("expo-contacts not available - running in Expo Go or dev client");
}

type OnboardingStep = "welcome" | "basic-info" | "birth-year" | "contact-info" | "contacts-permission" | "data-verification" | "complete";

interface OnboardingData {
  firstName: string;
  lastName: string;
  birthYear?: number;
  email: string;
  phone: string;
  hasContactsPermission: boolean;
  dataSharingLevel?: "NONE" | "ANONYMIZED" | "FULL";
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

// Zod validation schemas
const emailSchema = z.string().email({ message: "Please enter a valid email address" });
const phoneSchema = z
  .string()
  .min(10, { message: "Phone number must be at least 10 digits" })
  .regex(/^[\d\s()+\-\.]+$/, { message: "Please enter a valid phone number" });

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [data, setData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hasContactsPermission: false,
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isEditingBirthYear, setIsEditingBirthYear] = useState<boolean>(false);
  const [birthYearText, setBirthYearText] = useState<string>("");

  const handleRequestContactsPermission = async () => {
    if (!Contacts) {
      console.log("Contacts API not available - going to data verification");
      setCurrentStep("data-verification");
      return;
    }

    try {
      console.log("Requesting contacts permission...");
      const { status } = await Contacts.requestPermissionsAsync();
      console.log("Contacts permission status:", status);
      
      setData({ ...data, hasContactsPermission: status === "granted" });
      setCurrentStep("data-verification");
    } catch (error) {
      console.error("Failed to request contacts permission:", error);
      setCurrentStep("data-verification");
    }
  };

  const validateEmail = (email: string): boolean => {
    try {
      emailSchema.parse(email);
      setEmailError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0]?.message || "Invalid email");
      }
      return false;
    }
  };

  const validatePhone = (phone: string): boolean => {
    try {
      phoneSchema.parse(phone);
      setPhoneError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPhoneError(error.errors[0]?.message || "Invalid phone number");
      }
      return false;
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
          <Text className="text-5xl text-primary mb-6 font-bold tracking-wider">
            Nurture
          </Text>
          <Text className="text-2xl text-white font-normal mb-4 leading-relaxed">
            Cultivate meaningful connections.
          </Text>
          <Text className="text-base text-zinc-400 leading-relaxed">
            Reclaim authentic relationships in a world of endless scrolling.{"\n\n"}
            Your data stays private, encrypted, and under your control.
          </Text>
        </View>

        <Pressable
          onPress={() => setCurrentStep("basic-info")}
          className="bg-primary py-4 px-6 border-2 border-primary min-h-[52px] justify-center"
          accessibilityLabel="Begin your journey"
          accessibilityRole="button"
          style={({ pressed }) => ({ 
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text className="text-center text-lg font-bold text-black">
            BEGIN YOUR JOURNEY
          </Text>
        </Pressable>

        <View className="mt-8">
          <Text className="text-xs text-zinc-500 text-center leading-relaxed">
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
            <Text className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">STEP 1 OF 4</Text>
          </View>

          {/* Header */}
          <View className="mb-12">
            <Text className="text-3xl font-bold tracking-wide text-white mb-4">
              What should we call you?
            </Text>
            <Text className="text-base text-zinc-400 leading-relaxed">
              We'll use this to personalize your experience and enable family relationship features.
            </Text>
          </View>

          {/* Input Fields - Improved spacing per design specs */}
          <View className="mb-8">
            <View className="mb-6">
              <Text className="text-xs text-zinc-400 mb-2 font-semibold uppercase tracking-wider">
                FIRST NAME
              </Text>
              <TextInput
                value={data.firstName}
                onChangeText={(text) => setData({ ...data, firstName: text })}
                placeholder="Enter your first name"
                placeholderTextColor="#71717a"
                className="bg-zinc-900 text-white text-base px-4 py-3 border-2 border-zinc-800 min-h-[44px]"
                autoCapitalize="words"
                autoComplete="name-given"
              />
            </View>

            <View>
              <Text className="text-xs text-zinc-400 mb-2 font-semibold uppercase tracking-wider">
                LAST NAME
              </Text>
              <TextInput
                value={data.lastName}
                onChangeText={(text) => setData({ ...data, lastName: text })}
                placeholder="Enter your last name"
                placeholderTextColor="#71717a"
                className="bg-zinc-900 text-white text-base px-4 py-3 border-2 border-zinc-800 min-h-[44px]"
                autoCapitalize="words"
                autoComplete="name-family"
              />
            </View>
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setTimeout(() => setCurrentStep("birth-year"), 100);
            }}
            disabled={!isValid}
            className={`py-4 px-6 border-2 min-h-[52px] justify-center ${
              isValid
                ? "bg-primary border-primary"
                : "bg-zinc-900 border-zinc-800"
            }`}
            accessibilityLabel="Continue to next step"
            accessibilityRole="button"
            accessibilityState={{ disabled: !isValid }}
            style={({ pressed }) => ({ 
              opacity: !isValid ? 0.5 : pressed ? 0.9 : 1,
              transform: [{ scale: pressed && isValid ? 0.98 : 1 }],
            })}
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

  // Step 2: Birth Year (with slider)
  if (currentStep === "birth-year") {
    const currentYear = new Date().getFullYear();
    const displayYear = data.birthYear || birthYearText || currentYear - 25;

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black"
      >
        <ScrollView className="flex-1" contentContainerClassName="px-8 py-16">
          {/* Progress */}
          <View className="mb-8">
            <Text className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">STEP 2 OF 4</Text>
          </View>

          {/* Header */}
          <View className="mb-12">
            <Text className="text-3xl font-bold tracking-wide text-white mb-4">
              When were you born?
            </Text>
            <Text className="text-base text-zinc-400 leading-relaxed">
              This helps us understand friendship timelines and relationship context.
            </Text>
          </View>

          {/* Year Display (Tappable) */}
          <View className="mb-8">
            <Pressable 
              onPress={() => setIsEditingBirthYear(!isEditingBirthYear)}
              className="bg-zinc-900 border-2 border-zinc-700 px-6 py-6 mb-4"
            >
              <Text className="text-white text-center text-5xl font-bold">
                {displayYear}
              </Text>
              <Text className="text-zinc-500 text-center text-xs mt-2">
                {isEditingBirthYear ? "Tap to use slider" : "Tap to type"}
              </Text>
            </Pressable>

            {isEditingBirthYear ? (
              // Text input mode
              <TextInput
                value={birthYearText}
                onChangeText={(text) => {
                  if (text.length <= 4) {
                    setBirthYearText(text);
                    const year = parseInt(text);
                    if (text.length === 4 && year >= 1900 && year <= currentYear) {
                      setData({ ...data, birthYear: year });
                    }
                  }
                }}
                placeholder="Type birth year"
                placeholderTextColor="#71717a"
                maxLength={4}
                keyboardType="numeric"
                className="bg-zinc-900 border-2 border-zinc-600 text-white text-center px-4 py-4 text-xl"
                autoFocus
              />
            ) : (
              // Slider mode
              <View>
                <Slider
                  style={{ width: '100%', height: 60 }}
                  minimumValue={1940}
                  maximumValue={currentYear}
                  step={1}
                  value={typeof displayYear === 'number' ? displayYear : currentYear - 25}
                  onValueChange={(value) => {
                    const year = Math.round(value);
                    setData({ ...data, birthYear: year });
                    setBirthYearText(year.toString());
                  }}
                  minimumTrackTintColor="#3b82f6"
                  maximumTrackTintColor="#52525b"
                  thumbTintColor="#3b82f6"
                />
                <View className="flex-row justify-between px-2">
                  <Text className="text-zinc-500 text-sm">1940</Text>
                  <Text className="text-zinc-500 text-sm">{currentYear}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setTimeout(() => setCurrentStep("contact-info"), 100);
            }}
            disabled={!data.birthYear}
            className={`py-4 px-6 border-2 min-h-[52px] justify-center ${
              data.birthYear
                ? "bg-primary border-primary"
                : "bg-zinc-900 border-zinc-800"
            }`}
            accessibilityLabel="Continue to next step"
            accessibilityRole="button"
            accessibilityState={{ disabled: !data.birthYear }}
            style={({ pressed }) => ({ 
              opacity: !data.birthYear ? 0.5 : pressed ? 0.9 : 1,
              transform: [{ scale: pressed && data.birthYear ? 0.98 : 1 }],
            })}
          >
            <Text
              className={`text-center text-lg font-bold ${
                data.birthYear ? "text-white" : "text-zinc-600"
              }`}
            >
              Continue
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 3: Contact Info (Email & Phone) - Improved spacing and Zod validation
  if (currentStep === "contact-info") {
    const isValidEmail = emailError === null && data.email.trim().length > 0;
    const isValidPhone = phoneError === null && data.phone.trim().length >= 10;
    const isValid = isValidEmail && isValidPhone;

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black"
      >
        <ScrollView className="flex-1" contentContainerClassName="px-8 py-16">
          {/* Progress */}
          <View className="mb-8">
            <Text className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">STEP 3 OF 4</Text>
          </View>

          {/* Header */}
          <View className="mb-12">
            <Text className="text-3xl font-bold tracking-wide text-white mb-4">
              How can we reach you?
            </Text>
            <Text className="text-base text-zinc-400 leading-relaxed">
              For account recovery and important notifications.{"\n\n"}
              We'll never spam you or share your information.
            </Text>
          </View>

          {/* Input Fields - Improved spacing per design specs */}
          <View className="mb-8">
            <View className="mb-6">
              <Text className="text-xs text-zinc-400 mb-2 font-semibold uppercase tracking-wider">
                EMAIL ADDRESS
              </Text>
              <TextInput
                value={data.email}
                onChangeText={(text) => {
                  setData({ ...data, email: text });
                  if (text.trim().length > 0) {
                    validateEmail(text);
                  } else {
                    setEmailError(null);
                  }
                }}
                onBlur={() => {
                  if (data.email.trim().length > 0) {
                    validateEmail(data.email);
                  }
                }}
                placeholder="your.email@example.com"
                placeholderTextColor="#71717a"
                className={`bg-zinc-900 text-white text-base px-4 py-3 border-2 min-h-[44px] ${
                  emailError ? "border-red-500" : "border-zinc-800"
                }`}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {emailError && (
                <Text className="text-red-400 text-sm mt-2">
                  {emailError}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-xs text-zinc-400 mb-2 font-semibold uppercase tracking-wider">
                PHONE NUMBER
              </Text>
              <TextInput
                value={data.phone}
                onChangeText={(text) => {
                  setData({ ...data, phone: text });
                  if (text.trim().length >= 10) {
                    validatePhone(text);
                  } else {
                    setPhoneError(null);
                  }
                }}
                onBlur={() => {
                  if (data.phone.trim().length >= 10) {
                    validatePhone(data.phone);
                  }
                }}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#71717a"
                className={`bg-zinc-900 text-white text-base px-4 py-3 border-2 min-h-[44px] ${
                  phoneError ? "border-red-500" : "border-zinc-800"
                }`}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              {phoneError && (
                <Text className="text-red-400 text-sm mt-2">
                  {phoneError}
                </Text>
              )}
            </View>
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setTimeout(() => setCurrentStep("contacts-permission"), 100);
            }}
            disabled={!isValid}
            className={`py-4 px-6 border-2 min-h-[52px] justify-center ${
              isValid
                ? "bg-primary border-primary"
                : "bg-zinc-900 border-zinc-800"
            }`}
            accessibilityLabel="Continue to permissions"
            accessibilityRole="button"
            accessibilityState={{ disabled: !isValid }}
            style={({ pressed }) => ({ 
              opacity: !isValid ? 0.5 : pressed ? 0.9 : 1,
              transform: [{ scale: pressed && isValid ? 0.98 : 1 }],
            })}
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
          <Text className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">STEP 4 OF 4</Text>
        </View>

        {/* Header */}
        <View className="mb-12">
          <Text className="text-3xl font-bold tracking-wide text-white mb-4">
            Access your contacts
          </Text>
          <Text className="text-base text-zinc-400 leading-relaxed">
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
              <Text className="text-zinc-400 text-sm leading-relaxed">
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
              <Text className="text-zinc-400 text-sm leading-relaxed">
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
              <Text className="text-zinc-400 text-sm leading-relaxed">
                Revoke access anytime in your device settings
              </Text>
            </View>
          </View>
        </View>

        {/* Allow Access Button */}
        <Pressable
          onPress={handleRequestContactsPermission}
          className="bg-primary py-4 px-6 border-2 border-primary mb-4 min-h-[52px] justify-center"
          accessibilityLabel="Allow contacts access"
          accessibilityRole="button"
          style={({ pressed }) => ({ 
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text className="text-center text-lg font-bold text-black">
            ALLOW CONTACTS ACCESS
          </Text>
        </Pressable>

        {/* Skip Option */}
        <Pressable
          onPress={() => setCurrentStep("data-verification")}
          className="py-3 min-h-[44px] justify-center"
          accessibilityLabel="Skip for now"
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text className="text-center text-sm text-zinc-400">
            I'll do this later
          </Text>
        </Pressable>
      </View>
    );
  }

  // Step 4.5: Data Verification
  if (currentStep === "data-verification") {
    return (
      <DataVerificationScreen
        userData={{
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          hasContactsPermission: data.hasContactsPermission,
        }}
        onComplete={(consentLevel) => {
          console.log("Data sharing consent level:", consentLevel);
          setData({ ...data, dataSharingLevel: consentLevel });
          setCurrentStep("complete");
        }}
      />
    );
  }

  // Step 5: Complete
  if (currentStep === "complete") {
    return (
      <View className="flex-1 bg-black justify-center px-8">
        {/* Header */}
        <View className="mb-12">
          <Text className="text-3xl font-bold tracking-wide text-white mb-4">
            You're all set!
          </Text>
          <Text className="text-base text-zinc-400 leading-relaxed">
            Your account is configured and ready.{"\n\n"}
            Next, we'll enable biometric security to protect your data.
          </Text>
        </View>

        {/* Security Features */}
        <View className="mb-12 p-6 border-2 border-zinc-800 bg-zinc-900">
          <Text className="text-xs text-zinc-400 font-semibold mb-4 uppercase tracking-wider">
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
          className="bg-primary py-4 px-6 border-2 border-primary min-h-[52px] justify-center"
          accessibilityLabel="Enable biometric lock"
          accessibilityRole="button"
          style={({ pressed }) => ({ 
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text className="text-center text-lg font-bold text-black">
            ENABLE BIOMETRIC LOCK
          </Text>
        </Pressable>

        {/* Privacy Note */}
        <View className="mt-8">
          <Text className="text-xs text-zinc-500 text-center leading-relaxed">
            By continuing, you agree to our privacy-first approach.{"\n"}
            Your data, your rules, always.
          </Text>
        </View>
      </View>
    );
  }

  return null;
}
