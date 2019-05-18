const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

module.exports = async ({ config, mode }) => {
  config.module.rules.push({
    test: /\.tsx?$/,
    loader: 'awesome-typescript-loader',
    options: {
      configFileName: 'tsconfig.storybook.json',
    },
  });
  config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx'];
  config.resolve.plugins = [new TsConfigPathsPlugin({})];

  return config;
};
