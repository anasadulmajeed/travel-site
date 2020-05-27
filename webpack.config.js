const currentTask = process.env.npm_lifecycle_event
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const fse = require("fs-extra")
const path = require("path")
const postCSSPlugins = [require("postcss-import"), require("postcss-mixins"), require("postcss-simple-vars"), require("postcss-nested"), require("postcss-hexrgba"), require("postcss-color-function"), require("autoprefixer")]

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap("Copy images", function () {
      fse.copySync("./app/assets/images", "./docs/assets/images")
    })
  }
}
/* Creating a cssConfig for solving the condition logic and serving the style loader for dev mode and mini-css-extraction plugin for --prod mod */
let cssConfig = {
  test: /\.css$/i,
  use: ["css-loader?url=false", { loader: "postcss-loader", options: { plugins: postCSSPlugins } }]
}

let pages = fse
  .readdirSync("./app")
  .filter(function (file) {
    return file.endsWith(".html")
  })
  .map(function (page) {
    return new HtmlWebpackPlugin({
      filename: page,
      template: `./app/${page}`
    })
  })

/* -------------------------------------------------------------------------------------------- 
  This config OBJECT IS THE MAIN OR SOUL
   of this webpack.config.js file 
        *****THIS WILL BE APPLIED TO BOTH PRODUCTION AND DEV MODES BASED ON DEFINED ***** 
   -------------------------------------------------------------------------------------------
*/
let config = {
  entry: "./app/assets/scripts/App.js",
  plugins: pages /* IN WEBPACK PLUGIN-property is array #######*****KEEP IN MIND*****##### */,
  module: {
    rules: [cssConfig] /* IN WEBPACK RULES-property is a collection of objects #######*****KEEP IN MIND*****##### */
  }
}
/* ------------------------------------------------------------------------------------------------- 
                            ********main config ends here*******
  ---------------------------------------------------------------------------------------------------------------
*/

/* Making a way for development mode */
if (currentTask == "dev") {
  cssConfig.use.unshift("style-loader") /* This will add styles to the js, here we are adding this as first element of cssConfig.use's array */
  config.output = {
    filename: "bundled.js",
    path: path.resolve(__dirname, "app") /* Here configuring the output file */
  }
  config.devServer = {
    before: function (app, server) {
      server._watch("./app/**/*.html") /* webpack takes care all about this; here webpacks watchs is there any changes occurs to any of the files and injects js or css as hot module replacement */
    },
    contentBase: path.join(__dirname, "app"),
    hot: true,
    port: 3000,
    host: "0.0.0.0"
  }
  config.mode = "development" /* Configuring the mode;i.e; saying to the webpack which mode we are using */
}

/* Making a way for buil mode */
if (currentTask == "build") {
  config.module.rules.push({
    /* here we are pushing this to the rules array */ test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env"] /* Adding support for older browsers to support es6 syntax   */
      }
    }
  })
  cssConfig.use.unshift(MiniCssExtractPlugin.loader) /* This plugin will extract css from the bundled js here we are adding at the first of an array with unshift  */
  postCSSPlugins.push(require("cssnano")) /* posts css plugin(cssnano) it is used to minify here we are pushing to the array that we are declared above */
  config.output = {
    /* webpack object key output ; Here configuring output fiel name  */ filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "docs")
  }
  config.mode = "production" /* Determining the mode of the config */
  config.optimization = {
    splitChunks: { chunks: "all" } /* By specifing this we will see the name of the files in dist/docs file */
  }
  config.plugins.push(new CleanWebpackPlugin(), new MiniCssExtractPlugin({ filename: "styles.[chunkhash].css" }), new RunAfterCompile()) /* RunAfterCompile() is myOwn function is used to transfer all the files to the dist/docs folder with fse */
}

// let deleteMeLater = {
//   entry: "./app/assets/scripts/App.js",
//   output: {
//     filename: "bundled.js",
//     path: path.resolve(__dirname, "app")
//   },
//   devServer: {
//     before: function (app, server) {
//       server._watch("./app/**/*.html")
//     },
//     contentBase: path.join(__dirname, "app"),
//     hot: true,
//     port: 3000,
//     host: "0.0.0.0"
//   },
//   mode: "development",
//   module: {
//     rules: [
//       {
//         test: /\.css$/i,
//         use: [
//           "style-loader",
//           "css-loader?url=false",
//           { loader: "postcss-loader", options: { plugins: postCSSPlugins } }
//         ]
//       }
//     ]
//   }
// }

module.exports = config
