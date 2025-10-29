/**
 * Data Mining Service
 * 
 * Aggregates contact data, call logs, and SMS history to build
 * behavioral interaction profiles for Dunbar layer calculation
 * 
 * STORY-001: Contact Data Ingestion
 * STORY-002: Call & SMS Log Mining
 */

import * as Contacts from 'expo-contacts';
import { PermissionsAndroid, Platform } from 'react-native';

// Types matching PRD data model
export interface RawContact {
  id: string;
  name: string;
  phoneNumbers?: string[];
  emails?: string[];
}

export interface CallLogEntry {
  phoneNumber: string;
  duration: number; // seconds
  timestamp: number; // unix timestamp
  type: 'INCOMING' | 'OUTGOING' | 'MISSED';
}

export interface SMSEntry {
  phoneNumber: string;
  timestamp: number;
  type: 'INCOMING' | 'OUTGOING';
  body: string;
}

export interface InteractionMetrics {
  // Call metrics
  callFrequency: number; // calls per month
  totalCallDuration: number; // total seconds
  lastCall: number | null; // timestamp
  callInitiationRatio: number; // 0-1, % calls initiated by user
  
  // SMS metrics
  smsFrequency: number; // messages per month
  smsReciprocity: number; // 0-1, balance of sent/received
  smsInitiationRatio: number; // 0-1, % conversations initiated by user
  averageResponseTime: number; // seconds
  lastSMS: number | null; // timestamp
  
  // Combined
  lastInteraction: number | null;
  interactionScore: number; // computed score for Dunbar calculation
}

export interface ContactWithMetrics extends RawContact {
  metrics: InteractionMetrics;
  potentialFamily?: {
    matchedLastName: string;
    confidence: 'high' | 'medium' | 'low';
    tier?: 'NUCLEAR' | 'SECONDARY' | 'TERTIARY';
    role?: string;
  };
}

export interface FamilyNames {
  birthLastName?: string;
  currentLastName?: string;
  spouseLastName?: string;
  otherFamilyNames?: string[];
}

/**
 * Request all necessary permissions for data mining
 * 
 * IMPORTANT iOS LIMITATIONS:
 * - iOS does NOT allow apps to access call logs or SMS history for privacy reasons
 * - Only contacts are available on iOS via Contacts framework
 * - Call and SMS data can only be accessed through CallKit integration (outgoing calls only)
 * - This means iOS users will have less accurate relationship analysis
 * 
 * ANDROID CAPABILITIES:
 * - Full access to contacts, call logs, and SMS history
 * - Provides the most accurate behavioral analysis
 */
export async function requestDataMiningPermissions(): Promise<{
  contacts: boolean;
  callLog: boolean;
  sms: boolean;
}> {
  const results = {
    contacts: false,
    callLog: false,
    sms: false,
  };

  try {
    // Contacts permission (cross-platform - works on both iOS and Android)
    const contactsPermission = await Contacts.requestPermissionsAsync();
    results.contacts = contactsPermission.status === 'granted';

    // Android-specific permissions for call logs and SMS
    if (Platform.OS === 'android') {
      // Call log permission
      const callLogGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        {
          title: 'Call History Access',
          message: 'Nurture analyzes your call patterns to identify your closest relationships. Phone calls are weighted 5x more than texts because they represent deeper connections. Your data stays encrypted on your device.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow',
        }
      );
      results.callLog = callLogGranted === PermissionsAndroid.RESULTS.GRANTED;

      // SMS permission
      const smsGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'Message History Access',
          message: 'Nurture analyzes message frequency and reciprocity to understand your communication patterns. Your messages are processed locally and never leave your device.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow',
        }
      );
      results.sms = smsGranted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // iOS - Call logs and SMS are not accessible
      // Log this limitation for user awareness
      console.log('iOS Platform: Call logs and SMS are not accessible due to platform restrictions');
      console.log('Relationship analysis will be based on contact data only');
    }
  } catch (error) {
    console.error('Permission request failed:', error);
  }

  return results;
}

/**
 * Fetch all contacts from device
 * STORY-001
 */
