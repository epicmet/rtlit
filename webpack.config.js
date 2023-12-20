const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const ENV = process.env.NODE_ENV || "development";

const moduleRules = [
  {
    test: /\.css$/,
    use: "css-loader",
  },
];

const plugins = [
  new HtmlWebpackPlugin({
    template: "./src/popup/index.html",
    filename: "popup/index.html",
    chunks: ["popup/main"],
  }),
  // new MiniCssExtractPlugin({
  //   filename: "[name].css",
  //   chunkFilename: "chunk-[id].css",
  // }),
];

/**
 * @type {import("webpack").Configuration}
 */
const config = {
  mode: ENV,
  entry: {
    "popup/main": "./src/popup/main.js",
  },
  // output: {
  //   filename: "[name].js",
  //   path: path.resolve(__dirname, "build"),
  // },
  module: { rules: moduleRules },
  plugins: plugins,
};

module.exports = config;
