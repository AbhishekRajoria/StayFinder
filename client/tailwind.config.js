/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.5rem', md: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        // shadcn semantic — mapped to warm-editorial palette via :root vars
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Editorial palette — direct named tokens
        cream:       '#FAF7F2',
        bone:        '#F2EDE5',
        linen:       '#E8E0D3',
        ink:         '#1F1B16',
        ink2:        '#48413A',
        ink3:        '#8A8074',
        terracotta:  '#C0623F',
        terracotta2: '#9E4F33',
        ochre:       '#D4A24C',
        forest:      '#3E5641',
        rose:        '#E8C8B8',
        success:     '#3E5641',
        danger:      '#A53D2A',
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Fluid editorial scale (clamp-based)
        'eyebrow':    ['11px', { lineHeight: '1.4', letterSpacing: '0.18em' }],
        'display-xl': ['clamp(48px, 8vw, 88px)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(36px, 5vw, 56px)', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        'display':    ['clamp(28px, 4vw, 40px)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        md: '2px',
        lg: '4px',
        xl: '6px',
        full: '9999px',
      },
      boxShadow: {
        editorial: '0 24px 60px -20px rgba(31,27,22,0.18)',
        card: '0 1px 0 0 rgba(31,27,22,0.06)',
      },
      spacing: {
        '12': '3rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '28': '7rem',
      },
      keyframes: {
        'accordion-down': { from: { height: 0 }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: 0 } },
        kenburns: {
          '0%':   { transform: 'scale(1) translate(0,0)' },
          '100%': { transform: 'scale(1.08) translate(-1%, -1%)' },
        },
        'fade-up': {
          '0%':   { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: 0.55 },
          '50%':      { opacity: 1 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        kenburns:    'kenburns 30s ease-in-out infinite alternate',
        'fade-up':   'fade-up 0.6s cubic-bezier(0.25,0.1,0.25,1) both',
        'soft-pulse':'soft-pulse 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
