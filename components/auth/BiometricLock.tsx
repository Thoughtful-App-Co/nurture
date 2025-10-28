/**
 * Biometric Lock Screen
 * 
 * Provides biometric authentication (Face ID/Fingerprint) or PIN fallback
 * when app comes to foreground or after timeout
 */

import React, { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

interface BiometricLockProps {
  onUnlock: () => void;
  fallbackPIN?: string; // Optional PIN for fallback
}

export function BiometricLock({ onUnlock, fallbackPIN }: BiometricLockProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPINInput, setShowPINInput] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [biometricType, setBiometricType] = useState<"face" | "fingerprint" | null>(null);

  useEffect(() => {
    checkBiometricAvailability();
    // Attempt biometric auth immediately on mount
    authenticateBiometric();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        // No biometric hardware, show PIN immediately
        setShowPINInput(true);
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        // Hardware exists but no biometrics enrolled
        setShowPINInput(true);
        return;
      }

      // Check what type of biometric is available
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("face");
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("fingerprint");
      }
    } catch (error) {
      console.error("Error checking biometric availability:", error);
      setShowPINInput(true);
    }
  };

  const authenticateBiometric = async () => {
    if (isAuthenticating) return;
    
    setIsAuthenticating(true);
    setPinError(false);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Nurture",
        fallbackLabel: fallbackPIN ? "Use PIN" : undefined,
        cancelLabel: "Cancel",
        disableDeviceFallback: false, // Allow device PIN/password as fallback
      });

      if (result.success) {
        console.log("✅ Biometric authentication successful");
        onUnlock();
      } else {
        console.log("Biometric authentication failed:", result.error);
        // If user cancels or fails, show PIN input
        if (fallbackPIN) {
          setShowPINInput(true);
        }
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      setShowPINInput(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePINSubmit = () => {
    if (!fallbackPIN) {
      // No PIN set, just unlock (for MVP)
      onUnlock();
      return;
    }

    if (pinInput === fallbackPIN) {
      console.log("✅ PIN authentication successful");
      onUnlock();
    } else {
      console.log("❌ Incorrect PIN");
      setPinError(true);
      setPinInput("");
      // Vibrate on error (if available)
      try {
        // @ts-ignore - Vibration might not be typed
        if (window?.navigator?.vibrate) {
          window.navigator.vibrate(200);
        }
      } catch {}
    }
  };

  const getBiometricIcon = () => {
    if (biometricType === "face") {
      return "👤"; // Face ID
    } else if (biometricType === "fingerprint") {
      return "👆"; // Touch ID / Fingerprint
    } else {
      return "🔒"; // Generic lock
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center px-8">
      {/* App Logo/Title */}
      <View className="mb-12 items-center">
        <Text className="text-5xl text-primary mb-4" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
          Nurture
        </Text>
        <Text className="text-lg text-secondary">
          Your relationships are protected
        </Text>
      </View>

      {/* Biometric Icon */}
      <View className="mb-8">
        <Text className="text-6xl">{getBiometricIcon()}</Text>
      </View>

      {/* PIN Input (if showing) */}
      {showPINInput ? (
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-full"
        >
          <View className="mb-8">
            <Text className="text-white text-lg mb-4 text-center">
              {fallbackPIN ? "Enter your PIN" : "Tap unlock to continue"}
            </Text>
            
            {fallbackPIN && (
              <>
                <TextInput
                  value={pinInput}
                  onChangeText={setPinInput}
                  placeholder="••••"
                  placeholderTextColor="#475569"
                  className={`bg-zinc-900 text-white text-2xl px-4 py-4 border ${
                    pinError ? "border-red-500" : "border-zinc-800"
                  } rounded-none text-center tracking-widest mb-4`}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  autoFocus
                  onSubmitEditing={handlePINSubmit}
                />
                {pinError && (
                  <Text className="text-red-500 text-center mb-4">
                    Incorrect PIN. Please try again.
                  </Text>
                )}
              </>
            )}
            
            <Pressable
              onPress={handlePINSubmit}
              disabled={fallbackPIN ? pinInput.length < 4 : false}
              className={`py-4 px-6 rounded-none border-2 ${
                !fallbackPIN || pinInput.length >= 4
                  ? "bg-primary border-primary"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <Text
                className={`text-center text-lg font-bold ${
                  !fallbackPIN || pinInput.length >= 4 ? "text-black" : "text-zinc-600"
                }`}
              >
                UNLOCK
              </Text>
            </Pressable>
          </View>

          {/* Try Biometric Again */}
          {biometricType && (
            <Pressable
              onPress={authenticateBiometric}
              disabled={isAuthenticating}
              className="py-3"
            >
              <Text className="text-center text-sm text-primary">
                {isAuthenticating 
                  ? "Authenticating..." 
                  : `Try ${biometricType === "face" ? "Face ID" : "Fingerprint"} again`
                }
              </Text>
            </Pressable>
          )}
        </KeyboardAvoidingView>
      ) : (
        // Biometric Authentication UI
        <View className="w-full">
          <Text className="text-white text-lg mb-8 text-center">
            {isAuthenticating 
              ? "Authenticating..." 
              : `Use ${biometricType === "face" ? "Face ID" : biometricType === "fingerprint" ? "your fingerprint" : "biometric"} to unlock`
            }
          </Text>

          <Pressable
            onPress={authenticateBiometric}
            disabled={isAuthenticating}
            className="bg-primary py-5 px-6 rounded-none border-2 border-primary mb-4"
          >
            <Text className="text-center text-lg font-bold text-black">
              {isAuthenticating ? "AUTHENTICATING..." : "UNLOCK WITH BIOMETRIC"}
            </Text>
          </Pressable>

          {/* Use PIN Instead */}
          {fallbackPIN && (
            <Pressable
              onPress={() => setShowPINInput(true)}
              className="py-3"
            >
              <Text className="text-center text-sm text-secondary">
                Use PIN instead
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}