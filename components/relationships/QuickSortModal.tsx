/**
 * Tend Garden Modal
 * 
 * Helps users organize and catalog their relationships into appropriate layers.
 * Like tending a garden - bringing clarity and order to your relationship network.
 * 
 * Features:
 * - Swipeable card interface for easy categorization
 * - 6 categories: Layers 0-4 + Hidden
 * - Swipe left to hide/remove unknown contacts
 * - Swipe right to skip for now
 * - Progress tracking
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
  TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";
import { MaterialIcons } from "@expo/vector-icons";
import { useAccount } from "jazz-tools/expo";
import { Contact } from "@/jazz/schema";
import { Card, Button } from "@/components/ui";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 120;

// Layer definitions matching dashboard
const LAYERS = [
  { id: 0, name: "Loved Ones", color: "#ef4444", emoji: "❤️", descriptor: "Cherish" },
  { id: 1, name: "Inner Circle", color: "#f97316", emoji: "🧡", descriptor: "Love" },
  { id: 2, name: "Clan", color: "#eab308", emoji: "💛", descriptor: "Respect" },
  { id: 3, name: "Tribe", color: "#22c55e", emoji: "💚", descriptor: "Like" },
  { id: 4, name: "Acquaintances", color: "#3b82f6", emoji: "💙", descriptor: "Know" },
];

const HIDDEN_CATEGORY = {
  id: "hidden",
  name: "Hidden",
  color: "#71717a",
  emoji: "😐",
  descriptor: "Don't Know",
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
  // Performance optimization: Use $each to batch-load all contacts in one operation
  const me = useAccount(undefined, {
    resolve: {
      root: {
        contacts: { $each: true },
      }
    }
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortedCount, setSortedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  // Relationship type and subcategory for current contact
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<"FAMILY" | "FRIEND" | "BUSINESS" | null>(null);
  const [selectedFamilyTier, setSelectedFamilyTier] = useState<"NUCLEAR" | "SECONDARY" | "TERTIARY" | null>(null);
  const [selectedConnectionOrigin, setSelectedConnectionOrigin] = useState<"FAMILY_FRIEND" | "NEIGHBOR" | "SCHOOL" | "HOBBY_SPORTS" | "WORK" | "OTHER" | null>(null);
  const [selectedBusinessTier, setSelectedBusinessTier] = useState<"CONTACT" | "ACQUAINTANCE" | "COWORKER" | "CLIENT" | null>(null);
  
  // Additional context fields
  const [knownSinceYear, setKnownSinceYear] = useState<string>("");
  const [isEditingYear, setIsEditingYear] = useState<boolean>(false);
  const [closeEnoughToVisit, setCloseEnoughToVisit] = useState<"YES" | "NO" | "SOMETIMES" | null>(null);
  const [schoolName, setSchoolName] = useState<string>("");
  const [hobbyName, setHobbyName] = useState<string>("");
  const [workCompany, setWorkCompany] = useState<string>("");
  
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
    setSelectedConnectionOrigin(null);
    setSelectedBusinessTier(null);
    // Reset additional context fields
    setKnownSinceYear("");
    setIsEditingYear(false);
    setCloseEnoughToVisit(null);
    setSchoolName("");
    setHobbyName("");
    setWorkCompany("");
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

  const forceSwipe = async (direction: string) => {
    const x = direction === "right" ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    
    // If swiping left, hide the contact first
    if (direction === "left") {
      await handleQuickHide();
    }
    
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
      if (direction === "right") {
        // Skip for now - don't update contact
        onSwipeComplete("skip");
      } else {
        // Already hidden, just advance
        setCurrentIndex(currentIndex + 1);
        position.setValue({ x: 0, y: 0 });
        fadeAnim.setValue(1);
      }
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  const onSwipeComplete = (category: number | "hidden" | "skip") => {
    // Update contact in next tick
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      if (category !== "skip") {
        setSortedCount(sortedCount + 1);
      }
      position.setValue({ x: 0, y: 0 });
      fadeAnim.setValue(1);
    }, 50);
  };

  // Handle quick hide (for unknown contacts)
  const handleQuickHide = async () => {
    if (!me?.$isLoaded || !currentContact) return;

    console.log(`Quick Hide: ${currentContact.name} → Unknown/Hidden`);

    const root = me.root as any;
    const allContacts = root?.contacts || [];

    // Find the contact to update
    const contactIndex = Array.from(allContacts).findIndex(
      (c: any) => c.id === currentContact.id || c.sourceId === currentContact.sourceId
    );

    if (contactIndex !== -1) {
      const existingContact = allContacts[contactIndex];

      // Mark as hidden with no relationship type (unknown)
      existingContact.$jazz.set('dunbarLayer', 5);
      existingContact.$jazz.set('quickSortStatus', 'hidden');
      existingContact.$jazz.set('quickSortedAt', new Date().toISOString());
      existingContact.$jazz.set('relationshipType', undefined);
      existingContact.$jazz.set('isFamily', false);
      
      console.log(`✅ Contact quick-hidden: ${currentContact.name} → Unknown`);
      
      // Update state
      setSortedCount(sortedCount + 1);
    }
  };

  // Handle category button press
  const handleCategorySelect = async (layerId: number | "hidden") => {
    if (!me?.$isLoaded || !currentContact) return;

    console.log(`Tend Garden: ${currentContact.name} → ${layerId === "hidden" ? "Hidden" : `Layer ${layerId}`}`);
    console.log(`  Relationship Type: ${selectedRelationshipType || "Not set"}`);
    if (selectedRelationshipType === "FAMILY") {
      console.log(`  Family Tier: ${selectedFamilyTier || "Not set"}`);
    } else if (selectedRelationshipType === "FRIEND") {
      console.log(`  Connection Origin: ${selectedConnectionOrigin || "Not set"}`);
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

      // Update contact fields directly in the existing Jazz CoMap
      existingContact.$jazz.set('dunbarLayer', layerId === "hidden" ? 5 : layerId);
      existingContact.$jazz.set('quickSortStatus', layerId === "hidden" ? "hidden" : "sorted");
      existingContact.$jazz.set('quickSortedAt', new Date().toISOString());
      
      // Update relationship type if selected
      if (selectedRelationshipType) {
        existingContact.$jazz.set('relationshipType', selectedRelationshipType);
        existingContact.$jazz.set('isFamily', selectedRelationshipType === "FAMILY");
      }
      
      // Update subcategories based on type
      if (selectedRelationshipType === "FAMILY" && selectedFamilyTier) {
        existingContact.$jazz.set('familyTier', selectedFamilyTier);
      } else if (selectedRelationshipType === "FRIEND" && selectedConnectionOrigin) {
        existingContact.$jazz.set('connectionOrigin', selectedConnectionOrigin);
      } else if (selectedRelationshipType === "BUSINESS" && selectedBusinessTier) {
        existingContact.$jazz.set('businessTier', selectedBusinessTier);
      }
      
      // Update additional context fields
      if (knownSinceYear && knownSinceYear.length === 4) {
        existingContact.$jazz.set('knownSinceYear', parseInt(knownSinceYear));
      }
      if (closeEnoughToVisit) {
        existingContact.$jazz.set('closeEnoughToVisit', closeEnoughToVisit);
      }
      if (schoolName && selectedConnectionOrigin === "SCHOOL") {
        existingContact.$jazz.set('schoolName', schoolName);
      }
      if (hobbyName && selectedConnectionOrigin === "HOBBY_SPORTS") {
        existingContact.$jazz.set('hobbyName', hobbyName);
      }
      if (workCompany && selectedConnectionOrigin === "WORK") {
        existingContact.$jazz.set('workCompany', workCompany);
      }

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
    if (!me?.$isLoaded) return;

    console.log("🔄 Resetting Tend Garden statuses...");

    const root = me.root as any;
    const allContacts = root?.contacts || [];

    // Reset all contacts by updating them in-place
    Array.from(allContacts).forEach((c: any) => {
      c.$jazz.set('quickSortStatus', 'not_sorted');
      c.$jazz.set('quickSortedAt', undefined);
    });

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

        {/* Swipe Instructions */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center px-6">
            <View className="flex-row items-center gap-2 bg-red-950/20 border border-red-900/40 px-3 py-2 rounded">
              <MaterialIcons name="arrow-back" size={20} color="#ef4444" />
              <View>
                <Text className="text-red-400 text-[10px] font-bold">SWIPE LEFT</Text>
                <Text className="text-red-500 text-xs">Hide/Remove</Text>
              </View>
            </View>
            
            <View className="w-px h-8 bg-zinc-700" />
            
            <View className="flex-row items-center gap-2 bg-blue-950/20 border border-blue-900/40 px-3 py-2 rounded">
              <View className="items-end">
                <Text className="text-blue-400 text-[10px] font-bold">SWIPE RIGHT</Text>
                <Text className="text-blue-500 text-xs">Skip for Now</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={20} color="#3b82f6" />
            </View>
          </View>
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
                <Text className="text-white text-2xl font-bold text-center mb-4">
                  {currentContact.name}
                </Text>
                
                {/* Relationship Type Selector */}
                <View className="mb-4">
                  <Text className="text-zinc-400 text-xs text-center mb-2">
                    RELATIONSHIP TYPE
                  </Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setSelectedRelationshipType("FAMILY")}
                      className={`flex-1 py-2 px-2 border ${
                        selectedRelationshipType === "FAMILY"
                          ? "border-primary bg-primary/20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold text-center ${
                          selectedRelationshipType === "FAMILY"
                            ? "text-primary"
                            : "text-zinc-400"
                        }`}
                      >
                        👨‍👩‍👧‍👦 FAMILY
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setSelectedRelationshipType("FRIEND")}
                      className={`flex-1 py-2 px-2 border ${
                        selectedRelationshipType === "FRIEND"
                          ? "border-primary bg-primary/20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold text-center ${
                          selectedRelationshipType === "FRIEND"
                            ? "text-primary"
                            : "text-zinc-400"
                        }`}
                      >
                        👥 FRIEND
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setSelectedRelationshipType("BUSINESS")}
                      className={`flex-1 py-2 px-2 border ${
                        selectedRelationshipType === "BUSINESS"
                          ? "border-primary bg-primary/20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold text-center ${
                          selectedRelationshipType === "BUSINESS"
                            ? "text-primary"
                            : "text-zinc-400"
                        }`}
                      >
                        💼 BUSINESS
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
                      HOW DID YOU MEET?
                    </Text>
                    <View className="flex-row gap-2 mb-2">
                      <Pressable
                        onPress={() => setSelectedConnectionOrigin("FAMILY_FRIEND")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedConnectionOrigin === "FAMILY_FRIEND"
                            ? "border-green-500 bg-green-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedConnectionOrigin === "FAMILY_FRIEND"
                              ? "text-green-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Family
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedConnectionOrigin("NEIGHBOR")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedConnectionOrigin === "NEIGHBOR"
                            ? "border-green-500 bg-green-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedConnectionOrigin === "NEIGHBOR"
                              ? "text-green-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Neighbor
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedConnectionOrigin("SCHOOL")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedConnectionOrigin === "SCHOOL"
                            ? "border-green-500 bg-green-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedConnectionOrigin === "SCHOOL"
                              ? "text-green-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          School
                        </Text>
                      </Pressable>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => setSelectedConnectionOrigin("HOBBY_SPORTS")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedConnectionOrigin === "HOBBY_SPORTS"
                            ? "border-green-500 bg-green-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedConnectionOrigin === "HOBBY_SPORTS"
                              ? "text-green-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Hobby
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedConnectionOrigin("WORK")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedConnectionOrigin === "WORK"
                            ? "border-green-500 bg-green-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedConnectionOrigin === "WORK"
                              ? "text-green-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Work
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedConnectionOrigin("OTHER")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedConnectionOrigin === "OTHER"
                            ? "border-green-500 bg-green-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedConnectionOrigin === "OTHER"
                              ? "text-green-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Other
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
                    <View className="flex-row gap-2 mb-2">
                      <Pressable
                        onPress={() => setSelectedBusinessTier("CONTACT")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedBusinessTier === "CONTACT"
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedBusinessTier === "CONTACT"
                              ? "text-blue-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Contact
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
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => setSelectedBusinessTier("COWORKER")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedBusinessTier === "COWORKER"
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedBusinessTier === "COWORKER"
                              ? "text-blue-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Coworker
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedBusinessTier("CLIENT")}
                        className={`flex-1 py-2 px-2 border ${
                          selectedBusinessTier === "CLIENT"
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        <Text
                          className={`text-xs text-center ${
                            selectedBusinessTier === "CLIENT"
                              ? "text-blue-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          Client
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Known Since Year */}
                <View className="mb-3">
                  <Text className="text-zinc-400 text-xs mb-2">KNOWN SINCE (YYYY)?</Text>
                  
                  {/* Tappable Year Display */}
                  <Pressable 
                    onPress={() => setIsEditingYear(!isEditingYear)}
                    className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded mb-2"
                  >
                    <Text className="text-white text-center text-lg font-bold">
                      {knownSinceYear || "Select Year"}
                    </Text>
                  </Pressable>

                  {isEditingYear ? (
                    // Text input mode
                    <TextInput
                      value={knownSinceYear}
                      onChangeText={(text) => {
                        if (text.length <= 4) setKnownSinceYear(text);
                      }}
                      placeholder="Type year"
                      placeholderTextColor="#71717a"
                      maxLength={4}
                      keyboardType="numeric"
                      className="bg-zinc-900 border border-zinc-600 text-white px-3 py-2 rounded text-sm"
                      autoFocus
                    />
                  ) : (
                    // Slider mode
                    <View>
                      <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={1950}
                        maximumValue={new Date().getFullYear()}
                        step={1}
                        value={knownSinceYear ? parseInt(knownSinceYear) : new Date().getFullYear()}
                        onValueChange={(value) => setKnownSinceYear(Math.round(value).toString())}
                        minimumTrackTintColor="#3b82f6"
                        maximumTrackTintColor="#52525b"
                        thumbTintColor="#3b82f6"
                      />
                      <View className="flex-row justify-between px-1">
                        <Text className="text-zinc-500 text-xs">1950</Text>
                        <Text className="text-zinc-500 text-xs">{new Date().getFullYear()}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Close Enough to Visit */}
                <View className="mb-3">
                  <Text className="text-zinc-400 text-xs mb-2">CLOSE ENOUGH TO VISIT?</Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setCloseEnoughToVisit("YES")}
                      className={`flex-1 py-2 border ${
                        closeEnoughToVisit === "YES"
                          ? "border-green-500 bg-green-500/20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs text-center ${
                          closeEnoughToVisit === "YES"
                            ? "text-green-400 font-bold"
                            : "text-zinc-400"
                        }`}
                      >
                        Yes
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setCloseEnoughToVisit("SOMETIMES")}
                      className={`flex-1 py-2 border ${
                        closeEnoughToVisit === "SOMETIMES"
                          ? "border-yellow-500 bg-yellow-500/20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs text-center ${
                          closeEnoughToVisit === "SOMETIMES"
                            ? "text-yellow-400 font-bold"
                            : "text-zinc-400"
                        }`}
                      >
                        Sometimes
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setCloseEnoughToVisit("NO")}
                      className={`flex-1 py-2 border ${
                        closeEnoughToVisit === "NO"
                          ? "border-red-500 bg-red-500/20"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs text-center ${
                          closeEnoughToVisit === "NO"
                            ? "text-red-400 font-bold"
                            : "text-zinc-400"
                        }`}
                      >
                        No
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Context-specific input fields */}
                {selectedConnectionOrigin === "SCHOOL" && (
                  <View className="mb-3">
                    <Text className="text-zinc-400 text-xs mb-2">WHICH SCHOOL?</Text>
                    <TextInput
                      value={schoolName}
                      onChangeText={setSchoolName}
                      placeholder="School name"
                      placeholderTextColor="#71717a"
                      className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded text-sm"
                    />
                  </View>
                )}

                {selectedConnectionOrigin === "HOBBY_SPORTS" && (
                  <View className="mb-3">
                    <Text className="text-zinc-400 text-xs mb-2">WHICH HOBBY?</Text>
                    <TextInput
                      value={hobbyName}
                      onChangeText={setHobbyName}
                      placeholder="Hobby name"
                      placeholderTextColor="#71717a"
                      className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded text-sm"
                    />
                  </View>
                )}

                {selectedConnectionOrigin === "WORK" && (
                  <View className="mb-3">
                    <Text className="text-zinc-400 text-xs mb-2">WHICH COMPANY?</Text>
                    <TextInput
                      value={workCompany}
                      onChangeText={setWorkCompany}
                      placeholder="Company name"
                      placeholderTextColor="#71717a"
                      className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded text-sm"
                    />
                  </View>
                )}
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
              (selectedRelationshipType === 'FRIEND' && !!selectedConnectionOrigin) ||
              (selectedRelationshipType === 'BUSINESS' && !!selectedBusinessTier);
            const isComplete = hasRelationshipType && hasTier;
            
            let warningMessage = 'TAP A CATEGORY';
            if (!hasRelationshipType) {
              warningMessage = '⚠️ SELECT RELATIONSHIP TYPE FIRST';
            } else if (!hasTier) {
              if (selectedRelationshipType === 'FAMILY') {
                warningMessage = '⚠️ SELECT FAMILY TIER';
              } else if (selectedRelationshipType === 'FRIEND') {
                warningMessage = '⚠️ SELECT HOW YOU MET';
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
                  (selectedRelationshipType === 'FRIEND' && selectedConnectionOrigin) ||
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
                  (selectedRelationshipType === 'FRIEND' && selectedConnectionOrigin) ||
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
                  (selectedRelationshipType === 'FRIEND' && selectedConnectionOrigin) ||
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
      </View>
    </Modal>
  );
}
