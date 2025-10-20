// karma.conf.ts
module.exports = (config) => {
  config.set({
    basePath: '../..',
    frameworks: ['jasmine'],
    //...
  });
}

process.env.CHROME_BIN = require('puppeteer').executablePath();