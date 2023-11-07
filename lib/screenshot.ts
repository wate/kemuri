import { chromium, webkit, firefox, devices } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { URL } from 'node:url';
import console from './console';
import _ from 'lodash';

type Page = {
  url: string;
  srcFile: string;
  lastmod: string;
  variables: object;
};

interface Target {
  type?: string;
  width?: number;
  height?: number;
}

interface Browser {
  type: string;
  width: number;
  height: number;
}

interface ScreenshotPage extends Browser {
  group?: string | null;
  url: string;
}

let pages: Page[] = [];
if (fs.existsSync('./pages.json')) {
  pages = JSON.parse(fs.readFileSync('./pages.json', 'utf8'));
}
// const screenshotTargets: any = {};
const screenshotTargets: any = {
  desktop: { type: 'Desktop Chrome', width: 1920, height: 1080 },
  tablet: { type: 'iPad Mini' },
  tablet_landscape: { type: 'iPad Mini landscape' },
  mobile: { type: 'iPhone 14 Pro Max' },
  mobile_landscape: { type: 'iPhone 14 Pro Max landscape' },
};

const headless: boolean = true;
const fullPage: boolean = true;
const retryLimit: number = 3;

if (pages.length === 0) {
  console.error('No pages found in pages.json');
  process.exit(1);
} else {
  const defaultBrowser: Browser = {
    type: 'chromium',
    width: 1920,
    height: 1080,
  };
  const screenshotPages: ScreenshotPage[] = [];
  if (Object.keys(screenshotTargets).length === 0) {
    pages.forEach((page: Page) => {
      screenshotPages.push(_.merge(_.clone(defaultBrowser), { url: page.url }));
    });
  } else {
    Object.keys(screenshotTargets).forEach((groupName) => {
      const browser: Browser = defaultBrowser;
      if (!screenshotTargets[groupName] && devices[groupName] !== undefined) {
        browser.type = devices[groupName].defaultBrowserType;
        browser.width = devices[groupName].viewport.width;
        browser.height = devices[groupName].viewport.height;
      } else {
        if (screenshotTargets[groupName].type !== undefined) {
          if (devices[screenshotTargets[groupName].type] !== undefined) {
            browser.type = devices[screenshotTargets[groupName].type].defaultBrowserType;
            browser.width = devices[screenshotTargets[groupName].type].viewport.width;
            browser.height = devices[screenshotTargets[groupName].type].viewport.height;
          } else {
            browser.type = screenshotTargets[groupName].type;
          }
        }
        if (screenshotTargets[groupName].width !== undefined) {
          browser.width = screenshotTargets[groupName].width;
        }
        if (screenshotTargets[groupName].height !== undefined) {
          browser.height = screenshotTargets[groupName].height;
        }
      }
      pages.forEach((page: Page) => {
        screenshotPages.push(_.merge(_.clone(browser), { group: groupName, url: page.url }));
      });
    });
  }
  const browsers: any = {};
  const browserContexts: any = {};
  Promise.all(
    screenshotPages.map(async (screenshotPage: ScreenshotPage) => {
      if (!browsers[screenshotPage.type]) {
        switch (screenshotPage.type) {
          case 'firefox':
            browsers[screenshotPage.type] = await firefox.launch({ headless: headless });
          case 'webkit':
            browsers[screenshotPage.type] = await webkit.launch({ headless: headless });
          default:
            browsers[screenshotPage.type] = await chromium.launch({ headless: headless });
        }
      }
      const browser = browsers[screenshotPage.type];
      let screenshotBaseSavePath = 'screenshots';
      let screenshotGroup = 'default';
      if (screenshotPage.group) {
        screenshotGroup = screenshotPage.group;
        screenshotBaseSavePath = path.join(screenshotBaseSavePath, screenshotPage.group);
      }
      if (!browserContexts[screenshotGroup]) {
        browserContexts[screenshotGroup] = await browser.newContext({
          viewport: { width: screenshotPage.width, height: screenshotPage.height },
        });
      }
      const context = browserContexts[screenshotGroup];
      const testUrl = new URL(screenshotPage.url);
      const page = await context.newPage();
      const screenshotSaveFileName = path.basename(testUrl.pathname, path.extname(testUrl.pathname)) + '.png';
      const screenshotSavePath = path.join(
        screenshotBaseSavePath,
        path.dirname(testUrl.pathname),
        screenshotSaveFileName,
      );
      await page.goto(testUrl.toString());
      if (!fs.existsSync(path.dirname(screenshotSavePath))) {
        fs.mkdirSync(path.dirname(screenshotSavePath), { recursive: true });
      }
      let retryCount: number = 0;
      let retry: boolean = false;
      let screenshotError: any | null = null;
      do {
        try {
          await page.screenshot({ path: screenshotSavePath, fullPage: fullPage });
          screenshotError = null;
          retry = false;
        } catch (error) {
          retry = true;
          ++retryCount;
          if (retryCount >= retryLimit) {
            screenshotError = error;
            console.error(error);
          }
        }
      } while (retry && retryCount < retryLimit);
      await page.close();
      console.group('Screenshot(' + screenshotPage.group + '): ' + screenshotPage.url);
      if (screenshotError) {
        console.error(screenshotError);
      } else {
        console.log('=> ' + screenshotSavePath);
      }
      console.groupEnd();
    }),
  ).then(() => {
    console.info('Screenshots saved');
    process.exit(0);
  });
}
