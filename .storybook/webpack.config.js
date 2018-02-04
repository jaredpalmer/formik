const autoprefixer = require('autoprefixer')

const postCSSLoaderOptions = {
  ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
  plugins: () => [
    require('postcss-flexbugs-fixes'),
    autoprefixer({
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9', // React doesn't support IE8 anyway
      ],
      flexbox: 'no-2009',
    }),
  ],
}

module.exports = {

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'awesome-typescript-loader',
      },
      {
        test: /\.s?css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('postcss-loader'),
            options: postCSSLoaderOptions,
          },
          require.resolve('sass-loader'),
        ],
      },
    ]
  }
};