/**
 * Layer-Based Dashboard (STORY-011)
 * 
 * Primary view showing relationship health organized by Dunbar layers.
 * Shows behavioral reality of user's relationships.
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useAccount } from "jazz-tools/expo";
import { useNavigation } from "expo-router";
import { calculateDunbarLayers } from "@/services/dunbarCalculator";
import { DataMiningScreen } from "@/components/onboarding/DataMiningScreen";
import { LayerDetailScreen } from "@/components/relationships/LayerDetailScreen";
import { Contact, ContactList, FamilyNames } from "@/jazz/schema";
import type { ContactWithMetrics } from "@/services/dataMining";

// Layer definitions from PRD
const LAYERS = [
  { id: 0, name: "Intimate Core", range: "1-5", color: "#ef4444" },
  { id: 1, name: "Sympathy Group", range: "5-15", color: "#f97316" },
  { id: 2, name: "Close Group", range: "15-50", color: "#eab308" },
  { id: 3, name: "Tribe", range: "50-150", color: "#22c55e" },
  { id: 4, name: "Acquaintances", range: "150-250", color: "#3b82f6" },
  { id: 5, name: "Social Nebula", range: "250+", color: "#8b5cf6" },
];

// Layer descriptions based on Dunbar research
const getLayerDescription = (layerId: number): string => {
  const descriptions = [
    "Your closest confidants. People you turn to in crisis and celebrate wins with. You know their deepest struggles and they know yours.",
    "Close friends you see regularly. You'd drop everything to help them. They know your life story and current challenges.",
    "Good friends you actively maintain. Regular contact, genuine care. You'd invite them to important life events.",
    "Friends and extended family. Periodic contact, shared history or interests. Part of your broader social circle.",
    "People you recognize and occasionally interact with. Colleagues, neighbors, service providers you know by name.",
    "Everyone else in your contacts. Minimal recent interaction. May have been closer in the past."
  ];
  return descriptions[layerId] || "";
};

interface LayerStats {
  layer: number;
  count: number;
  contacts: any[];
}

export default function Dashboard() {
  const { me } = useAccount();
  const navigation = useNavigation();
  const [layerStats, setLayerStats] = useState<LayerStats[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [totalContacts, setTotalContacts] = useState(0);
  const [needsDataMining, setNeedsDataMining] = useState(false);
  const [showDataMining, setShowDataMining] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<number | null>(null);
  
  // Track if we've already analyzed to prevent loops
  const hasAnalyzed = useRef(false);

  useEffect(() => {
    if (!me) return;
    
    // Only analyze once when component mounts or me becomes available
    if (!hasAnalyzed.current) {
      hasAnalyzed.current = true;
      analyzeRelationships();
    }
  }, [me]);

  // Hide tab bar when showing data mining or layer details
  useEffect(() => {
    const shouldHideTabBar = needsDataMining || showDataMining || selectedLayerId !== null;
    navigation.setOptions({
      tabBarStyle: shouldHideTabBar ? { display: 'none' } : undefined,
    });
  }, [needsDataMining, showDataMining, selectedLayerId, navigation]);

  const analyzeRelationships = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      
      const root = me?.root as any;
      
      // Check if root exists
      if (!root) {
        console.log("No root profile found");
        setIsAnalyzing(false);
        return;
      }
      
      const contacts = root.contacts || [];
      
      console.log("Analyzing relationships:", {
        hasContacts: !!root.contacts,
        contactsLength: contacts.length,
        contactsType: typeof contacts,
        isArray: Array.isArray(contacts),
      });
      
      // Check if we have any contacts at all
      if (!contacts || contacts.length === 0) {
        console.log("No contacts found - need to run data mining");
        setNeedsDataMining(true);
        setIsAnalyzing(false);
        return;
      }
      
      // Convert Jazz CoList to array if needed
      let contactsArray: any[] = [];
      try {
        if (Array.isArray(contacts)) {
          contactsArray = contacts;
        } else if (contacts && typeof contacts[Symbol.iterator] === 'function') {
          contactsArray = Array.from(contacts);
        } else if (contacts && typeof contacts === 'object') {
          // Might be a Jazz CoList - try to convert
          contactsArray = Object.values(contacts).filter(c => c && typeof c === 'object');
        }
      } catch (e) {
        console.error("Error converting contacts to array:", e);
        contactsArray = [];
      }
      
      console.log("Processing contacts:", {
        arrayLength: contactsArray.length,
        firstContact: contactsArray[0] ? {
          type: typeof contactsArray[0],
          keys: Object.keys(contactsArray[0] || {}),
          hasId: contactsArray[0]?.id !== undefined,
          hasSourceId: contactsArray[0]?.sourceId !== undefined,
          hasName: contactsArray[0]?.name !== undefined,
        } : null,
      });
      
      // Filter out null/undefined contacts and convert to plain objects
      const plainContacts = contactsArray
        .filter((contact: any) => contact != null) // Remove null/undefined
        .map((contact: any, index: number) => {
          try {
            // Jazz CoMaps have an internal id property
            const contactId = contact?.id || contact?.sourceId || `temp-${index}`;
            
            return {
              id: contactId,
              sourceId: contact?.sourceId || '',
              name: contact?.name || 'Unknown',
              phoneNumber: contact?.phoneNumber || '',
              email: contact?.email || '',
              dunbarLayer: contact?.dunbarLayer ?? 5, // Default to Social Nebula
              interactionScore: contact?.interactionScore ?? 0,
              lastInteraction: contact?.lastInteraction || '',
              interactionFrequency: contact?.interactionFrequency ?? 0,
              reciprocityScore: contact?.reciprocityScore ?? 0,
              contactInitiationRatio: contact?.contactInitiationRatio ?? 0,
              averageResponseTime: contact?.averageResponseTime ?? 0,
              isFamily: contact?.isFamily ?? false,
              familyTier: contact?.familyTier || undefined,
              familyRole: contact?.familyRole || '',
              notes: contact?.notes || '',
              cultivationGoal: contact?.cultivationGoal || undefined,
              // These fields are NOT stored in Jazz, so they won't exist on reload
              // That's OK - we use the already-calculated dunbarLayer and interactionScore
              callCount: 0,
              smsCount: 0,
              totalDuration: 0,
            };
          } catch (e) {
            console.error("Error processing contact:", e, contact);
            return null;
          }
        })
        .filter((contact: any) => contact != null); // Remove any failed conversions
      
      console.log("Plain contacts after processing:", {
        count: plainContacts.length,
        sample: plainContacts[0],
      });
      
      // Check if we ended up with any valid contacts
      if (plainContacts.length === 0) {
        console.log("No valid contacts after processing - need to run data mining");
        setNeedsDataMining(true);
        setIsAnalyzing(false);
        return;
      }
      
      // Group contacts by their EXISTING dunbarLayer (no need to recalculate on every load)
      const layerGroups: LayerStats[] = LAYERS.map(layer => ({
        layer: layer.id,
        count: 0,
        contacts: [],
      }));
      
      plainContacts.forEach((contact: any) => {
        const layer = contact?.dunbarLayer ?? 5;
        layerGroups[layer].contacts.push(contact);
        layerGroups[layer].count++;
      });
      
      setLayerStats(layerGroups);
      setTotalContacts(plainContacts.length);
    } catch (error) {
      console.error("Error analyzing relationships:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [me]); // Only depend on me

  // Handle data mining completion
  const handleDataMiningComplete = async (contacts: ContactWithMetrics[], familyNames?: any) => {
    if (!me) {
      console.error("No Jazz account - cannot save contacts");
      return;
    }
    
    console.log(`Data mining complete! Imported ${contacts.length} contacts`);
    
    const root = me.root as any;
    
    // Save family names if provided
    if (familyNames && (familyNames.birthLastName || familyNames.currentLastName || familyNames.spouseLastName)) {
      console.log('Saving family names to Jazz:', familyNames);
      
      // Always create a new FamilyNames CoMap (can't update existing one directly)
      const newFamilyNames = FamilyNames.create({
        birthLastName: familyNames.birthLastName,
        currentLastName: familyNames.currentLastName,
        spouseLastName: familyNames.spouseLastName,
        otherFamilyNames: familyNames.otherFamilyNames,
      }, me);
      
      root.$jazz.set('familyNames', newFamilyNames);
    }
    
    // Convert ContactWithMetrics to Contact format for Dunbar calculator
    const contactsForCalculation = contacts.map(c => ({
      id: c.id,
      name: c.name,
      phoneNumber: c.phoneNumbers?.[0],
      email: c.emails?.[0],
      isFamily: !!c.potentialFamily,
      familyTier: c.potentialFamily?.tier || undefined,
      callCount: c.metrics.callFrequency,
      smsCount: c.metrics.smsFrequency,
      totalDuration: c.metrics.totalCallDuration,
      lastInteraction: c.metrics.lastInteraction ? new Date(c.metrics.lastInteraction).toISOString() : undefined,
    }));
    
    // Calculate Dunbar layers
    const contactsWithLayers = await calculateDunbarLayers(contactsForCalculation);
    
    console.log('Dunbar layers calculated');
    
    // Save contacts to Jazz
    // Create new ContactList with all contacts
    const newContactsList: any[] = [];
    
    for (const contact of contactsWithLayers) {
      // Find the original contact to get family role
      const originalContact = contacts.find(c => c.id === contact.id);
      
      const contactData = Contact.create({
        sourceId: contact.id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        email: contact.email,
        dunbarLayer: contact.dunbarLayer,
        interactionScore: contact.interactionScore,
        lastInteraction: contact.lastInteraction,
        interactionFrequency: (contact.callCount || 0) + (contact.smsCount || 0),
        reciprocityScore: contact.reciprocityScore,
        contactInitiationRatio: contact.contactInitiationRatio,
        averageResponseTime: contact.averageResponseTime,
        isFamily: contact.isFamily,
        familyTier: contact.familyTier,
        familyRole: originalContact?.potentialFamily?.role,
        createdAt: new Date().toISOString(),
      }, me);
      
      newContactsList.push(contactData);
    }
    
    // Replace the entire contacts list using $jazz.set
    const newContacts = ContactList.create(newContactsList, me);
    root.$jazz.set('contacts', newContacts);
    
    console.log(`Saved ${newContactsList.length} contacts to Jazz`);
    
    // Hide data mining screen and refresh dashboard
    setShowDataMining(false);
    setNeedsDataMining(false);
    
    // Reset the analyzed flag so we can re-analyze with new data
    hasAnalyzed.current = false;
    
    // Trigger re-analysis
    analyzeRelationships();
  };

  // Show data mining screen if needed
  if (needsDataMining || showDataMining) {
    const root = me?.root as any;
    const savedFamilyNames = root?.familyNames ? {
      birthLastName: root.familyNames.birthLastName,
      currentLastName: root.familyNames.currentLastName,
      spouseLastName: root.familyNames.spouseLastName,
      otherFamilyNames: root.familyNames.otherFamilyNames,
    } : undefined;
    
    return (
      <DataMiningScreen 
        onComplete={handleDataMiningComplete}
        savedFamilyNames={savedFamilyNames}
      />
    );
  }

  if (isAnalyzing) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-secondary mt-4">Analyzing your relationships...</Text>
      </View>
    );
  }

  // Handle contact updates from detail screen
  const handleContactUpdate = async (updatedContact: any) => {
    if (!me) return;
    
    const root = me.root as any;
    const contacts = root?.contacts || [];
    
    // Find the contact to update
    const contactIndex = contacts.findIndex((c: any) => c.id === updatedContact.id || c.sourceId === updatedContact.id);
    
    if (contactIndex !== -1) {
      const existingContact = contacts[contactIndex];
      
      // Create a new Contact CoMap with updated properties
      const updatedContactData = Contact.create({
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
        isFamily: existingContact.isFamily,
        familyTier: existingContact.familyTier,
        familyRole: existingContact.familyRole,
        // Updated fields
        notes: updatedContact.notes,
        cultivationGoal: updatedContact.cultivationGoal,
        createdAt: existingContact.createdAt,
      }, me);
      
      // Create new contacts list with the updated contact
      const newContactsList = contacts.map((c: any, i: number) => 
        i === contactIndex ? updatedContactData : c
      );
      
      // Replace the entire contacts list
      const newContacts = ContactList.create(newContactsList, me);
      root.$jazz.set('contacts', newContacts);
      
      console.log('Contact updated:', updatedContact.name);
      
      // Reset the analyzed flag so we can re-analyze
      hasAnalyzed.current = false;
      
      // Refresh the dashboard
      analyzeRelationships();
    }
  };

  // Show layer detail screen if a layer is selected
  if (selectedLayerId !== null) {
    const selectedLayer = LAYERS.find(l => l.id === selectedLayerId);
    const layerContacts = layerStats[selectedLayerId]?.contacts || [];
    
    if (selectedLayer) {
      return (
        <LayerDetailScreen
          layer={{
            ...selectedLayer,
            description: getLayerDescription(selectedLayerId),
          }}
          contacts={layerContacts}
          onBack={() => setSelectedLayerId(null)}
          onContactUpdate={handleContactUpdate}
        />
      );
    }
  }

  const withinDunbar = layerStats.slice(0, 4).reduce((sum, layer) => sum + layer.count, 0);
  const dunbarHealth = withinDunbar <= 150 ? "healthy" : "overextended";

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-6 py-8">
        {/* Header */}
        <Text className="text-4xl text-primary mb-2" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
          Your Garden
        </Text>
        <Text className="text-lg text-secondary mb-8">
          {totalContacts} relationships cultivated
        </Text>

        {/* Dunbar Health */}
        <View className={`p-4 border mb-8 ${
          dunbarHealth === "healthy" ? "border-green-900 bg-green-950/30" : "border-orange-900 bg-orange-950/30"
        }`}>
          <Text className={`text-sm font-medium mb-2 ${
            dunbarHealth === "healthy" ? "text-green-400" : "text-orange-400"
          }`}>
            DUNBAR STATUS
          </Text>
          <Text className="text-white text-base">
            {withinDunbar} of 150 active relationships
          </Text>
          <Text className="text-secondary text-sm mt-1">
            {dunbarHealth === "healthy" 
              ? "Your network is within healthy limits"
              : "Consider pruning to maintain quality connections"
            }
          </Text>
        </View>

        {/* Layers */}
        <Text className="text-xl text-white mb-4 font-medium">
          Relationship Layers
        </Text>

        {layerStats.map((layerStat, index) => {
          const layer = LAYERS[index];
          const percentage = totalContacts > 0 ? (layerStat.count / totalContacts) * 100 : 0;

          return (
            <Pressable
              key={layer.id}
              onPress={() => setSelectedLayerId(layer.id)}
              className="mb-4"
            >
              <View className="bg-zinc-900 border border-zinc-800 p-4">
                {/* Layer Header */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: layer.color }}
                    />
                    <Text className="text-white text-base font-medium">
                      {layer.name}
                    </Text>
                  </View>
                  <Text className="text-secondary text-sm">
                    {layerStat.count} ({layer.range})
                  </Text>
                </View>

                {/* Progress Bar */}
                <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <View 
                    className="h-full"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: layer.color,
                    }}
                  />
                </View>

                {/* Sample Names */}
                {layerStat.contacts.length > 0 && (
                  <Text className="text-secondary text-xs mt-3" numberOfLines={1}>
                    {layerStat.contacts.slice(0, 3).map(c => c.name).join(", ")}
                    {layerStat.contacts.length > 3 && ` +${layerStat.contacts.length - 3} more`}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}

        {/* Cultivation Opportunities */}
        <View className="mt-8 p-4 border border-primary bg-green-950/20">
          <Text className="text-sm text-primary font-medium mb-2">
            CULTIVATION OPPORTUNITIES
          </Text>
          <Text className="text-white text-base mb-3">
            3 relationships need attention
          </Text>
          <Pressable className="bg-primary py-3 px-4">
            <Text className="text-center text-black font-bold">
              VIEW SUGGESTIONS
            </Text>
          </Pressable>
        </View>

        {/* Re-analyze Data Button */}
        <View className="mt-4 mb-8">
          <Pressable 
            onPress={() => setShowDataMining(true)}
            className="border border-zinc-700 py-3 px-4"
          >
            <Text className="text-center text-zinc-400 text-sm">
              Re-analyze Relationship Data
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}