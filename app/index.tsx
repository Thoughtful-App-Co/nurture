/**
 * Main Entry Point
 * 
 * Shows auth screen if not authenticated, otherwise shows welcome home
 */

import { Text, View, ActivityIndicator } from "react-native";
import { useAccount } from "jazz-tools/expo";
import { AuthScreen } from "@/components/auth/auth-screen";

export default function Index() {
  const { me } = useAccount();

  // Loading state
  if (me === undefined) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  // Not authenticated - show auth screen
  if (!me) {
    return <AuthScreen />;
  }

  // Authenticated - show welcome home
  // Access displayName from root with type assertion
  const root = me.root as any;
  const displayName = root?.displayName || "Friend";
  const nameParts = displayName.split(" ");
  const firstName = nameParts[0] || "Friend";
  const lastName = nameParts.slice(1).join(" ");

  return (
    <View className="flex-1 bg-black justify-center px-8">
      <View className="mb-12">
        <Text className="text-5xl font-bold text-primary mb-6">
          Welcome
        </Text>
        <Text className="text-4xl font-light text-white mb-2">
          {firstName}
        </Text>
        {lastName && (
          <Text className="text-4xl font-light text-white">
            {lastName}
          </Text>
        )}
      </View>

      <View className="mt-8">
        <Text className="text-lg text-secondary leading-relaxed">
          Your garden awaits.{"\n"}
          Let&apos;s cultivate meaningful connections.
        </Text>
      </View>

      {/* Placeholder for next steps */}
      <View className="mt-12 p-6 border border-zinc-800 bg-zinc-900">
        <Text className="text-sm text-secondary font-medium mb-2">
          NEXT STEPS
        </Text>
        <Text className="text-white text-base leading-relaxed">
          • Import your contacts{"\n"}
          • Discover your relationship layers{"\n"}
          • Set cultivation goals{"\n"}
          • Start nurturing connections
        </Text>
      </View>
    </View>
  );
}
