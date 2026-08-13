/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: 'var(--forest)',
        scholar: 'var(--scholar)',
        sage: 'var(--sage)',
        paper: 'var(--paper)',
        parchment: 'var(--parchment)',
        terracotta: 'var(--terracotta)',
        gold: 'var(--gold)',
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--muted)',
        },
        background: 'var(--paper)',
        foreground: 'var(--ink)',
        primary: {
          DEFAULT: 'var(--scholar)',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: 'var(--parchment)',
          foreground: 'var(--ink)',
        },
        accent: {
          DEFAULT: 'var(--terracotta)',
          foreground: '#FFFFFF',
        },
        status: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          error: 'var(--error)',
        },
        border: 'rgba(24, 26, 25, 0.1)',
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'float': 'var(--shadow-float)',
        'deep': 'var(--shadow-deep)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
    },
  },
  plugins: [],
}


