# Nurture Design System Specification

> **Version:** 1.2.0  
> **Last Updated:** December 1, 2025  
> **Status:** Living Document

This document defines the design tokens, components, and patterns for the Nurture app. All components MUST use these specifications to ensure visual consistency and maintainability.

---

## 🎨 Design Philosophy

**Core Tenets:**
1. **Privacy-first aesthetic** - Dark, secure, calming
2. **Garden metaphor** - Growth, cultivation, natural rhythms
3. **Behavioral transparency** - Clear data representation
4. **Mindful interactions** - Deliberate, not addictive

**Design Paradigms (v1.2):**
- **Aurora** - Flowing gradients, atmospheric depth, colored glows
- **Biomorphic** - Organic shapes, natural curves, living system aesthetics

### Aurora + Biomorphic Principles

The design system combines two complementary paradigms:

1. **Aurora Effects**
   - Subtle gradient glows in headers and hero sections
   - Colored shadows that match layer/brand colors
   - Atmospheric depth through layered transparency

2. **Biomorphic Elements**
   - Organic border radius (12-24px instead of sharp corners)
   - Blob-shaped decorative backgrounds
   - Natural, flowing animations
   - Glowing indicators that mimic bioluminescence

---

## 📐 Layout & Spacing

### Spacing Scale
Based on **8px** base unit for consistent rhythm.

```typescript
// Use these Tailwind classes
const spacing = {
  '0.5': '4px',   // p-0.5, m-0.5, gap-0.5  - Tight grouping
  '1':   '8px',   // p-1, m-1, gap-1        - Related elements
  '2':   '16px',  // p-2, m-2, gap-2        - Component padding
  '3':   '24px',  // p-3, m-3, gap-3        - Section spacing
  '4':   '32px',  // p-4, m-4, gap-4        - Between sections
  '6':   '48px',  // p-6, m-6, gap-6        - Page spacing
  '8':   '64px',  // p-8, m-8, gap-8        - Large separations
  '12':  '96px',  // p-12, m-12, gap-12     - Hero sections
}
```

### Container Padding
```typescript
// Screen/page containers
px-6 py-8          // Mobile screens (24px horizontal, 32px vertical)
px-8 py-12         // Onboarding/welcome screens (32px, 96px)

// Component padding
p-4                // Card interior (16px)
p-3                // Compact cards (12px)
px-4 py-3          // Button padding (16px horizontal, 12px vertical)
```

### Vertical Rhythm
```
mb-2  (8px)   - Tight groups (label + value)
mb-3  (12px)  - Section headers
mb-4  (16px)  - Related sections
mb-6  (24px)  - Major sections
mb-8  (32px)  - Page sections
mb-12 (48px)  - Hero spacing
```

---

## 🔤 Typography

### Font Families
```typescript
fontFamily: {
  primary: ['Montserrat_400Regular'],        // Body text
  semibold: ['Montserrat_600SemiBold'],      // Emphasis
  bold: ['Montserrat_700Bold'],              // Strong emphasis
}
```

### Type Scale
Use Tailwind classes consistently:

```typescript
// Display - Welcome screens, hero text
text-5xl font-bold tracking-wide     // 48px, bold, 2.5% letter spacing
line-height: 1.1
Use: Welcome screens, app name

// Heading 1 - Page titles
text-4xl font-bold tracking-wide     // 36px, bold, 2.5% letter spacing
line-height: 1.2
Use: Dashboard "Your Garden", screen titles

// Heading 2 - Section titles
text-2xl font-bold tracking-wide     // 24px, bold, 2.5% letter spacing
line-height: 1.3
Use: "Relationship Layers", "Active Goals"

// Heading 3 - Subsection headers
text-xl font-medium      // 20px, medium
line-height: 1.4
Use: Layer names, card titles

// Body Large - Emphasis text
text-lg font-normal      // 18px, normal
line-height: 1.5
Use: Important descriptions, CTAs

// Body - Primary text
text-base font-normal    // 16px, normal
line-height: 1.6
Use: Most body text, descriptions

// Body Small - Secondary text
text-sm font-normal      // 14px, normal
line-height: 1.5
Use: Metadata, counts, helper text

// Caption - Labels
text-xs font-medium      // 12px, medium
letter-spacing: 0.5px (tracking-wide)
text-transform: uppercase
Use: Section headers (DUNBAR STATUS), labels
```

### Text Colors
```typescript
// Primary content
text-white           // #ffffff - Primary text
text-zinc-200        // #e4e4e7 - Secondary emphasis

// Secondary content  
text-zinc-400        // #a1a1aa - Secondary text (improved from zinc-500)
text-zinc-500        // #71717a - Tertiary text (use sparingly)

// Semantic
text-primary         // #22c55e - Primary brand, CTAs
text-red-400         // Error states
text-orange-400      // Warnings
text-blue-400        // Info
text-green-400       // Success
```

