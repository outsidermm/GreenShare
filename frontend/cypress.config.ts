import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
      webpackConfig: {
        resolve: {
          alias: {
            '@': require('path').resolve(__dirname, './src'),
          },
        },
        module: {
          rules: [
            {
              test: /react-icons/,
              sideEffects: false,
            },
          ],
        },
      },
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
});