export async function fetchDeviceContacts(): Promise<RawContact[]> {
  try {
    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
    });

    return data.map(contact => ({
      id: contact.id,
      name: contact.name || 'Unknown',
      phoneNumbers: contact.phoneNumbers?.map(p => p.number).filter((n): n is string => !!n) || [],
      emails: contact.emails?.map(e => e.email).filter((e): e is string => !!e) || [],
    }));
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return [];
  }
}

/**
 * Fetch call logs (Android only - requires native module)
 * STORY-002
 */
export async function fetchCallLogs(): Promise<CallLogEntry[]> {
  if (Platform.OS !== 'android') {
    console.warn('Call log access only available on Android');
    return [];
  }

  try {
    // Dynamically import to avoid errors when not available
    const CallLogsModule = require('react-native-call-log');
    
    if (!CallLogsModule || !CallLogsModule.default) {
      console.warn('react-native-call-log module not available - skipping call log fetch');
      console.warn('To enable call logs, install: npm install react-native-call-log');
      return [];
    }
    
    const CallLogs = CallLogsModule.default;
    
    // Fetch last 3 months of call logs
    const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    
    const calls = await CallLogs.load(-1, { // -1 = all calls
      minTimestamp: threeMonthsAgo,
    });
    
    console.log(`Fetched ${calls.length} call log entries from last 3 months`);
    
    // Map to our CallLogEntry format
    return calls.map((call: any) => ({
      phoneNumber: call.phoneNumber || call.number || '',
      duration: call.duration || 0,
      timestamp: call.timestamp || call.dateTime || Date.now(),
      type: mapCallType(call.type),
    }));
  } catch (error) {
    console.warn('Failed to fetch call logs (native module not available):', error);
    console.warn('Call log analysis will be skipped. To enable, run: npx expo run:android');
    return [];
  }
}

/**
 * Map native call types to our format
 */
function mapCallType(nativeType: string | number): 'INCOMING' | 'OUTGOING' | 'MISSED' {
  // react-native-call-log uses: INCOMING = '1', OUTGOING = '2', MISSED = '3'
  const typeStr = String(nativeType);
  
  if (typeStr === '1' || typeStr.toLowerCase().includes('incoming')) return 'INCOMING';
  if (typeStr === '2' || typeStr.toLowerCase().includes('outgoing')) return 'OUTGOING';
  if (typeStr === '3' || typeStr.toLowerCase().includes('missed')) return 'MISSED';
  
  return 'INCOMING'; // Default fallback
}

/**
 * Fetch SMS history (Android only - requires native module)
 * STORY-002
 */
export async function fetchSMSHistory(): Promise<SMSEntry[]> {
  if (Platform.OS !== 'android') {
    console.warn('SMS access only available on Android');
    return [];
  }

  try {
    // Dynamically import to avoid errors when not available
    const SmsAndroidModule = require('react-native-get-sms-android');
    
    if (!SmsAndroidModule || !SmsAndroidModule.default) {
      console.warn('react-native-get-sms-android module not available - skipping SMS fetch');
      console.warn('To enable SMS history, install: npm install react-native-get-sms-android');
      return [];
    }
    
    const SmsAndroid = SmsAndroidModule.default;
    
    // Fetch last 3 months of SMS
    const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    
    const filter = {
      box: '', // '' means all boxes (inbox + sent)
      minDate: threeMonthsAgo,
      maxCount: 10000, // Limit to prevent memory issues
    };
    
    return new Promise((resolve, reject) => {
      SmsAndroid.list(
        JSON.stringify(filter),
        (fail: string) => {
          console.warn('Failed to fetch SMS:', fail);
          resolve([]); // Resolve with empty array instead of rejecting
        },
        (count: number, smsList: string) => {
          try {
            const messages = JSON.parse(smsList);
            console.log(`Fetched ${messages.length} SMS entries from last 3 months`);
            
            // Map to our SMSEntry format
            const smsEntries: SMSEntry[] = messages.map((sms: any) => ({
              phoneNumber: sms.address || '',
              timestamp: parseInt(sms.date) || Date.now(),
              type: sms.type === 1 ? 'INCOMING' : 'OUTGOING', // 1 = received, 2 = sent
              body: sms.body || '',
            }));
            
            resolve(smsEntries);
          } catch (error) {
            console.warn('Error parsing SMS data:', error);
            resolve([]);
          }
        }
      );
    });
  } catch (error) {
    console.warn('Failed to fetch SMS history (native module not available):', error);
    console.warn('SMS analysis will be skipped. To enable, run: npx expo run:android');
    return [];
  }
}

