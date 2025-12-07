/**
 * Shared Card Component
 * 
 * Standardized card container used throughout the app.
 * Follows design system specifications in /docs/design-specs.md
 * 
 * @design Aurora + Biomorphic Design System
 * - Organic border radius (rounded-xl = 12px)
 * - Subtle gradient overlay for depth
 * - Colored glow shadows for accent variants
 */

import React from 'react';
import { View, Pressable, ViewProps, Platform } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'accent' | 'elevated' | 'glow';
  accentColor?: string;
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none';
  /** Use organic border radius (default: true for new design) */
  organic?: boolean;
}

export function Card({ 
  variant = 'default', 
  accentColor, 
  children, 
  className = '', 
  onPress,
  accessibilityLabel,
  accessibilityRole,
  organic = true,
  ...props 
}: CardProps) {
  // Organic design: rounded-xl (12px), subtle depth
  const baseClass = organic 
    ? "p-4 bg-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden"
    : "p-4 bg-zinc-900 border border-zinc-800";
  
  // Shadow styles based on variant (React Native style)
  const getShadowStyle = () => {
    // Default subtle shadow for organic cards
    const organicShadow = organic ? Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }) : {};

    if (variant === 'elevated') {
      return Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      });
    }
    
    // Glow variant - colored shadow
    if (variant === 'glow' && accentColor) {
      return Platform.select({
        ios: {
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
        },
        android: {
          elevation: 8,
        },
      });
    }
    
    // Accent variant - subtle colored glow
    if (variant === 'accent' && accentColor) {
      return Platform.select({
        ios: {
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      });
    }
    
    return organicShadow;
  };
  
  const content = (
    <View 
      className={`${baseClass} ${className}`}
      style={[
        // Accent border (now rounded for organic)
        variant === 'accent' && accentColor ? {
          borderLeftWidth: 3,
          borderLeftColor: accentColor,
        } : undefined,
        // Shadow elevation
        getShadowStyle(),
        props.style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  // If pressable, wrap in Pressable with feedback
  if (onPress) {
    return (
      <Pressable 
        onPress={onPress}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.95 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
