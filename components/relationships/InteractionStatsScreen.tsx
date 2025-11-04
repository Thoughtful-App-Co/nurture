/**
 * Interaction Stats Detail Screen
 * 
 * Comprehensive view of a contact's interaction data and relationship metrics.
 * Separates objective interaction data from subjective sentiment/quality ratings.
 * Provides full transparency on how relationship scores are calculated.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { useAccount } from 'jazz-tools/expo';
import { ManualInteractionLogger } from './ManualInteractionLogger';

interface Contact {
  id?: string;
  name: string;
  dunbarLayer?: number;
  interactionScore?: number;
  lastInteraction?: string;
  interactionFrequency?: number;
  isFamily?: boolean;
  familyTier?: 'NUCLEAR' | 'SECONDARY' | 'TERTIARY';
  familyRole?: string;
  notes?: string;
  cultivationGoal?: 'MAINTAIN' | 'STRENGTHEN' | 'RECONNECT' | 'DEPRIORITIZE';
  phoneNumber?: string;
  email?: string;
  qualityRating?: number;
  // Raw interaction counts
  callCount?: number;
  smsCount?: number;
  totalDuration?: number;
  reciprocityScore?: number;
  contactInitiationRatio?: number;
  averageResponseTime?: number;
}

interface Props {
  contact: Contact;
  onClose: () => void;
  onReanalyze?: () => void;
}

export function InteractionStatsScreen({ contact, onClose, onReanalyze }: Props) {
  const { me } = useAccount();
  const [showInteractionLogger, setShowInteractionLogger] = useState(false);

  // Check if we have interaction data
  const hasInteractionData = (contact.callCount && contact.callCount > 0) || 
                             (contact.smsCount && contact.smsCount > 0);

  // Fetch interactions for this contact from Jazz
  const contactInteractions = useMemo(() => {
    if (!me || !contact.id) return [];
    
    const root = me.root as any;
    const allInteractions = root?.interactions || [];
    
    // Filter interactions for this contact
    return Array.from(allInteractions)
      .filter((interaction: any) => interaction?.contactId === contact.id)
      .sort((a: any, b: any) => {
        // Sort by date descending (newest first)
        const dateA = new Date(a?.date || 0).getTime();
        const dateB = new Date(b?.date || 0).getTime();
        return dateB - dateA;
      });
  }, [me, contact.id]);

  // Calculate layer averages for comparison
  const layerAverages = useMemo(() => {
    if (!me || contact.dunbarLayer === undefined) return null;
    
    const root = me.root as any;
    const allContacts = Array.from(root?.contacts || []);
    
    // Get all contacts in the same layer
    const layerContacts = allContacts.filter(
      (c: any) => c?.dunbarLayer === contact.dunbarLayer && c?.id !== contact.id
    );
    
    if (layerContacts.length === 0) return null;
    
    // Calculate averages
    const avgInteractionScore = layerContacts.reduce((sum: number, c: any) => sum + (c?.interactionScore || 0), 0) / layerContacts.length;
    const avgCallCount = layerContacts.reduce((sum: number, c: any) => sum + (c?.callCount || 0), 0) / layerContacts.length;
    const avgSmsCount = layerContacts.reduce((sum: number, c: any) => sum + (c?.smsCount || 0), 0) / layerContacts.length;
    const avgTotalDuration = layerContacts.reduce((sum: number, c: any) => sum + (c?.totalDuration || 0), 0) / layerContacts.length;
    
    return {
      interactionScore: avgInteractionScore,
      callCount: avgCallCount,
      smsCount: avgSmsCount,
      totalDuration: avgTotalDuration,
      contactCount: layerContacts.length,
    };
  }, [me, contact.dunbarLayer, contact.id]);

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="px-6 pt-12 pb-4 border-b border-zinc-800">
          <Pressable onPress={onClose}>
            <Text className="text-primary text-base mb-4">← Back</Text>
          </Pressable>
          
          <Text className="text-3xl text-white font-bold mb-2">
            Interaction Stats
          </Text>
          <Text className="text-zinc-400 text-base">
            {contact.name}
          </Text>
        </View>

        <ScrollView className="flex-1">
          <View className="px-6 py-6">
            {/* Data Availability Warning */}
            {!hasInteractionData && (
              <View className="bg-orange-950/30 border-2 border-orange-900 p-4 mb-6">
                <View className="flex-row items-center mb-2">
                  <Text className="text-3xl mr-2">⚠️</Text>
                  <Text className="text-orange-400 text-base font-bold">
                    Limited Data Available
                  </Text>
                </View>
                
                <Text className="text-orange-300 text-sm mb-3 leading-relaxed">
                  Call and SMS data not available. This may be because:
                </Text>
                
                <View className="ml-2 mb-3">
                  <Text className="text-orange-300 text-sm mb-1">
                    • You're on iOS (Apple restricts access)
                  </Text>
                  <Text className="text-orange-300 text-sm mb-1">
                    • Permissions not granted on Android
                  </Text>
                  <Text className="text-orange-300 text-sm">
                    • App needs native modules (requires rebuild)
                  </Text>
                </View>
                
                {onReanalyze && (
                  <Pressable 
                    onPress={onReanalyze}
                    className="bg-orange-900 border border-orange-700 p-3"
                  >
                    <Text className="text-white text-center text-sm font-bold">
                      Re-analyze Data
                    </Text>
                  </Pressable>
                )}
                
                <Text className="text-orange-400 text-xs mt-3 italic">
                  💡 Use Manual Interaction Logging below to track your relationships
                </Text>
              </View>
            )}

            {/* Score Breakdown Section */}
            <ScoreBreakdownSection contact={contact} />

            {/* Interaction vs Sentiment Section */}
            <InteractionVsSentimentSection contact={contact} />

            {/* Communication Hierarchy */}
            <CommunicationHierarchySection />

            {/* Interaction Timeline */}
            {(hasInteractionData || contactInteractions.length > 0) && (
              <InteractionTimelineSection 
                contact={contact} 
                interactions={contactInteractions}
              />
            )}

            {/* Comparison View */}
            {layerAverages && (
              <ComparisonViewSection 
                contact={contact}
                layerAverages={layerAverages}
              />
            )}

            {/* Behavioral Patterns */}
            {hasInteractionData && (
              <BehavioralPatternsSection contact={contact} />
            )}

            {/* Manual Interaction Logger */}
            <View className="mt-6 mb-8">
              <Text className="text-sm text-secondary font-medium mb-3">
                MANUAL TRACKING
              </Text>
              
              <Pressable
                onPress={() => setShowInteractionLogger(true)}
                className="bg-primary py-4 px-6"
              >
                <Text className="text-center text-base font-bold text-black">
                  + Log New Interaction
                </Text>
              </Pressable>
              
              <Text className="text-xs text-zinc-500 text-center mt-3">
                Manually track calls, meetings, or social media chats
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Manual Interaction Logger Modal */}
        <ManualInteractionLogger
          visible={showInteractionLogger}
          contact={{
            id: contact.id,
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            email: contact.email,
          }}
          onSave={(interaction) => {
            console.log('Manual interaction logged:', interaction);
            // TODO: Save to Jazz database
            alert(`Interaction logged with ${contact.name}!\n\nType: ${interaction.type}\nQuality: ${interaction.quality}/5`);
            setShowInteractionLogger(false);
          }}
          onClose={() => setShowInteractionLogger(false)}
        />
      </View>
    </Modal>
  );
}

