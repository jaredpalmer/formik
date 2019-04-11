const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

module.exports = (storybookBaseConfig, configType, defaultConfig) => {


  defaultConfig.module.rules.push(
    {
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader',
      options: {
        configFileName: 'storybook.tsconfig.json'
      }
    },
  )
  defaultConfig.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx']
  defaultConfig.resolve.plugins = [
    new TsConfigPathsPlugin({
      tsconfig: 'tsconfig.json',
      compiler: 'typescript'
    })
  ]

  return defaultConfig

}