const { resolve, join } = require("path");
const withPlugins = require('next-compose-plugins');
// https://github.com/martpie/next-transpile-modules
const INCLUDE = [
  resolve(__dirname, "../../")
]
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // https://stackoverflow.com/questions/51791163/warning-prop-classname-did-not-match-when-using-styled-components-with-seman
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  
  compiler: {
    // For other options, see https://styled-components.com/docs/tooling#babel-plugin
    styledComponents: true,
  },

  env: {
    'API_URL': process.env.API_URL,
  },

  webpack: (config) => {
    config.module.rules.unshift({
      test: /\.(gif|woff2|ttf|svg|png|jpg)$/,
      include: INCLUDE,
      use: [
        {
          loader: "file-loader",
          options: {
            esModule: false,
            publicPath: "/_next/static/resources/",
            outputPath: "static/resources/",
          },
        },
      ],
    });

    return config;
  },
};

module.exports = nextConfig;