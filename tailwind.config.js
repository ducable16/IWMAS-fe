/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        bg: {
          canvas: '#FAF9F5',
          surface: '#FFFFFF',
          sidebar: '#F5F2EC',
          subtle: '#F7F5EF',
          hover: '#EFEDE5',
          overlay: 'rgba(26, 26, 24, 0.4)',
        },
        border: {
          subtle: '#EEEBE2',
          DEFAULT: '#E3DFD3',
          strong: '#D4CFC0',
        },
        text: {
          primary: '#1F1E1C',
          secondary: '#5A5955',
          muted: '#8C8A82',
          disabled: '#B5B3AB',
        },
        accent: {
          DEFAULT: '#C96442',
          hover: '#B45838',
          subtle: '#F2E5DD',
          ring: 'rgba(201, 100, 66, 0.18)',
        },
        success: {
          DEFAULT: '#2F7D5B',
          subtle: '#E6F0EA',
        },
        warning: {
          DEFAULT: '#A8740F',
          subtle: '#F6EEDC',
        },
        danger: {
          DEFAULT: '#B54232',
          subtle: '#F4E2DE',
        },
        info: {
          DEFAULT: '#3B6EA8',
          subtle: '#E5EDF6',
        },
        risk: {
          low: '#2F7D5B',
          medium: '#A8740F',
          high: '#C0552F',
          critical: '#B54232',
        },
      },
      borderWidth: {
        hairline: '0.5px',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
