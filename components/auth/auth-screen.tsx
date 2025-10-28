/**
 * Authentication Screen
 * 
 * Handles user signup with first name and last name input.
 * Uses Jazz PasskeyAuth for biometric authentication.
 * Aligns with Nurture's stark, paper-like aesthetic.
 */

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useDemoAuth } from "jazz-tools/expo";

export function AuthScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const authMethods = useDemoAuth();

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await authMethods.signUp(fullName);
    } catch (error) {
      console.error("Signup failed:", error);
      setIsLoading(false);
    }
  };

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <View className="flex-1 justify-center px-8">
        {/* Header */}
        <View className="mb-12">
          <Text className="text-4xl font-bold text-primary mb-4">
            Nurture
          </Text>
          <Text className="text-lg text-secondary leading-relaxed">
            Cultivate meaningful connections.{"\n"}
            Reclaim authentic relationships.
          </Text>
        </View>

        {/* Input Fields */}
        <View className="space-y-6 mb-8">
          <View>
            <Text className="text-sm text-secondary mb-2 font-medium">
              FIRST NAME
            </Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor="#475569"
              className="bg-zinc-900 text-white text-lg px-4 py-4 border border-zinc-800 rounded-none"
              autoCapitalize="words"
              autoComplete="name-given"
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="text-sm text-secondary mb-2 font-medium">
              LAST NAME
            </Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor="#475569"
              className="bg-zinc-900 text-white text-lg px-4 py-4 border border-zinc-800 rounded-none"
              autoCapitalize="words"
              autoComplete="name-family"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Sign Up Button */}
        <Pressable
          onPress={handleSignup}
          disabled={!isValid || isLoading}
          className={`py-4 px-6 rounded-none border-2 ${
            isValid && !isLoading
              ? "bg-primary border-primary"
              : "bg-zinc-900 border-zinc-800"
          }`}
        >
          <Text
            className={`text-center text-lg font-bold ${
              isValid && !isLoading ? "text-black" : "text-zinc-600"
            }`}
          >
            {isLoading ? "SETTING UP..." : "BEGIN CULTIVATING"}
          </Text>
        </Pressable>

        {/* Privacy Note */}
        <View className="mt-12">
          <Text className="text-xs text-secondary text-center leading-relaxed">
            Your data is encrypted and stored locally.{"\n"}
            We&apos;ll analyze your contacts to help you cultivate{"\n"}
            meaningful relationships.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
