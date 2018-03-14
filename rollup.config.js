import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

const shared = {
  input: `compiled/index.js`,
  external: ['react', 'react-native'],
};

export default [
  Object.assign({}, shared, {
    output: {
      name: 'Formik',
      format: 'umd',
      sourcemap: true,
      file:
        process.env.NODE_ENV === 'production'
          ? './dist/formik.umd.min.js'
          : './dist/formik.umd.js',
      exports: 'named',
      globals: {
        react: 'React',
        'react-native': 'ReactNative',
      },
    },

    plugins: [
      resolve(),
      replace({
        exclude: 'node_modules/**',
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development'
        ),
      }),
      commonjs({
        include: /node_modules/,
        namedExports: {
          'node_modules/prop-types/index.js': [
            'object',
            'oneOfType',
            'string',
            'node',
            'func',
            'bool',
            'element',
          ],
        },
      }),
      sourceMaps(),
      process.env.NODE_ENV === 'production' && filesize(),
      process.env.NODE_ENV === 'production' &&
        uglify({
          output: { comments: false },
          compress: {
            keep_infinity: true,
            pure_getters: true,
          },
          warnings: true,
          ecma: 5,
          toplevel: false,
        }),
    ],
  }),

  Object.assign({}, shared, {
    external: shared.external.concat(Object.keys(pkg.dependencies)),
    output: [
      {
        file: 'dist/formik.es6.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/formik.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      sourceMaps(),
    ],
  }),
];
