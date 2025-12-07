/**
 * Layer Detail Screen
 * Shows all contacts within a specific Dunbar layer
 * Allows quick viewing and editing of contact information
 * 
 * @design Aurora + Biomorphic Design System
 * - Organic border radius on cards
 * - Aurora glow header with layer color
 * - Subtle blob backgrounds on cards
 * - Haptic feedback on interactions
 */

import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ContactDetailModal } from './ContactDetailModal';
import { RelationshipTypeSelector, type RelationshipTypeData } from './RelationshipTypeSelector';
import { BlobBackground, LayerGlowIndicator } from '@/components/ui';
import { triggerHaptic } from '@/hooks/useHaptics';

interface Contact {
  id?: string;
  name: string;
  dunbarLayer?: number;
  interactionScore?: number;
  lastInteraction?: string;
  interactionFrequency?: number;
  relationshipType?: 'FAMILY' | 'FRIEND' | 'BUSINESS';
  isFamily?: boolean;
  familyTier?: 'NUCLEAR' | 'SECONDARY' | 'TERTIARY';
  connectionOrigin?: 'FAMILY_FRIEND' | 'NEIGHBOR' | 'SCHOOL' | 'HOBBY_SPORTS' | 'WORK' | 'OTHER';
  businessTier?: 'CLOSE_COLLEAGUE' | 'ACQUAINTANCE';
  familyRole?: string;
  notes?: string;
  cultivationGoal?: 'MAINTAIN' | 'STRENGTHEN' | 'RECONNECT' | 'DEPRIORITIZE';
  phoneNumber?: string;
  email?: string;
  quickSortStatus?: 'not_sorted' | 'sorted' | 'hidden';
  quickSortedAt?: string;
}

interface LayerInfo {
  id: number;
  name: string;
  range: string;
  color: string;
  description: string;
}

interface Props {
  layer: LayerInfo;
  contacts: Contact[];
  onBack: () => void;
  onContactUpdate: (contact: Contact) => void;
  onStartTendGarden?: () => void; // Optional callback to open Tend Garden
}

