#!/usr/bin/env node
import { g as getBrowserSyncOption, r as run } from './common/browser-sync.mjs';
import chalk from 'chalk';
import yargs from 'yargs';
import { a as console } from './common/config.mjs';
import * as dotenv from 'dotenv';
import 'browser-sync';
import 'lodash';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'cosmiconfig';
import 'node:console';

dotenv.config();
const argv = yargs(process.argv.slice(2))
    .options({
    w: { type: 'boolean', default: true, alias: 'watch', description: 'watchモード' },
    p: { type: 'number', default: 3000, alias: 'port', description: 'ポート番号' },
    open: { type: 'boolean', default: true, description: '起動時にブラウザを開く' },
    notify: { type: 'boolean', default: false, description: '更新通知の表示する' },
    'base-dir': { type: 'string', default: 'public', description: 'ベースディレクトリ' },
    'watch-files': { type: 'array', description: '監視対象ファイル' },
    ui: { type: 'boolean', default: false, description: 'UI機能を利用する' },
    'ui-port': { type: 'boolean', default: false, alias: 'p', description: 'UI機能のポート番号' },
})
    .parseSync();
const serverOption = getBrowserSyncOption();
/**
 * コマンドライン引数によるオプションの上書き
 */
if (argv.baseDir !== undefined) {
    // @ts-ignore
    serverOption.server.baseDir = argv.baseDir;
}
if (argv.port !== undefined) {
    //@ts-ignore
    serverOption.port = argv.port;
}
if (argv.notify !== undefined) {
    serverOption.notify = argv.notify;
}
if (argv.ui !== undefined && !serverOption.ui) {
    serverOption.ui = argv.ui;
}
if (serverOption.ui && argv.uiPort !== undefined) {
    serverOption.ui = {
        //@ts-ignore
        port: argv.uiPort,
    };
}
if (argv.open !== undefined) {
    serverOption.open = argv.open;
}
if (argv.watch !== undefined) {
    //@ts-ignore
    serverOption.watch = argv.watch;
}
if (argv.watchFiles !== undefined) {
    //@ts-ignore
    serverOption.files = argv.watchFiles;
}
console.group(chalk.blue('browserSync Server Option'));
console.log(serverOption);
console.groupEnd();
run(serverOption);
