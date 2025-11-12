/**
 * Overflow Selection Modal
 * 
 * Visual checkbox selection for resolving Dunbar violations quickly.
 * Instead of 173 pairwise questions for 100 contacts, user simply
 * checks who to move down (takes 30 seconds).
 * 
 * Features:
 * - Scrollable list with checkboxes
 * - Pre-sorted by lowest combined scores
 * - Search/filter functionality
 * - Multi-select with counter
 * - One-tap to restore algorithm suggestions
 * - Review/approval before applying changes
 * 
 * Based on SCALABLE_SORTING.md design - Phase 1
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { useAccount } from "jazz-tools/expo";
import { Button } from "@/components/ui";
import { Contact, ContactList } from "@/jazz/schema";

interface OverflowSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  contacts: any[];
  violatedLayer: number;
  violatedLayerName: string;
  layerCapacity: number;
}

export function OverflowSelectionModal({
  visible,
  onClose,
  onRefresh,
  contacts,
  violatedLayer,
  violatedLayerName,
  layerCapacity,
}: OverflowSelectionModalProps) {
  // Performance optimization: Use $each to batch-load all contacts in one operation
  const { me } = useAccount(undefined, {
    resolve: {
      root: {
        contacts: { $each: true },
      }
    }
  });
  
  // Calculate how many need to move down
  const overflowCount = contacts.length - layerCapacity;
  
  // State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showReview, setShowReview] = useState(false);
  
  // Calculate combined score for each contact
  // interactionScore + bonus from intuitiveRank (if exists)
  const contactsWithScore = useMemo(() => {
    return contacts.map(c => {
      const interactionScore = c.interactionScore || 0;
      const intuitiveBonus = c.intuitiveRank ? (100 / c.intuitiveRank) : 0;
      const combinedScore = interactionScore + intuitiveBonus;
      
      return {
        ...c,
        combinedScore,
      };
    });
  }, [contacts]);
  
  // Sort by lowest score first (candidates for moving)
  const sortedContacts = useMemo(() => {
    return [...contactsWithScore].sort((a, b) => a.combinedScore - b.combinedScore);
  }, [contactsWithScore]);
  
  // Filter by search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return sortedContacts;
    
    const query = searchQuery.toLowerCase();
    return sortedContacts.filter(c => 
      c.name.toLowerCase().includes(query)
    );
  }, [sortedContacts, searchQuery]);
  
  // Pre-select lowest scoring contacts (algorithm suggestion)
  const algorithmSuggestion = useMemo(() => {
    return new Set(sortedContacts.slice(0, overflowCount).map(c => c.id || c.sourceId));
  }, [sortedContacts, overflowCount]);
  
  // Initialize with algorithm suggestion
  React.useEffect(() => {
    if (visible && selectedIds.size === 0) {
      setSelectedIds(new Set(algorithmSuggestion));
    }
  }, [visible, algorithmSuggestion]);
  
  // Toggle selection
  const toggleSelect = (contactId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedIds(newSelected);
  };
  
  // Restore algorithm suggestion
  const restoreAlgorithm = () => {
    setSelectedIds(new Set(algorithmSuggestion));
  };
  
  // Handle review
  const handleReview = () => {
    if (selectedIds.size !== overflowCount) {
      alert(`Please select exactly ${overflowCount} people to move down. Currently selected: ${selectedIds.size}`);
      return;
    }
    setShowReview(true);
  };
  
  // Apply changes
  const handleApply = () => {
    if (!me) return;
    
    console.log('');
    console.log('=' .repeat(60));
    console.log('💾 APPLYING OVERFLOW SELECTION CHANGES');
    console.log('=' .repeat(60));
    console.log(`Selected ${selectedIds.size} contacts to move down`);
    
    const root = me.root as any;
    const allContactsArray = Array.from(root?.contacts || []);
    
    // Update contacts in-place
    allContactsArray.forEach((c: any) => {
      const contactId = c.id || c.sourceId;
      
      // Check if this contact should be moved
      if (selectedIds.has(contactId)) {
        console.log(`  ↓ Moving: ${c.name} (Layer ${violatedLayer} → Layer ${violatedLayer + 1})`);
        c.$jazz.set('dunbarLayer', violatedLayer + 1);
        c.$jazz.set('quickSortStatus', 'sorted');
        c.$jazz.set('quickSortedAt', new Date().toISOString());
      }
      // Contact not selected - stays in current layer (but mark as sorted if it's in the violated layer)
      else if (contacts.some((orig: any) => (orig.id || orig.sourceId) === contactId)) {
        c.$jazz.set('quickSortStatus', 'sorted');
        c.$jazz.set('quickSortedAt', new Date().toISOString());
      }
    });
    
    console.log('✅ Overflow selection changes applied');
    console.log('=' .repeat(60));
    console.log('');
    
    // Close and refresh
    handleClose();
  };
  
  // Close and reset
  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery("");
    setShowReview(false);
    onClose();
    
    if (onRefresh) {
      onRefresh();
    }
  };
  
  if (!visible) return null;
  
  // Review screen
  if (showReview) {
    const movingContacts = sortedContacts.filter(c => 
      selectedIds.has(c.id || c.sourceId || '')
    );
    const stayingContacts = sortedContacts.filter(c => 
      !selectedIds.has(c.id || c.sourceId || '')
    );
    
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <ScrollView className="flex-1 bg-black/95 pt-16 px-6">
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Review Your Selection
          </Text>
          
          <Text className="text-zinc-400 text-center mb-8">
            Based on your selection, here's who will move
          </Text>
          
          {/* Staying */}
          <View className="mb-6">
            <Text className="text-primary text-lg font-bold mb-3">
              ✅ Staying in {violatedLayerName} ({stayingContacts.length})
            </Text>
            {stayingContacts.slice(0, 5).map((c) => (
              <View key={c.id || c.sourceId} className="bg-zinc-900 p-3 mb-2 rounded border border-zinc-800">
                <Text className="text-white font-semibold">{c.name}</Text>
                <Text className="text-zinc-500 text-xs mt-1">
                  Score: {c.combinedScore.toFixed(0)}
                </Text>
              </View>
            ))}
            {stayingContacts.length > 5 && (
              <Text className="text-zinc-500 text-xs mt-2">
                + {stayingContacts.length - 5} more
              </Text>
            )}
          </View>
          
          {/* Moving */}
          <View className="mb-6">
            <Text className="text-orange-400 text-lg font-bold mb-3">
              ↓ Moving to Next Layer ({movingContacts.length})
            </Text>
            {movingContacts.map((c) => (
              <View key={c.id || c.sourceId} className="bg-zinc-900 p-3 mb-2 rounded border border-orange-800/30">
                <Text className="text-white font-semibold">{c.name}</Text>
                <Text className="text-zinc-500 text-xs mt-1">
                  Score: {c.combinedScore.toFixed(0)}
                </Text>
              </View>
            ))}
          </View>
          
          <View className="bg-zinc-900/50 p-4 border border-zinc-800 rounded mb-6">
            <Text className="text-zinc-400 text-sm text-center">
              💡 Moving someone down doesn't mean you care less. 
              It's about being realistic with your time.
            </Text>
          </View>
          
          <Button 
            variant="primary" 
            onPress={handleApply}
            className="mb-3"
          >
            Apply Changes
          </Button>
          
          <Button 
            variant="ghost" 
            onPress={() => setShowReview(false)}
            className="mb-8"
          >
            Back to Selection
          </Button>
        </ScrollView>
      </Modal>
    );
  }
  
  // Selection screen
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/95 pt-16 px-6">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-white text-2xl font-bold">Quick Select</Text>
          <Text className="text-zinc-400 text-sm mt-1">
            Select {overflowCount} people to move to the next layer
          </Text>
        </View>
        
        {/* Search */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search contacts..."
          placeholderTextColor="#71717a"
          className="bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded mb-4"
        />
        
        {/* Info Bar */}
        <View className="flex-row justify-between items-center mb-4 bg-zinc-900 p-3 rounded">
          <Text className="text-zinc-400 text-sm">
            {selectedIds.size} / {overflowCount} selected
          </Text>
          <Pressable onPress={restoreAlgorithm}>
            <Text className="text-primary text-sm font-semibold">
              Restore Algorithm Picks
            </Text>
          </Pressable>
        </View>
        
        {/* Contact List */}
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id || item.sourceId || ''}
          renderItem={({ item }) => {
            const contactId = item.id || item.sourceId || '';
            const isSelected = selectedIds.has(contactId);
            const isAlgorithmPick = algorithmSuggestion.has(contactId);
            
            return (
              <Pressable
                onPress={() => toggleSelect(contactId)}
                className={`p-4 mb-2 rounded border ${
                  isSelected 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <View className="flex-row items-center">
                  <View className={`w-6 h-6 rounded mr-3 border-2 items-center justify-center ${
                    isSelected 
                      ? 'bg-primary border-primary' 
                      : 'border-zinc-600'
                  }`}>
                    {isSelected && (
                      <Text className="text-black font-bold text-xs">✓</Text>
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-white font-semibold">
                      {item.name}
                    </Text>
                    <Text className="text-zinc-500 text-xs mt-1">
                      Score: {item.combinedScore.toFixed(0)}
                      {item.lastInteraction && ` • Last: ${new Date(item.lastInteraction).toLocaleDateString()}`}
                      {isAlgorithmPick && ' • ⭐ Algorithm Pick'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
        
        {/* Action Buttons */}
        <View className="pb-6 bg-black/95">
          <Button 
            variant="primary" 
            onPress={handleReview}
            className="mb-3"
          >
            Review Selection
          </Button>
          <Button 
            variant="ghost" 
            onPress={handleClose}
          >
            Cancel
          </Button>
        </View>
      </View>
    </Modal>
  );
}
