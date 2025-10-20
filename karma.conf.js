// Karma configuration to use Puppeteer's Chromium when available
// and to run ChromeHeadless with --no-sandbox flags (useful in CI)

const path = require('path');

let puppeteerExec = null;
try {
  // prefer puppeteer if installed in the project
  const puppeteer = require('puppeteer');
  if (puppeteer && typeof puppeteer.executablePath === 'function') {
    puppeteerExec = puppeteer.executablePath();
    // also expose for tools that honor this env var
    process.env.PUPPETEER_EXECUTABLE_PATH = puppeteerExec;
    process.env.CHROME_BIN = puppeteerExec;
  }
} catch (e) {
  // puppeteer not installed; fall back to system CHROME_BIN if set by user/CI
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
    ],
    client: {
      clearContext: false
    },
    coverageReporter: {
      dir: path.join(__dirname, './coverage'),
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
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--remote-debugging-port=0'
        ]
      }
    },
    // increase timeouts to reduce flaky disconnects
    captureTimeout: 120000,
    browserDisconnectTimeout: 20000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 120000,
    singleRun: false,
    restartOnFileChange: true
  });
};