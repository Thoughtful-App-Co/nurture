/**
 * InfoTooltip - Small info icon that shows helpful text on tap
 * 
 * Usage:
 * <InfoTooltip
 *   title="Weekly Time"
 *   content="Estimated hours per week..."
 * />
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';

interface InfoTooltipProps {
  title?: string;
  content: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InfoTooltip({ title, content, size = 'md' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base',
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="ml-1"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={`Information about ${title || 'this feature'}`}
        accessibilityRole="button"
      >
        <View className={`${sizeClasses[size]} rounded-full bg-zinc-800 items-center justify-center border border-zinc-700`}>
          <Text className="text-zinc-400 font-bold">i</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable 
          className="flex-1 bg-black/80 items-center justify-center px-6"
          onPress={() => setIsVisible(false)}
        >
          <Pressable 
            className="bg-zinc-900 border-2 border-zinc-800 rounded-lg p-6 max-w-md w-full"
            onPress={(e) => e.stopPropagation()}
          >
            {title && (
              <Text className="text-white font-semibold text-lg mb-3">
                {title}
              </Text>
            )}
            <Text className="text-zinc-300 text-base leading-relaxed mb-4">
              {content}
            </Text>
            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              className="bg-primary py-2 px-4 rounded-lg self-end"
            >
              <Text className="text-black font-semibold">Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
