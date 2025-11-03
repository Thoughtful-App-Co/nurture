/**
 * Graveyard Screen
 * 
 * Displays all hidden contacts - people the user has intentionally removed
 * from their active garden. Provides introspection and cleanup opportunities.
 * 
 * Features:
 * - View all hidden contacts with metadata (when hidden, last interaction)
 * - Unhide contacts (restore to not_sorted state)
 * - Delete contacts permanently (optional, careful action)
 * - Self-reflection: understand patterns in who you hide
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useAccount } from "jazz-tools/expo";
import { Contact, ContactList } from "@/jazz/schema";
import { Card, Button } from "@/components/ui";
import Animated, { FadeIn } from 'react-native-reanimated';

interface GraveyardScreenProps {
  onBack: () => void;
  hiddenContacts: any[];
  onContactUpdate?: (contact: any) => void;
}

export function GraveyardScreen({
  onBack,
  hiddenContacts,
  onContactUpdate,
}: GraveyardScreenProps) {
  const { me } = useAccount();
  const [processingContactId, setProcessingContactId] = useState<string | null>(null);

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Unhide a contact - restore to not_sorted state
  const handleUnhide = async (contact: any) => {
    if (!me) return;
    
    setProcessingContactId(contact.id);
    
    try {
      const root = me.root as any;
      const contacts = root?.contacts || [];
      const contactIndex = Array.from(contacts).findIndex((c: any) => c?.id === contact.id);
      
      if (contactIndex === -1) {
        Alert.alert("Error", "Contact not found");
        return;
      }

      const existingContact = contacts[contactIndex];

      // Create updated contact with not_sorted status
      const updatedContactData = Contact.create(
        {
          sourceId: existingContact.sourceId,
          name: existingContact.name,
          phoneNumber: existingContact.phoneNumber,
          email: existingContact.email,
          dunbarLayer: existingContact.dunbarLayer,
          interactionScore: existingContact.interactionScore,
          lastInteraction: existingContact.lastInteraction,
          interactionFrequency: existingContact.interactionFrequency,
          reciprocityScore: existingContact.reciprocityScore,
          contactInitiationRatio: existingContact.contactInitiationRatio,
          averageResponseTime: existingContact.averageResponseTime,
          callCount: existingContact.callCount,
          smsCount: existingContact.smsCount,
          totalDuration: existingContact.totalDuration,
          isFamily: existingContact.isFamily,
          familyTier: existingContact.familyTier,
          familyRole: existingContact.familyRole,
          relationshipType: existingContact.relationshipType,
          connectionOrigin: existingContact.connectionOrigin,
          businessTier: existingContact.businessTier,
          notes: existingContact.notes,
          cultivationGoal: existingContact.cultivationGoal,
          // Reset quick sort status to not_sorted
          quickSortStatus: "not_sorted",
          quickSortedAt: new Date().toISOString(),
          createdAt: existingContact.createdAt,
        },
        me
      );

      // Replace contact in list
      const newContactsList = Array.from(contacts).map((c: any, i: number) => 
        i === contactIndex ? updatedContactData : c
      );
      
      const newContacts = ContactList.create(newContactsList, me);
      root.$jazz.set('contacts', newContacts);

      console.log('✅ Contact unhidden:', contact.name);
      
      // Notify parent to refresh
      if (onContactUpdate) {
        onContactUpdate(updatedContactData);
      }
    } catch (error) {
      console.error('Error unhiding contact:', error);
      Alert.alert("Error", "Failed to unhide contact");
    } finally {
      setProcessingContactId(null);
    }
  };

  // Delete a contact permanently
  const handleDelete = async (contact: any) => {
    if (!me) return;
    
    Alert.alert(
      "Delete Contact?",
      `Are you sure you want to permanently delete ${contact.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setProcessingContactId(contact.id);
            
            try {
              const root = me.root as any;
              const contacts = root?.contacts || [];
              
              // Filter out the contact - need to use map approach for type safety
              const newContactsList = Array.from(contacts)
                .map((c: any) => c)
                .filter((c: any) => c?.id !== contact.id);
              
              const newContacts = ContactList.create(newContactsList as any, me);
              root.$jazz.set('contacts', newContacts);

              console.log('🗑️ Contact deleted:', contact.name);
              
              // Notify parent to refresh
              if (onContactUpdate) {
                onContactUpdate(null);
              }
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert("Error", "Failed to delete contact");
            } finally {
              setProcessingContactId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      className="flex-1 bg-black"
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-zinc-950 border-b-2 border-zinc-800">
        <Pressable
          onPress={onBack}
          className="mb-4"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text className="text-primary text-base">← Back to Garden</Text>
        </Pressable>
        
        <View className="flex-row items-center mb-2">
          <Text className="text-5xl mr-3">🪦</Text>
          <Text className="text-4xl text-zinc-400 font-bold tracking-wide">
            Graveyard
          </Text>
        </View>
        
        <Text className="text-base text-zinc-500 leading-relaxed">
          {hiddenContacts.length} {hiddenContacts.length === 1 ? 'person' : 'people'} buried here. 
          Contacts you've hidden from your garden.
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {hiddenContacts.length === 0 ? (
          // Empty state
          <View className="items-center justify-center py-20">
            <Text className="text-6xl mb-4">🌱</Text>
            <Text className="text-xl text-zinc-400 font-medium mb-2">
              No Hidden Contacts
            </Text>
            <Text className="text-sm text-zinc-600 text-center leading-relaxed px-8">
              When you hide contacts during "Tend Your Garden," they'll appear here
            </Text>
          </View>
        ) : (
          // Contact list
          <View className="space-y-3 pb-20">
            {hiddenContacts.map((contact) => {
              const isProcessing = processingContactId === contact.id;
              
              return (
                <Card key={contact.id} className="border-2 border-zinc-800 bg-zinc-950/50">
                  {/* Contact Header */}
                  <View className="mb-3">
                    <Text className="text-white text-lg font-medium mb-1">
                      {contact.name || "Unknown"}
                    </Text>
                    
                    <View className="flex-row items-center flex-wrap gap-2">
                      {contact.phoneNumber && (
                        <Text className="text-xs text-zinc-500">
                          📱 {contact.phoneNumber}
                        </Text>
                      )}
                      {contact.email && (
                        <Text className="text-xs text-zinc-500">
                          ✉️ {contact.email}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Metadata */}
                  <View className="mb-4 space-y-1">
                    <Text className="text-xs text-zinc-600">
                      Hidden: {formatDate(contact.quickSortedAt)}
                    </Text>
                    {contact.lastInteraction && (
                      <Text className="text-xs text-zinc-600">
                        Last interaction: {formatDate(contact.lastInteraction)}
                      </Text>
                    )}
                    {contact.relationshipType && (
                      <Text className="text-xs text-zinc-600">
                        Type: {contact.relationshipType}
                      </Text>
                    )}
                  </View>

                  {/* Interaction Stats (if available) */}
                  {(contact.callCount || contact.smsCount) && (
                    <View className="mb-4 p-2 bg-zinc-900 border border-zinc-800">
                      <Text className="text-xs text-zinc-500 mb-1">
                        Last 3 months:
                      </Text>
                      <View className="flex-row gap-3">
                        {contact.callCount > 0 && (
                          <Text className="text-xs text-zinc-400">
                            📞 {contact.callCount} calls
                          </Text>
                        )}
                        {contact.smsCount > 0 && (
                          <Text className="text-xs text-zinc-400">
                            💬 {contact.smsCount} texts
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Actions */}
                  <View className="flex-row gap-2">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onPress={() => handleUnhide(contact)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "🌱 Unhide"}
                    </Button>
                    <Pressable
                      onPress={() => handleDelete(contact)}
                      disabled={isProcessing}
                      className="px-4 py-3 bg-red-950/30 border-2 border-red-900 items-center justify-center"
                      accessibilityLabel={`Delete ${contact.name}`}
                      accessibilityRole="button"
                      style={({ pressed }) => ({ 
                        opacity: pressed || isProcessing ? 0.5 : 1,
                      })}
                    >
                      <Text className="text-red-500 text-sm font-semibold">
                        🗑️
                      </Text>
                    </Pressable>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}
