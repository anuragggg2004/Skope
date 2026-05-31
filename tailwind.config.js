/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#080b14',
        navy2: '#0f1320',
        navy3: '#141926',
        blue: '#4f8ef7',
        purple: '#8b5cf6',
        pink: '#f472b6',
        white: '#f0f2ff',
        muted: 'rgba(240,242,255,0.45)',
        border: 'rgba(255,255,255,0.07)',
        green: '#22d3a0',
        red: '#f87171',
        yellow: '#fbbf24',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(14px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        bounce1: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease forwards',
        float: 'float 3s ease-in-out infinite',
        pulseGlow: 'pulseGlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
