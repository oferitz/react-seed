var path = require('path');
var util = require('util');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');
var pkg = require('./package.json');

var DEBUG = process.env.NODE_ENV !== 'production';

var cssBundle = path.join(
  'css',
  util.format('app.%s.css', pkg.version)
);

var jsBundle = path.join(
  'js',
  util.format('app.%s.js', pkg.version)
);

var cssExtractTextPlugin = new ExtractTextPlugin(cssBundle, {
  allChunks: true
});

var plugins =[
  new webpack.optimize.OccurenceOrderPlugin(),
  cssExtractTextPlugin
];

if (DEBUG) {
  plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );
} else {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.NoErrorsPlugin()
  );
}

var config = {
  context: path.join(__dirname, 'app'),
  cache: DEBUG,
  debug: DEBUG,
  devtool: DEBUG ? '#inline-source-map' : false,
  entry: {
    app: ['webpack/hot/dev-server', './app.jsx']
  },
  output: {
    path: pkg.config.dist_dir,
    publicPath: '/',
    filename: jsBundle,
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?optional&optional=runtime'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$/,
        loader: 'file-loader?name=[path][name].[ext]'
      },
      {
        test: /\.html$/,
        loader: [
          'file-loader?name=[path][name].[ext]',
          'template-html-loader?' + [
            'raw=true',
            'engine=lodash',
            'version='+pkg.version
          ].join('&')
        ].join('!')
      },
      {
        test: /\.scss$/,
        loader: cssExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!' +
          'sass-loader?' + [
            'sourceMap',
            'outputStyle=expanded',
            'includePaths[]=' + path.resolve(__dirname, './app/scss'),
            'includePaths[]=' + path.resolve(__dirname, './node_modules')
          ].join('&')
        )
      }
    ]
  },
  plugins: plugins,
  resolve: {
    extensions: ['', '.js', '.json', '.jsx']
  }
};

module.exports = config;