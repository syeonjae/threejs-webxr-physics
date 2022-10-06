const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const webpackMode = process.env.NODE_ENV || "development";

module.exports = {
  mode: webpackMode,
  entry: {
    main: "./src/index.js",
  },
  output: {
    path: path.resolve("./build"),
    filename: "[name].min.js",
  },

  devServer: {
    liveReload: true,
    open: true,
  },
  // optimization: {
  //   minimizer:
  //     webpackMode === "production"
  //       ? [
  //           new TerserPlugin({
  //             terserOptions: {
  //               compress: {
  //                 drop_console: true,
  //               },
  //             },
  //           }),
  //         ]
  //       : [],
  //   splitChunks: {
  //     chunks: "all",
  //   },
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      minify:
        process.env.NODE_ENV === "production"
          ? {
              collapseWhitespace: true,
              removeComments: true,
            }
          : false,
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./src/css", to: "./css" },
        // { from: "./src/textures", to: "./textures" },
        // { from: "./src/images", to: "./images" },
        // { from: "./src/models", to: "./models" },
        // { from: "./src/sounds", to: "./sounds" }
      ],
    }),
  ],
};
