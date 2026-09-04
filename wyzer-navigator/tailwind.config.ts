import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'hsl(var(--ch-accent) / <alpha-value>)',
          dim: 'hsl(var(--ch-accent-ink) / <alpha-value>)',
        },
        canvas: 'hsl(var(--ch-page) / <alpha-value>)',
        surface: {
          DEFAULT: 'hsl(var(--ch-surface) / <alpha-value>)',
          raised: 'hsl(var(--ch-raised) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'hsl(var(--ch-border) / <alpha-value>)',
          subtle: 'hsl(var(--ch-border-subtle) / <alpha-value>)',
        },
        ink: {
          primary: 'hsl(var(--ch-ink) / <alpha-value>)',
          secondary: 'hsl(var(--ch-body) / <alpha-value>)',
          muted: 'hsl(var(--ch-muted) / <alpha-value>)',
          dim: 'hsl(var(--ch-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      maxWidth: {
        content: '72rem',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
