/**
 * Main Entry Point
 * 
 * Handles app initialization and routing based on user state
 * Flow: Onboarding → Data Mining → Biometric Lock → Dashboard
 */

import { Text, View, ActivityIndicator, AppState as RNAppState } from "react-native";
import { useAccount } from "jazz-tools/expo";
import { useDemoAuth } from "jazz-tools/expo";
import { OnboardingFlow } from "@/components/auth/onboarding-flow";
import { BiometricLock } from "@/components/auth/BiometricLock";
import { DataMiningScreen } from "@/components/onboarding/DataMiningScreen";
import { useState, useEffect, useRef } from "react";
import { calculateDunbarLayers } from "@/services/dunbarCalculator";
import type { ContactWithMetrics } from "@/services/dataMining";
import { Redirect } from "expo-router";

type AppFlow = 'loading' | 'onboarding' | 'data-mining' | 'locked' | 'ready';

export default function Index() {
  const { me } = useAccount();
  const [flow, setFlow] = useState<AppFlow>('loading');
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const appState = useRef(RNAppState.currentState);
  const auth = useDemoAuth();

  // Check if user needs onboarding (no displayName set)
  useEffect(() => {
    if (me) {
      const root = me.root as any;
      const needsOnboarding = !root?.displayName;
      
      if (needsOnboarding) {
        setFlow('onboarding');
      } else {
        // User has completed onboarding - go straight to ready
        // TODO: Re-enable biometric lock after MVP
        setFlow('ready');
      }
    }
  }, [me]);

  // Handle app state changes for biometric lock
  useEffect(() => {
    const subscription = RNAppState.addEventListener("change", nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App came to foreground - lock if user has completed onboarding
        // TODO: Re-enable after MVP testing
        // if (me && flow !== 'onboarding' && flow !== 'data-mining') {
        //   console.log("App came to foreground - locking");
        //   setFlow('locked');
        // }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [me, flow]);

  // Loading state
  if (me === undefined || flow === 'loading') {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  // No Jazz account - create anonymous account first
  if (!me) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-secondary mt-4">Initializing...</Text>
      </View>
    );
  }

  // User needs onboarding - collect their data
  if (flow === 'onboarding') {
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
          
          // Save onboarding data for data mining screen
          setOnboardingData(data);
          
          // If contacts permission granted, go to data mining
          if (data.hasContactsPermission) {
            setFlow('data-mining');
          } else {
            // Skip data mining, go straight to ready
            setFlow('ready');
          }
        }}
      />
    );
  }

  // Data mining flow
  if (flow === 'data-mining') {
    return (
      <DataMiningScreen
        onComplete={async (contacts: ContactWithMetrics[]) => {
          console.log(`Data mining complete! Imported ${contacts.length} contacts`);
          
          const root = me.root as any;
          
          // Convert ContactWithMetrics to Contact format for Dunbar calculator
          const contactsForCalculation = contacts.map(c => ({
            id: c.id,
            name: c.name,
            phoneNumber: c.phoneNumbers?.[0],
            email: c.emails?.[0],
            isFamily: !!c.potentialFamily,
            familyTier: c.potentialFamily ? 'NUCLEAR' as const : undefined,
            callCount: c.metrics.callFrequency,
            smsCount: c.metrics.smsFrequency,
            totalDuration: c.metrics.totalCallDuration,
            lastInteraction: c.metrics.lastInteraction ? new Date(c.metrics.lastInteraction).toISOString() : undefined,
          }));
          
          // Calculate Dunbar layers
          const contactsWithLayers = await calculateDunbarLayers(contactsForCalculation);
          
          console.log('Dunbar layers calculated');
          
          // Save contacts to Jazz
          // Initialize contacts array if it doesn't exist
          if (!root.contacts) {
            root.contacts = [];
          }
          
          // Map calculated contacts to Jazz Contact schema
          for (const contact of contactsWithLayers) {
            root.contacts.push({
              sourceId: contact.id,
              name: contact.name,
              phoneNumber: contact.phoneNumber,
              email: contact.email,
              dunbarLayer: contact.dunbarLayer,
              interactionScore: contact.interactionScore,
              lastInteraction: contact.lastInteraction,
              interactionFrequency: (contact.callCount || 0) + (contact.smsCount || 0),
              reciprocityScore: contact.reciprocityScore,
              contactInitiationRatio: contact.contactInitiationRatio,
              averageResponseTime: contact.averageResponseTime,
              isFamily: contact.isFamily,
              familyTier: contact.familyTier,
              createdAt: new Date().toISOString(),
            });
          }
          
          console.log(`Saved ${root.contacts.length} contacts to Jazz`);
          
          // Go to ready state (will redirect to dashboard)
          setFlow('ready');
        }}
      />
    );
  }

  // Show biometric lock if needed
  if (flow === 'locked') {
    return (
      <BiometricLock
        onUnlock={() => {
          console.log("App unlocked!");
          setFlow('ready');
        }}
        fallbackPIN="1234" // TODO: Allow user to set their own PIN
      />
    );
  }

  // User is ready - redirect to dashboard
  if (flow === 'ready') {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return null;
}
