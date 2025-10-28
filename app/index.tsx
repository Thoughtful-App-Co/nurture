/**
 * Main Entry Point
 * 
 * Handles app initialization and routing based on user state
 */

import { Text, View, ActivityIndicator, AppState } from "react-native";
import { useAccount } from "jazz-tools/expo";
import { useDemoAuth } from "jazz-tools/expo";
import { OnboardingFlow } from "@/components/auth/onboarding-flow";
import { BiometricLock } from "@/components/auth/BiometricLock";
import { useState, useEffect, useRef } from "react";

export default function Index() {
  const { me } = useAccount();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef(AppState.currentState);
  const auth = useDemoAuth();

  // Check if user needs onboarding (no displayName set)
  useEffect(() => {
    if (me) {
      const root = me.root as any;
      const needsOnboarding = !root?.displayName;
      setIsOnboarding(needsOnboarding);
      
      // If user has completed onboarding, lock the app initially
      if (!needsOnboarding) {
        setIsLocked(true);
      }
    }
  }, [me]);

  // Handle app state changes for biometric lock
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App came to foreground - lock if user has completed onboarding
        if (me && !isOnboarding) {
          console.log("App came to foreground - locking");
          setIsLocked(true);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [me, isOnboarding]);

  // Loading state
  if (me === undefined) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  // No Jazz account - create anonymous account first
  if (!me) {
    // This will trigger Jazz to create an anonymous account
    // Then the useEffect above will detect it needs onboarding
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-secondary mt-4">Initializing...</Text>
      </View>
    );
  }

  // User needs onboarding - collect their data
  if (isOnboarding) {
    return (
      <OnboardingFlow
        onComplete={async (data) => {
          console.log("Onboarding complete, saving user data to Jazz...");
          const root = me.root as any;
          
          // Update the user profile with onboarding data
          root.displayName = `${data.firstName} ${data.lastName}`;
          root.email = data.email;
          root.phone = data.phone;
          
          console.log("User data saved:", {
            displayName: root.displayName,
            email: root.email,
            phone: root.phone,
          });
          
          // Exit onboarding mode
          setIsOnboarding(false);
          
          // TODO: Enable biometric lock here
          console.log("TODO: Enable biometric lock");
        }}
      />
    );
  }

  // Show biometric lock if needed
  if (isLocked) {
    return (
      <BiometricLock
        onUnlock={() => {
          console.log("App unlocked!");
          setIsLocked(false);
        }}
        fallbackPIN="1234" // TODO: Allow user to set their own PIN
      />
    );
  }

  // User has completed onboarding - show home screen
  const root = me.root as any;
  const displayName = root?.displayName || "Friend";
  const email = root?.email;
  const phone = root?.phone;
  
  const nameParts = displayName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <View className="flex-1 bg-black justify-center px-8">
      <View className="mb-12">
        <Text className="text-5xl text-primary mb-6" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
          Welcome
        </Text>
        <Text className="text-4xl font-light text-white mb-2">
          {firstName}
        </Text>
        {lastName && (
          <Text className="text-4xl font-light text-white">
            {lastName}
          </Text>
        )}
      </View>

      <View className="mt-8">
        <Text className="text-lg text-secondary leading-relaxed">
          Your garden awaits.{"\n"}
          Let&apos;s cultivate meaningful connections.
        </Text>
      </View>

      {/* User Info (for debugging) */}
      <View className="mt-8 p-4 border border-zinc-800 bg-zinc-900">
        <Text className="text-xs text-secondary font-medium mb-2">
          YOUR INFO
        </Text>
        <Text className="text-white text-sm">Email: {email || "Not set"}</Text>
        <Text className="text-white text-sm">Phone: {phone || "Not set"}</Text>
      </View>

      {/* Placeholder for next steps */}
      <View className="mt-8 p-6 border border-zinc-800 bg-zinc-900">
        <Text className="text-sm text-secondary font-medium mb-2">
          NEXT STEPS
        </Text>
        <Text className="text-white text-base leading-relaxed">
          • Import your contacts{"\n"}
          • Discover your relationship layers{"\n"}
          • Set cultivation goals{"\n"}
          • Start nurturing connections
        </Text>
      </View>
    </View>
  );
}
