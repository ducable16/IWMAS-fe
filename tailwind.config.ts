import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'NotionInter',
          'Inter',
          '-apple-system',
          'system-ui',
          'Segoe UI',
          'Helvetica',
          'Apple Color Emoji',
          'Arial',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'sans-serif',
        ],
        display: [
          'NotionInter',
          'Inter',
          '-apple-system',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      // Notion-inspired palette. Token names match what existing components
      // already consume (bg-bg-*, text-text-*, accent, success, …) so swapping
      // values here re-themes the whole app without touching call sites.
      colors: {
        bg: {
          canvas:  '#FFFFFF',          // pure white page
          surface: '#FFFFFF',          // cards
          sidebar: '#F6F5F4',          // warm white
          subtle:  '#F6F5F4',          // alt section / muted card
          hover:   'rgba(0, 0, 0, 0.05)',
          overlay: 'rgba(0, 0, 0, 0.4)',
        },
        border: {
          subtle:  'rgba(0, 0, 0, 0.06)',
          DEFAULT: 'rgba(0, 0, 0, 0.10)',  // whisper border
          strong:  'rgba(0, 0, 0, 0.16)',
        },
        text: {
          primary:   'rgba(0, 0, 0, 0.95)',  // near-black, not pure black
          secondary: '#615D59',              // warm gray 500
          muted:     '#A39E98',              // warm gray 300
          disabled:  '#A39E98',
          inverse:   '#FFFFFF',
        },

        // Notion Blue is the singular accent
        accent: {
          DEFAULT: '#0075DE',
          hover:   '#005BAB',
          subtle:  '#F2F9FF',
          ring:    'rgba(9, 127, 232, 0.35)',
          text:    '#097FE8',
        },

        // Brand secondary (deep navy)
        brand: {
          DEFAULT: '#213183',
          active:  '#005BAB',
        },

        // Semantic accents (Notion's named hues)
        success: {
          DEFAULT: '#1AAE39',          // green
          subtle:  '#EAF7EC',
        },
        teal: {
          DEFAULT: '#2A9D99',
          subtle:  '#E5F4F3',
        },
        warning: {
          DEFAULT: '#DD5B00',          // orange
          subtle:  '#FCEBDD',
        },
        danger: {
          DEFAULT: '#DD5B00',          // share orange for warnings/danger
          subtle:  '#FCEBDD',
        },
        info: {
          DEFAULT: '#0075DE',
          subtle:  '#F2F9FF',
        },
        pink: {
          DEFAULT: '#FF64C8',
          subtle:  '#FFE7F4',
        },
        purple: {
          DEFAULT: '#391C57',
          subtle:  '#EBE6F1',
        },
        brown: {
          DEFAULT: '#523410',
          subtle:  '#EFE7DC',
        },

        // Workload / risk ramp -- map to Notion's semantic accents
        risk: {
          low:      '#1AAE39',         // green
          medium:   '#DD5B00',         // orange
          high:     '#DD5B00',
          critical: '#B43A18',         // darker orange-red
        },

        // Focus
        focus: '#097FE8',
      },

      borderWidth: {
        hairline: '1px',
      },

      borderRadius: {
        // Aliases that match the Notion radius scale
        micro: '4px',
        subtle: '5px',
        comfortable: '12px',
        hero: '16px',
        pill: '9999px',
      },

      fontSize: {
        // Notion typography scale (size, line-height, letter-spacing)
        'display-hero':       ['64px', { lineHeight: '1.00', letterSpacing: '-2.125px', fontWeight: '700' }],
        'display-secondary':  ['54px', { lineHeight: '1.04', letterSpacing: '-1.875px', fontWeight: '700' }],
        'section':            ['48px', { lineHeight: '1.00', letterSpacing: '-1.5px',   fontWeight: '700' }],
        'subhead-lg':         ['40px', { lineHeight: '1.50', letterSpacing: '0',         fontWeight: '700' }],
        'subhead':            ['26px', { lineHeight: '1.23', letterSpacing: '-0.625px', fontWeight: '700' }],
        'card-title':         ['22px', { lineHeight: '1.27', letterSpacing: '-0.25px',  fontWeight: '700' }],
        'body-lg':            ['20px', { lineHeight: '1.40', letterSpacing: '-0.125px', fontWeight: '600' }],
        'body':               ['16px', { lineHeight: '1.50', letterSpacing: '0',         fontWeight: '400' }],
        'nav':                ['15px', { lineHeight: '1.33', letterSpacing: '0',         fontWeight: '600' }],
        'caption':            ['14px', { lineHeight: '1.43', letterSpacing: '0',         fontWeight: '500' }],
        'badge':              ['12px', { lineHeight: '1.33', letterSpacing: '0.125px',   fontWeight: '600' }],
        'micro':              ['12px', { lineHeight: '1.33', letterSpacing: '0.125px',   fontWeight: '400' }],
      },

      boxShadow: {
        // Multi-layer Notion stacks. Use shadow-card / shadow-deep / shadow-focus.
        none: 'none',
        card:
          'rgba(0, 0, 0, 0.04) 0px 4px 18px, ' +
          'rgba(0, 0, 0, 0.027) 0px 2.025px 7.84688px, ' +
          'rgba(0, 0, 0, 0.02) 0px 0.8px 2.925px, ' +
          'rgba(0, 0, 0, 0.01) 0px 0.175px 1.04062px',
        deep:
          'rgba(0, 0, 0, 0.01) 0px 1px 3px, ' +
          'rgba(0, 0, 0, 0.02) 0px 3px 7px, ' +
          'rgba(0, 0, 0, 0.02) 0px 7px 15px, ' +
          'rgba(0, 0, 0, 0.04) 0px 14px 28px, ' +
          'rgba(0, 0, 0, 0.05) 0px 23px 52px',
        focus: '0 0 0 2px #FFFFFF, 0 0 0 4px #097FE8',
      },

      letterSpacing: {
        'compress-hero':      '-2.125px',
        'compress-secondary': '-1.875px',
        'compress-section':   '-1.5px',
        'compress-subhead':   '-0.625px',
        'compress-card':      '-0.25px',
        'compress-body-lg':   '-0.125px',
        'badge':              '0.125px',
      },

      animation: {
        'fade-in':         'fadeIn 0.25s ease-out forwards',
        'slide-up':        'slideUp 0.30s ease-out forwards',
        'slide-in-right':  'slideInRight 0.25s ease-out forwards',
        'slide-out-right': 'slideOutRight 0.20s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%':   { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(24px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
