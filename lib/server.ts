import browserSync from 'browser-sync';
import configLoader from './builder/config';
import _, { get } from 'lodash';
import chalk from 'chalk';
import yargs from 'yargs';
import * as dotenv from 'dotenv';
import './console';

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
let htmlOutputDir = 'public';
if (!configLoader.isDisable('html')) {
  const htmlOption = configLoader.getHtmlOption();
  if (_.has(htmlOption, 'outputDir') && _.get(htmlOption, 'outputDir')) {
    //@ts-ignore
    htmlOutputDir = _.get(htmlOption, 'outputDir');
  }
}
let browserSyncUIOption: boolean | browserSync.UIOptions = false;
if (_.has(serverOption, 'ui') && _.get(serverOption, 'ui')) {
  browserSyncUIOption = true;
  if (_.has(serverOption, 'uiPort') && _.get(serverOption, 'uiPort')) {
    browserSyncUIOption = {
      port: _.get(serverOption, 'uiPort'),
    };
  }
}
/**
 * browserSyncのオプション
 */
const browserSyncOption: browserSync.Options = {
  server: {
    baseDir: _.has(serverOption, 'baseDir') ? _.get(serverOption, 'baseDir') : htmlOutputDir,
  },
  port: _.has(serverOption, 'port') ? _.get(serverOption, 'port') : 3000,
  watch: _.has(serverOption, 'watch') ? _.get(serverOption, 'watch') : true,
  //@ts-ignore
  files: _.has(serverOption, 'watchFiles') ? _.get(serverOption, 'watchFiles') : false,
  open: _.has(serverOption, 'open') ? _.get(serverOption, 'open') : true,
  ui: browserSyncUIOption,
  notify: _.has(serverOption, 'notify') ? _.get(serverOption, 'notify') : false,
};
console.group(chalk.blue('Server Option'));
console.log(serverOption);
console.groupEnd();

browserSync(browserSyncOption);
