const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  handler: function ({ addComponents, theme }) {
    const typography = {
      h1: {
        fontSize: theme('fontSize.4xl'),
        fontWeight: theme('fontWeight.bold'),
        color: theme('colors.gray.900'),
        lineHeight: theme('lineHeight.none'),
      },
      'h1 + *': {
        marginTop: theme('spacing.8'),
      },
      h2: {
        fontSize: theme('fontSize.2xl'),
        fontWeight: theme('fontWeight.bold'),
        color: theme('colors.gray.900'),
        lineHeight: theme('lineHeight.tight'),
      },
      '* + a > h2': {
        marginTop: theme('spacing.8'),
      },
      'a > h2 + *': {
        marginTop: theme('spacing.4'),
      },
      '* + h2': {
        marginTop: theme('spacing.8'),
      },
      'h2 + *': {
        marginTop: theme('spacing.4'),
      },
      h3: {
        fontSize: theme('fontSize.xl'),
        fontWeight: theme('fontWeight.bold'),
        color: theme('colors.gray.900'),
        lineHeight: theme('lineHeight.tight'),
      },
      '* + h3': {
        marginTop: theme('spacing.6'),
      },
      'h2 + h3': {
        marginTop: theme('spacing.4'),
      },
      'h3 + *': {
        marginTop: theme('spacing.2'),
      },
      '* + a > h3': {
        marginTop: theme('spacing.6'),
      },
      'h2 + a > h3': {
        marginTop: theme('spacing.4'),
      },
      'a > h3 + *': {
        marginTop: theme('spacing.2'),
      },
      h4: {
        fontSize: theme('fontSize.base'),
        fontWeight: theme('fontWeight.bold'),
        color: theme('colors.gray.900'),
        lineHeight: theme('lineHeight.normal'),
      },
      '* + h4': {
        marginTop: theme('spacing.6'),
      },
      'h3 + h4': {
        marginTop: theme('spacing.2'),
      },
      'h4 + *': {
        marginTop: theme('spacing.2'),
      },
      '* + a > h4': {
        marginTop: theme('spacing.6'),
      },
      'h3 + a > h4': {
        marginTop: theme('spacing.2'),
      },
      'a > h4 + *': {
        marginTop: theme('spacing.2'),
      },
      p: {
        fontSize: theme('fontSize.base'),
        fontWeight: theme('fontWeight.normal'),
        color: theme('colors.gray.800'),
        lineHeight: theme('lineHeight.relaxed'),
      },
      'a + p': {
        marginTop: theme('spacing.4'),
      },
      'p + p': {
        marginTop: theme('spacing.4'),
      },
      strong: {
        fontWeight: theme('fontWeight.bold'),
        color: theme('colors.gray.900'),
      },
      a: {
        fontWeight: theme('fontWeight.medium'),
        color: theme('colors.blue.600'),
      },
      'a:hover': {
        textDecoration: 'underline',
      },
      'code:not([class])': {
        backgroundColor: theme('colors.gray.100'),
        fontSize: '.875em', // Use `em` so change is relative to current font size
        paddingLeft: theme('spacing.1'),
        paddingRight: theme('spacing.1'),
        marginLeft: '2px',
        marginRight: '2px',
        paddingTop: '2px',
        paddingBottom: '2px',
        wordBreak: 'keep-all',
        borderWidth: '1px',
        borderRadius: theme('borderRadius.md'),
        borderColor: theme('colors.gray.300'),
        color: theme('colors.gray.900'),
      },
      img: {
        marginTop: theme('spacing.8'),
        marginBottom: theme('spacing.8'),
      },
      ol: {
        listStyleType: 'decimal',
        paddingLeft: theme('spacing.5'),
      },
      '* + ol': {
        marginTop: theme('spacing.4'),
      },
      'ol + *': {
        marginTop: theme('spacing.4'),
      },
      'li ol': {
        marginTop: theme('spacing.2'),
      },
      ul: {
        listStyleType: 'disc',
        paddingLeft: theme('spacing.5'),
      },
      '* + ul': {
        marginTop: theme('spacing.4'),
      },
      'ul + *': {
        marginTop: theme('spacing.4'),
      },
      'li ul': {
        marginTop: theme('spacing.2'),
      },
      li: {
        fontSize: theme('fontSize.base'),
        fontWeight: theme('fontWeight.normal'),
        color: theme('colors.gray.800'),
        lineHeight: theme('lineHeight.relaxed'),
      },
      'li + li': {
        marginTop: theme('spacing.2'),
      },
      'li p': {
        marginTop: theme('spacing.4'),
      },
      'li p + p': {
        marginTop: theme('spacing.2'),
      },
      'li:first-child p:first-child': {
        marginTop: theme('spacing.2'),
      },
      blockquote: {
        fontStyle: 'italic',
        borderLeftWidth: theme('borderWidth.4'),
        borderLeftStyle: 'solid',
        borderLeftColor: theme('colors.gray.300'),
        paddingLeft: theme('spacing.4'),
      },
      '* + blockquote': {
        marginTop: theme('spacing.4'),
      },
      'blockquote + *': {
        marginTop: theme('spacing.4'),
      },
      pre: {
        backgroundColor: '#292D3E',
        paddingTop: theme('spacing.3'),
        paddingRight: theme('spacing.4'),
        paddingBottom: theme('spacing.3'),
        paddingLeft: theme('spacing.4'),
        borderRadius: theme('borderRadius.lg'),
        maxWidth: 740,
        overflowX: 'scroll',
      },
      '* + pre': {
        marginTop: theme('spacing.4'),
      },
      'pre + *': {
        marginTop: theme('spacing.4'),
      },
      'pre code': {
        backgroundColor: 'transparent',
        fontSize: theme('fontSize.sm'),
        padding: 0,
      },
    };
    addComponents({
      '.rich-text': typography,
    });
  },
};
