/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-paper-white)',
        foreground: 'var(--color-ink)',
        brand: {
          navy: 'var(--color-brand-navy)',
          blue: 'var(--color-brand-blue)',
          'soft-blue': 'var(--color-brand-soft-blue)',
          mist: 'var(--color-surface-mist)',
          paper: 'var(--color-paper-white)',
          cream: 'var(--color-warm-cream)',
          peach: 'var(--color-soft-peach)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          body: 'var(--color-ink-body)',
        },
        surface: {
          DEFAULT: 'var(--color-paper-white)',
          mist: 'var(--color-surface-mist)',
          navy: 'var(--color-brand-navy)',
          cream: 'var(--color-warm-cream)',
        },
        primary: {
          DEFAULT: 'var(--color-brand-blue)',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: 'var(--color-surface-mist)',
          foreground: 'var(--color-ink)',
        },
        muted: {
          DEFAULT: 'var(--color-surface-mist)',
          foreground: 'var(--color-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-warm-cream)',
          foreground: 'var(--color-ink)',
        },
        status: {
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          error: 'var(--color-error)',
        },
        border: 'var(--border-default)',
        input: 'var(--color-surface-mist)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Instrument Serif', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'token-soft': 'var(--shadow-soft)',
        'token-card': 'var(--shadow-card)',
        'token-floating': 'var(--shadow-floating)',
      },
      borderRadius: {
        'token-sm': 'var(--radius-sm)',
        'token-control': 'var(--radius-control)',
        'token-card': 'var(--radius-card)',
        'token-feature': 'var(--radius-feature)',
        'token-hero': 'var(--radius-hero)',
      },
    },
  },
  plugins: [],
}

