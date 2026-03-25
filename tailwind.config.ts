import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette derived from #56C1FF
        // Overrides Tailwind's built-in sky and teal so every sky-* / teal-* class uses the brand color.
        sky: {
          50:  '#eef9ff',
          100: '#d8f1ff',
          200: '#b3e4ff',
          300: '#84d4ff',
          400: '#6bcaff',
          500: '#56C1FF',
          600: '#20a3f0',
          700: '#0f7dbd',
          800: '#0b5784',
          900: '#073855',
        },
        teal: {
          50:  '#eef9ff',
          100: '#d8f1ff',
          200: '#b3e4ff',
          300: '#84d4ff',
          400: '#6bcaff',
          500: '#56C1FF',
          600: '#20a3f0',
          700: '#0f7dbd',
          800: '#0b5784',
          900: '#073855',
        },
        primary: {
          50:  '#eef9ff',
          100: '#d8f1ff',
          200: '#b3e4ff',
          400: '#6bcaff',
          500: '#56C1FF',
          600: '#20a3f0',
          700: '#0f7dbd',
        },
        warm: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-heart': 'pulseHeart 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseHeart: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
