/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF6B1A',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        maroon: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#8B1A1A',
          600: '#7a1515',
          700: '#6b1010',
          800: '#5c0b0b',
          900: '#450808',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#C9A227',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        spice: {
          cream: '#FFF8F0',
          light: '#F5E6D3',
          warm: '#E8C99A',
          dark: '#2C1810',
          deep: '#1A0A00',
        }
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Poppins', 'sans-serif'],
        accent: ['Dancing Script', 'cursive'],
      },
      backgroundImage: {
        'mandala': "url('/assets/images/mandala-pattern.svg')",
        'spice-gradient': 'linear-gradient(135deg, #FF6B1A 0%, #8B1A1A 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C9A227 0%, #FFD700 50%, #C9A227 100%)',
        'hero-gradient': 'linear-gradient(to bottom right, #1A0A00 0%, #3D1A00 50%, #8B1A1A 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'bounce-soft': 'bounce-soft 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 26, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 26, 0.8)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'glow-saffron': '0 0 30px rgba(255, 107, 26, 0.5)',
        'glow-gold': '0 0 30px rgba(201, 162, 39, 0.5)',
        'card': '0 4px 24px rgba(26, 10, 0, 0.12)',
        'card-hover': '0 12px 40px rgba(26, 10, 0, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
