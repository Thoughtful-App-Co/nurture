/**
 * Expo Config Plugin for react-native-get-sms-android
 * 
 * This ensures the native module is properly linked in EAS builds
 */

const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withSMS(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Ensure permissions array exists
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    // Add READ_SMS permission if not already present
    const hasSMSPermission = androidManifest['uses-permission'].some(
      (perm) => perm.$['android:name'] === 'android.permission.READ_SMS'
    );

    if (!hasSMSPermission) {
      androidManifest['uses-permission'].push({
        $: {
          'android:name': 'android.permission.READ_SMS',
        },
      });
    }

    return config;
  });
};
