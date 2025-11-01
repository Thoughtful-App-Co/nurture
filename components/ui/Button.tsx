/**
 * Shared Button Component
 * 
 * Standardized button styles used throughout the app.
 * Follows design system specifications in /docs/design-specs.md
 */

import React from 'react';
import { Pressable, Text, ActivityIndicator, View, PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  leftIcon,
  rightIcon,
  children, 
  className = '',
  disabled,
  accessibilityLabel,
  ...props 
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  
  // Base styles - minimum 44pt touch target
  const baseClass = "items-center justify-center flex-row";
  
  // Variant styles (consistent 2px borders)
  const variantClasses = {
    primary: "bg-primary border-2 border-primary",
    secondary: "border-2 border-zinc-700 bg-transparent",
    ghost: "bg-transparent",
  };
  
  // Disabled styles
  const disabledClasses = {
    primary: "bg-zinc-900 border-2 border-zinc-800",
    secondary: "border-2 border-zinc-800 bg-transparent",
    ghost: "bg-transparent",
  };
  
  // Size styles
  const sizeClasses = {
    sm: "py-2 px-4 min-h-[36px]",
    md: "py-3 px-4 min-h-[44px]",
    lg: "py-4 px-6 min-h-[52px]",
  };
  
  // Text color based on variant
  const textColorClasses = {
    primary: "text-black font-bold",
    secondary: "text-zinc-400",
    ghost: "text-zinc-400",
  };
  
  // Disabled text colors
  const disabledTextClasses = {
    primary: "text-zinc-600 font-bold",
    secondary: "text-zinc-600",
    ghost: "text-zinc-600",
  };
  
  // Text size based on size
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };
  
  // Loading indicator colors
  const loadingColors = {
    primary: '#000000',  // Black spinner on green button
    secondary: '#a1a1aa', // Zinc-400 spinner
    ghost: '#a1a1aa',
  };
  
  const buttonClass = `${baseClass} ${
    isDisabled ? disabledClasses[variant] : variantClasses[variant]
  } ${sizeClasses[size]} ${className}`;
  
  const textClass = `text-center ${
    isDisabled ? disabledTextClasses[variant] : textColorClasses[variant]
  } ${textSizeClasses[size]}`;
  
  // Auto-generate accessibility label from children if not provided
  const autoAccessibilityLabel = 
    typeof children === 'string' 
      ? children 
      : accessibilityLabel || 'Button';
  
  return (
    <Pressable 
      className={buttonClass}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={isLoading ? `Loading, ${autoAccessibilityLabel}` : autoAccessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        // Scale down slightly on press for tactile feedback
        { 
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
          opacity: isDisabled ? 0.5 : 1,
        },
      ]}
      {...props}
    >
      <View className="flex-row items-center gap-2">
        {/* Left Icon */}
        {leftIcon && !isLoading && (
          <View>{leftIcon}</View>
        )}
        
        {/* Loading Spinner */}
        {isLoading && (
          <ActivityIndicator size="small" color={loadingColors[variant]} />
        )}
        
        {/* Button Text */}
        {typeof children === 'string' ? (
          <Text className={textClass}>{children}</Text>
        ) : (
          children
        )}
        
        {/* Right Icon */}
        {rightIcon && !isLoading && (
          <View>{rightIcon}</View>
        )}
      </View>
    </Pressable>
  );
}
