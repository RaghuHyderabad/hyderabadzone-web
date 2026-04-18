/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1F3C88',
          light:   '#2C5AA0',
          dark:    '#162B63',
        },
        cta: {
          start: '#FF7A18',
          end:   '#FF4E00',
        },
        wa: '#25D366',
        surface: '#F4F7FB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(31,60,136,0.08)',
        'card-hover': '0 8px 32px rgba(31,60,136,0.14)',
      },
      backgroundImage: {
        'cta-gradient': 'linear-gradient(135deg, #FF7A18, #FF4E00)',
        'brand-gradient': 'linear-gradient(135deg, #1F3C88, #2C5AA0)',
      },
    },
  },
  plugins: [],
}
