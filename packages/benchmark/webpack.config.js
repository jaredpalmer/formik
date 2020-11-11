module.exports = {
  entry: './suites/index.js',
  output: 'build/index.js',
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, use: ['babel-loader'] }],
  },
};
