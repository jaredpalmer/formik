//
// Use Next Loaders on Linked Packages
// https://github.com/vercel/next.js/pull/13542#issuecomment-679085557
//
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  webpack: (config, { defaultLoaders, webpack }) => {
    if (config.mode === 'development') {
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
      config.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: process.env.NODE_ENV === 'development',
        })
      );
    } else {
      // Remove TSConfigPath aliases.
      // We should use a tool which supports tsconfig.build.json
      config.resolve.plugins = config.resolve.plugins.filter(
        plugin => plugin.constructor.name !== 'JsConfigPathsPlugin'
      );
    }

    return config;
  },

  onDemandEntries: {
    // Make sure entries are not getting disposed.
    maxInactiveAge: 1000 * 60 * 60,
  },

  // we don't need to break on TS errors since app/ is not production code.
  // in development we alias /app -> /packages/formik/src via TSConfig.paths
  // then during build we remove the JsConfigPathsPlugin to remove that alias
  // but there is no way to remove the link with Next + TypeScript, like using tsconfig.build.json
  typescript: { ignoreBuildErrors: true }
};
