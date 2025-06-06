/**
 * Project Name: Weather App | Webpack Config
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

var config = {
  context: __dirname + '/app',
  entry: './scripts/index.tsx',
  devtool: 'source-map',
  output: {
    path: __dirname + '/public',
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpg?g|png|gif|svg)$/i,
        use: 'url-loader?limit=10000!img-loader?progressive=true',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "querystring": require.resolve("querystring-es3"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "url": require.resolve("url/"),
      "buffer": require.resolve("buffer/"),
      "./package": false // Attempt to stub out problematic internal import in 'got'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/public/index.html', // Use existing public/index.html as template
      filename: 'index.html', // Output file name
      inject: 'body' // Inject script tags at the end of the body
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed)
    })
  ]
};

module.exports = config;
