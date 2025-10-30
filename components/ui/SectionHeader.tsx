/**
 * Shared Section Header Component
 * 
 * Standardized section headers used throughout the app
 */

import React from 'react';
import { Text, TextProps } from 'react-native';

interface SectionHeaderProps extends TextProps {
  children: React.ReactNode;
}

export function SectionHeader({ children, className = '', ...props }: SectionHeaderProps) {
  return (
    <Text 
      className={`text-xs text-zinc-500 font-semibold mb-3 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}
