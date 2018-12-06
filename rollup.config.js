import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import pkg from './package.json';

const input = './compiled/index.js';
const external = id => !id.startsWith('.') && !id.startsWith('/');
const replacements = [{ original: 'lodash', replacement: 'lodash-es' }];
const babelOptions = {
  exclude: /node_modules/,
  plugins: [
    'annotate-pure-calls',
    'dev-expression',
    ['transform-rename-import', { replacements }],
  ],
};

const buildUmd = ({ env }) => ({
  input,
  external: ['react', 'react-native'],
  output: {
    name: 'Formik',
    format: 'umd',
    sourcemap: true,
    file:
      env === 'production'
        ? `./dist/formik.umd.${env}.js`
        : `./dist/formik.umd.${env}.js`,
    exports: 'named',
    globals: {
      react: 'React',
      'react-native': 'ReactNative',
    },
  },

  plugins: [
    resolve(),
    babel(babelOptions),
    replace({
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
    sizeSnapshot(),
    env === 'production' &&
      uglify({
        output: { comments: false },
        compress: {
          keep_infinity: true,
          pure_getters: true,
        },
        warnings: true,
        toplevel: false,
      }),
  ],
});

const buildCjs = ({ env }) => ({
  input,
  external,
  output: {
    file: `./dist/${pkg.name}.cjs.${env}.js`,
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    sourceMaps(),
    sizeSnapshot(),
  ],
});

export default [
  buildUmd({ env: 'production' }),
  buildUmd({ env: 'development' }),
  buildCjs({ env: 'production' }),
  buildCjs({ env: 'development' }),
  {
    input,
    external,
    output: [
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [resolve(), babel(babelOptions), sizeSnapshot(), sourceMaps()],
  },
];
