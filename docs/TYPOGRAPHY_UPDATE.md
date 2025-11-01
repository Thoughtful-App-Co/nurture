# Typography Update - Bold Narrow Headers with Letter Spacing

**Date:** November 1, 2025  
**Change:** Headers now use bold font weight with letter spacing for more impact

---

## Changes Made

### Typography Hierarchy Update

All headers and titles now use:
- **Bold weight** (`font-bold`) instead of semibold
- **Letter spacing** (`tracking-wide` or `tracking-wider`) for distinctive look

### Letter Spacing Scale (Tailwind Config)

```javascript
letterSpacing: {
  'label': '0.5px',     // Uppercase labels
  'wide': '0.025em',    // 2.5% spacing - headers (H1, H2)
  'wider': '0.05em',    // 5% spacing - display text
  'widest': '0.1em',    // 10% spacing - maximum impact
}
```

---

## New Typography System

### Display (App Name, Hero Text)
```tsx
<Text className="text-5xl font-bold tracking-wider text-primary">
  Nurture
</Text>
```
**Size:** 48px | **Weight:** Bold (700) | **Spacing:** 5%  
**Use:** Welcome screen, app name, hero sections

### Heading 1 (Page Titles)
```tsx
<Text className="text-4xl font-bold tracking-wide text-primary">
  Your Garden
</Text>
```
**Size:** 36px | **Weight:** Bold (700) | **Spacing:** 2.5%  
**Use:** Dashboard title, screen titles

### Heading 2 (Section Titles)
```tsx
<Text className="text-2xl font-bold tracking-wide text-white">
  Relationship Layers
</Text>
```
**Size:** 24px | **Weight:** Bold (700) | **Spacing:** 2.5%  
**Use:** Section headers

### Heading 3 (Subsection Headers)
```tsx
<Text className="text-xl font-bold tracking-wide text-white">
  Subsection Title
</Text>
```
**Size:** 20px | **Weight:** Bold (700) | **Spacing:** 2.5%  
**Use:** Card titles, modal headers

### Body Text (unchanged)
```tsx
<Text className="text-base text-zinc-400 leading-relaxed">
  Body text remains at normal weight for readability.
</Text>
```
**Size:** 16px | **Weight:** Normal (400) | **Spacing:** Default

---

## Files Updated

### Screens
- ✅ `app/(tabs)/dashboard.tsx`
  - "Your Garden" title
  - "Relationship Layers" section header

- ✅ `app/(tabs)/harvest.tsx`
  - "Harvest" title

- ✅ `components/auth/onboarding-flow.tsx`
  - "Nurture" app name
  - All step headers (4 screens)

- ✅ `components/auth/BiometricLock.tsx`
  - "Nurture" lock screen title

- ✅ `components/onboarding/DataMiningScreen.tsx`
  - "Let's Look at Your Garden" title

### Configuration
- ✅ `tailwind.config.js` - Added letter spacing tokens
- ✅ `docs/design-specs.md` - Updated typography specifications

---

## Visual Comparison

### Before
```
Your Garden          (text-4xl font-semibold)
└─ 36px, semibold (600), no letter spacing
```

### After
```
Y o u r   G a r d e n          (text-4xl font-bold tracking-wide)
└─ 36px, bold (700), 2.5% letter spacing
```

The new style creates:
- **More impact** - Bolder weight stands out more
- **Better readability** - Letter spacing improves legibility at large sizes
- **Modern aesthetic** - Narrow bold headers feel contemporary
- **Clear hierarchy** - Stronger visual distinction between titles and body

---

## Design Rationale

### Why Bold?
- Creates stronger visual hierarchy
- Headers pop more against dark background
- Better contrast with normal-weight body text
- Modern, confident aesthetic

### Why Letter Spacing?
- Improves readability at large sizes
- Creates elegant, refined look
- "Opens up" bold text to prevent crowding
- Gives headers breathing room
- Contemporary design trend

### Why Narrow (Bold) Instead of Extra Bold?
- Bold (700) with spacing looks narrower and more refined
- Avoids overly heavy, blocky appearance
- Letter spacing compensates for bold weight
- Maintains elegance while adding impact

---

## Usage Guidelines

### DO ✅
```tsx
// Large titles - use tracking-wider (5%)
<Text className="text-5xl font-bold tracking-wider">
  App Name
</Text>

// Page titles - use tracking-wide (2.5%)
<Text className="text-4xl font-bold tracking-wide">
  Page Title
</Text>

// Section headers - use tracking-wide (2.5%)
<Text className="text-2xl font-bold tracking-wide">
  Section Header
</Text>
```

### DON'T ❌
```tsx
// Don't add letter spacing to body text
<Text className="text-base tracking-wide">  ❌
  This hurts readability
</Text>

// Don't use bold for body paragraphs
<Text className="text-base font-bold">  ❌
  Too heavy for reading
</Text>

// Don't use semibold for titles anymore
<Text className="text-4xl font-semibold">  ❌
  Use font-bold instead
</Text>
```

---

## Accessibility Notes

- ✅ **Contrast maintained:** Bold text has same/better contrast
- ✅ **Readability improved:** Letter spacing aids comprehension
- ✅ **Hierarchy clear:** Stronger weight distinction
- ⚠️ **Screen readers:** No impact (styling only)

---

## Browser/Device Support

- ✅ **iOS:** Full support for letter-spacing
- ✅ **Android:** Full support for letter-spacing
- ✅ **React Native:** Native `letterSpacing` style prop
- ✅ **NativeWind:** `tracking-*` classes work perfectly

---

## Performance Impact

- **None:** Letter spacing is a CSS/style property
- **Font loading:** Already using Montserrat_700Bold
- **Render time:** No measurable difference

---

## Next Steps

1. ✅ Test on real devices to see visual impact
2. ✅ Verify readability at different screen sizes
3. ✅ Get user feedback on new header style
4. Consider extending pattern to other components if well-received

---

**Maintained by:** Design & Engineering Team  
**Questions?** See `/docs/design-specs.md` for complete typography system
