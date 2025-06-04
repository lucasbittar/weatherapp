/**
 * Project Name: Weather App | Webpack Config
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */

var config = {
  context: __dirname + '/app',
  entry: './scripts/index.js',
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
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
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
};

module.exports = config;
