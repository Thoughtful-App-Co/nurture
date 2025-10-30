/**
 * Expo Config Plugin for @react-native-community/netinfo
 * 
 * This ensures the native module is properly linked in EAS builds
 * NetInfo is a dependency of jazz-tools for network state management
 */

const { withPlugins } = require('@expo/config-plugins');

module.exports = function withNetInfo(config) {
  // NetInfo doesn't require special permissions or manifest changes
  // It just needs to be autolinked, which happens automatically
  // This plugin serves as a placeholder to satisfy EAS requirements
  return withPlugins(config, []);
};
