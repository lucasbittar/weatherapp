/**
 * Project Name: Weather App | Webpack Config
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */

var path = require('path');

var config = {
  context: path.resolve(__dirname + '/app'),
  entry: './scripts/main.js',
  output: {
    path: path.resolve(__dirname + '/public'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: 'url-loader?limit=10000!img-loader?progressive=true'
      }
    ]
  }
}

module.exports = config;