export function LayerDetailScreen({ layer, contacts, onBack, onContactUpdate, onStartTendGarden }: Props) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [relationshipSelectorContact, setRelationshipSelectorContact] = useState<Contact | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef<boolean>(false);

  // Calculate unsorted contacts in this layer
  const unsortedInLayer = contacts.filter(
    c => c.quickSortStatus === "not_sorted" || !c.quickSortStatus
  ).length;

  const formatLastInteraction = (date?: string) => {
    if (!date) return 'No recent contact';
    
    const daysAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`;
    return `${Math.floor(daysAgo / 365)} years ago`;
  };

  const getCultivationGoalColor = (goal?: string) => {
    switch (goal) {
      case 'STRENGTHEN': return 'text-green-400';
      case 'MAINTAIN': return 'text-blue-400';
      case 'RECONNECT': return 'text-orange-400';
      case 'DEPRIORITIZE': return 'text-zinc-500';
      default: return 'text-zinc-400';
    }
  };

  const handleLongPressStart = (contact: Contact) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setRelationshipSelectorContact(contact);
    }, 500); // 500ms long press
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePress = (contact: Contact) => {
    // Small delay to check if it was a long press
    setTimeout(() => {
      if (!isLongPress.current) {
        setSelectedContact(contact);
      }
      isLongPress.current = false;
    }, 50);
  };

  const handleRelationshipTypeSelect = (data: RelationshipTypeData) => {
    if (!relationshipSelectorContact) return;

    const updatedContact = {
      ...relationshipSelectorContact,
      relationshipType: data.relationshipType,
      isFamily: data.relationshipType === 'FAMILY',
      familyTier: data.familyTier,
      connectionOrigin: data.connectionOrigin,
      businessTier: data.businessTier,
    };

    onContactUpdate(updatedContact);
    setRelationshipSelectorContact(null);
  };

  const getRelationshipBadge = (contact: Contact) => {
    if (contact.relationshipType === 'FAMILY' && contact.familyTier) {
      const tierLabels = {
        NUCLEAR: 'Nuclear Family',
        SECONDARY: 'Extended Family',
        TERTIARY: 'Distant Family',
      };
      return { emoji: '👨‍👩‍👧‍👦', label: tierLabels[contact.familyTier], color: 'text-red-400' };
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
      return { emoji: '🤝', label: originLabels[contact.connectionOrigin], color: 'text-green-400' };
    }
    if (contact.relationshipType === 'BUSINESS' && contact.businessTier) {
      const tierLabels = {
        CLOSE_COLLEAGUE: 'Close Colleague',
        ACQUAINTANCE: 'Acquaintance',
      };
      return { emoji: '💼', label: tierLabels[contact.businessTier], color: 'text-blue-400' };
    }
    // Fallback for legacy isFamily field
    if (contact.isFamily) {
      return { emoji: '👨‍👩‍👧‍👦', label: 'Family', color: 'text-red-400' };
    }
    return null;
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header with Aurora glow */}
      <View className="px-6 pt-12 pb-6 border-b border-zinc-800/50 overflow-hidden">
        {/* Aurora blob background */}
        <BlobBackground 
          color={layer.color} 
          opacity={0.12} 
          size={300} 
          top={-100} 
          right={-80}
          rotation={-15}
        />
        
        <Pressable 
          onPress={() => {
            triggerHaptic('light');
            onBack();
          }} 
          className="mb-4 self-start"
        >
          <Text className="text-primary text-base font-medium">← Back to Garden</Text>
        </Pressable>
        
        <View className="flex-row items-center mb-3">
          {/* Glowing layer indicator */}
          <LayerGlowIndicator color={layer.color} size={16} active />
          <View className="ml-3">
            <Text className="text-3xl text-white font-semibold">
              {layer.name}
            </Text>
          </View>
        </View>
        
        <Text className="text-zinc-300 text-base mb-2">
          {contacts.length} {contacts.length === 1 ? 'person' : 'people'} • Expected: {layer.range}
        </Text>
        
        <Text className="text-zinc-400 text-sm leading-relaxed">
          {layer.description}
        </Text>
      </View>

      {/* Contact List - Using FlashList for virtualization (fast with 500+ contacts) */}
      <FlashList
        data={contacts.filter(c => c != null)}
        ListHeaderComponent={
          unsortedInLayer > 0 && onStartTendGarden ? (
            <View className="px-4 pt-4 pb-2">
              {/* Organic CTA card with glow */}
              <View 
                className="mb-6 bg-primary/10 border border-primary/30 p-5 rounded-2xl overflow-hidden"
                style={Platform.select({
                  ios: {
                    shadowColor: '#22c55e',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                  },
                  android: { elevation: 4 },
                })}
              >
                <BlobBackground color="#22c55e" opacity={0.08} size={200} top={-60} right={-40} />
                <View className="flex-row items-center mb-2">
                  <Text className="text-primary text-xs font-bold uppercase tracking-wider">
                    SORT NEEDED
                  </Text>
                </View>
                <Text className="text-white text-base font-medium mb-2">
                  {unsortedInLayer} contact{unsortedInLayer !== 1 ? 's' : ''} in this layer {unsortedInLayer !== 1 ? 'need' : 'needs'} classification
                </Text>
                <Text className="text-zinc-400 text-sm mb-4">
                  Use Tend Garden to quickly sort contacts into Family, Friends, or Business for better insights.
                </Text>
                <Pressable
                  onPress={() => {
                    triggerHaptic('medium');
                    onStartTendGarden();
                  }}
                  className="bg-primary py-3.5 px-5 rounded-xl"
                  accessibilityLabel="Open Tend Garden"
                  accessibilityRole="button"
                  style={({ pressed }) => ({ 
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <Text className="text-center text-sm font-bold text-black">
                    OPEN TEND GARDEN
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : <View className="h-4" />
        }
        ListEmptyComponent={
          <View className="py-12 px-6">
            <Text className="text-center text-secondary text-base">
              No contacts in this layer yet
            </Text>
          </View>
        }
        renderItem={({ item: contact }) => {
          const relationshipBadge = getRelationshipBadge(contact);
          
          return (
            <Pressable
              onPress={() => {
                triggerHaptic('light');
                handlePress(contact);
              }}
              onPressIn={() => handleLongPressStart(contact)}
              onPressOut={handlePressEnd}
              className="mx-4 mb-3 bg-zinc-900 border border-zinc-800/70 p-4 rounded-xl overflow-hidden active:bg-zinc-800/80"
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                  },
                  android: { elevation: 2 },
                }),
              ]}
            >
              {/* Contact Header */}
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-white text-lg font-medium mb-1">
                    {contact.name || 'Unknown'}
                  </Text>
                  
                  {relationshipBadge ? (
                    <View className="flex-row items-center mb-1 self-start bg-zinc-800/50 px-2 py-1 rounded-lg">
                      <Text className={`text-xs font-medium ${relationshipBadge.color}`}>
                        {relationshipBadge.emoji} {relationshipBadge.label.toUpperCase()}
                      </Text>
                    </View>
                  ) : null}
                  
                  <Text className="text-zinc-400 text-sm">
                    Last contact: {formatLastInteraction(contact.lastInteraction)}
                  </Text>
                </View>
                
                {contact.interactionScore !== undefined ? (
                  <View 
                    className="bg-zinc-800/80 px-3 py-1.5 rounded-full"
                    style={Platform.select({
                      ios: {
                        shadowColor: layer.color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                      },
                      android: {},
                    })}
                  >
                    <Text className="text-primary text-xs font-semibold">
                      {Math.round(contact.interactionScore)}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Quick Stats */}
              {contact.interactionFrequency !== undefined && contact.interactionFrequency > 0 && (
                <View className="flex-row items-center mb-2">
                  <Text className="text-zinc-500 text-xs">
                    {contact.interactionFrequency} interactions • Score: {Math.round(contact.interactionScore || 0)}
                  </Text>
                </View>
              )}

              {/* Cultivation Goal */}
              {contact.cultivationGoal && (
                <View className="mt-2 pt-2 border-t border-zinc-800/50">
                  <Text className={`text-xs font-medium ${getCultivationGoalColor(contact.cultivationGoal)}`}>
                    Goal: {contact.cultivationGoal}
                  </Text>
                </View>
              )}

              {/* Notes Preview */}
              {contact.notes && (
                <View className="mt-2 pt-2 border-t border-zinc-800/50">
                  <Text className="text-zinc-400 text-xs" numberOfLines={2}>
                    {contact.notes}
                  </Text>
                </View>
              )}

              {/* Tap to edit indicator */}
              <View className="mt-3">
                <Text className="text-zinc-600 text-xs text-right">
                  Tap to view • Hold for quick actions
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          layer={layer}
          onClose={() => setSelectedContact(null)}
          onSave={(updatedContact: Contact) => {
            onContactUpdate(updatedContact);
            setSelectedContact(null);
          }}
        />
      )}

      {/* Relationship Type Selector Modal */}
      {relationshipSelectorContact && (
        <RelationshipTypeSelector
          visible={true}
          contactName={relationshipSelectorContact.name}
          currentType={relationshipSelectorContact.relationshipType ? {
            relationshipType: relationshipSelectorContact.relationshipType,
            familyTier: relationshipSelectorContact.familyTier,
            connectionOrigin: relationshipSelectorContact.connectionOrigin,
            businessTier: relationshipSelectorContact.businessTier,
          } : undefined}
          onSelect={handleRelationshipTypeSelect}
          onClose={() => setRelationshipSelectorContact(null)}
        />
      )}
    </View>
  );
}
