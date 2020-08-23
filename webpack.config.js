const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/ts/index.ts',
  //devtool: "source-map",
  devtool: 'inline-source-map',
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

  externals: {
    // Declare cordova plugins as external global variables, needed for web app to run
    'cordova-plugin-file': { root: '_' },
    'cordova-plugin-file-transfer': { root: '_' },
    'cordova-plugin-network-information' : { root: '_' }
  }
};
