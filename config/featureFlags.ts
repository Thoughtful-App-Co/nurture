/**
 * Feature Flags Configuration
 * 
 * Controls experimental or debug features in the app
 * Set these based on environment or user preferences
 */

export const FeatureFlags = {
  // ============================================================================
  // DEV-ONLY FLAGS (automatically disabled in production builds)
  // ============================================================================
  
  /**
   * Show floating dev tools menu button
   * Provides quick access to diagnostics, debug tools, and feature toggles
   */
  SHOW_DEV_MENU: __DEV__,
  
  /**
   * Show diagnostics button in data mining screen
   * Enable for debugging data mining issues
   */
  SHOW_DATA_MINING_DIAGNOSTICS: __DEV__,

  /**
   * Enable verbose logging for data mining
   */
  VERBOSE_DATA_MINING_LOGS: __DEV__,
  
  /**
   * Show native module status in UI
   * Displays whether call-log and SMS modules are available
   */
  SHOW_NATIVE_MODULE_STATUS: __DEV__,
  
  /**
   * Enable debug logging throughout the app
   * Shows detailed logs for state changes, API calls, etc.
   */
  ENABLE_DEBUG_LOGGING: __DEV__,
  
  /**
   * Show Jazz data inspector
   * View and debug Jazz CoValue data structures
   */
  SHOW_JAZZ_INSPECTOR: __DEV__,
  
  /**
   * Show app state debug panel
   * Displays current flow, user state, etc.
   */
  SHOW_STATE_DEBUG_PANEL: __DEV__,

  // ============================================================================
  // PRODUCTION-SAFE FLAGS (can be toggled in production)
  // ============================================================================

  /**
   * Show detailed interaction metrics in contact cards
   */
  SHOW_DETAILED_METRICS: false,

  /**
   * Enable manual interaction logging
   */
  ENABLE_MANUAL_LOGGING: true,

  /**
   * Enable family detection
   */
  ENABLE_FAMILY_DETECTION: true,
} as const;

export type FeatureFlagKey = keyof typeof FeatureFlags;

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return FeatureFlags[flag];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FeatureFlags)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key);
}
