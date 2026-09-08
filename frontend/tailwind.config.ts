import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ops-room at night base palette tokens
        'bg-base': '#12161C',
        'bg-panel': '#1A2029',
        'bg-panel-subtle': '#151B22',
        'bg-input': '#0F1318',
        'border-base': '#26303D',
        'border-subtle': '#1E2632',
        'text-primary': '#E7EAEE',
        'text-muted': '#8B95A5',

        // Purposeful accent tokens
        'accent-amber': '#E8A33D',
        'accent-amber-glow': 'rgba(232, 163, 61, 0.15)',
        'accent-teal': '#4FB6A8',
        'accent-teal-glow': 'rgba(79, 182, 168, 0.15)',
        'accent-danger': '#E2685A',
        'accent-danger-glow': 'rgba(226, 104, 90, 0.15)',

        // Provider badge/dot accents
        'provider-aws': '#F5A623',
        'provider-azure': '#4E9BE0',
        'provider-gcp': '#4285F4',

        // Legacy compatibility aliases mapped to new calm palette
        background: '#12161C',
        surface: '#1A2029',
        card: '#1A2029',
        border: '#26303D',
        cyan: {
          400: '#4FB6A8',
          500: '#4FB6A8',
          600: '#3D9A8D',
        },
        gold: '#E8A33D',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      lineHeight: {
        writeup: '1.6',
      },
      maxWidth: {
        writeup: '75ch',
      },
    },
  },
  plugins: [],
}

export default config
