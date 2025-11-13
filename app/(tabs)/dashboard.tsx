/**
 * Layer-Based Dashboard (STORY-011)
 * 
 * Primary view showing relationship health organized by Dunbar layers.
 * Shows behavioral reality of user's relationships.
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Platform, Dimensions } from "react-native";
import { useAccount } from "jazz-tools/expo";
import { useNavigation } from "expo-router";
import { calculateDunbarLayers } from "@/services/dunbarCalculator";
import { DataMiningScreen } from "@/components/onboarding/DataMiningScreen";
import { LayerDetailScreen } from "@/components/relationships/LayerDetailScreen";
import { Contact, ContactList, ContactSummary, ContactSummaryList, FamilyNames, DashboardSummary } from "@/jazz/schema";
import type { ContactWithMetrics } from "@/services/dataMining";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ContactSearch } from "@/components/relationships/ContactSearch";
import { SearchBar } from "@/components/relationships/SearchBar";

// ============================================================================
// Lazy Layer Detail Screen - Loads only specific layer on-demand
// ============================================================================
interface LazyLayerDetailScreenProps {
  layerId: number;
  layer: {
    id: number;
    name: string;
    range: string;
    color: string;
    description: string;
  };
  onBack: () => void;
  onContactUpdate: (contact: any) => void;
  onStartTendGarden?: () => void;
}

function LazyLayerDetailScreen({ layerId, layer, onBack, onContactUpdate, onStartTendGarden }: LazyLayerDetailScreenProps) {
  // Load ONLY this layer's contacts (lazy loading!)
  const me = useAccount(undefined, {
    resolve: {
      root: {
        [`layer${layerId}Contacts`]: { $each: true }, // Load just this layer
        contacts: { $each: true }, // FALLBACK: Load legacy list if new structure doesn't exist
      }
    }
  });
  
  const root = me?.$isLoaded ? me.root as any : null;
  
  // Try new optimized structure first
  const layerContactSummaries = root?.[`layer${layerId}Contacts`];
  
  // Fallback to legacy structure if new one doesn't exist yet
  const legacyContacts = root?.contacts || [];
  
  // Determine which data source to use
  const contacts = layerContactSummaries && layerContactSummaries.length > 0
    ? Array.from(layerContactSummaries).map((summary: any) => ({
        id: summary?.fullContactId || summary?.sourceId,
        sourceId: summary?.sourceId,
        name: summary?.name || 'Unknown',
        dunbarLayer: summary?.dunbarLayer,
        interactionScore: summary?.interactionScore,
        lastInteraction: summary?.lastInteraction,
        isFamily: summary?.isFamily,
        familyTier: summary?.familyTier,
        familyRole: summary?.familyRole,
        quickSortStatus: summary?.quickSortStatus,
        relationshipType: summary?.relationshipType,
      }))
    : Array.from(legacyContacts)
        .filter((c: any) => c?.dunbarLayer === layerId && c?.quickSortStatus !== "hidden")
        .map((c: any) => ({
          id: c?.id || c?.sourceId,
          sourceId: c?.sourceId,
          name: c?.name || 'Unknown',
          phoneNumber: c?.phoneNumber,
          email: c?.email,
          dunbarLayer: c?.dunbarLayer,
          interactionScore: c?.interactionScore,
          lastInteraction: c?.lastInteraction,
          interactionFrequency: c?.interactionFrequency,
          reciprocityScore: c?.reciprocityScore,
          contactInitiationRatio: c?.contactInitiationRatio,
          callCount: c?.callCount,
          smsCount: c?.smsCount,
          totalDuration: c?.totalDuration,
          isFamily: c?.isFamily,
          familyTier: c?.familyTier,
          familyRole: c?.familyRole,
          notes: c?.notes,
          cultivationGoal: c?.cultivationGoal,
          quickSortStatus: c?.quickSortStatus,
          relationshipType: c?.relationshipType,
          connectionOrigin: c?.connectionOrigin,
          businessTier: c?.businessTier,
        }));
  
  // Show loading while fetching layer data
  if (!me?.$isLoaded) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-secondary mt-4">Loading {layer.name}...</Text>
      </View>
    );
  }
  
  console.log(`📊 Lazy loaded layer ${layerId}: ${contacts.length} contacts`);
  console.log(`   Using ${layerContactSummaries && layerContactSummaries.length > 0 ? 'OPTIMIZED' : 'LEGACY'} structure`);
  
  return (
    <LayerDetailScreen
      layer={layer}
      contacts={contacts}
      onBack={onBack}
      onContactUpdate={onContactUpdate}
      onStartTendGarden={onStartTendGarden}
    />
  );
}
import { QuickSortModal } from "@/components/relationships/QuickSortModal";
import { WouldYouRatherModal } from "@/components/relationships/WouldYouRatherModal";
import { OverflowSelectionModal } from "@/components/relationships/OverflowSelectionModal";
import { DunbarViolationHeroCard, detectDunbarViolations } from "@/components/relationships/DunbarViolationHeroCard";
import { GraveyardScreen } from "@/components/relationships/GraveyardScreen";
import { Card, Button } from "@/components/ui";
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';

// Layer definitions based on Dunbar's research
const LAYERS = [
  { id: 0, name: "Loved Ones", range: "0-5", color: "#ef4444", descriptor: "Cherish" },
  { id: 1, name: "Inner Circle", range: "5-15", color: "#f97316", descriptor: "Love" },
  { id: 2, name: "Clan", range: "15-50", color: "#eab308", descriptor: "Respect" },
  { id: 3, name: "Tribe", range: "50-150", color: "#22c55e", descriptor: "Like" },
  { id: 4, name: "Acquaintances", range: "150-500", color: "#3b82f6", descriptor: "Know" },
  { id: 5, name: "Social Nebula", range: "500-1500", color: "#8b5cf6", descriptor: "Aware" },
];

// Layer descriptions based on Dunbar research
const getLayerDescription = (layerId: number): string => {
  const descriptions = [
    "Your innermost circle of 5 people. These are the relationships you'd drop everything for—partners, closest family, best friends. The people who know your deepest fears and greatest dreams.",
    "Your core support network of 15 people. Immediate family and close friends you see regularly and trust deeply. You'd be devastated if something happened to them, and they feel the same about you.",
    "Your extended group of 50 people. Extended family and friends you actively maintain and genuinely care about. These are people you'd invite to important life events and who shape your social identity.",
    "Your broader tribe of 150 people. Extended family, friends, good colleagues, and regular contacts you see periodically. Dunbar's number—the cognitive limit for stable social relationships where you know each person and how they relate to others.",
    "People you recognize and interact with occasionally—up to 500 individuals. Colleagues, neighbors, parents from your kids' school, regular service providers. Friendly faces but not close relationships.",
    "People you've met but rarely interact with. Former contacts, distant connections, or people you've only met once. These contacts have minimal or zero recent interaction."
  ];
  return descriptions[layerId] || "";
};

interface LayerStats {
  layer: number;
  count: number;
  contacts: any[];
}

export default function Dashboard() {
  // Performance optimization: Load ONLY dashboard summary (no contacts!)
  // Contacts are loaded lazily when user opens specific layers
  // This prevents loading 500+ contacts on dashboard load
  // Jazz 0.19.x: useAccount now returns MaybeLoaded<Account> directly
  const me = useAccount(undefined, {
    resolve: {
      root: {
        // contacts: { $each: true },  // ❌ REMOVED - don't load all contacts upfront!
        dashboardSummary: true,         // ✅ Load summary only (~500 bytes)
        familyNames: true,              // Load family names
      }
    }
  });
  const navigation = useNavigation();
  const [layerStats, setLayerStats] = useState<LayerStats[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [totalContacts, setTotalContacts] = useState(0);
  const [needsDataMining, setNeedsDataMining] = useState(false);
  const [showDataMining, setShowDataMining] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchSelectedContact, setSearchSelectedContact] = useState<any | null>(null);
  const [showQuickSort, setShowQuickSort] = useState(false);
  const [showWouldYouRather, setShowWouldYouRather] = useState(false);
  const [showOverflowSelection, setShowOverflowSelection] = useState(false);
  const [dunbarViolation, setDunbarViolation] = useState<any>(null);
  const [showGraveyard, setShowGraveyard] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  // Track if we've already analyzed to prevent loops
  const hasAnalyzed = useRef(false);
  
  // Track previous tab bar visibility state to reduce log spam
  const previousTabBarVisible = useRef<boolean | null>(null);
  
  // Graveyard reveal animation - MUST be at top level, not conditional
  const scrollY = useSharedValue(0);
  const GRAVEYARD_REVEAL_THRESHOLD = -80; // Pull down 80px to reveal
  
  // Calculate graveyard animation style
  const graveyardAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [GRAVEYARD_REVEAL_THRESHOLD, 0],
      [0, -100],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      scrollY.value,
      [GRAVEYARD_REVEAL_THRESHOLD, -20, 0],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  useEffect(() => {
    if (!me) return;
    
    // Only analyze once when component mounts or me becomes available
    if (!hasAnalyzed.current) {
      hasAnalyzed.current = true;
      analyzeRelationships();
    }
  }, [me]);

  // Hide tab bar when showing data mining, layer details, search, quick sort, would you rather, or graveyard
  useEffect(() => {
    const shouldHideTabBar = needsDataMining || showDataMining || selectedLayerId !== null || showSearch || searchSelectedContact !== null || showQuickSort || showWouldYouRather || showGraveyard;
    
    const defaultTabBarStyle = {
      backgroundColor: 'transparent',
      borderTopWidth: 0, // Remove border since we have glassmorphic design
      elevation: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      height: Platform.OS === "ios" ? 88 : 72,
      paddingBottom: Platform.OS === "ios" ? 28 : 12,
      paddingTop: 8,
      position: 'absolute' as const,
      overflow: 'hidden' as const, // Important for blur effect
    };
    
    // Only log when visibility actually changes
    const isVisible = !shouldHideTabBar;
    if (previousTabBarVisible.current !== null && previousTabBarVisible.current !== isVisible) {
      console.log(`🌱 Garden tab bar: ${isVisible ? 'visible' : 'hidden'}`);
    }
    previousTabBarVisible.current = isVisible;
    
    navigation.setOptions({
      tabBarStyle: shouldHideTabBar ? { display: 'none' } : defaultTabBarStyle,
    });
  }, [needsDataMining, showDataMining, selectedLayerId, showSearch, searchSelectedContact, showQuickSort, showWouldYouRather, navigation]);

  const analyzeRelationships = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      
      // Jazz 0.19.x: Check if account is loaded
      if (!me?.$isLoaded) {
        console.log("Account not loaded yet");
        setIsAnalyzing(false);
        return;
      }
      
      const root = me.root as any;
      
      // Check if root exists
      if (!root) {
        console.log("No root profile found");
        setIsAnalyzing(false);
        return;
      }
      
      const hasCompletedAnalysis = root.hasCompletedContactAnalysis;
      
      console.log('');
      console.log('=' .repeat(60));
      console.log("📊 LOADING DASHBOARD (FAST PATH - SUMMARY CACHE)");
      console.log('=' .repeat(60));
      console.log(`Has completed analysis flag: ${hasCompletedAnalysis}`);
      console.log('=' .repeat(60));
      console.log('');
      
      // Check if user has completed contact analysis
      // If the flag is false, they need to run data mining
      if (!hasCompletedAnalysis) {
        console.log("❌ User has not completed contact analysis - need to run data mining");
        setNeedsDataMining(true);
        setIsAnalyzing(false);
        return;
      }
      
      // PERFORMANCE FIX: Load from summary cache instead of iterating all contacts
      const summary = root.dashboardSummary;
      
      if (!summary) {
        console.log("⚠️ No dashboard summary found - falling back to full load");
        console.log("This should only happen once after upgrade");
        
        // Fallback: Load contacts to build summary (will be saved for next time)
        const contacts = root.contacts || [];
        
        console.log(`📦 Contacts object: ${!!contacts}`);
        console.log(`📦 Contacts length: ${contacts?.length || 0}`);
        console.log(`📦 Contacts type: ${typeof contacts}`);
        
        // Try to access length directly (triggers Jazz loading)
        let contactCount = 0;
        try {
          if (contacts && Symbol.iterator in Object(contacts)) {
            const contactsArray = Array.from(contacts);
            contactCount = contactsArray.length;
            console.log(`📦 Loaded ${contactCount} contacts from Jazz`);
            
            if (contactCount > 0) {
              // Build summary from contacts (one-time migration)
              console.log('🔨 Building summary from loaded contacts...');
              await buildAndSaveSummary(contacts);
              
              // Retry with summary
              hasAnalyzed.current = false;
              analyzeRelationships();
              return;
            }
          }
        } catch (e) {
          console.error('Error accessing contacts:', e);
        }
        
        // If truly no contacts, something is wrong - show data mining
        console.log("⚠️ No contacts found in Jazz storage");
        console.log("🔄 Triggering data mining to rebuild contacts...");
        setNeedsDataMining(true);
        setIsAnalyzing(false);
        return;
      }
      
      console.log('✅ Loaded dashboard summary from cache');
      console.log(`  Total contacts: ${summary.totalContacts}`);
      console.log(`  Layer 0: ${summary.layer0Count}`);
      console.log(`  Layer 1: ${summary.layer1Count}`);
      console.log(`  Layer 2: ${summary.layer2Count}`);
      console.log(`  Layer 3: ${summary.layer3Count}`);
      console.log(`  Layer 4: ${summary.layer4Count}`);
      console.log(`  Layer 5: ${summary.layer5Count}`);
      console.log(`  Hidden: ${summary.hiddenCount}`);
      console.log(`  Unsorted: ${summary.unsortedCount}`);
      console.log(`  Last updated: ${summary.lastUpdated}`);
      console.log('');
      
      // Build layer stats from summary (no contact loading needed!)
      const layerGroups: LayerStats[] = [
        { layer: 0, count: summary.layer0Count, contacts: [] },
        { layer: 1, count: summary.layer1Count, contacts: [] },
        { layer: 2, count: summary.layer2Count, contacts: [] },
        { layer: 3, count: summary.layer3Count, contacts: [] },
        { layer: 4, count: summary.layer4Count, contacts: [] },
        { layer: 5, count: summary.layer5Count, contacts: [] },
      ];
      
      setLayerStats(layerGroups);
      setTotalContacts(summary.totalContacts);
    } catch (error) {
      console.error("Error analyzing relationships:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [me]); // Only depend on me
  
  // Helper function to build summary from contacts (migration path)
  const buildAndSaveSummary = async (contacts: any) => {
    if (!me?.$isLoaded) return;
    
    console.log('🔄 Building summary from contacts (one-time migration)...');
    
    const root = me.root as any;
    const contactsArray = Array.from(contacts);
    
    const layerCounts = [0, 0, 0, 0, 0, 0];
    let hiddenCount = 0;
    let unsortedCount = 0;
    
    contactsArray.forEach((c: any) => {
      if (c?.quickSortStatus === "hidden") {
        hiddenCount++;
      } else {
        const layer = c?.dunbarLayer ?? 5;
        layerCounts[layer]++;
        
        if (c?.quickSortStatus === "not_sorted" || !c?.quickSortStatus) {
          unsortedCount++;
        }
      }
    });
    
    const summary = DashboardSummary.create({
      totalContacts: contactsArray.length,
      layer0Count: layerCounts[0],
      layer1Count: layerCounts[1],
      layer2Count: layerCounts[2],
      layer3Count: layerCounts[3],
      layer4Count: layerCounts[4],
      layer5Count: layerCounts[5],
      hiddenCount,
      unsortedCount,
      lastUpdated: new Date().toISOString(),
    }, me);
    
    root.$jazz.set('dashboardSummary', summary);
    
    console.log('✅ Summary built and saved');
  };
  
  // Helper function to refresh summary after contact mutations
  // Call this after any contact add/update/delete/hide/unhide operations
  const refreshSummary = useCallback (async () => {
    if (!me?.$isLoaded) return;
    
    const root = me.root as any;
    const contacts = root?.contacts || [];
    
    await buildAndSaveSummary(contacts);
    
    // Refresh dashboard display
    hasAnalyzed.current = false;
    analyzeRelationships();
  }, [me, analyzeRelationships]);

  // Handle data mining completion
  const handleDataMiningComplete = async (contacts: ContactWithMetrics[], familyNames?: any) => {
    if (!me?.$isLoaded) {
      console.error("No Jazz account - cannot save contacts");
      return;
    }
    
    console.log(`Data mining complete! Imported ${contacts.length} contacts`);
    
    const root = me.root as any;
    
    // Save family names if provided
    if (familyNames && (familyNames.birthLastName || familyNames.currentLastName || familyNames.spouseLastName)) {
      console.log('');
      console.log('💾 SAVING FAMILY NAMES TO JAZZ');
      console.log('Birth last name:', familyNames.birthLastName || '(none)');
      console.log('Current last name:', familyNames.currentLastName || '(none)');
      console.log('Spouse last name:', familyNames.spouseLastName || '(none)');
      console.log('');
      
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
    const contactsForCalculation = contacts.map(c => {
      // Calculate total counts from frequency (approximate last 30 days)
      // callFrequency and smsFrequency are interactions in the last 30 days
      const totalCalls = c.metrics.callFrequency || 0;
      const totalSMS = c.metrics.smsFrequency || 0;
      
      // Calculate initiation data from ratios
      // callInitiationRatio = outgoing / total
      const initiatedByUserCalls = Math.round(totalCalls * (c.metrics.callInitiationRatio || 0));
      const initiatedByUserSMS = Math.round(totalSMS * (c.metrics.smsInitiationRatio || 0));
      const initiatedByUser = initiatedByUserCalls + initiatedByUserSMS;
      
      // Reciprocity from SMS (0-1 scale where 1 = perfect balance)
      // We'll approximate contact-initiated as total - user-initiated
      const initiatedByContact = (totalCalls + totalSMS) - initiatedByUser;
      
      return {
        id: c.id,
        name: c.name,
        phoneNumber: c.phoneNumbers?.[0],
        email: c.emails?.[0],
        isFamily: !!c.potentialFamily,
        familyTier: c.potentialFamily?.tier || undefined,
        callCount: totalCalls,
        smsCount: totalSMS,
        totalDuration: c.metrics.totalCallDuration,
        lastInteraction: c.metrics.lastInteraction ? new Date(c.metrics.lastInteraction).toISOString() : undefined,
        initiatedByUser,
        initiatedByContact,
        reciprocityScore: c.metrics.smsReciprocity,
        contactInitiationRatio: c.metrics.callInitiationRatio,
        averageResponseTime: c.metrics.averageResponseTime,
      };
    });
    
    // Calculate Dunbar layers
    const contactsWithLayers = await calculateDunbarLayers(contactsForCalculation);
    
    console.log('');
    console.log('=' .repeat(60));
    console.log('📊 DUNBAR LAYER CALCULATION COMPLETE');
    console.log('=' .repeat(60));
    console.log(`Total contacts: ${contactsWithLayers.length}`);
    
    // Count by layer
    const layerCounts = [0, 0, 0, 0, 0, 0];
    contactsWithLayers.forEach(c => {
      layerCounts[c.dunbarLayer || 5]++;
    });
    
    console.log('Layer distribution:');
    console.log(`  Layer 0 (Intimate Core):    ${layerCounts[0]} contacts`);
    console.log(`  Layer 1 (Sympathy Group):   ${layerCounts[1]} contacts`);
    console.log(`  Layer 2 (Close Group):      ${layerCounts[2]} contacts`);
    console.log(`  Layer 3 (Tribe):            ${layerCounts[3]} contacts`);
    console.log(`  Layer 4 (Acquaintances):    ${layerCounts[4]} contacts`);
    console.log(`  Layer 5 (Social Nebula):    ${layerCounts[5]} contacts`);
    console.log('=' .repeat(60));
    console.log('');
    
    // ============================================================================
    // DUAL-WRITE: Save contacts to BOTH old and new structures
    // ============================================================================
    
    console.log('');
    console.log('=' .repeat(60));
    console.log('💾 SAVING CONTACTS TO JAZZ (DUAL-WRITE)');
    console.log('=' .repeat(60));
    
    // LEGACY: Save to old contacts list (for backward compatibility)
    let existingContacts = root.contacts;
    
    if (!existingContacts) {
      console.log("Creating legacy contacts list...");
      existingContacts = ContactList.create([], me);
      root.$jazz.set('contacts', existingContacts);
    }
    
    // Clear existing contacts if re-analyzing
    if (existingContacts.length > 0) {
      console.log(`🔄 Clearing ${existingContacts.length} existing contacts...`);
      while (existingContacts.length > 0) {
        existingContacts.$jazz.splice(0, 1);
      }
    }
    
    // NEW: Initialize layer-specific lists (performance optimization)
    console.log('Creating optimized layer-specific lists...');
    const layerLists = [
      ContactSummaryList.create([], me), // Layer 0
      ContactSummaryList.create([], me), // Layer 1
      ContactSummaryList.create([], me), // Layer 2
      ContactSummaryList.create([], me), // Layer 3
      ContactSummaryList.create([], me), // Layer 4
      ContactSummaryList.create([], me), // Layer 5
    ];
    
    // Add contacts to BOTH structures
    console.log(`Adding ${contactsWithLayers.length} contacts...`);
    let addedCount = 0;
    
    for (const contact of contactsWithLayers) {
      const originalContact = contacts.find(c => c.id === contact.id);
      
      // Create FULL contact for legacy list
      const fullContact = Contact.create({
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
        callCount: contact.callCount,
        smsCount: contact.smsCount,
        totalDuration: contact.totalDuration,
        isFamily: contact.isFamily,
        familyTier: contact.familyTier,
        familyRole: originalContact?.potentialFamily?.role,
        quickSortStatus: "not_sorted",
        createdAt: new Date().toISOString(),
      }, me);
      
      // Push to legacy list
      existingContacts.$jazz.push(fullContact);
      
      // Create LIGHTWEIGHT summary for layer list
      const summary = ContactSummary.create({
        sourceId: contact.id,
        name: contact.name,
        dunbarLayer: contact.dunbarLayer,
        lastInteraction: contact.lastInteraction,
        interactionScore: contact.interactionScore,
        isFamily: contact.isFamily,
        familyTier: contact.familyTier,
        familyRole: originalContact?.potentialFamily?.role,
        quickSortStatus: "not_sorted",
        fullContactId: contact.id || `contact-${Date.now()}-${addedCount}`, // Reference by sourceId
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }, me);
      
      // Push to appropriate layer list
      const layer = contact.dunbarLayer || 5;
      layerLists[layer].$jazz.push(summary);
      
      addedCount++;
    }
    
    // Save layer lists to profile
    root.$jazz.set('layer0Contacts', layerLists[0]);
    root.$jazz.set('layer1Contacts', layerLists[1]);
    root.$jazz.set('layer2Contacts', layerLists[2]);
    root.$jazz.set('layer3Contacts', layerLists[3]);
    root.$jazz.set('layer4Contacts', layerLists[4]);
    root.$jazz.set('layer5Contacts', layerLists[5]);
    
    console.log(`✅ Saved ${addedCount} contacts to legacy list`);
    console.log(`✅ Saved summaries to layer lists:`);
    console.log(`   Layer 0: ${layerLists[0].length} contacts`);
    console.log(`   Layer 1: ${layerLists[1].length} contacts`);
    console.log(`   Layer 2: ${layerLists[2].length} contacts`);
    console.log(`   Layer 3: ${layerLists[3].length} contacts`);
    console.log(`   Layer 4: ${layerLists[4].length} contacts`);
    console.log(`   Layer 5: ${layerLists[5].length} contacts`);
    console.log('=' .repeat(60));
    console.log('');
    
    // Wait a moment for Jazz to process the save
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify the save
    const savedContacts = root.contacts || [];
    console.log('');
    console.log('=' .repeat(60));
    console.log('🔍 JAZZ SAVE VERIFICATION');
    console.log('=' .repeat(60));
    console.log(`Contacts in Jazz after save: ${savedContacts.length}`);
    
    if (savedContacts.length !== addedCount) {
      console.error(`❌ MISMATCH: Tried to save ${addedCount} but only ${savedContacts.length} found in Jazz!`);
    } else {
      console.log('✅ All contacts successfully saved to Jazz');
    }
    
    // Verify layer distribution
    const savedLayerCounts = [0, 0, 0, 0, 0, 0];
    Array.from(savedContacts).forEach((c: any) => {
      savedLayerCounts[c?.dunbarLayer || 5]++;
    });
    
    console.log('Saved layer distribution:');
    console.log(`  Layer 0: ${savedLayerCounts[0]}`);
    console.log(`  Layer 1: ${savedLayerCounts[1]}`);
    console.log(`  Layer 2: ${savedLayerCounts[2]}`);
    console.log(`  Layer 3: ${savedLayerCounts[3]}`);
    console.log(`  Layer 4: ${savedLayerCounts[4]}`);
    console.log(`  Layer 5: ${savedLayerCounts[5]}`);
    console.log('=' .repeat(60));
    console.log('');
    
    // Compute and save dashboard summary for performance
    console.log('');
    console.log('=' .repeat(60));
    console.log('📊 COMPUTING DASHBOARD SUMMARY');
    console.log('=' .repeat(60));
    
    const hiddenCount = Array.from(savedContacts).filter((c: any) => c?.quickSortStatus === "hidden").length;
    const unsortedCount = Array.from(savedContacts).filter((c: any) => 
      c?.quickSortStatus === "not_sorted" || !c?.quickSortStatus
    ).length;
    
    const summary = DashboardSummary.create({
      totalContacts: savedContacts.length,
      layer0Count: savedLayerCounts[0],
      layer1Count: savedLayerCounts[1],
      layer2Count: savedLayerCounts[2],
      layer3Count: savedLayerCounts[3],
      layer4Count: savedLayerCounts[4],
      layer5Count: savedLayerCounts[5],
      hiddenCount,
      unsortedCount,
      lastUpdated: new Date().toISOString(),
    }, me);
    
    root.$jazz.set('dashboardSummary', summary);
    
    console.log('Dashboard Summary:');
    console.log(`  Total: ${savedContacts.length}`);
    console.log(`  Hidden: ${hiddenCount}`);
    console.log(`  Unsorted: ${unsortedCount}`);
    console.log('✅ Dashboard summary saved');
    console.log('=' .repeat(60));
    console.log('');
    
    // Mark contact analysis as completed
    console.log('📝 Setting hasCompletedContactAnalysis flag to true...');
    root.$jazz.set('hasCompletedContactAnalysis', true);
    
    // Wait for flag to persist
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Contact analysis marked as completed');
    
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
    const root = me?.$isLoaded ? me.root as any : null;
    const savedFamilyNames = root?.familyNames ? {
      birthLastName: root.familyNames.birthLastName,
      currentLastName: root.familyNames.currentLastName,
      spouseLastName: root.familyNames.spouseLastName,
      otherFamilyNames: root.familyNames.otherFamilyNames,
    } : undefined;
    
    if (savedFamilyNames && (savedFamilyNames.birthLastName || savedFamilyNames.currentLastName || savedFamilyNames.spouseLastName)) {
      console.log('');
      console.log('📂 LOADED SAVED FAMILY NAMES FROM JAZZ');
      console.log('Birth last name:', savedFamilyNames.birthLastName || '(none)');
      console.log('Current last name:', savedFamilyNames.currentLastName || '(none)');
      console.log('Spouse last name:', savedFamilyNames.spouseLastName || '(none)');
      console.log('→ Will skip family name questionnaire');
      console.log('');
    }
    
    // 🔧 DIAGNOSTIC: Show bypass option if flags indicate data should exist
    const hasCompletedAnalysis = root?.hasCompletedContactAnalysis;
    const showDiagnosticBypass = hasCompletedAnalysis && (!root?.contacts || root.contacts.length === 0);
    
    return (
      <View className="flex-1 bg-black">
        {showDiagnosticBypass && (
          <View className="absolute top-16 left-0 right-0 z-50 px-6">
            <View className="bg-yellow-950 border-2 border-yellow-600 p-4">
              <Text className="text-yellow-400 text-xs font-bold mb-2">
                🔧 DIAGNOSTIC MODE
              </Text>
              <Text className="text-yellow-200 text-xs mb-3">
                Flag shows analysis completed but no contacts found. This might be a Jazz lazy-loading issue.
              </Text>
              <Pressable
                onPress={() => {
                  console.log('🔧 DIAGNOSTIC BYPASS: Skipping data mining, going to dashboard');
                  console.log('This will show if contacts load after a delay');
                  setNeedsDataMining(false);
                  setShowDataMining(false);
                  hasAnalyzed.current = false;
                  // Wait a bit longer for Jazz to load
                  setTimeout(() => analyzeRelationships(), 1000);
                }}
                className="bg-yellow-600 py-3 px-4"
                accessibilityRole="button"
                accessibilityLabel="Skip to dashboard for diagnosis"
              >
                <Text className="text-black text-center text-sm font-bold">
                  SKIP TO DASHBOARD (Diagnostic)
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        
        <DataMiningScreen 
          onComplete={handleDataMiningComplete}
          savedFamilyNames={savedFamilyNames}
        />
      </View>
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
    if (!me?.$isLoaded) return;
    
    const root = me.root as any;
    const contacts = root?.contacts || [];
    
    // Find the contact to update
    const contactIndex = contacts.findIndex((c: any) => c.id === updatedContact.id || c.sourceId === updatedContact.id);
    
    if (contactIndex !== -1) {
      const existingContact = contacts[contactIndex];
      
      // Update contact fields directly in the existing Jazz CoMap
      // Jazz CoMaps track changes automatically
      const contactToUpdate = contacts[contactIndex];
      
      // Update only the fields that changed
      if (updatedContact.dunbarLayer !== undefined && updatedContact.dunbarLayer !== contactToUpdate.dunbarLayer) {
        contactToUpdate.$jazz.set('dunbarLayer', updatedContact.dunbarLayer);
      }
      if (updatedContact.notes !== undefined && updatedContact.notes !== contactToUpdate.notes) {
        contactToUpdate.$jazz.set('notes', updatedContact.notes);
      }
      if (updatedContact.cultivationGoal !== undefined && updatedContact.cultivationGoal !== contactToUpdate.cultivationGoal) {
        contactToUpdate.$jazz.set('cultivationGoal', updatedContact.cultivationGoal);
      }
      
      console.log('Contact updated:', updatedContact.name);
      
      // Refresh summary cache and dashboard
      await refreshSummary();
    }
  };

  // Show contact detail from search
  if (searchSelectedContact) {
    const contactLayer = LAYERS.find(l => l.id === searchSelectedContact.dunbarLayer) || LAYERS[5];
    
    return (
      <LayerDetailScreen
        layer={{
          ...contactLayer,
          description: getLayerDescription(contactLayer.id),
        }}
        contacts={[searchSelectedContact]}
        onBack={() => setSearchSelectedContact(null)}
        onContactUpdate={(updatedContact) => {
          handleContactUpdate(updatedContact);
          setSearchSelectedContact(null);
        }}
        onStartTendGarden={() => {
          setSearchSelectedContact(null);
          setShowQuickSort(true);
        }}
      />
    );
  }

  // Show layer detail screen if a layer is selected
  // NEW: Lazy load contacts from layer-specific list (optimized!)
  if (selectedLayerId !== null) {
    const selectedLayer = LAYERS.find(l => l.id === selectedLayerId);
    
    if (selectedLayer) {
      return (
        <LazyLayerDetailScreen
          layerId={selectedLayerId}
          layer={{
            ...selectedLayer,
            description: getLayerDescription(selectedLayerId),
          }}
          onBack={() => setSelectedLayerId(null)}
          onContactUpdate={handleContactUpdate}
          onStartTendGarden={() => {
            setSelectedLayerId(null);
            setShowQuickSort(true);
          }}
        />
      );
    }
  }

  // Show graveyard screen if opened
  // Lazy load hidden contacts only when graveyard is opened
  if (showGraveyard) {
    const root = me?.$isLoaded ? me.root as any : null;
    const contacts = root?.contacts || [];
    const hiddenContacts = Array.from(contacts).filter((c: any) => c?.quickSortStatus === "hidden");
    
    return (
      <GraveyardScreen
        onBack={() => setShowGraveyard(false)}
        hiddenContacts={hiddenContacts}
        onContactUpdate={() => {
          // Refresh summary cache and dashboard
          setShowGraveyard(false);
          refreshSummary();
        }}
      />
    );
  }

  // Handle scroll event for graveyard reveal
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    
    // Debug: Log when user is pulling to reveal
    if (offsetY < -20) {
      console.log('🪦 Pulling to reveal graveyard, offset:', offsetY, 'threshold:', GRAVEYARD_REVEAL_THRESHOLD);
    }
  };

  // Get hidden contacts count from summary (FAST - no contact loading!)
  const root = me?.$isLoaded ? me.root as any : null;
  const summary = root?.dashboardSummary;
  const hiddenContactsCount = summary?.hiddenCount || 0;
  const unsortedCountFromSummary = summary?.unsortedCount || 0;

  const withinDunbar = layerStats.slice(0, 4).reduce((sum, layer) => sum + layer.count, 0);
  const dunbarHealth = withinDunbar <= 150 ? "healthy" : "overextended";

  return (
    <View className="flex-1 bg-black">
      {/* Graveyard Reveal Card - Shows on overscroll */}
      {hiddenContactsCount > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              paddingHorizontal: 24,
              paddingTop: 60,
            },
            graveyardAnimatedStyle,
          ]}
        >
          <Pressable
            onPress={() => setShowGraveyard(true)}
            className="bg-zinc-950 border-2 border-zinc-700 p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
            }}
            accessibilityLabel="Open graveyard"
            accessibilityRole="button"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-4xl mr-3">🪦</Text>
                <View>
                  <Text className="text-zinc-400 text-lg font-bold">
                    Graveyard
                  </Text>
                  <Text className="text-zinc-600 text-xs">
                    {hiddenContactsCount} hidden {hiddenContactsCount === 1 ? 'contact' : 'contacts'}
                  </Text>
                </View>
              </View>
              <Text className="text-zinc-600 text-sm">Tap to dig up →</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}
      
      <ScrollView 
        className="flex-1"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={true}
      >
        <View className="px-6 py-8">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-4xl text-primary mb-2 font-bold tracking-wide">
              Your Garden
            </Text>
            <Text className="text-base text-zinc-400 mb-4">
              {totalContacts} relationships cultivated
            </Text>
            
            {/* Search Bar */}
            <SearchBar 
              totalContacts={totalContacts}
              onPress={() => setShowSearch(true)}
            />
            
            {/* DEBUG: Manual Graveyard Button */}
            {hiddenContactsCount > 0 && (
              <Pressable
                onPress={() => setShowGraveyard(true)}
                className="bg-zinc-800 p-4 mt-4 border-2 border-zinc-600"
              >
                <Text className="text-white text-center">
                  🪦 DEBUG: Open Graveyard ({hiddenContactsCount} hidden)
                </Text>
              </Pressable>
            )}
          </View>

        {/* Hero Cards & Tend Garden - Use summary for violations */}
        {(() => {
          // Detect violations from summary counts (FAST - no contact loading!)
          const LAYER_CAPACITIES = [5, 10, 35, 100]; // Layers 0-3
          const layerCountsFromSummary = [
            summary?.layer0Count || 0,
            summary?.layer1Count || 0,
            summary?.layer2Count || 0,
            summary?.layer3Count || 0,
          ];
          
          const violations = [];
          for (let i = 0; i < LAYER_CAPACITIES.length; i++) {
            if (layerCountsFromSummary[i] > LAYER_CAPACITIES[i]) {
              const LAYER_NAMES = ["Loved Ones", "Inner Circle", "Clan", "Tribe"];
              violations.push({
                layer: i,
                layerName: LAYER_NAMES[i],
                current: layerCountsFromSummary[i],
                max: LAYER_CAPACITIES[i],
                overage: layerCountsFromSummary[i] - LAYER_CAPACITIES[i],
              });
            }
          }
          
          // Show Hero Cards if violations exist
          if (violations.length > 0) {
            // Use currentHeroIndex to show the active violation
            const activeIndex = Math.min(currentHeroIndex, violations.length - 1);
            const violation = violations[activeIndex];
            
            // Load layer contacts lazily only when opening modal
            const handleStartRanking = () => {
              const root = me?.$isLoaded ? me.root as any : null;
              const contacts = root?.contacts || [];
              const layerContacts = Array.from(contacts).filter(
                (c: any) => c?.dunbarLayer === violation.layer
              );
              
              setDunbarViolation({
                ...violation,
                contacts: layerContacts,
              });
              setShowWouldYouRather(true);
            };
            
            const handleStartQuickSelect = () => {
              const root = me?.$isLoaded ? me.root as any : null;
              const contacts = root?.contacts || [];
              const layerContacts = Array.from(contacts).filter(
                (c: any) => c?.dunbarLayer === violation.layer
              );
              
              setDunbarViolation({
                ...violation,
                contacts: layerContacts,
              });
              setShowOverflowSelection(true);
            };
            
            return (
              <View className="mb-8">
                {/* Hero Card */}
                <DunbarViolationHeroCard
                  violation={violation}
                  onStart={handleStartRanking}
                  onStartQuickSelect={handleStartQuickSelect}
                />
                
                {/* Pagination Dots - Only show if multiple violations */}
                {violations.length > 1 && (
                  <View className="flex-row justify-center items-center mt-4 gap-2">
                    {violations.map((_, index) => (
                      <Pressable
                        key={index}
                        onPress={() => setCurrentHeroIndex(index)}
                        accessibilityLabel={`View violation ${index + 1} of ${violations.length}`}
                        accessibilityRole="button"
                      >
                        <View
                          className={`w-2 h-2 rounded-full ${
                            index === activeIndex ? 'bg-red-500' : 'bg-zinc-600'
                          }`}
                        />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          }
          
          // Show Tend Garden if NO violations
          // Use unsorted count from summary (FAST!)
          const unsortedCount = unsortedCountFromSummary;
          
          // Only show if no violations (violations have priority)
          if (unsortedCount === 0) return null;
          
          return (
            <View className="mb-8">
              <View className="bg-gradient-to-br from-primary/20 to-primary/5 border-3 border-primary p-6 shadow-lg">
                {/* Attention-grabbing header */}
                <View className="flex-row items-center mb-3">
                  <View className="bg-primary w-2 h-2 rounded-full mr-2 animate-pulse" />
                  <Text className="text-primary text-xs font-bold uppercase tracking-widest">
                    🌱 ACTION NEEDED
                  </Text>
                </View>
                
                <Text className="text-white text-2xl font-bold mb-2 tracking-tight">
                  Tend Your Garden
                </Text>
                
                <Text className="text-zinc-300 text-base leading-relaxed mb-4">
                  You have <Text className="text-primary font-bold">{unsortedCount}</Text> relationship{unsortedCount !== 1 ? 's' : ''} waiting to be classified. Quick sort them into Family, Friends, or Business to unlock deeper insights.
                </Text>
                
                <Pressable
                  onPress={() => setShowQuickSort(true)}
                  className="bg-primary py-4 px-6 border-2 border-primary shadow-xl"
                  accessibilityLabel="Start tending garden"
                  accessibilityRole="button"
                  style={({ pressed }) => ({ 
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <Text className="text-center text-lg font-bold text-black tracking-wide">
                    START SORTING ({unsortedCount})
                  </Text>
                </Pressable>
                
                {/* Visual separator line */}
                <View className="mt-4 pt-4 border-t border-primary/30">
                  <Text className="text-primary/70 text-xs text-center">
                    ⚡ Takes 2-3 minutes • Unlock relationship insights
                  </Text>
                </View>
              </View>
            </View>
          );
        })()}


        {/* Dunbar Health */}
        <View className={`p-4 border-2 mb-8 ${
          dunbarHealth === "healthy" ? "border-green-900 bg-green-950/30" : "border-orange-900 bg-orange-950/30"
        }`}>
          <Text className={`text-xs font-semibold mb-3 uppercase tracking-wider ${
            dunbarHealth === "healthy" ? "text-green-400" : "text-orange-400"
          }`}>
            DUNBAR STATUS
          </Text>
          <Text className="text-white text-lg font-medium mb-1">
            {withinDunbar} of 150 active relationships
          </Text>
          <Text className="text-zinc-400 text-sm">
            {dunbarHealth === "healthy" 
              ? "Your network is within healthy limits"
              : "Consider pruning to maintain quality connections"
            }
          </Text>
        </View>

        {/* Layers */}
        <Text className="text-2xl text-white mb-4 font-bold tracking-wide">
          Relationship Layers
        </Text>

        {layerStats.map((layerStat, index) => {
          const layer = LAYERS[index];
          
          // IMPORTANT: Layers are NESTED/INCLUSIVE, not additive
          // These capacities match the dunbarCalculator.ts LAYER_THRESHOLDS
          const LAYER_CAPACITIES = [
            5,    // Layer 0: 5 people max (Loved Ones)
            10,   // Layer 1: 10 additional people (15 total including Layer 0)
            35,   // Layer 2: 35 additional people (50 total including Layers 0-1)
            100,  // Layer 3: 100 additional people (150 total including Layers 0-2)
            350,  // Layer 4: 350 additional people (500 total including Layers 0-3)
            1000, // Layer 5: 1000 additional people (1500 total)
          ];
          
          const layerCapacity = LAYER_CAPACITIES[index];
          
          // Calculate percentage based on layer capacity
          const percentage = (layerStat.count / layerCapacity) * 100;
          
          const isEmpty = layerStat.count === 0;
          const isNotFull = layerStat.count < layerCapacity && layer.id < 4; // Only prompt for layers 0-3

          return (
            <Pressable
              key={layer.id}
              onPress={() => setSelectedLayerId(layer.id)}
              className="mb-4"
              accessibilityLabel={`${layer.name} layer, ${layerStat.count} contacts`}
              accessibilityRole="button"
              style={({ pressed }) => ({ 
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              <View className="bg-zinc-900 border-2 border-zinc-800 p-4">
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
                    {layerStat.count}/{layerCapacity} ({Math.round(percentage)}%)
                  </Text>
                </View>

                {/* Progress Bar - Increased height for better visibility */}
                <View className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: layer.color,
                    }}
                  />
                </View>
              </View>
            </Pressable>
          );
        })}



        {/* Re-analyze Data Button */}
        <View className="mt-4 mb-8">
          <Button 
            variant="secondary"
            onPress={() => setShowDataMining(true)}
          >
            Re-analyze Relationship Data
          </Button>
        </View>
      </View>

      {/* Contact Search Modal - Lazy load contacts when opened */}
      <ContactSearch
        visible={showSearch}
        contacts={(() => {
          if (!showSearch) return [];
          const root = me?.$isLoaded ? me.root as any : null;
          const contacts = root?.contacts || [];
          return Array.from(contacts)
            .filter((c: any) => c?.quickSortStatus !== "hidden")
            .map((c: any) => ({
              id: c?.id || c?.sourceId,
              sourceId: c?.sourceId,
              name: c?.name || 'Unknown',
              phoneNumber: c?.phoneNumber,
              email: c?.email,
              dunbarLayer: c?.dunbarLayer,
              interactionScore: c?.interactionScore,
              lastInteraction: c?.lastInteraction,
              callCount: c?.callCount,
              smsCount: c?.smsCount,
              totalDuration: c?.totalDuration,
              isFamily: c?.isFamily,
              quickSortStatus: c?.quickSortStatus,
              relationshipType: c?.relationshipType,
            }));
        })()}
        onSelectContact={(contact) => {
          setSearchSelectedContact(contact);
          setShowSearch(false);
        }}
        onClose={() => setShowSearch(false)}
      />

      {/* Tend Garden Modal - Lazy load contacts when opened */}
      <QuickSortModal
        visible={showQuickSort}
        onClose={() => {
          setShowQuickSort(false);
          // Refresh summary cache and dashboard after Tend Garden completes
          refreshSummary();
        }}
        contacts={(() => {
          if (!showQuickSort) return [];
          const root = me?.$isLoaded ? me.root as any : null;
          const contacts = root?.contacts || [];
          return Array.from(contacts)
            .filter((c: any) => c?.quickSortStatus !== "hidden")
            .map((c: any) => ({
              id: c?.id || c?.sourceId,
              sourceId: c?.sourceId,
              name: c?.name || 'Unknown',
              phoneNumber: c?.phoneNumber,
              email: c?.email,
              dunbarLayer: c?.dunbarLayer,
              interactionScore: c?.interactionScore,
              lastInteraction: c?.lastInteraction,
              callCount: c?.callCount,
              smsCount: c?.smsCount,
              totalDuration: c?.totalDuration,
              isFamily: c?.isFamily,
              quickSortStatus: c?.quickSortStatus,
              relationshipType: c?.relationshipType,
            }));
        })()}
      />
      
      {/* Would You Rather Modal - Dunbar Violation Resolution */}
      {dunbarViolation && (
        <WouldYouRatherModal
          visible={showWouldYouRather}
          onClose={() => {
            setShowWouldYouRather(false);
            setDunbarViolation(null);
          }}
          onRefresh={() => {
            // Refresh summary cache and dashboard after ranking completes
            refreshSummary();
          }}
          contacts={dunbarViolation.contacts || []}
          violatedLayer={dunbarViolation.layer}
          violatedLayerName={dunbarViolation.layerName}
          layerCapacity={dunbarViolation.max}
        />
      )}
      
      {/* Overflow Selection Modal - Quick checkbox selection for large groups */}
      {dunbarViolation && (
        <OverflowSelectionModal
          visible={showOverflowSelection}
          onClose={() => {
            setShowOverflowSelection(false);
            setDunbarViolation(null);
          }}
          onRefresh={() => {
            // Refresh summary cache and dashboard after selection
            refreshSummary();
          }}
          contacts={dunbarViolation.contacts || []}
          violatedLayer={dunbarViolation.layer}
          violatedLayerName={dunbarViolation.layerName}
          layerCapacity={dunbarViolation.max}
        />
      )}
      </ScrollView>
    </View>
  );
}