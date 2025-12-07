/**
 * Blob Background Component
 * 
 * Creates organic, biomorphic gradient blobs for atmospheric depth.
 * Used as decorative backgrounds in cards and hero sections.
 * 
 * @design Aurora + Biomorphic Design System
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse, G } from 'react-native-svg';

interface BlobBackgroundProps {
  /** Color of the gradient blob */
  color?: string;
  /** Opacity of the blob (0-1) */
  opacity?: number;
  /** Size of the blob */
  size?: number;
  /** Position from top */
  top?: number;
  /** Position from right */
  right?: number;
  /** Position from left */
  left?: number;
  /** Position from bottom */
  bottom?: number;
  /** Rotation angle in degrees */
  rotation?: number;
  /** Variant of blob shape */
  variant?: 'default' | 'wide' | 'tall' | 'small';
}

export function BlobBackground({ 
  color = '#22c55e',
  opacity = 0.1,
  size = 400,
  top,
  right,
  left,
  bottom,
  rotation = 25,
  variant = 'default',
}: BlobBackgroundProps) {
  
  // Calculate ellipse radii based on variant
  const getRadii = () => {
    switch (variant) {
      case 'wide':
        return { rx: size * 0.5, ry: size * 0.3 };
      case 'tall':
        return { rx: size * 0.3, ry: size * 0.5 };
      case 'small':
        return { rx: size * 0.25, ry: size * 0.3 };
      default:
        return { rx: size * 0.45, ry: size * 0.55 };
    }
  };
  
  const { rx, ry } = getRadii();
  const center = size / 2;
  
  // Default positioning
  const positionStyle: any = {
    position: 'absolute',
    pointerEvents: 'none',
  };
  
  if (top !== undefined) positionStyle.top = top;
  if (right !== undefined) positionStyle.right = right;
  if (left !== undefined) positionStyle.left = left;
  if (bottom !== undefined) positionStyle.bottom = bottom;
  
  // Default to top-right if no position specified
  if (top === undefined && bottom === undefined) positionStyle.top = -size * 0.25;
  if (left === undefined && right === undefined) positionStyle.right = -size * 0.25;

  return (
    <View style={positionStyle}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient
            id={`blob-gradient-${color.replace('#', '')}`}
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
          >
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="70%" stopColor={color} stopOpacity={opacity * 0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <G transform={`rotate(${rotation} ${center} ${center})`}>
          <Ellipse
            cx={center}
            cy={center}
            rx={rx}
            ry={ry}
            fill={`url(#blob-gradient-${color.replace('#', '')})`}
          />
        </G>
      </Svg>
    </View>
  );
}

/**
 * Aurora Glow Component
 * 
 * Creates a subtle aurora-like glow effect for headers and hero sections.
 */
interface AuroraGlowProps {
  /** Primary color */
  color?: string;
  /** Height of the glow area */
  height?: number;
  /** Intensity of the glow (0-1) */
  intensity?: number;
}

export function AuroraGlow({
  color = '#22c55e',
  height = 300,
  intensity = 0.15,
}: AuroraGlowProps) {
  return (
    <View 
      style={[
        styles.auroraContainer,
        { height },
      ]}
      pointerEvents="none"
    >
      <Svg width="100%" height={height} preserveAspectRatio="none">
        <Defs>
          <RadialGradient
            id="aurora-glow"
            cx="50%"
            cy="0%"
            rx="80%"
            ry="100%"
          >
            <Stop offset="0%" stopColor={color} stopOpacity={intensity} />
            <Stop offset="50%" stopColor={color} stopOpacity={intensity * 0.5} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx="50%"
          cy="0"
          rx="100%"
          ry={height}
          fill="url(#aurora-glow)"
        />
      </Svg>
    </View>
  );
}

/**
 * Layer Glow Indicator
 * 
 * A glowing dot that indicates layer color with organic glow effect.
 */
interface LayerGlowIndicatorProps {
  /** Layer color */
  color: string;
  /** Size of the indicator */
  size?: number;
  /** Whether the indicator is active/highlighted */
  active?: boolean;
}

export function LayerGlowIndicator({
  color,
  size = 12,
  active = false,
}: LayerGlowIndicatorProps) {
  return (
    <View
      style={[
        styles.glowIndicator,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: active ? 0.8 : 0.5,
          shadowRadius: active ? 12 : 8,
          shadowOffset: { width: 0, height: 0 },
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  auroraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  glowIndicator: {
    elevation: 4,
  },
});
