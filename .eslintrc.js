module.exports = {
  'extends': [
    'airbnb',
  ],
  'settings': {
    'import/resolver': {
      'babel-module': {}
    },
    'flowtype': {
      'onlyFilesWithFlowAnnotation': false
    },
  },
  'globals': {
    'jest': true,
    'expect': true,
    'test': true,
    'describe': true,
    'Raven': true,
    'algoliasearch': true,
  },
  'env': {
    'browser': true,
    'node': true,
    'jasmine': true
  },
  'plugins': [
    'import',
    'react',
  ],
  'rules': {
    'import/no-extraneous-dependencies': [0],
    // 'import/no-extraneous-dependencies': ['error', { 'devDependencies': ['**/*.test.js', '**/*.stories.js'] }],
    'import/first': [0],
    'import/no-unresolved': [
      'error',
      {
        'ignore': ['src/', 'admin/', '.storybook/']
      }
    ],
    'no-loop-func': [0],
    'no-case-declarations': [0],
    'import/extensions': [0],
    'eqeqeq': [0],
    'jsx-a11y/no-static-element-interactions': [0],
    'no-script-url': [0],
    'jsx-a11y/iframe-has-title': [0],
    'react/no-children-prop': [0],
    'object-curly-newline': ['error', { minProperties: 1 }],
    'jsx-a11y/label-has-for': [0],
    'array-callback-return': [0],
    'no-plusplus': [0],
    'jsx-a11y/alt-text': [0],
    'jsx-a11y/anchor-is-valid': ['error', {
      'components': ['Link'],
      'specialLink': ['to', 'hrefLeft', 'hrefRight'],
      'aspects': ['noHref', 'invalidHref', 'preferButton']
    }],
    'semi': [0],
    'react/jsx-curly-brace-presence': [2, { 'props': 'never', 'children': 'ignore' }],
    'react/sort-comp': [0],
    'no-console': [0],
    'react/no-unused-prop-types': [0],
    'no-underscore-dangle': [0],
    'func-names': [0],
    'no-param-reassign': [0],
    'object-shorthand': [0],
    'import/no-named-as-default-member': [0],
    'no-use-before-define': [0],
    'no-shadow': [0],
    'consistent-return': [0],
    'react/prop-types': [0],
    'no-return-assign': [0],
    'arrow-body-style': [0],
    'react/require-default-props': [0],
    'react/no-array-index-key': [0],
    'react/prefer-stateless-function': [0],
    'import/prefer-default-export': [0],
    'import/no-named-as-default': [0],
    'global-require': [0],
    'camelcase': [0],
    'react/no-danger': [0],
    'react/no-multi-comp': [0],
    'react/jsx-filename-extension': [
      1,
      {
        'extensions': [
          '.js',
          '.jsx'
        ]
      }
    ],
    'react/forbid-prop-types': [
      0
    ]
  }
}