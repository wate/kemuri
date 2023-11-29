#!/usr/bin/env node

import htmlBuilder from './builder/html';
import configLoader from './config';
import chalk from 'chalk';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2))
  .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモードの指定' },
    c: { type: 'string', alias: 'config', description: '設定ファイルを指定する' },
  })
  .parseSync();

if (argv.config !== undefined) {
  //@ts-ignore
  configLoader.configFile = argv.config;
}

const builderOption = configLoader.getHtmlOption();
console.group(chalk.blue('Builder Option'));
console.log(builderOption);
console.groupEnd();
htmlBuilder.setOption(builderOption);

if (argv.watch) {
  htmlBuilder.watch();
} else {
  htmlBuilder.build();
}
