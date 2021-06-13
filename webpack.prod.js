const path = require("path");
const settings = require("./config/appSettings");
const webpack = require("webpack");
const processEnv = settings[process.env.AppSettings];
const CopyPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  mode: process.env.AppSettings,
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: ["babel-loader", "ts-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{ loader: "babel-loader" }],
      },
    ],
  },
  plugins: [
    new CompressionPlugin({
      test: /\.js(\?.*)?$/i,
    }),
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
