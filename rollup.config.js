import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';

import uglify from 'rollup-plugin-uglify';

const shared = {
  input: `compiled/formik.js`,
  external: ['react', 'react-native'],
};

const prod = process.env.NODE_ENV === 'production';

export default [
  Object.assign({}, shared, {
    output: {
      name: 'Formik',
      format: 'umd',
      sourcemap: true,
      file: prod ? './dist/formik.umd.min.js' : './dist/formik.umd.js',
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
      }),

      prod && filesize(),
      prod &&
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
    output: [
      {
        file: 'dist/formik.es6.js',
        format: 'es',
        sourcemap: true,
        exports: 'named',
        globals: {
          react: 'React',
          'react-native': 'ReactNative',
        },
      },
      {
        file: 'dist/formik.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        globals: {
          react: 'React',
          'react-native': 'ReactNative',
        },
      },
    ],
    plugins: [
      resolve(),
      commonjs({
        include: /node_modules/,
      }),
    ],
  }),
];
