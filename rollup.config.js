import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';

export default [
  {
    entry: `compiled/formik.js`,
    targets: [
      { dest: 'dist/formik.es6.js', format: 'es' },
      { dest: 'dist/formik.js', format: 'cjs' },
    ],
    sourceMap: true,
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: ['react', 'prop-types'],
    globals: {
      react: 'React',
      'prop-types': 'PropTypes',
    },
    exports: 'named',
    plugins: [
      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      // https://github.com/rollup/rollup-plugin-node-resolve#usage
      resolve(),
      // Resolve source maps to the original source
      sourceMaps(),
    ],
  },
  {
    entry: `compiled/next.js`,
    targets: [
      { dest: 'dist/next.es6.js', format: 'es' },
      { dest: 'dist/next.js', format: 'cjs' },
    ],
    sourceMap: true,
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: ['react', 'prop-types'],
    globals: {
      react: 'React',
      'prop-types': 'PropTypes',
    },
    exports: 'named',
    plugins: [
      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      // https://github.com/rollup/rollup-plugin-node-resolve#usage
      resolve(),
      // Resolve source maps to the original source
      sourceMaps(),
    ],
  },
];
