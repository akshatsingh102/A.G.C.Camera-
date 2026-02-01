/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      colors: {
        camera: {
          dark: '#0a0a0a',
          darker: '#050505',
          accent: '#00d4aa',
          accentDim: '#00a885',
          overlay: 'rgba(0,0,0,0.5)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shutter': 'shutter 0.15s ease-out',
      },
      keyframes: {
        shutter: {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
