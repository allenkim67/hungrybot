var webpack = require('webpack');

var prod = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/client/client.js',
  output: {
    filename: prod ? './static/js/bundle.min.js' : './static/js/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['react']
        }
      }
    ]
  },
  plugins: prod ? [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ] : []
};