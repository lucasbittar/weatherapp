/**
 * Project Name: Weather App | Webpack Config
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */

var TerserPlugin = require('terser-webpack-plugin');
var config = require('./webpack.config');

config.output.filename = 'app.js';

config.optimization = {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {},
      },
    }),
  ],
};

module.exports = config;
