const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        use: [{ loader: 'ts-loader' }],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  output: {
    path: path.join(process.cwd(), 'umd'),
    library: 'Formik',
    libraryTarget: 'umd',
    filename: 'index.min.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'test'),
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ],
};
