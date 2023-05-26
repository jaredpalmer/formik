// tailwind.config.js

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.ts', './src/**/*.tsx'],
  theme: {
    extends: {
      colors: {
        ...defaultTheme.colors,
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1400px',
      },
      rotate: {
        ...defaultTheme.rotate,
        '-30': '-30deg',
      },
      container: {
        padding: '1rem',
      },
    },
  },

  plugins: [require('@tailwindcss/forms')],
};
