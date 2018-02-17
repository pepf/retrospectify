const webpack = require('webpack');
const { version } = require('./package.json')

module.exports = {
  baseUrl: '/retrospective/',

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'VERSION': JSON.stringify(version),
      })
    ]
  }
}
