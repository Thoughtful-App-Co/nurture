/**
 * Contact Detail Modal
 * Allows viewing and editing contact information, notes, and cultivation goals
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal } from 'react-native';
import { ManualInteractionLogger } from './ManualInteractionLogger';

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
  isFavorite?: boolean;
  qualityRating?: number;
  // Debug/transparency fields
  callCount?: number;
  smsCount?: number;
  totalDuration?: number;
  reciprocityScore?: number;
  contactInitiationRatio?: number;
  averageResponseTime?: number;
}

interface LayerInfo {
  id: number;
  name: string;
  color: string;
}

interface Props {
  contact: Contact;
  layer: LayerInfo;
  onClose: () => void;
  onSave: (contact: Contact) => void;
}

export function ContactDetailModal({ contact, layer, onClose, onSave }: Props) {
  const [editedContact, setEditedContact] = useState<Contact>(contact);
  const [isEditing, setIsEditing] = useState(false);
  const [showInteractionLogger, setShowInteractionLogger] = useState(false);

  const cultivationGoals: Array<{ value: Contact['cultivationGoal']; label: string; color: string }> = [
    { value: 'STRENGTHEN', label: 'Strengthen', color: 'bg-green-900 text-green-400' },
    { value: 'MAINTAIN', label: 'Maintain', color: 'bg-blue-900 text-blue-400' },
    { value: 'RECONNECT', label: 'Reconnect', color: 'bg-orange-900 text-orange-400' },
    { value: 'DEPRIORITIZE', label: 'Deprioritize', color: 'bg-zinc-800 text-zinc-500' },
  ];

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

  const handleSave = () => {
    onSave(editedContact);
    setIsEditing(false);
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="px-6 pt-12 pb-4 border-b border-zinc-800 flex-row justify-between items-center">
          <Pressable onPress={onClose}>
            <Text className="text-primary text-base">← Back</Text>
          </Pressable>
          
          {isEditing ? (
            <Pressable onPress={handleSave}>
              <Text className="text-primary text-base font-semibold">Save</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setIsEditing(true)}>
              <Text className="text-primary text-base">Edit</Text>
            </Pressable>
          )}
        </View>

        <ScrollView className="flex-1">
          <View className="px-6 py-6">
            {/* Contact Name & Layer */}
            <View className="mb-6">
              <Text className="text-3xl text-white font-semibold mb-3">
                {contact.name}
              </Text>
              
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: layer.color }}
                />
                <Text className="text-secondary text-base">
                  {layer.name}
                </Text>
              </View>
              
              <View className="flex-row items-center mt-2 gap-3">
                {contact.isFamily && (
                  <View className="flex-row items-center">
                    <Text className="text-primary text-sm font-medium mr-2">
                      👨‍👩‍👧‍👦 Family
                    </Text>
                    {contact.familyRole && (
                      <Text className="text-zinc-400 text-sm">
                        ({contact.familyRole})
                      </Text>
                    )}
                  </View>
                )}
                
                {isEditing ? (
                  <Pressable
                    onPress={() => setEditedContact({ 
                      ...editedContact, 
                      isFavorite: !editedContact.isFavorite 
                    })}
                    className={`flex-row items-center px-3 py-1.5 border ${
                      editedContact.isFavorite 
                        ? 'border-yellow-500 bg-yellow-950/30' 
                        : 'border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      editedContact.isFavorite ? 'text-yellow-400' : 'text-zinc-500'
                    }`}>
                      ⭐ {editedContact.isFavorite ? 'Favorited' : 'Add to Favorites'}
                    </Text>
                  </Pressable>
                ) : contact.isFavorite ? (
                  <View className="flex-row items-center px-3 py-1.5 border border-yellow-500 bg-yellow-950/30">
                    <Text className="text-yellow-400 text-sm font-medium">
                      ⭐ Favorite
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Contact Info */}
            <View className="mb-6 p-4 bg-zinc-900 border border-zinc-800">
              <Text className="text-sm text-secondary font-medium mb-3">
                CONTACT INFORMATION
              </Text>
              
              {contact.phoneNumber && (
                <View className="mb-2">
                  <Text className="text-zinc-400 text-xs mb-1">Phone</Text>
                  <Text className="text-white text-base">{contact.phoneNumber}</Text>
                </View>
              )}
              
              {contact.email && (
                <View className="mb-2">
                  <Text className="text-zinc-400 text-xs mb-1">Email</Text>
                  <Text className="text-white text-base">{contact.email}</Text>
                </View>
              )}
              
              <View className="mt-3 pt-3 border-t border-zinc-800">
                <Text className="text-zinc-400 text-xs mb-1">Last Contact</Text>
                <Text className="text-white text-base">
                  {formatLastInteraction(contact.lastInteraction)}
                </Text>
              </View>
            </View>

            {/* Interaction Stats */}
            <View className="mb-6 p-4 bg-zinc-900 border border-zinc-800">
              <Text className="text-sm text-secondary font-medium mb-3">
                INTERACTION STATS
              </Text>
              
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-zinc-400 text-xs mb-1">Score</Text>
                  <Text className="text-primary text-2xl font-bold">
                    {Math.round(contact.interactionScore || 0)}
                  </Text>
                </View>
                
                <View>
                  <Text className="text-zinc-400 text-xs mb-1">Interactions</Text>
                  <Text className="text-white text-2xl font-bold">
                    {contact.interactionFrequency || 0}
                  </Text>
                </View>
              </View>
              
              <Text className="text-zinc-500 text-xs mt-2">
                Based on calls, messages, and contact frequency over the last 3 months
              </Text>
              
              {/* Quality Rating */}
              {contact.qualityRating && (
                <View className="mt-4 pt-4 border-t border-zinc-800">
                  <Text className="text-zinc-400 text-xs mb-1">Average Interaction Quality</Text>
                  <View className="flex-row items-center">
                    <Text className="text-yellow-400 text-xl font-bold mr-2">
                      {contact.qualityRating.toFixed(1)}
                    </Text>
                    <View className="flex-row">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Text key={i} className="text-base">
                          {i < Math.round(contact.qualityRating || 0) ? '⭐' : '☆'}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <Text className="text-zinc-500 text-xs mt-1">
                    From your manual interaction logs
                  </Text>
                </View>
              )}
            </View>

            {/* Cultivation Goal */}
            <View className="mb-6">
              <Text className="text-sm text-secondary font-medium mb-3">
                CULTIVATION GOAL
              </Text>
              
              {isEditing ? (
                <View className="flex-row flex-wrap gap-2">
                  {cultivationGoals.map(goal => (
                    <Pressable
                      key={goal.value}
                      onPress={() => setEditedContact({ ...editedContact, cultivationGoal: goal.value })}
                      className={`px-4 py-3 border-2 ${
                        editedContact.cultivationGoal === goal.value
                          ? `${goal.color} border-current`
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <Text className={
                        editedContact.cultivationGoal === goal.value
                          ? goal.color.split(' ')[1]
                          : 'text-zinc-400'
                      }>
                        {goal.label}
                      </Text>
                    </Pressable>
                  ))}
                  
                  <Pressable
                    onPress={() => setEditedContact({ ...editedContact, cultivationGoal: undefined })}
                    className="px-4 py-3 border-2 bg-zinc-900 text-zinc-400 border-zinc-800"
                  >
                    <Text className="text-zinc-400">None</Text>
                  </Pressable>
                </View>
              ) : (
                <View>
                  {contact.cultivationGoal ? (
                    <View className={`px-4 py-3 ${
                      cultivationGoals.find(g => g.value === contact.cultivationGoal)?.color || 'bg-zinc-900 text-zinc-400'
                    }`}>
                      <Text className={
                        cultivationGoals.find(g => g.value === contact.cultivationGoal)?.color.split(' ')[1] || 'text-zinc-400'
                      }>
                        {cultivationGoals.find(g => g.value === contact.cultivationGoal)?.label}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-zinc-500 text-base italic">No goal set</Text>
                  )}
                </View>
              )}
              
              <View className="mt-3 p-3 bg-zinc-900/50 border border-zinc-800">
                <Text className="text-xs text-zinc-400 leading-relaxed">
                  <Text className="text-green-400 font-medium">Strengthen:</Text> Intentionally deepen this relationship{'\n'}
                  <Text className="text-blue-400 font-medium">Maintain:</Text> Keep current level of contact{'\n'}
                  <Text className="text-orange-400 font-medium">Reconnect:</Text> Reach out after time apart{'\n'}
                  <Text className="text-zinc-500 font-medium">Deprioritize:</Text> Naturally let this fade
                </Text>
              </View>
            </View>

            {/* Interaction Breakdown (Debug/Transparency) */}
            <View className="mb-6">
              <Text className="text-sm text-secondary font-medium mb-3">
                INTERACTION BREAKDOWN
              </Text>
              
              <View className="p-4 bg-zinc-900 border border-zinc-800">
                <Text className="text-xs text-zinc-500 mb-3">
                  Last 3 months of activity
                  {(!contact.callCount && !contact.smsCount) && (
                    <Text className="text-orange-400"> • Re-analyze to see detailed breakdown</Text>
                  )}
                </Text>
                
                {/* Call Stats */}
                <View className="mb-3 pb-3 border-b border-zinc-800">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-white text-sm font-medium">📞 Voice Calls</Text>
                    <Text className="text-primary text-sm font-bold">
                      {contact.callCount || 0}
                    </Text>
                  </View>
                  {contact.totalDuration !== undefined && contact.totalDuration > 0 && (
                    <Text className="text-zinc-400 text-xs">
                      Total duration: {Math.floor((contact.totalDuration || 0) / 60)} min
                      {contact.callCount && contact.callCount > 0 && (
                        <Text> • Avg: {Math.floor((contact.totalDuration || 0) / (contact.callCount || 1) / 60)} min/call</Text>
                      )}
                    </Text>
                  )}
                </View>
                
                {/* SMS Stats */}
                <View className="mb-3 pb-3 border-b border-zinc-800">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-white text-sm font-medium">💬 Text Messages</Text>
                    <Text className="text-primary text-sm font-bold">
                      {contact.smsCount || 0}
                    </Text>
                  </View>
                  {contact.reciprocityScore !== undefined && contact.reciprocityScore > 0 && (
                    <Text className="text-zinc-400 text-xs">
                      Reciprocity: {Math.round((contact.reciprocityScore || 0) * 100)}%
                    </Text>
                  )}
                </View>
                
                {/* Combined Metrics */}
                <View className="mb-2">
                  <Text className="text-white text-sm font-medium mb-2">📊 Metrics</Text>
                  <View className="space-y-1">
                    <View className="flex-row justify-between">
                      <Text className="text-zinc-400 text-xs">Total interactions:</Text>
                      <Text className="text-white text-xs font-medium">
                        {(contact.callCount || 0) + (contact.smsCount || 0)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-zinc-400 text-xs">Interaction score:</Text>
                      <Text className="text-white text-xs font-medium">
                        {Math.round(contact.interactionScore || 0)}/100
                      </Text>
                    </View>
                    {contact.contactInitiationRatio !== undefined && (
                      <View className="flex-row justify-between">
                        <Text className="text-zinc-400 text-xs">You initiate:</Text>
                        <Text className="text-white text-xs font-medium">
                          {Math.round((contact.contactInitiationRatio || 0) * 100)}%
                        </Text>
                      </View>
                    )}
                    {contact.averageResponseTime !== undefined && contact.averageResponseTime > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-zinc-400 text-xs">Avg response time:</Text>
                        <Text className="text-white text-xs font-medium">
                          {Math.floor((contact.averageResponseTime || 0) / 3600)}h
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View className="mt-3 pt-3 border-t border-zinc-800">
                  <Text className="text-xs text-zinc-500 italic">
                    This data shows your behavioral reality with this person. It's not about judgment - it's about awareness.
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View className="mb-6">
              <Text className="text-sm text-secondary font-medium mb-3">
                QUICK ACTIONS
              </Text>
              
              <Pressable
                onPress={() => setShowInteractionLogger(true)}
                className="bg-primary py-4 px-6 mb-3"
              >
                <Text className="text-center text-base font-bold text-black">
                  + Log Interaction
                </Text>
              </Pressable>
              
              <Text className="text-xs text-zinc-500 text-center">
                Manually log calls, meetings, or social media chats
              </Text>
            </View>

            {/* Notes */}
            <View className="mb-6">
              <Text className="text-sm text-secondary font-medium mb-3">
                NOTES
              </Text>
              
              {isEditing ? (
                <TextInput
                  value={editedContact.notes || ''}
                  onChangeText={(text) => setEditedContact({ ...editedContact, notes: text })}
                  placeholder="Add notes about this relationship..."
                  placeholderTextColor="#71717a"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="bg-zinc-900 text-white text-base px-4 py-4 border border-zinc-800 rounded-none min-h-32"
                />
              ) : (
                <View className="p-4 bg-zinc-900 border border-zinc-800">
                  {contact.notes ? (
                    <Text className="text-white text-base leading-relaxed">
                      {contact.notes}
                    </Text>
                  ) : (
                    <Text className="text-zinc-500 text-base italic">
                      No notes yet. Tap Edit to add notes.
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Manual Interaction Logger Modal */}
        <ManualInteractionLogger
          visible={showInteractionLogger}
          contact={{
            id: contact.id,
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            email: contact.email,
          }}
          onSave={(interaction) => {
            console.log('Manual interaction logged:', interaction);
            // TODO: Save to Jazz database
            alert(`Interaction logged with ${contact.name}!\n\nType: ${interaction.type}\nQuality: ${interaction.quality}/5`);
            setShowInteractionLogger(false);
          }}
          onClose={() => setShowInteractionLogger(false)}
        />
      </View>
    </Modal>
  );
}
