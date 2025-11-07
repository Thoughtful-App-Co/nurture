/**
 * Main Entry Point
 * 
 * Handles app initialization and routing based on user state
 * Flow: Onboarding → Data Mining → Biometric Lock → Dashboard
 */

import { Text, View, ActivityIndicator, AppState as RNAppState } from "react-native";
import { useAccount, useDemoAuth } from "jazz-tools/expo";
import { OnboardingFlow } from "@/components/auth/onboarding-flow";
import { BiometricLock } from "@/components/auth/BiometricLock";
import { DataMiningScreen } from "@/components/onboarding/DataMiningScreen";
import { Contact, DataSharingConsent } from "@/jazz/schema";
import { useState, useEffect, useRef } from "react";
import { calculateDunbarLayers } from "@/services/dunbarCalculator";
import type { ContactWithMetrics } from "@/services/dataMining";
import { Redirect } from "expo-router";
import { FeatureFlags } from "@/config/featureFlags";

type AppFlow = 'loading' | 'onboarding' | 'data-mining' | 'locked' | 'ready';

export default function Index() {
  const { me } = useAccount();
  const [flow, setFlow] = useState<AppFlow>('loading');
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const appState = useRef(RNAppState.currentState);
  
  // FEATURE FLAG: Use DemoAuth for testing (creates new accounts on every restart)
  // Set EXPO_PUBLIC_USE_DEMO_AUTH=true in .env to enable
  // WARNING: This will reset your data on every app restart!
  
  // 🔍 DEBUG: Environment variable verification
  console.log('🔍 ENV CHECK:');
  console.log('USE_DEMO_AUTH flag:', FeatureFlags.USE_DEMO_AUTH);
  console.log('Raw env value:', process.env.EXPO_PUBLIC_USE_DEMO_AUTH);
  
  if (FeatureFlags.USE_DEMO_AUTH) {
    useDemoAuth();
    console.warn('⚠️ DEMO AUTH ENABLED - Data will reset on app restart!');
    console.warn('⚠️ Set EXPO_PUBLIC_USE_DEMO_AUTH=false in .env to disable');
  }

  // Check if user needs onboarding (hasCompletedOnboarding flag) or contact analysis
  useEffect(() => {
    if (me) {
      const root = me.root as any;
      const needsOnboarding = !root?.hasCompletedOnboarding;
      const needsContactAnalysis = root?.hasCompletedOnboarding && !root?.hasCompletedContactAnalysis;
      
      // 🔍 DEBUG: Enhanced account and flag logging
      console.log('=== ACCOUNT DEBUG ===');
      console.log('Account ID:', (me as any).id || 'unknown');
      console.log('Account exists:', !!me);
      console.log('Root exists:', !!root);
      console.log('displayName:', root?.displayName);
      console.log('hasCompletedOnboarding:', root?.hasCompletedOnboarding);
      console.log('hasCompletedContactAnalysis:', root?.hasCompletedContactAnalysis);
      console.log('Contacts count:', root?.contacts?.length || 0);
      console.log('needsOnboarding:', needsOnboarding);
      console.log('needsContactAnalysis:', needsContactAnalysis);
      console.log('====================');
      
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
          
          // 🔧 FIX: Give Jazz time to persist the onboarding flag
          console.log('⏳ Waiting for Jazz to persist onboarding data...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 🔍 DEBUG: Verify the flag was saved
          console.log("User data saved:", {
            displayName: root.displayName,
            email: root.email,
            phone: root.phone,
            hasCompletedOnboarding: root.hasCompletedOnboarding,
            dataSharingLevel: data.dataSharingLevel,
          });
          
          if (!root.hasCompletedOnboarding) {
            console.error('⚠️ WARNING: Onboarding flag did not persist!');
          }
          
           // Save onboarding data for data mining screen
           setOnboardingData(data);
           
            // If contacts permission granted, go to data mining
            if (data.hasContactsPermission) {
              setFlow('data-mining');
            } else {
              // User skipped/denied contacts permission - mark as "attempted" so we don't ask again
              console.log('User skipped contacts permission - marking as completed');
              root.$jazz.set('hasCompletedContactAnalysis', true);
              // Show biometric lock setup before going to dashboard
              setFlow('locked');
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
          // 🔧 FIX: Use the existing contacts list from migration
          // Don't create a new list - modify the existing one
          console.log('');
          console.log('=' .repeat(60));
          console.log('📝 SAVING CONTACTS TO JAZZ');
          console.log('=' .repeat(60));
          
          const existingContacts = root.contacts;
          
          // Pre-save diagnostic
          console.log('🔍 PRE-SAVE DIAGNOSTIC:');
          console.log(`  Existing list length: ${existingContacts?.length || 0}`);
          console.log(`  Contacts to add: ${contactsWithLayers.length}`);
          console.log(`  List has $jazz: ${!!(existingContacts as any)?.$jazz}`);
          
          // Clear existing contacts (if any from previous runs)
          if (existingContacts && existingContacts.length > 0) {
            console.log('  ⚠️  Clearing existing contacts...');
            while (existingContacts.length > 0) {
              existingContacts.$jazz.splice(0, 1);
            }
          }
          
          // Add each contact to the EXISTING list
          console.log('  ➕ Adding contacts one by one...');
          let addedCount = 0;
          
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
            
            // Push to existing list (not creating new list!)
            existingContacts.$jazz.push(contactData);
            addedCount++;
            
            // Log progress every 50 contacts
            if (addedCount % 50 === 0) {
              console.log(`    Progress: ${addedCount}/${contactsWithLayers.length}`);
            }
          }
          
          // Post-save diagnostic
          console.log('');
          console.log('🔍 POST-SAVE DIAGNOSTIC:');
          console.log(`  ✅ Added ${addedCount} contacts to Jazz`);
          console.log(`  Final list length: ${existingContacts.length}`);
          console.log(`  First contact: ${existingContacts[0]?.name || 'NONE'}`);
          console.log(`  Last contact: ${existingContacts[existingContacts.length - 1]?.name || 'NONE'}`);
          
          // Sample verification
          if (existingContacts.length >= 3) {
            console.log('  Sample contacts (first 3):');
            existingContacts.slice(0, 3).forEach((c: any, i: number) => {
              console.log(`    ${i + 1}. ${c?.name} - Layer ${c?.dunbarLayer} (score: ${c?.interactionScore})`);
            });
          }
          
          console.log('=' .repeat(60));
          console.log('');
           
            // Mark contact analysis as completed - prevents re-running on app restart
            root.$jazz.set('hasCompletedContactAnalysis', true);
            console.log('✅ Contact analysis marked as completed');
            
            // 🔧 FIX: Give Jazz time to persist the flag to local storage
            // Jazz uses eventual consistency, so we add a small delay
            console.log('⏳ Waiting for Jazz to persist data...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 🔍 DEBUG: Verify the flag was actually saved
            console.log('🔍 Verification after delay:');
            console.log('hasCompletedContactAnalysis:', root.hasCompletedContactAnalysis);
            console.log('Contacts count:', root.contacts?.length || 0);
            
            if (!root.hasCompletedContactAnalysis) {
              console.error('⚠️ WARNING: Flag did not persist! This is a Jazz storage issue.');
            } else {
              console.log('✅ Flag successfully verified in Jazz state');
            }
            
            // Show biometric lock setup before going to dashboard
            setFlow('locked');
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

/**
 * DemoAuthWarningBanner
 * 
 * Visual indicator that DemoAuth is enabled
 * Only shows in development when USE_DEMO_AUTH flag is true
 */
function DemoAuthWarningBanner() {
  if (!FeatureFlags.USE_DEMO_AUTH || !__DEV__) return null;
  
  return (
    <View 
      className="absolute top-0 left-0 right-0 bg-yellow-500 py-2 px-4 z-50"
      style={{ paddingTop: 50 }} // Account for status bar
    >
      <Text className="text-black text-xs font-bold text-center">
        ⚠️ DEMO AUTH ENABLED - Data resets on restart!
      </Text>
      <Text className="text-black text-xs text-center">
        Set EXPO_PUBLIC_USE_DEMO_AUTH=false in .env to disable
      </Text>
    </View>
  );
}
