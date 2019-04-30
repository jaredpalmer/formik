const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

module.exports = (storybookBaseConfig, configType, defaultConfig) => {
  defaultConfig.devtool = 'inline-source-map';
  defaultConfig.module.rules.push({
    test: /\.tsx?$/,
    loader: 'awesome-typescript-loader',
    options: {
      configFileName: 'tsconfig.storybook.json',
    },
  });
  defaultConfig.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx'];
  defaultConfig.resolve.plugins = [new TsConfigPathsPlugin({})];

  return defaultConfig;
};
