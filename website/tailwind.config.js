// tailwind.config.js

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.ts', './src/**/*.tsx'],
  theme: {
    colors: {
      ...defaultTheme.colors,
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1400px',
      betterhover: { raw: '(hover: hover)' },
    },
    rotate: {
      ...defaultTheme.rotate,
      '-30': '-30deg',
    },
    container: {
      padding: '1rem',
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/forms')],
};
