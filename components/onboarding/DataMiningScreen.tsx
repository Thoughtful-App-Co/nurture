/**
 * Data Mining Onboarding Screen
 * STORY-006: Request permissions and explain data mining
 * 
 * Flow:
 * 1. Explain what we're going to do
 * 2. Collect family names for smart matching
 * 3. Request permissions
 * 4. Run analysis with progress indicator
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { 
  requestDataMiningPermissions,
  aggregateContactsWithMetrics,
  type FamilyNames,
  type ContactWithMetrics 
} from '@/services/dataMining';
import { DataLimitationsScreen } from './DataLimitationsScreen';
import { runDiagnostics, getDataMiningStatus } from '@/scripts/diagnose-data-mining';
import { isFeatureEnabled } from '@/config/featureFlags';
import { LoadingAnimation } from '@/components/LoadingAnimation';

type Step = 'intro' | 'family-names' | 'permissions' | 'analyzing' | 'limitations' | 'complete';

interface Props {
  onComplete: (contacts: ContactWithMetrics[], familyNames?: FamilyNames) => void;
  savedFamilyNames?: FamilyNames; // Pass in existing family names if they exist
}

export function DataMiningScreen({ onComplete, savedFamilyNames }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [familyNames, setFamilyNames] = useState<FamilyNames>(savedFamilyNames || {});
  const [analysisResults, setAnalysisResults] = useState<{
    contacts: ContactWithMetrics[];
    hasCallData: boolean;
    hasSMSData: boolean;
  } | null>(null);
  const [dataMiningStatus, setDataMiningStatus] = useState(getDataMiningStatus());
  
  // Check if we have saved family names - if so, we can skip the questionnaire
  const hasSavedFamilyNames = savedFamilyNames && (
    savedFamilyNames.birthLastName || 
    savedFamilyNames.currentLastName || 
    savedFamilyNames.spouseLastName
  );

  // Update data mining status on mount
  useEffect(() => {
    setDataMiningStatus(getDataMiningStatus());
  }, []);

  const handleStartAnalysis = async () => {
    setStep('permissions');
    
    // Request permissions
    const permissions = await requestDataMiningPermissions();
    
    if (!permissions.contacts) {
      alert('Contacts permission is required to analyze your relationships.');
      setStep('intro');
      return;
    }

    // Show iOS limitation warning if applicable
    if (Platform.OS === 'ios' && (!permissions.callLog && !permissions.sms)) {
      console.log('iOS: Limited to contacts only - call/SMS data not available');
    }

    // Start analysis
    setStep('analyzing');

    try {
      // Run the actual analysis
      console.log('Running analysis with family names:', familyNames);
      const contacts = await aggregateContactsWithMetrics(familyNames);

      console.log(`Analysis complete: ${contacts.length} contacts processed`);
      
      // Check if we have any interaction data
      const hasInteractionData = contacts.some(c => 
        (c.metrics.callFrequency > 0 || c.metrics.smsFrequency > 0)
      );
      
      if (!hasInteractionData && Platform.OS === 'android') {
        console.warn('⚠️  No interaction data found');
        console.warn('This usually means native modules are not installed');
        console.warn('Run: npx expo run:android to build with native modules');
      }

      // Check if we have interaction data
      const hasCallData = contacts.some(c => c.metrics.callFrequency > 0);
      const hasSMSData = contacts.some(c => c.metrics.smsFrequency > 0);
      
      // Store results
      setAnalysisResults({ contacts, hasCallData, hasSMSData });
      
      // Only show limitations screen if:
      // 1. No interaction data on Android (suggests native modules not built)
      // 2. iOS (expected limitation - no call/SMS access)
      const shouldShowLimitations = 
        (Platform.OS === 'android' && !hasCallData && !hasSMSData) ||
        Platform.OS === 'ios';
      
      // Small delay to show 100%, then either show limitations or complete
      setTimeout(() => {
        if (shouldShowLimitations) {
          setStep('limitations');
        } else {
          setStep('complete');
          onComplete(contacts, familyNames);
        }
      }, 500);

    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
      setStep('intro');
    }
  };

  // Step 1: Introduction
  if (step === 'intro') {
    return (
      <View className="flex-1 bg-black justify-center px-8">
        <View className="mb-8">
          <Text className="text-4xl text-primary mb-4 font-bold tracking-wide">
            Let's Look at Your Garden
          </Text>
          <Text className="text-base text-white leading-relaxed">
            We'll analyze your phone to show you who you <Text className="text-primary font-medium">actually</Text> talk to - not who you think you talk to. This is about behavioral reality, not judgment.{'\n\n'}
            Your relationships form natural layers based on interaction frequency, call duration, and reciprocity.
          </Text>
        </View>

        {/* What we'll analyze */}
        <View className="mb-8 p-4 border border-zinc-800 bg-zinc-900">
          <Text className="text-xs text-secondary font-medium mb-3">
            WHAT WE'LL ANALYZE
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Text className="text-primary text-lg mr-2">📞</Text>
              <Text className="text-white text-sm flex-1">
                Voice calls • frequency, duration, who initiates
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-primary text-lg mr-2">📅</Text>
              <Text className="text-white text-sm flex-1">
                Scheduled meetings • calendar events
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-primary text-lg mr-2">💬</Text>
              <Text className="text-white text-sm flex-1">
                Text messages • response time, patterns
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => {
            // Skip family names collection if we already have them saved
            if (hasSavedFamilyNames) {
              console.log('Using saved family names:', savedFamilyNames);
              handleStartAnalysis();
            } else {
              setStep('family-names');
            }
          }}
          className="bg-primary py-5 px-6 rounded-none border-2 border-primary"
        >
          <Text className="text-center text-lg font-bold text-black">
            BEGIN ANALYSIS
          </Text>
        </Pressable>

        <View className="mt-6">
          <Text className="text-xs text-zinc-500 text-center leading-relaxed">
            🔒 Encrypted on your device • We never see your data
          </Text>
          
          {/* Data Mining Status Indicator */}
          {Platform.OS === 'android' && !dataMiningStatus.canMine && (
            <View className="mt-3 p-3 border border-red-900/50 bg-red-950/20">
              <Text className="text-xs text-red-400 font-semibold mb-1">
                ⚠️ Native Data Mining Unavailable
              </Text>
              <Text className="text-xs text-red-300">
                {dataMiningStatus.reason}
              </Text>
              <Text className="text-xs text-red-200 mt-1">
                Solution: {dataMiningStatus.solution}
              </Text>
            </View>
          )}
          
          {Platform.OS === 'android' && dataMiningStatus.canMine && (
            <View className="mt-3 p-2 border border-green-900/50 bg-green-950/20">
              <Text className="text-xs text-green-400 text-center">
                ✅ Native data mining available
              </Text>
            </View>
          )}
          
          {Platform.OS === 'ios' && (
            <View className="mt-3 p-2 border border-orange-900/50 bg-orange-950/20">
              <Text className="text-xs text-orange-400 text-center">
                ⚠️ iOS: Limited to contact data only
              </Text>
            </View>
          )}

          {/* Diagnostics Button (only in dev mode) */}
          {isFeatureEnabled('SHOW_DATA_MINING_DIAGNOSTICS') && (
            <Pressable
              onPress={() => {
                runDiagnostics();
                // Refresh status after diagnostics
                setTimeout(() => setDataMiningStatus(getDataMiningStatus()), 1000);
              }}
              className="mt-3 p-2 border border-blue-900/50 bg-blue-950/20"
            >
              <Text className="text-xs text-blue-400 text-center">
                🔍 Run Diagnostics (Dev Only)
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // Step 2: Family Names Collection
  if (step === 'family-names') {
    return (
      <ScrollView className="flex-1 bg-black" contentContainerClassName="px-8 py-16">
        <View className="mb-12">
          <Text className="text-3xl font-bold text-white mb-4">
            Help Us Identify Family
          </Text>
          <Text className="text-base text-secondary leading-relaxed">
            We'll use these names to automatically identify potential family members in your contacts.{'\n\n'}
            This is completely optional but helps save time later.
          </Text>
        </View>

        {/* Family name inputs */}
        <View className="space-y-6 mb-8">
          <View>
            <Text className="text-sm text-secondary mb-2 font-medium">
              YOUR BIRTH LAST NAME
            </Text>
            <TextInput
              value={familyNames.birthLastName || ''}
              onChangeText={(text) => setFamilyNames({ ...familyNames, birthLastName: text })}
              placeholder="Smith"
              placeholderTextColor="#475569"
              className="bg-zinc-900 text-white text-lg px-4 py-4 border border-zinc-800 rounded-none"
              autoCapitalize="words"
            />
            <Text className="text-xs text-secondary mt-2">
              Your last name before marriage (if applicable)
            </Text>
          </View>

          <View>
            <Text className="text-sm text-secondary mb-2 font-medium">
              YOUR CURRENT LAST NAME
            </Text>
            <TextInput
              value={familyNames.currentLastName || ''}
              onChangeText={(text) => setFamilyNames({ ...familyNames, currentLastName: text })}
              placeholder="Johnson"
              placeholderTextColor="#475569"
              className="bg-zinc-900 text-white text-lg px-4 py-4 border border-zinc-800 rounded-none"
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text className="text-sm text-secondary mb-2 font-medium">
              SPOUSE'S LAST NAME (OPTIONAL)
            </Text>
            <TextInput
              value={familyNames.spouseLastName || ''}
              onChangeText={(text) => setFamilyNames({ ...familyNames, spouseLastName: text })}
              placeholder="Williams"
              placeholderTextColor="#475569"
              className="bg-zinc-900 text-white text-lg px-4 py-4 border border-zinc-800 rounded-none"
              autoCapitalize="words"
            />
            <Text className="text-xs text-secondary mt-2">
              For identifying in-laws
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleStartAnalysis}
          className="bg-primary py-5 px-6 rounded-none border-2 border-primary mb-4"
        >
          <Text className="text-center text-lg font-bold text-black">
            CONTINUE
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setFamilyNames({});
            handleStartAnalysis();
          }}
          className="py-3"
        >
          <Text className="text-center text-sm text-secondary">
            Skip - I'll do this manually
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  // Step 3: Analyzing (no progress bar, just animation)
  if (step === 'analyzing') {
    return (
      <View className="flex-1 bg-black justify-center px-8">
        <LoadingAnimation 
          message="Analyzing Your Relationships"
          submessage="Reading contacts, call logs, and messages to understand your social garden"
        />
      </View>
    );
  }

  // Step 4: Show limitations and what's missing
  if (step === 'limitations' && analysisResults) {
    return (
      <DataLimitationsScreen
        hasCallData={analysisResults.hasCallData}
        hasSMSData={analysisResults.hasSMSData}
        contactCount={analysisResults.contacts.length}
        onContinue={() => {
          setStep('complete');
          onComplete(analysisResults.contacts, familyNames);
        }}
      />
    );
  }

  return null;
}
