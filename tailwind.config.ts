import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f5e9',
          500: '#25d366',
          600: '#128c7e',
          700: '#075e54',
        },
        ga: {
          primary: '#3b9702',
          danger: '#d1242f',
          dark: {
            bg: '#1a1a1a',
            panel: '#1f2223',
            text: '#fff',
            textSecondary: 'rgba(255, 255, 255, 0.65)',
            border: '#313131',
            primary: '#3b9702',
            authorizedBg: '#264500',
            notAuthorizedBg: 'rgba(255, 53, 53, 0.12)',
            starting: '#1890ff',
            warning: '#ff6600',
            blocked: 'rgb(152, 0, 0)',
          },
          light: {
            bg: '#fff',
            panel: '#f0f2f5',
            text: '#000000e0',
            textSecondary: 'rgba(0, 0, 0, 0.55)',
            border: '#d9d9d9',
            primary: '#3b9702',
            authorizedBg: '#eeffe3',
            notAuthorizedBg: '#f8d4d6',
            starting: '#1890ff',
            warning: '#ff9100',
            blocked: 'rgb(255, 39, 39)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
