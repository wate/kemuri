#!/usr/bin/env node
'use strict';

var browserSync = require('browser-sync');
var config = require('./common/config.cjs');
var _ = require('lodash');
var chalk = require('chalk');
var yargs = require('yargs');
var dotenv = require('dotenv');
require('./common/console.cjs');
require('cosmiconfig');
require('node:console');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var dotenv__namespace = /*#__PURE__*/_interopNamespaceDefault(dotenv);

dotenv__namespace.config();
const argv = yargs(process.argv.slice(2))
    .options({
    w: { type: 'boolean', default: true, alias: 'watch', description: 'watchモードの指定' },
    p: { type: 'number', default: 3000, alias: 'port', description: 'ポート番号' },
    open: { type: 'boolean', default: true, description: '起動時にブラウザを開く' },
    notify: { type: 'boolean', default: false, description: '更新通知の表示' },
    'base-dir': { type: 'string', default: 'public', description: 'ベースディレクトリ' },
    'watch-files': { type: 'array', description: '監視対象ファイル' },
    ui: { type: 'boolean', default: false, description: 'UI機能を利用' },
    'ui-port': { type: 'boolean', default: false, alias: 'p', description: 'UI機能のポート番号' },
})
    .parseSync();
const serverOption = config.configLoader.getServerOption();
/**
 * browserSyncのベースディレクトリ
 */
let browserSyncBaseDir = 'public';
if (argv.baseDir !== undefined) {
    browserSyncBaseDir = argv.baseDir;
}
else {
    if (!config.configLoader.isEnable('html')) {
        const htmlOption = config.configLoader.getHtmlOption();
        if (_.has(htmlOption, 'outputDir')) {
            //@ts-ignore
            browserSyncBaseDir = _.get(htmlOption, 'outputDir');
        }
    }
}
/**
 * browserSyncのUIオプション
 */
let browserSyncPort = 3000;
if (argv.port !== undefined) {
    //@ts-ignore
    browserSyncPort = argv.port;
}
else if (_.has(serverOption, 'port')) {
    //@ts-ignore
    browserSyncPort = _.get(serverOption, 'port');
}
/**
 * browserSyncのwatchオプション
 */
let browserSyncWatch = true;
if (argv.watch !== undefined) {
    //@ts-ignore
    browserSyncWatch = argv.watch;
}
else if (_.has(serverOption, 'watch')) {
    //@ts-ignore
    browserSyncWatch = _.get(serverOption, 'watch');
}
/**
 * browserSyncの監視対象ファイルのオプション
 */
let browserSyncWatchFiles = false;
if (browserSyncWatch) {
    if (argv.watchFiles !== undefined) {
        //@ts-ignore
        browserSyncWatchFiles = argv.watchFiles;
    }
    else if (_.has(serverOption, 'watchFiles')) {
        //@ts-ignore
        browserSyncWatchFiles = _.get(serverOption, 'watchFiles');
    }
}
/**
 * browserSyncのブラウザopenのオプション
 */
let browserSyncOpen = true;
if (argv.open !== undefined) {
    browserSyncOpen = argv.open;
}
else if (_.has(serverOption, 'open')) {
    //@ts-ignore
    browserSyncOpen = _.get(serverOption, 'open');
}
/**
 * browserSyncのUIオプション
 */
let browserSyncUIOption = false;
if (argv.ui !== undefined) {
    browserSyncUIOption = argv.ui;
}
else if (_.has(serverOption, 'ui') && _.get(serverOption, 'ui')) {
    browserSyncUIOption = true;
}
/**
 * browserSyncのUIポート番号
 */
if (browserSyncUIOption) {
    if (argv.uiPort !== undefined) {
        browserSyncUIOption = {
            //@ts-ignore
            port: argv.uiPort,
        };
    }
    else if (_.has(serverOption, 'uiPort')) {
        browserSyncUIOption = {
            port: _.get(serverOption, 'uiPort'),
        };
    }
}
/**
 * browserSyncの通知オプション
 */
let browserSyncNotify = false;
if (argv.notify !== undefined) {
    browserSyncNotify = argv.notify;
}
else if (_.has(serverOption, 'notify')) {
    //@ts-ignore
    browserSyncNotify = _.get(serverOption, 'notify');
}
const browserSyncOption = {
    server: {
        baseDir: browserSyncBaseDir,
    },
    port: browserSyncPort,
    watch: browserSyncWatch,
    //@ts-ignore
    files: browserSyncWatchFiles,
    open: browserSyncOpen,
    ui: browserSyncUIOption,
    notify: browserSyncNotify,
};
console.group(chalk.blue('browserSync Server Option'));
console.log(browserSyncOption);
console.groupEnd();
browserSync(browserSyncOption);
