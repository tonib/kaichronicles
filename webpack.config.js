const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/ts/index.ts',
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'kai.js',
    path: path.resolve(__dirname, 'src/www/js'),
    library: 'kai'
  },
};
