#!/usr/bin/env node
import * as fs from 'node:fs';
import { j as jsBuilder } from './common/js.mjs';
import { c as cssBuilder } from './common/css.mjs';
import { h as htmlBuilder } from './common/html.mjs';
import browserSync from 'browser-sync';
import { c as configLoader, a as console } from './common/config.mjs';
import _ from 'lodash';
import yargs from 'yargs';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import 'node:path';
import './common/base.mjs';
import 'glob';
import 'chokidar';
import 'rimraf';
import 'editorconfig';
import 'rollup';
import '@rollup/plugin-node-resolve';
import '@rollup/plugin-commonjs';
import '@rollup/plugin-typescript';
import '@rollup/plugin-terser';
import 'js-beautify';
import 'sass';
import 'node:url';
import 'js-yaml';
import 'nunjucks';
import 'cosmiconfig';
import 'node:console';

/**
 * BrowserSyncのオプションを取得する
 * @returns
 */
function getBrowserSyncOption() {
    const browserSyncOption = {
        port: 3000,
        open: true,
        notify: false,
        ui: false,
        watch: true,
        browser: 'default',
        server: {
            baseDir: 'public',
        },
    };
    /**
     * ベースディレクトリオプション
     */
    const serverOption = configLoader.getServerOption();
    if (!configLoader.isEnable('html')) {
        const htmlOption = configLoader.getHtmlOption();
        if (_.has(htmlOption, 'outputDir')) {
            //@ts-ignore
            browserSyncOption.server.baseDir = _.get(htmlOption, 'outputDir');
        }
    }
    /**
     * portオプション
     */
    if (_.has(serverOption, 'port')) {
        //@ts-ignore
        browserSyncOption.port = _.get(serverOption, 'port');
    }
    /**
     * watchオプション
     */
    if (_.has(serverOption, 'watch')) {
        //@ts-ignore
        browserSyncOption.watch = _.get(serverOption, 'watch');
    }
    /**
     * filesオプション
     */
    if (_.has(serverOption, 'watchFiles')) {
        //@ts-ignore
        browserSyncOption.files = _.get(serverOption, 'watchFiles');
    }
    /**
     * ブラウザ起動のオプション
     */
    if (_.has(serverOption, 'open')) {
        //@ts-ignore
        browserSyncOption.open = _.get(serverOption, 'open');
    }
    /**
     * ブラウザオプション
     */
    if (_.has(serverOption, 'browser')) {
        //@ts-ignore
        browserSyncOption.browser = _.get(serverOption, 'browser');
    }
    /**
     * UIオプション
     */
    if (_.has(serverOption, 'ui') && _.get(serverOption, 'ui')) {
        browserSyncOption.ui = true;
        if (browserSyncOption.ui && _.has(serverOption, 'uiPort')) {
            //browserSyncのUIポート番号を設定
            browserSyncOption.ui = {
                port: _.get(serverOption, 'uiPort'),
            };
        }
    }
    /**
     * 通知オプション
     */
    if (_.has(serverOption, 'notify')) {
        //@ts-ignore
        browserSyncOption.notify = _.get(serverOption, 'notify');
    }
    return browserSyncOption;
}
/**
 * BrowserSyncを起動する
 * @param orverrideOption
 */
function run(orverrideOption) {
    let serverOption = getBrowserSyncOption();
    if (orverrideOption !== undefined) {
        serverOption = _.merge(_.cloneDeep(serverOption), _.cloneDeep(orverrideOption));
    }
    browserSync(serverOption);
}

dotenv.config();
const argv = yargs(process.argv.slice(2))
    .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモード' },
    m: {
        type: 'string',
        choices: ['develop', 'production'],
        default: 'develop',
        alias: 'mode',
        description: 'ビルド処理のモード指定',
    },
    p: { type: 'boolean', alias: ['prod', 'production'], description: '本番モード指定のショートハンド' },
    d: { type: 'boolean', alias: ['dev', 'develop'], description: '開発モード指定のショートハンド' },
    html: { type: 'boolean', description: 'htmlビルダーを利用する' },
    css: { type: 'boolean', description: 'cssビルダーを利用する' },
    js: { type: 'boolean', description: 'jsビルダーを利用する' },
    server: { type: 'boolean', description: 'browserSyncサーバーを起動する' },
    init: { type: 'boolean', description: '設定ファイルを生成する' },
    force: { type: 'boolean', default: false, alias: 'f', description: '設定ファイルを強制的に上書きする' },
})
    .parseSync();
