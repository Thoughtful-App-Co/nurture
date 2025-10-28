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
        primary: {
          DEFAULT: '#22c55e', // green
          dark: '#16a34a',
        },
        secondary: {
          DEFAULT: '#64748b', // steel
          dark: '#475569',
        },
        accent: {
          purple: '#a855f7',
          orange: '#f97316',
        },
      },
      fontFamily: {
        'montserrat': ['Montserrat_400Regular'],
        'montserrat-semibold': ['Montserrat_600SemiBold'],
        'montserrat-bold': ['Montserrat_700Bold'],
      },
    },
  },
  plugins: [],
};
