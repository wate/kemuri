#!/usr/bin/env node
import * as path from 'node:path';
import { URL } from 'node:url';
import chalk from 'chalk';
import fs from 'fs-extra';
import { JSDOM } from 'jsdom';
import _ from 'lodash';
import { devices, chromium, webkit, firefox } from 'playwright';
import yargs from 'yargs';
import { a as configLoader, c as console } from './lib/config.mjs';
import 'node:child_process';
import 'node:fs';
import 'cosmiconfig';
import 'duplexer3';
import 'nunjucks';
import 'shell-quote';
import 'dotenv';
import 'node:console';

const argv = yargs(process.argv.slice(2))
    .options({
    l: {
        type: 'string',
        description: 'サイトマップファイルのパスまたはURL',
        alias: 'location',
    },
    c: {
        type: 'string',
        alias: 'config',
        description: '設定ファイルを指定する',
    },
    clean: {
        type: 'boolean',
        default: false,
        description: 'ビルド前に出力ディレクトリを空にする',
    },
})
    .parseSync();
if (argv.config !== undefined) {
    //@ts-ignore
    configLoader.configFile = argv.config;
}
let pages = [];
const screenshotOption = configLoader.getScreenshotOption();
let sitemapLocation = null;
if (argv.location) {
    sitemapLocation = argv.location;
}
else {
    if (_.has(screenshotOption, 'sitemapLocation')) {
        sitemapLocation = _.get(screenshotOption, 'sitemapLocation');
    }
    else {
        //@ts-ignore
        const htmlOption = configLoader.getHtmlOption();
        const htmloutputDir = _.has(htmlOption, 'outputDir')
            ? _.get(htmlOption, 'outputDir')
            : 'public';
        const sitemapFilePath = path.join(htmloutputDir, 'sitemap.xml');
        if (fs.existsSync('./pages.json')) {
            sitemapLocation = './pages.json';
        }
        else if (fs.existsSync(sitemapFilePath)) {
            sitemapLocation = sitemapFilePath;
        }
    }
}
console.info('Sitemap location: ' + sitemapLocation);
if (/^https?:\/\//.test(sitemapLocation)) {
    const fetchOption = {};
    /**
     * Basic認証の設定
     */
    if (_.has(screenshotOption, 'auth.basic.username') &&
        _.has(screenshotOption, 'auth.basic.password')) {
        const authBasicUsername = _.get(screenshotOption, 'auth.basic.username', null);
        const authBasicPassword = _.get(screenshotOption, 'auth.basic.password', null);
        if (authBasicUsername && authBasicPassword) {
            fetchOption.headers = {
                Authorization: 'Basic ' + btoa(`${authBasicUsername}:${authBasicPassword}`),
            };
        }
    }
    const dom = new JSDOM(await (await fetch(sitemapLocation, fetchOption)).text());
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
            case '.xml': {
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
let screenshotTargets = {};
let headless = true;
let fullPage = true;
let retryLimit = 3;
let screenshotBaseSaveDir = 'screenshots';
let saveFlatPath = false;
let screenshotElement = null;
let defaultBrowser = {
    type: 'chromium',
    width: 1920,
    height: 1080,
};
if (_.has(screenshotOption, 'outputDir') &&
    _.get(screenshotOption, 'outputDir')) {
    //@ts-ignore{
    screenshotBaseSaveDir = _.get(screenshotOption, 'outputDir');
}
if (_.has(screenshotOption, 'default') &&
    _.get(screenshotOption, 'default')) {
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
if (_.has(screenshotOption, 'retryLimit') &&
    _.get(screenshotOption, 'retryLimit')) {
    //@ts-ignore
    retryLimit = _.get(screenshotOption, 'retryLimit');
}
if (_.has(screenshotOption, 'saveFlatPath')) {
    //@ts-ignore
    saveFlatPath = _.get(screenshotOption, 'saveFlatPath');
}
if (_.has(screenshotOption, 'targets') &&
    _.get(screenshotOption, 'targets')) {
    //@ts-ignore
    screenshotTargets = _.get(screenshotOption, 'targets');
}
if (_.has(screenshotOption, 'element') &&
    _.get(screenshotOption, 'element')) {
    //@ts-ignore
    screenshotElement = _.get(screenshotOption, 'element');
}
if (argv.clean) {
    //スクリーンショット保存先ディレクトリを空にする
    console.log(chalk.yellow('Clean up screenshot save directory: ' + screenshotBaseSaveDir));
    fs.emptyDirSync(screenshotBaseSaveDir);
}
/**
 * スクリーンショットの取得処理の実行
 */
console.info('Start screenshot');
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
                    browser.type =
                        devices[screenshotTargets[groupName].type].defaultBrowserType;
                    browser.width =
                        devices[screenshotTargets[groupName].type].viewport.width;
                    browser.height =
                        devices[screenshotTargets[groupName].type].viewport.height;
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
                browsers[screenshotPage.type] = await firefox.launch({
                    headless: headless,
                });
                break;
            case 'webkit':
                browsers[screenshotPage.type] = await webkit.launch({
                    headless: headless,
                });
                break;
            default:
                browsers[screenshotPage.type] = await chromium.launch({
                    headless: headless,
                });
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
        const browserContextOption = {
            viewport: {
                width: screenshotPage.width,
                height: screenshotPage.height,
            },
        };
        /**
         * Basic認証の設定
         */
        if (_.has(screenshotOption, 'auth.basic.username') &&
            _.has(screenshotOption, 'auth.basic.password')) {
            const authBasicUsername = _.get(screenshotOption, 'auth.basic.username', null);
            const authBasicPassword = _.get(screenshotOption, 'auth.basic.password', null);
            if (authBasicUsername && authBasicPassword) {
                browserContextOption.httpCredentials = {
                    username: authBasicUsername,
                    password: authBasicPassword,
                };
            }
        }
        const browserContext = await browser.newContext(browserContextOption);
        /**
         * フォーム認証の設定
         */
        if (_.has(screenshotOption, 'auth.form.url') &&
            _.has(screenshotOption, 'auth.form.actions')) {
            const authFormPage = await browserContext.newPage();
            const authFormURL = _.get(screenshotOption, 'auth.form.url', null);
            const authFormActions = _.get(screenshotOption, 'auth.form.actions', null);
            await authFormPage.goto(authFormURL);
            authFormActions.forEach(async (action) => {
                switch (action.action) {
                    case 'fill': // フォームのフィールドを入力する
                        await authFormPage.fill(action.selector, action.value);
                        break;
                    case 'select': // フォームのセレクトボックスのオプションを選択する
                        await authFormPage.selectOption(action.selector, action.value);
                        break;
                    case 'check': // チェックボックスまたはラジオボタンのチェックを変更する
                        await authFormPage.check(action.selector);
                        break;
                    case 'click': // ボタンをクリックする
                        await authFormPage.click(action.selector);
                        break;
                }
            });
        }
        browserContexts[screenshotGroup] = browserContext;
    }
    const context = browserContexts[screenshotGroup];
    const testUrl = new URL(screenshotPage.url);
    const page = await context.newPage();
    let screenshotSaveFileName = path.basename(testUrl.pathname, path.extname(testUrl.pathname)) +
        '.png';
    let screenshotSaveDirName = path
        .dirname(testUrl.pathname)
        .replace(/^\//, '');
    if (/\/$/.test(testUrl.pathname)) {
        screenshotSaveFileName = 'index.png';
        screenshotSaveDirName = testUrl.pathname.replace(/\/$/, '');
    }
    if (saveFlatPath) {
        // フラットなパスで保存する場合
        screenshotSaveFileName = path
            .join(screenshotSaveDirName, screenshotSaveFileName)
            .replace(/\//g, '_');
        screenshotSaveDirName = '';
    }
    const screenshotSavePath = path.join(screenshotSaveDir, screenshotSaveDirName, screenshotSaveFileName);
    await page.goto(testUrl.toString());
    if (!fs.existsSync(path.dirname(screenshotSavePath))) {
        fs.mkdirSync(path.dirname(screenshotSavePath), { recursive: true });
    }
    let retryCount = 0;
    let retry = false;
    let screenshotError = null;
    let screenshotWarning = null;
    do {
        screenshotError = null;
        screenshotWarning = null;
        try {
            if (screenshotElement) {
                const locator = await page.locator(screenshotElement);
                if (await locator.count() > 0) {
                    await locator.screenshot({ path: screenshotSavePath });
                }
                else {
                    screenshotError = null;
                    screenshotWarning = '=> Element not found: ' + screenshotElement + ' on ' + screenshotPage.url;
                }
            }
            else {
                await page.screenshot({
                    path: screenshotSavePath,
                    fullPage: fullPage,
                });
                screenshotError = null;
                screenshotWarning = null;
                retry = false;
            }
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
    console.group('[' +
        screenshotGroup +
        '(' +
        screenshotViewportSize +
        ')]: ' +
        screenshotPage.url);
    if (screenshotError || screenshotWarning) {
        if (screenshotError) {
            console.error(screenshotError);
        }
        if (screenshotWarning) {
            console.warn(screenshotWarning);
        }
    }
    else {
        console.log('=> ' + screenshotSavePath);
    }
    console.groupEnd();
})).then(() => {
    console.info('End screenshot');
    process.exit(0);
});
