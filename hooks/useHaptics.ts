/**
 * Haptic Feedback Hook
 * 
 * Provides haptic feedback utilities for a more tactile, premium feel.
 * Automatically respects user preferences and platform capabilities.
 * 
 * @design Aurora + Biomorphic Design System
 * - Subtle feedback enhances organic, natural interactions
 * - Different intensities for different action types
 */

import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type HapticType = 
  | 'light'      // Subtle feedback - selections, toggles
  | 'medium'     // Standard feedback - button presses
  | 'heavy'      // Strong feedback - confirmations, important actions
  | 'success'    // Positive outcome - completed actions
  | 'warning'    // Attention needed
  | 'error'      // Something went wrong
  | 'selection'; // Scrolling through options

export function useHaptics() {
  /**
   * Trigger haptic feedback
   */
  const haptic = useCallback((type: HapticType = 'light') => {
    // Haptics only work on physical devices
    if (Platform.OS === 'web') return;
    
    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'selection':
          Haptics.selectionAsync();
          break;
      }
    } catch (e) {
      // Silently fail if haptics unavailable
      console.debug('Haptics unavailable:', e);
    }
  }, []);

  /**
   * Pre-bound haptic functions for convenience
   */
  const haptics = {
    /** Light tap - for selections, toggles */
    light: useCallback(() => haptic('light'), [haptic]),
    
    /** Medium tap - for button presses */
    medium: useCallback(() => haptic('medium'), [haptic]),
    
    /** Heavy tap - for confirmations */
    heavy: useCallback(() => haptic('heavy'), [haptic]),
    
    /** Success - for completed actions */
    success: useCallback(() => haptic('success'), [haptic]),
    
    /** Warning - for attention needed */
    warning: useCallback(() => haptic('warning'), [haptic]),
    
    /** Error - for failures */
    error: useCallback(() => haptic('error'), [haptic]),
    
    /** Selection - for scrolling/picking */
    selection: useCallback(() => haptic('selection'), [haptic]),
  };

  return { haptic, ...haptics };
}

/**
 * Standalone haptic functions for use outside of React components
 */
export const triggerHaptic = (type: HapticType = 'light') => {
  if (Platform.OS === 'web') return;
  
  try {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
    }
  } catch {
    // Silently fail if haptics unavailable
  }
};
