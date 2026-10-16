import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f5e9',
          500: '#25d366',
          600: '#128c7e',
          700: '#075e54',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
