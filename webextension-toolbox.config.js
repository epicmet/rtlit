module.exports = {
  webpack: (config, { dev, vendor }) => {
    config.entry = {
      "sw/background": "./sw/background.js",
      "scripts/content": "./scripts/content.ts",
      "popup/main": "./popup/main.js",
    };

    return config;
  },
};
