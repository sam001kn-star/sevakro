/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e6ecff',
          200: '#c7d9ff',
          300: '#a8c5ff',
          400: '#667eea',
          500: '#5568d3',
          600: '#4c63c4',
          700: '#3d4fa6',
          800: '#2e3a7d',
          900: '#1f2656',
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%))',
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
