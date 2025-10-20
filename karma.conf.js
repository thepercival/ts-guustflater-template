// Auto-generated Karma configuration for headless Chrome using Puppeteer if available
// This file sets process.env.CHROME_BIN to puppeteer's executablePath when puppeteer is installed
// and defines a ChromeHeadlessNoSandbox launcher which is useful in CI environments.

const puppeteer = (() => {
  try {
    return require('puppeteer');
  } catch (e) {
    return null;
  }
})();

if (puppeteer && puppeteer.executablePath) {
  // set CHROME_BIN to Puppeteer's bundled Chromium
  process.env.CHROME_BIN = puppeteer.executablePath();
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    },
    singleRun: false,
    restartOnFileChange: true
  });
};
