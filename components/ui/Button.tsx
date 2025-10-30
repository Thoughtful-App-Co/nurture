/**
 * Shared Button Component
 * 
 * Standardized button styles used throughout the app
 */

import React from 'react';
import { Pressable, Text, PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  // Base styles
  const baseClass = "items-center justify-center";
  
  // Variant styles
  const variantClasses = {
    primary: "bg-primary border-2 border-primary",
    secondary: "border border-zinc-700 bg-transparent",
    ghost: "bg-transparent",
  };
  
  // Size styles
  const sizeClasses = {
    sm: "py-2 px-4",
    md: "py-3 px-4",
    lg: "py-5 px-6",
  };
  
  // Text color based on variant
  const textColorClasses = {
    primary: "text-black font-bold",
    secondary: "text-zinc-400",
    ghost: "text-zinc-400",
  };
  
  // Text size based on size
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };
  
  const buttonClass = `${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  const textClass = `text-center ${textColorClasses[variant]} ${textSizeClasses[size]}`;
  
  return (
    <Pressable 
      className={buttonClass}
      disabled={disabled}
      style={({ pressed }) => [
        { opacity: pressed ? 0.7 : 1 },
        disabled ? { opacity: 0.5 } : undefined,
      ]}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={textClass}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