/**
 * Calculate interaction metrics for a contact
 * STORY-002
 */
export function calculateInteractionMetrics(
  phoneNumbers: string[],
  callLogs: CallLogEntry[],
  smsHistory: SMSEntry[]
): InteractionMetrics {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  // Filter logs for this contact's phone numbers
  const contactCalls = callLogs.filter(call =>
    phoneNumbers.some(num => normalizePhoneNumber(num) === normalizePhoneNumber(call.phoneNumber))
  );
  
  const contactSMS = smsHistory.filter(sms =>
    phoneNumbers.some(num => normalizePhoneNumber(num) === normalizePhoneNumber(sms.phoneNumber))
  );

  // Call metrics
  const recentCalls = contactCalls.filter(c => c.timestamp > thirtyDaysAgo);
  const outgoingCalls = recentCalls.filter(c => c.type === 'OUTGOING');
  const callFrequency = recentCalls.length;
  const totalCallDuration = recentCalls.reduce((sum, c) => sum + c.duration, 0);
  const callInitiationRatio = callFrequency > 0 ? outgoingCalls.length / callFrequency : 0;
  const lastCall = contactCalls.length > 0 
    ? Math.max(...contactCalls.map(c => c.timestamp))
    : null;

  // SMS metrics
  const recentSMS = contactSMS.filter(s => s.timestamp > thirtyDaysAgo);
  const outgoingSMS = recentSMS.filter(s => s.type === 'OUTGOING');
  const incomingSMS = recentSMS.filter(s => s.type === 'INCOMING');
  const smsFrequency = recentSMS.length;
  const smsReciprocity = smsFrequency > 0
    ? Math.min(outgoingSMS.length, incomingSMS.length) / Math.max(outgoingSMS.length, incomingSMS.length, 1)
    : 0;
  const smsInitiationRatio = calculateSMSInitiationRatio(contactSMS);
  const averageResponseTime = calculateAverageResponseTime(contactSMS);
  const lastSMS = contactSMS.length > 0
    ? Math.max(...contactSMS.map(s => s.timestamp))
    : null;

  // Combined metrics
  const lastInteraction = Math.max(lastCall || 0, lastSMS || 0) || null;
  
  // Interaction score (will be used for Dunbar layer calculation)
  const interactionScore = calculateInteractionScore({
    callFrequency,
    totalCallDuration,
    smsFrequency,
    smsReciprocity,
    lastInteraction,
  });

  return {
    callFrequency,
    totalCallDuration,
    lastCall,
    callInitiationRatio,
    smsFrequency,
    smsReciprocity,
    smsInitiationRatio,
    averageResponseTime,
    lastSMS,
    lastInteraction,
    interactionScore,
  };
}

/**
 * Calculate SMS initiation ratio
 * Looks at conversation threads to determine who starts conversations
 */
function calculateSMSInitiationRatio(smsHistory: SMSEntry[]): number {
  if (smsHistory.length === 0) return 0;

  // Sort by timestamp
  const sorted = [...smsHistory].sort((a, b) => a.timestamp - b.timestamp);
  
  // Identify conversation starts (gaps > 6 hours between messages)
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  let conversationsStartedByUser = 0;
  let totalConversations = 1;

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].timestamp - sorted[i - 1].timestamp;
    if (gap > SIX_HOURS) {
      totalConversations++;
      if (sorted[i].type === 'OUTGOING') {
        conversationsStartedByUser++;
      }
    }
  }

  // Check first message
  if (sorted[0].type === 'OUTGOING') {
    conversationsStartedByUser++;
  }

  return conversationsStartedByUser / totalConversations;
}

/**
 * Calculate average response time for SMS
 */
