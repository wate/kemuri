import { devices, chromium, webkit, firefox } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { URL } from 'node:url';
import { c as configLoader, a as console } from './common/config.mjs';
import _ from 'lodash';
import { JSDOM } from 'jsdom';
import 'cosmiconfig';
import 'chalk';
import 'node:console';

let pages = [];
const screenshotOption = configLoader.getScreenshotOption();
let sitemapLocation = null;
if (_.has(screenshotOption, 'sitemapLocation')) {
    sitemapLocation = _.get(screenshotOption, 'sitemapLocation');
}
else {
    //@ts-ignore
    const htmlOption = configLoader.getHtmlOption();
    const htmloutputDir = _.has(htmlOption, 'outputDir') ? _.get(htmlOption, 'outputDir') : 'public';
    const sitemapFilePath = path.join(htmloutputDir, 'sitemap.xml');
    if (fs.existsSync('./pages.json')) {
        sitemapLocation = './pages.json';
    }
    else if (fs.existsSync(sitemapFilePath)) {
        sitemapLocation = sitemapFilePath;
    }
}
if (/^https?:\/\//.test(sitemapLocation)) {
    const dom = new JSDOM(await (await fetch(sitemapLocation)).text());
    const urls = dom.window.document.querySelectorAll('url');
    urls.forEach((url) => {
        const loc = url.querySelector('loc');
        if (loc) {
            //@ts-ignore
            const page = { url: loc.textContent };
            pages.push(page);
        }
    });
}
else {
    if (fs.existsSync(sitemapLocation)) {
        const fileType = path.extname(sitemapLocation).toLocaleLowerCase();
        switch (fileType) {
            case '.json':
                pages = JSON.parse(fs.readFileSync(sitemapLocation, 'utf8')).pages;
                break;
            case '.xml':
                const dom = new JSDOM(fs.readFileSync(sitemapLocation, 'utf8'));
                const urls = dom.window.document.querySelectorAll('url');
                urls.forEach((url) => {
                    const loc = url.querySelector('loc');
                    if (loc) {
                        //@ts-ignore
                        const page = { url: loc.textContent };
                        pages.push(page);
                    }
                });
                break;
        }
    }
    else {
        console.error('sitemap not found.');
        process.exit(1);
    }
}
if (pages.length === 0) {
    console.error('page not found.');
    process.exit(1);
}
else {
    let screenshotTargets = {};
    let headless = true;
    let fullPage = true;
    let retryLimit = 3;
    let screenshotBaseSaveDir = 'screenshots';
    let defaultBrowser = {
        type: 'chromium',
        width: 1920,
        height: 1080,
    };
    if (_.has(screenshotOption, 'outputDir') && _.get(screenshotOption, 'outputDir')) {
        //@ts-ignore{
        screenshotBaseSaveDir = _.get(screenshotOption, 'outputDir');
    }
    if (_.has(screenshotOption, 'default') && _.get(screenshotOption, 'default')) {
        //@ts-ignore
        defaultBrowser = _.get(screenshotOption, 'default');
    }
    if (_.has(screenshotOption, 'headless')) {
        //@ts-ignore
        headless = _.get(screenshotOption, 'headless');
    }
    if (_.has(screenshotOption, 'fullPage')) {
        //@ts-ignore
        fullPage = _.get(screenshotOption, 'fullPage');
    }
    if (_.has(screenshotOption, 'retryLimit') && _.get(screenshotOption, 'retryLimit')) {
        //@ts-ignore
        retryLimit = _.get(screenshotOption, 'retryLimit');
    }
    if (_.has(screenshotOption, 'targets') && _.get(screenshotOption, 'targets')) {
        //@ts-ignore
        screenshotTargets = _.get(screenshotOption, 'targets');
    }
    const screenshotPages = [];
    if (Object.keys(screenshotTargets).length === 0) {
        pages.forEach((page) => {
            screenshotPages.push(_.merge(_.clone(defaultBrowser), { url: page.url }));
        });
    }
    else {
        Object.keys(screenshotTargets).forEach((groupName) => {
            const browser = defaultBrowser;
            if (!screenshotTargets[groupName] && devices[groupName] !== undefined) {
                browser.type = devices[groupName].defaultBrowserType;
                browser.width = devices[groupName].viewport.width;
                browser.height = devices[groupName].viewport.height;
            }
            else {
                if (screenshotTargets[groupName].type !== undefined) {
                    if (devices[screenshotTargets[groupName].type] !== undefined) {
                        browser.type = devices[screenshotTargets[groupName].type].defaultBrowserType;
                        browser.width = devices[screenshotTargets[groupName].type].viewport.width;
                        browser.height = devices[screenshotTargets[groupName].type].viewport.height;
                    }
                    else {
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
            pages.forEach((page) => {
                screenshotPages.push(_.merge(_.clone(browser), { group: groupName, url: page.url }));
            });
        });
    }
    const browsers = {};
    const browserContexts = {};
    Promise.all(screenshotPages.map(async (screenshotPage) => {
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
        let screenshotSaveDir = screenshotBaseSaveDir;
        let screenshotGroup = 'default';
        const screenshotViewportSize = screenshotPage.width + 'x' + screenshotPage.height;
        if (screenshotPage.group) {
            screenshotGroup = screenshotPage.group;
            screenshotSaveDir = path.join(screenshotBaseSaveDir, screenshotPage.group);
        }
        if (!browserContexts[screenshotGroup]) {
            browserContexts[screenshotGroup] = await browser.newContext({
                viewport: { width: screenshotPage.width, height: screenshotPage.height },
            });
        }
        const context = browserContexts[screenshotGroup];
        const testUrl = new URL(screenshotPage.url);
        const page = await context.newPage();
        let screenshotSaveFileName = path.basename(testUrl.pathname, path.extname(testUrl.pathname)) + '.png';
        let screenshotSaveDirName = path.dirname(testUrl.pathname);
        if (/\/$/.test(testUrl.pathname)) {
            screenshotSaveFileName = 'index.png';
            screenshotSaveDirName = testUrl.pathname.replace(/\/$/, '');
        }
        const screenshotSavePath = path.join(screenshotSaveDir, screenshotSaveDirName, screenshotSaveFileName);
        await page.goto(testUrl.toString());
        if (!fs.existsSync(path.dirname(screenshotSavePath))) {
            fs.mkdirSync(path.dirname(screenshotSavePath), { recursive: true });
        }
        let retryCount = 0;
        let retry = false;
        let screenshotError = null;
        do {
            try {
                await page.screenshot({ path: screenshotSavePath, fullPage: fullPage });
                screenshotError = null;
                retry = false;
            }
            catch (error) {
                retry = true;
                ++retryCount;
                if (retryCount >= retryLimit) {
                    screenshotError = error;
                    console.error(error);
                }
            }
        } while (retry && retryCount < retryLimit);
        await page.close();
        console.group('[' + screenshotGroup + '(' + screenshotViewportSize + ')]: ' + screenshotPage.url);
        if (screenshotError) {
            console.error(screenshotError);
        }
        else {
            console.log('=> ' + screenshotSavePath);
        }
        console.groupEnd();
    })).then(() => {
        console.info('Screenshots saved');
        process.exit(0);
    });
}
