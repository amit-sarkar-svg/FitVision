/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0D0D0D',
          raised: '#141414',
          card: '#1A1A1A',
          hover: '#222222',
          border: '#2A2A2A',
        },
        accent: {
          DEFAULT: '#39D353',
          bright: '#4ADE20',
          muted: '#39D35320',
        },
        muscle: {
          primary: '#EF4444',
          secondary: '#F97316',
          tertiary: '#EAB308',
        },
        tips: {
          DEFAULT: '#2D1B4E',
          border: '#4C1D95',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        glow: '0 0 20px rgba(57, 211, 83, 0.15)',
      },
    },
  },
  plugins: [],
}