function calculateAverageResponseTime(smsHistory: SMSEntry[]): number {
  if (smsHistory.length < 2) return 0;

  const sorted = [...smsHistory].sort((a, b) => a.timestamp - b.timestamp);
  const responseTimes: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    // Look for incoming -> outgoing pattern (user responding)
    if (sorted[i - 1].type === 'INCOMING' && sorted[i].type === 'OUTGOING') {
      const responseTime = sorted[i].timestamp - sorted[i - 1].timestamp;
      // Only count responses within 24 hours
      if (responseTime < 24 * 60 * 60 * 1000) {
        responseTimes.push(responseTime);
      }
    }
  }

  if (responseTimes.length === 0) return 0;

  const avgMilliseconds = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  return Math.floor(avgMilliseconds / 1000); // return seconds
}

/**
 * Calculate composite interaction score
 * Higher score = closer relationship
 * 
 * PRIORITY WEIGHTING (as per requirements):
 * 1. Voice calls (highest) - real conversations
 * 2. Meetings/calendar events - scheduled time together
 * 3. SMS - lower priority communication
 */
function calculateInteractionScore(metrics: {
  callFrequency: number;
  totalCallDuration: number;
  smsFrequency: number;
  smsReciprocity: number;
  lastInteraction: number | null;
}): number {
  const now = Date.now();
  
  // Recency weight (exponential decay)
  const daysSinceInteraction = metrics.lastInteraction
    ? (now - metrics.lastInteraction) / (24 * 60 * 60 * 1000)
    : 365;
  const recencyWeight = Math.exp(-daysSinceInteraction / 30); // decay over 30 days

  // WEIGHTED frequency score - calls are 5x more valuable than SMS
  const frequencyScore = (metrics.callFrequency * 5) + metrics.smsFrequency;

  // Duration score - longer calls = MUCH deeper connection (exponential weight)
  const durationScore = Math.log(metrics.totalCallDuration + 1) / 5;

  // Reciprocity bonus (only applies to SMS)
  const reciprocityBonus = metrics.smsReciprocity * 0.3;

  // Call quality bonus - having ANY calls is a huge signal
  const callPresenceBonus = metrics.callFrequency > 0 ? 2 : 0;

  // Combined score
  const score = (frequencyScore + durationScore + reciprocityBonus + callPresenceBonus) * recencyWeight;

  return Math.round(score * 100) / 100;
}

/**
 * Normalize phone number for comparison
 * Strips country codes, formatting, etc.
 */
function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Take last 10 digits (US format)
  // This could be enhanced for international numbers
  return digits.slice(-10);
}

/**
 * Detect family relationship pet names
 * Identifies contacts saved as "Mom", "Dad", "Wife", etc.
 */
