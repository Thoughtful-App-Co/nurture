/**
 * Skeleton Loader Component
 * 
 * Organic skeleton loading states that feel smooth and natural.
 * Replaces jarring ActivityIndicator spinners with flowing shimmer effects.
 * 
 * @design Aurora + Biomorphic Design System
 * - Organic border radius matching card/button styles
 * - Smooth shimmer animation
 * - Multiple variants for different content types
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

interface SkeletonProps {
  /** Width of the skeleton (number or percentage string) */
  width?: number | string;
  /** Height of the skeleton */
  height?: number;
  /** Border radius variant */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Custom style overrides */
  style?: any;
}

/**
 * Basic Skeleton Element
 * A single animated skeleton placeholder
 */
export function Skeleton({ 
  width = '100%', 
  height = 16, 
  radius = 'md',
  style,
}: SkeletonProps) {
  const shimmer = useSharedValue(0);
  
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));
  
  const radiusMap = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  };
  
  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#27272a',
          borderRadius: radiusMap[radius],
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Skeleton Card
 * A full card skeleton with header, body, and footer areas
 */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      {/* Header area */}
      <View style={styles.cardHeader}>
        <Skeleton width={40} height={40} radius="full" />
        <View style={styles.cardHeaderText}>
          <Skeleton width="60%" height={16} radius="md" />
          <Skeleton width="40%" height={12} radius="md" style={{ marginTop: 8 }} />
        </View>
      </View>
      
      {/* Body area */}
      <View style={styles.cardBody}>
        <Skeleton width="100%" height={12} radius="md" />
        <Skeleton width="90%" height={12} radius="md" style={{ marginTop: 8 }} />
        <Skeleton width="75%" height={12} radius="md" style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

/**
 * Skeleton Contact Item
 * Matches the contact list item layout
 */
export function SkeletonContactItem() {
  return (
    <View style={styles.contactItem}>
      {/* Avatar */}
      <Skeleton width={48} height={48} radius="full" />
      
      {/* Content */}
      <View style={styles.contactContent}>
        <Skeleton width="70%" height={18} radius="md" />
        <Skeleton width="50%" height={14} radius="md" style={{ marginTop: 6 }} />
      </View>
      
      {/* Score badge */}
      <Skeleton width={40} height={24} radius="full" />
    </View>
  );
}

/**
 * Skeleton Layer Card
 * Matches the dashboard layer card layout
 */
export function SkeletonLayerCard() {
  return (
    <View style={styles.layerCard}>
      {/* Header */}
      <View style={styles.layerHeader}>
        <Skeleton width={12} height={12} radius="full" />
        <Skeleton width="40%" height={18} radius="md" style={{ marginLeft: 12 }} />
        <View style={{ flex: 1 }} />
        <Skeleton width={50} height={24} radius="full" />
      </View>
      
      {/* Stats */}
      <View style={styles.layerStats}>
        <Skeleton width="30%" height={14} radius="md" />
        <Skeleton width="25%" height={14} radius="md" />
      </View>
      
      {/* Progress bar */}
      <Skeleton width="100%" height={8} radius="full" style={{ marginTop: 12 }} />
    </View>
  );
}

/**
 * Skeleton List
 * Renders multiple skeleton items
 */
interface SkeletonListProps {
  count?: number;
  variant?: 'contact' | 'card' | 'layer';
}

export function SkeletonList({ count = 5, variant = 'contact' }: SkeletonListProps) {
  const items = Array.from({ length: count }, (_, i) => i);
  
  const renderItem = () => {
    switch (variant) {
      case 'card':
        return <SkeletonCard />;
      case 'layer':
        return <SkeletonLayerCard />;
      case 'contact':
      default:
        return <SkeletonContactItem />;
    }
  };
  
  return (
    <View>
      {items.map((index) => (
        <View key={index} style={{ marginBottom: 12 }}>
          {renderItem()}
        </View>
      ))}
    </View>
  );
}

/**
 * Skeleton Dashboard
 * Full dashboard skeleton for initial load
 */
export function SkeletonDashboard() {
  return (
    <View style={styles.dashboard}>
      {/* Header */}
      <View style={styles.dashboardHeader}>
        <Skeleton width="50%" height={32} radius="md" />
        <Skeleton width="70%" height={16} radius="md" style={{ marginTop: 12 }} />
      </View>
      
      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Skeleton width={48} height={48} radius="full" />
          <Skeleton width="80%" height={14} radius="md" style={{ marginTop: 8 }} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={48} height={48} radius="full" />
          <Skeleton width="80%" height={14} radius="md" style={{ marginTop: 8 }} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={48} height={48} radius="full" />
          <Skeleton width="80%" height={14} radius="md" style={{ marginTop: 8 }} />
        </View>
      </View>
      
      {/* Layer cards */}
      <SkeletonList count={4} variant="layer" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.8)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  cardBody: {
    marginTop: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.8)',
  },
  contactContent: {
    flex: 1,
    marginLeft: 12,
  },
  layerCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.8)',
  },
  layerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  layerStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  dashboard: {
    padding: 24,
  },
  dashboardHeader: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
});
