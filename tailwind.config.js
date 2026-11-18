/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 24px 60px -28px rgba(88, 28, 135, 0.28)',
        card: '0 16px 40px -24px rgba(76, 29, 149, 0.32)',
      },
    },
  },
  plugins: [],
};
