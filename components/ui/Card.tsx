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
}

export function Card({ variant = 'default', accentColor, children, className = '', ...props }: CardProps) {
  const baseClass = "p-4 bg-zinc-900 border border-zinc-800";
  
  return (
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
}
