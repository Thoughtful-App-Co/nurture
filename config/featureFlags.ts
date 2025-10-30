/**
 * Feature Flags Configuration
 * 
 * Controls experimental or debug features in the app
 * Set these based on environment or user preferences
 */

export const FeatureFlags = {
  /**
   * Show diagnostics button in data mining screen
   * Enable for debugging data mining issues
   */
  SHOW_DATA_MINING_DIAGNOSTICS: __DEV__, // Only in development by default

  /**
   * Enable verbose logging for data mining
   */
  VERBOSE_DATA_MINING_LOGS: __DEV__,

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
