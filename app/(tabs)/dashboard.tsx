/**
 * Layer-Based Dashboard (STORY-011)
 * 
 * Primary view showing relationship health organized by Dunbar layers.
 * Shows behavioral reality of user's relationships.
 */

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useAccount } from "jazz-tools/expo";
import { router } from "expo-router";
import { calculateDunbarLayers } from "@/services/dunbarCalculator";

// Layer definitions from PRD
const LAYERS = [
  { id: 0, name: "Intimate Core", range: "1-5", color: "#ef4444" },
  { id: 1, name: "Sympathy Group", range: "5-15", color: "#f97316" },
  { id: 2, name: "Close Group", range: "15-50", color: "#eab308" },
  { id: 3, name: "Tribe", range: "50-150", color: "#22c55e" },
  { id: 4, name: "Acquaintances", range: "150-250", color: "#3b82f6" },
  { id: 5, name: "Social Nebula", range: "250+", color: "#8b5cf6" },
];

interface LayerStats {
  layer: number;
  count: number;
  contacts: any[];
}

export default function Dashboard() {
  const { me } = useAccount();
  const [layerStats, setLayerStats] = useState<LayerStats[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [totalContacts, setTotalContacts] = useState(0);

  useEffect(() => {
    if (!me) return;
    
    analyzeRelationships();
  }, [me]);

  const analyzeRelationships = async () => {
    try {
      setIsAnalyzing(true);
      
      const root = me?.root as any;
      const contacts = root?.contacts || [];
      
      // Calculate Dunbar layers for all contacts
      const analyzedContacts = await calculateDunbarLayers(contacts);
      
      // Group contacts by layer
      const layerGroups: LayerStats[] = LAYERS.map(layer => ({
        layer: layer.id,
        count: 0,
        contacts: [],
      }));
      
      analyzedContacts.forEach(contact => {
        const layer = contact.dunbarLayer || 5;
        layerGroups[layer].contacts.push(contact);
        layerGroups[layer].count++;
      });
      
      setLayerStats(layerGroups);
      setTotalContacts(analyzedContacts.length);
    } catch (error) {
      console.error("Error analyzing relationships:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-secondary mt-4">Analyzing your relationships...</Text>
      </View>
    );
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
              onPress={() => {
                // TODO: Navigate to contacts filtered by layer
                // router.push({
                //   pathname: "/(tabs)/contacts",
                //   params: { layer: layer.id },
                // });
                console.log(`View layer ${layer.id}: ${layer.name}`);
              }}
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
      </View>
    </ScrollView>
  );
}