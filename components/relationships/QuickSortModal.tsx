/**
 * Tend Garden Modal
 * 
 * Helps users organize and catalog their relationships into appropriate layers.
 * Like tending a garden - bringing clarity and order to your relationship network.
 * 
 * Features:
 * - Swipeable card interface for easy categorization
 * - 6 categories: Layers 0-4 + Hidden
 * - Progress tracking
 * - Skip functionality for uncertain contacts
 * - Prevents re-tending already organized contacts
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { useAccount } from "jazz-tools/expo";
import { Contact, ContactList } from "@/jazz/schema";
import { Card, Button } from "@/components/ui";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 120;

// Layer definitions matching dashboard
const LAYERS = [
  { id: 0, name: "Loved Ones", color: "#ef4444", emoji: "❤️", descriptor: "Adore" },
  { id: 1, name: "Inner Circle", color: "#f97316", emoji: "🧡", descriptor: "Love" },
  { id: 2, name: "Clan", color: "#eab308", emoji: "💛", descriptor: "Respect" },
  { id: 3, name: "Tribe", color: "#22c55e", emoji: "💚", descriptor: "Like" },
  { id: 4, name: "Acquaintances", color: "#3b82f6", emoji: "💙", descriptor: "Know" },
];

const HIDDEN_CATEGORY = {
  id: "hidden",
  name: "Hidden",
  color: "#71717a",
  emoji: "👻",
  descriptor: "Hide",
};

interface QuickSortModalProps {
  visible: boolean;
  onClose: () => void;
  contacts: any[];
}

export function QuickSortModal({
  visible,
  onClose,
  contacts,
}: QuickSortModalProps) {
  const { me } = useAccount();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortedCount, setSortedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  // Relationship type and subcategory for current contact
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<"FAMILY" | "FRIEND" | "BUSINESS" | null>(null);
  const [selectedFamilyTier, setSelectedFamilyTier] = useState<"NUCLEAR" | "SECONDARY" | "TERTIARY" | null>(null);
  const [selectedFriendTier, setSelectedFriendTier] = useState<"INNER_CIRCLE" | "CLOSE_FRIEND" | "GOOD_FRIEND" | "CASUAL_FRIEND" | null>(null);
  const [selectedBusinessTier, setSelectedBusinessTier] = useState<"CLOSE_COLLEAGUE" | "ACQUAINTANCE" | null>(null);
  
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Filter to only unsorted contacts (not already sorted in this session)
  const unsortedContacts = contacts.filter(
    (c) => c.quickSortStatus === "not_sorted" || !c.quickSortStatus
  );

  const currentContact = unsortedContacts[currentIndex];
  const remainingCount = unsortedContacts.length - currentIndex;

  // Reset animation and selections when contact changes
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
    fadeAnim.setValue(1);
    // Reset relationship type selections for new contact
    setSelectedRelationshipType(null);
    setSelectedFamilyTier(null);
    setSelectedFriendTier(null);
    setSelectedBusinessTier(null);
  }, [currentIndex]);

  // Check if complete
  useEffect(() => {
    if (currentIndex >= unsortedContacts.length && unsortedContacts.length > 0) {
      setIsComplete(true);
    }
  }, [currentIndex, unsortedContacts.length]);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe right - could map to a category
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe left - could map to hidden
          forceSwipe("left");
        } else {
          // Snap back
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: string) => {
    const x = direction === "right" ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSwipeComplete(direction === "right" ? 0 : "hidden");
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  const onSwipeComplete = (category: number | "hidden") => {
    // Update contact in next tick
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setSortedCount(sortedCount + 1);
      position.setValue({ x: 0, y: 0 });
      fadeAnim.setValue(1);
    }, 50);
  };

  // Handle category button press
  const handleCategorySelect = async (layerId: number | "hidden") => {
    if (!me || !currentContact) return;

    console.log(`Tend Garden: ${currentContact.name} → ${layerId === "hidden" ? "Hidden" : `Layer ${layerId}`}`);
    console.log(`  Relationship Type: ${selectedRelationshipType || "Not set"}`);
    if (selectedRelationshipType === "FAMILY") {
      console.log(`  Family Tier: ${selectedFamilyTier || "Not set"}`);
    } else if (selectedRelationshipType === "FRIEND") {
      console.log(`  Friend Tier: ${selectedFriendTier || "Not set"}`);
    } else if (selectedRelationshipType === "BUSINESS") {
      console.log(`  Business Tier: ${selectedBusinessTier || "Not set"}`);
    }

    const root = me.root as any;
    const allContacts = root?.contacts || [];

    // Find the contact to update
    const contactIndex = Array.from(allContacts).findIndex(
      (c: any) => c.id === currentContact.id || c.sourceId === currentContact.sourceId
    );

    if (contactIndex !== -1) {
      const existingContact = allContacts[contactIndex];

      // Create updated contact with new layer, relationship type, and quick sort status
      const updatedContactData = Contact.create(
        {
          sourceId: existingContact.sourceId,
          name: existingContact.name,
          phoneNumber: existingContact.phoneNumber,
          email: existingContact.email,
          dunbarLayer: layerId === "hidden" ? 5 : layerId, // Hidden goes to layer 5
          interactionScore: existingContact.interactionScore,
          lastInteraction: existingContact.lastInteraction,
          interactionFrequency: existingContact.interactionFrequency,
          reciprocityScore: existingContact.reciprocityScore,
          contactInitiationRatio: existingContact.contactInitiationRatio,
          averageResponseTime: existingContact.averageResponseTime,
          // Relationship type and subcategories
          relationshipType: selectedRelationshipType || existingContact.relationshipType,
          isFamily: selectedRelationshipType === "FAMILY" || existingContact.isFamily,
          familyTier: selectedRelationshipType === "FAMILY" ? selectedFamilyTier || existingContact.familyTier : existingContact.familyTier,
          familyRole: existingContact.familyRole,
          friendTier: selectedRelationshipType === "FRIEND" ? selectedFriendTier || existingContact.friendTier : existingContact.friendTier,
          businessTier: selectedRelationshipType === "BUSINESS" ? selectedBusinessTier || existingContact.businessTier : existingContact.businessTier,
          notes: existingContact.notes,
          cultivationGoal: existingContact.cultivationGoal,
          quickSortStatus: layerId === "hidden" ? "hidden" : "sorted",
          quickSortedAt: new Date().toISOString(),
          createdAt: existingContact.createdAt,
        },
        me
      );

      // Update the contacts list
      const newContactsList = Array.from(allContacts).map((c: any, i: number) =>
        i === contactIndex ? updatedContactData : c
      );

      const newContacts = ContactList.create(newContactsList, me);
      root.$jazz.set("contacts", newContacts);

      console.log(`✅ Contact sorted: ${currentContact.name} → ${layerId === "hidden" ? "Hidden" : `Layer ${layerId}`}`);
    }

    // Animate card away
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: 0, y: -SCREEN_WIDTH },
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(currentIndex + 1);
      setSortedCount(sortedCount + 1);
      position.setValue({ x: 0, y: 0 });
      fadeAnim.setValue(1);
    });
  };

  // Skip current contact
  const handleSkip = () => {
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: SCREEN_WIDTH + 100, y: -50 },
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
      fadeAnim.setValue(1);
    });
  };

  // Reset all quick sort statuses
  const handleReset = async () => {
    if (!me) return;

    console.log("🔄 Resetting Tend Garden statuses...");

    const root = me.root as any;
    const allContacts = root?.contacts || [];

    // Reset all contacts
    const resetContacts = Array.from(allContacts).map((c: any) => {
      return Contact.create(
        {
          sourceId: c.sourceId,
          name: c.name,
          phoneNumber: c.phoneNumber,
          email: c.email,
          dunbarLayer: c.dunbarLayer,
          interactionScore: c.interactionScore,
          lastInteraction: c.lastInteraction,
          interactionFrequency: c.interactionFrequency,
          reciprocityScore: c.reciprocityScore,
          contactInitiationRatio: c.contactInitiationRatio,
          averageResponseTime: c.averageResponseTime,
          isFamily: c.isFamily,
          familyTier: c.familyTier,
          familyRole: c.familyRole,
          notes: c.notes,
          cultivationGoal: c.cultivationGoal,
          quickSortStatus: "not_sorted",
          quickSortedAt: undefined,
          createdAt: c.createdAt,
        },
        me
      );
    });

    const newContacts = ContactList.create(resetContacts, me);
    root.$jazz.set("contacts", newContacts);

    // Reset state
    setCurrentIndex(0);
    setSortedCount(0);
    setIsComplete(false);

    console.log("✅ Tend Garden reset complete");
  };

  // Close and reset
  const handleClose = () => {
    setCurrentIndex(0);
    setSortedCount(0);
    setIsComplete(false);
    onClose();
  };

  // Rotate card based on pan
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
    opacity: fadeAnim,
  };

  if (!visible) return null;

  // Completion screen
  if (isComplete) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 bg-black/95 justify-center items-center px-6">
          <View className="bg-zinc-900 border border-zinc-800 p-8 w-full max-w-md">
            <Text className="text-4xl text-center mb-4">🌱</Text>
            <Text className="text-white text-2xl font-bold text-center mb-2">
              Garden Tended!
            </Text>
            <Text className="text-zinc-400 text-center mb-6">
              You organized {sortedCount} relationship{sortedCount !== 1 ? "s" : ""}
            </Text>

            <Button variant="primary" onPress={handleClose} className="mb-3">
              View Garden
            </Button>
            <Button variant="secondary" onPress={handleReset}>
              Reset & Tend Again
            </Button>
          </View>
        </View>
      </Modal>
    );
  }

  // No contacts to sort
  if (unsortedContacts.length === 0) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 bg-black/95 justify-center items-center px-6">
          <View className="bg-zinc-900 border border-zinc-800 p-8 w-full max-w-md">
            <Text className="text-white text-xl font-bold text-center mb-4">
              Garden Fully Tended
            </Text>
            <Text className="text-zinc-400 text-center mb-6">
              All relationships have been organized!
            </Text>

            <Button variant="primary" onPress={handleClose} className="mb-3">
              Close
            </Button>
            <Button variant="secondary" onPress={handleReset}>
              Reset & Tend Again
            </Button>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/95 pt-16 px-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">Tend Your Garden</Text>
            <Text className="text-zinc-400 text-sm">
              {remainingCount} remaining
            </Text>
          </View>
          <Pressable onPress={handleClose}>
            <Text className="text-zinc-400 text-base">Close</Text>
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View className="h-2 bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <View
            className="h-full bg-primary"
            style={{
              width: `${(currentIndex / unsortedContacts.length) * 100}%`,
            }}
          />
        </View>

        {/* Card Stack */}
        <View className="flex-1 justify-center items-center mb-8">
          {/* Current Card */}
          {currentContact && (
            <Animated.View
              style={[
                {
                  width: SCREEN_WIDTH - 48,
                  position: "absolute",
                },
                cardStyle,
              ]}
              {...panResponder.panHandlers}
            >
              <Card className="p-6 border-2 border-zinc-700">
                <Text className="text-white text-3xl font-bold text-center mb-2">
                  {currentContact.name}
                </Text>
                {currentContact.phoneNumber && (
                  <Text className="text-zinc-400 text-sm text-center mb-4">
                    {currentContact.phoneNumber}
                  </Text>
                )}
                
                {/* Relationship Type Selector */}
                <View className="mb-4">
                  <Text className="text-zinc-400 text-xs text-center mb-2">
                    RELATIONSHIP TYPE
                  </Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setSelectedRelationshipType("FAMILY")}
                      className={`flex-1 py-3 px-2 border items-center ${
                        selectedRelationshipType === "FAMILY"
                          ? "border-primary bg-primary/20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Text className="text-2xl mb-1">👨‍👩‍👧‍👦</Text>
                      <Text
                        className={`text-xs font-bold text-center ${
                          selectedRelationshipType === "FAMILY"
                            ? "text-primary"
                            : "text-zinc-400"
                        }`}
                      >
                        FAMILY
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setSelectedRelationshipType("FRIEND")}
                      className={`flex-1 py-3 px-2 border items-center ${
                        selectedRelationshipType === "FRIEND"
                          ? "border-primary bg-primary/20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Text className="text-2xl mb-1">👥</Text>
                      <Text
                        className={`text-xs font-bold text-center ${
                          selectedRelationshipType === "FRIEND"
                            ? "text-primary"
                            : "text-zinc-400"
                        }`}
                      >
                        FRIEND
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setSelectedRelationshipType("BUSINESS")}
                      className={`flex-1 py-3 px-2 border items-center ${
                        selectedRelationshipType === "BUSINESS"
                          ? "border-primary bg-primary/20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Text className="text-2xl mb-1">💼</Text>
                      <Text
                        className={`text-xs font-bold text-center ${
                          selectedRelationshipType === "BUSINESS"
                            ? "text-primary"
                            : "text-zinc-400"
                        }`}
                      >
                        BUSINESS
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Subcategory Selector - Family */}
                {selectedRelationshipType === "FAMILY" && (
                  <View className="mb-4">
                    <Text className="text-zinc-400 text-xs text-center mb-2">
                      FAMILY TIER
                    </Text>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => setSelectedFamilyTier("NUCLEAR")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedFamilyTier === "NUCLEAR"
                            ? "border-red-500 bg-red-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedFamilyTier === "NUCLEAR"
                              ? "text-red-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Nuclear
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedFamilyTier("SECONDARY")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedFamilyTier === "SECONDARY"
                            ? "border-orange-500 bg-orange-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedFamilyTier === "SECONDARY"
                              ? "text-orange-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Secondary
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedFamilyTier("TERTIARY")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedFamilyTier === "TERTIARY"
                            ? "border-yellow-500 bg-yellow-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedFamilyTier === "TERTIARY"
                              ? "text-yellow-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Extended
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Subcategory Selector - Friend */}
                {selectedRelationshipType === "FRIEND" && (
                  <View className="mb-4">
                    <Text className="text-zinc-400 text-xs text-center mb-2">
                      FRIEND TIER
                    </Text>
                    <View className="flex-row gap-2 mb-2">
                      <Pressable
                        onPress={() => setSelectedFriendTier("INNER_CIRCLE")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedFriendTier === "INNER_CIRCLE"
                            ? "border-red-500 bg-red-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedFriendTier === "INNER_CIRCLE"
                              ? "text-red-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Inner Circle
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedFriendTier("CLOSE_FRIEND")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedFriendTier === "CLOSE_FRIEND"
                            ? "border-orange-500 bg-orange-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedFriendTier === "CLOSE_FRIEND"
                              ? "text-orange-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Close
                        </Text>
                      </Pressable>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => setSelectedFriendTier("GOOD_FRIEND")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedFriendTier === "GOOD_FRIEND"
                            ? "border-yellow-500 bg-yellow-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedFriendTier === "GOOD_FRIEND"
                              ? "text-yellow-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Good Friend
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedFriendTier("CASUAL_FRIEND")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedFriendTier === "CASUAL_FRIEND"
                            ? "border-green-500 bg-green-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedFriendTier === "CASUAL_FRIEND"
                              ? "text-green-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Casual
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Subcategory Selector - Business */}
                {selectedRelationshipType === "BUSINESS" && (
                  <View className="mb-4">
                    <Text className="text-zinc-400 text-xs text-center mb-2">
                      BUSINESS TIER
                    </Text>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => setSelectedBusinessTier("CLOSE_COLLEAGUE")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedBusinessTier === "CLOSE_COLLEAGUE"
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedBusinessTier === "CLOSE_COLLEAGUE"
                              ? "text-blue-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Close Colleague
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedBusinessTier("ACQUAINTANCE")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedBusinessTier === "ACQUAINTANCE"
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedBusinessTier === "ACQUAINTANCE"
                              ? "text-blue-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Acquaintance
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                <View className="bg-zinc-800 px-4 py-2 rounded">
                  <Text className="text-zinc-400 text-xs text-center">
                    Current Layer: {currentContact.dunbarLayer ?? "Not Set"}
                  </Text>
                </View>
              </Card>
            </Animated.View>
          )}
        </View>

        {/* Category Buttons */}
        <View className="mb-6">
          {(() => {
            // Check if relationship type and tier are selected
            const hasRelationshipType = !!selectedRelationshipType;
            const hasTier = 
              (selectedRelationshipType === 'FAMILY' && !!selectedFamilyTier) ||
              (selectedRelationshipType === 'FRIEND' && !!selectedFriendTier) ||
              (selectedRelationshipType === 'BUSINESS' && !!selectedBusinessTier);
            const isComplete = hasRelationshipType && hasTier;
            
            let warningMessage = 'TAP A CATEGORY';
            if (!hasRelationshipType) {
              warningMessage = '⚠️ SELECT RELATIONSHIP TYPE FIRST';
            } else if (!hasTier) {
              if (selectedRelationshipType === 'FAMILY') {
                warningMessage = '⚠️ SELECT FAMILY TIER';
              } else if (selectedRelationshipType === 'FRIEND') {
                warningMessage = '⚠️ SELECT FRIEND TIER';
              } else if (selectedRelationshipType === 'BUSINESS') {
                warningMessage = '⚠️ SELECT BUSINESS TIER';
              }
            }
            
            return (
              <Text className={`text-xs text-center mb-3 ${
                !isComplete ? 'text-orange-400' : 'text-zinc-400'
              }`}>
                {warningMessage}
              </Text>
            );
          })()}

          {/* Top Row: Layers 0-2 */}
          <View className="flex-row gap-2 mb-2">
            {LAYERS.slice(0, 3).map((layer) => {
              const isEnabled = 
                selectedRelationshipType && (
                  (selectedRelationshipType === 'FAMILY' && selectedFamilyTier) ||
                  (selectedRelationshipType === 'FRIEND' && selectedFriendTier) ||
                  (selectedRelationshipType === 'BUSINESS' && selectedBusinessTier)
                );
              
              return (
                <Pressable
                  key={layer.id}
                  onPress={() => isEnabled && handleCategorySelect(layer.id)}
                  disabled={!isEnabled}
                  className={`flex-1 py-3 items-center border ${
                    !isEnabled 
                      ? 'bg-zinc-900/50 border-zinc-800' 
                      : 'bg-zinc-900 border-zinc-700'
                  }`}
                  style={{ opacity: !isEnabled ? 0.5 : 1 }}
                >
                  <Text className="text-2xl mb-1">{layer.emoji}</Text>
                  <Text
                    className="text-xs font-bold mb-0.5"
                    style={{ color: layer.color }}
                  >
                    {layer.descriptor}
                  </Text>
                  <Text className="text-zinc-500 text-xs">L{layer.id}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Bottom Row: Layers 3-4 + Hidden */}
          <View className="flex-row gap-2">
            {LAYERS.slice(3, 5).map((layer) => {
              const isEnabled = 
                selectedRelationshipType && (
                  (selectedRelationshipType === 'FAMILY' && selectedFamilyTier) ||
                  (selectedRelationshipType === 'FRIEND' && selectedFriendTier) ||
                  (selectedRelationshipType === 'BUSINESS' && selectedBusinessTier)
                );
              
              return (
                <Pressable
                  key={layer.id}
                  onPress={() => isEnabled && handleCategorySelect(layer.id)}
                  disabled={!isEnabled}
                  className={`flex-1 py-3 items-center border ${
                    !isEnabled 
                      ? 'bg-zinc-900/50 border-zinc-800' 
                      : 'bg-zinc-900 border-zinc-700'
                  }`}
                  style={{ opacity: !isEnabled ? 0.5 : 1 }}
                >
                  <Text className="text-2xl mb-1">{layer.emoji}</Text>
                  <Text
                    className="text-xs font-bold mb-0.5"
                    style={{ color: layer.color }}
                  >
                    {layer.descriptor}
                  </Text>
                  <Text className="text-zinc-500 text-xs">L{layer.id}</Text>
                </Pressable>
              );
            })}
            {(() => {
              const isEnabled = 
                selectedRelationshipType && (
                  (selectedRelationshipType === 'FAMILY' && selectedFamilyTier) ||
                  (selectedRelationshipType === 'FRIEND' && selectedFriendTier) ||
                  (selectedRelationshipType === 'BUSINESS' && selectedBusinessTier)
                );
              
              return (
                <Pressable
                  onPress={() => isEnabled && handleCategorySelect("hidden")}
                  disabled={!isEnabled}
                  className={`flex-1 py-3 items-center border ${
                    !isEnabled 
                      ? 'bg-zinc-900/50 border-zinc-800' 
                      : 'bg-zinc-900 border-zinc-700'
                  }`}
                  style={{ opacity: !isEnabled ? 0.5 : 1 }}
                >
                  <Text className="text-2xl mb-1">{HIDDEN_CATEGORY.emoji}</Text>
                  <Text
                    className="text-xs font-bold mb-0.5"
                    style={{ color: HIDDEN_CATEGORY.color }}
                  >
                    {HIDDEN_CATEGORY.descriptor}
                  </Text>
                  <Text className="text-zinc-500 text-xs">---</Text>
                </Pressable>
              );
            })()}
          </View>
        </View>

        {/* Skip Button */}
        <Button variant="ghost" onPress={handleSkip} className="mb-8">
          Skip for Now
        </Button>
      </View>
    </Modal>
  );
}
