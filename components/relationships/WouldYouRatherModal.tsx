/**
 * Would You Rather Modal
 * 
 * Gamified pairwise comparison interface for resolving Dunbar violations.
 * Shows two contact cards side-by-side with a question prompt.
 * 
 * Features:
 * - Card-based comparison (tap left or right)
 * - Progress tracking
 * - Skip functionality (counts as tie)
 * - Resumable sessions (saves to Jazz after each comparison)
 * - Confirmation bias alerts
 * - Celebratory completion
 * 
 * Based on STORY-016: Would You Rather - Forced Ranking Tool
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { useAccount } from "jazz-tools/expo";
import { Card, Button } from "@/components/ui";
import { 
  RankingSession, 
  RankingSessionList,
  Comparison,
  ComparisonList,
  Contact,
  ContactList,
} from "@/jazz/schema";
import { 
  initializeRanking,
  getNextPair,
  recordComparison,
  finalizeRanking,
  detectContradiction,
  calculateProgress,
  type RankingState,
  type ComparisonResult,
} from "@/services/rankingAlgorithm";
import { getRotatedQuestion } from "@/services/questionBank";
import { 
  reallocateContacts,
  generateReallocationSummary,
  trackLayerReallocation,
} from "@/services/layerReallocation";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface WouldYouRatherModalProps {
  visible: boolean;
  onClose: () => void;
  onRefresh?: () => void; // Callback to refresh dashboard after contact updates
  contacts: any[]; // Contacts in violated layer
  violatedLayer: number;
  violatedLayerName: string;
  layerCapacity: number;
}

export function WouldYouRatherModal({
  visible,
  onClose,
  onRefresh,
  contacts,
  violatedLayer,
  violatedLayerName,
  layerCapacity,
}: WouldYouRatherModalProps) {
  const { me } = useAccount();
  
  // Ranking state
  const [rankingState, setRankingState] = useState<RankingState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [comparisonStartTime, setComparisonStartTime] = useState<number>(0);
  
  // UI state
  const [isComplete, setIsComplete] = useState(false);
  const [selectedCard, setSelectedCard] = useState<"left" | "right" | null>(null);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleLeft = useRef(new Animated.Value(1)).current;
  const scaleRight = useRef(new Animated.Value(1)).current;
  
  // Session tracking (local state - will save to Jazz at end)
  const [skipCount, setSkipCount] = useState(0);
  const [contradictionCount, setContradictionCount] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  
  // Timeout state
  const [initializationTimeout, setInitializationTimeout] = useState(false);
  
  // Timeout for initialization (5 seconds)
  useEffect(() => {
    if (visible && !rankingState && !initializationTimeout) {
      const timer = setTimeout(() => {
        console.error('❌ TIMEOUT: Ranking initialization took >5 seconds');
        console.error('Contacts:', contacts);
        console.error('This likely means contact IDs are missing or invalid');
        setInitializationTimeout(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, rankingState, contacts, initializationTimeout]);
  
  // Reset timeout when modal closes
  useEffect(() => {
    if (!visible) {
      setInitializationTimeout(false);
    }
  }, [visible]);
  
  // Initialize ranking session when modal opens
  useEffect(() => {
    if (visible && contacts.length > 0 && !rankingState) {
      console.log('');
      console.log('=' .repeat(60));
      console.log('🎯 WOULD YOU RATHER - INITIALIZATION');
      console.log('=' .repeat(60));
      console.log(`Layer: ${violatedLayer} (${violatedLayerName})`);
      console.log(`Capacity: ${layerCapacity}`);
      console.log(`Contacts received: ${contacts.length}`);
      console.log('Contact details:');
      contacts.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.name} (ID: ${c.id || c.sourceId}, Layer: ${c.dunbarLayer}, Status: ${c.quickSortStatus})`);
      });
      console.log('=' .repeat(60));
      console.log('');
      
      const state = initializeRanking(contacts, violatedLayer, layerCapacity);
      setRankingState(state);
      setSessionStartTime(Date.now());
      setComparisonStartTime(Date.now());
      
      // Initialize session tracking
      initializeSession(state);
      
      // Get first question
      const question = getRotatedQuestion(0, Date.now(), []);
      setCurrentQuestion(question.text);
      
      console.log('✅ Ranking session initialized');
      console.log(`Algorithm: ${state.algorithm}`);
      console.log(`Total comparisons needed: ${state.totalComparisonsNeeded}`);
      console.log('');
    }
  }, [visible, contacts, violatedLayer, layerCapacity, violatedLayerName]);
  
  // Initialize session tracking
  const initializeSession = (state: RankingState) => {
    const id = `ranking_${Date.now()}_${violatedLayer}`;
    setSessionId(id);
    setSkipCount(0);
    setContradictionCount(0);
    
    console.log(`✅ Created session: ${id}`);
  };
  
  // Get current pair
  const currentPair = rankingState ? getNextPair(rankingState) : null;
  
  // Handle card selection
  const handleCardPress = async (side: "left" | "right") => {
    if (!rankingState || !currentPair || selectedCard) return;
    
    setSelectedCard(side);
    const chosenContact = side === "left" ? currentPair.contactA : currentPair.contactB;
    const chosenId = chosenContact.id!;
    
    // Animate selection
    const scaleAnim = side === "left" ? scaleLeft : scaleRight;
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Check for contradictions
    const contactAId = currentPair.contactA.id || currentPair.contactA.sourceId;
    const contactBId = currentPair.contactB.id || currentPair.contactB.sourceId;
    
    if (!contactAId || !contactBId) {
      console.error('❌ Missing contact IDs for contradiction check');
      return;
    }
    
    const contradiction = detectContradiction(
      rankingState,
      contactAId,
      contactBId,
      chosenId
    );
    
    if (contradiction.hasContradiction) {
      // Show confirmation alert
      Alert.alert(
        "Interesting choice...",
        contradiction.message,
        [
          {
            text: "Let me reconsider",
            style: "cancel",
            onPress: () => {
              setSelectedCard(null);
              scaleAnim.setValue(1);
            },
          },
          {
            text: "I'm sure",
            onPress: () => processComparison(chosenId, false),
          },
        ]
      );
      
      // Track contradiction count in local state
      setContradictionCount(prev => prev + 1);
    } else {
      await processComparison(chosenId, false);
    }
  };
  
  // Process comparison and move to next
  const processComparison = async (chosenId: string, wasSkipped: boolean) => {
    if (!rankingState || !currentPair) return;
    
    const responseTime = Date.now() - comparisonStartTime;
    
    // Get contact IDs (use id or sourceId fallback)
    const contactAId = currentPair.contactA.id || currentPair.contactA.sourceId;
    const contactBId = currentPair.contactB.id || currentPair.contactB.sourceId;
    
    if (!contactAId || !contactBId) {
      console.error('❌ Missing contact IDs in comparison:', { contactAId, contactBId });
      return;
    }
    
    console.log('');
    console.log('📊 PROCESSING COMPARISON');
    console.log(`  ${currentPair.contactA.name} vs ${currentPair.contactB.name}`);
    console.log(`  Chosen: ${chosenId === contactAId ? currentPair.contactA.name : currentPair.contactB.name}`);
    console.log(`  Skipped: ${wasSkipped}`);
    console.log(`  Comparisons completed: ${rankingState.completedComparisons + 1}/${rankingState.totalComparisonsNeeded}`);
    
    // Record comparison
    const result: ComparisonResult = {
      chosenId,
      wasSkipped,
      responseTimeMs: responseTime,
    };
    
    recordComparison(
      rankingState,
      contactAId,
      contactBId,
      result
    );
    
    // Save comparison to Jazz
    if (me) {
      const comparison = Comparison.create({
        contactAId,
        contactBId,
        contactAName: currentPair.contactA.name,
        contactBName: currentPair.contactB.name,
        chosenId,
        questionId: `q${rankingState.completedComparisons}`,
        questionText: currentQuestion,
        timestamp: new Date().toISOString(),
        responseTimeMs: responseTime,
        wasSkipped,
      }, me);
      
      // Add to comparisons list
      const root = me.root as any;
      const comparisons = root?.comparisons || [];
      const newComparisons = ComparisonList.create([...comparisons, comparison], me);
      root.$jazz.set("comparisons", newComparisons);
      
      // Update skip count in local state
      if (wasSkipped) {
        setSkipCount(prev => prev + 1);
      }
    }
    
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Check if ranking is complete
      const nextPair = getNextPair(rankingState);
      
      console.log(`\n🔄 Getting next pair... ${nextPair ? `${nextPair.contactA.name} vs ${nextPair.contactB.name}` : 'None (ranking complete)'}`);
      console.log(`   Comparisons: ${rankingState.completedComparisons}/${rankingState.totalComparisonsNeeded}\n`);
      
      if (!nextPair || rankingState.completedComparisons >= rankingState.totalComparisonsNeeded) {
        // Ranking complete!
        completeRanking();
      } else {
        // Get next question
        const question = getRotatedQuestion(
          rankingState.completedComparisons,
          Date.now(),
          []
        );
        setCurrentQuestion(question.text);
        setComparisonStartTime(Date.now());
        
        // Reset UI
        setSelectedCard(null);
        fadeAnim.setValue(1);
        scaleLeft.setValue(1);
        scaleRight.setValue(1);
      }
    });
  };
  
  // Complete ranking and reallocate
  const completeRanking = () => {
    if (!rankingState) return;
    
    console.log('');
    console.log('=' .repeat(60));
    console.log("🎉 RANKING COMPLETE - FINALIZING");
    console.log('=' .repeat(60));
    console.log(`Total comparisons made: ${rankingState.completedComparisons}`);
    console.log(`Comparison graph size: ${rankingState.comparisonGraph.size}`);
    console.log('Comparison graph entries:');
    rankingState.comparisonGraph.forEach((beaten, winner) => {
      const winnerContact = rankingState.allContacts.find(c => (c.id || c.sourceId) === winner);
      console.log(`  ${winnerContact?.name} beat:`, Array.from(beaten).map(id => {
        const c = rankingState.allContacts.find(contact => (contact.id || contact.sourceId) === id);
        return c?.name;
      }));
    });
    console.log('=' .repeat(60));
    
    const finalRanking = finalizeRanking(rankingState);
    
    // Reallocate contacts
    const reallocationResult = reallocateContacts(
      finalRanking,
      rankingState.allContacts,
      violatedLayer,
      layerCapacity,
      violatedLayerName
    );
    
    // Track analytics
    const sessionDuration = Date.now() - sessionStartTime;
    trackLayerReallocation(
      sessionId || "unknown",
      reallocationResult,
      sessionDuration,
      rankingState.completedComparisons,
      skipCount,
      contradictionCount
    );
    
    // Save final session to Jazz
    if (me) {
      const now = new Date().toISOString();
      const session = RankingSession.create({
        sessionId: sessionId || `ranking_${Date.now()}`,
        createdAt: now,
        lastUpdatedAt: now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        violatedLayer,
        violatedLayerName,
        currentCapacity: contacts.length,
        maxCapacity: layerCapacity,
        overageCount: contacts.length - layerCapacity,
        algorithm: rankingState.algorithm,
        phase: "completed",
        contactIds: rankingState.contactIds,
        currentPairIndex: rankingState.completedComparisons,
        totalComparisonsNeeded: rankingState.totalComparisonsNeeded,
        completedComparisons: rankingState.completedComparisons,
        comparisonIds: [],
        finalRanking,
        contactsStaying: reallocationResult.staying,
        contactsMovingDown: reallocationResult.movingDown,
        questionBankSeed: Date.now(),
        skipCount,
        contradictionCount,
        status: "completed",
        completedAt: now,
        totalDurationMs: sessionDuration,
      }, me);
      
      // Add to user's ranking sessions
      const root = me.root as any;
      const existingSessions = root.rankingSessions || [];
      const newSessions = RankingSessionList.create([...existingSessions, session], me);
      root.$jazz.set('rankingSessions', newSessions);
      
      console.log(`✅ Saved completed session to Jazz: ${sessionId}`);
    }
    
    // Apply reallocation updates to contacts in Jazz
    console.log('');
    console.log('=' .repeat(60));
    console.log('💾 APPLYING REALLOCATION UPDATES TO JAZZ');
    console.log('=' .repeat(60));
    console.log(`Contacts staying in Layer ${violatedLayer}:`, reallocationResult.staying.length);
    console.log(`Contacts moving to Layer ${violatedLayer + 1}:`, reallocationResult.movingDown.length);
    
    if (me) {
      const root = me.root as any;
      const allContactsArray = Array.from(root?.contacts || []);
      
      let stayingUpdated = 0;
      let movingUpdated = 0;
      
      const updatedContactsList = allContactsArray.map((c: any) => {
        const contactId = c.id || c.sourceId;
        
        // Check if contact is moving down to next layer
        if (reallocationResult.movingDown.includes(contactId)) {
          console.log(`  ↓ Moving: ${c.name} (Layer ${violatedLayer} → Layer ${violatedLayer + 1})`);
          movingUpdated++;
          
          return Contact.create({
            sourceId: c.sourceId,
            name: c.name,
            phoneNumber: c.phoneNumber,
            email: c.email,
            photoUrl: c.photoUrl,
            dunbarLayer: violatedLayer + 1, // Move to next layer down
            interactionScore: c.interactionScore,
            lastInteraction: c.lastInteraction,
            interactionFrequency: c.interactionFrequency,
            reciprocityScore: c.reciprocityScore,
            contactInitiationRatio: c.contactInitiationRatio,
            averageResponseTime: c.averageResponseTime,
            callCount: c.callCount,
            smsCount: c.smsCount,
            totalDuration: c.totalDuration,
            relationshipType: c.relationshipType,
            isFamily: c.isFamily,
            familyTier: c.familyTier,
            familyRole: c.familyRole,
            connectionOrigin: c.connectionOrigin,
            businessTier: c.businessTier,
            targetLayer: c.targetLayer,
            cultivationGoal: c.cultivationGoal,
            notes: c.notes,
            manualLayerOverride: c.manualLayerOverride,
            lockedLayer: c.lockedLayer,
            qualityRating: c.qualityRating,
            manuallyPinned: c.manuallyPinned,
            lastManualInteraction: c.lastManualInteraction,
            vertical: c.vertical,
            tags: c.tags,
            quickSortStatus: "sorted", // Mark as sorted to prevent re-sorting
            quickSortedAt: new Date().toISOString(),
            createdAt: c.createdAt,
          }, me);
        }
        
        // Check if contact is staying in current layer
        if (reallocationResult.staying.includes(contactId)) {
          console.log(`  ✓ Staying: ${c.name} (Layer ${violatedLayer})`);
          stayingUpdated++;
          
          return Contact.create({
            sourceId: c.sourceId,
            name: c.name,
            phoneNumber: c.phoneNumber,
            email: c.email,
            photoUrl: c.photoUrl,
            dunbarLayer: c.dunbarLayer, // Keep in current layer
            interactionScore: c.interactionScore,
            lastInteraction: c.lastInteraction,
            interactionFrequency: c.interactionFrequency,
            reciprocityScore: c.reciprocityScore,
            contactInitiationRatio: c.contactInitiationRatio,
            averageResponseTime: c.averageResponseTime,
            callCount: c.callCount,
            smsCount: c.smsCount,
            totalDuration: c.totalDuration,
            relationshipType: c.relationshipType,
            isFamily: c.isFamily,
            familyTier: c.familyTier,
            familyRole: c.familyRole,
            connectionOrigin: c.connectionOrigin,
            businessTier: c.businessTier,
            targetLayer: c.targetLayer,
            cultivationGoal: c.cultivationGoal,
            notes: c.notes,
            manualLayerOverride: c.manualLayerOverride,
            lockedLayer: c.lockedLayer,
            qualityRating: c.qualityRating,
            manuallyPinned: c.manuallyPinned,
            lastManualInteraction: c.lastManualInteraction,
            vertical: c.vertical,
            tags: c.tags,
            quickSortStatus: "sorted", // Mark as sorted to prevent re-sorting
            quickSortedAt: new Date().toISOString(),
            createdAt: c.createdAt,
          }, me);
        }
        
        // Contact not involved in this ranking session - return unchanged
        return c;
      });
      
      // Save all contacts back to Jazz
      const newContacts = ContactList.create(updatedContactsList, me);
      root.$jazz.set('contacts', newContacts);
      
      console.log('');
      console.log(`✅ Successfully updated ${stayingUpdated + movingUpdated} contacts in Jazz`);
      console.log(`   - ${stayingUpdated} staying in Layer ${violatedLayer}`);
      console.log(`   - ${movingUpdated} moving to Layer ${violatedLayer + 1}`);
      console.log('=' .repeat(60));
      console.log('');
    }
    
    setIsComplete(true);
  };
  
  // Handle skip
  const handleSkip = () => {
    if (!currentPair) return;
    
    Alert.alert(
      "Skip this comparison?",
      "Skipping means both contacts will be treated equally. This is okay for truly impossible decisions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          onPress: () => {
            // Process as tie (no winner)
            processComparison(currentPair.contactA.id!, true);
          },
        },
      ]
    );
  };
  
  // Close and reset
  const handleClose = () => {
    setRankingState(null);
    setIsComplete(false);
    setSelectedCard(null);
    fadeAnim.setValue(1);
    scaleLeft.setValue(1);
    scaleRight.setValue(1);
    onClose();
    
    // Trigger dashboard refresh to show updated layers
    if (onRefresh) {
      console.log('🔄 Triggering dashboard refresh after ranking completion');
      onRefresh();
    }
  };
  
  if (!visible) return null;
  
  // Completion screen
  if (isComplete && rankingState) {
    const finalRanking = rankingState.finalRanking;
    const staying = finalRanking.slice(0, layerCapacity);
    const moving = finalRanking.slice(layerCapacity);
    
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 bg-black/95 justify-center items-center px-6">
          <View className="bg-zinc-900 border border-primary p-8 w-full max-w-md">
            <Text className="text-4xl text-center mb-4">✅</Text>
            <Text className="text-white text-2xl font-bold text-center mb-2">
              {violatedLayerName} Balanced!
            </Text>
            <Text className="text-zinc-400 text-center mb-6">
              {staying.length} staying, {moving.length} moving to next layer
            </Text>
            
            <Text className="text-zinc-300 text-sm text-center mb-6">
              This helps you focus on the relationships that matter most.
              Remember: you can still spend time with everyone!
            </Text>
            
            <View className="bg-black/50 p-3 border border-primary/30 mb-6">
              <Text className="text-xs text-zinc-400">
                📊 Session Stats
              </Text>
              <Text className="text-xs text-zinc-300 mt-2">
                • {rankingState.completedComparisons} comparisons
              </Text>
              <Text className="text-xs text-zinc-300">
                • {skipCount} skipped ({((skipCount) / rankingState.completedComparisons * 100).toFixed(1)}%)
              </Text>
              <Text className="text-xs text-zinc-300">
                • {Math.round((Date.now() - sessionStartTime) / 1000 / 60)} minutes
              </Text>
            </View>

            <Button variant="primary" onPress={handleClose} className="mb-3">
              View Garden
            </Button>
          </View>
        </View>
      </Modal>
    );
  }
  
  // Loading state while initializing
  if (!currentPair || !rankingState) {
    // Show timeout error if initialization takes too long
    if (initializationTimeout) {
      return (
        <Modal visible={visible} animationType="slide" transparent>
          <View className="flex-1 bg-black/95 justify-center items-center px-6">
            <View className="bg-zinc-900 border border-red-800 p-8 w-full max-w-md">
              <Text className="text-red-400 text-xl font-bold text-center mb-4">
                ⚠️ Initialization Failed
              </Text>
              <Text className="text-zinc-400 text-center mb-6">
                Unable to start ranking session. This may be due to missing contact data.
              </Text>
              <Text className="text-zinc-500 text-xs text-center mb-6">
                Check console logs for details. Contact IDs may be missing.
              </Text>
              <Button variant="primary" onPress={handleClose}>
                Close
              </Button>
            </View>
          </View>
        </Modal>
      );
    }
    
    // Normal loading state
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 bg-black/95 justify-center items-center px-6">
          <View className="bg-zinc-900 border border-zinc-800 p-8 w-full max-w-md">
            <Text className="text-white text-xl font-bold text-center mb-4">
              Preparing...
            </Text>
            <Text className="text-zinc-400 text-center mb-6">
              Setting up your ranking session
            </Text>
          </View>
        </View>
      </Modal>
    );
  }
  
  const progress = calculateProgress(rankingState);
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/95 pt-16 px-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">Prioritize</Text>
            <Text className="text-zinc-400 text-sm">
              {rankingState?.completedComparisons || 0} / {rankingState?.totalComparisonsNeeded || 0}
            </Text>
          </View>
          <Pressable onPress={handleClose}>
            <Text className="text-zinc-400 text-base">Close</Text>
          </Pressable>
        </View>
        
        {/* Progress Bar */}
        <View className="h-3 bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <View
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </View>
        
        {/* Question */}
        <View className="mb-8">
          <Text className="text-primary text-xs font-semibold uppercase tracking-wider text-center mb-2">
            ❓ WOULD YOU RATHER...
          </Text>
          <Text className="text-white text-xl font-semibold text-center">
            {currentQuestion}
          </Text>
        </View>
        
        {/* Comparison Cards */}
        <Animated.View 
          className="flex-1 justify-center mb-8"
          style={{ opacity: fadeAnim }}
        >
          <View className="flex-row gap-4">
            {/* Left Card */}
            <Animated.View 
              className="flex-1"
              style={{ transform: [{ scale: scaleLeft }] }}
            >
              <Pressable
                onPress={() => handleCardPress("left")}
                disabled={!!selectedCard}
              >
                <Card className={`p-6 items-center border-2 ${
                  selectedCard === "left" 
                    ? "border-primary bg-primary/20" 
                    : "border-zinc-700"
                }`}>
                  <Text className="text-white text-2xl font-bold text-center mb-4">
                    {currentPair.contactA.name}
                  </Text>
                  
                  <View className="bg-zinc-800 px-3 py-1 rounded mb-2">
                    <Text className="text-zinc-400 text-xs">
                      Layer {currentPair.contactA.dunbarLayer ?? violatedLayer}
                    </Text>
                  </View>
                  
                  {currentPair.contactA.interactionScore !== undefined && (
                    <Text className="text-zinc-500 text-xs">
                      Score: {currentPair.contactA.interactionScore.toFixed(0)}
                    </Text>
                  )}
                </Card>
              </Pressable>
            </Animated.View>
            
            {/* Right Card */}
            <Animated.View 
              className="flex-1"
              style={{ transform: [{ scale: scaleRight }] }}
            >
              <Pressable
                onPress={() => handleCardPress("right")}
                disabled={!!selectedCard}
              >
                <Card className={`p-6 items-center border-2 ${
                  selectedCard === "right" 
                    ? "border-primary bg-primary/20" 
                    : "border-zinc-700"
                }`}>
                  <Text className="text-white text-2xl font-bold text-center mb-4">
                    {currentPair.contactB.name}
                  </Text>
                  
                  <View className="bg-zinc-800 px-3 py-1 rounded mb-2">
                    <Text className="text-zinc-400 text-xs">
                      Layer {currentPair.contactB.dunbarLayer ?? violatedLayer}
                    </Text>
                  </View>
                  
                  {currentPair.contactB.interactionScore !== undefined && (
                    <Text className="text-zinc-500 text-xs">
                      Score: {currentPair.contactB.interactionScore.toFixed(0)}
                    </Text>
                  )}
                </Card>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
        
        {/* Skip Button */}
        <Button variant="ghost" onPress={handleSkip} className="mb-8">
          Skip This One
        </Button>
      </View>
    </Modal>
  );
}
