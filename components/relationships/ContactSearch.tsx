/**
 * Contact Search Component
 * 
 * Fast search to find any contact and jump to their profile
 * Shows real-time results as you type
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Modal } from 'react-native';

interface Contact {
  id?: string;
  name: string;
  dunbarLayer?: number;
  interactionScore?: number;
  lastInteraction?: string;
  relationshipType?: 'FAMILY' | 'FRIEND' | 'BUSINESS';
  isFamily?: boolean;
  familyTier?: 'NUCLEAR' | 'SECONDARY' | 'TERTIARY';
  friendTier?: 'INNER_CIRCLE' | 'CLOSE_FRIEND' | 'GOOD_FRIEND' | 'CASUAL_FRIEND';
  businessTier?: 'CLOSE_COLLEAGUE' | 'ACQUAINTANCE';
  phoneNumber?: string;
  email?: string;
}

interface Props {
  visible: boolean;
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onClose: () => void;
}

const LAYERS = [
  { id: 0, name: "Intimate Core", color: "#ef4444" },
  { id: 1, name: "Sympathy Group", color: "#f97316" },
  { id: 2, name: "Close Group", color: "#eab308" },
  { id: 3, name: "Tribe", color: "#22c55e" },
  { id: 4, name: "Acquaintances", color: "#3b82f6" },
  { id: 5, name: "Social Nebula", color: "#8b5cf6" },
];

export function ContactSearch({ visible, contacts, onSelectContact, onClose }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time search filtering
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show all contacts sorted by interaction score
      return [...contacts].sort((a, b) => 
        (b.interactionScore || 0) - (a.interactionScore || 0)
      );
    }

    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => {
      const nameMatch = contact.name.toLowerCase().includes(query);
      const phoneMatch = contact.phoneNumber?.includes(query);
      const emailMatch = contact.email?.toLowerCase().includes(query);
      return nameMatch || phoneMatch || emailMatch;
    }).sort((a, b) => {
      // Sort by relevance: exact name match first, then by interaction score
      const aNameMatch = a.name.toLowerCase().startsWith(query);
      const bNameMatch = b.name.toLowerCase().startsWith(query);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      return (b.interactionScore || 0) - (a.interactionScore || 0);
    });
  }, [contacts, searchQuery]);

  const getRelationshipBadge = (contact: Contact) => {
    if (contact.relationshipType === 'FAMILY' && contact.familyTier) {
      const tierLabels = {
        NUCLEAR: 'Nuclear Family',
        SECONDARY: 'Extended',
        TERTIARY: 'Distant',
      };
      return { emoji: '👨‍👩‍👧‍👦', label: tierLabels[contact.familyTier], color: 'text-red-400 bg-red-950/30' };
    }
    if (contact.relationshipType === 'FRIEND' && contact.friendTier) {
      const tierLabels = {
        INNER_CIRCLE: 'Inner Circle',
        CLOSE_FRIEND: 'Close Friend',
        GOOD_FRIEND: 'Good Friend',
        CASUAL_FRIEND: 'Casual',
      };
      return { emoji: '🤝', label: tierLabels[contact.friendTier], color: 'text-green-400 bg-green-950/30' };
    }
    if (contact.relationshipType === 'BUSINESS' && contact.businessTier) {
      const tierLabels = {
        CLOSE_COLLEAGUE: 'Colleague',
        ACQUAINTANCE: 'Acquaintance',
      };
      return { emoji: '💼', label: tierLabels[contact.businessTier], color: 'text-blue-400 bg-blue-950/30' };
    }
    if (contact.isFamily) {
      return { emoji: '👨‍👩‍👧‍👦', label: 'Family', color: 'text-red-400 bg-red-950/30' };
    }
    return null;
  };

  const getLayerInfo = (layerId?: number) => {
    return LAYERS.find(l => l.id === layerId) || LAYERS[5];
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="px-6 pt-12 pb-4 border-b border-zinc-800">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl text-white font-semibold">
              Find Contact
            </Text>
            <Pressable onPress={handleClose}>
              <Text className="text-primary text-base">Close</Text>
            </Pressable>
          </View>

          {/* Search Input */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, phone, or email..."
            placeholderTextColor="#71717a"
            autoFocus
            className="bg-zinc-900 text-white text-lg px-4 py-4 border-2 border-zinc-800 focus:border-primary"
          />

          <Text className="text-zinc-500 text-sm mt-3">
            {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'} found
          </Text>
        </View>

        {/* Results */}
        <ScrollView className="flex-1">
          <View className="px-6 py-4">
            {filteredContacts.length === 0 ? (
              <View className="py-12">
                <Text className="text-center text-secondary text-base">
                  No contacts found
                </Text>
                <Text className="text-center text-zinc-600 text-sm mt-2">
                  Try a different search term
                </Text>
              </View>
            ) : (
              filteredContacts.map((contact, index) => {
                const relationshipBadge = getRelationshipBadge(contact);
                const layerInfo = getLayerInfo(contact.dunbarLayer);

                return (
                  <Pressable
                    key={contact.id || index}
                    onPress={() => {
                      onSelectContact(contact);
                      handleClose();
                    }}
                    className="mb-3 bg-zinc-900 border border-zinc-800 p-4 active:bg-zinc-800"
                  >
                    {/* Contact Name & Score */}
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-white text-lg font-medium mb-1">
                          {contact.name}
                        </Text>

                        {/* Relationship Badge */}
                        {relationshipBadge && (
                          <View className="flex-row items-center mb-2">
                            <View className={`px-2 py-1 ${relationshipBadge.color}`}>
                              <Text className={`text-xs font-medium ${relationshipBadge.color.split(' ')[0]}`}>
                                {relationshipBadge.emoji} {relationshipBadge.label}
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* Layer Info */}
                        <View className="flex-row items-center">
                          <View 
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: layerInfo.color }}
                          />
                          <Text className="text-secondary text-sm">
                            {layerInfo.name}
                          </Text>
                        </View>
                      </View>

                      {/* Interaction Score */}
                      {contact.interactionScore !== undefined && (
                        <View className="bg-zinc-800 px-3 py-1 rounded-full">
                          <Text className="text-primary text-xs font-medium">
                            {Math.round(contact.interactionScore)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Contact Info */}
                    {(contact.phoneNumber || contact.email) && (
                      <View className="mt-2 pt-2 border-t border-zinc-800">
                        {contact.phoneNumber && (
                          <Text className="text-zinc-400 text-xs mb-1">
                            📞 {contact.phoneNumber}
                          </Text>
                        )}
                        {contact.email && (
                          <Text className="text-zinc-400 text-xs">
                            ✉️ {contact.email}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Tap to view indicator */}
                    <View className="mt-2">
                      <Text className="text-zinc-600 text-xs text-right">
                        Tap to view →
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
