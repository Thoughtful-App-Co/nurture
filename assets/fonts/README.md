# Fonts Setup

## Montserrat (Google Fonts)

This app uses **Montserrat** as the primary typeface - a free, open-source alternative to Proxima Nova.

### Installed via Expo Google Fonts:

✅ **Montserrat_400Regular** - Body text
✅ **Montserrat_600SemiBold** - Headers (like "Nurture", "Welcome")
✅ **Montserrat_700Bold** - Emphasis

### Installation:

Fonts are automatically loaded via `@expo-google-fonts/montserrat` package.

No manual font file downloads needed!

### Current Usage:

- **"Nurture" header** on welcome screen: `Montserrat_600SemiBold`
- **"Welcome Back"** on sign-in: `Montserrat_600SemiBold`
- **"Welcome [Name]"** on home screen: `Montserrat_600SemiBold`
- **Section headers**: `Montserrat_600SemiBold`
- **Body text**: System default

### Usage in Components:

```tsx
// Inline style approach (recommended for headers)
<Text style={{ fontFamily: 'Montserrat_600SemiBold' }}>
  Nurture
</Text>

// Or via Tailwind classes
<Text className="font-montserrat-semibold">
  Header Text
</Text>
```

### Available Tailwind Classes:

- `font-montserrat` - Regular (400)
- `font-montserrat-semibold` - SemiBold (600)
- `font-montserrat-bold` - Bold (700)

### Why Montserrat?

Montserrat is a geometric sans-serif typeface inspired by urban typography. It's:
- Free and open-source
- Very similar to Proxima Nova
- Professional and modern
- Excellent readability
- Wide language support
