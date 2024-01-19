#!/usr/bin/env node
import chalk from 'chalk';
import yargs from 'yargs';
import { a as configLoader, c as console } from './lib/config.mjs';
import { g as getBrowserSyncOption, r as run } from './lib/browser-sync.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'cosmiconfig';
import 'duplexer3';
import 'lodash';
import 'nunjucks';
import 'shell-quote';
import 'dotenv';
import 'node:console';
import 'browser-sync';

const argv = yargs(process.argv.slice(2))
    .options({
    baseDir: { type: 'string', description: 'ベースディレクトリを設定する' },
    p: { type: 'number', alias: 'port', description: 'プロキシを設定する' },
    w: {
        type: 'boolean',
        default: false,
        alias: 'watch',
        description: 'watchモードの指定',
    },
    proxy: { type: 'string', description: 'プロキシを設定する' },
    open: { type: 'boolean', description: 'UIオプションを設定する' },
    browser: { type: 'string', description: 'ブラウザオプションを設定する' },
    notify: { type: 'boolean', description: '更新通知オプションを設定する' },
    c: {
        type: 'string',
        alias: 'config',
        description: '設定ファイルを指定する',
    },
})
    .parseSync();
if (argv.config !== undefined) {
    //@ts-ignore
    configLoader.configFile = argv.config;
}
/**
 * コマンドライン引数でオプションを上書きする
 */
const orverrideOption = {};
if (argv.baseDir !== undefined) {
    //@ts-ignore
    orverrideOption.baseDir = argv.baseDir;
}
if (argv.port !== undefined) {
    //@ts-ignore
    orverrideOption.port = argv.port;
}
if (argv.watch !== undefined) {
    //@ts-ignore
    orverrideOption.watch = argv.watch;
}
if (argv.proxy !== undefined) {
    //@ts-ignore
    orverrideOption.proxy = argv.proxy;
}
if (argv.open !== undefined) {
    //@ts-ignore
    orverrideOption.open = argv.open;
}
if (argv.browser !== undefined) {
    //@ts-ignore
    orverrideOption.browser = argv.browser;
}
if (argv.notify !== undefined) {
    //@ts-ignore
    orverrideOption.notify = argv.notify;
}
const browserSyncOption = getBrowserSyncOption(orverrideOption);
console.group(chalk.blue('browserSync Server Option'));
console.log(browserSyncOption);
console.groupEnd();
run(orverrideOption);