function detectFamilyPetName(name: string): { isFamily: boolean; tier: 'NUCLEAR' | 'SECONDARY' | 'TERTIARY'; role?: string } | null {
  const normalizedName = name.toLowerCase().trim();
  
  // Nuclear family (immediate)
  const nuclearPatterns = [
    { pattern: /^mom($|[^a-z])/i, role: 'mother' },
    { pattern: /^mother($|[^a-z])/i, role: 'mother' },
    { pattern: /^mama($|[^a-z])/i, role: 'mother' },
    { pattern: /^mommy($|[^a-z])/i, role: 'mother' },
    { pattern: /^dad($|[^a-z])/i, role: 'father' },
    { pattern: /^father($|[^a-z])/i, role: 'father' },
    { pattern: /^papa($|[^a-z])/i, role: 'father' },
    { pattern: /^daddy($|[^a-z])/i, role: 'father' },
    { pattern: /^wife($|[^a-z])/i, role: 'spouse' },
    { pattern: /^husband($|[^a-z])/i, role: 'spouse' },
    { pattern: /^spouse($|[^a-z])/i, role: 'spouse' },
    { pattern: /^partner($|[^a-z])/i, role: 'spouse' },
    { pattern: /^son($|[^a-z])/i, role: 'child' },
    { pattern: /^daughter($|[^a-z])/i, role: 'child' },
    { pattern: /^kid($|[^a-z])/i, role: 'child' },
  ];
  
  // Secondary family (siblings, in-laws)
  const secondaryPatterns = [
    { pattern: /^brother($|[^a-z])/i, role: 'sibling' },
    { pattern: /^sister($|[^a-z])/i, role: 'sibling' },
    { pattern: /^bro($|[^a-z])/i, role: 'sibling' },
    { pattern: /^sis($|[^a-z])/i, role: 'sibling' },
    { pattern: /^sibling($|[^a-z])/i, role: 'sibling' },
    { pattern: /^mother[- ]in[- ]law/i, role: 'in-law' },
    { pattern: /^father[- ]in[- ]law/i, role: 'in-law' },
    { pattern: /^brother[- ]in[- ]law/i, role: 'in-law' },
    { pattern: /^sister[- ]in[- ]law/i, role: 'in-law' },
    { pattern: /^stepmother($|[^a-z])/i, role: 'step-parent' },
    { pattern: /^stepfather($|[^a-z])/i, role: 'step-parent' },
    { pattern: /^stepmom($|[^a-z])/i, role: 'step-parent' },
    { pattern: /^stepdad($|[^a-z])/i, role: 'step-parent' },
  ];
  
  // Tertiary family (extended)
  const tertiaryPatterns = [
    { pattern: /^aunt($|[^a-z])/i, role: 'extended' },
    { pattern: /^uncle($|[^a-z])/i, role: 'extended' },
    { pattern: /^cousin($|[^a-z])/i, role: 'extended' },
    { pattern: /^niece($|[^a-z])/i, role: 'extended' },
    { pattern: /^nephew($|[^a-z])/i, role: 'extended' },
    { pattern: /^grandma($|[^a-z])/i, role: 'grandparent' },
    { pattern: /^grandpa($|[^a-z])/i, role: 'grandparent' },
    { pattern: /^grandmother($|[^a-z])/i, role: 'grandparent' },
    { pattern: /^grandfather($|[^a-z])/i, role: 'grandparent' },
    { pattern: /^granny($|[^a-z])/i, role: 'grandparent' },
    { pattern: /^nana($|[^a-z])/i, role: 'grandparent' },
    { pattern: /^grammy($|[^a-z])/i, role: 'grandparent' },
  ];
  
  // Check nuclear family first
  for (const { pattern, role } of nuclearPatterns) {
    if (pattern.test(name)) {
      return { isFamily: true, tier: 'NUCLEAR', role };
    }
  }
  
  // Check secondary family
  for (const { pattern, role } of secondaryPatterns) {
    if (pattern.test(name)) {
      return { isFamily: true, tier: 'SECONDARY', role };
    }
  }
  
  // Check tertiary family
  for (const { pattern, role } of tertiaryPatterns) {
    if (pattern.test(name)) {
      return { isFamily: true, tier: 'TERTIARY', role };
    }
  }
  
  return null;
}

/**
 * Smart family name matching
 * STORY-008: Identifies potential family members based on last names AND pet names
 */
export function identifyPotentialFamily(
  contacts: ContactWithMetrics[],
  familyNames: FamilyNames
): ContactWithMetrics[] {
  const allFamilyNames = [
    familyNames.birthLastName,
    familyNames.currentLastName,
    familyNames.spouseLastName,
    ...(familyNames.otherFamilyNames || []),
  ].filter((name): name is string => !!name);

  console.log('Identifying family with names:', allFamilyNames);

  return contacts.map(contact => {
    // First check for family pet names (Mom, Dad, etc.)
    const petNameMatch = detectFamilyPetName(contact.name);
    if (petNameMatch) {
      return {
        ...contact,
        potentialFamily: {
          matchedLastName: `Pet name: ${petNameMatch.role}`,
          confidence: 'high' as const,
          tier: petNameMatch.tier,
          role: petNameMatch.role,
        },
      };
    }
    
    // If no family names provided, skip last name matching
    if (allFamilyNames.length === 0) {
      return contact;
    }

    // Extract last name from contact name
    const nameParts = contact.name.trim().split(' ');
    if (nameParts.length < 2) {
      return contact; // No last name to match
    }

    const contactLastName = nameParts[nameParts.length - 1].toLowerCase();

    // Check for family name matches
    for (const familyName of allFamilyNames) {
      const normalizedFamilyName = familyName.toLowerCase();
      
      if (contactLastName === normalizedFamilyName) {
        // Exact match - high confidence
        console.log(`✅ Family match: ${contact.name} (${contactLastName} === ${normalizedFamilyName})`);
        return {
          ...contact,
          potentialFamily: {
            matchedLastName: familyName,
            confidence: 'high' as const,
            tier: 'SECONDARY' as const, // Assume extended family unless pet name detected
          },
        };
      }
      
      // Partial match (for hyphenated names, etc.)
      if (contactLastName.includes(normalizedFamilyName) || normalizedFamilyName.includes(contactLastName)) {
        return {
          ...contact,
          potentialFamily: {
            matchedLastName: familyName,
            confidence: 'medium' as const,
            tier: 'TERTIARY' as const,
          },
        };
      }
    }

    return contact;
  });
}