---

## 🎨 Color System

### Brand Colors
```typescript
primary: {
  DEFAULT: '#22c55e',  // green-500 - Primary actions, brand
  dark: '#16a34a',     // green-600 - Hover states
  light: '#4ade80',    // green-400 - Highlights
}

secondary: {
  DEFAULT: '#64748b',  // slate-500 - Secondary text
  dark: '#475569',     // slate-600 - Muted text
  light: '#94a3b8',    // slate-400 - Disabled text
}
```

### Semantic Colors
```typescript
success:   '#22c55e'  // green-500
warning:   '#f59e0b'  // amber-500
error:     '#ef4444'  // red-500
info:      '#3b82f6'  // blue-500
```

### Dunbar Layer Colors
```typescript
layers: {
  0: '#ef4444',  // red-500    - Intimate Core
  1: '#f97316',  // orange-500 - Sympathy Group
  2: '#eab308',  // yellow-500 - Close Group
  3: '#22c55e',  // green-500  - Tribe
  4: '#3b82f6',  // blue-500   - Acquaintances
  5: '#8b5cf6',  // violet-500 - Social Nebula
}
```

### Surface Colors (Dark Theme)
```typescript
background:  '#000000'  // black      - App background
surface-1:   '#18181b'  // zinc-900   - Cards, elevated surfaces
surface-2:   '#27272a'  // zinc-800   - Borders, dividers
surface-3:   '#3f3f46'  // zinc-700   - Hover states, inputs
```

### Border Colors
```typescript
border-primary:      '#22c55e'  // green-500  - Active/selected
border-zinc-800:     '#27272a'  // Default borders
border-zinc-700:     '#3f3f46'  // Stronger borders
border-zinc-600:     '#52525b'  // Emphasis borders
```

### Opacity Scale
Use consistent opacity modifiers:
```typescript
/10  - 10%  - Subtle background tints
/20  - 20%  - Light background tints
/30  - 30%  - Visible background tints
/40  - 40%  - Translucent overlays
/50  - 50%  - Semi-transparent overlays
```

---

## 🧩 Components

### Button Variants

#### Primary Button
```tsx
className="bg-primary border-2 border-primary py-3 px-4"
<Text className="text-black font-bold text-base text-center">
```
**Use:** Primary actions, main CTAs

#### Secondary Button
```tsx
className="border-2 border-zinc-700 bg-transparent py-3 px-4"
<Text className="text-zinc-400 text-base text-center">
```
**Use:** Secondary actions, cancel actions

#### Ghost Button
```tsx
className="bg-transparent py-3 px-4"
<Text className="text-zinc-400 text-base text-center">
```
**Use:** Tertiary actions, inline actions

#### Disabled State
```tsx
className="bg-zinc-900 border-2 border-zinc-800 py-3 px-4 opacity-50"
<Text className="text-zinc-600 text-base text-center">
```

#### Button Sizes
```typescript
sm:  "py-2 px-4"  // Compact buttons
md:  "py-3 px-4"  // Default
lg:  "py-4 px-6"  // Prominent CTAs
```

### Card Variants

#### Default Card
```tsx
className="bg-zinc-900 border border-zinc-800 p-4"
```
**Use:** Standard content containers

#### Accent Card
```tsx
className="bg-zinc-900 border border-zinc-800 p-4"
style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}
```
**Use:** Highlighted content, active items

#### Elevated Card
```tsx
className="bg-zinc-900 border border-zinc-800 p-4"
style={{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4,
}}
```
**Use:** Modals, popovers

### Input Fields

#### Text Input
```tsx
className="bg-zinc-900 text-white text-base px-4 py-3 border border-zinc-800"
placeholderTextColor="#71717a"
```

#### Text Input (Focus)
```tsx
className="bg-zinc-900 text-white text-base px-4 py-3 border-2 border-primary"
```

#### Text Input (Error)
```tsx
className="bg-zinc-900 text-white text-base px-4 py-3 border-2 border-red-500"
```

### Progress Bars
```tsx
// Container
className="h-3 bg-zinc-800 rounded-full overflow-hidden"

// Fill
className="h-full rounded-full"
style={{ width: `${percentage}%`, backgroundColor: color }}
```

### Section Headers
```tsx
className="text-xs text-zinc-400 font-semibold mb-3 uppercase tracking-wider"
```

---

## 🎭 Shadows & Elevation (Aurora Update v1.2)

