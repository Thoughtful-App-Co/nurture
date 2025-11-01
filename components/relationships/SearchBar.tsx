/**
 * Persistent Search Bar Component
 * 
 * A tappable search affordance that sits at the top of the dashboard.
 * Follows the Nurture design system with clean, minimal styling.
 * Opens the full ContactSearch modal when tapped.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  totalContacts: number;
  onPress: () => void;
}

export function SearchBar({ totalContacts, onPress }: Props) {
  return (
    <Pressable 
      onPress={onPress}
      className="bg-zinc-900 border border-zinc-800 px-4 py-3 flex-row items-center active:bg-zinc-800"
    >
      {/* Search Icon */}
      <Text className="text-2xl mr-3">🔍</Text>
      
      {/* Placeholder Text */}
      <Text className="text-zinc-500 text-base flex-1">
        Search contacts...
      </Text>
      
      {/* Contact Count Badge */}
      <View className="bg-zinc-800 px-3 py-1 rounded-full">
        <Text className="text-zinc-400 text-xs font-medium">
          {totalContacts}
        </Text>
      </View>
    </Pressable>
  );
}
