# Tab Bar Improvements

## Issues Fixed

### Issue 1: Tab bar name ✅
**Answer:** The component is called `TabLayout` in `app/(tabs)/_layout.tsx`

The two tabs are:
- **Garden** (🌱) - Dashboard with relationship layers
- **Harvest** (🌾) - Proactive relationship nurturing

### Issue 2: Tab bar "moves" between tabs ✅
**Problem:**
The tab bar had different heights when switching between Garden and Harvest tabs because:
- The `TabIcon` component used `Animated.spring` to scale the icon to 1.2x when focused
- This scaling caused the tab bar container to resize dynamically
- React Native's layout system would recalculate the tab bar height based on content

**Fix:**
- Removed the animated spring scaling
- Set fixed dimensions on the icon container (32x32px)
- Changed from scale animation to opacity change (1.0 when focused, 0.6 when inactive)
- This keeps the tab bar at a consistent height

### Issue 3: Dark green gradient with Material elevation ✅
**Old design:**
- Solid color: `#0a1f0f` (very dark green)
- Basic elevation/shadow
- No visual depth

**New design:**
- **Gradient:** Dark dark green to dark green
  - `#0a1f0f` (very dark green, almost black)
  - `#1a3a1f` (medium dark green)  
  - `#0f2814` (dark forest green)
  - Diagonal gradient (top-left to bottom-right)
- **Material elevation:**
  - Elevation: 12 (higher z-layer)
  - Shadow: Black with 30% opacity
  - Shadow offset: 4px upward
  - Shadow radius: 12px blur
  - Subtle green top border (1px, `#22c55e`)
- **Transparency:** Background set to transparent, gradient applied via `tabBarBackground`

## Technical Changes

### File: `app/(tabs)/_layout.tsx`

**Before:**
```tsx
function TabIcon({ focused, icon }: { focused: boolean; icon: string }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  }, [focused, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
    </Animated.View>
  );
}
```

**After:**
```tsx
function TabIcon({ focused, icon }: { focused: boolean; icon: string }) {
  return (
    <View style={{ 
      width: 32, 
      height: 32, 
      alignItems: 'center', 
      justifyContent: 'center',
      opacity: focused ? 1 : 0.6,
    }}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
    </View>
  );
}
```

**Tab bar style - Before:**
```tsx
tabBarStyle: {
  backgroundColor: "#0a1f0f",
  borderTopWidth: 0,
  elevation: 8,
  shadowColor: "#22c55e",
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  // ...
}
```

**Tab bar style - After:**
```tsx
tabBarBackground: () => (
  <LinearGradient
    colors={['#0a1f0f', '#1a3a1f', '#0f2814']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    }}
  />
),
tabBarStyle: {
  backgroundColor: 'transparent',
  borderTopWidth: 1,
  borderTopColor: '#22c55e',
  elevation: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  // ...
}
```

### File: `app/(tabs)/dashboard.tsx`

**Fixed tab bar override issue:**

**Before:**
```tsx
navigation.setOptions({
  tabBarStyle: shouldHideTabBar ? { display: 'none' } : {
    backgroundColor: "#0a1f0f",
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});
```

**After:**
```tsx
navigation.setOptions({
  tabBarStyle: shouldHideTabBar ? { display: 'none' } : undefined,
});
```

This prevents the dashboard from overriding the gradient and elevation when showing/hiding the tab bar.

## Dependencies Added

- `expo-linear-gradient` - Required for the gradient background

## Visual Result

The tab bar now has:
- ✅ Consistent height across all tabs (no movement)
- ✅ Rich dark green gradient with depth
- ✅ Material Design elevation (z-layer 12)
- ✅ Subtle green accent line at the top
- ✅ Deep shadows for floating effect
- ✅ Smooth opacity transitions instead of jarring scale animations

## Testing

1. Switch between Garden and Harvest tabs - should be smooth with no resizing
2. Check the gradient - should see subtle color variation
3. Check the shadow - should appear to float above the content
4. Open modals/detail screens - tab bar should hide completely
5. Return to main screens - tab bar should reappear with gradient intact