/**
 * Merge duplicate contacts (same phone number, different names like "Mom" vs "Mother")
 */
function mergeDuplicateContacts(contacts: ContactWithMetrics[]): ContactWithMetrics[] {
  const phoneMap = new Map<string, ContactWithMetrics>();
  
  contacts.forEach(contact => {
    const primaryPhone = contact.phoneNumbers?.[0];
    if (!primaryPhone) {
      // No phone number - keep as separate contact
      phoneMap.set(`no-phone-${contact.id}`, contact);
      return;
    }
    
    const normalizedPhone = normalizePhoneNumber(primaryPhone);
    const existing = phoneMap.get(normalizedPhone);
    
    if (existing) {
      // Merge: keep the one with higher interaction score
      console.log(`🔀 Merging duplicates: "${existing.name}" + "${contact.name}" (${normalizedPhone})`);
      
      if ((contact.metrics.interactionScore || 0) > (existing.metrics.interactionScore || 0)) {
        // New contact has higher score - use it but preserve family info from both
        phoneMap.set(normalizedPhone, {
          ...contact,
          potentialFamily: contact.potentialFamily || existing.potentialFamily,
        });
      } else {
        // Existing has higher score - keep it but update family info if new one has it
        if (contact.potentialFamily && !existing.potentialFamily) {
          phoneMap.set(normalizedPhone, {
            ...existing,
            potentialFamily: contact.potentialFamily,
          });
        }
      }
    } else {
      phoneMap.set(normalizedPhone, contact);
    }
  });
  
  return Array.from(phoneMap.values());
}

/**
 * Main aggregation function
 * Combines contacts with their interaction metrics
 */
export async function aggregateContactsWithMetrics(familyNames?: FamilyNames): Promise<ContactWithMetrics[]> {
  console.log('Starting contact aggregation...');
  
  const [contacts, callLogs, smsHistory] = await Promise.all([
    fetchDeviceContacts(),
    fetchCallLogs(),
    fetchSMSHistory(),
  ]);

  console.log(`Fetched ${contacts.length} contacts, ${callLogs.length} calls, ${smsHistory.length} SMS`);
  
  // Warn if no interaction data available
  if (callLogs.length === 0 && smsHistory.length === 0) {
    console.warn('⚠️  No call or SMS data available');
    console.warn('Analysis will be based on contact data only');
    console.warn('For full analysis, build a development client: npx expo run:android');
  }

  const contactsWithMetrics = contacts.map(contact => {
    const metrics = calculateInteractionMetrics(
      contact.phoneNumbers || [],
      callLogs,
      smsHistory
    );

    return {
      ...contact,
      metrics,
    };
  });

  // Apply family name matching if provided (before merging, so both variants get tagged)
  let processedContacts = contactsWithMetrics;
  if (familyNames) {
    processedContacts = identifyPotentialFamily(contactsWithMetrics, familyNames);
  }

  // Merge duplicates (same phone number, different names)
  processedContacts = mergeDuplicateContacts(processedContacts);
  
  console.log(`After merging: ${processedContacts.length} unique contacts`);

  // Sort by interaction score (highest first)
  processedContacts.sort((a, b) => b.metrics.interactionScore - a.metrics.interactionScore);

  return processedContacts;
}
