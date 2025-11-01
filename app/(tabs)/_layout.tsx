import { Tabs } from "expo-router";
import { Text, Platform, View, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useEffect, useRef } from 'react';

function TabIcon({ focused, icon, screenName }: { focused: boolean; icon: string; screenName?: string }) {
  const previousFocused = useRef(focused);
  
  useEffect(() => {
    // Only log when focus actually changes from false to true
    if (focused && !previousFocused.current && screenName) {
      console.log(`🎯 TAB SELECTED: ${screenName}`);
    }
    previousFocused.current = focused;
  }, [focused, screenName]);
  
  return (
    <View style={{ 
      width: 44,  // Increased to meet 44pt minimum touch target
      height: 44, // Increased to meet 44pt minimum touch target
      alignItems: 'center', 
      justifyContent: 'center',
      opacity: focused ? 1 : 0.6,
    }}>
      <Text style={{ fontSize: 28 }}>{icon}</Text>
    </View>
  );
}

export default function TabLayout() {
  const tabBarHeight = Platform.OS === "ios" ? 88 : 72;
  const tabBarPaddingBottom = Platform.OS === "ios" ? 28 : 12;
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            {/* Glassmorphic blur effect */}
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            {/* Subtle gradient overlay for depth */}
            <LinearGradient
              colors={[
                'rgba(10, 31, 15, 0.85)',   // Dark green with transparency
                'rgba(26, 58, 31, 0.75)',   // Medium green with more transparency
                'rgba(15, 40, 20, 0.80)',   // Dark green with transparency
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Top border glow effect */}
            <View 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: '#22c55e',
                shadowColor: '#22c55e',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
              }}
            />
          </View>
        ),
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0, // Remove border since we have a glowing one
          elevation: 0, // Remove default elevation
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          position: 'absolute',
          overflow: 'hidden', // Important for blur to work properly
        },
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#4a5f4d",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        sceneStyle: {
          backgroundColor: "#000",
        },
        // Add smooth fade transition between tabs
        animation: 'fade',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Garden",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🌱" screenName="Garden" />
          ),
        }}
      />
      <Tabs.Screen
        name="harvest"
        options={{
          title: "Harvest",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🌾" screenName="Harvest" />
          ),
        }}
      />
    </Tabs>
  );
}