if (argv.init) {
    if (fs.existsSync('.builderrc.yml')) {
        if (argv.force) {
            configLoader.init(argv.force);
            console.log(chalk.green('Configuration file(.builderrc.yml) has been overwritten.'));
        }
        else {
            console.warn('Configuration file(.builderrc.yml) already exists.');
        }
    }
    else {
        configLoader.init(argv.force);
        console.log(chalk.green('Configuration file(.builderrc.yml) has been generated.'));
    }
    const createDirectories = [];
    const htmlBuilderOption = configLoader.getHtmlOption();
    //@ts-ignore
    createDirectories.push(htmlBuilderOption.srcDir !== undefined ? htmlBuilderOption.srcDir : 'src');
    //@ts-ignore
    createDirectories.push(htmlBuilderOption.outputDir !== undefined ? htmlBuilderOption.outputDir : 'public');
    const jsBuilderOption = configLoader.getJsOption();
    //@ts-ignore
    createDirectories.push(jsBuilderOption.srcDir !== undefined ? jsBuilderOption.srcDir : 'src');
    //@ts-ignore
    createDirectories.push(jsBuilderOption.outputDir !== undefined ? jsBuilderOption.outputDir : 'public/assets/js');
    const cssBuilderOption = configLoader.getCssOption();
    //@ts-ignore
    createDirectories.push(cssBuilderOption.srcDir !== undefined ? cssBuilderOption.srcDir : 'src');
    //@ts-ignore
    createDirectories.push(cssBuilderOption.outputDir !== undefined ? cssBuilderOption.outputDir : 'public/assets/css');
    const snippetBuilderOption = configLoader.getSnippetOption();
    //@ts-ignore
    createDirectories.push(snippetBuilderOption.srcDir !== undefined ? snippetBuilderOption.srcDir : 'docs/snippets');
    //@ts-ignore
    createDirectories.push(snippetBuilderOption.outputDir !== undefined ? snippetBuilderOption.outputDir : '.vscode');
    const screenshotOption = configLoader.getScreenshotOption();
    //@ts-ignore
    createDirectories.push(screenshotOption.outputDir !== undefined ? screenshotOption.outputDir : 'screenshots');
    createDirectories
        .reduce((unique, item) => {
        return unique.includes(item) ? unique : [...unique, item];
    }, [])
        .sort()
        .forEach((dir) => {
        if (!fs.existsSync(dir)) {
            console.log(chalk.green('Create directory: ' + dir));
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    process.exit(0);
}
let mode = 'develop';
if (argv.mode !== undefined) {
    mode = String(argv.mode);
}
else if (argv.develop !== undefined) {
    mode = 'develop';
}
else if (argv.production !== undefined) {
    mode = 'production';
}
const builders = [];
if (configLoader.isEnable('js') || argv.js) {
    const jsOrverrideOption = {};
    if (argv.sourcemap !== undefined) {
        jsOrverrideOption.sourcemap = true;
    }
    if (argv.minify !== undefined || mode === 'production') {
        jsOrverrideOption.minify = true;
    }
    const jsBuilderOption = configLoader.getJsOption(jsOrverrideOption);
    console.group(chalk.blue('javaScript Builder Option'));
    console.log(jsBuilderOption);
    console.groupEnd();
    jsBuilder.setOption(jsBuilderOption);
    builders.push(jsBuilder);
}
if (configLoader.isEnable('css') || argv.css) {
    const cssOrverrideOption = {};
    if (argv.sourcemap !== undefined) {
        cssOrverrideOption.sourcemap = true;
    }
    if (argv.minify !== undefined || mode === 'production') {
        cssOrverrideOption.style = 'compressed';
    }
    const cssBuilderOption = configLoader.getCssOption(cssOrverrideOption);
    console.group(chalk.blue('CSS Builder Option'));
    console.log(cssBuilderOption);
    console.groupEnd();
    cssBuilder.setOption(cssBuilderOption);
    builders.push(cssBuilder);
}
if (configLoader.isEnable('html') || argv.html) {
    const htmlBuilderOption = configLoader.getHtmlOption();
    console.group(chalk.blue('HTML Builder Option'));
    console.log(htmlBuilderOption);
    console.groupEnd();
    htmlBuilder.setOption(htmlBuilderOption);
    builders.push(htmlBuilder);
}
if (argv.watch) {
    builders.forEach((builder) => {
        builder.watch();
    });
}
else {
    builders.forEach((builder) => {
        builder.build();
    });
}
if (argv.server) {
    const browserSyncOption = getBrowserSyncOption();
    console.group(chalk.blue('browserSync Server Option'));
    console.log(browserSyncOption);
    console.groupEnd();
    run();
}
