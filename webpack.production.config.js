/**
 * Project Name: Weather App | Webpack Config
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */

var UglifyJsPlugin = require('uglify-js-plugin');

var config = require('./webpack.config'),
    webpack = require('webpack');

config.output.filename = 'app.js',
config.plugins = [
    new UglifyJsPlugin({
       minimize: true
    })
  ];

module.exports = config;
