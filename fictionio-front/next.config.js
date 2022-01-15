const isServerless = process.env.NODE_ENV_SERVERLESS === 'serverless';
const withCSS = require('@zeit/next-css')

module.exports = withCSS({
  distDir: "/fromNext",
  assetPrefix: isServerless? 'http://localhost:8010/fictionio-dev/us-central1/front' : '/',
  webpack: function (config) {
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]'
        }
      }
    })
    return config
  }
})