/**
 * Shared Button Component
 * 
 * Standardized button styles used throughout the app.
 * Follows design system specifications in /docs/design-specs.md
 * 
 * @design Aurora + Biomorphic Design System
 * - Organic border radius (rounded-2xl = 16px)
 * - Subtle glow effect on primary buttons
 * - Smooth spring-like press animations
 */

import React from 'react';
import { Pressable, Text, ActivityIndicator, View, PressableProps, Platform } from 'react-native';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  /** Use organic border radius (default: true for new design) */
  organic?: boolean;
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
  organic = true,
  ...props 
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  
  // Base styles - minimum 44pt touch target, organic border radius
  const baseClass = organic
    ? "items-center justify-center flex-row rounded-2xl"
    : "items-center justify-center flex-row";
  
  // Variant styles (consistent 2px borders)
  const variantClasses = {
    primary: "bg-primary border-2 border-primary",
    secondary: "border-2 border-zinc-700 bg-zinc-900/50",
    ghost: "bg-transparent",
  };
  
  // Disabled styles
  const disabledClasses = {
    primary: "bg-zinc-800 border-2 border-zinc-700",
    secondary: "border-2 border-zinc-800 bg-transparent",
    ghost: "bg-transparent",
  };
  
  // Size styles - slightly more padding for organic feel
  const sizeClasses = {
    sm: "py-2.5 px-5 min-h-[36px]",
    md: "py-3.5 px-5 min-h-[44px]",
    lg: "py-4 px-7 min-h-[52px]",
  };
  
  // Text color based on variant
  const textColorClasses = {
    primary: "text-black font-bold",
    secondary: "text-zinc-300",
    ghost: "text-zinc-400",
  };
  
  // Disabled text colors
  const disabledTextClasses = {
    primary: "text-zinc-500 font-bold",
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
    secondary: '#d4d4d8', // Zinc-300 spinner
    ghost: '#a1a1aa',
  };
  
  // Glow shadow for primary buttons
  const getGlowStyle = () => {
    if (!organic || isDisabled) return {};
    
    if (variant === 'primary') {
      return Platform.select({
        ios: {
          shadowColor: '#22c55e',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      });
    }
    
    if (variant === 'secondary') {
      return Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      });
    }
    
    return {};
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
        // Glow effect
        getGlowStyle(),
        // Organic press animation - slightly more dramatic
        { 
          transform: [{ scale: pressed && !isDisabled ? 0.96 : 1 }],
          opacity: isDisabled ? 0.5 : (pressed ? 0.9 : 1),
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
