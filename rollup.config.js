import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

const input = './compiled/index.js';

const getUMDConfig = ({ env }) => ({
  input,
  external: ['react', 'react-native'],
  output: {
    name: 'Formik',
    format: 'umd',
    sourcemap: true,
    file:
      env === 'production'
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
      'process.env.NODE_ENV': JSON.stringify(env),
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
    env === 'production' && filesize(),
    env === 'production' &&
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
});

export default [
  getUMDConfig({ env: 'production' }),

  getUMDConfig({ env: 'development' }),

  {
    input,
    external: id => !id.startsWith('.') && !id.startsWith('/'),
    output: [
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      sourceMaps(),
      filesize(),
    ],
  },
];
