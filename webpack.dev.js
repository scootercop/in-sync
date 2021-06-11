const path = require("path");
const settings = require("./config/appSettings");
const webpack = require("webpack");
const processEnv = settings[process.env.AppSettings];
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "public"),
    port: 1111,
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
            },
          },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{ loader: "babel-loader" }],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.apiURI": JSON.stringify(processEnv.apiURI),
      "process.env.appURI": JSON.stringify(processEnv.appURI),
      "process.env.environment": JSON.stringify(processEnv.environment),
    }),
    new CopyPlugin({
      patterns: [
        { from: "./src/index.html", to: "." },
        { from: "./src/index.css", to: "." },
      ],
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "public"),
  },
};
