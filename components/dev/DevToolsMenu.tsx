/**
 * Dev Tools Menu Component
 * 
 * Only visible in development builds (__DEV__ === true)
 * Provides quick access to:
 * - Native module diagnostics
 * - App state inspector
 * - Feature flag toggles
 * - Quick actions (clear data, etc.)
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { FeatureFlags } from '@/config/featureFlags';
import { runDiagnostics } from '@/scripts/diagnose-data-mining';
import { JazzInspector } from './JazzInspector';

export function DevToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showJazzInspector, setShowJazzInspector] = useState(false);
  
  // Only show in development builds
  if (!FeatureFlags.SHOW_DEV_MENU) {
    return null;
  }

  const handleRunDiagnostics = async () => {
    setIsOpen(false);
    await runDiagnostics();
    Alert.alert('Diagnostics Complete', 'Check console for detailed output');
  };

  const handleClearAppData = () => {
    Alert.alert(
      'Clear App Data?',
      'This will reset the app to a fresh state. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // In development, just refresh
            Alert.alert('Dev Mode', 'Run: adb shell pm clear com.thoughtfulappco.nurture');
          },
        },
      ]
    );
  };

  const handleViewJazzData = () => {
    setIsOpen(false);
    setShowJazzInspector(true);
  };

  return (
    <>
      {/* Floating FAB Button */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="absolute bottom-20 right-4 bg-purple-600 rounded-full w-14 h-14 items-center justify-center shadow-lg z-50"
        style={{ elevation: 5 }}
      >
        <Text className="text-white text-2xl">🛠️</Text>
      </TouchableOpacity>

      {/* Jazz Inspector Modal */}
      <Modal
        visible={showJazzInspector}
        animationType="slide"
        onRequestClose={() => setShowJazzInspector(false)}
      >
        <JazzInspector onClose={() => setShowJazzInspector(false)} />
      </Modal>

      {/* Dev Tools Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-gray-900 rounded-t-3xl p-6 max-h-[80%]">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">🛠️ Dev Tools</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text className="text-white text-xl">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Diagnostics Section */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm font-semibold mb-3">DIAGNOSTICS</Text>
                
                <TouchableOpacity
                  onPress={handleRunDiagnostics}
                  className="bg-blue-600 rounded-xl p-4 mb-3"
                >
                  <Text className="text-white font-semibold">📊 Run Full Diagnostics</Text>
                  <Text className="text-blue-200 text-xs mt-1">
                    Check native modules, permissions, data mining
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleViewJazzData}
                  className="bg-green-600 rounded-xl p-4 mb-3"
                >
                  <Text className="text-white font-semibold">🎷 Inspect Jazz Data</Text>
                  <Text className="text-green-200 text-xs mt-1">
                    View CoValues, sync status, data structures
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quick Actions */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm font-semibold mb-3">QUICK ACTIONS</Text>
                
                <TouchableOpacity
                  onPress={handleClearAppData}
                  className="bg-red-600 rounded-xl p-4 mb-3"
                >
                  <Text className="text-white font-semibold">🗑️ Clear App Data</Text>
                  <Text className="text-red-200 text-xs mt-1">
                    Reset to fresh install state
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Feature Flags Status */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm font-semibold mb-3">FEATURE FLAGS</Text>
                <View className="bg-gray-800 rounded-xl p-4">
                  {Object.entries(FeatureFlags).map(([key, value]) => (
                    <View key={key} className="flex-row justify-between py-2 border-b border-gray-700">
                      <Text className="text-gray-300 text-xs flex-1">{key}</Text>
                      <Text className={`text-xs font-semibold ${value ? 'text-green-400' : 'text-gray-500'}`}>
                        {value ? '✓ ON' : '○ OFF'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Build Info */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm font-semibold mb-3">BUILD INFO</Text>
                <View className="bg-gray-800 rounded-xl p-4">
                  <InfoRow label="Mode" value={__DEV__ ? 'Development' : 'Production'} />
                  <InfoRow label="Platform" value="Android" />
                  <InfoRow label="Build Type" value="EAS Development Client" />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-700">
      <Text className="text-gray-400 text-sm">{label}</Text>
      <Text className="text-white text-sm font-semibold">{value}</Text>
    </View>
  );
}
