import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Libre Bodoni', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    themes: [
      {
        libreria: {
          'color-scheme': 'light',
          primary: '#0F766E',
          'primary-content': '#F0FDFA',
          secondary: '#D97706',
          'secondary-content': '#FFFBEB',
          accent: '#10B981',
          'accent-content': '#ECFDF5',
          neutral: '#1E293B',
          'neutral-content': '#F1F5F9',
          'base-100': '#FFFFFF',
          'base-200': '#F8FAFC',
          'base-300': '#E2E8F0',
          'base-content': '#1E293B',
          info: '#3B82F6',
          success: '#10B981',
          warning: '#D97706',
          error: '#EF4444',
          '--rounded-box': '1rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1.9rem',
          '--btn-text-case': 'none',
        },
      },
    ],
  },
}
