import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import uglify from 'rollup-plugin-uglify';

const shared = {
  entry: `compiled/formik.js`,
  sourceMap: true,
  external: ['react'],
  globals: {
    react: 'React',
  },
  exports: 'named',
};

export default [
  Object.assign({}, shared, {
    moduleName: 'Formik',
    format: 'umd',
    dest:
      process.env.NODE_ENV === 'production'
        ? './dist/formik.umd.min.js'
        : './dist/formik.umd.js',
    plugins: [
      resolve(),
      replace({
        exclude: 'node_modules/**',
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development'
        ),
      }),
      resolve(),
      commonjs({
        include: /node_modules/,
      }),

      sourceMaps(),
      process.env.NODE_ENV === 'production' && filesize(),
      process.env.NODE_ENV === 'production' && uglify(),
    ],
  }),
  Object.assign({}, shared, {
    moduleName: 'Formik',
    format: 'umd',
    entry: `compiled/next.js`,
    dest:
      process.env.NODE_ENV === 'production'
        ? './dist/next.umd.min.js'
        : './dist/next.umd.js',
    plugins: [
      resolve(),
      replace({
        exclude: 'node_modules/**',
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development'
        ),
      }),
      resolve(),
      commonjs({
        include: /node_modules/,
        namedExports: {
          'node_modules/prop-types/index.js': ['object'],
        },
      }),

      sourceMaps(),
      process.env.NODE_ENV === 'production' && filesize(),
      process.env.NODE_ENV === 'production' && uglify(),
    ],
  }),
  Object.assign({}, shared, {
    targets: [
      { dest: 'dist/formik.es6.js', format: 'es' },
      { dest: 'dist/formik.js', format: 'cjs' },
    ],
    plugins: [
      resolve(),
      commonjs({
        include: /node_modules/,
      }),
      ,
      sourceMaps(),
    ],
  }),
  Object.assign({}, shared, {
    entry: `compiled/next.js`,
    targets: [
      { dest: 'dist/next.es6.js', format: 'es' },
      { dest: 'dist/next.js', format: 'cjs' },
    ],
    plugins: [
      resolve(),
      commonjs({
        include: /node_modules/,
        namedExports: {
          'node_modules/prop-types/index.js': ['object'],
        },
      }),
      ,
      sourceMaps(),
    ],
  }),
];
