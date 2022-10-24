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
  let urls = ['/'];
  if (fs.existsSync('url_list.json')) {
    urls = JSON.parse(fs.readFileSync('url_list.json'));
  }
  urls.forEach(url => {
    I.amOnPage(url);
    I.usePlaywrightTo('screenshot:' + url, async ({ browser, browserContext, page }) => {
      await fs.mkdir(outputDir, { recursive: true }, (err) => {
        if (err) throw err;
      });
      let pageTitle = await page.title();
      pageTitle = pageTitle.replace(/ /g, '');
      const screenshotSavePath = path.join(outputDir, sanitize(outputFilePrefix + pageTitle + outputFileSuffix) + '.png');
      await page.screenshot({ path: screenshotSavePath, fullPage: true });
    });
  });
});
