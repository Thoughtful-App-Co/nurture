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
  contacts: any[]; // Contacts in violated layer
  violatedLayer: number;
  violatedLayerName: string;
  layerCapacity: number;
}

export function WouldYouRatherModal({
  visible,
  onClose,
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
  
  // Jazz session (persisted to database)
  const [jazzSession, setJazzSession] = useState<any>(null);
  
  // Initialize ranking session when modal opens
  useEffect(() => {
    if (visible && contacts.length > 0 && !rankingState) {
      console.log(`🎯 Starting Would You Rather for Layer ${violatedLayer}`);
      console.log(`📊 ${contacts.length} contacts, capacity: ${layerCapacity}`);
      
      const state = initializeRanking(contacts, violatedLayer, layerCapacity);
      setRankingState(state);
      setSessionStartTime(Date.now());
      setComparisonStartTime(Date.now());
      
      // Create Jazz session for persistence
      createJazzSession(state);
      
      // Get first question
      const question = getRotatedQuestion(0, Date.now(), []);
      setCurrentQuestion(question.text);
    }
  }, [visible, contacts, violatedLayer, layerCapacity]);
  
  // Create persistent Jazz session
  const createJazzSession = (state: RankingState) => {
    if (!me) return;
    
    const sessionId = `ranking_${Date.now()}_${violatedLayer}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    
    const session = RankingSession.create({
      sessionId,
      createdAt: now,
      lastUpdatedAt: now,
      expiresAt,
      violatedLayer,
      violatedLayerName,
      currentCapacity: contacts.length,
      maxCapacity: layerCapacity,
      overageCount: contacts.length - layerCapacity,
      algorithm: state.algorithm,
      phase: state.phase,
      contactIds: state.contactIds,
      currentPairIndex: 0,
      totalComparisonsNeeded: state.totalComparisonsNeeded,
      completedComparisons: 0,
      comparisonIds: [],
      questionBankSeed: Date.now(),
      skipCount: 0,
      contradictionCount: 0,
      status: "active",
    }, me);
    
    setJazzSession(session);
    
    // Add to user's ranking sessions
    const root = me.root as any;
    const sessions = root?.rankingSessions || [];
    const newSessions = RankingSessionList.create([...sessions, session], me);
    root.$jazz.set("rankingSessions", newSessions);
    
    console.log(`✅ Created Jazz session: ${sessionId}`);
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
    const contradiction = detectContradiction(
      rankingState,
      currentPair.contactA.id!,
      currentPair.contactB.id!,
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
      
      // Update contradiction count
      if (jazzSession) {
        jazzSession.contradictionCount = (jazzSession.contradictionCount || 0) + 1;
      }
    } else {
      await processComparison(chosenId, false);
    }
  };
  
  // Process comparison and move to next
  const processComparison = async (chosenId: string, wasSkipped: boolean) => {
    if (!rankingState || !currentPair) return;
    
    const responseTime = Date.now() - comparisonStartTime;
    
    // Record comparison
    const result: ComparisonResult = {
      chosenId,
      wasSkipped,
      responseTimeMs: responseTime,
    };
    
    recordComparison(
      rankingState,
      currentPair.contactA.id!,
      currentPair.contactB.id!,
      result
    );
    
    // Save comparison to Jazz
    if (me && jazzSession) {
      const comparison = Comparison.create({
        contactAId: currentPair.contactA.id!,
        contactBId: currentPair.contactB.id!,
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
      
      // Update session
      jazzSession.completedComparisons = rankingState.completedComparisons;
      jazzSession.currentPairIndex = rankingState.currentPairIndex + 1;
      jazzSession.lastUpdatedAt = new Date().toISOString();
      if (wasSkipped) {
        jazzSession.skipCount = (jazzSession.skipCount || 0) + 1;
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
      
      if (!nextPair || rankingState.completedComparisons >= rankingState.totalComparisonsNeeded) {
        // Ranking complete!
        completeRanking();
      } else {
        // Get next question
        const question = getRotatedQuestion(
          rankingState.completedComparisons,
          jazzSession?.questionBankSeed || Date.now(),
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
    
    console.log("🎉 Ranking complete! Finalizing...");
    
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
      jazzSession?.sessionId || "unknown",
      reallocationResult,
      sessionDuration,
      rankingState.completedComparisons,
      jazzSession?.skipCount || 0,
      jazzSession?.contradictionCount || 0
    );
    
    // Update Jazz session
    if (jazzSession) {
      jazzSession.status = "completed";
      jazzSession.completedAt = new Date().toISOString();
      jazzSession.finalRanking = finalRanking;
      jazzSession.contactsStaying = reallocationResult.staying;
      jazzSession.contactsMovingDown = reallocationResult.movingDown;
      jazzSession.totalDurationMs = sessionDuration;
      jazzSession.phase = "completed";
    }
    
    // TODO: Apply reallocation updates to contacts in Jazz
    
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
                • {jazzSession?.skipCount || 0} skipped ({((jazzSession?.skipCount || 0) / rankingState.completedComparisons * 100).toFixed(1)}%)
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
  
  // No contacts to rank
  if (!currentPair) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 bg-black/95 justify-center items-center px-6">
          <View className="bg-zinc-900 border border-zinc-800 p-8 w-full max-w-md">
            <Text className="text-white text-xl font-bold text-center mb-4">
              No Ranking Needed
            </Text>
            <Text className="text-zinc-400 text-center mb-6">
              This layer is already balanced!
            </Text>
            <Button variant="primary" onPress={handleClose}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    );
  }
  
  const progress = rankingState ? calculateProgress(rankingState) : 0;
  
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
