/**
 * Contact Search Component (Optimized)
 * 
 * High-performance search to find any contact and jump to their profile.
 * Optimizations:
 * - Debounced search (300ms) to reduce filtering operations
 * - FlashList virtualization for rendering 1000+ contacts
 * - Memoized contact cards to prevent unnecessary re-renders
 * - O(1) layer lookups using Map
 * - Pre-sorted contacts to avoid sorting on every search
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Modal, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAccount } from 'jazz-tools/expo';

interface Contact {
  id?: string;
  sourceId?: string;
  name: string;
  dunbarLayer?: number;
  interactionScore?: number;
  lastInteraction?: string;
  relationshipType?: 'FAMILY' | 'FRIEND' | 'BUSINESS';
  isFamily?: boolean;
  familyTier?: 'NUCLEAR' | 'SECONDARY' | 'TERTIARY';
  connectionOrigin?: 'FAMILY_FRIEND' | 'NEIGHBOR' | 'SCHOOL' | 'HOBBY_SPORTS' | 'WORK' | 'OTHER';
  businessTier?: 'CLOSE_COLLEAGUE' | 'ACQUAINTANCE';
  quickSortStatus?: 'not_sorted' | 'sorted' | 'hidden';
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
  { id: 0, name: "Loved Ones", color: "#ef4444" },
  { id: 1, name: "Inner Circle", color: "#f97316" },
  { id: 2, name: "Clan", color: "#eab308" },
  { id: 3, name: "Tribe", color: "#22c55e" },
  { id: 4, name: "Acquaintances", color: "#3b82f6" },
  { id: 5, name: "Social Nebula", color: "#8b5cf6" },
];

// O(1) layer lookup using Map
const LAYER_MAP = new Map(LAYERS.map(l => [l.id, l]));
const getLayerInfo = (layerId?: number) => LAYER_MAP.get(layerId ?? 5) ?? LAYERS[5];

// Relationship badge helper (memoized via useMemo in component)
const getRelationshipBadge = (contact: Contact) => {
  if (contact.relationshipType === 'FAMILY' && contact.familyTier) {
    const tierLabels = {
      NUCLEAR: 'Nuclear Family',
      SECONDARY: 'Extended',
      TERTIARY: 'Distant',
    };
    return { emoji: '👨‍👩‍👧‍👦', label: tierLabels[contact.familyTier], color: 'text-red-400 bg-red-950/30' };
  }
  if (contact.relationshipType === 'FRIEND' && contact.connectionOrigin) {
    const originLabels = {
      FAMILY_FRIEND: 'Family Friend',
      NEIGHBOR: 'Neighbor',
      SCHOOL: 'School',
      HOBBY_SPORTS: 'Hobby',
      WORK: 'Work',
      OTHER: 'Other',
    };
    return { emoji: '🤝', label: originLabels[contact.connectionOrigin], color: 'text-green-400 bg-green-950/30' };
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

// Memoized Contact Card Component
const ContactCard = React.memo(({ 
  contact, 
  onPress 
}: { 
  contact: Contact; 
  onPress: () => void;
}) => {
  const relationshipBadge = useMemo(() => getRelationshipBadge(contact), [contact]);
  const layerInfo = useMemo(() => getLayerInfo(contact.dunbarLayer), [contact.dunbarLayer]);

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 mx-6 bg-zinc-900 border border-zinc-800 p-4 active:bg-zinc-800"
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
            <Text className="text-zinc-400 text-sm">
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
}, (prevProps, nextProps) => {
  // Only re-render if contact ID changes
  return prevProps.contact.id === nextProps.contact.id;
});

ContactCard.displayName = 'ContactCard';

export function ContactSearch({ visible, contacts: contactsProp, onSelectContact, onClose }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load contacts internally when modal is visible (optimized)
  const me = useAccount(undefined, visible ? {
    resolve: {
      root: {
        layer0Contacts: { $each: true },
        layer1Contacts: { $each: true },
        layer2Contacts: { $each: true },
        layer3Contacts: { $each: true },
        layer4Contacts: { $each: true },
        layer5Contacts: { $each: true },
      }
    }
  } : undefined);
  
  // Collect contacts from loaded layer lists
  const loadedContacts = useMemo(() => {
    if (!visible || !me?.$isLoaded) return [];
    
    const root = me.root as any;
    const collected: Contact[] = [];
    
    // Collect from all layer lists
    for (let layerId = 0; layerId <= 5; layerId++) {
      const layerList = root?.[`layer${layerId}Contacts`];
      if (layerList) {
        try {
          Array.from(layerList)
            .filter((c: any) => c?.quickSortStatus !== "hidden")
            .forEach((c: any) => {
              if (c) {
                collected.push({
                  id: c?.fullContactId || c?.sourceId,
                  sourceId: c?.sourceId,
                  name: c?.name || 'Unknown',
                  dunbarLayer: c?.dunbarLayer,
                  interactionScore: c?.interactionScore,
                  lastInteraction: c?.lastInteraction,
                  isFamily: c?.isFamily,
                  quickSortStatus: c?.quickSortStatus,
                  relationshipType: c?.relationshipType,
                  familyTier: c?.familyTier,
                  connectionOrigin: c?.connectionOrigin,
                  businessTier: c?.businessTier,
                  phoneNumber: c?.phoneNumber,
                  email: c?.email,
                });
              }
            });
        } catch (error) {
          console.warn(`Error loading contacts from layer ${layerId}:`, error);
        }
      }
    }
    
    return collected;
  }, [visible, me?.$isLoaded]);
  
  // Use loaded contacts if available, fallback to prop (for backwards compatibility)
  const contacts = loadedContacts.length > 0 ? loadedContacts : contactsProp;
  
  // Debounce search query to reduce filtering operations
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  // Pre-sort contacts by interaction score (only once when contacts change)
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => 
      (b.interactionScore || 0) - (a.interactionScore || 0)
    );
  }, [contacts]);

  // Create search index for faster filtering
  const searchIndex = useMemo(() => 
    sortedContacts.map(contact => ({
      contact,
      searchText: `${contact.name} ${contact.phoneNumber || ''} ${contact.email || ''}`.toLowerCase(),
    })),
    [sortedContacts]
  );

  // Debounced search filtering
  const filteredContacts = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return sortedContacts;
    }

    const query = debouncedQuery.toLowerCase();
    
    // Fast filtering using pre-computed search index
    const matches = searchIndex
      .filter(({ searchText }) => searchText.includes(query))
      .map(({ contact }) => contact);

    // Sort by relevance: exact name match first, then by interaction score
    return matches.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().startsWith(query);
      const bNameMatch = b.name.toLowerCase().startsWith(query);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      return (b.interactionScore || 0) - (a.interactionScore || 0);
    });
  }, [debouncedQuery, sortedContacts, searchIndex]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    onClose();
  }, [onClose]);

  const handleSelectContact = useCallback((contact: Contact) => {
    onSelectContact(contact);
    handleClose();
  }, [onSelectContact, handleClose]);

  // Show loading state while debouncing
  const isSearching = searchQuery !== debouncedQuery;

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
            className="bg-zinc-900 text-white text-base px-4 py-3 border border-zinc-800"
          />

          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-zinc-400 text-sm">
              {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
            </Text>
            {isSearching && (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#22c55e" />
                <Text className="text-zinc-500 text-xs ml-2">Searching...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Results - Virtualized List */}
        {filteredContacts.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-6xl mb-4">🔍</Text>
            <Text className="text-center text-white text-xl font-semibold mb-2">
              No contacts found
            </Text>
            <Text className="text-center text-zinc-400 text-base">
              Try a different search term
            </Text>
          </View>
        ) : (
          <FlashList
            data={filteredContacts}
            renderItem={({ item }) => (
              <ContactCard
                contact={item}
                onPress={() => handleSelectContact(item)}
              />
            )}
            keyExtractor={(item, index) => item.id || `${item.name}-${index}`}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          />
        )}
      </View>
    </Modal>
  );
}
