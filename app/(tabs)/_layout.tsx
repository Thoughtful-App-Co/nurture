import { Tabs } from "expo-router";
import { Text, Platform, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

function TabIcon({ focused, icon }: { focused: boolean; icon: string }) {
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => (
          <LinearGradient
            colors={['#0a1f0f', '#1a3a1f', '#0f2814']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />
        ),
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 2, // Consistent with design system (2px borders)
          borderTopColor: '#22c55e',
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          height: Platform.OS === "ios" ? 88 : 72, // Increased Android height for better touch targets
          paddingBottom: Platform.OS === "ios" ? 28 : 12, // More padding on Android
          paddingTop: 8,
          position: 'absolute', // Changed from 'relative' to 'absolute' to prevent shifting
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
            <TabIcon focused={focused} icon="🌱" />
          ),
          // Prevent tab bar from being hidden by child screens
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 2,
            borderTopColor: '#22c55e',
            elevation: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            height: Platform.OS === "ios" ? 88 : 72,
            paddingBottom: Platform.OS === "ios" ? 28 : 12,
            paddingTop: 8,
            position: 'absolute',
          },
        }}
      />
      <Tabs.Screen
        name="harvest"
        options={{
          title: "Harvest",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🌾" />
          ),
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 2,
            borderTopColor: '#22c55e',
            elevation: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            height: Platform.OS === "ios" ? 88 : 72,
            paddingBottom: Platform.OS === "ios" ? 28 : 12,
            paddingTop: 8,
            position: 'absolute',
          },
        }}
      />
    </Tabs>
  );
}