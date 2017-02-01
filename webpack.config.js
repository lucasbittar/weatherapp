/**
 * Project Name: Weather App | Webpack Config
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */

module.exports = {
  context: __dirname + '/app',
  entry: './scripts/main.js',
  output: {
    path: __dirname + '/app',
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
