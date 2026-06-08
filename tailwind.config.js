/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
        body: ['"Crimson Text"', 'Georgia', 'serif'],
      },
      colors: {
        quest: {
          // CSS variable–backed colors (supports Tailwind opacity modifiers like /20, /50)
          bg:           'rgb(var(--nq-bg) / <alpha-value>)',
          panel:        'rgb(var(--nq-panel) / <alpha-value>)',
          border:       'rgb(var(--nq-border) / <alpha-value>)',
          gold:         'rgb(var(--nq-gold) / <alpha-value>)',
          'gold-dim':   'rgb(var(--nq-gold-dim) / <alpha-value>)',
          purple:       'rgb(var(--nq-purple) / <alpha-value>)',
          'purple-glow':'rgb(var(--nq-purple-glow) / <alpha-value>)',
          // Static semantic colors (don't need light/dark variants)
          red:    '#ef4444',
          green:  '#22c55e',
          blue:   '#3b82f6',
          orange: '#f97316',
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'flicker':    'flicker 4s linear infinite',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'shimmer':    'shimmer 2s linear infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.8), 0 0 80px rgba(124, 58, 237, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.7' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
