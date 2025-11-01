/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#22c55e', // green-500 - Primary actions, brand
          dark: '#16a34a',    // green-600 - Hover states
          light: '#4ade80',   // green-400 - Highlights
        },
        secondary: {
          DEFAULT: '#64748b', // slate-500 - Secondary text
          dark: '#475569',    // slate-600 - Muted text
          light: '#94a3b8',   // slate-400 - Disabled text
        },
        
        // Semantic Colors
        success: '#22c55e',   // green-500
        warning: '#f59e0b',   // amber-500
        error: '#ef4444',     // red-500
        info: '#3b82f6',      // blue-500
        
        // Dunbar Layer Colors
        layer: {
          0: '#ef4444',  // red-500 - Intimate Core
          1: '#f97316',  // orange-500 - Sympathy Group
          2: '#eab308',  // yellow-500 - Close Group
          3: '#22c55e',  // green-500 - Tribe
          4: '#3b82f6',  // blue-500 - Acquaintances
          5: '#8b5cf6',  // violet-500 - Social Nebula
        },
        
        // Surface Colors (keeping Tailwind's zinc scale)
        // background: '#000000' (black)
        // surface-1: zinc-900 (#18181b)
        // surface-2: zinc-800 (#27272a)
        // surface-3: zinc-700 (#3f3f46)
      },
      
      fontFamily: {
        // Simplified font family system
        'sans': ['Montserrat_400Regular'],
        'montserrat': ['Montserrat_400Regular'],
        'montserrat-semibold': ['Montserrat_600SemiBold'],
        'montserrat-bold': ['Montserrat_700Bold'],
      },
      
      // Spacing scale (already good with Tailwind's 4px base)
      // Keeping default: 0.5, 1, 2, 3, 4, 6, 8, 12, etc.
      
      // Letter spacing
      letterSpacing: {
        'label': '0.5px',     // Uppercase labels
        'wide': '0.025em',    // 2.5% spacing for titles
        'wider': '0.05em',    // 5% spacing for impact
        'widest': '0.1em',    // 10% spacing for maximum impact
      },
      
      // Custom shadow scale for React Native
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'DEFAULT': '0 4px 8px rgba(0, 0, 0, 0.2)',
        'md': '0 4px 8px rgba(0, 0, 0, 0.2)',
        'lg': '0 8px 16px rgba(0, 0, 0, 0.3)',
      },
      
      // Animation durations
      transitionDuration: {
        'fastest': '100ms',
        'fast': '200ms',
        'base': '300ms',
        'slow': '500ms',
        'slowest': '800ms',
      },
    },
  },
  plugins: [],
};
