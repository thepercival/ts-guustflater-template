// karma.conf.ts
module.exports = (config) => {
  config.set({
    basePath: '../..',
    frameworks: ['jasmine'],    
    ChromeHeadless: {
      base: 'ChromeHeadless',
      flags: [
        '--no-sandbox'
      ]
    }
  });
}



process.env.CHROME_BIN = require('puppeteer').executablePath();