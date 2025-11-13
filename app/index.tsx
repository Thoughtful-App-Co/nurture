/**
 * Main Entry Point
 * 
 * Handles app initialization and routing based on user state
 * Flow: Onboarding → Data Mining → Biometric Lock → Dashboard
 */

import { Text, View, ActivityIndicator, AppState as RNAppState, Pressable } from "react-native";
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

interface OnboardingData {
  firstName: string;
  lastName: string;
  birthYear?: number;
  email: string;
  phone: string;
  hasContactsPermission: boolean;
  dataSharingLevel?: "NONE" | "ANONYMIZED" | "FULL";
}

export default function Index() {
  // Performance optimization: Use $each to batch-load all contacts in one operation
  const me = useAccount(undefined, {
    resolve: {
      root: {
        contacts: { $each: true },
        dashboardSummary: true,
      }
    }
  });
  const [flow, setFlow] = useState<AppFlow>('loading');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const appState = useRef(RNAppState.currentState);
  const [hasCheckedFlow, setHasCheckedFlow] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
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
    if (!me?.$isLoaded) return;
    
    const root = me.$isLoaded ? (me.root as any) : null;
    
    // Wait for root to fully load before checking flags
    // Jazz CoValues load lazily, so we need to ensure root is actually loaded
    if (!root) {
      console.log('⏳ Waiting for root to load...');
      return;
    }
    
    // 🔧 FIX: Add a delay to allow Jazz CoValues to lazy-load
    // Jazz loads account first, then lazy-loads nested CoValues like contacts and familyNames
    // Without this delay, contacts.length will be 0 even if contacts exist in storage
    console.log('⏳ Waiting 500ms for Jazz CoValues to load...');
    const checkFlowTimer = setTimeout(() => {
      const needsOnboarding = !root?.hasCompletedOnboarding;
      const needsContactAnalysis = root?.hasCompletedOnboarding && !root?.hasCompletedContactAnalysis;
      
      // 🔍 DEBUG: Enhanced account and flag logging
      console.log('=== ACCOUNT DEBUG (after delay) ===');
      console.log('Account ID:', (me as any).id || 'unknown');
      console.log('Account exists:', !!me);
      console.log('Root exists:', !!root);
      console.log('displayName:', root?.displayName);
      console.log('hasCompletedOnboarding:', root?.hasCompletedOnboarding);
      console.log('hasCompletedContactAnalysis:', root?.hasCompletedContactAnalysis);
      console.log('Contacts reference exists:', !!root?.contacts);
      console.log('Contacts type:', typeof root?.contacts);
      console.log('Contacts length:', root?.contacts?.length || 0);
      
      // Try to inspect first contact
      if (root?.contacts && root.contacts.length > 0) {
        const firstContact = root.contacts[0];
        console.log('First contact exists:', !!firstContact);
        console.log('First contact name:', firstContact?.name);
      }
      
      console.log('Family names exist:', !!root?.familyNames);
      if (root?.familyNames) {
        console.log('  Birth last name:', root.familyNames.birthLastName);
        console.log('  Current last name:', root.familyNames.currentLastName);
      }
      
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
    }, 500); // Wait 500ms for Jazz to load CoValues
    
    // Cleanup timeout on unmount
    return () => clearTimeout(checkFlowTimer);
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
          if (!me.$isLoaded) {
            console.error("Account not loaded during onboarding completion");
            return;
          }
          const root = me.root as any;
          
          // Update the user profile with onboarding data
          root.$jazz.set('displayName', `${data.firstName} ${data.lastName}`);
          root.$jazz.set('email', data.email);
          root.$jazz.set('phone', data.phone);
          
          // Save data sharing consent if provided
          if (data.dataSharingLevel && me.$isLoaded) {
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
    if (!me.$isLoaded) {
      return (
        <View className="flex-1 bg-black justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      );
    }
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
        onComplete={async (contacts: ContactWithMetrics[], familyNames?: { birthLastName?: string; currentLastName?: string; spouseLastName?: string; otherFamilyNames?: string[] }) => {
          console.log(`Data mining complete! Imported ${contacts.length} contacts`);
          
          if (!me.$isLoaded) {
            console.error("Account not loaded during data mining completion");
            return;
          }
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
          
          console.log('=' .repeat(60));
          console.log('💾 SAVING CONTACTS (OPTIMIZED)');
          console.log('=' .repeat(60));
          
          // Initialize layer lists
          const { ContactSummary, ContactSummaryList, DashboardSummary } = await import('@/jazz/schema');
          
          console.log('Creating layer-specific lists...');
          const layerLists = [
            ContactSummaryList.create([], me), // Layer 0
            ContactSummaryList.create([], me), // Layer 1
            ContactSummaryList.create([], me), // Layer 2
            ContactSummaryList.create([], me), // Layer 3
            ContactSummaryList.create([], me), // Layer 4
            ContactSummaryList.create([], me), // Layer 5
          ];
          
          // CONCURRENT: Create all contact summaries in parallel
          console.log(`Creating ${contactsWithLayers.length} contact summaries concurrently...`);
          
          const summaryPromises = contactsWithLayers.map(async (contact, index) => {
            const originalContact = contacts.find(c => c.id === contact.id);
            
            return {
              summary: ContactSummary.create({
                sourceId: contact.id,
                name: contact.name,
                dunbarLayer: contact.dunbarLayer,
                lastInteraction: contact.lastInteraction,
                interactionScore: contact.interactionScore,
                isFamily: contact.isFamily,
                familyTier: contact.familyTier,
                familyRole: originalContact?.potentialFamily?.role,
                relationshipType: contact.isFamily ? 'FAMILY' : undefined,
                quickSortStatus: "not_sorted",
                fullContactId: contact.id || `contact-${Date.now()}-${index}`,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              }, me),
              layer: contact.dunbarLayer || 5
            };
          });
          
          // Wait for all summaries to be created
          const createdSummaries = await Promise.all(summaryPromises);
          
          console.log(`✅ Created ${createdSummaries.length} summaries concurrently`);
          
          // Add summaries to appropriate layer lists
          console.log('Organizing into layers...');
          createdSummaries.forEach(({ summary, layer }) => {
            layerLists[layer].$jazz.push(summary);
          });
          
          // Save layer lists to profile
          root.$jazz.set('layer0Contacts', layerLists[0]);
          root.$jazz.set('layer1Contacts', layerLists[1]);
          root.$jazz.set('layer2Contacts', layerLists[2]);
          root.$jazz.set('layer3Contacts', layerLists[3]);
          root.$jazz.set('layer4Contacts', layerLists[4]);
          root.$jazz.set('layer5Contacts', layerLists[5]);
          
          console.log('✅ Saved to layer lists:');
          layerLists.forEach((list, i) => {
            console.log(`   Layer ${i}: ${list.length} contacts`);
          });
          
          // Create and save dashboard summary
          const layerCounts = layerLists.map(list => list.length);
          const totalContacts = layerCounts.reduce((sum, count) => sum + count, 0);
          
          const summary = DashboardSummary.create({
            totalContacts,
            layer0Count: layerCounts[0],
            layer1Count: layerCounts[1],
            layer2Count: layerCounts[2],
            layer3Count: layerCounts[3],
            layer4Count: layerCounts[4],
            layer5Count: layerCounts[5],
            hiddenCount: 0,
            unsortedCount: totalContacts,
            lastUpdated: new Date().toISOString(),
          }, me);
          
          root.$jazz.set('dashboardSummary', summary);
          console.log('✅ Dashboard summary saved');
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
    return (
      <>
        <Redirect href="/(tabs)/dashboard" />
        {FeatureFlags.SHOW_STATE_DEBUG_PANEL && <DiagnosticPanel me={me} />}
      </>
    );
  }

  return (
    <>
      {flow === 'loading' && (
        <View className="flex-1 bg-black justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="text-secondary mt-4">Loading...</Text>
        </View>
      )}
      {FeatureFlags.SHOW_STATE_DEBUG_PANEL && <DiagnosticPanel me={me} />}
    </>
  );
}

/**
 * DiagnosticPanel
 * 
 * Real-time display of Jazz data loading state
 * Shows contacts count, flags, and loading indicators
 */
function DiagnosticPanel({ me }: { me: any }) {
  if (!__DEV__) return null;
  
  const [expanded, setExpanded] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Force re-render every second to show real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount(c => c + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const root = me?.$isLoaded ? me.root as any : null;
  const contactsCount = root?.contacts?.length || 0;
  const hasCompletedAnalysis = root?.hasCompletedContactAnalysis;
  
  return (
    <View className="absolute bottom-0 left-0 right-0 z-50">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="bg-purple-900 border-t-2 border-purple-500 p-2"
      >
        <Text className="text-purple-200 text-xs font-mono text-center">
          🔧 {expanded ? 'Hide' : 'Show'} Diagnostics | Contacts: {contactsCount} | Flag: {hasCompletedAnalysis ? '✅' : '❌'}
        </Text>
      </Pressable>
      
      {expanded && (
        <View className="bg-purple-950 border-t-2 border-purple-500 p-4">
          <Text className="text-purple-200 text-xs font-mono mb-2">
            🔄 Refresh #{refreshCount} (updates every 1s)
          </Text>
          <Text className="text-purple-200 text-xs font-mono">
            Account: {me ? (me as any).id || 'loading...' : 'none'}
          </Text>
          <Text className="text-purple-200 text-xs font-mono">
            Root exists: {root ? '✅' : '❌'}
          </Text>
          <Text className="text-purple-200 text-xs font-mono">
            Display name: {root?.displayName || '(none)'}
          </Text>
          <Text className="text-purple-200 text-xs font-mono">
            hasCompletedOnboarding: {root?.hasCompletedOnboarding ? '✅' : '❌'}
          </Text>
          <Text className="text-purple-200 text-xs font-mono">
            hasCompletedContactAnalysis: {hasCompletedAnalysis ? '✅' : '❌'}
          </Text>
          <Text className="text-purple-200 text-xs font-mono">
            Contacts ref exists: {root?.contacts ? '✅' : '❌'}
          </Text>
          <Text className="text-purple-200 text-xs font-mono">
            Contacts length: {contactsCount}
          </Text>
          <Text className="text-purple-200 text-xs font-mono">
            Family names exist: {root?.familyNames ? '✅' : '❌'}
          </Text>
          {root?.familyNames && (
            <Text className="text-purple-200 text-xs font-mono">
              Family: {root.familyNames.currentLastName || '(none)'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
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
