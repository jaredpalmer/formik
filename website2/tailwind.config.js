// tailwind.config.js

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  corePlugins: {
    preflight: true,
    float: false,
  },
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
      serif: ['Inter', ...defaultTheme.fontFamily.serif],
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
    customForms: (theme) => ({
      // dark: {
      //   'input, textarea, multiselect, checkbox, radio': {
      //     backgroundColor: theme('colors.gray.900'),
      //   },
      //   select: {
      //     backgroundColor: theme('colors.gray.600'),
      //   },
      // },
      sm: {
        'input, textarea, multiselect, select': {
          fontSize: theme('fontSize.sm'),
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
        },
        select: {
          paddingRight: `${theme('spacing.4')}`,
        },
        'checkbox, radio': {
          width: theme('spacing.3'),
          height: theme('spacing.3'),
        },
      },
    }),
  },
  variants: {},
  extend: {
    colors: {
      code: {
        green: 'var(--color-code-green)',
        yellow: 'var(--color-code-yellow)',
        purple: 'var(--color-code-purple)',
        red: 'var(--color-code-red)',
        blue: 'var(--color-code-blue)',
        white: 'var(--color-code-white)',
      },
      'green-150': '#e6ffee',
    },
  },
  plugins: [
    require('@tailwindcss/ui'),
    require('./src/styles/tailwind-typography'),
  ],
};
