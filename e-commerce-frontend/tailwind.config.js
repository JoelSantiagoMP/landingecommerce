/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E50914',
          hover: '#B91C1C',
        },
        surface: {
          DEFAULT: '#0D0D0D',
          raised: '#1A1A1A',
          muted: '#121212',
          border: '#2A2A2A',
        },
        ink: {
          DEFAULT: '#FFFFFF',
          soft: '#9CA3AF',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['"Source Sans 3"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 24px 48px rgba(0, 0, 0, 0.55)',
        glow: '0 0 0 1px rgba(229, 9, 20, 0.35), 0 12px 32px rgba(229, 9, 20, 0.18)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        scaleIn: 'scaleIn 0.25s ease-out',
        slideIn: 'slideIn 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
