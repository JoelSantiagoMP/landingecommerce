/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF',
          hover: '#1D4ED8',
        },
        surface: {
          DEFAULT: '#F3F5F8',
          muted: '#E6EBF2',
          dark: '#0F172A',
        },
        ink: {
          DEFAULT: '#0B1220',
          soft: '#475569',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['"Source Sans 3"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 18px 40px rgba(15, 23, 42, 0.16)',
      },
    },
  },
  plugins: [],
}
