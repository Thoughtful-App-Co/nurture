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

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Phone, CalendarBlank, ChatCircle, Lock, SealCheck, ShieldCheck } from 'phosphor-react-native';
import { 
  requestDataMiningPermissions,
  aggregateContactsWithMetrics,
  type FamilyNames,
  type ContactWithMetrics 
} from '@/services/dataMining';

type Step = 'intro' | 'family-names' | 'permissions' | 'analyzing' | 'complete';

interface Props {
  onComplete: (contacts: ContactWithMetrics[]) => void;
}

export function DataMiningScreen({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [familyNames, setFamilyNames] = useState<FamilyNames>({});
  const [progress, setProgress] = useState(0);

  const handleStartAnalysis = async () => {
    setStep('permissions');
    
    // Request permissions
    const permissions = await requestDataMiningPermissions();
    
    if (!permissions.contacts) {
      alert('Contacts permission is required to analyze your relationships.');
      return;
    }

    // Start analysis
    setStep('analyzing');
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Run the actual analysis
      const contacts = await aggregateContactsWithMetrics(familyNames);

      clearInterval(progressInterval);
      setProgress(100);

      // Small delay to show 100%
      setTimeout(() => {
        setStep('complete');
        onComplete(contacts);
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
        <View className="mb-12">
          <Text className="text-4xl text-primary mb-6" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
            Let's Look at Your Garden
          </Text>
          <Text className="text-lg text-white leading-relaxed mb-4">
            We'll analyze your phone to show you who you actually talk to - not who you think you talk to.
          </Text>
          <Text className="text-base text-secondary leading-relaxed">
            This is about behavioral reality, not judgment.{'\n\n'}
            Your relationships form natural layers based on interaction frequency, call duration, and reciprocity.
          </Text>
        </View>

        {/* What we'll analyze */}
        <View className="mb-12 p-6 border border-zinc-800 bg-zinc-900">
          <Text className="text-sm text-secondary font-medium mb-4">
            WHAT WE'LL ANALYZE
          </Text>
          <View className="space-y-4">
            <View className="flex-row items-start">
              <Text className="text-primary text-2xl mr-3">📞</Text>
              <Text className="text-white text-base flex-1 leading-relaxed">
                Voice calls (frequency, duration, who initiates)
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-primary text-2xl mr-3">📅</Text>
              <Text className="text-white text-base flex-1 leading-relaxed">
                Scheduled meetings (calendar events)
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-primary text-2xl mr-3">💬</Text>
              <Text className="text-white text-base flex-1 leading-relaxed">
                Text messages (response time, conversation patterns)
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => setStep('family-names')}
          className="bg-primary py-5 px-6 rounded-none border-2 border-primary"
        >
          <Text className="text-center text-lg font-bold text-black">
            BEGIN ANALYSIS
          </Text>
        </Pressable>

        <View className="mt-8">
          <Text className="text-xs text-secondary text-center leading-relaxed">
            🔒 All data stays encrypted on your device.{'\n'}
            We never see or store your personal information.
          </Text>
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

  // Step 3: Analyzing (with progress)
  if (step === 'analyzing') {
    return (
      <View className="flex-1 bg-black justify-center px-8">
        <View className="mb-12">
          <Text className="text-3xl font-bold text-white mb-6 text-center">
            Analyzing Your Garden
          </Text>
          <Text className="text-base text-secondary text-center leading-relaxed mb-8">
            Reading your contacts and interaction history...
          </Text>

          {/* Progress bar */}
          <View className="mb-4">
            <View className="h-2 bg-zinc-900 border border-zinc-800">
              <View 
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          <Text className="text-center text-primary text-lg font-medium">
            {progress}%
          </Text>
        </View>

        {/* What we're doing */}
        <View className="space-y-4">
          <View className={`flex-row items-center ${progress >= 30 ? 'opacity-100' : 'opacity-30'}`}>
            <ActivityIndicator size="small" color="#22c55e" className="mr-3" />
            <Text className="text-white text-base">Reading contacts...</Text>
          </View>
          <View className={`flex-row items-center ${progress >= 60 ? 'opacity-100' : 'opacity-30'}`}>
            <ActivityIndicator size="small" color="#22c55e" className="mr-3" />
            <Text className="text-white text-base">Analyzing call patterns...</Text>
          </View>
          <View className={`flex-row items-center ${progress >= 90 ? 'opacity-100' : 'opacity-30'}`}>
            <ActivityIndicator size="small" color="#22c55e" className="mr-3" />
            <Text className="text-white text-base">Calculating relationship layers...</Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
}
