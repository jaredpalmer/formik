const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

module.exports = (storybookBaseConfig, configType, defaultConfig) => {


  defaultConfig.module.rules.push(
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      loader: 'awesome-typescript-loader',
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