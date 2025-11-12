/**
 * Jazz Data Inspector
 * 
 * Visual inspector for Jazz CoValue data
 * Shows actual data from your Jazz database in a readable format
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAccount } from 'jazz-tools/expo';

interface JazzInspectorProps {
  onClose: () => void;
}

export function JazzInspector({ onClose }: JazzInspectorProps) {
  // Performance optimization: Use $each to batch-load all contacts in one operation
  const { me } = useAccount(undefined, {
    resolve: {
      root: {
        contacts: { $each: true },
        interactions: { $each: true },
        goals: { $each: true },
        dashboardSummary: true,
      }
    }
  });
  const root = me?.root as any;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  // Calculate statistics - filter out null/undefined values
  const contactsArray = (root.contacts || []).filter((c: any) => c != null);
  const interactionsArray = (root.interactions || []).filter((i: any) => i != null);
  const goalsArray = (root.goals || []).filter((g: any) => g != null);
  const rankingSessionsArray = (root.rankingSessions || []).filter((s: any) => s != null);
  const comparisonsArray = (root.comparisons || []).filter((c: any) => c != null);
  
  const layerDistribution = contactsArray.reduce((acc: Record<number, number>, contact: any) => {
    const layer = contact.dunbarLayer ?? 5;
    acc[layer] = (acc[layer] || 0) + 1;
    return acc;
  }, {});

  const relationshipTypes = contactsArray.reduce((acc: Record<string, number>, contact: any) => {
    const type = contact.relationshipType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const familyContacts = contactsArray.filter((c: any) => c.isFamily).length;
  const quickSortedContacts = contactsArray.filter((c: any) => c.quickSortStatus === 'sorted').length;
  const hiddenContacts = contactsArray.filter((c: any) => c.quickSortStatus === 'hidden').length;

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
            label="Onboarding Complete" 
            value={root.hasCompletedOnboarding ? '✅ Yes' : '❌ No'} 
          />
          <DataRow 
            label="Contact Analysis Complete" 
            value={root.hasCompletedContactAnalysis ? '✅ Yes' : '❌ No'} 
          />
          <DataRow label="Created At" value={root.createdAt || 'Unknown'} />
          <DataRow label="Last Active" value={root.lastActive || 'Unknown'} />
        </Section>

        {/* Contacts Overview */}
        <Section title="Contacts Overview">
          <DataRow label="Total Contacts" value={contactsArray.length} />
          <DataRow label="Family Members" value={familyContacts} />
          <DataRow label="Quick Sorted" value={quickSortedContacts} />
          <DataRow label="Hidden" value={hiddenContacts} />
        </Section>

        {/* Dunbar Layer Distribution */}
        <Section title="Dunbar Layer Distribution">
          <DataRow label="Layer 0 (Intimate)" value={layerDistribution[0] || 0} />
          <DataRow label="Layer 1 (Sympathy)" value={layerDistribution[1] || 0} />
          <DataRow label="Layer 2 (Clan)" value={layerDistribution[2] || 0} />
          <DataRow label="Layer 3 (Tribe)" value={layerDistribution[3] || 0} />
          <DataRow label="Layer 4 (Acquaintances)" value={layerDistribution[4] || 0} />
          <DataRow label="Layer 5 (Recognized)" value={layerDistribution[5] || 0} />
        </Section>

        {/* Relationship Types */}
        <Section title="Relationship Types">
          {Object.entries(relationshipTypes).map(([type, count]) => (
            <DataRow key={type} label={type} value={count as number} />
          ))}
        </Section>

        {/* Contact Samples */}
        <CollapsibleSection 
          title="Contact Samples (First 5)" 
          isExpanded={expandedSections.contacts}
          onToggle={() => toggleSection('contacts')}
        >
          {contactsArray.slice(0, 5).map((contact: any, idx: number) => (
            <View key={idx} className="mb-4 pb-4 border-b border-gray-700">
              <Text className="text-blue-400 font-semibold mb-2">{contact.name || 'Unnamed'}</Text>
              <DataRow label="Phone" value={contact.phoneNumber || 'N/A'} />
              <DataRow label="Layer" value={contact.dunbarLayer ?? 'N/A'} />
              <DataRow label="Type" value={contact.relationshipType || 'N/A'} />
              <DataRow label="Last Interaction" value={contact.lastInteraction || 'N/A'} />
              <DataRow label="Call Count" value={contact.callCount || 0} />
              <DataRow label="SMS Count" value={contact.smsCount || 0} />
              <DataRow label="Interaction Score" value={contact.interactionScore?.toFixed(2) || 'N/A'} />
            </View>
          ))}
        </CollapsibleSection>

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
        <Section title="Interactions Overview">
          <DataRow label="Total Interactions" value={interactionsArray.length} />
          {interactionsArray.length > 0 && (
            <>
              <DataRow 
                label="Manual Logs" 
                value={interactionsArray.filter((i: any) => i.source === 'manual').length} 
              />
              <DataRow 
                label="Auto Detected" 
                value={interactionsArray.filter((i: any) => i.source === 'automatic').length} 
              />
            </>
          )}
        </Section>

        {/* Interaction Samples */}
        <CollapsibleSection 
          title="Recent Interactions (First 5)" 
          isExpanded={expandedSections.interactions}
          onToggle={() => toggleSection('interactions')}
        >
          {interactionsArray.slice(0, 5).map((interaction: any, idx: number) => (
            <View key={idx} className="mb-4 pb-4 border-b border-gray-700">
              <Text className="text-green-400 font-semibold mb-2">{interaction.contactName || 'Unknown'}</Text>
              <DataRow label="Type" value={interaction.type || 'N/A'} />
              <DataRow label="Date" value={interaction.date || 'N/A'} />
              <DataRow label="Quality" value={interaction.quality || 'N/A'} />
              <DataRow label="Source" value={interaction.source || 'N/A'} />
              {interaction.notes && <DataRow label="Notes" value={interaction.notes} />}
            </View>
          ))}
        </CollapsibleSection>

        {/* Goals */}
        <Section title="Goals Overview">
          <DataRow label="Total Goals" value={goalsArray.length} />
          {goalsArray.length > 0 && (
            <>
              <DataRow 
                label="Active" 
                value={goalsArray.filter((g: any) => g.status === 'active').length} 
              />
              <DataRow 
                label="Completed" 
                value={goalsArray.filter((g: any) => g.status === 'completed').length} 
              />
            </>
          )}
        </Section>

        {/* Goal Samples */}
        <CollapsibleSection 
          title="Goal Samples (First 3)" 
          isExpanded={expandedSections.goals}
          onToggle={() => toggleSection('goals')}
        >
          {goalsArray.slice(0, 3).map((goal: any, idx: number) => (
            <View key={idx} className="mb-4 pb-4 border-b border-gray-700">
              <Text className="text-purple-400 font-semibold mb-2">{goal.title || 'Untitled'}</Text>
              <DataRow label="Status" value={goal.status || 'N/A'} />
              <DataRow label="Category" value={goal.category || 'N/A'} />
              <DataRow label="Progress" value={`${goal.progress || 0}%`} />
              {goal.description && <DataRow label="Description" value={goal.description} />}
            </View>
          ))}
        </CollapsibleSection>

        {/* Ranking Sessions */}
        <Section title="Ranking Sessions">
          <DataRow label="Total Sessions" value={rankingSessionsArray.length} />
          {rankingSessionsArray.length > 0 && (
            <>
              <DataRow 
                label="Active" 
                value={rankingSessionsArray.filter((s: any) => s.status === 'active').length} 
              />
              <DataRow 
                label="Completed" 
                value={rankingSessionsArray.filter((s: any) => s.status === 'completed').length} 
              />
            </>
          )}
        </Section>

        {/* Ranking Session Samples */}
        <CollapsibleSection 
          title="Ranking Session Samples" 
          isExpanded={expandedSections.rankingSessions}
          onToggle={() => toggleSection('rankingSessions')}
        >
          {rankingSessionsArray.slice(0, 3).map((session: any, idx: number) => (
            <View key={idx} className="mb-4 pb-4 border-b border-gray-700">
              <Text className="text-yellow-400 font-semibold mb-2">Session {idx + 1}</Text>
              <DataRow label="Status" value={session.status || 'N/A'} />
              <DataRow label="Algorithm" value={session.algorithm || 'N/A'} />
              <DataRow label="Layer" value={session.violatedLayerName || 'N/A'} />
              <DataRow label="Progress" value={`${session.completedComparisons || 0}/${session.totalComparisonsNeeded || 0}`} />
              <DataRow label="Contacts" value={session.contactIds?.length || 0} />
            </View>
          ))}
        </CollapsibleSection>

        {/* Comparisons */}
        <Section title="Comparisons">
          <DataRow label="Total Comparisons" value={comparisonsArray.length} />
          {comparisonsArray.length > 0 && (
            <>
              <DataRow 
                label="Skipped" 
                value={comparisonsArray.filter((c: any) => c.wasSkipped).length} 
              />
              <DataRow 
                label="Average Response Time" 
                value={`${(comparisonsArray.reduce((sum: number, c: any) => sum + (c.responseTimeMs || 0), 0) / comparisonsArray.length / 1000).toFixed(2)}s`} 
              />
            </>
          )}
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
              <DataRow 
                label="Check-in Reminders" 
                value={root.settings.checkInReminders ? '✅ Yes' : '❌ No'} 
              />
              <DataRow 
                label="Weekly Review Day" 
                value={root.settings.weeklyReviewDay || 'Not set'} 
              />
            </>
          ) : (
            <Text className="text-gray-400">No settings configured</Text>
          )}
        </Section>

        {/* Data Sharing */}
        {root.dataSharing && (
          <Section title="Data Sharing Consent">
            <DataRow 
              label="Consented" 
              value={root.dataSharing.hasConsented ? '✅ Yes' : '❌ No'} 
            />
            <DataRow label="Level" value={root.dataSharing.level || 'N/A'} />
            <DataRow label="Consented At" value={root.dataSharing.consentedAt || 'N/A'} />
          </Section>
        )}

        {/* Raw JSON Preview */}
        <CollapsibleSection 
          title="Raw Root Data (JSON)" 
          isExpanded={expandedSections.rawData}
          onToggle={() => toggleSection('rawData')}
        >
          <ScrollView horizontal>
            <View className="bg-gray-800 rounded-lg p-4">
              <Text className="text-green-400 text-xs font-mono">
                {JSON.stringify({
                  displayName: root.displayName,
                  email: root.email,
                  phone: root.phone,
                  hasCompletedOnboarding: root.hasCompletedOnboarding,
                  hasCompletedContactAnalysis: root.hasCompletedContactAnalysis,
                  contactsCount: contactsArray.length,
                  interactionsCount: interactionsArray.length,
                  goalsCount: goalsArray.length,
                  rankingSessionsCount: rankingSessionsArray.length,
                  comparisonsCount: comparisonsArray.length,
                  familyNames: root.familyNames,
                  settings: root.settings,
                  dataSharing: root.dataSharing,
                }, null, 2)}
              </Text>
            </View>
          </ScrollView>
        </CollapsibleSection>
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

function CollapsibleSection({ 
  title, 
  isExpanded, 
  onToggle, 
  children 
}: { 
  title: string; 
  isExpanded: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      <TouchableOpacity 
        onPress={onToggle}
        className="flex-row justify-between items-center mb-3"
      >
        <Text className="text-gray-400 text-sm font-semibold">{title}</Text>
        <Text className="text-gray-400 text-lg">{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <View className="bg-gray-800 rounded-xl p-4">
          {children}
        </View>
      )}
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
