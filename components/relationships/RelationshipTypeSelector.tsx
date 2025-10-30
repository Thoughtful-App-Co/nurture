/**
 * Relationship Type Selector Modal
 * 
 * Triggered by long-press on contact cards
 * Allows quick categorization: Family, Friends, or Business
 * Each category has subcategories for precise classification
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

export type RelationshipType = 'FAMILY' | 'FRIEND' | 'BUSINESS';
export type FamilyTier = 'NUCLEAR' | 'SECONDARY' | 'TERTIARY';
export type FriendTier = 'INNER_CIRCLE' | 'CLOSE_FRIEND' | 'GOOD_FRIEND' | 'CASUAL_FRIEND';
export type BusinessTier = 'CLOSE_COLLEAGUE' | 'ACQUAINTANCE';

export interface RelationshipTypeData {
  relationshipType: RelationshipType;
  familyTier?: FamilyTier;
  friendTier?: FriendTier;
  businessTier?: BusinessTier;
  familyRole?: string;
}

interface Props {
  visible: boolean;
  contactName: string;
  currentType?: RelationshipTypeData;
  onSelect: (data: RelationshipTypeData) => void;
  onClose: () => void;
}

export function RelationshipTypeSelector({ 
  visible, 
  contactName, 
  currentType,
  onSelect, 
  onClose 
}: Props) {
  const [selectedType, setSelectedType] = useState<RelationshipType | null>(
    currentType?.relationshipType || null
  );
  const [step, setStep] = useState<'type' | 'subcategory'>('type');

  const handleTypeSelect = (type: RelationshipType) => {
    setSelectedType(type);
    setStep('subcategory');
  };

  const handleSubcategorySelect = (subcategory: string) => {
    if (!selectedType) return;

    const data: RelationshipTypeData = {
      relationshipType: selectedType,
    };

    // Assign to the appropriate tier based on selected type
    if (selectedType === 'FAMILY') {
      data.familyTier = subcategory as FamilyTier;
    } else if (selectedType === 'FRIEND') {
      data.friendTier = subcategory as FriendTier;
    } else if (selectedType === 'BUSINESS') {
      data.businessTier = subcategory as BusinessTier;
    }

    onSelect(data);
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('type');
    setSelectedType(null);
    onClose();
  };

  const renderTypeSelection = () => (
    <View className="p-6">
      <Text className="text-2xl text-white font-semibold mb-2">
        {contactName}
      </Text>
      <Text className="text-secondary text-base mb-6">
        What's your relationship?
      </Text>

      {/* Family */}
      <Pressable
        onPress={() => handleTypeSelect('FAMILY')}
        className="mb-3 p-5 bg-red-950/30 border-2 border-red-900 active:bg-red-950/50"
      >
        <Text className="text-red-400 text-lg font-semibold mb-1">
          👨‍👩‍👧‍👦 Family
        </Text>
        <Text className="text-red-300 text-sm">
          Nuclear, extended, or in-laws
        </Text>
      </Pressable>

      {/* Friends */}
      <Pressable
        onPress={() => handleTypeSelect('FRIEND')}
        className="mb-3 p-5 bg-green-950/30 border-2 border-green-900 active:bg-green-950/50"
      >
        <Text className="text-green-400 text-lg font-semibold mb-1">
          🤝 Friends
        </Text>
        <Text className="text-green-300 text-sm">
          Social connections and close companions
        </Text>
      </Pressable>

      {/* Business */}
      <Pressable
        onPress={() => handleTypeSelect('BUSINESS')}
        className="mb-3 p-5 bg-blue-950/30 border-2 border-blue-900 active:bg-blue-950/50"
      >
        <Text className="text-blue-400 text-lg font-semibold mb-1">
          💼 Business
        </Text>
        <Text className="text-blue-300 text-sm">
          Professional contacts and colleagues
        </Text>
      </Pressable>

      {/* Cancel */}
      <Pressable
        onPress={resetAndClose}
        className="mt-4 p-4 border border-zinc-700"
      >
        <Text className="text-zinc-400 text-center text-base">
          Cancel
        </Text>
      </Pressable>
    </View>
  );

  const renderFamilySubcategories = () => (
    <View className="p-6">
      <Pressable onPress={() => setStep('type')} className="mb-4">
        <Text className="text-primary text-base">← Back</Text>
      </Pressable>

      <Text className="text-2xl text-white font-semibold mb-2">
        Family Member
      </Text>
      <Text className="text-secondary text-base mb-6">
        How close is this family member?
      </Text>

      <Pressable
        onPress={() => handleSubcategorySelect('NUCLEAR')}
        className="mb-3 p-5 bg-red-950/30 border-2 border-red-900 active:bg-red-950/50"
      >
        <Text className="text-red-400 text-lg font-semibold mb-1">
          Nuclear Family
        </Text>
        <Text className="text-red-300 text-sm">
          Spouse, children, parents, siblings
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleSubcategorySelect('SECONDARY')}
        className="mb-3 p-5 bg-red-950/20 border-2 border-red-800 active:bg-red-950/40"
      >
        <Text className="text-red-400 text-lg font-semibold mb-1">
          Extended Family
        </Text>
        <Text className="text-red-300 text-sm">
          Grandparents, aunts, uncles, cousins
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleSubcategorySelect('TERTIARY')}
        className="mb-3 p-5 bg-red-950/10 border-2 border-red-700 active:bg-red-950/30"
      >
        <Text className="text-red-400 text-lg font-semibold mb-1">
          Distant Family
        </Text>
        <Text className="text-red-300 text-sm">
          Extended relatives, in-laws, distant connections
        </Text>
      </Pressable>
    </View>
  );

  const renderFriendsSubcategories = () => (
    <View className="p-6">
      <Pressable onPress={() => setStep('type')} className="mb-4">
        <Text className="text-primary text-base">← Back</Text>
      </Pressable>

      <Text className="text-2xl text-white font-semibold mb-2">
        Friend
      </Text>
      <Text className="text-secondary text-base mb-6">
        How would you describe this friendship?
      </Text>

      <Pressable
        onPress={() => handleSubcategorySelect('INNER_CIRCLE')}
        className="mb-3 p-5 bg-green-950/30 border-2 border-green-900 active:bg-green-950/50"
      >
        <Text className="text-green-400 text-lg font-semibold mb-1">
          Inner Circle
        </Text>
        <Text className="text-green-300 text-sm">
          Your closest confidants (Layer 0-1)
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleSubcategorySelect('CLOSE_FRIEND')}
        className="mb-3 p-5 bg-green-950/20 border-2 border-green-800 active:bg-green-950/40"
      >
        <Text className="text-green-400 text-lg font-semibold mb-1">
          Close Friend
        </Text>
        <Text className="text-green-300 text-sm">
          Friends you see regularly (Layer 2)
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleSubcategorySelect('GOOD_FRIEND')}
        className="mb-3 p-5 bg-green-950/15 border-2 border-green-700 active:bg-green-950/35"
      >
        <Text className="text-green-400 text-lg font-semibold mb-1">
          Good Friend
        </Text>
        <Text className="text-green-300 text-sm">
          Part of your broader social circle (Layer 3)
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleSubcategorySelect('CASUAL_FRIEND')}
        className="mb-3 p-5 bg-green-950/10 border-2 border-green-600 active:bg-green-950/30"
      >
        <Text className="text-green-400 text-lg font-semibold mb-1">
          Casual Friend
        </Text>
        <Text className="text-green-300 text-sm">
          Occasional hangouts, friendly acquaintances (Layer 4+)
        </Text>
      </Pressable>
    </View>
  );

  const renderBusinessSubcategories = () => (
    <View className="p-6">
      <Pressable onPress={() => setStep('type')} className="mb-4">
        <Text className="text-primary text-base">← Back</Text>
      </Pressable>

      <Text className="text-2xl text-white font-semibold mb-2">
        Business Contact
      </Text>
      <Text className="text-secondary text-base mb-6">
        How do you know this person professionally?
      </Text>

      <Pressable
        onPress={() => handleSubcategorySelect('CLOSE_COLLEAGUE')}
        className="mb-3 p-5 bg-blue-950/30 border-2 border-blue-900 active:bg-blue-950/50"
      >
        <Text className="text-blue-400 text-lg font-semibold mb-1">
          Close Colleague
        </Text>
        <Text className="text-blue-300 text-sm">
          Work closely together, professional relationship
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleSubcategorySelect('ACQUAINTANCE')}
        className="mb-3 p-5 bg-blue-950/20 border-2 border-blue-800 active:bg-blue-950/40"
      >
        <Text className="text-blue-400 text-lg font-semibold mb-1">
          Acquaintance / Social Nebula
        </Text>
        <Text className="text-blue-300 text-sm">
          Professional network, occasional contact
        </Text>
      </Pressable>

      <View className="mt-4 p-4 border border-zinc-800 bg-zinc-900/50">
        <Text className="text-xs text-zinc-400 leading-relaxed">
          Note: If someone is closer than an acquaintance outside of work, consider marking them as a Friend instead.
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
      onRequestClose={resetAndClose}
    >
      <View className="flex-1 bg-black">
        {step === 'type' && renderTypeSelection()}
        {step === 'subcategory' && selectedType === 'FAMILY' && renderFamilySubcategories()}
        {step === 'subcategory' && selectedType === 'FRIEND' && renderFriendsSubcategories()}
        {step === 'subcategory' && selectedType === 'BUSINESS' && renderBusinessSubcategories()}
      </View>
    </Modal>
  );
}
