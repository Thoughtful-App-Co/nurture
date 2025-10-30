/**
 * Loading Animation Component
 * Beautiful animated loader for Nurture's dark theme
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

interface Props {
  message?: string;
  submessage?: string;
}

export function LoadingAnimation({ message = "Loading...", submessage }: Props) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [spinValue, pulseValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      className="items-center justify-center"
      style={{ opacity: fadeValue }}
    >
      {/* Animated plant/seedling */}
      <View className="relative mb-8">
        {/* Outer glow ring */}
        <Animated.View
          className="absolute inset-0 w-32 h-32"
          style={{
            transform: [{ rotate: spin }, { scale: pulseValue }],
          }}
        >
          <View className="w-full h-full rounded-full border-2 border-primary/30" />
        </Animated.View>

        {/* Inner ring */}
        <Animated.View
          className="absolute inset-4 w-24 h-24"
          style={{
            transform: [{ rotate: spin }, { scale: pulseValue }],
          }}
        >
          <View className="w-full h-full rounded-full border-2 border-primary/50" />
        </Animated.View>

        {/* Center icon */}
        <Animated.View
          className="w-32 h-32 items-center justify-center"
          style={{
            transform: [{ scale: pulseValue }],
          }}
        >
          <Text className="text-6xl">🌱</Text>
        </Animated.View>
      </View>

      {/* Loading message */}
      <Text className="text-white text-xl font-semibold mb-2 text-center">
        {message}
      </Text>
      
      {submessage && (
        <Text className="text-zinc-400 text-sm text-center px-8 leading-relaxed">
          {submessage}
        </Text>
      )}

      {/* Animated dots */}
      <View className="flex-row mt-4 gap-2">
        {[0, 1, 2].map((index) => (
          <AnimatedDot key={index} delay={index * 200} />
        ))}
      </View>
    </Animated.View>
  );
}

function AnimatedDot({ delay }: { delay: number }) {
  const fadeValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeValue, delay]);

  return (
    <Animated.View
      className="w-2 h-2 rounded-full bg-primary"
      style={{ opacity: fadeValue }}
    />
  );
}
