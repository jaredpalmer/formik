//
// Use Next Loaders on Linked Packages
// https://github.com/vercel/next.js/pull/13542#issuecomment-679085557
//
const path = require('path');

module.exports = {
  webpack: (config, { defaultLoaders, webpack }) => {
    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.(tsx|ts|js|mjs|jsx)$/,
        include: [path.resolve(config.context, '../')],
        use: defaultLoaders.babel,
        exclude: excludePath => {
          return /node_modules/.test(excludePath);
        },
      },
    ];

    // tsdx uses __DEV__
    config.plugins.push(new webpack.DefinePlugin({
        __DEV__: process.env.NODE_ENV === "development"
    }));

    // there can only be one
    config.resolve.alias['react'] = path.resolve(config.context, '../node_modules/react');

    return config;
  },

  onDemandEntries: {
    // Make sure entries are not getting disposed.
    maxInactiveAge: 1000 * 60 * 60,
  },
};
