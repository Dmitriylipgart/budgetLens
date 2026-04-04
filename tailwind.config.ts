/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc5fc',
          400: '#36a8f8',
          500: '#0c8ce9',
          600: '#006fc7',
          700: '#0058a1',
          800: '#054b85',
          900: '#0a3f6e',
        },
        income: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
        },
        expense: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
        },
      },
    },
  },
  plugins: [],
};