### Shadow Scale
```typescript
// Level 0 - Flat
elevation: 0
shadowOpacity: 0

// Level 1 - Subtle (cards)
elevation: 2
shadowColor: '#000'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.1
shadowRadius: 8  // Increased for softer feel

// Level 2 - Raised (modals)
elevation: 4
shadowColor: '#000'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.2
shadowRadius: 12  // Increased for softer feel

// Level 3 - Floating (dropdowns)
elevation: 8
shadowColor: '#000'
shadowOffset: { width: 0, height: 8 }
shadowOpacity: 0.3
shadowRadius: 16
```

### Colored Glow Shadows (Aurora v1.2)
```typescript
// Primary glow (buttons, CTAs)
shadowColor: '#22c55e'  // Primary green
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.3
shadowRadius: 12
elevation: 6

// Layer-specific glows
shadowColor: layerColor  // Use layer's color
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.15
shadowRadius: 8
elevation: 3

// Indicator glow (LayerGlowIndicator)
shadowColor: indicatorColor
shadowOffset: { width: 0, height: 0 }
shadowOpacity: 0.5-0.8  // 0.5 inactive, 0.8 active
shadowRadius: 8-12
```

---

## 🔲 Border Radius (Biomorphic Update v1.2)

```typescript
// Standard Tailwind
rounded-none    // 0px    - Legacy/specific cases only
rounded-sm      // 4px    - Subtle softening
rounded         // 8px    - Default
rounded-md      // 12px   - Standard cards
rounded-lg      // 16px   - Buttons, inputs
rounded-xl      // 24px   - Large cards, modals
rounded-2xl     // 32px   - Hero cards
rounded-full    // 9999px - Pills, badges, progress bars

// Organic Variants (preferred)
rounded-organic-sm  // 12px - Cards, list items
rounded-organic     // 16px - Buttons, inputs (DEFAULT)
rounded-organic-lg  // 24px - Modals, hero sections
rounded-organic-xl  // 32px - Feature cards
```

**Design Decision (v1.2):** Nurture now uses **organic border radius** for a modern, biomorphic aesthetic that feels natural and approachable:
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-2xl` (16px)
- Modals: `rounded-organic-lg` (24px)
- Progress bars: `rounded-full`
- Badges and pills: `rounded-full`
- Layer indicators: `rounded-full` with glow

---

## 📱 Touch Targets & Accessibility

### Minimum Touch Targets
```typescript
minWidth: 44   // 44pt minimum
minHeight: 44  // 44pt minimum
```

### Icon Sizes
```typescript
Small:   20px  // Inline icons
Medium:  24px  // Button icons
Large:   32px  // Tab bar icons (ensure 44pt touch target)
Hero:    48px  // Feature icons
```

### Color Contrast Ratios
```typescript
// WCAG AA Compliance (minimum 4.5:1)
✅ text-white on bg-black:          21:1
✅ text-zinc-200 on bg-black:       16:1
✅ text-zinc-400 on bg-black:       6.3:1  (AA compliant)
⚠️ text-zinc-500 on bg-black:       4.6:1  (AAA fails, AA small text only)
❌ text-zinc-600 on bg-black:       3.1:1  (fails)

// Recommended text colors
Primary:    text-white      (21:1)
Secondary:  text-zinc-400   (6.3:1) - upgraded from zinc-500
Tertiary:   text-zinc-500   (4.6:1) - use only for non-essential text
```

### Accessibility Labels
All interactive elements MUST have:
```tsx
accessibilityLabel="Clear description"
accessibilityRole="button" | "link" | "header" | etc.
accessibilityState={{ disabled: true/false }}
```

---

## 🎬 Animation & Transitions

### Duration Scale
```typescript
fastest:  100ms  // Instant feedback (button press)
fast:     200ms  // Quick transitions (tooltips)
base:     300ms  // Standard (modal open/close)
slow:     500ms  // Deliberate (page transitions)
slowest:  800ms  // Emphasis (loading animations)
```

### Easing Functions
```typescript
easeOut:     // Default (most UI transitions)
easeInOut:   // Smooth back-and-forth (modals)
spring:      // Playful (buttons, toggles)
```

### Common Animations
```typescript
// Button Press
transform: [{ scale: 0.98 }]
duration: 100ms

// Modal Enter
transform: [{ translateY: '100%' to 0 }]
opacity: 0 to 1
duration: 300ms, easeOut

// Fade In
opacity: 0 to 1
duration: 200ms

// Skeleton Loading
opacity: 0.5 to 1 to 0.5 (loop)
duration: 1500ms
```

---

## 🧪 Design Patterns

### Empty States
```tsx
<View className="py-12 px-6 items-center">
  <Text className="text-6xl mb-4">{emoji}</Text>
  <Text className="text-xl font-semibold text-white mb-2 text-center">
    {primaryMessage}
  </Text>
  <Text className="text-base text-zinc-400 text-center mb-6">
    {secondaryMessage}
  </Text>
  <Button variant="primary">
    {actionLabel}
  </Button>
