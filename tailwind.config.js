/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

const {
  slate,
  gray,
  zinc,
  neutral,
  stone,
  red,
  orange,
  amber,
  yellow,
  green,
  emerald,
  teal,
  cyan,
  sky,
  blue,
} = colors

const primary = {
  50: '#F3E8FF',
  100: '#F3E8FF',
  200: '#A855F7',
  300: '#A855F7',
  400: '#A855F7',
  500: '#6D28D9',
  600: '#4C1D95',
  700: '#4C1D95',
  800: '#4C1D95',
  900: '#4C1D95',
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#fff',
      black: '#000',
      slate,
      gray,
      zinc,
      neutral,
      stone,
      red,
      orange,
      amber,
      yellow,
      green,
      emerald,
      teal,
      cyan,
      sky,
      blue,
      indigo: primary,
      primary,
    },
    extend: {
      fontFamily: {
        sans: [
          "'Inter'",
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'sans-serif',
        ],
      },
      boxShadow: {
        ds: '0 1px 3px rgba(15, 23, 42, 0.08)',
        'ds-md': '0 4px 10px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
}
