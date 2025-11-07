/**
 * Manual Interaction Logger
 * 
 * Allows users to manually log interactions when automatic data isn't available:
 * - iOS users (no call/SMS access)
 * - Social media interactions
 * - In-person meetings
 * - Quality ratings
 * 
 * This is ESSENTIAL for:
 * 1. iOS users who have no call/SMS data
 * 2. Capturing social media/messaging app interactions
 * 3. Face-to-face meetings that aren't tracked
 * 4. Providing quality over quantity metrics
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal } from 'react-native';
import { Phone, ChatCircle, VideoCamera, EnvelopeSimple, Users, Star } from 'phosphor-react-native';
import { z } from 'zod';

interface Contact {
  id?: string;
  name: string;
  phoneNumber?: string;
  email?: string;
}

interface ManualInteraction {
  contactId: string;
  contactName: string;
  date: string; // ISO date
  type: 'face-to-face' | 'call' | 'text' | 'video' | 'email' | 'social-media' | 'other';
  duration?: number; // in minutes
  quality: 1 | 2 | 3 | 4 | 5; // 1-5 rating
  notes?: string;
  platform?: string; // e.g., "Instagram", "WhatsApp", "Slack"
}

interface Props {
  contact?: Contact; // Pre-selected contact, or allow user to search
  onSave: (interaction: ManualInteraction) => void;
  onClose: () => void;
  visible: boolean;
}

const INTERACTION_TYPES = [
  { 
    value: 'face-to-face' as const, 
    label: 'In Person', 
    icon: Users, 
    color: '#22c55e',
    description: 'Face-to-face meeting, hangout, or event'
  },
  { 
    value: 'call' as const, 
    label: 'Phone Call', 
    icon: Phone, 
    color: '#3b82f6',
    description: 'Voice call (any app)'
  },
  { 
    value: 'video' as const, 
    label: 'Video Call', 
    icon: VideoCamera, 
    color: '#8b5cf6',
    description: 'Zoom, FaceTime, etc.'
  },
  { 
    value: 'text' as const, 
    label: 'Messaging', 
    icon: ChatCircle, 
    color: '#eab308',
    description: 'Text, WhatsApp, iMessage, etc.'
  },
  { 
    value: 'social-media' as const, 
    label: 'Social Media', 
    icon: ChatCircle, 
    color: '#f97316',
    description: 'Instagram DM, Twitter, etc.'
  },
  { 
    value: 'email' as const, 
    label: 'Email', 
    icon: EnvelopeSimple, 
    color: '#64748b',
    description: 'Email correspondence'
  },
];

const QUALITY_LEVELS = [
  { value: 5, label: 'Excellent', description: 'Deep, meaningful connection', emoji: '🌟' },
  { value: 4, label: 'Good', description: 'Quality conversation, felt great', emoji: '😊' },
  { value: 3, label: 'Okay', description: 'Pleasant but surface-level', emoji: '😐' },
  { value: 2, label: 'Meh', description: 'Felt obligatory or draining', emoji: '😕' },
  { value: 1, label: 'Poor', description: 'Uncomfortable or negative', emoji: '😞' },
];

// Zod validation schemas
const durationSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, { message: "Duration must be a number" })
  .refine((val) => parseInt(val) > 0 && parseInt(val) <= 1440, {
    message: "Duration must be between 1 and 1440 minutes (24 hours)",
  });

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format" })
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date <= new Date();
  }, { message: "Date must be valid and not in the future" });

const notesSchema = z
  .string()
  .max(500, { message: "Notes must be less than 500 characters" });

const platformSchema = z
  .string()
  .max(50, { message: "Platform name must be less than 50 characters" });

export function ManualInteractionLogger({ contact, onSave, onClose, visible }: Props) {
  const [selectedType, setSelectedType] = useState<ManualInteraction['type']>('face-to-face');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [duration, setDuration] = useState('');
  const [quality, setQuality] = useState<ManualInteraction['quality']>(4);
  const [notes, setNotes] = useState('');
  const [platform, setPlatform] = useState('');
  const [errors, setErrors] = useState<{
    duration?: string;
    date?: string;
    notes?: string;
    platform?: string;
  }>({});

  const validateDuration = (value: string): boolean => {
    if (!value || value.trim() === '') {
      setErrors(prev => ({ ...prev, duration: undefined }));
      return true;
    }
    
    try {
      durationSchema.parse(value);
      setErrors(prev => ({ ...prev, duration: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, duration: error.errors[0]?.message }));
      }
      return false;
    }
  };

  const validateDate = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, date: 'Date is required' }));
      return false;
    }
    
    try {
      dateSchema.parse(value);
      setErrors(prev => ({ ...prev, date: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, date: error.errors[0]?.message }));
      }
      return false;
    }
  };

  const validateNotes = (value: string): boolean => {
    try {
      notesSchema.parse(value);
      setErrors(prev => ({ ...prev, notes: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, notes: error.errors[0]?.message }));
      }
      return false;
    }
  };

  const validatePlatform = (value: string): boolean => {
    try {
      platformSchema.parse(value);
      setErrors(prev => ({ ...prev, platform: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, platform: error.errors[0]?.message }));
      }
      return false;
    }
  };

  const handleSave = () => {
    if (!contact) {
      alert('Please select a contact first');
      return;
    }

    // Validate all fields before saving
    const isDurationValid = !duration || validateDuration(duration);
    const isDateValid = validateDate(date);
    const isNotesValid = validateNotes(notes);
    const isPlatformValid = validatePlatform(platform);

    if (!isDurationValid || !isDateValid || !isNotesValid || !isPlatformValid) {
      return;
    }

    const interaction: ManualInteraction = {
      contactId: contact.id || '',
      contactName: contact.name,
      date: new Date(date).toISOString(),
      type: selectedType,
      duration: duration ? parseInt(duration) : undefined,
      quality,
      notes: notes.trim() || undefined,
      platform: platform.trim() || undefined,
    };

    onSave(interaction);
    
    // Reset form
    setSelectedType('face-to-face');
    setDate(new Date().toISOString().split('T')[0]);
    setDuration('');
    setQuality(4);
    setNotes('');
    setPlatform('');
    setErrors({});
  };

  const selectedTypeInfo = INTERACTION_TYPES.find(t => t.value === selectedType);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="px-6 pt-12 pb-4 border-b border-zinc-800 flex-row justify-between items-center">
          <Pressable onPress={onClose}>
            <Text className="text-zinc-400 text-base">Cancel</Text>
          </Pressable>
          
          <Text className="text-white text-lg font-semibold">Log Interaction</Text>
          
          <Pressable onPress={handleSave}>
            <Text className="text-primary text-base font-semibold">Save</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1">
          <View className="px-6 py-6">
            {/* Contact Info */}
            {contact && (
              <View className="mb-6 p-4 bg-zinc-900 border border-zinc-800">
                <Text className="text-sm text-secondary mb-1">LOGGING FOR</Text>
                <Text className="text-2xl text-white font-semibold">{contact.name}</Text>
              </View>
            )}

            {/* Interaction Type */}
            <View className="mb-6">
              <Text className="text-sm text-secondary font-medium mb-3">
                INTERACTION TYPE
              </Text>
              
              <View className="space-y-2">
                {INTERACTION_TYPES.map(type => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.value;
                  
                  return (
                    <Pressable
                      key={type.value}
                      onPress={() => setSelectedType(type.value)}
                      className={`p-4 border-2 flex-row items-center ${
                        isSelected 
                          ? 'border-primary bg-green-950/30' 
                          : 'border-zinc-800 bg-zinc-900'
                      }`}
                    >
                      <Icon 
                        size={24} 
                        weight={isSelected ? 'fill' : 'regular'}
                        color={isSelected ? '#22c55e' : type.color}
                      />
                      <View className="ml-3 flex-1">
                        <Text className={`text-base font-medium ${
                          isSelected ? 'text-primary' : 'text-white'
                        }`}>
                          {type.label}
                        </Text>
                        <Text className="text-xs text-zinc-400 mt-0.5">
                          {type.description}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Platform (for digital interactions) */}
            {['text', 'social-media', 'video', 'call'].includes(selectedType) && (
              <View className="mb-6">
                <Text className="text-sm text-secondary font-medium mb-2">
                  PLATFORM (OPTIONAL)
                </Text>
                <TextInput
                  value={platform}
                  onChangeText={(text) => {
                    setPlatform(text);
                    validatePlatform(text);
                  }}
                  onBlur={() => validatePlatform(platform)}
                  placeholder="WhatsApp, Instagram, Zoom, etc."
                  placeholderTextColor="#71717a"
                  className={`bg-zinc-900 text-white text-base px-4 py-3 border ${
                    errors.platform ? 'border-red-500' : 'border-zinc-800'
                  }`}
                />
                {errors.platform ? (
                  <Text className="text-red-400 text-xs mt-2">
                    {errors.platform}
                  </Text>
                ) : (
                  <Text className="text-xs text-zinc-500 mt-2">
                    Helps track where you connect most
                  </Text>
                )}
              </View>
            )}

            {/* Date */}
            <View className="mb-6">
              <Text className="text-sm text-secondary font-medium mb-2">
                DATE
              </Text>
              <TextInput
                value={date}
                onChangeText={(text) => {
                  setDate(text);
                  validateDate(text);
                }}
                onBlur={() => validateDate(date)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#71717a"
                className={`bg-zinc-900 text-white text-base px-4 py-3 border ${
                  errors.date ? 'border-red-500' : 'border-zinc-800'
                }`}
              />
              {errors.date ? (
                <Text className="text-red-400 text-xs mt-2">
                  {errors.date}
                </Text>
              ) : (
                <Text className="text-xs text-zinc-500 mt-2">
                  When did this interaction happen?
                </Text>
              )}
            </View>

            {/* Duration */}
            {['face-to-face', 'call', 'video'].includes(selectedType) && (
              <View className="mb-6">
                <Text className="text-sm text-secondary font-medium mb-2">
                  DURATION (MINUTES)
                </Text>
                <TextInput
                  value={duration}
                  onChangeText={(text) => {
                    setDuration(text);
                    validateDuration(text);
                  }}
                  onBlur={() => validateDuration(duration)}
                  placeholder="60"
                  placeholderTextColor="#71717a"
                  keyboardType="number-pad"
                  className={`bg-zinc-900 text-white text-base px-4 py-3 border ${
                    errors.duration ? 'border-red-500' : 'border-zinc-800'
                  }`}
                />
                {errors.duration ? (
                  <Text className="text-red-400 text-xs mt-2">
                    {errors.duration}
                  </Text>
                ) : (
                  <Text className="text-xs text-zinc-500 mt-2">
                    Longer conversations = stronger connections
                  </Text>
                )}
              </View>
            )}

            {/* Quality Rating */}
            <View className="mb-6">
              <Text className="text-sm text-secondary font-medium mb-3">
                INTERACTION QUALITY
              </Text>
              
              <View className="space-y-2">
                {QUALITY_LEVELS.map(level => {
                  const isSelected = quality === level.value;
                  
                  return (
                    <Pressable
                      key={level.value}
                      onPress={() => setQuality(level.value as ManualInteraction['quality'])}
                      className={`p-4 border-2 flex-row items-center ${
                        isSelected 
                          ? 'border-primary bg-green-950/30' 
                          : 'border-zinc-800 bg-zinc-900'
                      }`}
                    >
                      <Text className="text-2xl mr-3">{level.emoji}</Text>
                      <View className="flex-1">
                        <Text className={`text-base font-medium ${
                          isSelected ? 'text-primary' : 'text-white'
                        }`}>
                          {level.label}
                        </Text>
                        <Text className="text-xs text-zinc-400 mt-0.5">
                          {level.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <View className="flex-row">
                          {Array.from({ length: level.value }).map((_, i) => (
                            <Star key={i} size={16} weight="fill" color="#22c55e" />
                          ))}
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
              
              <View className="mt-4 p-3 bg-blue-950/30 border border-blue-900">
                <Text className="text-xs text-blue-400 leading-relaxed">
                  💡 Quality matters more than quantity. One deep conversation is worth more than 10 surface-level chats.
                </Text>
              </View>
            </View>

            {/* Notes */}
            <View className="mb-6">
              <Text className="text-sm text-secondary font-medium mb-2">
                NOTES (OPTIONAL)
              </Text>
              <TextInput
                value={notes}
                onChangeText={(text) => {
                  setNotes(text);
                  validateNotes(text);
                }}
                onBlur={() => validateNotes(notes)}
                placeholder="What did you talk about? How did it feel?"
                placeholderTextColor="#71717a"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className={`bg-zinc-900 text-white text-base px-4 py-3 border min-h-24 ${
                  errors.notes ? 'border-red-500' : 'border-zinc-800'
                }`}
              />
              {errors.notes ? (
                <Text className="text-red-400 text-xs mt-2">
                  {errors.notes}
                </Text>
              ) : (
                <Text className="text-xs text-zinc-500 mt-2">
                  Private notes to help you remember and reflect ({notes.length}/500)
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View className="px-6 py-4 border-t border-zinc-800 bg-zinc-950">
          <Pressable
            onPress={handleSave}
            disabled={Object.values(errors).some(error => error !== undefined)}
            className={`py-4 px-6 ${
              Object.values(errors).some(error => error !== undefined)
                ? 'bg-zinc-900'
                : 'bg-primary'
            }`}
            style={({ pressed }) => ({ 
              opacity: Object.values(errors).some(error => error !== undefined) ? 0.5 : pressed ? 0.9 : 1 
            })}
          >
            <Text className={`text-center text-lg font-bold ${
              Object.values(errors).some(error => error !== undefined) ? 'text-zinc-600' : 'text-black'
            }`}>
              Save Interaction
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
