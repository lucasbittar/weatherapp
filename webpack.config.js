/**
 * Project Name: Weather App | Webpack Config
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */

var webpack = require('webpack');

var config = {
  context: __dirname + '/app',
  entry: './scripts/main.js',
  output: {
    path: __dirname + '/public',
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(jpg?g|png|gif|svg)$/i,
        use: 'url-loader?limit=10000!img-loader?progressive=true'
      }
    ]
  }
}

module.exports = config;
