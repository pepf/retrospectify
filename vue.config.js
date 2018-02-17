const webpack = require('webpack');
const { version } = require('./package.json')

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'VERSION': JSON.stringify(version),
      })
    ]
  }
}
