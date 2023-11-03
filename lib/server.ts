#!/usr/bin/env node

import browserSync from 'browser-sync';
import configLoader from './builder/config';
import _, { get } from 'lodash';
import chalk from 'chalk';
import yargs from 'yargs';
import * as dotenv from 'dotenv';
import './console';
dotenv.config();

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

interface serverOption {
  baseDir?: string;
  port?: number;
  watch?: boolean;
  watchFiles?: string | string[];
  notify?: boolean;
  open?: boolean;
  ui?: boolean;
  uiPort?: number;
}

const serverOption = configLoader.getServerOption();
/**
 * browserSyncのベースディレクトリ
 */
let browserSyncBaseDir: string = 'public';
if (argv.baseDir !== undefined) {
  browserSyncBaseDir = argv.baseDir;
} else {
  if (!configLoader.isEnable('html')) {
    const htmlOption = configLoader.getHtmlOption();
    if (_.has(htmlOption, 'outputDir')) {
      //@ts-ignore
      browserSyncBaseDir = _.get(htmlOption, 'outputDir');
    }
  }
}
/**
 * browserSyncのUIオプション
 */
let browserSyncPort: number = 3000;
if (argv.port !== undefined) {
  //@ts-ignore
  browserSyncPort = argv.port;
} else if (_.has(serverOption, 'port')) {
  //@ts-ignore
  browserSyncPort = _.get(serverOption, 'port');
}
/**
 * browserSyncのwatchオプション
 */
let browserSyncWatch: boolean = true;
if (argv.watch !== undefined) {
  //@ts-ignore
  browserSyncWatch = argv.watch;
} else if (_.has(serverOption, 'watch')) {
  //@ts-ignore
  browserSyncWatch = _.get(serverOption, 'watch');
}
/**
 * browserSyncの監視対象ファイルのオプション
 */
let browserSyncWatchFiles: string | string[] | boolean = false;
if (browserSyncWatch) {
  if (argv.watchFiles !== undefined) {
    //@ts-ignore
    browserSyncWatchFiles = argv.watchFiles;
  } else if (_.has(serverOption, 'watchFiles')) {
    //@ts-ignore
    browserSyncWatchFiles = _.get(serverOption, 'watchFiles');
  }
}

/**
 * browserSyncのブラウザopenのオプション
 */
let browserSyncOpen: boolean = true;
if (argv.open !== undefined) {
  browserSyncOpen = argv.open;
} else if (_.has(serverOption, 'open')) {
  //@ts-ignore
  browserSyncOpen = _.get(serverOption, 'open');
}

/**
 * browserSyncのUIオプション
 */

let browserSyncUIOption: boolean | browserSync.UIOptions = false;
if (argv.ui !== undefined) {
  browserSyncUIOption = argv.ui;
} else if (_.has(serverOption, 'ui') && _.get(serverOption, 'ui')) {
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
  } else if (_.has(serverOption, 'uiPort')) {
    browserSyncUIOption = {
      port: _.get(serverOption, 'uiPort'),
    };
  }
}

/**
 * browserSyncの通知オプション
 */
let browserSyncNotify: boolean = false;
if (argv.notify !== undefined) {
  browserSyncNotify = argv.notify;
} else if (_.has(serverOption, 'notify')) {
  //@ts-ignore
  browserSyncNotify = _.get(serverOption, 'notify');
}

const browserSyncOption: browserSync.Options = {
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
