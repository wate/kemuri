const fs = require('fs');
const path = require('path');
const sanitize = require('sanitize-filename');
require('dotenv').config();

const outputDir = process.env.SCREENSHOT_OUTPUT_DIR || 'screenshot';
const outputFilePrefix = process.env.SCREENSHOT_TABLET_OUTPUT_FILE_PREFIX || '';
const outputFileSuffix = process.env.SCREENSHOT_TABLET_OUTPUT_FILE_SUFFIX || '-tablet';
const screenSizeWight = process.env.SCREENSHOT_TABLET_SIZE_WIDTH || 800;
const screenSizeHeight = process.env.SCREENSHOT_TABLET_SIZE_HEIGHT || 1000;

Feature('screenshot');

Scenario('screenshot pages tablet display', ({ I }) => {
  I.resizeWindow(parseInt(screenSizeWight), parseInt(screenSizeHeight));
  let screenshotPages = [{ url: '/' }];
  if (fs.existsSync('pages.json')) {
    screenshotPages = JSON.parse(fs.readFileSync('pages.json'));
  }
  const date = new Date();
  const dateParts = [date.getFullYear(), date.getMonth(), date.getDate(), 'T', date.getHours(), date.getMinutes(), date.getSeconds()];
  const subDir = dateParts.map(function (v) {
    if (typeof (v) === 'number') {
      v = v.toString();
      if (v.length === 1) {
        v = '0' + v;
      }
    }
    return v;
  }).join('');
  fs.mkdirSync(path.join(outputDir, subDir), { recursive: true });
  screenshotPages.forEach(screenshotPage => {
    I.amOnPage(screenshotPage.url);
    I.amOnPage(screenshotPage.url);
    I.usePlaywrightTo('screenshot:' + screenshotPage.url, async ({ browser, browserContext, page }) => {
      let pageTitle = await page.title();
      pageTitle = pageTitle.replace(/ /g, '');
      const screenshotSavePath = path.join(outputDir, subDir, sanitize(outputFilePrefix + pageTitle + outputFileSuffix) + '.png');
      await page.screenshot({ path: screenshotSavePath, fullPage: true });
    });
  });
});
