const fs = require("fs");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const ASSETS_PATH = path.resolve(__dirname, "./assets");

module.exports = (options, args) => {
  const config = {
    entry: {
      global: path.resolve(__dirname, "./src/global.js"),
    },
    mode: args.mode,
    watch: args.mode === "development",
    stats: "minimal",
    output: {
      path: path.resolve(__dirname, ASSETS_PATH),
      filename: "[name].min.js",

      environment: {
        arrowFunction: false,
        bigIntLiteral: false,
        const: false,
        destructuring: false,
        dynamicImport: false,
        forOf: false,
        module: false,
      },
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].min.css",
        experimentalUseImportModule: true,
      }),
    ],
    module: {
      rules: [
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          test: /\.css$/,
          use: [ "style-loader", "css-loader" ]
        },
      ],
    },
    watchOptions: { aggregateTimeout: 100 },
    optimization: {
      minimize: args.mode === "production",
      usedExports: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          test: /\.js(\?.*)?$/i,
          terserOptions: {
            compress: true,
            format: { comments: false },
          },
        }),
        new CssMinimizerPlugin(),
      ],
    },
  };

  const jsfiles = fs.readdirSync(path.resolve(__dirname, "./src/sections"));

  for (const file of jsfiles) {
    if (file.endsWith(".js")) {
      config.entry[`${file.replace(".js", "")}`] = path.resolve(
        __dirname,
        `./src/sections/${file}`
      );
    }
  }

  return config;
};
