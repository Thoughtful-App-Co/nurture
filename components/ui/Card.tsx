/**
 * Shared Card Component
 * 
 * Standardized card container used throughout the app
 */

import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'accent';
  accentColor?: string;
  children: React.ReactNode;
  onPress?: () => void;
}

export function Card({ variant = 'default', accentColor, children, className = '', onPress, ...props }: CardProps) {
  const baseClass = "p-4 bg-zinc-900 border border-zinc-800";
  
  const content = (
    <View 
      className={`${baseClass} ${className}`}
      style={[
        variant === 'accent' && accentColor ? {
          borderLeftWidth: 4,
          borderLeftColor: accentColor,
        } : undefined,
        props.style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    const Pressable = require('react-native').Pressable;
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}
