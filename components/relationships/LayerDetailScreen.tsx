/**
 * Layer Detail Screen
 * Shows all contacts within a specific Dunbar layer
 * Allows quick viewing and editing of contact information
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { ContactDetailModal } from './ContactDetailModal';

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
}

export function LayerDetailScreen({ layer, contacts, onBack, onContactUpdate }: Props) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

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

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-12 pb-6 border-b border-zinc-800">
        <Pressable onPress={onBack} className="mb-4">
          <Text className="text-primary text-base">← Back to Garden</Text>
        </Pressable>
        
        <View className="flex-row items-center mb-2">
          <View 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: layer.color }}
          />
          <Text className="text-3xl text-white font-semibold">
            {layer.name}
          </Text>
        </View>
        
        <Text className="text-secondary text-base mb-2">
          {contacts.length} {contacts.length === 1 ? 'person' : 'people'} • {layer.range} typical
        </Text>
        
        <Text className="text-zinc-400 text-sm leading-relaxed">
          {layer.description}
        </Text>
      </View>

      {/* Contact List */}
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          {contacts.length === 0 ? (
            <View className="py-12">
              <Text className="text-center text-secondary text-base">
                No contacts in this layer yet
              </Text>
            </View>
          ) : (
            contacts.map((contact, index) => (
              <Pressable
                key={contact.id || index}
                onPress={() => setSelectedContact(contact)}
                className="mb-3 bg-zinc-900 border border-zinc-800 p-4 active:bg-zinc-800"
              >
                {/* Contact Header */}
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-white text-lg font-medium mb-1">
                      {contact.name}
                    </Text>
                    
                    {contact.isFamily && (
                      <View className="flex-row items-center mb-1">
                        <Text className="text-xs text-primary font-medium mr-2">
                          👨‍👩‍👧‍👦 FAMILY
                        </Text>
                        {contact.familyRole && (
                          <Text className="text-xs text-zinc-400">
                            {contact.familyRole}
                          </Text>
                        )}
                      </View>
                    )}
                    
                    <Text className="text-secondary text-sm">
                      Last contact: {formatLastInteraction(contact.lastInteraction)}
                    </Text>
                  </View>
                  
                  {contact.interactionScore !== undefined && (
                    <View className="bg-zinc-800 px-3 py-1 rounded-full">
                      <Text className="text-primary text-xs font-medium">
                        {Math.round(contact.interactionScore)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Quick Stats */}
                {contact.interactionFrequency !== undefined && contact.interactionFrequency > 0 && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-zinc-500 text-xs">
                      {contact.interactionFrequency} interactions • 
                    </Text>
                    <Text className="text-zinc-500 text-xs ml-1">
                      Score: {Math.round(contact.interactionScore || 0)}
                    </Text>
                  </View>
                )}

                {/* Cultivation Goal */}
                {contact.cultivationGoal && (
                  <View className="mt-2 pt-2 border-t border-zinc-800">
                    <Text className={`text-xs font-medium ${getCultivationGoalColor(contact.cultivationGoal)}`}>
                      Goal: {contact.cultivationGoal}
                    </Text>
                  </View>
                )}

                {/* Notes Preview */}
                {contact.notes && (
                  <View className="mt-2 pt-2 border-t border-zinc-800">
                    <Text className="text-zinc-400 text-xs" numberOfLines={2}>
                      {contact.notes}
                    </Text>
                  </View>
                )}

                {/* Tap to edit indicator */}
                <View className="mt-2">
                  <Text className="text-zinc-600 text-xs text-right">
                    Tap to view/edit →
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

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
    </View>
  );
}
