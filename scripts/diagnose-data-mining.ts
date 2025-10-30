/**
 * Data Mining Diagnostic Script
 * 
 * Run this to diagnose why SMS and call log data isn't being fetched
 * 
 * Usage (in your React Native app):
 * import { runDiagnostics } from '@/scripts/diagnose-data-mining';
 * runDiagnostics();
 */

import { Platform } from 'react-native';

export async function runDiagnostics() {
  console.log('\n========================================');
  console.log('🔍 DATA MINING DIAGNOSTICS');
  console.log('========================================\n');

  // 1. Platform check
  console.log(`1. Platform: ${Platform.OS}`);
  if (Platform.OS !== 'android') {
    console.warn('❌ SMS/Call logs only available on Android');
    console.warn('   iOS has platform restrictions');
    return;
  }
  console.log('   ✅ Android detected\n');

  // 2. Check if running in Expo Go
  const isExpoGo = typeof global.expo !== 'undefined' && global.expo?.modules?.ExpoGo;
  console.log(`2. Running in Expo Go: ${isExpoGo ? 'YES' : 'NO'}`);
  if (isExpoGo) {
    console.error('❌ CRITICAL: You are running in Expo Go!');
    console.error('   Expo Go cannot access native modules');
    console.error('   SOLUTION: Build development client');
    console.error('   Run: npx expo run:android');
    return;
  }
  console.log('   ✅ Not in Expo Go\n');

  // 3. Check native modules
  console.log('3. Checking native modules...');
  
  // Check call-log module
  let callLogModule = null;
  let callLogStatus = 'NOT_LOADED';
  try {
    callLogModule = require('react-native-call-log');
    if (callLogModule && callLogModule.default) {
      callLogStatus = 'LOADED';
      console.log('   ✅ react-native-call-log: LOADED');
    } else {
      callLogStatus = 'LOADED_BUT_NO_DEFAULT';
      console.warn('   ⚠️ react-native-call-log: Loaded but no default export');
      console.warn('      Module structure:', Object.keys(callLogModule || {}));
    }
  } catch (error: any) {
    console.error('   ❌ react-native-call-log: FAILED TO LOAD');
    console.error('      Error:', error.message);
  }

  // Check SMS module
  let smsModule = null;
  let smsStatus = 'NOT_LOADED';
  try {
    smsModule = require('react-native-get-sms-android');
    if (smsModule && smsModule.default) {
      smsStatus = 'LOADED';
      console.log('   ✅ react-native-get-sms-android: LOADED');
    } else {
      smsStatus = 'LOADED_BUT_NO_DEFAULT';
      console.warn('   ⚠️ react-native-get-sms-android: Loaded but no default export');
      console.warn('      Module structure:', Object.keys(smsModule || {}));
    }
  } catch (error: any) {
    console.error('   ❌ react-native-get-sms-android: FAILED TO LOAD');
    console.error('      Error:', error.message);
  }

  if (callLogStatus !== 'LOADED' || smsStatus !== 'LOADED') {
    console.log('\n📱 NATIVE MODULES NOT LOADED');
    console.log('   This means the app was not built with native code');
    console.log('   ');
    console.log('   SOLUTION:');
    console.log('   1. Stop Metro bundler');
    console.log('   2. Run: npx expo prebuild --clean');
    console.log('   3. Run: npx expo run:android');
    console.log('   4. Grant permissions when prompted');
    console.log('   ');
    return;
  }

  console.log('\n4. Checking permissions...');
  
  // Check permissions
  const { PermissionsAndroid } = require('react-native');
  
  const callLogPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
  );
  const smsPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_SMS
  );
  const contactsPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_CONTACTS
  );

  console.log(`   Call Log: ${callLogPermission ? '✅ GRANTED' : '❌ DENIED'}`);
  console.log(`   SMS: ${smsPermission ? '✅ GRANTED' : '❌ DENIED'}`);
  console.log(`   Contacts: ${contactsPermission ? '✅ GRANTED' : '❌ DENIED'}`);

  if (!callLogPermission || !smsPermission) {
    console.log('\n⚠️ MISSING PERMISSIONS');
    console.log('   Go to: Settings > Apps > Nurture > Permissions');
    console.log('   Enable: Call logs, SMS, Contacts');
    return;
  }

  console.log('\n5. Testing data fetch...');
  
  // Test call logs
  if (callLogModule && callLogModule.default) {
    try {
      console.log('   📞 Fetching call logs...');
      const CallLogs = callLogModule.default;
      const calls = await CallLogs.load(10); // Just fetch 10 to test
      console.log(`   ✅ Call logs fetched: ${calls ? calls.length : 0} entries`);
      
      if (calls && calls.length > 0) {
        console.log('      Sample call:', {
          number: calls[0].phoneNumber || calls[0].number,
          duration: calls[0].duration,
          timestamp: calls[0].timestamp || calls[0].dateTime,
        });
      } else {
        console.warn('      ⚠️ Zero call logs returned');
        console.warn('      This could mean:');
        console.warn('      - Device has no call history');
        console.warn('      - Permission was denied at runtime');
        console.warn('      - Module API changed');
      }
    } catch (error: any) {
      console.error('   ❌ Call log fetch failed:', error.message);
    }
  }

  // Test SMS
  if (smsModule && smsModule.default) {
    try {
      console.log('   💬 Fetching SMS...');
      const SmsAndroid = smsModule.default;
      
      const filter = {
        box: '',
        maxCount: 10,
      };

      const smsResult = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('SMS fetch timeout after 10 seconds'));
        }, 10000);

        SmsAndroid.list(
          JSON.stringify(filter),
          (fail: string) => {
            clearTimeout(timeoutId);
            resolve({ error: fail, messages: [] });
          },
          (_count: number, smsList: string) => {
            clearTimeout(timeoutId);
            try {
              const messages = JSON.parse(smsList);
              resolve({ error: null, messages });
            } catch (e) {
              resolve({ error: 'Parse error', messages: [] });
            }
          }
        );
      });

      const { error, messages } = smsResult as any;
      
      if (error) {
        console.error(`   ❌ SMS fetch failed: ${error}`);
      } else {
        console.log(`   ✅ SMS fetched: ${messages.length} entries`);
        
        if (messages.length > 0) {
          console.log('      Sample SMS:', {
            address: messages[0].address,
            date: messages[0].date,
            type: messages[0].type,
          });
        } else {
          console.warn('      ⚠️ Zero SMS returned');
          console.warn('      This could mean:');
          console.warn('      - Device has no SMS history');
          console.warn('      - Permission was denied at runtime');
          console.warn('      - Module API changed');
        }
      }
    } catch (error: any) {
      console.error('   ❌ SMS fetch failed:', error.message);
    }
  }

  console.log('\n========================================');
  console.log('✅ DIAGNOSTICS COMPLETE');
  console.log('========================================\n');
}

