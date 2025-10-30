import { Tabs } from "expo-router";
import { Text, Platform, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

function TabIcon({ focused, icon }: { focused: boolean; icon: string }) {
  return (
    <View style={{ 
      width: 32, 
      height: 32, 
      alignItems: 'center', 
      justifyContent: 'center',
      opacity: focused ? 1 : 0.6,
    }}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
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
          borderTopWidth: 1,
          borderTopColor: '#22c55e',
          elevation: 12, // Higher elevation for Material Design z-layer effect
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
          position: 'relative',
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
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Garden",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🌱" />
          ),
        }}
      />
      <Tabs.Screen
        name="harvest"
        options={{
          title: "Harvest",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🌾" />
          ),
        }}
      />
    </Tabs>
  );
}