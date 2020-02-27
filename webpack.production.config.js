/**
 * Project Name: Weather App | Webpack Config
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */

var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var config = require('./webpack.config');

config.output.filename = 'app.js';

module.exports = config;