/**
 * Quick check - returns true if data mining should work
 */
export function canMineData(): boolean {
  if (Platform.OS !== 'android') return false;
  
  try {
    const callLogModule = require('react-native-call-log');
    const smsModule = require('react-native-get-sms-android');
    
    return !!(callLogModule?.default && smsModule?.default);
  } catch {
    return false;
  }
}

/**
 * Get status message for user
 */
export function getDataMiningStatus(): {
  canMine: boolean;
  reason: string;
  solution: string;
} {
  if (Platform.OS !== 'android') {
    return {
      canMine: false,
      reason: 'iOS does not allow apps to access call logs or SMS',
      solution: 'Use manual interaction logging for iOS',
    };
  }

  try {
    const callLogModule = require('react-native-call-log');
    const smsModule = require('react-native-get-sms-android');
    
    if (!callLogModule || !callLogModule.default) {
      return {
        canMine: false,
        reason: 'Native modules not loaded (running in Expo Go or not built natively)',
        solution: 'Run: npx expo run:android',
      };
    }

    if (!smsModule || !smsModule.default) {
      return {
        canMine: false,
        reason: 'SMS module not loaded (running in Expo Go or not built natively)',
        solution: 'Run: npx expo run:android',
      };
    }

    return {
      canMine: true,
      reason: 'All modules loaded successfully',
      solution: 'Grant permissions when prompted',
    };
  } catch (error: any) {
    return {
      canMine: false,
      reason: `Module load error: ${error.message}`,
      solution: 'Run: npx expo prebuild --clean && npx expo run:android',
    };
  }
}