</View>
```

### Loading States
```tsx
<View className="flex-1 bg-black justify-center items-center">
  <ActivityIndicator size="large" color="#22c55e" />
  <Text className="text-zinc-400 mt-4">{message}</Text>
</View>
```

### Error States
```tsx
<View className="p-4 bg-red-950/20 border border-red-900">
  <Text className="text-red-400 text-sm font-medium mb-2">
    {errorTitle}
  </Text>
  <Text className="text-red-300 text-sm">
    {errorMessage}
  </Text>
</View>
```

### Success States
```tsx
<View className="p-4 bg-green-950/20 border border-green-900">
  <Text className="text-green-400 text-sm font-medium mb-2">
    {successTitle}
  </Text>
  <Text className="text-green-300 text-sm">
    {successMessage}
  </Text>
</View>
```

---

## 🌌 Aurora + Biomorphic Components (v1.2)

### BlobBackground
Decorative organic gradient blobs for atmospheric depth.

```tsx
import { BlobBackground } from '@/components/ui';

// Basic usage
<BlobBackground color="#22c55e" opacity={0.1} />

// With positioning
<BlobBackground 
  color={layer.color}
  opacity={0.08}
  size={200}
  top={-60}
  right={-40}
  variant="small"
/>
```

**Props:**
- `color` - Gradient color (default: primary green)
- `opacity` - 0-1 (default: 0.1)
- `size` - Size in pixels (default: 400)
- `top/right/left/bottom` - Position offsets
- `rotation` - Angle in degrees (default: 25)
- `variant` - 'default' | 'wide' | 'tall' | 'small'

### AuroraGlow
Subtle aurora-like glow effect for headers and hero sections.

```tsx
import { AuroraGlow } from '@/components/ui';

<AuroraGlow color="#22c55e" height={280} intensity={0.12} />
```

**Props:**
- `color` - Glow color (default: primary green)
- `height` - Height of glow area (default: 300)
- `intensity` - 0-1 (default: 0.15)

### LayerGlowIndicator
Glowing dot indicator with layer-specific colors.

```tsx
import { LayerGlowIndicator } from '@/components/ui';

<LayerGlowIndicator color={layer.color} size={12} active />
```

**Props:**
- `color` - Indicator color
- `size` - Diameter in pixels (default: 12)
- `active` - Whether to show stronger glow (default: false)

### Skeleton Loaders
Organic skeleton loading states for smooth UX.

```tsx
import { Skeleton, SkeletonCard, SkeletonLayerCard, SkeletonDashboard } from '@/components/ui';

// Basic skeleton element
<Skeleton width="60%" height={16} radius="md" />

// Pre-built skeleton variants
<SkeletonCard />
<SkeletonLayerCard />
<SkeletonDashboard />
```

---

## 🎯 Haptic Feedback (v1.2)

Use haptics to enhance the organic, tactile feel.

```tsx
import { useHaptics, triggerHaptic } from '@/hooks/useHaptics';

// In component
const { light, medium, success } = useHaptics();

// Button press
<Pressable onPress={() => { light(); doAction(); }}>

// Or standalone
triggerHaptic('medium');
```

**Haptic Types:**
- `light` - Selections, toggles
- `medium` - Button presses (default)
- `heavy` - Confirmations, important actions
- `success` - Completed actions
- `warning` - Attention needed
- `error` - Something went wrong
- `selection` - Scrolling through options

---

## 📏 Responsive Breakpoints

```typescript
// React Native uses dp/pt units, not pixels
phone:     0-428pt    // iPhone 14 Pro Max width
tablet:    429-768pt  // iPad Mini width
desktop:   769pt+     // iPad Pro width
```

**Note:** Most screens use `px-6` (24px) on mobile. Tablet/desktop can use `px-8` or `px-12` for more breathing room.

---

## ✅ Implementation Checklist

When building a new component or screen:

- [ ] Uses design tokens (no hardcoded values)
- [ ] Typography follows scale (text-xs to text-5xl)
- [ ] Spacing uses 8px scale (p-2, p-4, p-6, etc.)
- [ ] Colors from defined palette
- [ ] Touch targets minimum 44x44pt
- [ ] Accessibility labels on interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Loading/error/empty states handled
- [ ] Transitions smooth (300ms default)
- [ ] Tested on iOS and Android

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | Dec 1, 2025 | Aurora + Biomorphic design upgrade: organic border radius, blob backgrounds, glow effects, skeleton loaders, haptic feedback |
| 1.0.0 | Nov 1, 2025 | Initial design system specification |

---

## 📚 Resources

- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Color Reference](https://tailwindcss.com/docs/customizing-colors)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)

---

**Maintained by:** Design & Engineering Team  
**Questions?** See `/docs/CORE_TENETS.md` for design philosophy
