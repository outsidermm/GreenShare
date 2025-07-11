/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Only instrument code in test environment
    if (process.env.INSTRUMENT_CODE === 'true' && !isServer && dev) {
      config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: [
          /node_modules/,
          /\.cy\.(js|jsx|ts|tsx)$/,
          /cypress/,
          /__tests__/,
          /\.test\.(js|jsx|ts|tsx)$/,
          /\.spec\.(js|jsx|ts|tsx)$/,
        ],
        use: {
          loader: '@jsdevtools/coverage-istanbul-loader',
          options: {
            // Enable source maps for better debugging
            esModules: true,
          },
        },
        enforce: 'post',
      });
    }
    return config;
  },
}

module.exports = nextConfig