/**
 * Score Breakdown Section
 * Shows transparent calculation of interaction score
 */
function ScoreBreakdownSection({ contact }: { contact: Contact }) {
  const score = contact.interactionScore || 0;
  
  // Calculate score components based on dunbarCalculator.ts algorithm
  const scoreComponents = calculateScoreComponents(contact);
  
  return (
    <View className="mb-6">
      <Text className="text-sm text-secondary font-medium mb-3">
        RELATIONSHIP SCORE
      </Text>
      
      <View className="bg-zinc-900 border-2 border-zinc-800 p-4">
        {/* Overall Score */}
        <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-zinc-800">
          <Text className="text-zinc-400 text-base">Your Score</Text>
          <Text className="text-primary text-4xl font-bold">
            {Math.round(score)}<Text className="text-zinc-500 text-2xl">/100</Text>
          </Text>
        </View>

        {/* Score Components */}
        <Text className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">
          Score Breakdown
        </Text>

        {scoreComponents.map((component, index) => (
          <View 
            key={index}
            className={`mb-3 ${index < scoreComponents.length - 1 ? 'pb-3 border-b border-zinc-800' : ''}`}
          >
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-white text-sm">
                {component.icon} {component.label}
              </Text>
              <Text className="text-primary text-sm font-bold">
                +{Math.round(component.points)} pts
              </Text>
            </View>
            <Text className="text-zinc-500 text-xs">
              {component.description}
            </Text>
          </View>
        ))}

        {/* Total */}
        <View className="mt-4 pt-4 border-t border-zinc-700">
          <Text className="text-zinc-500 text-xs italic leading-relaxed">
            This score combines interaction frequency, call duration, reciprocity, 
            recency, and manual quality ratings to reflect relationship strength.
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Calculate score components for transparency
 * Mirrors the algorithm in dunbarCalculator.ts
 */
function calculateScoreComponents(contact: Contact): Array<{
  label: string;
  icon: string;
  points: number;
  description: string;
}> {
  const components = [];
  
  // Base frequency score (0-30 points)
  const interactionCount = (contact.callCount || 0) + (contact.smsCount || 0);
  let frequencyPoints = 0;
  let frequencyDesc = '';
  
  if (interactionCount > 100) {
    frequencyPoints = 30;
    frequencyDesc = `${interactionCount} interactions (very high activity)`;
  } else if (interactionCount > 50) {
    frequencyPoints = 25;
    frequencyDesc = `${interactionCount} interactions (high activity)`;
  } else if (interactionCount > 20) {
    frequencyPoints = 20;
    frequencyDesc = `${interactionCount} interactions (moderate activity)`;
  } else if (interactionCount > 10) {
    frequencyPoints = 15;
    frequencyDesc = `${interactionCount} interactions (some activity)`;
  } else if (interactionCount > 5) {
    frequencyPoints = 10;
    frequencyDesc = `${interactionCount} interactions (low activity)`;
  } else if (interactionCount > 0) {
    frequencyPoints = 5;
    frequencyDesc = `${interactionCount} interactions (minimal activity)`;
  } else {
    frequencyDesc = 'No recorded interactions';
  }
  
  if (frequencyPoints > 0) {
    components.push({
      label: 'Interaction Frequency',
      icon: '📊',
      points: frequencyPoints,
      description: frequencyDesc,
    });
  }
  
  // Call weight bonus (calls are 5x more valuable than SMS)
  const callWeight = (contact.callCount || 0) * 5;
  const smsWeight = (contact.smsCount || 0);
  const weightedInteractions = callWeight + smsWeight;
  let weightedPoints = 0;
  
  if (weightedInteractions > 200) weightedPoints = 20;
  else if (weightedInteractions > 100) weightedPoints = 15;
  else if (weightedInteractions > 50) weightedPoints = 10;
  else if (weightedInteractions > 20) weightedPoints = 5;
  
  if (weightedPoints > 0) {
    components.push({
      label: 'Call Activity Bonus',
      icon: '📞',
      points: weightedPoints,
      description: `${contact.callCount || 0} calls weighted 5x (calls > texts)`,
    });
  }
  
  // Duration score (0-20 points)
  const avgDuration = (contact.callCount || 0) > 0 
    ? (contact.totalDuration || 0) / (contact.callCount || 1) 
    : 0;
  let durationPoints = 0;
  let durationDesc = '';
  
  if (avgDuration > 600) {
    durationPoints = 20;
    durationDesc = `${Math.round(avgDuration / 60)} min avg (deep conversations)`;
  } else if (avgDuration > 300) {
    durationPoints = 15;
    durationDesc = `${Math.round(avgDuration / 60)} min avg (good depth)`;
  } else if (avgDuration > 120) {
    durationPoints = 10;
    durationDesc = `${Math.round(avgDuration / 60)} min avg (moderate depth)`;
  } else if (avgDuration > 60) {
    durationPoints = 5;
    durationDesc = `${Math.round(avgDuration / 60)} min avg (brief calls)`;
  }
  
  if (durationPoints > 0) {
    components.push({
      label: 'Call Duration',
      icon: '⏱️',
      points: durationPoints,
      description: durationDesc,
    });
  }
  
  // Reciprocity score (0-20 points)
  const totalInitiations = (contact.callCount || 0) + (contact.smsCount || 0);
  if (totalInitiations > 0 && contact.contactInitiationRatio !== undefined) {
    const reciprocity = Math.min(
      contact.contactInitiationRatio,
      1 - contact.contactInitiationRatio
    ) * 2; // 0-1 scale, where 0.5 is perfect balance
    const reciprocityPoints = reciprocity * 20;
    
    if (reciprocityPoints > 0) {
      const balance = Math.round(reciprocity * 100);
      components.push({
        label: 'Communication Balance',
        icon: '🔄',
        points: reciprocityPoints,
        description: `${balance}% reciprocity (${balance > 80 ? 'healthy' : balance > 50 ? 'moderate' : 'one-sided'} balance)`,
      });
    }
  }
  
  // Recency boost (0-10 points)
  if (contact.lastInteraction) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(contact.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
    );
    let recencyPoints = 0;
    let recencyDesc = '';
    
    if (daysSinceContact < 7) {
      recencyPoints = 10;
      recencyDesc = 'Last contact within a week';
    } else if (daysSinceContact < 14) {
      recencyPoints = 8;
      recencyDesc = 'Last contact within 2 weeks';
    } else if (daysSinceContact < 30) {
      recencyPoints = 6;
      recencyDesc = 'Last contact within a month';
    } else if (daysSinceContact < 60) {
      recencyPoints = 4;
      recencyDesc = 'Last contact within 2 months';
    } else if (daysSinceContact < 90) {
      recencyPoints = 2;
      recencyDesc = 'Last contact within 3 months';
    }
    
    if (recencyPoints > 0) {
      components.push({
        label: 'Recent Contact',
        icon: '⏰',
        points: recencyPoints,
        description: recencyDesc,
      });
    }
  }
  
  // Family boost
  if (contact.isFamily) {
    let familyPoints = 0;
    let familyDesc = '';
    
    if (contact.familyTier === 'NUCLEAR') {
      familyPoints = 15;
      familyDesc = `Nuclear family${contact.familyRole ? ` (${contact.familyRole})` : ''}`;
    } else if (contact.familyTier === 'SECONDARY') {
      familyPoints = 10;
      familyDesc = `Close family${contact.familyRole ? ` (${contact.familyRole})` : ''}`;
    } else if (contact.familyTier === 'TERTIARY') {
      familyPoints = 5;
      familyDesc = `Extended family${contact.familyRole ? ` (${contact.familyRole})` : ''}`;
    }
    
    if (familyPoints > 0) {
      components.push({
        label: 'Family Connection',
        icon: '👨‍👩‍👧‍👦',
        points: familyPoints,
        description: familyDesc,
      });
    }
  }
  
  // Quality rating boost
  if (contact.qualityRating) {
    const qualityPoints = (contact.qualityRating - 1) * 3.75;
    components.push({
      label: 'Quality Rating',
      icon: '⭐',
      points: qualityPoints,
      description: `${contact.qualityRating}/5 stars from your manual logs`,
    });
  }
  
  return components;
}

/**
 * Interaction vs Sentiment Section
 * Separates objective data from subjective feelings
 */
function InteractionVsSentimentSection({ contact }: { contact: Contact }) {
  return (
    <View className="mb-6">
      <Text className="text-sm text-secondary font-medium mb-3">
        OBJECTIVE DATA VS YOUR FEELINGS
      </Text>
      
      <View className="flex-row gap-3">
        {/* Objective Interaction Data */}
        <View className="flex-1 bg-blue-950/30 border-2 border-blue-900 p-4">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">📊</Text>
            <Text className="text-blue-400 text-sm font-bold">
              INTERACTION DATA
            </Text>
          </View>
          
          <Text className="text-blue-300 text-xs mb-3">
            What actually happened
          </Text>
          
          <View className="space-y-2">
            <DataRow 
              label="Calls" 
              value={contact.callCount || 0} 
            />
            <DataRow 
              label="Texts" 
              value={contact.smsCount || 0} 
            />
            {contact.totalDuration !== undefined && contact.totalDuration > 0 && (
              <DataRow 
                label="Total time" 
                value={`${Math.round((contact.totalDuration || 0) / 60)} min`} 
              />
            )}
          </View>
          
          <Text className="text-blue-400 text-xs mt-3 italic">
            From your device logs
          </Text>
        </View>

        {/* Subjective Sentiment */}
        <View className="flex-1 bg-purple-950/30 border-2 border-purple-900 p-4">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">💭</Text>
            <Text className="text-purple-400 text-sm font-bold">
              YOUR SENTIMENT
            </Text>
          </View>
          
          <Text className="text-purple-300 text-xs mb-3">
            How you feel about them
          </Text>
          
          <View className="space-y-2">
            {contact.qualityRating && (
              <View className="mb-2">
                <Text className="text-purple-300 text-xs">Quality</Text>
                <Text className="text-purple-100 text-sm font-medium">
                  {'⭐'.repeat(Math.round(contact.qualityRating))}
                </Text>
              </View>
            )}
            
            {contact.cultivationGoal && (
              <View className="mb-2">
                <Text className="text-purple-300 text-xs">Goal</Text>
                <Text className="text-purple-100 text-sm font-medium">
                  {contact.cultivationGoal}
                </Text>
              </View>
            )}
            
            {contact.dunbarLayer !== undefined && (
              <View className="mb-2">
                <Text className="text-purple-300 text-xs">Layer</Text>
                <Text className="text-purple-100 text-sm font-medium">
                  {['Loved Ones', 'Inner Circle', 'Clan', 'Tribe', 'Acquaintances', 'Social Nebula'][contact.dunbarLayer]}
                </Text>
              </View>
            )}
          </View>
          
          <Text className="text-purple-400 text-xs mt-3 italic">
            From your manual input
          </Text>
        </View>
      </View>
      
      <View className="mt-3 p-3 bg-zinc-900/50 border border-zinc-800">
        <Text className="text-xs text-zinc-400 leading-relaxed">
          💡 Your feelings may differ from the data. That's normal! 
          Use manual quality ratings to influence the algorithm.
        </Text>
      </View>
    </View>
  );
}

/**
 * Helper component for data rows
 */
function DataRow({ label, value }: { label: string; value: number | string }) {
  return (
    <View className="flex-row justify-between items-center mb-1">
      <Text className="text-zinc-400 text-xs">{label}</Text>
      <Text className="text-white text-sm font-medium">{value}</Text>
    </View>
  );
}

/**
 * Communication Hierarchy Section
 * Shows weight visualization for different communication types
 */
function CommunicationHierarchySection() {
  const communicationTypes = [
    { label: 'Face-to-Face', weight: 10, color: '#22c55e' },
    { label: 'Voice Call', weight: 5, color: '#3b82f6' },
    { label: 'Video Call', weight: 4, color: '#8b5cf6' },
    { label: 'Text/SMS', weight: 1, color: '#eab308' },
    { label: 'Social Media', weight: 0.5, color: '#71717a' },
  ];
  
  return (
    <View className="mb-6">
      <Text className="text-sm text-secondary font-medium mb-3">
        COMMUNICATION HIERARCHY
      </Text>
      
      <View className="bg-zinc-900 border-2 border-zinc-800 p-4">
        <Text className="text-zinc-400 text-xs mb-4">
          Not all communication is equal. Deeper forms build stronger relationships.
        </Text>
        
        {communicationTypes.map((type, index) => (
          <View 
            key={index}
            className={`mb-3 ${index < communicationTypes.length - 1 ? 'pb-3 border-b border-zinc-800' : ''}`}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-sm">{type.label}</Text>
              <Text className="text-zinc-400 text-xs">
                {type.weight}x weight
              </Text>
            </View>
            
            <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${(type.weight / 10) * 100}%`,
                  backgroundColor: type.color,
                }}
              />
            </View>
          </View>
        ))}
        
        <View className="mt-3 pt-3 border-t border-zinc-800">
          <Text className="text-xs text-zinc-500 italic">
            A 10-minute call = 5 text messages in relationship value
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Interaction Timeline Section
 * Shows recent interactions grouped by type with actual logs
 */
function InteractionTimelineSection({ contact, interactions }: { contact: Contact; interactions: any[] }) {
  const hasData = (contact.callCount || 0) > 0 || (contact.smsCount || 0) > 0 || interactions.length > 0;
  
  if (!hasData) return null;
  
  // Group interactions by time period
  const groupedInteractions = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    return {
      today: interactions.filter((i: any) => new Date(i?.date || 0).getTime() > oneDayAgo),
      thisWeek: interactions.filter((i: any) => {
        const time = new Date(i?.date || 0).getTime();
        return time <= oneDayAgo && time > oneWeekAgo;
      }),
      thisMonth: interactions.filter((i: any) => {
        const time = new Date(i?.date || 0).getTime();
        return time <= oneWeekAgo && time > oneMonthAgo;
      }),
      older: interactions.filter((i: any) => new Date(i?.date || 0).getTime() <= oneMonthAgo),
    };
  }, [interactions]);
  
  // Helper to render interaction icon
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'face-to-face': return '🤝';
      case 'call': return '📞';
      case 'text': return '💬';
      case 'video': return '📹';
      case 'email': return '📧';
      case 'social-media': return '💭';
      default: return '💬';
    }
  };
  
  // Helper to format interaction type
  const formatType = (type: string) => {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };
  
  return (
    <View className="mb-6">
      <Text className="text-sm text-secondary font-medium mb-3">
        INTERACTION TIMELINE
      </Text>
      
      <View className="bg-zinc-900 border-2 border-zinc-800 p-4">
        {/* Summary Stats */}
        <View className="mb-4 pb-4 border-b border-zinc-800">
          <Text className="text-zinc-400 text-xs mb-3">
            Last 3 months summary
          </Text>
          
          <View className="flex-row justify-between">
            {contact.callCount && contact.callCount > 0 && (
              <View>
                <Text className="text-zinc-400 text-xs">Calls</Text>
                <Text className="text-primary text-lg font-bold">{contact.callCount}</Text>
              </View>
            )}
            
            {contact.smsCount && contact.smsCount > 0 && (
              <View>
                <Text className="text-zinc-400 text-xs">Texts</Text>
                <Text className="text-primary text-lg font-bold">{contact.smsCount}</Text>
              </View>
            )}
            
            {contact.totalDuration && contact.totalDuration > 0 && (
              <View>
                <Text className="text-zinc-400 text-xs">Duration</Text>
                <Text className="text-primary text-lg font-bold">
                  {Math.floor((contact.totalDuration || 0) / 60)}m
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Manual Interaction Logs */}
        {interactions.length > 0 ? (
          <>
            <Text className="text-zinc-400 text-xs mb-3">
              Recent manually logged interactions
            </Text>
            
            {/* Today */}
            {groupedInteractions.today.length > 0 && (
              <View className="mb-3">
                <Text className="text-zinc-500 text-xs font-semibold mb-2">TODAY</Text>
                {groupedInteractions.today.map((interaction: any, index: number) => (
                  <InteractionLogItem key={index} interaction={interaction} getIcon={getInteractionIcon} formatType={formatType} />
                ))}
              </View>
            )}
            
            {/* This Week */}
            {groupedInteractions.thisWeek.length > 0 && (
              <View className="mb-3">
                <Text className="text-zinc-500 text-xs font-semibold mb-2">THIS WEEK</Text>
                {groupedInteractions.thisWeek.map((interaction: any, index: number) => (
                  <InteractionLogItem key={index} interaction={interaction} getIcon={getInteractionIcon} formatType={formatType} />
                ))}
              </View>
            )}
            
            {/* This Month */}
            {groupedInteractions.thisMonth.length > 0 && (
              <View className="mb-3">
                <Text className="text-zinc-500 text-xs font-semibold mb-2">THIS MONTH</Text>
                {groupedInteractions.thisMonth.map((interaction: any, index: number) => (
                  <InteractionLogItem key={index} interaction={interaction} getIcon={getInteractionIcon} formatType={formatType} />
                ))}
              </View>
            )}
            
            {/* Older */}
            {groupedInteractions.older.length > 0 && (
              <View>
                <Text className="text-zinc-500 text-xs font-semibold mb-2">OLDER</Text>
                {groupedInteractions.older.slice(0, 5).map((interaction: any, index: number) => (
                  <InteractionLogItem key={index} interaction={interaction} getIcon={getInteractionIcon} formatType={formatType} />
                ))}
                {groupedInteractions.older.length > 5 && (
                  <Text className="text-zinc-500 text-xs italic mt-2">
                    + {groupedInteractions.older.length - 5} more older interactions
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <Text className="text-zinc-500 text-sm italic">
            No manually logged interactions yet. Use the "Log Interaction" button below to start tracking.
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * Helper component to render individual interaction log item
 */
function InteractionLogItem({ 
  interaction, 
  getIcon, 
  formatType 
}: { 
  interaction: any; 
  getIcon: (type: string) => string; 
  formatType: (type: string) => string;
}) {
  return (
    <View className="flex-row items-center py-2 border-b border-zinc-800 last:border-b-0">
      <Text className="text-xl mr-3">{getIcon(interaction.type)}</Text>
      
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-white text-sm font-medium">
            {formatType(interaction.type)}
          </Text>
          <Text className="text-zinc-500 text-xs">
            {formatLastInteraction(interaction.date)}
          </Text>
        </View>
        
        {interaction.duration && (
          <Text className="text-zinc-400 text-xs">
            Duration: {interaction.duration} min
          </Text>
        )}
        
        {interaction.quality && (
          <View className="flex-row items-center mt-1">
            <Text className="text-yellow-400 text-xs">
              {'⭐'.repeat(interaction.quality)}
            </Text>
          </View>
        )}
        
        {interaction.notes && (
          <Text className="text-zinc-500 text-xs mt-1 italic" numberOfLines={2}>
            "{interaction.notes}"
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * Behavioral Patterns Section
 * Shows who initiates, response times, etc.
 */
function BehavioralPatternsSection({ contact }: { contact: Contact }) {
  const hasPatternData = contact.contactInitiationRatio !== undefined || 
                         contact.averageResponseTime !== undefined;
  
  if (!hasPatternData) return null;
  
  return (
    <View className="mb-6">
      <Text className="text-sm text-secondary font-medium mb-3">
        COMMUNICATION PATTERNS
      </Text>
      
      <View className="bg-zinc-900 border-2 border-zinc-800 p-4">
        {contact.contactInitiationRatio !== undefined && (
          <View className="mb-4">
            <Text className="text-white text-sm font-medium mb-2">
              Who Initiates Contact?
            </Text>
            
            <View className="flex-row mb-2">
              <View className="flex-1 mr-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-zinc-400 text-xs">You</Text>
                  <Text className="text-zinc-400 text-xs">
                    {Math.round(contact.contactInitiationRatio * 100)}%
                  </Text>
                </View>
                <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full bg-primary"
                    style={{ 
                      width: `${contact.contactInitiationRatio * 100}%`,
                    }}
                  />
                </View>
              </View>
              
              <View className="flex-1 ml-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-zinc-400 text-xs">Them</Text>
                  <Text className="text-zinc-400 text-xs">
                    {Math.round((1 - contact.contactInitiationRatio) * 100)}%
                  </Text>
                </View>
                <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full bg-blue-500"
                    style={{ 
                      width: `${(1 - contact.contactInitiationRatio) * 100}%`,
                    }}
                  />
                </View>
              </View>
            </View>
            
            <Text className="text-zinc-500 text-xs mt-2">
              {contact.contactInitiationRatio > 0.7 
                ? '⚠️ You initiate most contacts - consider if this feels balanced'
                : contact.contactInitiationRatio < 0.3
                ? '💡 They reach out often - they value this relationship'
                : '✅ Healthy balance of mutual initiation'}
            </Text>
          </View>
        )}
        
        {contact.averageResponseTime !== undefined && contact.averageResponseTime > 0 && (
          <View className="pt-4 border-t border-zinc-800">
            <Text className="text-white text-sm font-medium mb-2">
              Response Time
            </Text>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-400 text-sm">Average</Text>
              <Text className="text-primary text-sm font-bold">
                {Math.floor((contact.averageResponseTime || 0) / 3600)}h {Math.floor(((contact.averageResponseTime || 0) % 3600) / 60)}m
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Comparison View Section
 * Shows how this contact compares to layer averages
 */
function ComparisonViewSection({ 
  contact, 
  layerAverages 
}: { 
  contact: Contact; 
  layerAverages: {
    interactionScore: number;
    callCount: number;
    smsCount: number;
    totalDuration: number;
    contactCount: number;
  };
}) {
  const layerNames = ['Loved Ones', 'Inner Circle', 'Clan', 'Tribe', 'Acquaintances', 'Social Nebula'];
  const layerName = layerNames[contact.dunbarLayer || 5];
  
  // Calculate comparison percentages
  const scoreComparison = ((contact.interactionScore || 0) / layerAverages.interactionScore) * 100;
  const callComparison = ((contact.callCount || 0) / (layerAverages.callCount || 1)) * 100;
  const smsComparison = ((contact.smsCount || 0) / (layerAverages.smsCount || 1)) * 100;
  const durationComparison = ((contact.totalDuration || 0) / (layerAverages.totalDuration || 1)) * 100;
  
  return (
    <View className="mb-6">
      <Text className="text-sm text-secondary font-medium mb-3">
        COMPARISON TO {layerName.toUpperCase()}
      </Text>
      
      <View className="bg-zinc-900 border-2 border-zinc-800 p-4">
        <Text className="text-zinc-400 text-xs mb-4">
          Compared to {layerAverages.contactCount} other {layerAverages.contactCount === 1 ? 'contact' : 'contacts'} in your {layerName}
        </Text>
        
        {/* Overall Score Comparison */}
        <View className="mb-4 pb-4 border-b border-zinc-800">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-sm font-medium">Overall Score</Text>
            <Text className={`text-sm font-bold ${
              scoreComparison > 100 ? 'text-primary' : 
              scoreComparison > 80 ? 'text-blue-400' : 
              'text-zinc-400'
            }`}>
              {scoreComparison > 100 ? `${Math.round(scoreComparison - 100)}% above` : 
               scoreComparison < 100 ? `${Math.round(100 - scoreComparison)}% below` : 
               'Average'}
            </Text>
          </View>
          
          <View className="flex-row items-center gap-2">
            <View className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
              <View 
                className={`h-full rounded-full ${
                  scoreComparison > 100 ? 'bg-primary' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(scoreComparison, 100)}%` }}
              />
            </View>
            <Text className="text-zinc-500 text-xs w-16 text-right">
              {Math.round(scoreComparison)}%
            </Text>
          </View>
          
          {scoreComparison > 150 && (
            <Text className="text-primary text-xs mt-2">
              ⭐ You interact with {contact.name} much more than your average {layerName} contact
            </Text>
          )}
        </View>
        
        {/* Calls Comparison */}
        {(contact.callCount || 0) > 0 && (
          <View className="mb-4 pb-4 border-b border-zinc-800">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-sm">📞 Calls</Text>
              <Text className="text-zinc-400 text-sm">
                {contact.callCount} vs {Math.round(layerAverages.callCount)} avg
              </Text>
            </View>
            
            <View className="flex-row items-center gap-2">
              <View className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${Math.min(callComparison, 100)}%` }}
                />
              </View>
              <Text className="text-zinc-500 text-xs w-16 text-right">
                {Math.round(callComparison)}%
              </Text>
            </View>
            
            {callComparison > 200 && (
              <Text className="text-blue-400 text-xs mt-1">
                {Math.round(callComparison / 100)}x more calls than average
              </Text>
            )}
          </View>
        )}
        
        {/* Duration Comparison */}
        {(contact.totalDuration || 0) > 0 && (
          <View className="mb-4 pb-4 border-b border-zinc-800">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-sm">⏱️ Call Duration</Text>
              <Text className="text-zinc-400 text-sm">
                {Math.round((contact.totalDuration || 0) / 60)} min vs {Math.round(layerAverages.totalDuration / 60)} avg
              </Text>
            </View>
            
            <View className="flex-row items-center gap-2">
              <View className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${Math.min(durationComparison, 100)}%` }}
                />
              </View>
              <Text className="text-zinc-500 text-xs w-16 text-right">
                {Math.round(durationComparison)}%
              </Text>
            </View>
          </View>
        )}
        
        {/* SMS Comparison */}
        {(contact.smsCount || 0) > 0 && (
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-sm">💬 Texts</Text>
              <Text className="text-zinc-400 text-sm">
                {contact.smsCount} vs {Math.round(layerAverages.smsCount)} avg
              </Text>
            </View>
            
            <View className="flex-row items-center gap-2">
              <View className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full bg-yellow-500"
                  style={{ width: `${Math.min(smsComparison, 100)}%` }}
                />
              </View>
              <Text className="text-zinc-500 text-xs w-16 text-right">
                {Math.round(smsComparison)}%
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Format last interaction date
 */
function formatLastInteraction(date?: string): string {
  if (!date) return 'No recent contact';
  
  const daysAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
  if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`;
  return `${Math.floor(daysAgo / 365)} years ago`;
}
