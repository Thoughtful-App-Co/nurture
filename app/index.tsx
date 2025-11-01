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
import { Contact, ContactList, DataSharingConsent } from "@/jazz/schema";
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

  // Check if user needs onboarding (hasCompletedOnboarding flag) or contact analysis
  useEffect(() => {
    if (me) {
      const root = me.root as any;
      const needsOnboarding = !root?.hasCompletedOnboarding;
      const needsContactAnalysis = root?.hasCompletedOnboarding && !root?.hasCompletedContactAnalysis;
      
      console.log('Flow check:', {
        displayName: root?.displayName,
        hasCompletedOnboarding: root?.hasCompletedOnboarding,
        hasCompletedContactAnalysis: root?.hasCompletedContactAnalysis,
        contactCount: root?.contacts?.length || 0,
        needsOnboarding,
        needsContactAnalysis,
      });
      
      if (needsOnboarding) {
        setFlow('onboarding');
      } else if (needsContactAnalysis) {
        setFlow('data-mining');
      } else {
        // User has completed both onboarding AND contact analysis - go to dashboard
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
          root.$jazz.set('displayName', `${data.firstName} ${data.lastName}`);
          root.$jazz.set('email', data.email);
          root.$jazz.set('phone', data.phone);
          
          // Save data sharing consent if provided
          if (data.dataSharingLevel) {
            const now = new Date().toISOString();
            const dataSharingConsent = DataSharingConsent.create({
              hasConsented: data.dataSharingLevel !== "NONE",
              consentedAt: data.dataSharingLevel !== "NONE" ? now : undefined,
              level: data.dataSharingLevel,
              lastUpdated: now,
            }, me);
            root.$jazz.set('dataSharing', dataSharingConsent);
            
            console.log("Data sharing consent saved:", {
              level: data.dataSharingLevel,
              hasConsented: data.dataSharingLevel !== "NONE",
            });
          }
          
          // CRITICAL: Mark onboarding as completed
          root.$jazz.set('hasCompletedOnboarding', true);
          
          console.log("User data saved:", {
            displayName: root.displayName,
            email: root.email,
            phone: root.phone,
            hasCompletedOnboarding: true,
            dataSharingLevel: data.dataSharingLevel,
          });
          
          // Save onboarding data for data mining screen
          setOnboardingData(data);
          
           // If contacts permission granted, go to data mining
           if (data.hasContactsPermission) {
             setFlow('data-mining');
           } else {
             // User skipped/denied contacts permission - mark as "attempted" so we don't ask again
             console.log('User skipped contacts permission - marking as completed');
             root.$jazz.set('hasCompletedContactAnalysis', true);
             setFlow('ready');
           }
        }}
      />
    );
  }

  // Data mining flow
  if (flow === 'data-mining') {
    const root = me.root as any;
    
    // Debug logging
    console.log('📊 Entering data-mining flow');
    console.log('Has completed analysis?', root?.hasCompletedContactAnalysis);
    console.log('Existing contacts count:', root?.contacts?.length || 0);
    
    const savedFamilyNames = root?.familyNames ? {
      birthLastName: root.familyNames.birthLastName,
      currentLastName: root.familyNames.currentLastName,
      spouseLastName: root.familyNames.spouseLastName,
      otherFamilyNames: root.familyNames.otherFamilyNames,
    } : undefined;
    
    return (
      <DataMiningScreen
        savedFamilyNames={savedFamilyNames}
        onComplete={async (contacts: ContactWithMetrics[], familyNames?: any) => {
          console.log(`Data mining complete! Imported ${contacts.length} contacts`);
          
          const root = me.root as any;
          
          // Save family names if provided
          if (familyNames && (familyNames.birthLastName || familyNames.currentLastName || familyNames.spouseLastName)) {
            console.log('Saving family names to Jazz:', familyNames);
            
            // Always create a new FamilyNames CoMap (can't update existing one directly)
            const { FamilyNames: FamilyNamesSchema } = await import('@/jazz/schema');
            const newFamilyNames = FamilyNamesSchema.create({
              birthLastName: familyNames.birthLastName,
              currentLastName: familyNames.currentLastName,
              spouseLastName: familyNames.spouseLastName,
              otherFamilyNames: familyNames.otherFamilyNames,
            }, me);
            
            root.$jazz.set('familyNames', newFamilyNames);
          }
          
          // Convert ContactWithMetrics to Contact format for Dunbar calculator
          const contactsForCalculation = contacts.map(c => ({
            id: c.id,
            name: c.name,
            phoneNumber: c.phoneNumbers?.[0],
            email: c.emails?.[0],
            isFamily: !!c.potentialFamily,
            familyTier: c.potentialFamily?.tier || undefined,
            callCount: c.metrics.callFrequency,
            smsCount: c.metrics.smsFrequency,
            totalDuration: c.metrics.totalCallDuration,
            lastInteraction: c.metrics.lastInteraction ? new Date(c.metrics.lastInteraction).toISOString() : undefined,
          }));
          
          // Calculate Dunbar layers
          const contactsWithLayers = await calculateDunbarLayers(contactsForCalculation);
          
          console.log('Dunbar layers calculated');
          
          // Save contacts to Jazz
          // Create new ContactList with all contacts
          const newContactsList: any[] = [];
          
          for (const contact of contactsWithLayers) {
            // Find the original contact to get family role
            const originalContact = contacts.find(c => c.id === contact.id);
            
            const contactData = Contact.create({
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
              familyRole: originalContact?.potentialFamily?.role,
              createdAt: new Date().toISOString(),
            }, me);
            
            newContactsList.push(contactData);
          }
          
           // Replace the entire contacts list using $jazz.set
           const newContacts = ContactList.create(newContactsList, me);
           root.$jazz.set('contacts', newContacts);
           
           console.log(`Saved ${newContactsList.length} contacts to Jazz`);
           
           // Mark contact analysis as completed - prevents re-running on app restart
           root.$jazz.set('hasCompletedContactAnalysis', true);
           console.log('✅ Contact analysis marked as completed');
           
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
