/**
 * Shared Card Component
 * 
 * Standardized card container used throughout the app.
 * Follows design system specifications in /docs/design-specs.md
 */

import React from 'react';
import { View, Pressable, ViewProps, Platform } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'accent' | 'elevated';
  accentColor?: string;
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none';
}

export function Card({ 
  variant = 'default', 
  accentColor, 
  children, 
  className = '', 
  onPress,
  accessibilityLabel,
  accessibilityRole,
  ...props 
}: CardProps) {
  const baseClass = "p-4 bg-zinc-900 border border-zinc-800";
  
  // Shadow styles based on variant (React Native style)
  const getShadowStyle = () => {
    if (variant === 'elevated') {
      return Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      });
    }
    return {};
  };
  
  const content = (
    <View 
      className={`${baseClass} ${className}`}
      style={[
        // Accent border
        variant === 'accent' && accentColor ? {
          borderLeftWidth: 4,
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
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
