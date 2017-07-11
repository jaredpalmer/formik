import filesize from 'rollup-plugin-filesize';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import uglify from 'rollup-plugin-uglify';

const pkg = require('./package.json');
const camelCase = require('lodash.camelcase');

const libraryName = 'formik';

export default {
  entry: `compiled/${libraryName}.js`,
  moduleName: 'Formik',
  format: 'umd',
  dest: process.env.NODE_ENV === 'production' ? './dist/formik.umd.min.js' : './dist/formik.umd.js',
  sourceMap: true,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['react'],
  globals: {
    react: 'React',
  },
  exports: 'named',
  plugins: [
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    replace({
      exclude: 'node_modules/**',
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    // Resolve source maps to the original source
    sourceMaps(),
    filesize(),
    process.env.NODE_ENV === 'production' && uglify(),
  ],
};
