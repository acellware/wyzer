import type { Config } from 'tailwindcss';

const config: Config = {
 content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
 theme: {
  extend: {
   colors: {
    // Brand
    brand: {
     DEFAULT: '#5468FF',
     dim: '#3D51CC',
     bright: '#6E7FFF',
    },
    // Canvas / surfaces
    canvas: '#050B17',
    surface: {
     DEFAULT: '#0C1526',
     raised: '#111E35',
     hover: '#15243E',
    },
    // Borders
    line: {
     DEFAULT: '#1B2B42',
     subtle: '#0F1D30',
     hover: '#243852',
    },
    // Text hierarchy
    ink: {
     primary: '#E8EEFF',
     secondary: '#A8BDD4',
     muted: '#7B92B8',
     dim: '#4D6A8F',
    },
    // Semantic
    ok: {
     DEFAULT: '#22C55E',
     dim: 'rgba(34, 197, 94, 0.12)',
    },
    warn: {
     DEFAULT: '#EAB308',
     dim: 'rgba(234, 179, 8, 0.12)',
    },
    danger: {
     DEFAULT: '#EF4444',
     dim: 'rgba(239, 68, 68, 0.08)',
    },
   },
   fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
   },
   fontSize: {
    '2xs': ['0.625rem', { lineHeight: '1rem' }],
   },
   backgroundImage: {
    'grid-dark':
     'linear-gradient(rgba(27, 43, 66, 0.5) 1px, transparent 1px), linear-gradient(to right, rgba(27, 43, 66, 0.5) 1px, transparent 1px)',
    'brand-gradient': 'linear-gradient(135deg, #5468FF 0%, #8B5CF6 100%)',
   },
   backgroundSize: {
    grid: '48px 48px',
   },
   keyframes: {
    fadeUp: {
     '0%': { opacity: '0', transform: 'translateY(16px)' },
     '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    fadeIn: {
     from: { opacity: '0' },
     to: { opacity: '1' },
    },
    marquee: {
     '0%': { transform: 'translateX(0%)' },
     '100%': { transform: 'translateX(-50%)' },
    },
    shimmer: {
     '0%': { backgroundPosition: '-400% center' },
     '100%': { backgroundPosition: '400% center' },
    },
    pulseGlow: {
     '0%, 100%': { boxShadow: '0 0 20px rgba(84, 104, 255, 0.3)' },
     '50%': { boxShadow: '0 0 40px rgba(84, 104, 255, 0.6)' },
    },
   },
   animation: {
    fadeUp: 'fadeUp 0.55s ease-out both',
    fadeIn: 'fadeIn 0.4s ease-out both',
    marquee: 'marquee 28s linear infinite',
    shimmer: 'shimmer 3s linear infinite',
    pulseGlow: 'pulseGlow 3s ease-in-out infinite',
   },
   boxShadow: {
    brand: '0 0 30px rgba(84, 104, 255, 0.35)',
    'brand-lg':
     '0 0 60px rgba(84, 104, 255, 0.3), 0 0 20px rgba(84, 104, 255, 0.2)',
    card: '0 4px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(27, 43, 66, 0.8)',
    'card-hover':
     '0 8px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(84, 104, 255, 0.2)',
   },
  },
 },
 plugins: [],
};

export default config;
