/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#070A12',
        surface: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.08)',
        sky: '#38BDF8',
        'sky-dim': '#0EA5E9',
        accent: '#818CF8',
        ink: '#F0F4FA',
        muted: '#7A8599',
      },
      fontFamily: {
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 40px rgba(0,0,0,0.55)',
        glow: '0 0 0 1px rgba(56,189,248,0.35), 0 0 24px rgba(56,189,248,0.18)',
        'glow-lg': '0 0 0 1px rgba(56,189,248,0.4), 0 0 40px rgba(56,189,248,0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        pulseNode: {
          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
          '50%': { opacity: 0.95, transform: 'scale(1.45)' },
        },
        drawLine: {
          '0%': { strokeDashoffset: 400 },
          '100%': { strokeDashoffset: 0 },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '50%': { transform: 'translate(5px, -7px)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        pulseNode: 'pulseNode 3.2s ease-in-out infinite',
        drawLine: 'drawLine 3.5s ease forwards',
        drift: 'drift 9s ease-in-out infinite',
        slideUp: 'slideUp 0.25s ease forwards',
        slideLeft: 'slideLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeIn: 'fadeIn 0.2s ease forwards',
      },
    },
  },
  plugins: [],
}
