/**
 * Jazz Data Inspector
 * 
 * Visual inspector for Jazz CoValue data
 * Shows actual data from your Jazz database in a readable format
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAccount } from 'jazz-tools/expo';

interface JazzInspectorProps {
  onClose: () => void;
}

export function JazzInspector({ onClose }: JazzInspectorProps) {
  const { me } = useAccount();
  const root = me?.root as any;

  if (!me || !root) {
    return (
      <View className="flex-1 bg-gray-900 p-6">
        <Text className="text-white text-xl mb-4">Jazz Data Inspector</Text>
        <Text className="text-gray-400">No Jazz data available (user not logged in)</Text>
        <TouchableOpacity onPress={onClose} className="mt-4 bg-blue-600 rounded-xl p-3">
          <Text className="text-white text-center font-semibold">Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="flex-row justify-between items-center p-6 border-b border-gray-800">
        <Text className="text-white text-xl font-bold">🎷 Jazz Inspector</Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-white text-xl">✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* User Profile */}
        <Section title="User Profile">
          <DataRow label="Display Name" value={root.displayName || 'Not set'} />
          <DataRow label="Email" value={root.email || 'Not set'} />
          <DataRow label="Phone" value={root.phone || 'Not set'} />
          <DataRow 
            label="Contact Analysis Complete" 
            value={root.hasCompletedContactAnalysis ? '✅ Yes' : '❌ No'} 
          />
        </Section>

        {/* Contacts */}
        <Section title="Contacts">
          <DataRow 
            label="Total Contacts" 
            value={root.contacts?.length || 0} 
          />
          {root.contacts && root.contacts.length > 0 && (
            <>
              <DataRow 
                label="First Contact" 
                value={root.contacts[0]?.name || 'Unknown'} 
              />
              <DataRow 
                label="Last Contact" 
                value={root.contacts[root.contacts.length - 1]?.name || 'Unknown'} 
              />
            </>
          )}
        </Section>

        {/* Family Names */}
        <Section title="Family Names">
          {root.familyNames ? (
            <>
              <DataRow 
                label="Birth Last Name" 
                value={root.familyNames.birthLastName || 'Not set'} 
              />
              <DataRow 
                label="Current Last Name" 
                value={root.familyNames.currentLastName || 'Not set'} 
              />
              <DataRow 
                label="Spouse Last Name" 
                value={root.familyNames.spouseLastName || 'Not set'} 
              />
              <DataRow 
                label="Other Family Names" 
                value={root.familyNames.otherFamilyNames?.join(', ') || 'None'} 
              />
            </>
          ) : (
            <Text className="text-gray-400">No family names set</Text>
          )}
        </Section>

        {/* Interactions */}
        <Section title="Interactions">
          <DataRow 
            label="Total Interactions" 
            value={root.interactions?.length || 0} 
          />
        </Section>

        {/* Goals */}
        <Section title="Goals">
          <DataRow 
            label="Total Goals" 
            value={root.goals?.length || 0} 
          />
        </Section>

        {/* Settings */}
        <Section title="Settings">
          {root.settings ? (
            <>
              <DataRow 
                label="Notifications" 
                value={root.settings.notificationsEnabled ? '🔔 Enabled' : '🔕 Disabled'} 
              />
              <DataRow 
                label="Dark Mode" 
                value={root.settings.darkMode ? '🌙 On' : '☀️ Off'} 
              />
              <DataRow 
                label="Privacy Level" 
                value={root.settings.privacyLevel || 'Not set'} 
              />
            </>
          ) : (
            <Text className="text-gray-400">No settings configured</Text>
          )}
        </Section>

        {/* Metadata */}
        <Section title="Metadata">
          <DataRow label="Created At" value={root.createdAt || 'Unknown'} />
          <DataRow label="Last Active" value={root.lastActive || 'Unknown'} />
        </Section>

        {/* Raw JSON Preview */}
        <Section title="Raw Data Preview">
          <View className="bg-gray-800 rounded-lg p-4">
            <Text className="text-green-400 text-xs font-mono">
              {JSON.stringify({
                displayName: root.displayName,
                email: root.email,
                hasCompletedContactAnalysis: root.hasCompletedContactAnalysis,
                contactsCount: root.contacts?.length || 0,
                interactionsCount: root.interactions?.length || 0,
                goalsCount: root.goals?.length || 0,
              }, null, 2)}
            </Text>
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm font-semibold mb-3">{title}</Text>
      <View className="bg-gray-800 rounded-xl p-4">
        {children}
      </View>
    </View>
  );
}

function DataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-700 last:border-b-0">
      <Text className="text-gray-400 text-sm">{label}</Text>
      <Text className="text-white text-sm font-semibold">{value}</Text>
    </View>
  );
}
