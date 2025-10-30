/**
 * Expo Config Plugin for react-native-call-log
 * 
 * This ensures the native module is properly linked in EAS builds
 */

const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withCallLog(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Ensure permissions array exists
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    // Add READ_CALL_LOG permission if not already present
    const hasCallLogPermission = androidManifest['uses-permission'].some(
      (perm) => perm.$['android:name'] === 'android.permission.READ_CALL_LOG'
    );

    if (!hasCallLogPermission) {
      androidManifest['uses-permission'].push({
        $: {
          'android:name': 'android.permission.READ_CALL_LOG',
        },
      });
    }

    return config;
  });
};
