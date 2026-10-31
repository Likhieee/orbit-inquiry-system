/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: { DEFAULT: '#0B1B3A', 700: '#1D2F55', 600: '#33466B', 500: '#4A5B7D', 300: '#98A4BF', 200: '#CBD3E6', 100: '#E4E9F5' },
        signal: { DEFAULT: '#2F5BFF', 600: '#2347D6', 100: '#DCE4FF', 50: '#EEF2FF' },
        ultra: '#5B4DF0',
        aqua: '#19D3C5',
        sun: '#FFB938',
        mist: '#F4F7FF',
      },
      boxShadow: {
        glow: '0 12px 36px -12px rgba(47,91,255,.55)',
        lift: '0 1px 2px rgba(11,27,58,.06), 0 12px 32px -16px rgba(11,27,58,.28)',
      },
      keyframes: {
        spin360: { to: { transform: 'rotate(360deg)' } },
        pulseRing: { '0%': { transform: 'scale(.6)', opacity: '.55' }, '100%': { transform: 'scale(1.5)', opacity: '0' } },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(4%,-6%,0) scale(1.12)' },
        },
        shimmer: { to: { backgroundPosition: '-200% 0' } },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-6px)' },
          '40%,80%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        'spin-slow': 'spin360 60s linear infinite',
        'spin-slower': 'spin360 90s linear infinite',
        'counter-slow': 'spin360 60s linear infinite reverse',
        'counter-slower': 'spin360 90s linear infinite reverse',
        'pulse-ring': 'pulseRing 3.2s ease-out infinite',
        drift: 'drift 18s ease-in-out infinite',
        shimmer: 'shimmer 1.4s linear infinite',
        shake: 'shake .4s ease-in-out',
      },
    },
  },
  plugins: [],
};
