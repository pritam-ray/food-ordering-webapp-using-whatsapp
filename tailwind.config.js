
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#033636',
          light: '#0D4D4D',
          dark: '#022424',
        },
        secondary: {
          DEFAULT: '#D4AF37',
          light: '#E6C458',
          dark: '#BF9B2F',
        },
        neutral: {
          bg: '#F8F9FA',
          card: '#FFFFFF',
        }
      },
      boxShadow: {
        'elegant': '0 10px 30px -15px rgba(0, 0, 0, 0.15)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'button': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}