const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');

setHeadlessWhen(process.env.SCREENSHOT_HEADLESS);

setCommonPlugins();

/** @type {CodeceptJS.MainConfig} */
exports.config = {
  tests: './tests/**/*.js',
  output: './test_output',
  helpers: {
    Playwright: {
      url: 'http://127.0.0.1:8080',
      show: true,
      browser: 'chromium'
    }
  },
  include: {
    I: './steps_file.js'
  },
  name: 'mock_system',
  translation: 'ja-JP'
}
